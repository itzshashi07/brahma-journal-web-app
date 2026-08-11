'use client';

import { useMemo, useState } from 'react';

import { PageHeader } from '@/components/app/ui';
import { VerseCard } from '@/components/VerseCard';
import {
  GITA_SITUATIONS,
  GITA_VERSES,
  type GitaSituationKey,
} from '@/content/gita';

/**
 * Wisdom for Real Life, inside the app.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * The one screen the website was missing
 *
 * The Android app has had this section since the beginning and the website did
 * not have it at all, which made "the same product, on the web" untrue in the
 * place people would notice first — it is the feature members describe when
 * they describe the app.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * Why the content is bundled rather than fetched
 *
 * The verses do not change per member and do not change often at all. The app
 * ships them as a Dart constant so the section works on a train with no signal;
 * bundling them here keeps that property, keeps the two clients showing exactly
 * the same words, and costs one request fewer on a screen somebody opens when
 * they are already having a bad night.
 *
 * The public `/wisdom` pages render the same data. This one is filterable and
 * private; those are static, indexed, and exist to be found.
 */

export default function WisdomPage() {
  const [active, setActive] = useState<GitaSituationKey | 'all'>('all');

  const verses = useMemo(
    () =>
      active === 'all'
        ? GITA_VERSES
        : GITA_VERSES.filter((v) => v.situations.includes(active)),
    [active]
  );

  return (
    <>
      <PageHeader
        title="Wisdom for real life"
        subtitle="The Gita, arranged by what is actually happening — not by chapter. Tap a situation."
      />

      {/* The filter row scrolls sideways rather than wrapping into four lines
          on a phone, which is how the app's own chip row behaves. It bleeds to
          the screen edges so the last chip is not clipped by the page gutter —
          a row that appears to end at the margin does not look scrollable. */}
      <div className="-mx-4 mb-6 px-4 sm:mx-0 sm:px-0">
        <div className="shelf pb-1">
          <FilterChip
            label="Everything"
            count={GITA_VERSES.length}
            active={active === 'all'}
            onClick={() => setActive('all')}
          />
          {GITA_SITUATIONS.map((s) => (
            <FilterChip
              key={s.key}
              label={`${s.emoji} ${s.labelEn}`}
              count={GITA_VERSES.filter((v) => v.situations.includes(s.key)).length}
              active={active === s.key}
              onClick={() => setActive(s.key)}
            />
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {verses.map((v) => (
          <VerseCard key={`${v.chapter}.${v.verse}`} verse={v} />
        ))}
      </div>

      <p className="mt-8 text-center text-[12px] text-ink-muted">
        Chapter and verse are given on every entry so you can check any of them
        against a printed edition.
      </p>
    </>
  );
}

function FilterChip({
  label,
  count,
  active,
  onClick,
}: {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`shrink-0 rounded-pill border px-3.5 py-1.5 text-[13px] font-medium transition-colors ${
        active
          ? 'border-primary bg-primary/20 text-ink-primary'
          : 'border-hairline bg-bg-card/60 text-ink-secondary hover:border-primary/50'
      }`}
    >
      {label}
      <span className="ml-1.5 text-[11px] text-ink-muted">{count}</span>
    </button>
  );
}
