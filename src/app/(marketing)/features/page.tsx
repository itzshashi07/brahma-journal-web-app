import type { Metadata } from 'next';

import { PhoneMockup } from '@/components/PhoneMockup';
import {
  Breadcrumbs,
  CallToAction,
  LinkCard,
  SectionHeading,
  TrustStrip,
} from '@/components/sections';
import { features } from '@/content/features';
import { breadcrumbSchema, jsonLdScript, pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'Features — Journal, Meditation & Anonymous Board',
  description:
    'Everything InnenFlow does: a private journal with mood tracking, guided ' +
    'meditation, your own affirmations, an anonymous support board, counselling, ' +
    'articles, focus games and honest streaks. All free.',
  path: '/features',
});

/**
 * The hub for the nine feature pages.
 *
 * A hub page is not filler. It is the thing that gives nine deep pages a shared
 * parent, so they read as a section of a site rather than nine unrelated
 * documents — which is both how a crawler assigns them authority and how a
 * person browsing decides there is more here worth reading.
 */
const trail = [
  { name: 'Home', path: '/' },
  { name: 'Features', path: '/features' },
];

export default function FeaturesIndexPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLdScript(breadcrumbSchema(trail))}
      />

      <section className="container-page pb-10 pt-10 sm:pt-14">
        <Breadcrumbs trail={trail} />

        <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_auto]">
          <div>
            <h1 className="text-3xl font-semibold leading-[1.15] tracking-tight text-ink-primary sm:text-4xl">
              Everything in the app, and{' '}
              <span className="headline">what each part is for</span>
            </h1>
            <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-ink-secondary">
              Nine features, none of them behind a paywall. Each one has a page
              explaining the problem it exists for, how it actually works, and
              the questions people ask before they trust it with anything.
            </p>
          </div>

          <div className="justify-self-center lg:justify-self-end">
            <PhoneMockup kind="community" />
          </div>
        </div>
      </section>

      <section className="py-10">
        <div className="container-page grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <LinkCard
              key={feature.slug}
              href={`/features/${feature.slug}`}
              icon={feature.icon}
              title={feature.name}
              blurb={feature.standfirst}
            />
          ))}
        </div>
      </section>

      <section className="py-14">
        <div className="container-page mb-8">
          <SectionHeading
            eyebrow="Across all of it"
            title="The four things that are true of every feature"
          />
        </div>
        <TrustStrip />
      </section>

      <div className="pb-20 pt-6">
        <CallToAction />
      </div>
    </>
  );
}
