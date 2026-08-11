'use client';

import { useEffect, useState } from 'react';
import { Clock, MessageSquare, Send, Trash2, Video } from 'lucide-react';

import {
  AsyncSection,
  Card,
  EmptyState,
  PageHeader,
  timeAgo,
  useApi,
} from '@/components/app/ui';
import { COUNSELLING, upiIntent } from '@/content/counselling';
import { api, type Paged } from '@/lib/api';
import { notificationsChanged } from '@/lib/notify-bus';
import { GENDERS, ageProblem, phoneProblem } from '@/lib/validate';

/**
 * Counselling.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * The two-hour purge is the feature
 *
 * The whole transcript is destroyed two hours after the session ends. The
 * deadline is stamped by the server, not by this browser, and a MongoDB expiry
 * index does the deleting whether or not anybody opens the app again — so it is
 * a property of the data rather than a promise this client keeps.
 *
 * The countdown shown here is derived from `purgeAfter` on the session. It is
 * for reassurance; it does not cause the deletion.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * Roles are the server's
 *
 * `POST /messages` takes text and nothing else. Whether a message is filed as
 * `member` or `admin` is derived from the verified token, so this client cannot
 * label its own message as coming from a counsellor.
 */

type Session = {
  _id: string;
  name?: string;
  concern?: string;
  status: string;
  mode?: string;
  meetLink?: string;
  amount?: number;
  purgeAfter?: string | null;
  lastMessagePreview?: string;
  createdAt: string;
};

type Message = {
  _id: string;
  sender: 'member' | 'admin' | 'system';
  kind?: string;
  text: string;
  createdAt: string;
};

const STATUS_LABEL: Record<string, string> = {
  awaiting_payment: 'Awaiting payment',
  payment_submitted: 'Payment being verified',
  approved: 'Approved — choose a format',
  meet_requested: 'Call requested',
  active: 'Session live',
  ended: 'Ended',
  rejected: 'Payment not verified',
};

export default function CounsellingPage() {
  const [openId, setOpenId] = useState<string | null>(null);
  const [intake, setIntake] = useState(false);

  const sessions = useApi(
    () =>
      api.get<Paged<Session, 'sessions'>>('/api/counselling/sessions', {
        limit: 20,
      }),
    []
  );

  if (openId) {
    return (
      <Chat
        sessionId={openId}
        onBack={async () => {
          setOpenId(null);
          await sessions.reload();
        }}
      />
    );
  }

  return (
    <>
      <PageHeader
        title="Counselling"
        subtitle="A private session with a real counsellor. The whole transcript is destroyed two hours after it ends."
        action={
          <button
            type="button"
            onClick={() => setIntake((value) => !value)}
            className={intake ? 'btn-ghost !py-2.5' : 'btn-primary !py-2.5'}
          >
            {intake ? 'Cancel' : 'Book a session'}
          </button>
        }
      />

      {intake && (
        <Intake
          onDone={async () => {
            setIntake(false);
            await sessions.reload();
          }}
        />
      )}

      <AsyncSection state={sessions}>
        {(data) =>
          data.sessions.length === 0 ? (
            <EmptyState
              title="No sessions yet"
              body="A thirty-minute conversation with a counsellor, by chat or video. Two hours after it ends, the entire transcript is deleted — not archived."
              action={
                <button
                  type="button"
                  onClick={() => setIntake(true)}
                  className="btn-primary"
                >
                  Book one
                </button>
              }
            />
          ) : (
            <div className="space-y-3">
              {data.sessions.map((session) => (
                <button
                  key={session._id}
                  type="button"
                  onClick={() => setOpenId(session._id)}
                  className="glass glass-hover block w-full p-5 text-left"
                >
                  <div className="mb-1.5 flex flex-wrap items-center gap-2">
                    <span className="rounded-pill bg-primary/20 px-2.5 py-0.5 text-[10px] font-semibold text-primary-light">
                      {STATUS_LABEL[session.status] ?? session.status}
                    </span>
                    {session.purgeAfter && (
                      <span className="inline-flex items-center gap-1 rounded-pill bg-accent/15 px-2.5 py-0.5 text-[10px] font-semibold text-accent">
                        <Clock className="h-3 w-3" />
                        {purgeCountdown(session.purgeAfter)}
                      </span>
                    )}
                  </div>

                  <p className="text-[14.5px] font-semibold text-ink-primary">
                    {session.concern || 'Counselling session'}
                  </p>
                  {session.lastMessagePreview && (
                    <p className="mt-1 line-clamp-1 text-[12.5px] text-ink-secondary">
                      {session.lastMessagePreview}
                    </p>
                  )}
                  <p className="mt-2 text-[11px] text-ink-muted">
                    Opened {timeAgo(session.createdAt)}
                  </p>
                </button>
              ))}
            </div>
          )
        }
      </AsyncSection>

      <p className="mt-8 text-center text-[11.5px] leading-relaxed text-ink-muted">
        This is a conversation for support and perspective, not clinical
        treatment. If you are in danger, call Tele-MANAS on 14416.
      </p>
    </>
  );
}

