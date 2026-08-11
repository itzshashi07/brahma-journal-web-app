import { Icon } from './Icon';
import type { MockupKind } from '@/content/features';

/**
 * The app, drawn in the browser.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * Why these are markup and not screenshots
 *
 * A landing page for an app needs to show the app. The obvious way is a PNG per
 * screen, and it is the wrong way here for four reasons:
 *
 *   • **Weight.** Nine screenshots at a readable resolution is a couple of
 *     megabytes on a page being loaded over Indian mobile data by somebody who
 *     has not decided to care yet. These are a few kilobytes of HTML that
 *     compress to almost nothing.
 *   • **Text.** A screenshot is opaque to a crawler. The words inside these —
 *     the prompts, the labels, the copy — are real text on the page, indexed
 *     with it.
 *   • **Sharpness.** They are vector-crisp on every display, which a raster
 *     screenshot scaled into a phone frame is not.
 *   • **Drift.** A screenshot is a photograph of a build. It goes stale
 *     silently, and nobody notices until the marketing site is showing a UI
 *     that shipped a year ago.
 *
 * They are honest representations of the real screens rather than invented
 * ones — same layout, same copy, same colours from `app_theme.dart`. If a real
 * screenshot is ever wanted for the Play Store listing, it can be taken from
 * the running app; this is for the web page.
 */

