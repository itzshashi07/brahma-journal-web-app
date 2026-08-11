import { Suspense } from 'react';
import type { Metadata } from 'next';

import { AuthForm } from '@/components/AuthForm';
import { pageMetadata } from '@/lib/seo';

/**
 * `noIndex` on all three auth routes.
 *
 * They are thin, near-identical pages that would compete with the home page for
 * brand queries while telling a searcher nothing. robots.txt disallows them as
 * well — the meta tag is the belt to that braces, and it is the one that works
 * for a page reached by a link rather than by crawling.
 */
export const metadata: Metadata = pageMetadata({
  title: 'Reset your password',
  description: 'Send yourself a link to set a new InnenFlow password.',
  path: '/forgot-password',
  noIndex: true,
});

export default function Page() {
  /*
    `useSearchParams` — which AuthForm uses to read `?next=` — suspends during
    prerendering. Without this boundary the whole route opts out of static
    generation and Next says so at build time.
  */
  return (
    <Suspense>
      <AuthForm mode="reset" />
    </Suspense>
  );
}
