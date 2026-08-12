/**
 * Where a notification goes when it is clicked.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * The routes on a notification are the *app's*
 *
 * The API writes one `route` per notification and two clients read it. It is
 * written in the Android app's vocabulary — `/blogs/<id>`, `/counselling`,
 * `/thoughts` — because that is where the feature was born. This site mounts
 * the same screens under `/app/...`, and has its own names for two of them:
 * the Sanctuary's shop is `/app/library`, the Gita is `/app/wisdom`.
 *
 * So a notification card cannot link to `item.route` and did not try to — it
 * was not a link at all, and the one thing somebody wants from "📖 New article"
 * is to read the article. This is the translation, and anything with no screen
 * on this site returns null so the card stays plain text rather than linking
 * into a 404.
 */

/** App route → the page on this site, for the ones whose names differ. */
const RENAMED: Record<string, string> = {
  '/products': '/app/library',
  '/gita': '/app/wisdom',
  '/deep-work': '/app/deep-work',
};

/** Sections that exist here under the same name. */
const SAME = [
  '/dashboard',
  '/journal',
  '/meditation',
  '/affirmations',
  '/thoughts',
  '/community',
  '/analytics',
  '/profile',
  '/blogs',
  '/notifications',
  '/games',
  '/counselling',
];

/**
 * The page on this site for a notification's route, or null when there is none.
 *
 * [isAdminAlert] switches to the operator's reading: every alert in that queue
 * is answered from the one console, so a counselling request, a payment to
 * verify and a report all land on `/app/admin` rather than on the member-facing
 * screen that happens to share the path.
 */
export function webRouteFor(
  raw?: string | null,
  { isAdminAlert = false }: { isAdminAlert?: boolean } = {}
): string | null {
  const route = (raw ?? '').trim();
  if (!route.startsWith('/')) return null;

  if (isAdminAlert) {
    // The console is the answer to all of them; `/app/admin` picks its own tab.
    if (
      route.startsWith('/counselling') ||
      route.startsWith('/support') ||
      route.startsWith('/reports') ||
      route.startsWith('/admin') ||
      route.startsWith('/blogs')
    ) {
      return '/app/admin';
    }
    return null;
  }

  for (const [from, to] of Object.entries(RENAMED)) {
    if (route === from) return to;
    if (route.startsWith(`${from}/`)) return `${to}${route.slice(from.length)}`;
  }

  const section = SAME.find((s) => route === s || route.startsWith(`${s}/`));
  return section ? `/app${route}` : null;
}
