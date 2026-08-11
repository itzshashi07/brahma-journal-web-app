import type { MetadataRoute } from 'next';

import { absoluteUrl } from '@/lib/site';

/**
 * robots.txt.
 *
 * The disallow list is the important part. `/app/*` is the signed-in
 * application: every page there is private, personalised and useless to a
 * search result, and letting a crawler wander into it spends the crawl budget
 * of a small site on pages that render as a sign-in redirect.
 *
 * `/login` and `/signup` are excluded for a different reason — they are thin,
 * near-duplicate pages that would compete with the home page for brand queries
 * while offering a searcher nothing.
 *
 * Note that this is guidance to well-behaved crawlers and not a security
 * control. What actually protects `/app` is that every request to the API needs
 * a verified Firebase ID token; robots.txt only stops a polite crawler from
 * wasting its time.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/app/', '/login', '/signup', '/forgot-password', '/og'],
      },
    ],
    sitemap: absoluteUrl('/sitemap.xml'),
    host: absoluteUrl('/'),
  };
}
