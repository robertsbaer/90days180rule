import { useMemo } from 'react';
import { format, parseISO, differenceInCalendarDays } from 'date-fns';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { Card, SectionTitle, Pill, NumberStat, InfoTooltip, Explanation } from '@/components/ui';
import { useStore } from '@/store';
import {
  expandTripsToDays,
  expandTripToDays,
  tripLength,
  calculateRecoveryTimeline,
  inspectTrip,
  calculateStats,
  calculateDaysUsed,
  getRollingWindow,
  calculateLatestLegalDeparture,
  calculateEarliestReturn,
  explainFullReset,
  WINDOW_DAYS,
  MAX_DAYS,
  todayISO,
  toDate,
} from '@/lib/schengen';

function fmt(iso: string) {
  try {
    return format(parseISO(iso), 'MMM d, yyyy');
  } catch {
    return iso;
  }
}

const TRIP_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export function TimelineInspector() {
  const trips = useStore((s) => s.trips);
  const occupied = useMemo(() => expandTripsToDays(trips), [trips]);
  const selectedTripId = useStore((s) => s.selectedTripId);
  const selectedTrip = trips.find((t) => t.id === selectedTripId) || trips[0] || null;

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <UnifiedTimeline trips={trips} occupied={occupied} />
      <TripInspector trip={selectedTrip} occupied={occupied} />
    </div>
  );
}

