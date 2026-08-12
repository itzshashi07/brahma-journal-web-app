'use client';

import { useCallback, useState } from 'react';
import { ArrowLeft, Smartphone, Trophy } from 'lucide-react';

import {
  AsyncSection,
  Card,
  PageHeader,
  useApi,
} from '@/components/app/ui';
import { PLAYABLE } from '@/components/app/games';
import {
  GAMES,
  LANES,
  type Game,
  formatScore,
  formatTrainingTime,
  gameById,
} from '@/content/games';
import { api, type Paged } from '@/lib/api';

/**
 * Focus.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * What was here before
 *
 * One game, hard-coded, submitting under the id `'reaction'` — an id no game in
 * the app has. So its leaderboard queried a board nobody had ever scored on,
 * and rendered empty for every member with nothing to indicate why. The screen
 * looked complete and was wired to nothing.
 *
 * This is the whole catalogue now, from `src/content/games.ts`, which mirrors
 * the app's. Six are playable in the browser; the rest are listed **with the
 * member's best**, because a score set on the phone is their score, and a Focus
 * page that quietly omitted nine games would read as lost data to anyone who
 * plays on Android.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * Two numbers that are deliberately not added together
 *
 * Focus minutes are tracked separately from meditation minutes, here and in the
 * app. Sitting with the breath and playing a reflex game are not the same
 * activity, and a single "mindful minutes" figure that includes both is a
 * number that flatters and informs nobody.
 */

type ScoreRow = {
  _id: string;
  gameId: string;
  score: number;
  plays?: number;
  displayName?: string;
  firebaseUid?: string;
};

export default function GamesPage() {
  const [openId, setOpenId] = useState<string | null>(null);

  const mine = useApi(
    () => api.get<{ rows: Record<string, ScoreRow> }>('/api/practice/games/mine'),
    []
  );

  const open = openId ? gameById(openId) : null;

  if (open) {
    return (
      <GameView
        game={open}
        onBack={() => {
          setOpenId(null);
          void mine.reload();
        }}
      />
    );
  }

  return (
    <>
      <PageHeader
        title="Focus"
        subtitle="Short games for attention, memory and working things out. Focus minutes are counted separately from meditation minutes, so neither number lies."
      />

      <AsyncSection state={mine}>
        {(data) => {
          const rows = data.rows ?? {};
          // `_total` is the accumulated training time, not a game.
          const totalSeconds = rows._total?.score ?? 0;
          const played = GAMES.filter((g) => rows[g.id]).length;

          return (
            <>
              <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
                <Stat label="Focus time" value={formatTrainingTime(totalSeconds)} />
                <Stat label="Games played" value={`${played} of ${GAMES.length}`} />
                <Stat
                  label="Rounds"
                  value={String(
                    Object.entries(rows)
                      .filter(([id]) => id !== '_total')
                      .reduce((sum, [, r]) => sum + (r.plays ?? 0), 0)
                  )}
                />
              </div>

              {LANES.map((lane) => {
                const games = GAMES.filter((g) => g.lane === lane.key);
                if (!games.length) return null;

                return (
                  <section key={lane.key} className="mb-8">
                    <h2 className="text-[15px] font-semibold text-ink-primary">
                      {lane.label}
                    </h2>
                    <p className="mb-3 mt-0.5 text-[12.5px] text-ink-muted">
                      {lane.blurb}
                    </p>

                    <div className="grid gap-3 sm:grid-cols-2">
                      {games.map((game) => (
                        <GameCard
                          key={game.id}
                          game={game}
                          best={rows[game.id]?.score}
                          onOpen={() => setOpenId(game.id)}
                        />
                      ))}
                    </div>
                  </section>
                );
              })}
            </>
          );
        }}
      </AsyncSection>
    </>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <Card className="!p-4">
      <p className="text-[10.5px] uppercase tracking-wider text-ink-muted">
        {label}
      </p>
      <p className="mt-1 text-xl font-semibold text-ink-primary">{value}</p>
    </Card>
  );
}

function Pips({ level }: { level: number }) {
  return (
    <span className="inline-flex gap-0.5" aria-label={`Difficulty ${level} of 3`}>
      {[1, 2, 3].map((i) => (
        <span
          key={i}
          className={`h-1 w-3 rounded-full ${
            i <= level ? 'bg-primary-light' : 'bg-hairline'
          }`}
        />
      ))}
    </span>
  );
}

