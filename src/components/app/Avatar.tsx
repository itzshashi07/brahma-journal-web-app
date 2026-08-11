'use client';

/**
 * A member's avatar, drawn in SVG.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * The same avatar as the Android app, from the same string
 *
 * The app stores a built avatar in `profile.avatarId` as
 * `m:bg,skin,hair,hairColor,face,accessory,clothes` — seven small integers
 * indexing the option sets below. This is a port of
 * `lib/core/constants/modern_avatars.dart` and `lib/widgets/modern_avatar_art.dart`,
 * so an avatar built on a phone renders here and one built here renders on the
 * phone. That is the whole reason for reproducing the encoding rather than
 * inventing a web-only one: the profile is one record, and a member who edits it
 * in a browser must not come back to a different face on their handset.
 *
 * Vector, and drawn in code: nothing to upload, nothing to moderate, no asset to
 * ship, and it stays sharp at 24px in a leaderboard row and at 128px on the
 * profile screen.
 *
 * Anything that is not an `m:` id — an empty field, or one of the older
 * spiritual avatar ids the app still accepts — falls back to initials on the
 * brand gradient. An avatar is never worth an error state.
 */

export type BuiltAvatar = {
  bg: number;
  skin: number;
  hair: number;
  hairColor: number;
  face: number;
  accessory: number;
  clothes: number;
};

export const AVATAR_PREFIX = 'm:';

// ─────────────────────────── option sets ───────────────────────────
// Values copied from modern_avatars.dart. The indices are the wire format, so
// nothing may be reordered or removed here without changing what every stored
// avatar means — only appended to.

export const BACKGROUNDS: [string, string][] = [
  ['#7C3AED', '#4338CA'],
  ['#0891B2', '#0F172A'],
  ['#F59E0B', '#B45309'],
  ['#10B981', '#065F46'],
  ['#EC4899', '#831843'],
  ['#3B82F6', '#1E3A8A'],
  ['#64748B', '#1E293B'],
  ['#F97316', '#7C2D12'],
];

export const SKIN_TONES = [
  '#F6D5B8',
  '#E8B990',
  '#CC9A6E',
  '#A9744C',
  '#7A4E30',
  '#4E3220',
];

export const HAIR_COLORS = [
  '#1F1B18',
  '#3B2A20',
  '#6B4423',
  '#9A6B3F',
  '#8B8B8B',
  '#7C3AED',
  '#0EA5E9',
];

export const CLOTHES_COLORS = [
  '#7C3AED',
  '#0EA5E9',
  '#10B981',
  '#F59E0B',
  '#EF4444',
  '#F8FAFC',
  '#1F2937',
];

export const HAIR_STYLES = [
  'Buzz',
  'Short',
  'Side part',
  'Curly',
  'Bun',
  'Long',
  'Ponytail',
  'Wrap',
  'Scarf',
];

export const FACES = ['Calm', 'Happy', 'Focused', 'Meditating'];

export const ACCESSORIES = [
  'None',
  'Glasses',
  'Headphones',
  'Cap',
  'Earrings',
  'Bindi',
];

export const DEFAULT_AVATAR: BuiltAvatar = {
  bg: 0,
  skin: 1,
  hair: 1,
  hairColor: 0,
  face: 0,
  accessory: 0,
  clothes: 0,
};

/** Ready-made looks, for the majority who will tap one and leave. */
export const AVATAR_PRESETS: BuiltAvatar[] = [
  { bg: 0, skin: 1, hair: 1, hairColor: 0, face: 0, accessory: 0, clothes: 0 },
  { bg: 1, skin: 2, hair: 5, hairColor: 1, face: 1, accessory: 4, clothes: 1 },
  { bg: 3, skin: 0, hair: 2, hairColor: 2, face: 2, accessory: 1, clothes: 2 },
  { bg: 2, skin: 3, hair: 4, hairColor: 0, face: 3, accessory: 5, clothes: 3 },
  { bg: 4, skin: 1, hair: 6, hairColor: 0, face: 1, accessory: 0, clothes: 4 },
  { bg: 5, skin: 4, hair: 3, hairColor: 1, face: 0, accessory: 2, clothes: 5 },
  { bg: 6, skin: 2, hair: 7, hairColor: 0, face: 3, accessory: 0, clothes: 6 },
  { bg: 7, skin: 5, hair: 8, hairColor: 0, face: 0, accessory: 5, clothes: 3 },
  { bg: 1, skin: 0, hair: 0, hairColor: 4, face: 2, accessory: 1, clothes: 6 },
  { bg: 3, skin: 3, hair: 5, hairColor: 5, face: 1, accessory: 2, clothes: 0 },
  { bg: 5, skin: 1, hair: 3, hairColor: 6, face: 1, accessory: 0, clothes: 1 },
  { bg: 0, skin: 4, hair: 4, hairColor: 0, face: 3, accessory: 0, clothes: 5 },
];

export function isBuiltAvatar(id?: string | null): boolean {
  return typeof id === 'string' && id.startsWith(AVATAR_PREFIX);
}

