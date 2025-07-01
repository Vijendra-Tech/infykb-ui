"use client";

import { Database } from "lucide-react";

export default function DataIngestionPage() {
  return (
    <div className="flex flex-col items-center justify-center h-full p-8 space-y-4">
      <div className="flex items-center justify-center p-6 bg-primary/10 rounded-full">
        <Database className="h-12 w-12 text-primary" />
      </div>
      <h1 className="text-3xl font-bold tracking-tight">Data Ingestion</h1>
      <p className="text-muted-foreground text-center max-w-md">
        Upload and manage your knowledge base data sources. Import documents, websites, and other content to train your AI assistant.
      </p>
    </div>
  );
}
