import {
  InsideTheApp,
  DownloadSection,
  Questions,
} from "@/components/PromoSections";
import { DownloadButton } from "@/components/DownloadButton";
import { pageMetadata } from "@/lib/seo";
import { site } from "@/lib/site";
export const metadata = pageMetadata({
  title: "A look inside the Android app",
  description:
    "Explore actual InnenFlow Android screen previews: a guided reset, one next step, weekly reflections and six simple profile pictures.",
  path: "/inside",
});
export default function InsidePage() {
  return (
    <>
      <section className="page-hero promo-container">
        <span className="eyebrow">REAL APP SCREENS. A SMALLER FIRST STEP.</span>
        <h1>
          Less guessing.
          <br />
          <em>Take a look inside.</em>
        </h1>
        <p>
          {site.resetReleased
            ? "Explore the latest Android experience, with illustrative entries."
            : "A preview of version 1.8.0: the guided reset, weekly reflection and six simple profile pictures. This update is prepared and is not yet published on Google Play. The current app is available now."}
        </p>
        <DownloadButton />
      </section>
      <InsideTheApp />
      <Questions />
      <DownloadSection />
    </>
  );
}
