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
  ShieldCheck,
  Sparkles,
  Target,
  Trophy,
  User,
  X,
} from 'lucide-react';

import { Logo } from '@/components/Logo';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useAuth } from '@/lib/auth-context';
import { Avatar } from './Avatar';
import { DailyPrompts } from './DailyPrompts';
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
 *
 * The operator link is the same kind of thing: it is drawn from the `admin`
 * custom claim, and every screen behind it calls a route that checks the same
 * claim server-side. Flipping the flag in devtools reveals a page that renders
 * four 403s.
 */

const nav = [
  { href: '/app/dashboard', label: 'Today', icon: Flame },
  { href: '/app/journal', label: 'Journal', icon: NotebookPen },
  // Directly under the journal, because the two are one loop: the journal says
  // you turned up, this says whether the thing is getting finished.
  { href: '/app/deep-work', label: 'Deep work', icon: Target },
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

const adminNav = { href: '/app/admin', label: 'Operator', icon: ShieldCheck };

export function AppShell({ children }: { children: React.ReactNode }) {
  const { user, loading, profile, isAdmin, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const items = isAdmin ? [...nav, adminNav] : nav;

  useEffect(() => {
    if (loading || user) return;
    // `next` so the member lands where they were going rather than on the
    // dashboard after signing in. Validated on the other side — see AuthForm.
    router.replace(`/login?next=${encodeURIComponent(pathname)}`);
  }, [loading, user, pathname, router]);

  useEffect(() => setOpen(false), [pathname]);

  /**
   * While the drawer is open, the page behind it does not move.
   *
   * ─────────────────────────────────────────────────────────────────────────
   * The bug this fixes
   *
   * The menu used to be an ordinary block inside the header, so it pushed the
   * page down and left the whole document scrollable underneath it. Opening the
   * menu on a phone and then flicking a thumb — which is what a thumb does —
   * scrolled the article behind the menu, carried the header off the top of the
   * screen with the menu attached to it, and left somebody looking at the middle
   * of a page they had just tried to navigate away from. It reads as the site
   * being broken, and it is the single worst thing about the phone experience.
   *
   * So the drawer is now a fixed overlay with its own scroll, and the body is
   * frozen while it is open. `position: fixed` on the body rather than
   * `overflow: hidden` alone, because iOS Safari ignores the latter on the
   * scrolling element — and the scroll position is captured and restored around
   * it, since fixing the body otherwise jumps the page to the top and the member
   * loses their place on closing the menu.
   */
  useEffect(() => {
    if (!open) return;

    const y = window.scrollY;
    const { style } = document.body;
    const previous = {
      position: style.position,
      top: style.top,
      width: style.width,
      overflow: style.overflow,
    };

    style.position = 'fixed';
    style.top = `-${y}px`;
    style.width = '100%';
    style.overflow = 'hidden';

    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);

    return () => {
      style.position = previous.position;
      style.top = previous.top;
      style.width = previous.width;
      style.overflow = previous.overflow;
      window.scrollTo(0, y);
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

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

  const signOutAndLeave = async () => {
    await signOut();
    router.replace('/');
  };

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
          {items.map((item) => (
            <NavLink
              key={item.href}
              {...item}
              active={pathname.startsWith(item.href)}
            />
          ))}
        </nav>

        <div className="border-t border-hairline p-3">
          <button
            type="button"
            onClick={signOutAndLeave}
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
          <div className="flex h-14 items-center gap-2 px-4 sm:gap-3 sm:px-6">
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="rounded-md border border-hairline p-2 text-ink-secondary lg:hidden"
              aria-label="Open menu"
              aria-expanded={open}
              aria-controls="app-drawer"
            >
              <Menu className="h-4 w-4" />
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

            <Link
              href="/app/profile"
              aria-label="Your profile"
              className="shrink-0 rounded-full transition hover:opacity-85"
            >
              <Avatar
                avatarId={profile?.avatarId}
                name={profile?.name}
                email={user.email}
                size={30}
              />
            </Link>
          </div>
        </header>

        {/* `pb-24` on phones so the last card clears the tab bar below. */}
        <main className="flex-1 px-4 pb-24 pt-6 sm:px-6 sm:py-8 lg:pb-8">
          <div className="mx-auto w-full max-w-4xl">{children}</div>
        </main>

        <BottomTabs pathname={pathname} />
      </div>

      {/* ─────────────── phone drawer ─────────────── */}
      <MobileDrawer
        open={open}
        items={items}
        pathname={pathname}
        onClose={() => setOpen(false)}
        onSignOut={signOutAndLeave}
      />

      {/* The welcome, the daily check-in and the random prompt — sequenced, and
          only on the dashboard. See DailyPrompts. */}
      <DailyPrompts />
    </div>
  );
}

/**
 * The navigation drawer, on phones.
 *
 * A fixed overlay rather than a block in the flow: see the scroll-lock note in
 * [AppShell]. The panel itself scrolls — there are fourteen destinations and a
 * short phone in landscape cannot show them all — while the page behind it does
 * not, which is the entire point.
 *
 * It is rendered even when closed so the slide has something to animate from,
 * and made inert with `pointer-events-none` plus `aria-hidden` so a closed
 * drawer is neither clickable nor reachable by a screen reader.
 */
function MobileDrawer({
  open,
  items,
  pathname,
  onClose,
  onSignOut,
}: {
  open: boolean;
  items: typeof nav;
  pathname: string;
  onClose: () => void;
  onSignOut: () => void;
}) {
  return (
    <div
      className={`fixed inset-0 z-50 lg:hidden ${
        open ? '' : 'pointer-events-none'
      }`}
      aria-hidden={open ? undefined : true}
    >
      <button
        type="button"
        tabIndex={open ? 0 : -1}
        aria-label="Close menu"
        onClick={onClose}
        className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-200 ${
          open ? 'opacity-100' : 'opacity-0'
        }`}
      />

      <div
        id="app-drawer"
        role="dialog"
        aria-modal={open ? true : undefined}
        aria-label="Menu"
        className={`absolute inset-y-0 left-0 flex w-[17rem] max-w-[85%] flex-col border-r border-hairline bg-bg-dark shadow-soft transition-transform duration-200 ease-out ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-14 shrink-0 items-center gap-2.5 border-b border-hairline px-4">
          <Logo className="h-7 w-7" />
          <span className="text-[14.5px] font-semibold text-ink-primary">
            InnenFlow
          </span>
          <button
            type="button"
            tabIndex={open ? 0 : -1}
            onClick={onClose}
            aria-label="Close menu"
            className="ml-auto rounded-md border border-hairline p-2 text-ink-secondary"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* `overscroll-contain` so reaching the end of this list does not hand
            the scroll to the page underneath — which is the same bug in
            miniature. */}
        <nav className="flex-1 space-y-0.5 overflow-y-auto overscroll-contain p-3">
          {items.map((item) => (
            <NavLink
              key={item.href}
              {...item}
              active={pathname.startsWith(item.href)}
              tabIndex={open ? 0 : -1}
              onClick={onClose}
            />
          ))}
        </nav>

        <div className="shrink-0 border-t border-hairline p-3 pb-safe">
          <button
            type="button"
            tabIndex={open ? 0 : -1}
            onClick={onSignOut}
            className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-[13px] text-ink-muted transition hover:bg-bg-card hover:text-ink-primary"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
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
  onClick,
  tabIndex,
}: {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  active: boolean;
  onClick?: () => void;
  tabIndex?: number;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      tabIndex={tabIndex}
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
