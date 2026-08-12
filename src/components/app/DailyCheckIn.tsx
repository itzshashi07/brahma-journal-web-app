'use client';

import { useCallback, useMemo, useState } from 'react';
import { ArrowLeft } from 'lucide-react';

import {
  DICTATION_LANGS,
  DictationButton,
  dictationSupported,
} from './Dictation';
import { Modal, TextChipGroup } from './ui';
import { questionsForToday, type CheckInQuestion } from '@/content/checkin';
import { MOODS, moodFarewell, moodResponse } from '@/content/journal';
import { api } from '@/lib/api';
import type { Entry } from '@/lib/entries';

/**
 * The daily check-in, shown once a day.
 *
 * A port of `screens/checkin/daily_checkin_sheet.dart`. Deliberately a
 * conversation rather than a form: one question on screen at a time, every one
 * skippable, and the app responds to the mood rather than silently recording it.
 * Someone who says today was heavy should not be met with a progress bar.
 *
 * Every question can be answered by tapping. That is the change that decides
 * whether this gets used at all — an empty text box asks for an essay, and at
 * the end of a long day the honest response to an essay is to close the sheet.
 * Underneath the chips the keyboard and microphone stay available for anyone who
 * does want to say more.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * It writes the same record the journal does
 *
 * Completing it merges into **today's** entry rather than creating a second one,
 * so the check-in feeds the same streak, insights and leaderboard as the full
 * journal. Two paths to one record, rather than two records that can disagree —
 * and the reason the composer on the journal page PATCHes for the same day.
 */
