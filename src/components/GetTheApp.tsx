'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Bell, Smartphone, X } from 'lucide-react';

import { site } from '@/lib/site';

/**
 * "This is better on the phone" — said once, where it is true, and dismissible.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * What the app has that a browser cannot
 *
 * Not a marketing line: three concrete things, and they are the ones worth
 * naming because they are the ones a website genuinely cannot do.
 *
 *   • **It can reach you.** The web app knows about a counsellor's reply when
 *     you next open the tab. The phone is told, through FCM, while it is
 *     closed — which for a reply to somebody in trouble is the whole feature.
 *   • **It works without a signal.** 366 thoughts, the Gita, every meditation
 *     and the games ship inside the binary.
 *   • **It is one tap away.** A journal you have to type a URL to reach is a
 *     journal that gets written in for a fortnight.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * Where the link points, and the one place to change it
 *
 * `site.store.android.url` — the Play Store URL built from the package id. The
 * listing is not published yet, so today that link is a placeholder: it resolves
 * to Play's "item not found" page. When the app goes live the id is already
 * right and nothing here needs touching; if the published id differs, change
 * that one constant in `lib/site.ts` and every one of these follows.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * Dismissal is remembered, and is not the same as refusal
 *
 * `localStorage`, not a cookie and not a profile field: it is a fact about this
 * browser, and somebody who dismisses it on their laptop has said nothing about
 * their phone. It comes back after thirty days, because "not now" while
 * standing at a bus stop is a different answer from "never".
 */

const DISMISS_KEY = 'innenflow.get-the-app.dismissed-at';
const SNOOZE_DAYS = 30;

export function useAppNudgeDismissal() {
  const [dismissed, setDismissed] = useState<boolean | null>(null);

  useEffect(() => {
    try {
      const at = Number(window.localStorage.getItem(DISMISS_KEY) ?? 0);
      const days = (Date.now() - at) / 86_400_000;
      setDismissed(Boolean(at) && days < SNOOZE_DAYS);
    } catch {
      // Private mode, or storage disabled. Showing it is the safe default.
      setDismissed(false);
    }
  }, []);

  function dismiss() {
    setDismissed(true);
    try {
      window.localStorage.setItem(DISMISS_KEY, String(Date.now()));
    } catch {
      // It stays gone for this page view either way.
    }
  }

  return { dismissed, dismiss };
}

/**
 * The banner inside the signed-in app.
 *
 * Renders nothing until the dismissal has been read, rather than flashing and
 * disappearing — `localStorage` is not available during the server render, so a
 * banner drawn optimistically is one that appears for a frame on every load for
 * somebody who has already said no.
 */
export function GetTheAppBanner({ name }: { name?: string | null }) {
  const { dismissed, dismiss } = useAppNudgeDismissal();
  if (dismissed !== false) return null;

  return (
    <div className="glass relative mb-6 overflow-hidden border-primary/25 p-5">
      <button
        type="button"
        onClick={dismiss}
        aria-label="Not now"
        className="absolute right-3 top-3 rounded-md p-1.5 text-ink-muted transition hover:text-ink-primary"
      >
        <X className="h-4 w-4" />
      </button>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary-light">
          <Smartphone className="h-5 w-5" />
        </span>

        <div className="min-w-0 flex-1">
          <p className="text-[15px] font-semibold text-ink-primary">
            {name ? `${name}, this` : 'This'} works better on your phone
          </p>
          <p className="mt-1 max-w-xl text-[13px] leading-relaxed text-ink-secondary">
            Same account, same entries — nothing to move across. The app adds the
            three things a browser cannot: it tells you when a counsellor
            replies even while it is closed, it works with no signal, and it is
            one tap from your home screen instead of a URL you have to remember.
          </p>
        </div>

        <div className="flex shrink-0 flex-wrap gap-2">
          <StoreLink />
          <Link href="/download" className="btn-ghost !py-2.5 text-[13px]">
            What it does
          </Link>
        </div>
      </div>
    </div>
  );
}

/**
 * The line on the sign-in and sign-up screens.
 *
 * Deliberately quieter than the banner: somebody in the middle of signing in is
 * doing a thing, and a card that competes with the password field costs the
 * sign-in to win an install. It sits under the form, where "what now" is the
 * next question anyway.
 */
export function GetTheAppNote() {
  return (
    <div className="mt-6 rounded-lg border border-hairline bg-bg-card/40 p-4">
      <p className="flex items-center gap-2 text-[13px] font-semibold text-ink-primary">
        <Bell className="h-3.5 w-3.5 text-primary-light" />
        Signing in on your phone instead?
      </p>
      <p className="mt-1.5 text-[12.5px] leading-relaxed text-ink-secondary">
        The Android app is the same account and the same journal, and it can
        reach you when something happens — a reply, a streak about to break —
        while the browser only finds out when you open the tab.
      </p>
      <div className="mt-3">
        <StoreLink small />
      </div>
    </div>
  );
}

/**
 * The link itself.
 *
 * A plain anchor rather than `next/link`: it leaves the site, and `target`
 * carries `rel="noreferrer"` because a tab opened with `window.opener` intact
 * can navigate the one it came from.
 */
export function StoreLink({ small = false }: { small?: boolean }) {
  return (
    <a
      href={site.store.android.url}
      target="_blank"
      rel="noreferrer"
      className={`btn-primary ${small ? '!px-4 !py-2 text-[12.5px]' : '!py-2.5 text-[13px]'}`}
    >
      <Smartphone className={small ? 'h-3.5 w-3.5' : 'h-4 w-4'} />
      Get it on Android
    </a>
  );
}
