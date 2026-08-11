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
      sanctuary/[id]/     articles, from the API (ISR)
      download, about, support, privacy, terms
    app/                  everything behind sign-in
      layout.tsx          noindex + AppShell
      dashboard, journal, meditation, affirmations, thoughts,
      community, blogs/[id], library, counselling, notifications,
      profile, analytics, games
    login, signup, forgot-password
    sitemap.ts  robots.ts  manifest.ts  og/route.tsx
  components/
    SiteHeader, SiteFooter, Logo, StoreButtons, PhoneMockup,
    sections.tsx          the landing-page building blocks
    LegalDoc, AuthForm, Icon
    app/
      AppShell            auth gate + navigation
      ui.tsx              useApi, AsyncSection, Card, EmptyState, …
      NotificationBell
  content/                the words. Data, not JSX — see §5
    features.ts  use-cases.ts  legal.ts
  lib/
    site.ts               name, URLs, store links — one source
    firebase.ts           identity only, lazily initialised
    api.ts                the client. A port of api_service.dart
    public-api.ts         server-side reader for published articles
    auth-context.tsx      who is signed in
    seo.ts                metadata + JSON-LD builders
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

- **Design tokens.** `app_theme.dart` ↔ `tailwind.config.ts`.
- **Legal copy.** `legal_screen.dart` ↔ `src/content/legal.ts`. A privacy policy
  that differs between an app and its website is not a policy, it is two drafts,
  and the difference is what a regulator asks about.
- **API shapes.** A changed response breaks two clients. The backend's
  pagination contract (`hasMore` + opaque `nextCursor`) is additive on purpose so
  an older build keeps working.

---

## 10. Known gaps

- **No web push.** The notification badge reads counts on mount and when the tab
  becomes visible. Real web push needs a service worker, VAPID keys and a
  permission prompt — a genuine feature, not a detail. There is deliberately no
  polling interval; that would be strictly worse than the Firestore listeners the
  whole architecture moved away from.
- **The app's legal copy still says Firestore in places.** This repo's version
  describes the current architecture. `legal_screen.dart` should be brought into
  line.
- **No analytics.** Nothing is measured, which also means nothing is collected.
  If this changes, the privacy policy changes in the same commit.
- **Meditation and focus are simplified** relative to the Flutter app — one timer
  and one reaction game, against the app's fuller sets. The API is the same; the
  screens are smaller.
- **Purchases are Android-only.** The website shows what you own and opens it;
  buying happens in the app, where the payment signature is verified server-side.
