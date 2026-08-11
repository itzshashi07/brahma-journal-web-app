'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { Search, X } from 'lucide-react';

import { readingMinutes, type PublicArticle } from '@/lib/public-api';

/**
 * The article grid, filterable by category and by a word in the title.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * Why the filtering happens in the browser and not on the server
 *
 * This page is statically generated and revalidated hourly — that is what makes
 * it fast and what makes it indexable, and it is the single largest source of
 * organic traffic this project has. Filtering server-side would mean either a
 * route per category, which multiplies the build, or a client fetch on every
 * chip tap, which turns an instant interaction into a spinner against a
 * cold-startable API.
 *
 * The whole index is sixty cards of title-and-excerpt, already in the HTML the
 * visitor was sent. Filtering it is an array `filter` over data that has already
 * arrived, so a category is one frame rather than one round trip.
 *
 * The categories were previously drawn as chips that looked exactly like
 * buttons and did nothing when tapped — which is worse than not having them,
 * because somebody taps twice and concludes the site is broken.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * What stays server-rendered
 *
 * Every card is in the initial HTML, unfiltered, because a crawler does not tap
 * chips. The interactivity is added on top of a complete page rather than
 * replacing it — nothing here is fetched, and with JavaScript off the full list
 * still renders.
 */
export function ArticleBrowser({ articles }: { articles: PublicArticle[] }) {
  const [category, setCategory] = useState<string | null>(null);
  const [query, setQuery] = useState('');

  /**
   * Categories, with how many articles are in each.
   *
   * Counted rather than merely listed: a category holding one article is worth
   * knowing about before tapping it, and an empty filter result is the most
   * annoying way to find that out.
   */
  const categories = useMemo(() => {
    const counts = new Map<string, number>();
    for (const article of articles) {
      const name = article.category?.trim();
      if (!name) continue;
      counts.set(name, (counts.get(name) ?? 0) + 1);
    }
    return [...counts.entries()].sort((a, b) => b[1] - a[1]);
  }, [articles]);

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();

    return articles.filter((article) => {
      if (category && article.category?.trim() !== category) return false;
      if (!needle) return true;

      // Title, Hinglish title and excerpt — the three things on the card. A
      // full-text search over article bodies is a server's job; this is here so
      // somebody who half-remembers a headline can find it.
      return (
        article.title?.toLowerCase().includes(needle) ||
        article.titleHinglish?.toLowerCase().includes(needle) ||
        article.excerpt?.toLowerCase().includes(needle)
      );
    });
  }, [articles, category, query]);

  return (
    <>
      {(categories.length > 0 || articles.length > 6) && (
        <div className="container-page mb-8">
          {categories.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <Chip active={category === null} onClick={() => setCategory(null)}>
                Everything
                <Count>{articles.length}</Count>
              </Chip>

              {categories.map(([name, count]) => (
                <Chip
                  key={name}
                  active={category === name}
                  onClick={() => setCategory(category === name ? null : name)}
                >
                  {name}
                  <Count>{count}</Count>
                </Chip>
              ))}
            </div>
          )}

          {articles.length > 6 && (
            <div className="relative mt-4 max-w-sm">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
              <label htmlFor="sanctuary-search" className="sr-only">
                Search the articles
              </label>
              <input
                id="sanctuary-search"
                type="search"
                className="field !pl-10 !pr-10"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search — sleep, overthinking, habits…"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  aria-label="Clear the search"
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-ink-muted transition hover:text-ink-primary"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          )}
        </div>
      )}

      <div className="container-page">
        {visible.length === 0 ? (
          <div className="glass p-10 text-center">
            <h2 className="text-[16px] font-semibold text-ink-primary">
              Nothing under that
            </h2>
            <p className="mx-auto mt-2 max-w-md text-[13.5px] leading-relaxed text-ink-secondary">
              Try another category, or clear the filter and read down the list —
              the good ones are rarely where you went looking.
            </p>
            <button
              type="button"
              onClick={() => {
                setCategory(null);
                setQuery('');
              }}
              className="btn-ghost mt-6"
            >
              Show everything
            </button>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {visible.map((article) => (
              <Link
                key={article._id}
                href={`/sanctuary/${article._id}`}
                className="glass glass-hover flex flex-col p-5"
              >
                {article.category && (
                  <span className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-accent">
                    {article.category}
                  </span>
                )}
                <h2 className="text-[16px] font-semibold leading-snug text-ink-primary">
                  {article.title}
                </h2>
                {article.excerpt && (
                  <p className="mt-2 line-clamp-3 flex-1 text-[13px] leading-relaxed text-ink-secondary">
                    {article.excerpt}
                  </p>
                )}
                <p className="mt-4 text-[11px] text-ink-muted">
                  {article.authorName || 'A member'} ·{' '}
                  {readingMinutes(article.excerpt)} min read
                  {article.titleHinglish ? ' · also in Hinglish' : ''}
                </p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`inline-flex items-center gap-1.5 rounded-pill border px-3.5 py-1.5 text-[12.5px] font-medium transition ${
        active
          ? 'border-transparent bg-gradient-primary text-white'
          : 'border-hairline bg-bg-card/60 text-ink-secondary hover:border-primary/50 hover:text-ink-primary'
      }`}
    >
      {children}
    </button>
  );
}

function Count({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-pill bg-black/15 px-1.5 text-[10px] tabular-nums opacity-80">
      {children}
    </span>
  );
}
