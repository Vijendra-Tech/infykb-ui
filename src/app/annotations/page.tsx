"use client";

import { FileText } from "lucide-react";

export default function AnnotationsPage() {
  return (
    <div className="flex flex-col items-center justify-center h-full p-8 space-y-4">
      <div className="flex items-center justify-center p-6 bg-primary/10 rounded-full">
        <FileText className="h-12 w-12 text-primary" />
      </div>
      <h1 className="text-3xl font-bold tracking-tight">Annotations</h1>
      <p className="text-muted-foreground text-center max-w-md">
        Review and manage document annotations. Add metadata, tags, and custom labels to improve AI understanding of your content.
      </p>
    </div>
  );
}
