import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  mergeTrips,
  type Trip,
  type ValidationResult,
  validateTrip,
  tripsOverlapOrTouch,
} from '@/lib/schengen';

export type Theme = 'light' | 'dark';

export interface Overstay {
  days: number;
  firstOverstayDate: string;
}

export interface PlannedTrip {
  id: string;
  country: string;
  schengen: boolean;
  entryDate: string;
  exitDate: string;
}

interface UndoEntry {
  trips: Trip[];
}

interface SchengenState {
  trips: Trip[];
  plannedTrips: PlannedTrip[];
  theme: Theme;
  selectedTripId: string | null;
  overstay: Overstay | null;
  // history
  past: UndoEntry[];
  future: UndoEntry[];

  addTrip: (trip: Trip) => void;
  addTrips: (trips: Trip[]) => void;
  updateTrip: (trip: Trip) => void;
  deleteTrip: (id: string) => void;
  replaceAll: (trips: Trip[]) => void;
  clearAll: () => void;
  setSelectedTrip: (id: string | null) => void;
  setOverstay: (overstay: Overstay | null) => void;

  addPlannedTrip: (trip: PlannedTrip) => void;
  updatePlannedTrip: (trip: PlannedTrip) => void;
  deletePlannedTrip: (id: string) => void;

  toggleTheme: () => void;
  setTheme: (t: Theme) => void;

  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
}

function commit(state: SchengenState, trips: Trip[]): Partial<SchengenState> {
  const merged = mergeTrips(trips);
  return {
    trips: merged,
    past: [...state.past, { trips: state.trips }].slice(-50),
    future: [],
  };
}

export const useStore = create<SchengenState>()(
  persist(
    (set, get) => ({
      trips: [],
      plannedTrips: [],
      theme: 'light',
      selectedTripId: null,
      overstay: null,
      past: [],
      future: [],

      addTrip: (trip) => set((s) => commit(s, [...s.trips, trip])),
      addTrips: (newTrips) => set((s) => commit(s, [...s.trips, ...newTrips])),
      updateTrip: (trip) =>
        set((s) => commit(s, s.trips.map((t) => (t.id === trip.id ? trip : t)))),
      deleteTrip: (id) => set((s) => commit(s, s.trips.filter((t) => t.id !== id))),
      replaceAll: (trips) => set((s) => commit(s, trips)),
      clearAll: () => set((s) => commit(s, [])),
      setSelectedTrip: (id) => set({ selectedTripId: id }),
      setOverstay: (overstay) => set({ overstay }),

      addPlannedTrip: (trip) =>
        set((s) => ({ plannedTrips: [...s.plannedTrips, trip] })),
      updatePlannedTrip: (trip) =>
        set((s) => ({
          plannedTrips: s.plannedTrips.map((t) =>
            t.id === trip.id ? trip : t
          ),
        })),
      deletePlannedTrip: (id) =>
        set((s) => ({
          plannedTrips: s.plannedTrips.filter((t) => t.id !== id),
        })),

      toggleTheme: () =>
        set((s) => ({ theme: s.theme === 'dark' ? 'light' : 'dark' })),
      setTheme: (t) => set({ theme: t }),

      undo: () =>
        set((s) => {
          if (s.past.length === 0) return {};
          const prev = s.past[s.past.length - 1];
          return {
            trips: prev.trips,
            past: s.past.slice(0, -1),
            future: [{ trips: s.trips }, ...s.future].slice(0, 50),
          };
        }),
      redo: () =>
        set((s) => {
          if (s.future.length === 0) return {};
          const next = s.future[0];
          return {
            trips: next.trips,
            past: [...s.past, { trips: s.trips }].slice(-50),
            future: s.future.slice(1),
          };
        }),
      canUndo: () => get().past.length > 0,
      canRedo: () => get().future.length > 0,
    }),
    {
      name: 'schengen-calculator',
      partialize: (s) => ({ trips: s.trips, theme: s.theme, plannedTrips: s.plannedTrips }),
    }
  )
);

export function checkTrip(trip: Trip): ValidationResult {
  const others = useStore.getState().trips;
  return validateTrip(trip, others);
}

export function wouldOverlap(trip: Trip): boolean {
  return useStore.getState().trips.some((t) => t.id !== trip.id && tripsOverlapOrTouch(t, trip));
}