/**
 * Pay, then say what you paid.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * The step the web did not have
 *
 * A session opens in `awaiting_payment`, and the only way out of it is
 * `POST /sessions/:id/payment`. The app has had this screen from the
 * beginning; the website had none, so a member could book a session on the web
 * and then sit in a chat that would never open, with nothing on screen
 * explaining what was missing. It was not that the payment was skipped — it was
 * that there was no way to make it.
 *
 * Verification is by hand, deliberately: a person reads a bank statement. That
 * is slower than a payment gateway and it is what keeps the fee at ₹299 without
 * a gateway's cut, and it is why the transaction reference is asked for rather
 * than inferred.
 */
function PaymentStep({
  sessionId,
  amount,
  onPaid,
}: {
  sessionId: string;
  amount: number;
  onPaid: () => Promise<void>;
}) {
  const [mode, setMode] = useState(PAYMENT_MODES[0]);
  const [reference, setReference] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  async function submit() {
    const ref = reference.trim();
    if (!ref) {
      setError('The transaction reference is what we match against the bank.');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await api.post(`/api/counselling/sessions/${sessionId}/payment`, {
        paymentMode: mode,
        transactionId: ref,
      });
      await onPaid();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not send that.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="glass mb-4 overflow-hidden">
      <div className="border-b border-hairline px-5 py-4">
        <p className="text-[14px] font-semibold text-ink-primary">
          Step 1 — pay ₹{amount}
        </p>
        <p className="mt-1 text-[12.5px] leading-relaxed text-ink-secondary">
          A {COUNSELLING.sessionMinutes}-minute session, by chat or video. Pay
          to the UPI id below from any app.
        </p>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <code className="rounded-md border border-hairline bg-bg-dark/60 px-3 py-2 text-[13px] text-ink-primary">
            {COUNSELLING.upiId}
          </code>
          <button
            type="button"
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(COUNSELLING.upiId);
                setCopied(true);
                window.setTimeout(() => setCopied(false), 2000);
              } catch {
                // Clipboard is blocked in some browsers without a gesture
                // policy. The id is on screen and selectable either way.
              }
            }}
            className="btn-ghost !px-4 !py-2 text-[12.5px]"
          >
            {copied ? 'Copied' : 'Copy'}
          </button>

          {/* Only useful where something can handle `upi://` — a phone. On a
              desktop it would open nothing, so it says so rather than
              pretending. */}
          <a href={upiIntent(amount)} className="btn-primary !px-4 !py-2 text-[12.5px]">
            Open a UPI app
          </a>
        </div>
      </div>

      <div className="px-5 py-4">
        <p className="text-[14px] font-semibold text-ink-primary">
          Step 2 — tell us what you paid
        </p>
        <p className="mt-1 text-[12.5px] leading-relaxed text-ink-secondary">
          We match this against the bank by hand, which is why it is asked for.
        </p>

        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-[12px] font-medium text-ink-secondary">
              Payment mode
            </label>
            <select
              className="field"
              value={mode}
              onChange={(event) => setMode(event.target.value)}
            >
              {PAYMENT_MODES.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="counselling-ref"
              className="mb-1.5 block text-[12px] font-medium text-ink-secondary"
            >
              Transaction ID / UTR<span className="ml-0.5 text-danger">*</span>
            </label>
            <input
              id="counselling-ref"
              className={`field ${error ? '!border-danger' : ''}`}
              value={reference}
              onChange={(event) => {
                setReference(event.target.value);
                setError(null);
              }}
              placeholder="e.g. 431298765432"
            />
          </div>
        </div>

        {error && (
          <p role="alert" className="mt-2 text-[12px] text-danger">
            {error}
          </p>
        )}

        <button
          type="button"
          onClick={submit}
          disabled={busy}
          className="btn-primary mt-4 w-full"
        >
          {busy ? 'Sending…' : 'I have paid'}
        </button>
      </div>
    </div>
  );
}

