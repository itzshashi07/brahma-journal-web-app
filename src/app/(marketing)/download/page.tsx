import Link from 'next/link';
import type { Metadata } from 'next';
import { ArrowRight, Check, Globe, Smartphone } from 'lucide-react';

import { PhoneMockup } from '@/components/PhoneMockup';
import { StoreButtons } from '@/components/StoreButtons';
import {
  Breadcrumbs,
  FaqList,
  SectionHeading,
} from '@/components/sections';
import {
  breadcrumbSchema,
  faqSchema,
  jsonLdScript,
  pageMetadata,
} from '@/lib/seo';
import { site } from '@/lib/site';

export const metadata: Metadata = pageMetadata({
  title: 'Download InnenFlow — Free on Android, or Use It in Your Browser',
  description:
    'Install InnenFlow free from Google Play, or just sign in and use the full ' +
    'app in your browser on the same account. iOS is coming.',
  path: '/download',
});

const trail = [
  { name: 'Home', path: '/' },
  { name: 'Download', path: '/download' },
];

const faqs = [
  {
    q: 'Is the website the full app or a preview?',
    a: 'The full app. The journal, meditation, affirmations, the anonymous board, community, articles, the library and counselling all work in the browser. Both the website and the Android app talk to the same backend on the same account, so there is nothing to sync and nothing to import.',
  },
  {
    q: 'When is the iPhone app coming?',
    a: 'There is no date yet, and a made-up one would be worse than none. In the meantime the website works fully in Safari on an iPhone and can be added to your home screen from the Share menu, where it opens like an app.',
  },
  {
    q: 'What Android version do I need?',
    a: 'Android 7.0 or newer, which covers essentially every phone still receiving updates. The app is small and does not need a lot of storage.',
  },
  {
    q: 'Do I need to pay for anything?',
    a: 'No. The journal, mood tracking, meditation, affirmations, the anonymous board, focus games, articles and community are free with no trial. Counselling sessions and some library titles are paid and priced up front.',
  },
  {
    q: 'If I start on the website, will my data be in the Android app?',
    a: 'Yes, immediately. It is one account and one database — the two clients are two windows onto the same thing.',
  },
  {
    q: 'Can I delete my account and everything in it?',
    a: 'Yes, from inside the app. Deletion runs server-side in one operation across every collection your account touches, and reports anything it could not remove rather than silently leaving it behind.',
  },
];

