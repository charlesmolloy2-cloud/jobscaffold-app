/** @jest-environment node */
import { registerContractor } from "../lib/firebase";
import { httpsCallable } from "firebase/functions";
import { signInWithEmailAndPassword } from "firebase/auth";

const callRegistration = jest.fn();
jest.mock("firebase/app", () => ({ getApps: () => [], initializeApp: jest.fn(() => ({})) }));
jest.mock("firebase/auth", () => ({
  getAuth: () => ({}), connectAuthEmulator: jest.fn(),
  signInWithEmailAndPassword: jest.fn(),
}));
jest.mock("firebase/functions", () => ({
  getFunctions: () => ({}), connectFunctionsEmulator: jest.fn(),
  httpsCallable: jest.fn(() => callRegistration),
}));

const details = {
  firstName: "Jane", lastName: "Builder", companyName: "Builder Co",
  email: "jane@example.com", password: "password123", confirmPassword: "password123",
};

beforeEach(() => {
  jest.clearAllMocks();
  callRegistration.mockResolvedValue({ data: { uid: "contractor-uid" } });
  jest.mocked(signInWithEmailAndPassword).mockResolvedValue({} as Awaited<ReturnType<typeof signInWithEmailAndPassword>>);
});

test("calls the single registration function, then signs in with Firebase Auth", async () => {
  await registerContractor(details);
  expect(httpsCallable).toHaveBeenCalledWith(expect.anything(), "registerContractor");
  expect(callRegistration).toHaveBeenCalledWith(details);
  expect(signInWithEmailAndPassword).toHaveBeenCalledWith(expect.anything(), details.email, details.password);
  expect(callRegistration.mock.invocationCallOrder[0]).toBeLessThan(jest.mocked(signInWithEmailAndPassword).mock.invocationCallOrder[0]);
});

test("does not sign in when registration fails", async () => {
  callRegistration.mockRejectedValueOnce(new Error("Registration failed"));
  await expect(registerContractor(details)).rejects.toThrow();
  expect(signInWithEmailAndPassword).not.toHaveBeenCalled();
});
