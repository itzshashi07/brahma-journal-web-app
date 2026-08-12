'use client';

import { useEffect, useState } from 'react';
import {
  BookOpen,
  Check,
  HeartHandshake,
  Mail,
  Megaphone,
  Send,
  ShieldCheck,
  Video,
  X,
} from 'lucide-react';

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
import { genderLabel } from '@/lib/validate';

/**
 * The operator console.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * Why this had to exist
 *
 * Every approval in this product was Android-only. The API has had
 * `PATCH /counselling/sessions/:id/status` and `PATCH /blogs/:id/review` from
 * the beginning, both `requireAdmin`, and the website called neither. So a
 * member could book a session on the web, pay on the web, and then wait —
 * because the person who had to verify that payment could only do it by opening
 * the phone app. If the operator was at a desk, the answer was "later".
 *
 * The same for the Sanctuary: articles queued for review and there was no web
 * screen that could publish one.
 *
 * Nothing here grants privilege. Every route behind these buttons checks the
 * `admin` custom claim in the verified ID token, server-side; the claim is also
 * what draws the tab. A browser with the flag flipped in devtools reaches this
 * page and collects 403s.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * The three things an operator actually does
 *
 * Verify a payment and open the room. Review an article. Tell everybody
 * something. The queue of alerts that says *when* to do any of it lives on the
 * notifications screen, under "Operator queue" — deliberately, because that is
 * where the badge points.
 */

type Session = {
  _id: string;
  firebaseUid: string;
  name?: string;
  age?: string;
  gender?: string;
  phone?: string;
  concern?: string;
  language?: string;
  details?: string;
  status: string;
  mode?: string;
  meetLink?: string;
  amount?: number;
  paymentMode?: string;
  transactionId?: string;
  lastMessagePreview?: string;
  lastMessageAt?: string;
  purgeAfter?: string | null;
  createdAt: string;
};

type Message = {
  _id: string;
  sender: 'member' | 'admin' | 'system';
  kind?: string;
  text: string;
  createdAt: string;
};

type Blog = {
  _id: string;
  title: string;
  excerpt?: string;
  category?: string;
  authorName?: string;
  status?: 'published' | 'pending' | 'rejected';
  reviewNote?: string;
  createdAt: string;
};

const STATUS_LABEL: Record<string, string> = {
  awaiting_payment: 'Awaiting payment',
  payment_submitted: 'Payment to verify',
  approved: 'Approved — member choosing',
  meet_requested: 'Call requested',
  active: 'Live',
  ended: 'Ended',
  rejected: 'Rejected',
};

/** The ones that need somebody, in the order they need them. */
const NEEDS_ACTION = ['payment_submitted', 'meet_requested'];

type Tab = 'counselling' | 'articles' | 'messages' | 'announce';

