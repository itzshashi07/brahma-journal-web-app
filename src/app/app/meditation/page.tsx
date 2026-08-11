'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Bell,
  BellOff,
  Check,
  Pause,
  Play,
  RotateCcw,
  Square,
} from 'lucide-react';

import { AsyncSection, Card, PageHeader, useApi } from '@/components/app/ui';
import { api, type Paged } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import {
  chimeComplete,
  chimePhase,
  chimeStart,
  chimeStop,
  unlockAudio,
} from '@/lib/chime';

/**
 * The meditation screen.
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
 * accumulated in the first place. The breathing phase is derived from the same
 * elapsed time for the same reason — it cannot fall out of step with the clock.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * What changed, and why a timer needed changing at all
 *
 * It was a number counting down and a sentence, and it read like a kitchen
 * timer with a quotation on it. Somebody who has never meditated and is here at
 * 1am does not know what to *do* with five silent minutes, and the screen did
 * not tell them — so they sat, felt they were doing it wrong, and left.
 *
 * So the screen now leads the breath rather than only measuring it:
 *
 *   • **A pattern per practice**, with the phase named as it happens — breathe
 *     in, hold, out. The ring expands and contracts on the same clock, so the
 *     instruction is something you follow with your eyes rather than read.
 *   • **Bells**, which is the thing that was actually missing. One when you sit
 *     down, one when you get up early, and three rising notes when the sitting
 *     completes on its own — that last one is the whole point of a timer, and
 *     without it a person meditating with their eyes closed has to keep opening
 *     them to check. Synthesised rather than downloaded; see `lib/chime.ts`.
 *   • **A one-minute option**, because the honest answer to "I cannot do ten
 *     minutes today" is one minute rather than nothing.
 *   • **What it did for you**, afterwards — the total, the streak of sittings,
 *     and how long since the last one.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * The session is only recorded when it completes
 *
 * The total ranked on the leaderboard is minutes actually sat, so a session
 * abandoned at ninety seconds records nothing. Sending a partial would make the
 * board a measure of how often somebody opened the screen. Ending early is
 * therefore free — which is the point of saying so on the button.
 */

const LENGTHS = [1, 3, 5, 10, 20, 30];

type Phase = { label: string; seconds: number; scale: number };

type Technique = {
  id: string;
  name: string;
  glyph: string;
  line: string;
  blurb: string;
  /** For when — the sentence that decides whether this is today's practice. */
  when: string;
  /**
   * One breath, as phases. Derived from elapsed time, so it survives a
   * backgrounded tab exactly as the countdown does.
   *
   * `scale` is where the ring should be at the *end* of the phase, between
   * 0.62 and 1. The transition is CSS and runs for the phase's own length,
   * which is what makes the ring something to breathe with rather than an
   * animation playing next to a number.
   */
  cycle: Phase[];
};

const TECHNIQUES: Technique[] = [
  {
    id: 'breath',
    name: 'Just breathe',
    glyph: '🌊',
    line: 'Breathing in, I am here.\nBreathing out, I am here.',
    blurb: 'In for four, out for six. The longer exhale is what settles you.',
    when: 'Start here on any day you cannot decide.',
    cycle: [
      { label: 'Breathe in', seconds: 4, scale: 1 },
      { label: 'Breathe out', seconds: 6, scale: 0.62 },
    ],
  },
  {
    id: 'box',
    name: 'Box breathing',
    glyph: '🧊',
    line: 'Four in. Four held. Four out. Four held.',
    blurb: 'Equal on all four sides. What pilots and paramedics are taught.',
    when: 'Before something you are dreading — an exam, a call, a room.',
    cycle: [
      { label: 'Breathe in', seconds: 4, scale: 1 },
      { label: 'Hold', seconds: 4, scale: 1 },
      { label: 'Breathe out', seconds: 4, scale: 0.62 },
      { label: 'Hold', seconds: 4, scale: 0.62 },
    ],
  },
  {
    id: 'sleep',
    name: '4 · 7 · 8',
    glyph: '🌙',
    line: 'Nothing more is required of today.',
    blurb: 'In for four, hold for seven, out for eight. Slow on purpose.',
    when: 'Lying down, lights off, brain still talking.',
    cycle: [
      { label: 'Breathe in', seconds: 4, scale: 1 },
      { label: 'Hold', seconds: 7, scale: 1 },
      { label: 'Breathe out', seconds: 8, scale: 0.62 },
    ],
  },
  {
    id: 'grounding',
    name: 'Grounding',
    glyph: '🪨',
    line: 'This moment is enough.',
    blurb: 'Long, even breaths while you name what is actually in the room.',
    when: 'When the worry has no single subject and will not settle.',
    cycle: [
      { label: 'Breathe in', seconds: 5, scale: 1 },
      { label: 'Breathe out', seconds: 5, scale: 0.62 },
    ],
  },
  {
    id: 'body',
    name: 'Body scan',
    glyph: '🫁',
    line: 'Let the shoulders drop.',
    blurb: 'Working down from the head, one part at a time.',
    when: 'When the tension is physical — jaw, neck, shoulders.',
    cycle: [
      { label: 'Breathe in', seconds: 4, scale: 1 },
      { label: 'Soften', seconds: 2, scale: 1 },
      { label: 'Breathe out', seconds: 6, scale: 0.62 },
    ],
  },
  {
    id: 'focus',
    name: 'Before work',
    glyph: '🎯',
    line: 'One thing. Then the next thing.',
    blurb: 'Short cycles, eyes open if you like. Not about relaxing.',
    when: 'Two minutes before you open the laptop.',
    cycle: [
      { label: 'Breathe in', seconds: 3, scale: 1 },
      { label: 'Breathe out', seconds: 4, scale: 0.62 },
    ],
  },
];

