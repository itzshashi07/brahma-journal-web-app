'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { Megaphone, ShieldAlert, Sparkles, X } from 'lucide-react';

import {
  AsyncSection,
  Card,
  EmptyState,
  PageHeader,
  timeAgo,
  useApi,
} from '@/components/app/ui';
import { api, type Paged } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { notificationsChanged } from '@/lib/notify-bus';

/**
 * Every notification feed this account has, in one screen.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * Why the badge would not clear, however much was deleted
 *
 * `GET /notifications/unread` returns five numbers and the header badge shows
 * the **total** of four of them: broadcasts, operator alerts, counselling
 * replies and replies on watched reflections. This screen only ever rendered the
 * first, and it was the only feed the website marked as seen.
 *
 * So an operator with three counselling requests waiting had a badge showing
 * three, opened this screen, deleted everything on it, and the badge stayed at
 * three — because the three were operator alerts, which had no screen here at
 * all and therefore no way to be read or dismissed. Clearing the broadcast feed
 * over and over could not touch them. The same held for a counselling reply: the
 * `replies` feed was never marked seen anywhere on the web, so a member who read
 * their counsellor's message still carried the badge for it.
 *
 * Now every feed the badge counts has somewhere to be read, and opening a tab
 * marks that feed seen. The counselling chat marks `replies` when it opens, and
 * the board already marked `thought_replies`. There is no longer a number in the
 * corner with nothing behind it.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * Removing one is a dismissal, not a delete
 *
 * A broadcast is one document every member reads. Deleting it would delete it
 * for the whole user base, so `DELETE /notifications/dismiss/:kind/:id` records
 * that *this* member is done with it and every feed and the badge filter against
 * that. Which is why it stays gone — including on the phone, and after a
 * reinstall.
 *
 * An operator alert is the exception and is a real delete: it is a work item in
 * a queue only operators can see, and the durable record of what happened is the
 * counselling session or the ticket it pointed at.
 */

type Broadcast = {
  _id: string;
  title: string;
  body?: string;
  type?: string;
  route?: string | null;
  createdAt: string;
};

type Announcement = {
  _id: string;
  title: string;
  content?: string;
  authorName?: string;
  createdAt: string;
};

type AdminAlert = {
  _id: string;
  title: string;
  body?: string;
  type?: string;
  subjectEmail?: string;
  subjectId?: string | null;
  createdAt: string;
};

type Tab = 'broadcast' | 'announcement' | 'admin';

export default function NotificationsPage() {
  const { isAdmin } = useAuth();
  const [tab, setTab] = useState<Tab>('broadcast');

  // An admin arriving from the bell almost always wants the queue, not the
  // announcements — that is what the badge was for.
  useEffect(() => {
    if (isAdmin) setTab('admin');
  }, [isAdmin]);

  return (
    <>
      <PageHeader
        title="Notifications"
        subtitle="Announcements and new articles. Replies to your own threads appear where they happened."
      />

      <div className="mb-4 flex flex-wrap gap-2">
        <TabButton active={tab === 'broadcast'} onClick={() => setTab('broadcast')}>
          <Megaphone className="h-3.5 w-3.5" /> For you
        </TabButton>
        <TabButton
          active={tab === 'announcement'}
          onClick={() => setTab('announcement')}
        >
          <Sparkles className="h-3.5 w-3.5" /> Announcements
        </TabButton>
        {isAdmin && (
          <TabButton active={tab === 'admin'} onClick={() => setTab('admin')}>
            <ShieldAlert className="h-3.5 w-3.5" /> Operator queue
          </TabButton>
        )}
      </div>

      {tab === 'broadcast' && <BroadcastFeed />}
      {tab === 'announcement' && <AnnouncementFeed />}
      {tab === 'admin' && isAdmin && <AdminFeed />}
    </>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`inline-flex items-center gap-1.5 rounded-pill px-4 py-2 text-[12.5px] font-medium transition ${
        active
          ? 'bg-gradient-primary text-white'
          : 'border border-hairline text-ink-secondary hover:text-ink-primary'
      }`}
    >
      {children}
    </button>
  );
}

