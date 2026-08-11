import type { Config } from 'tailwindcss';

/**
 * The app's design tokens, ported verbatim.
 *
 * Every value here is copied from `lib/core/theme/app_theme.dart` in the
 * Flutter app. That is the point of the file: somebody who uses the phone app
 * and then opens the website should not be able to tell that one of them is
 * Flutter and the other is CSS. A near-miss on the purple is more noticeable
 * than a completely different design would be, because the eye reads it as the
 * same thing rendered wrong.
 *
 * If a colour changes in `app_theme.dart`, it changes here. There is no build
 * step keeping them in step — the two codebases do not share a package — so
 * this is a convention, and it is written down for that reason.
 */
const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Brand
        primary: {
          DEFAULT: '#7C3AED',
          light: '#9F67FA',
          dark: '#5B21B6',
        },
        accent: {
          DEFAULT: '#F59E0B',
          light: '#FBBF24',
        },

        // Backgrounds
        bg: {
          dark: '#0D0D1A',
          card: '#1A1A2E',
          cardLight: '#16213E',
          surface: '#0F3460',
        },

        // Text
        ink: {
          primary: '#F8F8FF',
          secondary: '#B0B0CC',
          muted: '#6B6B8A',
        },

        // Structure
        hairline: {
          DEFAULT: '#2D2D4E',
          soft: '#23233F',
        },

        // Sacred motif inks — a hint of gold in the violet, so the dark theme
        // reads warm rather than as cold blue-grey.
        sacred: {
          glow: '#3B2A6B',
          ink: '#14101F',
        },

        success: '#10B981',
        danger: '#B91C1C',

        // The five mood colours the journal and analytics render.
        mood: {
          verySad: '#6366F1',
          sad: '#8B5CF6',
          neutral: '#F59E0B',
          happy: '#10B981',
          veryHappy: '#06D6A0',
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
        // Dark themes need shadow that reads as depth rather than as dirt, so
        // it is deep and very diffuse. Matches AppTheme.shadowSoft.
        soft: '0 8px 24px rgba(0, 0, 0, 0.45)',
        glow: '0 0 28px 2px rgba(124, 58, 237, 0.35)',
        glowGold: '0 0 28px 2px rgba(245, 158, 11, 0.35)',
      },

      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #7C3AED 0%, #4338CA 100%)',
        'gradient-gold': 'linear-gradient(135deg, #F59E0B 0%, #F97316 100%)',
        'gradient-bg': 'linear-gradient(180deg, #0D0D1A 0%, #1A1A2E 55%, #0F3460 100%)',
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
