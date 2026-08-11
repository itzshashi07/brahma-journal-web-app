'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import {
  type GameProps,
  PlayButton,
  Surface,
  shuffled,
  useCountdown,
  useElapsed,
} from './GameSurface';

/**
 * The six games implemented in the browser.
 *
 * Same ids, same units and same directions as the Flutter versions — see
 * `src/content/games.ts`. A member's best is one number wherever they set it.
 */

// ─────────────────────────────── focus_grid ───────────────────────────────

/**
 * A Schulte table. Find 1 to 25 in order; the score is how long it took.
 *
 * The grid is not reshuffled after a mistake, and a wrong tap costs nothing but
 * the second it took — the exercise is widening the span of attention, and
 * punishing a miss teaches hunting one cell at a time, which is the habit it
 * exists to break.
 */
export function FocusGrid({ onFinish }: GameProps) {
  const [tiles, setTiles] = useState<number[]>([]);
  const [next, setNext] = useState(1);
  const [wrong, setWrong] = useState<number | null>(null);
  const { reset, elapsed } = useElapsed();

  const start = useCallback(() => {
    setTiles(shuffled(Array.from({ length: 25 }, (_, i) => i + 1)));
    setNext(1);
    reset();
  }, [reset]);

  if (!tiles.length) {
    return (
      <Surface hint="Find 1 to 25 in order. Keep your eyes near the middle and let them find the numbers rather than hunting one by one.">
        <PlayButton label="Start" onClick={start} />
      </Surface>
    );
  }

  const tap = (n: number) => {
    if (n !== next) {
      setWrong(n);
      window.setTimeout(() => setWrong(null), 220);
      return;
    }
    if (n === 25) {
      const seconds = elapsed();
      onFinish(seconds, seconds);
      setTiles([]);
      return;
    }
    setNext(n + 1);
  };

  return (
    <Surface hint="In order, as fast as you can." figure={`Next: ${next}`}>
      <div className="grid grid-cols-5 gap-1.5">
        {tiles.map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => tap(n)}
            className={`aspect-square rounded-md border text-[15px] font-semibold tabular-nums transition-colors ${
              n < next
                ? 'border-hairline-soft bg-bg-card/40 text-ink-muted'
                : wrong === n
                  ? 'border-danger bg-danger/20 text-ink-primary'
                  : 'border-hairline bg-bg-card text-ink-primary active:bg-primary/25'
            }`}
          >
            {n}
          </button>
        ))}
      </div>
    </Surface>
  );
}

// ──────────────────────────────── ink_test ────────────────────────────────

const INK = [
  { name: 'Red', hex: '#EF4444' },
  { name: 'Blue', hex: '#3B82F6' },
  { name: 'Green', hex: '#10B981' },
  { name: 'Yellow', hex: '#F59E0B' },
];

/**
 * The Stroop test. Tap the colour of the ink, not the word.
 *
 * Reading is automatic, so ignoring the word takes deliberate control — the
 * same muscle used when you decide not to react to something.
 *
 * A wrong answer costs a point rather than ending the round. Ending it would
 * make the safe play *slow down*, and the whole point is the conflict under
 * time pressure.
 */
