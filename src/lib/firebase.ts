/**
 * Rooh Network - Unified Firebase TypeScript Module
 * File: src/lib/firebase.ts
 */
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signOut as fbSignOut,
  onAuthStateChanged,
  Auth,
  User
} from 'firebase/auth';

export const firebaseConfig = {
  apiKey: (import.meta as any).env?.VITE_FIREBASE_API_KEY || "AIzaSy_YOUR_UNIFIED_FIREBASE_API_KEY",
  authDomain: (import.meta as any).env?.VITE_FIREBASE_AUTH_DOMAIN || "rooh-network.firebaseapp.com",
  projectId: (import.meta as any).env?.VITE_FIREBASE_PROJECT_ID || "rooh-network",
  storageBucket: (import.meta as any).env?.VITE_FIREBASE_STORAGE_BUCKET || "rooh-network.appspot.com",
  messagingSenderId: (import.meta as any).env?.VITE_FIREBASE_MESSAGING_SENDER_ID || "123456789012",
  appId: (import.meta as any).env?.VITE_FIREBASE_APP_ID || "1:123456789012:web:abcdef1234567890"
};

// Initialize Firebase App safely (singleton pattern)
export const app: FirebaseApp = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize Firebase Auth
export const auth: Auth = getAuth(app);

// Configure Google Auth Provider
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

/**
 * Detects if the current browser environment is an Android/iOS WebView
 */
export function isWebViewEnvironment(): boolean {
  if (typeof window === 'undefined' || !window.navigator) return false;
  const ua = window.navigator.userAgent || '';
  const isAndroid = /Android/i.test(ua);
  const isIOS = /iPhone|iPad|iPod/i.test(ua);
  const isWv = /wv/i.test(ua) || (isAndroid && /Version\/[\d.]+/i.test(ua)) || (isIOS && !/Safari/i.test(ua));
  return isWv;
}

/**
 * Google Sign-in with automatic Android WebView fallback (Popup -> Redirect)
 */
export async function loginWithGoogle(): Promise<User | null> {
  const isWv = isWebViewEnvironment();

  if (isWv) {
    try {
      await signInWithRedirect(auth, googleProvider);
      return null;
    } catch (e) {
      console.warn('Redirect sign-in error in WebView:', e);
    }
  }

  try {
    const credential = await signInWithPopup(auth, googleProvider);
    return credential.user;
  } catch (err: any) {
    console.warn('Popup sign in failed or blocked, attempting redirect:', err);
    if (
      err.code === 'auth/popup-blocked' ||
      err.code === 'auth/operation-not-supported-in-this-environment' ||
      err.code === 'auth/cancelled-popup-request'
    ) {
      await signInWithRedirect(auth, googleProvider);
      return null;
    }
    throw err;
  }
}

/**
 * Check for pending redirect sign-in result (called on app startup)
 */
export async function handleRedirectResult(): Promise<User | null> {
  try {
    const result = await getRedirectResult(auth);
    if (result && result.user) {
      return result.user;
    }
  } catch (err) {
    console.warn('Error handling redirect sign-in result:', err);
  }
  return null;
}

/**
 * Email & Password Sign-in
 */
export async function loginWithEmail(email: string, password: string): Promise<User> {
  const cred = await signInWithEmailAndPassword(auth, email.trim(), password);
  return cred.user;
}

/**
 * Email & Password Sign-up
 */
export async function signupWithEmail(email: string, password: string, displayName = ''): Promise<User> {
  const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
  if (displayName && cred.user) {
    await updateProfile(cred.user, { displayName: displayName.trim() });
  }
  return cred.user;
}

/**
 * Sign-out
 */
export async function logoutUser(): Promise<void> {
  await fbSignOut(auth);
}

export { onAuthStateChanged };
