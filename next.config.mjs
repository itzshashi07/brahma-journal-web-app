import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  /**
   * Pin the workspace root to this directory.
   *
   * This repo sits inside a parent that has its own lockfile — the original
   * website prototype lives there. Without this, the bundler walks up, finds
   * that lockfile first and treats the parent as the root, which pulls the
   * wrong `node_modules` into resolution.
   */
  turbopack: {
    root: dirname(fileURLToPath(import.meta.url)),
  },

  /**
   * Security headers.
   *
   * The marketing pages are the app's public face and are indexed, linked and
   * embedded; the application pages behind sign-in carry journal entries and
   * counselling transcripts. Both want the same baseline, and setting it here
   * means no page has to remember to.
   *
   * `X-Frame-Options: DENY` is the load-bearing one — without it a page of this
   * site can be framed invisibly over an attacker's own buttons, and the person
   * clicking thinks they are dismissing a cookie banner while actually deleting
   * their account.
   *
   * ─────────────────────────────────────────────────────────────────────────
   * `microphone=(self)`, and why it was the bug
   *
   * This header said `microphone=()`, which is not "ask before using the
   * microphone" — it is "this document may never use the microphone, including
   * its own origin". Chrome enforces it before any permission prompt is drawn,
   * so `SpeechRecognition.start()` returned without error, fired `onend`
   * immediately, and produced no transcript and no dialog. Every dictate button
   * on the site was dead, and dead in the way that looks like a bug in the
   * button: it lit up, it pulsed, it stopped, nothing arrived.
   *
   * `(self)` restores it for this origin only. It is still denied to every
   * embed, which is the part actually worth having — a third-party frame on
   * this site has no business with a microphone. The browser still asks the
   * member for permission the first time, and the member can still refuse.
   *
   * `camera=()` stays closed. Nothing here takes photographs.
   */
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(self), geolocation=(), interest-cohort=()',
          },
        ],
      },
    ];
  },

  /**
   * The app's own deep links, kept working on the web.
   *
   * `go_router` in the Flutter app routes `/journal`, `/meditation` and friends
   * at the top level. Those paths appear in push notification payloads, in the
   * WhatsApp group, and in whatever anyone has bookmarked. On the web the same
   * screens live under `/app/*` so that the top level can belong to the
   * marketing site — so a bare `/journal` is redirected rather than 404ing.
   *
   * Permanent, because these are the canonical locations now and a 301 is what
   * tells a search engine to stop asking about the old one.
   */
  async redirects() {
    const appPaths = [
      'dashboard',
      'journal',
      'meditation',
      'affirmations',
      'thoughts',
      'community',
      'counselling',
      'library',
      'notifications',
      'profile',
      'analytics',
      'games',
    ];

    return [
      ...appPaths.map((path) => ({
        source: `/${path}`,
        destination: `/app/${path}`,
        permanent: true,
      })),
      // The app writes `/legal/privacy`; the website's canonical URL is the
      // shorter one, because that is the one people link to.
      { source: '/legal/privacy', destination: '/privacy', permanent: true },
      { source: '/legal/terms', destination: '/terms', permanent: true },
    ];
  },
};

export default nextConfig;
