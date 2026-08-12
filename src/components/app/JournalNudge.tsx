'use client';

import { useCallback, useState } from 'react';

import {
  DICTATION_LANGS,
  DictationButton,
  dictationSupported,
} from './Dictation';
import { ChipGroup, Modal } from './ui';
import {
  CHALLENGES,
  ENERGY_LEVELS,
  HABITS,
  INFLUENCES,
  PRACTICES,
  type Option,
} from '@/content/journal';
import {
  checklistFor,
  isKnownProfession,
  professionById,
} from '@/content/professions';
import { api } from '@/lib/api';
import { todayKey, type Entry, type EntryDraft } from '@/lib/entries';

/**
 * One question, asked at a random moment, filling one gap in today's entry.
 *
 * A port of `widgets/quick_prompt.dart`, limits included.
 *
 * The daily check-in catches people once. After that the journal only gets
 * filled if somebody deliberately opens it, and most days nobody does — so an
 * entry ends up with a mood and one line, and the insights screen has nothing to
 * show for the month. This closes the gap by asking rather than waiting to be
 * visited: whenever the dashboard opens, there is a chance of one small question
 * about something today's entry is still missing.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * The limits are the feature
 *
 * An app that asks a question every time it opens is closed for good by the end
 * of the week. So: at most three prompts a day, at least forty minutes between
 * two of them, never within twenty minutes of the check-in, and even when all of
 * that passes only a 55% chance — so the prompt does not become a predictable
 * toll booth on the home screen.
 *
 * The day's *first* prompt is not left to chance, though. A purely random nudge
 * means somebody who opens the site once a day has a 45% chance of never being
 * asked anything, and the whole point is that the journal keeps filling itself
 * in. So the first one each day is certain; the second and third roll the die.
 *
 * Only gaps are asked about, so a member who has filled everything in is never
 * interrupted at all.
 */

const MAX_PER_DAY = 3;
const MIN_GAP_MS = 40 * 60 * 1000;
const GRACE_AFTER_CHECKIN_MS = 20 * 60 * 1000;
const CHANCE = 0.55;

const COUNT_KEY = (day: string) => `nudge_count_${day}`;
const LAST_KEY = 'nudge_last_at';
const CHECKIN_SHOWN_KEY = 'checkin_shown_at';

function readNumber(key: string): number {
  try {
    return Number(window.localStorage.getItem(key) ?? 0) || 0;
  } catch {
    return 0;
  }
}

function writeNumber(key: string, value: number) {
  try {
    window.localStorage.setItem(key, String(value));
  } catch {
    // Storage disabled. The limits stop being enforced across reloads, which is
    // a cosmetic failure; throwing here would break the dashboard.
  }
}

/** Recorded by the check-in so a nudge cannot land straight after it. */
export function markCheckInShown() {
  writeNumber(CHECKIN_SHOWN_KEY, Date.now());
}

// ─────────────────────────── what can be asked ───────────────────────────

/**
 * One askable gap in a journal entry: how to ask it, whether today's entry still
 * has room for it, and which field the answer belongs in.
 *
 * `field` rather than a merge function, because the write is a PATCH of one key
 * — the server holds the rest of the entry, so there is nothing to copy through
 * and no way for a nudge to erase what somebody wrote in the full journal.
 */
type Slot = {
  id: string;
  emoji: string;
  prompt: string;
  hint: string;
  options?: Option[];
  single?: boolean;
  wantsText?: boolean;
  writeHint?: string;
  isEmpty: (entry: Entry | null) => boolean;
  apply: (chips: string[], text: string) => EntryDraft;
};

