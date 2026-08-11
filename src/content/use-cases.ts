import type { Faq, MockupKind } from './features';

/**
 * One landing page per *problem*, as against per feature.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * Why both exist
 *
 * Nobody searches for "journalling app with mood tracking" until they already
 * know that is what they want. They search for "cannot sleep because my brain
 * won't stop" and "how to stop overthinking at night". Those are different
 * pages with different words, and a feature page written for the first query
 * ranks for nothing against the second.
 *
 * The feature pages answer *what is this*. These answer *I have this problem* —
 * and then, having earned the reader's attention by taking the problem
 * seriously for three paragraphs, point at the two or three features that
 * actually address it.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * The line this content does not cross
 *
 * These pages describe a difficulty and what this app offers for it. They do
 * not diagnose, they do not claim treatment, and every one of them carries a
 * crisis note where the subject warrants it. That is partly Play Store policy
 * for a health-adjacent app, and mostly because the alternative is telling
 * somebody in trouble that a journalling app is medicine.
 */

export type UseCase = {
  slug: string;
  name: string;
  metaTitle: string;
  metaDescription: string;
  headline: string;
  standfirst: string;
  icon: string;
  mockup: MockupKind;
  /** The reader's situation, in their words. */
  problem: string[];
  /** What to actually do. Emitted as HowTo structured data. */
  steps: { title: string; body: string }[];
  /** Feature slugs this leans on, for internal linking. */
  features: string[];
  faqs: Faq[];
  /** Shown when the subject warrants it. Rendered in a distinct block. */
  crisisNote?: string;
};

const CRISIS =
  'If you are thinking about harming yourself, please do not use an app for ' +
  'this. In India you can reach Tele-MANAS free on 14416, any hour of any day. ' +
  'Elsewhere, contact your local emergency number or a crisis line. This app is ' +
  'for reflection and support, not for an emergency.';

