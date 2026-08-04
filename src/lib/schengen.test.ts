import { describe, it, expect } from 'vitest';
import {
  type Trip,
  expandTripsToDays,
  expandTripToDays,
  tripLength,
  tripsOverlapOrTouch,
  mergeTrips,
  validateTrip,
  getRollingWindow,
  calculateDaysUsed,
  calculateRemainingDays,
  calculatePlanningResult,
  calculateEarliestReturn,
  calculateLatestLegalDeparture,
  calculateRecoveryTimeline,
  calculateDailyBreakdown,
  calculateStats,
  inspectTrip,
  parseStamps,
  stampsToTrips,
  getDashboardSnapshot,
  MAX_DAYS,
  WINDOW_DAYS,
  toDate,
  toISO,
} from '@/lib/schengen';

let id = 0;
const trip = (entry: string, exit: string): Trip => ({
  id: `t${id++}`,
  entryDate: entry,
  exitDate: exit,
});

const setOf = (trips: Trip[]) => expandTripsToDays(trips);

describe('expandTripToDays', () => {
  it('counts both entry and exit day (inclusive)', () => {
    const days = expandTripToDays(trip('2024-01-01', '2024-01-10'));
    expect(days).toHaveLength(10);
    expect(days[0]).toBe('2024-01-01');
    expect(days[9]).toBe('2024-01-10');
  });

  it('same-day entry/exit counts as 1 day', () => {
    expect(expandTripToDays(trip('2024-01-01', '2024-01-01'))).toHaveLength(1);
  });

  it('returns empty for exit before entry', () => {
    expect(expandTripToDays(trip('2024-01-10', '2024-01-01'))).toHaveLength(0);
  });

  it('handles leap years', () => {
    const days = expandTripToDays(trip('2024-02-28', '2024-03-01'));
    expect(days).toEqual(['2024-02-28', '2024-02-29', '2024-03-01']);
  });

  it('handles cross-year travel', () => {
    const days = expandTripToDays(trip('2023-12-30', '2024-01-02'));
    expect(days).toHaveLength(4);
    expect(days).toContain('2023-12-31');
    expect(days).toContain('2024-01-01');
  });
});

describe('tripLength', () => {
  it('is inclusive of both endpoints', () => {
    expect(tripLength(trip('2024-01-01', '2024-01-31'))).toBe(31);
  });
});

describe('tripsOverlapOrTouch & mergeTrips', () => {
  it('detects overlap', () => {
    expect(tripsOverlapOrTouch(trip('2024-01-01', '2024-01-10'), trip('2024-01-05', '2024-01-15'))).toBe(true);
  });
  it('detects adjacent (touching) trips', () => {
    expect(tripsOverlapOrTouch(trip('2024-01-01', '2024-01-10'), trip('2024-01-11', '2024-01-20'))).toBe(true);
  });
  it('rejects non-overlapping non-touching', () => {
    expect(tripsOverlapOrTouch(trip('2024-01-01', '2024-01-10'), trip('2024-02-01', '2024-02-10'))).toBe(false);
  });
  it('merges touching trips into one', () => {
    const merged = mergeTrips([trip('2024-01-01', '2024-01-10'), trip('2024-01-11', '2024-01-20')]);
    expect(merged).toHaveLength(1);
    expect(merged[0].entryDate).toBe('2024-01-01');
    expect(merged[0].exitDate).toBe('2024-01-20');
  });
  it('merges overlapping trips', () => {
    const merged = mergeTrips([trip('2024-01-01', '2024-01-15'), trip('2024-01-10', '2024-01-20')]);
    expect(merged).toHaveLength(1);
    expect(merged[0].exitDate).toBe('2024-01-20');
  });
  it('leaves separate trips apart', () => {
    expect(mergeTrips([trip('2024-01-01', '2024-01-10'), trip('2024-03-01', '2024-03-10')])).toHaveLength(2);
  });
});

