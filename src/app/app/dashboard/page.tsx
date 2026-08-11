'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import {
  ArrowRight,
  Brain,
  Flame,
  MessagesSquare,
  NotebookPen,
  Sparkles,
} from 'lucide-react';

import { Card, PageHeader, timeAgo } from '@/components/app/ui';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';

/**
 * The dashboard.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * `sync-stats` is fired here, once
 *
 * The Android app does the same on launch: it asks the server to recompute the
 * member's streak and totals from their real records. It has to be a request
 * rather than a client calculation because the streak on the leaderboard is a
 * public ranking, and a self-reported score is not a score.
 *
 * The timezone offset goes with it. A streak is a fact about somebody's own
 * calendar, and this API runs in UTC — without the offset, anyone journalling
 * after midnight in India has the entry filed as yesterday and their streak
 * broken every night.
 *
 * `getTimezoneOffset()` returns minutes *behind* UTC, so IST is -330 and the
 * sign has to be flipped. Getting that backwards is a five-and-a-half-hour bug
 * that only shows up at night, which is precisely when this app is used.
 */
export default function DashboardPage() {
  const { profile, refreshProfile } = useAuth();
  const [thought, setThought] = useState<string | null>(null);

  useEffect(() => {
    const tz = -new Date().getTimezoneOffset();

    api
      .post('/api/profile/me/sync-stats', { tzOffsetMinutes: tz })
      .then(() => refreshProfile())
      .catch(() => {
        // The dashboard still renders with whatever the profile already held.
      });

    api
      .get<{ value?: { text?: string } }>(
        '/api/support/metadata/thought_of_the_day'
      )
      .then((body) => setThought(body?.value?.text ?? null))
      .catch(() => setThought(null));
    // Deliberately once per mount. Re-running on every profile change would
    // loop, because this updates the profile.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const hour = new Date().getHours();
  const greeting =
    hour < 5 ? 'Still up' : hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <>
      <PageHeader
        title={`${greeting}${profile?.name ? `, ${profile.name}` : ''}`}
        subtitle="Five to seven minutes is the whole routine. Start anywhere."
      />

      {thought && (
        <Card className="mb-6 border-primary/25 bg-primary/10">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-accent">
            Thought for today
          </p>
          <p className="mt-2 text-[15px] leading-relaxed text-ink-primary">
            {thought}
          </p>
        </Card>
      )}

      <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat
          icon={<Flame className="h-4 w-4" />}
          label="Current streak"
          value={`${profile?.streak ?? 0}`}
          unit="days"
          tone="accent"
        />
        <Stat
          icon={<Flame className="h-4 w-4" />}
          label="Longest ever"
          value={`${profile?.longestStreak ?? 0}`}
          unit="days"
        />
        <Stat
          icon={<NotebookPen className="h-4 w-4" />}
          label="Entries"
          value={`${profile?.totalJournalEntries ?? 0}`}
          unit="written"
        />
        <Stat
          icon={<Brain className="h-4 w-4" />}
          label="Meditation"
          value={`${Math.round((profile?.totalMeditationSeconds ?? 0) / 60)}`}
          unit="minutes"
        />
      </div>

      <h2 className="mb-3 text-[13px] font-semibold uppercase tracking-wider text-ink-muted">
        The routine
      </h2>

      <div className="mb-8 grid gap-3 sm:grid-cols-3">
        <Action
          href="/app/meditation"
          icon={<Brain className="h-5 w-5" />}
          title="Sit"
          body="Five minutes, paced to the breath."
        />
        <Action
          href="/app/journal"
          icon={<NotebookPen className="h-5 w-5" />}
          title="Write"
          body="Mood, one habit, one line."
        />
        <Action
          href="/app/affirmations"
          icon={<Sparkles className="h-5 w-5" />}
          title="Read"
          body="One of your own affirmations."
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Link href="/app/thoughts" className="glass glass-hover block p-5">
          <span className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-md bg-primary/15 text-primary-light">
            <MessagesSquare className="h-4 w-4" />
          </span>
          <h3 className="text-[15px] font-semibold text-ink-primary">
            Say something anonymously
          </h3>
          <p className="mt-1.5 text-[13px] leading-relaxed text-ink-secondary">
            No name, no handle, no profile behind it. Somebody who has been there
            answers.
          </p>
        </Link>

        <Link href="/app/community" className="glass glass-hover block p-5">
          <span className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-md bg-accent/15 text-accent">
            <Flame className="h-4 w-4" />
          </span>
          <h3 className="text-[15px] font-semibold text-ink-primary">
            See where you are
          </h3>
          <p className="mt-1.5 text-[13px] leading-relaxed text-ink-secondary">
            Streaks and minutes, recomputed from real records rather than
            reported by the app.
          </p>
        </Link>
      </div>

      {profile?.joinedAt && (
        <p className="mt-8 text-center text-[12px] text-ink-muted">
          With InnenFlow since {timeAgo(profile.joinedAt)}.
        </p>
      )}
    </>
  );
}

function Stat({
  icon,
  label,
  value,
  unit,
  tone = 'default',
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  unit: string;
  tone?: 'default' | 'accent';
}) {
  return (
    <Card className="!p-4">
      <div className="mb-2 flex items-center gap-2 text-ink-muted">
        <span className={tone === 'accent' ? 'text-accent' : ''}>{icon}</span>
        <span className="text-[11px] uppercase tracking-wide">{label}</span>
      </div>
      <p className="text-2xl font-semibold text-ink-primary">
        {value}{' '}
        <span className="text-[12px] font-normal text-ink-muted">{unit}</span>
      </p>
    </Card>
  );
}

function Action({
  href,
  icon,
  title,
  body,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <Link href={href} className="glass glass-hover group flex items-center gap-4 p-5">
      <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-gradient-primary text-white">
        {icon}
      </span>
      <div className="min-w-0">
        <p className="flex items-center gap-1 text-[15px] font-semibold text-ink-primary">
          {title}
          <ArrowRight className="h-3.5 w-3.5 text-ink-muted transition-transform group-hover:translate-x-0.5" />
        </p>
        <p className="mt-0.5 text-[12.5px] leading-relaxed text-ink-secondary">
          {body}
        </p>
      </div>
    </Link>
  );
}
