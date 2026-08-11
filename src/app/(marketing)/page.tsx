import Link from 'next/link';
import type { Metadata } from 'next';
import { ArrowRight } from 'lucide-react';

import { Icon } from '@/components/Icon';
import { PhoneMockup } from '@/components/PhoneMockup';
import { StoreButtons } from '@/components/StoreButtons';
import {
  AppNote,
  CallToAction,
  FaqList,
  LinkCard,
  SectionHeading,
  TrustStrip,
} from '@/components/sections';
import { features } from '@/content/features';
import { useCases } from '@/content/use-cases';
import { faqSchema, jsonLdScript, pageMetadata } from '@/lib/seo';
import { site } from '@/lib/site';

export const metadata: Metadata = pageMetadata({
  title: `${site.name} — Private Journal, Meditation & Anonymous Support`,
  description:
    'Write a journal nobody can read, sit for five minutes, and say the thing ' +
    'you cannot say anywhere else — anonymously. Free on Android and in your ' +
    'browser. No subscription, no trial.',
  path: '/',
});

/**
 * The home page.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * What it is trying to do, in order
 *
 * Somebody arriving here has about four seconds of patience and has not decided
 * to care yet. The order of the page is the order of the argument:
 *
 *   1. **A sentence they recognise as their own situation.** Not a feature, not
 *      a brand promise — the specific 1am experience.
 *   2. **The screen.** Immediately, beside the headline, so it stops being an
 *      abstraction. See `PhoneMockup` for why it is markup and not a PNG.
 *   3. **The objection.** For a journalling app the objection is always privacy,
 *      and it arrives before the feature list rather than after it.
 *   4. **What it does**, as nine doors into nine deeper pages.
 *   5. **What it is for**, as seven more doors written in problem-language.
 *   6. **The ask**, twice — browser first, store second.
 *
 * The two grids are the site's internal link graph as much as they are content:
 * sixteen crawlable links from the highest-authority page to every landing page
 * on the site.
 */

