/**
 * The privacy policy and the terms.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * Kept in step with the app, deliberately
 *
 * The Flutter app renders the same two documents from
 * `lib/screens/legal/legal_screen.dart`. They have to say the same thing: a
 * privacy policy that differs between a company's app and its website is not a
 * policy, it is two drafts, and the difference is what a regulator asks about.
 *
 * When one changes, both change. There is no shared package between a Dart
 * codebase and a TypeScript one, so this is a convention rather than a
 * guarantee — which is exactly why it is written down here.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * On the storage description
 *
 * The app's copy still says Firestore in places. Application data has moved to
 * MongoDB behind the API, with Firebase kept for identity and push delivery
 * only, so the wording here describes what is actually true now. The app copy
 * should be updated to match — noted rather than silently diverged from.
 */

export const legalUpdated = '12 August 2026';

export type LegalSection = { title: string; body: string[] };

export const privacySummary =
  'Your journal is yours. Nobody else — including us — can read your entries, ' +
  'your check-ins or your counselling messages, except where this page says ' +
  'otherwise. We do not sell data, we do not run ads, and there are no ' +
  'third-party analytics or advertising SDKs in the app or on this site.';

export const privacySections: LegalSection[] = [
  {
    title: 'What we store',
    body: [
      'Your account details (name, email, phone, age, gender), your journal entries and daily check-ins, your meditation, affirmation and game sessions, anything you post publicly (articles, comments, anonymous reflections), and — if you book a counselling session — the intake details you fill in and the conversation itself.',
      'Identity is handled by Firebase Authentication, operated by Google. Everything else lives in a MongoDB database operated by MongoDB Atlas. We hold no passwords: sign-in credentials are Firebase\'s, and this service never sees them.',
    ],
  },
  {
    title: 'Who can read your journal',
    body: [
      'Only you. Every query for a journal entry, a check-in or an affirmation is scoped to the account that wrote it inside the database query itself, rather than being fetched and then filtered.',
      'That distinction is the whole guarantee. A filter applied after the fetch is one forgotten line away from serving somebody else\'s diary; a filter written into the query returns nothing when it is forgotten. There is also no administrative screen anywhere that lists member journals, because one was never built.',
    ],
  },
  {
    title: 'What other members can see',
    body: [
      'Only what you deliberately make public: your display name, avatar, streak and practice counters on the Community leaderboard; any article or comment you publish; and anonymous reflections, which carry a generated display name and never your identity.',
      'Your email, phone number, age and gender are never shown to other members. The public profile response is an explicit allowlist of fields rather than a filter of excluded ones, so a field added later is private until somebody decides otherwise.',
    ],
  },
  {
    title: 'Following',
    body: [
      'How many followers somebody has is public. Who follows whom is not — not to other members, and not to the person being followed.',
      'There is deliberately no endpoint anywhere in the API that would answer "who follows me". A follower list is a social graph, and a social graph on a mental-health app records who somebody was drawn to at the moment they were struggling.',
    ],
  },
  {
    title: 'Anonymous reflections',
    body: [
      'A reflection is posted under a generated display name and carries no account identifier. Who wrote it is stored in a separate collection that no member account can read, so the board cannot be joined against the member list to unmask anyone.',
      'That record is kept, rather than discarded, for one reason: moderation has to be able to act on a threat made against another member. It is readable only by an operator.',
      'Reflections expire thirty days after they are posted, whether or not anyone has replied. You can delete your own at any time, and we remove any that break the community rules.',
    ],
  },
  {
    title: 'Counselling sessions',
    body: [
      'Your intake details and the whole conversation are readable only by you and the counsellor.',
      'The entire session and every message in it are deleted two hours after the session ends. The deadline is stamped by the server rather than by your device, and the database removes the records itself when it passes — so the deletion happens whether or not anybody opens the app again.',
      'You can also end and delete a session yourself at any time, immediately, without waiting for the two hours. What you say in a counselling session is never used for anything else and is never shown to other members.',
    ],
  },
  {
    title: 'Payments',
    body: [
      'Counselling fees are paid by UPI directly from your own banking app. We never see or store your card number, UPI PIN or bank credentials.',
      'All that is recorded is the payment method you tell us and the transaction reference you send, so a human can verify the payment arrived. Where a payment gateway is used, its signature is verified on the server before any entitlement is granted — there is no path by which a client could grant itself a purchase.',
    ],
  },
  {
    title: 'Notifications',
    body: [
      'Push notifications are delivered by Firebase Cloud Messaging. Messages are data-only and carry a title, a short body and a route — never the contents of a journal entry or a counselling message.',
      'Turning notifications off in your device settings does not affect anything else in the app.',
    ],
  },
  {
    title: 'Microphone and voice',
    body: [
      'The microphone is used only while you are holding a voice input button, and only after you grant permission. Speech-to-text is processed by your own device\'s speech recogniser. Nothing is recorded in the background, ever.',
    ],
  },
  {
    title: 'This website',
    body: [
      'The public pages of this site set no cookies and run no analytics or advertising scripts. The font is served from this domain rather than from Google, so visiting a marketing page contacts no third party at all.',
      'Once you sign in, your browser stores a Firebase session so you are not asked to sign in again every time. That is the only thing kept in browser storage.',
    ],
  },
  {
    title: 'What we do not do',
    body: [
      'We do not sell your data. We do not share it with advertisers or data brokers. We do not use your journal to train anything. There are no third-party analytics or advertising SDKs in the app or on this site.',
    ],
  },
  {
    title: 'Children',
    body: [
      'InnenFlow is not intended for anyone under 13. If you believe a child has created an account, contact us and we will remove it.',
    ],
  },
  {
    title: 'Your rights',
    body: [
      'You can view and edit your profile, read everything you have written, and delete your account entirely from inside the app.',
      'Deletion runs server-side as one operation across every collection your account touches, and reports anything it could not remove rather than leaving it silently orphaned. Requests made by email are completed within 30 days.',
      'The anonymous board is the one deliberate exception: deleting your account removes the record of who wrote each reflection, which makes past posts genuinely unattributable — rather than deleting the posts and taking other people\'s replies with them.',
    ],
  },
  {
    title: 'Changes',
    body: [
      'If this policy changes in a way that affects what we do with your data, the app will tell you. Continuing to use it after that means you accept the change.',
    ],
  },
];

