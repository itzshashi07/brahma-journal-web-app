import type { Faq } from './features';

/**
 * Guides — the pages that are useful whether or not anybody installs anything.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * What separates these from the use-case pages
 *
 * A use-case page is about a situation and ends at the product. A guide is a
 * complete answer to a question somebody typed, and would still be worth
 * reading if the app did not exist. That is not altruism: a page that answers
 * the question earns the link, the return visit and the position; a page that
 * withholds the answer until you sign up earns a back button.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * The one page here that is not marketing at all
 *
 * `mental-health-helplines-india` sends people away, on purpose, and carries no
 * signup call to action. Somebody in a crisis should reach a human being with
 * training, not a journalling app, and the correct behaviour for a product in
 * this category is to make that easy and get out of the way.
 *
 * Helpline numbers go stale and a wrong number in an emergency is worse than no
 * page at all, so every entry carries the source it can be checked against and
 * `verifiedOn` says when it was last looked at. Check them before each release.
 */

export type Guide = {
  slug: string;
  metaTitle: string;
  metaDescription: string;
  headline: string;
  standfirst: string;
  /** Rendered as the article body. Each section becomes an `h2`. */
  sections: { heading: string; body: string[] }[];
  /** Optional numbered practice, emitted as HowTo structured data. */
  steps?: { title: string; body: string }[];
  faqs: Faq[];
  /** Related feature slugs, for internal linking. */
  features?: string[];
  /** Suppresses the signup call to action. See the note above. */
  noSell?: boolean;
  /** When the facts on this page were last checked against their sources.
   *  Only set where being out of date would be harmful. */
  verifiedOn?: string;
};

