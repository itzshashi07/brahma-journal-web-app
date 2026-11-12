import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { moments } from "@/content/moments";
import { DownloadSection } from "@/components/PromoSections";
import { pageMetadata } from "@/lib/seo";
export const metadata = pageMetadata({
  title: "For your very real, very everyday moments",
  description:
    "Exam brain, late-night thoughts, a low social battery, or starting again. Find a small way to journal, pause or focus with InnenFlow for Android.",
  path: "/moments",
});
export default function MomentsPage() {
  return (
    <>
      <section className="page-hero promo-container">
        <span className="eyebrow">SOME DAYS ARE A WHOLE PLOT</span>
        <h1>
          Whatever the scene.
          <br />
          <em>A little room for you.</em>
        </h1>
        <p>
          You don’t have to have the perfect routine to find a useful moment.
          Start with something that sounds like your day.
        </p>
      </section>
      <section className="promo-container moments-grid">
        {moments.map((moment) => (
          <Link
            key={moment.slug}
            href={`/moments/${moment.slug}`}
            className="moment-card"
          >
            <span className="moment-symbol" aria-hidden="true">
              {moment.emoji}
            </span>
            <span className="eyebrow">{moment.label}</span>
            <h2>{moment.headline}</h2>
            <p>{moment.short}</p>
            <span className="text-link">
              Find a place to start <ArrowUpRight size={18} />
            </span>
          </Link>
        ))}
      </section>
      <DownloadSection />
    </>
  );
}
