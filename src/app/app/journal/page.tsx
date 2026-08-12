'use client';

import Link from 'next/link';
import { useCallback, useMemo, useState } from 'react';
import {
  Bed,
  ChevronDown,
  Pencil,
  Plus,
  Sparkles,
  Target,
  TrendingUp,
  X,
} from 'lucide-react';

import {
  DICTATION_LANGS,
  DictationButton,
  dictationSupported,
} from '@/components/app/Dictation';
import {
  AsyncSection,
  Card,
  ChipGroup,
  EmptyState,
  PageHeader,
  timeAgo,
  useApi,
} from '@/components/app/ui';
import { checkInLabel } from '@/content/checkin';
import {
  CHALLENGES,
  ENERGY_LEVELS,
  HABITS,
  INFLUENCES,
  MOODS,
  PRACTICES,
  labelFor,
  promptForToday,
} from '@/content/journal';
import {
  checklistFor,
  isKnownProfession,
  professionById,
  resolveHabitLabel,
} from '@/content/professions';
import { api, type Paged } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { localDayKey, todayKey, type Entry, type EntryDraft } from '@/lib/entries';

/**
 * The journal.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * What was missing, and why it mattered more than it looks
 *
 * This page used to offer six of the twenty-one fields the API stores and the
 * app writes. That is not a smaller version of the same feature — it is a
 * different one. Three things were actually broken by it:
 *
 * **The craft track had no way in.** `craftDone` and `craftMinutes` are what
 * answer "am I actually doing the thing I said I cared about", which is the
 * question mood charts and meditation minutes cannot. A member who journalled
 * on the web filled in none of it, so their consistency chart read as a month
 * of doing nothing.
 *
 * **Chips were a comma-separated text box.** `habitsDone` is a list of *ids*
 * shared with the app; typing "walked outside" stored a string the app has no
 * label for and no chart can group. Practices, influences and challenges had no
 * control at all.
 *
 * **Every entry was a new entry.** A POST per save meant a member who wrote in
 * the morning and added a line at night had two entries for one day — which
 * double-counts in `totalJournalEntries` and splits a day across two cells of
 * every chart. Today's entry is now PATCHed.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * The shape of the form
 *
 * Ported from `journal_screen.dart`: four numbered steps that can be finished in
 * under a minute, then three collapsed sections for the evenings somebody has
 * more to say. A blank page at 11pm is a question nobody is too tired to skip —
 * what helps is being asked something specific and being allowed to skip most of
 * it. Every field is optional, and an entry with one line in it counts as an
 * entry for the streak.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * Paging
 *
 * `/api/entries` returns a page and an opaque cursor. The list starts at thirty
 * and loads more on demand — a member two years in has seven hundred entries,
 * each carrying a dozen long-form prose fields.
 */

type Writable = {
  key: keyof EntryDraft;
  label: string;
  hint: string;
  rows?: number;
};

/** The three collapsed sections, in the app's order and with its wording. */
const SECTIONS: {
  key: string;
  title: string;
  summary: string;
  icon: React.ComponentType<{ className?: string }>;
  fields: Writable[];
}[] = [
  {
    key: 'growth',
    title: 'Habits & direction',
    summary: 'What you are building, and what you are putting down',
    icon: TrendingUp,
    fields: [
      {
        key: 'newHabit',
        label: 'A habit you are building',
        hint: 'What are you trying to make normal?',
      },
      {
        key: 'tinyStep',
        label: 'The smallest step you took',
        hint: 'Tiny counts. Tiny is the whole method.',
      },
      {
        key: 'badHabit',
        label: 'A habit you are letting go of',
        hint: 'Name it without beating yourself up about it.',
      },
      {
        key: 'visualization',
        label: 'Where this is going',
        hint: 'Describe the day you are working towards…',
        rows: 3,
      },
    ],
  },
  {
    key: 'mind',
    title: 'Mind & inner work',
    summary: 'The thought that caught you, and what you told yourself',
    icon: Sparkles,
    fields: [
      {
        key: 'triggerThought',
        label: 'A thought that pulled you down',
        hint: 'What went through your head?',
      },
      {
        key: 'triggerResponse',
        label: 'A kinder way to answer it',
        hint: 'What would you say to a friend who thought this?',
        rows: 2,
      },
      {
        key: 'affirmations',
        label: 'What you want to keep telling yourself',
        hint: 'In your own words, not borrowed ones…',
        rows: 3,
      },
      {
        // Stored as `shivBabaLine`, which only made sense inside one tradition.
        // The field name stays — a decade of entries are filed under it — and
        // only the words on screen changed, so a member of any faith or none can
        // answer it honestly.
        key: 'shivBabaLine',
        label: 'A line that stayed with you',
        hint: 'From scripture, a book, a talk, a song — anything.',
        rows: 2,
      },
    ],
  },
  {
    key: 'night',
    title: 'Night & rest',
    summary: 'How the day is ending, and how last night went',
    icon: Bed,
    fields: [
      {
        key: 'nightRoutine',
        label: "Tonight's plan",
        hint: 'How do you want the last hour of today to go?',
        rows: 2,
      },
      {
        key: 'sleepReflection',
        label: "Last night's sleep",
        hint: 'How did you sleep? Any dreams worth keeping?',
        rows: 2,
      },
    ],
  },
];

