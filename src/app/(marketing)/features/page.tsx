import {
  DownloadSection,
  FeatureGrid,
  InsideTheApp,
  SectionIntro,
} from "@/components/PromoSections";
import { DownloadButton } from "@/components/DownloadButton";
import { pageMetadata } from "@/lib/seo";
import { site } from "@/lib/site";
export const metadata = pageMetadata({
  title: "A journal, a pause, and room to grow",
  description:
    "Explore InnenFlow’s Android app: private journaling, meditation, daily check-ins, personal patterns, small wins, focus games and reading.",
  path: "/features",
});
export default function FeaturesPage() {
  return (
    <>
      <section className="page-hero promo-container">
        <span className="eyebrow">MEET THE ANDROID APP</span>
        <h1>
          A little support
          <br />
          <em>for your everyday.</em>
        </h1>
        <p>
          Write when your head feels full. Pause when the day moves too fast.
          Look back when you want to understand your own patterns.
        </p>
        <DownloadButton />
      </section>
      <section className="section-space features-page">
        <div className="promo-container">
          <FeatureGrid full />
        </div>
      </section>
      <section className="next-update-section">
        <div className="promo-container">
          <SectionIntro
            eyebrow={
              site.resetReleased
                ? "IN THE LATEST ANDROID RELEASE"
                : "COMING IN THE NEXT ANDROID UPDATE"
            }
            title="Two minutes. One next step."
          >
            The new guided reset helps you name a mood, choose what is taking up
            space and leave with one manageable action. A weekly reflection
            brings your own check-ins together.
          </SectionIntro>
          {!site.resetReleased && (
            <p className="release-note">
              Version 1.8.0 is prepared but has not yet been published on Google
              Play. The screens below are a preview.
            </p>
          )}
        </div>
      </section>
      <InsideTheApp />
      <DownloadSection />
    </>
  );
}
