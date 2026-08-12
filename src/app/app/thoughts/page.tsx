'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { EyeOff, Flag, MessageCircle, Send, ShieldOff, Trash2 } from 'lucide-react';

import {
  AsyncSection,
  Card,
  EmptyState,
  PageHeader,
  timeAgo,
  useApi,
} from '@/components/app/ui';
import {
  ReportDialog,
  hiddenThoughtIds,
  hideThought,
  type ReportTarget,
} from '@/components/app/ReportDialog';
import { api, type Paged } from '@/lib/api';

/**
 * The anonymous reflections board.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * What this screen deliberately cannot do
 *
 * It cannot tell you who wrote anything, including which posts are yours. That
 * is not an omission — the API never sends an author with a reflection, because
 * authorship lives in a collection no member account can read.
 *
 * The one thing this client knows is its own watchlist: a private map of thread
 * ids it is following. That is how "delete my own reflection" is possible at
 * all, and the server independently checks authorship before allowing the
 * delete, so a client that lied about its watchlist would get a 403.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * The display name is chosen per post
 *
 * A stable pseudonym would defeat the point: three posts under "Night Thinker"
 * are a profile, and a profile is something people can be recognised by. A name
 * is picked per post from a fixed list, and the list carries no religious or
 * cultural signal — it describes a manner, not a belief.
 */

type Reply = {
  id: string;
  content: string;
  anonymousName: string;
  anonymousColor: string;
  createdAt: string;
};

type Thought = {
  _id: string;
  content: string;
  anonymousName: string;
  anonymousColor: string;
  replies: Reply[];
  replyCount: number;
  createdAt: string;
  /**
   * Whether the person reading this wrote it.
   *
   * The board carries no author and the authorship map is admin-only, so this
   * is a question only the server can answer — and it answers it about the
   * caller and nobody else. It is what allows a delete button to exist at all;
   * the API checks authorship again before honouring the request, so a client
   * that lied about this gets a 403.
   */
  mine?: boolean;
};

const NAMES = [
  'Quiet Voice', 'Steady Hand', 'Night Thinker', 'Open Window',
  'Slow Reader', 'Kind Stranger', 'Second Thought', 'Long Walk',
  'Early Riser', 'Small Fire', 'Blue Hour', 'Calm Observer',
  'Deep Breath', 'Still Water', 'Soft Landing', 'Clear Sky',
  'Distant Light', 'Patient Sort', 'Warm Coat', 'Low Tide',
];

const COLORS = [
  '#8B5CF6', '#06B6D4', '#10B981', '#F59E0B', '#EF4444',
  '#EC4899', '#6366F1', '#84CC16', '#F97316', '#14B8A6',
];

const pick = <T,>(list: T[]): T =>
  list[Math.floor(Math.random() * list.length)];

export default function ThoughtsPage() {
  const [composing, setComposing] = useState(false);

  /**
   * What to report, and what this member has chosen not to see again.
   *
   * The dialog is owned by the page rather than by each card so that only one
   * can ever be open, and the hidden set is read once after mount — reading
   * `localStorage` during the render would differ between the server pass and
   * the client one and hydration would tear.
   */
  const [reporting, setReporting] = useState<ReportTarget | null>(null);
  const [hidden, setHidden] = useState<Set<string>>(new Set());

  useEffect(() => setHidden(hiddenThoughtIds()), []);

  const hide = useCallback((id: string) => {
    hideThought(id);
    setHidden((current) => new Set(current).add(id));
  }, []);

  const state = useApi(
    () =>
      api.get<Paged<Thought, 'thoughts'>>('/api/community/thoughts', {
        limit: 20,
      }),
    []
  );

  /**
   * Tell the server the feed has been seen.
   *
   * The server holds both the watchlist and the board, so it works out what
   * "caught up" means itself. The client used to send a count per thread, which
   * meant the answer depended on how fresh its copy of the board was — a reply
   * landing between the read and the write was marked seen without ever being
   * shown.
   */
  useEffect(() => {
    api.post('/api/community/watchlist/seen-all').catch(() => {});
    api.post('/api/notifications/seen/thought_replies').catch(() => {});
  }, []);

  return (
    <>
      <PageHeader
        title="Reflections"
        subtitle="No name, no photo, no handle. Say the thing you cannot say to anyone who knows you."
        action={
          <button
            type="button"
            onClick={() => setComposing((value) => !value)}
            className={composing ? 'btn-ghost !py-2.5' : 'btn-primary !py-2.5'}
          >
            {composing ? 'Close' : 'Say something'}
          </button>
        }
      />

      {composing && (
        <Composer
          onDone={async () => {
            setComposing(false);
            await state.reload();
          }}
        />
      )}

      <AsyncSection state={state}>
        {(data) => {
          // Hidden posts are filtered here rather than at the request, because
          // the list is local and the server has deliberately never been told
          // which ones they are.
          const visible = data.thoughts.filter(
            (thought) => !hidden.has(thought._id)
          );

          if (data.thoughts.length === 0) {
            return (
              <EmptyState
                title="The board is quiet"
                body="Be the first. Whatever it is, somebody here has been close to it — and nothing you post is attached to your account."
                action={
                  <button
                    type="button"
                    onClick={() => setComposing(true)}
                    className="btn-primary"
                  >
                    Post anonymously
                  </button>
                }
              />
            );
          }

          if (visible.length === 0) {
            return (
              <EmptyState
                title="Nothing left on this page"
                body="You have hidden everything currently on the board. New reflections will still appear."
              />
            );
          }

          return (
            <div className="space-y-3">
              {visible.map((thought) => (
                <ThoughtCard
                  key={thought._id}
                  thought={thought}
                  onReplied={state.reload}
                  onReport={setReporting}
                  onHide={hide}
                />
              ))}
            </div>
          );
        }}
      </AsyncSection>

      <p className="mt-8 text-center text-[11.5px] leading-relaxed text-ink-muted">
        Reflections are deleted thirty days after they are posted. An anonymous
        board should not become a permanent record of what people were
        struggling with a year ago.
      </p>

      <ReportDialog
        target={reporting}
        onClose={() => setReporting(null)}
        // Reporting something and then continuing to see it is the one outcome
        // nobody wants, so a report hides it too. The moderator still has the
        // excerpt, so hiding it locally costs the queue nothing.
        onReported={() => {
          if (reporting) hide(reporting.contentId);
        }}
      />
    </>
  );
}

