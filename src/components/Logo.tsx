/**
 * The mark.
 *
 * A lotus reduced to three strokes and a still point — the same motif the app
 * uses in `assets/art/lotus.svg`. Inline SVG rather than an `<img>`: it is
 * under a kilobyte, it inherits the page's colours, and it costs no request on
 * a header that appears on every route.
 *
 * `currentColor` on the outer petals means one component serves the dark header,
 * the footer and the favicon-adjacent uses without a second file.
 */
export function Logo({ className = 'h-8 w-8' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      className={className}
      role="img"
      aria-label="InnenFlow"
    >
      <defs>
        <linearGradient id="innen-petal" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#9F67FA" />
          <stop offset="100%" stopColor="#4338CA" />
        </linearGradient>
        <linearGradient id="innen-core" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FBBF24" />
          <stop offset="100%" stopColor="#F59E0B" />
        </linearGradient>
      </defs>

      {/* Outer petals */}
      <path
        d="M24 6c5 6 7.5 11.5 7.5 16.5S28.5 33 24 38c-4.5-5-7.5-10.5-7.5-15.5S19 12 24 6Z"
        fill="url(#innen-petal)"
        opacity="0.95"
      />
      <path
        d="M9 17c6.5 1.5 11 4.5 13.5 8.5S25 35 24 39c-4-1.5-8.5-5-10.5-9S8.5 21 9 17Z"
        fill="url(#innen-petal)"
        opacity="0.6"
      />
      <path
        d="M39 17c-6.5 1.5-11 4.5-13.5 8.5S23 35 24 39c4-1.5 8.5-5 10.5-9s4-9 4.5-13Z"
        fill="url(#innen-petal)"
        opacity="0.6"
      />

      {/* The still point. */}
      <circle cx="24" cy="26" r="3.2" fill="url(#innen-core)" />
    </svg>
  );
}
