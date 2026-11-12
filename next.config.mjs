import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
/** Promotional site only. Retired web-app URLs never mount private screens. */
const nextConfig = {
  reactStrictMode: true,
  turbopack: { root: dirname(fileURLToPath(import.meta.url)) },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
  async redirects() {
    const retiredApp = [
      "login",
      "signup",
      "forgot-password",
      "dashboard",
      "journal",
      "meditation",
      "affirmations",
      "thoughts",
      "community",
      "counselling",
      "library",
      "notifications",
      "profile",
      "analytics",
      "games",
      "deep-work",
      "small-wins",
      "reset",
      "admin",
      "products",
      "blogs",
      "gita",
      "announcements",
      "support-inbox",
      "reports",
      "onboarding",
      "welcome",
    ];
    return [
      { source: "/app/:path*", destination: "/download", permanent: true },
      ...retiredApp.map((path) => ({
        source: `/${path}/:path*`,
        destination: "/download",
        permanent: true,
      })),
      ...[
        "features",
        "use-cases",
        "guides",
        "wisdom",
        "compare",
        "sanctuary",
      ].map((path) => ({
        source: `/${path}/:slug+`,
        destination: "/features",
        permanent: true,
      })),
      ...["use-cases", "guides", "wisdom", "compare", "sanctuary"].map(
        (path) => ({
          source: `/${path}`,
          destination: "/features",
          permanent: true,
        }),
      ),
      { source: "/legal/privacy", destination: "/privacy", permanent: true },
      { source: "/legal/terms", destination: "/terms", permanent: true },
    ];
  },
};
export default nextConfig;
