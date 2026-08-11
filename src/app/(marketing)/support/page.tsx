import Link from 'next/link';
import type { Metadata } from 'next';
import { Mail, MessageCircle, Trash2, Flag } from 'lucide-react';

import {
  Breadcrumbs,
  CrisisNote,
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
  title: 'Support — Get Help, Report Content, Delete Your Account',
  description:
    'How to reach a person, report something on the anonymous board, recover ' +
    'your account, or delete everything. Answers to the questions people ' +
    'actually write in about.',
  path: '/support',
});

const trail = [
  { name: 'Home', path: '/' },
  { name: 'Support', path: '/support' },
];

const faqs = [
  {
    q: 'I cannot sign in / I forgot my password',
    a: 'Use "Forgot password" on the sign-in screen and a reset link is emailed to you. If you signed up with Google or a phone number there is no password to reset — use the same method you signed up with. If the email never arrives, check spam, then write to us.',
  },
  {
    q: 'How do I delete my account and everything in it?',
    a: 'In the app: Profile → Delete account. It runs as one server-side operation across every collection your account touches and reports anything it could not remove, rather than deleting what it can and leaving the rest orphaned. If you would rather we did it, email us and it is done within 30 days.',
  },
  {
    q: 'I reported something. What happens now?',
    a: 'It reaches a person. Reports are resolved and recorded rather than deleted, so a pattern of complaints about the same account stays visible after each individual report is closed. Where a report suggests somebody is in danger it is prioritised.',
  },
  {
    q: 'Somebody is being unpleasant to me on the board',
    a: 'Block them — their posts and replies stop appearing for you immediately — and report the specific post so a moderator sees it. Blocking is private; the other person is not told.',
  },
  {
    q: 'My streak reset and it should not have',
    a: 'Streaks are computed on the server from your entries, against your device\'s own timezone. If it looks wrong, check that your phone\'s date and time are set automatically. There is also one streak recovery a month for a single missed day, in the app under your profile.',
  },
  {
    q: 'The app says "the server is waking up"',
    a: 'The API runs on a free tier that suspends after a spell of inactivity and takes up to a minute to start again. The first request of the day can be slow; everything after it is normal. Nothing is lost while it wakes.',
  },
  {
    q: 'I paid for a counselling session and nothing happened',
    a: 'Payments are verified by hand against the bank, which usually takes a few minutes during working hours. If it has been longer, email us with the transaction reference and we will look at it.',
  },
  {
    q: 'Is there an iPhone app?',
    a: 'Not yet. The website is the full app and works in Safari — add it to your home screen from the Share menu and it opens like an app.',
  },
];

export default function SupportPage() {
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

      <section className="container-prose pb-8 pt-10 sm:pt-14">
        <Breadcrumbs trail={trail} />

        <h1 className="text-3xl font-semibold tracking-tight text-ink-primary sm:text-4xl">
          Support
        </h1>
        <p className="mt-4 text-[15px] leading-relaxed text-ink-secondary">
          A real person reads these. It is a small service, so a reply can take a
          day — but it is a person and not a form.
        </p>
      </section>

      <section className="pb-10">
        <div className="container-prose">
          <CrisisNote
            text={
              'If you are in danger or thinking about harming yourself, please ' +
              'do not wait for an email reply. In India, Tele-MANAS is free on ' +
              '14416, any hour of any day. Elsewhere, contact your local ' +
              'emergency number or a crisis line.'
            }
          />
        </div>
      </section>

      <section className="py-8">
        <div className="container-prose grid gap-4 sm:grid-cols-2">
          <Channel
            icon={<Mail className="h-5 w-5" />}
            title="Email us"
            body="Bugs, account problems, anything you want removed."
            action={
              <a
                href={`mailto:${site.contactEmail}`}
                className="text-[13px] text-primary-light underline underline-offset-2"
              >
                {site.contactEmail}
              </a>
            }
          />
          <Channel
            icon={<MessageCircle className="h-5 w-5" />}
            title="WhatsApp community"
            body="Where updates get posted and people help each other out."
            action={
              <a
                href={site.social.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[13px] text-primary-light underline underline-offset-2"
              >
                Join the group
              </a>
            }
          />
          <Channel
            icon={<Flag className="h-5 w-5" />}
            title="Report content"
            body="Use the flag on any post, reply, article or comment inside the app. It reaches a moderator."
            action={
              <Link
                href="/app/thoughts"
                className="text-[13px] text-primary-light underline underline-offset-2"
              >
                Open the board
              </Link>
            }
          />
          <Channel
            icon={<Trash2 className="h-5 w-5" />}
            title="Delete your account"
            body="Profile → Delete account, inside the app. Removes everything your account holds."
            action={
              <Link
                href="/app/profile"
                className="text-[13px] text-primary-light underline underline-offset-2"
              >
                Go to profile
              </Link>
            }
          />
        </div>
      </section>

      <section className="py-12">
        <div className="container-prose">
          <SectionHeading
            eyebrow="Common questions"
            title="The things people write in about"
          />
          <div className="mt-7">
            <FaqList faqs={faqs} />
          </div>
        </div>
      </section>

      <section className="pb-20">
        <div className="container-prose">
          <div className="glass p-6">
            <p className="text-[13.5px] leading-relaxed text-ink-secondary">
              Still stuck? Email{' '}
              <a
                href={`mailto:${site.contactEmail}`}
                className="text-primary-light underline underline-offset-2"
              >
                {site.contactEmail}
              </a>{' '}
              with your account email and what happened. Screenshots help more
              than descriptions.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}

function Channel({
  icon,
  title,
  body,
  action,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
  action: React.ReactNode;
}) {
  return (
    <div className="glass p-5">
      <span className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-md bg-primary/15 text-primary-light">
        {icon}
      </span>
      <h2 className="text-[15px] font-semibold text-ink-primary">{title}</h2>
      <p className="mt-1.5 text-[13px] leading-relaxed text-ink-secondary">
        {body}
      </p>
      <div className="mt-3">{action}</div>
    </div>
  );
}
