import type { Metadata } from 'next';

import { absoluteUrl, site } from './site';

/**
 * Metadata, in one place.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * What actually moves the needle, and what does not
 *
 * A lot of "SEO" is cargo cult. The things below are the ones that genuinely
 * change how a page is discovered and how it looks when it is:
 *
 *   • **A distinct title and description per route.** Duplicates are the single
 *     most common reason a site with forty pages ranks for one. Every route
 *     here passes its own, and the title template appends the brand rather than
 *     leading with it — the words that describe the page have to come first,
 *     because a title is truncated from the right.
 *   • **A canonical URL.** `/features/journal` and `/features/journal?ref=ig`
 *     are one page. Without a canonical they are two, competing with each
 *     other for the same query.
 *   • **Open Graph and Twitter cards.** These do not affect ranking at all.
 *     They decide whether a link shared into WhatsApp — which is how this app
 *     actually spreads — looks like a product or like a bare URL.
 *   • **Structured data.** See the JSON-LD builders at the bottom. This is what
 *     produces the star rating, the FAQ accordion and the app install box in
 *     the results page.
 *
 * Keyword stuffing, a meta keywords tag, and hidden text are absent on purpose.
 * The first is ignored, the second has been ignored since 2009, and the third
 * is a manual-action risk on a site whose whole subject is honesty.
 */

type PageMetaInput = {
  title: string;
  description: string;
  /** Site-relative, e.g. `/features/journal`. */
  path: string;
  /** Keeps a thin or duplicate page out of the index while it stays reachable. */
  noIndex?: boolean;
  /** Set on article-style pages so the OG type is right when shared. */
  type?: 'website' | 'article';
  publishedTime?: string;
};

export function pageMetadata({
  title,
  description,
  path,
  noIndex = false,
  type = 'website',
  publishedTime,
}: PageMetaInput): Metadata {
  const url = absoluteUrl(path);

  return {
    title,
    description,
    alternates: { canonical: url },
    robots: noIndex
      ? { index: false, follow: true }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            // Let Google use a full-length snippet and a large image preview
            // rather than the conservative defaults.
            'max-snippet': -1,
            'max-image-preview': 'large',
            'max-video-preview': -1,
          },
        },
    openGraph: {
      type,
      url,
      title,
      description,
      siteName: site.name,
      locale: site.locale,
      ...(publishedTime ? { publishedTime } : {}),
      images: [
        {
          url: absoluteUrl(
            `/og?title=${encodeURIComponent(title)}&subtitle=${encodeURIComponent(
              description.slice(0, 120)
            )}`
          ),
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

// ─────────────────────────── structured data ───────────────────────────

/**
 * JSON-LD, rendered into a `<script type="application/ld+json">`.
 *
 * Serialised with a replacer that escapes `<`, so a description containing
 * markup cannot close the script tag early and inject into the page. Structured
 * data is assembled from content that will eventually be edited by somebody who
 * is not thinking about XSS, and this is the one line that makes that safe.
 */
export function jsonLdScript(data: unknown): { __html: string } {
  return {
    __html: JSON.stringify(data).replace(/</g, '\\u003c'),
  };
}

/**
 * The app itself, as an installable thing.
 *
 * This is what can produce the app panel in a results page — icon, rating,
 * price, platform. `offers.price: "0"` is load-bearing: an app with no price
 * stated is not eligible for it, and InnenFlow genuinely is free.
 */
export function softwareApplicationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'MobileApplication',
    name: site.name,
    description: site.description,
    url: site.url,
    applicationCategory: 'HealthApplication',
    applicationSubCategory: 'Mental Health',
    operatingSystem: 'Android 7.0 and up, Web',
    installUrl: site.store.android.url,
    downloadUrl: site.store.android.url,
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'INR',
      availability: 'https://schema.org/InStock',
    },
    author: { '@type': 'Organization', name: site.name, url: site.url },
    featureList: [
      'Private daily journal with mood tracking',
      'Guided meditation and a breathing timer',
      'Personal affirmations with repetition tracking',
      'Anonymous reflections board',
      'One-to-one counselling with a two-hour transcript purge',
      'Streaks, badges and a community leaderboard',
      'Focus games and a reading library',
    ],
  };
}

export function organizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: site.name,
    url: site.url,
    description: site.shortDescription,
    email: site.contactEmail,
    sameAs: [site.social.instagram],
  };
}

export function websiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: site.name,
    url: site.url,
    description: site.description,
    inLanguage: 'en-IN',
  };
}

/**
 * A question-and-answer block.
 *
 * The one piece of structured data on this site with a direct, visible payoff:
 * it turns a results entry into an expandable list of questions, which takes up
 * several times the vertical space of a plain result. Only mark up questions
 * that are genuinely answered on the page — marking up questions that are not
 * visible is what the guidelines call out specifically.
 */
export function faqSchema(faqs: ReadonlyArray<{ q: string; a: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.q,
      acceptedAnswer: { '@type': 'Answer', text: faq.a },
    })),
  };
}

/**
 * The trail shown above a result instead of a bare URL.
 *
 * Cheap to emit and it makes a deep landing page look like part of a site
 * rather than an orphan, which is most of what it is for.
 */
export function breadcrumbSchema(
  trail: ReadonlyArray<{ name: string; path: string }>
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: trail.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.name,
      item: absoluteUrl(crumb.path),
    })),
  };
}

/** A how-to block for the step-by-step sections on the use-case pages. */
export function howToSchema(
  name: string,
  description: string,
  steps: ReadonlyArray<{ title: string; body: string }>
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name,
    description,
    step: steps.map((step, index) => ({
      '@type': 'HowToStep',
      position: index + 1,
      name: step.title,
      text: step.body,
    })),
  };
}
