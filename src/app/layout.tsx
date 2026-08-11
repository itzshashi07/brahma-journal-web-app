import type { Metadata, Viewport } from 'next';
import { Outfit } from 'next/font/google';

import { AuthProvider } from '@/lib/auth-context';
import {
  jsonLdScript,
  organizationSchema,
  softwareApplicationSchema,
  websiteSchema,
} from '@/lib/seo';
import { site } from '@/lib/site';

import './globals.css';

/**
 * Outfit, self-hosted.
 *
 * `next/font/google` downloads the font at build time and serves it from this
 * origin, so there is no request to fonts.gstatic.com at runtime. That matters
 * more than it sounds: a third-party font is a DNS lookup plus a TLS handshake
 * plus a download, all of it blocking the first paint of the page whose speed
 * is being measured for ranking.
 *
 * `display: swap` means text is readable in the fallback while it loads, rather
 * than the page sitting blank for a beat. It is the same family the Flutter app
 * bundles in `assets/fonts`.
 */
const outfit = Outfit({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-outfit',
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),

  /**
   * The template puts the page's own words first and the brand last.
   *
   * A title is truncated from the right at roughly 60 characters, so leading
   * with "InnenFlow — " spends the most valuable part of the line on a word
   * nobody is searching for yet.
   */
  title: {
    default: `${site.name} — ${site.shortDescription}`,
    template: `%s · ${site.name}`,
  },
  description: site.description,
  applicationName: site.name,
  authors: [{ name: site.name, url: site.url }],
  creator: site.name,
  publisher: site.name,
  category: 'health',

  alternates: { canonical: '/' },

  openGraph: {
    type: 'website',
    siteName: site.name,
    locale: site.locale,
    url: site.url,
    title: `${site.name} — ${site.shortDescription}`,
    description: site.description,
  },
  twitter: {
    card: 'summary_large_image',
    title: `${site.name} — ${site.shortDescription}`,
    description: site.description,
  },

  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
  },

  /**
   * The Android install banner, on the web.
   *
   * Chrome reads this and offers to open or install the native app when
   * somebody on Android lands on the site. It is the single highest-converting
   * install prompt available, because it appears at the moment of interest
   * rather than behind a button.
   */
  appLinks: {
    android: {
      package: site.store.android.packageId,
      app_name: site.name,
      url: site.store.android.url,
    },
  },
  other: {
    'google-play-app': `app-id=${site.store.android.packageId}`,
  },

  manifest: '/manifest.webmanifest',
  icons: {
    icon: [{ url: '/icon.svg', type: 'image/svg+xml' }],
    apple: [{ url: '/icon.svg' }],
  },
};

export const viewport: Viewport = {
  themeColor: '#0D0D1A',
  colorScheme: 'dark',
  width: 'device-width',
  initialScale: 1,
  // Not capped. Locking zoom on a text-heavy site is an accessibility failure
  // for anybody who needs to enlarge it, and it buys nothing.
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en-IN" className={outfit.variable} suppressHydrationWarning>
      <head>
        {/*
          Site-wide structured data.

          Emitted once here rather than per page, because these three describe
          the site and the product rather than a route. Page-level schema —
          FAQPage, HowTo, BreadcrumbList — is emitted by the page that owns it.
        */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={jsonLdScript(organizationSchema())}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={jsonLdScript(websiteSchema())}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={jsonLdScript(softwareApplicationSchema())}
        />

        {/* The API is a different origin and is hit immediately after sign-in.
            Warming the connection here saves a DNS + TLS round trip later. */}
        <link rel="preconnect" href={site.apiBaseUrl} crossOrigin="" />
      </head>
      <body className="min-h-screen">
        {/*
          The auth provider wraps everything, including the marketing pages —
          the header needs to know whether to say "Sign in" or "Open app". It
          initialises Firebase lazily, so a visitor who never signs in never
          pays for the SDK.
        */}
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
