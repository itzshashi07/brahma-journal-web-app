'use client';

import { useState } from 'react';
import { Check, Loader2, Send } from 'lucide-react';

import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { site } from '@/lib/site';
import { emailProblem } from '@/lib/validate';

/**
 * The contact form on the support page.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * Why a form and not only the `mailto:` link
 *
 * The link is still there, and for some people it is the right answer. For most
 * it is a dead end: it opens a mail client that may not be configured, on a
 * machine that may not be theirs, and asks somebody to compose a message from a
 * blank page. What actually happens is that they close the tab.
 *
 * This posts to `POST /api/public/contact`, which writes a ticket and raises an
 * operator alert in the same request — so the message rings a phone rather than
 * landing in an inbox that gets opened on Tuesdays. The endpoint is public on
 * purpose: the people most likely to need support are the ones who cannot sign
 * in, and requiring a session to report a broken session is a support channel
 * that fails exactly when it is needed.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * What it does not do
 *
 * It does not promise the message is private in the way the journal is. It goes
 * to a person, and the copy says so. And it does not pretend to be a crisis
 * line — the note above it on the page names Tele-MANAS, because somebody in
 * danger must not be waiting on a reply from a small team.
 */

const CATEGORIES = [
  'Account or sign-in',
  'A bug',
  'Billing or counselling',
  'Delete my data',
  'Feedback or a request',
  'Something else',
];

export function ContactForm() {
  const { user, profile } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [message, setMessage] = useState('');
  const [website, setWebsite] = useState(''); // honeypot

  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Prefilled for somebody who *is* signed in — they have already told us this
  // twice — but every field stays editable, because the address a reply should
  // go to is not always the one an account was opened with.
  const nameValue = name || profile?.name || '';
  const emailValue = email || user?.email || '';

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (busy) return;

    const problem = emailProblem(emailValue);
    if (problem) {
      setError(problem);
      return;
    }
    if (message.trim().length < 10) {
      setError('A line or two more, so there is something to act on.');
      return;
    }

    setBusy(true);
    setError(null);
    try {
      await api.post('/api/public/contact', {
        name: nameValue.trim(),
        email: emailValue.trim(),
        category,
        message: message.trim(),
        website,
      });
      setSent(true);
      setMessage('');
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'That did not send. Please email us instead.'
      );
    } finally {
      setBusy(false);
    }
  }

  if (sent) {
    return (
      <div className="glass p-6">
        <p className="flex items-center gap-2 text-[15px] font-semibold text-ink-primary">
          <Check className="h-4 w-4 text-success" /> It has reached us
        </p>
        <p className="mt-2 text-[13.5px] leading-relaxed text-ink-secondary">
          A person reads every one of these, usually within a day. The reply
          comes to{' '}
          <span className="text-ink-primary">{emailValue.trim()}</span> — check
          spam if it seems slow.
        </p>
        <button
          type="button"
          onClick={() => setSent(false)}
          className="btn-ghost mt-4 !py-2 text-[12.5px]"
        >
          Write another
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="glass p-6">
      <h2 className="text-[16px] font-semibold text-ink-primary">
        Write to us here
      </h2>
      <p className="mt-1.5 text-[13px] leading-relaxed text-ink-secondary">
        This goes straight to the person who answers — no ticket robot in
        between. You do not need an account to use it.
      </p>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <label className="block text-[12px] font-medium text-ink-secondary">
          Your name
          <input
            className="field mt-1.5"
            value={nameValue}
            onChange={(event) => setName(event.target.value)}
            maxLength={120}
            required
            autoComplete="name"
            placeholder="What we should call you"
          />
        </label>

        <label className="block text-[12px] font-medium text-ink-secondary">
          Email for the reply
          <input
            className="field mt-1.5"
            type="email"
            value={emailValue}
            onChange={(event) => {
              setEmail(event.target.value);
              setError(null);
            }}
            maxLength={200}
            required
            autoComplete="email"
            placeholder="you@example.com"
          />
        </label>
      </div>

      <label className="mt-4 block text-[12px] font-medium text-ink-secondary">
        What is it about?
        <select
          className="field mt-1.5"
          value={category}
          onChange={(event) => setCategory(event.target.value)}
        >
          {CATEGORIES.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </label>

      <label className="mt-4 block text-[12px] font-medium text-ink-secondary">
        The message
        <textarea
          className="field mt-1.5 resize-y"
          rows={5}
          value={message}
          onChange={(event) => {
            setMessage(event.target.value);
            setError(null);
          }}
          maxLength={5000}
          required
          placeholder="What happened, and what you were doing when it did. If it is about your account, the email you signed up with helps."
        />
      </label>

      {/*
        The honeypot. Hidden from people and from screen readers, left in the tab
        order's way for nobody: a bot fills every input it finds, a person never
        sees this one. The server accepts and discards anything that arrives with
        it filled, rather than erroring — an error tells the bot what to change.
      */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label>
          Your website
          <input
            tabIndex={-1}
            autoComplete="off"
            value={website}
            onChange={(event) => setWebsite(event.target.value)}
          />
        </label>
      </div>

      {error && (
        <p role="alert" className="mt-4 text-[12.5px] text-danger">
          {error}
        </p>
      )}

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <button type="submit" disabled={busy} className="btn-primary !py-2.5">
          {busy ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
          {busy ? 'Sending…' : 'Send it'}
        </button>
        <p className="text-[11.5px] text-ink-muted">
          Or email{' '}
          <a
            href={`mailto:${site.contactEmail}`}
            className="underline underline-offset-2"
          >
            {site.contactEmail}
          </a>
        </p>
      </div>
    </form>
  );
}
