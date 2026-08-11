import type { MetadataRoute } from 'next';

import { site } from '@/lib/site';

/**
 * The web app manifest.
 *
 * Two jobs. On Android it makes Chrome offer to install the site to the home
 * screen; on iOS — where there is no native app yet — it is what makes "Add to
 * Home Screen" produce something that opens full-screen with its own icon
 * rather than a browser bookmark. Since iOS is the platform without an app,
 * this file is doing more work than it usually would.
 *
 * `start_url` points at `/app/dashboard` rather than `/`. Somebody who has
 * installed this to their home screen has already been convinced; sending them
 * to the marketing page every morning would be absurd. Anyone not signed in is
 * redirected to sign-in from there anyway.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${site.name} — ${site.shortDescription}`,
    short_name: site.name,
    description: site.description,
    start_url: '/app/dashboard',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#0D0D1A',
    theme_color: '#0D0D1A',
    categories: ['health', 'lifestyle', 'productivity'],
    lang: 'en-IN',
    dir: 'ltr',
    icons: [
      {
        src: '/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
        purpose: 'any',
      },
      {
        src: '/icon-maskable.svg',
        sizes: 'any',
        type: 'image/svg+xml',
        // Android crops a launcher icon to whatever shape the device uses.
        // A maskable variant carries the padding that keeps the mark from
        // having its edges cut off.
        purpose: 'maskable',
      },
    ],
    shortcuts: [
      {
        name: 'Write an entry',
        short_name: 'Journal',
        url: '/app/journal',
      },
      {
        name: 'Sit for five minutes',
        short_name: 'Meditate',
        url: '/app/meditation',
      },
      {
        name: 'Anonymous board',
        short_name: 'Reflections',
        url: '/app/thoughts',
      },
    ],
  };
}
