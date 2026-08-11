'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  BarChart3,
  BookOpen,
  Brain,
  Flame,
  Gamepad2,
  HeartHandshake,
  Library,
  LogOut,
  Menu,
  MessagesSquare,
  NotebookPen,
  ScrollText,
  Sparkles,
  Trophy,
  User,
  X,
} from 'lucide-react';

import { Logo } from '@/components/Logo';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useAuth } from '@/lib/auth-context';
import { NotificationBell } from './NotificationBell';

/**
 * The application shell: the auth gate, the navigation, and the frame.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * What the gate is and is not
 *
 * The redirect below is a **routing** decision, not a security boundary. It
 * stops a signed-out visitor being shown an empty dashboard; it does not
 * protect anything, and it must not be mistaken for protection.
 *
 * What actually protects the data is that every request to the API carries a
 * Firebase ID token which the server verifies with the Admin SDK, and every
 * query is scoped to the uid inside that token. Someone who deletes this
 * component in devtools reaches a page that renders empty and receives 401s.
 */

const nav = [
  { href: '/app/dashboard', label: 'Today', icon: Flame },
  { href: '/app/journal', label: 'Journal', icon: NotebookPen },
  { href: '/app/meditation', label: 'Meditate', icon: Brain },
  { href: '/app/affirmations', label: 'Affirmations', icon: Sparkles },
  { href: '/app/wisdom', label: 'Wisdom', icon: ScrollText },
  { href: '/app/thoughts', label: 'Reflections', icon: MessagesSquare },
  { href: '/app/community', label: 'Community', icon: Trophy },
  { href: '/app/blogs', label: 'Sanctuary', icon: BookOpen },
  { href: '/app/library', label: 'Library', icon: Library },
  { href: '/app/counselling', label: 'Counselling', icon: HeartHandshake },
  { href: '/app/games', label: 'Focus', icon: Gamepad2 },
  { href: '/app/analytics', label: 'Insights', icon: BarChart3 },
  { href: '/app/profile', label: 'Profile', icon: User },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const { user, loading, profile, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (loading || user) return;
    // `next` so the member lands where they were going rather than on the
    // dashboard after signing in. Validated on the other side — see AuthForm.
    router.replace(`/login?next=${encodeURIComponent(pathname)}`);
  }, [loading, user, pathname, router]);

  useEffect(() => setOpen(false), [pathname]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Logo className="h-12 w-12 animate-breathe" />
          <p className="text-[13px] text-ink-muted">Opening your account…</p>
        </div>
      </div>
    );
  }

  // The redirect is already in flight; rendering the shell for a beat would
  // flash empty navigation at somebody on their way to the sign-in screen.
  if (!user) return null;

  return (
    <div className="flex min-h-screen">
      {/* ─────────────── desktop sidebar ─────────────── */}
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-hairline bg-bg-dark/70 backdrop-blur-xl lg:flex">
        <Link
          href="/app/dashboard"
          className="flex items-center gap-2.5 px-5 py-5"
        >
          <Logo className="h-8 w-8" />
          <span className="text-[15px] font-semibold text-ink-primary">
            InnenFlow
          </span>
        </Link>

        <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 pb-4">
          {nav.map((item) => (
            <NavLink key={item.href} {...item} active={pathname === item.href} />
          ))}
        </nav>

        <div className="border-t border-hairline p-3">
          <button
            type="button"
            onClick={async () => {
              await signOut();
              router.replace('/');
            }}
            className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-[13px] text-ink-muted transition hover:bg-bg-card hover:text-ink-primary"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* ─────────────── top bar ─────────────── */}
        <header className="sticky top-0 z-40 border-b border-hairline bg-bg-dark/85 backdrop-blur-xl">
          <div className="flex h-14 items-center gap-3 px-4 sm:px-6">
            <button
              type="button"
              onClick={() => setOpen((value) => !value)}
              className="rounded-md border border-hairline p-2 text-ink-secondary lg:hidden"
              aria-label={open ? 'Close menu' : 'Open menu'}
              aria-expanded={open}
            >
              {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>

            <Link href="/app/dashboard" className="lg:hidden">
              <Logo className="h-7 w-7" />
            </Link>

            <p className="ml-auto hidden text-[13px] text-ink-secondary sm:block">
              {profile?.name ? `Hello, ${profile.name}` : 'Welcome back'}
            </p>

            <ThemeToggle className="ml-auto sm:ml-0" />

            {typeof profile?.streak === 'number' && profile.streak > 0 && (
              <span className="chip !py-1 text-[11px]">
                <Flame className="h-3 w-3 text-accent" />
                {profile.streak}
              </span>
            )}

            <NotificationBell />
          </div>

          {open && (
            <nav className="grid gap-0.5 border-t border-hairline p-3 lg:hidden">
              {nav.map((item) => (
                <NavLink
                  key={item.href}
                  {...item}
                  active={pathname === item.href}
                />
              ))}
              <button
                type="button"
                onClick={async () => {
                  await signOut();
                  router.replace('/');
                }}
                className="flex items-center gap-3 rounded-md px-3 py-2.5 text-[13px] text-ink-muted hover:bg-bg-card"
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </button>
            </nav>
          )}
        </header>

        {/* `pb-24` on phones so the last card clears the tab bar below. */}
        <main className="flex-1 px-4 pb-24 pt-6 sm:px-6 sm:py-8 lg:pb-8">
          <div className="mx-auto w-full max-w-4xl">{children}</div>
        </main>

        <BottomTabs pathname={pathname} />
      </div>
    </div>
  );
}

