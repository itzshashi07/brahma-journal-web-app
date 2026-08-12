/**
 * Deep work: what somebody is building, and whether it is actually moving.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * Ported from the app, arithmetic included
 *
 * This is `services/milestone_service.dart` and the analysis half of
 * `screens/activities/deep_work_screen.dart` from the Flutter repo. The numbers
 * are here rather than in the page for the same reason `craft-stats.ts` exists:
 * a member who opens deep work on their phone in the morning and in a browser
 * at lunch must be told the same thing about the same milestone. A verdict that
 * reads "on course" on one screen and "behind" on the other is worse than
 * having no verdict, because it makes both unbelievable.
 *
 * Both clients read and write the same records through `/api/practice/
 * milestones`. Nothing is computed on the server: the pace depends on the
 * member's own calendar, and the server runs in UTC.
 */

import { api, type Paged } from '@/lib/api';
import { didCraft, localDayKey, todayKey, type Entry } from '@/lib/entries';

export type MilestoneTodo = {
  id: string;
  label: string;
  done: boolean;
  doneAt?: string | null;
};

export type Milestone = {
  _id: string;
  title: string;
  why?: string;
  /** The profession id this belongs to — see `content/professions.ts`. */
  craft?: string;
  targetDate?: string | null;
  status: 'active' | 'achieved' | 'dropped';
  achievedAt?: string | null;
  createdAt: string;
  todos?: MilestoneTodo[];
};

export type AchievementMonth = {
  /** `yyyy-MM`, in the member's own calendar. */
  month: string;
  count: number;
  titles: string[];
};

export type Achievements = { months: AchievementMonth[]; total: number };

/** The fortnight the analysis looks back over, same as the app's. */
export const WINDOW_DAYS = 14;

/** Twenty running at once is a runaway client, not an opinion about goals. */
export const MAX_ACTIVE = 20;

export const MAX_TODOS = 50;

// ─────────────────────────── the API ───────────────────────────

export async function fetchMilestones(): Promise<Milestone[]> {
  const body = await api.get<Paged<Milestone, 'milestones'>>(
    '/api/practice/milestones',
    { limit: 100 }
  );
  return body.milestones ?? [];
}

export async function fetchAchievements(): Promise<Achievements> {
  try {
    // The server groups by the *member's* month, so it needs the offset — an
    // achievement at 2am in India belongs to that day, not to the UTC one
    // before it.
    const tz = -new Date().getTimezoneOffset();
    const body = await api.get<Achievements>(
      '/api/practice/milestones/achievements',
      { tz }
    );
    return { months: body.months ?? [], total: body.total ?? 0 };
  } catch {
    // A missing history is not a reason to fail the screen the milestones are
    // on. Same tolerance as the app's.
    return { months: [], total: 0 };
  }
}

export async function createMilestone(input: {
  title: string;
  why?: string;
  craft?: string;
  targetDate?: string | null;
}): Promise<Milestone> {
  const body = await api.post<{ milestone: Milestone }>(
    '/api/practice/milestones',
    input
  );
  return body.milestone;
}

export async function updateMilestone(
  id: string,
  patch: Partial<Pick<Milestone, 'title' | 'why' | 'craft' | 'status'>> & {
    targetDate?: string | null;
    todos?: MilestoneTodo[];
  }
): Promise<Milestone> {
  const body = await api.patch<{ milestone: Milestone }>(
    `/api/practice/milestones/${id}`,
    patch
  );
  return body.milestone;
}

export async function deleteMilestone(id: string): Promise<void> {
  await api.delete(`/api/practice/milestones/${id}`);
}

/**
 * A todo's id is made here, before the server has seen it.
 *
 * The list is saved as a whole, and a step is ticked the instant it is clicked
 * — so it has to be identifiable straight away rather than after a round trip.
 * Matches `MilestoneTodo.create` in the app.
 */
export function newTodo(label: string): MilestoneTodo {
  return { id: `t${Date.now()}${Math.floor(Math.random() * 1000)}`, label, done: false };
}

// ─────────────────────────── the arithmetic ───────────────────────────

export function todos(milestone: Milestone): MilestoneTodo[] {
  return milestone.todos ?? [];
}

export function doneCount(milestone: Milestone): number {
  return todos(milestone).filter((t) => t.done).length;
}

export function openCount(milestone: Milestone): number {
  return todos(milestone).length - doneCount(milestone);
}

/**
 * 0–1. A milestone with no steps yet reads as 0 rather than as complete: an
 * empty list is "not started", and a full bar would be the worst possible first
 * impression of a progress bar.
 */
export function progress(milestone: Milestone): number {
  const all = todos(milestone).length;
  return all === 0 ? 0 : doneCount(milestone) / all;
}

