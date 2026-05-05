// lib/auth.ts
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  sendEmailVerification,
  User,
  AuthError,
} from "firebase/auth";
import { auth } from "./firebase";
import { createUserProfile } from "./firestore";

export async function registerUser(
  email: string,
  password: string
): Promise<User> {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    // Send email verification
    await sendEmailVerification(result.user);
    // Create initial user doc
    await createUserProfile(result.user.uid, {
      uid: result.user.uid,
      email,
      setupComplete: false,
    });
    return result.user;
  } catch (error) {
    throw formatAuthError(error as AuthError);
  }
}

export async function loginUser(
  email: string,
  password: string
): Promise<User> {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return result.user;
  } catch (error) {
    throw formatAuthError(error as AuthError);
  }
}

export async function signOut(): Promise<void> {
  await firebaseSignOut(auth);
}

export function onAuthChange(
  callback: (user: User | null) => void
): () => void {
  return onAuthStateChanged(auth, callback);
}

function formatAuthError(error: AuthError): Error {
  const messages: Record<string, string> = {
    "auth/email-already-in-use": "An account with this email already exists.",
    "auth/invalid-email": "Please enter a valid email address.",
    "auth/weak-password": "Password must be at least 6 characters.",
    "auth/user-not-found": "No account found with this email.",
    "auth/wrong-password": "Incorrect password. Please try again.",
    "auth/too-many-requests": "Too many attempts. Please wait before trying again.",
    "auth/invalid-credential": "Invalid email or password.",
  };
  return new Error(messages[error.code] || "Authentication failed. Please try again.");
}
