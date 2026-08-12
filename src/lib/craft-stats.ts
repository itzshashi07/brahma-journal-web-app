/**
 * Whether a member is actually doing the work they said they cared about.
 *
 * A port of `lib/core/utils/craft_stats.dart`, kept as pure functions for the
 * same reason it is kept out of the widget there: these are the numbers the
 * whole feature is judged on, they are easy to get subtly wrong (off-by-one on
 * streaks, double-counting two entries on one day), and a pure function is the
 * only version of them that can be reasoned about.
 *
 * Everything works off calendar days, not 24-hour windows. Someone who practises
 * at 11pm and again at 1am has practised on two days, and telling them otherwise
 * would be arguing with their own memory.
 */

import { DEFAULT_WEEKLY_TARGET } from '@/content/professions';
import { didCraft, localDayKey, type Entry } from './entries';

export interface CraftStats {
  daysPractised: number;
  windowDays: number;
  /**
   * Consecutive days up to today — or yesterday, since today is still in
   * progress and a streak should not break until a day has actually been
   * missed.
   */
  currentStreak: number;
  longestStreak: number;
  /** Days practised in the last seven, against the member's weekly target. */
  thisWeekDays: number;
  weeklyTarget: number;
  totalMinutes: number;
  /** Habit id → times recorded, most-used first. */
  habitCounts: [string, number][];
  /**
   * Average mood on days with craft work, and on days without. Null when there
   * is not enough of either to compare honestly.
   */
  moodWithCraft: number | null;
  moodWithoutCraft: number | null;
  /**
   * Weekday index (0 = Sunday, matching `Date.getDay`) the member practises most
   * and least, or null when the sample is too thin to mean anything.
   */
  strongestWeekday: number | null;
  weakestWeekday: number | null;
}

const DAY_MS = 86_400_000;

/** Midnight, local, for a date. */
function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function shiftDays(d: Date, days: number): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate() + days);
}

/**
 * Builds the picture from a member's entries.
 *
 * `window` is how far back to look. Thirty days is the default because it is
 * long enough to show a pattern and short enough that a bad fortnight in March
 * does not haunt someone in June.
 */
