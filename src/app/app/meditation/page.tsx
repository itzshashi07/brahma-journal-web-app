'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Pause, Play, RotateCcw } from 'lucide-react';

import { Card, PageHeader } from '@/components/app/ui';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';

/**
 * The meditation timer.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * Why the countdown is derived from a timestamp rather than decremented
 *
 * The obvious implementation is `setInterval(() => setLeft(left - 1), 1000)`.
 * It drifts, and it drifts badly in exactly the situation this feature is used
 * in: browsers throttle timers in a background tab to once a minute or less, so
 * somebody who switches away for five minutes comes back to a timer that thinks
 * eight seconds have passed.
 *
 * Storing the deadline and computing the remainder from `Date.now()` means the
 * tick is only there to repaint. Switching tabs, locking the phone and coming
 * back all produce the correct number, because the number was never being
 * accumulated in the first place.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * The session is only recorded when it completes
 *
 * The total ranked on the leaderboard is minutes actually sat, so a session
 * abandoned at ninety seconds records nothing. Sending a partial would make the
 * board a measure of how often somebody opened the screen.
 */

const LENGTHS = [5, 10, 20, 30];

const TECHNIQUES = [
  {
    id: 'breath',
    name: 'Breath',
    line: 'Breathing in, I am here.\nBreathing out, I am here.',
    blurb: 'Attention on the breath itself. The plainest one, and the one to start with.',
  },
  {
    id: 'grounding',
    name: 'Grounding',
    line: 'This moment is enough.',
    blurb: 'For a day when the worry has no single subject and will not settle.',
  },
  {
    id: 'body',
    name: 'Body scan',
    line: 'Let the shoulders drop.',
    blurb: 'Working down from the head. Useful when the tension is physical.',
  },
  {
    id: 'sleep',
    name: 'Before sleep',
    line: 'Nothing more is required of today.',
    blurb: 'Slower, and meant to be done lying down with the lights off.',
  },
];

