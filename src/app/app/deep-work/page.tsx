'use client';

import { useCallback, useMemo, useState } from 'react';
import {
  CalendarDays,
  Check,
  Plus,
  Target,
  Trash2,
  Trophy,
  X,
} from 'lucide-react';

import {
  AsyncSection,
  Card,
  EmptyState,
  Modal,
  PageHeader,
  useApi,
} from '@/components/app/ui';
import { api, type Paged } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { todaysEntry, type Entry } from '@/lib/entries';
import {
  createMilestone,
  deleteMilestone,
  doneCount,
  daysLeft,
  fetchAchievements,
  fetchMilestones,
  fortnight,
  monthLabel,
  newTodo,
  openCount,
  progress,
  currentRun,
  todos,
  updateMilestone,
  verdictFor,
  workedDays,
  MAX_TODOS,
  type Achievements,
  type Milestone,
  type MilestoneTodo,
} from '@/lib/milestones';
import { PROFESSIONS, professionById } from '@/content/professions';

/**
 * Deep work on the web.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * Why this exists on the site at all
 *
 * Everything else the web app carries is something you *do* in a sitting — the
 * journal, a meditation, a reflection. Deep work is the one screen you come
 * back to in order to *check*: what am I building, what is left, am I going to
 * get there. That is a question people ask at a desk with a keyboard far more
 * often than on a phone, and until now the answer only existed on Android.
 *
 * It is the same records through the same endpoints, and — this is the part
 * that matters — the same arithmetic, kept in `lib/milestones.ts`. A verdict
 * that says "on course" here and "behind" on the phone would make both
 * unbelievable.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * The shape of the screen, and why it is not the app's
 *
 * The app pushes a screen per milestone because a phone has one column. Here a
 * milestone opens in a dialog over the list: on a laptop the list is the
 * context — the other track you are also behind on is the thing you need to see
 * while deciding what to do about this one — and losing it to a full-page
 * navigation is losing the only advantage the bigger screen has.
 */
export default function DeepWorkPage() {
  const { profile } = useAuth();

  const state = useApi(
    () =>
      Promise.all([
        fetchMilestones(),
        fetchAchievements(),
        // Ninety days of entries, which is where the "days worked" half of the
        // analysis comes from. The same source the app uses: any craft tick in
        // the journal counts, so the two cannot disagree about a week.
        api
          .get<Paged<Entry, 'entries'>>('/api/entries', { limit: 90 })
          .then((body) => body.entries ?? [])
          .catch(() => [] as Entry[]),
      ]),
    []
  );

  const [open, setOpen] = useState<string | null>(null);
  const [composing, setComposing] = useState(false);

  const reload = state.reload;

  return (
    <>
      <PageHeader
        title="Deep work"
        subtitle="What you are building, and whether it is actually moving. Ticking a step here is the same record your phone keeps."
        action={
          <button
            type="button"
            onClick={() => setComposing(true)}
            className="btn-primary !py-2.5"
          >
            <Plus className="h-4 w-4" /> New milestone
          </button>
        }
      />

      <AsyncSection state={state}>
        {([milestones, achievements, entries]) => {
          const worked = workedDays(entries);
          const active = milestones.filter((m) => m.status === 'active');
          const current = open
            ? milestones.find((m) => m._id === open) ?? null
            : null;

          return (
            <>
              {achievements.total > 0 && (
                <AchievementStrip achievements={achievements} />
              )}

              {active.length === 0 ? (
                <EmptyState
                  title="Nothing set yet"
                  body="A milestone is something with an end — an exam cleared, a song recorded, an offer in hand. Write one, break it into steps, and this screen will tell you the truth about how it is going."
                  action={
                    <button
                      type="button"
                      onClick={() => setComposing(true)}
                      className="btn-primary !py-2.5"
                    >
                      <Plus className="h-4 w-4" /> Set your first milestone
                    </button>
                  }
                />
              ) : (
                <MilestoneGroups
                  milestones={active}
                  worked={worked}
                  onOpen={setOpen}
                />
              )}

              <MilestoneDialog
                milestone={current}
                worked={worked}
                entries={entries}
                onClose={() => setOpen(null)}
                onChanged={reload}
              />

              <ComposeDialog
                open={composing}
                defaultCraft={profile?.profession ?? ''}
                onClose={() => setComposing(false)}
                onCreated={async (created) => {
                  setComposing(false);
                  await reload();
                  setOpen(created._id);
                }}
              />
            </>
          );
        }}
      </AsyncSection>
    </>
  );
}

