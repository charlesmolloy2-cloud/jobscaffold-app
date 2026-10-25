/** @jest-environment node */
import { registerContractor } from "../functions/src/index";

const createUser = jest.fn();
const deleteUser = jest.fn();
const writeUser = jest.fn();
const doc = jest.fn(() => ({ create: writeUser }));
const collection = jest.fn(() => ({ doc }));

jest.mock("firebase-admin/app", () => ({ initializeApp: jest.fn() }));
jest.mock("firebase-admin/auth", () => ({ getAuth: () => ({ createUser, deleteUser }) }));
jest.mock("firebase-admin/firestore", () => ({
  getFirestore: () => ({ collection }),
  FieldValue: { serverTimestamp: () => "server-timestamp" },
}));

const data = {
  firstName: "Jane", lastName: "Builder", companyName: "Builder Co",
  email: "jane@example.com", password: "password123", confirmPassword: "password123",
};
const invoke = (input: unknown = data) => registerContractor.run({ data: input } as Parameters<typeof registerContractor.run>[0]);

beforeEach(() => {
  jest.clearAllMocks();
  createUser.mockResolvedValue({ uid: "contractor-uid" });
  writeUser.mockResolvedValue(undefined);
  deleteUser.mockResolvedValue(undefined);
});

test("creates Auth first, then the documented contractor Firestore record", async () => {
  await expect(invoke()).resolves.toEqual({ uid: "contractor-uid" });
  expect(createUser).toHaveBeenCalledWith({ email: data.email, password: data.password });
  expect(collection).toHaveBeenCalledWith("users");
  expect(doc).toHaveBeenCalledWith("contractor-uid");
  expect(writeUser).toHaveBeenCalledWith({
    firstName: data.firstName, lastName: data.lastName, companyName: data.companyName,
    email: data.email, contractor: true, createdAt: "server-timestamp",
  });
  expect(createUser.mock.invocationCallOrder[0]).toBeLessThan(writeUser.mock.invocationCallOrder[0]);
  expect(deleteUser).not.toHaveBeenCalled();
});

test("does not write Firestore when Firebase Auth registration fails", async () => {
  createUser.mockRejectedValue(new Error("Auth rejected registration"));
  await expect(invoke()).rejects.toThrow();
  expect(writeUser).not.toHaveBeenCalled();
  expect(deleteUser).not.toHaveBeenCalled();
});

test("deletes the new Auth account when the Firestore write fails", async () => {
  writeUser.mockRejectedValue(new Error("Firestore unavailable"));
  await expect(invoke()).rejects.toThrow();
  expect(deleteUser).toHaveBeenCalledWith("contractor-uid");
});

test.each(Object.keys(data))("requires %s before creating an account", async (field) => {
  await expect(invoke({ ...data, [field]: "" })).rejects.toMatchObject({ code: "invalid-argument" });
  expect(createUser).not.toHaveBeenCalled();
});

test("requires matching passwords before creating an account", async () => {
  await expect(invoke({ ...data, confirmPassword: "different" })).rejects.toMatchObject({ code: "invalid-argument" });
  expect(createUser).not.toHaveBeenCalled();
});
