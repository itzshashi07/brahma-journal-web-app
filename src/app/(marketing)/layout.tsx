import { SiteFooter } from '@/components/SiteFooter';
import { SiteHeader } from '@/components/SiteHeader';

/**
 * The public half of the site.
 *
 * A route group, so `(marketing)` never appears in a URL — `/features/journal`
 * is the real path. It exists to give every public page the header and footer
 * without giving them to the application shell under `/app`, which has its own
 * navigation and would look absurd with a marketing footer under a journal
 * entry.
 *
 * Everything in this group is statically rendered at build time. There is no
 * per-request work: no database, no session, no personalisation. That is what
 * makes these pages arrive in one round trip from the CDN edge, which is most
 * of what "SEO performance" actually means once the content is written.
 */
export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}