export function encodeAvatar(a: BuiltAvatar): string {
  return `${AVATAR_PREFIX}${a.bg},${a.skin},${a.hair},${a.hairColor},${a.face},${a.accessory},${a.clothes}`;
}

/** Out-of-range and unparseable values fall back to 0 rather than throwing. */
export function parseAvatar(id?: string | null): BuiltAvatar {
  if (!isBuiltAvatar(id)) return DEFAULT_AVATAR;

  const parts = id!.slice(AVATAR_PREFIX.length).split(',');
  const at = (index: number, max: number) => {
    const value = Number.parseInt(parts[index] ?? '', 10);
    if (!Number.isFinite(value) || value < 0 || value >= max) return 0;
    return value;
  };

  return {
    bg: at(0, BACKGROUNDS.length),
    skin: at(1, SKIN_TONES.length),
    hair: at(2, HAIR_STYLES.length),
    hairColor: at(3, HAIR_COLORS.length),
    face: at(4, FACES.length),
    accessory: at(5, ACCESSORIES.length),
    clothes: at(6, CLOTHES_COLORS.length),
  };
}

export function initialsFrom(name?: string | null, email?: string | null): string {
  const source = (name || email || '').trim();
  if (!source) return '🙂';

  const words = source.split(/\s+/).filter(Boolean);
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase();
  }
  return source.slice(0, 2).toUpperCase();
}

// ─────────────────────────── the drawing ───────────────────────────
// One 100×100 viewBox, so every coordinate below reads as a percentage and the
// component scales by CSS alone.

function Hair({ style, color, cloth }: { style: number; color: string; cloth: string }) {
  switch (style) {
    case 0: // Buzz — a thin cap following the skull
      return (
        <path
          d="M29 46a21 21 0 0 1 42 0"
          fill="none"
          stroke={color}
          strokeWidth="4.5"
          strokeLinecap="round"
        />
      );
    case 1: // Short
      return <path d="M27 47a23 23 0 0 1 46 0Z" fill={color} />;
    case 2: // Side part — fuller on one side
      return (
        <g fill={color}>
          <path d="M27 47a23 23 0 0 1 46 0Z" />
          <rect x="27" y="40" width="16" height="19" rx="4" />
        </g>
      );
    case 3: // Curly
      return (
        <g fill={color}>
          <path d="M27 47a23 23 0 0 1 46 0Z" />
          <circle cx="32" cy="38" r="7" />
          <circle cx="43" cy="30" r="8" />
          <circle cx="57" cy="30" r="8" />
          <circle cx="68" cy="38" r="7" />
        </g>
      );
    case 4: // Bun
      return (
        <g fill={color}>
          <circle cx="50" cy="22" r="7.5" />
          <path d="M27 47a23 23 0 0 1 46 0Z" />
        </g>
      );
    case 5: // Long
      return (
        <g fill={color}>
          <path d="M27 47a23 23 0 0 1 46 0Z" />
          <path d="M26 44c-2 12-1 22 1 30h8V44Zm48 0c2 12 1 22-1 30h-8V44Z" />
        </g>
      );
    case 6: // Ponytail
      return (
        <g fill={color}>
          <path d="M27 47a23 23 0 0 1 46 0Z" />
          <path d="M70 42c8 4 11 14 8 24-1 4-5 5-7 2-3-6-4-16-1-26Z" />
        </g>
      );
    case 7: // Wrap
      return (
        <g>
          <path d="M25 48a25 25 0 0 1 50 0c0 3-4 2-8-1-6-4-10-6-17-6s-11 2-17 6c-4 3-8 4-8 1Z" fill={cloth} />
          <path d="M29 46a21 21 0 0 1 42 0" fill="none" stroke={color} strokeWidth="3" />
        </g>
      );
    case 8: // Scarf
      return (
        <g>
          <path d="M26 50a24 24 0 0 1 48 0c0 12-6 20-10 24H36c-4-4-10-12-10-24Z" fill={cloth} />
          <path d="M50 26a24 24 0 0 0-24 24c0 4 .6 7.6 1.6 10.7C33 56 40 52 50 52s17 4 22.4 8.7C73.4 57.6 74 54 74 50a24 24 0 0 0-24-24Z" fill={cloth} opacity="0.55" />
        </g>
      );
    default:
      return null;
  }
}

