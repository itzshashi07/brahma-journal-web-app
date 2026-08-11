'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { Bell, X } from 'lucide-react';

import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';

type UnreadCounts = {
  broadcast: number;
  admin: number;
  replies: number;
  thoughtReplies: number;
  total: number;
};

/** How often the count is re-read while somebody is actually looking. */
const POLL_MS = 45_000;

/**
 * The unread badge, and the nudge when something arrives.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * Why there is now an interval, when this file used to argue against one
 *
 * On Android this is driven by FCM: the server pushes and `NotificationCenter`
 * re-reads. A browser tab has no equivalent — real web push needs a service
 * worker, VAPID keys and a permission prompt, which is a feature rather than a
 * detail and is still not built.
 *
 * The previous version read the count on mount and when the tab became visible,
 * and refused to poll on the grounds that a timer would run all day in a
 * forgotten tab. That reasoning was about the *forgotten* tab and it quietly
 * applied itself to the open one too: somebody sitting on the site, mid
 * conversation, waiting for a reply, was told nothing until they switched away
 * and back. Which is the moment this feature exists for.
 *
 * So: an interval, and two conditions that make it cheap.
 *
 *   • **It only runs while the document is visible.** A backgrounded tab has no
 *     timer at all — the visibility listener starts and stops it, so the
 *     forgotten-tab objection still holds, because a forgotten tab is not
 *     visible.
 *   • **Forty-five seconds**, against a route that answers with five integers.
 *
 * When the total goes *up*, a toast appears. A number silently changing in the
 * corner is not something anybody notices while reading.
 */
export function NotificationBell() {
  const { user } = useAuth();
  const [counts, setCounts] = useState<UnreadCounts | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  // The last count this component saw. A ref rather than state: comparing
  // against it must not itself cause a render, or every poll re-renders the
  // header whether or not anything changed.
  const seen = useRef<number | null>(null);
  const toastTimer = useRef<number | null>(null);

  useEffect(() => {
    if (!user) return;

    let cancelled = false;
    let timer: number | null = null;

    const refresh = async () => {
      try {
        const body = await api.get<UnreadCounts>('/api/notifications/unread');
        if (cancelled) return;

        setCounts(body);

        // Only a rise is news. A fall is this member reading something, here or
        // on their phone, and announcing that would be telling them what they
        // just did.
        const before = seen.current;
        if (before !== null && body.total > before) {
          const added = body.total - before;
          setToast(
            added === 1 ? 'Something new arrived' : `${added} new notifications`
          );
          if (toastTimer.current) window.clearTimeout(toastTimer.current);
          toastTimer.current = window.setTimeout(() => setToast(null), 6000);
        }
        seen.current = body.total;
      } catch {
        // A failed count leaves the badge as it was. Zeroing it would tell the
        // member they have nothing waiting, which is a worse lie than a stale
        // number.
      }
    };

    const start = () => {
      if (timer !== null) return;
      timer = window.setInterval(refresh, POLL_MS);
    };
    const stop = () => {
      if (timer === null) return;
      window.clearInterval(timer);
      timer = null;
    };

    void refresh();
    if (document.visibilityState === 'visible') start();

    const onVisible = () => {
      if (document.visibilityState === 'visible') {
        void refresh();
        start();
      } else {
        stop();
      }
    };
    document.addEventListener('visibilitychange', onVisible);

    return () => {
      cancelled = true;
      stop();
      if (toastTimer.current) window.clearTimeout(toastTimer.current);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [user]);

  const total = counts?.total ?? 0;

  return (
    <>
      <Link
        href="/app/notifications"
        className="relative rounded-md border border-hairline p-2 text-ink-secondary transition hover:text-ink-primary"
        aria-label={total > 0 ? `Notifications, ${total} unread` : 'Notifications'}
      >
        <Bell className="h-4 w-4" />
        {total > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[9px] font-bold text-bg-dark">
            {total > 9 ? '9+' : total}
          </span>
        )}
      </Link>

      {toast && (
        /*
          `aria-live="polite"` rather than `assertive`: a screen reader should
          mention this when it reaches a natural pause, not interrupt the
          sentence somebody is in the middle of reading.

          Sits above the bottom tab bar on a phone, and out of the way of the
          send button on the board.
        */
        <div
          role="status"
          aria-live="polite"
          className="fixed inset-x-4 bottom-20 z-50 mx-auto max-w-sm animate-fade-up sm:inset-x-auto sm:right-6 sm:bottom-6"
        >
          <Link
            href="/app/notifications"
            onClick={() => setToast(null)}
            className="glass flex items-center gap-3 p-3.5 shadow-soft"
          >
            <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/20 text-primary-light">
              <Bell className="h-4 w-4" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[13px] font-semibold text-ink-primary">
                {toast}
              </span>
              <span className="block text-[11.5px] text-ink-muted">
                Tap to open notifications
              </span>
            </span>
            <button
              type="button"
              aria-label="Dismiss"
              onClick={(event) => {
                // The whole card is a link; without this the dismiss button
                // navigates as well as closing.
                event.preventDefault();
                event.stopPropagation();
                setToast(null);
              }}
              className="shrink-0 rounded-md p-1 text-ink-muted transition hover:text-ink-primary"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </Link>
        </div>
      )}
    </>
  );
}
