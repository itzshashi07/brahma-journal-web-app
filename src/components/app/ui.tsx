'use client';

import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import { AlertCircle, Loader2, RefreshCw, X } from 'lucide-react';

import { ApiError } from '@/lib/api';
import type { Option } from '@/content/journal';

/**
 * The small shared pieces of the signed-in app.
 *
 * Kept together because they are each a few lines and each is used by nine
 * screens — a file per component would be nine imports of nine files that
 * always change together.
 */

export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-ink-primary sm:text-2xl">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-1.5 max-w-xl text-[13.5px] leading-relaxed text-ink-secondary">
            {subtitle}
          </p>
        )}
      </div>
      {action}
    </div>
  );
}

export function Card({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={`glass p-5 ${className}`}>{children}</div>;
}

export function Spinner({ label = 'Loading…' }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-2.5 py-16 text-ink-muted">
      <Loader2 className="h-4 w-4 animate-spin" />
      <span className="text-[13px]">{label}</span>
    </div>
  );
}

export function EmptyState({
  title,
  body,
  action,
}: {
  title: string;
  body: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="glass p-10 text-center">
      <h2 className="text-[16px] font-semibold text-ink-primary">{title}</h2>
      <p className="mx-auto mt-2 max-w-sm text-[13.5px] leading-relaxed text-ink-secondary">
        {body}
      </p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

/**
 * The error state.
 *
 * It distinguishes "you are offline" from "the server said no", because the two
 * want different things from the reader: one is worth retrying immediately and
 * the other is not. `ApiError.isOffline` carries that distinction from the
 * client — see `lib/api.ts`.
 */
export function ErrorState({
  error,
  onRetry,
}: {
  error: unknown;
  onRetry?: () => void;
}) {
  const offline = error instanceof ApiError && error.isOffline;
  const message =
    error instanceof Error ? error.message : 'Something went wrong.';

  return (
    <div className="glass flex flex-col items-center gap-4 p-10 text-center">
      <AlertCircle className="h-6 w-6 text-accent" />
      <div>
        <h2 className="text-[15px] font-semibold text-ink-primary">
          {offline ? 'Cannot reach the server' : 'That did not work'}
        </h2>
        <p className="mx-auto mt-1.5 max-w-sm text-[13px] leading-relaxed text-ink-secondary">
          {message}
        </p>
      </div>
      {onRetry && (
        <button type="button" onClick={onRetry} className="btn-ghost !py-2">
          <RefreshCw className="h-3.5 w-3.5" />
          Try again
        </button>
      )}
    </div>
  );
}

/**
 * Load-once-and-refresh, for a screen that reads one endpoint.
 *
 * The React equivalent of `ApiFeed` in the Flutter app: fetch on mount, expose
 * a `reload`, and hold the last good value when a refresh fails. That last part
 * is the one that matters — replacing a loaded list with an error because a
 * background refresh dropped is a worse experience than showing slightly stale
 * data, and it is the mistake the naive version of this hook makes.
 */
export function useApi<T>(
  loader: () => Promise<T>,
  deps: React.DependencyList = []
) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<unknown>(null);
  const [loading, setLoading] = useState(true);

  // eslint-disable-next-line react-hooks/exhaustive-deps -- the caller owns the
  // dependency list; `loader` is recreated on every render by design.
  const run = useCallback(loader, deps);

  const reload = useCallback(async () => {
    try {
      const next = await run();
      setData(next);
      setError(null);
    } catch (err) {
      // Only surface the error when there is nothing on screen already.
      setError((previous: unknown) => (data === null ? err : previous));
    } finally {
      setLoading(false);
    }
  }, [run, data]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    run()
      .then((next) => {
        if (!cancelled) {
          setData(next);
          setError(null);
        }
      })
      .catch((err) => {
        if (!cancelled) setError(err);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [run]);

  return { data, error, loading, reload, setData };
}

/** Wraps the three states every screen has, so no screen forgets one. */
export function AsyncSection<T>({
  state,
  empty,
  children,
}: {
  state: ReturnType<typeof useApi<T>>;
  empty?: React.ReactNode;
  children: (data: T) => React.ReactNode;
}) {
  if (state.loading && state.data === null) return <Spinner />;
  if (state.error && state.data === null) {
    return <ErrorState error={state.error} onRetry={state.reload} />;
  }
  if (state.data === null) return empty ?? null;
  return <>{children(state.data)}</>;
}

export function PrimaryLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link href={href} className="btn-primary !py-2.5 text-[13px]">
      {children}
    </Link>
  );
}

/**
 * A dialog that behaves like the app's bottom sheets.
 *
 * Everything the signed-in app interrupts somebody with goes through here — the
 * welcome, the check-in, the random prompt, the report form — so that they all
 * dismiss the same way and none of them can be dismissed by accident. The
 * backdrop closes only when `dismissible`, which the check-in turns off partway
 * through: losing four answered questions to a stray tap outside the card is the
 * kind of thing somebody does not come back from.
 *
 * The page behind it is frozen while it is open, for the reason spelled out on
 * the drawer in AppShell: on a phone a thumb flick scrolls whatever is
 * underneath, and `position: fixed` rather than `overflow: hidden` because iOS
 * Safari ignores the latter on the scrolling element.
 */
export function Modal({
  open,
  onClose,
  children,
  label,
  dismissible = true,
  wide = false,
}: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  label: string;
  dismissible?: boolean;
  wide?: boolean;
}) {
  const panel = useRef<HTMLDivElement>(null);

  /**
   * `onClose` through a ref.
   *
   * Callers pass an inline arrow, so the prop is a new function on every render.
   * Listing it in the dependency array would tear the scroll lock down and set it
   * up again on each one — restoring the body, scrolling to a captured offset,
   * then re-freezing — which reads as the dialog juddering while you type in it.
   */
  const close = useRef(onClose);
  close.current = onClose;

  useEffect(() => {
    if (!open) return;

    const y = window.scrollY;
    const { style } = document.body;
    const previous = {
      position: style.position,
      top: style.top,
      width: style.width,
      overflow: style.overflow,
    };

    style.position = 'fixed';
    style.top = `-${y}px`;
    style.width = '100%';
    style.overflow = 'hidden';

    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && dismissible) close.current();
    };
    window.addEventListener('keydown', onKey);

    // Focus moves into the card so a keyboard lands inside the dialog rather
    // than on whatever was behind it.
    panel.current?.focus();

    return () => {
      style.position = previous.position;
      style.top = previous.top;
      style.width = previous.width;
      style.overflow = previous.overflow;
      window.scrollTo(0, y);
      window.removeEventListener('keydown', onKey);
    };
  }, [open, dismissible]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center">
      <button
        type="button"
        aria-label={dismissible ? 'Close' : 'Dialog backdrop'}
        onClick={dismissible ? onClose : undefined}
        tabIndex={dismissible ? 0 : -1}
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
      />

      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-label={label}
        tabIndex={-1}
        className={`relative m-3 max-h-[88vh] w-full overflow-y-auto overscroll-contain rounded-lg border border-hairline bg-bg-card p-5 shadow-soft outline-none sm:m-6 ${
          wide ? 'sm:max-w-2xl' : 'sm:max-w-md'
        }`}
      >
        {dismissible && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="absolute right-3 top-3 rounded-md p-1.5 text-ink-muted transition hover:bg-bg-dark/50 hover:text-ink-primary"
          >
            <X className="h-4 w-4" />
          </button>
        )}
        {children}
      </div>
    </div>
  );
}

