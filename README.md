# InnenFlow promotional website

The public website for the InnenFlow Android app. Its job is to explain the
product, show app previews and link to the official Google Play download.

There is no web application, authentication, Firebase SDK, user dashboard,
journal editor or app API client. Old `/app/*`, `/login`, `/signup` and other
retired routes permanently redirect to `/download`.

```bash
npm install
npm run dev
npm run typecheck
npm run build
```

The website works without environment variables or a backend. Optional settings
are documented in `.env.example`. `NEXT_PUBLIC_ANDROID_RESET_RELEASED` must stay
false until Android 1.8.0 is live; screenshots of that build are then labelled as
an upcoming preview rather than features already available in the store.

App screenshots are captured from the Android app with illustrative entries.
The lifestyle image is AI-generated. All assets and the font are served locally.
Publication uses the existing GitHub → Vercel deployment pipeline.

For production HTTP smoke checks, run `npm start -- --port 3033`, then
`npm run verify:promo` in a separate terminal. Set `PROMO_BASE_URL` to run the
same checks against the deployed website.
