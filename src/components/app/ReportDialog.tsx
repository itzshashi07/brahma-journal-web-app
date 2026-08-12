'use client';

import { useState } from 'react';
import { Flag } from 'lucide-react';

import { Modal, TextChipGroup } from './ui';
import { api } from '@/lib/api';

/**
 * Reporting something a human should look at.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * What the flag used to do
 *
 * It posted immediately, with `reason: 'Reported from the board'`, and said so
 * in a `window.alert`. Three things were wrong with that, and the third is the
 * one that matters.
 *
 * It filed a report a moderator could not act on: "reported from the board" is
 * not a complaint, it is a restatement of where the button was. It fired on a
 * single click with no confirmation, so a mis-tap on a phone became a report.
 * And — the real one — the API raises an **urgent** alert, pushed to the
 * operator with "Someone may be in danger" on the lock screen, when and only
 * when the reason mentions self-harm. See `routes/support.js`. With a hard-coded
 * reason string that path could never fire from this website, so a member who
 * spotted somebody in trouble on the web had no way to say so, while the same
 * member on Android had it two taps away.
 *
 * So this is `ModerationService.reasons` from the app, in a dialog, with the
 * self-harm option first — because that is the most valuable message this
 * product can receive and it must never be more than two taps.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * The excerpt
 *
 * A copy of the reported text goes with the report on purpose: the content may
 * be deleted — by its author, by the thirty-day sweep, or by the reporter hiding
 * it — before anybody reads the queue, and a report that says only "post xyz was
 * abusive" is unactionable. Trimmed to the 1000 characters the API accepts.
 */

/**
 * Deliberately short. A long list makes people abandon the form, and every one
 * of these routes to the same human anyway.
 *
 * Ordered differently from the app's list on purpose: self-harm leads here
 * rather than sitting second, because a web report has no bottom-sheet momentum
 * carrying the eye down the options.
 */
const REASONS = [
  'Self-harm or suicide risk',
  'Harassment or bullying',
  'Hate speech',
  'Sexual or explicit content',
  'Spam or scam',
  'Something else',
];

export type ReportTarget = {
  /** 'thought' | 'reply' | 'blog' | 'comment' */
  contentKind: string;
  contentId: string;
  /** The thread a reported reply belongs to, so a moderator opens the
   *  conversation rather than a fragment of it. */
  parentId?: string | null;
  /** Where authorship is known. Absent for the anonymous board, whose whole
   *  point is that it is not on the post. */
  reportedUid?: string | null;
  excerpt?: string;
};

export function ReportDialog({
  target,
  onClose,
  onReported,
}: {
  target: ReportTarget | null;
  onClose: () => void;
  /** Called after a successful report, so the caller can hide the post too. */
  onReported?: () => void;
}) {
  const [reason, setReason] = useState<string[]>([]);
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const chosen = reason[0];
  const urgent = chosen === 'Self-harm or suicide risk';

  function close() {
    setReason([]);
    setNote('');
    setError(null);
    setDone(false);
    onClose();
  }

  async function send() {
    if (!target || !chosen) return;

    setBusy(true);
    setError(null);
    try {
      await api.post('/api/support/reports', {
        contentKind: target.contentKind,
        contentId: target.contentId,
        ...(target.parentId ? { parentId: target.parentId } : {}),
        ...(target.reportedUid ? { reportedUid: target.reportedUid } : {}),
        reason: chosen,
        note: note.trim(),
        excerpt: (target.excerpt ?? '').slice(0, 1000),
      });
      setDone(true);
      onReported?.();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Could not send that report.'
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal open={target !== null} onClose={close} label="Report this">
      {done ? (
        <>
          <h2 className="text-[17px] font-semibold text-ink-primary">
            Sent. A person will read it.
          </h2>
          <p className="mt-2 text-[13px] leading-relaxed text-ink-secondary">
            {urgent
              ? 'Flagged as urgent, so it goes to the top of the queue. Thank you — that is the most useful thing anybody can do here.'
              : 'Reports go to a moderator, not to an automated system. You will not hear back about this one, and that is deliberate: telling you the outcome would tell you who wrote it.'}
          </p>
          <button type="button" onClick={close} className="btn-primary mt-5 w-full">
            Done
          </button>
        </>
      ) : (
        <>
          <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-ink-muted">
            <Flag className="h-3.5 w-3.5" /> Report
          </p>
          <h2 className="mt-2 text-[17px] font-semibold text-ink-primary">
            What is wrong with this?
          </h2>
          <p className="mt-1.5 text-[12.5px] leading-relaxed text-ink-secondary">
            A human reads every one of these. Pick the closest thing — none of
            them is a wrong answer.
          </p>

          <div className="mt-4">
            <TextChipGroup
              options={REASONS}
              selected={reason}
              onChange={setReason}
              single
              ariaLabel="Reason for reporting"
            />
          </div>

          {urgent && (
            <p className="mt-3 rounded-md border border-accent/40 bg-accent/10 px-3 py-2.5 text-[12px] leading-relaxed text-ink-secondary">
              This one is pushed to a moderator straight away rather than
              queued. If you think someone is in immediate danger, please also
              contact emergency services where they are — this app cannot.
            </p>
          )}

          <label
            htmlFor="report-note"
            className="mb-1.5 mt-4 block text-[12px] font-medium text-ink-secondary"
          >
            Anything else worth knowing?{' '}
            <span className="font-normal text-ink-muted">(optional)</span>
          </label>
          <textarea
            id="report-note"
            rows={3}
            className="field resize-y"
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder="Context a moderator would not get from the post itself."
          />

          {error && (
            <p
              role="alert"
              className="mt-3 rounded-md border border-danger/40 bg-danger/10 px-3 py-2 text-[12.5px] text-ink-secondary"
            >
              {error}
            </p>
          )}

          <div className="mt-5 flex gap-2">
            <button type="button" onClick={close} className="btn-ghost flex-1 !py-2.5">
              Cancel
            </button>
            <button
              type="button"
              onClick={send}
              disabled={busy || !chosen}
              className="btn-primary flex-[2] !py-2.5 disabled:opacity-50"
            >
              {busy ? 'Sending…' : 'Send report'}
            </button>
          </div>
        </>
      )}
    </Modal>
  );
}

/**
 * Posts this member has chosen not to see again.
 *
 * Local, in `localStorage`, and that is the correct home for it — the same
 * reasoning as `ModerationService.hideThought` in the app. The alternative, a
 * server record listing the reflections you have hidden, would be a per-member
 * trail of which anonymous posts you cared enough about to suppress, which is
 * exactly the sort of record this feature exists to avoid leaving.
 *
 * Blocking is different and *is* server-side: it applies to named content whose
 * author is known, has to survive a new device, and the board endpoint filters
 * on it before answering. See `/api/community/blocks`.
 */
const HIDDEN_KEY = 'moderation_hidden_thoughts';

export function hiddenThoughtIds(): Set<string> {
  if (typeof window === 'undefined') return new Set();
  try {
    const raw = window.localStorage.getItem(HIDDEN_KEY);
    return new Set(raw ? (JSON.parse(raw) as string[]) : []);
  } catch {
    return new Set();
  }
}

export function hideThought(id: string): void {
  if (typeof window === 'undefined') return;
  try {
    const next = hiddenThoughtIds();
    next.add(id);
    window.localStorage.setItem(HIDDEN_KEY, JSON.stringify([...next]));
  } catch {
    // A full or disabled storage means the post reappears on the next load,
    // which is recoverable. Failing the report over it would not be.
  }
}
