import Image from "next/image";
import { DownloadSection } from "@/components/PromoSections";
import { pageMetadata } from "@/lib/seo";
export const metadata = pageMetadata({
  title: "A small space for real life",
  description:
    "Why InnenFlow exists: a private journal and a daily pause, without the pressure of a perfect routine.",
  path: "/about",
});
export default function AboutPage() {
  return (
    <>
      <section className="page-hero promo-container">
        <span className="eyebrow">WHY INNENFLOW EXISTS</span>
        <h1>
          Life gets loud.
          <br />
          <em>You deserve some space.</em>
        </h1>
        <p>
          InnenFlow brings together a private journal, a meditation break and a
          record of your own days. A place to reflect without needing to have
          everything figured out.
        </p>
      </section>
      <div className="promo-container about-photo">
        <Image
          src="/images/a-quiet-evening.png"
          alt="AI-generated illustration of a quiet evening spent journaling beside a window"
          width={1536}
          height={1024}
          sizes="100vw"
        />
        <span>Illustrative image created with AI.</span>
      </div>
      <section className="story-section promo-container">
        <span className="eyebrow">A PRACTICE THAT FITS A REAL DAY</span>
        <div>
          <h2>Small is a perfectly good place to start.</h2>
          <p>
            You do not need another demanding routine. You might need one honest
            sentence, a place to put a thought, or a few minutes away from your
            screen.
          </p>
          <p>
            That is the idea behind InnenFlow: useful tools you can return to,
            with room to choose what works for you. Your journal, your pace,
            your own small practice.
          </p>
          <p>
            This website is here to explain the Android app and help you find
            the official download. Your journal and account live in the app.
          </p>
        </div>
      </section>
      <DownloadSection />
    </>
  );
}
