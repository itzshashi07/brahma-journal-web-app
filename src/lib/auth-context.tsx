'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  onIdTokenChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut as fbSignOut,
  updateProfile as fbUpdateProfile,
  type User,
} from 'firebase/auth';

import { api, warmUp } from './api';
import { firebaseAuth, firebaseConfigured } from './firebase';

/**
 * Who is signed in, and what the app knows about them.
 *
 * Mirrors `AuthProvider` in the Flutter app, including the part that matters
 * most: **`isAdmin` comes from the `admin` custom claim inside the signed ID
 * token, never from an email comparison in the client.** The claim is minted by
 * Firebase and cannot be forged, and the same claim is what the API checks
 * server-side. This flag only decides which controls are drawn — it never
 * grants access to anything, and a browser with the flag flipped in devtools
 * gets a 403 from the server for its trouble.
 */

export type Profile = {
  _id?: string;
  firebaseUid: string;
  name?: string | null;
  email?: string | null;
  age?: number | null;
  gender?: string | null;
  phone?: string | null;
  avatarId?: string | null;
  /**
   * The member's craft, as an id from `content/professions.ts`.
   *
   * Free text on this website until now, which meant somebody who typed
   * "singer" here got none of the singer checklist — the app matches on the id,
   * and "singer" typed by hand is not `singer` chosen from the list often enough
   * to rely on. The profile screen now writes an id.
   */
  profession?: string | null;
  aim?: string | null;
  streak?: number;
  longestStreak?: number;
  totalJournalEntries?: number;
  totalMeditationSeconds?: number;
  craftWeeklyTarget?: number;
  /** The member's own checklist items, on top of their craft's presets. */
  customHabits?: { id: string; label: string }[];
  recoveredDays?: string[];
  joinedAt?: string;
  createdAt?: string;
};

type AuthState = {
  /** True until the first auth state has arrived. Not "signed out". */
  loading: boolean;
  user: User | null;
  profile: Profile | null;
  isAdmin: boolean;
  /** False when the deployment has no Firebase keys — see `firebase.ts`. */
  configured: boolean;

  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;

  /**
   * True exactly once, for the render that follows a sign-in.
   *
   * The greeting marks an *event* — somebody arriving — and not a day, so it is
   * consumed rather than stored against a date. Reaching the dashboard any other
   * way (returning from the journal, a reload on a live session) leaves it
   * silent, which is the difference between a greeting and a nag.
   *
   * `sessionStorage` rather than component state, because the sign-in happens on
   * `/login` and the greeting is shown on `/app/dashboard` — a full navigation
   * in between, which throws away anything held in React. Session-scoped so a
   * new tab on the same account does not greet again.
   */
  consumeJustSignedIn: () => 'new' | 'returning' | null;
};

const SIGNED_IN_KEY = 'innenflow_just_signed_in';

