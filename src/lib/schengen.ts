import {
  differenceInCalendarDays,
  eachDayOfInterval,
  format,
  formatISO,
  isAfter,
  isBefore,
  isValid,
  max,
  min,
  parseISO,
  subDays,
} from 'date-fns';

// ──────────────────────────────────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────────────────────────────────

export interface Trip {
  id: string;
  entryDate: string; // ISO yyyy-MM-dd
  exitDate: string; // ISO yyyy-MM-dd
}

export const WINDOW_DAYS = 180;
export const MAX_DAYS = 90;

// ──────────────────────────────────────────────────────────────────────────────
// Date helpers — all normalized to local midnight, timezone-safe
// ──────────────────────────────────────────────────────────────────────────────

export function toDate(iso: string): Date {
  const d = parseISO(iso);
  return d;
}

export function toISO(date: Date): string {
  return formatISO(date, { representation: 'complete' }).slice(0, 10);
}

export function todayISO(): string {
  return toISO(new Date());
}

/** Normalize any date to local midnight so date arithmetic is consistent. */
export function midnight(d: Date): Date {
  const n = new Date(d);
  n.setHours(0, 0, 0, 0);
  return n;
}

/** Parse an ISO date string that may be a partial (yyyy-MM or yyyy-MM-dd) into a full yyyy-MM-dd. */
export function normalizeISO(input: string): string | null {
  if (!input) return null;
  const s = input.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
    const d = parseISO(s);
    return isValid(d) ? s : null;
  }
  return null;
}

// ──────────────────────────────────────────────────────────────────────────────
// Trip helpers
// ──────────────────────────────────────────────────────────────────────────────

/** Expand a trip into the set of occupied calendar days (entry + exit both count). */
export function expandTripToDays(trip: Trip): string[] {
  const entry = toDate(trip.entryDate);
  const exit = toDate(trip.exitDate);
  if (isAfter(entry, exit)) return [];
  return eachDayOfInterval({ start: entry, end: exit }).map(toISO);
}

/** Expand all trips into a Set of occupied day strings. Overlaps are de-duplicated. */
export function expandTripsToDays(trips: Trip[]): Set<string> {
  const set = new Set<string>();
  for (const t of trips) {
    for (const d of expandTripToDays(t)) set.add(d);
  }
  return set;
}

export function tripLength(trip: Trip): number {
  return differenceInCalendarDays(toDate(trip.exitDate), toDate(trip.entryDate)) + 1;
}

/** Do two trips overlap or touch (adjacent days merge into one)? */
export function tripsOverlapOrTouch(a: Trip, b: Trip): boolean {
  const aS = toDate(a.entryDate);
  const aE = toDate(a.exitDate);
  const bS = toDate(b.entryDate);
  const bE = toDate(b.exitDate);
  // touching = exit of one is the day before entry of the other
  const touch =
    differenceInCalendarDays(aE, bS) === -1 ||
    differenceInCalendarDays(bE, aS) === -1;
  const overlap = !(isAfter(aS, bE) || isAfter(bS, aE));
  return overlap || touch;
}

export interface ValidationResult {
  ok: boolean;
  errors: string[];
}

export function validateTrip(trip: Trip, others: Trip[]): ValidationResult {
  const errors: string[] = [];
  if (!trip.entryDate) errors.push('Entry date is required');
  if (!trip.exitDate) errors.push('Exit date is required');
  if (trip.entryDate && trip.exitDate && isAfter(toDate(trip.entryDate), toDate(trip.exitDate))) {
    errors.push('Exit date must be on or after entry date');
  }
  for (const o of others) {
    if (o.id === trip.id) continue;
    const overlap = !(isAfter(toDate(trip.entryDate), toDate(o.exitDate)) || isAfter(toDate(o.entryDate), toDate(trip.exitDate)));
    if (overlap) errors.push(`Overlaps with trip ${o.entryDate} → ${o.exitDate}`);
  }
  return { ok: errors.length === 0, errors };
}

