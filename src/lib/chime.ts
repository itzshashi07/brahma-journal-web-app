'use client';

/**
 * The bells on the meditation timer.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * Why these are synthesised rather than audio files
 *
 * A singing bowl sample is 200–400KB, has to be hosted, cached and licensed,
 * and fails silently on a slow connection at the exact moment it is needed —
 * which on this screen is the moment somebody has their eyes closed and is
 * waiting to be told the sitting is over. An oscillator with an exponential
 * decay is a few lines, weighs nothing, starts instantly and cannot 404.
 *
 * The shape is a struck bell: a fundamental plus a fifth above it, both decaying
 * exponentially. Real bells are inharmonic and this is not one, but the point is
 * a soft round tone that does not startle somebody out of a slow breath.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * The autoplay policy, and why nothing here throws
 *
 * A browser will not let a page make noise until the person has interacted with
 * it. Every call here happens after a tap — Begin, Pause, End — which is what
 * unlocks the context, and the context is created lazily on that first tap for
 * the same reason. If it is still blocked, or the device has no audio at all,
 * the call resolves and nothing is heard. A meditation timer that throws an
 * error dialog because a bell could not ring is worse than a silent bell.
 */

let context: AudioContext | null = null;

function audio(): AudioContext | null {
  if (typeof window === 'undefined') return null;

  try {
    if (!context) {
      const Ctor =
        window.AudioContext ??
        (window as unknown as { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext;
      if (!Ctor) return null;
      context = new Ctor();
    }
    // Suspended is the normal state on a page that has not been tapped yet, and
    // on a tab that has been backgrounded and come back.
    if (context.state === 'suspended') void context.resume();
    return context;
  } catch {
    return null;
  }
}

/** One struck note. `at` is an offset in seconds, for sequences. */
function strike(
  frequency: number,
  { at = 0, duration = 1.6, gain = 0.22 } = {}
): void {
  const ctx = audio();
  if (!ctx) return;

  const start = ctx.currentTime + at;

  const play = (freq: number, level: number) => {
    const osc = ctx.createOscillator();
    const amp = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, start);

    // Struck, not switched on: the attack is 12ms so it has an edge, and the
    // decay is exponential because that is what a physical resonator does.
    // A linear fade to zero sounds like a synthesiser being turned down.
    amp.gain.setValueAtTime(0.0001, start);
    amp.gain.exponentialRampToValueAtTime(level, start + 0.012);
    amp.gain.exponentialRampToValueAtTime(0.0001, start + duration);

    osc.connect(amp).connect(ctx.destination);
    osc.start(start);
    osc.stop(start + duration + 0.05);
  };

  play(frequency, gain);
  // The fifth above, quieter — this is what makes it read as a bell rather
  // than as a test tone.
  play(frequency * 1.5, gain * 0.35);
}

/** Sitting down. One note, low and unhurried. */
export function chimeStart(): void {
  strike(432, { duration: 2.2, gain: 0.2 });
}

/**
 * Getting up early, or pausing. A single higher note, deliberately shorter
 * than the completion bell so the two are never confused with each other.
 */
export function chimeStop(): void {
  strike(528, { duration: 1.1, gain: 0.16 });
}

/**
 * The sitting finished on its own.
 *
 * Three notes, rising, spaced widely enough to be heard as three. This is the
 * only bell that means "you are done", and it is the one somebody is waiting
 * for with their eyes shut, so it is the most distinct of the three.
 */
export function chimeComplete(): void {
  strike(396, { at: 0, duration: 2.4, gain: 0.22 });
  strike(528, { at: 0.55, duration: 2.4, gain: 0.22 });
  strike(639, { at: 1.1, duration: 3.2, gain: 0.24 });
}

/** A quiet tick under the breathing guide, on each change of phase. */
export function chimePhase(): void {
  strike(720, { duration: 0.35, gain: 0.05 });
}

/**
 * Wakes the audio context from inside a gesture handler.
 *
 * Called on the tap that starts a sitting, so that a bell scheduled minutes
 * later — when there is no gesture to attach it to — still sounds.
 */
export function unlockAudio(): void {
  audio();
}
