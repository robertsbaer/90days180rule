import { useMemo, useRef, useState } from 'react';
import {
  Plus,
  Pencil,
  Trash2,
  Download,
  Upload,
  FileSpreadsheet,
  Stamp,
  X,
  AlertTriangle,
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { useStore, checkTrip } from '@/store';
import { Button, Pill } from '@/components/ui';
import {
  type Trip,
  tripLength,
  validateTrip,
  parseStamps,
  stampsToTrips,
  todayISO,
} from '@/lib/schengen';

function fmt(iso: string) {
  try {
    return format(parseISO(iso), 'MMM d, yyyy');
  } catch {
    return iso;
  }
}

export function TripList() {
  const trips = useStore((s) => s.trips);
  const addTrip = useStore((s) => s.addTrip);
  const addTrips = useStore((s) => s.addTrips);
  const updateTrip = useStore((s) => s.updateTrip);
  const deleteTrip = useStore((s) => s.deleteTrip);
  const replaceAll = useStore((s) => s.replaceAll);
  const selectedTripId = useStore((s) => s.selectedTripId);
  const setSelectedTrip = useStore((s) => s.setSelectedTrip);

  const [editing, setEditing] = useState<Trip | null>(null);
  const [showStamps, setShowStamps] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const csvInputRef = useRef<HTMLInputElement>(null);

  const sortedTrips = useMemo(
    () => [...trips].sort((a, b) => a.entryDate.localeCompare(b.entryDate)),
    [trips]
  );

  const startNew = () => {
    const t = new Date();
    const t2 = new Date();
    t2.setDate(t2.getDate() + 7);
    setEditing({ id: crypto.randomUUID(), entryDate: todayISO(), exitDate: todayISO() });
    void t;
    void t2;
  };

  const saveTrip = (trip: Trip) => {
    const result = validateTrip(trip, useStore.getState().trips.filter((t) => t.id !== trip.id));
    if (!result.ok) return;
    const exists = useStore.getState().trips.some((t) => t.id === trip.id);
    if (exists) updateTrip(trip);
    else addTrip(trip);
    setEditing(null);
  };

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(trips, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'schengen-trips.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(String(reader.result));
        if (Array.isArray(data)) {
          const valid = data.filter(
            (t) => t && typeof t.entryDate === 'string' && typeof t.exitDate === 'string'
          );
          if (valid.length) {
            addTrips(valid.map((t: Trip) => ({ id: t.id || crypto.randomUUID(), entryDate: t.entryDate, exitDate: t.exitDate })));
          }
        }
      } catch {
        /* ignore malformed */
      }
    };
    reader.readAsText(file);
  };

  const handleCSVFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result);
      const lines = text.split(/\r?\n/).filter(Boolean);
      const imported: Trip[] = [];
      for (const line of lines) {
        const parts = line.split(',').map((p) => p.trim());
        // Accept header row gracefully
        if (/^entry/i.test(parts[0])) continue;
        if (parts.length >= 2 && parts[0] && parts[1]) {
          imported.push({ id: crypto.randomUUID(), entryDate: parts[0], exitDate: parts[1] });
        }
      }
      if (imported.length) addTrips(imported);
    };
    reader.readAsText(file);
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between gap-2 mb-3">
        <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
          Trips
        </h2>
        <Button size="sm" onClick={startNew}>
          <Plus size={14} /> Add Trip
        </Button>
      </div>

      <div className="mb-3 flex flex-wrap gap-1">
        <Button variant="secondary" size="sm" onClick={() => fileInputRef.current?.click()}>
          <Upload size={13} /> JSON
        </Button>
        <Button variant="secondary" size="sm" onClick={() => csvInputRef.current?.click()}>
          <FileSpreadsheet size={13} /> CSV
        </Button>
        <Button variant="secondary" size="sm" onClick={handleExport} disabled={!trips.length}>
          <Download size={13} /> Export
        </Button>
        <Button variant="secondary" size="sm" onClick={() => setShowStamps(true)}>
          <Stamp size={13} /> Stamps
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json,application/json"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && handleImportFile(e.target.files[0])}
        />
        <input
          ref={csvInputRef}
          type="file"
          accept=".csv,text/csv"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && handleCSVFile(e.target.files[0])}
        />
      </div>

      <div className="flex-1 overflow-y-auto -mr-2 pr-2 space-y-2">
          {sortedTrips.length === 0 && (
            <div className="rounded-md border border-dashed border-slate-300 p-6 text-center dark:border-slate-700">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                No trips yet. Add your first Schengen trip to begin calculating.
              </p>
            </div>
          )}
          {sortedTrips.map((trip) => {
            const isSelected = trip.id === selectedTripId;
            const len = tripLength(trip);
            return (
              <div
                key={trip.id}
                onClick={() => setSelectedTrip(isSelected ? null : trip.id)}
                className={`group cursor-pointer rounded-md border px-3 py-2.5 transition-colors ${
                  isSelected
                    ? 'border-slate-400 bg-slate-50 dark:border-slate-600 dark:bg-slate-800/50'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/30'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                        {fmt(trip.entryDate)}
                      </span>
                      <span className="text-slate-400">&rarr;</span>
                      <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                        {fmt(trip.exitDate)}
                      </span>
                    </div>
                    <div className="mt-1 flex items-center gap-2">
                      <Pill tone="neutral">{len} day{len > 1 ? 's' : ''}</Pill>
                    </div>
                  </div>
                  <div className="flex shrink-0 gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
                    <button
                      onClick={(e) => { e.stopPropagation(); setEditing(trip); }}
                      className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                      aria-label="Edit trip"
                    >
                      <Pencil size={13} />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); deleteTrip(trip.id); }}
                      className="rounded p-1 text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30"
                      aria-label="Delete trip"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
      </div>

      {editing && (
        <TripEditor
          trip={editing}
          onClose={() => setEditing(null)}
          onSave={saveTrip}
        />
      )}
      {showStamps && (
        <StampModal
          onClose={() => setShowStamps(false)}
          onImport={(newTrips) => { addTrips(newTrips); setShowStamps(false); }}
        />
      )}
    </div>
  );
}

function TripEditor({
  trip,
  onClose,
  onSave,
}: {
  trip: Trip;
  onClose: () => void;
  onSave: (t: Trip) => void;
}) {
  const [draft, setDraft] = useState<Trip>(trip);
  const result = checkTrip(draft);
  const len = tripLength(draft);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-900/40"
        onClick={onClose}
      />
      <div
        className="relative z-10 w-full max-w-md rounded-lg border border-slate-200 bg-white p-5 shadow-lg dark:border-slate-800 dark:bg-slate-900"
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            {trip.entryDate ? 'Edit Trip' : 'Add Trip'}
          </h3>
          <button onClick={onClose} className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800">
            <X size={16} />
          </button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-400">
              Entry Date
            </label>
            <input
              type="date"
              value={draft.entryDate}
              onChange={(e) => setDraft({ ...draft, entryDate: e.target.value })}
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 transition-colors focus:border-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-400">
              Exit Date
            </label>
            <input
              type="date"
              value={draft.exitDate}
              onChange={(e) => setDraft({ ...draft, exitDate: e.target.value })}
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 transition-colors focus:border-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            />
          </div>
          <div className="flex items-center justify-between rounded-md border border-slate-200 px-3 py-2 dark:border-slate-800">
            <span className="text-xs text-slate-500 dark:text-slate-400">Trip length</span>
            <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">{len} days</span>
          </div>
          {!result.ok && (
            <div className="flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-300">
              <AlertTriangle size={14} className="mt-0.5 shrink-0" />
              <span>{result.errors[0]}</span>
            </div>
          )}
          <div className="flex gap-2 pt-2">
            <Button variant="secondary" className="flex-1" onClick={onClose}>
              Cancel
            </Button>
            <Button className="flex-1" onClick={() => onSave(draft)} disabled={!result.ok}>
              Save Trip
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function StampModal({
  onClose,
  onImport,
}: {
  onClose: () => void;
  onImport: (trips: Trip[]) => void;
}) {
  const [text, setText] = useState('+01.01.24\n-15.01.24\n+10.03.24\n-20.04.24');
  const stamps = useMemo(() => parseStamps(text), [text]);
  const trips = useMemo(() => stampsToTrips(stamps), [stamps]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-900/40"
        onClick={onClose}
      />
      <div
        className="relative z-10 w-full max-w-lg rounded-lg border border-slate-200 bg-white p-5 shadow-lg dark:border-slate-800 dark:bg-slate-900"
      >
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              Passport Stamp Mode
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Use EC style: <code className="font-mono">+DDMMYY</code> for entry,{' '}
              <code className="font-mono">-DDMMYY</code> for exit.
            </p>
          </div>
          <button onClick={onClose} className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800">
            <X size={16} />
          </button>
        </div>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={8}
          className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 font-mono text-sm text-slate-900 transition-colors focus:border-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          aria-label="Passport stamps input"
        />
        <div className="mt-3 rounded-md border border-slate-200 p-3 dark:border-slate-800">
          <p className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-2">
            Detected {stamps.length} stamps · {trips.length} trips
          </p>
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {trips.map((t, i) => (
              <div key={t.id} className="flex items-center justify-between text-xs text-slate-700 dark:text-slate-300">
                <span>{i + 1}. {fmt(t.entryDate)} → {fmt(t.exitDate)}</span>
                <Pill tone="neutral">{tripLength(t)}d</Pill>
              </div>
            ))}
            {trips.length === 0 && (
              <p className="text-xs text-slate-400">No valid trips detected.</p>
            )}
          </div>
        </div>
        <div className="mt-4 flex gap-2">
          <Button variant="secondary" className="flex-1" onClick={onClose}>
            Cancel
          </Button>
          <Button className="flex-1" onClick={() => onImport(trips)} disabled={!trips.length}>
            Import {trips.length} Trip{trips.length !== 1 ? 's' : ''}
          </Button>
        </div>
      </div>
    </div>
  );
}