function ThoughtCard({
  thought,
  onReplied,
  onReport,
  onHide,
}: {
  thought: Thought;
  onReplied: () => void;
  onReport: (target: ReportTarget) => void;
  onHide: (id: string) => void;
}) {
  const [deleting, setDeleting] = useState(false);
  const [open, setOpen] = useState(false);
  const [reply, setReply] = useState('');
  const [busy, setBusy] = useState(false);

  // Chosen once per card rather than per render, so a reply is not posted under
  // a name that changed while it was being typed.
  const identity = useMemo(
    () => ({ name: pick(NAMES), color: pick(COLORS) }),
    []
  );

  async function send() {
    const content = reply.trim();
    if (!content) return;

    setBusy(true);
    try {
      await api.post(`/api/community/thoughts/${thought._id}/replies`, {
        content,
        anonymousName: identity.name,
        anonymousColor: identity.color,
      });
      setReply('');
      onReplied();
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    // A reflection is deleted for everyone and cannot be recovered, and the
    // people in the thread lose the conversation with it. That is worth one
    // question.
    if (
      !confirm(
        'Delete this reflection? Any replies go with it, and this cannot be undone.'
      )
    ) {
      return;
    }

    setDeleting(true);
    try {
      await api.delete(`/api/community/thoughts/${thought._id}`);
      onReplied();
    } catch {
      alert('Could not delete that. Try again in a moment.');
      setDeleting(false);
    }
  }

  return (
    <Card>
      <div className="mb-2 flex items-center gap-2">
        <span
          className="h-6 w-6 rounded-full"
          style={{ backgroundColor: thought.anonymousColor }}
          aria-hidden="true"
        />
        <span className="text-[12px] font-semibold text-ink-secondary">
          {thought.anonymousName}
        </span>
        <span className="text-[11px] text-ink-muted">
          · {timeAgo(thought.createdAt)}
        </span>

        {/* Reporting and hiding are not offered on your own reflection — the
            same rule the app applies. Flagging yourself to a moderator is not a
            thing anybody means to do, and the delete button is the control that
            actually answers "I regret this". */}
        <div className="ml-auto flex items-center gap-3">
          {thought.mine ? (
            <button
              type="button"
              onClick={remove}
              disabled={deleting}
              className="text-ink-muted transition hover:text-danger disabled:opacity-50"
              title="Delete my reflection"
              aria-label="Delete my reflection"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={() => onHide(thought._id)}
                className="text-ink-muted transition hover:text-ink-primary"
                title="Hide this from my board"
                aria-label="Hide this reflection"
              >
                <EyeOff className="h-3.5 w-3.5" />
              </button>

              <button
                type="button"
                onClick={() =>
                  onReport({
                    contentKind: 'thought',
                    contentId: thought._id,
                    // No `reportedUid`: the board carries no author, and that is
                    // a promise this screen keeps rather than a gap to close.
                    excerpt: thought.content,
                  })
                }
                className="text-ink-muted transition hover:text-accent"
                title="Report this"
                aria-label="Report this reflection"
              >
                <Flag className="h-3.5 w-3.5" />
              </button>
            </>
          )}
        </div>
      </div>

      <p className="whitespace-pre-wrap text-[14px] leading-relaxed text-ink-primary">
        {thought.content}
      </p>

      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="mt-3 inline-flex items-center gap-1.5 text-[12px] text-ink-muted transition hover:text-primary-light"
      >
        <MessageCircle className="h-3.5 w-3.5" />
        {thought.replyCount === 0
          ? 'Be the first to reply'
          : `${thought.replyCount} ${thought.replyCount === 1 ? 'reply' : 'replies'}`}
      </button>

      {open && (
        <div className="mt-4 space-y-3 border-t border-hairline pt-4">
          {thought.replies.map((item) => (
            <div key={item.id} className="group flex gap-2.5">
              <span
                className="mt-0.5 h-5 w-5 shrink-0 rounded-full"
                style={{ backgroundColor: item.anonymousColor }}
                aria-hidden="true"
              />
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-semibold text-ink-secondary">
                  {item.anonymousName}
                  <span className="ml-1.5 font-normal text-ink-muted">
                    {timeAgo(item.createdAt)}
                  </span>
                </p>
                <p className="mt-0.5 whitespace-pre-wrap text-[13px] leading-relaxed text-ink-secondary">
                  {item.content}
                </p>
              </div>

              {/* A reply is the half of this board that a moderator could not
                  previously be told about at all — the flag only ever existed on
                  the parent post. `parentId` goes with it so the queue opens the
                  conversation rather than a fragment of it. */}
              <button
                type="button"
                onClick={() =>
                  onReport({
                    contentKind: 'reply',
                    contentId: item.id,
                    parentId: thought._id,
                    excerpt: item.content,
                  })
                }
                className="h-fit shrink-0 text-ink-muted opacity-60 transition hover:text-accent hover:opacity-100"
                title="Report this reply"
                aria-label="Report this reply"
              >
                <Flag className="h-3 w-3" />
              </button>
            </div>
          ))}

          <div className="flex gap-2">
            <input
              className="field flex-1"
              value={reply}
              onChange={(event) => setReply(event.target.value)}
              placeholder={`Reply as ${identity.name}…`}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && !event.shiftKey) {
                  event.preventDefault();
                  void send();
                }
              }}
            />
            <button
              type="button"
              onClick={send}
              disabled={busy || !reply.trim()}
              className="btn-primary !px-4"
              aria-label="Send reply"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </Card>
  );
}

