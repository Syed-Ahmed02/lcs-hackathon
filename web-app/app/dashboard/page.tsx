import { SessionCard } from "@/components/dashboard/SessionCard";
import { TabEventsList } from "@/components/dashboard/TabEventsList";
import { SessionHistory } from "@/components/dashboard/SessionHistory";
import { InsightCards } from "@/components/dashboard/InsightCards";

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-xl font-semibold tracking-tight">Overview</h2>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Monitor your focus sessions and tab decisions in real time.
        </p>
      </div>

      <SessionCard />

      <section>
        <h3 className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Last Session Insights
        </h3>
        <InsightCards />
      </section>

      <div className="grid gap-4 md:grid-cols-2">
        <TabEventsList />
        <SessionHistory />
      </div>
    </div>
  );
}
