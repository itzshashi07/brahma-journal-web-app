'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { LogOut, ShieldCheck, Trash2, X } from 'lucide-react';

import { AvatarPicker } from '@/components/app/AvatarPicker';
import { Card, PageHeader } from '@/components/app/ui';
import {
  DEFAULT_WEEKLY_TARGET,
  MAX_CUSTOM_HABITS,
  PROFESSIONS,
  WEEKLY_TARGETS,
  customHabit,
  isKnownProfession,
  professionById,
} from '@/content/professions';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { site } from '@/lib/site';
import { GENDERS, ageProblem, phoneProblem } from '@/lib/validate';

/**
 * Profile.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * What the web was missing that the app has had all along
 *
 * The Android profile screen edits a name, an avatar, an age, a gender, a phone
 * number, what somebody does and what they are working towards. The web edited
 * three of those, had no avatar at all — every member on the leaderboard was the
 * same violet circle — and had no way to fill in the fields the counselling
 * intake then asked for again.
 *
 * The API accepted all of them the whole time: `PATCH /profile/me` takes name,
 * age, gender, phone, avatarId, profession, aim and craftWeeklyTarget. There was
 * nothing to build server-side; the web simply never sent them.
 *
 * Age, gender and phone are validated against the same rules the counselling
 * intake uses — one definition in `lib/validate.ts` — so a number accepted here
 * cannot be rejected there, which was the state of things before.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * What deletion actually does, and the order it does it in
 *
 * `DELETE /api/profile/me` sweeps every collection the account touches in one
 * server-side operation and reports anything it could not remove. That is the
 * point of it being one request: the app used to delete across fifteen
 * collections from the device and, if one refused, carried on and left
 * unreachable orphan data behind. That is a partial erasure of somebody who
 * asked to be forgotten.
 *
 * The Firebase credential is deleted *after* this returns, and the order is
 * load-bearing: every route authorises against a valid ID token, so destroying
 * the credential first would lock the account out of its own deletion.
 *
 * The anonymous board is deliberately excluded. Deleting the authorship record
 * is what makes the erasure real — the post stays and becomes genuinely
 * unattributable, rather than disappearing and taking other people's replies
 * with it.
 */
