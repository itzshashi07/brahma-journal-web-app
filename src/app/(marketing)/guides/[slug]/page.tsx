import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { ArrowRight } from 'lucide-react';

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
import { guideBySlug, guides } from '@/content/guides';
import {
  breadcrumbSchema,
  faqSchema,
  howToSchema,
  jsonLdScript,
  pageMetadata,
} from '@/lib/seo';

/**
 * One guide.
 *
 * `type: 'article'` on the metadata rather than the default `website`: these
 * are the pages that get shared into a group chat, and the share card should
 * say article. It is also the honest description of what they are.
 */

export function generateStaticParams() {
  return guides.map((guide) => ({ slug: guide.slug }));
}

export const dynamicParams = false;

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const guide = guideBySlug(slug);
  if (!guide) return {};

  return pageMetadata({
    title: guide.metaTitle,
    description: guide.metaDescription,
    path: `/guides/${guide.slug}`,
    type: 'article',
  });
}

export default async function GuidePage({ params }: Props) {
  const { slug } = await params;
  const guide = guideBySlug(slug);
  if (!guide) notFound();

  const linked = (guide.features ?? [])
    .map((s) => featureBySlug(s))
    .filter((item): item is NonNullable<typeof item> => Boolean(item));

  const trail = [
    { name: 'Home', path: '/' },
    { name: 'Guides', path: '/guides' },
    { name: guide.headline, path: `/guides/${guide.slug}` },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLdScript(breadcrumbSchema(trail))}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLdScript(faqSchema(guide.faqs))}
      />
      {guide.steps && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={jsonLdScript(
            howToSchema(guide.metaTitle, guide.metaDescription, guide.steps)
          )}
        />
      )}

      <section className="container-prose pb-6 pt-10 sm:pt-14">
        <Breadcrumbs trail={trail} />
        <h1 className="headline mt-2 text-3xl font-semibold leading-[1.15] tracking-tight sm:text-4xl">
          {guide.headline}
        </h1>
        <p className="mt-5 text-[15.5px] leading-relaxed text-ink-secondary">
          {guide.standfirst}
        </p>
      </section>

      <section className="pb-8">
        <div className="container-prose">
          <div className="prose-innen">
            {guide.sections.map((section) => (
              <div key={section.heading}>
                <h2>{section.heading}</h2>
                {section.body.map((paragraph) => (
                  // `whitespace-pre-line` so a section written as a list of
                  // lines stays a list of lines rather than one run-on block.
                  <p key={paragraph} className="whitespace-pre-line">
                    {paragraph}
                  </p>
                ))}
              </div>
            ))}
          </div>

          {guide.verifiedOn && (
            <p className="mt-6 rounded-md border border-hairline bg-bg-card/50 px-4 py-3 text-[12.5px] text-ink-muted">
              The numbers on this page were checked against their official
              sources on{' '}
              {new Date(guide.verifiedOn).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
              .
            </p>
          )}
        </div>
      </section>

      {guide.steps && (
        <section className="py-10">
          <div className="container-page">
            <SectionHeading
              eyebrow="The short version"
              title="What to actually do"
            />
            <div className="mt-8">
              <Steps steps={guide.steps} />
            </div>
          </div>
        </section>
      )}

      <section className="py-10">
        <div className="container-prose space-y-8">
          <div>
            <SectionHeading eyebrow="Questions" title="The obvious ones" />
            <div className="mt-7">
              <FaqList faqs={guide.faqs} />
            </div>
          </div>

          {!guide.noSell && (
            <CrisisNote text="If you are struggling more than an app should be asked to help with, Tele-MANAS is free on 14416 in India, at any hour. There is a list of other numbers in the helplines guide." />
          )}
        </div>
      </section>

      {linked.length > 0 && (
        <section className="py-10">
          <div className="container-page">
            <SectionHeading
              eyebrow="If you want the app for it"
              title="The parts that do this"
            />
            <div className="mt-7 grid gap-4 sm:grid-cols-2">
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

      <section className="py-10">
        <div className="container-page">
          <SectionHeading eyebrow="Next" title="Other guides" />
          <div className="mt-7 grid gap-4 sm:grid-cols-3">
            {guides
              .filter((g) => g.slug !== guide.slug)
              .slice(0, 3)
              .map((g) => (
                <Link
                  key={g.slug}
                  href={`/guides/${g.slug}`}
                  className="glass glass-hover p-5"
                >
                  <p className="text-[14.5px] font-semibold leading-snug text-ink-primary">
                    {g.headline}
                  </p>
                  <span className="mt-3 inline-flex items-center gap-1.5 text-[12.5px] text-primary-light">
                    Read
                    <ArrowRight className="h-3 w-3" />
                  </span>
                </Link>
              ))}
          </div>

          {!guide.noSell && (
            <div className="mt-8">
              <StoreButtons size="small" />
            </div>
          )}
        </div>
      </section>

      {!guide.noSell && <CallToAction />}
    </>
  );
}
