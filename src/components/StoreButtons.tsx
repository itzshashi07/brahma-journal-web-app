import { site } from '@/lib/site';

/**
 * The two install buttons, and the honest state of each.
 *
 * The iOS one is not a link. It says "coming soon" and it is not clickable,
 * because a button that looks like a button and does nothing is worse than no
 * button — the person taps it, nothing happens, and they conclude the site is
 * broken. A disabled control that says why is a smaller disappointment than a
 * dead link to Apple's 404 page.
 *
 * `rel="noopener"` on the Play Store link: the tab it opens gets no reference
 * back to this window.
 */
export function StoreButtons({
  className = '',
  size = 'default',
}: {
  className?: string;
  size?: 'default' | 'small';
}) {
  const pad = size === 'small' ? 'px-4 py-2.5' : 'px-5 py-3';
  const primaryText = size === 'small' ? 'text-[13px]' : 'text-sm';
  const captionText = size === 'small' ? 'text-[9px]' : 'text-[10px]';

  return (
    <div className={`flex flex-wrap items-stretch gap-3 ${className}`}>
      <a
        href={site.store.android.url}
        target="_blank"
        rel="noopener noreferrer"
        className={`group inline-flex items-center gap-3 rounded-md bg-gradient-primary ${pad} text-white shadow-glow transition hover:brightness-110 active:scale-[0.98]`}
      >
        <PlayIcon />
        <span className="text-left leading-tight">
          <span className={`block ${captionText} opacity-80`}>Get it on</span>
          <span className={`block ${primaryText} font-semibold`}>
            Google Play
          </span>
        </span>
      </a>

      <div
        className={`inline-flex cursor-not-allowed items-center gap-3 rounded-md border border-hairline bg-bg-card/50 ${pad} text-ink-muted`}
        aria-disabled="true"
        title="The iOS app is not out yet."
      >
        <AppleIcon />
        <span className="text-left leading-tight">
          <span className={`block ${captionText} opacity-80`}>iOS</span>
          <span className={`block ${primaryText} font-semibold`}>
            Coming soon
          </span>
        </span>
      </div>
    </div>
  );
}

function PlayIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-6 w-6 shrink-0"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M3.6 1.8a1 1 0 0 0-.6.9v18.6a1 1 0 0 0 .6.9l10-10.2-10-10.2Zm11.4 8.8 2.9-3-9.9-5.7 7 8.7Zm0 2.8-7 8.7 9.9-5.7-2.9-3Zm5.6-2.3-2.6-1.5-3.1 3.2 3.1 3.2 2.6-1.5a1.6 1.6 0 0 0 0-3.4Z" />
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-6 w-6 shrink-0"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M16.4 12.7c0-2.3 1.9-3.4 2-3.5-1.1-1.6-2.8-1.8-3.4-1.8-1.4-.1-2.8.9-3.5.9-.7 0-1.8-.9-3-.8-1.5 0-2.9.9-3.7 2.3-1.6 2.7-.4 6.8 1.1 9 .8 1.1 1.7 2.3 2.9 2.2 1.2 0 1.6-.7 3-.7s1.8.7 3 .7c1.3 0 2.1-1.1 2.8-2.2.9-1.3 1.3-2.5 1.3-2.6 0 0-2.5-1-2.5-3.5ZM14.2 5.5c.6-.8 1-1.9.9-3-.9 0-2 .6-2.7 1.4-.6.7-1.1 1.8-.9 2.9 1 .1 2-.5 2.7-1.3Z" />
    </svg>
  );
}
