import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { ArrowRight } from 'lucide-react';

import { Icon } from '@/components/Icon';
import { PhoneMockup } from '@/components/PhoneMockup';
import { StoreButtons } from '@/components/StoreButtons';
import {
  Breadcrumbs,
  CallToAction,
  CheckList,
  FaqList,
  LinkCard,
  SectionHeading,
  Steps,
} from '@/components/sections';
import { featureBySlug, features } from '@/content/features';
import {
  breadcrumbSchema,
  faqSchema,
  jsonLdScript,
  pageMetadata,
} from '@/lib/seo';

/**
 * One page per feature, from `src/content/features.ts`.
 *
 * `generateStaticParams` makes every one of these a static file at build time.
 * Not for speed alone — a statically generated page has no server dependency,
 * so a landing page cannot go down because the API is cold-starting. The
 * marketing site staying up while the backend naps is the difference between a
 * slow app and a dead brand.
 */

export function generateStaticParams() {
  return features.map((feature) => ({ slug: feature.slug }));
}

/** Nothing outside the content file is a valid slug, so anything else 404s. */
export const dynamicParams = false;

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const feature = featureBySlug(slug);
  if (!feature) return {};

  return pageMetadata({
    title: feature.metaTitle,
    description: feature.metaDescription,
    path: `/features/${feature.slug}`,
  });
}

export default async function FeaturePage({ params }: Props) {
  const { slug } = await params;
  const feature = featureBySlug(slug);
  if (!feature) notFound();

  const related = feature.related
    .map((relatedSlug) => featureBySlug(relatedSlug))
    .filter((item): item is NonNullable<typeof item> => Boolean(item));

  const trail = [
    { name: 'Home', path: '/' },
    { name: 'Features', path: '/features' },
    { name: feature.name, path: `/features/${feature.slug}` },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLdScript(breadcrumbSchema(trail))}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLdScript(faqSchema(feature.faqs))}
      />

      {/* ─────────────────────────── hero ─────────────────────────── */}
      <section className="container-page pb-8 pt-10 sm:pt-14">
        <Breadcrumbs trail={trail} />

        <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_auto]">
          <div>
            <span className="chip mb-5">
              <Icon name={feature.icon} className="h-3.5 w-3.5 text-accent" />
              {feature.name}
            </span>

            <h1 className="text-3xl font-semibold leading-[1.15] tracking-tight text-ink-primary sm:text-4xl">
              {feature.headline}
            </h1>

            <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-ink-secondary">
              {feature.standfirst}
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/signup" className="btn-primary">
                Try it free
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/features" className="btn-ghost">
                All features
              </Link>
            </div>

            <div className="mt-7">
              <StoreButtons size="small" />
            </div>
          </div>

          <div className="justify-self-center lg:justify-self-end">
            <PhoneMockup kind={feature.mockup} />
          </div>
        </div>
      </section>

      {/* ─────────────────────────── the problem ─────────────────────────── */}
      <section className="py-14">
        <div className="container-prose">
          <SectionHeading eyebrow="Why this exists" title="The actual problem" />
          <div className="prose-innen mt-5">
            {feature.problem.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────────────────── how it works ─────────────────────────── */}
      <section className="py-14">
        <div className="container-page">
          <SectionHeading
            eyebrow="How it works"
            title="Three steps, and nothing hidden behind them"
          />
          <div className="mt-8">
            <Steps steps={feature.mechanism} />
          </div>
        </div>
      </section>

      {/* ─────────────────────────── what you get ─────────────────────────── */}
      <section className="py-14">
        <div className="container-page">
          <div className="glass p-7 sm:p-10">
            <SectionHeading
              eyebrow="In the app"
              title="Everything included, on the free tier"
            />
            <div className="mt-7">
              <CheckList items={feature.details} />
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────── faq ─────────────────────────── */}
      <section className="py-14">
        <div className="container-prose">
          <SectionHeading
            eyebrow="Questions"
            title={`About ${feature.name.toLowerCase()}`}
          />
          <div className="mt-7">
            <FaqList faqs={feature.faqs} />
          </div>
        </div>
      </section>

      {/* ─────────────────────────── related ─────────────────────────── */}
      {related.length > 0 && (
        <section className="py-14">
          <div className="container-page">
            <SectionHeading
              eyebrow="Next"
              title="What people usually look at after this"
            />
            <div className="mt-7 grid gap-4 sm:grid-cols-3">
              {related.map((item) => (
                <LinkCard
                  key={item.slug}
                  href={`/features/${item.slug}`}
                  icon={item.icon}
                  title={item.name}
                  blurb={item.standfirst}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      <div className="pb-20 pt-6">
        <CallToAction
          title={`Use ${feature.name.toLowerCase()} tonight`}
          body="It works in this browser on the same account as the Android app. No card, no trial, nothing to install."
        />
      </div>
    </>
  );
}
