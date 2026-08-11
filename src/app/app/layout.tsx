import type { Metadata } from 'next';

import { AppShell } from '@/components/app/AppShell';

/**
 * Everything behind sign-in.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * Why this half is client-rendered and the marketing half is not
 *
 * The API authorises by a Firebase ID token held in the browser. A React Server
 * Component has no access to it, so server-rendering these pages would mean
 * either shipping the token to this server on every navigation or maintaining a
 * session cookie the app does not have — both of which put a copy of somebody's
 * credential somewhere it did not need to be.
 *
 * There is also nothing to gain. These pages are private, personalised and
 * excluded from indexing; server rendering buys speed on a first paint that is
 * already behind an auth check.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * `noindex` on the whole subtree
 *
 * Inherited by every page under `/app`, so a new screen added later is private
 * by default rather than private if somebody remembered. robots.txt disallows
 * the path as well; this is what covers a page reached by a shared link, which
 * robots.txt does not.
 */
export const metadata: Metadata = {
  robots: { index: false, follow: false, nocache: true },
  title: { default: 'App', template: '%s · InnenFlow' },
};

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
