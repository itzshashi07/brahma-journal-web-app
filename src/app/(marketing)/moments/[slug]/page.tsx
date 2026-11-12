import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { moments } from "@/content/moments";
import { appFeatures } from "@/content/promo";
import { DownloadButton } from "@/components/DownloadButton";
import { DownloadSection } from "@/components/PromoSections";
import { breadcrumbSchema, jsonLdScript, pageMetadata } from "@/lib/seo";
export const dynamicParams = false;
export function generateStaticParams() {
  return moments.map(({ slug }) => ({ slug }));
}
async function getMoment(params: Promise<{ slug: string }>) {
  const { slug } = await params;
  const moment = moments.find((item) => item.slug === slug);
  if (!moment) notFound();
  return moment;
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const moment = await getMoment(params);
  return pageMetadata({
    title: moment.headline,
    description: moment.description,
    path: `/moments/${moment.slug}`,
  });
}
export default async function MomentPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const moment = await getMoment(params);
  const feature = appFeatures.find((item) => item.id === moment.feature)!;
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLdScript(
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Moments", path: "/moments" },
            { name: moment.label, path: `/moments/${moment.slug}` },
          ]),
        )}
      />
      <section className="promo-container story-hero">
        <Link href="/moments" className="text-link">
          <ArrowLeft size={16} /> All the moments
        </Link>
        <div className="story-hero-grid">
          <div>
            <span className="eyebrow">{moment.label}</span>
            <h1>{moment.headline}</h1>
            <p>{moment.description}</p>
            <DownloadButton />
            <span className="story-platform">
              Your journal and practice live in the Android app.
            </span>
          </div>
          <aside className="story-note">
            <span>NO PERFECT WORDS NEEDED</span>
            <p>“{moment.prompt}”</p>
            <span>A starter for your own journal. Take it with you.</span>
          </aside>
        </div>
      </section>
      <section className="section-space story-body promo-container">
        <div>
          <span className="eyebrow">KEEP IT SMALL</span>
          <h2>{moment.takeaway}</h2>
          <p className="story-context">{moment.suggestion}</p>
          <Link href={`/features/${feature.id}`} className="text-link">
            Explore: {feature.name} <ArrowRight size={17} />
          </Link>
        </div>
        <ol className="steps-list">
          {moment.steps.map((step, i) => (
            <li key={step}>
              <span>0{i + 1}</span>
              <div>
                <p>{step}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>
      <DownloadSection />
    </>
  );
}