export default function AdminPage() {
  const { isAdmin, loading } = useAuth();
  const [tab, setTab] = useState<Tab>('counselling');

  if (loading) return null;

  if (!isAdmin) {
    return (
      <>
        <PageHeader title="Operator" />
        <EmptyState
          title="This is not your screen"
          body="The operator console is for the people who verify payments and review submissions. If that should be you, the admin claim is set on the account, not in the browser."
        />
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Operator"
        subtitle="Verify a payment, open a room, review an article. Everything here checks the admin claim again on the server."
      />

      <div className="mb-5 flex flex-wrap gap-2">
        <TabButton active={tab === 'counselling'} onClick={() => setTab('counselling')}>
          <HeartHandshake className="h-3.5 w-3.5" /> Counselling
        </TabButton>
        <TabButton active={tab === 'articles'} onClick={() => setTab('articles')}>
          <BookOpen className="h-3.5 w-3.5" /> Articles
        </TabButton>
        <TabButton active={tab === 'messages'} onClick={() => setTab('messages')}>
          <Mail className="h-3.5 w-3.5" /> Messages
        </TabButton>
        <TabButton active={tab === 'announce'} onClick={() => setTab('announce')}>
          <Megaphone className="h-3.5 w-3.5" /> Announce
        </TabButton>
      </div>

      {tab === 'counselling' && <CounsellingQueue />}
      {tab === 'articles' && <ArticleQueue />}
      {tab === 'messages' && <MessageQueue />}
      {tab === 'announce' && <Announce />}
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

// ─────────────────────────── counselling ───────────────────────────

function CounsellingQueue() {
  const [openId, setOpenId] = useState<string | null>(null);

  const state = useApi(
    () =>
      api.get<Paged<Session, 'sessions'>>('/api/counselling/inbox', {
        limit: 40,
      }),
    []
  );

  if (openId) {
    return (
      <SessionDetail
        sessionId={openId}
        onBack={async () => {
          setOpenId(null);
          await state.reload();
        }}
      />
    );
  }

  return (
    <AsyncSection state={state}>
      {(data) => {
        // Waiting on an operator first, then everything else. A queue sorted
        // purely by time buries the payment somebody submitted an hour ago
        // under four ended sessions.
        const sessions = [...data.sessions].sort((a, b) => {
          const rank = (s: Session) => (NEEDS_ACTION.includes(s.status) ? 0 : 1);
          return rank(a) - rank(b);
        });

        if (sessions.length === 0) {
          return (
            <EmptyState
              title="No sessions"
              body="Bookings appear here the moment somebody opens one, whether they booked from the app or the website."
            />
          );
        }

        return (
          <div className="space-y-3">
            {sessions.map((session) => {
              const waiting = NEEDS_ACTION.includes(session.status);
              return (
                <button
                  key={session._id}
                  type="button"
                  onClick={() => setOpenId(session._id)}
                  className={`glass glass-hover block w-full p-4 text-left ${
                    waiting ? 'border-accent/45' : ''
                  }`}
                >
                  <div className="mb-1.5 flex flex-wrap items-center gap-2">
                    <span
                      className={`rounded-pill px-2.5 py-0.5 text-[10px] font-semibold ${
                        waiting
                          ? 'bg-accent/20 text-accent'
                          : 'bg-primary/20 text-primary-light'
                      }`}
                    >
                      {STATUS_LABEL[session.status] ?? session.status}
                    </span>
                    {session.transactionId && (
                      <span className="rounded-pill bg-bg-card px-2.5 py-0.5 text-[10px] text-ink-muted">
                        ref {session.transactionId}
                      </span>
                    )}
                  </div>

                  <p className="text-[14px] font-semibold text-ink-primary">
                    {session.name || 'A member'}
                    {session.age ? `, ${session.age}` : ''}
                    {session.gender ? ` · ${genderLabel(session.gender)}` : ''}
                  </p>
                  <p className="mt-0.5 text-[12.5px] text-ink-secondary">
                    {session.concern || 'No concern given'}
                    {session.language ? ` · ${session.language}` : ''}
                  </p>
                  {session.lastMessagePreview && (
                    <p className="mt-1 line-clamp-1 text-[12px] text-ink-muted">
                      {session.lastMessagePreview}
                    </p>
                  )}
                  <p className="mt-2 text-[11px] text-ink-muted">
                    Opened {timeAgo(session.createdAt)}
                    {session.phone ? ` · ${session.phone}` : ''}
                  </p>
                </button>
              );
            })}
          </div>
        );
      }}
    </AsyncSection>
  );
}

/**
 * One session, with the transcript and every control an operator needs.
 *
 * The status buttons shown depend on where the session is: approving something
 * already approved, or issuing a room for a session nobody has paid for, are
 * both mistakes the interface should not offer rather than errors it should
 * report.
 */
function SessionDetail({
  sessionId,
  onBack,
}: {
  sessionId: string;
  onBack: () => void;
}) {
  const [draft, setDraft] = useState('');
  const [meetLink, setMeetLink] = useState('');
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const session = useApi(
    () => api.get<{ session: Session }>(`/api/counselling/sessions/${sessionId}`),
    [sessionId]
  );
  const messages = useApi(
    () =>
      api.get<Paged<Message, 'messages'>>(
        `/api/counselling/sessions/${sessionId}/messages`,
        { limit: 200 }
      ),
    [sessionId]
  );

  useEffect(() => {
    setMeetLink(session.data?.session.meetLink ?? '');
  }, [session.data?.session.meetLink]);

  async function setStatus(body: Record<string, unknown>, label: string) {
    setBusy(label);
    setError(null);
    try {
      await api.patch(`/api/counselling/sessions/${sessionId}/status`, body);
      await Promise.all([session.reload(), messages.reload()]);
      // The member is told by push and by a system message written server-side
      // in the same request; the operator's own badge changes too, because
      // acting on an alert is the thing that should quiet it.
      notificationsChanged();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'That did not go through.');
    } finally {
      setBusy(null);
    }
  }

  async function send() {
    const text = draft.trim();
    if (!text) return;
    setBusy('send');
    try {
      await api.post(`/api/counselling/sessions/${sessionId}/messages`, {
        text,
        kind: 'text',
      });
      setDraft('');
      await messages.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not send that.');
    } finally {
      setBusy(null);
    }
  }

  const current = session.data?.session;
  const status = current?.status;

  const canApprove = status === 'payment_submitted' || status === 'rejected';
  const canReject = status === 'payment_submitted';
  const canIssueRoom =
    status === 'meet_requested' || status === 'approved' || status === 'active';
  const canEnd = status && !['ended', 'awaiting_payment'].includes(status);

  return (
    <>
      <div className="mb-4 flex items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          className="text-[12.5px] text-ink-muted transition hover:text-ink-primary"
        >
          ← Queue
        </button>
        <span className="ml-auto inline-flex items-center gap-1.5 text-[11.5px] text-ink-muted">
          <ShieldCheck className="h-3.5 w-3.5" /> Operator view
        </span>
      </div>

      {current && (
        <Card className="mb-4">
          <div className="grid gap-x-6 gap-y-2 text-[13px] sm:grid-cols-2">
            <Row label="Name" value={current.name || '—'} />
            <Row label="Phone" value={current.phone || '—'} />
            <Row label="Age" value={current.age || '—'} />
            <Row label="Gender" value={genderLabel(current.gender)} />
            <Row label="Concern" value={current.concern || '—'} />
            <Row label="Language" value={current.language || '—'} />
            <Row label="Amount" value={current.amount ? `₹${current.amount}` : '—'} />
            <Row label="Paid by" value={current.paymentMode || '—'} />
            <Row label="Reference" value={current.transactionId || '—'} />
            <Row
              label="Status"
              value={STATUS_LABEL[current.status] ?? current.status}
            />
          </div>

          {current.details && (
            <p className="mt-3 whitespace-pre-wrap rounded-md border border-hairline bg-bg-dark/40 p-3 text-[12.5px] leading-relaxed text-ink-secondary">
              {current.details}
            </p>
          )}
        </Card>
      )}

      <Card className="mb-4">
        <p className="mb-3 text-[11px] uppercase tracking-wide text-ink-muted">
          What happens next
        </p>

        <div className="flex flex-wrap gap-2">
          {canApprove && (
            <button
              type="button"
              disabled={busy !== null}
              onClick={() => setStatus({ status: 'approved' }, 'approve')}
              className="btn-primary !px-4 !py-2 text-[12.5px]"
            >
              <Check className="h-3.5 w-3.5" />
              {busy === 'approve' ? 'Approving…' : 'Payment verified — approve'}
            </button>
          )}

          {canReject && (
            <button
              type="button"
              disabled={busy !== null}
              onClick={() => {
                if (!confirm('Turn this down? The member is told, and can reply with the reference.')) return;
                void setStatus({ status: 'rejected' }, 'reject');
              }}
              className="btn !border !border-danger/50 !bg-danger/10 !px-4 !py-2 text-[12.5px] text-red-300"
            >
              <X className="h-3.5 w-3.5" />
              {busy === 'reject' ? 'Sending…' : 'Cannot verify — turn down'}
            </button>
          )}

          {canEnd && (
            <button
              type="button"
              disabled={busy !== null}
              onClick={() => {
                if (!confirm('End the session? The whole transcript is deleted two hours from now.')) return;
                void setStatus({ status: 'ended' }, 'end');
              }}
              className="btn-ghost !px-4 !py-2 text-[12.5px]"
            >
              {busy === 'end' ? 'Ending…' : 'End the session'}
            </button>
          )}
        </div>

        {canIssueRoom && (
          <div className="mt-4 border-t border-hairline pt-4">
            <label
              htmlFor="meet-link"
              className="mb-1.5 block text-[12px] font-medium text-ink-secondary"
            >
              Google Meet link
            </label>
            <div className="flex flex-col gap-2 sm:flex-row">
              <input
                id="meet-link"
                className="field flex-1"
                value={meetLink}
                onChange={(event) => setMeetLink(event.target.value)}
                placeholder="https://meet.google.com/xxx-yyyy-zzz"
              />
              <button
                type="button"
                disabled={busy !== null || !meetLink.trim()}
                onClick={() => setStatus({ status: 'active', meetLink: meetLink.trim() }, 'room')}
                className="btn-primary !px-4 !py-2.5 text-[12.5px]"
              >
                <Video className="h-3.5 w-3.5" />
                {busy === 'room' ? 'Sending…' : 'Send the room'}
              </button>
            </div>
            <p className="mt-1.5 text-[11.5px] leading-relaxed text-ink-muted">
              Issuing a room is what makes the session live. The link is checked
              server-side — a typo here leaves somebody waiting for a call that
              cannot happen, and they have no way to tell that from being stood
              up.
            </p>
          </div>
        )}
      </Card>

      {error && (
        <p role="alert" className="mb-4 rounded-md border border-danger/40 bg-danger/10 px-3 py-2 text-[12.5px] text-ink-secondary">
          {error}
        </p>
      )}

      <AsyncSection state={messages}>
        {(data) => (
          <div className="space-y-2.5">
            {data.messages.map((message) =>
              message.sender === 'system' ? (
                <p
                  key={message._id}
                  className="mx-auto max-w-md whitespace-pre-wrap rounded-md bg-bg-card/50 px-4 py-3 text-center text-[12.5px] leading-relaxed text-ink-muted"
                >
                  {message.text}
                </p>
              ) : (
                <div
                  key={message._id}
                  // Mirrored against the member's view: the operator's own
                  // words are on the right here and on the left there.
                  className={`max-w-[85%] rounded-lg px-4 py-2.5 ${
                    message.sender === 'admin'
                      ? 'ml-auto bg-gradient-primary text-white'
                      : 'bg-bg-card text-ink-secondary'
                  }`}
                >
                  <p className="whitespace-pre-wrap text-[13.5px] leading-relaxed">
                    {message.text}
                  </p>
                  <p
                    className={`mt-1 text-[10px] ${
                      message.sender === 'admin' ? 'text-white/60' : 'text-ink-muted'
                    }`}
                  >
                    {message.sender === 'member' ? 'Member · ' : ''}
                    {timeAgo(message.createdAt)}
                  </p>
                </div>
              )
            )}
          </div>
        )}
      </AsyncSection>

      {status !== 'ended' && (
        <div className="mt-5 flex gap-2">
          <input
            className="field flex-1"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="Reply as the counsellor…"
            maxLength={5000}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault();
                void send();
              }
            }}
          />
          <button
            type="button"
            onClick={send}
            disabled={busy !== null || !draft.trim()}
            className="btn-primary !px-4"
            aria-label="Send"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      )}
    </>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-ink-muted">{label}</dt>
      <dd className="truncate text-right text-ink-secondary">{value}</dd>
    </div>
  );
}

