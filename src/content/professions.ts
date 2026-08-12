/**
 * What a member is actually trying to get good at.
 *
 * A verbatim port of `lib/core/constants/professions.dart`. The ids matter more
 * than anything else in this file: `JournalEntry.craftDone` stores habit *ids*,
 * and a year of history is only readable while an id written on Android means
 * the same thing when it is read back on the web. Change a label freely; change
 * an id and you have quietly rewritten somebody's past.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * Why the journal needs this at all
 *
 * The journal already proves you turned up; it does not prove you turned up
 * *for the thing you care about*. A singer who journals every day for a month
 * and never once sang has a perfect streak and nothing to show for it — and an
 * insights screen showing only mood and meditation minutes cannot tell them
 * that. So each member names their craft, and the journal gains one small card:
 * tap what you did today.
 */

export interface CraftHabit {
  id: string;
  label: string;
  emoji: string;
  /**
   * Core habits are the ones consistency is measured against. Supporting habits
   * still get recorded, but a week of only "listened to music" is not a week of
   * practice and the streak should not pretend otherwise.
   */
  isCore?: boolean;
  /** Written by the member rather than shipped with the app. */
  isCustom?: boolean;
}

export interface Profession {
  id: string;
  label: string;
  emoji: string;
  /** What this person's daily work looks like, as tappable habits. */
  habits: CraftHabit[];
  /** Placeholder for the member's own one-line aim. */
  aimHint: string;
  /**
   * The word used for a unit of work in this craft — "riyaaz", "writing",
   * "training". Appears in the insights copy so it does not read like a generic
   * productivity app.
   */
  workWord: string;
}

/**
 * Prefix that keeps a member's own item from ever colliding with a preset.
 *
 * If someone's custom item happened to be called `study` it would silently
 * merge with the Student preset of the same name.
 */
export const CUSTOM_HABIT_PREFIX = 'custom_';

/**
 * Builds a member-authored item. The id is derived from the moment of creation,
 * never from the label — renaming "Gym" to "Training" must not orphan every day
 * it was already ticked.
 */
export function customHabit(label: string, emoji = '✅'): CraftHabit {
  return {
    id: `${CUSTOM_HABIT_PREFIX}${Date.now()}${Math.floor(Math.random() * 1000)}`,
    label,
    emoji: emoji || '✅',
    // A member does not add an item to their own checklist casually — if they
    // wrote it down, it counts towards whether the week happened.
    isCore: true,
    isCustom: true,
  };
}

