import { useMemo } from 'react';
import { format, parseISO } from 'date-fns';
import { Card, InfoTooltip, Explanation, colorForRemaining } from '@/components/ui';
import { useStore } from '@/store';
import {
  getDashboardSnapshot,
  explainNextRecovery,
  explainWindow,
} from '@/lib/schengen';

function fmtMed(iso: string | null): string {
  if (!iso) return '—';
  try {
    return format(parseISO(iso), 'MMM d, yyyy');
  } catch {
    return iso;
  }
}

export function QuickSummary() {
  const trips = useStore((s) => s.trips);
  const today = useMemo(() => new Date(), []);
  const snap = useMemo(() => getDashboardSnapshot(trips, today), [trips, today]);

  const items = [
    {
      label: 'Days Remaining',
      value: String(Math.max(snap.remaining, 0)),
      sub: `${snap.daysUsed} of 90 used`,
      tone: colorForRemaining(snap.remaining),
      tooltip: 'Days Remaining = 90 minus the number of travel days inside the current 180-day window.',
    },
    {
      label: 'Days Used',
      value: String(snap.daysUsed),
      sub: 'of 90 maximum',
      tone: snap.daysUsed > 90 ? 'text-red-600 dark:text-red-400' : 'text-slate-900 dark:text-slate-100',
      tooltip: 'Every calendar day physically spent inside the Schengen Area counts — including your entry and exit days.',
    },
    {
      label: '180-Day Period',
      value: fmtMed(snap.window.start),
      sub: `through ${fmtMed(snap.window.end)}`,
      tone: 'text-slate-900 dark:text-slate-100',
      tooltip: 'The 180-day window rolls forward each day. The earliest day counted is always 179 days before today.',
    },
    {
      label: 'Next Day Back',
      value: snap.nextDayRecovered ? format(parseISO(snap.nextDayRecovered), 'MMM d') : '—',
      sub: snap.nextDayRecovered ? '+1 available day' : 'none soon',
      tone: 'text-slate-900 dark:text-slate-100',
      tooltip: 'When a previous travel day falls outside the 180-day window, you regain one available day.',
    },
  ];

  return (
    <Card className="p-5">
      <div className="grid grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-4">
        {items.map((item) => (
          <div key={item.label} className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                {item.label}
              </span>
              <InfoTooltip text={item.tooltip} label={`What is ${item.label}?`} />
            </div>
            <span className={`mt-1 text-xl font-semibold tabular-nums ${item.tone}`}>
              {item.value}
            </span>
            <span className="mt-0.5 text-xs text-slate-400">{item.sub}</span>
          </div>
        ))}
      </div>
      <div className="mt-4 border-t border-slate-100 pt-3 dark:border-slate-800">
        <div className="flex items-start gap-1.5">
          <InfoTooltip
            text="This explanation describes what the numbers above mean in plain English."
            label="Summary"
          />
          <Explanation>{explainWindow(snap.window, snap.daysUsed)}</Explanation>
        </div>
        <div className="mt-1.5 flex items-start gap-1.5">
          <InfoTooltip
            text="When a previous travel day leaves the 180-day window, you regain one available day."
            label="Next recovery"
          />
          <Explanation>{explainNextRecovery(snap.nextDayRecovered)}</Explanation>
        </div>
      </div>
    </Card>
  );
}
