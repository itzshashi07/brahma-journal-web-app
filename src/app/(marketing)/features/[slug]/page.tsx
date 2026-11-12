import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { appFeatures } from "@/content/promo";
import { featureStories } from "@/content/feature-stories";
import { DownloadButton } from "@/components/DownloadButton";
import { DownloadSection, FeatureIcon } from "@/components/PromoSections";
import { breadcrumbSchema, jsonLdScript, pageMetadata } from "@/lib/seo";

export const dynamicParams = false;
export function generateStaticParams() {
  return appFeatures.map(({ id }) => ({ slug: id }));
}
async function getFeature(params: Promise<{ slug: string }>) {
  const { slug } = await params;
  const feature = appFeatures.find((item) => item.id === slug);
  if (!feature) notFound();
  return feature;
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const feature = await getFeature(params);
  return pageMetadata({
    title: feature.name,
    description: feature.description,
    path: `/features/${feature.id}`,
  });
}
export default async function FeaturePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const feature = await getFeature(params);
  const story = featureStories[feature.id];
  const next =
    appFeatures[
      (appFeatures.findIndex((item) => item.id === feature.id) + 1) %
        appFeatures.length
    ];
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLdScript(
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Features", path: "/features" },
            { name: feature.name, path: `/features/${feature.id}` },
          ]),
        )}
      />
      <section className="promo-container story-hero">
        <Link href="/features" className="text-link">
          <ArrowLeft size={16} /> All app features
        </Link>
        <div className="story-hero-grid">
          <div>
            <span className="eyebrow">
              <FeatureIcon name={feature.icon} size={18} /> {feature.category}
            </span>
            <h1>{story.headline}</h1>
            <p>{feature.description}</p>
            <DownloadButton />
            <span className="story-platform">
              Available in the Android app · Free to use
            </span>
          </div>
          <aside className="story-note">
            <span>A LITTLE THOUGHT TO TAKE WITH YOU</span>
            <p>“{story.prompt}”</p>
            <span>{story.line}</span>
          </aside>
        </div>
      </section>
      <section className="section-space story-body promo-container">
        <div>
          <span className="eyebrow">{feature.name}</span>
          <h2>A simple place to begin.</h2>
          <ul className="story-benefits">
            {feature.points.map((point) => (
              <li key={point}>
                <Check size={18} />
                {point}
              </li>
            ))}
          </ul>
          <p className="story-context">{story.note}</p>
        </div>
        <ol className="steps-list">
          {story.steps.map((step, i) => (
            <li key={step}>
              <span>0{i + 1}</span>
              <div>
                <p>{step}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>
      <div className="promo-container story-next">
        <Link href={`/features/${next.id}`} className="text-link">
          Explore next: {next.name} <ArrowRight size={18} />
        </Link>
      </div>
      <DownloadSection />
    </>
  );
}
