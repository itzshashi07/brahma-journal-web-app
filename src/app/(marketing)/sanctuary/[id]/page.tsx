import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

import { Breadcrumbs, CallToAction, CrisisNote } from '@/components/sections';
import {
  getArticle,
  listArticles,
  readingMinutes,
} from '@/lib/public-api';
import {
  breadcrumbSchema,
  jsonLdScript,
  pageMetadata,
} from '@/lib/seo';
import { absoluteUrl, site } from '@/lib/site';

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

/**
 * `dynamicParams` is left on (the default).
 *
 * The opposite of the feature and use-case routes, and for the opposite reason:
 * those have a fixed set of slugs known at build time, whereas articles are
 * published by members after the build. Leaving this on means an article
 * approved an hour ago is rendered on first request and cached from then on,
 * rather than 404ing until the next deploy.
 */
export async function generateStaticParams() {
  const articles = await listArticles(60);
  return articles.map((article) => ({ id: article._id }));
}

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const article = await getArticle(id);
  if (!article) return { title: 'Article not found' };

  // The article's own opening, trimmed at a word boundary — a description cut
  // mid-word looks like a bug in the search result.
  const raw = (article.excerpt || article.content || '').replace(/\s+/g, ' ');
  const description =
    raw.length > 155 ? `${raw.slice(0, 155).replace(/\s\S*$/, '')}…` : raw;

  return pageMetadata({
    title: article.title,
    description: description || site.shortDescription,
    path: `/sanctuary/${article._id}`,
    type: 'article',
    publishedTime: article.publishedAt || article.createdAt,
  });
}

export default async function ArticlePage({ params }: Props) {
  const { id } = await params;
  const article = await getArticle(id);
  if (!article) notFound();

  const body = article.content ?? '';
  const published = article.publishedAt || article.createdAt;

  const trail = [
    { name: 'Home', path: '/' },
    { name: 'Sanctuary', path: '/sanctuary' },
    { name: article.title, path: `/sanctuary/${article._id}` },
  ];

  /**
   * Article schema.
   *
   * Built inline rather than in `lib/seo.ts` because it is the only page that
   * needs it and it depends on fetched data. `author` is the display name only
   * — the author's email is deliberately not in the public API response, and it
   * would be scraped off an indexed page within a week if it were.
   */
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.excerpt ?? '',
    author: {
      '@type': 'Person',
      name: article.authorName || 'An InnenFlow member',
    },
    publisher: {
      '@type': 'Organization',
      name: site.name,
      url: site.url,
    },
    datePublished: published,
    dateModified: published,
    mainEntityOfPage: absoluteUrl(`/sanctuary/${article._id}`),
    inLanguage: 'en-IN',
    isAccessibleForFree: true,
    articleSection: article.category || 'Wellbeing',
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLdScript(articleSchema)}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLdScript(breadcrumbSchema(trail))}
      />

      <article className="container-prose pb-10 pt-10 sm:pt-14">
        <Breadcrumbs trail={trail} />

        {article.category && (
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-accent">
            {article.category}
          </p>
        )}

        <h1 className="text-3xl font-semibold leading-[1.2] tracking-tight text-ink-primary sm:text-4xl">
          {article.title}
        </h1>

        <p className="mt-4 text-[13px] text-ink-muted">
          {article.authorName || 'An InnenFlow member'}
          {published && (
            <>
              {' · '}
              <time dateTime={published}>
                {new Date(published).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </time>
            </>
          )}
          {' · '}
          {readingMinutes(body)} min read
        </p>

        {/*
          The body is rendered as plain text with paragraph breaks preserved,
          not as HTML.

          These articles are written by members through a plain-text editor in
          the app. Passing that through `dangerouslySetInnerHTML` on a public,
          indexed page would let any approved author inject script into the
          marketing site — a stored XSS whose review step is one busy person
          skim-reading prose. Text in, text out.
        */}
        <div className="prose-innen mt-8">
          {body
            .split(/\n{2,}/)
            .map((paragraph) => paragraph.trim())
            .filter(Boolean)
            .map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
        </div>

        {article.contentHinglish && (
          <details className="mt-10 rounded-lg border border-hairline bg-bg-card/40 p-5">
            <summary className="cursor-pointer list-none text-[14px] font-semibold text-ink-primary">
              Hinglish mein padhein →
            </summary>
            <h2 className="mt-4 text-lg font-semibold text-ink-primary">
              {article.titleHinglish || article.title}
            </h2>
            <div className="prose-innen mt-3">
              {article.contentHinglish
                .split(/\n{2,}/)
                .map((paragraph) => paragraph.trim())
                .filter(Boolean)
                .map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
            </div>
          </details>
        )}

        <div className="mt-10">
          <CrisisNote
            text={
              'This is one person writing about their experience, not medical ' +
              'advice. If you are thinking about harming yourself, please ' +
              'contact a crisis line — in India, Tele-MANAS is free on 14416, ' +
              'any hour of any day.'
            }
          />
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/signup" className="btn-primary">
            Start your own journal — free
          </Link>
          <Link href="/sanctuary" className="btn-ghost">
            More articles
          </Link>
        </div>
      </article>

      <div className="pb-20 pt-6">
        <CallToAction
          title="Read it, then write your own"
          body="Comment on this article, submit one of your own, and keep a private journal nobody else can read — all free, in this browser."
        />
      </div>
    </>
  );
}
