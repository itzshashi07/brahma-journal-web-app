'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import {
  BookOpen,
  Brain,
  CalendarDays,
  Flame,
  Gamepad2,
  Smile,
  Timer,
  Trophy,
  Users,
} from 'lucide-react';

import { Avatar } from '@/components/app/Avatar';
import {
  AsyncSection,
  Card,
  EmptyState,
  PageHeader,
  StatTile,
  timeAgo,
  useApi,
} from '@/components/app/ui';
import { GAMES, formatScore, formatTrainingTime } from '@/content/games';
import { MOODS, labelFor, CHALLENGES, HABITS, PRACTICES } from '@/content/journal';
import { professionById, isKnownProfession, resolveHabitLabel } from '@/content/professions';
import { api, type Paged } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import {
  WEEKDAY_NAMES,
  consistency,
  craftStatsFrom,
  craftVerdict,
  daysToTarget,
  moodLift,
} from '@/lib/craft-stats';
import { didCraft, localDayKey, type Entry } from '@/lib/entries';

/**
 * Insights.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * What this page was, and what was wrong with it
 *
 * Three numbers and a mood bar chart, drawn from journal entries alone. The
 * Android app's Analytics screen has always shown considerably more, and the
 * gap was not decoration — two whole halves of what a member does here were
 * simply absent from the web:
 *
 * **Game Zone.** Focus time and per-game bests live in `GameScore` and
 * `FocusSession` and were rendered nowhere on this site outside the Focus page
 * itself, so somebody checking their progress saw no trace of it.
 *
 * **Where they stand.** Streak, minutes sat and follower count are the numbers
 * this product is compared on, and the only page that showed any of them was
 * Community — a different screen, reached from a different tab.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * Six reads, issued together
 *
 * They are independent, and running them in sequence made the screen spin for
 * as long as the slowest plus the other five. `Promise.all` rather than
 * `allSettled`: every one of these is load-bearing for a card, and a page that
 * renders "0m" because the meditation read dropped is worse than one that says
 * it could not load and offers to retry.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * Two numbers that are deliberately not added together
 *
 * Focus minutes are tracked separately from meditation minutes, here and in the
 * app. Sitting with the breath and playing a reflex game are not the same
 * activity, and a single "mindful minutes" figure that includes both is a number
 * that flatters and informs nobody.
 */

type MeditationSession = { _id: string; durationSeconds: number; createdAt: string };
type FocusSession = { _id: string; durationSeconds: number; game?: string; createdAt: string };
type ScoreRow = { _id: string; gameId: string; score: number; plays?: number };
type LeaderRow = {
  _id: string;
  firebaseUid: string;
  displayName?: string;
  avatarId?: string | null;
  streak?: number;
  totalMeditationSeconds?: number;
};

export default function AnalyticsPage() {
  const { user, profile } = useAuth();

  const state = useApi(async () => {
    const [entries, meditation, focus, games, follow, board] = await Promise.all([
      api.get<Paged<Entry, 'entries'>>('/api/entries', { limit: 90 }),
      api.get<Paged<MeditationSession, 'sessions'>>('/api/practice/meditation', {
        limit: 200,
      }),
      api.get<Paged<FocusSession, 'sessions'>>('/api/practice/focus', {
        limit: 200,
      }),
      api.get<{ rows: Record<string, ScoreRow> }>('/api/practice/games/mine'),
      // One request for the caller's own follower and following counts, rather
      // than pulling the whole uid → count map to read one integer out of it.
      user
        ? api.get<{ followers: number; following: number }>(
            `/api/social/follow/${user.uid}/status`
          )
        : Promise.resolve({ followers: 0, following: 0 }),
      api.get<Paged<LeaderRow, 'leaderboard'>>('/api/practice/leaderboard', {
        sortBy: 'streak',
        limit: 5,
      }),
    ]);

    return { entries, meditation, focus, games, follow, board };
  }, [user?.uid]);

  return (
    <>
      <PageHeader
        title="Insights"
        subtitle="Everything you have done here, counted from the records rather than reported. Give it about two weeks before the shape means anything."
      />

      <AsyncSection state={state}>
        {(data) => (
          <Insights
            entries={data.entries.entries}
            meditation={data.meditation.sessions}
            focus={data.focus.sessions}
            games={data.games.rows ?? {}}
            followers={data.follow.followers ?? 0}
            following={data.follow.following ?? 0}
            board={data.board.leaderboard}
            profession={profile?.profession ?? null}
            customHabits={profile?.customHabits ?? []}
            weeklyTarget={profile?.craftWeeklyTarget || undefined}
            streak={profile?.streak ?? 0}
            longestStreak={profile?.longestStreak ?? 0}
            myUid={user?.uid}
          />
        )}
      </AsyncSection>
    </>
  );
}

