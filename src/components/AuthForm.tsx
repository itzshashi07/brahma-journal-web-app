'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

import { GetTheAppNote } from '@/components/GetTheApp';
import { Logo } from '@/components/Logo';
import { useAuth } from '@/lib/auth-context';
import { site } from '@/lib/site';
import { emailProblem } from '@/lib/validate';

type Mode = 'signin' | 'signup' | 'reset';

/**
 * Sign in, sign up and password reset, in one component.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * Why one component and not three pages of duplicated form
 *
 * The three differ by one field and one button. Three copies means three places
 * where the error mapping, the redirect handling and the Google button drift —
 * and the auth screen is the one place in the product where a small
 * inconsistency reads as untrustworthy.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * On the redirect
 *
 * `?next=` is honoured so that a member who followed a link into the app and
 * was bounced to sign-in lands where they were going, not on the dashboard.
 * It is validated to be a same-origin path first: an unchecked `next` is an
 * open redirect, which is how a phishing link gets to borrow this domain's
 * credibility to send somebody somewhere else.
 */
export function AuthForm({ mode }: { mode: Mode }) {
  const router = useRouter();
  const params = useSearchParams();
  const { signIn, signUp, signInWithGoogle, resetPassword, user, configured } =
    useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  /**
   * Field-level problems, checked here before anything is sent.
   *
   * `<input type="email">` is not the check people assume it is: the HTML
   * validity rules accept `someone@gmail` — no dot, no top-level domain —
   * because a bare hostname is legal in an address. So somebody who typed their
   * address one character short got a Firebase round trip, then
   * `auth/invalid-email` translated into a sentence at the bottom of the form,
   * with nothing marking the field that was wrong. Now the answer is instant and
   * next to the box. See `lib/validate.ts` for the pattern and why it is not the
   * RFC one.
   */
  const [fieldError, setFieldError] = useState<{ email?: string; password?: string }>({});

  /**
   * Only a relative path on this origin is accepted.
   *
   * `//evil.example` and `https://evil.example` both survive a naive
   * `startsWith('/')` check — the first because a protocol-relative URL begins
   * with a slash. Hence the second condition.
   */
  const next = (() => {
    const raw = params.get('next');
    if (!raw || !raw.startsWith('/') || raw.startsWith('//')) {
      return '/app/dashboard';
    }
    return raw;
  })();

  // Somebody already signed in has no business on this screen — they arrived by
  // a stale bookmark or the back button.
  useEffect(() => {
    if (user) router.replace(next);
  }, [user, next, router]);

  const copy = {
    signin: {
      title: 'Welcome back',
      subtitle: 'Your journal is where you left it.',
      submit: 'Sign in',
    },
    signup: {
      title: 'Start tonight',
      subtitle:
        'Free, no card, and nothing to install. Your first entry can be one line.',
      submit: 'Create my account',
    },
    reset: {
      title: 'Reset your password',
      subtitle: 'We will email you a link to set a new one.',
      submit: 'Send the reset link',
    },
  }[mode];

  /**
   * Firebase error codes, translated.
   *
   * The raw codes are shown to nobody. `auth/invalid-credential` in front of
   * somebody trying to get into their own journal is both meaningless and
   * slightly alarming.
   *
   * Note that wrong-password and no-such-account get the same message on
   * purpose. Distinguishing them turns the sign-in form into an oracle for
   * whether a given email has an account here — which, for an app about mental
   * health, is a genuinely sensitive fact about a person.
   */
  const explain = (err: unknown): string => {
    const code = (err as { code?: string })?.code ?? '';
    switch (code) {
      case 'auth/invalid-email':
        return 'That does not look like an email address.';
      case 'auth/user-not-found':
      case 'auth/wrong-password':
      case 'auth/invalid-credential':
        return 'That email and password do not match an account.';
      case 'auth/email-already-in-use':
        return 'There is already an account with that email. Try signing in.';
      case 'auth/weak-password':
        return 'Please use at least six characters.';
      case 'auth/too-many-requests':
        return 'Too many attempts. Wait a few minutes and try again.';
      case 'auth/popup-closed-by-user':
      case 'auth/cancelled-popup-request':
        return 'The Google window closed before sign-in finished.';
      case 'auth/network-request-failed':
        return 'Could not reach the server. Check your connection.';
      default:
        return (err as Error)?.message || 'Something went wrong. Try again.';
    }
  };

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    const problems: { email?: string; password?: string } = {};
    const email_ = emailProblem(email);
    if (email_) problems.email = email_;
    if (mode !== 'reset' && password.length < 6) {
      problems.password = 'At least six characters.';
    }

    setFieldError(problems);
    if (Object.keys(problems).length) return;

    setBusy(true);

    try {
      if (mode === 'signin') {
        await signIn(email, password);
        router.replace(next);
      } else if (mode === 'signup') {
        await signUp(name, email, password);
        router.replace(next);
      } else {
        await resetPassword(email);
        setSent(true);
      }
    } catch (err) {
      setError(explain(err));
    } finally {
      setBusy(false);
    }
  }

  async function onGoogle() {
    setError(null);
    setBusy(true);
    try {
      await signInWithGoogle();
      router.replace(next);
    } catch (err) {
      setError(explain(err));
    } finally {
      setBusy(false);
    }
  }

  if (!configured) {
    return (
      <Shell>
        <div className="glass p-6 text-center">
          <h1 className="text-lg font-semibold text-ink-primary">
            Sign-in is not configured
          </h1>
          <p className="mt-2 text-[13px] leading-relaxed text-ink-secondary">
            This deployment has no Firebase keys. Copy{' '}
            <code className="text-primary-light">.env.example</code> to{' '}
            <code className="text-primary-light">.env.local</code> and fill in
            the project values.
          </p>
        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      <div className="glass p-7">
        <h1 className="text-2xl font-semibold tracking-tight text-ink-primary">
          {copy.title}
        </h1>
        <p className="mt-2 text-[13.5px] leading-relaxed text-ink-secondary">
          {copy.subtitle}
        </p>

        {sent ? (
          <div className="mt-6 rounded-md border border-success/30 bg-success/10 p-4">
            <p className="text-[13px] leading-relaxed text-ink-secondary">
              If there is an account for <strong>{email}</strong>, a reset link
              is on its way. Check spam if it does not arrive in a minute.
            </p>
            <Link
              href="/login"
              className="mt-4 inline-block text-[13px] text-primary-light underline underline-offset-2"
            >
              Back to sign in
            </Link>
          </div>
        ) : (
          <>
            <form onSubmit={onSubmit} className="mt-6 space-y-3">
              {mode === 'signup' && (
                <Field
                  label="What should we call you?"
                  type="text"
                  value={name}
                  onChange={setName}
                  autoComplete="name"
                  placeholder="Your first name"
                />
              )}

              <Field
                label="Email"
                type="email"
                value={email}
                onChange={(value) => {
                  setEmail(value);
                  // The message goes the moment they start fixing it. Leaving
                  // it up while somebody corrects the address reads as though
                  // the correction did not count.
                  setFieldError((current) => ({ ...current, email: undefined }));
                }}
                autoComplete="email"
                required
                error={fieldError.email}
                placeholder="you@example.com"
              />

              {mode !== 'reset' && (
                <Field
                  label="Password"
                  type="password"
                  value={password}
                  onChange={(value) => {
                    setPassword(value);
                    setFieldError((current) => ({
                      ...current,
                      password: undefined,
                    }));
                  }}
                  autoComplete={
                    mode === 'signup' ? 'new-password' : 'current-password'
                  }
                  required
                  minLength={6}
                  error={fieldError.password}
                  placeholder={
                    mode === 'signup' ? 'At least 6 characters' : '••••••••'
                  }
                />
              )}

              {error && (
                <p
                  role="alert"
                  className="rounded-md border border-danger/40 bg-danger/10 px-3 py-2 text-[12.5px] text-ink-secondary"
                >
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={busy}
                className="btn-primary w-full"
              >
                {busy && <Loader2 className="h-4 w-4 animate-spin" />}
                {copy.submit}
              </button>
            </form>

            {mode !== 'reset' && (
              <>
                <div className="my-5 flex items-center gap-3">
                  <span className="h-px flex-1 bg-hairline" />
                  <span className="text-[11px] uppercase tracking-wider text-ink-muted">
                    or
                  </span>
                  <span className="h-px flex-1 bg-hairline" />
                </div>

                <button
                  type="button"
                  onClick={onGoogle}
                  disabled={busy}
                  className="btn-ghost w-full"
                >
                  <GoogleGlyph />
                  Continue with Google
                </button>
              </>
            )}
          </>
        )}

        <div className="mt-6 space-y-2 text-center text-[13px] text-ink-secondary">
          {mode === 'signin' && (
            <>
              <p>
                <Link
                  href="/forgot-password"
                  className="text-primary-light underline underline-offset-2"
                >
                  Forgot your password?
                </Link>
              </p>
              <p>
                New here?{' '}
                <Link
                  href="/signup"
                  className="text-primary-light underline underline-offset-2"
                >
                  Create a free account
                </Link>
              </p>
            </>
          )}
          {mode === 'signup' && (
            <p>
              Already have an account?{' '}
              <Link
                href="/login"
                className="text-primary-light underline underline-offset-2"
              >
                Sign in
              </Link>
            </p>
          )}
          {mode === 'reset' && !sent && (
            <p>
              Remembered it?{' '}
              <Link
                href="/login"
                className="text-primary-light underline underline-offset-2"
              >
                Sign in
              </Link>
            </p>
          )}
        </div>
      </div>

      {/* Under the form, not over it: somebody typing a password is doing a
          thing, and a card that competes with it costs the sign-in to win an
          install. Not on the reset screen — a person who cannot get in is the
          last person to sell an app to. */}
      {mode !== 'reset' && <GetTheAppNote />}

      {mode === 'signup' && (
        <p className="mt-5 text-center text-[11.5px] leading-relaxed text-ink-muted">
          By creating an account you agree to the{' '}
          <Link href="/terms" className="underline underline-offset-2">
            terms
          </Link>{' '}
          and the{' '}
          <Link href="/privacy" className="underline underline-offset-2">
            privacy policy
          </Link>
          . Your journal is private to your account.
        </p>
      )}
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-5 py-14">
      <Link href="/" className="mb-7 flex items-center gap-2.5">
        <Logo className="h-10 w-10" />
        <span className="text-lg font-semibold text-ink-primary">
          {site.name}
        </span>
      </Link>

      <div className="w-full max-w-sm">{children}</div>

      <Link
        href="/"
        className="mt-8 text-[12px] text-ink-muted underline-offset-2 hover:text-ink-secondary hover:underline"
      >
        ← Back to the site
      </Link>
    </div>
  );
}

function Field({
  label,
  onChange,
  error,
  ...props
}: {
  label: string;
  value: string;
  error?: string;
  onChange: (value: string) => void;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'>) {
  const id = `field-${label.replace(/\W+/g, '-').toLowerCase()}`;
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-1.5 block text-[12px] font-medium text-ink-secondary"
      >
        {label}
      </label>
      <input
        id={id}
        className={`field ${error ? '!border-danger' : ''}`}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        onChange={(event) => onChange(event.target.value)}
        {...props}
      />
      {error && (
        <p id={`${id}-error`} className="mt-1 text-[11.5px] text-danger">
          {error}
        </p>
      )}
    </div>
  );
}

function GoogleGlyph() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5a5.6 5.6 0 0 1-2.4 3.6v3h3.9c2.3-2.1 3.5-5.2 3.5-8.8Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.2 0 5.9-1.1 7.9-2.9l-3.9-3c-1 .7-2.4 1.1-4 1.1-3.1 0-5.7-2-6.6-4.8H1.4v3C3.4 21.3 7.4 24 12 24Z"
      />
      <path
        fill="#FBBC05"
        d="M5.4 14.4a7.2 7.2 0 0 1 0-4.6v-3H1.4a12 12 0 0 0 0 10.6l4-3Z"
      />
      <path
        fill="#EA4335"
        d="M12 4.8c1.8 0 3.3.6 4.6 1.8l3.4-3.4C17.9 1.2 15.2 0 12 0 7.4 0 3.4 2.7 1.4 6.8l4 3c.9-2.8 3.5-4.9 6.6-5Z"
      />
    </svg>
  );
}
