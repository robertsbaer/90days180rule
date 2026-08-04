import { useEffect, useMemo, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { Card } from '@/components/ui';
import { useStore } from '@/store';
import { TripList } from '@/components/TripList';
import { UnifiedTimeline } from '@/components/TimelineInspector';
import {
  expandTripsToDays,
  calculateDailyBreakdown,
  todayISO,
} from '@/lib/schengen';
import { OverstayBanner } from './OverstayBanner';

export function TravelHistory() {
  const trips = useStore((s) => s.trips);
  const setOverstay = useStore((s) => s.setOverstay);
  const occupied = useMemo(() => expandTripsToDays(trips), [trips]);
  const [open, setOpen] = useState(true);

  useEffect(() => {
    if (trips.length === 0) {
      setOverstay(null);
      return;
    }
    const today = todayISO();
    const firstTripEntry = trips.map((t) => t.entryDate).sort()[0];
    const lastTripExit = trips.map((t) => t.exitDate).sort().pop();
    const breakdown = calculateDailyBreakdown(
      firstTripEntry,
      lastTripExit || today,
      occupied,
      trips
    );
    const illegalDays = breakdown.filter((d) => d.status === 'illegal');
    if (illegalDays.length > 0) {
      const firstOverstay = illegalDays[0];
      setOverstay({
        days: -firstOverstay.remaining,
        firstOverstayDate: firstOverstay.date,
      });
    } else {
      setOverstay(null);
    }
  }, [trips, occupied, setOverstay]);

  return (
    <Card>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50"
        aria-expanded={open}
      >
        <div>
          <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            Travel History
          </h2>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            {trips.length} trip{trips.length !== 1 ? 's' : ''} · {occupied.size} days
            total
          </p>
        </div>
        <ChevronDown
          size={16}
          className={`text-slate-400 transition-transform duration-150 ${
            open ? 'rotate-180' : ''
          }`}
        />
      </button>

      {open && (
        <div className="border-t border-slate-200 p-4 dark:border-slate-800">
          <OverstayBanner />
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-[320px_1fr]">
            <div className="lg:max-h-[600px]">
              <TripList />
            </div>
            <div className="lg:max-h-[600px]">
              <UnifiedTimeline trips={trips} occupied={occupied} />
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}

export function OnboardingBanner({ onDismiss }: { onDismiss: () => void }) {
  return (
    <Card className="p-4">
      <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
        Welcome to your Schengen day tracker
      </h3>
      <p className="mt-1.5 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
        Every day you spend in the Schengen Area counts toward a maximum of{' '}
        <strong className="text-slate-700 dark:text-slate-300">90 days</strong> within any rolling{' '}
        <strong className="text-slate-700 dark:text-slate-300">180-day period</strong>. Add your
        previous trips in Travel History below and we'll calculate exactly how many days you have
        left, when you have to leave, and when you can return.
      </p>
      <button
        onClick={onDismiss}
        className="mt-3 text-xs font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
      >
        Got it →
      </button>
    </Card>
  );
}
