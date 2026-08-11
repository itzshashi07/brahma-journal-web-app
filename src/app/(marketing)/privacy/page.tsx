import type { Metadata } from 'next';

import { LegalDoc } from '@/components/LegalDoc';
import { privacySections, privacySummary } from '@/content/legal';
import { breadcrumbSchema, jsonLdScript, pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'Privacy Policy',
  description:
    'What InnenFlow stores, who can read your journal, how anonymity on the ' +
    'board is enforced, and what account deletion actually removes. No data ' +
    'selling, no ads, no analytics SDKs.',
  path: '/privacy',
});

const trail = [
  { name: 'Home', path: '/' },
  { name: 'Privacy', path: '/privacy' },
];

export default function PrivacyPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLdScript(breadcrumbSchema(trail))}
      />
      <LegalDoc
        title="Privacy Policy"
        summary={privacySummary}
        sections={privacySections}
        trail={trail}
      />
    </>
  );
}