/**
 * The bottom tab bar, on phones only.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * Why this exists when there is already a menu
 *
 * A hamburger is a web convention. Every app this one sits next to on a home
 * screen — including its own Android build — puts the four things you do daily
 * within thumb reach at the bottom of the screen, and a member who moves
 * between the two should not have to change how they hold the phone.
 *
 * Four, not thirteen. A tab bar is for the things done every day; everything
 * else stays in the menu, which is still there. Five tabs on a narrow phone
 * gives each one a target smaller than a fingertip, which is how a tab bar
 * becomes slower than the menu it replaced.
 *
 * The `pb-safe` is the home indicator: without it the labels sit under the bar
 * iOS draws across the bottom of the screen.
 */
function BottomTabs({ pathname }: { pathname: string }) {
  const tabs = [
    { href: '/app/dashboard', label: 'Today', icon: Flame },
    { href: '/app/journal', label: 'Journal', icon: NotebookPen },
    { href: '/app/meditation', label: 'Sit', icon: Brain },
    { href: '/app/thoughts', label: 'Board', icon: MessagesSquare },
  ];

  return (
    <nav
      aria-label="Primary"
      className="pb-safe fixed inset-x-0 bottom-0 z-40 border-t border-hairline bg-bg-dark/90 backdrop-blur-xl lg:hidden"
    >
      <div className="flex">
        {tabs.map(({ href, label, icon: Glyph }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? 'page' : undefined}
              // min-h-[3.25rem] keeps every target comfortably past the 44px
              // that a fingertip actually needs.
              className={`flex min-h-[3.25rem] flex-1 flex-col items-center justify-center gap-0.5 py-2 text-[10px] font-medium transition-colors active:bg-bg-card/60 ${
                active ? 'text-primary-light' : 'text-ink-muted'
              }`}
            >
              <Glyph className="h-[18px] w-[18px]" />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

function NavLink({
  href,
  label,
  icon: Glyph,
  active,
}: {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? 'page' : undefined}
      className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-[13px] transition ${
        active
          ? 'bg-primary/15 font-medium text-ink-primary'
          : 'text-ink-secondary hover:bg-bg-card hover:text-ink-primary'
      }`}
    >
      <Glyph className={`h-4 w-4 ${active ? 'text-primary-light' : ''}`} />
      {label}
    </Link>
  );
}
