import { useMemo, useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import { useTheme } from "@/hooks/useTheme";
import { useStore } from "@/store";
import { Header, Footer } from "@/components/Header";
import { HeroAnswer } from "@/components/HeroAnswer";
import { QuickSummary } from "@/components/QuickSummary";
import { MultiTripPlanner } from "@/components/MultiTripPlanner";
import { TravelHistory, OnboardingBanner } from "@/components/TravelHistory";
import {
  ForecastCalendar,
  DailyBreakdownTable,
} from "@/components/ForecastCalendar";
import {
  TimelineInspector,
  RecoveryGraph,
  Statistics,
} from "@/components/TimelineInspector";
import { ExpandableSection } from "@/components/ui";
import { getDashboardSnapshot } from "@/lib/schengen";

function App() {
  useTheme();
  const trips = useStore((s) => s.trips);
  const today = useMemo(() => new Date(), []);
  const snap = useMemo(
    () => getDashboardSnapshot(trips, today),
    [trips, today],
  );
  const overstay = snap.daysUsed > 90;

  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    setShowOnboarding(trips.length === 0);
  }, [trips.length]);

  return (
    <div className="min-h-screen bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <Header />

      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        {showOnboarding && (
          <div className="mb-6">
            <OnboardingBanner onDismiss={() => setShowOnboarding(false)} />
          </div>
        )}

        {/* Level 1 — Immediate Answer */}
        <section aria-label="Your current status" className="mb-8">
          <HeroAnswer />
        </section>

        {/* Level 2 — Travel History */}
        <section aria-label="Travel history" className="mb-8">
          <TravelHistory />
        </section>

        {/* Level 3 — Quick Summary */}
        <section aria-label="Quick summary" className="mb-8">
          <QuickSummary />
        </section>

        {/* Level 4 — Trip Planner */}
        <section aria-label="Trip planner" className="mb-8">
          <MultiTripPlanner />
        </section>

        {/* Level 5 — Analysis */}
        <section aria-label="Advanced analysis" className="space-y-4">
          <ExpandableSection
            title="Advanced Analysis"
            subtitle="Calendar, recovery graph, breakdown, timeline & statistics"
            defaultOpen={false}
          >
            <div className="space-y-6">
              <ForecastCalendar />
              <RecoveryGraph />
              <TimelineInspector />
              <DailyBreakdownTable />
              <Statistics />
            </div>
          </ExpandableSection>
        </section>

        {/* SEO Content Sections */}
        <Outlet />
      </main>

      <Footer />
    </div>
  );
}

export default App;
