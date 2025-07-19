"use client";

import { useState } from "react";
import { DataIngestion } from "@/components/data-ingestion/data-ingestion";
import { IngestedDataList } from "@/components/data-ingestion/ingested-data-list";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Database, Upload } from "lucide-react";

export default function DataIngestionPage() {
  const [activeTab, setActiveTab] = useState("upload");
  
  return (
    <div className="w-full min-h-screen pt-20 pb-10 px-6 md:px-10 lg:px-12 max-h-[calc(100vh-200px)] overflow-auto">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full mx-auto">
        <TabsList className="mb-8 w-full flex justify-center gap-2 p-1 bg-muted/30 rounded-lg shadow-sm">
          <TabsTrigger value="upload" className="flex items-center gap-2 py-3 px-6 text-base font-medium transition-all">
            <Upload className="h-5 w-5" />
            Upload & Configure
          </TabsTrigger>
          <TabsTrigger value="ingested" className="flex items-center gap-2 py-3 px-6 text-base font-medium transition-all">
            <Database className="h-5 w-5" />
            Ingested Documents
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="upload" className="mt-4">
          <DataIngestion />
        </TabsContent>
        
        <TabsContent value="ingested" className="mt-4">
          <IngestedDataList />
        </TabsContent>
      </Tabs>
    </div>
  );
}
