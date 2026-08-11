import type { Metadata } from 'next';

import { LegalDoc } from '@/components/LegalDoc';
import { termsSections, termsSummary } from '@/content/legal';
import { breadcrumbSchema, jsonLdScript, pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'Terms of Service',
  description:
    'What InnenFlow is and is not, the rules for anything other members can ' +
    'see, how reporting and moderation work, and what happens to your writing.',
  path: '/terms',
});

const trail = [
  { name: 'Home', path: '/' },
  { name: 'Terms', path: '/terms' },
];

export default function TermsPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLdScript(breadcrumbSchema(trail))}
      />
      <LegalDoc
        title="Terms of Service"
        summary={termsSummary}
        sections={termsSections}
        trail={trail}
      />
    </>
  );
}
