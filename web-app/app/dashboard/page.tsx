import { SessionCard } from "@/components/dashboard/SessionCard";
import { TabEventsList } from "@/components/dashboard/TabEventsList";
import { SessionHistory } from "@/components/dashboard/SessionHistory";
import { InsightCards } from "@/components/dashboard/InsightCards";

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-xl font-semibold">Overview</h2>
        <p className="text-muted-foreground mt-0.5 text-sm">
          Monitor your focus sessions and tab decisions in real time.
        </p>
      </div>

      {/* Active session */}
      <SessionCard />

      {/* Insight stats from the latest completed session */}
      <section>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Last Session Insights
        </h3>
        <InsightCards />
      </section>

      {/* Two-column grid for live events + history */}
      <div className="grid gap-4 md:grid-cols-2">
        <TabEventsList />
        <SessionHistory />
      </div>
    </div>
  );
}