function markSignedIn(kind: 'new' | 'returning') {
  try {
    window.sessionStorage.setItem(SIGNED_IN_KEY, kind);
  } catch {
    // Private mode with storage disabled. The member simply is not greeted,
    // which is a far better failure than a sign-in that throws.
  }
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  /**
   * Loads the member's application profile.
   *
   * `GET /api/profile/me` upserts, so a member who signed up before this
   * website existed — or through a path that never wrote a profile — gets one
   * on their first visit instead of a 404 this has to special-case. It is also
   * the request that raises the "somebody new is here" alert to the operator,
   * server-side, on the call that creates the row.
   */
  const loadProfile = useCallback(async () => {
    try {
      const body = await api.get<{ profile: Profile }>('/api/profile/me');
      setProfile(body?.profile ?? null);
    } catch {
      // Keep whatever was already loaded. A profile that fails to refresh is a
      // stale display name; a profile blanked on a dropped request is a screen
      // telling the member they have no account.
    }
  }, []);

  useEffect(() => {
    const auth = firebaseAuth();
    if (!auth) {
      setLoading(false);
      return;
    }

    // Woken here rather than on the first data request, so the cold start
    // overlaps with the member reading the page instead of blocking it.
    void warmUp();

    const unsubscribe = onAuthStateChanged(auth, async (next) => {
      setUser(next);

      if (!next) {
        setProfile(null);
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      try {
        // Forced, so a claim minted since the last sign-in is picked up without
        // making the member sign out and back in.
        const token = await next.getIdTokenResult(true);
        setIsAdmin(token.claims?.admin === true);
      } catch {
        // Fail closed: if the claim cannot be read, assume no privilege.
        setIsAdmin(false);
      }

      await loadProfile();
      setLoading(false);
    });

    return unsubscribe;
  }, [loadProfile]);

  /**
   * Keep `isAdmin` current when the token itself is refreshed.
   *
   * `onAuthStateChanged` fires on sign-in and sign-out; a token refreshed after
   * an hour is an `onIdTokenChanged` event. Without this, a claim granted while
   * a tab was open would not appear until the tab was reloaded.
   */
  useEffect(() => {
    const auth = firebaseAuth();
    if (!auth) return;

    return onIdTokenChanged(auth, async (next) => {
      if (!next) return;
      try {
        const token = await next.getIdTokenResult();
        setIsAdmin(token.claims?.admin === true);
      } catch {
        setIsAdmin(false);
      }
    });
  }, []);

  const requireAuth = () => {
    const auth = firebaseAuth();
    if (!auth) {
      throw new Error(
        'Sign-in is not configured on this deployment. See .env.example.'
      );
    }
    return auth;
  };

  const value = useMemo<AuthState>(
    () => ({
      loading,
      user,
      profile,
      isAdmin,
      configured: firebaseConfigured,

      signIn: async (email, password) => {
        await signInWithEmailAndPassword(requireAuth(), email.trim(), password);
        markSignedIn('returning');
      },

      signUp: async (name, email, password) => {
        const credential = await createUserWithEmailAndPassword(
          requireAuth(),
          email.trim(),
          password
        );
        markSignedIn('new');
        const trimmed = name.trim();
        if (trimmed) {
          await fbUpdateProfile(credential.user, { displayName: trimmed });
          // Mirrored into the application profile as well: the display name on
          // the leaderboard is the API's, and Firebase Auth has nowhere to put
          // the rest of what a profile holds.
          await api.patch('/api/profile/me', { name: trimmed }).catch(() => {});
        }
      },

      signInWithGoogle: async () => {
        const provider = new GoogleAuthProvider();
        // Always ask which account. Silent reuse of whichever Google session
        // the browser happens to hold is how somebody signs in as the wrong
        // person on a shared laptop and writes into a stranger's journal.
        provider.setCustomParameters({ prompt: 'select_account' });
        const credential = await signInWithPopup(requireAuth(), provider);

        /**
         * "New" means the account was created in the last few minutes — i.e.
         * this sign-in is the one that created it. Google gives no separate
         * signal for a first sign-in, and the profile document has often not come
         * back yet at this point, so the auth metadata is the only thing that is
         * reliably there the instant the credential is.
         */
        const created = credential.user.metadata?.creationTime;
        const isNew =
          Boolean(created) && Date.now() - new Date(created!).getTime() < 600_000;
        markSignedIn(isNew ? 'new' : 'returning');
      },

      resetPassword: async (email) => {
        await sendPasswordResetEmail(requireAuth(), email.trim());
      },

      signOut: async () => {
        const auth = firebaseAuth();
        if (auth) await fbSignOut(auth);
        setProfile(null);
        setIsAdmin(false);
        // Otherwise signing out and back in as somebody else greets the second
        // person with the first one's pending flag.
        try {
          window.sessionStorage.removeItem(SIGNED_IN_KEY);
        } catch {
          // Nothing to clean up if storage was never writable.
        }
      },

      refreshProfile: loadProfile,

      consumeJustSignedIn: () => {
        try {
          const value = window.sessionStorage.getItem(SIGNED_IN_KEY);
          if (!value) return null;
          window.sessionStorage.removeItem(SIGNED_IN_KEY);
          return value === 'new' ? 'new' : 'returning';
        } catch {
          return null;
        }
      },
    }),
    [loading, user, profile, isAdmin, loadProfile]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside <AuthProvider>.');
  }
  return context;
}
