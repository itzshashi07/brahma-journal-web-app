import {
  Bell,
  BookOpen,
  Brain,
  CloudDrizzle,
  Flame,
  GraduationCap,
  HeartHandshake,
  Library,
  LineChart,
  MessageCircleHeart,
  MessagesSquare,
  Moon,
  NotebookPen,
  Repeat,
  ShieldCheck,
  Sparkles,
  Sunrise,
  Target,
  Trophy,
  Users,
  Waves,
  type LucideIcon,
} from 'lucide-react';

/**
 * The icon set, resolved by name.
 *
 * The content files in `src/content` are plain data and name their icon as a
 * string. That keeps them free of JSX — which is what lets them be imported by
 * `sitemap.ts` and by server components without dragging React into either.
 *
 * The registry is explicit rather than a dynamic import of all of lucide,
 * because `import * as icons` defeats tree-shaking and puts roughly a thousand
 * unused SVG components into the bundle of a page whose whole job is to load
 * fast on a phone.
 */
const registry = {
  Bell,
  BookOpen,
  Brain,
  CloudDrizzle,
  Flame,
  GraduationCap,
  HeartHandshake,
  Library,
  LineChart,
  MessageCircleHeart,
  MessagesSquare,
  Moon,
  NotebookPen,
  Repeat,
  ShieldCheck,
  Sparkles,
  Sunrise,
  Target,
  Trophy,
  Users,
  Waves,
} satisfies Record<string, LucideIcon>;

export type IconName = keyof typeof registry;

export function Icon({
  name,
  className,
}: {
  name: string;
  className?: string;
}) {
  // Falls back rather than throwing: a typo in a content file should cost a
  // wrong glyph, not a page that fails to render.
  const Glyph = registry[name as IconName] ?? Sparkles;
  return <Glyph className={className} aria-hidden="true" />;
}