/**
 * The active milestones, under a heading per craft.
 *
 * The heading appears only when there is more than one craft in play. Somebody
 * running two engineering milestones is looking at a list, and a heading over
 * all of it is furniture; somebody running an engineering one and a singing one
 * is looking at two different lives, and reading them as a single list is how
 * "I am behind on everything" happens when in fact each track is fine.
 */
function MilestoneGroups({
  milestones,
  worked,
  onOpen,
}: {
  milestones: Milestone[];
  worked: Set<string>;
  onOpen: (id: string) => void;
}) {
  const groups = useMemo(() => {
    const byCraft = new Map<string, Milestone[]>();
    for (const milestone of milestones) {
      const key = milestone.craft ?? '';
      byCraft.set(key, [...(byCraft.get(key) ?? []), milestone]);
    }
    return [...byCraft.entries()].sort(
      (a, b) =>
        b[1].length - a[1].length ||
        professionById(a[0]).label.localeCompare(professionById(b[0]).label)
    );
  }, [milestones]);

  if (groups.length < 2) {
    return (
      <div className="grid gap-3 sm:grid-cols-2">
        {milestones.map((milestone) => (
          <MilestoneCard
            key={milestone._id}
            milestone={milestone}
            worked={worked}
            onOpen={() => onOpen(milestone._id)}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-7">
      {groups.map(([craft, list]) => {
        const profession = professionById(craft);
        return (
          <section key={craft || 'none'}>
            <div className="mb-3 flex items-center gap-3">
              <h2 className="flex items-center gap-2 text-[13px] font-semibold text-ink-primary">
                <span aria-hidden="true">{profession.emoji}</span>
                {profession.label}
              </h2>
              <span className="h-px flex-1 bg-hairline" />
              <span className="text-[11.5px] text-ink-muted">{list.length}</span>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {list.map((milestone) => (
                <MilestoneCard
                  key={milestone._id}
                  milestone={milestone}
                  worked={worked}
                  onOpen={() => onOpen(milestone._id)}
                />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}

function MilestoneCard({
  milestone,
  worked,
  onOpen,
}: {
  milestone: Milestone;
  worked: Set<string>;
  onOpen: () => void;
}) {
  const left = daysLeft(milestone);
  const overdue = left !== null && left < 0;
  const thisWeek = fortnight(worked)
    .slice(-7)
    .filter((d) => d.filled).length;

  return (
    <button
      type="button"
      onClick={onOpen}
      className="glass w-full p-5 text-left transition hover:border-primary/45"
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-[15px] font-semibold leading-snug text-ink-primary">
          {milestone.title}
        </p>
        {left !== null && (
          <span
            className={`shrink-0 rounded-pill px-2.5 py-1 text-[10.5px] font-semibold ${
              overdue
                ? 'bg-danger/20 text-danger'
                : 'bg-bg-card text-ink-secondary'
            }`}
          >
            {overdue
              ? `${-left}d over`
              : left === 0
                ? 'today'
                : `${left}d left`}
          </span>
        )}
      </div>

      <Bar value={progress(milestone)} className="mt-4" />

      <div className="mt-2.5 flex items-center justify-between text-[11.5px]">
        <span className="text-ink-secondary">
          {todos(milestone).length === 0
            ? 'No steps yet'
            : `${doneCount(milestone)} of ${todos(milestone).length} done`}
        </span>
        <span className={thisWeek === 0 ? 'text-accent' : 'text-ink-muted'}>
          {thisWeek === 0
            ? 'nothing this week'
            : `${thisWeek} day${thisWeek === 1 ? '' : 's'} this week`}
        </span>
      </div>
    </button>
  );
}

function Bar({ value, className = '' }: { value: number; className?: string }) {
  return (
    <div className={`h-[7px] overflow-hidden rounded-pill bg-white/[0.07] ${className}`}>
      <div
        className="h-full rounded-pill bg-primary transition-[width]"
        style={{ width: `${Math.round(value * 100)}%` }}
      />
    </div>
  );
}

/** Achievements, month by month — the last three, where the work is. */
function AchievementStrip({ achievements }: { achievements: Achievements }) {
  const months = achievements.months.slice(0, 3);
  const busiest = Math.max(1, ...months.map((m) => m.count));

  return (
    <Card className="mb-6 border-success/25 bg-success/[0.07]">
      <div className="flex items-center gap-2">
        <Trophy className="h-4 w-4 text-success" />
        <p className="text-[14px] font-semibold text-ink-primary">
          {achievements.total} achieved
        </p>
      </div>

      <div className="mt-4 space-y-2.5">
        {months.map((month) => (
          <div key={month.month} className="flex items-center gap-3">
            <span className="w-28 shrink-0 text-[12px] text-ink-secondary">
              {monthLabel(month.month)}
            </span>
            <div className="h-[7px] flex-1 overflow-hidden rounded-pill bg-white/[0.06]">
              <div
                className="h-full rounded-pill bg-success"
                style={{ width: `${Math.max(8, (month.count / busiest) * 100)}%` }}
              />
            </div>
            <span className="w-6 text-right text-[12.5px] font-semibold text-ink-primary">
              {month.count}
            </span>
          </div>
        ))}
      </div>

      {months[0]?.titles.length > 0 && (
        <p className="mt-3 text-[12px] leading-relaxed text-ink-muted">
          {months[0].titles.slice(0, 4).join(' · ')}
        </p>
      )}
    </Card>
  );
}

/**
 * One milestone, opened: the analysis, today's tick, and the steps.
 *
 * Every write here is optimistic against the dialog's own copy and reconciled
 * from the response — a checkbox that waits for a round trip gets clicked
 * twice, and the second click undoes the first.
 */
function MilestoneDialog({
  milestone,
  worked,
  entries,
  onClose,
  onChanged,
}: {
  milestone: Milestone | null;
  worked: Set<string>;
  entries: Entry[];
  onClose: () => void;
  onChanged: () => Promise<void> | void;
}) {
  const [draft, setDraft] = useState<Milestone | null>(null);
  const [label, setLabel] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [workedToday, setWorkedToday] = useState<boolean | null>(null);

  // The dialog's copy follows whichever milestone was opened, and any reload
  // that brings a newer one.
  const current = draft?._id === milestone?._id ? (draft ?? milestone) : milestone;

  const save = useCallback(
    async (next: MilestoneTodo[]) => {
      if (!current) return;
      const previous = current;
      setDraft({ ...current, todos: next });
      setError(null);
      try {
        const saved = await updateMilestone(current._id, { todos: next });
        setDraft(saved);
        await onChanged();
      } catch (err) {
        setDraft(previous);
        setError(err instanceof Error ? err.message : 'Could not save that.');
      }
    },
    [current, onChanged]
  );

  if (!current) return null;

  const list = todos(current);
  const open = openCount(current);
  const verdict = verdictFor(current, worked);
  const days = fortnight(worked);
  const recent = days.filter((d) => d.filled).length;
  const run = currentRun(worked);
  const profession = professionById(current.craft);
  const today = todaysEntry(entries);
  const isWorkedToday =
    workedToday ?? days[days.length - 1]?.filled ?? false;

  /**
   * Records today's deep work in the journal — the same field the app writes,
   * and the same one the fortnight above is drawn from. Not a second, parallel
   * idea of what counts as a working day.
   */
  async function markToday() {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      const done = new Set(today?.craftDone ?? []);
      if (done.has('deep_work')) done.delete('deep_work');
      else done.add('deep_work');

      const body = { craftDone: [...done] };
      if (today) await api.patch(`/api/entries/${today._id}`, body);
      else await api.post('/api/entries', { mood: 3, ...body });

      setWorkedToday(done.has('deep_work'));
      await onChanged();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not record that.');
    } finally {
      setBusy(false);
    }
  }

  async function setStatus(status: 'achieved' | 'dropped') {
    setBusy(true);
    try {
      await updateMilestone(current!._id, { status });
      onClose();
      await onChanged();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save that.');
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    setBusy(true);
    try {
      await deleteMilestone(current!._id);
      onClose();
      await onChanged();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not delete that.');
    } finally {
      setBusy(false);
    }
  }

  const tone = {
    good: 'text-success',
    bad: 'text-danger',
    warn: 'text-accent',
    plain: 'text-ink-secondary',
  }[verdict.tone];

  return (
    <Modal open onClose={onClose} label={current.title} wide>
      <div className="mb-1 flex items-center gap-2 text-[11.5px] text-ink-muted">
        <span aria-hidden="true">{profession.emoji}</span>
        {profession.label}
      </div>
      <h2 className="text-[18px] font-semibold leading-snug text-ink-primary">
        {current.title}
      </h2>
      {current.why && (
        <p className="mt-1.5 text-[13px] leading-relaxed text-ink-secondary">
          {current.why}
        </p>
      )}

      {/* The honest part: four numbers, a fortnight, and one sentence. */}
      <Card className="mt-5 !p-4">
        <div className="grid grid-cols-4 gap-2 text-center">
          <Figure value={`${Math.round(progress(current) * 100)}%`} label="done" />
          <Figure value={`${open}`} label="left" />
          <Figure value={`${recent}`} label="days worked" />
          <Figure value={`${run}`} label="day run" />
        </div>

        <div className="mt-4 flex gap-[5px]" aria-hidden="true">
          {days.map((day) => (
            <span
              key={day.key}
              title={day.key}
              className={`h-3 w-3 rounded-full ${
                day.filled ? 'bg-primary' : 'bg-white/[0.07]'
              } ${day.isToday ? 'ring-1 ring-ink-secondary' : ''}`}
            />
          ))}
        </div>

        <p className={`mt-4 text-[12.5px] leading-relaxed ${tone}`}>
          {verdict.text}
        </p>
      </Card>

      <button
        type="button"
        onClick={markToday}
        disabled={busy}
        className={`mt-4 flex w-full items-center gap-3 rounded-lg border p-4 text-left transition ${
          isWorkedToday
            ? 'border-primary/45 bg-primary/10'
            : 'border-hairline bg-bg-card hover:border-primary/40'
        }`}
      >
        <span
          className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md border ${
            isWorkedToday
              ? 'border-primary bg-primary text-white'
              : 'border-ink-muted'
          }`}
        >
          {isWorkedToday && <Check className="h-3.5 w-3.5" />}
        </span>
        <span className="text-[13px] text-ink-primary">
          {isWorkedToday
            ? 'Deep work done today. That is the dot that fills in.'
            : 'Did deep work today? Click to record it.'}
        </span>
      </button>

      <div className="mt-6 flex items-center justify-between">
        <h3 className="text-[14px] font-semibold text-ink-primary">Your steps</h3>
        <span className="text-[12px] text-ink-muted">
          {doneCount(current)}/{list.length}
        </span>
      </div>
      <p className="mt-1 text-[11.5px] leading-relaxed text-ink-muted">
        Yours to write and yours to delete. Tick one when it is actually done.
      </p>

      <div className="mt-3 space-y-2">
        {list.map((todo) => (
          <div
            key={todo.id}
            className={`flex items-center gap-3 rounded-lg border p-3 ${
              todo.done
                ? 'border-primary/35 bg-primary/[0.08]'
                : 'border-hairline bg-bg-card'
            }`}
          >
            <button
              type="button"
              onClick={() =>
                save(
                  list.map((t) =>
                    t.id === todo.id
                      ? {
                          ...t,
                          done: !t.done,
                          doneAt: t.done ? null : new Date().toISOString(),
                        }
                      : t
                  )
                )
              }
              className="flex flex-1 items-center gap-3 text-left"
              aria-pressed={todo.done}
            >
              <span
                className={`flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full border ${
                  todo.done
                    ? 'border-primary bg-primary text-white'
                    : 'border-ink-muted'
                }`}
              >
                {todo.done && <Check className="h-3 w-3" />}
              </span>
              <span
                className={`text-[13.5px] leading-snug ${
                  todo.done ? 'text-ink-muted line-through' : 'text-ink-primary'
                }`}
              >
                {todo.label}
              </span>
            </button>

            <button
              type="button"
              onClick={() => save(list.filter((t) => t.id !== todo.id))}
              className="shrink-0 rounded-md p-1.5 text-ink-muted transition hover:text-danger"
              aria-label={`Remove ${todo.label}`}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}

        {list.length === 0 && (
          <p className="py-2 text-[12.5px] leading-relaxed text-ink-muted">
            No steps yet. Write the first thing you would have to do — the
            smallest one you could finish today.
          </p>
        )}
      </div>

      <form
        className="mt-3 flex gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          const text = label.trim();
          if (!text) return;
          if (list.length >= MAX_TODOS) {
            setError(
              'Fifty steps is a project, not a milestone. Finish some first.'
            );
            return;
          }
          setLabel('');
          save([...list, newTodo(text)]);
        }}
      >
        <input
          value={label}
          onChange={(event) => setLabel(event.target.value)}
          maxLength={200}
          placeholder="Add a step towards it"
          className="field flex-1"
          aria-label="A step towards this milestone"
        />
        <button type="submit" className="btn-primary !px-4 !py-2.5">
          <Plus className="h-4 w-4" />
        </button>
      </form>

      {error && <p className="mt-3 text-[12.5px] text-danger">{error}</p>}

      <div className="mt-6 flex flex-wrap gap-2 border-t border-hairline pt-4">
        <button
          type="button"
          onClick={() => setStatus('achieved')}
          disabled={busy}
          className="btn-primary !py-2.5 text-[13px]"
        >
          <Trophy className="h-4 w-4" /> Mark achieved
        </button>
        <button
          type="button"
          onClick={() => setStatus('dropped')}
          disabled={busy}
          className="btn-ghost !py-2.5 text-[13px]"
        >
          Drop it
        </button>
        <button
          type="button"
          onClick={remove}
          disabled={busy}
          className="btn-ghost !py-2.5 text-[13px] text-danger"
        >
          <Trash2 className="h-4 w-4" /> Delete
        </button>
      </div>
    </Modal>
  );
}

function Figure({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <p className="text-xl font-semibold text-ink-primary">{value}</p>
      <p className="text-[10.5px] text-ink-muted">{label}</p>
    </div>
  );
}

/** A handful of milestones per craft, in the shape people actually say them. */
const SUGGESTIONS: Record<string, string[]> = {
  student: [
    'Finish the syllabus for one subject',
    'Score above 80 in the next test',
    'Clear the backlog of unwatched lectures',
  ],
  aspirant: ['Finish one full mock series', 'Cover the whole syllabus once'],
  engineer: [
    'Ship the side project people can use',
    'Switch jobs — offer in hand',
    'Finish the system design course',
  ],
  singer: ['Record one song end to end', 'Perform in front of people'],
  writer: ['Finish the first draft', 'Publish four pieces'],
  artist: ['Complete a series of ten', 'Hold a small show'],
  athlete: ['Run the distance without stopping', 'Hit the lift target'],
  entrepreneur: ['Get the first ten paying users', 'Launch the thing'],
  business: ['Get the first ten paying customers', 'Launch the thing'],
  teacher: ['Build the course and teach it once'],
  job_seeker: ['Send twenty real applications', 'Get to a final round'],
};

const FALLBACK_IDEAS = [
  'Finish the thing I keep restarting',
  'Learn it well enough to use it',
  'Build the habit for sixty days',
];

/**
 * Setting a milestone.
 *
 * The craft is chosen **here**, per milestone, rather than read from the
 * profile. People are not one thing: an engineer who also sings has an
 * engineering milestone and a singing one, and stamping both with the single
 * craft named at signup files half of somebody's life under the wrong heading
 * and offers them the wrong suggestions. The profile's craft is preselected,
 * so the ordinary case is still no clicks.
 */
function ComposeDialog({
  open,
  defaultCraft,
  onClose,
  onCreated,
}: {
  open: boolean;
  defaultCraft: string;
  onClose: () => void;
  onCreated: (milestone: Milestone) => void;
}) {
  const [craft, setCraft] = useState(defaultCraft);
  const [title, setTitle] = useState('');
  const [why, setWhy] = useState('');
  const [target, setTarget] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const ordered = useMemo(
    () => [
      ...PROFESSIONS.filter((p) => p.id === defaultCraft),
      ...PROFESSIONS.filter((p) => p.id !== defaultCraft),
    ],
    [defaultCraft]
  );

  const ideas = SUGGESTIONS[craft] ?? FALLBACK_IDEAS;

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    const text = title.trim();
    if (!text || busy) return;

    setBusy(true);
    setError(null);
    try {
      const created = await createMilestone({
        title: text,
        why: why.trim(),
        craft,
        // A date-only input has no timezone; treating it as local midnight is
        // what makes "by the 30th" mean the 30th where the member lives.
        targetDate: target ? new Date(`${target}T00:00:00`).toISOString() : null,
      });
      setTitle('');
      setWhy('');
      setTarget('');
      onCreated(created);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save that.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} label="New milestone" wide>
      <form onSubmit={submit}>
        <h2 className="flex items-center gap-2 text-[17px] font-semibold text-ink-primary">
          <Target className="h-4 w-4 text-primary-light" /> What are you trying to
          finish?
        </h2>
        <p className="mt-1.5 text-[13px] leading-relaxed text-ink-secondary">
          Something you could hold up and say — that is done. The steps come
          after.
        </p>

        <p className="mt-5 text-[12px] font-semibold text-ink-secondary">
          Which part of your life?
        </p>
        <p className="mt-1 text-[11.5px] leading-relaxed text-ink-muted">
          Milestones are grouped by this, and the suggestions follow it. You can
          run one for each.
        </p>
        <div className="mt-2.5 flex flex-wrap gap-2">
          {ordered.map((profession) => {
            const on = profession.id === craft;
            return (
              <button
                key={profession.id}
                type="button"
                aria-pressed={on}
                onClick={() => setCraft(profession.id)}
                className={`inline-flex items-center gap-1.5 rounded-pill border px-3 py-2 text-[12.5px] transition ${
                  on
                    ? 'border-primary bg-primary/20 font-semibold text-primary-light'
                    : 'border-hairline bg-bg-card/50 text-ink-secondary hover:border-primary/50 hover:text-ink-primary'
                }`}
              >
                <span aria-hidden="true">{profession.emoji}</span>
                {profession.label}
              </button>
            );
          })}
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          {ideas.map((idea) => (
            <button
              key={idea}
              type="button"
              onClick={() => setTitle(idea)}
              className="rounded-pill border border-hairline bg-white/[0.04] px-3 py-2 text-[12px] text-ink-secondary transition hover:border-primary/50 hover:text-ink-primary"
            >
              {idea}
            </button>
          ))}
        </div>

        <label className="mt-5 block text-[12px] font-semibold text-ink-secondary">
          The milestone
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            maxLength={200}
            required
            placeholder="Ship the side project"
            className="field mt-1.5 w-full"
          />
        </label>

        <label className="mt-4 block text-[12px] font-semibold text-ink-secondary">
          Why it matters (optional)
          <textarea
            value={why}
            onChange={(event) => setWhy(event.target.value)}
            maxLength={1000}
            rows={2}
            placeholder="So I can apply with something real"
            className="field mt-1.5 w-full resize-y"
          />
        </label>

        <label className="mt-4 block text-[12px] font-semibold text-ink-secondary">
          <span className="flex items-center gap-1.5">
            <CalendarDays className="h-3.5 w-3.5" /> By when? (optional)
          </span>
          <input
            type="date"
            value={target}
            onChange={(event) => setTarget(event.target.value)}
            className="field mt-1.5 w-full"
          />
        </label>
        <p className="mt-1.5 text-[11.5px] text-ink-muted">
          Optional on purpose. Inventing a deadline for somebody is how an app
          starts lying about urgency.
        </p>

        {error && <p className="mt-4 text-[12.5px] text-danger">{error}</p>}

        <div className="mt-6 flex gap-2">
          <button
            type="submit"
            disabled={busy || !title.trim()}
            className="btn-primary !py-2.5"
          >
            {busy ? 'Saving…' : 'Set this milestone'}
          </button>
          <button type="button" onClick={onClose} className="btn-ghost !py-2.5">
            Cancel
          </button>
        </div>
      </form>
    </Modal>
  );
}
