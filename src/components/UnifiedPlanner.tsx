import { useMemo, useState } from 'react';
import { format, parseISO } from 'date-fns';
import {
  Check,
  X,
  AlertTriangle,
} from 'lucide-react';
import { Card, SectionTitle, Pill, InfoTooltip, Explanation } from '@/components/ui';
import { useStore } from '@/store';
import {
  expandTripsToDays,
  calculatePlanningResult,
  calculateEarliestReturn,
  calculateLatestLegalDeparture,
  calculateRemainingDays,
  todayISO,
  toDate,
  toISO,
  explainEarliestReturn,
  explainLatestDeparture,
  MAX_DAYS,
} from '@/lib/schengen';

function fmt(iso: string | null): string {
  if (!iso) return '—';
  try {
    return format(parseISO(iso), 'MMM d, yyyy');
  } catch {
    return iso;
  }
}

function shiftISO(iso: string, days: number): string {
  const d = toDate(iso);
  d.setDate(d.getDate() + days);
  return toISO(d);
}

type Tab = 'future' | 'return' | 'simulator' | 'maxstay';

const TABS: { id: Tab; label: string }[] = [
  { id: 'future', label: 'Future Trip' },
  { id: 'return', label: 'Earliest Return' },
  { id: 'simulator', label: 'Stay Simulator' },
  { id: 'maxstay', label: 'Max Legal Stay' },
];

