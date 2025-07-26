"use client";

import { useState } from "react";
import { DataIngestion } from "@/components/data-ingestion/data-ingestion";
import { IngestedDataList } from "@/components/data-ingestion/ingested-data-list";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Database, Upload, FileText, TrendingUp } from "lucide-react";

export default function DataIngestionPage() {
  const [activeTab, setActiveTab] = useState("upload");
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-slate-900 via-blue-800 to-indigo-700 bg-clip-text text-transparent">
                Data Ingestion
              </h1>
              <p className="text-slate-600 text-lg mt-2">
                Upload, configure, and manage your knowledge base documents and data sources.
              </p>
            </div>
            
            {/* Quick Stats */}
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2 px-4 py-2 bg-white/60 backdrop-blur-sm rounded-lg border border-slate-200">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FileText className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-slate-900">156</div>
                  <div className="text-xs text-slate-600">Documents</div>
                </div>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-white/60 backdrop-blur-sm rounded-lg border border-slate-200">
                <div className="p-2 bg-emerald-100 rounded-lg">
                  <TrendingUp className="h-4 w-4 text-emerald-600" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-slate-900">98%</div>
                  <div className="text-xs text-slate-600">Success Rate</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Professional Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 lg:w-auto lg:grid-cols-none lg:flex bg-white/60 backdrop-blur-sm border border-slate-200 rounded-xl p-1 mb-8">
            <TabsTrigger 
              value="upload" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white transition-all duration-300 flex items-center gap-2 py-3 px-6 text-base font-medium"
            >
              <Upload className="h-5 w-5" />
              Upload & Configure
            </TabsTrigger>
            <TabsTrigger 
              value="ingested" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white transition-all duration-300 flex items-center gap-2 py-3 px-6 text-base font-medium"
            >
              <Database className="h-5 w-5" />
              Ingested Documents
            </TabsTrigger>
          </TabsList>
          
          {/* Tab Content with ScrollArea */}
          <div className="mt-8">
            <TabsContent value="upload" className="space-y-6">
              <ScrollArea className="h-[calc(100vh-280px)] pr-4">
                <DataIngestion />
              </ScrollArea>
            </TabsContent>
            
            <TabsContent value="ingested" className="space-y-6">
              <ScrollArea className="h-[calc(100vh-280px)] pr-4">
                <IngestedDataList />
              </ScrollArea>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}