const SLOTS: Slot[] = [
  {
    id: 'energy',
    emoji: '🔋',
    prompt: 'How is your energy right now?',
    hint: 'One tap. It goes straight into today.',
    options: ENERGY_LEVELS,
    single: true,
    isEmpty: (entry) => !entry?.energyLevel,
    apply: (chips) => ({ energyLevel: chips[0] ?? '' }),
  },
  {
    id: 'practices',
    emoji: '🧘',
    prompt: 'Done any of these today?',
    hint: 'Tap any that apply. Nothing counts as an answer too.',
    options: PRACTICES,
    isEmpty: (entry) => (entry?.practices?.length ?? 0) === 0,
    apply: (chips) => ({ practices: chips }),
  },
  {
    id: 'influences',
    emoji: '🌊',
    prompt: 'What has been shaping today?',
    hint: 'Whatever has taken up the most room in your head.',
    options: INFLUENCES,
    isEmpty: (entry) => (entry?.influences?.length ?? 0) === 0,
    apply: (chips) => ({ influences: chips }),
  },
  {
    id: 'habits',
    emoji: '✅',
    prompt: 'Anything go right today?',
    hint: 'Small things count. They are mostly what there is.',
    options: HABITS,
    isEmpty: (entry) => (entry?.habitsDone?.length ?? 0) === 0,
    apply: (chips) => ({ habitsDone: chips }),
  },
  {
    id: 'challenges',
    emoji: '🌀',
    prompt: 'Anything pulling at you?',
    hint: 'Naming it is the whole exercise. You do not have to fix it.',
    options: CHALLENGES,
    isEmpty: (entry) => (entry?.challenges?.length ?? 0) === 0,
    apply: (chips) => ({ challenges: chips }),
  },
  {
    id: 'line',
    emoji: '✍️',
    prompt: 'Say one line about today',
    hint: 'Type it, or tap the mic and speak it.',
    wantsText: true,
    writeHint: 'Anything at all. One sentence is enough.',
    isEmpty: (entry) => !entry?.bestMoment?.trim(),
    apply: (_chips, text) => ({ bestMoment: text }),
  },
  {
    id: 'tiny_step',
    emoji: '👣',
    prompt: 'What is one small thing you did today?',
    hint: 'It does not have to be impressive. It has to be true.',
    wantsText: true,
    writeHint: 'One small step…',
    isEmpty: (entry) => !entry?.tinyStep?.trim(),
    apply: (_chips, text) => ({ tinyStep: text }),
  },
  {
    id: 'line_kept',
    emoji: '📖',
    prompt: 'Read or heard anything worth keeping?',
    hint: 'A line from a book, a talk, a song, a person.',
    wantsText: true,
    writeHint: 'The line that stayed with you…',
    isEmpty: (entry) => !entry?.shivBabaLine?.trim(),
    apply: (_chips, text) => ({ shivBabaLine: text }),
  },
  {
    id: 'sleep',
    emoji: '😴',
    prompt: 'How did you sleep last night?',
    hint: 'Sleep explains more of a mood than anything else does.',
    wantsText: true,
    writeHint: 'Well, badly, dreams, none of it…',
    isEmpty: (entry) => !entry?.sleepReflection?.trim(),
    apply: (_chips, text) => ({ sleepReflection: text }),
  },
];

/**
 * The craft question, which only exists once a member has named a craft.
 *
 * Built per call rather than declared as a constant, because the options are
 * this member's own habits — a singer must not be asked whether they revised for
 * an exam.
 */
function craftSlot(
  profession: string | null | undefined,
  customHabits: { id: string; label: string }[]
): Slot | null {
  if (!isKnownProfession(profession)) return null;
  const craft = professionById(profession);

  return {
    id: 'craft',
    emoji: craft.emoji,
    prompt: `Any ${craft.workWord} today?`,
    hint: 'Tap what you did. This is the one that builds your streak.',
    options: checklistFor(
      profession,
      customHabits.map((habit) => ({ ...habit, emoji: '✅' }))
    ),
    isEmpty: (entry) => (entry?.craftDone?.length ?? 0) === 0,
    apply: (chips) => ({ craftDone: chips }),
  };
}

// ─────────────────────────── when to ask ───────────────────────────

/**
 * Decides whether to interrupt, and with what. Returns null to stay quiet.
 *
 * Called once when the dashboard mounts. It records the decision *before* the
 * sheet is shown, so a member who closes it without answering has still used one
 * of the day's three.
 */
