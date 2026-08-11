'use client';

import { useEffect, useState } from 'react';
import { Megaphone, X } from 'lucide-react';

import {
  AsyncSection,
  Card,
  EmptyState,
  PageHeader,
  timeAgo,
  useApi,
} from '@/components/app/ui';
import { api, type Paged } from '@/lib/api';

/**
 * The broadcast feed.
 *
 * Floored at the date the member joined. The feed is a single shared collection
 * rather than a per-user inbox, so without a floor every new member opens it to
 * years of "a new article" for articles they have never seen, from before they
 * existed. The server applies the floor; this screen just renders what it gets.
 *
 * Opening the screen marks it seen, which is what clears the badge in the
 * header. The unread count is computed server-side from that timestamp — this
 * client does not count anything.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * Removing one is a dismissal, not a delete
 *
 * A broadcast is one document every member reads. Deleting it would delete it
 * for the whole user base, so `DELETE /notifications/dismiss/broadcast/:id`
 * records that *this* member is done with it and every feed and the badge
 * filter against that. Which is why it stays gone — including on the phone,
 * and after a reinstall.
 */

type Notification = {
  _id: string;
  title: string;
  body?: string;
  type?: string;
  route?: string | null;
  createdAt: string;
};

export default function NotificationsPage() {
  // Removed immediately, before the round trip. This is a list people clear
  // several items at a time, and waiting on each acknowledgement makes it feel
  // broken on a slow connection.
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const [clearing, setClearing] = useState(false);

  const state = useApi(
    () =>
      api.get<Paged<Notification, 'notifications'>>('/api/notifications', {
        limit: 30,
      }),
    []
  );

  useEffect(() => {
    api.post('/api/notifications/seen/broadcast').catch(() => {});
  }, []);

  async function dismiss(id: string) {
    setDismissed((current) => new Set(current).add(id));
    try {
      await api.delete(`/api/notifications/dismiss/broadcast/${id}`);
    } catch {
      setDismissed((current) => {
        const next = new Set(current);
        next.delete(id);
        return next;
      });
    }
  }

  async function clearAll() {
    if (!confirm('Remove every notification from your list?')) return;
    setClearing(true);
    try {
      await api.delete('/api/notifications/dismiss/broadcast');
      state.reload();
      setDismissed(new Set());
    } finally {
      setClearing(false);
    }
  }

  const visible = (state.data?.notifications ?? []).filter(
    (item) => !dismissed.has(item._id)
  );

  return (
    <>
      <PageHeader
        title="Notifications"
        subtitle="Announcements and new articles. Replies to your own threads appear where they happened."
        action={
          visible.length > 0 ? (
            <button
              type="button"
              onClick={clearAll}
              disabled={clearing}
              className="btn-ghost !px-4 !py-2 text-[12.5px] disabled:opacity-50"
            >
              {clearing ? 'Clearing…' : 'Clear all'}
            </button>
          ) : undefined
        }
      />

      <AsyncSection state={state}>
        {() =>
          visible.length === 0 ? (
            <EmptyState
              title="Nothing yet"
              body="You will be told here when an article is published or an announcement goes out."
            />
          ) : (
            <div className="space-y-3">
              {visible.map((item) => (
                <Card key={item._id} className="!p-4">
                  <div className="flex gap-3">
                    <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary/15 text-primary-light">
                      <Megaphone className="h-4 w-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-[14px] font-semibold text-ink-primary">
                        {item.title}
                      </p>
                      {item.body && (
                        <p className="mt-1 text-[13px] leading-relaxed text-ink-secondary">
                          {item.body}
                        </p>
                      )}
                      <p className="mt-1.5 text-[11px] text-ink-muted">
                        {timeAgo(item.createdAt)}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => dismiss(item._id)}
                      aria-label={`Remove: ${item.title}`}
                      title="Remove"
                      className="-mr-1 -mt-1 h-8 w-8 shrink-0 rounded-md text-ink-muted transition hover:bg-bg-card hover:text-ink-primary"
                    >
                      <X className="mx-auto h-3.5 w-3.5" />
                    </button>
                  </div>
                </Card>
              ))}
            </div>
          )
        }
      </AsyncSection>
    </>
  );
}
