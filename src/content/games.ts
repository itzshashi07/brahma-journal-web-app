/**
 * The game catalogue, mirroring `lib/screens/games/game_catalog.dart`.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * Why this file exists at all
 *
 * The web Focus screen used to be one hard-coded game with `GAME_ID` set to
 * `'reaction'` — an id that appears nowhere in the app, which has fifteen games
 * with ids of their own. So the board it fetched was a board nobody had ever
 * scored on: empty for every member, forever, with no error to notice. The
 * screen looked finished and had nothing behind it.
 *
 * One list fixes both halves. Every game the app knows about is listed here
 * with the same id, the same unit and the same direction, so scores land in the
 * same place from either client and a leaderboard is one leaderboard.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * `playableHere`
 *
 * Six of the fifteen are implemented in the browser. The rest are listed rather
 * than hidden, with their best score, because a member's best in Mirror Tap is
 * their score whichever screen they set it on — and a Focus page that silently
 * omitted nine games would read as data loss to anyone who plays on the phone.
 *
 * `lowerIsBetter` and `unit` are the two fields that must never drift from the
 * Dart: the first decides who is top of the board, and getting it backwards
 * puts the worst player there. The second is why a bare "13" is meaningless
 * when one game counts moves and the next counts milliseconds.
 */

export type GameLane = 'focus' | 'memory' | 'logic' | 'calm';

export const LANES: { key: GameLane; label: string; blurb: string }[] = [
  { key: 'focus', label: 'Focus', blurb: 'Holding attention on one thing while something else pulls at it.' },
  { key: 'memory', label: 'Memory', blurb: 'Keeping something in mind for a few seconds under load.' },
  { key: 'logic', label: 'Logic', blurb: 'Working it out with a clock running.' },
  { key: 'calm', label: 'Calm', blurb: 'The ones that get easier when you stop trying.' },
];

export type GameUnit =
  | 'seconds' | 'ms' | 'moves' | 'points' | 'level' | 'round' | 'words' | 'length';

export interface Game {
  id: string;
  title: string;
  subtitle: string;
  detail: string;
  lane: GameLane;
  /** 1 easy · 2 moderate · 3 hard. Shown as pips, so somebody opening this
   *  tired can pick something that will not defeat them. */
  difficulty: 1 | 2 | 3;
  duration: string;
  /** Seconds and moves rank ascending; points and levels rank descending. */
  lowerIsBetter: boolean;
  unit: GameUnit;
  /** Implemented in the browser. The rest are listed with their best score. */
  playableHere: boolean;
}

/**
 * The number as it should read on a board or a stat card — the same mapping as
 * `GameEntry.formatScore` in the app, because a score that reads "1240" here
 * and "1240ms" there is two products.
 */
export function formatScore(unit: GameUnit, score: number): string {
  switch (unit) {
    case 'seconds': return `${score}s`;
    case 'ms': return `${score}ms`;
    case 'moves': return `${score} moves`;
    case 'points': return `${score} pts`;
    case 'level': return `level ${score}`;
    case 'round': return `round ${score}`;
    case 'words': return `${score} words`;
    case 'length': return `length ${score}`;
    default: return String(score);
  }
}

/** Seconds as a board figure: "9m 05s", or "1h 12m" once it gets long. */
export function formatTrainingTime(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) {
    return `${minutes}m ${String(seconds % 60).padStart(2, '0')}s`;
  }
  return `${Math.floor(minutes / 60)}h ${String(minutes % 60).padStart(2, '0')}m`;
}

