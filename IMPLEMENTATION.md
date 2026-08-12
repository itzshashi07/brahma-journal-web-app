# InnenFlow Web — implementation

> Written for whoever opens this repo cold, including future you. It explains
> what is here, why it is shaped this way, and where to change things. It is not
> a changelog.

---

## 1. What this repo is

The InnenFlow website. Two halves that share a design and almost nothing else:

| | Public half | Application half |
|---|---|---|
| **Routes** | `/`, `/features/*`, `/use-cases/*`, `/download`, `/sanctuary/*`, `/about`, `/support`, `/privacy`, `/terms` | `/app/*` |
| **Rendered** | Statically, at build time | In the browser, after sign-in |
| **Indexed** | Yes — this is the whole point | No, `noindex` + robots.txt |
| **Needs the API** | Only for articles, and fails soft | Always |
| **JavaScript** | Almost none | The app |

The application half is **feature-parity with the Android app**, against the
same backend and the same account. Somebody writes an entry on their phone,
opens the laptop, and it is there — there is no sync step because there is
nothing to sync.

**It is one of three repos.** See [§9](#9-the-other-two-repos).

---

## 2. Architecture in one picture

```
                    ┌──────────────────┐
                    │  Firebase Auth   │   identity only — who you are
                    └────────┬─────────┘
                             │ ID token
        ┌────────────────────┼────────────────────┐
        ▼                    ▼                    ▼
┌───────────────┐   ┌────────────────┐   ┌────────────────┐
│  Flutter app  │   │  This website  │   │   (future iOS) │
└───────┬───────┘   └───────┬────────┘   └────────────────┘
        │                   │
        └─────────┬─────────┘
                  ▼
        ┌──────────────────┐
        │  InnenFlow API   │   Node + Express
        └────────┬─────────┘
                 ▼
           ┌──────────┐
           │ MongoDB  │   every piece of application data
           └──────────┘
```

**There is no `getFirestore` in this repo and there must never be one.**
Application data left Firestore specifically so that authorization is decided by
a server rather than by rules a client evaluates. Reaching into Firestore from
the website would recreate the architecture the app just left, in a second
place, and the two would disagree about what a member may read. See
`src/lib/firebase.ts`.

---

## 3. Layout

```
src/
  app/
    layout.tsx            root: fonts, site-wide JSON-LD, AuthProvider
    (marketing)/          route group — the "(…)" never appears in a URL
      layout.tsx          header + footer, static
      page.tsx            home
      features/[slug]/    9 pages, from src/content/features.ts
      use-cases/[slug]/   7 pages, from src/content/use-cases.ts
      wisdom/[situation]/ 12 pages, from src/content/gita.ts — see §5
      guides/[slug]/      4 long-form guides, from src/content/guides.ts
      compare/[slug]/     3 "X alternative" pages, from src/content/comparisons.ts
      sanctuary/[id]/     articles, from the API (ISR)
      download, about, support, privacy, terms
    app/                  everything behind sign-in
      layout.tsx          noindex + AppShell
      dashboard, journal, deep-work, meditation, affirmations, wisdom,
      thoughts, community, blogs/[id], library, counselling, notifications,
      profile, analytics, games
      admin/              the operator console — counselling queue,
                          article review, announcements. Drawn from the
                          `admin` claim; every route behind it re-checks it
    login, signup, forgot-password
    sitemap.ts  robots.ts  manifest.ts  og/route.tsx
  components/
    SiteHeader, SiteFooter, Logo, StoreButtons, PhoneMockup,
    GetTheApp.tsx         the "better on your phone" banner and the auth-screen
                          note — one Play Store link, from lib/site.ts
    sections.tsx          the landing-page building blocks
    ThemeToggle.tsx       the switch, and the pre-paint script — see §4
    VerseCard.tsx         one Gita verse, shared by the public and app halves
    LegalDoc, AuthForm, Icon
    app/
      AppShell            auth gate + navigation + the phone drawer
      ui.tsx              useApi, AsyncSection, Card, Modal, ChipGroup, …
      NotificationBell
      Avatar.tsx          the built avatar, in SVG — the app's `m:` encoding
      AvatarPicker.tsx    presets first, seven option rows second
      Dictation.tsx       Web Speech, for the journal
      DailyPrompts.tsx    the three things that interrupt, sequenced — §4
      WelcomeCelebration  once per sign-in, new vs returning
      DailyCheckIn.tsx    the once-a-day conversation
      JournalNudge.tsx    one random question about a gap in today
      ReportDialog.tsx    the reason sheet behind every flag
  content/                the words. Data, not JSX — see §5
    features.ts  use-cases.ts  legal.ts
    gita.ts               generated from the app's gita_verses.dart
    guides.ts  comparisons.ts
    games.ts              the catalogue, mirroring game_catalog.dart
    journal.ts            chip options, moods, prompts — journal_options.dart
    professions.ts        the fourteen crafts — professions.dart
    checkin.ts            the check-in questions — checkin_questions.dart
  lib/
    site.ts               name, URLs, store links — one source
    firebase.ts           identity only, lazily initialised
    api.ts                the client. A port of api_service.dart
    public-api.ts         server-side reader for published articles
    auth-context.tsx      who is signed in
    entries.ts            the journal entry type, local-day maths, greetings
    craft-stats.ts        consistency, streaks and mood lift — craft_stats.dart
    seo.ts                metadata + JSON-LD builders
    validate.ts           email, phone, age and the gender list — one
                          definition, used by every form
    chime.ts              the meditation bells, synthesised
    notify-bus.ts         "the unread count changed" as a window event
```

---

## 4. The decisions worth knowing

### Why the marketing half is static and the app half is not

The API authorises by a Firebase ID token held in the browser. A server
component cannot read it, so server-rendering `/app/*` would mean shipping the
token to this server on every navigation, or holding a session cookie the app
does not have — both of which put a copy of a credential somewhere it did not
need to be. And there is nothing to gain: those pages are private, personalised
and unindexed.

The marketing half is the exact opposite. No session, no personalisation, no
database — so it is built to files and served from the edge in one round trip.
That is most of what "SEO performance" actually means once the content exists.
It also means **the marketing site stays up while the API is cold-starting**,
which matters on a free tier.

### Why the design tokens are copied, not imported

`tailwind.config.ts` holds the exact colours from the Flutter app's
`lib/core/theme/app_theme.dart`. There is no shared package — Dart and
TypeScript do not have one — so this is a convention. It is written down in the
config file for that reason. **A near-miss on the purple is more noticeable than
a completely different design**, because the eye reads it as the same thing
rendered wrong.

### Why phone screenshots are HTML

`src/components/PhoneMockup.tsx` draws the app's screens in markup rather than
showing PNGs. Nine screenshots at a readable resolution is a couple of megabytes
on a page being loaded over mobile data by somebody who has not decided to care
yet; these are a few kilobytes that compress to almost nothing. They are also
vector-crisp, their text is indexable, and — the real one — **a screenshot is a
photograph of a build that goes stale silently.**

### Why there are both feature pages and use-case pages

Nobody searches for "journalling app with mood tracking" until they already know
that is what they want. They search for "cannot sleep because my brain won't
stop". Feature pages answer *what is this*; use-case pages answer *I have this
problem*, in the reader's words, and then point at the features that address it.
Different queries, different words, different pages.

### Why the article section is worth more than all of it

A landing page ranks for the handful of phrases it was written for. A growing
library of member-written articles ranks for hundreds nobody planned — and those
queries carry far more intent. It is also the only part of the marketing site
that grows without anyone writing marketing copy.

That is why `/api/public/blogs` exists in the backend. See
[§7](#7-the-public-api-surface).

### Two themes, and why there is not a `dark:` prefix anywhere

The site used to be dark always, and this file used to argue for that: the app
has no light mode, and a second palette is a second thing to keep in step across
two repositories. That reasoning holds for the application half. It does not
hold for the public pages, which people open in daylight, at work, beside twenty
white tabs.

The obvious implementation — `darkMode: 'class'` and a `dark:` variant on every
colour utility — would have meant editing roughly four hundred class names
across forty files, and leaving behind a codebase where the next surface colour
means finding all four hundred again.

So every colour token in `tailwind.config.ts` points at a CSS custom property
and `globals.css` swaps the values. `bg-bg-card` is written once and is correct
in both themes; no component knows a theme exists.

Two details that are load-bearing:

- **The channels are stored bare** — `--c-bg-card: 26 26 46`, not
  `rgb(26 26 46)` — because that is what lets Tailwind compose
  `rgb(var(--c-bg-card) / 0.6)` for `bg-bg-card/60`. About a hundred class names
  here are translucent, and a variable holding a finished colour breaks every
  one of them *silently*: the colour is right and the opacity is ignored.
- **`ThemeScript` is a blocking inline script in `<head>`.** React runs after
  the first paint, so applying the theme in an effect gives anybody on light a
  full frame of near-black — on every navigation. It stamps an explicit
  `dark`/`light` rather than leaving the attribute off for "system", so the CSS
  needs one override block instead of the light palette written twice.

The light palette is not the dark one inverted. The accents step *darker*
against white — `--c-primary-light` becomes deeper than `--c-primary`, which
reads backwards and is right, since the name means "the accent that stands out"
— and the shadows go shallow and violet rather than deep and black.

### The bottom tab bar

`AppShell` renders a four-tab bar on phones. Four, not thirteen: a tab bar is
for what somebody does daily, everything else stays in the menu, and five tabs
on a narrow phone gives each a target smaller than a fingertip. It carries
`pb-safe` for the home indicator, and `main` gets `pb-24` so the last card
clears it.

Alongside it, `globals.css` sets the handful of properties that separate "a
website on a phone" from "an app": `touch-action: manipulation` on interactive
elements (removing the ~300ms click delay), no tap highlight, no text-size
adjust on rotation, and `overscroll-behavior-y: contain` so pulling down at the
top of a feed does not reload the page and lose what was being typed.

### The menu is a drawer, and the page behind it is frozen

The phone menu used to be an ordinary block inside the sticky header, so the
document stayed scrollable underneath it. Opening the menu and then flicking a
thumb — which is what a thumb does — scrolled the page behind the menu, carried
the header off the top of the screen with the menu attached to it, and left
somebody looking at the middle of the page they had just tried to leave.

It is now a fixed overlay with a backdrop and its own scroll, and `AppShell`
freezes the body while it is open: `position: fixed` plus a captured scroll
offset, rather than `overflow: hidden` alone, because iOS Safari ignores the
latter on the scrolling element. The offset is restored on close, or the page
jumps to the top and the member loses their place. The panel carries
`overscroll-contain` so reaching the end of the list does not hand the scroll
back to the page, and Escape closes it.

### Avatars are drawn, not uploaded

`components/app/Avatar.tsx` is a port of the app's `modern_avatars.dart` and
`modern_avatar_art.dart`: seven small integers in `profile.avatarId`, encoded as
`m:bg,skin,hair,hairColor,face,accessory,clothes`, rendered as inline SVG. The
encoding is the app's on purpose — an avatar built in a browser appears on the
handset and on the leaderboard, because it is one string on one profile record.

Nothing is uploaded, so there is no storage bucket, no moderation queue and no
image that can fail to load. Anything that is not an `m:` id — an empty field, or
one of the older spiritual ids — falls back to initials on the brand gradient.
The option indices are the wire format: they may be appended to and never
reordered.

### One definition of what an email and a phone number are

`lib/validate.ts`. There were three forms asking for a phone number and three
ideas of what one is; the counselling intake counted digits, the profile
accepted anything, and sign-up trusted `<input type="email">`, which accepts
`someone@gmail` because an address without a dot is legal HTML. The rules live in
one file with the message written for the reader, and the intake, the profile
and the auth form all use them — so a number accepted on one screen cannot be
rejected on the next.

### The meditation bells are synthesised

`lib/chime.ts` — an oscillator, a fifth above it, and an exponential decay. A
singing-bowl sample is a few hundred KB that has to be hosted, cached and
licensed, and it fails silently on a slow connection at the exact moment it is
needed: somebody sitting with their eyes closed waiting to be told the sitting is
over. One bell on starting, a shorter one on ending early, and three rising notes
on completion. The context is created inside the tap that starts the sitting,
because a browser will not let a page make noise before it has been interacted
with — and the completion bell has no gesture of its own to attach to.

### The journal's mic is dictation, not a recording

`components/app/Dictation.tsx`. Storing audio of somebody describing the worst
part of their day is a different privacy promise from the one this product
makes; what gets stored here is the sentence, and the audio never leaves the
moment. Built on the Web Speech API, so it is absent on Firefox rather than
present and broken, and it offers English and Hindi because a recogniser set to
`en-IN` transcribes Hindi as nonsense rather than failing. Interim results are
shown greyed under the field and never appended — they are revised as you speak.

**It was dead for a long time, and the cause was not in this file.**
`next.config.mjs` sent `Permissions-Policy: microphone=()`, which does not mean
"ask before using the microphone" — it means "this document may never use the
microphone, including from its own origin". Chrome enforces that *before* it
draws a permission prompt, so `start()` returned cleanly, `onend` fired a moment
later, and no transcript and no dialog ever appeared. Every mic button on the
site lit up, pulsed, and stopped. It is `microphone=(self)` now: still denied to
every embed, which is the part worth having.

Two more things make it usable in practice. Chrome ends a session after a
stretch of silence whatever `continuous` says, so `onend` reopens a *fresh*
recogniser while the member has not pressed Stop — a recogniser that has ended
cannot be reliably restarted, and reusing one is how the second half of a
dictation goes missing. That restart is bounded (`MAX_EMPTY_RESTARTS`) so a muted
device says so rather than pulsing forever. And `no-speech` no longer stops
anything: pausing mid-thought is how people dictate a journal entry.

### The three things that interrupt, and the order they do it in

`components/app/DailyPrompts.tsx`, a port of `_loadData` in
`dashboard_screen.dart`. Three things can want the screen when somebody arrives,
and letting them race produces the worst version of all three — so:

1. **the welcome** (`WelcomeCelebration`), which belongs to the sign-in that just
   happened and reads as an afterthought if anything gets there first. Gated on
   `consumeJustSignedIn()` in `auth-context`, which is an *event* rather than a
   date: reloading does not re-greet, and a member of six months is not told
   "welcome to the family". The flag lives in `sessionStorage` because sign-in
   happens on `/login` and the greeting is shown on `/app/dashboard` — a full
   navigation in between, which throws away anything held in React;
2. **the check-in** (`DailyCheckIn`), once a day, and only when today has not
   been written. It merges into **today's** entry rather than creating a second
   one, so it feeds the same streak and insights as the full journal;
3. **the nudge** (`JournalNudge`), only when the check-in did not run. One small
   question about something today's entry is still missing.

The nudge's limits are the feature: at most three a day, forty minutes apart,
never within twenty minutes of the check-in, and past all that only a 55% chance
— except the day's *first*, which is certain, because a purely random prompt
means somebody who opens the site once a day has a 45% chance of never being
asked anything. A member whose entry is already complete is never interrupted at
all, since only gaps are asked about.

All of it is confined to `/app/dashboard`. The shell wraps every signed-in
screen, and mounting this unconditionally would put a bottom sheet over a
counselling chat.

### The journal writes one entry per day, not one per save

`POST` creates; the composer `PATCH`es when today already has an entry. It used
to post every time, so a member who wrote in the morning and added a line at
night had two entries for one day — which double-counts `totalJournalEntries`
and splits the day across two cells of every chart drawn from this data. The
check-in and the nudge follow the same rule, and it is why `lib/entries.ts`
exports `localDayKey`: "today" has to be resolved in the member's timezone, or
anything written after midnight in India is filed as yesterday.

### The flag opens a form, and the reason on it is load-bearing

`components/app/ReportDialog.tsx`. Both flags on this site used to post
immediately with a hard-coded reason — `'Reported from the board'` on a
reflection, `'Reported from the reader'` on an article — and say so in a
`window.alert`. Three things were wrong, and the third is the one that mattered.

The report was unactionable: "reported from the board" restates where the button
was. It fired on one click, so a mis-tap on a phone became a report. And
`routes/support.js` raises an **urgent** alert — pushed to the operator with
"Someone may be in danger" on the lock screen — when and only when the reason
mentions self-harm. With a hard-coded string that path could never fire from the
web, so a member who spotted somebody in trouble here had no way to say so while
the same member on Android had it two taps away. Self-harm is the first option
in the dialog for that reason.

The article flag also sent `contentKind: 'article'` — a fifth kind neither the
app nor the moderation inbox has ever known about, so the report arrived as a row
the queue could not open. The kinds are `thought | reply | blog | comment`, and
replies and comments can now be reported too, which the web previously could not
do at all.

Hiding a reflection is local, in `localStorage`, and that is deliberate: a
server-side record of which anonymous posts you cared enough about to suppress is
exactly the trail this board exists to avoid leaving. Blocking is server-side,
because it applies to named authors and has to survive a new device.

### The craft track, and why `profession` is an id

`content/professions.ts`, ported from `professions.dart`. The journal already
proves you turned up; it does not prove you turned up *for the thing you care
about*. A singer who journals daily for a month and never sings has a perfect
streak and nothing to show for it.

`profession` was a free-text box on this site — "Student, engineer, between
things…" — and an **id** everywhere else. The app matches on the id to pick a
checklist, so somebody who typed "singer" here got no checklist, no craft chips
in the journal, and an empty consistency chart. The profile screen now writes an
id, a weekly target and the member's own extra checklist items, all of which
`PATCH /profile/me` has accepted since the beginning.

The ids in that file and in `content/journal.ts` are the wire format shared with
Android. Change a label freely; change an id and a year of history stops being
readable.

### Deep work, and why the arithmetic is in `lib/milestones.ts`

`/app/deep-work` is the app's deep-work screen, against the same
`/api/practice/milestones` records. Everything else the web app carries is
something you *do* in a sitting; this is the one screen you open to *check* —
what am I building, what is left, am I going to get there — which is a question
people ask at a desk far more often than on a phone.

The numbers live in the library and not in the page, for the same reason
`craft-stats.ts` exists: a verdict reading "on course" here and "behind" on the
phone would make both unbelievable. Progress, days left, the fortnight of dots,
the current run and the verdict sentence are ports of the Dart, word for word
where they are words. Nothing is computed server-side, because the pace depends
on the member's own calendar and the API runs in UTC.

Two things differ from the app on purpose. A milestone opens in a **dialog over
the list** rather than as a pushed screen: on a laptop the other track you are
also behind on is context you need while deciding what to do about this one.
And **the craft is chosen per milestone** — the chooser is in the compose dialog
with the profile's craft preselected — because people are not one thing: an
engineer who also sings has an engineering milestone and a singing one, and the
list groups by craft as soon as more than one is in play.

Ticking "did deep work today" writes `craftDone` on today's journal entry, which
is the same record the app writes and the same one the fortnight is drawn from.
Two definitions of a working day is how two screens end up disagreeing about the
same week.

### A notification that does not open anything is a notification about nothing

The broadcast cards on `/app/notifications` were plain text, and the `route` the
API writes on every notification was ignored. That route is in the *app's*
vocabulary — `/blogs/<id>`, `/gita`, `/products` — while this site mounts the
same screens under `/app/…` and renames two of them. `lib/notification-routes.ts`
is the translation; anything with no page here returns null and the card stays
plain rather than linking into a 404.

Operator alerts take the other branch: every kind of them is answered from the
one console, so they all point at `/app/admin`. The link used to be drawn for
`type === 'counselling'` alone, which was one of the five kinds that end up in
that queue.

### The "get the app" nudge, and the one place its link lives

`components/GetTheApp.tsx`: a dismissible banner under the dashboard greeting,
and a quieter note under the sign-in and sign-up forms. It names the three
things a browser genuinely cannot do — reach you while it is closed, work with
no signal, sit one tap from the home screen — rather than asserting that the app
is nicer.

The dismissal is a `localStorage` timestamp with a thirty-day snooze, not a
cookie and not a profile field: it is a fact about *this browser*, and somebody
who dismisses it on a laptop has said nothing about their phone. The banner
renders nothing until that value has been read, so it never flashes for somebody
who already said no.

The link is `site.store.android.url`, built from the package id in `lib/site.ts`.
Until the listing is published that URL resolves to Play's "item not found" page
— it is deliberately the same constant the download page and the JSON-LD already
use, so publishing means changing one value in one file.

---

## 5. Content is data

`src/content/features.ts` and `use-cases.ts` hold the copy as typed objects; the
`[slug]` templates render them. Adding a landing page is adding an entry —
title, description, problem, mechanism, FAQs, related slugs — and it appears in
the nav, the footer, the sitemap and the grids automatically.

Written this way because nine hand-written pages **drift**: one gets an FAQ, one
forgets the install button, one has a title of the wrong length. Holding the
content as data and the layout in one template makes every page structurally
complete by construction.

**The line the copy does not cross:** these pages describe a difficulty and what
the app offers for it. They do not diagnose, do not claim treatment, and carry a
crisis note where the subject warrants it. That is partly Play Store policy for
a health-adjacent app and mostly because the alternative is telling somebody in
trouble that a journalling app is medicine.


### The Gita section is generated, not written

`src/content/gita.ts` is `lib/core/constants/gita_verses.dart` from the app
repo, converted by script rather than retyped. A dropped matra in the Sanskrit
or the Hindi is invisible in review and is not a mistake a spiritual product
gets to make. If a verse changes there, regenerate rather than edit here.

The same data renders in three places: `/app/wisdom` (filterable, private),
`/wisdom` (the hub) and `/wisdom/[situation]` (twelve indexed pages). Arranged
by situation rather than by chapter, because nobody at 2am searches for
"Chapter 2, Verse 47" — they search for what is happening to them.

### The thought of the day rotates here too, and an override lasts one day

`src/content/thoughts.ts` is the `_thoughts` list from the app's
`thoughts_365.dart`, converted the same way and for the same reason as the Gita:
both surfaces have to land on the *same* line for a given date, or a member who
reads the dashboard at work and the app at night is given two different thoughts.

The dashboard card used to render only `metadata/thought_of_the_day` — an
operator's override with no expiry — so it was blank on every day nobody had set
one, and showed a line from months ago on all the rest. The override now carries
a `date` stamp written by the app's picker, and either client honours it only
while that stamp is the reader's own local today. Everything else is
`thoughtForDay(new Date())`, so the card is never empty and rolls over by
itself at midnight.

### Guides and comparisons have rules

`guides.ts` holds pages that answer the whole question with nothing held back
for a signup — a page that withholds the answer earns a back button. One of
them, the India helpline list, carries no call to action at all and a
`verifiedOn` date, because a wrong number in an emergency is worse than no page.

`comparisons.ts` states what the rival does better, in the first column, at the
same size. It quotes no prices: subscription pricing changes by region and
quarter, and a page naming a competitor's price is wrong within months while it
carries on ranking.

---

## 6. SEO, concretely

Everything here is in `src/lib/seo.ts` unless noted.

| Thing | Where | Why it matters |
|---|---|---|
| Distinct title + description per route | `pageMetadata()` | Duplicates are the commonest reason a 40-page site ranks for one |
| Title template puts page words first | `app/layout.tsx` | Titles truncate from the right; leading with the brand wastes the valuable part |
| Canonical URL on every page | `pageMetadata()` | `?ref=ig` is not a second page |
| `Organization`, `WebSite`, `MobileApplication` | `app/layout.tsx` | The app panel in results, with price and platform |
| `FAQPage` | every page with an FAQ | Turns a result into an expandable list — several times the vertical space |
| `HowTo` | use-case pages | The steps |
| `BreadcrumbList` + visible breadcrumbs | landing pages | A deep page reads as part of a site, not an orphan |
| `Article` | `/sanctuary/[id]` | Author, date, section |
| Sitemap incl. articles | `app/sitemap.ts` | `lastModified` is the field that actually matters |
| robots.txt disallowing `/app` | `app/robots.ts` | Crawl budget on a small site is finite |
| Dynamic OG image per page | `app/og/route.tsx` | WhatsApp is how this app spreads; a link with no card is a bare URL |
| Self-hosted font | `app/layout.tsx` | A third-party font is a blocking DNS + TLS + download on first paint |
| `manifest.webmanifest` | `app/manifest.ts` | Install prompt on Android; **on iOS it is the only "app"** |
| `google-play-app` meta + appLinks | `app/layout.tsx` | Chrome's native install banner on Android |

The FAQ uses `<details>`/`<summary>` rather than a React accordion **on purpose**:
the answers are in the DOM whether open or closed, so they match the FAQPage
schema. Marking up an answer a crawler cannot see is the specific thing the
rich-results guidelines prohibit.

What is deliberately absent: a meta keywords tag (ignored since 2009), keyword
stuffing, and hidden text.

---

## 7. The public API surface

`/api/public/*` in the backend is the only unauthenticated router. This site
reads it at build time, when there is no signed-in user.

Three constraints make it safe, and they are structural rather than remembered:

1. `status: 'published'` is **hard-coded** into every filter — there is no query
   parameter that reaches the moderation queue.
2. The projection is an **allowlist**. A field added to the schema later is
   absent here until somebody decides otherwise. `authorEmail` is not in it.
3. Nothing user-scoped is mounted under `/api/public`.

`src/lib/public-api.ts` is a separate client from `src/lib/api.ts` for a reason:
one attaches a Firebase token and one must never. A single client that sometimes
attaches a token will eventually attach somebody's token to a statically cached
page.

Every function in it **fails soft**. If the API is asleep at build time, articles
render as an empty section rather than failing the deploy. A missing article
section is a bad day; a failed deploy is worse.

---

## 8. Running it

```bash
cp .env.example .env.local     # then fill in the Firebase web config
npm install
npm run dev                    # http://localhost:3000
npm run build                  # what CI and Vercel run
npm run typecheck
```

`.env.local` needs the six `NEXT_PUBLIC_FIREBASE_*` values from Firebase Console
→ Project settings → Your apps → Web app.

**The marketing site renders perfectly with no Firebase config at all** — only
the sign-in screen says anything is missing. A missing key should not be a white
page.

`NEXT_PUBLIC_SITE_URL` must be set per environment. Every absolute URL in the
metadata is built from it, so a preview deploy carrying the production value
publishes canonicals pointing at production — which is how a preview build ends
up outranking the real site for its own brand name.

**Nothing that is actually a secret goes in `.env`.** `NEXT_PUBLIC_` variables are
compiled into the client bundle. The Firebase web config is not a secret — it
identifies the project and authorises nothing. A service account key would
bypass every authorization check in the backend and must never appear here.

### Deploying

Built for Vercel and needs nothing special. Any host that runs Next 16 works;
`/og` and `/app/blogs/[id]` are the only routes that are not static files.

---

## 9. The other two repos

| Part | Repo |
|---|---|
| Flutter Android app | `github.com/itzshashi07/Brahma-Journal-app` |
| Node + MongoDB API | `github.com/itzshashi07/innenflow-backend` |
| This website | `github.com/itzshashi07/brahma-journal-web-app` |

Each has its own `IMPLEMENTATION.md`. **A change that spans two of them is two
commits to two remotes** — there is no monorepo tooling doing it for you.

Things that must move together:

- **Design tokens.** `app_theme.dart` ↔ the dark palette in `globals.css`. The
  values moved out of `tailwind.config.ts` when the light theme arrived — that
  file now holds the *names*, and `:root` holds the numbers.
- **The mark.** `assets/app_icon.png` ↔ `src/components/Logo.tsx`, `public/icon.svg`
  and `public/icon-maskable.svg`. The site drew a lotus for months while the app
  shipped three inward arcs; a near-miss on a brand mark is worse than an
  unrelated one, because the eye reads it as the same thing rendered wrong.
- **The Gita verses.** `gita_verses.dart` → `src/content/gita.ts`, by script.
  Regenerate; do not hand-edit.
- **CORS.** This origin has to be in the API's allow list. It is now the
  *default* rather than something to configure, because an unset variable used
  to silently switch this whole half of the product off — every request answered
  and then discarded by the browser, with the server logs showing 200s.
- **Legal copy.** `legal_screen.dart` ↔ `src/content/legal.ts`. A privacy policy
  that differs between an app and its website is not a policy, it is two drafts,
  and the difference is what a regulator asks about.
- **API shapes.** A changed response breaks two clients. The backend's
  pagination contract (`hasMore` + opaque `nextCursor`) is additive on purpose so
  an older build keeps working.

---

## 10. Known gaps

- **No web push.** Real web push needs a service worker, VAPID keys and a
  permission prompt — a genuine feature, not a detail. In its place the badge
  reads `/notifications/unread` on mount, when the tab becomes visible, on a
  45-second interval *while the tab is visible*, and immediately whenever
  `lib/notify-bus.ts` reports that a feed was cleared or read. A backgrounded tab
  has no timer at all.
- **The app's legal copy still says Firestore in places.** This repo's version
  describes the current architecture. `legal_screen.dart` should be brought into
  line.
- **No analytics.** Nothing is measured, which also means nothing is collected.
  If this changes, the privacy policy changes in the same commit.
- **Six of the fifteen Focus games are playable in the browser.** The rest are
  listed with the member's best, because a score set on the phone is their score.
  Rounds played here now write a `FocusSession` as well as banking seconds into
  the `_total` row — previously only the latter, so Insights could show a Game
  Zone total with no per-game breakdown under it for anybody who plays on the
  web.
- **Still missing against the app:** the in-app support ticket form, and the
  craft setup's per-habit emoji (custom items are stored as `{id, label}`, which
  is all the API's `customHabits` schema carries, and render with a default
  tick). The daily check-in is no longer in this list. Account deletion is on
  `/app/profile`; the standalone `docs/delete-account.html` in the workspace repo
  is still the URL Google Play points at and should become a route here.
- **The operator console covers three jobs, not every job.** Counselling
  approvals, article review and announcements. The library catalogue
  (`PUT /library/…`), support tickets and the leaderboard rebuild are all
  admin-only routes with no web screen yet — they are still Android or curl.
- **Purchases are Android-only.** The website shows what you own and opens it;
  buying happens in the app, where the payment signature is verified server-side.