/** Whole days until the target, negative once it has passed. Null with no date. */
export function daysLeft(milestone: Milestone, now = new Date()): number | null {
  if (!milestone.targetDate) return null;
  const target = new Date(milestone.targetDate);
  if (Number.isNaN(target.getTime())) return null;

  const midnight = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
  return Math.round(
    (midnight(target).getTime() - midnight(now).getTime()) / 86_400_000
  );
}

/**
 * The days deep work actually happened, as `yyyy-MM-DD` in local time.
 *
 * Any craft tick counts, not only one written from this screen: somebody who
 * ticked "riyaaz" in the journal did the work, and two definitions of a working
 * day is how two screens end up disagreeing about the same week.
 */
export function workedDays(entries: Entry[]): Set<string> {
  return new Set(
    entries.filter(didCraft).map((entry) => localDayKey(entry.createdAt))
  );
}

/** The last [WINDOW_DAYS] days, oldest first, each with whether work happened. */
export function fortnight(
  worked: Set<string>,
  now = new Date()
): { key: string; filled: boolean; isToday: boolean }[] {
  const today = todayKey(now);
  return Array.from({ length: WINDOW_DAYS }, (_, i) => {
    const day = new Date(now);
    day.setDate(day.getDate() - (WINDOW_DAYS - 1 - i));
    const key = localDayKey(day);
    return { key, filled: worked.has(key), isToday: key === today };
  });
}

/** Consecutive days of work ending today or yesterday; 0 once it is broken. */
export function currentRun(worked: Set<string>, now = new Date()): number {
  const day = new Date(now);
  // A run is not broken by *today* being unwritten — the day is not over.
  if (!worked.has(localDayKey(day))) day.setDate(day.getDate() - 1);
  if (!worked.has(localDayKey(day))) return 0;

  let run = 0;
  while (worked.has(localDayKey(day))) {
    run += 1;
    day.setDate(day.getDate() - 1);
  }
  return run;
}

export type Verdict = { text: string; tone: 'good' | 'bad' | 'warn' | 'plain' };

/**
 * The one opinion this screen offers, and it is allowed to be bad news.
 *
 * A milestone that will not be reached at the current pace should say so while
 * there is still time to do something about it, rather than on the day it is
 * missed. Word for word the app's, so the two never disagree.
 */
export function verdictFor(
  milestone: Milestone,
  worked: Set<string>,
  now = new Date()
): Verdict {
  const open = openCount(milestone);
  const recent = fortnight(worked, now).filter((d) => d.filled).length;
  const left = daysLeft(milestone, now);
  const perWeek = recent / (WINDOW_DAYS / 7);
  const steps = open === 1 ? 'step' : 'steps';

  if (todos(milestone).length === 0) {
    return {
      text: 'Nothing to measure yet — write the steps below and this fills in.',
      tone: 'plain',
    };
  }
  if (open === 0) {
    return {
      text: 'Every step is done. Mark the milestone achieved from the menu.',
      tone: 'good',
    };
  }
  if (recent === 0) {
    return {
      text:
        `No deep work recorded in the last fortnight. ${open} ${steps} will ` +
        'not close themselves — pick the smallest one and do it today.',
      tone: 'bad',
    };
  }
  if (left === null) {
    return {
      text:
        `You are working about ${perWeek.toFixed(1)} days a week. Set a target ` +
        'date if you want this to have an end.',
      tone: 'plain',
    };
  }
  if (left < 0) {
    return {
      text:
        `The date has passed with ${open} ${steps} open. Move the date rather ` +
        'than carrying the guilt — a target you have already missed stops ' +
        'being a target.',
      tone: 'bad',
    };
  }

  // Pace, in the only terms that matter: steps closed per day so far against
  // steps left over days left.
  const elapsed =
    Math.floor(
      (now.getTime() - new Date(milestone.createdAt).getTime()) / 86_400_000
    ) + 1;
  const perDay = doneCount(milestone) / Math.max(1, elapsed);
  const needPerDay = left > 0 ? open / left : Infinity;

  if (perDay >= needPerDay && perDay > 0) {
    return {
      text:
        'On course. At the rate you have been closing steps, this lands before ' +
        'the date.',
      tone: 'good',
    };
  }

  const needPerWeek = Math.ceil(needPerDay * 7);
  return {
    text:
      `Behind. ${open} left in ${left} day${left === 1 ? '' : 's'} means about ` +
      `${needPerWeek} a week, and you are closing fewer than that. Either the ` +
      'date moves or the list gets shorter.',
    tone: 'warn',
  };
}

/** `2026-08` → `August 2026`. */
export function monthLabel(month: string): string {
  const [year, m] = month.split('-').map(Number);
  if (!year || !m) return month;
  return new Date(year, m - 1, 1).toLocaleDateString(undefined, {
    month: 'long',
    year: 'numeric',
  });
}