export function UnifiedTimeline({
  trips,
  occupied,
}: {
  trips: ReturnType<typeof useStore.getState>['trips'];
  occupied: Set<string>;
}) {
  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  if (trips.length === 0) {
    return (
      <Card className="p-5">
        <SectionTitle title="Travel Timeline" subtitle="Your complete travel picture" />
        <p className="py-8 text-center text-sm text-slate-400">Add trips to see the timeline.</p>
      </Card>
    );
  }

  const sorted = [...trips].sort((a, b) => a.entryDate.localeCompare(b.entryDate));
  const earliest = toDate(sorted[0].entryDate);
  const latestTrip = toDate(sorted[sorted.length - 1].exitDate);

  const todayStr = todayISO();
  const latestLegal = calculateLatestLegalDeparture(todayStr, occupied);
  const earliestRet = calculateEarliestReturn(todayStr, 30, occupied);
  const recoveryStart = earliestRet.earliestReturn ? toDate(earliestRet.earliestReturn) : null;

  const futureEnds: Date[] = [latestTrip, today];
  if (latestLegal) futureEnds.push(toDate(latestLegal));
  if (recoveryStart) futureEnds.push(recoveryStart);
  const end = new Date(Math.max(...futureEnds.map((d) => d.getTime())));
  end.setDate(end.getDate() + 10);
  const totalSpan = Math.max(differenceInCalendarDays(end, earliest), 1);

  const todayOffset = differenceInCalendarDays(today, earliest);
  const todayPct = (todayOffset / totalSpan) * 100;
  const latestLegalPct = latestLegal
    ? (differenceInCalendarDays(toDate(latestLegal), earliest) / totalSpan) * 100
    : null;
  const recoveryPct = recoveryStart
    ? (differenceInCalendarDays(recoveryStart, earliest) / totalSpan) * 100
    : null;

  return (
    <Card className="p-5">
      <SectionTitle
        title="Travel Timeline"
        subtitle="Past trips, today, and future markers"
        action={
          <InfoTooltip
            text="This unified timeline shows your past trips (colored bars), today (dashed line), the latest legal departure if you enter today, and the earliest return date for a 30-day stay."
            label="What am I looking at?"
          />
        }
      />
      <div className="relative mt-4">
        {/* Today Marker Line */}
        <div
          className="absolute top-0 h-full w-px border-l-2 border-dashed border-slate-400/60"
          style={{ left: `calc(${todayPct}% + 9rem)` }}
        />
        <div
          className="absolute -top-1 -translate-x-1/2 rounded bg-slate-700 px-1.5 py-0.5 text-[9px] font-medium text-white"
          style={{ left: `calc(${todayPct}% + 9rem)` }}
        >
          Today
        </div>

        <div className="space-y-6">
          {/* Trip Rows */}
          {sorted.map((trip, i) => {
            const startOffset = differenceInCalendarDays(toDate(trip.entryDate), earliest);
            const len = tripLength(trip);
            const widthPct = (len / totalSpan) * 100;
            const leftPct = (startOffset / totalSpan) * 100;
            const daysInWindow = expandTripToDays(trip).filter((d) => {
              const { start, end: wEnd } = getRollingWindow(today);
              return d >= start && d <= wEnd;
            }).length;
            const expires = new Date(toDate(trip.exitDate));
            expires.setDate(expires.getDate() + WINDOW_DAYS);

            return (
              <div key={trip.id} className="group relative animate-fade-in">
                <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4">
                  <div className="w-36 shrink-0 text-xs sm:text-right">
                    <p className="font-medium text-slate-700 dark:text-slate-300">{fmt(trip.entryDate)}</p>
                    <p className="text-slate-500 dark:text-slate-400">to {fmt(trip.exitDate)}</p>
                  </div>
                  <div className="relative h-8 flex-1 rounded-md bg-slate-100 dark:bg-slate-800/60 mt-1 sm:mt-0">
                    <div
                      style={{ left: `${leftPct}%`, width: `${Math.max(widthPct, 0.5)}%` }}
                      className="absolute top-0 h-full rounded-md transition-all duration-300 ease-out flex items-center justify-end pr-2"
                    >
                      <div 
                        className="h-full rounded-md flex items-center justify-center px-2"
                        style={{ backgroundColor: TRIP_COLORS[i % TRIP_COLORS.length] }}
                        title={`${len} days · ${daysInWindow} still counting`}
                      >
                        <span className="text-[10px] font-bold text-white">{len}d</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Future Marker Rows */}
          <div className="mt-6 space-y-4 pt-4 border-t border-slate-200 dark:border-slate-700">
            {latestLegalPct !== null && (
              <FutureMarker label="Latest legal departure" pct={latestLegalPct} color="bg-emerald-500" />
            )}
            {recoveryPct !== null && (
              <FutureMarker label="Earliest return (30d)" pct={recoveryPct} color="bg-blue-500" />
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}

function FutureMarker({ label, pct, color }: { label: string; pct: number; color: string }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4">
      <p className="w-36 shrink-0 text-xs text-slate-500 dark:text-slate-400 sm:text-right">{label}</p>
      <div className="relative h-8 flex-1 rounded-md bg-slate-100 dark:bg-slate-800/60 mt-1 sm:mt-0">
        <div
          className={`absolute top-1/2 h-3.5 w-3.5 -translate-y-1/2 rounded-full ${color}`}
          style={{ left: `${Math.min(Math.max(pct, 0), 100)}%` }}
        />
      </div>
    </div>
  );
}

function TripInspector({
  trip,
  occupied,
}: {
  trip: ReturnType<typeof useStore.getState>['trips'][0] | null;
  occupied: Set<string>;
}) {
  const today = useMemo(() => new Date(), []);
  const inspection = useMemo(
    () => (trip ? inspectTrip(trip, occupied, today) : null),
    [trip, occupied, today]
  );

  return (
    <Card className="p-5">
      <SectionTitle
        title="Trip Inspector"
        subtitle="Detailed trip analysis"
        action={
          <InfoTooltip
            text="Select a trip from your history to see how many of its days are still being counted in your current 180-day window, and when each day will stop counting."
            label="What is this?"
          />
        }
      />
      {!inspection ? (
        <p className="py-8 text-center text-sm text-slate-400">Select a trip to inspect.</p>
      ) : (
        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-3">
            <NumberStat value={inspection.length} label="Trip length" tone="blue" />
            <NumberStat value={inspection.daysInCurrentWindow} label="Still counting" tone="green" />
            <NumberStat
              value={inspection.length - inspection.daysInCurrentWindow}
              label="Expired"
              tone="neutral"
            />
          </div>
          <div className="rounded-xl bg-slate-100 p-3 text-xs dark:bg-slate-800/60">
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">Entry</span>
              <span className="font-medium text-slate-700 dark:text-slate-300">{fmt(trip!.entryDate)}</span>
            </div>
            <div className="mt-1 flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">Exit</span>
              <span className="font-medium text-slate-700 dark:text-slate-300">{fmt(trip!.exitDate)}</span>
            </div>
          </div>
          <div>
            <p className="mb-2 text-xs font-medium text-slate-500 dark:text-slate-400">
              When each day stops counting
            </p>
            <div className="max-h-40 space-y-1 overflow-y-auto">
              {inspection.dayExpirations.map((e) => (
                <div
                  key={e.date}
                  className="flex items-center justify-between rounded-lg bg-white/50 px-2.5 py-1.5 text-xs dark:bg-slate-900/40"
                >
                  <span className="text-slate-600 dark:text-slate-400">{fmt(e.date)}</span>
                  <span className="text-slate-400">stops counting {fmt(e.expiresFromWindow)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}

// ── When Your Days Return (recovery graph) ──────────────────────────────────

export function RecoveryGraph() {
  const trips = useStore((s) => s.trips);
  const occupied = useMemo(() => expandTripsToDays(trips), [trips]);
  const today = useMemo(() => new Date(), []);

  const data = useMemo(() => {
    const tl = calculateRecoveryTimeline(today, occupied, 365);
    return tl.map((p) => ({
      date: p.date,
      label: format(parseISO(p.date), 'MMM d'),
      remaining: p.remaining,
      gained: p.gained,
    }));
  }, [today, occupied]);

  const todayRemaining = calculateDaysUsed(today, occupied);
  const rem = MAX_DAYS - todayRemaining;

  return (
    <Card className="p-5">
      <SectionTitle
        title="When Your Days Return"
        subtitle="See exactly when new days become available"
        action={
          <InfoTooltip
            text="As each previous travel day falls outside your rolling 180-day window, you regain one available day. This graph shows when that happens over the next year."
            label="What is this graph?"
          />
        }
      />
      {data.length <= 1 ? (
        <p className="py-8 text-center text-sm text-slate-400">
          Add past trips to see when your days return.
        </p>
      ) : (
        <>
          <div className="mb-3 flex items-center gap-2">
            <Pill tone={rem <= 5 ? 'red' : rem <= 15 ? 'yellow' : 'green'}>
              Today: {Math.max(rem, 0)} remaining
            </Pill>
            <span className="text-xs text-slate-400">
              Next +1 day: {data.find((d) => d.gained > 0)?.label ?? 'none soon'}
            </span>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="recoverGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.15} />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.15)" />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 10, fill: 'currentColor' }}
                  className="text-slate-400"
                  interval="preserveStartEnd"
                  minTickGap={30}
                />
                <YAxis
                  domain={[0, MAX_DAYS]}
                  tick={{ fontSize: 10, fill: 'currentColor' }}
                  className="text-slate-400"
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: 6,
                    border: '1px solid rgba(148,163,184,0.2)',
                    background: 'rgba(255,255,255,0.95)',
                    color: '#334155',
                    fontSize: 12,
                  }}
                  labelStyle={{ color: '#94a3b8' }}
                  formatter={((value: number, name: string) =>
                    name === 'remaining' ? [`${value} days`, 'Remaining'] : [`+${value}`, 'Gained']) as never}
                />
                <Area
                  type="stepAfter"
                  dataKey="remaining"
                  stroke="#3b82f6"
                  strokeWidth={1.5}
                  fill="url(#recoverGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </Card>
  );
}

// ── Statistics ───────────────────────────────────────────────────────────────

export function Statistics() {
  const trips = useStore((s) => s.trips);
  const occupied = useMemo(() => expandTripsToDays(trips), [trips]);
  const today = useMemo(() => new Date(), []);
  const stats = useMemo(() => calculateStats(trips, occupied, today), [trips, occupied, today]);

  const items = [
    { label: 'Total Trips', value: stats.totalTrips },
    { label: 'Total Days Ever', value: stats.totalDaysEver },
    { label: 'Longest Trip', value: `${stats.longestTrip}d` },
    { label: 'Average Trip', value: `${stats.averageTrip}d` },
    { label: 'Days Used Now', value: stats.currentDaysUsed },
    { label: 'Days Remaining', value: Math.max(stats.currentRemaining, 0) },
    {
      label: 'Next Day Back',
      value: stats.nextDayRecovered ? format(parseISO(stats.nextDayRecovered), 'MMM d') : '—',
    },
    {
      label: 'Full Reset',
      value: stats.nextFullyReset ? format(parseISO(stats.nextFullyReset), 'MMM d, yyyy') : '—',
    },
  ];

  return (
    <Card className="p-5">
      <SectionTitle
        title="Statistics"
        subtitle="Your travel history at a glance"
        action={
          <InfoTooltip
            text="A summary of your travel patterns. 'Full Reset' is the date when all your previous travel days will have left the 180-day window, giving you a full 90 days again."
            label="What do these mean?"
          />
        }
      />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {items.map((it) => (
          <div key={it.label} className="rounded-md border border-slate-200 p-3 text-center dark:border-slate-800">
            <p className="text-lg font-semibold tabular-nums text-slate-900 dark:text-slate-100">
              {it.value}
            </p>
            <p className="mt-1 text-[10px] uppercase tracking-wide text-slate-500 dark:text-slate-400">
              {it.label}
            </p>
          </div>
        ))}
      </div>
      <div className="mt-4 flex items-start gap-2">
        <InfoTooltip
          text="When all your previous travel days have exited the 180-day window, you get a full 90 days back."
          label="What is a full reset?"
        />
        <Explanation>{explainFullReset(stats.nextFullyReset)}</Explanation>
      </div>
    </Card>
  );
}
