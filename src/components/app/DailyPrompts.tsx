'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

import { DailyCheckIn } from './DailyCheckIn';
import { JournalNudge, markCheckInShown, pickNudge, type NudgeSlot } from './JournalNudge';
import { WelcomeCelebration } from './WelcomeCelebration';
import { api, type Paged } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { localDayKey, todayKey, type Entry } from '@/lib/entries';

/**
 * Everything that interrupts, and the order it is allowed to interrupt in.
 *
 * A port of `_loadData` in `dashboard_screen.dart`, which is the only place in
 * the app that opens any of these. Three things can want the screen when
 * somebody arrives, and letting them race produces the worst version of all
 * three — a welcome card sliding out from under a check-in that a random prompt
 * then lands on top of. So they are sequenced:
 *
 *   1. **the welcome**, which belongs to the sign-in that just happened and
 *      reads as an afterthought if anything gets there first;
 *   2. **the check-in**, once a day, and only when today has not been written;
 *   3. **the nudge**, only if the check-in did not run, and only when
 *      `pickNudge` says so — it is rate-limited, random, and silent when today's
 *      entry is already complete.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * Why only on the dashboard
 *
 * The shell wraps every signed-in screen, so mounting this unconditionally would
 * put a bottom sheet over a counselling chat. The app asks these questions on
 * its home screen and nowhere else, and the web's home screen is
 * `/app/dashboard` — which is also where sign-in lands.
 */
export function DailyPrompts() {
  const pathname = usePathname();
  const { user, loading, profile, refreshProfile } = useAuth();

  const [today, setToday] = useState<Entry | null>(null);
  const [checkIn, setCheckIn] = useState(false);
  const [nudge, setNudge] = useState<NudgeSlot | null>(null);

  /**
   * Guards the whole sequence to once per mount of the dashboard.
   *
   * `profile` changes when the sync-stats call on the dashboard lands, and
   * without this the effect would re-run and re-ask on a screen the member has
   * not left.
   */
  const ran = useRef(false);
  const onDashboard = pathname === '/app/dashboard';

  useEffect(() => {
    if (!onDashboard || loading || !user || ran.current) return;
    ran.current = true;

    let cancelled = false;

    void (async () => {
      /**
       * Today's entry decides both questions below, so it is read once here
       * rather than by each sheet. One row is enough: the list is newest-first,
       * so if today has an entry it is the first one.
       */
      let entry: Entry | null = null;
      try {
        const body = await api.get<Paged<Entry, 'entries'>>('/api/entries', {
          limit: 1,
        });
        const newest = body.entries[0];
        if (newest && localDayKey(newest.createdAt) === todayKey()) {
          entry = newest;
        }
      } catch {
        // Offline, or the API is still cold. Staying quiet is the right failure:
        // a check-in that cannot read today's entry would happily write a
        // second one.
        return;
      }

      if (cancelled) return;
      setToday(entry);

      /**
       * The check-in runs when today has not been written *and* it has not
       * already been offered today.
       *
       * Both halves matter. Interrupting somebody who has already journalled is
       * nagging exactly the person you least want to nag, and offering it twice
       * in a day is how a daily ritual becomes something people learn to
       * dismiss without reading.
       */
      const askedKey = `checkin_asked_${todayKey()}`;
      let asked = false;
      try {
        asked = window.localStorage.getItem(askedKey) === 'true';
      } catch {
        // Treated as not asked. Storage being unavailable should not cost
        // somebody the check-in.
      }

      if (!entry && !asked) {
        try {
          window.localStorage.setItem(askedKey, 'true');
        } catch {
          // See above.
        }
        // Stamped so a random prompt cannot arrive on the heels of the check-in.
        markCheckInShown();
        // A beat after the dashboard has drawn, so the sheet rises over a
        // finished screen rather than over one still filling in.
        setTimeout(() => {
          if (!cancelled) setCheckIn(true);
        }, 900);
        return;
      }

      /**
       * The check-in did not run — already journalled, or already asked — so
       * there may still be a gap worth one small question.
       *
       * `entry` is deliberately passed even when it exists: filling gaps in a
       * half-written day is the nudge's entire purpose, and `pickNudge` returns
       * null when there are none left. A member whose entry is complete is never
       * interrupted at all.
       */
      const slot = pickNudge(
        entry,
        profile?.profession,
        profile?.customHabits ?? []
      );
      if (slot) {
        setTimeout(() => {
          if (!cancelled) setNudge(slot);
        }, 900);
      }
    })();

    return () => {
      cancelled = true;
    };
    // `profile` is read inside but deliberately not a dependency: the sequence
    // runs once and the ref would block a re-run anyway, and listing it would
    // only re-fire this effect for a value that is already captured.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onDashboard, loading, user]);

  // Reset when the member leaves the dashboard, so returning to it later in a
  // long session can ask again — subject to the same daily limits.
  useEffect(() => {
    if (!onDashboard) ran.current = false;
  }, [onDashboard]);

  return (
    <>
      <WelcomeCelebration />

      {checkIn && (
        <DailyCheckIn
          today={today}
          onClose={() => setCheckIn(false)}
          // The sheet stays open on purpose — its own closing card is what
          // answers a member who has just described a hard day. Only the streak
          // and entry count need refreshing, since the dashboard read them
          // before this wrote today's entry.
          onSaved={() => void refreshProfile()}
        />
      )}

      {nudge && (
        <JournalNudge
          slot={nudge}
          today={today}
          onClose={() => setNudge(null)}
          onSaved={() => {
            setNudge(null);
            void refreshProfile();
          }}
        />
      )}
    </>
  );
}
