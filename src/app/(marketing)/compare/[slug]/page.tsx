import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { ArrowRight, Check, Minus } from 'lucide-react';

import { StoreButtons } from '@/components/StoreButtons';
import {
  Breadcrumbs,
  CallToAction,
  FaqList,
  SectionHeading,
} from '@/components/sections';
import { comparisonBySlug, comparisons } from '@/content/comparisons';
import {
  breadcrumbSchema,
  faqSchema,
  jsonLdScript,
  pageMetadata,
} from '@/lib/seo';

/**
 * One "X alternative" page.
 *
 * The layout puts *their* column first and gives it the same visual weight as
 * ours. A comparison where the rival's strengths are set in smaller grey text
 * under a heading like "limitations" is not a comparison, and readers who have
 * seen twenty of those can tell within a second which kind they are reading.
 */

export function generateStaticParams() {
  return comparisons.map((c) => ({ slug: c.slug }));
}

export const dynamicParams = false;

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const c = comparisonBySlug(slug);
  if (!c) return {};

  return pageMetadata({
    title: c.metaTitle,
    description: c.metaDescription,
    path: `/compare/${c.slug}`,
  });
}

export default async function ComparePage({ params }: Props) {
  const { slug } = await params;
  const c = comparisonBySlug(slug);
  if (!c) notFound();

  const trail = [
    { name: 'Home', path: '/' },
    { name: 'Compare', path: '/compare' },
    { name: `vs ${c.rival}`, path: `/compare/${c.slug}` },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLdScript(breadcrumbSchema(trail))}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLdScript(faqSchema(c.faqs))}
      />

      <section className="container-page pb-8 pt-10 sm:pt-14">
        <Breadcrumbs trail={trail} />
        <div className="max-w-2xl">
          <span className="chip mb-5">InnenFlow vs {c.rival}</span>
          <h1 className="headline text-3xl font-semibold leading-[1.15] tracking-tight sm:text-4xl">
            {c.headline}
          </h1>
          <p className="mt-5 text-[15px] leading-relaxed text-ink-secondary">
            {c.standfirst}
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link href="/signup" className="btn-primary">
              Try it free — no card
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/features" className="btn-ghost">
              See what it does
            </Link>
          </div>
        </div>
      </section>

      <section className="py-10">
        <div className="container-prose">
          <SectionHeading
            eyebrow="First"
            title={`Why people look for a ${c.rival} alternative`}
          />
          <div className="prose-innen mt-5">
            {c.why.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>
        </div>
      </section>

      {/* Their column first, and the same size as ours. */}
      <section className="py-10">
        <div className="container-page grid gap-4 lg:grid-cols-2">
          <div className="glass p-6 sm:p-8">
            <h2 className="text-[17px] font-semibold text-ink-primary">
              What {c.rival} does better
            </h2>
            <p className="mt-1.5 text-[12.5px] text-ink-muted">
              Genuinely. This is where to go back if these matter most to you.
            </p>
            <ul className="mt-5 space-y-3">
              {c.betterThere.map((item) => (
                <li key={item} className="flex gap-3">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                  <span className="text-[13.5px] leading-relaxed text-ink-secondary">
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="glass p-6 sm:p-8">
            <h2 className="text-[17px] font-semibold text-ink-primary">
              What is different here
            </h2>
            <p className="mt-1.5 text-[12.5px] text-ink-muted">
              Differences rather than claims of superiority.
            </p>
            <ul className="mt-5 space-y-3">
              {c.betterHere.map((item) => (
                <li key={item} className="flex gap-3">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary-light" />
                  <span className="text-[13.5px] leading-relaxed text-ink-secondary">
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="py-6">
        <div className="container-prose">
          <div className="glass flex gap-4 border-accent/30 p-6">
            <Minus className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
            <p className="text-[14px] leading-relaxed text-ink-secondary">
              <strong className="font-semibold text-ink-primary">
                Stay with {c.rival} if
              </strong>{' '}
              {c.notForYouIf}
            </p>
          </div>
        </div>
      </section>

      <section className="py-10">
        <div className="container-prose">
          <SectionHeading eyebrow="Questions" title="Before you switch" />
          <div className="mt-7">
            <FaqList faqs={c.faqs} />
          </div>
          <div className="mt-8">
            <StoreButtons size="small" />
          </div>
        </div>
      </section>

      <section className="py-10">
        <div className="container-page">
          <SectionHeading eyebrow="Also" title="Other comparisons" />
          <div className="mt-7 grid gap-4 sm:grid-cols-2">
            {comparisons
              .filter((other) => other.slug !== c.slug)
              .map((other) => (
                <Link
                  key={other.slug}
                  href={`/compare/${other.slug}`}
                  className="glass glass-hover p-5"
                >
                  <p className="text-[14.5px] font-semibold text-ink-primary">
                    vs {other.rival}
                  </p>
                  <p className="mt-1.5 text-[13px] leading-relaxed text-ink-secondary">
                    {other.standfirst}
                  </p>
                </Link>
              ))}
          </div>
        </div>
      </section>

      <CallToAction />
    </>
  );
}
