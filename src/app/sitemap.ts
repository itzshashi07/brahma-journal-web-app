import type { MetadataRoute } from 'next';

import { features } from '@/content/features';
import { GITA_SITUATIONS } from '@/content/gita';
import { useCases } from '@/content/use-cases';
import { listArticleIndex } from '@/lib/public-api';
import { absoluteUrl } from '@/lib/site';

/**
 * The sitemap.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * What is in it, and what is deliberately not
 *
 * Every public, indexable page. Nothing under `/app`, `/login` or `/signup`:
 * those are either private or thin, and listing a page you have also told
 * robots not to index is a contradictory signal that wastes crawl budget on a
 * small site that has little to spare.
 *
 * `priority` is included because it costs nothing, while acknowledging that
 * Google has said for years it largely ignores it. `lastModified` is the field
 * that actually matters — it is how a crawler decides whether to re-fetch a
 * page it already has, and getting it wrong in either direction is worse than
 * omitting it. Static pages therefore carry the build time rather than
 * `new Date()` evaluated per request, which would claim every page changed on
 * every crawl and train the crawler to ignore the field.
 *
 * Articles carry their own timestamps, which is the case the field exists for.
 */

const buildTime = new Date();

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Annotated on the literal rather than after the `.map`, so `changeFrequency`
  // keeps its literal union type instead of widening to `string`.
  const staticRoutes: MetadataRoute.Sitemap = (
    [
      { url: absoluteUrl('/'), priority: 1, changeFrequency: 'weekly' },
      { url: absoluteUrl('/features'), priority: 0.9, changeFrequency: 'monthly' },
      { url: absoluteUrl('/use-cases'), priority: 0.9, changeFrequency: 'monthly' },
      { url: absoluteUrl('/wisdom'), priority: 0.9, changeFrequency: 'monthly' },
      { url: absoluteUrl('/download'), priority: 0.9, changeFrequency: 'monthly' },
      { url: absoluteUrl('/sanctuary'), priority: 0.8, changeFrequency: 'daily' },
      { url: absoluteUrl('/about'), priority: 0.5, changeFrequency: 'yearly' },
      { url: absoluteUrl('/support'), priority: 0.5, changeFrequency: 'monthly' },
      { url: absoluteUrl('/privacy'), priority: 0.3, changeFrequency: 'yearly' },
      { url: absoluteUrl('/terms'), priority: 0.3, changeFrequency: 'yearly' },
    ] satisfies MetadataRoute.Sitemap
  ).map((entry) => ({ ...entry, lastModified: buildTime }));

  const featureRoutes: MetadataRoute.Sitemap = features.map((feature) => ({
    url: absoluteUrl(`/features/${feature.slug}`),
    lastModified: buildTime,
    changeFrequency: 'monthly',
    priority: 0.8,
  }));

  const useCaseRoutes: MetadataRoute.Sitemap = useCases.map((useCase) => ({
    url: absoluteUrl(`/use-cases/${useCase.slug}`),
    lastModified: buildTime,
    changeFrequency: 'monthly',
    priority: 0.8,
  }));

  const wisdomRoutes: MetadataRoute.Sitemap = GITA_SITUATIONS.map((s) => ({
    url: absoluteUrl(`/wisdom/${s.slug}`),
    lastModified: buildTime,
    changeFrequency: 'monthly',
    priority: 0.8,
  }));

  // Fails soft — see `listArticleIndex`. A sitemap missing the article section
  // is recoverable on the next revalidation; a build that fails because the API
  // was asleep is not.
  const articles = await listArticleIndex();
  const articleRoutes: MetadataRoute.Sitemap = articles.map((article) => ({
    url: absoluteUrl(`/sanctuary/${article._id}`),
    lastModified: new Date(
      article.updatedAt || article.publishedAt || buildTime
    ),
    changeFrequency: 'monthly',
    priority: 0.7,
  }));

  return [
    ...staticRoutes,
    ...featureRoutes,
    ...useCaseRoutes,
    ...wisdomRoutes,
    ...articleRoutes,
  ];
}