export const PROFESSIONS: Profession[] = [
  {
    id: 'student',
    label: 'Student',
    emoji: '🎓',
    workWord: 'studying',
    aimHint: 'e.g. Clear my boards with 90%+',
    habits: [
      { id: 'study', label: 'Studied', emoji: '📚', isCore: true },
      { id: 'revision', label: 'Revised old topics', emoji: '🔁', isCore: true },
      { id: 'practice_test', label: 'Practice test / mock', emoji: '📝', isCore: true },
      { id: 'doubts', label: 'Cleared a doubt', emoji: '❓' },
      { id: 'notes', label: 'Made notes', emoji: '🗒️' },
      { id: 'class', label: 'Attended class', emoji: '🏫' },
    ],
  },
  {
    id: 'aspirant',
    label: 'Competitive exam aspirant',
    emoji: '🏛️',
    workWord: 'preparation',
    aimHint: 'e.g. UPSC Prelims 2027',
    habits: [
      { id: 'syllabus', label: 'Covered syllabus', emoji: '📖', isCore: true },
      { id: 'answer_writing', label: 'Answer writing', emoji: '✍️', isCore: true },
      { id: 'mock', label: 'Mock test', emoji: '⏱️', isCore: true },
      { id: 'current_affairs', label: 'Current affairs', emoji: '📰' },
      { id: 'revision', label: 'Revision', emoji: '🔁' },
      { id: 'group_study', label: 'Discussed with peers', emoji: '👥' },
    ],
  },
  {
    id: 'engineer',
    label: 'Engineer / Developer',
    emoji: '💻',
    workWord: 'deep work',
    aimHint: 'e.g. Ship my own product this year',
    habits: [
      { id: 'deep_work', label: 'Deep work block', emoji: '🎯', isCore: true },
      { id: 'shipped', label: 'Shipped something', emoji: '🚀', isCore: true },
      { id: 'learned', label: 'Learned a new skill', emoji: '🧠', isCore: true },
      { id: 'reviewed', label: 'Reviewed / debugged', emoji: '🔍' },
      { id: 'planned', label: 'Planned the work', emoji: '🗺️' },
      { id: 'side_project', label: 'Side project', emoji: '🛠️' },
    ],
  },
  {
    id: 'singer',
    label: 'Singer / Musician',
    emoji: '🎤',
    workWord: 'riyaaz',
    aimHint: 'e.g. Record and release an original song',
    habits: [
      { id: 'riyaaz', label: 'Riyaaz / practice', emoji: '🎵', isCore: true },
      { id: 'new_piece', label: 'Worked on a new piece', emoji: '🎼', isCore: true },
      { id: 'recorded', label: 'Recorded myself', emoji: '🎙️', isCore: true },
      { id: 'listened', label: 'Listened actively', emoji: '🎧' },
      { id: 'performed', label: 'Performed for someone', emoji: '🌟' },
      { id: 'rest', label: 'Rested my voice', emoji: '🤫' },
    ],
  },
  {
    id: 'writer',
    label: 'Writer / Poet',
    emoji: '✍️',
    workWord: 'writing',
    aimHint: 'e.g. Finish the first draft of my book',
    habits: [
      { id: 'wrote', label: 'Wrote today', emoji: '📝', isCore: true },
      { id: 'edited', label: 'Edited / rewrote', emoji: '✂️', isCore: true },
      { id: 'read', label: 'Read seriously', emoji: '📚', isCore: true },
      { id: 'outlined', label: 'Outlined / planned', emoji: '🗂️' },
      { id: 'published', label: 'Published something', emoji: '📤' },
      { id: 'observed', label: 'Collected an idea', emoji: '💡' },
    ],
  },
  {
    id: 'artist',
    label: 'Artist / Designer',
    emoji: '🎨',
    workWord: 'making',
    aimHint: 'e.g. Build a portfolio worth showing',
    habits: [
      { id: 'made', label: 'Made something', emoji: '🖌️', isCore: true },
      { id: 'studied', label: 'Studied technique', emoji: '📐', isCore: true },
      { id: 'sketched', label: 'Sketched / drafted', emoji: '✏️', isCore: true },
      { id: 'shared', label: 'Shared my work', emoji: '📤' },
      { id: 'inspiration', label: 'Gathered references', emoji: '🖼️' },
      { id: 'feedback', label: 'Took feedback', emoji: '👀' },
    ],
  },
  {
    id: 'athlete',
    label: 'Athlete / Fitness',
    emoji: '🏃',
    workWord: 'training',
    aimHint: 'e.g. Run a half marathon under 2 hours',
    habits: [
      { id: 'trained', label: 'Trained', emoji: '💪', isCore: true },
      { id: 'skill_drill', label: 'Skill drill', emoji: '🎯', isCore: true },
      { id: 'recovery', label: 'Recovery / stretching', emoji: '🧊', isCore: true },
      { id: 'nutrition', label: 'Ate for my goal', emoji: '🥗' },
      { id: 'sleep', label: 'Slept enough', emoji: '😴' },
      { id: 'logged', label: 'Logged my numbers', emoji: '📊' },
    ],
  },
  {
    id: 'teacher',
    label: 'Teacher / Mentor',
    emoji: '📐',
    workWord: 'teaching',
    aimHint: 'e.g. Make my class the one they never skip',
    habits: [
      { id: 'taught', label: 'Taught a class', emoji: '🧑‍🏫', isCore: true },
      { id: 'prepared', label: 'Prepared material', emoji: '📋', isCore: true },
      { id: 'own_learning', label: 'Learned something myself', emoji: '📚', isCore: true },
      { id: 'helped', label: 'Helped a struggling student', emoji: '🤝' },
      { id: 'feedback', label: 'Took feedback', emoji: '👂' },
      { id: 'graded', label: 'Assessed work', emoji: '✅' },
    ],
  },
  {
    id: 'healthcare',
    label: 'Doctor / Healthcare',
    emoji: '🩺',
    workWord: 'practice',
    aimHint: 'e.g. Stay sharp without burning out',
    habits: [
      { id: 'patients', label: 'Saw patients', emoji: '🏥', isCore: true },
      { id: 'study', label: 'Studied / read up', emoji: '📚', isCore: true },
      { id: 'boundaries', label: 'Held my boundaries', emoji: '🛡️', isCore: true },
      { id: 'rest', label: 'Rested properly', emoji: '😴' },
      { id: 'colleague', label: 'Talked to a colleague', emoji: '🤝' },
      { id: 'reflected', label: 'Reflected on a case', emoji: '🤔' },
    ],
  },
  {
    id: 'business',
    label: 'Entrepreneur / Business',
    emoji: '📈',
    workWord: 'building',
    aimHint: 'e.g. Reach my first 100 paying customers',
    habits: [
      { id: 'customers', label: 'Talked to a customer', emoji: '🗣️', isCore: true },
      { id: 'built', label: 'Built / improved the product', emoji: '🔨', isCore: true },
      { id: 'sold', label: 'Sold / pitched', emoji: '💼', isCore: true },
      { id: 'numbers', label: 'Checked the numbers', emoji: '📊' },
      { id: 'learned', label: 'Learned something new', emoji: '🧠' },
      { id: 'team', label: 'Supported my team', emoji: '👥' },
    ],
  },
  {
    id: 'job_seeker',
    label: 'Looking for work',
    emoji: '🧭',
    workWord: 'the search',
    aimHint: 'e.g. Land a role I am actually excited about',
    habits: [
      { id: 'applied', label: 'Applied somewhere', emoji: '📨', isCore: true },
      { id: 'skill', label: 'Built a skill', emoji: '🧠', isCore: true },
      { id: 'reached_out', label: 'Reached out to someone', emoji: '🤝', isCore: true },
      { id: 'interview', label: 'Interviewed', emoji: '🎙️' },
      { id: 'portfolio', label: 'Improved my CV / portfolio', emoji: '📄' },
      { id: 'rested', label: 'Let myself rest', emoji: '🌿' },
    ],
  },
  {
    id: 'homemaker',
    label: 'Homemaker / Caregiver',
    emoji: '🏡',
    workWord: 'looking after everyone',
    aimHint: 'e.g. Keep something in the day that is mine',
    habits: [
      { id: 'cared', label: 'Looked after the family', emoji: '❤️', isCore: true },
      { id: 'own_time', label: 'Took time for myself', emoji: '🌿', isCore: true },
      { id: 'learned', label: 'Learned or made something', emoji: '🧵', isCore: true },
      { id: 'home', label: 'Ran the home', emoji: '🏠' },
      { id: 'rested', label: 'Actually rested', emoji: '😴' },
      { id: 'connected', label: 'Talked to a friend', emoji: '☎️' },
    ],
  },
  {
    id: 'seeker',
    label: 'Inner work & reflection',
    emoji: '🧭',
    workWord: 'practice',
    aimHint: 'e.g. Sit for twenty minutes every morning',
    habits: [
      { id: 'meditation', label: 'Meditated', emoji: '🧘', isCore: true },
      { id: 'study', label: 'Studied scripture', emoji: '📖', isCore: true },
      { id: 'service', label: 'Served someone', emoji: '🤲', isCore: true },
      { id: 'silence', label: 'Kept silence', emoji: '🤫' },
      { id: 'satsang', label: 'Satsang / class', emoji: '👥' },
      { id: 'journal', label: 'Reflected in writing', emoji: '📓' },
    ],
  },
  {
    id: 'other',
    label: 'Something else',
    emoji: '✨',
    workWord: 'the work',
    aimHint: 'e.g. Get better at the thing I care about',
    habits: [
      { id: 'worked', label: 'Worked on it', emoji: '🎯', isCore: true },
      { id: 'practised', label: 'Practised a skill', emoji: '🔁', isCore: true },
      { id: 'learned', label: 'Learned something', emoji: '🧠', isCore: true },
      { id: 'planned', label: 'Planned my next step', emoji: '🗺️' },
      { id: 'shared', label: 'Showed it to someone', emoji: '📤' },
      { id: 'rested', label: 'Rested on purpose', emoji: '🌿' },
    ],
  },
];

