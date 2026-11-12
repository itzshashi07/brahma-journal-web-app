import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  ChartNoAxesCombined,
  Check,
  Focus,
  MessageCircle,
  NotebookPen,
  ShieldCheck,
  Sparkles,
  Wind,
} from "lucide-react";
import { DownloadButton } from "./DownloadButton";
import { PhonePreview } from "./PhonePreview";
import { appFeatures, faqs, screenPreviews } from "@/content/promo";
import { site } from "@/lib/site";
export function FeatureIcon({
  name,
  size = 24,
}: {
  name: string;
  size?: number;
}) {
  const icons = {
    journal: NotebookPen,
    wind: Wind,
    chart: ChartNoAxesCombined,
    spark: Sparkles,
    message: MessageCircle,
    focus: Focus,
    book: BookOpen,
  };
  const Icon = icons[name as keyof typeof icons] ?? NotebookPen;
  return <Icon size={size} strokeWidth={1.5} aria-hidden="true" />;
}
export function SectionIntro({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="section-intro">
      <span className="eyebrow">{eyebrow}</span>
      <h2>{title}</h2>
      {children && <p>{children}</p>}
    </div>
  );
}
export function FeatureGrid({ full = false }: { full?: boolean }) {
  return (
    <div className="feature-grid">
      {(full ? appFeatures : appFeatures.slice(0, 6)).map((feature, i) => (
        <article className="feature-tile" id={feature.id} key={feature.id}>
          <div className="feature-tile-top">
            <FeatureIcon name={feature.icon} />
            <span>0{i + 1}</span>
          </div>
          <h3>{feature.name}</h3>
          <p>{feature.description}</p>
          {full && (
            <ul className="feature-points">
              {feature.points.map((point) => (
                <li key={point}>
                  <Check size={15} />
                  {point}
                </li>
              ))}
            </ul>
          )}
        </article>
      ))}
    </div>
  );
}
export function InsideTheApp() {
  return (
    <section className="inside-section" id="inside">
      <div className="promo-container">
        <div className="section-heading-row">
          <SectionIntro
            eyebrow="A LOOK INSIDE"
            title="Small steps. A little more clarity."
          >
            A private place to pause, in the palm of your hand.
          </SectionIntro>
          <span className="preview-badge">
            {site.resetReleased
              ? "Inside the latest Android update"
              : "Preview · Next Android update"}
          </span>
        </div>
        <div className="screens-strip" aria-label="Android app screen previews">
          {screenPreviews.map((screen) => (
            <figure key={screen.src}>
              <PhonePreview
                src={screen.src}
                alt={`InnenFlow Android preview: ${screen.title}`}
              />
              <figcaption>
                <h3>{screen.title}</h3>
                <p>{screen.body}</p>
              </figcaption>
            </figure>
          ))}
        </div>
        <p className="preview-caption">
          {site.resetReleased
            ? "App screens use illustrative entries. Your journal and check-ins will be your own."
            : "These screens preview version 1.8.0, which is not yet published on Google Play. The current Android app is available to download. Example entries are illustrative."}
        </p>
      </div>
    </section>
  );
}
export function HowItWorks() {
  return (
    <section className="section-space" id="how-it-works">
      <div className="promo-container how-layout">
        <SectionIntro
          eyebrow="YOUR PRACTICE, YOUR PACE"
          title="A little space in a very full day."
        >
          You do not have to do everything. Start with the part you need.
        </SectionIntro>
        <ol className="steps-list">
          {[
            [
              "01",
              "Check in with yourself.",
              "Open your journal and choose how you feel. Write a sentence, tap an answer, or say a little more.",
            ],
            [
              "02",
              "Take the pause you need.",
              "A breathing break, a few minutes of meditation, or a thought you wanted to get out of your head.",
            ],
            [
              "03",
              "Come back to your own story.",
              "Look back at your entries and patterns. Missed a day? You can begin again whenever you want.",
            ],
          ].map(([number, title, body]) => (
            <li key={number}>
              <span>{number}</span>
              <div>
                <h3>{title}</h3>
                <p>{body}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
export function QuietMoment() {
  return (
    <section className="quiet-section">
      <div className="promo-container quiet-layout">
        <figure className="quiet-photo">
          <Image
            src="/images/a-quiet-evening.png"
            alt="AI-generated editorial illustration of a young adult writing in a notebook beside a window at dusk"
            width={1536}
            height={1024}
            sizes="(max-width: 800px) 100vw, 55vw"
          />
          <figcaption>Illustrative image created with AI.</figcaption>
        </figure>
        <div className="quiet-copy">
          <span className="eyebrow">FOR REAL LIFE, NOT A PERFECT ROUTINE</span>
          <h2>You do not need a perfect day to make a little space.</h2>
          <p>
            Some days, you will have a lot to say. On others, showing up for a
            quick check-in is enough. InnenFlow makes room for both.
          </p>
          <Link href="/about" className="text-link">
            Why we built InnenFlow <ArrowRight size={17} />
          </Link>
        </div>
      </div>
    </section>
  );
}
export function PrivacyStrip() {
  return (
    <section className="privacy-strip">
      <div className="promo-container">
        <ShieldCheck size={34} strokeWidth={1.4} />
        <div>
          <h2>Your words deserve their own space.</h2>
          <p>
            Your journal is separate from public posts. Sharing on the Open
            Board is always your choice.
          </p>
        </div>
        <Link href="/privacy" className="text-link">
          Our approach to privacy <ArrowRight size={16} />
        </Link>
      </div>
    </section>
  );
}
export function Questions() {
  return (
    <section className="section-space faq-section" id="questions">
      <div className="promo-container faq-layout">
        <SectionIntro
          eyebrow="A FEW THINGS YOU MIGHT WONDER"
          title="Before you make yourself at home."
        >
          The short, honest answers. For anything else, we are an email away.
        </SectionIntro>
        <div className="faq-list">
          {faqs.map(({ q, a }) => (
            <details key={q}>
              <summary>
                {q}
                <span aria-hidden="true">+</span>
              </summary>
              <p>{a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
export function DownloadSection() {
  return (
    <section className="download-section" id="download">
      <div className="promo-container download-layout">
        <div>
          <span className="eyebrow">A SMALL PLACE TO START</span>
          <h2>
            Your day is full.
            <br />
            <em>Make a little room for you.</em>
          </h2>
          <p>
            Take your journal, your breathing break and your own small practice
            with you.
          </p>
          <DownloadButton />
          <span className="download-footnote">
            Free to use · Available for Android
          </span>
        </div>
        <div className="download-note">
          <span className="note-arc" aria-hidden="true">
            ↗
          </span>
          <p>
            One honest thought.
            <br />
            One moment to pause.
            <br />A little more space.
          </p>
          <span>InnenFlow</span>
        </div>
      </div>
    </section>
  );
}
