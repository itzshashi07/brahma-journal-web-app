import Link from 'next/link';
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
import { GITA_SITUATIONS, GITA_VERSES, versesFor } from '@/content/gita';
import {
  breadcrumbSchema,
  faqSchema,
  jsonLdScript,
  pageMetadata,
} from '@/lib/seo';

/**
 * The Gita section, on the public web.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * Why this is the most valuable page on the site
 *
 * It is the one thing here that is not a claim about an app. Somebody typing
 * "gita shlok for anxiety" at 2am is not shopping for a journal — and they are
 * exactly the person the app was built for. This page answers the question they
 * actually asked, in full, without an install, and the product is the thing
 * underneath it rather than the price of entry.
 *
 * Everything is server-rendered and static: no JavaScript is needed to read a
 * verse, which is what makes it fast on the mid-range Android phone this
 * audience is holding.
 */

const FAQS = [
  {
    q: 'Do I need to be Hindu to read this?',
    a: 'No. InnenFlow is religion-neutral by design. The Gita is here as one of the traditions people reach for when life is difficult, alongside meditation practices from several others. Nothing here asks you to belong to anything.',
  },
  {
    q: 'Are the verses accurate?',
    a: 'Every entry carries its chapter and verse so you can check it against a printed edition, and the Sanskrit is included alongside a transliteration. The translations are plain-language rather than literal, and the "what this means" note is an application, not scripture.',
  },
  {
    q: 'Why arranged by situation instead of by chapter?',
    a: 'Because nobody in trouble searches for "Chapter 2, Verse 47". They search for what is happening to them. Ordering by chapter serves the book; ordering by situation serves the person holding the phone.',
  },
  {
    q: 'Is this the whole Bhagavad Gita?',
    a: `No. It is ${GITA_VERSES.length} verses chosen for the situations people actually arrive in, each with a note on what it means when you are living it. The Gita has 700 verses; a list of all of them helps nobody at 2am.`,
  },
  {
    q: 'Is it free?',
    a: 'Yes. This page needs no account at all. The app is free too, and the same section is in it, offline, alongside the journal and the meditation timer.',
  },
];

export const metadata: Metadata = pageMetadata({
  title: 'Bhagavad Gita for real life — verses by situation, in Hindi and English',
  description:
    'Bhagavad Gita verses arranged by what you are going through: anxiety, heartbreak, anger, grief, self-doubt, work. Sanskrit, transliteration, translation and what each one means when you are living it — in Hindi and English, free.',
  path: '/wisdom',
});

export default function WisdomHubPage() {
  const trail = [
    { name: 'Home', path: '/' },
    { name: 'Wisdom', path: '/wisdom' },
  ];

  // The three that carry the most verses, shown in full so the page proves
  // itself rather than only promising twelve links.
  const featured = ['anxiety', 'peace', 'growth'] as const;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLdScript(breadcrumbSchema(trail))}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLdScript(faqSchema(FAQS))}
      />

      <section className="container-page pb-8 pt-10 sm:pt-14">
        <Breadcrumbs trail={trail} />

        <div className="max-w-3xl">
          <span className="chip mb-5">
            <span className="text-accent">॥</span>
            Wisdom for real life
          </span>

          <h1 className="headline text-3xl font-semibold leading-[1.15] tracking-tight sm:text-4xl">
            The Bhagavad Gita, arranged by what you are actually going through
          </h1>

          <p className="mt-5 text-[15px] leading-relaxed text-ink-secondary">
            Not by chapter. By the thing that is happening to you tonight — the
            job that went to someone else, the person who stopped answering, the
            thoughts that will not slow down. {GITA_VERSES.length} verses, each
            with the Sanskrit for those who want it, and a plain note on what it
            means when you are living it. In English and{' '}
            <span lang="hi">हिंदी</span>.
          </p>

          <p className="mt-3 text-[13px] text-ink-muted">
            Free, no account, nothing to install. InnenFlow is religion-neutral —
            nothing here asks you to belong to anything.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="#situations" className="btn-primary">
              Find your situation
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/download" className="btn-ghost">
              Read it offline in the app
            </Link>
          </div>
        </div>
      </section>

      {/* ─────────────────────────── the twelve ─────────────────────────── */}
      <section id="situations" className="py-14">
        <div className="container-page">
          <SectionHeading
            eyebrow="Start where you are"
            title="Twelve situations"
            subtitle="Pick the one that is closest. Several verses appear under more than one, because life does not arrive in categories."
          />

          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {GITA_SITUATIONS.map((s) => (
              <Link
                key={s.key}
                href={`/wisdom/${s.slug}`}
                className="glass glass-hover group flex items-start gap-4 p-5"
              >
                <span aria-hidden className="text-2xl leading-none">
                  {s.emoji}
                </span>
                <span className="min-w-0">
                  <span className="block text-[15px] font-semibold text-ink-primary">
                    {s.labelEn}{' '}
                    <span lang="hi" className="font-normal text-ink-muted">
                      · {s.labelHi}
                    </span>
                  </span>
                  <span className="mt-1 block text-[13px] leading-relaxed text-ink-secondary">
                    {s.opening}
                  </span>
                  <span className="mt-2 block text-[12px] text-ink-muted">
                    {versesFor(s.key).length} verses
                  </span>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ───────────────────── a few, in full, right here ───────────────── */}
      {featured.map((key) => {
        const situation = GITA_SITUATIONS.find((s) => s.key === key)!;
        const verses = versesFor(key).slice(0, 2);

        return (
          <section key={key} className="py-10">
            <div className="container-prose">
              <SectionHeading
                eyebrow={`${situation.emoji} ${situation.labelEn}`}
                title={situation.opening}
              />
              <div className="mt-6 space-y-4">
                {verses.map((v) => (
                  <VerseCard key={`${v.chapter}.${v.verse}`} verse={v} />
                ))}
              </div>
              <Link
                href={`/wisdom/${situation.slug}`}
                className="mt-5 inline-flex items-center gap-1.5 text-[13px] font-medium text-primary-light hover:text-accent-light"
              >
                All {versesFor(key).length} verses for {situation.labelEn.toLowerCase()}
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </section>
        );
      })}

      <section className="py-14">
        <div className="container-prose space-y-8">
          <div>
            <SectionHeading eyebrow="Questions" title="About this section" />
            <div className="mt-7">
              <FaqList faqs={FAQS} />
            </div>
          </div>

          <CrisisNote text="If you are in danger right now, this page is not the right help. In India, Tele-MANAS is free on 14416, any hour of any day." />

          <div className="pt-2">
            <StoreButtons size="small" />
          </div>
        </div>
      </section>

      <CallToAction
        title="The same section is in the app, offline"
        body="Along with a journal that takes two minutes, a meditation timer, and a board where you can say the thing you cannot say anywhere else."
      />
    </>
  );
}
