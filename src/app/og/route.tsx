import { ImageResponse } from 'next/og';

import { site } from '@/lib/site';

/**
 * The card that appears when a link is shared.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * Why generated rather than a designed PNG
 *
 * There are twenty-odd pages plus a growing article library, and every one of
 * them wants a share card with its own title. Designing those by hand is
 * twenty exports that go stale the moment a title is edited; one that says
 * "InnenFlow" on every page wastes the most valuable surface a WhatsApp
 * forward has.
 *
 * This renders the page's own title into the card at request time and caches
 * the result at the edge, so it is always current and costs nothing per share.
 *
 * WhatsApp is the specific reason this matters here: it is how this app
 * actually spreads, and a link with no card is a bare URL that nobody taps.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  // Truncated defensively — these come from a query string, and a title long
  // enough to overflow the canvas produces an unreadable card rather than an
  // error, which is harder to notice.
  const title = (searchParams.get('title') || site.name).slice(0, 110);
  const subtitle = (
    searchParams.get('subtitle') || site.shortDescription
  ).slice(0, 160);

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '72px',
          // The app's own background gradient, so a shared card is recognisably
          // the same product as the screen it links to.
          backgroundImage:
            'linear-gradient(160deg, #0D0D1A 0%, #1A1A2E 55%, #0F3460 100%)',
          fontFamily: 'sans-serif',
        }}
      >
        {/* Ambient bloom */}
        <div
          style={{
            position: 'absolute',
            top: -180,
            left: 320,
            width: 620,
            height: 620,
            borderRadius: 9999,
            background: 'rgba(124, 58, 237, 0.35)',
            filter: 'blur(140px)',
            display: 'flex',
          }}
        />

        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: 16,
              backgroundImage: 'linear-gradient(135deg, #9F67FA, #4338CA)',
              display: 'flex',
            }}
          />
          <div
            style={{
              fontSize: 30,
              fontWeight: 600,
              color: '#F8F8FF',
              display: 'flex',
            }}
          >
            {site.name}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
          <div
            style={{
              fontSize: title.length > 60 ? 54 : 66,
              fontWeight: 600,
              lineHeight: 1.12,
              color: '#F8F8FF',
              letterSpacing: '-0.02em',
              display: 'flex',
              maxWidth: 980,
            }}
          >
            {title}
          </div>
          <div
            style={{
              fontSize: 27,
              lineHeight: 1.45,
              color: '#B0B0CC',
              display: 'flex',
              maxWidth: 900,
            }}
          >
            {subtitle}
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            fontSize: 22,
            color: '#6B6B8A',
          }}
        >
          <div
            style={{
              display: 'flex',
              padding: '8px 20px',
              borderRadius: 999,
              border: '1px solid #2D2D4E',
              color: '#FBBF24',
              fontSize: 20,
            }}
          >
            Free · No trial
          </div>
          <div style={{ display: 'flex' }}>
            {site.url.replace(/^https?:\/\//, '')}
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      headers: {
        // A card for a given title never changes, so it is cached hard. The
        // immutable hint matters because a crawler re-fetches these often.
        'Cache-Control': 'public, immutable, no-transform, max-age=31536000',
      },
    }
  );
}
