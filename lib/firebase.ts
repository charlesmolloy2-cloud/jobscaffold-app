import { getApp, getApps, initializeApp } from "firebase/app";
import { connectAuthEmulator, getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { connectFunctionsEmulator, getFunctions, httpsCallable } from "firebase/functions";
import { firebaseConfig } from "../secrets";

export interface ContractorRegistration {
  firstName: string;
  lastName: string;
  companyName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

function services() {
  const useEmulators = process.env.NODE_ENV !== "production"
    || process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATORS === "true";
  if (!getApps().length) {
    const app = initializeApp({
      ...firebaseConfig,
      ...(useEmulators ? { projectId: "demo-jobscaffold" } : {}),
    });
    const auth = getAuth(app);
    const functions = getFunctions(app);
    if (useEmulators) {
      const host = process.env.NEXT_PUBLIC_FIREBASE_EMULATOR_HOST || "127.0.0.1";
      connectAuthEmulator(auth, `http://${host}:9099`, { disableWarnings: true });
      connectFunctionsEmulator(functions, host, 5001);
    }
    return { auth, functions };
  }
  const app = getApp();
  return { auth: getAuth(app), functions: getFunctions(app) };
}

export async function registerContractor(details: ContractorRegistration): Promise<void> {
  const { auth, functions } = services();
  const register = httpsCallable<ContractorRegistration, { uid: string }>(functions, "registerContractor");
  await register(details);
  await signInWithEmailAndPassword(auth, details.email, details.password);
}
