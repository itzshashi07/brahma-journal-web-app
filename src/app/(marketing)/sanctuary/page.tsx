import Link from 'next/link';
import type { Metadata } from 'next';

import {
  Breadcrumbs,
  CallToAction,
  SectionHeading,
} from '@/components/sections';
import { listArticles } from '@/lib/public-api';
import { breadcrumbSchema, jsonLdScript, pageMetadata } from '@/lib/seo';
import { ArticleBrowser } from './ArticleBrowser';

/**
 * One hour, written as a literal.
 *
 * Next analyses this statically at build time and cannot evaluate an
 * imported constant — a `revalidate` referencing one is reported as an
 * invalid segment config and the build stops. So the number lives here and
 * `ARTICLE_REVALIDATE_SECONDS` in `lib/public-api.ts` documents it for the
 * fetches, which have no such restriction.
 */
export const revalidate = 3600;

export const metadata: Metadata = pageMetadata({
  title: 'Sanctuary — Articles on Calm, Habits and Sleep',
  description:
    'Plain-language writing on anxiety, overthinking, habits, sleep and ' +
    'self-worth — by people who have been in it. Free to read, in English and ' +
    'Hinglish.',
  path: '/sanctuary',
});

const trail = [
  { name: 'Home', path: '/' },
  { name: 'Sanctuary', path: '/sanctuary' },
];

/**
 * The public article index.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * Why this section is worth more than the landing pages
 *
 * A landing page ranks for the handful of phrases it was written for. A growing
 * library of articles ranks for hundreds nobody planned — and those are the
 * queries with actual intent behind them, because somebody typing "why do I
 * overthink everything at night" is much closer to needing this than somebody
 * typing "journal app".
 *
 * It is also the only part of the marketing site that grows without anyone
 * writing marketing copy: members submit articles from inside the app, a human
 * reviews them, and the approved ones appear here.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * On the empty state
 *
 * If the API is unreachable at build time this renders as an invitation to
 * write rather than as an error. A section that is briefly empty reads as new;
 * a section showing a stack trace reads as abandoned.
 */
export default async function SanctuaryIndexPage() {
  const articles = await listArticles(60);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLdScript(breadcrumbSchema(trail))}
      />

      <section className="container-page pb-10 pt-10 sm:pt-14">
        <Breadcrumbs trail={trail} />

        <h1 className="max-w-3xl text-3xl font-semibold leading-[1.15] tracking-tight text-ink-primary sm:text-4xl">
          Something worth reading, in the{' '}
          <span className="headline">language you think in</span>
        </h1>
        <p className="mt-5 max-w-2xl text-[15px] leading-relaxed text-ink-secondary">
          Short, plain writing on the things this app is about — the 1am loop,
          habits that never stick, flat weeks, and saying the thing out loud.
          Written by members, reviewed before publishing, and many of them in
          Hinglish as a real second version rather than a translation.
        </p>

      </section>

      <section className="py-8">
        {articles.length === 0 ? (
          <div className="container-page">
            <div className="glass p-10 text-center">
              <h2 className="text-lg font-semibold text-ink-primary">
                The library is just starting
              </h2>
              <p className="mx-auto mt-2 max-w-md text-[14px] leading-relaxed text-ink-secondary">
                Articles are written by members and published after review. If
                you have something worth saying about getting through a hard
                stretch, you can write it from inside the app.
              </p>
              <Link href="/signup" className="btn-primary mt-6">
                Write the first one
              </Link>
            </div>
          </div>
        ) : (
          /* The chips used to be decoration. They filter now — see the note in
             ArticleBrowser on why that happens in the browser rather than on
             the server, and why every card is still in the initial HTML. */
          <ArticleBrowser articles={articles} />
        )}
      </section>

      <section className="py-14">
        <div className="container-page">
          <div className="glass p-7 sm:p-10">
            <SectionHeading
              eyebrow="Write for it"
              title="Anyone signed in can submit an article"
              subtitle="It goes into a review queue like everybody else's, and a human reads it. If it is turned down you get a written reason and you keep the draft — deleting somebody's writing without a word is how you lose the person as well as the article."
            />
            <Link href="/signup" className="btn-primary mt-6">
              Create a free account
            </Link>
          </div>
        </div>
      </section>

      <div className="pb-20">
        <CallToAction />
      </div>
    </>
  );
}