type MeditationSession = {
  _id: string;
  durationSeconds?: number;
  techniqueId?: string;
  createdAt: string;
};

const SOUND_KEY = 'innenflow:meditation-sound';

export default function MeditationPage() {
  const { profile, refreshProfile } = useAuth();

  const [minutes, setMinutes] = useState(5);
  const [technique, setTechnique] = useState(TECHNIQUES[0]);
  const [deadline, setDeadline] = useState<number | null>(null);
  const [remaining, setRemaining] = useState(5 * 60);
  const [running, setRunning] = useState(false);
  const [saved, setSaved] = useState(false);
  const [sound, setSound] = useState(true);

  // The phase of the breath, and where the ring should be going. Held together
  // so one render moves both — a label that changes a frame before the ring
  // does is worse than either on its own.
  const [breath, setBreath] = useState<{ label: string; scale: number; seconds: number }>({
    label: 'Ready',
    scale: 0.82,
    seconds: 1,
  });

  // Held in refs so the ticking effect does not take them as dependencies —
  // it would restart the interval on every tick.
  const savedRef = useRef(false);
  const phaseRef = useRef(-1);
  const soundRef = useRef(true);

  const recent = useApi(
    () =>
      api.get<Paged<MeditationSession, 'sessions'>>('/api/practice/meditation', {
        limit: 30,
      }),
    []
  );

  /**
   * The bell setting outlives the tab.
   *
   * Somebody who turns the bells off is usually somewhere they cannot make
   * noise, and being asked to turn them off again every time they open the
   * screen is the kind of small friction that ends a daily habit.
   */
  useEffect(() => {
    const stored = window.localStorage.getItem(SOUND_KEY);
    if (stored !== null) setSound(stored === '1');
  }, []);

  useEffect(() => {
    soundRef.current = sound;
    window.localStorage.setItem(SOUND_KEY, sound ? '1' : '0');
  }, [sound]);

  const total = minutes * 60;
  const cycleLength = useMemo(
    () => technique.cycle.reduce((sum, phase) => sum + phase.seconds, 0),
    [technique]
  );

  // `useApi` hands back a fresh object every render, so taking `recent.reload`
  // as a dependency of the ticking effect would tear down and rebuild the
  // interval on every repaint. The ref is the same function either way.
  const reloadRecent = useRef(recent.reload);
  reloadRecent.current = recent.reload;

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
        await Promise.all([refreshProfile(), reloadRecent.current()]);
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
        phaseRef.current = -1;
        setBreath({ label: 'Done', scale: 0.9, seconds: 1.5 });
        if (soundRef.current) chimeComplete();
        void record(total);
        return;
      }

      // Which phase of the breath we are in, from elapsed time rather than from
      // a counter — the same reason the clock itself is derived. A tab that was
      // asleep for two minutes comes back on the correct phase.
      const elapsed = total - left;
      let offset = elapsed % cycleLength;
      let index = 0;
      while (offset >= technique.cycle[index].seconds) {
        offset -= technique.cycle[index].seconds;
        index += 1;
      }

      if (index !== phaseRef.current) {
        phaseRef.current = index;
        const phase = technique.cycle[index];
        setBreath({
          label: phase.label,
          scale: phase.scale,
          // The remainder of the phase, so a tab returning mid-phase does not
          // replay the whole expansion in a hurry.
          seconds: Math.max(0.4, phase.seconds - offset),
        });
        if (soundRef.current) chimePhase();
      }
    };

    tick();
    const id = window.setInterval(tick, 250);
    return () => window.clearInterval(id);
  }, [running, deadline, total, cycleLength, technique, record]);

  /**
   * Keep the screen on while somebody is sitting.
   *
   * A phone that locks itself four minutes into a five-minute sitting takes the
   * timer with it — and taking the bell with it is worse, because the bell is
   * the thing being waited for. Wake Lock is not available everywhere and is
   * refused in a background tab; it fails quietly, and the timer is correct
   * either way because it is derived from a timestamp.
   */
  useEffect(() => {
    if (!running) return;
    if (!('wakeLock' in navigator)) return;

    let lock: WakeLockSentinel | null = null;
    let released = false;

    navigator.wakeLock
      .request('screen')
      .then((sentinel) => {
        if (released) void sentinel.release();
        else lock = sentinel;
      })
      .catch(() => {});

    return () => {
      released = true;
      void lock?.release().catch(() => {});
    };
  }, [running]);

  function start() {
    // Inside the tap, so the browser lets this page make a sound later — the
    // completion bell has no gesture of its own to attach to.
    unlockAudio();
    savedRef.current = false;
    phaseRef.current = -1;
    setSaved(false);
    setRemaining(total);
    setDeadline(Date.now() + total * 1000);
    setRunning(true);
    if (sound) chimeStart();
  }

  function pause() {
    // Freeze by dropping the deadline and keeping the remainder; resuming
    // rebuilds it from now.
    setRunning(false);
    setDeadline(null);
    setBreath((current) => ({ ...current, label: 'Paused' }));
    if (sound) chimeStop();
  }

  function resume() {
    unlockAudio();
    phaseRef.current = -1;
    setDeadline(Date.now() + remaining * 1000);
    setRunning(true);
    if (sound) chimeStart();
  }

  function reset() {
    setRunning(false);
    setDeadline(null);
    setRemaining(total);
    savedRef.current = false;
    phaseRef.current = -1;
    setSaved(false);
    setBreath({ label: 'Ready', scale: 0.82, seconds: 1 });
    if (sound) chimeStop();
  }

  function chooseLength(value: number) {
    setMinutes(value);
    setRemaining(value * 60);
    setDeadline(null);
    setRunning(false);
    savedRef.current = false;
    phaseRef.current = -1;
    setSaved(false);
    setBreath({ label: 'Ready', scale: 0.82, seconds: 1 });
  }

  const mm = String(Math.floor(remaining / 60)).padStart(2, '0');
  const ss = String(remaining % 60).padStart(2, '0');
  const started = deadline !== null || remaining !== total;
  const progress = total === 0 ? 0 : (total - remaining) / total;

  return (
    <>
      <PageHeader
        title="Sit for a few minutes"
        subtitle="One minute counts. The ring breathes with you and a bell tells you when it is done, so you can keep your eyes shut."
        action={
          <button
            type="button"
            onClick={() => setSound((value) => !value)}
            aria-pressed={sound}
            className="btn-ghost !px-4 !py-2 text-[12.5px]"
            title={sound ? 'Bells are on' : 'Bells are off'}
          >
            {sound ? (
              <>
                <Bell className="h-3.5 w-3.5" /> Bells on
              </>
            ) : (
              <>
                <BellOff className="h-3.5 w-3.5" /> Silent
              </>
            )}
          </button>
        }
      />

      <Card className="mb-5 flex flex-col items-center overflow-hidden py-9">
        <BreathRing
          breath={breath}
          running={running}
          progress={progress}
          mm={mm}
          ss={ss}
          saved={saved}
        />

        <p className="mt-7 max-w-xs whitespace-pre-line text-center text-[14px] leading-relaxed text-ink-secondary">
          {technique.line}
        </p>

        <div className="mt-7 flex flex-wrap justify-center gap-3">
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
          {started && remaining > 0 && (
            <button type="button" onClick={reset} className="btn-ghost">
              <Square className="h-3.5 w-3.5" /> End early
            </button>
          )}
          {started && remaining === 0 && (
            <button type="button" onClick={reset} className="btn-ghost">
              <RotateCcw className="h-4 w-4" /> Sit again
            </button>
          )}
        </div>

        {started && remaining > 0 && (
          <p className="mt-3 text-center text-[11px] text-ink-muted">
            Ending early records nothing, and that is not a punishment — the
            board counts minutes actually sat.
          </p>
        )}

        {saved && (
          <p className="mt-5 inline-flex items-center gap-1.5 rounded-pill bg-success/15 px-4 py-1.5 text-[12px] text-success">
            <Check className="h-3.5 w-3.5" />
            {minutes} {minutes === 1 ? 'minute' : 'minutes'} added to your total.
          </p>
        )}
      </Card>

      <Card className="mb-5">
        <p className="mb-3 text-[11px] uppercase tracking-wide text-ink-muted">
          How long
        </p>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
          {LENGTHS.map((value) => (
            <button
              key={value}
              type="button"
              disabled={running}
              onClick={() => chooseLength(value)}
              className={`rounded-pill py-2.5 text-[13px] font-semibold transition disabled:opacity-40 ${
                minutes === value
                  ? 'bg-gradient-primary text-white'
                  : 'border border-hairline text-ink-secondary hover:text-ink-primary'
              }`}
            >
              {value}m
            </button>
          ))}
        </div>
        <p className="mt-3 text-[11.5px] leading-relaxed text-ink-muted">
          One minute is a real option and it is there on purpose. A minute you
          actually do beats twenty you keep meaning to.
        </p>
      </Card>

      <Card className="mb-5">
        <p className="mb-3 text-[11px] uppercase tracking-wide text-ink-muted">
          What to rest attention on
        </p>
        <div className="grid gap-2 sm:grid-cols-2">
          {TECHNIQUES.map((item) => {
            const active = technique.id === item.id;
            return (
              <button
                key={item.id}
                type="button"
                disabled={running}
                onClick={() => {
                  setTechnique(item);
                  phaseRef.current = -1;
                }}
                className={`rounded-md border p-3.5 text-left transition disabled:opacity-40 ${
                  active
                    ? 'border-primary/60 bg-primary/10'
                    : 'border-hairline hover:border-primary/40'
                }`}
              >
                <p className="flex items-center gap-2 text-[13.5px] font-semibold text-ink-primary">
                  <span aria-hidden="true">{item.glyph}</span>
                  {item.name}
                </p>
                <p className="mt-1 text-[12px] leading-relaxed text-ink-secondary">
                  {item.blurb}
                </p>
                <p className="mt-1.5 text-[11.5px] leading-relaxed text-ink-muted">
                  {item.when}
                </p>
                <div className="mt-2 flex flex-wrap gap-1">
                  {item.cycle.map((phase, index) => (
                    <span
                      key={`${item.id}-${index}`}
                      className="rounded-pill border border-hairline px-2 py-0.5 text-[10px] text-ink-muted"
                    >
                      {phase.label} {phase.seconds}s
                    </span>
                  ))}
                </div>
              </button>
            );
          })}
        </div>

        <p className="mt-4 text-[11.5px] leading-relaxed text-ink-muted">
          These lines carry no religious content on purpose — a phrase you
          repeat for ten minutes is the actual content of the practice, and it
          should not require opting into somebody else&rsquo;s tradition.
        </p>
      </Card>

      <AsyncSection state={recent}>
        {(data) => <Streak sessions={data.sessions} profile={profile} />}
      </AsyncSection>
    </>
  );
}