/** Falls back to `other`, exactly as `Professions.byId` does in the app. */
export function professionById(id?: string | null): Profession {
  return (
    PROFESSIONS.find((p) => p.id === id) ?? PROFESSIONS[PROFESSIONS.length - 1]
  );
}

export function isKnownProfession(id?: string | null): boolean {
  return PROFESSIONS.some((p) => p.id === id);
}

/**
 * The member's full daily checklist: the presets for their craft, then whatever
 * they added themselves.
 *
 * Custom items come last so the list does not reshuffle under someone's thumb
 * every time they add one — the presets stay where muscle memory left them.
 */
export function checklistFor(
  professionId?: string | null,
  custom: CraftHabit[] = []
): CraftHabit[] {
  return [...professionById(professionId).habits, ...custom];
}

/**
 * Label for a habit id, custom items included.
 *
 * Falls back to the de-underscored id, which is what keeps a year-old entry
 * readable after its custom item has been deleted. The alternative — hiding
 * habits that no longer exist — would quietly rewrite somebody's history.
 */
export function resolveHabitLabel(
  professionId: string | null | undefined,
  habitId: string,
  // Only id and label are needed to name a habit, and that is all the profile
  // stores for a custom one — so the parameter asks for exactly that rather than
  // making every caller invent an emoji it will not use.
  custom: { id: string; label: string }[] = []
): string {
  const own = custom.find((h) => h.id === habitId);
  if (own) return own.label;

  if (professionId) {
    const preset = professionById(professionId).habits.find(
      (h) => h.id === habitId
    );
    if (preset) return preset.label;
  }

  return habitId.startsWith(CUSTOM_HABIT_PREFIX)
    ? 'Removed item'
    : habitId.replace(/_/g, ' ');
}

/**
 * Ceiling on member-authored items.
 *
 * Not a storage limit — a design one. A checklist of thirty things is not a
 * checklist, it is a second job, and the reliable way to make somebody stop
 * ticking anything is to make ticking everything impossible.
 */
export const MAX_CUSTOM_HABITS = 12;

/**
 * Weekly targets offered at setup. Seven is deliberately not the default: a
 * target you break in week one is worse than no target.
 */
export const WEEKLY_TARGETS = [3, 4, 5, 6, 7];
export const DEFAULT_WEEKLY_TARGET = 5;
