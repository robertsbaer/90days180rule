import { useMemo } from 'react';
import { format, parseISO } from 'date-fns';
import { Card, InfoTooltip, Explanation, colorForRemaining, Pill } from '@/components/ui';
import { useStore } from '@/store';
import {
  getDashboardSnapshot,
  explainRemaining,
  explainLatestDeparture,
} from '@/lib/schengen';

function fmtLong(iso: string | null): string {
  if (!iso) return '—';
  try {
    return format(parseISO(iso), 'MMMM d, yyyy');
  } catch {
    return iso;
  }
}

export function HeroAnswer() {
  const trips = useStore((s) => s.trips);
  const today = useMemo(() => new Date(), []);
  const snap = useMemo(() => getDashboardSnapshot(trips, today), [trips, today]);

  const remaining = Math.max(snap.remaining, 0);
  const overstay = snap.daysUsed > 90;

  const mustLeaveBy = snap.inSchengen
    ? snap.currentTrip?.latestLegalDeparture ?? null
    : snap.latestLegalDepartureIfEnterToday;

  return (
    <Card className="p-5 sm:p-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Current Status
          </span>
          {overstay ? (
            <Pill tone="red">Overstay</Pill>
          ) : (
            <Pill tone="green">Legal</Pill>
          )}
        </div>
        <span className="text-xs text-slate-400">{format(today, 'EEEE, MMMM d')}</span>
      </div>

      <div className="mt-4">
        {overstay ? (
          <>
            <p className="text-2xl font-semibold text-red-600 dark:text-red-400 tabular-nums">
              {snap.daysUsed - 90} {snap.daysUsed - 90 === 1 ? 'day' : 'days'} over limit
            </p>
            <p className="mt-1.5 text-sm text-slate-600 dark:text-slate-400">
              You have used <strong>{snap.daysUsed}</strong> of 90 allowed days in the current
              180-day period. Leave the Schengen Area to avoid further penalties.
            </p>
          </>
        ) : (
          <>
            <p className="text-3xl font-semibold text-slate-900 dark:text-slate-100 tabular-nums">
              {remaining} <span className="text-lg font-normal text-slate-500 dark:text-slate-400">{remaining === 1 ? 'day' : 'days'} remaining</span>
            </p>
            <p className="mt-1.5 text-sm text-slate-600 dark:text-slate-400">
              {snap.inSchengen ? 'You may stay until' : 'You may enter and stay until'}{' '}
              <strong className="text-slate-900 dark:text-slate-100">{fmtLong(mustLeaveBy)}</strong>
            </p>
          </>
        )}
      </div>

      <div className="mt-4 border-t border-slate-100 pt-3 dark:border-slate-800">
        <div className="flex items-start gap-1.5">
          <InfoTooltip
            label="What does days remaining mean?"
            text="Every day you spend in the Schengen Area counts toward a maximum of 90 days within any rolling 180-day period. Your entry and exit days both count."
          />
          <Explanation>
            {overstay
              ? 'Each additional day in Schengen increases your overstay, which can result in fines, deportation, or future entry bans.'
              : explainRemaining(snap.remaining)}
          </Explanation>
        </div>
        {!overstay && (
          <div className="mt-2 flex items-start gap-1.5">
            <InfoTooltip
              label="What does latest departure mean?"
              text="If you entered today (or are already inside), this is the last day you can legally remain without exceeding 90 days in the rolling 180-day window."
            />
            <Explanation>{explainLatestDeparture(mustLeaveBy, snap.inSchengen)}</Explanation>
          </div>
        )}
      </div>
    </Card>
  );
}