function purgeCountdown(purgeAfter: string): string {
  const left = new Date(purgeAfter).getTime() - Date.now();
  if (left <= 0) return 'deleting now';
  const minutes = Math.round(left / 60000);
  if (minutes < 60) return `deleted in ${minutes}m`;
  return `deleted in ${Math.round(minutes / 60)}h`;
}

function Chat({
  sessionId,
  onBack,
}: {
  sessionId: string;
  onBack: () => void;
}) {
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [choosing, setChoosing] = useState<'chat' | 'meet' | null>(null);

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

  /**
   * Opening the chat is reading the reply.
   *
   * The `replies` feed is one of the four the header badge counts — a session
   * whose last message came from the counsellor, after the member last looked.
   * Nothing on the website marked it seen, so a member read their counsellor's
   * message and still carried the badge for it, indefinitely, with no way to
   * clear it: the notifications screen does not list counselling replies,
   * because they live in the transcript rather than in a feed.
   */
  useEffect(() => {
    api
      .post('/api/notifications/seen/replies')
      .then(notificationsChanged)
      .catch(() => {});
  }, [sessionId]);

  async function send() {
    const text = draft.trim();
    if (!text) return;
    setSending(true);
    try {
      await api.post(`/api/counselling/sessions/${sessionId}/messages`, {
        text,
        kind: 'text',
      });
      setDraft('');
      await messages.reload();
    } finally {
      setSending(false);
    }
  }

  /**
   * Chat, or a video call.
   *
   * This screen said "Approved — choose a format" and then offered no way to
   * choose one, so a member whose payment had cleared on the web could go no
   * further: the chat is not open until a format is picked, and picking it was
   * only possible on Android.
   *
   * Choosing chat opens the room immediately. Choosing a call cannot, because a
   * call needs somebody on the other side of it — it asks, and the counsellor
   * answers with a room.
   */
  async function chooseMode(mode: 'chat' | 'meet') {
    setChoosing(mode);
    try {
      await api.post(`/api/counselling/sessions/${sessionId}/mode`, { mode });
      await Promise.all([session.reload(), messages.reload()]);
    } catch {
      alert('Could not do that just now. Try again in a moment.');
    } finally {
      setChoosing(null);
    }
  }

  async function destroy() {
    if (
      !confirm(
        'Delete this session and its whole transcript now? This cannot be undone.'
      )
    ) {
      return;
    }
    await api.delete(`/api/counselling/sessions/${sessionId}`);
    onBack();
  }

  const status = session.data?.session.status;
  const ended = status === 'ended';

  return (
    <>
      <div className="mb-5 flex items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          className="text-[12.5px] text-ink-muted transition hover:text-ink-primary"
        >
          ← Sessions
        </button>
        <button
          type="button"
          onClick={destroy}
          className="ml-auto inline-flex items-center gap-1.5 text-[12px] text-ink-muted transition hover:text-danger"
        >
          <Trash2 className="h-3.5 w-3.5" /> Delete now
        </button>
      </div>

      {session.data?.session.purgeAfter && (
        <div className="mb-4 rounded-md border border-accent/30 bg-accent/10 px-4 py-2.5 text-center">
          <p className="text-[12px] text-accent">
            This conversation is {purgeCountdown(session.data.session.purgeAfter)}.
          </p>
        </div>
      )}

      {status === 'awaiting_payment' && (
        <PaymentStep
          sessionId={sessionId}
          amount={session.data?.session.amount || COUNSELLING.fee}
          onPaid={async () => {
            await Promise.all([session.reload(), messages.reload()]);
          }}
        />
      )}

      {/* Paid, and now waiting on a person.
          The app shows this state; the web showed nothing at all, so a member
          who had just sent money had no indication that anything was
          happening — which is the worst possible moment for silence. */}
      {status === 'payment_submitted' && (
        <div className="glass mb-4 flex items-start gap-3 border-accent/30 p-4">
          <Clock className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
          <p className="text-[13px] leading-relaxed text-ink-secondary">
            <span className="font-semibold text-ink-primary">
              Your payment details are with us.
            </span>{' '}
            We check them by hand — usually within a few minutes during working
            hours. This chat opens the moment it is confirmed, and you can close
            the tab; nothing is lost.
          </p>
        </div>
      )}

      {status === 'rejected' && (
        <div className="glass mb-4 flex items-start gap-3 border-danger/30 p-4">
          <p className="text-[13px] leading-relaxed text-ink-secondary">
            <span className="font-semibold text-ink-primary">
              This request was not approved.
            </span>{' '}
            If you believe the payment went through, reply below with the
            transaction reference and somebody will look again.
          </p>
        </div>
      )}

      {status === 'approved' && (
        <div className="glass mb-4 p-5">
          <p className="text-[14px] font-semibold text-ink-primary">
            Your payment is verified. How would you like to talk?
          </p>
          <p className="mt-1 text-[12.5px] leading-relaxed text-ink-secondary">
            Both are thirty minutes with the same counsellor. Chat starts the
            moment you pick it; a call has to be arranged, so you will be sent a
            room.
          </p>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => chooseMode('chat')}
              disabled={choosing !== null}
              className="glass glass-hover flex items-start gap-3 p-4 text-left disabled:opacity-50"
            >
              <MessageSquare className="mt-0.5 h-4 w-4 shrink-0 text-primary-light" />
              <span>
                <span className="block text-[13.5px] font-semibold text-ink-primary">
                  {choosing === 'chat' ? 'Opening…' : 'Chat'}
                </span>
                <span className="mt-0.5 block text-[12px] leading-relaxed text-ink-muted">
                  Type instead of speaking. Starts now, and nobody hears you.
                </span>
              </span>
            </button>

            <button
              type="button"
              onClick={() => chooseMode('meet')}
              disabled={choosing !== null}
              className="glass glass-hover flex items-start gap-3 p-4 text-left disabled:opacity-50"
            >
              <Video className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
              <span>
                <span className="block text-[13.5px] font-semibold text-ink-primary">
                  {choosing === 'meet' ? 'Requesting…' : 'Video call'}
                </span>
                <span className="mt-0.5 block text-[12px] leading-relaxed text-ink-muted">
                  Thirty minutes on Google Meet. You will get the link here.
                </span>
              </span>
            </button>
          </div>
        </div>
      )}

      {/* Asked for, not yet arranged. Saying so is the difference between
          waiting and wondering whether the request went anywhere. */}
      {status === 'meet_requested' && !session.data?.session.meetLink && (
        <div className="glass mb-4 flex items-start gap-3 border-accent/30 p-4">
          <Clock className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
          <p className="text-[13px] leading-relaxed text-ink-secondary">
            <span className="font-semibold text-ink-primary">
              Your call has been requested.
            </span>{' '}
            The counsellor will send a Google Meet link here, usually within a
            few hours. You can keep writing below in the meantime — they will
            read it before you speak.
          </p>
        </div>
      )}

      {session.data?.session.meetLink && (
        <div className="glass mb-4 overflow-hidden">
          <div className="border-b border-hairline bg-gradient-primary/10 px-5 py-4">
            <div className="flex items-center gap-2.5">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-primary/20 text-primary-light">
                <Video className="h-4 w-4" />
              </span>
              <div>
                <p className="text-[14px] font-semibold text-ink-primary">
                  Your video call is ready
                </p>
                <p className="text-[11.5px] text-ink-muted">
                  Google Meet · 30 minutes
                </p>
              </div>
            </div>
          </div>

          <div className="px-5 py-4">
            <ul className="space-y-1.5 text-[12.5px] leading-relaxed text-ink-secondary">
              <li>• Somewhere you will not be overheard, if you can manage it.</li>
              <li>• Headphones make a difference, both ways.</li>
              <li>• It opens in Google Meet — no account or install needed.</li>
            </ul>

            <a
              href={session.data.session.meetLink}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary mt-4 w-full"
            >
              Join the call
            </a>

            <p className="mt-2.5 text-center text-[11px] text-ink-muted">
              The link stays here for the whole session.
            </p>
          </div>
        </div>
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
                  className={`max-w-[85%] rounded-lg px-4 py-2.5 ${
                    message.sender === 'member'
                      ? 'ml-auto bg-gradient-primary text-white'
                      : 'bg-bg-card text-ink-secondary'
                  }`}
                >
                  <p className="whitespace-pre-wrap text-[13.5px] leading-relaxed">
                    {message.text}
                  </p>
                  <p
                    className={`mt-1 text-[10px] ${
                      message.sender === 'member'
                        ? 'text-white/60'
                        : 'text-ink-muted'
                    }`}
                  >
                    {timeAgo(message.createdAt)}
                  </p>
                </div>
              )
            )}
          </div>
        )}
      </AsyncSection>

      <div className="mt-5">
        {ended ? (
          <p className="rounded-md border border-hairline bg-bg-card/40 px-4 py-3 text-center text-[12.5px] text-ink-muted">
            This session has ended.
          </p>
        ) : (
          <div className="flex gap-2">
            <input
              className="field flex-1"
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder="Write a message…"
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
              disabled={sending || !draft.trim()}
              className="btn-primary !px-4"
              aria-label="Send"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </>
  );
}