function GameCard({
  game,
  best,
  onOpen,
}: {
  game: Game;
  best?: number;
  onOpen: () => void;
}) {
  const body = (
    <>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[14.5px] font-semibold text-ink-primary">
            {game.title}
          </p>
          <p className="mt-0.5 text-[12.5px] leading-relaxed text-ink-secondary">
            {game.subtitle}
          </p>
        </div>
        <Pips level={game.difficulty} />
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2 text-[11.5px] text-ink-muted">
        <span>{game.duration}</span>
        <span>·</span>
        <span>{game.lowerIsBetter ? 'lower is better' : 'higher is better'}</span>
        {typeof best === 'number' && (
          <span className="ml-auto inline-flex items-center gap-1 rounded-pill bg-primary/15 px-2 py-0.5 font-medium text-primary-light">
            <Trophy className="h-3 w-3" />
            {formatScore(game.unit, best)}
          </span>
        )}
      </div>

      {!game.playableHere && (
        <p className="mt-3 inline-flex items-center gap-1.5 text-[11.5px] text-ink-muted">
          <Smartphone className="h-3 w-3" />
          Playable in the Android app
        </p>
      )}
    </>
  );

  if (!game.playableHere) {
    return <Card className="!p-4 opacity-75">{body}</Card>;
  }

  return (
    <button
      type="button"
      onClick={onOpen}
      className="glass glass-hover rounded-lg p-4 text-left"
    >
      {body}
    </button>
  );
}

/** One game, its board, and what happens when a round ends. */
function GameView({ game, onBack }: { game: Game; onBack: () => void }) {
  const [result, setResult] = useState<{ score: number; beat: boolean } | null>(
    null
  );

  const board = useApi(
    () =>
      api.get<Paged<ScoreRow, 'top'> & { mine: ScoreRow | null }>(
        `/api/practice/games/${game.id}/board`,
        { lowerIsBetter: String(game.lowerIsBetter), limit: 10 }
      ),
    [game.id]
  );

  const finish = useCallback(
    async (score: number, seconds: number) => {
      const previous = board.data?.mine?.score;
      const beat =
        previous === undefined ||
        (game.lowerIsBetter ? score < previous : score > previous);

      setResult({ score, beat });

      /**
       * Three calls, and none blocks the others: a failed training write must
       * not lose the score, and a failed score must not lose the minutes.
       *
       * The third one is the one that was missing. `/games/training` banks the
       * seconds into a single synthetic `_total` row, which is enough for "how
       * long have I spent in here" and useless for anything else. The app also
       * writes a `FocusSession` carrying **which** game the time went to, and
       * that is what Insights breaks the time down by — so a member who played
       * only in the browser had a Game Zone total with nothing underneath it.
       */
      await Promise.allSettled([
        api.post('/api/practice/games/scores', {
          gameId: game.id,
          score,
          lowerIsBetter: game.lowerIsBetter,
        }),
        api.post('/api/practice/games/training', { seconds }),
        api.post('/api/practice/focus', {
          durationSeconds: seconds,
          game: game.id,
          completed: true,
        }),
      ]);

      void board.reload();
    },
    [board, game.id, game.lowerIsBetter]
  );

  const Play = PLAYABLE[game.id];

  return (
    <>
      <button
        type="button"
        onClick={onBack}
        className="mb-4 inline-flex items-center gap-1.5 text-[12.5px] text-ink-muted transition hover:text-ink-primary"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Focus
      </button>

      <PageHeader title={game.title} subtitle={game.detail} />

      {result && (
        <Card className="mb-4 !p-4">
          <p className="text-[14px] font-semibold text-ink-primary">
            {formatScore(game.unit, result.score)}
            {result.beat && (
              <span className="ml-2 text-[12px] font-medium text-success">
                new best
              </span>
            )}
          </p>
          <p className="mt-1 text-[12.5px] text-ink-secondary">
            {result.beat
              ? 'Saved to your board.'
              : 'Your best still stands — nothing was overwritten.'}
          </p>
        </Card>
      )}

      <Card className="mb-6">{Play ? <Play onFinish={finish} /> : null}</Card>

      <h2 className="mb-3 text-[15px] font-semibold text-ink-primary">
        Best scores
      </h2>

      <AsyncSection state={board}>
        {(data) =>
          data.top.length === 0 ? (
            <p className="text-[13px] text-ink-muted">
              Nobody has played this one yet. Set the first score.
            </p>
          ) : (
            <div className="space-y-1.5">
              {data.top.map((row, i) => (
                <div
                  key={row._id}
                  className={`flex items-center gap-3 rounded-md border px-4 py-2.5 ${
                    row.firebaseUid === data.mine?.firebaseUid
                      ? 'border-primary/50 bg-primary/10'
                      : 'border-hairline bg-bg-card/50'
                  }`}
                >
                  <span className="w-5 text-[12px] tabular-nums text-ink-muted">
                    {i + 1}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-[13.5px] text-ink-primary">
                    {row.displayName || 'Friend'}
                  </span>
                  <span className="text-[13px] font-semibold tabular-nums text-ink-secondary">
                    {formatScore(game.unit, row.score)}
                  </span>
                </div>
              ))}
            </div>
          )
        }
      </AsyncSection>
    </>
  );
}
