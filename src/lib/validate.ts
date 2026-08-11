/**
 * The patterns every form on this site validates against.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * Why these live in one file rather than in each form
 *
 * There were three forms asking for a phone number and three different ideas of
 * what one is — the counselling intake counted digits, the profile accepted
 * anything at all, and sign-up trusted the browser's `type="email"`, which
 * accepts `a@b` because the HTML spec says an address without a dot is legal.
 * A member typing the same number into two screens got two different answers,
 * and the one that accepted it was the one that mattered: a counsellor cannot
 * call `98765`.
 *
 * So: one definition each, applied everywhere, and a message written for the
 * person reading it rather than for the developer who wrote the rule.
 */

/**
 * An email address, as a form should check it.
 *
 * Deliberately not RFC 5322 — the full grammar accepts quoted strings and
 * comments, runs to a well-known several-thousand-character regex, and matches
 * addresses no mail provider would issue. What this catches is the four ways
 * people actually mistype: a missing `@`, a missing dot, a space in the middle,
 * and a trailing `.co` typed as `.c`.
 *
 * Firebase does its own check server-side and is the authority. This exists so
 * the answer arrives before the round trip, next to the field, rather than as a
 * translated error code after it.
 */
export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;

/**
 * An Indian mobile number.
 *
 * Ten digits beginning 6–9, which is the whole of the numbering plan for
 * mobiles. Punctuation, spaces and a `+91` or `0` prefix are stripped before
 * the check rather than rejected: people type their own number the way they
 * read it aloud, and refusing `+91 98765 43210` for its spaces is the form
 * being pedantic about something it can fix itself.
 */
const INDIAN_MOBILE_RE = /^[6-9]\d{9}$/;

/** Digits only, with a leading `+91`, `91` or `0` removed. */
export function normalisePhone(raw: string): string {
  const digits = (raw || '').replace(/\D/g, '');
  if (digits.length === 12 && digits.startsWith('91')) return digits.slice(2);
  if (digits.length === 11 && digits.startsWith('0')) return digits.slice(1);
  return digits;
}

export function isEmail(value: string): boolean {
  return EMAIL_RE.test((value || '').trim());
}

export function isPhone(value: string): boolean {
  return INDIAN_MOBILE_RE.test(normalisePhone(value));
}

/**
 * The message for a field, or null when it is fine.
 *
 * Returning the sentence rather than a boolean keeps the wording in one place —
 * six forms otherwise invent six ways to say the same thing, and the one that
 * says "invalid input" is the one somebody reads at 1am.
 */
export function emailProblem(value: string, { required = true } = {}): string | null {
  const trimmed = (value || '').trim();
  if (!trimmed) return required ? 'An email address is needed.' : null;
  if (!isEmail(trimmed)) return 'That does not look like an email address.';
  return null;
}

export function phoneProblem(value: string, { required = true } = {}): string | null {
  const trimmed = (value || '').trim();
  if (!trimmed) return required ? 'So we can reach you if the call drops.' : null;

  const digits = normalisePhone(trimmed);
  if (digits.length < 10) return 'That is not a full number — ten digits.';
  if (digits.length > 10) return 'That is more digits than a mobile number has.';
  if (!isPhone(trimmed)) return 'An Indian mobile number starts with 6, 7, 8 or 9.';
  return null;
}

export function ageProblem(value: string, { required = true } = {}): string | null {
  const trimmed = (value || '').trim();
  if (!trimmed) return required ? 'Needed — some things are age-specific.' : null;

  const age = Number(trimmed);
  if (!Number.isFinite(age) || !Number.isInteger(age)) return 'Digits only.';
  if (age < 13) return 'This account has to belong to somebody over 13.';
  if (age > 120) return 'That does not look right.';
  return null;
}

/**
 * The three answers to the gender question.
 *
 * `male` and `female` are the values the Android app already stores, so the two
 * clients agree about a profile written by either. `prefer_not_to_say` is new
 * and is the reason this is a list rather than a free-text box: a question with
 * no way to decline it is a question that gets answered dishonestly, and it is
 * asked here only so a counsellor knows how to address somebody.
 */
export const GENDERS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'prefer_not_to_say', label: 'Prefer not to say' },
] as const;

export function genderLabel(value?: string | null): string {
  if (!value) return '—';
  return GENDERS.find((g) => g.value === value)?.label ?? value;
}
