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
  SectionHeading,
} from '@/components/sections';
import { VerseCard } from '@/components/VerseCard';
import {
  GITA_SITUATIONS,
  situationBySlug,
  versesFor,
  verseReference,
} from '@/content/gita';
import {
  breadcrumbSchema,
  faqSchema,
  jsonLdScript,
  pageMetadata,
} from '@/lib/seo';

/**
 * One page per situation somebody arrives in.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * Twelve pages that are not twelve copies
 *
 * The template is shared but the substance is not: each page carries its own
 * verses, its own opening line, and its own FAQ built from its own label. That
 * distinction is the whole difference between a set of pages worth having and
 * the kind of programmatic filler Google demotes as a group — the risk with
 * generated pages is never that there are many of them, it is that any two of
 * them could be swapped without a reader noticing.
 *
 * Every page here would be nonsense on any other slug.
 */

export function generateStaticParams() {
  return GITA_SITUATIONS.map((s) => ({ situation: s.slug }));
}

export const dynamicParams = false;

type Props = { params: Promise<{ situation: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { situation: slug } = await params;
  const situation = situationBySlug(slug);
  if (!situation) return {};

  const verses = versesFor(situation.key);

  return pageMetadata({
    // The searched words first, the brand last — a title is cut from the right
    // at about sixty characters.
    title: `Bhagavad Gita for ${situation.labelEn.toLowerCase()} — ${verses.length} verses, Hindi & English`,
    description: `${situation.opening} ${verses.length} Gita verses for ${situation.labelEn.toLowerCase()} (${situation.labelHi}), each with the Sanskrit, a translation, and what it means when you are living it. Free, no account.`,
    path: `/wisdom/${situation.slug}`,
  });
}

export default async function SituationPage({ params }: Props) {
  const { situation: slug } = await params;
  const situation = situationBySlug(slug);
  if (!situation) notFound();

  const verses = versesFor(situation.key);
  const others = GITA_SITUATIONS.filter((s) => s.key !== situation.key);

  const faqs = [
    {
      q: `Which Gita verse is best for ${situation.labelEn.toLowerCase()}?`,
      a: `There is no single one, which is why this page has ${verses.length}. If you only read one, read ${verseReference(verses[0])} — it is at the top, with a note on what it means in practice rather than in theory.`,
    },
    {
      q: 'Do I have to read the Sanskrit?',
      a: 'No. Every verse leads with what it means when you are living it; the Sanskrit and its transliteration are folded away behind a tap for anyone who wants them.',
    },
    {
      q: 'क्या यह हिंदी में भी है?',
      a: 'हाँ। हर श्लोक का अर्थ और उसका व्यावहारिक मतलब — दोनों हिंदी में मौजूद हैं, हर कार्ड में "हिंदी में पढ़ें" पर।',
    },
    {
      q: 'Is this religious?',
      a: 'InnenFlow is religion-neutral. The Gita is here as one of the traditions people reach for when life is hard, alongside meditation practices from several others. Nothing asks you to belong to anything.',
    },
  ];

  const trail = [
    { name: 'Home', path: '/' },
    { name: 'Wisdom', path: '/wisdom' },
    { name: situation.labelEn, path: `/wisdom/${situation.slug}` },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLdScript(breadcrumbSchema(trail))}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLdScript(faqSchema(faqs))}
      />

      <section className="container-page pb-6 pt-10 sm:pt-14">
        <Breadcrumbs trail={trail} />

        <div className="max-w-3xl">
          <span className="chip mb-5">
            <span aria-hidden>{situation.emoji}</span>
            {situation.labelEn}
            <span lang="hi" className="text-ink-muted">
              · {situation.labelHi}
            </span>
          </span>

          <h1 className="headline text-3xl font-semibold leading-[1.15] tracking-tight sm:text-4xl">
            The Gita on {situation.labelEn.toLowerCase()}
          </h1>

          <p className="mt-5 text-[15px] leading-relaxed text-ink-secondary">
            {situation.opening} Below are {verses.length} verses for exactly
            that, each with what it means when you are the one living it — in
            English and <span lang="hi">हिंदी</span>. No account, nothing to
            install.
          </p>
        </div>
      </section>

      <section className="pb-6">
        <div className="container-prose space-y-4">
          {verses.map((v) => (
            <VerseCard key={`${v.chapter}.${v.verse}`} verse={v} />
          ))}
        </div>
      </section>

      {/* ─────────────────────── what to do with it ─────────────────────── */}
      <section className="py-12">
        <div className="container-prose">
          <SectionHeading
            eyebrow="After you close this page"
            title="Reading it once is not the practice"
          />
          <div className="prose-innen mt-5">
            <p>
              A verse that lands at 2am is gone by Tuesday. The part that
              changes anything is what you do the next evening, and the evening
              after that — which is what the app is for, and why it takes two
              minutes rather than thirty.
            </p>
            <p>
              Write one line about the day. Sit for five minutes. Come back to
              this page when it is hard again — it will still be here, free, and
              the same {verses.length} verses will be waiting.
            </p>
          </div>

          <div className="mt-7 flex flex-wrap gap-3">
            <Link href="/signup" className="btn-primary">
              Start free tonight
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/wisdom" className="btn-ghost">
              All twelve situations
            </Link>
          </div>

          <div className="mt-6">
            <StoreButtons size="small" />
          </div>
        </div>
      </section>

      <section className="py-10">
        <div className="container-prose space-y-8">
          <div>
            <SectionHeading eyebrow="Questions" title="About these verses" />
            <div className="mt-7">
              <FaqList faqs={faqs} />
            </div>
          </div>

          <CrisisNote text="If you are in danger right now, a verse is not the right help. In India, Tele-MANAS is free on 14416, any hour of any day." />
        </div>
      </section>

      {/* ─────────────────────────── the others ─────────────────────────── */}
      <section className="py-12">
        <div className="container-page">
          <SectionHeading
            eyebrow="Somewhere else to look"
            title="Other situations"
          />
          <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {others.map((s) => (
              <Link
                key={s.key}
                href={`/wisdom/${s.slug}`}
                className="glass glass-hover flex items-center gap-3 p-4"
              >
                <span aria-hidden className="text-xl leading-none">
                  {s.emoji}
                </span>
                <span className="min-w-0">
                  <span className="block text-[14px] font-medium text-ink-primary">
                    {s.labelEn}
                  </span>
                  <span lang="hi" className="block text-[12px] text-ink-muted">
                    {s.labelHi}
                  </span>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <CallToAction
        title={`The Gita section is in the app too, offline`}
        body="Along with a journal that takes two minutes a night, a meditation timer, and a board where you can say the thing you cannot say anywhere else."
      />
    </>
  );
}