export default function JournalPage() {
  const { profile, refreshProfile } = useAuth();
  const [editing, setEditing] = useState<Entry | null | 'new'>(null);
  const [cursor, setCursor] = useState<string | null>(null);
  const [older, setOlder] = useState<Entry[]>([]);
  const [loadingMore, setLoadingMore] = useState(false);

  const state = useApi(
    () => api.get<Paged<Entry, 'entries'>>('/api/entries', { limit: 30 }),
    []
  );

  const entries = useMemo(
    () => [...(state.data?.entries ?? []), ...older],
    [state.data, older]
  );

  /**
   * Today's entry, if there is one.
   *
   * Found on the loaded page rather than requested: the list is newest-first and
   * today's is the first row when it exists. It decides whether "Write today"
   * opens a blank form or reopens what is already there — which is the whole of
   * the fix for one day producing two entries.
   */
  const today = useMemo(
    () => entries.find((entry) => localDayKey(entry.createdAt) === todayKey()) ?? null,
    [entries]
  );

  async function loadMore() {
    const next = cursor ?? state.data?.nextCursor;
    if (!next) return;

    setLoadingMore(true);
    try {
      const body = await api.get<Paged<Entry, 'entries'>>('/api/entries', {
        limit: 30,
        cursor: next,
      });
      setOlder((current) => [...current, ...body.entries]);
      setCursor(body.nextCursor);
    } finally {
      setLoadingMore(false);
    }
  }

  const done = useCallback(async () => {
    setEditing(null);
    setOlder([]);
    setCursor(null);
    await state.reload();
    await refreshProfile();
  }, [state, refreshProfile]);

  const open = editing === 'new' ? null : editing;
  const composing = editing !== null;

  return (
    <>
      <PageHeader
        title="Your journal"
        subtitle="Only you can read this. Every field is optional — one line still counts."
        action={
          <button
            type="button"
            onClick={() => setEditing(composing ? null : today ?? 'new')}
            className={composing ? 'btn-ghost !py-2.5' : 'btn-primary !py-2.5'}
          >
            {composing ? (
              <>
                <X className="h-4 w-4" /> Close
              </>
            ) : today ? (
              <>
                <Pencil className="h-4 w-4" /> Add to today
              </>
            ) : (
              <>
                <Plus className="h-4 w-4" /> Write today
              </>
            )}
          </button>
        }
      />

      {!composing && (
        <Card className="mb-5 border-primary/25 bg-primary/10">
          <p className="text-[13.5px] italic leading-relaxed text-ink-secondary">
            {promptForToday()}
          </p>
        </Card>
      )}

      {composing && (
        <EntryComposer
          key={open?._id ?? 'new'}
          existing={open}
          profession={profile?.profession ?? null}
          customHabits={profile?.customHabits ?? []}
          onDone={done}
        />
      )}

      <AsyncSection state={state}>
        {(data) => {
          if (entries.length === 0) {
            return (
              <EmptyState
                title="Nothing here yet"
                body="Your first entry can be one line about how today went. The pattern only shows up after a couple of weeks, so the point is starting rather than writing well."
                action={
                  <button
                    type="button"
                    onClick={() => setEditing('new')}
                    className="btn-primary"
                  >
                    Write the first one
                  </button>
                }
              />
            );
          }

          const hasMore = cursor !== null || (older.length === 0 && data.hasMore);

          return (
            <div className="space-y-3">
              {entries.map((entry) => (
                <EntryCard
                  key={entry._id}
                  entry={entry}
                  profession={profile?.profession ?? null}
                  customHabits={profile?.customHabits ?? []}
                  onEdit={() => setEditing(entry)}
                />
              ))}

              {hasMore && (
                <button
                  type="button"
                  onClick={loadMore}
                  disabled={loadingMore}
                  className="btn-ghost w-full"
                >
                  {loadingMore ? 'Loading…' : 'Load older entries'}
                </button>
              )}
            </div>
          );
        }}
      </AsyncSection>
    </>
  );
}