export function DailyCheckIn({
  today,
  onClose,
  onSaved,
}: {
  /** Today's entry, if one already exists. Merged into rather than replaced. */
  today: Entry | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const questions = useMemo(() => questionsForToday(), []);

  /** -1 is the mood step; `questions.length` is the closing card. */
  const [step, setStep] = useState(-1);
  const [mood, setMood] = useState<number | null>(today?.mood ?? null);
  const [picked, setPicked] = useState<Record<string, string[]>>({});
  const [typed, setTyped] = useState<Record<string, string>>({});
  const [interim, setInterim] = useState('');
  const [lang, setLang] = useState<string>(DICTATION_LANGS[0].value);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /** A question counts as answered if anything was tapped or written. */
  const answerFor = useCallback(
    (question: CheckInQuestion): string | null => {
      const chips = picked[question.id] ?? [];
      const written = (typed[question.id] ?? '').trim();
      if (chips.length === 0 && !written) return null;
      if (chips.length === 0) return written;
      if (!written) return chips.join(', ');
      return `${chips.join(', ')} — ${written}`;
    },
    [picked, typed]
  );

  const onClosingCard = step >= questions.length;
  const question = onClosingCard || step < 0 ? null : questions[step];

  function skip() {
    if (!question) return;
    setPicked((current) => {
      const next = { ...current };
      delete next[question.id];
      return next;
    });
    setTyped((current) => {
      const next = { ...current };
      delete next[question.id];
      return next;
    });
    advance();
  }

  function advance() {
    setInterim('');
    if (step + 1 >= questions.length) {
      setStep(questions.length);
      void finish();
      return;
    }
    setStep((current) => current + 1);
  }

  async function finish() {
    setSaving(true);
    setError(null);

    const answers: Record<string, string> = {};
    for (const item of questions) {
      const answer = answerFor(item);
      if (answer) answers[item.id] = answer;
    }

    try {
      const body: Record<string, unknown> = {
        mood: mood ?? today?.mood ?? 3,
        // Merged with whatever is already there, so a check-in answered twice in
        // a day — or after a rotating question changed — adds rather than
        // replaces.
        checkIn: { ...(today?.checkIn ?? {}), ...answers },
      };

      // 'exciting' is the one question whose answer is prose about the day
      // itself, so it doubles as the entry's one line when nothing has claimed
      // that yet. It never overwrites something already written.
      if (answers.exciting && !today?.bestMoment?.trim()) {
        body.bestMoment = answers.exciting;
      }

      if (today) await api.patch(`/api/entries/${today._id}`, body);
      else await api.post('/api/entries', body);

      onSaved();
    } catch {
      // Back to the last question rather than stranding them on a card with
      // nothing to press — every answer is still in state, so pressing Finish
      // again retries with nothing lost.
      setStep(questions.length - 1);
      setError('Could not save. Your answers are still here.');
    } finally {
      setSaving(false);
    }
  }

  const answered = questions.filter((item) => answerFor(item) !== null).length;

  return (
    <Modal
      open
      onClose={onClose}
      label="Daily check-in"
      // Dismissible only at the very start and the very end. Losing four
      // answered questions to a stray tap on the backdrop is the kind of thing
      // somebody does not come back from.
      dismissible={step < 0 || onClosingCard}
    >
      {step < 0 && (
        <MoodStep
          mood={mood}
          onPick={setMood}
          onNext={() => setStep(0)}
          onSkip={onClose}
        />
      )}

      {question && (
        <>
          <div className="mb-4 flex items-center gap-3">
            {step > 0 && (
              <button
                type="button"
                onClick={() => setStep((current) => current - 1)}
                aria-label="Previous question"
                className="rounded-md p-1 text-ink-muted transition hover:text-ink-primary"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
            )}
            <div className="h-1 flex-1 overflow-hidden rounded-pill bg-bg-dark">
              <div
                className="h-full rounded-pill bg-gradient-primary transition-all"
                style={{ width: `${((step + 1) / questions.length) * 100}%` }}
              />
            </div>
            <span className="text-[11px] tabular-nums text-ink-muted">
              {step + 1} of {questions.length}
            </span>
          </div>

          <p className="text-2xl" aria-hidden="true">
            {question.emoji}
          </p>
          <h2 className="mt-1.5 text-[18px] font-semibold leading-snug text-ink-primary">
            {question.prompt}
          </h2>
          <p className="mt-1 text-[12.5px] leading-relaxed text-ink-muted">
            {question.hint}
          </p>

          {question.options.length > 0 && (
            <div className="mt-4">
              <TextChipGroup
                options={question.options}
                selected={picked[question.id] ?? []}
                onChange={(next) =>
                  setPicked((current) => ({ ...current, [question.id]: next }))
                }
                single={question.input !== 'pickMany'}
                ariaLabel={question.prompt}
              />
            </div>
          )}

          <div className="mt-4">
            <div className="mb-1.5 flex items-center">
              {dictationSupported() && (
                <>
                  <select
                    aria-label="Dictation language"
                    className="rounded-md border border-hairline bg-bg-dark/60 px-2 py-1 text-[11.5px] text-ink-secondary focus:border-primary focus:outline-none"
                    value={lang}
                    onChange={(event) => setLang(event.target.value)}
                  >
                    {DICTATION_LANGS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <span className="ml-auto">
                    <DictationButton
                      lang={lang}
                      onInterim={setInterim}
                      onFinal={(text) =>
                        setTyped((current) => {
                          const existing = current[question.id] ?? '';
                          return {
                            ...current,
                            [question.id]: existing
                              ? `${existing.replace(/\s+$/, '')} ${text}`.trim()
                              : text,
                          };
                        })
                      }
                      label={question.input === 'speak' ? 'Just say it' : 'Speak'}
                    />
                  </span>
                </>
              )}
            </div>

            <textarea
              rows={question.input === 'speak' ? 4 : 2}
              className="field resize-y"
              aria-label={question.writeHint}
              placeholder={question.writeHint}
              value={typed[question.id] ?? ''}
              onChange={(event) =>
                setTyped((current) => ({
                  ...current,
                  [question.id]: event.target.value,
                }))
              }
            />

            {interim && (
              <p className="mt-1 text-[12px] italic text-ink-muted" aria-live="polite">
                {interim}…
              </p>
            )}
          </div>

          {error && (
            <p
              role="alert"
              className="mt-3 rounded-md border border-danger/40 bg-danger/10 px-3 py-2 text-[12.5px] text-ink-secondary"
            >
              {error}
            </p>
          )}

          <div className="mt-5 flex items-center gap-2">
            <button
              type="button"
              onClick={skip}
              className="flex-1 rounded-md py-3 text-[12.5px] text-ink-muted transition hover:text-ink-secondary"
            >
              {question.skipLabel}
            </button>
            <button
              type="button"
              onClick={advance}
              disabled={saving}
              className="btn-primary flex-[2] !py-3"
            >
              {step + 1 >= questions.length ? 'Finish' : 'Next'}
            </button>
          </div>
        </>
      )}

      {onClosingCard && (
        <div className="py-2 text-center">
          <p className="text-4xl" aria-hidden="true">
            {saving ? '🕯️' : '🪷'}
          </p>
          <h2 className="mt-3 text-[18px] font-semibold text-ink-primary">
            {saving ? 'Saving…' : 'Kept.'}
          </h2>
          <p className="mx-auto mt-2 max-w-xs text-[13px] leading-relaxed text-ink-secondary">
            {saving
              ? 'One moment.'
              : moodFarewell(mood ?? today?.mood ?? 3)}
          </p>
          {!saving && (
            <p className="mt-3 text-[11.5px] text-ink-muted">
              {answered === 0
                ? 'Mood only — which is a complete entry.'
                : `${answered} ${answered === 1 ? 'answer' : 'answers'} written into today.`}
            </p>
          )}
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="btn-primary mt-6 w-full"
          >
            Done
          </button>
        </div>
      )}
    </Modal>
  );
}

/**
 * The mood step.
 *
 * Answered before anything else and answered back: picking "today was heavy"
 * shows a sentence acknowledging it rather than advancing a progress bar, which
 * is the difference between being asked after and being audited.
 */
function MoodStep({
  mood,
  onPick,
  onNext,
  onSkip,
}: {
  mood: number | null;
  onPick: (value: number) => void;
  onNext: () => void;
  onSkip: () => void;
}) {
  return (
    <>
      <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-muted">
        Daily check-in
      </p>
      <h2 className="mt-1.5 text-[19px] font-semibold text-ink-primary">
        How are you, honestly?
      </h2>
      <p className="mt-1 text-[12.5px] leading-relaxed text-ink-muted">
        One tap. Nobody else sees this, so there is nothing to perform.
      </p>

      <div className="mt-5 space-y-2">
        {MOODS.map((item) => (
          <button
            key={item.value}
            type="button"
            onClick={() => onPick(item.value)}
            aria-pressed={mood === item.value}
            className={`flex w-full items-center gap-3 rounded-md border px-4 py-3 text-left transition ${
              mood === item.value
                ? 'border-primary bg-primary/15'
                : 'border-hairline bg-bg-dark/40 hover:border-primary/50'
            }`}
          >
            <span className="text-xl" aria-hidden="true">
              {item.emoji}
            </span>
            <span className="text-[13.5px] font-medium text-ink-primary">
              {item.label}
            </span>
          </button>
        ))}
      </div>

      {mood !== null && (
        <p className="mt-4 rounded-md border border-primary/30 bg-primary/10 px-3.5 py-3 text-[12.5px] leading-relaxed text-ink-secondary">
          {moodResponse(mood)}
        </p>
      )}

      <div className="mt-5 flex items-center gap-2">
        <button
          type="button"
          onClick={onSkip}
          className="flex-1 rounded-md py-3 text-[12.5px] text-ink-muted transition hover:text-ink-secondary"
        >
          Not today
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={mood === null}
          className="btn-primary flex-[2] !py-3 disabled:opacity-50"
        >
          Go on
        </button>
      </div>
    </>
  );
}