// ─────────────────────────── articles ───────────────────────────

/**
 * The review queue.
 *
 * A rejection carries a written reason, and the field is not optional in
 * practice: the author sees the note on their own copy of the article, and a
 * rejection with no note is a closed door with nothing to act on. Publishing
 * announces the article to the entire user base, server-side, in the same
 * request — which is why the confirm exists.
 */
function ArticleQueue() {
  const [status, setStatus] = useState<'pending' | 'published' | 'rejected'>(
    'pending'
  );
  const [note, setNote] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState<string | null>(null);

  const state = useApi(
    () => api.get<Paged<Blog, 'blogs'>>('/api/blogs', { status, limit: 30 }),
    [status]
  );

  async function review(
    id: string,
    next: 'published' | 'rejected',
    reviewNote: string
  ) {
    setBusy(id);
    try {
      await api.patch(`/api/blogs/${id}/review`, {
        status: next,
        reviewNote,
      });
      await state.reload();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'That did not go through.');
    } finally {
      setBusy(null);
    }
  }

  return (
    <>
      <div className="mb-4 flex flex-wrap gap-2">
        {(['pending', 'published', 'rejected'] as const).map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => setStatus(value)}
            aria-pressed={status === value}
            className={`rounded-pill px-3.5 py-1.5 text-[12px] font-medium capitalize transition ${
              status === value
                ? 'bg-primary/20 text-primary-light'
                : 'border border-hairline text-ink-muted hover:text-ink-secondary'
            }`}
          >
            {value}
          </button>
        ))}
      </div>

      <AsyncSection state={state}>
        {(data) =>
          data.blogs.length === 0 ? (
            <EmptyState
              title={status === 'pending' ? 'Nothing waiting' : `No ${status} articles`}
              body="Submissions from members land here. A human reads every one, and the author is told either way."
            />
          ) : (
            <div className="space-y-3">
              {data.blogs.map((blog) => (
                <Card key={blog._id}>
                  {blog.category && (
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-accent">
                      {blog.category}
                    </span>
                  )}
                  <h2 className="mt-1 text-[15.5px] font-semibold leading-snug text-ink-primary">
                    {blog.title}
                  </h2>
                  {blog.excerpt && (
                    <p className="mt-1.5 whitespace-pre-wrap text-[13px] leading-relaxed text-ink-secondary">
                      {blog.excerpt}
                      {blog.excerpt.length >= 280 ? '…' : ''}
                    </p>
                  )}
                  <p className="mt-2 text-[11px] text-ink-muted">
                    {blog.authorName || 'A member'} · {timeAgo(blog.createdAt)}
                  </p>

                  <a
                    href={`/app/blogs/${blog._id}`}
                    className="mt-2 inline-block text-[12px] text-primary-light underline underline-offset-2"
                  >
                    Read the whole thing first
                  </a>

                  {status !== 'published' && (
                    <div className="mt-4 border-t border-hairline pt-4">
                      <input
                        className="field"
                        value={note[blog._id] ?? blog.reviewNote ?? ''}
                        onChange={(event) =>
                          setNote((current) => ({
                            ...current,
                            [blog._id]: event.target.value,
                          }))
                        }
                        placeholder="A line for the author, if you are turning it down"
                        maxLength={2000}
                      />

                      <div className="mt-3 flex flex-wrap gap-2">
                        <button
                          type="button"
                          disabled={busy === blog._id}
                          onClick={() => {
                            if (!confirm('Publish this? Everybody is told about it.')) return;
                            void review(blog._id, 'published', note[blog._id] ?? '');
                          }}
                          className="btn-primary !px-4 !py-2 text-[12.5px]"
                        >
                          <Check className="h-3.5 w-3.5" />
                          {busy === blog._id ? 'Working…' : 'Publish'}
                        </button>

                        <button
                          type="button"
                          disabled={busy === blog._id}
                          onClick={() => {
                            const reason = (note[blog._id] ?? '').trim();
                            if (!reason) {
                              alert('Write a line for the author first. A rejection with no reason is a closed door.');
                              return;
                            }
                            void review(blog._id, 'rejected', reason);
                          }}
                          className="btn !border !border-danger/50 !bg-danger/10 !px-4 !py-2 text-[12.5px] text-red-300"
                        >
                          <X className="h-3.5 w-3.5" /> Turn down
                        </button>
                      </div>
                    </div>
                  )}

                  {blog.status === 'rejected' && blog.reviewNote && (
                    <p className="mt-3 rounded-md border border-danger/30 bg-danger/10 px-3 py-2 text-[12px] leading-relaxed text-ink-secondary">
                      {blog.reviewNote}
                    </p>
                  )}
                </Card>
              ))}
            </div>
          )
        }
      </AsyncSection>
    </>
  );
}

