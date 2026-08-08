import { useMemo, useState } from 'react';
import { format, parseISO, eachDayOfInterval, addDays, subDays, isSameMonth, isToday } from 'date-fns';
import { Card, SectionTitle, Pill, InfoTooltip, Explanation } from '@/components/ui';
import { useStore } from '@/store';
import {
  expandTripsToDays,
  calculateAvailabilityForecast,
  calculateDaysUsed,
  calculateRemainingDays,
  getRollingWindow,
  calculateDailyBreakdown,
  statusForRemaining,
  explainCalendarDay,
  MAX_DAYS,
  todayISO,
  toISO,
  toDate,
  type DayBreakdown,
  type Trip,
} from '@/lib/schengen';

function fmt(iso: string) {
  try {
    return format(parseISO(iso), 'MMM d, yyyy');
  } catch {
    return iso;
  }
}

export function ForecastCalendar({ trips }: { trips: Trip[] }) {
  const occupied = useMemo(() => expandTripsToDays(trips), [trips]);
  const today = useMemo(() => new Date(), []);
  const forecast = useMemo(() => calculateAvailabilityForecast(today, occupied), [today, occupied]);
  const [selectedDay, setSelectedDay] = useState<string>(todayISO());
  
  // This is needed for the calendar grid to show planned trips with a different style
  const plannedTrips = useStore((s) => s.plannedTrips);
  const plannedOccupied = useMemo(() => expandTripsToDays(plannedTrips.filter(t => t.schengen)), [plannedTrips]);

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      {/* Availability Forecast */}
      <Card className="p-5">
        <SectionTitle
          title="Upcoming Available Days"
          subtitle="Based on your full itinerary"
        />
        <div className="grid grid-cols-2 gap-3">
          {forecast.map((f) => (
            <div
              key={f.label}
              className="rounded-md border border-slate-200 p-3 dark:border-slate-800"
            >
              <p className="text-xs text-slate-500 dark:text-slate-400">{f.label}</p>
              <p className="mt-0.5 text-[11px] text-slate-400">{fmt(f.date)}</p>
              <p
                className={`mt-2 text-xl font-semibold tabular-nums ${
                  f.daysAvailable <= 0
                    ? 'text-red-600 dark:text-red-400'
                    : f.daysAvailable <= 5
                    ? 'text-amber-600 dark:text-amber-400'
                    : 'text-slate-900 dark:text-slate-100'
                }`}
              >
                {Math.max(f.daysAvailable, 0)}
              </p>
              <p className="text-[10px] text-slate-400">days available</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Calendar */}
      <Card className="p-5">
        <SectionTitle
          title="Calendar"
          subtitle="Day-by-day legality — click any day"
          action={<InfoTooltip text="Each day is colored by how many Schengen days you'd have remaining. Green = safe, yellow = approaching the limit, red = would be an overstay, gray = past. Planned trips are shown with dashed borders." label="How to read this" />}
        />
        <FutureCalendarGrid
          occupied={occupied}
          plannedOccupied={plannedOccupied}
          selectedDay={selectedDay}
          onSelect={setSelectedDay}
          showPlannedTrips={true} // Always show planned trips styling
        />
      </Card>
    </div>
  );
}

function FutureCalendarGrid({
  occupied,
  plannedOccupied,
  selectedDay,
  onSelect,
  showPlannedTrips,
}: {
  occupied: Set<string>;
  plannedOccupied: Set<string>;
  selectedDay: string;
  onSelect: (d: string) => void;
  showPlannedTrips: boolean;
}) {
  const today = useMemo(() => { const d = new Date(); d.setHours(0,0,0,0); return d; }, []);
  const start = useMemo(() => maxOf(today, subDays(today, 3)), [today]);
  const days = useMemo(
    () => eachDayOfInterval({ start, end: addDays(start, 120) }),
    [start]
  );

  const selectedInfo = useMemo(() => {
    const d = toDate(selectedDay);
    const used = calculateDaysUsed(d, occupied);
    const remaining = MAX_DAYS - used;
    const window = getRollingWindow(d);
    return { used, remaining, window };
  }, [selectedDay, occupied]);

  const todayStr = todayISO();

  return (
    <div>
      <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-medium text-slate-400 mb-1">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
          <div key={i}>{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {days.map((d) => {
          const iso = toISO(d);
          const remaining = calculateRemainingDays(d, occupied);
          const isPast = iso < todayStr;
          const status = isPast ? 'past' : statusForRemaining(remaining);
          const isPlanned = plannedOccupied.has(iso);
          const colors: Record<string, string> = {
            safe: 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-950 dark:text-emerald-400',
            approaching: 'bg-amber-100 text-amber-700 hover:bg-amber-200 dark:bg-amber-950 dark:text-amber-400',
            illegal: 'bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-950 dark:text-red-400',
            outside: 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-500',
            past: 'bg-slate-50 text-slate-400 dark:bg-slate-900 dark:text-slate-600',
          };
          const isSelected = iso === selectedDay;
              const klasses = [
                'flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-transparent text-xs',
                colors[status],
              ];
              if (!isSameMonth(d, start)) klasses.push('text-slate-400 dark:text-slate-600');
              if (isToday(d)) klasses.push('font-bold', 'text-blue-600');
              if (isSelected) klasses.push('border-blue-500');
              if (isPlanned && showPlannedTrips) klasses.push('border-dashed', 'border-slate-400');
              if (occupied.has(iso) && !isPlanned) klasses.push('bg-slate-200', 'dark:bg-slate-700');

              return (
                <button
                  key={iso}
                  onClick={() => onSelect(iso)}
                  className={klasses.join(' ')}
                  title={`${iso} · ${Math.max(remaining, 0)} days remaining${isPlanned && showPlannedTrips ? ' · Planned trip' : ''}`}
                >
                  {d.getDate()}
                </button>
              );
        })}
      </div>
      <div className="mt-4 rounded-md border border-slate-200 p-3 dark:border-slate-800">
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-500 dark:text-slate-400">Selected: {fmt(selectedDay)}</span>
          <Pill tone={selectedInfo.remaining >= 0 ? 'green' : 'red'}>
            {Math.max(selectedInfo.remaining, 0)} remaining
          </Pill>
        </div>
        <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
          <div className="flex justify-between border-b border-slate-100 px-1 py-1.5 dark:border-slate-800">
            <span className="text-slate-400">180-day period</span>
            <span className="font-medium text-slate-700 dark:text-slate-300">
              {format(parseISO(selectedInfo.window.start), 'MMM d')} – {format(parseISO(selectedInfo.window.end), 'MMM d')}
            </span>
          </div>
          <div className="flex justify-between border-b border-slate-100 px-1 py-1.5 dark:border-slate-800">
            <span className="text-slate-400">Days counted</span>
            <span className="font-semibold text-slate-900 dark:text-slate-100">{selectedInfo.used}</span>
          </div>
        </div>
        <div className="mt-2 flex items-start gap-1.5">
          <InfoTooltip text="This explanation shows exactly why the selected day has its status, based on the rolling 180-day window." label="Why this status?" />
          <Explanation>{explainCalendarDay(selectedDay, selectedInfo.used, selectedInfo.remaining)}</Explanation>
        </div>
      </div>
    </div>
  );
}

function midnight(d: Date): Date {
  const n = new Date(d);
  n.setHours(0, 0, 0, 0);
  return n;
}
function maxOf(a: Date, b: Date): Date {
  return a > b ? a : b;
}
void midnight;

// ── Daily Breakdown Table ───────────────────────────────────────────────────

export function DailyBreakdownTable({ trips }: { trips: Trip[] }) {
  const occupied = useMemo(() => expandTripsToDays(trips), [trips]);

  const [range, setRange] = useState(30);
  const [sortKey, setSortKey] = useState<'date' | 'daysUsed' | 'remaining' | 'status'>('date');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  
  const today = useMemo(() => new Date(), []);
  const rows = useMemo<DayBreakdown[]>(() => {
    const start = subDays(today, range);
    const end = addDays(today, range);
    return calculateDailyBreakdown(
      toISO(start),
      toISO(end),
      occupied,
      trips
    );
  }, [today, range, occupied, trips]);

  const sorted = useMemo(() => {
    const sortedRows = [...rows];
    sortedRows.sort((a, b) => {
      let cmp = 0;
      if (sortKey === 'date') cmp = a.date.localeCompare(b.date);
      else if (sortKey === 'daysUsed') cmp = a.daysUsed - b.daysUsed;
      else if (sortKey === 'remaining') cmp = a.remaining - b.remaining;
      else cmp = a.status.localeCompare(b.status);
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return sortedRows;
  }, [rows, sortKey, sortDir]);

  const exportCSV = () => {
    const header = 'Date,DaysUsed,Remaining,Status,TripsCounted';
    const lines = sorted.map(
      (r) => `${r.date},${r.daysUsed},${r.remaining},${r.status},${r.tripsCounted}`
    );
    const blob = new Blob([header + '\n' + lines.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'schengen-breakdown.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const toggleSort = (key: typeof sortKey) => {
    if (sortKey === key) setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const statusTone: Record<string, 'green' | 'yellow' | 'red'> = {
    safe: 'green',
    approaching: 'yellow',
    illegal: 'red',
  };

  return (
    <Card className="p-5">
      <SectionTitle
        title="Day-by-Day Breakdown"
        subtitle="Rolling window per day"
        action={
          <div className="flex items-center gap-2">
            <select
              value={range}
              onChange={(e) => setRange(Number(e.target.value))}
              className="rounded-md border border-slate-300 bg-white px-2 py-1 text-xs text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
            >
              <option value={7}>±7 days</option>
              <option value={14}>±14 days</option>
              <option value={30}>±30 days</option>
              <option value={60}>±60 days</option>
              <option value={90}>±90 days</option>
            </select>
            <button
              onClick={exportCSV}
              className="rounded-md border border-slate-300 px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800"
            >
              Export CSV
            </button>
          </div>
        }
      />
      <div className="max-h-80 overflow-y-auto rounded-md border border-slate-200 dark:border-slate-800">
        <table className="w-full text-xs">
          <thead className="sticky top-0 bg-slate-50 dark:bg-slate-800/80">
            <tr className="text-left text-slate-500 dark:text-slate-400">
              {(['date', 'daysUsed', 'remaining', 'status'] as const).map((k) => (
                <th
                  key={k}
                  onClick={() => toggleSort(k)}
                  className="cursor-pointer select-none px-3 py-2 font-medium capitalize hover:text-slate-700 dark:hover:text-slate-200"
                >
                  {k === 'date' ? 'Date' : k === 'daysUsed' ? 'Used' : k === 'remaining' ? 'Left' : 'Status'}
                  {sortKey === k && (sortDir === 'asc' ? ' ↑' : ' ↓')}
                </th>
              ))}
              <th className="px-3 py-2 font-medium">Trips</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((r) => (
              <tr
                key={r.date}
                className="border-t border-slate-100 transition-colors hover:bg-slate-50 dark:border-slate-800/60 dark:hover:bg-slate-800/30"
              >
                <td className="px-3 py-2 text-slate-700 dark:text-slate-300">{fmt(r.date)}</td>
                <td className="px-3 py-2 tabular-nums text-slate-700 dark:text-slate-300">{r.daysUsed}</td>
                <td className="px-3 py-2 tabular-nums font-medium text-slate-900 dark:text-slate-100">
                  {Math.max(r.remaining, 0)}
                </td>
                <td className="px-3 py-2">
                  <Pill tone={statusTone[r.status] || 'neutral'}>{r.status}</Pill>
                </td>
                <td className="px-3 py-2 tabular-nums text-slate-500">{r.tripsCounted}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
