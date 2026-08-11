'use client';

import { useEffect, useState } from 'react';
import { LogOut, Trash2 } from 'lucide-react';

import { Card, PageHeader } from '@/components/app/ui';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { site } from '@/lib/site';

/**
 * Profile, and the two irreversible buttons.
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
  const [aim, setAim] = useState('');
  const [profession, setProfession] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    setName(profile?.name ?? '');
    setAim(profile?.aim ?? '');
    setProfession(profile?.profession ?? '');
  }, [profile]);

  async function save() {
    setSaving(true);
    setSaved(false);
    try {
      await api.patch('/api/profile/me', {
        name: name.trim() || null,
        aim: aim.trim() || null,
        profession: profession.trim() || null,
      });
      await refreshProfile();
      setSaved(true);
    } finally {
      setSaving(false);
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

  return (
    <>
      <PageHeader
        title="Your profile"
        subtitle="Only your display name and avatar are ever shown to other members."
      />

      <Card className="mb-4">
        <div className="space-y-3">
          <Field label="Display name" value={name} onChange={setName} placeholder="What the leaderboard shows" />
          <Field label="What you do" value={profession} onChange={setProfession} placeholder="Student, engineer, between things…" />
          <Field label="What you are working towards" value={aim} onChange={setAim} placeholder="Sleeping before 1am" />
        </div>

        <div className="mt-4 flex items-center gap-3">
          <button type="button" onClick={save} disabled={saving} className="btn-primary !py-2.5 text-[13px]">
            {saving ? 'Saving…' : 'Save'}
          </button>
          {saved && <span className="text-[12px] text-success">Saved.</span>}
        </div>
      </Card>

      <Card className="mb-4">
        <p className="mb-3 text-[11px] uppercase tracking-wide text-ink-muted">Account</p>
        <dl className="space-y-2 text-[13px]">
          <Row label="Email" value={user?.email || '—'} />
          <Row label="Signed in with" value={user?.providerData?.[0]?.providerId ?? '—'} />
          <Row label="Entries" value={String(profile?.totalJournalEntries ?? 0)} />
          <Row label="Current streak" value={`${profile?.streak ?? 0} days`} />
          {isAdmin && <Row label="Role" value="Operator" />}
        </dl>
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
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  const id = `profile-${label.replace(/\W+/g, '-').toLowerCase()}`;
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-[12px] font-medium text-ink-secondary">
        {label}
      </label>
      <input
        id={id}
        className="field"
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
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
