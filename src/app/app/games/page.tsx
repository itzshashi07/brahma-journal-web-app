'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { AsyncSection, Card, PageHeader, useApi } from '@/components/app/ui';
import { api, type Paged } from '@/lib/api';

/**
 * Focus.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * The score is only submitted when it is real
 *
 * A round that is abandoned records nothing, and the server improves a stored
 * best only when the new score actually beats it — the comparison is in the
 * update filter, so a losing write matches no document rather than being
 * checked and discarded afterwards. That is what makes the per-game board worth
 * looking at.
 *
 * This game is reaction time, so lower is better, which the board has to be
 * told: `lowerIsBetter` flips both the sort and the direction the cursor walks.
 */

type Score = {
  _id: string;
  firebaseUid: string;
  gameId: string;
  displayName?: string;
  score: number;
  plays?: number;
};

type Phase = 'idle' | 'waiting' | 'ready' | 'result' | 'foul';

const GAME_ID = 'reaction';

export default function GamesPage() {
  const [phase, setPhase] = useState<Phase>('idle');
  const [result, setResult] = useState<number | null>(null);

  const startedAt = useRef(0);
  const timer = useRef<number | null>(null);

  const board = useApi(
    () =>
      api.get<Paged<Score, 'top'> & { mine: Score | null }>(
        `/api/practice/games/${GAME_ID}/board`,
        { lowerIsBetter: 'true', limit: 20 }
      ),
    []
  );

  // Any pending timeout has to die with the component, or it fires into an
  // unmounted tree after a navigation.
  useEffect(() => () => {
    if (timer.current) window.clearTimeout(timer.current);
  }, []);

  const begin = useCallback(() => {
    setResult(null);
    setPhase('waiting');
    // Randomised so the delay cannot be anticipated — a fixed one measures
    // rhythm rather than reaction.
    const delay = 1200 + Math.random() * 2800;
    timer.current = window.setTimeout(() => {
      startedAt.current = performance.now();
      setPhase('ready');
    }, delay);
  }, []);

  const hit = useCallback(async () => {
    if (phase === 'waiting') {
      // Clicked before the signal. Not a score.
      if (timer.current) window.clearTimeout(timer.current);
      setPhase('foul');
      return;
    }
    if (phase !== 'ready') return;

    const ms = Math.round(performance.now() - startedAt.current);
    setResult(ms);
    setPhase('result');

    try {
      await api.post('/api/practice/games/scores', {
        gameId: GAME_ID,
        score: ms,
        lowerIsBetter: true,
      });
      await board.reload();
    } catch {
      // The round happened. A failed submit is not worth interrupting it.
    }
  }, [phase, board]);

  const surface = {
    idle: { className: 'bg-bg-card', text: 'Tap to start' },
    waiting: { className: 'bg-danger/70', text: 'Wait for green…' },
    ready: { className: 'bg-success', text: 'Now!' },
    result: { className: 'bg-bg-card', text: `${result} ms · tap to go again` },
    foul: { className: 'bg-accent/70', text: 'Too early. Tap to try again.' },
  }[phase];

  return (
    <>
      <PageHeader
        title="Focus"
        subtitle="A few minutes of holding attention on one thing, which is the opposite of what a phone usually asks of you."
      />

      <button
        type="button"
        onClick={phase === 'idle' || phase === 'result' || phase === 'foul' ? begin : hit}
        className={`mb-5 flex h-64 w-full items-center justify-center rounded-lg border border-hairline text-[16px] font-semibold text-ink-primary transition-colors ${surface.className}`}
      >
        {surface.text}
      </button>

      <p className="mb-6 text-center text-[11.5px] leading-relaxed text-ink-muted">
        A weaker run still counts as a play — the attempt happened — but the
        number on the board is held back until you genuinely beat it.
      </p>

      <AsyncSection state={board}>
        {(data) => (
          <Card>
            <p className="mb-3 text-[11px] uppercase tracking-wide text-ink-muted">
              Fastest reactions
            </p>

            {data.mine && (
              <p className="mb-4 rounded-md bg-primary/15 px-4 py-2.5 text-[13px] text-ink-secondary">
                Your best:{' '}
                <span className="font-semibold text-ink-primary">
                  {data.mine.score} ms
                </span>
                {data.mine.plays ? ` over ${data.mine.plays} plays` : ''}
              </p>
            )}

            {data.top.length === 0 ? (
              <p className="text-[13px] text-ink-muted">Nobody has played yet.</p>
            ) : (
              <div className="space-y-1.5">
                {data.top.map((row, index) => (
                  <div
                    key={row._id}
                    className="flex items-center gap-3 rounded-md border border-hairline bg-bg-card/50 px-3 py-2"
                  >
                    <span
                      className={`w-5 text-[12px] font-semibold ${
                        index < 3 ? 'text-accent' : 'text-ink-muted'
                      }`}
                    >
                      {index + 1}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-[13px] text-ink-secondary">
                      {row.displayName || 'Friend'}
                    </span>
                    <span className="text-[13px] font-semibold tabular-nums text-ink-primary">
                      {row.score} ms
                    </span>
                  </div>
                ))}
              </div>
            )}
          </Card>
        )}
      </AsyncSection>
    </>
  );
}
