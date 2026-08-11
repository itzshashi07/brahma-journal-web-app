'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Mic, Square } from 'lucide-react';

/**
 * Speaking instead of typing.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * Why dictation and not a voice recording
 *
 * "A mic on the journal" can mean two things. Recording audio means storing
 * somebody's voice describing the worst part of their day on a server, which is
 * a different privacy promise from the one this product makes — the journal is
 * text, scoped to an account, and the deletion route sweeps it in one pass. A
 * voice note is biometric-adjacent data with no expiry, and it would want a
 * player, a waveform, a transfer limit and a retention policy before it was
 * honest.
 *
 * Dictation gives the thing that was actually being asked for — not having to
 * type at 1am — and produces the same journal entry as the keyboard does. The
 * audio never leaves the moment: what is stored is the sentence.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * What this is built on, and where it does not work
 *
 * The Web Speech API. Chrome, Edge and Safari have it; Firefox does not, and no
 * shim would change that, so on Firefox the button is simply absent rather than
 * present and broken. Recognition on Chrome is performed by Google's service,
 * which is a fact worth stating to somebody about to dictate a journal entry —
 * hence the line under the button rather than a silent upload.
 *
 * `continuous` is on because people pause mid-thought and a recogniser that
 * stops on the first silence turns one sentence into three taps. `interim` is
 * on so there is something on screen while they speak; interim text is shown
 * greyed and is replaced, never appended, or every hesitation ends up in the
 * entry twice.
 */

// The API is not in TypeScript's DOM library, so the shape used here is
// declared rather than imported. Only the parts actually touched.
type SpeechRecognitionAlternative = { transcript: string };
type SpeechRecognitionResult = {
  isFinal: boolean;
  0: SpeechRecognitionAlternative;
  length: number;
};
type SpeechRecognitionEventLike = {
  resultIndex: number;
  results: { length: number; [index: number]: SpeechRecognitionResult };
};
type SpeechRecognitionLike = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: { error?: string }) => void) | null;
  onend: (() => void) | null;
};

function recogniser(): SpeechRecognitionLike | null {
  if (typeof window === 'undefined') return null;
  const Ctor =
    (window as unknown as { SpeechRecognition?: new () => SpeechRecognitionLike })
      .SpeechRecognition ??
    (
      window as unknown as {
        webkitSpeechRecognition?: new () => SpeechRecognitionLike;
      }
    ).webkitSpeechRecognition;
  if (!Ctor) return null;
  try {
    return new Ctor();
  } catch {
    return null;
  }
}

export function dictationSupported(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    'SpeechRecognition' in window || 'webkitSpeechRecognition' in window
  );
}

/** The languages people actually write this journal in. */
export const DICTATION_LANGS = [
  { value: 'en-IN', label: 'English' },
  { value: 'hi-IN', label: 'हिंदी' },
] as const;

export function DictationButton({
  lang = 'en-IN',
  onFinal,
  onInterim,
  label = 'Dictate',
  className = '',
}: {
  lang?: string;
  /** A finished sentence. Append it. */
  onFinal: (text: string) => void;
  /** What is being said right now. Replace, never append. */
  onInterim?: (text: string) => void;
  label?: string;
  className?: string;
}) {
  const [listening, setListening] = useState(false);
  const [supported, setSupported] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const engine = useRef<SpeechRecognitionLike | null>(null);

  /**
   * The callbacks, through refs.
   *
   * `onresult` is assigned once, when recognition starts, and then fires for
   * every sentence after that — so a handler that closed over the props of that
   * one render would keep calling the first version of `onFinal` forever. The
   * caller's `onFinal` appends to the field's *current* text, so the second
   * dictated sentence would be appended to what the field held before the first
   * one, silently erasing it. Reading through a ref means the handler always
   * calls the version from the latest render.
   */
  const finalRef = useRef(onFinal);
  finalRef.current = onFinal;
  const interimRef = useRef(onInterim);
  interimRef.current = onInterim;

  // Checked after mount: `window` does not exist during the server render, and
  // rendering the button and then removing it would flash a control that the
  // browser cannot honour.
  useEffect(() => setSupported(dictationSupported()), []);

  const stop = useCallback(() => {
    engine.current?.stop();
    engine.current = null;
    setListening(false);
    interimRef.current?.('');
  }, []);

  // A recogniser left running when the composer closes keeps the microphone
  // indicator lit in the tab, which is alarming and fair enough.
  useEffect(() => () => engine.current?.abort(), []);

  const start = useCallback(() => {
    setError(null);

    const engine_ = recogniser();
    if (!engine_) {
      setSupported(false);
      return;
    }

    engine_.lang = lang;
    engine_.continuous = true;
    engine_.interimResults = true;

    engine_.onresult = (event) => {
      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const result = event.results[i];
        const text = result[0]?.transcript ?? '';
        if (result.isFinal) finalRef.current(text.trim());
        else interim += text;
      }
      interimRef.current?.(interim.trim());
    };

    engine_.onerror = (event) => {
      // `no-speech` fires on an ordinary pause and is not worth a message; a
      // refused permission is, because nothing will happen until it is granted
      // and the browser does not always make that obvious.
      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        setError('The microphone is blocked for this site. Allow it in the address bar.');
      } else if (event.error && event.error !== 'no-speech' && event.error !== 'aborted') {
        setError('Dictation stopped. Try again.');
      }
      setListening(false);
      engine.current = null;
      interimRef.current?.('');
    };

    engine_.onend = () => {
      setListening(false);
      engine.current = null;
      interimRef.current?.('');
    };

    try {
      engine_.start();
      engine.current = engine_;
      setListening(true);
    } catch {
      // `start()` on an engine that is already running throws. Treating it as
      // "already listening" is the truthful reading.
      setListening(true);
    }
  }, [lang]);

  if (!supported) return null;

  return (
    <span className={`inline-flex flex-col items-start gap-1 ${className}`}>
      <button
        type="button"
        onClick={listening ? stop : start}
        aria-pressed={listening}
        aria-label={listening ? 'Stop dictating' : label}
        className={`inline-flex items-center gap-1.5 rounded-pill px-3 py-1.5 text-[11.5px] font-semibold transition ${
          listening
            ? 'bg-danger/20 text-red-300'
            : 'border border-hairline text-ink-muted hover:border-primary/50 hover:text-ink-secondary'
        }`}
      >
        {listening ? (
          <>
            {/* A dot that pulses, because "is it actually listening?" is the
                only question anybody has while dictating. */}
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-red-400" />
            </span>
            <Square className="h-3 w-3" /> Stop
          </>
        ) : (
          <>
            <Mic className="h-3.5 w-3.5" /> {label}
          </>
        )}
      </button>

      {error && <span className="text-[11px] text-danger">{error}</span>}
    </span>
  );
}
