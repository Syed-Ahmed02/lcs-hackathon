import { InsightsCharts } from "@/components/dashboard/charts/InsightsCharts";

export default function InsightsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-xl font-semibold tracking-tight">Insights</h2>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Trends in your focus habits, distraction rate, and tab activity.
        </p>
      </div>
      <InsightsCharts />
    </div>
  );
}