export function UnifiedPlanner() {
  const trips = useStore((s) => s.trips);
  const occupied = useMemo(() => expandTripsToDays(trips), [trips]);
  const [tab, setTab] = useState<Tab>('future');

  return (
    <Card className="p-5">
      <SectionTitle
        title="Future Trip Planner"
        subtitle="Test scenarios and see results instantly"
      />

      <div className="mb-5 flex gap-1 border-b border-slate-200 dark:border-slate-800">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`-mb-px border-b-2 px-3 py-2 text-xs font-medium transition-colors ${
              tab === t.id
                ? 'border-slate-900 text-slate-900 dark:border-slate-100 dark:text-slate-100'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'future' && <FutureTrip occupied={occupied} />}
      {tab === 'return' && <EarliestReturn occupied={occupied} />}
      {tab === 'simulator' && <StaySimulator occupied={occupied} />}
      {tab === 'maxstay' && <MaxLegalStay occupied={occupied} />}
    </Card>
  );
}

const inputClass =
  'w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 transition-colors focus:border-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100';

function DateInput({
  label,
  value,
  onChange,
  tooltip,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  tooltip?: string;
}) {
  return (
    <div>
      <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-400">
        {label}
        {tooltip && <InfoTooltip text={tooltip} />}
      </label>
      <input type="date" value={value} onChange={(e) => onChange(e.target.value)} className={inputClass} />
    </div>
  );
}

function ResultRow({ legal, children }: { legal: boolean; children: React.ReactNode }) {
  return (
    <div
      className={`flex items-center gap-2.5 rounded-md border px-3.5 py-2.5 ${
        legal
          ? 'border-emerald-200 bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-950/30'
          : 'border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/30'
      }`}
    >
      {legal ? (
        <Check size={16} className="shrink-0 text-emerald-600 dark:text-emerald-400" />
      ) : (
        <X size={16} className="shrink-0 text-red-600 dark:text-red-400" />
      )}
      <div>{children}</div>
    </div>
  );
}

function MetaRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between border-b border-slate-100 py-2 last:border-0 dark:border-slate-800">
      <span className="text-xs text-slate-500 dark:text-slate-400">{label}</span>
      <span className="text-sm font-medium text-slate-900 dark:text-slate-100 tabular-nums">{value}</span>
    </div>
  );
}

function FutureTrip({ occupied }: { occupied: Set<string> }) {
  const today = todayISO();
  const [entry, setEntry] = useState(today);
  const [exit, setExit] = useState(() => shiftISO(today, 30));

  const result = useMemo(
    () => calculatePlanningResult(entry, exit, occupied),
    [entry, exit, occupied]
  );

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <DateInput
          label="Planned Entry"
          value={entry}
          onChange={setEntry}
          tooltip="The day you plan to enter the Schengen Area. This day counts toward your 90-day limit."
        />
        <DateInput
          label="Planned Exit"
          value={exit}
          onChange={setExit}
          tooltip="The day you plan to leave. This day also counts toward your 90-day limit."
        />
      </div>
      <div className="rounded-md border border-slate-200 px-3.5 py-1 dark:border-slate-800">
        <MetaRow label="Trip length" value={`${result.tripLength} days`} />
      </div>
      <ResultRow legal={result.legal}>
        <p
          className={`text-sm font-semibold ${
            result.legal ? 'text-emerald-700 dark:text-emerald-400' : 'text-red-700 dark:text-red-400'
          }`}
        >
          {result.legal ? 'This trip is legal' : 'This trip would be an overstay'}
        </p>
        <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
          {result.legal
            ? `${result.remainingAfter} days remaining after this trip`
            : `Overstay begins ${fmt(result.overstayBegins)}`}
        </p>
      </ResultRow>
      {!result.legal && (
        <div className="flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-300">
          <AlertTriangle size={14} className="mt-0.5 shrink-0" />
          <span>
            Reduce your stay by <strong>{result.reduceStayBy}</strong> day{result.reduceStayBy! > 1 ? 's' : ''} to
            stay legal — depart by {fmt(result.overstayBegins ? shiftISO(result.overstayBegins, -1) : null)}.
          </span>
        </div>
      )}
      <div className="flex items-start gap-1.5">
        <InfoTooltip
          label="How is this calculated?"
          text="We add your planned trip to your existing travel history and check every day of the trip against the 180-day rolling window. If any day would exceed 90 days, the trip is illegal."
        />
        <Explanation>
          {result.legal
            ? `After this trip, you will have used ${result.daysUsedAfter} of your 90 allowed days in the rolling window ending on your exit date.`
            : `On ${fmt(result.overstayBegins)} your rolling window would contain more than 90 travel days. You must leave earlier.`}
        </Explanation>
      </div>
    </div>
  );
}

function EarliestReturn({ occupied }: { occupied: Set<string> }) {
  const today = todayISO();
  const [leaving, setLeaving] = useState(today);
  const [desired, setDesired] = useState(30);

  const result = useMemo(
    () => calculateEarliestReturn(leaving, desired, occupied),
    [leaving, desired, occupied]
  );

  return (
    <div className="space-y-4">
      <DateInput
        label="Leaving Date"
        value={leaving}
        onChange={setLeaving}
        tooltip="The day you plan to exit the Schengen Area. We search for the earliest day you can return after this."
      />
      <div>
        <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-400">
          Desired Future Stay
          <InfoTooltip text="How many days you want to spend on your next visit. We find the earliest entry date that allows this full stay legally." />
        </label>
        <div className="flex gap-1.5">
          {[30, 45, 60, 90].map((d) => (
            <button
              key={d}
              onClick={() => setDesired(d)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                desired === d
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                  : 'border border-slate-300 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800'
              }`}
            >
              {d}d
            </button>
          ))}
        </div>
      </div>
      <div className="rounded-md border border-slate-200 p-3.5 dark:border-slate-800">
        <p className="text-xs text-slate-500 dark:text-slate-400">Earliest possible return</p>
        <p className="mt-1 text-lg font-semibold text-slate-900 dark:text-slate-100">
          {fmt(result.earliestReturn)}
        </p>
      </div>
      <div className="flex items-start gap-1.5">
        <InfoTooltip
          label="Why this date?"
          text="Previous travel days must expire out of your 180-day window before the requested stay becomes legal. This date is the first day that happens."
        />
        <Explanation>{explainEarliestReturn(result)}</Explanation>
      </div>
    </div>
  );
}

