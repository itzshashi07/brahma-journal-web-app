import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/site";
import { appFeatures } from "@/content/promo";
import { moments } from "@/content/moments";
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    "/",
    "/features",
    "/moments",
    "/inside",
    ...appFeatures.map((feature) => `/features/${feature.id}`),
    ...moments.map((moment) => `/moments/${moment.slug}`),
    "/download",
    "/about",
    "/support",
    "/privacy",
    "/terms",
    "/delete-account",
  ].map((path) => ({
    url: absoluteUrl(path),
    changeFrequency: "monthly",
    priority: path === "/" ? 1 : path === "/download" ? 0.9 : 0.6,
  }));
}