/** Merge trips that overlap or touch into consolidated trips, sorted by entry date. */
export function mergeTrips(trips: Trip[]): Trip[] {
  if (trips.length === 0) return [];
  const sorted = [...trips].sort((a, b) => toDate(a.entryDate).getTime() - toDate(b.entryDate).getTime());
  const merged: Trip[] = [];
  let current = { ...sorted[0] };
  for (let i = 1; i < sorted.length; i++) {
    const next = sorted[i];
    if (tripsOverlapOrTouch(current, next)) {
      current = {
        id: current.id,
        entryDate: toISO(min([toDate(current.entryDate), toDate(next.entryDate)])),
        exitDate: toISO(max([toDate(current.exitDate), toDate(next.exitDate)])),
      };
    } else {
      merged.push(current);
      current = { ...next };
    }
  }
  merged.push(current);
  return merged;
}

// ──────────────────────────────────────────────────────────────────────────────
// Rolling-window engine
// ──────────────────────────────────────────────────────────────────────────────

/**
 * The 180-day window ending on `date` (inclusive). Day 180 is `date` itself,
 * day 1 is 179 days before. Returns [start, end] as ISO strings.
 */
export function getRollingWindow(date: Date | string): { start: string; end: string } {
  const end = typeof date === 'string' ? toDate(date) : midnight(date);
  const start = subDays(end, WINDOW_DAYS - 1);
  return { start: toISO(start), end: toISO(end) };
}

/** Count occupied days inside the 180-day window ending on `date`. */
export function calculateDaysUsed(date: Date | string, occupied: Set<string>): number {
  const { start, end } = getRollingWindow(date);
  let count = 0;
  for (const d of occupied) {
    if (d >= start && d <= end) count++;
  }
  return count;
}

export function calculateRemainingDays(date: Date | string, occupied: Set<string>): number {
  return MAX_DAYS - calculateDaysUsed(date, occupied);
}

// ──────────────────────────────────────────────────────────────────────────────
// Planning queries
// ──────────────────────────────────────────────────────────────────────────────

export interface PlanningResult {
  tripLength: number;
  legal: boolean;
  daysUsedAfter: number;
  remainingAfter: number;
  overstayBegins: string | null;
  reduceStayBy: number | null;
}

/**
 * Evaluate a hypothetical trip (entry → exit) against existing history.
 * Also computes, for the exit date, the rolling window usage.
 */
export function calculatePlanningResult(
  entryISO: string,
  exitISO: string,
  occupied: Set<string>
): PlanningResult {
  const len = differenceInCalendarDays(toDate(exitISO), toDate(entryISO)) + 1;
  // Build a hypothetical occupied set including the planned trip
  const plannedDays = new Set(occupied);
  for (const d of expandTripToDays({ id: 'plan', entryDate: entryISO, exitDate: exitISO })) {
    plannedDays.add(d);
  }
  // The day we care about is the exit day (the last day in Schengen)
  const exitDate = toDate(exitISO);
  const daysUsedAfter = calculateDaysUsed(exitDate, plannedDays);
  const remainingAfter = MAX_DAYS - daysUsedAfter;
  const legal = daysUsedAfter <= MAX_DAYS;

  // If illegal, find the first day in the trip where the window exceeds 90
  let overstayBegins: string | null = null;
  let reduceStayBy = 0;
  if (!legal) {
    let cursor = toDate(entryISO);
    let lastLegal = toDate(entryISO);
    while (!isAfter(cursor, exitDate)) {
      const used = calculateDaysUsed(cursor, plannedDays);
      if (used > MAX_DAYS) {
        overstayBegins = toISO(cursor);
        break;
      }
      lastLegal = cursor;
      cursor = new Date(cursor);
      cursor.setDate(cursor.getDate() + 1);
    }
    if (overstayBegins) {
      reduceStayBy = differenceInCalendarDays(toDate(exitISO), toDate(overstayBegins)) + 1;
    }
    void lastLegal;
  }

  return {
    tripLength: len,
    legal,
    daysUsedAfter,
    remainingAfter,
    overstayBegins,
    reduceStayBy: legal ? null : reduceStayBy,
  };
}

/**
 * If entering on `entryISO`, compute the latest legal departure date —
 * the last day d such that the window ending on d contains ≤ 90 occupied days
 * (counting the planned stay itself).
 */
export function calculateLatestLegalDeparture(
  entryISO: string,
  occupied: Set<string>
): string | null {
  const planned = new Set(occupied);
  // Add days one at a time from entry forward until we exceed 90.
  let cursor = toDate(entryISO);
  let lastLegal: Date | null = null;
  // Hard cap: scan at most 180 days to bound the work.
  for (let i = 0; i < WINDOW_DAYS + 1; i++) {
    const iso = toISO(cursor);
    if (!planned.has(iso)) planned.add(iso);
    const used = calculateDaysUsed(cursor, planned);
    if (used > MAX_DAYS) break;
    lastLegal = new Date(cursor);
    cursor.setDate(cursor.getDate() + 1);
  }
  return lastLegal ? toISO(lastLegal) : null;
}