function Insights({
  entries,
  meditation,
  focus,
  games,
  followers,
  following,
  board,
  profession,
  customHabits,
  weeklyTarget,
  streak,
  longestStreak,
  myUid,
}: {
  entries: Entry[];
  meditation: MeditationSession[];
  focus: FocusSession[];
  games: Record<string, ScoreRow>;
  followers: number;
  following: number;
  board: LeaderRow[];
  profession: string | null;
  customHabits: { id: string; label: string }[];
  weeklyTarget?: number;
  streak: number;
  longestStreak: number;
  myUid?: string;
}) {
  const today = localDayKey(new Date());

  const withMood = entries.filter((entry) => typeof entry.mood === 'number');
  const averageMood =
    withMood.length > 0
      ? withMood.reduce((sum, entry) => sum + (entry.mood ?? 0), 0) / withMood.length
      : 0;

  const thisMonth = entries.filter((entry) => {
    const date = new Date(entry.createdAt);
    const now = new Date();
    return (
      date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()
    );
  }).length;

  const meditationSeconds = meditation.reduce(
    (sum, session) => sum + (session.durationSeconds ?? 0),
    0
  );
  const meditationToday = meditation
    .filter((session) => localDayKey(session.createdAt) === today)
    .reduce((sum, session) => sum + (session.durationSeconds ?? 0), 0);

  /**
   * Game Zone time comes from the banked sessions (what was actually spent) and
   * the bests from the published rows (what was actually achieved). Two
   * different questions, two different sources — and the reason `_total` is not
   * used for the per-game breakdown even though it exists.
   */
  const perGameSeconds = new Map<string, number>();
  for (const session of focus) {
    if (!session.game) continue;
    perGameSeconds.set(
      session.game,
      (perGameSeconds.get(session.game) ?? 0) + (session.durationSeconds ?? 0)
    );
  }

  /**
   * The larger of the two records of the same thing.
   *
   * Both clients now write a `FocusSession` *and* increment the synthetic
   * `_total` row on every finished round, so going forward the two agree and
   * `max` is simply that agreed number — not a sum, which would double it.
   *
   * They disagree only about history: rounds played in the browser before the
   * Focus page started writing sessions incremented `_total` alone. Taking the
   * max keeps those, where taking the sessions would have made somebody's Game
   * Zone total visibly fall the next time they played.
   */
  const gameSeconds = Math.max(
    focus.reduce((sum, session) => sum + (session.durationSeconds ?? 0), 0),
    games._total?.score ?? 0
  );

  const playedGames = GAMES.filter(
    (game) => perGameSeconds.has(game.id) || games[game.id]
  ).sort(
    (a, b) => (perGameSeconds.get(b.id) ?? 0) - (perGameSeconds.get(a.id) ?? 0)
  );

  const craft = useMemo(
    () => craftStatsFrom(entries, { weeklyTarget }),
    [entries, weeklyTarget]
  );

  if (entries.length === 0 && meditation.length === 0 && playedGames.length === 0) {
    return (
      <EmptyState
        title="Nothing to chart yet"
        body="Write a few entries, sit for five minutes, or play a round of anything in Focus. Below about two weeks it is a handful of dots and the shape is noise."
      />
    );
  }

  return (
    <div className="space-y-8">
      {/* ─────────────── the numbers ─────────────── */}
      <section>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          <StatTile
            icon={<BookOpen className="h-4 w-4" />}
            label="Journal entries"
            value={String(entries.length)}
          />
          <StatTile
            icon={<Flame className="h-4 w-4" />}
            label="Current streak"
            value={String(streak)}
            hint="days"
            tone="accent"
          />
          <StatTile
            icon={<Flame className="h-4 w-4" />}
            label="Longest ever"
            value={String(longestStreak)}
            hint="days"
          />
          <StatTile
            icon={<Users className="h-4 w-4" />}
            label="Followers"
            value={String(followers)}
            hint={`· ${following} following`}
          />
          <StatTile
            icon={<Smile className="h-4 w-4" />}
            label="Average mood"
            value={averageMood ? averageMood.toFixed(1) : '—'}
            hint="of 5"
          />
          <StatTile
            icon={<CalendarDays className="h-4 w-4" />}
            label="This month"
            value={String(thisMonth)}
            hint="entries"
          />
          <StatTile
            icon={<Brain className="h-4 w-4" />}
            label="Meditation"
            value={formatTrainingTime(meditationSeconds)}
          />
          <StatTile
            icon={<Timer className="h-4 w-4" />}
            label="Sat today"
            value={formatTrainingTime(meditationToday)}
          />
          <StatTile
            icon={<Gamepad2 className="h-4 w-4" />}
            label="Game Zone time"
            value={formatTrainingTime(gameSeconds)}
          />
          <StatTile
            icon={<Trophy className="h-4 w-4" />}
            label="Games played"
            value={`${playedGames.length} of ${GAMES.length}`}
          />
        </div>

        <p className="mt-3 text-[11.5px] leading-relaxed text-ink-muted">
          Focus minutes are counted separately from meditation minutes, here and
          in the app. Sitting with the breath and playing a reflex game are not
          the same activity, and one combined figure would flatter and inform
          nobody.
        </p>
      </section>

      {/* ─────────────── mood ─────────────── */}
      {withMood.length >= 2 && <MoodChart entries={withMood} />}

      {/* ─────────────── the craft ─────────────── */}
      <CraftCard
        entries={entries}
        stats={craft}
        profession={profession}
        customHabits={customHabits}
      />

      {/* ─────────────── game zone ─────────────── */}
      <section>
        <div className="mb-3 flex items-center gap-3">
          <h2 className="text-[15px] font-semibold text-ink-primary">Game Zone</h2>
          <Link
            href="/app/games"
            className="ml-auto inline-flex items-center gap-1.5 text-[12.5px] text-accent transition hover:brightness-110"
          >
            <Trophy className="h-3.5 w-3.5" /> Leaderboards
          </Link>
        </div>

        {playedGames.length === 0 ? (
          <Card>
            <p className="text-[12.5px] leading-relaxed text-ink-muted">
              No games played yet. The Game Zone tracks time and best score per
              game, separately from your meditation minutes.{' '}
              <Link href="/app/games" className="text-primary-light hover:underline">
                Have a go.
              </Link>
            </p>
          </Card>
        ) : (
          <div className="space-y-1.5">
            {playedGames.map((game) => {
              const row = games[game.id];
              const seconds = perGameSeconds.get(game.id) ?? 0;

              return (
                <div
                  key={game.id}
                  className="flex flex-wrap items-center gap-x-4 gap-y-1 rounded-md border border-hairline bg-bg-card/50 px-4 py-3"
                >
                  <span className="min-w-0 flex-1 truncate text-[13.5px] text-ink-primary">
                    {game.title}
                  </span>

                  {/* Best and time are deliberately both shown. Time alone
                      rewards grinding, and a best alone hides that it took forty
                      attempts. */}
                  {typeof row?.score === 'number' && (
                    <span className="text-[12.5px] font-semibold tabular-nums text-primary-light">
                      {formatScore(game.unit, row.score)}
                    </span>
                  )}
                  {seconds > 0 && (
                    <span className="text-[11.5px] tabular-nums text-ink-muted">
                      {formatTrainingTime(seconds)}
                    </span>
                  )}
                  {(row?.plays ?? 0) > 0 && (
                    <span className="text-[11.5px] tabular-nums text-ink-muted">
                      {row!.plays} {row!.plays === 1 ? 'run' : 'runs'}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ─────────────── where you stand ─────────────── */}
      <section>
        <div className="mb-3 flex items-center gap-3">
          <h2 className="text-[15px] font-semibold text-ink-primary">
            Where you stand
          </h2>
          <Link
            href="/app/community"
            className="ml-auto text-[12.5px] text-accent transition hover:brightness-110"
          >
            Full board
          </Link>
        </div>

        {board.length === 0 ? (
          <Card>
            <p className="text-[12.5px] text-ink-muted">
              Nobody is on the board yet. Write an entry or sit for five minutes
              and you will be first.
            </p>
          </Card>
        ) : (
          <div className="space-y-1.5">
            {board.map((row, index) => {
              const mine = row.firebaseUid === myUid;
              return (
                <div
                  key={row._id}
                  className={`flex items-center gap-3 rounded-md border px-4 py-2.5 ${
                    mine
                      ? 'border-primary/50 bg-primary/15'
                      : 'border-hairline bg-bg-card/50'
                  }`}
                >
                  <span
                    className={`w-4 text-[12.5px] font-semibold ${
                      index < 3 ? 'text-accent' : 'text-ink-muted'
                    }`}
                  >
                    {index + 1}
                  </span>
                  <Avatar avatarId={row.avatarId} name={row.displayName} size={26} />
                  <span className="min-w-0 flex-1 truncate text-[13px] text-ink-secondary">
                    {row.displayName || 'Friend'}
                    {mine && (
                      <span className="ml-2 text-[11px] text-primary-light">you</span>
                    )}
                  </span>
                  <span className="text-[12.5px] font-semibold tabular-nums text-ink-primary">
                    {row.streak ?? 0}
                    <span className="ml-1 text-[11px] font-normal text-ink-muted">
                      days
                    </span>
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ─────────────── recent entries ─────────────── */}
      {entries.length > 0 && (
        <section>
          <h2 className="mb-3 text-[15px] font-semibold text-ink-primary">
            Recent entries
          </h2>
          <div className="space-y-1.5">
            {entries.slice(0, 10).map((entry) => {
              const mood = MOODS.find((item) => item.value === entry.mood);
              const tags = [
                ...(entry.practices ?? []).map((id) => labelFor(PRACTICES, id)),
                ...(entry.habitsDone ?? []).map((id) => labelFor(HABITS, id)),
                ...(entry.challenges ?? []).map((id) => labelFor(CHALLENGES, id)),
              ].slice(0, 3);

              return (
                <Link
                  key={entry._id}
                  href="/app/journal"
                  className="flex items-center gap-3 rounded-md border border-hairline bg-bg-card/50 px-4 py-2.5 transition hover:border-primary/40"
                >
                  <span className="text-base" aria-hidden="true">
                    {mood?.emoji ?? '·'}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[13px] text-ink-secondary">
                      {entry.bestMoment?.trim() ||
                        tags.join(' · ') ||
                        'Mood only — a complete entry.'}
                    </span>
                    <span className="block text-[11px] text-ink-muted">
                      {timeAgo(entry.createdAt)}
                      {didCraft(entry) ? ' · worked on your craft' : ''}
                    </span>
                  </span>
                </Link>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}

/**
 * Mood over the loaded page of entries.
 *
 * Drawn from one page rather than the whole history. The useful view is a few
 * weeks: from inside a bad Tuesday every Tuesday has been bad, and the shape
 * that settles that argument is short. Pulling two years of long-form prose to
 * draw ninety bars would be several megabytes for a picture that is worse.
 */
function MoodChart({ entries }: { entries: Entry[] }) {
  const ordered = [...entries].reverse(); // oldest first, for the chart

  return (
    <Card>
      <p className="mb-4 text-[11px] uppercase tracking-wide text-ink-muted">
        Mood over your last {ordered.length} entries
      </p>

      <div className="flex h-40 items-end gap-[3px]">
        {ordered.map((entry) => {
          const mood = MOODS.find((item) => item.value === entry.mood);
          return (
            <div
              key={entry._id}
              className="flex-1 rounded-t-[3px] transition-all"
              style={{
                height: `${((entry.mood ?? 1) / 5) * 100}%`,
                backgroundColor: mood?.hex ?? '#6366F1',
              }}
              title={`${new Date(entry.createdAt).toLocaleDateString('en-IN')} · ${
                mood?.label ?? entry.mood
              }`}
            />
          );
        })}
      </div>

      <div className="mt-2 flex justify-between text-[10.5px] text-ink-muted">
        <span>{new Date(ordered[0].createdAt).toLocaleDateString('en-IN')}</span>
        <span>
          {new Date(ordered[ordered.length - 1].createdAt).toLocaleDateString('en-IN')}
        </span>
      </div>
    </Card>
  );
}

/**
 * Are you actually doing the work?
 *
 * The one question a mood chart and a meditation total cannot answer, and the
 * number people come back to check. Before a craft has been named this is an
 * invitation rather than an empty chart — thirty grey squares for a profession
 * nobody chose says nothing.
 */
function CraftCard({
  entries,
  stats,
  profession,
  customHabits,
}: {
  entries: Entry[];
  stats: ReturnType<typeof craftStatsFrom>;
  profession: string | null;
  customHabits: { id: string; label: string }[];
}) {
  if (!isKnownProfession(profession)) {
    return (
      <Card className="border-primary/30 bg-primary/[0.07]">
        <h2 className="text-[15px] font-semibold text-ink-primary">
          What are you trying to get good at?
        </h2>
        <p className="mt-1.5 text-[12.5px] leading-relaxed text-ink-secondary">
          Singing, writing, studying, building something. Name it once and this
          page starts answering whether you are actually doing it — which is the
          one thing a mood chart cannot tell you.
        </p>
        <Link href="/app/profile" className="btn-ghost mt-4 !py-2 text-[12.5px]">
          Set it up — takes 20 seconds
        </Link>
      </Card>
    );
  }

  const craft = professionById(profession);
  const lift = moodLift(stats);
  const gap = daysToTarget(stats);

  /** The last thirty days as one square each — practised, missed, or no entry. */
  const grid = Array.from({ length: 30 }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - (29 - index));
    const key = localDayKey(date);
    const entry = entries.find((row) => localDayKey(row.createdAt) === key);
    return {
      key,
      state: !entry ? 'none' : didCraft(entry) ? 'done' : 'missed',
      label: date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
    };
  });

  return (
    <Card>
      <div className="mb-3 flex items-center gap-2">
        <span className="text-lg" aria-hidden="true">
          {craft.emoji}
        </span>
        <h2 className="text-[15px] font-semibold text-ink-primary">
          {craft.label}
        </h2>
      </div>

      <p className="text-[13px] leading-relaxed text-ink-secondary">
        {craftVerdict(stats, craft.workWord)}
      </p>

      <div className="mt-4 grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-4">
        <Figure value={`${Math.round(consistency(stats) * 100)}%`} label="of the last 30 days" />
        <Figure value={String(stats.currentStreak)} label="day streak" accent />
        <Figure value={`${stats.thisWeekDays}/${stats.weeklyTarget}`} label="this week" />
        <Figure
          value={stats.totalMinutes > 0 ? formatTrainingTime(stats.totalMinutes * 60) : '—'}
          label="logged"
        />
      </div>

      <div className="mt-5">
        <p className="mb-2 text-[10.5px] uppercase tracking-wide text-ink-muted">
          Last 30 days
        </p>
        <div className="flex flex-wrap gap-1">
          {grid.map((day) => (
            <span
              key={day.key}
              title={day.label}
              className={`h-4 w-4 rounded-[3px] ${
                day.state === 'done'
                  ? 'bg-primary'
                  : day.state === 'missed'
                    ? 'bg-hairline'
                    : 'border border-hairline'
              }`}
            />
          ))}
        </div>
      </div>

      {stats.habitCounts.length > 0 && (
        <div className="mt-5 space-y-2.5">
          <p className="text-[10.5px] uppercase tracking-wide text-ink-muted">
            What you actually did
          </p>
          {stats.habitCounts.slice(0, 6).map(([id, count]) => (
            <div key={id}>
              <div className="mb-1 flex justify-between text-[12.5px]">
                <span className="text-ink-secondary">
                  {resolveHabitLabel(profession, id, customHabits)}
                </span>
                <span className="tabular-nums text-ink-muted">
                  {count}/{stats.windowDays}
                </span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-pill bg-bg-dark">
                <div
                  className="h-full rounded-pill bg-gradient-primary"
                  style={{ width: `${(count / stats.windowDays) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* The single most motivating sentence this app can show anybody, and the
          reason the comparison is computed at all. Only rendered when there were
          at least three days of each kind to compare — see craft-stats.ts. */}
      {lift !== null && Math.abs(lift) >= 0.2 && (
        <p className="mt-5 rounded-md border border-primary/30 bg-primary/10 px-3.5 py-3 text-[12.5px] leading-relaxed text-ink-secondary">
          {lift > 0
            ? `Your mood averages ${lift.toFixed(1)} higher on days you do the work than on days you do not.`
            : `Your mood averages ${Math.abs(lift).toFixed(1)} lower on days you do the work. Worth noticing — it usually means the target is set too high rather than that the work is wrong.`}
        </p>
      )}

      {stats.strongestWeekday !== null && stats.weakestWeekday !== null && (
        <p className="mt-3 text-[12px] leading-relaxed text-ink-muted">
          {WEEKDAY_NAMES[stats.strongestWeekday]} is your strongest day and{' '}
          {WEEKDAY_NAMES[stats.weakestWeekday]} your thinnest.
          {gap > 0
            ? ` Worth putting the next ${craft.workWord} somewhere other than a ${WEEKDAY_NAMES[stats.weakestWeekday]}.`
            : ''}
        </p>
      )}
    </Card>
  );
}

function Figure({
  value,
  label,
  accent = false,
}: {
  value: string;
  label: string;
  accent?: boolean;
}) {
  return (
    <div>
      <p
        className={`text-xl font-semibold ${
          accent ? 'text-accent' : 'text-ink-primary'
        }`}
      >
        {value}
      </p>
      <p className="text-[11px] text-ink-muted">{label}</p>
    </div>
  );
}