/**
 * Optimistic removal, shared by the two dismissable feeds.
 *
 * Rows go the moment they are tapped rather than on the acknowledgement. This is
 * a list people clear several items at a time, and waiting on each round trip
 * makes it feel broken on a slow connection — which is precisely the complaint
 * that started all this. A failed dismissal puts the row back.
 */
function useDismissals(kind: 'broadcast' | 'announcement', reload: () => void) {
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const [clearing, setClearing] = useState(false);

  const dismiss = useCallback(
    async (id: string) => {
      setDismissed((current) => new Set(current).add(id));
      try {
        await api.delete(`/api/notifications/dismiss/${kind}/${id}`);
        notificationsChanged();
      } catch {
        setDismissed((current) => {
          const next = new Set(current);
          next.delete(id);
          return next;
        });
      }
    },
    [kind]
  );

  const clearAll = useCallback(async () => {
    if (!confirm('Remove every notification from your list?')) return;
    setClearing(true);
    try {
      await api.delete(`/api/notifications/dismiss/${kind}`);
      setDismissed(new Set());
      notificationsChanged();
      reload();
    } finally {
      setClearing(false);
    }
  }, [kind, reload]);

  return { dismissed, clearing, dismiss, clearAll };
}

function BroadcastFeed() {
  const state = useApi(
    () =>
      api.get<Paged<Broadcast, 'notifications'>>('/api/notifications', {
        limit: 30,
      }),
    []
  );
  const { dismissed, clearing, dismiss, clearAll } = useDismissals(
    'broadcast',
    state.reload
  );

  useEffect(() => {
    api
      .post('/api/notifications/seen/broadcast')
      .then(notificationsChanged)
      .catch(() => {});
  }, []);

  const visible = (state.data?.notifications ?? []).filter(
    (item) => !dismissed.has(item._id)
  );

  return (
    <>
      {visible.length > 0 && (
        <ClearAll onClick={clearAll} busy={clearing} />
      )}

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

                    <DismissButton
                      label={item.title}
                      onClick={() => dismiss(item._id)}
                    />
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

function AnnouncementFeed() {
  const state = useApi(
    () =>
      api.get<Paged<Announcement, 'announcements'>>(
        '/api/notifications/announcements',
        { limit: 20 }
      ),
    []
  );
  const { dismissed, clearing, dismiss, clearAll } = useDismissals(
    'announcement',
    state.reload
  );

  const visible = (state.data?.announcements ?? []).filter(
    (item) => !dismissed.has(item._id)
  );

  return (
    <>
      {visible.length > 0 && <ClearAll onClick={clearAll} busy={clearing} />}

      <AsyncSection state={state}>
        {() =>
          visible.length === 0 ? (
            <EmptyState
              title="No announcements"
              body="Anything worth telling everybody — a new feature, a change to how something works — is posted here."
            />
          ) : (
            <div className="space-y-3">
              {visible.map((item) => (
                <Card key={item._id} className="!p-4">
                  <div className="flex gap-3">
                    <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-accent/15 text-accent">
                      <Sparkles className="h-4 w-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-[14px] font-semibold text-ink-primary">
                        {item.title}
                      </p>
                      {item.content && (
                        <p className="mt-1 whitespace-pre-wrap text-[13px] leading-relaxed text-ink-secondary">
                          {item.content}
                        </p>
                      )}
                      <p className="mt-1.5 text-[11px] text-ink-muted">
                        {item.authorName || 'Admin'} · {timeAgo(item.createdAt)}
                      </p>
                    </div>

                    <DismissButton
                      label={item.title}
                      onClick={() => dismiss(item._id)}
                    />
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

/**
 * The operator queue.
 *
 * These are work items — a counselling request, a payment to verify, somebody
 * new signing up — and each one links to the screen where it is acted on. This
 * is the feed that had no home on the web, which is why an operator was told
 * about a booking by a badge that pointed at a page that did not mention it.
 */
function AdminFeed() {
  const state = useApi(
    () =>
      api.get<Paged<AdminAlert, 'notifications'>>('/api/notifications/admin', {
        limit: 40,
      }),
    []
  );

  const [gone, setGone] = useState<Set<string>>(new Set());
  const [clearing, setClearing] = useState(false);

  useEffect(() => {
    api
      .post('/api/notifications/seen/admin')
      .then(notificationsChanged)
      .catch(() => {});
  }, []);

  async function remove(id: string) {
    setGone((current) => new Set(current).add(id));
    try {
      await api.delete(`/api/notifications/admin/${id}`);
      notificationsChanged();
    } catch {
      setGone((current) => {
        const next = new Set(current);
        next.delete(id);
        return next;
      });
    }
  }

  const visible = (state.data?.notifications ?? []).filter(
    (item) => !gone.has(item._id)
  );

  /**
   * Clearing the queue is one delete per alert.
   *
   * There is no bulk route for these and there should not be: an alert is a
   * unit of work, and a server-side "delete everything" is one mis-tap away
   * from losing a queue nobody has looked at. Issued together rather than in
   * sequence, so forty alerts is one wait rather than forty.
   */
  async function clearAll() {
    if (!confirm('Delete every alert in the queue? The sessions they point at are not touched.')) {
      return;
    }
    setClearing(true);
    const ids = visible.map((item) => item._id);
    setGone((current) => new Set([...current, ...ids]));
    try {
      await Promise.allSettled(
        ids.map((id) => api.delete(`/api/notifications/admin/${id}`))
      );
      notificationsChanged();
      state.reload();
    } finally {
      setClearing(false);
    }
  }

  return (
    <>
      {visible.length > 0 && (
        <ClearAll onClick={clearAll} busy={clearing} label="Clear the queue" />
      )}

      <AsyncSection state={state}>
        {() =>
          visible.length === 0 ? (
            <EmptyState
              title="The queue is empty"
              body="Counselling requests, payments waiting to be verified and new signups land here. Deleting one does not touch the session it points at."
            />
          ) : (
            <div className="space-y-3">
              {visible.map((item) => (
                <Card key={item._id} className="!p-4">
                  <div className="flex gap-3">
                    <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-danger/15 text-red-300">
                      <ShieldAlert className="h-4 w-4" />
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
                      {item.subjectEmail && (
                        <p className="mt-1 break-all text-[12px] text-ink-muted">
                          {item.subjectEmail}
                        </p>
                      )}
                      <div className="mt-2 flex flex-wrap items-center gap-3">
                        <span className="text-[11px] text-ink-muted">
                          {timeAgo(item.createdAt)}
                        </span>
                        {item.type === 'counselling' && (
                          <Link
                            href="/app/admin"
                            className="text-[11.5px] text-primary-light underline underline-offset-2"
                          >
                            Open the counselling queue
                          </Link>
                        )}
                      </div>
                    </div>

                    <DismissButton
                      label={item.title}
                      onClick={() => remove(item._id)}
                    />
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

function ClearAll({
  onClick,
  busy,
  label = 'Clear all',
}: {
  onClick: () => void;
  busy: boolean;
  label?: string;
}) {
  return (
    <div className="mb-3 flex justify-end">
      <button
        type="button"
        onClick={onClick}
        disabled={busy}
        className="btn-ghost !px-4 !py-2 text-[12.5px] disabled:opacity-50"
      >
        {busy ? 'Clearing…' : label}
      </button>
    </div>
  );
}

function DismissButton({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`Remove: ${label}`}
      title="Remove"
      className="-mr-1 -mt-1 h-8 w-8 shrink-0 rounded-md text-ink-muted transition hover:bg-bg-card hover:text-ink-primary"
    >
      <X className="mx-auto h-3.5 w-3.5" />
    </button>
  );
}