/**
 * Given a leaving date and a desired future stay length (days), compute the
 * earliest return date on which the traveler can enter and stay the full
 * `desiredStay` days without exceeding 90 in any rolling window.
 *
 * Returns the earliest entry date and an explanation of which prior days
 * must expire first.
 */
export interface EarliestReturnResult {
  earliestReturn: string | null;
  reason: string;
  daysThatMustExpire: string[];
}

export function calculateEarliestReturn(
  leavingISO: string,
  desiredStay: number,
  occupied: Set<string>
): EarliestReturnResult {
  if (desiredStay <= 0) return { earliestReturn: leavingISO, reason: 'No stay requested.', daysThatMustExpire: [] };
  if (desiredStay > MAX_DAYS) {
    return {
      earliestReturn: null,
      reason: `A single stay cannot exceed ${MAX_DAYS} days under the Schengen rule.`,
      daysThatMustExpire: [],
    };
  }
  // Try each candidate entry day starting the day after leaving.
  // The traveler must be out of Schengen on leavingISO (already left).
  let candidate = new Date(toDate(leavingISO));
  candidate.setDate(candidate.getDate() + 1);
  // Bound the search at ~2 years.
  for (let i = 0; i < 730; i++) {
    const entryISO = toISO(candidate);
    // Build hypothetical occupied set: existing + the planned stay
    const planned = new Set(occupied);
    // Remove any days on/after leaving that might still be in a trip — not needed, occupied only has real trips.
    let legal = true;
    let endCursor = new Date(candidate);
    for (let j = 0; j < desiredStay; j++) {
      const iso = toISO(endCursor);
      planned.add(iso);
      const used = calculateDaysUsed(endCursor, planned);
      if (used > MAX_DAYS) {
        legal = false;
        break;
      }
      endCursor.setDate(endCursor.getDate() + 1);
    }
    if (legal) {
      // Identify which prior occupied days must have expired before this entry
      // = occupied days within the window ending on the last planned day that
      //   are on or before the candidate entry's window-start.
      const lastPlanned = new Date(endCursor);
      lastPlanned.setDate(lastPlanned.getDate() - 1);
      const { start } = getRollingWindow(lastPlanned);
      const mustExpire: string[] = [];
      for (const d of occupied) {
        if (d >= start && d < entryISO) mustExpire.push(d);
      }
      mustExpire.sort();
      const reason =
        mustExpire.length > 0
          ? `${mustExpire.length} previous travel day${mustExpire.length > 1 ? 's' : ''} must first expire out of the 180-day window (earliest: ${mustExpire[0]}).`
          : 'No prior days block this stay.';
      return { earliestReturn: entryISO, reason, daysThatMustExpire: mustExpire };
    }
    candidate.setDate(candidate.getDate() + 1);
  }
  return {
    earliestReturn: null,
    reason: 'No legal return found within the search horizon.',
    daysThatMustExpire: [],
  };
}

// ──────────────────────────────────────────────────────────────────────────────
// Recovery timeline — when do additional days become available?
// ──────────────────────────────────────────────────────────────────────────────

export interface RecoveryPoint {
  date: string;
  remaining: number;
  gained: number; // delta from previous point
}

/**
 * From `fromDate` forward (up to `horizonDays`), find every day where the
 * remaining-day count increases (i.e. an occupied day exits the window).
 */
export function calculateRecoveryTimeline(
  fromDate: Date | string,
  occupied: Set<string>,
  horizonDays = 365
): RecoveryPoint[] {
  const start = typeof fromDate === 'string' ? toDate(fromDate) : midnight(fromDate);
  const points: RecoveryPoint[] = [];
  let prev = calculateRemainingDays(start, occupied);
  points.push({ date: toISO(start), remaining: prev, gained: 0 });
  let cursor = new Date(start);
  for (let i = 1; i <= horizonDays; i++) {
    cursor.setDate(cursor.getDate() + 1);
    const r = calculateRemainingDays(cursor, occupied);
    if (r > prev) {
      points.push({ date: toISO(cursor), remaining: r, gained: r - prev });
      prev = r;
    }
    if (prev >= MAX_DAYS) break;
  }
  return points;
}

