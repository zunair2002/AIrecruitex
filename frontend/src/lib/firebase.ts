/**
 * Firebase web SDK, used only to obtain a Google ID token that the backend's
 * POST /api/auth/google exchanges for our own JWT. No Firebase state is kept:
 * the popup runs, we read the ID token, and we sign straight back out of
 * Firebase so the only session that exists is the backend's.
 *
 * Config comes from NEXT_PUBLIC_FIREBASE_* env vars. If they're absent the
 * whole feature stays switched off rather than crashing at import time — see
 * `isGoogleSignInConfigured`.
 */
import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import {
  GoogleAuthProvider,
  getAuth,
  signInWithPopup,
  signOut,
} from "firebase/auth";

const config = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

/** True only when the config needed for a Google popup is present. */
export function isGoogleSignInConfigured(): boolean {
  return Boolean(config.apiKey && config.authDomain && config.projectId);
}

function getFirebaseApp(): FirebaseApp {
  if (!isGoogleSignInConfigured()) {
    throw new Error(
      "Google sign-in is not configured. Set NEXT_PUBLIC_FIREBASE_API_KEY, " +
        "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN and NEXT_PUBLIC_FIREBASE_PROJECT_ID.",
    );
  }
  return getApps()[0] ?? initializeApp(config as Required<typeof config>);
}

/**
 * Opens the Google popup and returns the Firebase ID token to hand to the
 * backend. Throws a human-readable message for the cases users actually hit.
 */
export async function getGoogleIdToken(): Promise<string> {
  const auth = getAuth(getFirebaseApp());
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });

  try {
    const credential = await signInWithPopup(auth, provider);
    const idToken = await credential.user.getIdToken();
    // The backend issues its own JWT, so nothing is gained by staying signed
    // in to Firebase on the client.
    await signOut(auth).catch(() => undefined);
    return idToken;
  } catch (error) {
    const code = (error as { code?: string })?.code ?? "";
    if (code === "auth/popup-closed-by-user" || code === "auth/cancelled-popup-request") {
      throw new Error("Google sign-in was cancelled.");
    }
    if (code === "auth/popup-blocked") {
      throw new Error("Your browser blocked the sign-in popup. Allow popups and try again.");
    }
    if (code === "auth/unauthorized-domain") {
      throw new Error(
        "This domain isn't authorised in Firebase. Add it under Authentication → Settings → Authorized domains.",
      );
    }
    throw error instanceof Error ? error : new Error("Google sign-in failed.");
  }
}