export const GAMES: Game[] = [
  {
    id: 'focus_grid',
    title: 'Focus Grid',
    subtitle: 'Find 1 to 25 in order, as fast as you can',
    detail: 'A Schulte table — used to widen the span of attention. Keep your eyes near the middle and let them find the numbers instead of hunting one by one.',
    lane: 'focus',
    difficulty: 1,
    duration: '1 min',
    lowerIsBetter: true,
    unit: 'seconds',
    playableHere: true,
  },
  {
    id: 'ink_test',
    title: 'Ink Test',
    subtitle: 'Tap the colour of the ink, not the word',
    detail: 'The Stroop test. Reading is automatic, so ignoring the word takes deliberate control — exactly the muscle used when you decide not to react to something. Now on a clock that tightens as you go.',
    lane: 'focus',
    difficulty: 2,
    duration: '2 min',
    lowerIsBetter: false,
    unit: 'points',
    playableHere: true,
  },
  {
    id: 'reaction_bell',
    title: 'Reaction Bell',
    subtitle: 'Wait for gold. Tap the instant it turns.',
    detail: 'Five rounds, averaged. The delay is deliberately unpredictable, so the only way to be fast is to actually be present — anticipating is punished harder than being slow.',
    lane: 'focus',
    difficulty: 1,
    duration: '1 min',
    lowerIsBetter: true,
    unit: 'ms',
    playableHere: true,
  },
  {
    id: 'rule_switch',
    title: 'Rule Switch',
    subtitle: 'Bigger number or bigger text? The rule keeps changing.',
    detail: 'A 4 printed large beside a 9 printed small argues with itself, and the rule flips without warning. Switching rules costs real time — noticing that cost is the training.',
    lane: 'focus',
    difficulty: 3,
    duration: '2 min',
    lowerIsBetter: false,
    unit: 'points',
    playableHere: false,
  },
  {
    id: 'odd_colour',
    title: 'Odd Colour Out',
    subtitle: 'One tile is a slightly different shade',
    detail: 'The difference shrinks every level and the grid grows to thirty-six tiles. Softening your gaze finds it faster than staring does, which is a strange and useful thing to learn about looking.',
    lane: 'focus',
    difficulty: 2,
    duration: '45 sec',
    lowerIsBetter: false,
    unit: 'level',
    playableHere: false,
  },
  {
    id: 'dot_count',
    title: 'Dot Count',
    subtitle: 'Dots flash for half a second. How many?',
    detail: 'Up to four, the answer arrives without counting. Past that the mind starts counting and runs out of time — so you have to let the estimate come instead of building it.',
    lane: 'focus',
    difficulty: 2,
    duration: '2 min',
    lowerIsBetter: false,
    unit: 'round',
    playableHere: false,
  },
  {
    id: 'memory_bloom',
    title: 'Memory Bloom',
    subtitle: 'Watch the petals, repeat the pattern',
    detail: 'Working memory, one step longer and a little faster each round. Ends the moment you slip — which is the interesting part, because you will feel exactly when attention wandered.',
    lane: 'memory',
    difficulty: 1,
    duration: '2 min',
    lowerIsBetter: false,
    unit: 'length',
    playableHere: true,
  },
  {
    id: 'mirror_tap',
    title: 'Mirror Tap',
    subtitle: 'Repeat the pattern — but tap the opposite tile',
    detail: 'Remembering the sequence is the easy half. Every tap then has to be flipped before your hand is allowed to move, and the hand keeps wanting to go where the light was.',
    lane: 'memory',
    difficulty: 3,
    duration: '2 min',
    lowerIsBetter: false,
    unit: 'length',
    playableHere: false,
  },
  {
    id: 'n_back',
    title: '2-Back',
    subtitle: 'Was this square here two steps ago?',
    detail: 'The hardest game here, honestly so. Holding a moving two-item window is uncomfortable, and that discomfort is the whole exercise. Wrong calls cost more than saying nothing.',
    lane: 'memory',
    difficulty: 3,
    duration: '1 min',
    lowerIsBetter: false,
    unit: 'points',
    playableHere: false,
  },
  {
    id: 'pair_bloom',
    title: 'Pair Bloom',
    subtitle: 'Sixteen tiles, eight pairs, fewest moves',
    detail: 'The gentlest game in the list, and the one most people play twice. Under fourteen moves means you were genuinely tracking rather than turning tiles over hopefully.',
    lane: 'memory',
    difficulty: 1,
    duration: '2 min',
    lowerIsBetter: true,
    unit: 'moves',
    playableHere: true,
  },
  {
    id: 'spot_shift',
    title: 'Spot the Shift',
    subtitle: 'The grid blinks. One tile comes back different.',
    detail: 'Change blindness: the blank frame wipes out the flicker your eye normally uses to catch movement, so the change has to be found by comparison. Holding the whole grid loosely beats scanning it.',
    lane: 'memory',
    difficulty: 2,
    duration: '2 min',
    lowerIsBetter: false,
    unit: 'round',
    playableHere: false,
  },
  {
    id: 'quick_math',
    title: 'Quick Math',
    subtitle: 'Arithmetic against a clock that keeps tightening',
    detail: 'The sums get harder and the clock gets shorter at the same time. Past twenty it stops being arithmetic and becomes nerve — which is the part worth practising.',
    lane: 'logic',
    difficulty: 2,
    duration: '2 min',
    lowerIsBetter: false,
    unit: 'points',
    playableHere: true,
  },
  {
    id: 'slide_nine',
    title: 'Slide Nine',
    subtitle: 'The eight-tile sliding puzzle',
    detail: 'No clock, no lives, no pressure — just a board that will not be rushed. Every board dealt here is solvable, and most go in under forty moves if you finish the top row first and never break it again.',
    lane: 'logic',
    difficulty: 2,
    duration: '3 min',
    lowerIsBetter: true,
    unit: 'moves',
    playableHere: false,
  },
  {
    id: 'mantra_scramble',
    title: 'Mantra Scramble',
    subtitle: 'Rebuild the word from its letters',
    detail: 'Twenty Sanskrit words with their meanings, ninety seconds on the clock. Each one you unscramble you also read the meaning of, which is the half that stays with you.',
    lane: 'logic',
    difficulty: 2,
    duration: '90 sec',
    lowerIsBetter: false,
    unit: 'words',
    playableHere: false,
  },
  {
    id: 'breath_rhythm',
    title: 'Breath Rhythm',
    subtitle: 'Tap exactly when the circle fills the ring',
    detail: 'The one game here that gets easier when you stop trying. Chasing the ring with your eyes always lands late; breathing with it does not. The closest thing in this list to actual practice.',
    lane: 'calm',
    difficulty: 1,
    duration: '1 min',
    lowerIsBetter: true,
    unit: 'ms',
    playableHere: false,
  },
];

export const gameById = (id: string): Game | undefined =>
  GAMES.find((g) => g.id === id);