function Face({ style }: { style: number }) {
  const eye = '#221E2E';

  switch (style) {
    case 1: // Happy — closed arcs and a wide smile
      return (
        <g fill="none" stroke={eye} strokeWidth="2.4" strokeLinecap="round">
          <path d="M40 45q3.5-4 7 0" />
          <path d="M53 45q3.5-4 7 0" />
          <path d="M43 54q7 6 14 0" />
        </g>
      );
    case 2: // Focused — level brows, straight mouth
      return (
        <g stroke={eye} strokeLinecap="round">
          <path d="M40 41h7M53 41h7" strokeWidth="2" opacity="0.8" fill="none" />
          <circle cx="43.5" cy="47" r="2.1" fill={eye} stroke="none" />
          <circle cx="56.5" cy="47" r="2.1" fill={eye} stroke="none" />
          <path d="M45 56h10" strokeWidth="2.2" fill="none" />
        </g>
      );
    case 3: // Meditating — eyes closed, mouth at rest
      return (
        <g fill="none" stroke={eye} strokeWidth="2.4" strokeLinecap="round">
          <path d="M40 47q3.5 3.5 7 0" />
          <path d="M53 47q3.5 3.5 7 0" />
          <path d="M46 56h8" strokeWidth="2" opacity="0.75" />
        </g>
      );
    default: // Calm
      return (
        <g>
          <circle cx="43.5" cy="46" r="2.3" fill={eye} />
          <circle cx="56.5" cy="46" r="2.3" fill={eye} />
          <path
            d="M44.5 55q5.5 4 11 0"
            fill="none"
            stroke={eye}
            strokeWidth="2.2"
            strokeLinecap="round"
          />
        </g>
      );
  }
}

function Accessory({ style, hairColor }: { style: number; hairColor: string }) {
  switch (style) {
    case 1: // Glasses
      return (
        <g fill="none" stroke="#2B2740" strokeWidth="2" opacity="0.9">
          <circle cx="43.5" cy="46" r="6" />
          <circle cx="56.5" cy="46" r="6" />
          <path d="M49.5 46h1M29 44l8.5 1M71 44l-8.5 1" strokeLinecap="round" />
        </g>
      );
    case 2: // Headphones
      return (
        <g>
          <path
            d="M28 48a22 22 0 0 1 44 0"
            fill="none"
            stroke="#2B2740"
            strokeWidth="4"
            strokeLinecap="round"
          />
          <rect x="24" y="45" width="8" height="13" rx="4" fill="#2B2740" />
          <rect x="68" y="45" width="8" height="13" rx="4" fill="#2B2740" />
        </g>
      );
    case 3: // Cap
      return (
        <g>
          <path d="M28 44a22 22 0 0 1 44 0Z" fill="#1F2937" />
          <path d="M26 44h30v5H29a3 3 0 0 1-3-5Z" fill="#111827" />
        </g>
      );
    case 4: // Earrings
      return (
        <g fill="#F5C451">
          <circle cx="29.5" cy="52" r="2.4" />
          <circle cx="70.5" cy="52" r="2.4" />
        </g>
      );
    case 5: // Bindi
      return <circle cx="50" cy="36.5" r="2.2" fill="#D6336C" />;
    default:
      return <g />;
  }
}

export function Avatar({
  avatarId,
  name,
  email,
  size = 40,
  ring = false,
  className = '',
}: {
  avatarId?: string | null;
  name?: string | null;
  email?: string | null;
  size?: number;
  ring?: boolean;
  className?: string;
}) {
  const wrapper = ring
    ? 'rounded-full ring-2 ring-primary/60 ring-offset-2 ring-offset-bg-dark'
    : '';

  if (!isBuiltAvatar(avatarId)) {
    return (
      <span
        aria-hidden="true"
        style={{ width: size, height: size, fontSize: size * 0.36 }}
        className={`inline-flex shrink-0 items-center justify-center rounded-full bg-gradient-primary font-semibold text-white/95 ${wrapper} ${className}`}
      >
        {initialsFrom(name, email)}
      </span>
    );
  }

  const a = parseAvatar(avatarId);
  const [from, to] = BACKGROUNDS[a.bg];
  const skin = SKIN_TONES[a.skin];
  const hair = HAIR_COLORS[a.hairColor];
  const cloth = CLOTHES_COLORS[a.clothes];

  // Unique per combination rather than per instance: two rows showing the same
  // avatar reuse one gradient definition, and the id stays stable across
  // renders so React does not repaint it.
  const gradientId = `av-${a.bg}-${a.clothes}`;

  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      role="img"
      aria-label={name ? `${name}'s avatar` : 'Avatar'}
      className={`shrink-0 rounded-full ${wrapper} ${className}`}
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={from} />
          <stop offset="100%" stopColor={to} />
        </linearGradient>
        <clipPath id={`${gradientId}-clip`}>
          <circle cx="50" cy="50" r="50" />
        </clipPath>
      </defs>

      <g clipPath={`url(#${gradientId}-clip)`}>
        <rect width="100" height="100" fill={`url(#${gradientId})`} />
        {/* A faint halo, so the head separates from the ground at 24px. */}
        <circle cx="50" cy="46" r="33" fill="#FFFFFF" opacity="0.06" />

        {/* Shoulders, then neck, then head — back to front. */}
        <path d="M16 110V92a34 34 0 0 1 68 0v18Z" fill={cloth} />
        <rect x="42" y="60" width="16" height="18" rx="5" fill={skin} />
        <circle cx="29" cy="48" r="3.5" fill={skin} />
        <circle cx="71" cy="48" r="3.5" fill={skin} />
        <circle cx="50" cy="46" r="21" fill={skin} />

        <Hair style={a.hair} color={hair} cloth={cloth} />
        <Face style={a.face} />
        <Accessory style={a.accessory} hairColor={hair} />
      </g>
    </svg>
  );
}