function Frame({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative mx-auto w-[268px] shrink-0 select-none sm:w-[300px]">
      {/* Ambient bloom, so the device sits in the page rather than on it. */}
      <div
        className="absolute -inset-8 -z-10 rounded-full bg-primary/20 blur-3xl"
        aria-hidden="true"
      />

      <div className="rounded-[2.5rem] border border-hairline bg-bg-card p-2 shadow-soft">
        <div className="relative overflow-hidden rounded-[2rem] bg-bg-dark">
          {/* Notch */}
          <div className="absolute left-1/2 top-0 z-10 h-5 w-24 -translate-x-1/2 rounded-b-2xl bg-bg-card" />

          <div className="min-h-[460px] bg-gradient-to-b from-bg-dark via-bg-card to-bg-surface px-4 pb-5 pt-8">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatusBar({ title }: { title: string }) {
  return (
    <div className="mb-4 flex items-center justify-between">
      <p className="text-[13px] font-semibold text-ink-primary">{title}</p>
      <div className="flex items-center gap-1">
        <Icon name="Flame" className="h-3 w-3 text-accent" />
        <span className="text-[10px] font-semibold text-accent">12</span>
      </div>
    </div>
  );
}

function Card({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-md border border-hairline bg-bg-card/70 p-3 ${className}`}
    >
      {children}
    </div>
  );
}

/** The five-point mood scale, in the app's own colours. */
function MoodRow({ selected = 3 }: { selected?: number }) {
  const moods = [
    { emoji: '😔', color: 'bg-mood-verySad' },
    { emoji: '🙁', color: 'bg-mood-sad' },
    { emoji: '😐', color: 'bg-mood-neutral' },
    { emoji: '🙂', color: 'bg-mood-happy' },
    { emoji: '😊', color: 'bg-mood-veryHappy' },
  ];

  return (
    <div className="flex items-center justify-between gap-1.5">
      {moods.map((mood, index) => (
        <div
          key={mood.emoji}
          className={`flex h-9 flex-1 items-center justify-center rounded-sm text-base transition ${
            index === selected - 1
              ? `${mood.color} shadow-soft`
              : 'bg-bg-dark/70 opacity-50'
          }`}
        >
          {mood.emoji}
        </div>
      ))}
    </div>
  );
}

function Journal() {
  return (
    <>
      <StatusBar title="Today" />
      <div className="space-y-2.5">
        <Card>
          <p className="mb-2 text-[10px] uppercase tracking-wide text-ink-muted">
            How did today feel?
          </p>
          <MoodRow selected={4} />
        </Card>

        <Card>
          <p className="mb-2 text-[10px] uppercase tracking-wide text-ink-muted">
            Habits kept
          </p>
          <div className="space-y-1.5">
            {[
              ['Sat for 5 minutes', true],
              ['Walked outside', true],
              ['Phone away after 11', false],
            ].map(([label, done]) => (
              <div key={label as string} className="flex items-center gap-2">
                <span
                  className={`flex h-4 w-4 items-center justify-center rounded-[5px] text-[9px] ${
                    done
                      ? 'bg-success text-bg-dark'
                      : 'border border-hairline text-transparent'
                  }`}
                >
                  ✓
                </span>
                <span
                  className={`text-[11px] ${
                    done ? 'text-ink-secondary' : 'text-ink-muted'
                  }`}
                >
                  {label as string}
                </span>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <p className="mb-1.5 text-[10px] uppercase tracking-wide text-ink-muted">
            What pulled at you?
          </p>
          <p className="text-[11px] leading-relaxed text-ink-secondary">
            The message I still have not answered. Left it again.
          </p>
        </Card>

        <Card>
          <p className="mb-1.5 text-[10px] uppercase tracking-wide text-ink-muted">
            Best moment
          </p>
          <p className="text-[11px] leading-relaxed text-ink-secondary">
            Ten minutes on the balcony before anyone was up.
          </p>
        </Card>
      </div>
    </>
  );
}

function Meditation() {
  return (
    <>
      <StatusBar title="Breathe" />
      <div className="flex flex-col items-center pt-6">
        <div className="relative flex h-36 w-36 items-center justify-center">
          <div className="absolute inset-0 animate-breathe rounded-full bg-primary/30 blur-xl" />
          <div className="absolute inset-3 animate-breathe rounded-full border border-primary-light/40" />
          <div className="relative text-center">
            <p className="text-2xl font-semibold text-ink-primary">05:00</p>
            <p className="text-[10px] uppercase tracking-widest text-ink-muted">
              breathe out
            </p>
          </div>
        </div>

        <p className="mt-6 px-3 text-center text-[11px] leading-relaxed text-ink-secondary">
          Breathing in, I am here.
          <br />
          Breathing out, I am here.
        </p>

        <div className="mt-6 flex w-full gap-1.5">
          {['5', '10', '20', '30'].map((minutes, index) => (
            <div
              key={minutes}
              className={`flex-1 rounded-pill py-1.5 text-center text-[10px] font-semibold ${
                index === 0
                  ? 'bg-gradient-primary text-white'
                  : 'border border-hairline text-ink-muted'
              }`}
            >
              {minutes}m
            </div>
          ))}
        </div>

        <Card className="mt-3 w-full">
          <p className="text-[10px] uppercase tracking-wide text-ink-muted">
            Banked this month
          </p>
          <p className="mt-0.5 text-sm font-semibold text-accent">142 minutes</p>
        </Card>
      </div>
    </>
  );
}

function Affirmations() {
  return (
    <>
      <StatusBar title="Affirmations" />
      <div className="space-y-2.5">
        <div className="relative overflow-hidden rounded-md border border-hairline p-4">
          <div className="absolute inset-0 bg-gradient-primary opacity-30" />
          <p className="relative text-[13px] font-medium leading-relaxed text-ink-primary">
            &ldquo;I am allowed to be a work in progress and worth something
            today.&rdquo;
          </p>
          <div className="relative mt-3 flex items-center justify-between">
            <span className="text-[10px] text-ink-secondary">
              48 repetitions
            </span>
            <span className="rounded-pill bg-bg-dark/60 px-2 py-0.5 text-[10px] text-accent-light">
              tap to count
            </span>
          </div>
        </div>

        {[
          'Nobody is thinking about it as much as I am.',
          'I can do the small version today.',
        ].map((line) => (
          <Card key={line}>
            <p className="text-[11px] leading-relaxed text-ink-secondary">
              &ldquo;{line}&rdquo;
            </p>
          </Card>
        ))}

        <div className="rounded-md border border-dashed border-hairline p-3 text-center">
          <p className="text-[11px] text-ink-muted">+ Write your own</p>
        </div>
      </div>
    </>
  );
}

function Thoughts() {
  const posts = [
    {
      name: 'Quiet Voice',
      color: '#8B5CF6',
      body: 'Everyone at home thinks I am fine because I am functioning. Functioning is not the same thing and I do not know how to say that.',
      replies: 4,
    },
    {
      name: 'Night Thinker',
      color: '#06B6D4',
      body: 'Third night this week I have been awake at 3. Nothing is even wrong.',
      replies: 7,
    },
    {
      name: 'Small Fire',
      color: '#F59E0B',
      body: 'Told someone today. It was not as bad as I had built it up to be.',
      replies: 2,
    },
  ];

  return (
    <>
      <StatusBar title="Reflections" />
      <div className="space-y-2.5">
        {posts.map((post) => (
          <Card key={post.name}>
            <div className="mb-1.5 flex items-center gap-1.5">
              <span
                className="h-4 w-4 rounded-full"
                style={{ backgroundColor: post.color }}
              />
              <span className="text-[10px] font-semibold text-ink-secondary">
                {post.name}
              </span>
              <span className="ml-auto text-[9px] text-ink-muted">
                {post.replies} replies
              </span>
            </div>
            <p className="text-[11px] leading-relaxed text-ink-secondary">
              {post.body}
            </p>
          </Card>
        ))}
        <div className="rounded-pill bg-gradient-primary py-2 text-center text-[11px] font-semibold text-white">
          Say something anonymously
        </div>
      </div>
    </>
  );
}

function Community() {
  const rows = [
    ['Steady Hand', '68 days', true],
    ['Blue Hour', '54 days', false],
    ['First Light', '41 days', false],
    ['You', '12 days', false],
  ] as const;

  return (
    <>
      <StatusBar title="Community" />
      <div className="space-y-2.5">
        <Card className="bg-gradient-primary/20">
          <p className="text-[10px] uppercase tracking-wide text-ink-muted">
            Your streak
          </p>
          <p className="mt-0.5 text-2xl font-semibold text-ink-primary">
            12 <span className="text-xs font-normal text-ink-muted">days</span>
          </p>
          <p className="mt-1 text-[10px] text-accent-light">
            Longest ever: 31 days
          </p>
        </Card>

        <div className="space-y-1.5">
          {rows.map(([name, streak, top], index) => (
            <div
              key={name}
              className={`flex items-center gap-2 rounded-sm border border-hairline px-2.5 py-2 ${
                name === 'You' ? 'bg-primary/15' : 'bg-bg-card/50'
              }`}
            >
              <span
                className={`w-4 text-[10px] font-semibold ${
                  top ? 'text-accent' : 'text-ink-muted'
                }`}
              >
                {index + 1}
              </span>
              <span className="h-5 w-5 rounded-full bg-gradient-primary" />
              <span className="text-[11px] text-ink-secondary">{name}</span>
              <span className="ml-auto text-[10px] font-semibold text-ink-primary">
                {streak}
              </span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

function Counselling() {
  return (
    <>
      <StatusBar title="Your session" />
      <div className="space-y-2">
        <div className="rounded-sm border border-accent/30 bg-accent/10 px-2.5 py-1.5 text-center">
          <p className="text-[9px] text-accent-light">
            Deleted 2 hours after this ends
          </p>
        </div>

        <div className="max-w-[80%] rounded-md rounded-tl-sm bg-bg-card px-3 py-2">
          <p className="text-[11px] leading-relaxed text-ink-secondary">
            Take your time. What has this week been like?
          </p>
        </div>

        <div className="ml-auto max-w-[80%] rounded-md rounded-tr-sm bg-gradient-primary px-3 py-2">
          <p className="text-[11px] leading-relaxed text-white">
            Honestly I have been putting off saying any of this for months.
          </p>
        </div>

        <div className="max-w-[80%] rounded-md rounded-tl-sm bg-bg-card px-3 py-2">
          <p className="text-[11px] leading-relaxed text-ink-secondary">
            That is not unusual, and it is not a failure. Start wherever it is
            easiest.
          </p>
        </div>

        <div className="mt-3 flex items-center gap-2 rounded-pill border border-hairline bg-bg-dark/60 px-3 py-2">
          <span className="text-[11px] text-ink-muted">Write a message…</span>
          <span className="ml-auto h-5 w-5 rounded-full bg-gradient-primary" />
        </div>
      </div>
    </>
  );
}

function Sanctuary() {
  const articles = [
    ['Why the loop gets louder at night', 'Sleep'],
    ['The tiny-step rule', 'Habits'],
    ['Nobody is thinking about it', 'Anxiety'],
  ];

  return (
    <>
      <StatusBar title="Sanctuary" />
      <div className="space-y-2.5">
        <div className="flex gap-1.5">
          {['All', 'Anxiety', 'Habits'].map((tab, index) => (
            <span
              key={tab}
              className={`rounded-pill px-2.5 py-1 text-[10px] ${
                index === 0
                  ? 'bg-gradient-primary text-white'
                  : 'border border-hairline text-ink-muted'
              }`}
            >
              {tab}
            </span>
          ))}
        </div>

        {articles.map(([title, category]) => (
          <Card key={title}>
            <span className="text-[9px] uppercase tracking-wide text-accent">
              {category}
            </span>
            <p className="mt-1 text-[12px] font-semibold leading-snug text-ink-primary">
              {title}
            </p>
            <p className="mt-1 text-[10px] leading-relaxed text-ink-muted">
              Read in English or Hinglish · 4 min
            </p>
          </Card>
        ))}
      </div>
    </>
  );
}

function Focus() {
  return (
    <>
      <StatusBar title="Focus" />
      <div className="space-y-2.5">
        <Card>
          <p className="text-[10px] uppercase tracking-wide text-ink-muted">
            Personal best
          </p>
          <p className="mt-0.5 text-xl font-semibold text-accent">00:42.6</p>
          <p className="mt-0.5 text-[10px] text-ink-muted">
            Only moves when you beat it
          </p>
        </Card>

        <div className="grid grid-cols-3 gap-1.5">
          {Array.from({ length: 9 }).map((_, index) => (
            <div
              key={index}
              className={`aspect-square rounded-sm ${
                [1, 4, 7].includes(index)
                  ? 'bg-gradient-primary'
                  : 'border border-hairline bg-bg-card/50'
              }`}
            />
          ))}
        </div>

        <Card>
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-ink-muted">Banked training</span>
            <span className="text-[11px] font-semibold text-ink-primary">
              3h 20m
            </span>
          </div>
        </Card>
      </div>
    </>
  );
}

function Analytics() {
  // Deterministic, so the server render and the client render agree — a
  // random() here would hydrate to a different chart and warn.
  const bars = [40, 62, 35, 78, 55, 88, 70, 92, 48, 84, 66, 95];

  return (
    <>
      <StatusBar title="Insights" />
      <div className="space-y-2.5">
        <Card>
          <p className="mb-2 text-[10px] uppercase tracking-wide text-ink-muted">
            Mood, last 12 weeks
          </p>
          <div className="flex h-24 items-end gap-1">
            {bars.map((height, index) => (
              <div
                key={index}
                className="flex-1 rounded-t-[3px] bg-gradient-to-t from-primary to-primary-light"
                style={{ height: `${height}%` }}
              />
            ))}
          </div>
        </Card>

        <div className="grid grid-cols-2 gap-2">
          <Card>
            <p className="text-[9px] uppercase text-ink-muted">Entries</p>
            <p className="text-lg font-semibold text-ink-primary">184</p>
          </Card>
          <Card>
            <p className="text-[9px] uppercase text-ink-muted">Habits kept</p>
            <p className="text-lg font-semibold text-success">71%</p>
          </Card>
        </div>

        <Card>
          <p className="text-[10px] text-ink-secondary">
            Your heaviest days are Sundays.
          </p>
        </Card>
      </div>
    </>
  );
}

const screens: Record<MockupKind, () => React.JSX.Element> = {
  journal: Journal,
  meditation: Meditation,
  affirmations: Affirmations,
  thoughts: Thoughts,
  community: Community,
  counselling: Counselling,
  sanctuary: Sanctuary,
  focus: Focus,
  analytics: Analytics,
};

export function PhoneMockup({ kind }: { kind: MockupKind }) {
  const Screen = screens[kind] ?? Journal;
  return (
    <Frame>
      <Screen />
    </Frame>
  );
}
