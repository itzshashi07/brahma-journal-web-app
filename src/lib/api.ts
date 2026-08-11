'use client';

import { firebaseAuth } from './firebase';
import { site } from './site';

/**
 * The client for the InnenFlow API.
 *
 * A deliberate port of `lib/services/api_service.dart` in the Flutter app —
 * same base URL, same Authorization header, same cold-start budget, same
 * retry-once-on-expiry. Two front ends against one backend only stays honest if
 * they agree about what a request looks like, and the cheapest way to keep them
 * agreeing is for the second one to be a translation of the first rather than a
 * fresh design.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * Why this is a client module and not a server one
 *
 * Every request is authorised by a Firebase ID token that lives in the
 * browser's IndexedDB. Fetching from a React Server Component would mean either
 * shipping the token to the server on every navigation, or holding a session
 * cookie this app does not have. The application half of the site is therefore
 * client-rendered and reads the API directly — which is also correct for what
 * it is: a private dashboard has nothing to gain from being server-rendered and
 * nothing to gain from being indexed.
 *
 * The marketing half is the opposite, and is entirely static. See the note in
 * `src/app/layout.tsx`.
 */

export class ApiError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }

  /** The request never reached the server — offline, DNS, a dead tunnel. */
  get isOffline() {
    return this.status === 0;
  }
  get isUnauthorized() {
    return this.status === 401;
  }
  get isForbidden() {
    return this.status === 403;
  }
  get isNotFound() {
    return this.status === 404;
  }
}

/**
 * How long to wait before giving up.
 *
 * Two values, because the first request of a session is not like the rest. The
 * API is on Render's free tier, which suspends the process after a spell of
 * inactivity and cold-starts it on the next request — that takes the best part
 * of a minute, during which the socket is open and simply quiet. A flat 20s
 * budget turns every first visit of the morning into "could not reach the
 * server", which is a false accusation: the server is fine, it is getting
 * dressed.
 */
const TIMEOUT_MS = 20_000;
const COLD_START_TIMEOUT_MS = 75_000;

let warm = false;

function budget(): number {
  return warm ? TIMEOUT_MS : COLD_START_TIMEOUT_MS;
}

/**
 * The caller's Firebase ID token.
 *
 * Not cached here. The SDK caches it internally and refreshes it when it is
 * within five minutes of expiry, so asking every time is cheap and gets the
 * refresh for free. Caching it in this module would reintroduce the
 * expired-token bug the SDK already solves.
 */
async function idToken(forceRefresh = false): Promise<string | null> {
  const auth = firebaseAuth();
  const user = auth?.currentUser;
  if (!user) return null;
  try {
    return await user.getIdToken(forceRefresh);
  } catch {
    return null;
  }
}

/**
 * Wakes the server, without waiting for it.
 *
 * Called once when the application shell mounts. On a suspended free-tier
 * instance the cold start runs while the member is still looking at the
 * dashboard skeleton, so the screen that actually needs data finds the process
 * already up. It cannot fail in a way that matters — if it does not land, the
 * next real call simply pays the cold-start budget itself.
 */
export async function warmUp(): Promise<void> {
  try {
    await fetch(`${site.apiBaseUrl}/health`, {
      signal: AbortSignal.timeout(COLD_START_TIMEOUT_MS),
    });
    warm = true;
  } catch {
    // Nothing to do. The next request pays for it.
  }
}

type Query = Record<string, string | number | boolean | undefined | null>;

function buildUrl(path: string, query?: Query): string {
  const url = new URL(`${site.apiBaseUrl}${path}`);
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.set(key, String(value));
      }
    }
  }
  return url.toString();
}

async function send<T>(
  path: string,
  init: RequestInit,
  query?: Query
): Promise<T> {
  const url = buildUrl(path, query);

  const attempt = async (token: string | null): Promise<Response> =>
    fetch(url, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(init.headers ?? {}),
      },
      signal: AbortSignal.timeout(budget()),
      // The API is a different origin and authorises by header, not by cookie.
      credentials: 'omit',
    });

  let response: Response;
  try {
    response = await attempt(await idToken());
  } catch (err) {
    const timedOut = err instanceof DOMException && err.name === 'TimeoutError';
    throw new ApiError(
      0,
      timedOut
        ? warm
          ? 'The server took too long to respond.'
          : 'The server is waking up. Please try again in a moment.'
        : 'Could not reach the server.'
    );
  }

  // Something came back, so the process is up and the cold-start allowance is
  // no longer warranted for the rest of the session.
  warm = true;

  /**
   * Retry once on an expired token.
   *
   * An ID token lives an hour and a browser tab can sit open for far longer, so
   * the first request after lunch would otherwise fail with a 401 the member
   * reads as "something went wrong". A forced refresh and one retry fixes it.
   * Only one — if a freshly minted token is still rejected, the session is
   * genuinely over and bouncing to sign-in is the honest answer.
   */
  if (response.status === 401) {
    const body = await response
      .clone()
      .json()
      .catch(() => null);

    if (body?.error?.code === 'token_expired') {
      try {
        response = await attempt(await idToken(true));
      } catch {
        // Fall through and report the original 401.
      }
    }
  }

  return decode<T>(response);
}

async function decode<T>(response: Response): Promise<T> {
  if (response.status === 204) return null as T;

  const text = await response.text();
  if (!text) return null as T;

  let body: unknown;
  try {
    body = JSON.parse(text);
  } catch {
    // A non-JSON body from a proxy or a crashed process. The status code is the
    // only reliable thing in it.
    if (!response.ok) throw new ApiError(response.status, 'Unexpected response.');
    return null as T;
  }

  if (!response.ok) {
    const message =
      (body as { error?: { message?: string } })?.error?.message ??
      'Request failed.';
    throw new ApiError(response.status, message);
  }

  return body as T;
}

export const api = {
  get: <T = any>(path: string, query?: Query) =>
    send<T>(path, { method: 'GET' }, query),

  post: <T = any>(path: string, body?: unknown) =>
    send<T>(path, {
      method: 'POST',
      body: body === undefined ? undefined : JSON.stringify(body),
    }),

  /**
   * Replaces a resource wholesale, as against `patch`'s partial update.
   *
   * Used where the client owns the entire collection and sends it back intact —
   * a member's affirmation set, where a removed line has to actually disappear
   * rather than merge back in.
   */
  put: <T = any>(path: string, body?: unknown) =>
    send<T>(path, {
      method: 'PUT',
      body: body === undefined ? undefined : JSON.stringify(body),
    }),

  patch: <T = any>(path: string, body?: unknown) =>
    send<T>(path, {
      method: 'PATCH',
      body: body === undefined ? undefined : JSON.stringify(body),
    }),

  delete: <T = any>(path: string) => send<T>(path, { method: 'DELETE' }),
};

// ─────────────────────────── shared response shapes ───────────────────────────

/**
 * What every list endpoint returns.
 *
 * The API pages with an opaque cursor rather than `?page=n` — see
 * `src/utils/pagination.js` in the backend for why. `nextCursor` is null at the
 * end; it is a base64 blob on purpose, so the paging key can change without
 * breaking a client that decoded it.
 */
export type Paged<T, K extends string> = {
  [P in K]: T[];
} & {
  hasMore: boolean;
  nextCursor: string | null;
};
