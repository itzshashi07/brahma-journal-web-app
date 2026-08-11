'use client';

import { useState } from 'react';
import { Plus, X } from 'lucide-react';

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

/**
 * The journal.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * The entry is a set of prompts, not a blank box
 *
 * Deliberately the same shape as the Flutter app's daily entry, and for the
 * same reason: a blank page at 11pm is a question somebody is too tired to
 * answer. What helps is being asked something specific and being allowed to
 * skip most of it — every field here is optional, and an entry with one line in
 * it counts as an entry for the streak.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * Paging
 *
 * `/api/entries` returns a page and an opaque cursor. The list starts at thirty
 * and loads more on demand — a member two years in has seven hundred entries,
 * each carrying a dozen long-form prose fields, and fetching all of them to
 * render a list of dates is several megabytes for nothing.
 */

type Entry = {
  _id: string;
  mood?: number;
  newHabit?: string;
  tinyStep?: string;
  badHabit?: string;
  triggerThought?: string;
  triggerResponse?: string;
  bestMoment?: string;
  sleepReflection?: string;
  habitsDone?: string[];
  createdAt: string;
};

const MOODS = [
  { value: 1, emoji: '😔', label: 'Heavy', color: 'bg-mood-verySad' },
  { value: 2, emoji: '🙁', label: 'Low', color: 'bg-mood-sad' },
  { value: 3, emoji: '😐', label: 'Flat', color: 'bg-mood-neutral' },
  { value: 4, emoji: '🙂', label: 'Alright', color: 'bg-mood-happy' },
  { value: 5, emoji: '😊', label: 'Good', color: 'bg-mood-veryHappy' },
];

export default function JournalPage() {
  const { refreshProfile } = useAuth();
  const [writing, setWriting] = useState(false);
  const [cursor, setCursor] = useState<string | null>(null);
  const [older, setOlder] = useState<Entry[]>([]);
  const [loadingMore, setLoadingMore] = useState(false);

  const state = useApi(
    () => api.get<Paged<Entry, 'entries'>>('/api/entries', { limit: 30 }),
    []
  );

  async function loadMore() {
    const next = cursor ?? state.data?.nextCursor;
    if (!next) return;

    setLoadingMore(true);
    try {
      const body = await api.get<Paged<Entry, 'entries'>>('/api/entries', {
        limit: 30,
        cursor: next,
      });
      setOlder((current) => [...current, ...body.entries]);
      setCursor(body.nextCursor);
    } finally {
      setLoadingMore(false);
    }
  }

  return (
    <>
      <PageHeader
        title="Your journal"
        subtitle="Only you can read this. Every field is optional — one line still counts."
        action={
          <button
            type="button"
            onClick={() => setWriting((value) => !value)}
            className={writing ? 'btn-ghost !py-2.5' : 'btn-primary !py-2.5'}
          >
            {writing ? (
              <>
                <X className="h-4 w-4" /> Close
              </>
            ) : (
              <>
                <Plus className="h-4 w-4" /> Write today
              </>
            )}
          </button>
        }
      />

      {writing && (
        <EntryComposer
          onDone={async () => {
            setWriting(false);
            setOlder([]);
            setCursor(null);
            await state.reload();
            await refreshProfile();
          }}
        />
      )}

      <AsyncSection state={state}>
        {(data) => {
          const entries = [...data.entries, ...older];

          if (entries.length === 0) {
            return (
              <EmptyState
                title="Nothing here yet"
                body="Your first entry can be one line about how today went. The pattern only shows up after a couple of weeks, so the point is starting rather than writing well."
                action={
                  <button
                    type="button"
                    onClick={() => setWriting(true)}
                    className="btn-primary"
                  >
                    Write the first one
                  </button>
                }
              />
            );
          }

          const hasMore = cursor !== null || (older.length === 0 && data.hasMore);

          return (
            <div className="space-y-3">
              {entries.map((entry) => (
                <EntryCard key={entry._id} entry={entry} />
              ))}

              {hasMore && (
                <button
                  type="button"
                  onClick={loadMore}
                  disabled={loadingMore}
                  className="btn-ghost w-full"
                >
                  {loadingMore ? 'Loading…' : 'Load older entries'}
                </button>
              )}
            </div>
          );
        }}
      </AsyncSection>
    </>
  );
}