export const termsSummary =
  'InnenFlow is a journalling and wellbeing app. It is not medical treatment ' +
  'and it is not an emergency service. Be kind in the parts other people can ' +
  'see, and everything you write privately stays yours.';

export const termsSections: LegalSection[] = [
  {
    title: 'Not a medical service',
    body: [
      'InnenFlow is a journalling, reflection and peer-support app. It does not diagnose, treat or prevent any condition, and nothing in it is medical advice.',
      'Counselling sessions are conversations for support and perspective. They are not therapy, they are not clinical care, and they do not create a doctor-patient relationship.',
      'If you are in danger or thinking about harming yourself, contact your local emergency services. In India, Tele-MANAS is free on 14416, any hour of any day.',
    ],
  },
  {
    title: 'Your account',
    body: [
      'You need an account, and you are responsible for keeping access to it. One person, one account. You must be at least 13.',
      'Do not impersonate anyone, and do not create an account to get around a block or a removal.',
    ],
  },
  {
    title: 'What you write',
    body: [
      'Your private writing — journal entries, check-ins, affirmations — stays yours. We claim no rights over it and we do not use it for anything except showing it back to you.',
      'What you publish (articles, comments, anonymous reflections) stays yours too, but by publishing it you allow us to display it in the app and on this website so that other members can read it.',
    ],
  },
  {
    title: 'The rules for anything public',
    body: [
      'No harassment, threats, hate speech or targeting of an individual. No sexual content. No spam, advertising or self-promotion. No sharing anybody else\'s private information, including your own contact details on the anonymous board.',
      'Do not encourage self-harm or describe methods. Posts that do are removed, and the account is suspended.',
      'Anonymous does not mean unaccountable: authorship is recorded where an operator can reach it, precisely so that a threat against another member can be acted on.',
    ],
  },
  {
    title: 'Reporting and moderation',
    body: [
      'Every article, comment and reflection can be reported, and reports reach a person. You can also block an account so their posts stop appearing for you.',
      'Reports are resolved and recorded rather than deleted, so a pattern of complaints about the same person stays visible after each individual report is closed.',
      'We remove content that breaks these rules and suspend accounts that keep doing it. Where a report suggests somebody is in danger, we prioritise it.',
    ],
  },
  {
    title: 'Payments and refunds',
    body: [
      'The journal, meditation, affirmations, the anonymous board, focus games, articles and community are free. Counselling sessions and some library titles are paid, and the price is shown before you commit.',
      'A session fee is stored on the session at the time you book, so a later price change never alters what you were charged. If a session cannot be delivered, write to us and we will sort it out.',
      'Library purchases are kept even if a title is later withdrawn from the catalogue.',
    ],
  },
  {
    title: 'Availability',
    body: [
      'This is a small service run by one person. It may be unavailable for maintenance, and features may change or be withdrawn. Nothing here is a guarantee of uptime.',
    ],
  },
  {
    title: 'Ending it',
    body: [
      'You can delete your account at any time from inside the app, and it takes your data with it.',
      'We may suspend or remove an account that breaks the rules above, particularly where somebody else\'s safety is involved.',
    ],
  },
  {
    title: 'Governing law',
    body: [
      'These terms are governed by the laws of India, and any dispute is subject to the courts there.',
    ],
  },
];
