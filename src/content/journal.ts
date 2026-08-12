/**
 * Tap-to-select options for the daily journal.
 *
 * A port of `lib/core/constants/journal_options.dart`, ids included. Most days
 * people do not want to compose paragraphs — they want to record what happened
 * in twenty seconds. Every field is optional and selectable; the free-text boxes
 * remain for the days someone has more to say.
 *
 * **Deliberately open to every faith and none.** The journal once asked for a
 * "Shiv Baba line", which only makes sense inside one tradition. The wording is
 * about practice and reflection, so a Hindu, Muslim, Christian, Sikh, Buddhist
 * or entirely secular member can all use the same page honestly. The *field* is
 * still called `shivBabaLine` on the wire because that is what a decade of
 * entries are stored under; only the words on screen changed.
 */

export interface Option {
  id: string;
  label: string;
  emoji: string;
}

const opts = (rows: [string, string, string][]): Option[] =>
  rows.map(([id, label, emoji]) => ({ id, label, emoji }));

/** How the day felt overall. */
export const ENERGY_LEVELS = opts([
  ['drained', 'Drained', '🪫'],
  ['low', 'Low', '🌥️'],
  ['steady', 'Steady', '🌤️'],
  ['good', 'Good', '☀️'],
  ['radiant', 'Radiant', '✨'],
]);

/** Practices, named so they belong to no single tradition. */
export const PRACTICES = opts([
  ['meditation', 'Meditation', '🧘'],
  ['prayer', 'Prayer', '🙏'],
  ['scripture', 'Scripture / Reading', '📖'],
  ['gratitude', 'Gratitude', '💛'],
  ['service', 'Service to others', '🤲'],
  ['silence', 'Silence', '🤫'],
  ['nature', 'Time in nature', '🌿'],
  ['chanting', 'Chanting / Music', '🎵'],
]);

/** What shaped the day. */
export const INFLUENCES = opts([
  ['family', 'Family', '👨‍👩‍👧'],
  ['work', 'Work', '💼'],
  ['health', 'Health', '🩺'],
  ['friends', 'Friends', '🫂'],
  ['money', 'Money', '💰'],
  ['study', 'Study', '📚'],
  ['solitude', 'Solitude', '🌙'],
  ['travel', 'Travel', '✈️'],
]);

/** Habits worth noticing, phrased without judgement. */
export const HABITS = opts([
  ['early_rise', 'Woke early', '🌅'],
  ['exercise', 'Moved my body', '🏃'],
  ['ate_well', 'Ate well', '🥗'],
  ['slept_well', 'Slept well', '😴'],
  ['screen_limit', 'Limited screens', '📵'],
  ['helped', 'Helped someone', '🤝'],
  ['learned', 'Learned something', '💡'],
  ['rested', 'Rested properly', '🛋️'],
]);

/**
 * What pulled at you today — chosen instead of typed, because naming a
 * difficulty from a list is far easier than writing about it.
 */
export const CHALLENGES = opts([
  ['anger', 'Anger', '🔥'],
  ['worry', 'Worry', '😰'],
  ['comparison', 'Comparison', '👀'],
  ['procrastination', 'Putting things off', '⏳'],
  ['overthinking', 'Overthinking', '🌀'],
  ['loneliness', 'Loneliness', '🕯️'],
  ['impatience', 'Impatience', '⏱️'],
  ['none', 'Nothing much', '🕊️'],
]);

/**
 * The label for a stored id.
 *
 * Falls back to the de-underscored id so an entry written against an older
 * release still reads as words rather than as a key.
 */
export function labelFor(list: Option[], id: string): string {
  return list.find((o) => o.id === id)?.label ?? id.replace(/_/g, ' ');
}

export function emojiFor(list: Option[], id: string): string {
  return list.find((o) => o.id === id)?.emoji ?? '';
}

/** The mood scale the journal, the check-in and the charts all agree about. */
export const MOODS = [
  { value: 1, emoji: '😔', label: 'Struggling', color: 'bg-mood-verySad', hex: '#6366F1' },
  { value: 2, emoji: '😕', label: 'Low', color: 'bg-mood-sad', hex: '#8B5CF6' },
  { value: 3, emoji: '😐', label: 'Okay', color: 'bg-mood-neutral', hex: '#F59E0B' },
  { value: 4, emoji: '🙂', label: 'Good', color: 'bg-mood-happy', hex: '#10B981' },
  { value: 5, emoji: '😊', label: 'Wonderful', color: 'bg-mood-veryHappy', hex: '#06D6A0' },
] as const;

export function moodLabel(mood?: number | null): string {
  return MOODS.find((m) => m.value === mood)?.label ?? 'Okay';
}

/**
 * Shown after the mood is chosen — the app answering rather than only
 * collecting. A low mood should never be met with silence.
 */
export function moodResponse(mood: number): string {
  switch (mood) {
    case 1:
      return 'Thank you for saying so. Heavy days are worth recording too — they are part of the picture, and they pass.';
    case 2:
      return 'That is alright. Not every day has to be a good one.';
    case 3:
      return 'An ordinary day is still a day you showed up for.';
    case 4:
      return 'Good to hear. Worth noticing when things go well.';
    default:
      return 'That is lovely. Hold on to this one.';
  }
}

/** Shown on the closing card, so the check-in ends with a sentence. */
export function moodFarewell(mood: number): string {
  switch (mood) {
    case 1:
      return 'You showed up on a hard day. That is the whole practice.';
    case 2:
      return 'Written down and kept. Tomorrow gets to be different.';
    case 3:
      return 'Noted, exactly as it was. See you tomorrow.';
    case 4:
      return 'Saved. Good days are worth the same ink as hard ones.';
    default:
      return 'Saved. Come back and read this one when you need it.';
  }
}

/**
 * Lines shown when the journal opens, to give a reason to begin.
 *
 * Chosen by day so the same person sees the same one all day — a prompt that
 * changes on every render reads as decoration rather than as something said to
 * you.
 */
const PROMPT_LINES = [
  'The day you least feel like writing is usually the one worth recording.',
  'You are not writing for anyone. Say the true thing.',
  'Five honest sentences beat five polished paragraphs.',
  'What went well today? Start there — the mind will skip it otherwise.',
  'Nobody reads this but you. Nothing here has to be impressive.',
  'A streak is not built by good days. It is built by showing up on ordinary ones.',
  'Name the feeling and it loosens its grip a little.',
  'What would you tell a friend who had lived your day?',
  'The version of you reading this in a year will be glad you wrote it.',
  'Progress is invisible day to day and obvious month to month.',
  'You survived every day you thought you could not. Today is on that list.',
  'Write the thing you would rather not write. That is where it is.',
  'Small and true beats long and performed.',
  'What are you carrying that is not yours to carry?',
  'One page today is one page more than yesterday.',
];

/** The day of the year in local time — the index everything daily rotates on. */
export function dayOfYear(now = new Date()): number {
  const start = new Date(now.getFullYear(), 0, 1);
  return Math.floor((now.getTime() - start.getTime()) / 86_400_000);
}

export function promptForToday(now = new Date()): string {
  return PROMPT_LINES[dayOfYear(now) % PROMPT_LINES.length];
}
