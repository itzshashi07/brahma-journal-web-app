/**
 * The daily check-in.
 *
 * A port of `lib/core/constants/checkin_questions.dart`, question ids included —
 * the answers land in `JournalEntry.checkIn`, a free-form prompt→answer map, and
 * an id that drifted between the two clients would file the same answer twice
 * under two names.
 *
 * Written as a conversation, not a form. Someone opening this at the end of a
 * hard day should feel asked after, not audited — so every question is optional,
 * the tone is a friend's rather than a clinician's, and skipping is offered as
 * plainly as answering.
 *
 * The rotating question exists so the check-in does not become wallpaper. The
 * same five prompts every day for a month stop being read.
 *
 * Every question ships with tappable answers. An empty text box at 11pm is the
 * single biggest reason a check-in goes unanswered — most people have an answer
 * in mind but no appetite for typing it. The keyboard and the microphone stay
 * available underneath.
 */

import { dayOfYear } from './journal';

/** How a question expects to be answered. */
export type CheckInInput =
  /** Tap one of the offered answers. Writing more is optional. */
  | 'pickOne'
  /** Tap as many as apply. Writing more is optional. */
  | 'pickMany'
  /** No canned answers fit — this one wants words, spoken or typed. */
  | 'speak';

export interface CheckInQuestion {
  id: string;
  prompt: string;
  hint: string;
  emoji: string;
  /** Shown under the prompt to make skipping feel permitted rather than lazy. */
  skipLabel: string;
  input: CheckInInput;
  /** Tappable answers. Empty for `speak`. */
  options: string[];
  /** Placeholder for the free-text box that sits under the chips. */
  writeHint: string;
}

const q = (
  partial: Partial<CheckInQuestion> & Pick<CheckInQuestion, 'id' | 'prompt' | 'hint' | 'emoji'>
): CheckInQuestion => ({
  skipLabel: 'Skip this one',
  input: 'pickOne',
  options: [],
  writeHint: 'Add your own words…',
  ...partial,
});

/**
 * Asked every day, in this order.
 *
 * Four questions, and the first three can be finished entirely by tapping. The
 * one that asks for words is placed last, once the conversation has warmed up —
 * leading with a blank box is what makes people close the sheet.
 */
export const CORE_QUESTIONS: CheckInQuestion[] = [
  q({
    id: 'day',
    prompt: 'How was your day, really?',
    hint: 'Not the version you tell people. The real one.',
    emoji: '🌤️',
    options: [
      'Good, genuinely',
      'Quiet and ordinary',
      'Tiring, but fine',
      'Stressful',
      'Rough, honestly',
      'All over the place',
    ],
    writeHint: 'Want to say what made it that way?',
  }),
  q({
    id: 'body',
    prompt: 'How has your body been today?',
    hint: 'Sleep, energy, aches, appetite — anything worth noting.',
    emoji: '🌱',
    input: 'pickMany',
    skipLabel: 'Nothing to note',
    options: [
      'Slept well',
      'Barely slept',
      'Full of energy',
      'Drained',
      'Headache',
      'Body ache',
      'Ate properly',
      'Skipped meals',
      'Moved / exercised',
    ],
    writeHint: 'Anything else your body is telling you?',
  }),
  q({
    id: 'family',
    prompt: 'How is everyone at home?',
    hint: 'Family, the people you live with, whoever counts.',
    emoji: '🏡',
    skipLabel: 'Skip',
    options: [
      'All good',
      'Same as always',
      'Someone is unwell',
      'There was an argument',
      'Feeling distant from them',
      'Had a lovely moment together',
      'I live alone',
    ],
    writeHint: 'Tell me about it, if you want.',
  }),
  q({
    id: 'exciting',
    prompt: 'Anything you want to tell someone about?',
    hint: 'Good news that has nowhere to go yet. Speak it or type it.',
    emoji: '✨',
    skipLabel: 'Nothing today',
    input: 'speak',
    writeHint: 'Tap the mic and just say it, or type here…',
  }),
];

