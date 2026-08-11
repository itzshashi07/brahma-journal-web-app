'use client';

import { useState } from 'react';
import { Shuffle } from 'lucide-react';

import {
  ACCESSORIES,
  Avatar,
  AVATAR_PRESETS,
  BACKGROUNDS,
  CLOTHES_COLORS,
  DEFAULT_AVATAR,
  FACES,
  HAIR_COLORS,
  HAIR_STYLES,
  SKIN_TONES,
  encodeAvatar,
  parseAvatar,
  type BuiltAvatar,
} from './Avatar';

/**
 * Building an avatar.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * Presets first, options second
 *
 * Seven rows of choices is a character creator, and most people do not want to
 * make one — they want a face that is not a grey circle and they want to be done
 * in four seconds. So the ready-made looks are at the top, the rest is behind
 * "Change the details", and either route produces the same seven integers.
 *
 * This is the same encoding the Android app writes, which is the whole point:
 * see the note in `Avatar.tsx`. An avatar built here appears on the phone and
 * on the leaderboard, because it is one string on one profile record.
 *
 * Nothing is uploaded and nothing is moderated — there is no image, only a
 * choice of seven numbers, which is also why this can exist at all in a product
 * with no storage bucket and no review queue for pictures.
 */
export function AvatarPicker({
  value,
  name,
  email,
  onChange,
}: {
  value?: string | null;
  name?: string | null;
  email?: string | null;
  onChange: (avatarId: string) => void;
}) {
  const current = parseAvatar(value);
  const [expanded, setExpanded] = useState(false);

  const set = (patch: Partial<BuiltAvatar>) =>
    onChange(encodeAvatar({ ...current, ...patch }));

  const randomise = () => {
    // Not `Math.random` over every axis — that produces green hair on a purple
    // ground about as often as it produces something a person would keep. A
    // preset, then a nudge to two axes, stays inside the set that was designed.
    const preset =
      AVATAR_PRESETS[Math.floor(Math.random() * AVATAR_PRESETS.length)];
    onChange(
      encodeAvatar({
        ...preset,
        bg: Math.floor(Math.random() * BACKGROUNDS.length),
        face: Math.floor(Math.random() * FACES.length),
      })
    );
  };

  return (
    <div>
      <div className="flex items-center gap-4">
        <Avatar
          avatarId={value}
          name={name}
          email={email}
          size={72}
          ring
        />
        <div className="min-w-0">
          <p className="text-[13.5px] font-semibold text-ink-primary">
            Your face on the board
          </p>
          <p className="mt-0.5 text-[12px] leading-relaxed text-ink-secondary">
            Drawn from a handful of choices, not uploaded. It is the only thing
            other members see besides your display name.
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={randomise}
              className="inline-flex items-center gap-1.5 rounded-pill border border-hairline px-3 py-1.5 text-[11.5px] font-medium text-ink-secondary transition hover:border-primary/50 hover:text-ink-primary"
            >
              <Shuffle className="h-3.5 w-3.5" /> Surprise me
            </button>
            <button
              type="button"
              onClick={() => setExpanded((open) => !open)}
              className="rounded-pill border border-hairline px-3 py-1.5 text-[11.5px] font-medium text-ink-secondary transition hover:border-primary/50 hover:text-ink-primary"
            >
              {expanded ? 'Hide the details' : 'Change the details'}
            </button>
          </div>
        </div>
      </div>

      <p className="mb-2 mt-5 text-[11px] uppercase tracking-wide text-ink-muted">
        Ready-made
      </p>
      <div className="flex flex-wrap gap-2">
        {AVATAR_PRESETS.map((preset, index) => {
          const id = encodeAvatar(preset);
          const active = id === encodeAvatar(current);
          return (
            <button
              key={index}
              type="button"
              onClick={() => onChange(id)}
              aria-pressed={active}
              aria-label={`Avatar ${index + 1}`}
              className={`rounded-full transition ${
                active
                  ? 'ring-2 ring-primary ring-offset-2 ring-offset-bg-dark'
                  : 'opacity-80 hover:opacity-100'
              }`}
            >
              <Avatar avatarId={id} size={44} />
            </button>
          );
        })}
      </div>

      {expanded && (
        <div className="mt-5 space-y-4 border-t border-hairline pt-5">
          <Swatches
            label="Background"
            colors={BACKGROUNDS.map(([from, to]) => `linear-gradient(135deg, ${from}, ${to})`)}
            selected={current.bg}
            onSelect={(bg) => set({ bg })}
          />
          <Swatches
            label="Skin"
            colors={SKIN_TONES}
            selected={current.skin}
            onSelect={(skin) => set({ skin })}
          />
          <Options
            label="Hair"
            options={HAIR_STYLES}
            selected={current.hair}
            onSelect={(hair) => set({ hair })}
          />
          <Swatches
            label="Hair colour"
            colors={HAIR_COLORS}
            selected={current.hairColor}
            onSelect={(hairColor) => set({ hairColor })}
          />
          <Options
            label="Expression"
            options={FACES}
            selected={current.face}
            onSelect={(face) => set({ face })}
          />
          <Options
            label="Extras"
            options={ACCESSORIES}
            selected={current.accessory}
            onSelect={(accessory) => set({ accessory })}
          />
          <Swatches
            label="Clothes"
            colors={CLOTHES_COLORS}
            selected={current.clothes}
            onSelect={(clothes) => set({ clothes })}
          />

          <button
            type="button"
            onClick={() => onChange(encodeAvatar(DEFAULT_AVATAR))}
            className="text-[12px] text-ink-muted underline underline-offset-2 hover:text-ink-secondary"
          >
            Start again from the default
          </button>
        </div>
      )}
    </div>
  );
}

function Swatches({
  label,
  colors,
  selected,
  onSelect,
}: {
  label: string;
  colors: string[];
  selected: number;
  onSelect: (index: number) => void;
}) {
  return (
    <div>
      <p className="mb-2 text-[11px] uppercase tracking-wide text-ink-muted">
        {label}
      </p>
      <div className="flex flex-wrap gap-2">
        {colors.map((colour, index) => (
          <button
            key={index}
            type="button"
            onClick={() => onSelect(index)}
            aria-label={`${label} ${index + 1}`}
            aria-pressed={selected === index}
            style={
              colour.startsWith('linear-gradient')
                ? { backgroundImage: colour }
                : { backgroundColor: colour }
            }
            className={`h-8 w-8 rounded-full border transition ${
              selected === index
                ? 'border-transparent ring-2 ring-primary ring-offset-2 ring-offset-bg-dark'
                : 'border-hairline hover:scale-105'
            }`}
          />
        ))}
      </div>
    </div>
  );
}

function Options({
  label,
  options,
  selected,
  onSelect,
}: {
  label: string;
  options: readonly string[];
  selected: number;
  onSelect: (index: number) => void;
}) {
  return (
    <div>
      <p className="mb-2 text-[11px] uppercase tracking-wide text-ink-muted">
        {label}
      </p>
      <div className="flex flex-wrap gap-1.5">
        {options.map((option, index) => (
          <button
            key={option}
            type="button"
            onClick={() => onSelect(index)}
            aria-pressed={selected === index}
            className={`rounded-pill px-3 py-1.5 text-[11.5px] font-medium transition ${
              selected === index
                ? 'bg-primary/20 text-primary-light'
                : 'border border-hairline text-ink-muted hover:text-ink-secondary'
            }`}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}
