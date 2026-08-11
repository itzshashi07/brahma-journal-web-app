'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { AlertCircle, Loader2, RefreshCw } from 'lucide-react';

import { ApiError } from '@/lib/api';

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
