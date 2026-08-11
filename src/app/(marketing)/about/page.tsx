import Link from 'next/link';
import type { Metadata } from 'next';

import { PhoneMockup } from '@/components/PhoneMockup';
import {
  Breadcrumbs,
  CallToAction,
  SectionHeading,
} from '@/components/sections';
import { breadcrumbSchema, jsonLdScript, pageMetadata } from '@/lib/seo';
import { site } from '@/lib/site';

export const metadata: Metadata = pageMetadata({
  title: 'About — Why This App Exists',
  description:
    'InnenFlow is built by one person in India who needed it. Free, no ads, no ' +
    'data sold, and privacy enforced in the architecture rather than promised ' +
    'in a policy.',
  path: '/about',
});

const trail = [
  { name: 'Home', path: '/' },
  { name: 'About', path: '/about' },
];

export default function AboutPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLdScript(breadcrumbSchema(trail))}
      />

      <section className="container-page pb-10 pt-10 sm:pt-14">
        <Breadcrumbs trail={trail} />

        <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_auto]">
          <div>
            <h1 className="text-3xl font-semibold leading-[1.15] tracking-tight text-ink-primary sm:text-4xl">
              Built by one person{' '}
              <span className="headline">who needed it</span>
            </h1>
            <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-ink-secondary">
              {site.name} is not a startup, a wellness brand or a funded product
              with a growth target. It is an app somebody built because the
              things they wanted either cost forty dollars a year or wanted their
              data.
            </p>
          </div>

          <div className="justify-self-center lg:justify-self-end">
            <PhoneMockup kind="affirmations" />
          </div>
        </div>
      </section>

      <section className="py-10">
        <div className="container-prose prose-innen">
          <h2>Why it is free</h2>
          <p>
            Because the moment a mental-health app has a subscription, every
            decision in it starts bending toward retention. Sessions get longer
            so the library looks bigger. Streaks get punishing so you come back.
            The thing that helped moves behind the paywall, because that is what
            converts.
          </p>
          <p>
            The journal, the meditation timer, the affirmations, the anonymous
            board, the focus games and the community are free and have no trial.
            The two things that are paid — a counselling session with a real
            person, and a few library titles — are paid because there is an
            actual cost on the other side, and both are priced before you commit
            to anything.
          </p>

          <h2>Why privacy is in the architecture and not in a policy</h2>
          <p>
            Every app says it takes your privacy seriously. Almost none of them
            describe what that means in code, because in most cases it means a
            paragraph in a document nobody reads.
          </p>
          <p>
            Here it means specific things that can be checked. Every query for
            your journal is scoped to your account inside the database query
            itself, not filtered after the fetch — so a forgotten line returns
            nothing rather than returning somebody else&rsquo;s diary. Authorship
            on the anonymous board lives in a collection no member account can
            read, so the board cannot be joined against the member list.
            Counselling transcripts carry a deletion deadline stamped by the
            server and enforced by the database, so they are destroyed whether or
            not anybody opens the app again.
          </p>
          <p>
            Those are properties of how it is built. They do not depend on
            anybody keeping a promise.
          </p>

          <h2>What it is not</h2>
          <p>
            It is not therapy, it is not a clinical service, and it does not
            diagnose anything. It is a place to write things down, sit still for
            five minutes, and say the thing you cannot say to people who know
            you. That is genuinely useful and it is genuinely limited, and
            pretending otherwise would be the easiest way to hurt somebody.
          </p>
          <p>
            If you are in danger, please contact your local emergency services.
            In India, Tele-MANAS is free on <strong>14416</strong>, any hour of
            any day.
          </p>

          <h2>Where it runs</h2>
          <p>
            One backend, two front ends. The{' '}
            <Link href={site.store.android.url}>Android app</Link> and this
            website are two windows onto the same account and the same database,
            which is why there is no sync step and nothing to export. Identity is
            handled by Firebase Auth; everything else — journals, the board,
            articles, counselling — lives in MongoDB behind an API that decides
            who may read what.
          </p>

          <h2>Get in touch</h2>
          <p>
            Support, bug reports, and anything you want removed:{' '}
            <a href={`mailto:${site.contactEmail}`}>{site.contactEmail}</a>.
            There is also a{' '}
            <a href={site.social.whatsapp} target="_blank" rel="noopener noreferrer">
              WhatsApp group
            </a>{' '}
            where updates get posted, and{' '}
            <a href={site.social.instagram} target="_blank" rel="noopener noreferrer">
              Instagram
            </a>
            .
          </p>
        </div>
      </section>

      <section className="py-14">
        <div className="container-page">
          <SectionHeading
            centered
            eyebrow="Written down"
            title="The parts you can check for yourself"
          />
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {[
              ['Privacy', 'What is collected, what is not, and what deletion actually removes.', '/privacy'],
              ['Terms', 'The rules of the community and what this service is and is not.', '/terms'],
              ['Support', 'How to reach a person, report content, or delete your account.', '/support'],
            ].map(([title, body, href]) => (
              <Link key={href} href={href} className="glass glass-hover block p-5">
                <h3 className="text-[15px] font-semibold text-ink-primary">
                  {title}
                </h3>
                <p className="mt-1.5 text-[13px] leading-relaxed text-ink-secondary">
                  {body}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <div className="pb-20">
        <CallToAction />
      </div>
    </>
  );
}