export function craftStatsFrom(
  entries: Entry[],
  {
    window = 30,
    weeklyTarget = DEFAULT_WEEKLY_TARGET,
    now = new Date(),
  }: { window?: number; weeklyTarget?: number; now?: Date } = {}
): CraftStats {
  const today = startOfDay(now);
  const since = shiftDays(today, -(window - 1));

  /**
   * One entry per calendar day.
   *
   * Two entries on the same day is a real state — the check-in and the journal
   * can both write — and counting it twice would inflate every number below.
   * The richer record wins.
   */
  const byDay = new Map<string, Entry>();
  for (const entry of entries) {
    const key = localDayKey(entry.createdAt);
    const existing = byDay.get(key);
    const weight = (e: Entry) =>
      (e.craftDone?.length ?? 0) + ((e.craftMinutes ?? 0) > 0 ? 1 : 0);
    if (!existing || weight(entry) > weight(existing)) byDay.set(key, entry);
  }

  const dated = [...byDay.entries()].map(([key, entry]) => {
    const [year, month, day] = key.split('-').map(Number);
    return { key, date: new Date(year, month - 1, day), entry };
  });

  const inWindow = dated.filter(
    ({ date }) => date >= since && date <= today
  );

  const practisedInWindow = inWindow.filter(({ entry }) => didCraft(entry));

  // ─── streaks ───
  //
  // Counted from yesterday when today has no entry yet: at 9am nobody has
  // practised, and zeroing a 40-day streak because the day is young is the
  // fastest way to make someone stop opening the app.
  const allPractised = new Set(
    dated.filter(({ entry }) => didCraft(entry)).map(({ key }) => key)
  );

  let currentStreak = 0;
  let cursor = allPractised.has(localDayKey(today))
    ? today
    : shiftDays(today, -1);
  while (allPractised.has(localDayKey(cursor))) {
    currentStreak += 1;
    cursor = shiftDays(cursor, -1);
  }

  let longestStreak = 0;
  let run = 0;
  let previous: Date | null = null;
  const sorted = [...allPractised]
    .map((key) => {
      const [year, month, day] = key.split('-').map(Number);
      return new Date(year, month - 1, day);
    })
    .sort((a, b) => a.getTime() - b.getTime());
  for (const date of sorted) {
    // Rounded, because a DST boundary makes the gap 23 or 25 hours and an
    // integer division would read that as no day having passed at all.
    const gap = previous
      ? Math.round((date.getTime() - previous.getTime()) / DAY_MS)
      : 0;
    run = previous && gap === 1 ? run + 1 : 1;
    if (run > longestStreak) longestStreak = run;
    previous = date;
  }

  // ─── this week ───
  const weekStart = shiftDays(today, -6);
  const thisWeekDays = sorted.filter(
    (date) => date >= weekStart && date <= today
  ).length;

  // ─── habits ───
  const counts = new Map<string, number>();
  let totalMinutes = 0;
  for (const { entry } of inWindow) {
    for (const habit of entry.craftDone ?? []) {
      counts.set(habit, (counts.get(habit) ?? 0) + 1);
    }
    totalMinutes += entry.craftMinutes ?? 0;
  }
  const habitCounts = [...counts.entries()].sort((a, b) => b[1] - a[1]);

  // ─── mood comparison ───
  //
  // Needs at least three of each kind. Below that the "average" is one good day,
  // and presenting it as a finding would be a lie told with a number.
  const average = (rows: typeof inWindow): number | null => {
    const moods = rows
      .map(({ entry }) => entry.mood)
      .filter((m): m is number => typeof m === 'number');
    if (moods.length < 3) return null;
    return moods.reduce((sum, m) => sum + m, 0) / moods.length;
  };

  const moodWithCraft = average(inWindow.filter(({ entry }) => didCraft(entry)));
  const moodWithoutCraft = average(
    inWindow.filter(({ entry }) => !didCraft(entry))
  );

  // ─── weekday pattern ───
  //
  // Needs two weeks of data before it says anything: with one week every weekday
  // has a sample of exactly one, and "you are worst on Tuesdays" is then a
  // statement about a single Tuesday.
  let strongestWeekday: number | null = null;
  let weakestWeekday: number | null = null;

  if (inWindow.length >= 14) {
    const done = new Map<number, number>();
    const seen = new Map<number, number>();
    for (const { date, entry } of inWindow) {
      const weekday = date.getDay();
      seen.set(weekday, (seen.get(weekday) ?? 0) + 1);
      if (didCraft(entry)) done.set(weekday, (done.get(weekday) ?? 0) + 1);
    }

    const rates = [...seen.entries()]
      .filter(([, total]) => total >= 2)
      .map(([weekday, total]) => ({
        weekday,
        rate: (done.get(weekday) ?? 0) / total,
      }));

    if (rates.length >= 4) {
      rates.sort((a, b) => b.rate - a.rate);
      // Identical rates top and bottom means there is no pattern to report.
      if (rates[0].rate !== rates[rates.length - 1].rate) {
        strongestWeekday = rates[0].weekday;
        weakestWeekday = rates[rates.length - 1].weekday;
      }
    }
  }

  return {
    daysPractised: practisedInWindow.length,
    windowDays: window,
    currentStreak,
    longestStreak,
    thisWeekDays,
    weeklyTarget,
    totalMinutes,
    habitCounts,
    moodWithCraft,
    moodWithoutCraft,
    strongestWeekday,
    weakestWeekday,
  };
}

export const WEEKDAY_NAMES = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

export function consistency(stats: CraftStats): number {
  return stats.windowDays === 0 ? 0 : stats.daysPractised / stats.windowDays;
}

export function daysToTarget(stats: CraftStats): number {
  return Math.max(0, stats.weeklyTarget - stats.thisWeekDays);
}

/**
 * The mood difference, when there is a real comparison to make.
 *
 * Positive means they feel better on days they do the work — which is the single
 * most motivating sentence this app can show anybody, and the reason the
 * comparison is computed at all.
 */
export function moodLift(stats: CraftStats): number | null {
  if (stats.moodWithCraft === null || stats.moodWithoutCraft === null) return null;
  return stats.moodWithCraft - stats.moodWithoutCraft;
}

/**
 * One honest sentence about how it is going.
 *
 * Ordered so the most useful thing is said first, and phrased so that a bad
 * month reads as recoverable rather than as a verdict. Nobody has ever been
 * helped back to a habit by being told they are at 12%.
 */
export function craftVerdict(stats: CraftStats, workWord: string): string {
  const gap = daysToTarget(stats);

  if (stats.daysPractised === 0) {
    return `No ${workWord} recorded yet. Tap one thing in today's journal and this page starts working.`;
  }
  if (stats.currentStreak >= 7) {
    return `${stats.currentStreak} days in a row. This is what it looks like when it has stopped being a decision.`;
  }
  if (gap === 0) {
    return `Target met this week — ${stats.thisWeekDays} of ${stats.weeklyTarget} days. Whatever you are doing, keep doing it.`;
  }
  if (stats.thisWeekDays === 0) {
    return 'Nothing this week yet. One day is all it takes to start the count again — it does not have to be a good one.';
  }
  if (gap === 1) {
    return 'One more day hits your target this week. That is the whole gap.';
  }
  return `${stats.thisWeekDays} of ${stats.weeklyTarget} days this week. ${gap} more and the week counts.`;
}
