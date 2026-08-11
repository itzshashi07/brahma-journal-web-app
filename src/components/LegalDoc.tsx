import { Breadcrumbs } from './sections';
import type { LegalSection } from '@/content/legal';
import { legalUpdated } from '@/content/legal';
import { site } from '@/lib/site';

/**
 * The shared shape of the privacy policy and the terms.
 *
 * Both are long documents with the same structure — a plain-language summary
 * first, then numbered sections — so they share a renderer. The summary box is
 * not decoration: it is the only part most people read, and burying the honest
 * version of "we do not sell your data" under eleven headings is a choice about
 * whether you want it read.
 */
export function LegalDoc({
  title,
  summary,
  sections,
  trail,
}: {
  title: string;
  summary: string;
  sections: LegalSection[];
  trail: ReadonlyArray<{ name: string; path: string }>;
}) {
  return (
    <div className="container-prose pb-16 pt-10 sm:pt-14">
      <Breadcrumbs trail={trail} />

      <h1 className="text-3xl font-semibold tracking-tight text-ink-primary sm:text-4xl">
        {title}
      </h1>
      <p className="mt-2 text-[13px] text-ink-muted">
        Last updated {legalUpdated}
      </p>

      <div className="mt-7 rounded-lg border border-primary/25 bg-primary/10 p-5">
        <p className="text-[14px] font-medium leading-relaxed text-ink-primary">
          {summary}
        </p>
      </div>

      <div className="mt-10 space-y-9">
        {sections.map((section) => (
          <section key={section.title}>
            <h2 className="mb-2.5 text-[17px] font-semibold text-ink-primary">
              {section.title}
            </h2>
            <div className="space-y-3">
              {section.body.map((paragraph) => (
                <p
                  key={paragraph}
                  className="text-[14px] leading-[1.75] text-ink-secondary"
                >
                  {paragraph}
                </p>
              ))}
            </div>
          </section>
        ))}
      </div>

      <div className="mt-12 border-t border-hairline pt-7">
        <h2 className="text-[15px] font-semibold text-ink-primary">
          Questions, or want your data deleted?
        </h2>
        <p className="mt-2 text-[13.5px] leading-relaxed text-ink-secondary">
          Write to{' '}
          <a
            href={`mailto:${site.contactEmail}`}
            className="text-primary-light underline underline-offset-2"
          >
            {site.contactEmail}
          </a>
          . You can delete your account yourself from inside the app at any
          time — it runs server-side across every collection your account
          touches. Requests made by email are completed within 30 days.
        </p>
      </div>
    </div>
  );
}
