'use client';

import { Avatar, AVATAR_PRESETS, encodeAvatar } from './Avatar';

/** Same six fixed portraits as Android; existing profile IDs stay readable. */
export function AvatarPicker({ value, name, email, onChange }: {
  value?: string | null;
  name?: string | null;
  email?: string | null;
  onChange: (avatarId: string) => void;
}) {
  return (
    <div>
      <div className="flex items-center gap-4">
        <Avatar avatarId={value} name={name} email={email} size={72} ring />
        <div>
          <p className="text-sm font-semibold text-ink-primary">Your profile picture</p>
          <p className="mt-1 text-xs text-ink-secondary">Choose one of six ready-made pictures.</p>
        </div>
      </div>
      <div className="mt-5 flex flex-wrap gap-4">
        {AVATAR_PRESETS.slice(0, 6).map((preset, index) => {
          const id = encodeAvatar(preset);
          return (
            <button key={id} type="button" onClick={() => onChange(id)}
              aria-label={`Profile picture ${index + 1}`} aria-pressed={value === id}
              className={`rounded-full p-1 transition ${value === id ? 'ring-2 ring-primary' : 'hover:ring-2 hover:ring-hairline'}`}>
              <Avatar avatarId={id} size={56} />
            </button>
          );
        })}
      </div>
    </div>
  );
}
