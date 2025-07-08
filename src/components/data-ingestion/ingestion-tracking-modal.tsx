"use client";

import { useState, useEffect } from "react";
import { useDataIngestionStore, type IngestionSource } from "@/store/use-data-ingestion-store";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatDistanceToNow, format } from "date-fns";
import { CheckCircle, XCircle, AlertCircle, RefreshCw, Clock, FileText } from "lucide-react";

interface IngestionTrackingModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  sourceId: string | null;
}

export function IngestionTrackingModal({ isOpen, onOpenChange, sourceId }: IngestionTrackingModalProps) {
  const { sources, startIngestion, resubmitIngestion, getSourceStats } = useDataIngestionStore();
  const [activeTab, setActiveTab] = useState("overview");
  const [isResubmitting, setIsResubmitting] = useState(false);
  const [resubmitMode, setResubmitMode] = useState<"all" | "selective">("all");
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([]);
  const [showResubmitOptions, setShowResubmitOptions] = useState(false);

  const source = sources.find((s) => s.id === sourceId);
  const stats = sourceId ? getSourceStats(sourceId) : null;

  const handleResubmit = () => {
    if (!sourceId) return;
    
    setIsResubmitting(true);
    
    // Simulate API call with a timeout
    setTimeout(() => {
      // Currently only supporting "all" mode
      // In the future, selective mode will pass the selectedDocuments array
      resubmitIngestion(sourceId, resubmitMode === "selective" ? selectedDocuments : undefined);
      startIngestion(sourceId);
      setIsResubmitting(false);
      setShowResubmitOptions(false);
    }, 1000);
  };
  
  const toggleResubmitOptions = () => {
    setShowResubmitOptions(!showResubmitOptions);
  };

  // Reset tab when modal opens with a new source
  useEffect(() => {
    if (isOpen) {
      setActiveTab("overview");
    }
  }, [isOpen, sourceId]);

  if (!source) return null;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Completed":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "Failed":
        return <XCircle className="h-5 w-5 text-red-500" />;
      case "Processing":
        return <RefreshCw className="h-5 w-5 text-yellow-500 animate-spin" />;
      default:
        return <Clock className="h-5 w-5 text-blue-500" />;
    }
  };

  const formatDuration = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    
    if (minutes === 0) {
      return `${seconds} seconds`;
    }
    
    return `${minutes}m ${remainingSeconds}s`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span>Ingestion Tracking: {source.name}</span>
            <Badge variant="outline" className={
              source.status === "Completed" ? "bg-green-50 text-green-600 border-green-200" :
              source.status === "Failed" ? "bg-red-50 text-red-600 border-red-200" :
              source.status === "Processing" ? "bg-yellow-50 text-yellow-600 border-yellow-200" :
              "bg-blue-50 text-blue-600 border-blue-200"
            }>
              {source.status}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
            <TabsTrigger value="errors">Errors</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Latest Ingestion</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">Status</span>
                      <div className="flex items-center gap-1">
                        {getStatusIcon(source.status)}
                        <span className="font-medium">{source.status}</span>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">Last Ingested</span>
                      <span className="font-medium">
                        {source.lastIngested 
                          ? formatDistanceToNow(new Date(source.lastIngested), { addSuffix: true }) 
                          : "Never"}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">Record Count</span>
                      <span className="font-medium">{source.recordCount ?? "-"}</span>
                    </div>
                    
                    {source.ingestStats?.durationMs && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">Duration</span>
                        <span className="font-medium">{formatDuration(source.ingestStats.durationMs)}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Statistics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {stats ? (
                      <>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-500">Total Ingestions</span>
                          <span className="font-medium">{stats.totalIngestions}</span>
                        </div>
                        
                        <div className="space-y-1">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-500">Success Rate</span>
                            <span className="font-medium">{stats.successRate.toFixed(1)}%</span>
                          </div>
                          <Progress value={stats.successRate} className="h-2" />
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-500">Average Duration</span>
                          <span className="font-medium">{formatDuration(stats.averageDuration)}</span>
                        </div>
                      </>
                    ) : (
                      <div className="flex items-center justify-center h-24 text-gray-400">
                        No statistics available
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {source.ingestStats && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Processing Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {source.ingestStats.totalDocuments !== undefined && (
                      <div className="space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-500">Documents Processed</span>
                          <span className="font-medium">
                            {source.ingestStats.processedDocuments ?? 0} / {source.ingestStats.totalDocuments}
                          </span>
                        </div>
                        <Progress 
                          value={source.ingestStats.totalDocuments > 0 
                            ? ((source.ingestStats.processedDocuments ?? 0) / source.ingestStats.totalDocuments) * 100 
                            : 0} 
                          className="h-2" 
                        />
                      </div>
                    )}
                    
                    {source.ingestStats.failedDocuments !== undefined && source.ingestStats.failedDocuments > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">Failed Documents</span>
                        <span className="font-medium text-red-500">{source.ingestStats.failedDocuments}</span>
                      </div>
                    )}
                    
                    {source.status === "Failed" && (
                      <div className="mt-4 space-y-3">
                        {!showResubmitOptions ? (
                          <Button 
                            onClick={toggleResubmitOptions}
                            className="w-full"
                          >
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Resubmit Options
                          </Button>
                        ) : (
                          <div className="space-y-3 border border-gray-200 rounded-md p-3">
                            <div className="flex justify-between items-center">
                              <h4 className="text-sm font-medium">Resubmit Options</h4>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={toggleResubmitOptions}
                                className="h-8 w-8 p-0"
                              >
                                <XCircle className="h-4 w-4" />
                              </Button>
                            </div>
                            
                            <div className="flex flex-col space-y-2">
                              <div className="flex items-center space-x-2">
                                <input
                                  type="radio"
                                  id="resubmit-all"
                                  name="resubmit-mode"
                                  checked={resubmitMode === "all"}
                                  onChange={() => setResubmitMode("all")}
                                  className="h-4 w-4 text-primary"
                                />
                                <label htmlFor="resubmit-all" className="text-sm">
                                  Resubmit All Documents
                                </label>
                              </div>
                              
                              <div className="flex items-center space-x-2">
                                <input
                                  type="radio"
                                  id="resubmit-selective"
                                  name="resubmit-mode"
                                  checked={resubmitMode === "selective"}
                                  onChange={() => setResubmitMode("selective")}
                                  disabled={true} // Disabled for now, will be enabled in future
                                  className="h-4 w-4 text-primary"
                                />
                                <label htmlFor="resubmit-selective" className="text-sm text-gray-500">
                                  Selective Resubmission <span className="text-xs">(Coming soon)</span>
                                </label>
                              </div>
                            </div>
                            
                            {resubmitMode === "selective" && (
                              <div className="bg-gray-50 p-2 rounded text-xs text-gray-500">
                                Selective document resubmission will be available in a future update.
                                This feature will allow you to choose specific failed documents to reprocess.
                              </div>
                            )}
                            
                            <Button 
                              onClick={handleResubmit}
                              disabled={isResubmitting}
                              className="w-full mt-2"
                            >
                              {isResubmitting ? (
                                <>
                                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                  Resubmitting...
                                </>
                              ) : (
                                <>
                                  <RefreshCw className="h-4 w-4 mr-2" />
                                  {resubmitMode === "all" ? "Resubmit All" : "Resubmit Selected"}
                                </>
                              )}
                            </Button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          <TabsContent value="history">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Ingestion History</CardTitle>
              </CardHeader>
              <CardContent>
                {source.ingestHistory && source.ingestHistory.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Records</TableHead>
                        <TableHead>Duration</TableHead>
                        <TableHead>Error</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {[...source.ingestHistory].reverse().map((entry, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            <div className="font-medium">{format(new Date(entry.timestamp), 'MMM d, yyyy')}</div>
                            <div className="text-xs text-gray-500">{format(new Date(entry.timestamp), 'h:mm a')}</div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              {getStatusIcon(entry.status)}
                              <span>{entry.status}</span>
                            </div>
                          </TableCell>
                          <TableCell>{entry.recordCount ?? "-"}</TableCell>
                          <TableCell>{entry.durationMs ? formatDuration(entry.durationMs) : "-"}</TableCell>
                          <TableCell className="max-w-[200px] truncate">
                            {entry.errorMessage ? (
                              <span className="text-red-500" title={entry.errorMessage}>
                                {entry.errorMessage}
                              </span>
                            ) : "-"}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-gray-400">
                    <FileText className="h-10 w-10 mb-2" />
                    <p>No history available</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="errors">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Error Details</CardTitle>
              </CardHeader>
              <CardContent>
                {source.errorDetails?.message ? (
                  <div className="space-y-4">
                    <div className="bg-red-50 border border-red-200 rounded-md p-4">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
                        <div>
                          <h4 className="font-medium text-red-700">Error occurred during ingestion</h4>
                          <p className="mt-1 text-red-600">{source.errorDetails.message}</p>
                          {source.errorDetails.code && (
                            <p className="mt-2 text-sm text-red-500">Error code: {source.errorDetails.code}</p>
                          )}
                          <p className="mt-2 text-xs text-gray-500">
                            {source.errorDetails.timestamp && 
                              format(new Date(source.errorDetails.timestamp), 'MMM d, yyyy h:mm a')}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col space-y-4">
                      {!showResubmitOptions ? (
                        <div className="flex justify-end">
                          <Button 
                            onClick={toggleResubmitOptions}
                          >
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Resubmit Options
                          </Button>
                        </div>
                      ) : (
                        <div className="border border-gray-200 rounded-md p-4 space-y-3">
                          <div className="flex justify-between items-center">
                            <h4 className="text-sm font-medium">Resubmit Options</h4>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={toggleResubmitOptions}
                              className="h-8 w-8 p-0"
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </div>
                          
                          <div className="flex flex-col space-y-2">
                            <div className="flex items-center space-x-2">
                              <input
                                type="radio"
                                id="resubmit-all-error"
                                name="resubmit-mode-error"
                                checked={resubmitMode === "all"}
                                onChange={() => setResubmitMode("all")}
                                className="h-4 w-4 text-primary"
                              />
                              <label htmlFor="resubmit-all-error" className="text-sm">
                                Resubmit All Documents
                              </label>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              <input
                                type="radio"
                                id="resubmit-selective-error"
                                name="resubmit-mode-error"
                                checked={resubmitMode === "selective"}
                                onChange={() => setResubmitMode("selective")}
                                disabled={true} // Disabled for now, will be enabled in future
                                className="h-4 w-4 text-primary"
                              />
                              <label htmlFor="resubmit-selective-error" className="text-sm text-gray-500">
                                Selective Resubmission <span className="text-xs">(Coming soon)</span>
                              </label>
                            </div>
                          </div>
                          
                          {resubmitMode === "selective" && (
                            <div className="bg-gray-50 p-2 rounded text-xs text-gray-500">
                              Selective document resubmission will be available in a future update.
                              This feature will allow you to choose specific failed documents to reprocess.
                            </div>
                          )}
                          
                          <div className="flex justify-end mt-2">
                            <Button 
                              onClick={handleResubmit}
                              disabled={isResubmitting}
                            >
                              {isResubmitting ? (
                                <>
                                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                  Resubmitting...
                                </>
                              ) : (
                                <>
                                  <RefreshCw className="h-4 w-4 mr-2" />
                                  {resubmitMode === "all" ? "Resubmit All" : "Resubmit Selected"}
                                </>
                              )}
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-gray-400">
                    <CheckCircle className="h-10 w-10 mb-2 text-green-500" />
                    <p>No errors reported</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
