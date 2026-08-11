'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Bell } from 'lucide-react';

import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';

type UnreadCounts = {
  broadcast: number;
  admin: number;
  replies: number;
  thoughtReplies: number;
  total: number;
};

/**
 * The unread badge.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * One request, where the app has a push
 *
 * On Android this is driven by FCM: the server pushes when something happens
 * and `NotificationCenter` re-reads the counts. A browser tab has no equivalent
 * — web push would need a service worker, VAPID keys and a permission prompt,
 * which is a real feature rather than a detail, and it is not built.
 *
 * So this reads `/api/notifications/unread` on mount and again when the tab
 * becomes visible. The visibility event is doing the work a push would: a
 * member who switches back to this tab is exactly the person who wants a fresh
 * count, and a member who has it in the background does not.
 *
 * There is deliberately no interval. A poll on a timer would run all day in a
 * forgotten tab to keep a number current that nobody is looking at, and it is
 * the pattern the whole migration away from live listeners was avoiding.
 */
export function NotificationBell() {
  const { user } = useAuth();
  const [counts, setCounts] = useState<UnreadCounts | null>(null);

  useEffect(() => {
    if (!user) return;

    let cancelled = false;

    const refresh = async () => {
      try {
        const body = await api.get<UnreadCounts>('/api/notifications/unread');
        if (!cancelled) setCounts(body);
      } catch {
        // A failed count leaves the badge as it was. Zeroing it would tell the
        // member they have nothing waiting, which is a worse lie than a stale
        // number.
      }
    };

    void refresh();

    const onVisible = () => {
      if (document.visibilityState === 'visible') void refresh();
    };
    document.addEventListener('visibilitychange', onVisible);

    return () => {
      cancelled = true;
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [user]);

  const total = counts?.total ?? 0;

  return (
    <Link
      href="/app/notifications"
      className="relative rounded-md border border-hairline p-2 text-ink-secondary transition hover:text-ink-primary"
      aria-label={
        total > 0 ? `Notifications, ${total} unread` : 'Notifications'
      }
    >
      <Bell className="h-4 w-4" />
      {total > 0 && (
        <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[9px] font-bold text-bg-dark">
          {total > 9 ? '9+' : total}
        </span>
      )}
    </Link>
  );
}