function EntryCard({ entry }: { entry: Entry }) {
  const mood = MOODS.find((item) => item.value === entry.mood);

  const lines = [
    ['What pulled at you', entry.triggerThought],
    ['What you did about it', entry.triggerResponse],
    ['Best moment', entry.bestMoment],
    ['Tiny step', entry.tinyStep],
    ['Sleep', entry.sleepReflection],
  ].filter(([, value]) => Boolean(value)) as [string, string][];

  return (
    <Card>
      <div className="mb-3 flex items-center gap-3">
        {mood && (
          <span
            className={`flex h-9 w-9 items-center justify-center rounded-md text-base ${mood.color}`}
            title={mood.label}
          >
            {mood.emoji}
          </span>
        )}
        <div>
          <p className="text-[13px] font-medium text-ink-primary">
            {new Date(entry.createdAt).toLocaleDateString('en-IN', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
            })}
          </p>
          <p className="text-[11px] text-ink-muted">
            {timeAgo(entry.createdAt)}
            {mood ? ` · ${mood.label}` : ''}
          </p>
        </div>
      </div>

      {entry.habitsDone && entry.habitsDone.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-1.5">
          {entry.habitsDone.map((habit) => (
            <span key={habit} className="chip !py-0.5 text-[11px]">
              {habit}
            </span>
          ))}
        </div>
      )}

      {lines.length > 0 ? (
        <dl className="space-y-2.5">
          {lines.map(([label, value]) => (
            <div key={label}>
              <dt className="text-[10px] uppercase tracking-wide text-ink-muted">
                {label}
              </dt>
              <dd className="mt-0.5 whitespace-pre-wrap text-[13px] leading-relaxed text-ink-secondary">
                {value}
              </dd>
            </div>
          ))}
        </dl>
      ) : (
        <p className="text-[12.5px] italic text-ink-muted">
          Mood only — which is a complete entry.
        </p>
      )}
    </Card>
  );
}

function EntryComposer({ onDone }: { onDone: () => void }) {
  const [mood, setMood] = useState<number | null>(null);
  const [triggerThought, setTriggerThought] = useState('');
  const [triggerResponse, setTriggerResponse] = useState('');
  const [bestMoment, setBestMoment] = useState('');
  const [tinyStep, setTinyStep] = useState('');
  const [habits, setHabits] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save() {
    setBusy(true);
    setError(null);

    try {
      // Only fields with something in them are sent. The API validates each
      // against a schema; sending empty strings would store empty strings and
      // make every entry look half-filled when it is read back.
      const body: Record<string, unknown> = {};
      if (mood) body.mood = mood;
      if (triggerThought.trim()) body.triggerThought = triggerThought.trim();
      if (triggerResponse.trim()) body.triggerResponse = triggerResponse.trim();
      if (bestMoment.trim()) body.bestMoment = bestMoment.trim();
      if (tinyStep.trim()) body.tinyStep = tinyStep.trim();

      const done = habits
        .split(',')
        .map((habit) => habit.trim())
        .filter(Boolean);
      if (done.length) body.habitsDone = done;

      if (Object.keys(body).length === 0) {
        setError('Add at least a mood or one line.');
        setBusy(false);
        return;
      }

      await api.post('/api/entries', body);
      onDone();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save that.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card className="mb-5">
      <p className="mb-3 text-[11px] uppercase tracking-wide text-ink-muted">
        How did today feel?
      </p>
      <div className="mb-5 flex gap-2">
        {MOODS.map((item) => (
          <button
            key={item.value}
            type="button"
            onClick={() => setMood(mood === item.value ? null : item.value)}
            aria-pressed={mood === item.value}
            className={`flex h-12 flex-1 flex-col items-center justify-center gap-0.5 rounded-md text-lg transition ${
              mood === item.value
                ? `${item.color} shadow-soft`
                : 'border border-hairline bg-bg-dark/50 opacity-60 hover:opacity-100'
            }`}
          >
            <span>{item.emoji}</span>
            <span className="text-[9px] font-medium text-ink-primary">
              {item.label}
            </span>
          </button>
        ))}
      </div>

      <div className="space-y-3">
        <TextField
          label="What pulled at you?"
          value={triggerThought}
          onChange={setTriggerThought}
          placeholder="The message I still have not answered."
        />
        <TextField
          label="What did you do about it?"
          value={triggerResponse}
          onChange={setTriggerResponse}
          placeholder="Left it again. Will answer tomorrow morning."
        />
        <TextField
          label="Best moment"
          value={bestMoment}
          onChange={setBestMoment}
          placeholder="Ten minutes on the balcony before anyone was up."
        />
        <TextField
          label="Tiny step for tomorrow"
          value={tinyStep}
          onChange={setTinyStep}
          placeholder="Five minutes, not thirty."
          rows={1}
        />
        <div>
          <label className="mb-1.5 block text-[12px] font-medium text-ink-secondary">
            Habits kept{' '}
            <span className="font-normal text-ink-muted">
              (comma separated)
            </span>
          </label>
          <input
            className="field"
            value={habits}
            onChange={(event) => setHabits(event.target.value)}
            placeholder="Sat for 5 minutes, walked outside"
          />
        </div>
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
        onClick={save}
        disabled={busy}
        className="btn-primary mt-5 w-full"
      >
        {busy ? 'Saving…' : 'Save entry'}
      </button>
    </Card>
  );
}

function TextField({
  label,
  value,
  onChange,
  placeholder,
  rows = 2,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
}) {
  const id = `entry-${label.replace(/\W+/g, '-').toLowerCase()}`;
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-1.5 block text-[12px] font-medium text-ink-secondary"
      >
        {label}
      </label>
      <textarea
        id={id}
        rows={rows}
        className="field resize-y"
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
}