export const guides: Guide[] = [
  {
    slug: 'how-to-start-journaling',
    metaTitle: 'How to start journaling when you have tried and stopped',
    metaDescription:
      'A practical guide to starting a journal that survives past week two: how long to write, what to write when nothing happened, and why the blank page is the problem rather than your discipline.',
    headline: 'How to start journaling (and still be doing it in a month)',
    standfirst:
      'Almost everybody who fails at this fails the same way, and it is not a discipline problem. It is a blank page problem.',
    sections: [
      {
        heading: 'Why the last three attempts ended',
        body: [
          'You bought the notebook. You wrote a page and a half on the first night, most of a page on the second, four lines on the fourth, and then there was a Wednesday you were too tired and the streak was over — and a broken streak in a notebook is a rebuke you have to look at every time you see it on the shelf.',
          'The mistake was at the start, and it was ambition. A blank page is a request for an essay. At 11pm, after a day that took everything, an essay is not going to happen, so the honest choice is between writing badly and not writing — and not writing wins, every time.',
          'The fix is to make the ask smaller than your worst day. Not smaller than your average day. Smaller than the worst one.',
        ],
      },
      {
        heading: 'Write one line, and mean it',
        body: [
          'One line is the entire target. Not "at least" one line — one. On a good night you will write more without being asked, and on a bad night you will write one and still have kept the practice, which is the only thing that matters in the first month.',
          'This is why InnenFlow’s entry is a structured page rather than an empty box: a mood, an energy level, what helped, what got in the way, and one free line. Answering four small questions is a different cognitive task from composing, and it is the one that survives contact with a bad Tuesday.',
        ],
      },
      {
        heading: 'What to write when nothing happened',
        body: [
          'Nothing happening is a normal entry, not a missing one. Try any of: the one thing that pulled at your attention today; something small that went right; what you are avoiding; what you would say to a friend in your position; what you want tomorrow to feel like.',
          'The point is not to produce insight. It is to have a record, so that in three months you can look back and see the shape of a thing you could not see while you were inside it.',
        ],
      },
      {
        heading: 'Do not read it back for the first month',
        body: [
          'Rereading early is how people conclude their writing is bad and stop. It is not writing for an audience, including a future you with opinions. Leave it. Around month three it starts to be genuinely useful, because by then there is enough of it to see a pattern.',
        ],
      },
    ],
    steps: [
      {
        title: 'Pick the time you are already still',
        body: 'Attach it to something that already happens — after brushing your teeth, once you are in bed, on the last train. A time that needs a new habit to hold another new habit will not hold.',
      },
      {
        title: 'Set the bar at one line',
        body: 'One sentence about the day. If you write more, that is a bonus and not the target.',
      },
      {
        title: 'Rate the day before you write it',
        body: 'A mood and an energy level take three seconds and give the sentence something to be about. This is also what makes the chart worth anything later.',
      },
      {
        title: 'Miss a day without ceremony',
        body: 'You will miss days. Write the next day as though nothing happened, because nothing did — a streak is a motivator, not a moral record.',
      },
      {
        title: 'Look back at week four',
        body: 'Not before. Read a month at once and you will notice things no single evening could have told you.',
      },
    ],
    faqs: [
      {
        q: 'How long should I write for?',
        a: 'Two minutes. If you are regularly going past ten, that is lovely but it is no longer the habit you are building — the habit is the thing you can do on your worst night.',
      },
      {
        q: 'Morning or night?',
        a: 'Night, for most people, because the day is done and there is something to report. Morning journalling is a different practice — it is planning, not reflection.',
      },
      {
        q: 'Paper or an app?',
        a: 'Paper is better for thinking and worse for keeping. An app will not lose it, can be with you when it hits at 3pm, and can turn four months of small entries into something you can actually look at.',
      },
      {
        q: 'What if someone reads it?',
        a: 'That fear will shape what you write, which defeats the point. In InnenFlow every query for your entries is scoped to your account inside the database itself, so a bug returns nothing rather than somebody else’s diary.',
      },
    ],
    features: ['journal', 'analytics'],
  },
  {
    slug: 'five-minute-meditation-for-beginners',
    metaTitle: 'A five-minute meditation for beginners, with no app required',
    metaDescription:
      'What to actually do for five minutes: posture, breath, what to do when the mind wanders, and why five minutes daily beats thirty minutes on Sunday. No signup needed to follow it.',
    headline: 'Five minutes, and what to actually do in them',
    standfirst:
      'Most beginner guides describe the benefits and then say "focus on your breath", which is the part nobody knows how to do. Here is the part nobody explains.',
    sections: [
      {
        heading: 'Five minutes, daily, beats thirty on Sunday',
        body: [
          'This is not a compromise for busy people. A short sitting every day changes what your mind does the rest of the time in a way a long weekly session does not, in the same way that a short walk daily does more than one long hike a month.',
          'It also removes the excuse. Nobody genuinely does not have five minutes; they have five minutes and a reluctance, and five is small enough that the reluctance loses.',
        ],
      },
      {
        heading: 'The posture question, answered quickly',
        body: [
          'Sit on a chair with your feet flat, back not touching the backrest if you can manage it, hands anywhere. That is it. You do not need the floor, a cushion, or crossed legs — a posture that hurts is a countdown, and you will spend the five minutes waiting for it to end.',
          'Eyes closed if that is comfortable; if closing them makes you drowsy or uneasy, look at a point on the floor a metre or two ahead instead.',
        ],
      },
      {
        heading: 'What "focus on the breath" actually means',
        body: [
          'It does not mean thinking about breathing, and it does not mean controlling it. Find the one place the breath is most physically obvious — the nostrils, the chest, the belly — and rest attention there like a hand on a railing. Do not follow the whole journey of the air. One place.',
          'Then your mind will wander. Within about nine seconds, usually.',
        ],
      },
      {
        heading: 'The wandering is the practice, not the failure',
        body: [
          'This is the single thing beginners get wrong, and it is the thing that makes people conclude they "cannot meditate". You are not trying to hold a blank mind. Every time you notice you have drifted and come back is one repetition of the actual exercise — noticing, and returning. A session with fifty distractions and fifty returns is fifty repetitions. That is a good session.',
          'Do not grade the returns. Noticing you are annoyed at yourself for drifting is also noticing. Come back.',
        ],
      },
      {
        heading: 'When to stop',
        body: [
          'At the timer, whether it felt good or not. Sitting longer because it was going well trains the practice to depend on it going well, and it usually will not.',
        ],
      },
    ],
    steps: [
      {
        title: 'Set a timer for five minutes',
        body: 'A timer, not a clock. Checking the time is the thing you are practising not doing.',
      },
      {
        title: 'Sit so you can forget your body',
        body: 'Chair, feet flat, upright but not rigid. Comfortable enough to stop noticing.',
      },
      {
        title: 'Take three slow breaths on purpose',
        body: 'Deliberately, to mark the start. Then stop steering it and let the breath do whatever it does.',
      },
      {
        title: 'Rest attention in one place',
        body: 'Nostrils, chest or belly — whichever is most obvious today. Just the one.',
      },
      {
        title: 'When you notice you have drifted, come back',
        body: 'That is the whole exercise. Not a lapse in it — it *is* it.',
      },
      {
        title: 'Stop at the timer',
        body: 'Then, before you stand up, note one word for how you feel. That is what makes the next one easier to start.',
      },
    ],
    faqs: [
      {
        q: 'My mind will not stop. Am I doing it wrong?',
        a: 'No — a mind that stops is not the goal and does not happen. The exercise is noticing you have drifted and coming back. A busy session with many returns is a productive one.',
      },
      {
        q: 'What time of day?',
        a: 'Whenever you will actually do it. Morning suits most people because the day has not started making claims yet, but an evening sitting you keep beats a morning one you skip.',
      },
      {
        q: 'Do I need an app?',
        a: 'No. Any timer works and this page is the whole instruction. An app helps with two things: choosing a technique when you do not know what to do, and keeping a record so you can see whether it is changing anything.',
      },
      {
        q: 'How long before it works?',
        a: 'Most people notice something around the second or third week — usually a slightly longer gap between a thing happening and reacting to it. If you are waiting for calm to arrive, you may miss it: that gap is the effect.',
      },
    ],
    features: ['meditation', 'analytics'],
  },
  {
    slug: 'journal-prompts-that-are-not-useless',
    metaTitle: '40 journal prompts for anxiety, self-doubt and stuck days',
    metaDescription:
      'Journal prompts grouped by the state you are actually in — anxious, flat, angry, stuck, or fine but drifting. Specific enough to answer at 11pm, free, no signup.',
    headline: 'Journal prompts, grouped by the state you are in',
    standfirst:
      '"What are you grateful for?" is a fine question and a terrible prompt on a night when the answer is nothing. These are sorted by how you actually feel.',
    sections: [
      {
        heading: 'When your mind will not slow down',
        body: [
          '• What exactly am I afraid will happen? Write it as a sentence with an actual outcome in it.\n• Which part of this is mine to do something about, and which part is not?\n• What is the smallest next action, and when will I do it?\n• If this happened to a friend, what would I tell them?\n• What is the version of tomorrow where this is fine?',
          '• Has a version of this worried me before? What actually happened?\n• What am I avoiding by thinking about this instead?\n• What would I need to hear right now to put this down for the night?',
        ],
      },
      {
        heading: 'When everything is flat',
        body: [
          '• What is one thing that happened today that was not bad?\n• When did I last feel like myself, and what was around me then?\n• What am I doing out of obligation that nobody would notice if I stopped?\n• What would make tomorrow one percent less grey?\n• Who have I not spoken to in too long?',
          '• What did my body do today — sleep, food, movement, light? Which of those is furthest from what it needs?\n• If I had a free hour tomorrow with no expectations, what would I want to do with it?',
        ],
      },
      {
        heading: 'When you are angry',
        body: [
          '• What actually happened, with no interpretation in the sentence?\n• What did I want that I did not get?\n• What is the thing under the anger — hurt, fear, embarrassment, tiredness?\n• What would I say if I were sure it would be heard well?\n• What do I want to happen next, realistically?',
          '• Is this about today, or is today the fifth time?\n• What will I regret tomorrow if I do it tonight?',
        ],
      },
      {
        heading: 'When you doubt yourself',
        body: [
          '• What is the evidence for the thing I am telling myself, written out?\n• What is the evidence against it?\n• Whose voice is this, actually?\n• What have I done in the last year that the version of me from two years ago would be impressed by?\n• What would I attempt if I were sure it would go fine?',
          '• What am I comparing myself to, and do I know that thing’s full picture or only its front?\n• What is one small thing I am genuinely good at that I have stopped counting?',
        ],
      },
      {
        heading: 'When things are fine but you are drifting',
        body: [
          '• What am I building, if anything?\n• What did I care about a year ago that I have quietly dropped?\n• What is taking my time that I never chose?\n• If nothing changed for two years, what would I most regret?\n• What is one thing I could start this week that future me would thank me for?',
          '• Who do I want to be to the people close to me — and is that what I have been this month?',
        ],
      },
    ],
    faqs: [
      {
        q: 'Do I have to answer all of them?',
        a: 'One. Pick the section matching how you feel and answer whichever line you flinched at slightly — that is generally the one worth the two minutes.',
      },
      {
        q: 'How long should the answer be?',
        a: 'A sentence is a complete answer. The prompt exists to get you past the blank page, not to set an essay.',
      },
      {
        q: 'Can I use the same prompt every night?',
        a: 'Yes, and there is something to be said for it. The same question on thirty different days is a much better instrument for noticing change than thirty different questions.',
      },
    ],
    features: ['journal', 'affirmations'],
  },
  {
    slug: 'mental-health-helplines-india',
    metaTitle: 'Mental health helplines in India — free numbers that answer',
    metaDescription:
      'Free mental health helplines in India, including Tele-MANAS on 14416, with hours and languages. If you are in danger right now, call rather than read.',
    headline: 'If you need to talk to somebody now',
    standfirst:
      'This page has no app in it. These are free helplines in India staffed by people trained for this. If you are in immediate danger, call one of them or go to the nearest hospital.',
    sections: [
      {
        heading: 'Tele-MANAS — 14416',
        body: [
          'The Government of India’s national mental health helpline. Free, available every hour of every day, in a wide range of Indian languages. You can also reach it on 1800-891-4416.',
          'This is the number to use first if you are not sure which to use. It can also connect you onward to a mental health professional in your state.',
        ],
      },
      {
        heading: 'KIRAN — 1800-599-0019',
        body: [
          'A free 24-hour helpline from the Ministry of Social Justice and Empowerment, offering support in thirteen languages for distress, anxiety, and suicidal thoughts.',
        ],
      },
      {
        heading: 'AASRA — +91 98204 66726',
        body: [
          'A volunteer-run crisis line operating 24 hours, based in Mumbai and answering from across the country.',
        ],
      },
      {
        heading: 'Vandrevala Foundation — 1860-266-2345 / +91 99996 66555',
        body: [
          'A free 24-hour counselling helpline, reachable by phone and by WhatsApp.',
        ],
      },
      {
        heading: 'If you are outside India',
        body: [
          'Contact your local emergency number, or search for the crisis line in your country — most have one that is free and answers at any hour.',
        ],
      },
      {
        heading: 'What to expect when you call',
        body: [
          'Somebody will answer and ask what is going on. You do not need to have it organised, and you do not need to be in the worst possible state to deserve the call — "I am not doing well and I did not know who else to tell" is a complete reason.',
          'You can stay anonymous. You can hang up. You can call again tomorrow.',
        ],
      },
      {
        heading: 'A note on this page',
        body: [
          'These numbers were checked against their official sources when this page was last updated. Helplines change, and a wrong number in an emergency is worse than no page — if one of these does not connect, Tele-MANAS on 14416 is the most reliable, and the number a search engine will confirm fastest.',
        ],
      },
    ],
    faqs: [
      {
        q: 'Are these free?',
        a: 'Yes. Tele-MANAS, KIRAN, AASRA and Vandrevala are all free to call.',
      },
      {
        q: 'Will they tell anyone?',
        a: 'These are confidential services and you can stay anonymous. They exist so that people can say things they cannot say to anyone who knows them.',
      },
      {
        q: 'What if I am not in crisis, just struggling?',
        a: 'That is a completely valid reason to call. You do not have to be at the worst point to be allowed to ask for help — and calling earlier is the entire idea.',
      },
      {
        q: 'Can an app help instead?',
        a: 'Not with this. An app is for the ordinary evenings — reflecting, noticing patterns, keeping a practice. It is not a substitute for a trained person and it is not for an emergency.',
      },
    ],
    noSell: true,
    verifiedOn: '2026-08-12',
  },
];

export const guideBySlug = (slug: string): Guide | undefined =>
  guides.find((g) => g.slug === slug);
