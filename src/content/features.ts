/**
 * One landing page per feature, driven by this file.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * Why the content is data and not nine hand-written pages
 *
 * Nine pages written by hand drift: one gets an FAQ, one forgets the install
 * button, one has a title of the wrong length. Holding the *content* here and
 * the *layout* in one template means every feature page is structurally
 * complete by construction — title, description, problem, mechanism, proof,
 * questions, call to action — and adding a tenth feature is adding an entry.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * What each page is trying to do
 *
 * Somebody arriving here searched for a problem, not for this app. The page has
 * to do four things in order, and the shape below is that order:
 *
 *   1. Name the problem in their words, so they know they are in the right place.
 *   2. Show the actual screen, so it stops being an abstraction.
 *   3. Explain the mechanism — *why* it works — because "download our app" is
 *      not a reason and everybody has heard it.
 *   4. Answer the objection they are already forming, which is almost always
 *      about privacy.
 *
 * The copy deliberately does not claim clinical outcomes. This is a journalling
 * and reflection app, not a medical device, and a promise it cannot keep is
 * both a Play Store policy problem and a betrayal of the person reading it.
 */

export type Faq = { q: string; a: string };

export type Feature = {
  slug: string;
  /** Nav and card label. Short. */
  name: string;
  /** `<title>`. Under ~60 chars so it is not truncated in results. */
  metaTitle: string;
  /** `<meta name="description">`. 140–160 chars reads best. */
  metaDescription: string;
  /** Hero heading. Can be longer and more human than the meta title. */
  headline: string;
  /** One sentence under the headline. */
  standfirst: string;
  /** Lucide icon name, resolved in `components/Icon.tsx`. */
  icon: string;
  /** Drives the phone mockup rendered beside the hero. */
  mockup: MockupKind;
  /** The problem, in the reader's words. Two or three short paragraphs. */
  problem: string[];
  /** How it actually works. Each becomes a numbered step. */
  mechanism: { title: string; body: string }[];
  /** Concrete capabilities. Rendered as a checked list. */
  details: string[];
  faqs: Faq[];
  /** Related slugs, for internal linking. */
  related: string[];
};

export type MockupKind =
  | 'journal'
  | 'meditation'
  | 'affirmations'
  | 'thoughts'
  | 'community'
  | 'counselling'
  | 'sanctuary'
  | 'focus'
  | 'analytics';