/**
 * The ring, the clock and the instruction, as one thing.
 *
 * Two circles: the outer one is progress through the sitting, drawn as an arc
 * on an SVG so it is exact; the inner one is the breath, scaled by CSS with the
 * transition length set to the phase's own duration. That is what makes it
 * something to follow rather than a decoration — `transform` is composited, so
 * it stays smooth while the tab is doing other things, and a 250ms tick is
 * enough to drive it because the browser fills in between the phases.
 */
function BreathRing({
  breath,
  running,
  progress,
  mm,
  ss,
  saved,
}: {
  breath: { label: string; scale: number; seconds: number };
  running: boolean;
  progress: number;
  mm: string;
  ss: string;
  saved: boolean;
}) {
  const R = 88;
  const circumference = 2 * Math.PI * R;

  return (
    <div className="relative flex h-56 w-56 items-center justify-center">
      {/* The breath. Sits behind everything and is the only thing that moves. */}
      <div
        aria-hidden="true"
        style={{
          transform: `scale(${breath.scale})`,
          transitionDuration: `${breath.seconds}s`,
        }}
        className="absolute inset-6 rounded-full bg-primary/30 blur-2xl transition-transform ease-in-out"
      />
      <div
        aria-hidden="true"
        style={{
          transform: `scale(${breath.scale})`,
          transitionDuration: `${breath.seconds}s`,
        }}
        className="absolute inset-8 rounded-full border border-primary-light/50 transition-transform ease-in-out"
      />

      {/* Progress through the whole sitting. */}
      <svg
        viewBox="0 0 200 200"
        className="absolute inset-0 h-full w-full -rotate-90"
        aria-hidden="true"
      >
        <circle
          cx="100"
          cy="100"
          r={R}
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          className="text-hairline"
        />
        <circle
          cx="100"
          cy="100"
          r={R}
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - progress)}
          className="text-primary-light transition-[stroke-dashoffset] duration-300 ease-linear"
        />
      </svg>

      <div className="relative text-center">
        <p className="text-[42px] font-semibold leading-none tabular-nums text-ink-primary">
          {mm}:{ss}
        </p>
        {/* `aria-live` so somebody using a screen reader is told the phase — the
            ring is the instruction for everybody else. */}
        <p
          role="status"
          aria-live="polite"
          className="mt-2 text-[11px] uppercase tracking-[0.22em] text-ink-muted"
        >
          {saved && !running ? 'well sat' : breath.label}
        </p>
      </div>
    </div>
  );
}