const homeFaqs = [
  {
    q: 'Is InnenFlow free?',
    a: 'Yes. The journal, mood tracking, meditation timer, affirmations, anonymous board, focus games and community are all free, with no trial period and no subscription. Counselling sessions and a few library titles are paid, and both are clearly priced before you commit to anything.',
  },
  {
    q: 'Can I use it without installing an app?',
    a: 'Yes. The website is the full application, not a preview — everything the Android app does works in a browser on the same account, because both talk to the same backend. There is nothing to sync.',
  },
  {
    q: 'Is my journal actually private?',
    a: 'Yes. Every query for journal data is scoped to your account inside the database query itself rather than filtered afterwards, so a mistake returns nothing rather than returning somebody else\'s entry. There is no admin screen that lists member journals, because one was never built.',
  },
  {
    q: 'Is the anonymous board really anonymous?',
    a: 'A post carries no account identifier. Authorship is stored in a separate collection that no member account can read, specifically so the board cannot be joined against the member list to unmask anyone. It is kept only so moderation can act on a threat.',
  },
  {
    q: 'Is there an iPhone app?',
    a: 'Not yet — it is coming. In the meantime the website works fully on an iPhone browser and can be added to your home screen, and it is the same app on the same account.',
  },
  {
    q: 'Is this a replacement for therapy?',
    a: 'No. It is a journal, a practice timer and a place to talk, and it sits alongside professional help rather than replacing it. If you are in danger, please contact your local emergency services — in India, Tele-MANAS is free on 14416.',
  },
];

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLdScript(faqSchema(homeFaqs))}
      />

      {/* ─────────────────────────── hero ─────────────────────────── */}
      <section className="container-page pb-8 pt-14 sm:pt-20">
        <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_auto]">
          <div className="animate-fade-up">
            <span className="chip mb-5">
              <span className="h-1.5 w-1.5 rounded-full bg-success" />
              Free · No trial · No card
            </span>

            {/*
              One h1 per page, and it is the sentence somebody would recognise
              rather than the product name. The brand is in the header, the
              title tag and the schema — it does not need the h1 as well.
            */}
            <h1 className="text-3xl font-semibold leading-[1.12] tracking-tight text-ink-primary sm:text-5xl">
              It is 1am and your brain
              <br className="hidden sm:block" />{' '}
              <span className="headline">will not stop.</span>
            </h1>

            <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-ink-secondary sm:text-base">
              {site.name} is a private journal, a five-minute meditation timer
              and an anonymous board where you can finally say the thing you
              cannot say to anyone who knows you. One app, on your phone and in
              your browser, free.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/signup" className="btn-primary">
                Start free in your browser
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/use-cases/overthinking-at-night" className="btn-ghost">
                I cannot sleep — start here
              </Link>
            </div>

            <div className="mt-8">
              <StoreButtons />
            </div>

            <p className="mt-6 max-w-md text-[12px] leading-relaxed text-ink-muted">
              Your journal is scoped to your account inside the database itself.
              The anonymous board stores authorship where no member account can
              read it. Both are design decisions, not promises —{' '}
              <Link
                href="/privacy"
                className="text-primary-light underline underline-offset-2"
              >
                here is how
              </Link>
              .
            </p>
          </div>

          <div className="animate-drift justify-self-center lg:justify-self-end">
            <PhoneMockup kind="journal" />
          </div>
        </div>
      </section>

      {/* ─────────────────────────── trust ─────────────────────────── */}
      <section className="py-14 sm:py-20">
        <div className="container-page mb-8">
          <SectionHeading
            eyebrow="Before anything else"
            title="You are about to write down the things you do not tell people"
            subtitle="So the first thing worth explaining is what happens to them. These are properties of how the app is built, not policies it promises to follow."
          />
        </div>
        <TrustStrip />
      </section>

      {/* ─────────────────────────── features ─────────────────────────── */}
      <section className="py-14 sm:py-20">
        <div className="container-page">
          <SectionHeading
            eyebrow="What it does"
            title="Nine things, and none of them behind a paywall"
            subtitle="Everything below is in the free app. Tap any of them for how it actually works."
          />

          <div className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <LinkCard
                key={feature.slug}
                href={`/features/${feature.slug}`}
                icon={feature.icon}
                title={feature.name}
                blurb={feature.standfirst}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────────── the anonymous board, up close ─────────────────── */}
      <section className="py-14 sm:py-20">
        <div className="container-page grid items-center gap-12 lg:grid-cols-[auto_1fr]">
          <div className="justify-self-center">
            <PhoneMockup kind="thoughts" />
          </div>

          <div>
            <SectionHeading
              eyebrow="The part people come back for"
              title="Say it with no name attached"
              subtitle="There are things you will not put on Instagram, will not tell your family, and cannot say to the friend who would worry. They do not go away for being unsaid."
            />

            <div className="mt-6 space-y-4">
              {[
                [
                  'No name, no photo, no handle',
                  'You post as something like "Quiet Voice" or "Night Thinker". There is no profile behind it and nothing to click through to.',
                ],
                [
                  'Anonymous at the database level',
                  'Who wrote a post lives in a separate collection no member account can read — including yours. The board physically cannot be joined against the member list.',
                ],
                [
                  'Somebody actually answers',
                  'Replies come from people in something similar, and you are notified even with the app closed — without the reply ever attaching to your name.',
                ],
              ].map(([title, body]) => (
                <div key={title} className="flex gap-4">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                  <div>
                    <h3 className="text-[15px] font-semibold text-ink-primary">
                      {title}
                    </h3>
                    <p className="mt-1 text-[13px] leading-relaxed text-ink-secondary">
                      {body}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <Link
              href="/features/anonymous-reflections"
              className="btn-ghost mt-7"
            >
              How anonymity is enforced
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ─────────────────────────── use cases ─────────────────────────── */}
      <section className="py-14 sm:py-20">
        <div className="container-page">
          <SectionHeading
            eyebrow="What it is for"
            title="Start from where you actually are"
            subtitle="Nobody opens an app store looking for “a journalling app with mood tracking”. Find the one that sounds like your week."
          />

          <div className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {useCases.map((useCase) => (
              <LinkCard
                key={useCase.slug}
                href={`/use-cases/${useCase.slug}`}
                icon={useCase.icon}
                title={useCase.name}
                blurb={useCase.standfirst}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────────────── daily practice strip ─────────────────────── */}
      <section className="py-14 sm:py-20">
        <div className="container-page">
          <SectionHeading
            centered
            eyebrow="The whole routine"
            title="Five to seven minutes, once a day"
            subtitle="Not a programme, not a course, not thirty days of anything. This is the entire commitment."
          />

          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {[
              {
                icon: 'Brain',
                minutes: '5 min',
                title: 'Sit',
                body: 'A breathing timer paced to a long exhale, with a short line to rest attention on. Start at five minutes on the day ten is too many.',
                mockup: 'meditation' as const,
              },
              {
                icon: 'NotebookPen',
                minutes: '90 sec',
                title: 'Write',
                body: 'Mood, one habit, one line about what pulled at you. Every field optional. An entry with one line in it still counts.',
                mockup: 'journal' as const,
              },
              {
                icon: 'Sparkles',
                minutes: '1 min',
                title: 'Read',
                body: 'One of your own affirmations, or a short article. Something in, not just out.',
                mockup: 'affirmations' as const,
              },
            ].map((step) => (
              <div key={step.title} className="glass p-6">
                <div className="mb-4 flex items-center gap-3">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-gradient-primary text-white">
                    <Icon name={step.icon} className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-[15px] font-semibold text-ink-primary">
                      {step.title}
                    </p>
                    <p className="text-[11px] uppercase tracking-wider text-accent">
                      {step.minutes}
                    </p>
                  </div>
                </div>
                <p className="text-[13px] leading-relaxed text-ink-secondary">
                  {step.body}
                </p>
              </div>
            ))}
          </div>

          <p className="mx-auto mt-8 max-w-xl text-center text-[13px] leading-relaxed text-ink-secondary">
            Miss a day and nothing resets to zero — your longest streak is kept,
            badges are earned against all of history, and once a month a single
            missed day can be repaired.{' '}
            <Link
              href="/use-cases/building-a-habit"
              className="text-primary-light underline underline-offset-2"
            >
              Why that matters
            </Link>
            .
          </p>
        </div>
      </section>

      {/* ─────────────────────────── faq ─────────────────────────── */}
      <section className="py-14 sm:py-20">
        <div className="container-prose">
          <SectionHeading
            centered
            eyebrow="Questions"
            title="The things people ask before signing up"
          />
          <div className="mt-8">
            <FaqList faqs={homeFaqs} />
          </div>
          <div className="mt-6 text-center">
            <AppNote />
          </div>
        </div>
      </section>

      <div className="pb-20">
        <CallToAction />
      </div>
    </>
  );
}
