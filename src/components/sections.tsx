import Link from 'next/link';
import { Check, ChevronRight } from 'lucide-react';

import { Icon } from './Icon';
import { StoreButtons } from './StoreButtons';
import type { Faq } from '@/content/features';
import { site } from '@/lib/site';

/**
 * The pieces every landing page is assembled from.
 *
 * Server components with no `use client` — the marketing site ships essentially
 * no JavaScript for its content, which is most of why it is fast. The one
 * interactive element on these pages is the FAQ, and it uses `<details>` rather
 * than React state for exactly that reason.
 */

export function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-accent">
      {children}
    </p>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  centered = false,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  centered?: boolean;
}) {
  return (
    <div className={centered ? 'mx-auto max-w-2xl text-center' : 'max-w-2xl'}>
      {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
      <h2 className="text-2xl font-semibold tracking-tight text-ink-primary sm:text-3xl">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-3 text-[15px] leading-relaxed text-ink-secondary">
          {subtitle}
        </p>
      )}
    </div>
  );
}

/** The numbered "how it works" list, shared by feature and use-case pages. */
export function Steps({
  steps,
}: {
  steps: ReadonlyArray<{ title: string; body: string }>;
}) {
  return (
    <ol className="grid gap-4 sm:grid-cols-2">
      {steps.map((step, index) => (
        <li key={step.title} className="glass p-5">
          <span className="mb-3 inline-flex h-8 w-8 items-center justify-center rounded-full bg-gradient-primary text-sm font-semibold text-white">
            {index + 1}
          </span>
          <h3 className="mb-1.5 text-[15px] font-semibold text-ink-primary">
            {step.title}
          </h3>
          <p className="text-[13px] leading-relaxed text-ink-secondary">
            {step.body}
          </p>
        </li>
      ))}
    </ol>
  );
}

export function CheckList({ items }: { items: readonly string[] }) {
  return (
    <ul className="grid gap-2.5 sm:grid-cols-2">
      {items.map((item) => (
        <li key={item} className="flex items-start gap-2.5">
          <Check
            className="mt-0.5 h-4 w-4 shrink-0 text-success"
            aria-hidden="true"
          />
          <span className="text-[13px] leading-relaxed text-ink-secondary">
            {item}
          </span>
        </li>
      ))}
    </ul>
  );
}

/**
 * The FAQ.
 *
 * `<details>`/`<summary>` rather than a React accordion. The content is in the
 * DOM whether open or closed, so it is indexed and it matches the FAQPage
 * structured data emitted alongside it — marking up an answer that a crawler
 * cannot see is the specific thing the rich-results guidelines prohibit. It
 * also works with JavaScript disabled and costs nothing to ship.
 */
export function FaqList({ faqs }: { faqs: readonly Faq[] }) {
  return (
    <div className="divide-y divide-hairline overflow-hidden rounded-lg border border-hairline bg-bg-card/40">
      {faqs.map((faq) => (
        <details key={faq.q} className="group">
          <summary className="flex cursor-pointer list-none items-center gap-3 px-5 py-4 text-[14px] font-medium text-ink-primary transition hover:bg-bg-card/60">
            <ChevronRight
              className="h-4 w-4 shrink-0 text-ink-muted transition-transform group-open:rotate-90"
              aria-hidden="true"
            />
            {faq.q}
          </summary>
          <div className="px-5 pb-4 pl-12 text-[13px] leading-relaxed text-ink-secondary">
            {faq.a}
          </div>
        </details>
      ))}
    </div>
  );
}

/** A card in a feature or use-case grid. */
export function LinkCard({
  href,
  icon,
  title,
  blurb,
}: {
  href: string;
  icon: string;
  title: string;
  blurb: string;
}) {
  return (
    <Link href={href} className="glass glass-hover group block p-5">
      <span className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-md bg-primary/15 text-primary-light">
        <Icon name={icon} className="h-5 w-5" />
      </span>
      <h3 className="mb-1.5 flex items-center gap-1 text-[15px] font-semibold text-ink-primary">
        {title}
        <ChevronRight className="h-4 w-4 text-ink-muted transition-transform group-hover:translate-x-0.5" />
      </h3>
      <p className="text-[13px] leading-relaxed text-ink-secondary">{blurb}</p>
    </Link>
  );
}

/**
 * The crisis note on use-case pages that warrant one.
 *
 * Visually distinct from the marketing copy around it, and deliberately not
 * dismissible. Somebody skimming a page about not sleeping should be able to
 * find a real number without reading the terms.
 */
