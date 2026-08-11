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
  CrisisNote,
  FaqList,
  LinkCard,
  SectionHeading,
  Steps,
} from '@/components/sections';
import { featureBySlug } from '@/content/features';
import { useCaseBySlug, useCases } from '@/content/use-cases';
import {
  breadcrumbSchema,
  faqSchema,
  howToSchema,
  jsonLdScript,
  pageMetadata,
} from '@/lib/seo';

/**
 * One page per problem, from `src/content/use-cases.ts`.
 *
 * Structurally close to the feature template and deliberately not shared with
 * it. The two differ in the things that matter — a use-case page leads with the
 * reader's situation rather than the product, emits `HowTo` structured data for
 * its steps, and carries a crisis note. Folding them into one template with
 * four conditionals would make both harder to change and neither clearer.
 */

export function generateStaticParams() {
  return useCases.map((useCase) => ({ slug: useCase.slug }));
}

export const dynamicParams = false;

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const useCase = useCaseBySlug(slug);
  if (!useCase) return {};

  return pageMetadata({
    title: useCase.metaTitle,
    description: useCase.metaDescription,
    path: `/use-cases/${useCase.slug}`,
  });
}

export default async function UseCasePage({ params }: Props) {
  const { slug } = await params;
  const useCase = useCaseBySlug(slug);
  if (!useCase) notFound();

  const linked = useCase.features
    .map((featureSlug) => featureBySlug(featureSlug))
    .filter((item): item is NonNullable<typeof item> => Boolean(item));

  const trail = [
    { name: 'Home', path: '/' },
    { name: 'Use cases', path: '/use-cases' },
    { name: useCase.name, path: `/use-cases/${useCase.slug}` },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLdScript(breadcrumbSchema(trail))}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLdScript(faqSchema(useCase.faqs))}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLdScript(
          howToSchema(useCase.metaTitle, useCase.metaDescription, useCase.steps)
        )}
      />

      {/* ─────────────────────────── hero ─────────────────────────── */}
      <section className="container-page pb-8 pt-10 sm:pt-14">
        <Breadcrumbs trail={trail} />

        <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_auto]">
          <div>
            <span className="chip mb-5">
              <Icon name={useCase.icon} className="h-3.5 w-3.5 text-accent" />
              {useCase.name}
            </span>

            <h1 className="text-3xl font-semibold leading-[1.15] tracking-tight text-ink-primary sm:text-4xl">
              {useCase.headline}
            </h1>

            <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-ink-secondary">
              {useCase.standfirst}
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/signup" className="btn-primary">
                Start free tonight
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/use-cases" className="btn-ghost">
                Other situations
              </Link>
            </div>

            <div className="mt-7">
              <StoreButtons size="small" />
            </div>
          </div>

          <div className="justify-self-center lg:justify-self-end">
            <PhoneMockup kind={useCase.mockup} />
          </div>
        </div>
      </section>

      {/* ─────────────────────────── the situation ─────────────────────────── */}
      <section className="py-14">
        <div className="container-prose">
          <SectionHeading eyebrow="What this is like" title="The situation" />
          <div className="prose-innen mt-5">
            {useCase.problem.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────────────────── what to do ─────────────────────────── */}
      <section className="py-14">
        <div className="container-page">
          <SectionHeading
            eyebrow="What to actually do"
            title="A routine that takes about five minutes"
            subtitle="Not a programme and not thirty days of anything. Do the first step tonight and leave the rest."
          />
          <div className="mt-8">
            <Steps steps={useCase.steps} />
          </div>
        </div>
      </section>

      {/* ─────────────────────── the features it leans on ─────────────────── */}
      {linked.length > 0 && (
        <section className="py-14">
          <div className="container-page">
            <SectionHeading
              eyebrow="What you will be using"
              title="The parts of the app this needs"
            />
            <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {linked.map((item) => (
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

      {/* ─────────────────────────── faq + crisis ─────────────────────────── */}
      <section className="py-14">
        <div className="container-prose space-y-8">
          <div>
            <SectionHeading eyebrow="Questions" title="Before you start" />
            <div className="mt-7">
              <FaqList faqs={useCase.faqs} />
            </div>
          </div>

          {useCase.crisisNote && <CrisisNote text={useCase.crisisNote} />}
        </div>
      </section>

      {/* ─────────────────────────── other use cases ─────────────────────── */}
      <section className="py-14">
        <div className="container-page">
          <SectionHeading eyebrow="Also" title="Other things people come here for" />
          <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {useCases
              .filter((item) => item.slug !== useCase.slug)
              .slice(0, 3)
              .map((item) => (
                <LinkCard
                  key={item.slug}
                  href={`/use-cases/${item.slug}`}
                  icon={item.icon}
                  title={item.name}
                  blurb={item.standfirst}
                />
              ))}
          </div>
        </div>
      </section>

      <div className="pb-20 pt-6">
        <CallToAction />
      </div>
    </>
  );
}