describe('validateTrip', () => {
  it('rejects exit before entry', () => {
    const r = validateTrip(trip('2024-01-10', '2024-01-01'), []);
    expect(r.ok).toBe(false);
  });
  it('rejects overlap with another trip', () => {
    const r = validateTrip(trip('2024-01-05', '2024-01-15'), [trip('2024-01-01', '2024-01-10')]);
    expect(r.ok).toBe(false);
  });
  it('accepts a valid standalone trip', () => {
    expect(validateTrip(trip('2024-01-01', '2024-01-10'), [trip('2024-02-01', '2024-02-10')]).ok).toBe(true);
  });
});

describe('getRollingWindow', () => {
  it('is exactly 180 days inclusive', () => {
    const w = getRollingWindow('2024-06-01');
    const diff = (toDate(w.end).getTime() - toDate(w.start).getTime()) / 86400000;
    expect(diff).toBe(WINDOW_DAYS - 1);
  });
});

describe('calculateDaysUsed / remaining', () => {
  it('counts 0 when no trips', () => {
    expect(calculateDaysUsed('2024-06-01', new Set())).toBe(0);
  });

  it('counts exactly 90 for a 90-day trip in window', () => {
    const t = trip('2024-01-01', '2024-03-30'); // 90 days
    const occ = setOf([t]);
    expect(calculateDaysUsed('2024-03-30', occ)).toBe(90);
  });

  it('counts 91 for a 91-day trip (overstay)', () => {
    const t = trip('2024-01-01', '2024-03-31'); // 91 days
    expect(calculateDaysUsed('2024-03-31', setOf([t]))).toBe(91);
  });

  it('days outside the window are not counted', () => {
    // trip Jan 1–Jan 30, window ending Jun 1 (180-day start is ~Dec 4)
    const t = trip('2024-01-01', '2024-01-30');
    const occ = setOf([t]);
    // 2024-06-01 window starts 2023-12-04 → Jan trip is inside
    expect(calculateDaysUsed('2024-06-01', occ)).toBe(30);
    // 2024-07-01 window starts 2024-01-04 → Jan 4–30 counted = 27
    expect(calculateDaysUsed('2024-07-01', occ)).toBe(27);
  });

  it('180-day boundary: day exactly 180 ago drops out', () => {
    // Trip Jan 1 only. Window ending Jun 28 (start = Dec 1, 2023) includes Jan 1.
    // Window ending Jun 29 (start = Dec 2, 2023) — Jan 1 is 180 days before Jun 29 → NOT in window.
    const occ = setOf([trip('2024-01-01', '2024-01-01')]);
    expect(calculateDaysUsed('2024-06-28', occ)).toBe(1);
    expect(calculateDaysUsed('2024-06-29', occ)).toBe(0);
  });

  it('multiple overlapping trips are de-duplicated', () => {
    const occ = setOf([trip('2024-01-01', '2024-01-10'), trip('2024-01-05', '2024-01-15')]);
    expect(calculateDaysUsed('2024-01-15', occ)).toBe(15);
  });

  it('trips spanning years', () => {
    const occ = setOf([trip('2023-11-01', '2024-02-28')]);
    expect(calculateDaysUsed('2024-02-28', occ)).toBe(120);
  });
});

describe('calculatePlanningResult', () => {
  it('marks a legal short trip legal', () => {
    const r = calculatePlanningResult('2024-06-01', '2024-06-10', new Set());
    expect(r.legal).toBe(true);
    expect(r.tripLength).toBe(10);
    expect(r.remainingAfter).toBe(80);
  });

  it('marks a 91-day trip illegal', () => {
    const r = calculatePlanningResult('2024-01-01', '2024-03-31', new Set());
    expect(r.legal).toBe(false);
    expect(r.overstayBegins).toBe('2024-03-31'); // 91st day is the first overstay day
    expect(r.reduceStayBy).toBe(1);
  });

  it('factors in existing history', () => {
    const occ = setOf([trip('2024-01-01', '2024-01-30')]); // 30 days
    const r = calculatePlanningResult('2024-02-01', '2024-03-31', occ); // +60 = 90
    expect(r.legal).toBe(true);
    expect(r.daysUsedAfter).toBe(90);
  });

  it('detects overstay caused by history', () => {
    const occ = setOf([trip('2024-01-01', '2024-01-31')]); // 31 days
    // plan 75 days from Feb 1 → 31 + 75 = 106 > 90 in the window
    const r = calculatePlanningResult('2024-02-01', '2024-04-15', occ);
    expect(r.legal).toBe(false);
  });
});

