import type { Metadata } from 'next';

import { PhoneMockup } from '@/components/PhoneMockup';
import {
  Breadcrumbs,
  CallToAction,
  CrisisNote,
  LinkCard,
  SectionHeading,
} from '@/components/sections';
import { useCases } from '@/content/use-cases';
import { breadcrumbSchema, jsonLdScript, pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'Use Cases — Overthinking, Anxiety, Habits',
  description:
    'Start from the thing you are actually dealing with: the 1am loop, constant ' +
    'worry, a habit that never sticks, nobody to talk to, exam pressure, or a ' +
    'flat stretch you cannot explain.',
  path: '/use-cases',
});

const trail = [
  { name: 'Home', path: '/' },
  { name: 'Use cases', path: '/use-cases' },
];

export default function UseCasesIndexPage() {
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
              Start from{' '}
              <span className="headline">where you actually are</span>
            </h1>
            <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-ink-secondary">
              Nobody goes looking for a journalling app. They go looking because
              they cannot sleep, or cannot concentrate, or have nobody to tell.
              Pick the one that sounds like your week — each is a short, specific
              routine rather than a feature tour.
            </p>
          </div>

          <div className="justify-self-center lg:justify-self-end">
            <PhoneMockup kind="meditation" />
          </div>
        </div>
      </section>

      <section className="py-10">
        <div className="container-page grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {useCases.map((useCase) => (
            <LinkCard
              key={useCase.slug}
              href={`/use-cases/${useCase.slug}`}
              icon={useCase.icon}
              title={useCase.name}
              blurb={useCase.standfirst}
            />
          ))}
        </div>
      </section>

      <section className="py-10">
        <div className="container-prose">
          <CrisisNote
            text={
              'None of these pages is medical advice, and this app is not a ' +
              'clinical service. If you are thinking about harming yourself, ' +
              'please contact a crisis line rather than an app — in India, ' +
              'Tele-MANAS is free on 14416, any hour of any day.'
            }
          />
        </div>
      </section>

      <section className="py-14">
        <div className="container-prose">
          <SectionHeading
            centered
            eyebrow="A note on what this is"
            title="A journal is not a treatment, and saying otherwise would be a lie"
            subtitle="InnenFlow helps with the part that is about noticing, recording and saying things out loud. That is genuinely useful and it is genuinely limited. Where a page here would be out of its depth, it says so and points somewhere better."
          />
        </div>
      </section>

      <div className="pb-20">
        <CallToAction />
      </div>
    </>
  );
}
