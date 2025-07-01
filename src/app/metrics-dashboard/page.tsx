"use client";

import { BarChart } from "lucide-react";

export default function MetricsDashboardPage() {
  return (
    <div className="flex flex-col items-center justify-center h-full p-8 space-y-4">
      <div className="flex items-center justify-center p-6 bg-primary/10 rounded-full">
        <BarChart className="h-12 w-12 text-primary" />
      </div>
      <h1 className="text-3xl font-bold tracking-tight">Metrics Dashboard</h1>
      <p className="text-muted-foreground text-center max-w-md">
        Monitor system performance, usage statistics, and AI assistant interactions. Track key metrics and generate reports.
      </p>
    </div>
  );
}
