
import { AlertTriangle } from 'lucide-react';
import { Card } from '@/components/ui';
import { useStore } from '@/store';


export function OverstayBanner() {
  const overstay = useStore((s) => s.overstay);

  if (!overstay) return null;

  const { days, firstOverstayDate } = overstay;

  return (
    <Card className="border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/40">
      <div className="flex items-center gap-3 p-4">
        <AlertTriangle className="h-6 w-6 flex-shrink-0 text-red-500" />
        <div>
          <h3 className="text-sm font-semibold text-red-800 dark:text-red-300">
            Overstay Warning
          </h3>
          <p className="mt-1 text-xs text-red-700 dark:text-red-400">
            You are {days} day{days > 1 ? 's' : ''} over the 90-day limit.
            The first day of overstay was{' '}
            <strong className="font-semibold">{firstOverstayDate}</strong>. You
            must leave the Schengen Area immediately.
          </p>
        </div>
      </div>
    </Card>
  );
}
