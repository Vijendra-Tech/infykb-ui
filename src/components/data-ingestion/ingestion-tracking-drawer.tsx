"use client";

import { useState, useEffect } from "react";
import { useDataIngestionStore, type IngestionSource } from "@/store/use-data-ingestion-store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatDistanceToNow, format } from "date-fns";
import { CheckCircle, XCircle, AlertCircle, RefreshCw, Clock, FileText, X } from "lucide-react";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";

interface IngestionTrackingDrawerProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  sourceId: string | null;
}

export function IngestionTrackingDrawer({ isOpen, onOpenChange, sourceId }: IngestionTrackingDrawerProps) {
  const { sources, startIngestion, resubmitIngestion, getSourceStats } = useDataIngestionStore();
  const [activeTab, setActiveTab] = useState("overview");
  const [isResubmitting, setIsResubmitting] = useState(false);
  const [resubmitMode, setResubmitMode] = useState<"all" | "selective">("all");
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([]);
  const [showResubmitOptions, setShowResubmitOptions] = useState(false);

  const source = sources.find((s) => s.id === sourceId);
  const stats = sourceId ? getSourceStats(sourceId) : null;
  const sourceStats = source?.ingestStats;

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

  if (!source) return null;

  return (
    <Drawer open={isOpen} onOpenChange={onOpenChange} direction="right">
      <DrawerContent className="h-[100vh] !w-[600px] !max-w-none">
      <div className="w-full">
        <DrawerHeader className="border-b">
          <div className="flex items-center justify-between">
            <DrawerTitle className="text-xl font-semibold">
              {source.name}
              <Badge 
                className={`${
                  source?.status === "Processing" ? "bg-blue-100 text-blue-800" :
                  source?.status === "Completed" ? "bg-green-100 text-green-800" :
                  source?.status === "Failed" ? "bg-red-100 text-red-800" :
                  "bg-gray-100 text-gray-800"
                }`}
              >
                {source?.status}
              </Badge>
            </DrawerTitle>
            <DrawerClose>
              <Button variant="ghost" size="icon">
                <X className="h-4 w-4" />
              </Button>
            </DrawerClose>
          </div>
          <DrawerDescription>
            {source.type} • Added {formatDistanceToNow(new Date(source.createdAt), { addSuffix: true })}
          </DrawerDescription>
        </DrawerHeader>
        
        <div className="p-4 overflow-y-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-5 gap-1">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="documents">Documents</TabsTrigger>
              <TabsTrigger value="logs">Logs</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
              <TabsTrigger value="errors">Errors</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="mt-4">
              <div className="space-y-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Source Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Type</p>
                        <p>{source.type}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Created</p>
                        <p>{format(new Date(source.createdAt), "MMM d, yyyy")}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Status</p>
                        <div className="flex items-center">
                          {source?.status === "Processing" && <RefreshCw className="h-4 w-4 mr-1 text-blue-600 animate-spin" />}
                          {source?.status === "Completed" && <CheckCircle className="h-4 w-4 mr-1 text-green-600" />}
                          {source?.status === "Failed" && <XCircle className="h-4 w-4 mr-1 text-red-600" />}
                          {source?.status === "Ready" && <Clock className="h-4 w-4 mr-1 text-gray-600" />}
                          <span>{source?.status}</span>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Last Updated</p>
                        <p>{source.updatedAt ? format(new Date(source.updatedAt), "MMM d, yyyy HH:mm") : "N/A"}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                {sourceStats && (
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Processing Statistics</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-sm">Overall Progress</span>
                            <span className="text-sm font-medium">
                              {sourceStats.processedDocuments && sourceStats.totalDocuments 
                                ? Math.round((sourceStats.processedDocuments / sourceStats.totalDocuments) * 100)
                                : 0}%
                            </span>
                          </div>
                          <Progress 
                            value={sourceStats.processedDocuments && sourceStats.totalDocuments 
                              ? Math.round((sourceStats.processedDocuments / sourceStats.totalDocuments) * 100)
                              : 0} 
                            className="h-2" 
                          />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">Total Documents</p>
                            <p>{sourceStats.totalDocuments || 0}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">Processed</p>
                            <p>{sourceStats.processedDocuments || 0}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">Successful</p>
                            <p className="text-green-600">{(sourceStats.processedDocuments || 0) - (sourceStats.failedDocuments || 0)}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">Failed</p>
                            <p className="text-red-600">{sourceStats.failedDocuments || 0}</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
                
                {source?.errorDetails?.message && (
                  <Card className="border-red-200 bg-red-50">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-red-800">Error Information</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-red-800">{source.errorDetails.message}</p>
                    </CardContent>
                  </Card>
                )}
                
                {source?.status === "Failed" && source && (
                  <Card className="border-red-200 bg-red-50">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-red-800">Error Information</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-start">
                        <AlertCircle className="h-5 w-5 mr-2 text-red-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium text-red-800">Processing failed</p>
                          <p className="text-sm text-red-700 mt-1">
                            {source.errorDetails?.message || "An error occurred during processing. Some documents may have failed to ingest properly."}
                          </p>
                        </div>
                      </div>
                      
                      {!showResubmitOptions ? (
                        <Button 
                          variant="outline" 
                          className="mt-4 border-red-300 text-red-700 hover:bg-red-100 hover:text-red-800"
                          onClick={toggleResubmitOptions}
                        >
                          Retry Failed Documents
                        </Button>
                      ) : (
                        <div className="mt-4 space-y-3">
                          <div className="flex flex-col space-y-2">
                            <div className="flex items-center space-x-2">
                              <input
                                type="radio"
                                id="resubmit-all"
                                name="resubmit-mode"
                                checked={resubmitMode === "all"}
                                onChange={() => setResubmitMode("all")}
                                className="h-4 w-4 text-red-600"
                              />
                              <label htmlFor="resubmit-all" className="text-sm text-red-700">
                                Retry all failed documents
                              </label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <input
                                type="radio"
                                id="resubmit-selective"
                                name="resubmit-mode"
                                checked={resubmitMode === "selective"}
                                onChange={() => setResubmitMode("selective")}
                                className="h-4 w-4 text-red-600"
                                disabled
                              />
                              <label htmlFor="resubmit-selective" className="text-sm text-red-400">
                                Select specific documents (coming soon)
                              </label>
                            </div>
                          </div>
                          
                          <div className="flex space-x-2">
                            <Button 
                              variant="outline" 
                              className="border-red-300 text-red-700 hover:bg-red-100 hover:text-red-800"
                              onClick={handleResubmit}
                              disabled={isResubmitting}
                            >
                              {isResubmitting ? (
                                <>
                                  <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
                                  Retrying...
                                </>
                              ) : (
                                "Confirm Retry"
                              )}
                            </Button>
                            <Button 
                              variant="ghost" 
                              className="text-red-700 hover:bg-red-100 hover:text-red-800"
                              onClick={toggleResubmitOptions}
                              disabled={isResubmitting}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="documents" className="mt-4">
              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[300px]">Document Name</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Size</TableHead>
                        <TableHead>Processed At</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {/* Mock documents for UI demonstration - replace with actual data when available */}
                      {[{ id: '1', name: 'Document 1.pdf', status: 'Completed', size: '1.2 MB', processedAt: new Date().toISOString() }].length ? (
                        [{ id: '1', name: 'Document 1.pdf', status: 'Completed', size: '1.2 MB', processedAt: new Date().toISOString() }].map((doc: { id: string; name: string; status: string; size: string; processedAt: string }) => (
                          <TableRow key={doc.id}>
                            <TableCell className="font-medium">
                              <div className="flex items-center">
                                <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
                                {doc.name}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge 
                                className={`${
                                  doc.status === "Processing" ? "bg-blue-100 text-blue-800" :
                                  doc.status === "Completed" ? "bg-green-100 text-green-800" :
                                  doc.status === "Failed" ? "bg-red-100 text-red-800" :
                                  "bg-gray-100 text-gray-800"
                                }`}
                              >
                                {doc.status}
                              </Badge>
                            </TableCell>
                            <TableCell>{doc.size}</TableCell>
                            <TableCell>{doc.processedAt ? format(new Date(doc.processedAt), "MMM d, HH:mm") : "—"}</TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center py-4 text-muted-foreground">
                            No documents available
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="logs" className="mt-4">
              <Card>
                <CardContent className="p-0">
                  <div className="bg-black text-white p-4 font-mono text-sm rounded-md h-[400px] overflow-y-auto">
                    {/* Mock logs for UI demonstration - replace with actual data when available */}
                    {[{ timestamp: new Date().toISOString(), level: 'info', message: 'Processing started' }].length ? (
                      [{ timestamp: new Date().toISOString(), level: 'info', message: 'Processing started' }].map((log: { timestamp: string; level: string; message: string }, index: number) => (
                        <div key={index} className="mb-1">
                          <span className="text-gray-400">[{format(new Date(log.timestamp), "HH:mm:ss")}]</span>{" "}
                          <span className={`${
                            log.level === "info" ? "text-blue-400" :
                            log.level === "error" ? "text-red-400" :
                            log.level === "warning" ? "text-yellow-400" :
                            log.level === "success" ? "text-green-400" :
                            "text-gray-400"
                          }`}>
                            {log.level.toUpperCase()}
                          </span>{" "}
                          {log.message}
                        </div>
                      ))
                    ) : (
                      <div className="text-gray-400">No logs available</div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="history" className="mt-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Ingestion History</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date & Time</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Records</TableHead>
                        <TableHead>Duration</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {source.ingestHistory && source.ingestHistory.length > 0 ? (
                        source.ingestHistory.map((entry, index) => (
                          <TableRow key={index}>
                            <TableCell>{format(new Date(entry.timestamp), "MMM d, yyyy HH:mm:ss")}</TableCell>
                            <TableCell>
                              <Badge 
                                className={`${
                                  entry.status === "Processing" ? "bg-blue-100 text-blue-800" :
                                  entry.status === "Completed" ? "bg-green-100 text-green-800" :
                                  entry.status === "Failed" ? "bg-red-100 text-red-800" :
                                  "bg-gray-100 text-gray-800"
                                }`}
                              >
                                {entry.status}
                              </Badge>
                            </TableCell>
                            <TableCell>{entry.recordCount || "—"}</TableCell>
                            <TableCell>
                              {entry.durationMs 
                                ? `${Math.round(entry.durationMs / 1000)}s` 
                                : "—"}
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center py-4 text-muted-foreground">
                            No history available
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="errors" className="mt-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Error Details</CardTitle>
                </CardHeader>
                <CardContent>
                  {source.errorDetails ? (
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Error Message</p>
                        <p className="text-red-600">{source.errorDetails.message || "Unknown error"}</p>
                      </div>
                      {source.errorDetails.code && (
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Error Code</p>
                          <p className="font-mono">{source.errorDetails.code}</p>
                        </div>
                      )}
                      {source.errorDetails.timestamp && (
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Timestamp</p>
                          <p>{format(new Date(source.errorDetails.timestamp), "MMM d, yyyy HH:mm:ss")}</p>
                        </div>
                      )}
                      
                      <div className="mt-6">
                        <p className="text-sm font-medium mb-2">Recent Failed Ingestions</p>
                        <div className="max-h-[200px] overflow-y-auto border rounded-md">
                          {source.ingestHistory && source.ingestHistory
                            .filter(entry => entry.status === "Failed")
                            .map((entry, index) => (
                              <div key={index} className="p-3 border-b last:border-b-0">
                                <div className="flex justify-between items-center mb-1">
                                  <span className="text-sm font-medium">
                                    {format(new Date(entry.timestamp), "MMM d, yyyy HH:mm:ss")}
                                  </span>
                                  {entry.durationMs && (
                                    <span className="text-xs text-muted-foreground">
                                      Duration: {Math.round(entry.durationMs / 1000)}s
                                    </span>
                                  )}
                                </div>
                                {entry.errorMessage && (
                                  <p className="text-sm text-red-600">{entry.errorMessage}</p>
                                )}
                              </div>
                            ))
                          }
                          {!source.ingestHistory || 
                           !source.ingestHistory.some(entry => entry.status === "Failed") ? (
                            <div className="p-3 text-center text-muted-foreground">
                              No failed ingestions found
                            </div>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-6 text-muted-foreground">
                      No errors to display
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
        
        <DrawerFooter className="border-t">
          <div className="flex justify-between">
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)}
            >
              Close
            </Button>
            
            {(source?.status === "Ready" || source?.status === "Failed") && source ? (
              <Button 
                onClick={() => startIngestion(source.id)}
              >
                {source?.status === "Failed" ? "Retry Ingestion" : "Start Ingestion"}
              </Button>
            ) : null}
          </div>
        </DrawerFooter>
      </div>
      </DrawerContent>
    </Drawer>
  );
}