// ─────────────────────────── reading one back ───────────────────────────

/**
 * One entry as it was written.
 *
 * Only what has something in it is rendered. An earlier version listed every
 * field, so a good day that happened to be recorded in three lines came back as
 * a page of "(empty)" — which reads as a reproach rather than as a record.
 */
function EntryCard({
  entry,
  profession,
  customHabits,
  onEdit,
}: {
  entry: Entry;
  profession: string | null;
  customHabits: { id: string; label: string }[];
  onEdit: () => void;
}) {
  const mood = MOODS.find((item) => item.value === entry.mood);
  const isToday = localDayKey(entry.createdAt) === todayKey();

  const chipRows: [string, string[]][] = (
    [
      ['Energy', (entry.energyLevel ? [entry.energyLevel] : []).map((id) => labelFor(ENERGY_LEVELS, id))],
      ['Practices', (entry.practices ?? []).map((id) => labelFor(PRACTICES, id))],
      ['What shaped the day', (entry.influences ?? []).map((id) => labelFor(INFLUENCES, id))],
      ['Went right', (entry.habitsDone ?? []).map((id) => labelFor(HABITS, id))],
      ['Pulled at you', (entry.challenges ?? []).map((id) => labelFor(CHALLENGES, id))],
      [
        'Craft',
        (entry.craftDone ?? []).map((id) =>
          resolveHabitLabel(profession, id, customHabits)
        ),
      ],
    ] as [string, string[]][]
  ).filter(([, values]) => values.length > 0);

  const written: [string, string][] = (
    [
      ['About the day', entry.bestMoment],
      ['A habit being built', entry.newHabit],
      ['The smallest step', entry.tinyStep],
      ['A habit being let go', entry.badHabit],
      ['Where this is going', entry.visualization],
      ['A thought that pulled down', entry.triggerThought],
      ['A kinder answer', entry.triggerResponse],
      ['Kept telling myself', entry.affirmations],
      ['A line that stayed', entry.shivBabaLine],
      ["Tonight's plan", entry.nightRoutine],
      ["Last night's sleep", entry.sleepReflection],
    ] as [string, string | undefined][]
  ).filter((row): row is [string, string] => Boolean(row[1]?.trim()));

  const checkIn = Object.entries(entry.checkIn ?? {}).filter(([, value]) =>
    Boolean(value?.trim())
  );

  const empty =
    chipRows.length === 0 && written.length === 0 && checkIn.length === 0;

  return (
    <Card>
      <div className="mb-3 flex items-center gap-3">
        {mood && (
          <span
            className={`flex h-9 w-9 items-center justify-center rounded-md text-base ${mood.color}`}
            title={mood.label}
          >
            {mood.emoji}
          </span>
        )}
        <div className="min-w-0">
          <p className="text-[13px] font-medium text-ink-primary">
            {new Date(entry.createdAt).toLocaleDateString('en-IN', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
            })}
          </p>
          <p className="text-[11px] text-ink-muted">
            {timeAgo(entry.createdAt)}
            {mood ? ` · ${mood.label}` : ''}
            {(entry.craftMinutes ?? 0) > 0 ? ` · ${entry.craftMinutes} min of work` : ''}
          </p>
        </div>

        {/* Only today's is editable. An entry from March is a record of what
            somebody thought in March; the ability to rewrite it quietly turns a
            journal into a draft. */}
        {isToday && (
          <button
            type="button"
            onClick={onEdit}
            className="ml-auto inline-flex items-center gap-1.5 rounded-pill border border-hairline px-3 py-1.5 text-[11.5px] text-ink-muted transition hover:border-primary/50 hover:text-ink-primary"
          >
            <Pencil className="h-3 w-3" /> Add more
          </button>
        )}
      </div>

      {chipRows.length > 0 && (
        <div className="mb-3 space-y-2">
          {chipRows.map(([label, values]) => (
            <div key={label} className="flex flex-wrap items-baseline gap-x-2 gap-y-1.5">
              <span className="text-[10px] uppercase tracking-wide text-ink-muted">
                {label}
              </span>
              {values.map((value) => (
                <span key={value} className="chip !py-0.5 text-[11px]">
                  {value}
                </span>
              ))}
            </div>
          ))}
        </div>
      )}

      {(written.length > 0 || checkIn.length > 0) && (
        <dl className="space-y-2.5">
          {written.map(([label, value]) => (
            <div key={label}>
              <dt className="text-[10px] uppercase tracking-wide text-ink-muted">
                {label}
              </dt>
              <dd className="mt-0.5 whitespace-pre-wrap text-[13px] leading-relaxed text-ink-secondary">
                {value}
              </dd>
            </div>
          ))}

          {checkIn.map(([id, value]) => (
            <div key={id}>
              <dt className="text-[10px] uppercase tracking-wide text-ink-muted">
                {checkInLabel(id)}
              </dt>
              <dd className="mt-0.5 whitespace-pre-wrap text-[13px] leading-relaxed text-ink-secondary">
                {value}
              </dd>
            </div>
          ))}
        </dl>
      )}

      {empty && (
        <p className="text-[12.5px] italic text-ink-muted">
          Mood only — which is a complete entry.
        </p>
      )}
    </Card>
  );
}