/** One of these is added each day, chosen by date so it is stable all day. */
export const ROTATING_QUESTIONS: CheckInQuestion[] = [
  q({
    id: 'plan',
    prompt: 'What is the plan for tomorrow?',
    hint: 'One thing is enough. It does not have to be big.',
    emoji: '🧭',
    skipLabel: 'No plans yet',
    input: 'pickMany',
    options: [
      'Work / study',
      'Rest properly',
      'Meet someone',
      'Finish something pending',
      'Exercise',
      'Meditate',
      'Sort out money',
      'Take it as it comes',
    ],
    writeHint: 'Name the one thing that matters most.',
  }),
  q({
    id: 'new_people',
    prompt: 'Did you meet anyone new lately?',
    hint: 'A conversation, a name, someone who surprised you.',
    emoji: '🤝',
    skipLabel: 'Not this week',
    options: [
      'Yes, someone new',
      'Reconnected with someone old',
      'Only the usual people',
      'Barely spoke to anyone',
    ],
    writeHint: 'Who was it, and how did it go?',
  }),
  q({
    id: 'skill',
    prompt: 'Learned anything new?',
    hint: 'A skill, a fact, something you finally understood.',
    emoji: '🎓',
    skipLabel: 'Not yet',
    options: [
      'Something about my work',
      'Something about myself',
      'A practical skill',
      'Read or watched something good',
      'Not really today',
    ],
    writeHint: 'What was it?',
  }),
  q({
    id: 'adventure',
    prompt: 'Been anywhere or done anything different?',
    hint: 'A new place, a small adventure, a break in routine.',
    emoji: '🗺️',
    skipLabel: 'Same as usual',
    options: [
      'Went somewhere new',
      'Broke my routine a little',
      'Spent time outdoors',
      'Stayed in all day',
      'Same as every day',
    ],
    writeHint: 'Where did you go?',
  }),
  q({
    id: 'proud',
    prompt: 'What are you quietly proud of?',
    hint: 'Something nobody praised you for. It still counts.',
    emoji: '🌟',
    skipLabel: 'Skip',
    options: [
      'I showed up anyway',
      'I kept my temper',
      'I finished something hard',
      'I asked for help',
      'I said no to something',
      'I was there for someone',
    ],
    writeHint: 'Say it in your own words.',
  }),
  q({
    id: 'heavy',
    prompt: 'Anything sitting heavy on you?',
    hint: 'Naming it here is enough. You do not have to solve it.',
    emoji: '🫂',
    skipLabel: 'Nothing right now',
    input: 'pickMany',
    options: [
      'Money',
      'Work or studies',
      'Family',
      'A relationship',
      'Health',
      'The future',
      'Loneliness',
      'Something I cannot name yet',
    ],
    writeHint: 'You can put the rest of it down here.',
  }),
  q({
    id: 'grateful',
    prompt: 'One thing you are grateful for?',
    hint: 'Small and specific lands better than big and general.',
    emoji: '💛',
    skipLabel: 'Skip',
    options: [
      'A person in my life',
      'My health',
      'A small comfort today',
      'Work I have',
      'A roof and a meal',
      'Making it through the day',
    ],
    writeHint: 'What exactly? Small is fine.',
  }),
  q({
    id: 'kindness',
    prompt: 'Were you kind to someone — or to yourself?',
    hint: 'Both count. The second one is usually harder.',
    emoji: '🤲',
    skipLabel: 'Skip',
    input: 'pickMany',
    options: [
      'Helped someone',
      'Listened to someone',
      'Let something go',
      'Rested without guilt',
      'Was hard on myself',
      'Neither, really',
    ],
    writeHint: 'What happened?',
  }),
  q({
    id: 'letting_go',
    prompt: 'Anything you are ready to put down?',
    hint: 'A worry, a grudge, an expectation of yourself.',
    emoji: '🍃',
    skipLabel: 'Not yet',
    options: [
      'A worry about tomorrow',
      'Something someone said',
      'An expectation of myself',
      'A regret',
      'Anger at someone',
      'Not ready yet',
    ],
    writeHint: 'Name it, and leave it here.',
  }),
  q({
    id: 'someone',
    prompt: 'Who has been on your mind?',
    hint: 'You do not have to say why. Speak it if it is easier.',
    emoji: '💭',
    skipLabel: 'Skip',
    input: 'speak',
    writeHint: 'Tap the mic and say their name, or type it…',
  }),
  q({
    id: 'unsaid',
    prompt: 'Anything you wanted to say today but did not?',
    hint: 'It can live here instead. Nobody else reads this.',
    emoji: '🤐',
    skipLabel: 'Nothing left unsaid',
    input: 'speak',
    writeHint: 'Say it out loud here — the mic is listening…',
  }),
];

/**
 * The full set for today: the four core questions plus one rotating one, stable
 * for the whole day so a half-finished check-in does not change underneath the
 * person answering it.
 */
export function questionsForToday(now = new Date()): CheckInQuestion[] {
  return [
    ...CORE_QUESTIONS,
    ROTATING_QUESTIONS[dayOfYear(now) % ROTATING_QUESTIONS.length],
  ];
}

/**
 * Headings for stored check-in answers.
 *
 * Kept as a flat map rather than derived from today's rotating set, because an
 * entry from six months ago may hold an id that is no longer in rotation — and
 * an old answer rendering under its raw key is the sort of thing that makes a
 * journal look abandoned.
 */
const CHECKIN_LABELS: Record<string, string> = {
  day: 'How the day was',
  body: 'How the body was',
  family: 'How everyone at home was',
  exciting: 'Wanted to tell someone',
  plan: 'The plan for tomorrow',
  new_people: 'Someone new',
  skill: 'Something learned',
  adventure: 'Something different',
  proud: 'Quietly proud of',
  heavy: 'Sitting heavy',
  grateful: 'Grateful for',
  kindness: 'Kindness',
  letting_go: 'Ready to put down',
  someone: 'On my mind',
  unsaid: 'Left unsaid',
};

export function checkInLabel(id: string): string {
  return CHECKIN_LABELS[id] ?? id.replace(/_/g, ' ');
}