describe('calculateLatestLegalDeparture', () => {
  it('allows 90 days from clean entry', () => {
    const d = calculateLatestLegalDeparture('2024-01-01', new Set());
    expect(d).toBe('2024-03-30'); // 90 days inclusive
  });

  it('reduces allowable stay given history', () => {
    const occ = setOf([trip('2023-12-01', '2023-12-10')]); // 10 days in window
    const d = calculateLatestLegalDeparture('2024-01-01', occ);
    // 10 already used → can stay 80 more → Jan 1 + 79 = Mar 20
    expect(d).toBe('2024-03-20');
  });
});

describe('calculateEarliestReturn', () => {
  it('returns next day if no history blocks', () => {
    const r = calculateEarliestReturn('2024-01-31', 30, new Set());
    expect(r.earliestReturn).toBe('2024-02-01');
  });

  it('rejects > 90 day stays', () => {
    const r = calculateEarliestReturn('2024-01-01', 91, new Set());
    expect(r.earliestReturn).toBeNull();
  });

  it('finds earliest return after a near-full history', () => {
    // Used 80 days Jan 1–Mar 20. Leave Mar 20. Want 30 days back.
    const occ = setOf([trip('2024-01-01', '2024-03-20')]); // 80 days
    const r = calculateEarliestReturn('2024-03-20', 30, occ);
    expect(r.earliestReturn).toBeTruthy();
    // The return date must allow a 30-day stay within 90/180.
    const ret = toDate(r.earliestReturn!);
    const planned = new Set(occ);
    let maxUsed = 0;
    let cursor = new Date(ret);
    for (let i = 0; i < 30; i++) {
      planned.add(toISO(cursor));
      maxUsed = Math.max(maxUsed, calculateDaysUsed(cursor, planned));
      cursor.setDate(cursor.getDate() + 1);
    }
    expect(maxUsed).toBeLessThanOrEqual(MAX_DAYS);
  });
});

describe('calculateRecoveryTimeline', () => {
  it('starts at today remaining and increases as days expire', () => {
    const occ = setOf([trip('2024-01-01', '2024-01-10')]); // 10 days
    const tl = calculateRecoveryTimeline('2024-01-10', occ, 200);
    expect(tl[0].remaining).toBe(80);
    // After Jan 10 + 180 days, the Jan 1 day expires → +1
    const gained = tl.filter((p) => p.gained > 0);
    expect(gained.length).toBeGreaterThan(0);
    const last = tl[tl.length - 1];
    expect(last.remaining).toBe(MAX_DAYS);
  });
});

describe('calculateDailyBreakdown', () => {
  it('produces one row per day', () => {
    const rows = calculateDailyBreakdown('2024-01-01', '2024-01-10', setOf([trip('2024-01-01', '2024-01-05')]), [trip('2024-01-01', '2024-01-05')]);
    expect(rows).toHaveLength(10);
    expect(rows[0].daysUsed).toBe(1);
    expect(rows[4].daysUsed).toBe(5);
    expect(rows[5].daysUsed).toBe(5); // day 6, trip still in window
  });
});

describe('inspectTrip', () => {
  it('reports days in current window and expirations', () => {
    const t = trip('2024-01-01', '2024-01-05');
    const insp = inspectTrip(t, setOf([t]), new Date('2024-01-05'));
    expect(insp.length).toBe(5);
    expect(insp.daysInCurrentWindow).toBe(5);
    expect(insp.dayExpirations).toHaveLength(5);
    // Jan 1 stops counting 180 days later = Jun 29 (day 180 after Jan 1)
    expect(insp.dayExpirations[0].expiresFromWindow).toBe('2024-06-29');
  });
});

