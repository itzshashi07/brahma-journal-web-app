/**
 * Everything about this site that is a fact rather than a decision.
 *
 * One home for the name, the URLs, the store links and the social handles,
 * because these appear in the header, the footer, the metadata, the sitemap,
 * the JSON-LD and about nine landing pages — and a stale Play Store link on one
 * of them is a dead end at the exact moment somebody decided to install.
 *
 * Mirrors `lib/core/constants/app_constants.dart` in the Flutter app. Where a
 * value exists in both, it is copied, not re-invented.
 */

export const site = {
  name: 'InnenFlow',
  tagline: 'A quieter place to think',

  /**
   * The canonical origin.
   *
   * Every absolute URL in the metadata is built from this — canonicals, Open
   * Graph, the sitemap, robots.txt — so a deploy to a preview domain must not
   * publish URLs pointing at production, which is how a preview build ends up
   * outranking the real site for its own brand name.
   *
   * ─────────────────────────────────────────────────────────────────────────
   * Why the last resort is not a hard-coded domain any more
   *
   * It was `https://innenflow.app`, and that domain does not resolve yet. The
   * site went live on Vercel with every canonical announcing that the real
   * version of each page lived at a hostname with no DNS behind it — which is
   * not a cosmetic problem: a canonical is an instruction, and pointing it at a
   * dead host asks Google to drop the page that is actually working.
   *
   * Nothing on the page looks wrong when this happens. It is only visible in
   * the head, and only to a crawler.
   *
   * So the chain is: whatever `NEXT_PUBLIC_SITE_URL` says, then the domain
   * Vercel knows it is serving this project from, then the custom domain as a
   * final guess. A deployment therefore describes itself correctly with no
   * configuration at all, and setting the variable stays the way to override it
   * once the custom domain is live.
   *
   * `NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL` is a system variable Vercel
   * injects for Next.js projects. It is the *production* alias rather than the
   * per-deployment URL, so a preview build still canonicalises to production
   * instead of nominating itself.
   */
  url: (() => {
    const explicit = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '');
    const vercel = process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL;
    const hosted = vercel ? `https://${vercel.replace(/\/$/, '')}` : null;

    /**
     * A localhost origin is a correct answer in `next dev` and never a correct
     * answer in a build that is being served to the public.
     *
     * This guard is here because it happened: `.env.local` was copied into the
     * Vercel project's environment variables, `NEXT_PUBLIC_SITE_URL` came along
     * with it, and the deployed site published `<link rel="canonical"
     * href="http://localhost:3001/…">` on every page — an instruction to a
     * crawler to index a URL that exists only on one laptop.
     *
     * Nothing about the site looked wrong. It renders identically. The only
     * place it appears is the head, and the only reader that cares is a
     * crawler, which is what makes it worth a guard in code rather than a note
     * in a README.
     */
    const isLocal = /^https?:\/\/(localhost|127\.0\.0\.1|0\.0\.0\.0)(:|$|\/)/i;
    const deployed = Boolean(hosted) || process.env.NODE_ENV === 'production';

    if (explicit && !(isLocal.test(explicit) && deployed)) return explicit;

    return hosted ?? 'https://innenflow.app';
  })(),

  description:
    'InnenFlow is a private journal, meditation timer and anonymous support ' +
    'community in one app. Track your mood, build a streak, sit with a guided ' +
    'practice, and say the thing you cannot say anywhere else — anonymously.',

  /** Under 60 characters, so Google does not truncate it in the results page. */
  shortDescription: 'Private journal, meditation & anonymous support',

  locale: 'en_IN',

  contactEmail: 'officialshashi2023@gmail.com',

  store: {
    android: {
      available: true,
      packageId: 'com.brahma.brahmaApp',
      url: 'https://play.google.com/store/apps/details?id=com.brahma.brahmaApp',
    },
    ios: {
      // Deliberately not a dead App Store link. A "coming soon" that is honest
      // costs nothing; a link to a 404 on Apple's site costs the install and
      // the trust.
      available: false,
      url: null,
    },
  },

  social: {
    instagram: 'https://www.instagram.com/____shashii_o7/',
    instagramHandle: '@____shashii_o7',
    whatsapp: 'https://chat.whatsapp.com/CSSPtnLv7q15UWuHgRD8ol',
  },

  /**
   * The API this site reads and writes.
   *
   * The same service the Android app talks to — see `ApiService.baseUrl` in
   * `lib/services/api_service.dart`. One backend, two front ends: a member who
   * writes an entry on their phone opens the website and it is there, because
   * there is nothing to sync.
   */
  apiBaseUrl:
    process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, '') ||
    'https://innenflow-backend.onrender.com',
} as const;

/** Absolute URL for a site-relative path. Used by metadata and the sitemap. */
export function absoluteUrl(path = '/'): string {
  return `${site.url}${path.startsWith('/') ? path : `/${path}`}`;
}