export const useCases: UseCase[] = [
  {
    slug: 'overthinking-at-night',
    name: 'Overthinking at night',
    metaTitle: 'How to Stop Overthinking at Night',
    metaDescription:
      'Your brain will not stop at 1am. A practical routine — get it out of your head onto a page, then a five-minute wind-down. Free app for Android and web.',
    headline: 'It is 1am and your brain will not stop',
    standfirst:
      'The loop at night is not a thinking problem. It is a holding problem — the thoughts have nowhere to go, so they keep coming back to be re-held.',
    icon: 'Moon',
    mockup: 'journal',
    problem: [
      'You get into bed and the day starts replaying. The thing you said in the meeting. The message you have not answered. The conversation you should have had three weeks ago.',
      'Telling yourself to stop does not work, and you already know that, because you have tried it every night this week.',
      'What does help is giving the thoughts somewhere to be. A thought that is written down stops demanding to be remembered — the loop is largely your head refusing to drop something it does not trust you to keep.',
    ],
    steps: [
      {
        title: 'Empty it onto the page first',
        body: 'Open the night routine prompt and write the thing that is circling. Not neatly, not fully — just enough that it exists somewhere outside your head. Two lines is enough.',
      },
      {
        title: 'Name what actually set it off',
        body: 'The trigger field asks what pulled at you and what you did about it. Answering the second half is often what ends the loop, because the loop is usually an unfinished decision.',
      },
      {
        title: 'Sit for five minutes with the breath',
        body: 'Pick the sleep theme and the shortest length. The point is not to fall asleep during it; it is to give your attention something slower to hold onto than the replay.',
      },
      {
        title: 'Do it again tomorrow',
        body: 'The first night it helps a little. The value shows up over a fortnight, when you can look back and see which days it happens and what they have in common.',
      },
    ],
    features: ['journal', 'meditation', 'analytics'],
    faqs: [
      {
        q: 'Does writing before bed not keep me awake?',
        a: 'It can if you write for half an hour. The night prompt is deliberately short — a few lines to put the thought down, not an essay. If it is winding you up rather than down, stop and go to the breathing timer.',
      },
      {
        q: 'What if I do not want to write about it in detail?',
        a: 'Do not. A single line that names the thing is enough for the purpose. Every field in the entry is optional.',
      },
      {
        q: 'Is this app free?',
        a: 'Yes. The journal, the meditation timer and the anonymous board are all free with no trial and no subscription.',
      },
    ],
    crisisNote: CRISIS,
  },

  {
    slug: 'anxiety-and-worry',
    name: 'Anxiety & constant worry',
    metaTitle: 'An App for Constant Worry and Anxious Days',
    metaDescription:
      'For the days when the worry has no single subject. Track what actually sets it off, sit with a five-minute grounding practice, and talk to someone anonymously.',
    headline: 'When the worry has no single subject',
    standfirst:
      'Some anxiety is about something. A lot of it is not — it is a background hum you cannot point at, which makes it impossible to argue with.',
    icon: 'Waves',
    mockup: 'meditation',
    problem: [
      'It is easier when there is a reason. A reason can be dealt with. The hum has nothing to deal with, so you spend the day braced for something that never arrives and are exhausted by six.',
      'And because nothing happened, it feels unreasonable to mention — which is how it goes unmentioned for months.',
      'Two things help more than they should: finding out it is not random, and saying it out loud somewhere it costs nothing to say.',
    ],
    steps: [
      {
        title: 'Log the day even when nothing happened',
        body: 'Especially then. The entries where nothing happened are the ones that reveal the pattern, because they rule things out.',
      },
      {
        title: 'Use the trigger and response prompts',
        body: 'Two fields: what pulled at you, and what you did. Over a few weeks the first column stops looking random.',
      },
      {
        title: 'Ground yourself for five minutes',
        body: 'The grounding technique is a short phrase paced to a long exhale. It is not a cure and it does not pretend to be; it is a way to get the next twenty minutes back.',
      },
      {
        title: 'Say it somewhere anonymous',
        body: 'The reflections board exists for exactly the thing that feels too small or too embarrassing to raise with anyone who knows you. Somebody who has been there answers.',
      },
    ],
    features: ['journal', 'meditation', 'anonymous-reflections'],
    faqs: [
      {
        q: 'Will this replace therapy?',
        a: 'No, and it is not trying to. It is a journal, a practice timer and a place to talk. If you can access therapy, this sits alongside it — several people use the journal to have something concrete to bring to a session.',
      },
      {
        q: 'I do not know what my triggers are.',
        a: 'That is the normal starting point. The prompt is there to collect the data, not to test you — write what happened that day and the pattern is found later, by looking back.',
      },
      {
        q: 'Can I talk to a real person?',
        a: 'Yes, two ways: anonymously on the reflections board, or in a one-to-one counselling session whose transcript is deleted two hours after it ends.',
      },
    ],
    crisisNote: CRISIS,
  },

  {
    slug: 'building-a-habit',
    name: 'Building a habit',
    metaTitle: 'Habit Tracker That Survives a Missed Day',
    metaDescription:
      'Build a habit with a tiny daily step, an honest streak you cannot fake, and one recovery a month for the day life got in the way.',
    headline: 'The habit survives the day you miss',
    standfirst:
      'Most habit apps break the moment you miss once, and so does your motivation. This one is built around the missed day, not around pretending it will not happen.',
    icon: 'Repeat',
    mockup: 'journal',
    problem: [
      'You have done this before. Eleven good days, then a bad Wednesday, then the counter resets to zero and you never open the app again.',
      'The reset is not a motivational tool. It is the moment you decide the whole thing was pointless, and it happens to everyone.',
      'So: a step small enough to do on the bad day, a streak computed honestly, and exactly one repair a month for when life actually got in the way.',
    ],
    steps: [
      {
        title: 'Define the habit as a tiny step',
        body: 'Not "meditate daily" — "sit for five minutes". Not "journal" — "one line". The tiny-step field exists because the version you can do on your worst day is the only version that survives.',
      },
      {
        title: 'Tick it in the daily entry',
        body: 'Your habits are a checklist inside the entry you were writing anyway, so it is one screen and not two apps.',
      },
      {
        title: 'Let the streak be honest',
        body: 'It is computed on the server from real entries, against your own calendar rather than the server\'s timezone. You cannot fake it, which is what makes it worth having.',
      },
      {
        title: 'Use the monthly recovery when you need it',
        body: 'Once a month a single missed day can be repaired — but only where repairing it revives a real streak. It cannot manufacture one you never had.',
      },
    ],
    features: ['journal', 'community', 'analytics'],
    faqs: [
      {
        q: 'What is the streak recovery, exactly?',
        a: 'Once every thirty days you can fill in one missed day. The server works out which day qualifies rather than trusting the app to say — the gap has to be exactly one day wide and filling it has to actually revive the streak.',
      },
      {
        q: 'Can I track more than one habit?',
        a: 'Yes. You define your own habit list and tick them per day, and the insights page shows the kept-rate for each.',
      },
      {
        q: 'What happens when I break a streak completely?',
        a: 'Your longest streak is kept. Badges are earned against all of history rather than the current run, so an achievement does not disappear the day you miss a session.',
      },
    ],
  },

  {
    slug: 'nobody-to-talk-to',
    name: 'No one to talk to',
    metaTitle: 'Somewhere to Talk When There Is No One to Tell',
    metaDescription:
      'Say it with no name attached and get a real reply, or book a one-to-one session whose transcript is deleted two hours later. Free, anonymous, Android and web.',
    headline: 'When there is genuinely no one to tell',
    standfirst:
      'Not because nobody cares — because the people who care are the ones you cannot say it to.',
    icon: 'MessageCircleHeart',
    mockup: 'thoughts',
    problem: [
      'Your family would worry. Your friends are in it with you. Your partner is the subject. Your colleagues are your colleagues.',
      'So it stays in, and the longer it stays in the more absurd it feels to bring up, until raising it at all would require an explanation of why you did not raise it months ago.',
      'The thing that breaks that is saying it once, somewhere it costs nothing — to somebody who does not know you and never will.',
    ],
    steps: [
      {
        title: 'Post it under no name',
        body: 'You are given a display name like "Quiet Voice" and a colour. Nothing links it to your account on any screen anybody can reach.',
      },
      {
        title: 'Wait — someone answers',
        body: 'Replies come from people who have been in something similar. You are notified even with the app closed, and the notification does not say what it is about.',
      },
      {
        title: 'Take it further if you want to',
        body: 'If it turns out to be bigger than a post, book a counselling session. The whole transcript is destroyed two hours after it ends.',
      },
      {
        title: 'Keep the private version too',
        body: 'The journal is the place for the version with names and details in it, which nobody but you can read.',
      },
    ],
    features: ['anonymous-reflections', 'counselling', 'journal'],
    faqs: [
      {
        q: 'Can anyone work out it was me?',
        a: 'Not from the board. The post carries no account identifier at all — authorship is stored in a separate collection that no member account can read, precisely so the board cannot be joined against the member list.',
      },
      {
        q: 'What if somebody replies unkindly?',
        a: 'Block them and report the reply. Reports reach a person, and they are resolved and recorded rather than quietly deleted.',
      },
      {
        q: 'Is anyone actually there?',
        a: 'It is a small community, so a reply can take a few hours rather than a few minutes. If you want a guaranteed response, the counselling session is the one to book.',
      },
    ],
    crisisNote: CRISIS,
  },

  {
    slug: 'student-stress',
    name: 'Exam & study stress',
    metaTitle: 'Managing Exam Stress and Study Pressure',
    metaDescription:
      'For students carrying exam pressure, comparison and a broken attention span. Short practices, an honest habit tracker and somewhere anonymous to say it.',
    headline: 'The pressure nobody in your house will call pressure',
    standfirst:
      'Exam season, family expectation, and a phone that has taken your attention span apart. All three at once, at nineteen.',
    icon: 'GraduationCap',
    mockup: 'focus',
    problem: [
      'It is not one thing. It is the exam, plus what happens at home if the exam goes badly, plus everybody in your year appearing to cope better, plus the fact that you cannot read a page for eight minutes without picking up your phone.',
      'And it is difficult to raise, because from the outside it is "just studying" and everyone did it.',
      'The parts that are actually fixable: the attention span, the not-saying-it, and knowing whether this week is genuinely worse or it just feels that way.',
    ],
    steps: [
      {
        title: 'Rebuild the attention span in five-minute pieces',
        body: 'The focus games ask you to hold attention on one thing. It is short, it is not a study app, and it is the opposite of what your phone usually does to you.',
      },
      {
        title: 'Sit for five minutes before you start',
        body: 'A short grounding practice before a study block is worth more than the five minutes it costs, mostly because it ends the transition from scrolling.',
      },
      {
        title: 'Track the days, not the hours',
        body: 'Hours studied is a number you will lie to yourself about. Whether you showed up is not.',
      },
      {
        title: 'Say the family part somewhere anonymous',
        body: 'The board is full of people carrying exactly this and unable to say it at home either.',
      },
    ],
    features: ['focus', 'meditation', 'anonymous-reflections', 'journal'],
    faqs: [
      {
        q: 'Is it in Hindi or Hinglish?',
        a: 'The interface is in English, and many articles in the Sanctuary have a real Hinglish version — written, not machine-translated — because that is the language a lot of readers actually think in.',
      },
      {
        q: 'Will this help me study more?',
        a: 'It is not a study timer or a productivity tracker, and it would be dishonest to sell it as one. It helps with the state you are in before you sit down, and with the part you cannot say to anyone.',
      },
      {
        q: 'Is it free for students?',
        a: 'It is free for everybody. There is no student tier because there is no paid tier for the core features.',
      },
    ],
    crisisNote: CRISIS,
  },

  {
    slug: 'low-mood-and-self-worth',
    name: 'Low mood & self-worth',
    metaTitle: 'For Flat Days and a Voice That Will Not Let Up',
    metaDescription:
      'When nothing is wrong and nothing is good either. Mood tracking that shows the shape of it, affirmations in your own words, and a record of days you got through.',
    headline: 'Nothing is wrong, and nothing is good either',
    standfirst:
      'The flat kind. Not dramatic, not explicable, just grey — with a voice in the background keeping score of everything you are not.',
    icon: 'CloudDrizzle',
    mockup: 'affirmations',
    problem: [
      'It is harder to talk about than a crisis, because there is nothing to point at. Nothing happened. That is sort of the problem.',
      'And the running commentary — the one that has an opinion about how you look, how you are doing, and what everybody thinks — is exhausting in a way that is difficult to convey.',
      'Two things that help: seeing that the flatness has a shape rather than being permanent, and having an answer ready for the commentary that is in your own words rather than a poster\'s.',
    ],
    steps: [
      {
        title: 'Mark the mood even on the featureless days',
        body: 'Especially those. A month of them on a chart is the evidence that it moves, which is precisely what you cannot believe from inside one.',
      },
      {
        title: 'Write the answer to the voice',
        body: 'Not "I am enough". The specific sentence that answers the specific thing your head says at 2am. Write it as an affirmation and come back to it.',
      },
      {
        title: 'Keep the best-moment prompt',
        body: 'One line about the least-bad thing in the day. On a grey day it is genuinely hard to find one, and finding one anyway is most of the exercise.',
      },
      {
        title: 'Look back after a fortnight',
        body: 'The chart is the argument. It is difficult to hold "this is not permanent" as a belief and easy to see it as a line.',
      },
    ],
    features: ['journal', 'affirmations', 'analytics'],
    faqs: [
      {
        q: 'Is low mood the same as depression?',
        a: 'No, and this app cannot tell you which you have. If it has lasted more than a couple of weeks, or it is affecting sleep, eating or getting through the day, please talk to a doctor — that is a medical question and this is a journal.',
      },
      {
        q: 'Do affirmations actually work?',
        a: 'Generic ones tend not to, because you do not believe them. A specific sentence you wrote yourself, answering something you actually say to yourself, is a different thing — which is why the app makes you write your own rather than handing you a library.',
      },
    ],
    crisisNote: CRISIS,
  },

  {
    slug: 'a-daily-practice',
    name: 'Starting a daily practice',
    metaTitle: 'How to Start a Daily Practice That Actually Lasts',
    metaDescription:
      'Journal, sit, reflect — one routine, five minutes, one app. Built so that missing a day does not end it. Free on Android and in your browser.',
    headline: 'Five minutes, every day, for real this time',
    standfirst:
      'A practice fails for boring reasons: it is too long, it lives in four apps, and the first missed day ends it. This is built against all three.',
    icon: 'Sunrise',
    mockup: 'meditation',
    problem: [
      'You have started before. A meditation app, a habit app, a notes app for the journalling, and something for affirmations — four things to open, so you opened none of them by week three.',
      'And the routine you designed was for your best self on a good morning, which is not who has to do it on a Tuesday in exam season.',
      'One app, five minutes, and a version of the routine that survives a bad day.',
    ],
    steps: [
      {
        title: 'Sit for five minutes',
        body: 'Start at five. Ten is a decision; five is barely one, and the whole point is to remove the decision.',
      },
      {
        title: 'Write one entry',
        body: 'Mood, one habit, one line. It takes about ninety seconds and it is what everything else is built from.',
      },
      {
        title: 'Read one thing',
        body: 'An article from the Sanctuary or one line from your own affirmations. Something in, not just out.',
      },
      {
        title: 'Let the streak carry it',
        body: 'The number gets motivating around day nine. Before then it is just a number, and after a missed day the monthly recovery exists so it does not end there.',
      },
    ],
    features: ['meditation', 'journal', 'affirmations', 'community'],
    faqs: [
      {
        q: 'How long does the daily routine take?',
        a: 'About five to seven minutes if you do all of it. The journal alone is under two.',
      },
      {
        q: 'Can I use it on my laptop?',
        a: 'Yes. Everything the Android app does works in the browser on the same account — the two share one backend, so there is nothing to sync.',
      },
      {
        q: 'Do I need to create an account?',
        a: 'Yes, because your journal has to belong to something. Email, Google or a phone number all work, and the journal is private to that account.',
      },
    ],
  },
];

export const useCaseBySlug = (slug: string): UseCase | undefined =>
  useCases.find((useCase) => useCase.slug === slug);
