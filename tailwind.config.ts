import type { Config } from 'tailwindcss';

/**
 * The app's design tokens, ported verbatim — and then made switchable.
 *
 * Every dark value here is copied from `lib/core/theme/app_theme.dart` in the
 * Flutter app. That is the point of the file: somebody who uses the phone app
 * and then opens the website should not be able to tell that one of them is
 * Flutter and the other is CSS. A near-miss on the purple is more noticeable
 * than a completely different design would be, because the eye reads it as the
 * same thing rendered wrong.
 *
 * If a colour changes in `app_theme.dart`, it changes in `globals.css` — which
 * is where the values now live.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * Why every colour is a variable rather than a hex
 *
 * The site gained a light theme. The obvious way to do that in Tailwind is
 * `darkMode: 'class'` and a `dark:` prefix on every colour utility — which
 * would have meant editing roughly four hundred class names across forty files,
 * and leaving behind a codebase where adding a third surface means finding all
 * four hundred again.
 *
 * Instead the tokens point at CSS custom properties and `globals.css` swaps the
 * values. `bg-bg-card` is written once and is correct in both themes; nothing
 * in any component knows a theme exists.
 *
 * The channels are stored bare — `26 26 46`, not `rgb(26 26 46)` — because that
 * is what lets `<alpha-value>` work. Roughly a hundred class names here are
 * translucent (`bg-bg-card/60`, `border-primary/50`), and a variable holding a
 * complete colour function silently breaks every one of them.
 */
const token = (name: string) => `rgb(var(--${name}) / <alpha-value>)`;

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Brand
        primary: {
          DEFAULT: token('c-primary'),
          light: token('c-primary-light'),
          dark: token('c-primary-dark'),
        },
        accent: {
          DEFAULT: token('c-accent'),
          light: token('c-accent-light'),
        },

        // Backgrounds. `bg-dark` keeps its name in both themes — it is the page
        // ground, and renaming it would touch every file this refactor exists
        // to avoid touching.
        bg: {
          dark: token('c-bg'),
          card: token('c-bg-card'),
          cardLight: token('c-bg-card-light'),
          surface: token('c-bg-surface'),
        },

        // Text
        ink: {
          primary: token('c-ink'),
          secondary: token('c-ink-secondary'),
          muted: token('c-ink-muted'),
        },

        // Structure
        hairline: {
          DEFAULT: token('c-hairline'),
          soft: token('c-hairline-soft'),
        },

        // Sacred motif inks — a hint of gold in the violet, so the dark theme
        // reads warm rather than as cold blue-grey.
        sacred: {
          glow: token('c-sacred-glow'),
          ink: token('c-sacred-ink'),
        },

        success: token('c-success'),
        danger: token('c-danger'),

        // The five mood colours the journal and analytics render.
        mood: {
          verySad: token('c-mood-very-sad'),
          sad: token('c-mood-sad'),
          neutral: token('c-mood-neutral'),
          happy: token('c-mood-happy'),
          veryHappy: token('c-mood-very-happy'),
        },
      },

      borderRadius: {
        sm: '10px',
        md: '14px',
        lg: '20px',
        xl: '28px',
        pill: '999px',
      },

      boxShadow: {
        // A dark theme needs shadow that reads as depth rather than as dirt —
        // deep and very diffuse. A light one needs the opposite: shallow, and
        // tinted violet rather than grey, because pure black at low opacity on
        // white reads as smudge. Hence a variable rather than one value trying
        // to be right twice.
        soft: 'var(--shadow-soft)',
        glow: 'var(--shadow-glow)',
        glowGold: 'var(--shadow-glow-gold)',
      },

      backgroundImage: {
        // The brand gradients are the brand in both themes and do not flip.
        'gradient-primary': 'linear-gradient(135deg, #7C3AED 0%, #4338CA 100%)',
        'gradient-gold': 'linear-gradient(135deg, #F59E0B 0%, #F97316 100%)',
        // The page ground does flip. See `--page-gradient` in globals.css.
        'gradient-bg': 'var(--page-gradient)',
      },

      fontFamily: {
        // Outfit is what the app bundles. Loaded here through next/font so it
        // is self-hosted and preloaded rather than fetched from Google at
        // runtime — a third-party font request is a render-blocking round trip
        // on the exact page whose speed is being measured for ranking.
        sans: ['var(--font-outfit)', 'system-ui', 'sans-serif'],
      },

      keyframes: {
        'fade-up': {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        breathe: {
          '0%, 100%': { transform: 'scale(1)', opacity: '0.55' },
          '50%': { transform: 'scale(1.08)', opacity: '0.85' },
        },
        drift: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.5s ease-out both',
        // Paced to a slow exhale — the meditation screen uses the same rhythm.
        breathe: 'breathe 6s ease-in-out infinite',
        drift: 'drift 7s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};

export default config;
