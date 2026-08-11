/**
 * Everything the counselling flow needs that is not code.
 *
 * Mirrors `lib/core/constants/counselling.dart` in the app and `FEE` /
 * `SESSION_MINUTES` in the API's `src/config/counselling.js`. Three copies of
 * one number is already one too many; a fee that is right on the phone and
 * stale on the web is the kind of mistake that ends in an argument about money
 * with somebody who came here for help.
 *
 * The amount is also stored on each session when it is created, so changing
 * this constant does not rewrite what anybody was already told.
 */
export const COUNSELLING = {
  /** Where the session fee is collected. */
  upiId: 'brahmajournal@ptaxis',
  payeeName: 'InnenFlow',

  /** Rupees. */
  fee: 299,

  sessionMinutes: 30,
} as const;

/**
 * A UPI deep link.
 *
 * Opens the payment app directly on a phone, which is where most of these are
 * paid. On a desktop browser nothing handles `upi://`, so the interface shows
 * the handle to copy instead of relying on this — a button that silently does
 * nothing is worse than no button.
 */
export function upiIntent(amount: number = COUNSELLING.fee): string {
  const params = new URLSearchParams({
    pa: COUNSELLING.upiId,
    pn: COUNSELLING.payeeName,
    am: String(amount),
    cu: 'INR',
    tn: 'InnenFlow counselling session',
  });
  return `upi://pay?${params.toString()}`;
}