/** The next date (from `fromDate`) on which at least one additional day is recovered. */
export function nextDayRecovered(fromDate: Date | string, occupied: Set<string>): string | null {
  const tl = calculateRecoveryTimeline(fromDate, occupied, 200);
  const next = tl.find((p) => p.gained > 0);
  return next ? next.date : null;
}

/** The next date on which the rolling window is fully reset (0 days used). */
export function nextFullyResetDate(fromDate: Date | string, occupied: Set<string>): string | null {
  if (occupied.size === 0) return toISO(midnight(new Date()));
  const latestTripEnd = [...occupied].sort().pop()!;
  const reset = subDays(toDate(latestTripEnd), -WINDOW_DAYS); // 180 days after last occupied day
  const start = typeof fromDate === 'string' ? toDate(fromDate) : midnight(fromDate);
  return isAfter(reset, start) ? toISO(reset) : toISO(start);
}

// ──────────────────────────────────────────────────────────────────────────────
// Daily breakdown for a date range
// ──────────────────────────────────────────────────────────────────────────────

export type DayStatus = 'safe' | 'approaching' | 'illegal' | 'outside';

export interface DayBreakdown {
  date: string;
  daysUsed: number;
  remaining: number;
  status: DayStatus;
  tripsCounted: number;
}

export function statusForRemaining(r: number): DayStatus {
  if (r < 0) return 'illegal';
  if (r <= 5) return 'approaching';
  return 'safe';
}

export function calculateDailyBreakdown(
  fromISO: string,
  toISO_: string,
  occupied: Set<string>,
  trips: Trip[]
): DayBreakdown[] {
  const start = toDate(fromISO);
  const end = toDate(toISO_);
  if (isAfter(start, end)) return [];
  const days = eachDayOfInterval({ start, end });
  return days.map((d) => {
    const iso = toISO(d);
    const used = calculateDaysUsed(d, occupied);
    const remaining = MAX_DAYS - used;
    const { start: wStart, end: wEnd } = getRollingWindow(d);
    const tripsCounted = trips.filter(
      (t) => toDate(t.exitDate) >= toDate(wStart) && toDate(t.entryDate) <= toDate(wEnd)
    ).length;
    return { date: iso, daysUsed: used, remaining, status: statusForRemaining(remaining), tripsCounted };
  });
}

// ──────────────────────────────────────────────────────────────────────────────
// Passport stamp parsing — EC style +010124 / -150124
// ──────────────────────────────────────────────────────────────────────────────

export interface ParsedStamp {
  type: 'in' | 'out';
  date: string;
  raw: string;
}

/**
 * Parse EC-style stamp strings like "+01.01.24" or "-15/01/2024".
 * Returns sorted entry/exit stamps and pairs them into trips.
 */
export function parseStamps(input: string): ParsedStamp[] {
  const lines = input.split(/[\n,]+/).map((l) => l.trim()).filter(Boolean);
  const stamps: ParsedStamp[] = [];
  for (const line of lines) {
    // Normalize separators
    const m = line.match(/^([+\-])\s*[\D]?(\d{1,2})[\./-](\d{1,2})[\./-](\d{2,4})$/);
    if (!m) continue;
    const [, sign, dd, mm, yy] = m;
    const day = dd.padStart(2, '0');
    const month = mm.padStart(2, '0');
    let year = yy;
    if (year.length === 2) year = '20' + year;
    const iso = `${year}-${month}-${day}`;
    stamps.push({ type: sign === '+' ? 'in' : 'out', date: iso, raw: line });
  }
  stamps.sort((a, b) => a.date.localeCompare(b.date));
  return stamps;
}

/** Pair parsed stamps into trips. An 'in' starts a trip, the next 'out' ends it. */
export function stampsToTrips(stamps: ParsedStamp[]): Trip[] {
  const trips: Trip[] = [];
  let openIn: string | null = null;
  for (const s of stamps) {
    if (s.type === 'in') {
      openIn = s.date;
    } else if (s.type === 'out' && openIn) {
      trips.push({ id: crypto.randomUUID(), entryDate: openIn, exitDate: s.date });
      openIn = null;
    }
  }
  return trips;
}

