import type { MetadataRoute } from "next";
import { site } from "@/lib/site";
/** Compatibility for old website bookmarks; no standalone browser application. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: site.name,
    short_name: site.name,
    description: site.description,
    start_url: "/download",
    display: "browser",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml" }],
  };
}