export function pickNudge(
  today: Entry | null,
  profession: string | null | undefined,
  customHabits: { id: string; label: string }[]
): Slot | null {
  if (typeof window === 'undefined') return null;

  const day = todayKey();
  const shownToday = readNumber(COUNT_KEY(day));
  if (shownToday >= MAX_PER_DAY) return null;

  const since = Date.now() - readNumber(LAST_KEY);
  if (since < MIN_GAP_MS) return null;

  const checkInAt = readNumber(CHECKIN_SHOWN_KEY);
  if (checkInAt > 0 && Date.now() - checkInAt < GRACE_AFTER_CHECKIN_MS) {
    return null;
  }

  if (shownToday > 0 && Math.random() > CHANCE) return null;

  const craft = craftSlot(profession, customHabits);
  const candidates: Slot[] = [
    // Twice in the pool on purpose: the craft question is the one that feeds the
    // consistency chart, so it deserves roughly double the odds of a question
    // about last night's sleep.
    ...(craft ? [craft, craft] : []),
    ...SLOTS,
  ];

  // Ask about a gap, chosen at random among the gaps so the same question does
  // not arrive three days running.
  const open = candidates.filter((slot) => slot.isEmpty(today));
  if (open.length === 0) return null;

  writeNumber(COUNT_KEY(day), shownToday + 1);
  writeNumber(LAST_KEY, Date.now());

  return open[Math.floor(Math.random() * open.length)];
}

export type { Slot as NudgeSlot };

// ─────────────────────────── the sheet ───────────────────────────

export function JournalNudge({
  slot,
  today,
  onClose,
  onSaved,
}: {
  slot: Slot;
  today: Entry | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [picked, setPicked] = useState<string[]>([]);
  const [text, setText] = useState('');
  const [interim, setInterim] = useState('');
  const [lang, setLang] = useState<string>(DICTATION_LANGS[0].value);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasAnswer = picked.length > 0 || text.trim().length > 0;

  const append = useCallback((chunk: string) => {
    if (!chunk) return;
    setText((current) =>
      current ? `${current.replace(/\s+$/, '')} ${chunk}`.trim() : chunk
    );
  }, []);

  async function save() {
    setSaving(true);
    setError(null);
    try {
      const body = slot.apply(picked, text.trim());

      // PATCH when today already has an entry — the server keeps every other
      // field, so a nudge can never overwrite what was written in the full
      // journal. POST only when today is genuinely blank.
      if (today) await api.patch(`/api/entries/${today._id}`, body);
      else await api.post('/api/entries', body);

      onSaved();
    } catch {
      setError('Could not save that just now.');
      setSaving(false);
    }
  }

  return (
    <Modal open onClose={onClose} label="One quick thing">
      <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-ink-muted">
        <span aria-hidden="true">{slot.emoji}</span> One quick thing
      </p>

      <h2 className="mt-2.5 text-[18px] font-semibold leading-snug text-ink-primary">
        {slot.prompt}
      </h2>
      <p className="mt-1 text-[12.5px] leading-relaxed text-ink-muted">
        {slot.hint}
      </p>

      {slot.options && slot.options.length > 0 && (
        <div className="mt-4">
          <ChipGroup
            options={slot.options}
            selected={picked}
            onChange={setPicked}
            single={slot.single}
            ariaLabel={slot.prompt}
          />
        </div>
      )}

      {slot.wantsText && (
        <div className="mt-4">
          {dictationSupported() && (
            <div className="mb-1.5 flex items-center">
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
                  onFinal={append}
                  onInterim={setInterim}
                  label="Speak"
                />
              </span>
            </div>
          )}

          <textarea
            rows={3}
            className="field resize-y"
            aria-label={slot.writeHint ?? slot.prompt}
            placeholder={slot.writeHint}
            value={text}
            onChange={(event) => setText(event.target.value)}
          />

          {interim && (
            <p className="mt-1 text-[12px] italic text-ink-muted" aria-live="polite">
              {interim}…
            </p>
          )}
        </div>
      )}

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
          onClick={onClose}
          disabled={saving}
          className="flex-1 rounded-md py-3 text-[12.5px] text-ink-muted transition hover:text-ink-secondary"
        >
          Not now
        </button>
        <button
          type="button"
          onClick={save}
          disabled={!hasAnswer || saving}
          className="btn-primary flex-[2] !py-3 disabled:opacity-50"
        >
          {saving ? 'Saving…' : 'Add to today'}
        </button>
      </div>
    </Modal>
  );
}