// ──────────────────────────────────────────────────────────────────────────────
// Statistics
// ──────────────────────────────────────────────────────────────────────────────

export interface Stats {
  totalTrips: number;
  totalDaysEver: number;
  longestTrip: number;
  averageTrip: number;
  currentDaysUsed: number;
  currentRemaining: number;
  nextDayRecovered: string | null;
  nextFullyReset: string | null;
}

export function calculateStats(trips: Trip[], occupied: Set<string>, today: Date): Stats {
  const lengths = trips.map(tripLength);
  const totalDaysEver = occupied.size;
  return {
    totalTrips: trips.length,
    totalDaysEver,
    longestTrip: lengths.length ? Math.max(...lengths) : 0,
    averageTrip: lengths.length ? Math.round(lengths.reduce((a, b) => a + b, 0) / lengths.length) : 0,
    currentDaysUsed: calculateDaysUsed(today, occupied),
    currentRemaining: calculateRemainingDays(today, occupied),
    nextDayRecovered: nextDayRecovered(today, occupied),
    nextFullyReset: nextFullyResetDate(today, occupied),
  };
}

// ──────────────────────────────────────────────────────────────────────────────
// Trip inspector helpers
// ──────────────────────────────────────────────────────────────────────────────

export interface TripInspection {
  trip: Trip;
  length: number;
  daysInCurrentWindow: number;
  dayExpirations: { date: string; expiresFromWindow: string }[];
}

export function inspectTrip(trip: Trip, occupied: Set<string>, today: Date): TripInspection {
  const days = expandTripToDays(trip);
  const { start, end } = getRollingWindow(today);
  const daysInCurrentWindow = days.filter((d) => d >= start && d <= end).length;
  // Each occupied day exits the window 180 days after it occurs (on day D+180
  // it is no longer within any 180-day window ending on or after that date)
  const dayExpirations = days.map((d) => ({
    date: d,
    expiresFromWindow: toISO(subDays(toDate(d), -WINDOW_DAYS)),
  }));
  void occupied;
  return { trip, length: tripLength(trip), daysInCurrentWindow, dayExpirations };
}

// ──────────────────────────────────────────────────────────────────────────────
// Availability forecast
// ──────────────────────────────────────────────────────────────────────────────

export interface ForecastPoint {
  label: string;
  date: string;
  daysAvailable: number;
}

export function calculateAvailabilityForecast(
  today: Date,
  occupied: Set<string>
): ForecastPoint[] {
  const make = (label: string, offset: number): ForecastPoint => {
    const d = new Date(today);
    d.setDate(d.getDate() + offset);
    return { label, date: toISO(d), daysAvailable: calculateRemainingDays(d, occupied) };
  };
  return [
    make('Tomorrow', 1),
    make('Next Week', 7),
    make('30 Days Later', 30),
    make('90 Days Later', 90),
  ];
}

/** Whether the traveler may legally enter on `date` (i.e. remaining ≥ 0 on entry). */
export function canEnterOn(date: Date | string, occupied: Set<string>): boolean {
  return calculateRemainingDays(date, occupied) > 0;
}

// ──────────────────────────────────────────────────────────────────────────────
// Unified snapshot — single source of truth for the dashboard
// ──────────────────────────────────────────────────────────────────────────────

export interface CurrentTripInfo {
  trip: Trip;
  latestLegalDeparture: string | null;
  overstayBegan: string | null;
}

export interface DashboardSnapshot {
  today: string;
  daysUsed: number;
  remaining: number;
  legal: boolean;
  inSchengen: boolean;
  currentTrip: CurrentTripInfo | null;
  window: { start: string; end: string };
  latestLegalDepartureIfEnterToday: string | null;
  nextDayRecovered: string | null;
  nextFullyReset: string | null;
  fullyResetRemainingDays: number;
}

/**
 * Compute every value the top-level dashboard needs in one pass, so every
 * card and planner reads from the same snapshot — no independent calculations.
 */