export function InkTest({ onFinish }: GameProps) {
  const [playing, setPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(0);
  const { reset, elapsed } = useElapsed();

  const prompt = useMemo(() => {
    const word = INK[Math.floor(Math.random() * INK.length)];
    const ink = INK[Math.floor(Math.random() * INK.length)];
    return { word: word.name, ink };
    // `round` is the dependency on purpose: a new prompt per round.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [round]);

  const left = useCountdown(
    60,
    useCallback(() => {
      if (!playing) return;
      setPlaying(false);
      onFinish(score, elapsed());
    }, [playing, score, onFinish, elapsed])
  );

  if (!playing) {
    return (
      <Surface hint="For sixty seconds: tap the colour the word is printed in, not the word itself. A wrong tap costs a point.">
        <PlayButton
          label="Start"
          onClick={() => {
            setScore(0);
            setRound(0);
            reset();
            setPlaying(true);
          }}
        />
      </Surface>
    );
  }

  const answer = (name: string) => {
    setScore((s) => (name === prompt.ink.name ? s + 1 : Math.max(0, s - 1)));
    setRound((r) => r + 1);
  };

  return (
    <Surface hint="Tap the ink colour." figure={`${score} pts · ${left}s`}>
      <div className="mb-5 flex h-28 items-center justify-center rounded-lg border border-hairline bg-bg-card">
        <span
          className="text-4xl font-bold tracking-tight"
          style={{ color: prompt.ink.hex }}
        >
          {prompt.word}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {INK.map((c) => (
          <button
            key={c.name}
            type="button"
            onClick={() => answer(c.name)}
            className="rounded-md border border-hairline bg-bg-card py-3 text-[14px] font-semibold text-ink-primary active:bg-primary/20"
          >
            <span
              className="mr-2 inline-block h-3 w-3 rounded-full align-middle"
              style={{ backgroundColor: c.hex }}
            />
            {c.name}
          </button>
        ))}
      </div>
    </Surface>
  );
}

// ────────────────────────────── reaction_bell ─────────────────────────────

/**
 * Five rounds, averaged. Wait for gold; tap the instant it turns.
 *
 * The delay is randomised, so an anticipated tap is caught rather than
 * rewarded — a fixed delay measures rhythm, not reaction.
 */
export function ReactionBell({ onFinish }: GameProps) {
  const [phase, setPhase] = useState<'idle' | 'waiting' | 'ready' | 'foul'>('idle');
  const [times, setTimes] = useState<number[]>([]);
  const startedAt = useRef(0);
  const timer = useRef<number | null>(null);
  const { reset, elapsed } = useElapsed();

  useEffect(
    () => () => {
      if (timer.current) window.clearTimeout(timer.current);
    },
    []
  );

  const arm = useCallback(() => {
    setPhase('waiting');
    timer.current = window.setTimeout(
      () => {
        startedAt.current = performance.now();
        setPhase('ready');
      },
      1200 + Math.random() * 2800
    );
  }, []);

  const begin = () => {
    setTimes([]);
    reset();
    arm();
  };

  const tap = () => {
    if (phase === 'waiting') {
      // Tapped before it turned. The round is discarded rather than scored,
      // because a guess that happened to land early is not a reaction.
      if (timer.current) window.clearTimeout(timer.current);
      setPhase('foul');
      return;
    }
    if (phase !== 'ready') return;

    const ms = Math.round(performance.now() - startedAt.current);
    const all = [...times, ms];
    setTimes(all);

    if (all.length === 5) {
      const average = Math.round(all.reduce((a, b) => a + b, 0) / all.length);
      setPhase('idle');
      onFinish(average, elapsed());
      return;
    }
    arm();
  };

  const label =
    phase === 'waiting'
      ? 'Wait…'
      : phase === 'ready'
        ? 'Now'
        : phase === 'foul'
          ? 'Too early'
          : 'Tap to begin';

  return (
    <Surface
      hint="Wait for gold, then tap. Five rounds, averaged."
      figure={times.length ? `${times.length}/5` : undefined}
    >
      <button
        type="button"
        onClick={phase === 'idle' || phase === 'foul' ? begin : tap}
        className={`flex h-56 w-full items-center justify-center rounded-lg border text-xl font-semibold transition-colors ${
          phase === 'ready'
            ? 'border-accent bg-gradient-gold text-bg-dark'
            : phase === 'foul'
              ? 'border-danger bg-danger/20 text-ink-primary'
              : 'border-hairline bg-bg-card text-ink-secondary'
        }`}
      >
        {label}
      </button>
      {times.length > 0 && (
        <p className="mt-3 text-center font-mono text-[12px] text-ink-muted">
          {times.map((t) => `${t}ms`).join(' · ')}
        </p>
      )}
    </Surface>
  );
}

// ───────────────────────────── memory_bloom ───────────────────────────────

/**
 * Watch the petals, repeat the pattern. Working memory, one step longer each
 * round; the score is the longest sequence repeated correctly.
 */
export function MemoryBloom({ onFinish }: GameProps) {
  const [sequence, setSequence] = useState<number[]>([]);
  const [step, setStep] = useState(0);
  const [showing, setShowing] = useState<number | null>(null);
  const [playing, setPlaying] = useState(false);
  const [accepting, setAccepting] = useState(false);
  const { reset, elapsed } = useElapsed();

  // Plays the sequence back, then hands control over.
  useEffect(() => {
    if (!playing || !sequence.length || accepting) return;

    let cancelled = false;
    let i = 0;

    const tick = () => {
      if (cancelled) return;
      if (i >= sequence.length) {
        setShowing(null);
        setAccepting(true);
        return;
      }
      setShowing(sequence[i]);
      window.setTimeout(() => {
        if (cancelled) return;
        setShowing(null);
        i += 1;
        window.setTimeout(tick, 180);
      }, 460);
    };

    const first = window.setTimeout(tick, 500);
    return () => {
      cancelled = true;
      window.clearTimeout(first);
    };
  }, [playing, sequence, accepting]);

  const begin = () => {
    reset();
    setSequence([Math.floor(Math.random() * 4)]);
    setStep(0);
    setAccepting(false);
    setPlaying(true);
  };

  if (!playing) {
    return (
      <Surface hint="Watch the sequence, then repeat it. It grows by one every round.">
        <PlayButton label="Start" onClick={begin} />
      </Surface>
    );
  }

  const tap = (i: number) => {
    if (!accepting) return;

    if (sequence[step] !== i) {
      // The score is the length actually held, so a sequence of five failed at
      // the fourth tap is a four.
      setPlaying(false);
      onFinish(Math.max(0, sequence.length - 1), elapsed());
      return;
    }

    if (step === sequence.length - 1) {
      setStep(0);
      setAccepting(false);
      setSequence((s) => [...s, Math.floor(Math.random() * 4)]);
      return;
    }
    setStep((s) => s + 1);
  };

  const petals = ['#7C3AED', '#10B981', '#F59E0B', '#3B82F6'];

  return (
    <Surface
      hint={accepting ? 'Your turn.' : 'Watch…'}
      figure={`Length ${sequence.length}`}
    >
      <div className="grid grid-cols-2 gap-2.5">
        {petals.map((hex, i) => (
          <button
            key={hex}
            type="button"
            onClick={() => tap(i)}
            disabled={!accepting}
            className="aspect-square rounded-lg border border-hairline transition-all duration-150"
            style={{
              backgroundColor: showing === i ? hex : `${hex}22`,
              transform: showing === i ? 'scale(0.97)' : undefined,
            }}
            aria-label={`Petal ${i + 1}`}
          />
        ))}
      </div>
    </Surface>
  );
}

// ────────────────────────────── pair_bloom ────────────────────────────────

const PAIR_FACES = ['🪷', '🌙', '🔥', '🌊', '🍃', '☀️', '⭐', '🕊️'];

/** Sixteen tiles, eight pairs, fewest moves. The gentlest game in the list. */
export function PairBloom({ onFinish }: GameProps) {
  const [deck, setDeck] = useState<string[]>([]);
  const [open, setOpen] = useState<number[]>([]);
  const [done, setDone] = useState<Set<number>>(new Set());
  const [moves, setMoves] = useState(0);
  const { reset, elapsed } = useElapsed();

  const begin = () => {
    setDeck(shuffled([...PAIR_FACES, ...PAIR_FACES]));
    setOpen([]);
    setDone(new Set());
    setMoves(0);
    reset();
  };

  useEffect(() => {
    if (open.length !== 2) return;
    const [a, b] = open;

    if (deck[a] === deck[b]) {
      const next = new Set(done).add(a).add(b);
      setDone(next);
      setOpen([]);
      if (next.size === deck.length) {
        onFinish(moves + 1, elapsed());
        setDeck([]);
      }
      return;
    }

    // Left face-up for a beat, deliberately. Flipping instantly on a mismatch
    // means the pair is never actually seen, which turns a memory game into a
    // guessing one.
    const t = window.setTimeout(() => setOpen([]), 700);
    return () => window.clearTimeout(t);
  }, [open, deck, done, moves, onFinish, elapsed]);

  if (!deck.length) {
    return (
      <Surface hint="Sixteen tiles, eight pairs. Fewer moves is better — there is no clock.">
        <PlayButton label="Start" onClick={begin} />
      </Surface>
    );
  }

  const flip = (i: number) => {
    if (open.length === 2 || open.includes(i) || done.has(i)) return;
    if (open.length === 1) setMoves((m) => m + 1);
    setOpen((o) => [...o, i]);
  };

  return (
    <Surface hint="Find the pairs." figure={`${moves} moves`}>
      <div className="grid grid-cols-4 gap-1.5">
        {deck.map((face, i) => {
          const shown = open.includes(i) || done.has(i);
          return (
            <button
              key={`${face}-${i}`}
              type="button"
              onClick={() => flip(i)}
              className={`flex aspect-square items-center justify-center rounded-md border text-2xl transition-colors ${
                done.has(i)
                  ? 'border-success/40 bg-success/10'
                  : shown
                    ? 'border-primary/50 bg-bg-card'
                    : 'border-hairline bg-bg-card/50'
              }`}
              aria-label={shown ? face : 'Hidden tile'}
            >
              {shown ? face : ''}
            </button>
          );
        })}
      </div>
    </Surface>
  );
}

// ────────────────────────────── quick_math ────────────────────────────────

/** The sums get harder as the clock runs. Ninety seconds, one point each. */
export function QuickMath({ onFinish }: GameProps) {
  const [playing, setPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(0);
  const [answer, setAnswer] = useState('');
  const { reset, elapsed } = useElapsed();

  const sum = useMemo(() => {
    // Widens with the score rather than with the round, so somebody struggling
    // is not also being handed larger numbers.
    const span = 9 + score * 3;
    const a = 2 + Math.floor(Math.random() * span);
    const b = 2 + Math.floor(Math.random() * span);
    const op = score < 4 ? '+' : ['+', '−', '×'][Math.floor(Math.random() * 3)];
    const value = op === '+' ? a + b : op === '−' ? a - b : a * b;
    return { text: `${a} ${op} ${b}`, value };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [round]);

  const left = useCountdown(
    90,
    useCallback(() => {
      if (!playing) return;
      setPlaying(false);
      onFinish(score, elapsed());
    }, [playing, score, onFinish, elapsed])
  );

  if (!playing) {
    return (
      <Surface hint="Ninety seconds of sums. They widen as you go — and only as you get them right.">
        <PlayButton
          label="Start"
          onClick={() => {
            setScore(0);
            setRound(0);
            setAnswer('');
            reset();
            setPlaying(true);
          }}
        />
      </Surface>
    );
  }

  const submit = () => {
    if (answer.trim() === '') return;
    if (Number(answer) === sum.value) setScore((s) => s + 1);
    setAnswer('');
    setRound((r) => r + 1);
  };

  return (
    <Surface hint="Type the answer." figure={`${score} pts · ${left}s`}>
      <div className="mb-4 flex h-24 items-center justify-center rounded-lg border border-hairline bg-bg-card">
        <span className="text-3xl font-semibold tabular-nums text-ink-primary">
          {sum.text}
        </span>
      </div>
      <div className="flex gap-2">
        <input
          className="field flex-1 text-center text-lg tabular-nums"
          // `inputMode` rather than `type="number"`: a number input on a phone
          // hides the minus sign behind a modifier key, and a third of these
          // are subtractions.
          inputMode="numeric"
          autoFocus
          value={answer}
          onChange={(e) => setAnswer(e.target.value.replace(/[^0-9-]/g, ''))}
          onKeyDown={(e) => {
            if (e.key === 'Enter') submit();
          }}
        />
        <button type="button" onClick={submit} className="btn-primary !px-6">
          Go
        </button>
      </div>
    </Surface>
  );
}

export const PLAYABLE: Record<string, (props: GameProps) => React.ReactElement> = {
  focus_grid: FocusGrid,
  ink_test: InkTest,
  reaction_bell: ReactionBell,
  memory_bloom: MemoryBloom,
  pair_bloom: PairBloom,
  quick_math: QuickMath,
};