/**
 * The tap-to-answer row.
 *
 * The journal's whole premise is that most days nobody wants to compose a
 * paragraph — they want to record what happened in twenty seconds. A chip is
 * that, and it is why the same control appears on the journal, the check-in and
 * the random prompt rather than each screen growing its own.
 *
 * `single` clears the rest on selection, and re-tapping the chosen one clears
 * it: there is no way to answer "how is your energy" and then take it back if
 * the only way out is picking a different answer.
 */
export function ChipGroup({
  options,
  selected,
  onChange,
  single = false,
  ariaLabel,
}: {
  options: Option[];
  selected: string[];
  onChange: (next: string[]) => void;
  single?: boolean;
  ariaLabel?: string;
}) {
  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label={ariaLabel}>
      {options.map((option) => {
        const on = selected.includes(option.id);
        return (
          <button
            key={option.id}
            type="button"
            aria-pressed={on}
            onClick={() => {
              if (single) {
                onChange(on ? [] : [option.id]);
                return;
              }
              onChange(
                on
                  ? selected.filter((id) => id !== option.id)
                  : [...selected, option.id]
              );
            }}
            className={`inline-flex items-center gap-1.5 rounded-pill border px-3 py-2 text-[12.5px] transition ${
              on
                ? 'border-primary bg-primary/20 font-semibold text-primary-light'
                : 'border-hairline bg-bg-card/50 text-ink-secondary hover:border-primary/50 hover:text-ink-primary'
            }`}
          >
            <span aria-hidden="true">{option.emoji}</span>
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

/** The same control for answers that are plain strings, as the check-in's are. */
export function TextChipGroup({
  options,
  selected,
  onChange,
  single = false,
  ariaLabel,
}: {
  options: string[];
  selected: string[];
  onChange: (next: string[]) => void;
  single?: boolean;
  ariaLabel?: string;
}) {
  return (
    <ChipGroup
      options={options.map((label) => ({ id: label, label, emoji: '' }))}
      selected={selected}
      onChange={onChange}
      single={single}
      ariaLabel={ariaLabel}
    />
  );
}

/** A small labelled number. Used across the dashboard, insights and profile. */
export function StatTile({
  icon,
  label,
  value,
  hint,
  tone = 'default',
}: {
  icon?: React.ReactNode;
  label: string;
  value: string;
  hint?: string;
  tone?: 'default' | 'accent';
}) {
  return (
    <Card className="!p-4">
      <div className="mb-2 flex items-center gap-2 text-ink-muted">
        {icon && <span className={tone === 'accent' ? 'text-accent' : ''}>{icon}</span>}
        <span className="text-[10.5px] uppercase tracking-wide">{label}</span>
      </div>
      <p className="text-xl font-semibold text-ink-primary sm:text-2xl">
        {value}
        {hint && (
          <span className="ml-1.5 text-[11.5px] font-normal text-ink-muted">
            {hint}
          </span>
        )}
      </p>
    </Card>
  );
}

/** A relative timestamp — "2h ago" reads faster than a date on a feed. */
export function timeAgo(input?: string | null): string {
  if (!input) return '';
  const then = new Date(input).getTime();
  if (Number.isNaN(then)) return '';

  const seconds = Math.floor((Date.now() - then) / 1000);
  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;

  return new Date(input).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}