export default function DownloadPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLdScript(breadcrumbSchema(trail))}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLdScript(faqSchema(faqs))}
      />

      <section className="container-page pb-10 pt-10 sm:pt-14">
        <Breadcrumbs trail={trail} />

        <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_auto]">
          <div>
            <h1 className="text-3xl font-semibold leading-[1.15] tracking-tight text-ink-primary sm:text-4xl">
              Get <span className="headline">InnenFlow</span>
            </h1>
            <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-ink-secondary">
              Free on Android, and fully usable in the browser you already have
              open. Same account, same data, no sync step.
            </p>

            <div className="mt-8">
              <StoreButtons />
            </div>

            <p className="mt-4 text-[12px] text-ink-muted">
              Android 7.0 and up · Free · No trial · No card
            </p>
          </div>

          <div className="justify-self-center lg:justify-self-end">
            <PhoneMockup kind="journal" />
          </div>
        </div>
      </section>

      {/* ─────────────────────── the three ways in ─────────────────────── */}
      <section className="py-14">
        <div className="container-page">
          <SectionHeading
            eyebrow="Three ways to use it"
            title="Pick whichever you will actually open"
          />

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <Platform
              icon={<Smartphone className="h-5 w-5" />}
              status="Available now"
              statusTone="live"
              title="Android"
              body="The full app on Google Play. Push notifications, offline meditation, and the home-screen icon that makes you actually open it."
              action={
                <a
                  href={site.store.android.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary w-full !py-2.5 text-[13px]"
                >
                  Install from Google Play
                </a>
              }
              points={[
                'Push notifications for replies and sessions',
                'Works offline once installed',
                'Free, Android 7.0 and up',
              ]}
            />

            <Platform
              icon={<Globe className="h-5 w-5" />}
              status="Available now"
              statusTone="live"
              title="Web"
              body="The same application in a browser, on any device. Nothing to install, and the fastest way to start — you can be writing in about forty seconds."
              action={
                <Link href="/signup" className="btn-primary w-full !py-2.5 text-[13px]">
                  Start in the browser
                </Link>
              }
              points={[
                'Every feature the Android app has',
                'Works on iPhone, laptop and desktop',
                'Add to your home screen to open like an app',
              ]}
            />

            <Platform
              icon={<AppleGlyph />}
              status="Coming soon"
              statusTone="soon"
              title="iOS"
              body="A native iPhone app is planned. Until it lands, the website in Safari is the full app — add it to your home screen and it behaves like one."
              action={
                <div className="w-full cursor-not-allowed rounded-pill border border-hairline bg-bg-card/40 py-2.5 text-center text-[13px] font-semibold text-ink-muted">
                  Not out yet
                </div>
              }
              points={[
                'Use Safari → Share → Add to Home Screen',
                'Same account as Android and web',
                'No date announced yet',
              ]}
            />
          </div>
        </div>
      </section>

      {/* ─────────────────────── add to home screen ─────────────────────── */}
      <section className="py-14">
        <div className="container-page">
          <div className="glass p-7 sm:p-10">
            <SectionHeading
              eyebrow="On an iPhone right now?"
              title="Add it to your home screen in three taps"
              subtitle="It opens full-screen with its own icon, and behaves like the native app for everything except push notifications."
            />

            <ol className="mt-7 grid gap-4 sm:grid-cols-3">
              {[
                ['Tap Share', 'The square with an arrow, at the bottom of Safari.'],
                ['Add to Home Screen', 'Scroll down the share sheet to find it.'],
                ['Open it from there', 'It launches full-screen, without the browser bars.'],
              ].map(([title, body], index) => (
                <li key={title} className="flex gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-primary text-[12px] font-semibold text-white">
                    {index + 1}
                  </span>
                  <div>
                    <p className="text-[14px] font-semibold text-ink-primary">
                      {title}
                    </p>
                    <p className="mt-0.5 text-[12.5px] leading-relaxed text-ink-secondary">
                      {body}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <section className="py-14">
        <div className="container-prose">
          <SectionHeading eyebrow="Questions" title="About installing it" />
          <div className="mt-7">
            <FaqList faqs={faqs} />
          </div>
        </div>
      </section>

      <section className="pb-20">
        <div className="container-page">
          <div className="glass flex flex-col items-center gap-5 p-8 text-center sm:p-12">
            <h2 className="max-w-lg text-2xl font-semibold tracking-tight text-ink-primary">
              You do not have to install anything to start
            </h2>
            <p className="max-w-md text-[15px] leading-relaxed text-ink-secondary">
              Sign up in the browser, write one entry tonight, and install the
              app later if you want it on your home screen.
            </p>
            <Link href="/signup" className="btn-primary">
              Create a free account
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

function Platform({
  icon,
  status,
  statusTone,
  title,
  body,
  points,
  action,
}: {
  icon: React.ReactNode;
  status: string;
  statusTone: 'live' | 'soon';
  title: string;
  body: string;
  points: string[];
  action: React.ReactNode;
}) {
  return (
    <div className="glass flex flex-col p-6">
      <div className="mb-4 flex items-center justify-between">
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-primary/15 text-primary-light">
          {icon}
        </span>
        <span
          className={`rounded-pill px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide ${
            statusTone === 'live'
              ? 'bg-success/15 text-success'
              : 'bg-accent/15 text-accent'
          }`}
        >
          {status}
        </span>
      </div>

      <h3 className="text-[17px] font-semibold text-ink-primary">{title}</h3>
      <p className="mt-2 text-[13px] leading-relaxed text-ink-secondary">
        {body}
      </p>

      <ul className="mt-4 flex-1 space-y-2">
        {points.map((point) => (
          <li key={point} className="flex items-start gap-2">
            <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-success" />
            <span className="text-[12.5px] leading-relaxed text-ink-secondary">
              {point}
            </span>
          </li>
        ))}
      </ul>

      <div className="mt-5">{action}</div>
    </div>
  );
}

function AppleGlyph() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden="true">
      <path d="M16.4 12.7c0-2.3 1.9-3.4 2-3.5-1.1-1.6-2.8-1.8-3.4-1.8-1.4-.1-2.8.9-3.5.9-.7 0-1.8-.9-3-.8-1.5 0-2.9.9-3.7 2.3-1.6 2.7-.4 6.8 1.1 9 .8 1.1 1.7 2.3 2.9 2.2 1.2 0 1.6-.7 3-.7s1.8.7 3 .7c1.3 0 2.1-1.1 2.8-2.2.9-1.3 1.3-2.5 1.3-2.6 0 0-2.5-1-2.5-3.5ZM14.2 5.5c.6-.8 1-1.9.9-3-.9 0-2 .6-2.7 1.4-.6.7-1.1 1.8-.9 2.9 1 .1 2-.5 2.7-1.3Z" />
    </svg>
  );
}
