'use client';

import { useState } from 'react';
import { Flame, Timer } from 'lucide-react';

import {
  AsyncSection,
  Card,
  EmptyState,
  PageHeader,
  useApi,
} from '@/components/app/ui';
import { api, type Paged } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';

/**
 * The leaderboard.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * Every number here was computed by the server
 *
 * There is no endpoint that accepts a leaderboard row, on purpose. The totals
 * are recounted from the entries and sessions a member actually has, in the
 * same process that stores them — because a self-reported score is not a score,
 * and these numbers are compared between people.
 *
 * The row itself carries a display name, an avatar and four integers. No email,
 * no phone, no age, nothing from anybody's journal.
 */

type Row = {
  _id: string;
  firebaseUid: string;
  displayName?: string;
  avatarId?: string | null;
  streak?: number;
  longestStreak?: number;
  totalJournalEntries?: number;
  totalMeditationSeconds?: number;
};

type SortBy = 'totalMeditationSeconds' | 'streak';

export default function CommunityPage() {
  const { user, profile } = useAuth();
  const [sortBy, setSortBy] = useState<SortBy>('streak');

  const state = useApi(
    () =>
      api.get<Paged<Row, 'leaderboard'>>('/api/practice/leaderboard', {
        sortBy,
        limit: 50,
      }),
    [sortBy]
  );

  return (
    <>
      <PageHeader
        title="Community"
        subtitle="Streaks and minutes, recomputed on the server from real records. Nothing here is self-reported."
      />

      <Card className="mb-5 border-primary/25 bg-primary/10">
        <p className="text-[11px] uppercase tracking-wide text-ink-muted">
          Where you are
        </p>
        <div className="mt-2 flex flex-wrap gap-6">
          <div>
            <p className="text-2xl font-semibold text-ink-primary">
              {profile?.streak ?? 0}
            </p>
            <p className="text-[11px] text-ink-muted">day streak</p>
          </div>
          <div>
            <p className="text-2xl font-semibold text-accent">
              {profile?.longestStreak ?? 0}
            </p>
            <p className="text-[11px] text-ink-muted">longest ever</p>
          </div>
          <div>
            <p className="text-2xl font-semibold text-ink-primary">
              {Math.round((profile?.totalMeditationSeconds ?? 0) / 60)}
            </p>
            <p className="text-[11px] text-ink-muted">minutes sat</p>
          </div>
          <div>
            <p className="text-2xl font-semibold text-ink-primary">
              {profile?.totalJournalEntries ?? 0}
            </p>
            <p className="text-[11px] text-ink-muted">entries</p>
          </div>
        </div>
      </Card>

      <div className="mb-4 flex gap-2">
        <SortTab
          active={sortBy === 'streak'}
          onClick={() => setSortBy('streak')}
          icon={<Flame className="h-3.5 w-3.5" />}
          label="By streak"
        />
        <SortTab
          active={sortBy === 'totalMeditationSeconds'}
          onClick={() => setSortBy('totalMeditationSeconds')}
          icon={<Timer className="h-3.5 w-3.5" />}
          label="By minutes"
        />
      </div>

      <AsyncSection state={state}>
        {(data) =>
          data.leaderboard.length === 0 ? (
            <EmptyState
              title="Nobody on the board yet"
              body="Write an entry or sit for five minutes and you will be the first."
            />
          ) : (
            <div className="space-y-1.5">
              {data.leaderboard.map((row, index) => {
                const mine = row.firebaseUid === user?.uid;
                const value =
                  sortBy === 'streak'
                    ? `${row.streak ?? 0} days`
                    : `${Math.round((row.totalMeditationSeconds ?? 0) / 60)} min`;

                return (
                  <div
                    key={row._id}
                    className={`flex items-center gap-3 rounded-md border px-4 py-3 ${
                      mine
                        ? 'border-primary/50 bg-primary/15'
                        : 'border-hairline bg-bg-card/50'
                    }`}
                  >
                    <span
                      className={`w-6 text-[13px] font-semibold ${
                        index < 3 ? 'text-accent' : 'text-ink-muted'
                      }`}
                    >
                      {index + 1}
                    </span>
                    <span className="h-8 w-8 shrink-0 rounded-full bg-gradient-primary" />
                    <span className="min-w-0 flex-1 truncate text-[13.5px] text-ink-secondary">
                      {row.displayName || 'Friend'}
                      {mine && (
                        <span className="ml-2 text-[11px] text-primary-light">
                          you
                        </span>
                      )}
                    </span>
                    <span className="text-[13px] font-semibold tabular-nums text-ink-primary">
                      {value}
                    </span>
                  </div>
                );
              })}
            </div>
          )
        }
      </AsyncSection>

      <p className="mt-8 text-center text-[11.5px] leading-relaxed text-ink-muted">
        How many followers somebody has is public. Who follows whom is not —
        there is deliberately no endpoint anywhere that would answer it.
      </p>
    </>
  );
}

function SortTab({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`inline-flex items-center gap-1.5 rounded-pill px-4 py-2 text-[12.5px] font-medium transition ${
        active
          ? 'bg-gradient-primary text-white'
          : 'border border-hairline text-ink-secondary hover:text-ink-primary'
      }`}
    >
      {icon}
      {label}
    </button>
  );
}
