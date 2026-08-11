import { site } from './site';

/**
 * The server-side reader for published articles.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * Why this is separate from `lib/api.ts`
 *
 * `lib/api.ts` is `'use client'` and attaches a Firebase ID token. Neither is
 * available here: this runs during the build and during revalidation, where
 * there is no browser and no signed-in user. It reads `/api/public/*`, the one
 * unauthenticated router in the backend — see `src/routes/public.js` there for
 * why that router is safe to be public.
 *
 * Keeping them apart is deliberate. A single client that sometimes attaches a
 * token and sometimes does not is a client that will eventually attach
 * somebody's token to a statically cached page.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * Why every function here fails soft
 *
 * These pages are generated at build time. If the API is asleep — it is on a
 * free tier that suspends — a thrown error fails the entire build and takes the
 * marketing site down with it, over a section that is a bonus rather than the
 * point. So a failure yields an empty list, the article routes generate none,
 * and the next revalidation picks them up. A missing article section is a bad
 * day; a failed deploy is a worse one.
 */

export type PublicArticle = {
  _id: string;
  title: string;
  titleHinglish?: string;
  category?: string;
  authorName?: string;
  uid?: string;
  excerpt?: string;
  content?: string;
  contentHinglish?: string;
  createdAt?: string;
  publishedAt?: string | null;
  sharesCount?: number;
};

/**
 * How long a generated article page is served before it is rebuilt.
 *
 * An hour. Articles are edited rarely, and the page is served from cache the
 * whole time — a reader never waits for this. Shorter would mean regenerating
 * pages nothing has changed on; longer would mean a correction taking a day to
 * appear.
 */
export const ARTICLE_REVALIDATE_SECONDS = 3600;

async function publicGet<T>(path: string): Promise<T | null> {
  try {
    const response = await fetch(`${site.apiBaseUrl}/api/public${path}`, {
      next: { revalidate: ARTICLE_REVALIDATE_SECONDS },
      // Generous: this is a build-time fetch against a service that may be
      // cold-starting, and nobody is waiting on it.
      signal: AbortSignal.timeout(30_000),
    });
    if (!response.ok) return null;
    return (await response.json()) as T;
  } catch {
    return null;
  }
}

export async function listArticles(limit = 60): Promise<PublicArticle[]> {
  const body = await publicGet<{ blogs: PublicArticle[] }>(
    `/blogs?limit=${limit}`
  );
  return body?.blogs ?? [];
}

export async function getArticle(id: string): Promise<PublicArticle | null> {
  const body = await publicGet<{ blog: PublicArticle }>(`/blogs/${id}`);
  return body?.blog ?? null;
}

/** Ids and timestamps only, for `sitemap.ts`. */
export async function listArticleIndex(): Promise<
  { _id: string; updatedAt?: string; publishedAt?: string | null }[]
> {
  const body = await publicGet<{
    blogs: { _id: string; updatedAt?: string; publishedAt?: string | null }[];
  }>('/blogs/index/sitemap');
  return body?.blogs ?? [];
}

/**
 * A rough reading time, from the word count.
 *
 * 200 words a minute is the conventional figure and it is close enough — the
 * number exists to set an expectation ("this is short") rather than to be
 * accurate. Floored at one, because "0 min read" reads as broken.
 */
export function readingMinutes(text = ''): number {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}