function StaySimulator({ occupied }: { occupied: Set<string> }) {
  const today = todayISO();
  const [stay, setStay] = useState(30);
  const departure = useMemo(() => shiftISO(today, stay - 1), [today, stay]);
  const remainingAfter = useMemo(() => {
    const planned = new Set(occupied);
    for (let i = 0; i < stay; i++) {
      const d = new Date(toDate(today));
      d.setDate(d.getDate() + i);
      planned.add(toISO(d));
    }
    return calculateRemainingDays(departure, planned);
  }, [today, stay, occupied, departure]);

  return (
    <div className="space-y-4">
      <div>
        <div className="mb-2 flex items-center justify-between">
          <label className="flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-400">
            If I enter today and stay…
            <InfoTooltip text="Drag the slider to see how a stay of this length affects your remaining days. We calculate as if you entered today and stayed this many days." />
          </label>
          <span className="text-sm font-semibold text-slate-900 dark:text-slate-100 tabular-nums">
            {stay} days
          </span>
        </div>
        <input
          type="range"
          min={1}
          max={MAX_DAYS}
          value={stay}
          onChange={(e) => setStay(Number(e.target.value))}
          className="w-full accent-slate-900 dark:accent-white"
          aria-label="Stay length in days"
        />
      </div>
      <div className="rounded-md border border-slate-200 px-3.5 py-1 dark:border-slate-800">
        <MetaRow label="Departure date" value={fmt(departure)} />
        <MetaRow
          label="Legal?"
          value={
            <Pill tone={remainingAfter >= 0 ? 'green' : 'red'}>
              {remainingAfter >= 0 ? 'Yes' : 'No'}
            </Pill>
          }
        />
        <MetaRow
          label="Remaining after trip"
          value={
            <span
              className={
                remainingAfter < 0
                  ? 'text-red-600 dark:text-red-400'
                  : remainingAfter <= 5
                  ? 'text-amber-600 dark:text-amber-400'
                  : 'text-emerald-600 dark:text-emerald-400'
              }
            >
              {Math.max(remainingAfter, 0)}
            </span>
          }
        />
      </div>
      {remainingAfter < 0 && (
        <div className="flex items-start gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-800 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300">
          <AlertTriangle size={14} className="mt-0.5 shrink-0" />
          <span>
            A {stay}-day stay from today would exceed the 90-day limit. Reduce to{' '}
            <strong>{stay + remainingAfter}</strong> days.
          </span>
        </div>
      )}
      <div className="flex items-start gap-1.5">
        <InfoTooltip
          label="How is this calculated?"
          text="We simulate adding this stay to your history and check the rolling window on your departure date."
        />
        <Explanation>
          {remainingAfter >= 0
            ? `After a ${stay}-day stay starting today, you would have ${Math.max(remainingAfter, 0)} days remaining.`
            : `A ${stay}-day stay would put you over the limit. The maximum legal stay from today is ${stay + remainingAfter} days.`}
        </Explanation>
      </div>
    </div>
  );
}

function MaxLegalStay({ occupied }: { occupied: Set<string> }) {
  const [entry, setEntry] = useState(todayISO());
  const latest = useMemo(
    () => calculateLatestLegalDeparture(entry, occupied),
    [entry, occupied]
  );
  const maxStay = latest
    ? Math.round((toDate(latest).getTime() - toDate(entry).getTime()) / 86400000) + 1
    : 0;

  return (
    <div className="space-y-4">
      <DateInput
        label="Entry Date"
        value={entry}
        onChange={setEntry}
        tooltip="The day you enter (or plan to enter) the Schengen Area. We calculate the maximum legal stay from this date."
      />
      <div className="rounded-md border border-slate-200 p-3.5 dark:border-slate-800">
        <p className="text-xs text-slate-500 dark:text-slate-400">Latest legal departure</p>
        <p className="mt-1 text-lg font-semibold text-slate-900 dark:text-slate-100">{fmt(latest)}</p>
        <p className="mt-1 text-xs text-slate-400">Maximum stay: {maxStay} days</p>
      </div>
      <div className="flex items-start gap-1.5">
        <InfoTooltip
          label="What does this mean?"
          text="This is the last day you can legally remain in Schengen if you enter on the chosen date, given your existing travel history."
        />
        <Explanation>{explainLatestDeparture(latest, false)}</Explanation>
      </div>
    </div>
  );
}
