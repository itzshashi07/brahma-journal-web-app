'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Menu, X } from 'lucide-react';

import { useAuth } from '@/lib/auth-context';
import { site } from '@/lib/site';
import { features } from '@/content/features';
import { useCases } from '@/content/use-cases';
import { Logo } from './Logo';

/**
 * The marketing header.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * Every navigation link is a real `<Link>`, on purpose
 *
 * The feature and use-case menus are rendered as anchors in the markup rather
 * than being built by JavaScript on hover. A crawler follows anchors; it does
 * not open dropdowns. Seventeen landing pages linked only from a client-side
 * menu are seventeen pages discovered by the sitemap alone and treated as
 * orphans — internal links from a real navigation are a large part of what
 * tells a search engine which pages matter.
 *
 * The dropdown hides them visually. It does not remove them from the document.
 */

const primaryNav = [
  { href: '/features', label: 'Features' },
  { href: '/use-cases', label: 'Use cases' },
  { href: '/sanctuary', label: 'Articles' },
  { href: '/download', label: 'Download' },
];

export function SiteHeader() {
  const pathname = usePathname();
  const { user, loading } = useAuth();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // A route change with the menu still open leaves it covering the new page.
  useEffect(() => setOpen(false), [pathname]);

  return (
    <header
      className={`sticky top-0 z-50 transition-colors duration-300 ${
        scrolled
          ? 'border-b border-hairline bg-bg-dark/85 backdrop-blur-xl'
          : 'bg-transparent'
      }`}
    >
      <div className="container-page flex h-16 items-center gap-6">
        <Link href="/" className="flex items-center gap-2.5" aria-label={site.name}>
          <Logo className="h-8 w-8" />
          <span className="text-base font-semibold tracking-tight text-ink-primary">
            {site.name}
          </span>
        </Link>

        <nav
          className="ml-auto hidden items-center gap-1 lg:flex"
          aria-label="Main"
        >
          <MegaMenu
            label="Features"
            href="/features"
            items={features.map((feature) => ({
              href: `/features/${feature.slug}`,
              label: feature.name,
              blurb: feature.standfirst,
            }))}
          />
          <MegaMenu
            label="Use cases"
            href="/use-cases"
            items={useCases.map((useCase) => ({
              href: `/use-cases/${useCase.slug}`,
              label: useCase.name,
              blurb: useCase.standfirst,
            }))}
          />
          {primaryNav.slice(2).map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-pill px-3 py-2 text-sm text-ink-secondary transition hover:text-ink-primary"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2 lg:ml-0">
          {/* `loading` avoids the flash where a signed-in member is briefly
              shown "Sign in" before the auth state resolves. */}
          {!loading && user ? (
            <Link href="/app/dashboard" className="btn-primary !px-5 !py-2 text-[13px]">
              Open app
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="hidden rounded-pill px-3 py-2 text-sm text-ink-secondary transition hover:text-ink-primary sm:block"
              >
                Sign in
              </Link>
              <Link href="/signup" className="btn-primary !px-5 !py-2 text-[13px]">
                Start free
              </Link>
            </>
          )}

          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            className="rounded-md border border-hairline p-2 text-ink-secondary lg:hidden"
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-hairline bg-bg-dark/95 backdrop-blur-xl lg:hidden">
          <nav className="container-page grid gap-1 py-4" aria-label="Mobile">
            {primaryNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-md px-3 py-2.5 text-sm text-ink-secondary hover:bg-bg-card hover:text-ink-primary"
              >
                {item.label}
              </Link>
            ))}

            <p className="px-3 pb-1 pt-4 text-[10px] uppercase tracking-wider text-ink-muted">
              Features
            </p>
            {features.map((feature) => (
              <Link
                key={feature.slug}
                href={`/features/${feature.slug}`}
                className="rounded-md px-3 py-2 text-[13px] text-ink-secondary hover:bg-bg-card hover:text-ink-primary"
              >
                {feature.name}
              </Link>
            ))}

            <p className="px-3 pb-1 pt-4 text-[10px] uppercase tracking-wider text-ink-muted">
              Use cases
            </p>
            {useCases.map((useCase) => (
              <Link
                key={useCase.slug}
                href={`/use-cases/${useCase.slug}`}
                className="rounded-md px-3 py-2 text-[13px] text-ink-secondary hover:bg-bg-card hover:text-ink-primary"
              >
                {useCase.name}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}

type MenuItem = { href: string; label: string; blurb: string };

/**
 * A hover menu whose contents are always in the DOM.
 *
 * `invisible`/`opacity-0` rather than conditional rendering — see the note at
 * the top of the file. Also opens on focus, so it is reachable from a keyboard
 * rather than being a pointer-only navigation.
 */
function MegaMenu({
  label,
  href,
  items,
}: {
  label: string;
  href: string;
  items: MenuItem[];
}) {
  return (
    <div className="group relative">
      <Link
        href={href}
        className="inline-flex items-center rounded-pill px-3 py-2 text-sm text-ink-secondary transition hover:text-ink-primary"
      >
        {label}
      </Link>

      <div className="invisible absolute left-0 top-full z-50 w-[560px] translate-y-1 pt-2 opacity-0 transition-all duration-150 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100">
        <div className="glass grid grid-cols-2 gap-1 p-2 shadow-soft">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-md p-2.5 transition hover:bg-bg-card"
            >
              <span className="block text-[13px] font-medium text-ink-primary">
                {item.label}
              </span>
              <span className="mt-0.5 line-clamp-2 block text-[11px] leading-snug text-ink-muted">
                {item.blurb}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