function Composer({ onDone }: { onDone: () => void }) {
  const [content, setContent] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const identity = useMemo(
    () => ({ name: pick(NAMES), color: pick(COLORS) }),
    []
  );

  async function post() {
    const trimmed = content.trim();
    if (!trimmed) return;

    setBusy(true);
    setError(null);
    try {
      await api.post('/api/community/thoughts', {
        content: trimmed,
        anonymousName: identity.name,
        anonymousColor: identity.color,
      });
      onDone();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not post that.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card className="mb-5">
      <div className="mb-3 flex items-center gap-2">
        <span
          className="h-6 w-6 rounded-full"
          style={{ backgroundColor: identity.color }}
          aria-hidden="true"
        />
        <span className="text-[12px] font-semibold text-ink-secondary">
          Posting as {identity.name}
        </span>
      </div>

      <textarea
        rows={5}
        className="field resize-y"
        value={content}
        onChange={(event) => setContent(event.target.value)}
        placeholder="Nobody here knows who you are. What is actually going on?"
        maxLength={5000}
      />

      <div className="mt-2 flex items-start gap-2 text-[11.5px] leading-relaxed text-ink-muted">
        <ShieldOff className="mt-0.5 h-3.5 w-3.5 shrink-0" />
        <p>
          Your account is not attached to this post. Do not include your own
          contact details or anybody else&rsquo;s — the board is public to every
          member.
        </p>
      </div>

      {error && (
        <p
          role="alert"
          className="mt-3 rounded-md border border-danger/40 bg-danger/10 px-3 py-2 text-[12.5px] text-ink-secondary"
        >
          {error}
        </p>
      )}

      <button
        type="button"
        onClick={post}
        disabled={busy || !content.trim()}
        className="btn-primary mt-4 w-full"
      >
        {busy ? 'Posting…' : 'Post anonymously'}
      </button>
    </Card>
  );
}
