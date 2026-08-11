'use client';

import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';

import {
  AsyncSection,
  Card,
  EmptyState,
  PageHeader,
  useApi,
} from '@/components/app/ui';
import { api } from '@/lib/api';

/**
 * A member's own affirmations.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * The set is replaced whole, not patched
 *
 * `PUT /api/practice/affirmations/mine` takes the entire list. That is
 * deliberate and it is why the endpoint is a PUT: a removed line has to
 * actually disappear, and a merge-style update leaves it behind. The client
 * owns the collection; the server stores what it is given.
 *
 * The consequence is that two tabs editing at once will have the last write
 * win. That is acceptable for a list somebody edits a handful of times a year,
 * and the alternative — per-item endpoints with ids — is a lot of machinery for
 * a screen with five lines on it.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * Why there is no starter library
 *
 * Because a generic affirmation does nothing. "I am abundant" written by a
 * marketing team is a sentence you are reading, not one you mean. The ones that
 * work are the specific answers to the specific thing your own head says at
 * 2am, and handing over a library makes it less likely somebody writes one.
 */

type Mine = { affirmations: string[]; backgroundIds?: string[] };
type Progress = {
  affirmationId: string;
  totalRepetitions?: number;
  progress?: number;
  lastPracticedAt?: string;
};

/** The card backgrounds. Aligned by index with the affirmations themselves. */
const BACKGROUNDS = [
  'from-primary/40 to-primary-dark/40',
  'from-accent/30 to-orange-600/30',
  'from-emerald-500/30 to-teal-700/30',
  'from-indigo-500/35 to-purple-800/35',
  'from-rose-500/25 to-pink-800/30',
];

export default function AffirmationsPage() {
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState('');
  const [busy, setBusy] = useState(false);

  const mine = useApi(
    () => api.get<Mine>('/api/practice/affirmations/mine'),
    []
  );
  const progress = useApi(
    () => api.get<{ progress: Progress[] }>('/api/practice/affirmations/progress'),
    []
  );

  const list = mine.data?.affirmations ?? [];

  async function save(next: string[]) {
    setBusy(true);
    try {
      await api.put('/api/practice/affirmations/mine', { affirmations: next });
      mine.setData({ affirmations: next });
    } finally {
      setBusy(false);
    }
  }

  async function add() {
    const line = draft.trim();
    if (!line) return;
    await save([...list, line]);
    setDraft('');
    setAdding(false);
  }

  async function remove(index: number) {
    await save(list.filter((_, position) => position !== index));
  }

  /**
   * A repetition.
   *
   * Recorded as a session rather than incremented locally, so the count
   * survives closing the tab and matches what the Android app shows. The id is
   * the index — the API treats it as an opaque string, and the set is small and
   * append-mostly.
   */
  async function count(index: number) {
    try {
      await api.post('/api/practice/affirmations/sessions', {
        affirmationId: String(index),
        affirmation: list[index],
        repetitions: 1,
        durationSeconds: 0,
      });
      await progress.reload();
    } catch {
      // Losing one tap is not worth an error dialog mid-practice.
    }
  }

  const repetitionsFor = (index: number) =>
    progress.data?.progress?.find((row) => row.affirmationId === String(index))
      ?.totalRepetitions ?? 0;

  return (
    <>
      <PageHeader
        title="Your affirmations"
        subtitle="In your words, not a stranger's. Tap a card to count a repetition."
        action={
          <button
            type="button"
            onClick={() => setAdding((value) => !value)}
            className={adding ? 'btn-ghost !py-2.5' : 'btn-primary !py-2.5'}
          >
            {adding ? 'Cancel' : <><Plus className="h-4 w-4" /> Write one</>}
          </button>
        }
      />

      {adding && (
        <Card className="mb-5">
          <label
            htmlFor="new-affirmation"
            className="mb-1.5 block text-[12px] font-medium text-ink-secondary"
          >
            The answer to the thing your head says at 2am
          </label>
          <textarea
            id="new-affirmation"
            rows={3}
            className="field resize-y"
            value={draft}
            maxLength={1000}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="Nobody is thinking about it as much as I am."
          />
          <button
            type="button"
            onClick={add}
            disabled={busy || !draft.trim()}
            className="btn-primary mt-3 w-full"
          >
            {busy ? 'Saving…' : 'Add it'}
          </button>
        </Card>
      )}

      <AsyncSection state={mine}>
        {() =>
          list.length === 0 ? (
            <EmptyState
              title="Nothing written yet"
              body="Write the specific sentence that answers what your head actually says to you — not a general one. That is the difference between an affirmation that works and one you are just reading."
              action={
                <button
                  type="button"
                  onClick={() => setAdding(true)}
                  className="btn-primary"
                >
                  Write the first one
                </button>
              }
            />
          ) : (
            <div className="space-y-3">
              {list.map((line, index) => (
                <div
                  key={`${line}-${index}`}
                  className={`relative overflow-hidden rounded-lg border border-hairline bg-gradient-to-br p-5 ${
                    BACKGROUNDS[index % BACKGROUNDS.length]
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => count(index)}
                    className="w-full text-left"
                  >
                    <p className="text-[15px] font-medium leading-relaxed text-ink-primary">
                      &ldquo;{line}&rdquo;
                    </p>
                    <p className="mt-3 text-[11px] text-ink-secondary">
                      {repetitionsFor(index)} repetitions · tap to count
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => remove(index)}
                    disabled={busy}
                    className="absolute right-4 top-4 text-ink-muted transition hover:text-danger"
                    aria-label="Delete this affirmation"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )
        }
      </AsyncSection>
    </>
  );
}
