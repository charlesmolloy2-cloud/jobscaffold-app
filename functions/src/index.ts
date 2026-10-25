import { initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { FieldValue, getFirestore } from "firebase-admin/firestore";
import { HttpsError, onCall } from "firebase-functions/v2/https";

initializeApp();

interface Registration {
  firstName: string;
  lastName: string;
  companyName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export const registerContractor = onCall(async (request) => {
  const data = request.data as Registration | undefined;
  const required = ["firstName", "lastName", "companyName", "email", "password", "confirmPassword"] as const;
  if (!data || required.some((field) => typeof data[field] !== "string" || !data[field])) {
    throw new HttpsError("invalid-argument", "All registration fields are required.");
  }
  if (data.password !== data.confirmPassword) {
    throw new HttpsError("invalid-argument", "Passwords must match.");
  }

  const auth = getAuth();
  const user = await auth.createUser({ email: data.email, password: data.password });
  try {
    await getFirestore().collection("users").doc(user.uid).create({
      firstName: data.firstName,
      lastName: data.lastName,
      companyName: data.companyName,
      email: data.email,
      contractor: true,
      createdAt: FieldValue.serverTimestamp(),
    });
  } catch (error) {
    await auth.deleteUser(user.uid);
    throw error;
  }
  return { uid: user.uid };
});
