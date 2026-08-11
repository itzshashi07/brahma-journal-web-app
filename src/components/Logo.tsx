/**
 * The mark.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * This used to be a lotus, and the app has never been a lotus
 *
 * The Android launcher icon — the one on the Play listing and on every
 * installed phone — is three open arcs turning inward around a still point.
 * The website drew a lotus instead, so the product a visitor recognised from
 * the store was not the product they landed on, and the two halves of one thing
 * introduced themselves with different faces. A near-miss on a brand mark is
 * worse than an unrelated one: the eye reads it as the same thing rendered
 * wrong.
 *
 * So this is now the app's mark, redrawn as vectors: `assets/app_icon.png` in
 * the Flutter repo is the reference.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * Why arcs made of dashed circles
 *
 * Each ring is one `<circle>` with `pathLength="100"`, so the dash pattern is
 * literally "draw 72% of it" no matter the radius — no arc-path arithmetic, and
 * changing a radius cannot silently change how much of the ring is drawn.
 *
 * Inline SVG rather than an `<img>`: it is under a kilobyte, it scales without
 * a second asset, and it costs no request on a header that appears on every
 * route.
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
        <linearGradient id="innen-ring-outer" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#7C6BF0" />
          <stop offset="100%" stopColor="#4338CA" />
        </linearGradient>
        <linearGradient id="innen-ring-mid" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0%" stopColor="#C4B5FD" />
          <stop offset="100%" stopColor="#9F67FA" />
        </linearGradient>
      </defs>

      <g
        fill="none"
        strokeLinecap="round"
        pathLength={100}
        /* The rings turn in alternating directions, which is what makes the
           mark read as flowing inward rather than as three loose circles. */
      >
        <circle
          cx="24"
          cy="24"
          r="17"
          stroke="url(#innen-ring-outer)"
          strokeWidth="3.1"
          pathLength={100}
          strokeDasharray="73 27"
          transform="rotate(-108 24 24)"
        />
        <circle
          cx="24"
          cy="24"
          r="11.4"
          stroke="url(#innen-ring-mid)"
          strokeWidth="3"
          pathLength={100}
          strokeDasharray="78 22"
          transform="rotate(72 24 24)"
        />
        <circle
          cx="24"
          cy="24"
          r="6.2"
          stroke="#CFC2FE"
          strokeWidth="2.6"
          pathLength={100}
          strokeDasharray="66 34"
          transform="rotate(-116 24 24)"
        />
      </g>

      {/* The still point. */}
      <circle cx="24" cy="24" r="3.1" fill="#EDEBFF" />
    </svg>
  );
}