// ─────────────────────────── messages ───────────────────────────

type Ticket = {
  _id: string;
  firebaseUid?: string;
  source?: string;
  userName?: string;
  userEmail?: string;
  category?: string;
  subject?: string;
  message?: string;
  status?: 'open' | 'closed';
  createdAt: string;
};

/**
 * What the contact form writes, and the app's support tickets beside it.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * Why the two are one list
 *
 * They are the same thing — somebody asking for help — and the only difference
 * is whether they were signed in when they asked. Splitting them into two
 * screens means the operator has to remember to check both, and the one that
 * gets forgotten is the one from the person who *cannot sign in*, which is the
 * more urgent of the two.
 *
 * `source` is on every row for the one thing it changes: a ticket from the app
 * belongs to a verified account, and a ticket from the website carries an
 * address somebody typed. Replying to the second is replying to a claim.
 *
 * Closing is `PATCH /support/tickets/:id`, which also takes the alert off the
 * operator's queue — see `resolveAdminAlerts` in the API.
 */
function MessageQueue() {
  const [status, setStatus] = useState<'open' | 'closed'>('open');
  const [busy, setBusy] = useState<string | null>(null);

  const state = useApi(
    () => api.get<Paged<Ticket, 'tickets'>>('/api/support/tickets', { limit: 50 }),
    []
  );

  async function close(id: string) {
    setBusy(id);
    try {
      await api.patch(`/api/support/tickets/${id}`, { status: 'closed' });
      notificationsChanged();
      await state.reload();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'That did not go through.');
    } finally {
      setBusy(null);
    }
  }

  // Filtered here rather than by query: the endpoint pages over everything and
  // an operator switching between "open" and "closed" is looking at the same
  // fifty rows either way.
  const visible = (state.data?.tickets ?? []).filter(
    (ticket) => (ticket.status ?? 'open') === status
  );

  return (
    <>
      <div className="mb-4 flex flex-wrap gap-2">
        {(['open', 'closed'] as const).map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => setStatus(value)}
            aria-pressed={status === value}
            className={`rounded-pill px-3.5 py-1.5 text-[12px] font-medium capitalize transition ${
              status === value
                ? 'bg-primary/20 text-primary-light'
                : 'border border-hairline text-ink-muted hover:text-ink-secondary'
            }`}
          >
            {value}
          </button>
        ))}
      </div>

      <AsyncSection state={state}>
        {() =>
          visible.length === 0 ? (
            <EmptyState
              title={status === 'open' ? 'Nothing waiting' : 'Nothing closed yet'}
              body="Messages from the website's contact form and support tickets from inside the app both land here. Closing one takes its alert off your queue."
            />
          ) : (
            <div className="space-y-3">
              {visible.map((ticket) => (
                <Card key={ticket._id}>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-accent">
                      {ticket.category || ticket.subject || 'General'}
                    </span>
                    <span
                      className={`rounded-pill px-2 py-0.5 text-[10px] font-semibold ${
                        ticket.source === 'web-contact'
                          ? 'bg-accent/15 text-accent'
                          : 'bg-primary/15 text-primary-light'
                      }`}
                    >
                      {ticket.source === 'web-contact'
                        ? 'website · not signed in'
                        : 'from the app'}
                    </span>
                    <span className="ml-auto text-[11px] text-ink-muted">
                      {timeAgo(ticket.createdAt)}
                    </span>
                  </div>

                  <p className="mt-2 text-[14px] font-semibold text-ink-primary">
                    {ticket.userName || 'Someone'}
                    {ticket.userEmail && (
                      <span className="ml-2 break-all text-[12.5px] font-normal text-ink-secondary">
                        {ticket.userEmail}
                      </span>
                    )}
                  </p>

                  <p className="mt-2 whitespace-pre-wrap text-[13px] leading-relaxed text-ink-secondary">
                    {ticket.message}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {ticket.userEmail && (
                      <a
                        href={`mailto:${ticket.userEmail}?subject=${encodeURIComponent(
                          `Re: ${ticket.category || 'your message'} — InnenFlow`
                        )}`}
                        className="btn-primary !py-2 text-[12.5px]"
                      >
                        <Mail className="h-3.5 w-3.5" /> Reply by email
                      </a>
                    )}
                    {(ticket.status ?? 'open') === 'open' && (
                      <button
                        type="button"
                        onClick={() => close(ticket._id)}
                        disabled={busy === ticket._id}
                        className="btn-ghost !py-2 text-[12.5px]"
                      >
                        <Check className="h-3.5 w-3.5" />
                        {busy === ticket._id ? 'Closing…' : 'Mark handled'}
                      </button>
                    )}
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

// ─────────────────────────── announcements ───────────────────────────

/**
 * Tell everybody something.
 *
 * One request writes the announcement and the broadcast that points at it, so
 * the pair cannot come apart because a tab was closed between two calls. It
 * reaches every install through FCM, which is why the confirm names the size of
 * the audience rather than asking "are you sure".
 */
function Announce() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function publish() {
    if (!title.trim()) return;
    if (!confirm('This goes to every member, on every device. Send it?')) return;

    setBusy(true);
    setError(null);
    setDone(false);
    try {
      await api.post('/api/notifications/announcements', {
        title: title.trim(),
        content: content.trim(),
      });
      setTitle('');
      setContent('');
      setDone(true);
      notificationsChanged();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'That did not send.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card>
      <div className="space-y-3">
        <div>
          <label htmlFor="ann-title" className="mb-1.5 block text-[12px] font-medium text-ink-secondary">
            Headline
          </label>
          <input
            id="ann-title"
            className="field"
            value={title}
            maxLength={200}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Counselling is now available on weekends"
          />
        </div>

        <div>
          <label htmlFor="ann-body" className="mb-1.5 block text-[12px] font-medium text-ink-secondary">
            The rest of it
          </label>
          <textarea
            id="ann-body"
            rows={6}
            className="field resize-y"
            value={content}
            maxLength={10000}
            onChange={(event) => setContent(event.target.value)}
            placeholder="Written the way you would say it. Everybody reads this."
          />
        </div>
      </div>

      {error && (
        <p role="alert" className="mt-3 rounded-md border border-danger/40 bg-danger/10 px-3 py-2 text-[12.5px] text-ink-secondary">
          {error}
        </p>
      )}
      {done && (
        <p className="mt-3 text-[12.5px] text-success">
          Sent. It is on the notifications screen and on every device.
        </p>
      )}

      <button
        type="button"
        onClick={publish}
        disabled={busy || !title.trim()}
        className="btn-primary mt-4 w-full"
      >
        <Megaphone className="h-4 w-4" />
        {busy ? 'Sending…' : 'Announce it'}
      </button>
    </Card>
  );
}
