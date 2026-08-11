import Link from 'next/link';

import { features } from '@/content/features';
import { useCases } from '@/content/use-cases';
import { site } from '@/lib/site';
import { Logo } from './Logo';
import { StoreButtons } from './StoreButtons';

/**
 * The footer, which is also the site's internal link graph.
 *
 * Every landing page is linked from here, on every page. That is the point of
 * it being this long: internal links are how a crawler discovers pages and how
 * it works out which ones the site considers important, and a page reachable
 * only from the sitemap is treated as an afterthought. A sitemap says "these
 * exist"; links say "these matter".
 *
 * It is a server component with no interactivity, so all of that costs zero
 * JavaScript.
 */
export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-24 border-t border-hairline bg-bg-dark/60">
      <div className="container-page py-14">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2.5">
              <Logo className="h-9 w-9" />
              <span className="text-lg font-semibold text-ink-primary">
                {site.name}
              </span>
            </div>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-ink-secondary">
              A private journal, a meditation timer and somewhere to say the
              thing you cannot say anywhere else. Free, and built by one person
              who needed it.
            </p>

            <StoreButtons className="mt-5" size="small" />

            <div className="mt-5 flex gap-3">
              <a
                href={site.social.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-ink-muted underline-offset-2 hover:text-ink-primary hover:underline"
              >
                Instagram
              </a>
              <a
                href={site.social.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-ink-muted underline-offset-2 hover:text-ink-primary hover:underline"
              >
                WhatsApp community
              </a>
            </div>
          </div>

          <FooterColumn title="Features">
            {features.map((feature) => (
              <FooterLink key={feature.slug} href={`/features/${feature.slug}`}>
                {feature.name}
              </FooterLink>
            ))}
          </FooterColumn>

          <FooterColumn title="Use cases">
            {useCases.map((useCase) => (
              <FooterLink key={useCase.slug} href={`/use-cases/${useCase.slug}`}>
                {useCase.name}
              </FooterLink>
            ))}
          </FooterColumn>

          <FooterColumn title="More">
            <FooterLink href="/download">Download</FooterLink>
            <FooterLink href="/sanctuary">Articles</FooterLink>
            <FooterLink href="/about">About</FooterLink>
            <FooterLink href="/support">Support</FooterLink>
            <FooterLink href="/privacy">Privacy</FooterLink>
            <FooterLink href="/terms">Terms</FooterLink>
            <FooterLink href="/login">Sign in</FooterLink>
          </FooterColumn>
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-hairline pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-ink-muted">
            © {year} {site.name}. Made in India.
          </p>

          {/*
            Not a disclaimer buried in the terms. A health-adjacent app that
            does not say this plainly on every page is one search away from
            somebody in a crisis treating a journalling app as a service that
            will answer.
          */}
          <p className="max-w-md text-xs leading-relaxed text-ink-muted">
            {site.name} is a reflection and support app, not a medical service.
            In an emergency in India, call Tele-MANAS on{' '}
            <span className="text-ink-secondary">14416</span>.
          </p>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h2 className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-ink-muted">
        {title}
      </h2>
      <ul className="space-y-2">{children}</ul>
    </div>
  );
}

function FooterLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <li>
      <Link
        href={href}
        className="text-[13px] text-ink-secondary transition hover:text-ink-primary"
      >
        {children}
      </Link>
    </li>
  );
}
