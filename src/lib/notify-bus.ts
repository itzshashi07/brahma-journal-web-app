'use client';

/**
 * "Something about the notification count just changed."
 *
 * ─────────────────────────────────────────────────────────────────────────
 * Why a browser event and not React state
 *
 * The badge lives in the header, inside the shell. The things that change what
 * it should say — clearing a feed, opening the counselling chat, dismissing an
 * operator alert — happen in page components several levels below it and on the
 * other side of the router. Lifting the count into a context would put a
 * provider around the whole application so that four call sites could nudge one
 * number, and every one of those call sites would have to remember to take the
 * hook.
 *
 * A `window` event costs nothing, needs no provider, and is ignored harmlessly
 * by any page that does not care. The bell already re-reads on an interval and
 * on tab focus; this only makes the update immediate instead of up to
 * forty-five seconds late — which matters because the forty-five seconds is
 * exactly long enough for somebody to conclude that clearing the list did not
 * work.
 */

const EVENT = 'innenflow:notifications-changed';

/** Call after anything that should change the unread count. */
export function notificationsChanged(): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new Event(EVENT));
}

/** Subscribe. Returns the unsubscribe function, for a `useEffect` cleanup. */
export function onNotificationsChanged(handler: () => void): () => void {
  if (typeof window === 'undefined') return () => {};
  window.addEventListener(EVENT, handler);
  return () => window.removeEventListener(EVENT, handler);
}
