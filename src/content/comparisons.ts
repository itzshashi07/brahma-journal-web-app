import type { Faq } from './features';

/**
 * "X alternative" pages.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * The highest-intent query there is, and the easiest one to write badly
 *
 * Somebody searching "free Calm alternative" has already decided they want
 * this kind of app and has decided the one they found costs too much. There is
 * no persuading left to do. The only job of the page is to answer, honestly,
 * whether this is the thing they are looking for — and to say so quickly when
 * it is not.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * Two rules these pages keep
 *
 * **1. Every entry says what the other product is better at, and means it.**
 * Not as a rhetorical move before the pivot — the `betterThere` list is
 * genuinely where the comparison should send somebody. A page that claims a
 * free app beats a company with a studio and a music budget on every axis is
 * read as marketing and believed on nothing, including the parts that are true.
 *
 * **2. No prices, and no feature counts.** Subscription pricing changes by
 * region, by promotion and by quarter, and a page that quotes a competitor's
 * price is wrong within months while continuing to rank. So the comparisons are
 * about *shape* — what the product is for, what it assumes about you, what it
 * costs you in attention — which is both more useful and still true next year.
 * The one number stated anywhere is this app's own, and it is zero.
 */

export type Comparison = {
  slug: string;
  /** The product being compared against. Used in titles and headings. */
  rival: string;
  metaTitle: string;
  metaDescription: string;
  headline: string;
  standfirst: string;
  /** Why somebody is looking for an alternative in the first place. */
  why: string[];
  /** Honest. This is the point of the page. */
  betterThere: string[];
  /** What is different here — differences, not boasts. */
  betterHere: string[];
  /** Who should stop reading and go back. */
  notForYouIf: string;
  faqs: Faq[];
};