/**
 * How the money arrived, in the member's words.
 *
 * A free-text box here would produce "gpay", "G Pay", "google pay" and "paid"
 * across four sessions, and the operator matching a bank statement is reading
 * these one at a time. Mirrors the list in the app.
 */
const PAYMENT_MODES = [
  'UPI — Google Pay',
  'UPI — PhonePe',
  'UPI — Paytm',
  'UPI — other',
  'Bank transfer',
  'Other',
];

const CONCERNS = [
  'Anxiety or constant worry',
  'Sadness or low mood',
  'Relationship trouble',
  'Family conflict',
  'Work or study stress',
  'Loneliness',
  'Sleep problems',
  'Anger',
  'Grief or loss',
  'Something else',
];

function Intake({ onDone }: { onDone: () => void }) {
  const [form, setForm] = useState({
    name: '',
    age: '',
    gender: '',
    phone: '',
    concern: CONCERNS[0],
    language: 'Hinglish',
    details: '',
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [invalid, setInvalid] = useState<Record<string, string>>({});

  const set = (key: keyof typeof form) => (value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
    // The message goes the moment they start fixing it, rather than surviving
    // until the next submit and reading as though the correction did not count.
    setInvalid((current) => {
      if (!current[key]) return current;
      const next = { ...current };
      delete next[key];
      return next;
    });
  };

  /**
   * What has to be filled in, and why each one.
   *
   * The API accepts every field as optional and defaults it to an empty string,
   * which is right for an API — a half-filled session is better than a lost
   * one. It was wrong for this form, which submitted a blank intake happily: a
   * counsellor then opened a request with no name, no age and no phone number
   * and had nothing to work with, and no way to reach somebody whose
   * connection dropped mid-session.
   *
   * The app validates these. This did not, which is the whole of the
   * difference.
   */
  function problems(): Record<string, string> {
    const found: Record<string, string> = {};
    if (!form.name.trim()) found.name = 'A first name is enough.';

    const age = ageProblem(form.age);
    if (age) found.age = age;

    if (!form.gender.trim()) found.gender = 'Pick one.';

    // The one field that has to be usable: it is how a counsellor reaches
    // somebody whose call drops. Checked against the mobile numbering plan
    // rather than by counting characters — `1234567890` is ten digits and is
    // not a number anybody can be called on. See lib/validate.ts.
    const phone = phoneProblem(form.phone);
    if (phone) found.phone = phone;

    return found;
  }

  async function submit() {
    const found = problems();
    setInvalid(found);
    if (Object.keys(found).length) {
      setError('Please complete the highlighted fields.');
      return;
    }

    setBusy(true);
    setError(null);
    try {
      await api.post('/api/counselling/sessions', form);
      onDone();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not open a session.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card className="mb-5">
      {/* Six questions, not thirty. Somebody reaching for help at 1am abandons
          a long form, and none of the fields past these change what the
          counsellor does first. */}
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Your name" value={form.name} onChange={set('name')} required error={invalid.name} />
        <Field label="Age" value={form.age} onChange={set('age')} required error={invalid.age} inputMode="numeric" />

        {/* A list, not a text box. A counsellor needs to know how to address
            somebody, and free text produced "M", "male", "Male ", "m" and one
            person's entire sentence about why the question is beside the
            point — which was fair, and is why declining is one of the three
            answers rather than a blank field. */}
        <SelectField
          label="Gender"
          value={form.gender}
          onChange={set('gender')}
          required
          error={invalid.gender}
          placeholder="Choose one"
          options={GENDERS.map((g) => ({ value: g.value, label: g.label }))}
        />

        <Field label="Phone" value={form.phone} onChange={set('phone')} required error={invalid.phone} inputMode="tel" placeholder="98765 43210" />

        <div>
          <label className="mb-1.5 block text-[12px] font-medium text-ink-secondary">
            What is it about?
          </label>
          <select
            className="field"
            value={form.concern}
            onChange={(event) => set('concern')(event.target.value)}
          >
            {CONCERNS.map((concern) => (
              <option key={concern} value={concern}>
                {concern}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1.5 block text-[12px] font-medium text-ink-secondary">
            Language
          </label>
          <select
            className="field"
            value={form.language}
            onChange={(event) => set('language')(event.target.value)}
          >
            {['Hindi', 'English', 'Hinglish'].map((language) => (
              <option key={language} value={language}>
                {language}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-3">
        <label className="mb-1.5 block text-[12px] font-medium text-ink-secondary">
          Anything you want to say first (optional)
        </label>
        <textarea
          rows={3}
          className="field resize-y"
          value={form.details}
          maxLength={5000}
          onChange={(event) => set('details')(event.target.value)}
        />
      </div>

      {error && (
        <p role="alert" className="mt-3 rounded-md border border-danger/40 bg-danger/10 px-3 py-2 text-[12.5px] text-ink-secondary">
          {error}
        </p>
      )}

      <button
        type="button"
        onClick={submit}
        disabled={busy}
        className="btn-primary mt-4 w-full"
      >
        {busy ? 'Opening…' : 'Open a session'}
      </button>
    </Card>
  );
}

function Field({
  label,
  value,
  onChange,
  required = false,
  error,
  inputMode,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  error?: string;
  inputMode?: 'numeric' | 'tel';
  placeholder?: string;
}) {
  const id = `intake-${label.replace(/\W+/g, '-').toLowerCase()}`;
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-[12px] font-medium text-ink-secondary">
        {label}
        {required && <span className="ml-0.5 text-danger">*</span>}
      </label>
      <input
        id={id}
        className={`field ${error ? '!border-danger' : ''}`}
        value={value}
        inputMode={inputMode}
        placeholder={placeholder}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        onChange={(event) => onChange(event.target.value)}
      />
      {error && (
        <p id={`${id}-error`} className="mt-1 text-[11.5px] text-danger">
          {error}
        </p>
      )}
    </div>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
  required = false,
  error,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  required?: boolean;
  error?: string;
  placeholder?: string;
}) {
  const id = `intake-${label.replace(/\W+/g, '-').toLowerCase()}`;
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-[12px] font-medium text-ink-secondary">
        {label}
        {required && <span className="ml-0.5 text-danger">*</span>}
      </label>
      <select
        id={id}
        className={`field ${error ? '!border-danger' : ''}`}
        value={value}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        onChange={(event) => onChange(event.target.value)}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <p id={`${id}-error`} className="mt-1 text-[11.5px] text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
