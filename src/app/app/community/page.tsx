'use client';

import { useCallback, useEffect, useState } from 'react';
import { Flame, Timer, UserCheck, UserPlus } from 'lucide-react';

import { Avatar } from '@/components/app/Avatar';
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
 * The leaderboard, and following.
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
 *
 * ─────────────────────────────────────────────────────────────────────────
 * Following, and the two requests that make it cheap
 *
 * The API has had `POST/DELETE /social/follow/:uid` since the beginning and the
 * website never called either, so following somebody was an Android-only
 * feature sitting behind a leaderboard the web could already draw.
 *
 * It is two reads for the whole screen rather than two per row: `/following`
 * returns the uids this member follows (their own list, and only ever their
 * own) and `/follower-counts` returns uid → count in bulk. Fifty rows would
 * otherwise be a hundred round trips for a button state and an integer.
 *
 * The counter moves optimistically and is reconciled from the response, because
 * a follow button that waits on a round trip before changing gets tapped twice.
 *
 * How many followers somebody has is public. Who follows whom is not — there is
 * deliberately no endpoint anywhere that would answer it, including for the
 * person being followed. See routes/social.js.
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

  const [following, setFollowing] = useState<Set<string>>(new Set());
  const [followers, setFollowers] = useState<Record<string, number>>({});
  const [pending, setPending] = useState<Set<string>>(new Set());

  useEffect(() => {
    let cancelled = false;

    // Issued together: neither depends on the other, and the board should not
    // wait for the counters to know which buttons to draw.
    void Promise.allSettled([
      api.get<{ following: string[] }>('/api/social/following'),
      api.get<{ counts: Record<string, number> }>('/api/social/follower-counts', {
        limit: 500,
      }),
    ]).then(([mine, counts]) => {
      if (cancelled) return;
      if (mine.status === 'fulfilled') {
        setFollowing(new Set(mine.value?.following ?? []));
      }
      if (counts.status === 'fulfilled') {
        setFollowers(counts.value?.counts ?? {});
      }
      // A failure on either leaves the buttons in their unfollowed state and
      // the counts absent, which is recoverable by tapping. Blocking the whole
      // board on a social read would not be.
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const toggleFollow = useCallback(
    async (uid: string) => {
      if (pending.has(uid) || uid === user?.uid) return;

      const wasFollowing = following.has(uid);
      setPending((current) => new Set(current).add(uid));

      // Optimistic, both the button and the number under it.
      setFollowing((current) => {
        const next = new Set(current);
        if (wasFollowing) next.delete(uid);
        else next.add(uid);
        return next;
      });
      setFollowers((current) => ({
        ...current,
        [uid]: Math.max(0, (current[uid] ?? 0) + (wasFollowing ? -1 : 1)),
      }));

      try {
        if (wasFollowing) await api.delete(`/api/social/follow/${uid}`);
        else await api.post(`/api/social/follow/${uid}`);
      } catch {
        // Put it back exactly as it was. A button stuck in the wrong state is
        // worse than one that visibly refused.
        setFollowing((current) => {
          const next = new Set(current);
          if (wasFollowing) next.add(uid);
          else next.delete(uid);
          return next;
        });
        setFollowers((current) => ({
          ...current,
          [uid]: Math.max(0, (current[uid] ?? 0) + (wasFollowing ? 1 : -1)),
        }));
      } finally {
        setPending((current) => {
          const next = new Set(current);
          next.delete(uid);
          return next;
        });
      }
    },
    [following, pending, user?.uid]
  );

  return (
    <>
      <PageHeader
        title="Community"
        subtitle="Streaks and minutes, recomputed on the server from real records. Nothing here is self-reported."
      />

      <Card className="mb-5 border-primary/25 bg-primary/10">
        <div className="mb-3 flex items-center gap-3">
          <Avatar
            avatarId={profile?.avatarId}
            name={profile?.name}
            email={user?.email}
            size={40}
            ring
          />
          <div>
            <p className="text-[13.5px] font-semibold text-ink-primary">
              {profile?.name || 'You'}
            </p>
            <p className="text-[11px] text-ink-muted">
              {followers[user?.uid ?? ''] ?? 0} followers ·{' '}
              {following.size} following
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-6">
          <Stat value={profile?.streak ?? 0} label="day streak" />
          <Stat value={profile?.longestStreak ?? 0} label="longest ever" accent />
          <Stat
            value={Math.round((profile?.totalMeditationSeconds ?? 0) / 60)}
            label="minutes sat"
          />
          <Stat value={profile?.totalJournalEntries ?? 0} label="entries" />
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
                const isFollowing = following.has(row.firebaseUid);
                const count = followers[row.firebaseUid] ?? 0;

                return (
                  <div
                    key={row._id}
                    className={`flex items-center gap-3 rounded-md border px-3 py-3 sm:px-4 ${
                      mine
                        ? 'border-primary/50 bg-primary/15'
                        : 'border-hairline bg-bg-card/50'
                    }`}
                  >
                    <span
                      className={`w-5 text-[13px] font-semibold ${
                        index < 3 ? 'text-accent' : 'text-ink-muted'
                      }`}
                    >
                      {index + 1}
                    </span>

                    <Avatar
                      avatarId={row.avatarId}
                      name={row.displayName}
                      size={32}
                    />

                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[13.5px] text-ink-secondary">
                        {row.displayName || 'Friend'}
                        {mine && (
                          <span className="ml-2 text-[11px] text-primary-light">
                            you
                          </span>
                        )}
                      </span>
                      <span className="block text-[11px] text-ink-muted">
                        {value}
                        {count > 0 ? ` · ${count} follower${count === 1 ? '' : 's'}` : ''}
                      </span>
                    </span>

                    {!mine && (
                      <button
                        type="button"
                        onClick={() => toggleFollow(row.firebaseUid)}
                        disabled={pending.has(row.firebaseUid)}
                        aria-pressed={isFollowing}
                        aria-label={
                          isFollowing
                            ? `Unfollow ${row.displayName || 'this member'}`
                            : `Follow ${row.displayName || 'this member'}`
                        }
                        className={`inline-flex shrink-0 items-center gap-1.5 rounded-pill px-3 py-1.5 text-[11.5px] font-semibold transition disabled:opacity-50 ${
                          isFollowing
                            ? 'border border-hairline text-ink-muted hover:border-danger/40 hover:text-red-300'
                            : 'bg-gradient-primary text-white'
                        }`}
                      >
                        {isFollowing ? (
                          <>
                            <UserCheck className="h-3.5 w-3.5" />
                            <span className="hidden sm:inline">Following</span>
                          </>
                        ) : (
                          <>
                            <UserPlus className="h-3.5 w-3.5" />
                            <span className="hidden sm:inline">Follow</span>
                          </>
                        )}
                      </button>
                    )}
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

function Stat({
  value,
  label,
  accent = false,
}: {
  value: number;
  label: string;
  accent?: boolean;
}) {
  return (
    <div>
      <p
        className={`text-2xl font-semibold ${
          accent ? 'text-accent' : 'text-ink-primary'
        }`}
      >
        {value}
      </p>
      <p className="text-[11px] text-ink-muted">{label}</p>
    </div>
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
