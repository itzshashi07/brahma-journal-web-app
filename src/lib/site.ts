/** The Android app's public promotional website. No accounts or app API. */
export const site = {
  name: "InnenFlow",
  tagline: "A quieter place to think",
  url: (() => {
    const explicit = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
    const vercel = process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL;
    const hosted = vercel ? `https://${vercel}` : undefined;
    const local = /^https?:\/\/(localhost|127\.0\.0\.1|0\.0\.0\.0)(:|\/|$)/i;
    if (
      explicit &&
      !(local.test(explicit) && process.env.NODE_ENV === "production")
    )
      return explicit;
    return hosted ?? "https://innenflow.com";
  })(),
  description:
    "Make a little room for yourself with InnenFlow for Android. A private journal, meditation, daily check-ins and a way to notice your patterns. Download on Google Play.",
  shortDescription: "Your private journal & daily pause",
  contactEmail: "officialshashi2023@gmail.com",
  locale: "en_IN",
  playUrl: "https://play.google.com/store/apps/details?id=com.brahma.brahmaApp",
  packageId: "com.brahma.brahmaApp",
  // Set only after the 1.8.0 Android release is actually live on Google Play.
  resetReleased: process.env.NEXT_PUBLIC_ANDROID_RESET_RELEASED === "true",
} as const;
export function absoluteUrl(path = "/") {
  return `${site.url}${path.startsWith("/") ? path : `/${path}`}`;
}
