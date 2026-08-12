/**
 * The journal entry, as both clients understand it.
 *
 * Every field here exists on `models/JournalEntry.js` in the API and on
 * `models/journal_entry.dart` in the Flutter app. The website used to declare a
 * subset of six — so an entry written on the phone came back with its practices,
 * influences, challenges, craft work and check-in answers dropped on the floor
 * before anything could render them, and an entry written here was missing two
 * thirds of what the app expects to read.
 *
 * `shivBabaLine` keeps its name on the wire and is labelled "a line worth
 * keeping" on screen. Renaming the field would orphan every entry already
 * written against it; renaming the *label* is what actually mattered, because
 * the journal is meant to be usable by somebody of any faith or none.
 */
export type Entry = {
  _id: string;

  mood?: number;

  newHabit?: string;
  tinyStep?: string;
  badHabit?: string;
  affirmations?: string;
  visualization?: string;
  nightRoutine?: string;
  triggerThought?: string;
  triggerResponse?: string;
  bestMoment?: string;
  shivBabaLine?: string;
  sleepReflection?: string;
  energyLevel?: string;

  practices?: string[];
  influences?: string[];
  habitsDone?: string[];
  challenges?: string[];

  /** Prompt id → answer, from the daily check-in. */
  checkIn?: Record<string, string>;

  craftDone?: string[];
  craftMinutes?: number;

  createdAt: string;
  updatedAt?: string;
};

/** Everything the API's entry schema will accept on POST/PATCH. */
export type EntryDraft = Partial<Omit<Entry, '_id' | 'createdAt' | 'updatedAt'>>;

/**
 * True when the entry records work on the member's craft.
 *
 * Minutes alone count: somebody who logged forty minutes and ticked nothing
 * still practised, and the consistency chart would be lying to say otherwise.
 */
export function didCraft(entry?: Entry | null): boolean {
  if (!entry) return false;
  return (entry.craftDone?.length ?? 0) > 0 || (entry.craftMinutes ?? 0) > 0;
}

/**
 * The member's local calendar day for an instant.
 *
 * `new Date(iso)` parses the API's UTC timestamp; reading the date parts off it
 * in local time is what files an entry written at 1am under the day its author
 * would call it. Getting this wrong splits one late night across two cells of
 * the consistency grid and breaks streaks for anybody who journals after
 * midnight — which is most of them.
 */
export function localDayKey(input: string | Date): string {
  const d = typeof input === 'string' ? new Date(input) : input;
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function todayKey(now = new Date()): string {
  return localDayKey(now);
}

/**
 * Today's entry, if there is one.
 *
 * The check-in and the journal can both write on the same day, and the API does
 * not merge them — so "today's entry" is the newest one filed under today's
 * local date, and anything writing to it must PATCH rather than POST or the
 * member ends up with two half-filled days.
 */
export function todaysEntry(entries: Entry[], now = new Date()): Entry | null {
  const key = todayKey(now);
  return entries.find((e) => localDayKey(e.createdAt) === key) ?? null;
}

/**
 * The greeting, for every hour there is.
 *
 * The app says one of three things and stops at "Good Evening", which leaves
 * anybody journalling at 2am — the single most common time this product is
 * opened — being told good evening. Five bands, and the two at the edges of the
 * night say something a person awake at that hour would recognise.
 */
export function greetingFor(now = new Date()): string {
  const hour = now.getHours();
  if (hour < 4) return 'Still awake';
  if (hour < 5) return 'Up early';
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  if (hour < 21) return 'Good evening';
  return 'Good night';
}

/**
 * The line under the greeting. Same idea, different job: the greeting names the
 * hour, this names what the hour is for.
 */
export function greetingSubtitleFor(now = new Date()): string {
  const hour = now.getHours();
  if (hour < 5) return 'The quiet hours. Put it down here and let it go.';
  if (hour < 12) return 'Five to seven minutes is the whole routine. Start anywhere.';
  if (hour < 17) return 'A pause in the middle of the day counts double.';
  if (hour < 21) return 'The day is winding down. Worth recording before it blurs.';
  return 'Close the day properly. One honest line is enough.';
}