export function CrisisNote({ text }: { text: string }) {
  return (
    <aside
      role="note"
      className="rounded-lg border border-accent/30 bg-accent/10 p-5"
    >
      <p className="mb-1 text-[12px] font-semibold uppercase tracking-wide text-accent">
        If this is urgent
      </p>
      <p className="text-[13px] leading-relaxed text-ink-secondary">{text}</p>
    </aside>
  );
}

/**
 * The closing call to action.
 *
 * Two routes out on purpose. "Start free in your browser" is the one that
 * converts a desktop reader who is not going to stop and install anything, and
 * it is deliberately first — the website is the whole app, so sending that
 * reader to a Play Store page instead is throwing them away.
 */
export function CallToAction({
  title = 'Start tonight, in the browser you already have open',
  body = 'Everything the Android app does works here, on the same account. No card, no trial, nothing to install unless you want to.',
}: {
  title?: string;
  body?: string;
}) {
  return (
    <section className="container-page">
      <div className="glass relative overflow-hidden p-8 text-center sm:p-12">
        <div
          className="absolute -top-24 left-1/2 h-56 w-56 -translate-x-1/2 rounded-full bg-primary/25 blur-3xl"
          aria-hidden="true"
        />
        <div className="relative">
          <h2 className="mx-auto max-w-xl text-2xl font-semibold tracking-tight text-ink-primary sm:text-3xl">
            {title}
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-[15px] leading-relaxed text-ink-secondary">
            {body}
          </p>

          <div className="mt-7 flex flex-col items-center gap-4">
            <div className="flex flex-wrap justify-center gap-3">
              <Link href="/signup" className="btn-primary">
                Start free — no card
              </Link>
              <Link href="/features" className="btn-ghost">
                See everything it does
              </Link>
            </div>

            <p className="text-[11px] uppercase tracking-wider text-ink-muted">
              or install it
            </p>
            <StoreButtons className="justify-center" size="small" />
          </div>
        </div>
      </div>
    </section>
  );
}

/** The four claims that answer "why should I trust this with my journal". */
export function TrustStrip() {
  const points = [
    {
      icon: 'ShieldCheck',
      title: 'Private by construction',
      body: 'Every query for your data is scoped to your account inside the database, so a bug returns nothing rather than returning somebody else’s.',
    },
    {
      icon: 'MessagesSquare',
      title: 'Anonymous means anonymous',
      body: 'Authorship on the board lives in a separate collection no member account can read. It cannot be joined against the member list.',
    },
    {
      icon: 'Sparkles',
      title: 'Free, with no trial',
      body: 'The journal, the meditation timer, the board and the games have no paid tier. There is nothing to cancel.',
    },
    {
      icon: 'Trophy',
      title: 'Numbers you cannot fake',
      body: 'Streaks and totals are recomputed on the server from real records. A self-reported score is not a score.',
    },
  ];

  return (
    <section className="container-page">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {points.map((point) => (
          <div key={point.title} className="glass p-5">
            <span className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-md bg-accent/15 text-accent">
              <Icon name={point.icon} className="h-4.5 w-4.5" />
            </span>
            <h3 className="mb-1.5 text-[14px] font-semibold text-ink-primary">
              {point.title}
            </h3>
            <p className="text-[12.5px] leading-relaxed text-ink-secondary">
              {point.body}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

/** Breadcrumb trail. Mirrors the BreadcrumbList JSON-LD on the same page. */
export function Breadcrumbs({
  trail,
}: {
  trail: ReadonlyArray<{ name: string; path: string }>;
}) {
  return (
    <nav aria-label="Breadcrumb" className="mb-6">
      <ol className="flex flex-wrap items-center gap-1.5 text-[12px] text-ink-muted">
        {trail.map((crumb, index) => (
          <li key={crumb.path} className="flex items-center gap-1.5">
            {index > 0 && <span aria-hidden="true">/</span>}
            {index === trail.length - 1 ? (
              <span className="text-ink-secondary">{crumb.name}</span>
            ) : (
              <Link href={crumb.path} className="transition hover:text-ink-secondary">
                {crumb.name}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function AppNote() {
  return (
    <p className="text-[12px] leading-relaxed text-ink-muted">
      Also on Android — everything here works the same on{' '}
      <a
        href={site.store.android.url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-primary-light underline underline-offset-2"
      >
        Google Play
      </a>
      . The iOS app is not out yet.
    </p>
  );
}
