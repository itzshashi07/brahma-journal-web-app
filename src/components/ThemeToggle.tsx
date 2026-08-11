'use client';

import { Monitor, Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';

export type ThemeChoice = 'dark' | 'light' | 'system';

export const THEME_KEY = 'innenflow-theme';

/**
 * The script that runs before the page is painted.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * Why this is a blocking inline script and not a `useEffect`
 *
 * React runs after the first paint. A theme applied in an effect means anyone
 * who chose light gets a full frame of near-black first — the flash of wrong
 * theme, which is worse than having no toggle at all because it happens on
 * every single navigation.
 *
 * So the choice is read and stamped onto `<html>` synchronously, in the head,
 * before the browser has painted anything. It is a few hundred bytes and it is
 * the only script on the marketing pages.
 *
 * It stamps an explicit `dark` or `light` rather than leaving the attribute off
 * for "system", so the CSS needs exactly one override block instead of the same
 * light palette written twice — once for `[data-theme='light']` and once inside
 * a `prefers-color-scheme` media query.
 */
export function ThemeScript() {
  const js = `
(function () {
  try {
    var stored = localStorage.getItem('${THEME_KEY}');
    var choice = stored === 'dark' || stored === 'light' ? stored
      : (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
    document.documentElement.setAttribute('data-theme', choice);
  } catch (e) {
    // Private mode can throw on localStorage. Dark is the default and the CSS
    // already assumes it, so there is nothing to do.
  }
})();`.trim();

  return <script dangerouslySetInnerHTML={{ __html: js }} />;
}

function resolve(choice: ThemeChoice): 'dark' | 'light' {
  if (choice !== 'system') return choice;
  return window.matchMedia('(prefers-color-scheme: light)').matches
    ? 'light'
    : 'dark';
}

/**
 * Dark, light, or whatever the system says.
 *
 * Three states rather than two, because a phone that turns itself light at
 * sunrise should be able to take the site with it — and because a two-state
 * toggle silently *is* a choice, permanently overriding the system for anybody
 * who ever taps it out of curiosity.
 */
export function ThemeToggle({ className = '' }: { className?: string }) {
  const [choice, setChoice] = useState<ThemeChoice>('system');
  // The control renders nothing until it knows what is stored, because the
  // server cannot know: rendering "dark" and then correcting it is a visible
  // flicker in the header on every page load.
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(THEME_KEY) as ThemeChoice | null;
    setChoice(stored === 'dark' || stored === 'light' ? stored : 'system');
    setReady(true);
  }, []);

  // Somebody on "system" who changes their OS theme while the tab is open
  // should see it change here too, without a reload.
  useEffect(() => {
    if (choice !== 'system') return;
    const mq = window.matchMedia('(prefers-color-scheme: light)');
    const apply = () =>
      document.documentElement.setAttribute(
        'data-theme',
        mq.matches ? 'light' : 'dark'
      );
    apply();
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, [choice]);

  const pick = (next: ThemeChoice) => {
    setChoice(next);
    document.documentElement.setAttribute('data-theme', resolve(next));
    try {
      if (next === 'system') localStorage.removeItem(THEME_KEY);
      else localStorage.setItem(THEME_KEY, next);
    } catch {
      // Nothing to do — the theme still applies for this session.
    }
  };

  const options: { value: ThemeChoice; label: string; Icon: typeof Sun }[] = [
    { value: 'light', label: 'Light', Icon: Sun },
    { value: 'dark', label: 'Dark', Icon: Moon },
    { value: 'system', label: 'System', Icon: Monitor },
  ];

  return (
    <div
      role="radiogroup"
      aria-label="Colour theme"
      className={`inline-flex items-center gap-0.5 rounded-pill border border-hairline bg-bg-card/60 p-0.5 ${className}`}
    >
      {options.map(({ value, label, Icon }) => {
        const active = ready && choice === value;
        return (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={label}
            title={label}
            onClick={() => pick(value)}
            className={`rounded-pill p-1.5 transition-colors ${
              active
                ? 'bg-primary/20 text-primary-light'
                : 'text-ink-muted hover:text-ink-secondary'
            }`}
          >
            <Icon className="h-3.5 w-3.5" />
          </button>
        );
      })}
    </div>
  );
}