export const features: Feature[] = [
  {
    slug: 'journal',
    name: 'Private journal',
    metaTitle: 'Private Journal App with Mood Tracking',
    metaDescription:
      'Write a daily entry nobody else can read. Track your mood, your habits and what set you off — and watch the pattern appear over weeks. Free on Android and web.',
    headline: 'A page that is only yours',
    standfirst:
      'A guided daily entry that takes two minutes, remembers what you wrote, and shows you the pattern you cannot see from inside a single day.',
    icon: 'NotebookPen',
    mockup: 'journal',
    problem: [
      'Most days blur. You know this week was harder than last week, but you could not say why, and by the time somebody asks you have already lost the detail that would have explained it.',
      'A blank notebook does not help, because a blank page at 11pm is a question you are too tired to answer. What helps is being asked something specific.',
      'So the entry is a set of small prompts rather than an empty box — how the day felt, what you did, what pulled at you, one moment worth keeping.',
    ],
    mechanism: [
      {
        title: 'Answer a few short prompts',
        body: 'Mood on a five-point scale, the habits you kept, the one that got away, a trigger and how you answered it. Every field is optional. An entry with one line in it still counts.',
      },
      {
        title: 'It is stored against your account, not on a device',
        body: 'Write on your phone on the bus and finish it on a laptop. There is no export, no sync button and no file to lose — it is one account and one journal.',
      },
      {
        title: 'The pattern shows up on its own',
        body: 'After a couple of weeks the mood chart stops being noise. You start seeing which days are heavy and what they have in common, which is the thing you could never hold in your head.',
      },
    ],
    details: [
      'Five-point mood scale with a colour that follows you through the app',
      'Habit checklist you define yourself, plus a "tiny step" for the day',
      'Trigger and response — what pulled at you and what you did about it',
      'Night routine, sleep reflection and a best-moment prompt',
      'Affirmations and visualisation fields for anyone who uses them',
      'Full history, searchable, with nothing deleted unless you delete it',
      'Streak and longest streak, computed on the server from real entries',
    ],
    faqs: [
      {
        q: 'Can anyone else read my journal?',
        a: 'No. Every journal query is scoped to your account inside the database itself, not filtered after the fact — the API is written so that a request for somebody else\'s entry returns nothing rather than returning theirs. There is no admin screen that lists member journals, because one was never built.',
      },
      {
        q: 'Do I have to write every day?',
        a: 'No. The streak is there because it helps some people and it is genuinely satisfying, but nothing is locked behind it and missing a day costs you nothing except the number. There is also a once-a-month streak recovery for a single missed day.',
      },
      {
        q: 'What happens to my entries if I delete my account?',
        a: 'They are deleted. Account deletion sweeps every collection your account touches in one server-side operation and reports anything it could not remove, rather than deleting what it can from the phone and leaving the rest orphaned.',
      },
      {
        q: 'Is the journal free?',
        a: 'Yes, entirely. There is no entry limit, no history limit and no premium tier for the journal.',
      },
    ],
    related: ['analytics', 'affirmations', 'meditation'],
  },

  {
    slug: 'meditation',
    name: 'Guided meditation',
    metaTitle: 'Guided Meditation & Breathing Timer — Free',
    metaDescription:
      'Guided techniques, a breathing timer and themed sessions from five minutes up. No subscription, no locked library, no voice telling you to buy the annual plan.',
    headline: 'Sit down for five minutes',
    standfirst:
      'Guided techniques and a plain timer, paced to the breath. Start at five minutes on a day when ten is too many.',
    icon: 'Brain',
    mockup: 'meditation',
    problem: [
      'Every meditation app opens with a free trial and closes with a paywall halfway through the thing that was working.',
      'And the sessions are long. Twenty minutes is a reasonable ask on a good day and an impossible one on the day you actually need it.',
      'This starts at five, has no locked library, and does not ask for a card.',
    ],
    mechanism: [
      {
        title: 'Pick a technique or just a length',
        body: 'Breath-focused, body scan, grounding, or an unguided timer if instructions are the part you find distracting. Five, ten, twenty or thirty minutes.',
      },
      {
        title: 'The screen breathes with you',
        body: 'A slow expanding circle paced to a long exhale, and a short line to rest attention on. The phrases carry no religious content — anyone can use them without opting into somebody else\'s tradition.',
      },
      {
        title: 'The minutes are banked',
        body: 'Every completed sitting adds to a total the community leaderboard ranks on. It is the one number in the app that is genuinely earned by sitting still.',
      },
    ],
    details: [
      'Guided techniques with written instructions, not a voice-over you cannot pause',
      'Unguided timer with an interval chime',
      'Themed sessions for sleep, focus, anxiety and letting go',
      'Five to thirty minutes, chosen per sitting',
      'Total minutes tracked and ranked on the leaderboard',
      'Works fully offline once the app is installed',
    ],
    faqs: [
      {
        q: 'Is there a subscription?',
        a: 'No. Every technique and every theme is available to every account. There is no trial, no annual plan and no session that stops halfway.',
      },
      {
        q: 'Is it religious?',
        a: 'No. The grounding lines were deliberately rewritten to remove devotional content from any single tradition — the mechanism is a short phrase paced to the breath, with nothing to believe in. There is a separate optional Gita section for anyone who wants it, and it is opt-in.',
      },
      {
        q: 'Do I need headphones?',
        a: 'No. Sessions are visual and text-led with an optional chime, so they work on a bus, in a hostel room, or anywhere you cannot play sound.',
      },
    ],
    related: ['affirmations', 'focus', 'journal'],
  },

  {
    slug: 'anonymous-reflections',
    name: 'Anonymous board',
    metaTitle: 'Anonymous Support Board — Say It Without a Name',
    metaDescription:
      'Post what you cannot say anywhere else, with no name attached. Real replies from people going through the same thing. Genuinely anonymous — even to us.',
    headline: 'Say the thing you cannot say anywhere else',
    standfirst:
      'A board where posts carry no name, no photo and no handle. Someone answers. Nobody knows it was you.',
    icon: 'MessagesSquare',
    mockup: 'thoughts',
    problem: [
      'There are things you will not put on Instagram, will not tell your family, and cannot bring yourself to say to the friend who would worry.',
      'They do not go away for being unsaid. They just sit there, getting heavier and more embarrassing to raise the longer you leave them.',
      'So there is a board where you say it under no name at all, and somebody who has been there says something back.',
    ],
    mechanism: [
      {
        title: 'Post with a display name that is not yours',
        body: 'You are handed something like "Quiet Voice" or "Night Thinker" and a colour. There is no profile behind it and no way to click through to a person.',
      },
      {
        title: 'Authorship is separated at the database level',
        body: 'Who wrote a post is stored in a completely different collection that no member account can read — including yours. The board physically cannot be joined against the member list to unmask anyone.',
      },
      {
        title: 'You are told when someone answers',
        body: 'Replies reach you as a notification even with the app closed, without the reply ever being attached to your name. You can also block anyone and report anything.',
      },
    ],
    details: [
      'Thirty anonymous display names, none of them tied to your account',
      'Replies are anonymous too, with their own separate authorship record',
      'Notifications when your thread gets a reply — with the app closed',
      'Block anyone, and report any post or reply to a human',
      'Delete your own reflection at any time',
      'Deleting your account removes authorship, so past posts become genuinely unattributable rather than vanishing and taking other people\'s replies with them',
    ],
    faqs: [
      {
        q: 'Is it really anonymous, or just anonymous to other users?',
        a: 'The post itself carries no account identifier. Authorship lives in a separate, admin-only collection so that moderation can still reach somebody who threatens another member — which is the reason it is not thrown away entirely. No member-facing screen or API response ever exposes it.',
      },
      {
        q: 'What stops it turning nasty?',
        a: 'Every post and reply can be reported, reports go to a real person, and you can block an account so their posts stop appearing for you. Reports are resolved and recorded rather than deleted, so a pattern of complaints about the same person stays visible.',
      },
      {
        q: 'Will my reflection be there forever?',
        a: 'No. Reflections expire after thirty days. An anonymous board should not become a permanent record of what people were struggling with a year ago.',
      },
      {
        q: 'Can I delete something I posted?',
        a: 'Yes, at any time, and it takes its replies with it. Your own device knows which posts are yours from a private watchlist — the board itself does not.',
      },
    ],
    related: ['counselling', 'community', 'journal'],
  },

  {
    slug: 'counselling',
    name: 'Talk to a counsellor',
    metaTitle: 'One-to-One Counselling Chat — Deleted After Two Hours',
    metaDescription:
      'A private session with a real counsellor, by chat or video. The entire transcript is destroyed two hours after it ends — automatically, by the database.',
    headline: 'A real conversation, then nothing left behind',
    standfirst:
      'Book a thirty-minute session with a counsellor. Two hours after it ends the whole transcript is gone — not archived, deleted.',
    icon: 'HeartHandshake',
    mockup: 'counselling',
    problem: [
      'The hard part about asking for help is not the money or the time. It is the record — the idea that what you said is now sitting in somebody\'s database with your name on it, indefinitely.',
      'That worry is reasonable, and telling people not to have it does not work. What works is not keeping the record.',
      'So the transcript has a deadline stamped on it the moment the session ends, and the database itself does the deleting.',
    ],
    mechanism: [
      {
        title: 'Fill in a short intake',
        body: 'Six questions, not thirty. Somebody reaching for help at 1am abandons a long form, and none of the fields past these change what the counsellor does first.',
      },
      {
        title: 'Choose a chat or a video call',
        body: 'Chat if writing feels safer, a call if you want to be heard. A call is confirmed by a human before a room is issued — nobody is sent to sit alone in an empty room at 3am.',
      },
      {
        title: 'Two hours later it is destroyed',
        body: 'The deadline is stamped by the server, not by your phone, and MongoDB\'s expiry index removes the session and every message under it whether or not anybody opens the app again.',
      },
    ],
    details: [
      'Thirty-minute sessions, chat or video',
      'A per-session video room — never a shared link',
      'Transcript purge two hours after the session ends, enforced by the database',
      'Delete the whole conversation yourself, immediately, at any time',
      'Notifications when your counsellor replies, with the app closed',
      'Payment verified by hand against the bank, with a status you can see',
    ],
    faqs: [
      {
        q: 'Who can read the conversation while it is live?',
        a: 'You and the counsellor. Every read is scoped to your account or to an operator account inside the query itself, and the messages carry the same expiry deadline as the session.',
      },
      {
        q: 'What if I want it gone right now?',
        a: 'There is a delete button on the session. It removes the session and the entire transcript immediately, without waiting for the two hours.',
      },
      {
        q: 'Is this therapy?',
        a: 'No, and it is important to be plain about that. It is a conversation with a counsellor for support and perspective. It is not a clinical service, it is not a substitute for treatment, and if you are in danger please contact your local emergency services or a crisis line.',
      },
      {
        q: 'How much is it?',
        a: 'A session fee is shown in the app before you commit to anything, and it is stored on the session so a later price change never rewrites what you were charged.',
      },
    ],
    related: ['anonymous-reflections', 'journal', 'community'],
  },

  {
    slug: 'affirmations',
    name: 'Affirmations',
    metaTitle: 'Write Your Own Affirmations & Track Repetitions',
    metaDescription:
      'Write affirmations in your own words instead of reciting a stranger\'s. Pick a background, count your repetitions, and watch the progress build.',
    headline: 'In your words, not a stranger\'s',
    standfirst:
      'Most affirmation apps hand you somebody else\'s sentences. Write your own, set them against a background you like, and count the repetitions.',
    icon: 'Sparkles',
    mockup: 'affirmations',
    problem: [
      'A generic affirmation does nothing, because you do not believe it. "I am abundant" written by a marketing team is a sentence you are reading, not one you mean.',
      'The ones that land are the specific ones — the answer to the exact thing your head says to you at 2am.',
      'So you write them yourself, and the app just makes sure you actually come back to them.',
    ],
    mechanism: [
      {
        title: 'Write your own set',
        body: 'As many as you want, edited whenever you want. Removing one actually removes it — there is no library quietly merging its suggestions back in.',
      },
      {
        title: 'Give each one a background',
        body: 'A card you would not mind looking at. It sounds trivial; it is the difference between opening the screen and not.',
      },
      {
        title: 'Count what you actually did',
        body: 'Repetitions roll up per affirmation, so the progress against each one is a real count rather than a streak you are guessing at.',
      },
    ],
    details: [
      'Unlimited affirmations, written and edited by you',
      'A background image chosen per affirmation',
      'Repetition counter and total per affirmation',
      'A session log, so a sitting is recorded even if you lose count',
      'Available inside the daily journal entry as well',
    ],
    faqs: [
      {
        q: 'Do I have to write them myself?',
        a: 'You can start from suggestions, but the set is yours and every line is editable. The point is that the words are ones you would actually say.',
      },
      {
        q: 'Does it track how often I practise?',
        a: 'Yes — per affirmation, as a repetition count and a last-practised date, plus a session record for each sitting.',
      },
    ],
    related: ['meditation', 'journal', 'analytics'],
  },

  {
    slug: 'community',
    name: 'Community & streaks',
    metaTitle: 'Streaks, Badges and a Community Leaderboard',
    metaDescription:
      'A leaderboard nobody can cheat — every number is recomputed on the server from what you actually wrote and how long you actually sat.',
    headline: 'A number you cannot fake',
    standfirst:
      'Streaks, longest streaks, minutes meditated and entries written — all recomputed server-side from real records, then ranked.',
    icon: 'Trophy',
    mockup: 'community',
    problem: [
      'A leaderboard where the client reports its own score is not a leaderboard. It is a text field.',
      'And a streak you can quietly repair by changing your phone\'s clock is worth nothing to the person who kept theirs honestly.',
      'So every ranked number here is derived on the server from the entries and sessions actually stored.',
    ],
    mechanism: [
      {
        title: 'Your stats are computed, not submitted',
        body: 'The server counts your entries, sums your meditation seconds and works out your streak from the dates on real records. The app cannot send a number and have it believed.',
      },
      {
        title: 'Streaks respect your calendar, not the server\'s',
        body: 'Your device sends its UTC offset so "today" means today where you are. Without that, anyone journalling after midnight in India would have their streak broken every night by a server in another hemisphere.',
      },
      {
        title: 'Follow people, quietly',
        body: 'Follower counts are public. Who follows whom is not, and there is deliberately no endpoint that would answer it — a social graph on a mental-health app records who somebody was drawn to while they were struggling.',
      },
    ],
    details: [
      'Current streak and longest streak, both server-computed',
      'One streak recovery a month for a single missed day, with the day re-derived by the server rather than named by you',
      'Total entries and total meditation minutes on the board',
      'Badges that do not disappear the day you miss a session',
      'Follow other members; follower counts public, follow lists private',
      'Block and report available everywhere',
    ],
    faqs: [
      {
        q: 'Can people see what I wrote?',
        a: 'No. The leaderboard row carries a display name, an avatar and four numbers — no email, no age, no gender and nothing from your journal.',
      },
      {
        q: 'What is the streak recovery?',
        a: 'Once a month you can repair a single missed day, but only if repairing it actually revives a real streak — the server re-derives which day qualifies rather than trusting the one the app names, so it cannot be used to invent a streak you never had.',
      },
      {
        q: 'Can I use the app without appearing on the leaderboard?',
        a: 'The board shows a display name you choose. Nothing requires it to be your real one.',
      },
    ],
    related: ['journal', 'analytics', 'meditation'],
  },

  {
    slug: 'sanctuary',
    name: 'Articles',
    metaTitle: 'Sanctuary — Articles on Calm, Habits and Getting Through',
    metaDescription:
      'Plain-language articles on anxiety, habits, sleep and self-worth. Read in English or Hinglish. Written by the community and reviewed before publishing.',
    headline: 'Something worth reading, in the language you think in',
    standfirst:
      'Articles on the things this app is about — written by members, reviewed before they publish, and available in Hinglish as well as English.',
    icon: 'BookOpen',
    mockup: 'sanctuary',
    problem: [
      'Most mental-health writing on the internet is either a listicle or a wall of clinical language, and both are useless at the moment you actually need something.',
      'And almost all of it is in English, which is not the language most of this app\'s readers think in.',
      'So articles here are plain, short, and many of them exist in Hinglish as a real second version rather than a machine translation.',
    ],
    mechanism: [
      {
        title: 'Anyone can write',
        body: 'Members submit articles from inside the app. It is the difference between a community and a blog.',
      },
      {
        title: 'Nothing publishes unreviewed',
        body: 'A submission goes to a queue and a human reads it. Rejections come with a reason and the draft is kept — deleting somebody\'s writing without a word is how you lose the person as well as the article.',
      },
      {
        title: 'Read it in Hinglish',
        body: 'Where a Hinglish version exists, a switch on the article moves between them. It is written, not translated.',
      },
    ],
    details: [
      'Articles by category — anxiety, habits, sleep, relationships, focus',
      'English and Hinglish versions of the same article where available',
      'Like, share and comment',
      'Submit your own from inside the app',
      'Reviewed before publishing, with a reason if it is turned down',
    ],
    faqs: [
      {
        q: 'Can I write for it?',
        a: 'Yes. Any signed-in member can submit an article, and it goes into the review queue like everybody else\'s.',
      },
      {
        q: 'Who decides what gets published?',
        a: 'A human reviewer. Approval and rejection are both recorded, and a rejection carries a written reason the author can see.',
      },
    ],
    related: ['library', 'journal', 'anonymous-reflections'],
  },

  {
    slug: 'library',
    name: 'Reading library',
    metaTitle: 'Reading Library — Books and Guides in the App',
    metaDescription:
      'A small library of guides and books you can read inside the app. Free titles open immediately; paid ones unlock permanently once bought.',
    headline: 'A shelf, not a store',
    standfirst:
      'A short library of guides worth reading, opened inside the app. What you buy stays yours.',
    icon: 'Library',
    mockup: 'sanctuary',
    problem: [
      'A library that is really a storefront wastes your time. This one is small on purpose.',
      'And an entitlement you paid for should not disappear because a title was withdrawn from the catalogue.',
    ],
    mechanism: [
      {
        title: 'Free titles just open',
        body: 'No account gate beyond being signed in, and no upsell in front of the first page.',
      },
      {
        title: 'A purchase is verified server-side',
        body: 'The payment signature is checked by the server before an entitlement is written. There is no client path that could grant itself the library.',
      },
      {
        title: 'What you bought stays bought',
        body: 'Purchases are kept even if a title is delisted. Deleting the listing does not erase an entitlement somebody is still owed.',
      },
    ],
    details: [
      'Read inside the app — no external download step',
      'Free and paid titles in one shelf, with what you own marked',
      'Server-verified payment before anything unlocks',
      'Purchases survive a title being withdrawn',
    ],
    faqs: [
      {
        q: 'Is there a subscription?',
        a: 'No. Titles are individually free or individually bought, and there is no recurring charge anywhere in the app.',
      },
      {
        q: 'What happens if a book is removed?',
        a: 'If you bought it, you keep it. Purchases are deliberately not deleted when a listing is withdrawn.',
      },
    ],
    related: ['sanctuary', 'journal'],
  },

  {
    slug: 'focus',
    name: 'Focus games',
    metaTitle: 'Focus Games and Concentration Training',
    metaDescription:
      'Short attention games with a personal best that only moves when you actually beat it. Banked training minutes and a per-game leaderboard.',
    headline: 'Five minutes of actually paying attention',
    standfirst:
      'Short games built around holding attention rather than burning it. Your best score only moves when you genuinely beat it.',
    icon: 'Target',
    mockup: 'focus',
    problem: [
      'The reason concentration feels broken is rarely a lack of willpower. It is that nothing you do all day asks you to hold attention on one thing for more than a few seconds.',
      'These are short, they are not designed to be endless, and they do not want your evening.',
    ],
    mechanism: [
      {
        title: 'Play for a few minutes',
        body: 'Reaction, memory, tracking and pattern games, each finishable in the time you have.',
      },
      {
        title: 'Only a real improvement counts',
        body: 'A weaker run still counts as a play — the attempt happened — but the number on the board is held back until you actually beat it.',
      },
      {
        title: 'Minutes bank into your total',
        body: 'Training time adds up across games, so a scattered week of two-minute sessions still shows as something.',
      },
    ],
    details: [
      'Several short games, each a few minutes',
      'Personal best per game, written only on a genuine improvement',
      'Per-game leaderboard, ranked correctly for time-based and point-based games',
      'Banked training minutes across all games',
    ],
    faqs: [
      {
        q: 'Do these actually improve focus?',
        a: 'They are practice at holding attention, and they are enjoyable. This app does not claim a clinical effect, and anybody who tells you a phone game rewires your brain is selling something.',
      },
      {
        q: 'Are they free?',
        a: 'Yes, all of them.',
      },
    ],
    related: ['meditation', 'community'],
  },

  {
    slug: 'analytics',
    name: 'Mood insights',
    metaTitle: 'Mood Tracking Charts and Journal Insights',
    metaDescription:
      'See your mood over weeks, which habits you actually keep, and what your hardest days have in common — from entries you already wrote.',
    headline: 'The pattern you cannot see from inside one day',
    standfirst:
      'Charts built from entries you already wrote. No extra tracking, no wearable, no forms to fill in twice.',
    icon: 'LineChart',
    mockup: 'analytics',
    problem: [
      'You cannot see your own trend. From inside a bad Tuesday, every Tuesday has been bad, and from inside a good week you cannot remember the last hard one.',
      'A chart settles it, and the honest version of that chart is built from what you actually wrote rather than from a separate mood-check you would forget to do.',
    ],
    mechanism: [
      {
        title: 'Every entry is already a data point',
        body: 'The mood you set and the habits you ticked are the chart. Nothing extra to log.',
      },
      {
        title: 'Look at weeks, not days',
        body: 'The view that helps is the one that is too long to hold in your head — which weeks were heavy, and what they had in common.',
      },
      {
        title: 'Habits are counted honestly',
        body: 'The kept-rate is what you actually ticked, not what you intended. It is more useful for being unflattering.',
      },
    ],
    details: [
      'Mood over time, coloured on the same five-point scale as the journal',
      'Habit completion rates over any period',
      'Entry frequency, streak history and longest streak',
      'Meditation minutes over time',
      'Everything derived from entries you already made',
    ],
    faqs: [
      {
        q: 'Is my data used to train anything?',
        a: 'No. Your entries are used to draw your own charts and nothing else. There is no model being trained on them and no third party receiving them.',
      },
      {
        q: 'How long before the charts are useful?',
        a: 'About two weeks. Below that it is a handful of dots and the shape is noise.',
      },
    ],
    related: ['journal', 'community', 'meditation'],
  },
];

export const featureBySlug = (slug: string): Feature | undefined =>
  features.find((feature) => feature.slug === slug);