export function getDashboardSnapshot(trips: Trip[], today: Date = new Date()): DashboardSnapshot {
  const occupied = expandTripsToDays(trips);
  const todayIso = toISO(today);
  const daysUsed = calculateDaysUsed(today, occupied);
  const remaining = MAX_DAYS - daysUsed;
  const window = getRollingWindow(today);
  const currentTrip = trips.find((t) => todayIso >= t.entryDate && todayIso <= t.exitDate) || null;
  const inSchengen = !!currentTrip;

  let currentTripInfo: CurrentTripInfo | null = null;
  if (currentTrip) {
    const lld = calculateLatestLegalDeparture(currentTrip.entryDate, occupied);
    const overstayBegan =
      daysUsed > MAX_DAYS
        ? findFirstOverstayDay(currentTrip.entryDate, currentTrip.exitDate, occupied)
        : null;
    currentTripInfo = { trip: currentTrip, latestLegalDeparture: lld, overstayBegan };
  }

  const latestLegalDepartureIfEnterToday = calculateLatestLegalDeparture(todayIso, occupied);
  const nextDay = nextDayRecovered(today, occupied);
  const fullReset = nextFullyResetDate(today, occupied);

  return {
    today: todayIso,
    daysUsed,
    remaining,
    legal: daysUsed <= MAX_DAYS,
    inSchengen,
    currentTrip: currentTripInfo,
    window,
    latestLegalDepartureIfEnterToday,
    nextDayRecovered: nextDay,
    nextFullyReset: fullReset,
    fullyResetRemainingDays: remaining,
  };
}

function findFirstOverstayDay(entryISO: string, exitISO: string, occupied: Set<string>): string | null {
  let cursor = toDate(entryISO);
  const exit = toDate(exitISO);
  while (!isAfter(cursor, exit)) {
    if (calculateDaysUsed(cursor, occupied) > MAX_DAYS) return toISO(cursor);
    cursor.setDate(cursor.getDate() + 1);
  }
  return null;
}

// ──────────────────────────────────────────────────────────────────────────────
// Plain-English explanations
// ──────────────────────────────────────────────────────────────────────────────

export function explainRemaining(remaining: number): string {
  if (remaining <= 0) {
    return 'You have used all 90 of your allowed Schengen days in the current 180-day period. You must leave the Schengen Area and wait until previous travel days fall outside the window.';
  }
  return `This means you may spend another ${remaining} day${remaining > 1 ? 's' : ''} inside the Schengen Area before reaching the legal limit of 90 days in any rolling 180-day period.`;
}

export function explainNextRecovery(nextDay: string | null): string {
  if (!nextDay) {
    return 'No additional days will become available in the near future because you have no recent travel days waiting to expire from the window.';
  }
  return `On ${formatLong(nextDay)} one previous travel day leaves your 180-day window, giving you one additional available day.`;
}

export function explainLatestDeparture(latest: string | null, inSchengen: boolean): string {
  if (!latest) return 'Unable to determine a latest legal departure date from the current data.';
  if (inSchengen) {
    return `If you remain in the Schengen Area, this is the latest day you could legally stay: ${formatLong(latest)}. You must leave on or before this date.`;
  }
  return `If you entered today, this is the latest day you could legally remain: ${formatLong(latest)}.`;
}

export function explainEarliestReturn(result: EarliestReturnResult): string {
  if (!result.earliestReturn) return result.reason;
  return `You can legally re-enter the Schengen Area on ${formatLong(result.earliestReturn)} and stay for your requested duration. ${result.reason}`;
}

export function explainWindow(window: { start: string; end: string }, daysUsed: number): string {
  return `Your current 180-day period runs from ${formatLong(window.start)} to ${formatLong(window.end)}. Within this period, ${daysUsed} day${daysUsed !== 1 ? 's are' : ' is'} counted as spent in Schengen.`;
}

export function explainCalendarDay(date: string, daysUsed: number, remaining: number): string {
  const status = remaining < 0 ? 'would be an overstay' : remaining <= 5 ? 'is approaching the limit' : 'is safe';
  return `On ${formatLong(date)}, your rolling 180-day period includes ${daysUsed} travel day${daysUsed !== 1 ? 's' : ''}, leaving you with ${Math.max(remaining, 0)} available day${remaining !== 1 ? 's' : ''}. This date ${status}.`;
}

export function explainFullReset(resetDate: string | null): string {
  if (!resetDate) return 'No full reset date available.';
  return `On ${formatLong(resetDate)}, all your previous travel days will have exited the 180-day window, giving you a full 90 days available again.`;
}

function formatLong(iso: string): string {
  try {
    return format(toDate(iso), 'MMMM d, yyyy');
  } catch {
    return iso;
  }
}
