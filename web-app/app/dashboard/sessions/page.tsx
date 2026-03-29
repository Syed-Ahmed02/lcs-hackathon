import { SessionsCharts } from "@/components/dashboard/charts/SessionsCharts";

export default function SessionsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-xl font-semibold tracking-tight">Session History</h2>
        <p className="mt-0.5 text-sm text-muted-foreground">
          A visual breakdown of your focus sessions over time.
        </p>
      </div>
      <SessionsCharts />
    </div>
  );
}
