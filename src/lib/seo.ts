import type { Metadata } from "next";
import { absoluteUrl, site } from "./site";
export function pageMetadata({
  title,
  description,
  path,
}: {
  title: string;
  description: string;
  path: string;
}): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title,
      description,
      url: absoluteUrl(path),
      type: "website",
      siteName: site.name,
      images: ["/og"],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/og"],
    },
  };
}
export function jsonLdScript(data: unknown) {
  return { __html: JSON.stringify(data).replace(/</g, "\\u003c") };
}
export function softwareApplicationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "MobileApplication",
    name: site.name,
    description: site.description,
    operatingSystem: "Android",
    applicationCategory: "LifestyleApplication",
    url: site.url,
    installUrl: site.playUrl,
    downloadUrl: site.playUrl,
    offers: { "@type": "Offer", price: "0", priceCurrency: "INR" },
    featureList: [
      "Private journal and daily check-ins",
      "Meditation timer",
      "Habit and mood patterns",
      "Anonymous reflections",
      "Focus games and reading",
    ],
  };
}
export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: site.name,
    url: site.url,
    email: site.contactEmail,
  };
}
export function websiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: site.name,
    url: site.url,
  };
}
export function faqSchema(faqs: ReadonlyArray<{ q: string; a: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map(({ q, a }) => ({
      "@type": "Question",
      name: q,
      acceptedAnswer: { "@type": "Answer", text: a },
    })),
  };
}
export function breadcrumbSchema(
  trail: ReadonlyArray<{ name: string; path: string }>,
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}
