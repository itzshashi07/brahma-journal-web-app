'use client';

import { AsyncSection, Card, EmptyState, PageHeader, useApi } from '@/components/app/ui';
import { api, type Paged } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';

/**
 * Insights.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * Everything here comes from entries that already exist
 *
 * No separate mood check-in, no extra logging step. The mood set on an entry
 * and the habits ticked on it *are* the chart — which is the only version of
 * this feature that survives contact with a real week, because a tracker that
 * needs its own daily input is a second habit to keep.
 *
 * The charts are drawn from one page of entries rather than the whole history.
 * The useful view is a few weeks: from inside a bad Tuesday every Tuesday has
 * been bad, and the shape that settles that argument is short. Pulling two
 * years of long-form prose to draw ninety bars would be several megabytes for a
 * picture that is worse.
 */

type Entry = { _id: string; mood?: number; habitsDone?: string[]; createdAt: string };

const MOOD_COLORS = ['#6366F1', '#8B5CF6', '#F59E0B', '#10B981', '#06D6A0'];

export default function AnalyticsPage() {
  const { profile } = useAuth();
  const state = useApi(
    () => api.get<Paged<Entry, 'entries'>>('/api/entries', { limit: 90 }),
    []
  );

  return (
    <>
      <PageHeader
        title="Insights"
        subtitle="Built from entries you already wrote. Give it about two weeks before the shape means anything."
      />

      <AsyncSection state={state}>
        {(data) => {
          const entries = [...data.entries].reverse(); // oldest first, for the chart
          const withMood = entries.filter((entry) => typeof entry.mood === 'number');

          if (entries.length === 0) {
            return (
              <EmptyState
                title="Nothing to chart yet"
                body="Write a few entries and the pattern starts to appear. Below about two weeks it is a handful of dots and the shape is noise."
              />
            );
          }

          const average =
            withMood.length > 0
              ? withMood.reduce((sum, entry) => sum + (entry.mood ?? 0), 0) / withMood.length
              : 0;

          // Habit counts across the page, most-kept first.
          const habitCounts = new Map<string, number>();
          for (const entry of entries) {
            for (const habit of entry.habitsDone ?? []) {
              habitCounts.set(habit, (habitCounts.get(habit) ?? 0) + 1);
            }
          }
          const habits = [...habitCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8);

          return (
            <div className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-3">
                <Stat label="Entries here" value={String(entries.length)} />
                <Stat
                  label="Average mood"
                  value={average ? average.toFixed(1) : '—'}
                  hint="out of 5"
                />
                <Stat
                  label="Longest streak"
                  value={String(profile?.longestStreak ?? 0)}
                  hint="days"
                />
              </div>

              <Card>
                <p className="mb-4 text-[11px] uppercase tracking-wide text-ink-muted">
                  Mood over your last {withMood.length} entries
                </p>
                {withMood.length === 0 ? (
                  <p className="text-[13px] text-ink-muted">
                    No moods recorded yet.
                  </p>
                ) : (
                  <div className="flex h-40 items-end gap-[3px]">
                    {withMood.map((entry) => (
                      <div
                        key={entry._id}
                        className="flex-1 rounded-t-[3px] transition-all"
                        style={{
                          height: `${((entry.mood ?? 1) / 5) * 100}%`,
                          backgroundColor: MOOD_COLORS[(entry.mood ?? 1) - 1],
                        }}
                        title={`${new Date(entry.createdAt).toLocaleDateString('en-IN')} · ${entry.mood}/5`}
                      />
                    ))}
                  </div>
                )}
              </Card>

              {habits.length > 0 && (
                <Card>
                  <p className="mb-4 text-[11px] uppercase tracking-wide text-ink-muted">
                    Habits you actually kept
                  </p>
                  <div className="space-y-2.5">
                    {habits.map(([habit, count]) => (
                      <div key={habit}>
                        <div className="mb-1 flex justify-between text-[12.5px]">
                          <span className="text-ink-secondary">{habit}</span>
                          <span className="tabular-nums text-ink-muted">
                            {count}/{entries.length}
                          </span>
                        </div>
                        <div className="h-1.5 overflow-hidden rounded-pill bg-bg-dark">
                          <div
                            className="h-full rounded-pill bg-gradient-primary"
                            style={{ width: `${(count / entries.length) * 100}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="mt-4 text-[11.5px] leading-relaxed text-ink-muted">
                    This is what you ticked, not what you intended. It is more
                    useful for being unflattering.
                  </p>
                </Card>
              )}
            </div>
          );
        }}
      </AsyncSection>
    </>
  );
}

function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <Card className="!p-4">
      <p className="text-[11px] uppercase tracking-wide text-ink-muted">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-ink-primary">
        {value}
        {hint && <span className="ml-1.5 text-[12px] font-normal text-ink-muted">{hint}</span>}
      </p>
    </Card>
  );
}
