import Link from "next/link";
import type { LegalSection } from "@/content/legal";
import { legalUpdated } from "@/content/legal";
import { site } from "@/lib/site";
export function LegalDoc({
  title,
  summary,
  sections,
}: {
  title: string;
  summary: string;
  sections: LegalSection[];
  trail?: ReadonlyArray<{ name: string; path: string }>;
}) {
  return (
    <article className="legal-document promo-container">
      <Link href="/" className="text-link">
        ← Back to InnenFlow
      </Link>
      <h1>{title}</h1>
      <span className="legal-date">Last updated {legalUpdated}</span>
      <p className="legal-summary">{summary}</p>
      {sections.map((section) => (
        <section key={section.title}>
          <h2>{section.title}</h2>
          {section.body.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </section>
      ))}
      <section>
        <h2>Questions about your data?</h2>
        <p>
          Email <a href={`mailto:${site.contactEmail}`}>{site.contactEmail}</a>.
          You can also find the Android account-deletion instructions{" "}
          <Link href="/delete-account">here</Link>.
        </p>
      </section>
    </article>
  );
}
