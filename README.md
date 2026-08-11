# InnenFlow Web

The website for [InnenFlow](https://play.google.com/store/apps/details?id=com.brahma.brahmaApp)
— a private journal, meditation timer and anonymous support community.

Two halves in one Next.js app:

- **The public site** — statically generated, indexed, and built to be found.
  Nine feature pages, seven use-case pages, a member-written article library,
  and the install page.
- **The application** — everything behind sign-in, at feature parity with the
  Android app, against the same API and the same account. Nothing to sync.

```bash
cp .env.example .env.local     # fill in the Firebase web config
npm install
npm run dev
```

The marketing pages render with no configuration at all; only sign-in needs the
Firebase values.

**Read [`IMPLEMENTATION.md`](./IMPLEMENTATION.md)** for the architecture, why
things are shaped the way they are, and what must be kept in step with the other
two repos.

---

| | |
|---|---|
| Framework | Next.js 16 (App Router) |
| Styling | Tailwind, with the Flutter app's exact design tokens |
| Identity | Firebase Auth — identity only, no Firestore |
| Data | The InnenFlow API → MongoDB |
| Android app | [Brahma-Journal-app](https://github.com/itzshashi07/Brahma-Journal-app) |
| Backend | [innenflow-backend](https://github.com/itzshashi07/innenflow-backend) |
