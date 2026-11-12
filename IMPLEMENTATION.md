# Promotional website architecture

Next.js App Router renders static promotional pages: home, features, download,
about, support, account-deletion instructions, privacy and terms. There is no
account session, client API access, browser journaling or web application.

`src/content/promo.ts` is the feature/FAQ catalogue. `src/lib/site.ts` owns the
Play link, canonical origin and release-preview flag. `PromoSections.tsx`
assembles shared presentation sections. The header is the only custom client
component; FAQs use native details elements. Images use Next image optimisation.

The Outfit font is bundled locally. Screens in `public/images/app` come from
Android QA with fictional entries, and the lifestyle photograph is AI-generated.
No customer counts, ratings, testimonials or clinical outcomes are invented.

The Android 1.8.0 preview is labelled as upcoming until the release flag is set.
Retired app and content URLs are handled by permanent server redirects. The
compatibility manifest opens the download page in a normal browser and is not
advertised as an installable web application.

Run `npm run typecheck` and `npm run build`, then smoke-test all public routes,
retired-route redirects, image responses, canonical metadata and the Play link
against `next start`. Browser QA is performed when a connected browser exists.
