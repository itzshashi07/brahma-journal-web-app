'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * What every game here shares.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * A score is only submitted when it is real
 *
 * A round that is abandoned records nothing. That is not politeness — the
 * boards are per-game bests, and a half-played round posting a score would put
 * a number on the board that nobody achieved. `finish` is called by the game
 * exactly once, at the end, and navigating away instead calls nothing.
 *
 * The server improves a stored best only when the new score actually beats it,
 * with the comparison inside the update filter, so a losing write matches no
 * document rather than being fetched, compared and discarded.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * Training time
 *
 * Seconds spent playing are reported separately from scores, because "how long
 * did you sit with this" and "how well did you do" are different questions and
 * the app keeps them apart — meditation minutes and focus minutes are never
 * added together, so neither number lies.
 */

export type Finish = (score: number, elapsedSeconds: number) => void;

export interface GameProps {
  onFinish: Finish;
}

/** A countdown that stops itself, and cleans up on unmount. */
export function useCountdown(seconds: number, onDone: () => void) {
  const [left, setLeft] = useState(seconds);
  const done = useRef(onDone);
  done.current = onDone;

  useEffect(() => {
    if (left <= 0) {
      done.current();
      return;
    }
    const t = window.setTimeout(() => setLeft((v) => v - 1), 1000);
    return () => window.clearTimeout(t);
  }, [left]);

  return left;
}

/** Wall-clock seconds since the round began, read only when it ends. */
export function useElapsed() {
  const startedAt = useRef(Date.now());
  const reset = useCallback(() => {
    startedAt.current = Date.now();
  }, []);
  const elapsed = useCallback(
    () => Math.max(1, Math.round((Date.now() - startedAt.current) / 1000)),
    []
  );
  return { reset, elapsed };
}

/** The frame every game sits in: a title line, a live figure, and the board. */
export function Surface({
  hint,
  figure,
  children,
}: {
  hint: string;
  figure?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-4 flex items-baseline justify-between gap-4">
        <p className="text-[13px] leading-relaxed text-ink-secondary">{hint}</p>
        {figure && (
          <p className="shrink-0 font-mono text-[15px] font-semibold text-ink-primary">
            {figure}
          </p>
        )}
      </div>
      {children}
    </div>
  );
}

export function PlayButton({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <button type="button" onClick={onClick} className="btn-primary w-full">
      {label}
    </button>
  );
}

/** Fisher–Yates. `sort(() => Math.random() - 0.5)` is not a shuffle — it is
 *  biased, and on a 25-tile grid the bias is visible as tiles that keep
 *  starting near where they started last time. */
export function shuffled<T>(input: readonly T[]): T[] {
  const a = [...input];
  for (let i = a.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
