import Link from 'next/link';
import type { Metadata } from 'next';
import { ArrowRight } from 'lucide-react';

import { Breadcrumbs, CallToAction, SectionHeading } from '@/components/sections';
import { comparisons } from '@/content/comparisons';
import { breadcrumbSchema, jsonLdScript, pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'InnenFlow compared with Calm, Headspace and Daylio',
  description:
    'Honest comparisons, including what each of them does better. InnenFlow is a free journal, meditation timer and anonymous board — no subscription, no trial, and no pretending it wins on everything.',
  path: '/compare',
});

export default function CompareHubPage() {
  const trail = [
    { name: 'Home', path: '/' },
    { name: 'Compare', path: '/compare' },
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
            How this compares
          </h1>
          <p className="mt-5 text-[15px] leading-relaxed text-ink-secondary">
            Every page here says what the other product does better, because it
            genuinely does. If you leave for one of them having read the
            comparison properly, the page worked.
          </p>
          <p className="mt-3 text-[13px] text-ink-muted">
            No prices are quoted anywhere — subscription pricing changes by
            region and by quarter, and a page that names a competitor’s price is
            wrong within months while it carries on ranking.
          </p>
        </div>
      </section>

      <section className="pb-12">
        <div className="container-page grid gap-4 sm:grid-cols-3">
          {comparisons.map((c) => (
            <Link
              key={c.slug}
              href={`/compare/${c.slug}`}
              className="glass glass-hover flex flex-col p-6"
            >
              <span className="chip mb-4 self-start">vs {c.rival}</span>
              <h2 className="text-[16px] font-semibold leading-snug text-ink-primary">
                {c.headline}
              </h2>
              <p className="mt-2.5 flex-1 text-[13.5px] leading-relaxed text-ink-secondary">
                {c.standfirst}
              </p>
              <span className="mt-4 inline-flex items-center gap-1.5 text-[13px] font-medium text-primary-light">
                Read the comparison
                <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="pb-14">
        <div className="container-prose">
          <SectionHeading
            eyebrow="The short version"
            title="What this is, in one paragraph"
          />
          <p className="prose-innen mt-5">
            A private journal that takes two minutes, a meditation timer with no
            catalogue to browse, an anonymous board where a stranger who has been
            there answers, the Gita arranged by situation, and analytics that
            connect the four. Free, with no card and no trial — the only paid
            thing is one-to-one counselling with an actual person. It runs on
            Android and in any browser on the same account.
          </p>
        </div>
      </section>

      <CallToAction />
    </>
  );
}
