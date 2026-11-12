import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import {
  jsonLdScript,
  organizationSchema,
  softwareApplicationSchema,
  websiteSchema,
} from "@/lib/seo";
import { site } from "@/lib/site";
import "./globals.css";
const outfit = localFont({
  src: "./fonts/Outfit-Regular.ttf",
  variable: "--font-outfit",
  display: "swap",
});
export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} — ${site.shortDescription}`,
    template: `%s · ${site.name}`,
  },
  description: site.description,
  applicationName: site.name,
  category: "lifestyle",
  alternates: { canonical: "/" },
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    siteName: site.name,
    locale: site.locale,
    title: `${site.name} — ${site.shortDescription}`,
    description: site.description,
    images: ["/og"],
  },
  twitter: { card: "summary_large_image", images: ["/og"] },
  icons: { icon: [{ url: "/icon.svg", type: "image/svg+xml" }] },
  other: { "google-play-app": `app-id=${site.packageId}` },
};
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#f7f6f2",
  colorScheme: "light",
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en-IN" className={outfit.variable}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={jsonLdScript(organizationSchema())}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={jsonLdScript(softwareApplicationSchema())}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={jsonLdScript(websiteSchema())}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
