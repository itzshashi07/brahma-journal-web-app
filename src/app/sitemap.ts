import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/site";
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    "/",
    "/features",
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
