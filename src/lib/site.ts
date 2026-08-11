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
   * Every absolute URL in the metadata is built from this, so a deploy to a
   * preview domain does not publish canonicals and Open Graph URLs pointing at
   * production — which is how a preview build ends up outranking the real site
   * for its own brand name.
   */
  url:
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') ||
    'https://innenflow.app',

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