export default function ProfilePage() {
  const { user, profile, refreshProfile, signOut, isAdmin } = useAuth();

  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [phone, setPhone] = useState('');
  const [avatarId, setAvatarId] = useState<string>('');

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [invalid, setInvalid] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setName(profile?.name ?? '');
    setAge(profile?.age != null ? String(profile.age) : '');
    setGender(profile?.gender ?? '');
    setPhone(profile?.phone ?? '');
    setAvatarId(profile?.avatarId ?? '');
  }, [profile]);

  /**
   * The optional fields are validated only when they have something in them.
   *
   * A profile is not an intake form — somebody who never fills in their phone
   * number should not be blocked from renaming themselves. But a phone number
   * that *is* there has to be a real one, because it is what a counsellor
   * dials, and half a number is worse than none: it looks answerable.
   */
  function problems(): Record<string, string> {
    const found: Record<string, string> = {};

    const ageIssue = ageProblem(age, { required: false });
    if (ageIssue) found.age = ageIssue;

    const phoneIssue = phoneProblem(phone, { required: false });
    if (phoneIssue) found.phone = phoneIssue;

    return found;
  }

  async function save() {
    const found = problems();
    setInvalid(found);
    if (Object.keys(found).length) {
      setError('Please fix the highlighted fields.');
      return;
    }

    setSaving(true);
    setSaved(false);
    setError(null);
    try {
      await api.patch('/api/profile/me', {
        name: name.trim() || null,
        age: age.trim() ? Number(age.trim()) : null,
        gender: gender || null,
        phone: phone.trim() || null,
        avatarId: avatarId || null,
        // `profession`, `aim` and the craft checklist are owned by the card
        // below and saved there. Sending them from here too would write back
        // whatever this form last read, undoing a craft edit made after it
        // loaded.
      });
      await refreshProfile();
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save that.');
    } finally {
      setSaving(false);
    }
  }

  /** Saving the avatar on its own, so a preset tap is a finished action. */
  async function saveAvatar(next: string) {
    setAvatarId(next);
    setSaved(false);
    try {
      await api.patch('/api/profile/me', { avatarId: next });
      await refreshProfile();
    } catch {
      // The picker keeps showing the choice; "Save" below writes it again.
    }
  }

  async function deleteAccount() {
    const typed = prompt(
      'This deletes your journal, your sessions, your profile and everything else. Type DELETE to confirm.'
    );
    if (typed !== 'DELETE') return;

    setDeleting(true);
    try {
      const result = await api.delete<{ deleted: number; incomplete: string[] }>(
        '/api/profile/me'
      );

      if (result?.incomplete?.length) {
        alert(
          `Most of your data is gone, but these could not be removed: ${result.incomplete.join(', ')}. Email ${site.contactEmail} and it will be finished by hand.`
        );
      }

      // Only now. See the note at the top on ordering.
      try {
        await user?.delete();
      } catch {
        // Firebase refuses to delete a credential whose sign-in is stale. The
        // application data is already gone, which is the part that matters; the
        // credential can be removed by signing in again.
      }

      await signOut();
      window.location.href = '/';
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Could not delete the account.');
      setDeleting(false);
    }
  }

  const clearInvalid = (key: string) =>
    setInvalid((current) => {
      if (!current[key]) return current;
      const next = { ...current };
      delete next[key];
      return next;
    });

  return (
    <>
      <PageHeader
        title="Your profile"
        subtitle="Only your display name and avatar are ever shown to other members."
      />

      <Card className="mb-4">
        <AvatarPicker
          value={avatarId}
          name={name || profile?.name}
          email={user?.email}
          onChange={saveAvatar}
        />
      </Card>

      <Card className="mb-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <Field
            label="Display name"
            value={name}
            onChange={setName}
            placeholder="What the leaderboard shows"
          />
          <Field
            label="Age"
            value={age}
            onChange={(value) => {
              setAge(value);
              clearInvalid('age');
            }}
            error={invalid.age}
            inputMode="numeric"
            placeholder="24"
          />

          <SelectField
            label="Gender"
            value={gender}
            onChange={setGender}
            placeholder="Prefer not to answer"
            options={GENDERS.map((option) => ({ ...option }))}
          />
          <Field
            label="Phone"
            value={phone}
            onChange={(value) => {
              setPhone(value);
              clearInvalid('phone');
            }}
            error={invalid.phone}
            inputMode="tel"
            placeholder="98765 43210"
          />

        </div>

        <p className="mt-3 text-[11.5px] leading-relaxed text-ink-muted">
          Age, gender and phone are for a counsellor to reach you and to know how
          to address you. None of them appear anywhere another member can see.
        </p>

        {error && (
          <p role="alert" className="mt-3 rounded-md border border-danger/40 bg-danger/10 px-3 py-2 text-[12.5px] text-ink-secondary">
            {error}
          </p>
        )}

        <div className="mt-4 flex items-center gap-3">
          <button type="button" onClick={save} disabled={saving} className="btn-primary !py-2.5 text-[13px]">
            {saving ? 'Saving…' : 'Save'}
          </button>
          {saved && <span className="text-[12px] text-success">Saved.</span>}
        </div>
      </Card>

      <CraftCard />

      <Card className="mb-4">
        <p className="mb-3 text-[11px] uppercase tracking-wide text-ink-muted">Account</p>
        <dl className="space-y-2 text-[13px]">
          <Row label="Email" value={user?.email || '—'} />
          <Row label="Signed in with" value={user?.providerData?.[0]?.providerId ?? '—'} />
          <Row label="Entries" value={String(profile?.totalJournalEntries ?? 0)} />
          <Row label="Minutes sat" value={String(Math.round((profile?.totalMeditationSeconds ?? 0) / 60))} />
          <Row label="Current streak" value={`${profile?.streak ?? 0} days`} />
          <Row label="Longest streak" value={`${profile?.longestStreak ?? 0} days`} />
          {isAdmin && <Row label="Role" value="Operator" />}
        </dl>

        {isAdmin && (
          <Link
            href="/app/admin"
            className="btn-ghost mt-4 w-full !py-2.5 text-[13px]"
          >
            <ShieldCheck className="h-4 w-4" /> Open the operator console
          </Link>
        )}
      </Card>

      <Card className="mb-4">
        <p className="mb-2 text-[11px] uppercase tracking-wide text-ink-muted">Privacy</p>
        <p className="text-[12.5px] leading-relaxed text-ink-secondary">
          Your email, phone, age and gender are never shown to other members.
          Your journal is scoped to your account inside the database query
          itself, and there is no administrative screen anywhere that lists
          member journals.
        </p>
      </Card>

      <div className="mt-8 space-y-3">
        <button
          type="button"
          onClick={async () => {
            await signOut();
            window.location.href = '/';
          }}
          className="btn-ghost w-full"
        >
          <LogOut className="h-4 w-4" /> Sign out
        </button>

        <button
          type="button"
          onClick={deleteAccount}
          disabled={deleting}
          className="btn w-full border border-danger/50 bg-danger/10 text-red-300 hover:bg-danger/20"
        >
          <Trash2 className="h-4 w-4" />
          {deleting ? 'Deleting everything…' : 'Delete my account and all my data'}
        </button>

        <p className="text-center text-[11.5px] leading-relaxed text-ink-muted">
          Deletion is immediate and cannot be undone. It removes your journal,
          your sessions, your profile and your place on the leaderboard.
        </p>
      </div>
    </>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  error,
  inputMode,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
  inputMode?: 'numeric' | 'tel';
}) {
  const id = `profile-${label.replace(/\W+/g, '-').toLowerCase()}`;
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-[12px] font-medium text-ink-secondary">
        {label}
      </label>
      <input
        id={id}
        className={`field ${error ? '!border-danger' : ''}`}
        value={value}
        inputMode={inputMode}
        placeholder={placeholder}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        onChange={(event) => onChange(event.target.value)}
      />
      {error && (
        <p id={`${id}-error`} className="mt-1 text-[11.5px] text-danger">
          {error}
        </p>
      )}
    </div>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
}) {
  const id = `profile-${label.replace(/\W+/g, '-').toLowerCase()}`;
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-[12px] font-medium text-ink-secondary">
        {label}
      </label>
      <select
        id={id}
        className="field"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

/**
 * What this member is trying to get good at.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * Why this replaced a text box
 *
 * `profession` was a free-text field here — "Student, engineer, between
 * things…" — and an id everywhere else. The app matches on the id to pick a
 * checklist, so somebody who typed "singer" on the web got no singer checklist,
 * no craft chips in the journal, and an empty consistency chart in Insights. The
 * field looked filled in and did nothing.
 *
 * It writes the same three things the app's craft setup sheet writes:
 * `profession` (an id), `craftWeeklyTarget`, and `customHabits` — the member's
 * own checklist items on top of their craft's presets. All three have been
 * accepted by `PATCH /profile/me` since the beginning; the web simply never sent
 * them.
 *
 * Saved on its own rather than through the form above, because choosing a craft
 * is a finished action and nobody expects to have to scroll back up and press
 * Save after it.
 */
function CraftCard() {
  const { profile, refreshProfile } = useAuth();

  const [profession, setProfession] = useState('');
  const [aim, setAim] = useState('');
  const [target, setTarget] = useState(DEFAULT_WEEKLY_TARGET);
  const [habits, setHabits] = useState<{ id: string; label: string }[]>([]);
  const [adding, setAdding] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setProfession(isKnownProfession(profile?.profession) ? profile!.profession! : '');
    setAim(profile?.aim ?? '');
    setTarget(profile?.craftWeeklyTarget || DEFAULT_WEEKLY_TARGET);
    setHabits(profile?.customHabits ?? []);
  }, [profile]);

  const chosen = profession ? professionById(profession) : null;

  function addHabit() {
    const label = adding.trim();
    if (!label || habits.length >= MAX_CUSTOM_HABITS) return;
    const { id } = customHabit(label);
    setHabits((current) => [...current, { id, label }]);
    setAdding('');
    setSaved(false);
  }

  async function save() {
    setSaving(true);
    setSaved(false);
    setError(null);
    try {
      await api.patch('/api/profile/me', {
        profession: profession || null,
        aim: aim.trim() || null,
        craftWeeklyTarget: target,
        customHabits: habits,
      });
      await refreshProfile();
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save that.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card className="mb-4">
      <p className="mb-1 text-[11px] uppercase tracking-wide text-ink-muted">
        Your craft
      </p>
      <p className="mb-4 text-[12.5px] leading-relaxed text-ink-secondary">
        The journal already proves you turned up. This is what makes it prove you
        turned up <em>for the thing you care about</em> — pick one and the journal
        gains a small daily checklist, and Insights starts answering whether you
        are actually doing the work.
      </p>

      <label
        htmlFor="craft-profession"
        className="mb-1.5 block text-[12px] font-medium text-ink-secondary"
      >
        What are you working on?
      </label>
      <select
        id="craft-profession"
        className="field"
        value={profession}
        onChange={(event) => {
          setProfession(event.target.value);
          setSaved(false);
        }}
      >
        <option value="">Not set — no craft checklist</option>
        {PROFESSIONS.map((option) => (
          <option key={option.id} value={option.id}>
            {option.emoji} {option.label}
          </option>
        ))}
      </select>

      {chosen && (
        <>
          <label
            htmlFor="craft-aim"
            className="mb-1.5 mt-4 block text-[12px] font-medium text-ink-secondary"
          >
            What are you working towards?
          </label>
          <input
            id="craft-aim"
            className="field"
            value={aim}
            onChange={(event) => {
              setAim(event.target.value);
              setSaved(false);
            }}
            placeholder={chosen.aimHint}
          />

          <p className="mb-2 mt-4 text-[12px] font-medium text-ink-secondary">
            How many days a week?
          </p>
          {/* Seven is deliberately not the default. A target you break in week
              one is worse than no target, and this is meant to build a habit
              rather than to catch you failing. */}
          <div className="flex gap-2">
            {WEEKLY_TARGETS.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => {
                  setTarget(option);
                  setSaved(false);
                }}
                aria-pressed={target === option}
                className={`h-10 flex-1 rounded-md border text-[13px] font-semibold transition ${
                  target === option
                    ? 'border-primary bg-primary/20 text-primary-light'
                    : 'border-hairline bg-bg-dark/40 text-ink-secondary hover:border-primary/50'
                }`}
              >
                {option}
              </button>
            ))}
          </div>

          <p className="mb-2 mt-5 text-[12px] font-medium text-ink-secondary">
            Your daily checklist
          </p>
          <div className="flex flex-wrap gap-1.5">
            {chosen.habits.map((habit) => (
              <span key={habit.id} className="chip !py-1 text-[11.5px]">
                {habit.emoji} {habit.label}
              </span>
            ))}
            {habits.map((habit) => (
              <span
                key={habit.id}
                className="chip !border-primary/50 !py-1 text-[11.5px] !text-primary-light"
              >
                {habit.label}
                <button
                  type="button"
                  onClick={() => {
                    setHabits((current) =>
                      current.filter((item) => item.id !== habit.id)
                    );
                    setSaved(false);
                  }}
                  aria-label={`Remove ${habit.label}`}
                  className="ml-0.5 transition hover:text-danger"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>

          {habits.length < MAX_CUSTOM_HABITS && (
            <div className="mt-3 flex gap-2">
              <input
                className="field flex-1"
                value={adding}
                maxLength={120}
                onChange={(event) => setAdding(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    event.preventDefault();
                    addHabit();
                  }
                }}
                placeholder="Add your own — “Gym”, “Called Amma”…"
              />
              <button
                type="button"
                onClick={addHabit}
                disabled={!adding.trim()}
                className="btn-ghost !py-2.5 text-[12.5px] disabled:opacity-50"
              >
                Add
              </button>
            </div>
          )}

          <p className="mt-2 text-[11.5px] leading-relaxed text-ink-muted">
            Anything you add counts towards the streak exactly like the presets
            do. Removing one keeps every day it was already ticked — the history
            is not rewritten, it just stops being offered.
          </p>
        </>
      )}

      {error && (
        <p
          role="alert"
          className="mt-3 rounded-md border border-danger/40 bg-danger/10 px-3 py-2 text-[12.5px] text-ink-secondary"
        >
          {error}
        </p>
      )}

      <div className="mt-4 flex items-center gap-3">
        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="btn-primary !py-2.5 text-[13px]"
        >
          {saving ? 'Saving…' : 'Save craft'}
        </button>
        {saved && <span className="text-[12px] text-success">Saved.</span>}
      </div>
    </Card>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-ink-muted">{label}</dt>
      <dd className="truncate text-ink-secondary">{value}</dd>
    </div>
  );
}
