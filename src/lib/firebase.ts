'use client';

import { getApp, getApps, initializeApp, type FirebaseApp } from 'firebase/app';
import {
  browserLocalPersistence,
  getAuth,
  setPersistence,
  type Auth,
} from 'firebase/auth';

/**
 * Firebase, used for exactly one thing: identity.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * What this file deliberately does not do
 *
 * There is no `getFirestore` here, and there should never be one. Application
 * data — journals, the board, articles, counselling — lives in MongoDB behind
 * the API, and it got there specifically so that authorization is decided by a
 * server rather than by rules a client evaluates. Reaching into Firestore from
 * the website would recreate the architecture the app just left, in a second
 * place, and the two would disagree about what a member is allowed to read.
 *
 * The division is the same one the Flutter app documents in `api_service.dart`:
 *
 *   • Firebase Auth  — who the user is.
 *   • This API       — everything else.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * On the config being public
 *
 * These values ship in the JavaScript bundle and are readable by anyone. That
 * is fine and it is how Firebase is designed: the config identifies the
 * project, it does not authorise anything. What protects the data is that every
 * API request carries a signed ID token which the server verifies with the
 * Admin SDK. Nothing here is a secret, and nothing that is a secret goes here.
 */

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

/** Whether the project has been configured at all. */
export const firebaseConfigured = Boolean(
  firebaseConfig.apiKey && firebaseConfig.projectId
);

let app: FirebaseApp | null = null;
let auth: Auth | null = null;

/**
 * The Auth instance, created on first use.
 *
 * Lazy rather than initialised at module load, because this module is imported
 * by the auth context which is mounted on every page — including the marketing
 * pages, where nobody is signed in and the Firebase SDK has no work to do.
 * Initialising eagerly would run it during the render of a page whose entire
 * job is to be fast.
 *
 * Returns null when the project is not configured, so a fresh clone with no
 * `.env.local` renders the marketing site perfectly and only the sign-in screen
 * says anything is missing. A missing key should not be a white page.
 */
export function firebaseAuth(): Auth | null {
  if (!firebaseConfigured) return null;
  if (auth) return auth;

  app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  auth = getAuth(app);

  // Survive a refresh and a closed tab. The default is already local, but it is
  // stated here because the alternative — a session that evaporates when the
  // tab closes — would mean signing in again every morning, and this is an app
  // people are meant to open every day.
  setPersistence(auth, browserLocalPersistence).catch(() => {
    // A browser in private mode with storage blocked. The session lasts as long
    // as the tab, which is a degraded experience rather than a broken one.
  });

  return auth;
}