export const comparisons: Comparison[] = [
  {
    slug: 'free-calm-alternative',
    rival: 'Calm',
    metaTitle: 'A free Calm alternative that is not a trial',
    metaDescription:
      'Looking for a free Calm alternative? InnenFlow is a meditation timer, private journal and anonymous support board — free, no card, no trial that expires. An honest comparison, including what Calm does better.',
    headline: 'A free alternative to Calm, honestly compared',
    standfirst:
      'Most "free alternatives" are a seven-day trial with a card on file. This one is free because there is nothing to buy — and there are things Calm does that this does not.',
    why: [
      'People usually arrive at this search from one of two places. Either the trial ended and the renewal price is more than a month of data, or they opened the app expecting to meditate and found a library the size of a streaming service.',
      'Both are reasonable reactions to a product built for a subscription business. A catalogue has to keep growing to justify a recurring charge, and once it is large enough, choosing what to listen to becomes another decision at the end of a day that has already had too many.',
    ],
    betterThere: [
      'Sleep stories, narrated by people you have heard of, produced properly. There is nothing like them here and nothing planned.',
      'A music and soundscape library with real production behind it.',
      'Celebrity and expert-led courses — if a named teacher is what makes you show up, that matters more than any feature list.',
      'A polish that comes from a large team working on one thing for years.',
    ],
    betterHere: [
      'Free with no card and no trial clock. The paid thing is one-to-one counselling, and nothing else is behind it.',
      'A journal and a meditation timer in the same app, so the analytics can answer the question a meditation app cannot: does sitting actually change how your days go?',
      'An anonymous board where a real person answers. Nothing in a subscription catalogue replaces somebody who has been there replying at 1am.',
      'Nothing to choose. A timer, a breath, and a small set of techniques — not a library to browse when you are already tired.',
      'It works in a browser on the same account, so an iPhone is not a barrier while the iOS app does not exist.',
      'Built for Indian mobile data: the whole site is a few hundred kilobytes and the app does not stream audio you did not ask for.',
    ],
    notForYouIf:
      'you mainly want something beautiful to fall asleep to. Sleep stories are Calm’s craft, they are expensive to make properly, and a free app is not going to match them. Keep the subscription and use this for the writing.',
    faqs: [
      {
        q: 'Is InnenFlow actually free, or free-for-now?',
        a: 'Free. There is no card, no trial and no locked feature — the journal, the meditation timer, the Gita section, the board and the analytics are the product. One-to-one counselling with a person is paid, because a person’s time costs money.',
      },
      {
        q: 'Does it have sleep stories?',
        a: 'No, and it is not planned. If that is what you are looking for, this is the wrong app and the honest answer is to say so.',
      },
      {
        q: 'Can I use it without installing anything?',
        a: 'Yes. Everything works in a browser on the same account, which is also how it works on iPhone while there is no iOS app.',
      },
      {
        q: 'What happens to what I write?',
        a: 'It is scoped to your account inside the database itself, so a query that forgot to check ownership returns nothing rather than returning somebody else’s. The anonymous board stores authorship where no member account can read it.',
      },
    ],
  },
  {
    slug: 'free-headspace-alternative',
    rival: 'Headspace',
    metaTitle: 'A free Headspace alternative, compared honestly',
    metaDescription:
      'A free Headspace alternative: a meditation timer, a two-minute journal and an anonymous board, with no subscription. What Headspace does better, and who should stay there.',
    headline: 'A free alternative to Headspace',
    standfirst:
      'Headspace teaches meditation properly, in courses, with a voice guiding you. This does not teach — it gets out of the way. Whether that is better depends entirely on whether you already know what to do.',
    why: [
      'Guided courses are how most people should start, and they are what Headspace is genuinely good at. The trouble arrives later: once you know what you are doing, a ten-minute guided session is eight minutes of somebody talking over the quiet you came for.',
      'The other reason people leave is the shape of the subscription. A course you have finished is not worth a monthly charge, and the app has no answer to "I already know how, I just do not do it".',
    ],
    betterThere: [
      'Structured courses that take a complete beginner from nothing to a daily practice. This app has a technique library and a quiz, not a curriculum.',
      'Guided audio with a consistent teacher — if a voice is what gets you to sit, that is not a small thing.',
      'Animations and explanations that make the ideas land for people who bounce off text.',
      'Workplace and family plans, if somebody else is paying.',
    ],
    betterHere: [
      'The timer is the product, not the upsell. Pick a length, pick a technique or do not, and sit.',
      'A journal in the same app, so meditation minutes sit next to mood and the analytics can show whether one is moving the other.',
      'A short quiz that recommends a technique for how you feel *now*, rather than the next lesson in a course you started in March.',
      'An anonymous board, which no meditation app has, because it is a community problem rather than an audio one.',
      'Free, permanently, with no card.',
    ],
    notForYouIf:
      'you have never meditated and want to be taught. A timer will not teach you; a course will. Learn there, and come back when the voice starts getting in the way.',
    faqs: [
      {
        q: 'Are there guided meditations?',
        a: 'There is a technique library that explains what to do and a quiz that suggests one based on how you feel right now, but no narrated audio courses. It is a timer with instructions, not a teacher.',
      },
      {
        q: 'I am a complete beginner. Is this usable?',
        a: 'Yes, but start with the quiz and the technique notes rather than the timer. If you find yourself sitting there unsure what you are meant to be doing, a guided course elsewhere will serve you better for the first month.',
      },
      {
        q: 'Does it track streaks?',
        a: 'Yes, and it computes them from the actual records rather than trusting a counter, so a streak cannot be inflated by the app being wrong. There is a recovery for a single missed day, because one bad Tuesday should not end a hundred days.',
      },
    ],
  },
  {
    slug: 'free-daylio-alternative',
    rival: 'Daylio',
    metaTitle: 'A free Daylio alternative with real journalling',
    metaDescription:
      'A free Daylio alternative: mood tracking plus an actual journal, meditation, and analytics that connect the two. What Daylio does better, and who should stay with it.',
    headline: 'A free alternative to Daylio',
    standfirst:
      'Daylio is the fastest mood tracker there is: two taps and you are done. That speed is exactly its limit — a year of two-tap entries tells you that March was bad and nothing at all about why.',
    why: [
      'Mood trackers are easy to keep up and hard to learn anything from. The chart goes down in March. You knew March was hard. The number cannot tell you that it was the commute, or the person you stopped talking to, or that you stopped sleeping first and the mood followed.',
      'The other thing people run into is that the data lives on the phone. That is a real privacy feature and it is also why a new phone can mean starting again.',
    ],
    betterThere: [
      'Speed. Two taps beats anything with a text field, and an app you actually open every day beats a better app you do not.',
      'Fully offline and local by default, which some people want above everything else.',
      'Custom activity icons, refined over years of use.',
      'A mature widget and reminder system.',
    ],
    betterHere: [
      'A mood *and* one line about why, which is the field that makes the chart mean something a year later.',
      'Meditation minutes, focus minutes and habits in the same record, so the analytics can answer whether the practice is doing anything.',
      'The entry is a structured page — mood, energy, what helped, what got in the way — so it takes two minutes rather than facing a blank page.',
      'Your account rather than your handset: the same journal on the phone and in a browser, and a new phone changes nothing.',
      'An anonymous board and a Gita section, which a mood tracker has no reason to have.',
    ],
    notForYouIf:
      'the two-tap speed is the only reason you have kept it up for two years. Do not trade a habit that works for a better-designed one that you will abandon in a fortnight.',
    faqs: [
      {
        q: 'Can I import my Daylio data?',
        a: 'Not today. There is no import, and pretending otherwise would waste your evening. Most people who move start fresh and keep the old export as a file.',
      },
      {
        q: 'Does it work offline?',
        a: 'The app needs a connection to sync an entry, unlike Daylio which is local-first. That is the trade for having the same journal in a browser and on a replacement phone.',
      },
      {
        q: 'Is the mood scale the same?',
        a: 'Five levels, same as most trackers, plus a separate energy rating — because tired-but-content and anxious-but-energised are different days and one number flattens them into the same dot.',
      },
    ],
  },
];

export const comparisonBySlug = (slug: string): Comparison | undefined =>
  comparisons.find((c) => c.slug === slug);