/**
 * What the sitting added up to.
 *
 * A total on its own is a number; a total next to "four days running" is a
 * reason to come back tomorrow. Counted from the sessions this screen already
 * loaded rather than from a second endpoint.
 */
function Streak({
  sessions,
  profile,
}: {
  sessions: MeditationSession[];
  profile: { totalMeditationSeconds?: number } | null;
}) {
  const { days, lastAt, thisWeek } = useMemo(() => {
    const keys = new Set<string>();
    let latest: string | null = null;
    let week = 0;
    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;

    for (const session of sessions) {
      const date = new Date(session.createdAt);
      if (Number.isNaN(date.getTime())) continue;
      keys.add(date.toDateString());
      if (!latest || date > new Date(latest)) latest = session.createdAt;
      if (date.getTime() >= weekAgo) week += session.durationSeconds ?? 0;
    }

    // Consecutive days back from today — or from yesterday, so a streak is not
    // reported as broken at 9am before that day's sitting has happened.
    let run = 0;
    const cursor = new Date();
    if (!keys.has(cursor.toDateString())) cursor.setDate(cursor.getDate() - 1);
    while (keys.has(cursor.toDateString())) {
      run += 1;
      cursor.setDate(cursor.getDate() - 1);
    }

    return { days: run, lastAt: latest, thisWeek: Math.round(week / 60) };
  }, [sessions]);

  const totalMinutes = Math.round((profile?.totalMeditationSeconds ?? 0) / 60);

  return (
    <Card>
      <p className="mb-3 text-[11px] uppercase tracking-wide text-ink-muted">
        Where you are
      </p>
      <div className="grid grid-cols-3 gap-4 text-center">
        <div>
          <p className="text-2xl font-semibold text-ink-primary">{totalMinutes}</p>
          <p className="text-[11px] text-ink-muted">minutes banked</p>
        </div>
        <div>
          <p className="text-2xl font-semibold text-accent">{days}</p>
          <p className="text-[11px] text-ink-muted">
            {days === 1 ? 'day running' : 'days running'}
          </p>
        </div>
        <div>
          <p className="text-2xl font-semibold text-ink-primary">{thisWeek}</p>
          <p className="text-[11px] text-ink-muted">minutes this week</p>
        </div>
      </div>

      <p className="mt-4 text-center text-[11.5px] text-ink-muted">
        {lastAt
          ? `Last sitting ${new Date(lastAt).toLocaleDateString('en-IN', {
              weekday: 'long',
              day: 'numeric',
              month: 'short',
            })}.`
          : 'Nothing recorded yet. One minute is enough to start the count.'}
      </p>
    </Card>
  );
}
