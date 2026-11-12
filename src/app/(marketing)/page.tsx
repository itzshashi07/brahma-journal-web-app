import Link from "next/link";
import Image from "next/image";
import { VibePicker } from "@/components/VibePicker";
import { MemeSection } from "@/components/MemeSection";
import {
  ArrowDown,
  ArrowRight,
  Check,
  NotebookPen,
  Wind,
  ChartNoAxesCombined,
} from "lucide-react";
import { DownloadButton } from "@/components/DownloadButton";
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
              <span className="status-dot" /> FOR THE BRAIN WITH TOO MANY TABS
              OPEN
            </span>
            <h1>
              37 tabs open.
              <br />
              <em>
                You deserve
                <br />a pause.
              </em>
            </h1>
            <p className="hero-description">
              Overthinking the text. The deadline. The entire plot. Put it into
              a private journal, take a breathing break, and make a little space
              for you.
            </p>
            <p className="hero-hinglish">
              Sab sorted nahi hai? Start with one honest thought.
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
          <div className="hero-visual genz-visual">
            <div className="brain-halo" aria-hidden="true" />
            <span className="hero-visual-label">
              CURRENT STATUS: ONE THING AT A TIME
            </span>
            <Image
              className="hero-brain"
              src="/images/brain-with-too-many-tabs.webp"
              alt="Original illustration of a purple brain in a hoodie, putting thoughts in a notebook while browser tabs float around it"
              width={1312}
              height={1199}
              sizes="(max-width: 640px) 100vw, 50vw"
              priority
            />
            <span className="brain-sticker sticker-top">overthinking.exe</span>
            <span className="brain-sticker sticker-bottom">
              less scroll. more soul. ✳
            </span>
            <span className="hero-preview-label">
              A little space for your actual life.
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
      <VibePicker />
      <MemeSection />
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
      <InsideTheApp />
      <HowItWorks />
      <QuietMoment />
      <PrivacyStrip />
      <Questions />
      <DownloadSection />
    </>
  );
}