export default function MeditationPage() {
  const { profile, refreshProfile } = useAuth();

  const [minutes, setMinutes] = useState(5);
  const [technique, setTechnique] = useState(TECHNIQUES[0]);
  const [deadline, setDeadline] = useState<number | null>(null);
  const [remaining, setRemaining] = useState(5 * 60);
  const [running, setRunning] = useState(false);
  const [saved, setSaved] = useState(false);

  // Held in a ref so the completion effect does not need it as a dependency —
  // it would restart the interval on every tick.
  const savedRef = useRef(false);

  const record = useCallback(
    async (durationSeconds: number) => {
      if (savedRef.current) return;
      savedRef.current = true;
      try {
        await api.post('/api/practice/meditation', {
          techniqueId: technique.id,
          durationSeconds,
          completed: true,
        });
        setSaved(true);
        await refreshProfile();
      } catch {
        // The sitting happened either way. Losing the record is a smaller
        // failure than interrupting somebody who has just finished with an
        // error dialog.
      }
    },
    [technique.id, refreshProfile]
  );

  useEffect(() => {
    if (!running || deadline === null) return;

    const tick = () => {
      const left = Math.max(0, Math.round((deadline - Date.now()) / 1000));
      setRemaining(left);
      if (left === 0) {
        setRunning(false);
        void record(minutes * 60);
      }
    };

    tick();
    const id = window.setInterval(tick, 250);
    return () => window.clearInterval(id);
  }, [running, deadline, minutes, record]);

  function start() {
    savedRef.current = false;
    setSaved(false);
    setDeadline(Date.now() + minutes * 60 * 1000);
    setRunning(true);
  }

  function pause() {
    // Freeze by dropping the deadline and keeping the remainder; resuming
    // rebuilds it from now.
    setRunning(false);
    setDeadline(null);
  }

  function resume() {
    setDeadline(Date.now() + remaining * 1000);
    setRunning(true);
  }

  function reset() {
    setRunning(false);
    setDeadline(null);
    setRemaining(minutes * 60);
    savedRef.current = false;
    setSaved(false);
  }

  const mm = String(Math.floor(remaining / 60)).padStart(2, '0');
  const ss = String(remaining % 60).padStart(2, '0');
  const started = deadline !== null || remaining !== minutes * 60;

  return (
    <>
      <PageHeader
        title="Sit for a few minutes"
        subtitle="Start at five on a day when ten is too many. Nothing is locked and there is no subscription."
      />

      <Card className="mb-5 flex flex-col items-center py-10">
        <div className="relative flex h-52 w-52 items-center justify-center">
          <div
            className={`absolute inset-0 rounded-full bg-primary/25 blur-2xl ${
              running ? 'animate-breathe' : ''
            }`}
          />
          <div
            className={`absolute inset-4 rounded-full border border-primary-light/40 ${
              running ? 'animate-breathe' : ''
            }`}
          />
          <div className="relative text-center">
            <p className="text-4xl font-semibold tabular-nums text-ink-primary">
              {mm}:{ss}
            </p>
            <p className="mt-1 text-[10px] uppercase tracking-[0.2em] text-ink-muted">
              {running ? 'breathe out' : saved ? 'done' : 'ready'}
            </p>
          </div>
        </div>

        <p className="mt-7 max-w-xs whitespace-pre-line text-center text-[14px] leading-relaxed text-ink-secondary">
          {technique.line}
        </p>

        <div className="mt-8 flex gap-3">
          {!running && !started && (
            <button type="button" onClick={start} className="btn-primary">
              <Play className="h-4 w-4" /> Begin
            </button>
          )}
          {running && (
            <button type="button" onClick={pause} className="btn-ghost">
              <Pause className="h-4 w-4" /> Pause
            </button>
          )}
          {!running && started && remaining > 0 && (
            <button type="button" onClick={resume} className="btn-primary">
              <Play className="h-4 w-4" /> Resume
            </button>
          )}
          {started && (
            <button type="button" onClick={reset} className="btn-ghost">
              <RotateCcw className="h-4 w-4" /> Reset
            </button>
          )}
        </div>

        {saved && (
          <p className="mt-5 rounded-pill bg-success/15 px-4 py-1.5 text-[12px] text-success">
            {minutes} minutes added to your total.
          </p>
        )}
      </Card>

      <Card className="mb-5">
        <p className="mb-3 text-[11px] uppercase tracking-wide text-ink-muted">
          How long
        </p>
        <div className="flex gap-2">
          {LENGTHS.map((value) => (
            <button
              key={value}
              type="button"
              disabled={running}
              onClick={() => {
                setMinutes(value);
                setRemaining(value * 60);
                setDeadline(null);
                savedRef.current = false;
                setSaved(false);
              }}
              className={`flex-1 rounded-pill py-2.5 text-[13px] font-semibold transition disabled:opacity-40 ${
                minutes === value
                  ? 'bg-gradient-primary text-white'
                  : 'border border-hairline text-ink-secondary hover:text-ink-primary'
              }`}
            >
              {value} min
            </button>
          ))}
        </div>
      </Card>

      <Card>
        <p className="mb-3 text-[11px] uppercase tracking-wide text-ink-muted">
          What to rest attention on
        </p>
        <div className="grid gap-2 sm:grid-cols-2">
          {TECHNIQUES.map((item) => (
            <button
              key={item.id}
              type="button"
              disabled={running}
              onClick={() => setTechnique(item)}
              className={`rounded-md border p-3 text-left transition disabled:opacity-40 ${
                technique.id === item.id
                  ? 'border-primary/60 bg-primary/10'
                  : 'border-hairline hover:border-primary/40'
              }`}
            >
              <p className="text-[13px] font-semibold text-ink-primary">
                {item.name}
              </p>
              <p className="mt-1 text-[12px] leading-relaxed text-ink-secondary">
                {item.blurb}
              </p>
            </button>
          ))}
        </div>

        <p className="mt-4 text-[11.5px] leading-relaxed text-ink-muted">
          These lines carry no religious content on purpose — a phrase you
          repeat for ten minutes is the actual content of the practice, and it
          should not require opting into somebody else&rsquo;s tradition.
        </p>
      </Card>

      <p className="mt-6 text-center text-[12px] text-ink-muted">
        Banked so far:{' '}
        <span className="text-ink-secondary">
          {Math.round((profile?.totalMeditationSeconds ?? 0) / 60)} minutes
        </span>
      </p>
    </>
  );
}
