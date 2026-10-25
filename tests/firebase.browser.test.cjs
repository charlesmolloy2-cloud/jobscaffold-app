// Run only through test:browser so all SDK operations use local emulators.
const { registerContractor } = require("../functions/lib/index.js");
const { getAuth } = require("firebase-admin/auth");
const { getFirestore, DocumentReference } = require("firebase-admin/firestore");
const { getApps, deleteApp } = require("firebase-admin/app");

beforeAll(() => {
  expect(process.env.FIREBASE_AUTH_EMULATOR_HOST).toBe("127.0.0.1:9099");
  expect(process.env.FIRESTORE_EMULATOR_HOST).toBe("127.0.0.1:8080");
  expect(process.env.GCLOUD_PROJECT).toBe("demo-jobscaffold");
});

afterAll(async () => {
  jest.restoreAllMocks();
  await Promise.all(getApps().map(deleteApp));
});

test("Firestore failure rolls back the account in the actual Auth emulator", async () => {
  const email = `rollback-${Date.now()}@example.com`;
  const write = jest.spyOn(DocumentReference.prototype, "create").mockRejectedValueOnce(new Error("Simulated Firestore outage"));
  try {
    await expect(registerContractor.run({ data: {
      firstName: "Jane", lastName: "Builder", companyName: "Builder Co", email,
      password: "password123", confirmPassword: "password123",
    } })).rejects.toThrow("Simulated Firestore outage");
    expect(write).toHaveBeenCalledTimes(1);
    await expect(getAuth().getUserByEmail(email)).rejects.toMatchObject({ code: "auth/user-not-found" });
    const profiles = await getFirestore().collection("users").where("email", "==", email).get();
    expect(profiles.empty).toBe(true);
  } finally {
    write.mockRestore();
  }
});
