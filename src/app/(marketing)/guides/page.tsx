import Link from 'next/link';
import type { Metadata } from 'next';
import { ArrowRight } from 'lucide-react';

import { Breadcrumbs, CallToAction, SectionHeading } from '@/components/sections';
import { guides } from '@/content/guides';
import { GITA_SITUATIONS } from '@/content/gita';
import { breadcrumbSchema, jsonLdScript, pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'Guides — journalling, meditation and getting through a bad week',
  description:
    'Practical guides that answer the whole question without an account: how to start journalling and keep it, a five-minute meditation for beginners, forty journal prompts, and free mental-health helplines in India.',
  path: '/guides',
});

/**
 * The guides index.
 *
 * Deliberately small. Four pages that are each a complete answer beat twenty
 * that each hold something back — and a hub listing twenty thin pages is how a
 * whole section gets classed as filler rather than one page at a time.
 */
export default function GuidesHubPage() {
  const trail = [
    { name: 'Home', path: '/' },
    { name: 'Guides', path: '/guides' },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLdScript(breadcrumbSchema(trail))}
      />

      <section className="container-page pb-8 pt-10 sm:pt-14">
        <Breadcrumbs trail={trail} />
        <div className="max-w-2xl">
          <h1 className="headline text-3xl font-semibold leading-[1.15] tracking-tight sm:text-4xl">
            Guides
          </h1>
          <p className="mt-5 text-[15px] leading-relaxed text-ink-secondary">
            Complete answers, free, with nothing held back for a signup. If a
            page here does its job you may not need the app at all — which is
            the point of writing them this way.
          </p>
        </div>
      </section>

      <section className="pb-12">
        <div className="container-page grid gap-4 sm:grid-cols-2">
          {guides.map((guide) => (
            <Link
              key={guide.slug}
              href={`/guides/${guide.slug}`}
              className="glass glass-hover flex flex-col p-6"
            >
              <h2 className="text-[17px] font-semibold leading-snug text-ink-primary">
                {guide.headline}
              </h2>
              <p className="mt-2.5 flex-1 text-[13.5px] leading-relaxed text-ink-secondary">
                {guide.standfirst}
              </p>
              <span className="mt-4 inline-flex items-center gap-1.5 text-[13px] font-medium text-primary-light">
                Read it
                <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="pb-14">
        <div className="container-page">
          <SectionHeading
            eyebrow="Also here"
            title="The Gita, arranged by situation"
            subtitle="Twelve pages of verses for what is actually happening, in Hindi and English."
          />
          <div className="mt-6 flex flex-wrap gap-2">
            {GITA_SITUATIONS.map((s) => (
              <Link
                key={s.key}
                href={`/wisdom/${s.slug}`}
                className="chip hover:border-primary/60 hover:text-ink-primary"
              >
                <span aria-hidden>{s.emoji}</span>
                {s.labelEn}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <CallToAction />
    </>
  );
}
