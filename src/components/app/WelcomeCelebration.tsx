'use client';

import { useEffect, useRef, useState } from 'react';

import { Modal } from './ui';
import { useAuth } from '@/lib/auth-context';

/**
 * The moment someone arrives.
 *
 * Shown once per sign-in, over whatever screen they landed on, and it exists for
 * one reason: the gap between "I made an account" and "I understand why I am
 * here" is where most people leave. A line of copy that names them, tells them
 * what they have joined and gives them one thing to do next closes that gap in
 * the three seconds they are already looking at the screen.
 *
 * A port of `widgets/welcome_celebration.dart`, including the part that decides
 * whether it appears at all: it is gated on `consumeJustSignedIn`, which is an
 * *event* rather than a date. Reloading the dashboard does not re-greet, and a
 * member of six months is not told "welcome to the family" — telling them that
 * reads as a system that has not noticed them.
 *
 * Everything is drawn rather than imported — the halo, the orbiting petals — so
 * there is no asset to load and nothing to wait for. The content lands in four
 * beats so the eye is led down the card instead of being handed all of it at
 * once.
 */
export function WelcomeCelebration() {
  const { user, profile, loading, consumeJustSignedIn } = useAuth();
  const [kind, setKind] = useState<'new' | 'returning' | null>(null);

  /**
   * Asked exactly once.
   *
   * `consumeJustSignedIn` is rebuilt whenever the auth context's memo re-runs —
   * which it does the moment the profile lands — so without this guard the
   * effect fires a second time, gets `null` back from a flag it has already
   * consumed, and closes the card out from under somebody mid-read.
   */
  const asked = useRef(false);

  useEffect(() => {
    // Waits for the auth load to settle. Firing the moment the user object
    // arrives greets half of them as "Friend", because the display name is on
    // the profile and the profile is one request behind the credential.
    if (loading || !user || asked.current) return;
    asked.current = true;
    setKind(consumeJustSignedIn());
  }, [loading, user, consumeJustSignedIn]);

  if (!kind) return null;

  const first = kind === 'new';
  const name =
    profile?.name?.trim() ||
    user?.displayName?.trim() ||
    user?.email?.split('@')[0] ||
    'Friend';

  return (
    <Modal open onClose={() => setKind(null)} label="Welcome">
      <div className="flex flex-col items-center text-center">
        {/* ── the mark ── */}
        <div className="relative mb-4 flex h-28 w-28 items-center justify-center">
          <span className="absolute inset-0 animate-breathe rounded-full bg-primary/25 blur-2xl" />
          <span
            className="absolute inset-2 rounded-full border border-primary/40"
            aria-hidden="true"
          />
          <span className="relative text-5xl" aria-hidden="true">
            🪷
          </span>
        </div>

        {/* ── the badge ── */}
        <span className="rounded-pill border border-accent/45 bg-accent/15 px-3.5 py-1.5 text-[10.5px] font-extrabold tracking-[0.16em] text-accent">
          {first ? '✨  YOU ARE IN' : '✨  WELCOME BACK'}
        </span>

        {/* ── their name ── */}
        <h2 className="headline mt-4 text-2xl font-extrabold leading-tight">
          {first ? (
            <>
              Congratulations,
              <br />
              {name}
            </>
          ) : (
            <>Welcome, {name}</>
          )}
        </h2>

        {/* ── the message ── */}
        <p className="mt-3 text-[13.5px] leading-relaxed text-ink-secondary">
          {first ? (
            <>
              You are now part of the InnenFlow family — a small circle of people
              who decided to sit with themselves every day instead of running from
              the noise.
              <br />
              <br />
              Nothing here is a competition. Write one honest line, breathe for
              five minutes, and let the days add up. That is the whole practice.
            </>
          ) : (
            <>
              The InnenFlow family is glad you came back. Every day you show up is
              one more day you chose yourself over the noise.
              <br />
              <br />
              One honest line is enough. Begin where you are.
            </>
          )}
        </p>

        {/* ── the three things they get ── */}
        <div className="mt-6 flex w-full justify-evenly">
          <Perk emoji="📖" label="Journal" />
          <Perk emoji="🧘" label="Meditate" />
          <Perk emoji="🔥" label="Build a streak" />
        </div>

        <button
          type="button"
          onClick={() => setKind(null)}
          className="btn-primary mt-7 w-full"
        >
          {first ? 'Begin my first day' : 'Continue'}
        </button>
      </div>
    </Modal>
  );
}

function Perk({ emoji, label }: { emoji: string; label: string }) {
  return (
    <span className="flex flex-col items-center gap-1.5">
      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/15 text-lg">
        {emoji}
      </span>
      <span className="text-[11px] text-ink-muted">{label}</span>
    </span>
  );
}
