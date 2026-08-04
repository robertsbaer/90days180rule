import { useMemo, useState } from 'react';
import { Card, SectionTitle, Button, InfoTooltip } from '@/components/ui';
import { useStore } from '@/store';
import { Plus, Trash2, AlertCircle, CheckCircle } from 'lucide-react';
import { calculatePlanningResult } from '@/lib/schengen';
import { format, isAfter, isBefore, differenceInCalendarDays } from 'date-fns';

const schengenCountries = [
  'Austria', 'Belgium', 'Czech Republic', 'Denmark', 'Estonia', 'Finland', 'France', 'Germany', 'Greece', 'Hungary',
  'Iceland', 'Italy', 'Latvia', 'Liechtenstein', 'Lithuania', 'Luxembourg', 'Malta', 'Netherlands', 'Norway',
  'Poland', 'Portugal', 'Slovakia', 'Slovenia', 'Spain', 'Sweden', 'Switzerland'
];

export function MultiTripPlanner() {
  const plannedTrips = useStore((s) => s.plannedTrips);
  const historicalTrips = useStore((s) => s.trips);
  const addPlannedTrip = useStore((s) => s.addPlannedTrip);
  const updatePlannedTrip = useStore((s) => s.updatePlannedTrip);
  const deletePlannedTrip = useStore((s) => s.deletePlannedTrip);

  // Calculate occupied days from historical trips
  const occupiedDays = useMemo(() => {
    const occupied = new Set<string>();
    historicalTrips.forEach(trip => {
      const start = new Date(trip.entryDate);
      const end = new Date(trip.exitDate);
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        occupied.add(format(d, 'yyyy-MM-dd'));
      }
    });
    return occupied;
  }, [historicalTrips]);

  // Analyze planned trips for compliance
  const plannedTripAnalysis = useMemo(() => {
    return plannedTrips.map(trip => {
      if (!trip.entryDate || !trip.exitDate || !trip.schengen) {
        return { ...trip, legal: null, remainingAfter: null, tripLength: 0 };
      }

      const result = calculatePlanningResult(trip.entryDate, trip.exitDate, occupiedDays);
      return {
        ...trip,
        legal: result.legal,
        remainingAfter: result.remainingAfter,
        tripLength: result.tripLength,
        overstayBegins: result.overstayBegins,
        reduceStayBy: result.reduceStayBy
      };
    });
  }, [plannedTrips, occupiedDays]);

  // Check for overlapping trips
  const overlappingTrips = useMemo(() => {
    const overlaps = new Set<string>();
    for (let i = 0; i < plannedTrips.length; i++) {
      for (let j = i + 1; j < plannedTrips.length; j++) {
        const trip1 = plannedTrips[i];
        const trip2 = plannedTrips[j];
        if (trip1.entryDate && trip1.exitDate && trip2.entryDate && trip2.exitDate) {
          const start1 = new Date(trip1.entryDate);
          const end1 = new Date(trip1.exitDate);
          const start2 = new Date(trip2.entryDate);
          const end2 = new Date(trip2.exitDate);
          
          if ((start1 <= end2 && end1 >= start2)) {
            overlaps.add(trip1.id);
            overlaps.add(trip2.id);
          }
        }
      }
    }
    return overlaps;
  }, [plannedTrips]);

  const handleAddTrip = () => {
    addPlannedTrip({
      id: crypto.randomUUID(),
      country: '',
      schengen: false,
      entryDate: '',
      exitDate: ''
    });
  };

  return (
    <Card className="p-5">
      <SectionTitle
        title="Multi-Trip Planner"
        subtitle="Plan your future travels and check your Schengen compliance over the long term."
      />
      <div>
        {plannedTripAnalysis.map((trip, index) => (
          <div key={trip.id} className={`grid grid-cols-[1fr_1fr_1fr_auto] gap-4 items-end mb-4 p-3 rounded-lg border ${
            overlappingTrips.has(trip.id) ? 'border-red-300 bg-red-50 dark:border-red-800 dark:bg-red-950' :
            trip.legal === true ? 'border-green-300 bg-green-50 dark:border-green-800 dark:bg-green-950' :
            trip.legal === false ? 'border-red-300 bg-red-50 dark:border-red-800 dark:bg-red-950' :
            'border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800'
          }`}>
            <div>
              <label className="text-xs text-slate-500 dark:text-slate-400">Country</label>
              <input
                type="text"
                value={trip.country}
                onChange={(e) => updatePlannedTrip({ ...trip, country: e.target.value, schengen: schengenCountries.includes(e.target.value) })}
                className="w-full rounded-md border border-slate-300 bg-white px-2 py-1 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
              />
              {overlappingTrips.has(trip.id) && (
                <div className="flex items-center gap-1 mt-1 text-xs text-red-600 dark:text-red-400">
                  <AlertCircle size={12} />
                  <span>Overlaps with another trip</span>
                </div>
              )}
            </div>
            <div>
              <label className="text-xs text-slate-500 dark:text-slate-400">Entry Date</label>
              <input
                type="date"
                value={trip.entryDate}
                onChange={(e) => updatePlannedTrip({ ...trip, entryDate: e.target.value })}
                className="w-full rounded-md border border-slate-300 bg-white px-2 py-1 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
              />
            </div>
            <div>
              <label className="text-xs text-slate-500 dark:text-slate-400">Exit Date</label>
              <input
                type="date"
                value={trip.exitDate}
                onChange={(e) => updatePlannedTrip({ ...trip, exitDate: e.target.value })}
                className="w-full rounded-md border border-slate-300 bg-white px-2 py-1 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
              />
              {trip.schengen && trip.legal !== null && (
                <div className={`flex items-center gap-1 mt-1 text-xs ${
                  trip.legal ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                }`}>
                  {trip.legal ? <CheckCircle size={12} /> : <AlertCircle size={12} />}
                  <span>
                    {trip.legal 
                      ? `${trip.remainingAfter} days remaining` 
                      : `Illegal by ${trip.reduceStayBy} days`
                    }
                  </span>
                </div>
              )}
            </div>
            <Button variant="ghost" size="sm" onClick={() => deletePlannedTrip(trip.id)}><Trash2 size={14} /></Button>
          </div>
        ))}
        <Button onClick={handleAddTrip} variant="secondary" size="sm"><Plus size={14} /> Add Trip</Button>
      </div>
      
      {/* Planning Summary */}
      {plannedTrips.length > 0 && (
        <div className="mt-6 p-4 bg-slate-100 dark:bg-slate-800 rounded-lg">
          <h4 className="font-medium text-slate-900 dark:text-slate-100 mb-2">Planning Summary</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-slate-600 dark:text-slate-400">Total Schengen Days:</span>
              <span className="ml-2 font-medium">
                {plannedTripAnalysis
                  .filter(t => t.schengen && t.legal !== null)
                  .reduce((sum, t) => sum + (t.tripLength || 0), 0)
                } days
              </span>
            </div>
            <div>
              <span className="text-slate-600 dark:text-slate-400">Legal Trips:</span>
              <span className="ml-2 font-medium text-green-600 dark:text-green-400">
                {plannedTripAnalysis.filter(t => t.legal === true).length} / {plannedTripAnalysis.filter(t => t.schengen).length}
              </span>
            </div>
            <div>
              <span className="text-slate-600 dark:text-slate-400">Overlaps:</span>
              <span className={`ml-2 font-medium ${overlappingTrips.size > 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                {overlappingTrips.size > 0 ? `${overlappingTrips.size} trips` : 'None'}
              </span>
            </div>
            <div>
              <span className="text-slate-600 dark:text-slate-400">Remaining Days:</span>
              <span className="ml-2 font-medium">
                {Math.min(...plannedTripAnalysis.filter(t => t.schengen && t.remainingAfter !== null).map(t => t.remainingAfter || 90))} days
              </span>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}