import Link from "next/link";
import {
  ArrowDown,
  ArrowRight,
  Check,
  NotebookPen,
  Wind,
  ChartNoAxesCombined,
} from "lucide-react";
import { DownloadButton } from "@/components/DownloadButton";
import { PhonePreview } from "@/components/PhonePreview";
import {
  DownloadSection,
  FeatureGrid,
  HowItWorks,
  InsideTheApp,
  PrivacyStrip,
  Questions,
  QuietMoment,
  SectionIntro,
} from "@/components/PromoSections";
import { faqSchema, jsonLdScript, pageMetadata } from "@/lib/seo";
import { faqs } from "@/content/promo";
import { site } from "@/lib/site";
export const metadata = pageMetadata({
  title: "Private journal, mood check-ins & meditation",
  description: site.description,
  path: "/",
});
export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLdScript(faqSchema(faqs))}
      />
      <section className="hero">
        <div className="promo-container hero-layout">
          <div className="hero-copy">
            <span className="eyebrow">
              <span className="status-dot" /> YOUR PRIVATE JOURNAL. YOUR DAILY
              PAUSE.
            </span>
            <h1>
              A little less
              <br />
              in your head.
              <br />
              <em>A little more you.</em>
            </h1>
            <p className="hero-description">
              A private journal, a breathing break, and a way to notice your
              patterns. A small space for yourself at the end of a busy day.
            </p>
            <div className="hero-actions">
              <DownloadButton />
              <Link href="#inside" className="text-link">
                Take a look inside <ArrowDown size={17} />
              </Link>
            </div>
            <div className="hero-assurances">
              <span>
                <Check size={15} /> Free to use
              </span>
              <span>
                <Check size={15} /> Made for Android
              </span>
              <span>
                <Check size={15} /> Your journal stays personal
              </span>
            </div>
          </div>
          <div className="hero-visual">
            <div className="hero-orbit" aria-hidden="true" />
            <span className="hero-visual-label">A QUIETER PLACE TO THINK</span>
            <PhonePreview
              className="hero-phone"
              src="/images/app/2-reset.png"
              alt="Preview of the next InnenFlow Android update: a mood check-in and choice of topic"
              priority
            />
            <div className="floating-note">
              <span>FOR THE DAYS THAT FEEL FULL</span>
              <p>
                One thing
                <br />
                <em>at a time.</em>
              </p>
              <div className="note-line" />
            </div>
            <span className="hero-preview-label">
              {site.resetReleased
                ? "Inside the latest Android update"
                : "App screen · Next update preview"}
            </span>
          </div>
        </div>
      </section>
      <section className="intent-section">
        <div className="promo-container">
          <span className="eyebrow">WHAT DO YOU NEED TODAY?</span>
          <div className="intent-grid">
            {[
              {
                Icon: NotebookPen,
                title: "Get it out of your head.",
                body: "A private place for the honest version of your day.",
              },
              {
                Icon: Wind,
                title: "Slow down for a moment.",
                body: "A short pause, a breathing break, a little room to think.",
              },
              {
                Icon: ChartNoAxesCombined,
                title: "See the bigger picture.",
                body: "Your moods and habits, over more than just one day.",
              },
            ].map(({ Icon, title, body }) => (
              <article key={title}>
                <Icon size={26} strokeWidth={1.4} />
                <h2>{title}</h2>
                <p>{body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
      <HowItWorks />
      <InsideTheApp />
      <section className="section-space">
        <div className="promo-container">
          <div className="section-heading-row">
            <SectionIntro
              eyebrow="MORE THAN A BLANK PAGE"
              title="Tools for the way you actually feel."
            >
              Start with a journal entry. Explore the rest when you want to.
            </SectionIntro>
            <Link href="/features" className="text-link">
              Explore every feature <ArrowRight size={17} />
            </Link>
          </div>
          <FeatureGrid />
        </div>
      </section>
      <QuietMoment />
      <PrivacyStrip />
      <Questions />
      <DownloadSection />
    </>
  );
}