// ─────────────────────────── writing one ───────────────────────────

function EntryComposer({
  existing,
  profession,
  customHabits,
  onDone,
}: {
  existing: Entry | null;
  profession: string | null;
  customHabits: { id: string; label: string }[];
  onDone: () => void;
}) {
  /**
   * The whole entry in one object.
   *
   * Twenty-one fields as twenty-one `useState` calls would be twenty-one
   * setters threaded through four components. One draft and one `set` keeps the
   * composer's plumbing to a line, and makes "send only what changed" a filter
   * rather than a list somebody has to remember to extend.
   */
  const [draft, setDraft] = useState<EntryDraft>(() => ({ ...(existing ?? {}) }));
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Dictation language, chosen once for the whole entry.
   *
   * Per-field would be a dozen selects for a choice nobody changes mid-entry.
   * The Hindi option is not decoration: a good half of what gets written here is
   * written in Hindi or Hinglish, and a recogniser set to `en-IN` transcribes
   * Hindi as nonsense rather than failing, which is worse than not offering it.
   */
  const [lang, setLang] = useState<string>(DICTATION_LANGS[0].value);

  const set = useCallback(
    <K extends keyof EntryDraft>(key: K, value: EntryDraft[K]) =>
      setDraft((current) => ({ ...current, [key]: value })),
    []
  );

  const craft = professionById(profession);
  const hasCraft = isKnownProfession(profession);
  const checklist = useMemo(
    () => checklistFor(profession, customHabits.map((h) => ({ ...h, emoji: '✅' }))),
    [profession, customHabits]
  );

  async function save() {
    setBusy(true);
    setError(null);

    try {
      /**
       * Only what has something in it is sent.
       *
       * The API validates each field against a schema and stores what it is
       * given, so posting empty strings would store empty strings and make
       * every entry read back as half-filled. Empty arrays are kept when the
       * entry already exists — clearing a chip row has to be able to clear it.
       */
      const body: Record<string, unknown> = {};

      const put = (key: keyof EntryDraft, value: unknown) => {
        if (typeof value === 'string') {
          const trimmed = value.trim();
          if (trimmed || existing) body[key] = trimmed;
          return;
        }
        if (Array.isArray(value)) {
          if (value.length || existing) body[key] = value;
          return;
        }
        if (typeof value === 'number' && (value > 0 || existing)) body[key] = value;
      };

      if (draft.mood) body.mood = draft.mood;

      for (const key of [
        'newHabit',
        'tinyStep',
        'badHabit',
        'affirmations',
        'visualization',
        'nightRoutine',
        'triggerThought',
        'triggerResponse',
        'bestMoment',
        'shivBabaLine',
        'sleepReflection',
        'energyLevel',
      ] as const) {
        put(key, draft[key] ?? '');
      }

      for (const key of [
        'practices',
        'influences',
        'habitsDone',
        'challenges',
        'craftDone',
      ] as const) {
        put(key, draft[key] ?? []);
      }

      put('craftMinutes', draft.craftMinutes ?? 0);

      if (Object.keys(body).length === 0) {
        setError('Add at least a mood or one line.');
        setBusy(false);
        return;
      }

      // PATCH when today already has an entry. A second POST would give one day
      // two entries, which double-counts the total and splits the day across two
      // cells of every chart drawn from this data.
      if (existing) await api.patch(`/api/entries/${existing._id}`, body);
      else await api.post('/api/entries', body);

      onDone();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save that.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card className="mb-5">
      {dictationSupported() && (
        <div className="mb-5 flex flex-wrap items-center gap-2 rounded-md border border-hairline bg-bg-dark/40 px-3 py-2.5">
          <p className="text-[12px] text-ink-secondary">
            Too tired to type? Speak it instead — there is a mic on every box.
          </p>
          <select
            aria-label="Dictation language"
            className="ml-auto rounded-md border border-hairline bg-bg-dark/60 px-2.5 py-1 text-[12px] text-ink-secondary focus:border-primary focus:outline-none"
            value={lang}
            onChange={(event) => setLang(event.target.value)}
          >
            {DICTATION_LANGS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* ── 1 · mood ── */}
      <Step number={1} title="How are you today?" subtitle="One tap. This is the part that matters most.">
        <div className="flex gap-2">
          {MOODS.map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => set('mood', draft.mood === item.value ? undefined : item.value)}
              aria-pressed={draft.mood === item.value}
              className={`flex h-14 flex-1 flex-col items-center justify-center gap-0.5 rounded-md text-lg transition ${
                draft.mood === item.value
                  ? `${item.color} shadow-soft`
                  : 'border border-hairline bg-bg-dark/50 opacity-60 hover:opacity-100'
              }`}
            >
              <span>{item.emoji}</span>
              <span className="text-[9px] font-medium text-ink-primary">
                {item.label}
              </span>
            </button>
          ))}
        </div>
      </Step>

      {/* ── 2 · the one line ── */}
      <Step
        number={2}
        title="Say something about today"
        subtitle="Type it, or tap the mic and just speak."
      >
        <WriteField
          label=""
          value={draft.bestMoment ?? ''}
          onChange={(value) => set('bestMoment', value)}
          placeholder="Anything at all. One sentence is a complete entry."
          rows={4}
          lang={lang}
        />
      </Step>

      {/* ── 3 · the chips ── */}
      <Step number={3} title="Tap what fits" subtitle="Twenty seconds. Nothing here is required.">
        <div className="space-y-4">
          <ChipField label="Energy today" hint="pick one">
            <ChipGroup
              options={ENERGY_LEVELS}
              selected={draft.energyLevel ? [draft.energyLevel] : []}
              onChange={(next) => set('energyLevel', next[0] ?? '')}
              single
              ariaLabel="Energy today"
            />
          </ChipField>

          <ChipField label="Practices" hint="tap any">
            <ChipGroup
              options={PRACTICES}
              selected={draft.practices ?? []}
              onChange={(next) => set('practices', next)}
              ariaLabel="Practices"
            />
          </ChipField>

          <ChipField label="What shaped today" hint="tap any">
            <ChipGroup
              options={INFLUENCES}
              selected={draft.influences ?? []}
              onChange={(next) => set('influences', next)}
              ariaLabel="What shaped today"
            />
          </ChipField>

          <ChipField label="Things that went right" hint="tap any">
            <ChipGroup
              options={HABITS}
              selected={draft.habitsDone ?? []}
              onChange={(next) => set('habitsDone', next)}
              ariaLabel="Things that went right"
            />
          </ChipField>

          <ChipField label="What pulled at you" hint="tap any">
            <ChipGroup
              options={CHALLENGES}
              selected={draft.challenges ?? []}
              onChange={(next) => set('challenges', next)}
              ariaLabel="What pulled at you"
            />
          </ChipField>
        </div>
      </Step>

      {/* ── 4 · the craft ──
          Before a member has named one this is an invitation rather than an
          empty grid: a card of chips for a profession nobody chose is noise. */}
      {hasCraft ? (
        <Step
          number={4}
          title={`Any ${craft.workWord} today?`}
          subtitle="This is the one that builds your consistency chart."
        >
          <ChipGroup
            options={checklist}
            selected={draft.craftDone ?? []}
            onChange={(next) => set('craftDone', next)}
            ariaLabel={`Today's ${craft.workWord}`}
          />

          {(draft.craftDone?.length ?? 0) > 0 && (
            <div className="mt-4 flex items-center gap-3">
              <label htmlFor="craft-minutes" className="text-[12.5px] text-ink-secondary">
                How long?
              </label>
              <input
                id="craft-minutes"
                inputMode="numeric"
                className="w-20 rounded-sm border border-hairline bg-bg-dark/60 px-2 py-2 text-center text-[14px] font-semibold text-ink-primary focus:border-primary focus:outline-none"
                placeholder="—"
                value={draft.craftMinutes ? String(draft.craftMinutes) : ''}
                onChange={(event) => {
                  // Clamped to the API's own ceiling of one day. A typo of
                  // "600000" would otherwise be a 400 at save time, several
                  // fields after the mistake was made.
                  const minutes = Number(event.target.value.replace(/\D/g, ''));
                  set('craftMinutes', Math.min(minutes || 0, 1440));
                }}
              />
              <span className="text-[12px] text-ink-muted">minutes</span>
            </div>
          )}
        </Step>
      ) : (
        <div className="mb-6 rounded-lg border border-primary/30 bg-primary/[0.07] p-4">
          <p className="flex items-center gap-2 text-[14.5px] font-semibold text-ink-primary">
            <Target className="h-4 w-4 text-primary-light" />
            What are you trying to get good at?
          </p>
          <p className="mt-1.5 text-[12px] leading-relaxed text-ink-muted">
            Singing, writing, studying, building something. Name it once and this
            journal starts showing whether you are actually doing it.
          </p>
          <Link href="/app/profile" className="btn-ghost mt-3 !py-2 text-[12.5px]">
            Set it up — takes 20 seconds
          </Link>
        </div>
      )}

      {/* ── the rest, folded away ── */}
      <p className="text-[14px] font-semibold text-ink-primary">
        If you have more to say
      </p>
      <p className="mb-3 mt-0.5 text-[12px] text-ink-muted">
        Open any of these on the evenings you have more to say.
      </p>

      <div className="space-y-2">
        {SECTIONS.map((section) => {
          const filled = section.fields.filter((field) =>
            String(draft[field.key] ?? '').trim()
          ).length;
          const open = openSections[section.key] ?? false;
          const Glyph = section.icon;

          return (
            <div
              key={section.key}
              className="overflow-hidden rounded-md border border-hairline"
            >
              <button
                type="button"
                onClick={() =>
                  setOpenSections((current) => ({
                    ...current,
                    [section.key]: !open,
                  }))
                }
                aria-expanded={open}
                className="flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-bg-card/60"
              >
                <Glyph className="h-4 w-4 shrink-0 text-primary-light" />
                <span className="min-w-0 flex-1">
                  <span className="block text-[13.5px] font-medium text-ink-primary">
                    {section.title}
                  </span>
                  <span className="block text-[11.5px] text-ink-muted">
                    {section.summary}
                  </span>
                </span>
                <span className="shrink-0 text-[11px] tabular-nums text-ink-muted">
                  {filled}/{section.fields.length}
                </span>
                <ChevronDown
                  className={`h-4 w-4 shrink-0 text-ink-muted transition-transform ${
                    open ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {open && (
                <div className="space-y-3 border-t border-hairline p-4">
                  {section.fields.map((field) => (
                    <WriteField
                      key={String(field.key)}
                      label={field.label}
                      value={String(draft[field.key] ?? '')}
                      onChange={(value) => set(field.key, value as never)}
                      placeholder={field.hint}
                      rows={field.rows ?? 2}
                      lang={lang}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {error && (
        <p
          role="alert"
          className="mt-4 rounded-md border border-danger/40 bg-danger/10 px-3 py-2 text-[12.5px] text-ink-secondary"
        >
          {error}
        </p>
      )}

      <button
        type="button"
        onClick={save}
        disabled={busy}
        className="btn-primary mt-5 w-full"
      >
        {busy ? 'Saving…' : existing ? 'Update today' : 'Save entry'}
      </button>

      {existing && (
        <p className="mt-2 text-center text-[11.5px] text-ink-muted">
          Adding to the entry you already started today rather than writing a
          second one.
        </p>
      )}
    </Card>
  );
}

// ─────────────────────────── pieces ───────────────────────────

/**
 * A numbered step.
 *
 * The number is what turns a wall of fields into a short, obviously-finishable
 * sequence — the same trick the app plays, and the reason people get to the end
 * of this form rather than abandoning it at the third text box.
 */
function Step({
  number,
  title,
  subtitle,
  children,
}: {
  number: number;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-6">
      <div className="mb-3 flex items-start gap-3">
        <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/20 text-[11.5px] font-bold text-primary-light">
          {number}
        </span>
        <div>
          <h2 className="text-[14.5px] font-semibold text-ink-primary">{title}</h2>
          <p className="mt-0.5 text-[12px] text-ink-muted">{subtitle}</p>
        </div>
      </div>
      {children}
    </section>
  );
}

function ChipField({
  label,
  hint,
  children,
}: {
  label: string;
  hint: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="mb-2 text-[11px] uppercase tracking-wide text-ink-muted">
        {label} <span className="normal-case tracking-normal">· {hint}</span>
      </p>
      {children}
    </div>
  );
}

/**
 * One prompt, typed or spoken.
 *
 * Dictation appends to whatever is already in the box rather than replacing it,
 * so somebody can type half a sentence, dictate the rest, and correct it by hand
 * afterwards. The interim text — what the recogniser thinks is being said right
 * now — is shown underneath in grey rather than written into the field, because
 * interim results are revised as you speak and appending them puts every
 * hesitation into the entry twice.
 */
function WriteField({
  label,
  value,
  onChange,
  placeholder,
  rows = 2,
  lang,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  lang?: string;
}) {
  const id = `entry-${(label || placeholder || 'field')
    .replace(/\W+/g, '-')
    .toLowerCase()}`;
  const [interim, setInterim] = useState('');

  const append = useCallback(
    (text: string) => {
      if (!text) return;
      onChange(value ? `${value.replace(/\s+$/, '')} ${text}`.trim() : text);
    },
    // `value` is a dependency on purpose: the callback has to close over the
    // current text, or two dictated sentences overwrite each other.
    [value, onChange]
  );

  return (
    <div>
      <div className="mb-1.5 flex items-center gap-2">
        {label && (
          <label htmlFor={id} className="text-[12px] font-medium text-ink-secondary">
            {label}
          </label>
        )}
        <span className="ml-auto">
          <DictationButton
            lang={lang}
            onFinal={append}
            onInterim={setInterim}
            label="Speak"
          />
        </span>
      </div>

      <textarea
        id={id}
        rows={rows}
        className="field resize-y"
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
      />

      {interim && (
        <p className="mt-1 text-[12px] italic text-ink-muted" aria-live="polite">
          {interim}…
        </p>
      )}
    </div>
  );
}
