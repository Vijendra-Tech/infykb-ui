"use client";

import { Clock } from "lucide-react";

export default function PeriodicIngestionPage() {
  return (
    <div className="flex flex-col items-center justify-center h-full p-8 space-y-4">
      <div className="flex items-center justify-center p-6 bg-primary/10 rounded-full">
        <Clock className="h-12 w-12 text-primary" />
      </div>
      <h1 className="text-3xl font-bold tracking-tight">Periodic Ingestion</h1>
      <p className="text-muted-foreground text-center max-w-md">
        Schedule automated data ingestion tasks. Set up recurring imports from your data sources to keep your knowledge base up to date.
      </p>
    </div>
  );
}