describe('parseStamps & stampsToTrips', () => {
  it('parses + and - stamps in DDMMYY', () => {
    const stamps = parseStamps('+01.01.24\n-15.01.24\n+10.03.24\n-20.04.24');
    expect(stamps).toHaveLength(4);
    expect(stamps[0].type).toBe('in');
    expect(stamps[0].date).toBe('2024-01-01');
    expect(stamps[1].type).toBe('out');
  });

  it('pairs entries with exits into trips', () => {
    const trips = stampsToTrips(parseStamps('+01.01.24\n-15.01.24\n+10.03.24\n-20.04.24'));
    expect(trips).toHaveLength(2);
    expect(trips[0].entryDate).toBe('2024-01-01');
    expect(trips[0].exitDate).toBe('2024-01-15');
  });

  it('ignores unpaired exit', () => {
    const trips = stampsToTrips(parseStamps('-15.01.24\n+01.01.24\n-20.01.24'));
    expect(trips).toHaveLength(1);
    expect(trips[0].entryDate).toBe('2024-01-01');
  });
});

describe('calculateStats', () => {
  it('aggregates trip and day stats', () => {
    const trips = [trip('2024-01-01', '2024-01-10'), trip('2024-03-01', '2024-03-05')];
    const occ = setOf(trips);
    const stats = calculateStats(trips, occ, new Date('2024-06-01'));
    expect(stats.totalTrips).toBe(2);
    expect(stats.totalDaysEver).toBe(15);
    expect(stats.longestTrip).toBe(10);
    expect(stats.averageTrip).toBe(8);
  });
});

describe('toISO / toDate roundtrip', () => {
  it('normalizes to yyyy-MM-dd', () => {
    expect(toISO(toDate('2024-01-15'))).toBe('2024-01-15');
  });
});

describe('getDashboardSnapshot', () => {
  it('aggregates all dashboard values consistently', () => {
    const trips = [trip('2024-01-01', '2024-01-30')]; // 30 days
    const snap = getDashboardSnapshot(trips, new Date('2024-01-15'));
    expect(snap.daysUsed).toBe(15);
    expect(snap.remaining).toBe(MAX_DAYS - 15);
    expect(snap.legal).toBe(true);
    expect(snap.inSchengen).toBe(true);
    expect(snap.daysUsed + snap.remaining).toBe(MAX_DAYS);
  });

  it('detects overstay', () => {
    const trips = [trip('2024-01-01', '2024-04-10')]; // 101 days
    const snap = getDashboardSnapshot(trips, new Date('2024-04-10'));
    expect(snap.legal).toBe(false);
    expect(snap.daysUsed).toBeGreaterThan(MAX_DAYS);
  });

  it('daysUsed + remaining always equals 90', () => {
    const trips = [trip('2023-12-01', '2024-02-28'), trip('2024-05-01', '2024-05-15')];
    const snap = getDashboardSnapshot(trips, new Date('2024-06-01'));
    expect(snap.daysUsed + snap.remaining).toBe(MAX_DAYS);
  });
});

// Official EC example-style scenario:
// A stay of 30 days, then another stay, checking the 180-day rolling compliance.
describe('EC-style scenario', () => {
  it('30 + 60 across a boundary stays legal', () => {
    // Trip 1: Jan 1 – Jan 30 (30 days). Trip 2: Mar 1 – Apr 29 (60 days).
    // On Apr 29 the window (Oct-ish back 180 → contains both) = 90. Legal.
    const occ = setOf([trip('2024-01-01', '2024-01-30'), trip('2024-03-01', '2024-04-29')]);
    expect(calculateDaysUsed('2024-04-29', occ)).toBe(90);
    expect(calculateRemainingDays('2024-04-29', occ)).toBe(0);
  });

  it('30 + 61 crosses into overstay', () => {
    const occ = setOf([trip('2024-01-01', '2024-01-30'), trip('2024-03-01', '2024-04-30')]);
    expect(calculateDaysUsed('2024-04-30', occ)).toBe(91);
  });
});
