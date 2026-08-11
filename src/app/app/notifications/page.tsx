'use client';

import { useEffect } from 'react';
import { Megaphone } from 'lucide-react';

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

  return (
    <>
      <PageHeader
        title="Notifications"
        subtitle="Announcements and new articles. Replies to your own threads appear where they happened."
      />

      <AsyncSection state={state}>
        {(data) =>
          data.notifications.length === 0 ? (
            <EmptyState
              title="Nothing yet"
              body="You will be told here when an article is published or an announcement goes out."
            />
          ) : (
            <div className="space-y-3">
              {data.notifications.map((item) => (
                <Card key={item._id} className="!p-4">
                  <div className="flex gap-3">
                    <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary/15 text-primary-light">
                      <Megaphone className="h-4 w-4" />
                    </span>
                    <div className="min-w-0">
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
