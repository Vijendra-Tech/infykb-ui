"use client";

import { useState, useCallback } from "react";
import { IngestionTrackingDrawer } from "./ingestion-tracking-drawer";
import { GitHubSourceDrawer } from "./github-source-drawer";
import { AddSourceDrawer } from "./add-source-drawer";
import { EditSourceDrawer } from "./edit-source-drawer";
import { useDataIngestionStore, type IngestionSourceType, type IngestionSource } from "@/store/use-data-ingestion-store";
import { githubService } from "@/services/github-service";
import { githubDataService } from "@/services/github-data-service";
import { traceApiCall, traceHttpCall } from "@/lib/browser-telemetry";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Upload, Database, Globe, RefreshCw, Play, X, Plus, FileText, Link, Pencil, UploadCloud, CheckCircle, Github, Building2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { formatDistanceToNow } from "date-fns";

export function DataIngestion() {
  // Access the data ingestion store
  const { sources, addSource, editSource, startIngestion, completeIngestion, failIngestion, deleteSource } = useDataIngestionStore();
  const [trackingSourceId, setTrackingSourceId] = useState<string | null>(null);
  const [isTrackingModalOpen, setIsTrackingModalOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingSource, setEditingSource] = useState<IngestionSource | null>(null);
  const [newSourceName, setNewSourceName] = useState("");
  const [newSourceType, setNewSourceType] = useState<IngestionSourceType>("File Upload");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [sourceUrl, setSourceUrl] = useState("");
  const [sourceUsername, setSourceUsername] = useState("");
  const [sourcePassword, setSourcePassword] = useState("");
  const [editSourceName, setEditSourceName] = useState("");
  const [editSourceType, setEditSourceType] = useState<IngestionSourceType>("File Upload");
  const [editSourceUrl, setEditSourceUrl] = useState("");
  const [editSourceUsername, setEditSourceUsername] = useState("");
  const [editSourcePassword, setEditSourcePassword] = useState("");
  const [nameError, setNameError] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [urlError, setUrlError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isGitHubDrawerOpen, setIsGitHubDrawerOpen] = useState(false);

  const resetForm = () => {
    setNewSourceName("");
    setNewSourceType("File Upload");
    setSourceUrl("");
    setSourceUsername("");
    setSourcePassword("");
    setSelectedFile(null);
    setNameError(null);
    setFileError(null);
    setUrlError(null);
    setIsSubmitting(false);
    setIsDragging(false);
  };
  
  // Handle drag and drop events
  const handleDragEnter = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) {
      setIsDragging(true);
    }
  }, [isDragging]);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      setSelectedFile(file);
      setFileError(null);
    }
  }, []);

  const handleAddSource = () => {
    // Validate form
    if (!newSourceName.trim()) {
      setNameError("Source name is required");
      return;
    }

    if (["JIRA", "Salesforce", "API Endpoint", "Database"].includes(newSourceType) && !sourceUrl) {
      setUrlError("URL is required for this source type");
      return;
    }

    // File validation for File Upload type
    if (newSourceType === "File Upload") {
      if (!selectedFile) {
        setFileError("Please select a file to upload");
        return;
      }
      
      // Check file size (max 50MB)
      const maxSize = 50 * 1024 * 1024; // 50MB in bytes
      if (selectedFile.size > maxSize) {
        setFileError(`File size exceeds the maximum limit of 50MB. Your file is ${(selectedFile.size / (1024 * 1024)).toFixed(2)}MB`);
        return;
      }
      
      // Check file type for unsupported formats
      const unsupportedTypes = [".exe", ".dll", ".bat", ".sh"];
      const fileName = selectedFile.name.toLowerCase();
      if (unsupportedTypes.some(ext => fileName.endsWith(ext))) {
        setFileError(`File type not supported. Please upload a document file.`);
        return;
      }
    }

    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      try {
        // Simulate random failure for file uploads (20% chance)
        if (newSourceType === "File Upload" && Math.random() < 0.2) {
          throw new Error("File format validation failed. The file appears to be corrupted or in an unsupported format.");
        }
        
        // Create the source object
        const sourceData = {
          name: newSourceName.trim(),
          type: newSourceType,
          ...(sourceUrl ? { url: sourceUrl } : {}),
          ...(sourceUsername ? { username: sourceUsername } : {}),
          ...(sourcePassword ? { password: sourcePassword } : {}),
        };
        
        // Add the source and get the generated ID
        const newSourceId = addSource(sourceData);
        
        // If it's a file upload and we have a file, simulate starting the ingestion automatically
        if (newSourceType === "File Upload" && selectedFile) {
          startIngestion(newSourceId);
          
          // Simulate processing
          setTimeout(() => {
            // 80% chance of success
            if (Math.random() > 0.2) {
              const recordCount = Math.floor(Math.random() * 1000) + 100;
              completeIngestion(newSourceId, recordCount, {
                totalDocuments: recordCount,
                processedDocuments: recordCount - Math.floor(Math.random() * 5),
                failedDocuments: Math.floor(Math.random() * 5)
              });
            } else {
              // Specific file upload failure cases
              const errorCases = [
                { message: "Invalid document structure. The file contains malformed content.", code: "DOC_STRUCTURE_ERROR" },
                { message: "Unsupported encoding detected. Please ensure the file uses UTF-8 encoding.", code: "ENCODING_ERROR" },
                { message: "Document parsing failed. The file may be password-protected or encrypted.", code: "PARSING_ERROR" },
                { message: "File contains no extractable text content.", code: "NO_CONTENT_ERROR" }
              ];
              
              const randomError = errorCases[Math.floor(Math.random() * errorCases.length)];
              failIngestion(newSourceId, randomError.message, randomError.code);
            }
          }, 3000);
        }

        // Close dialog and reset form
        handleDialogChange(false);
        setIsSubmitting(false);
      } catch (error) {
        setError(error instanceof Error ? error.message : "Failed to add source. Please try again.");
        setIsSubmitting(false);
      }
    }, 1000);
  };
  
  const handleDialogChange = (open: boolean) => {
    setIsAddDialogOpen(open);
    if (!open) resetForm();
  };
  
  const handleEditDialogChange = (open: boolean) => {
    setIsEditDialogOpen(open);
    if (!open) {
      setEditingSource(null);
      setEditSourceName("");
      setEditSourceType("File Upload");
      setEditSourceUrl("");
      setEditSourceUsername("");
      setEditSourcePassword("");
      setNameError(null);
      setUrlError(null);
    }
  };
  
  const handleEditSource = (source: IngestionSource) => {
    setEditingSource(source);
    setEditSourceName(source.name);
    setEditSourceType(source.type);
    setEditSourceUrl(source.url || "");
    setEditSourceUsername(source.username || "");
    setEditSourcePassword(""); // Don't populate password for security
    setIsEditDialogOpen(true);
  };
  
  const handleUpdateSource = () => {
    // Validate form
    if (!editSourceName.trim()) {
      setNameError("Source name is required");
      return;
    }

    if (["JIRA", "Salesforce", "API Endpoint", "Database"].includes(editSourceType) && !editSourceUrl) {
      setUrlError("URL is required for this source type");
      return;
    }

    if (!editingSource) return;
    
    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      try {
        editSource(editingSource.id, {
          name: editSourceName.trim(),
          type: editSourceType,
          ...(editSourceUrl ? { url: editSourceUrl } : {}),
          ...(editSourceUsername ? { username: editSourceUsername } : {}),
          ...(editSourcePassword ? { password: editSourcePassword } : {}),
        });

        // Close dialog and reset form
        handleEditDialogChange(false);
        setIsSubmitting(false);
      } catch (error) {
        setError("Failed to update source. Please try again.");
        setIsSubmitting(false);
      }
    }, 1000);
  };

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setFileError(null);
    }
  };
  
  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sources.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(sources.length / itemsPerPage);
  
  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };
  
  const [processingSourceId, setProcessingSourceId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleStartIngestion = async (id: string) => {
    setProcessingSourceId(id);
    setError(null);
    startIngestion(id);
    
    try {
      const source = sources.find(s => s.id === id);
      if (!source) {
        throw new Error('Source not found');
      }

      if (source.type === 'GitHub') {
        // Handle GitHub ingestion
        await handleGitHubIngestion(id, source);
      } else {
        // Handle other source types with simulation
        await handleGenericIngestion(id);
      }
    } catch (err) {
      console.error('Ingestion error:', err);
      setError("An error occurred during ingestion. Please try again.");
      failIngestion(id, err instanceof Error ? err.message : "Unexpected error during processing", "SYSTEM_ERROR");
      setProcessingSourceId(null);
    }
  };

  const handleGitHubIngestion = async (id: string, source: IngestionSource) => {
    return await traceApiCall(
      `GitHub Data Ingestion - ${source.name}`,
      async () => {
        try {
          if (!source.url) {
            throw new Error('GitHub repository URL is required');
          }

          // Extract GitHub settings from source
          const githubSettings = {
            repository: source.url,
            accessToken: source.password, // Access token stored in password field
            syncIssues: true, // Default to true, could be stored in source metadata
            syncPRs: true,
            syncDiscussions: false
          };

          console.log('Starting GitHub ingestion for:', githubSettings.repository);
          
          // Fetch GitHub data with API tracing
          const result = await traceHttpCall(
            'GitHub API Data Fetch',
            async () => await githubService.ingestGitHubData(githubSettings),
            {
              method: 'GET',
              url: `https://api.github.com/repos/${githubSettings.repository.replace('https://github.com/', '')}`,
              metadata: {
                sourceId: id,
                sourceName: source.name,
                repository: githubSettings.repository,
                syncOptions: {
                  issues: githubSettings.syncIssues,
                  pullRequests: githubSettings.syncPRs,
                  discussions: githubSettings.syncDiscussions
                },
                hasAccessToken: !!githubSettings.accessToken
              },
              tags: {
                operation: 'data-ingestion',
                source: 'github',
                component: 'github-service'
              }
            }
          );
          
          console.log('GitHub ingestion result:', result);
      
      if (result.errors.length > 0) {
        console.warn('GitHub ingestion completed with errors:', result.errors);
      }
      
      const totalRecords = result.totalCount;
      const processedDocs = result.issues.length + result.pullRequests.length + result.discussions.length;
      
      console.log(`GitHub ingestion completed: ${totalRecords} total records, ${processedDocs} processed, ${result.errors.length} errors`);
      console.log('Fetched data:', {
        issues: result.issues.length,
        pullRequests: result.pullRequests.length,
        discussions: result.discussions.length
      });
            if (totalRecords > 0) {
            // Store the fetched GitHub data in Dexie database with API tracing
            console.log('Storing GitHub data in database...');
            const storageResult = await traceApiCall(
              'GitHub Data Storage - Dexie',
              async () => await githubDataService.storeGitHubData(result, {
                sourceId: id,
                organizationId: 'default-org', // TODO: Get from user context
                projectId: undefined, // TODO: Get from user context if available
                repository: githubSettings.repository
              }),
              {
                metadata: {
                  sourceId: id,
                  sourceName: source.name,
                  repository: githubSettings.repository,
                  recordCounts: {
                    issues: result.issues.length,
                    pullRequests: result.pullRequests.length,
                    discussions: result.discussions.length,
                    total: totalRecords
                  }
                },
                tags: {
                  operation: 'data-storage',
                  database: 'dexie',
                  component: 'github-data-service'
                }
              }
            );
            
            console.log('GitHub data storage result:', storageResult);
        
        // Check if storage had any errors
        if (storageResult.errors.length > 0) {
          console.warn('Some data storage errors occurred:', storageResult.errors);
          // Still complete ingestion but log warnings
        }
        
        const storedRecords = storageResult.storedIssues + storageResult.storedPullRequests + storageResult.storedDiscussions;
        console.log(`Successfully stored ${storedRecords} GitHub records in database`);
        
        completeIngestion(id, totalRecords, {
          totalDocuments: totalRecords,
          processedDocuments: storedRecords,
          failedDocuments: totalRecords - storedRecords
        });
      } else if (result.errors.length > 0) {
        failIngestion(id, result.errors.join('; '), "GITHUB_API_ERROR");
      } else {
        completeIngestion(id, 0, {
          totalDocuments: 0,
          processedDocuments: 0,
          failedDocuments: 0
        });
      }
      
      setProcessingSourceId(null);
        } catch (error) {
          console.error('GitHub ingestion failed:', error);
          failIngestion(id, error instanceof Error ? error.message : "GitHub ingestion failed", "GITHUB_ERROR");
          setProcessingSourceId(null);
          throw error; // Re-throw to be caught by traceApiCall
        }
      },
      {
        metadata: {
          sourceId: id,
          sourceName: source.name,
          sourceType: source.type,
          repository: source.url
        },
        tags: {
          operation: 'data-ingestion',
          source: 'github',
          component: 'data-ingestion'
        }
      }
    );
  };

  const handleGenericIngestion = async (id: string) => {
    const source = sources.find(s => s.id === id);
    const sourceName = source?.name || 'Unknown Source';
    const sourceType = source?.type || 'Unknown';
    
    return await traceApiCall(
      `Generic Data Ingestion - ${sourceName}`,
      async () => {
        // Simulate ingestion for non-GitHub sources with API tracing
        return new Promise<void>((resolve, reject) => {
          setTimeout(async () => {
            try {
              // Randomly succeed or fail (80% success rate)
              const isSuccess = Math.random() > 0.2;
              
              if (isSuccess) {
                const recordCount = Math.floor(Math.random() * 1000) + 100;
                const processedDocs = recordCount - Math.floor(Math.random() * 10);
                const failedDocs = recordCount - processedDocs;
                
                // Trace the data processing operation
                await traceApiCall(
                  `Data Processing - ${sourceName}`,
                  async () => {
                    // Simulate data processing
                    await new Promise(resolve => setTimeout(resolve, 500));
                    return {
                      totalDocuments: recordCount,
                      processedDocuments: processedDocs,
                      failedDocuments: failedDocs
                    };
                  },
                  {
                    metadata: {
                      sourceId: id,
                      sourceName,
                      sourceType,
                      recordCounts: {
                        total: recordCount,
                        processed: processedDocs,
                        failed: failedDocs
                      }
                    },
                    tags: {
                      operation: 'data-processing',
                      source: sourceType.toLowerCase(),
                      component: 'generic-processor'
                    }
                  }
                );
                
                completeIngestion(id, recordCount, {
                  totalDocuments: recordCount,
                  processedDocuments: processedDocs,
                  failedDocuments: failedDocs
                });
              } else {
                const error = "Failed to process some documents due to formatting issues";
                failIngestion(id, error, "FORMAT_ERROR");
                reject(new Error(error));
                return;
              }
              
              setProcessingSourceId(null);
              resolve();
            } catch (err) {
              const error = "Unexpected error during processing";
              failIngestion(id, error, "SYSTEM_ERROR");
              setProcessingSourceId(null);
              reject(new Error(error));
            }
          }, 3000);
        });
      },
      {
        metadata: {
          sourceId: id,
          sourceName,
          sourceType,
          isSimulated: true
        },
        tags: {
          operation: 'data-ingestion',
          source: sourceType.toLowerCase(),
          component: 'data-ingestion'
        }
      }
    );
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Ready":
        return <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200">Ready</Badge>;
      case "Processing":
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-600 border-yellow-200">Processing</Badge>;
      case "Completed":
        return <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">Completed</Badge>;
      case "Failed":
        return <Badge variant="outline" className="bg-red-50 text-red-600 border-red-200">Failed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getTypeIcon = (type: IngestionSourceType) => {
    switch (type) {
      case "File Upload":
        return <Upload className="h-4 w-4 text-slate-600 dark:text-slate-400" />;
      case "API Endpoint":
        return <Globe className="h-4 w-4 text-slate-600 dark:text-slate-400" />;
      case "Database":
        return <Database className="h-4 w-4 text-slate-600 dark:text-slate-400" />;
      case "JIRA":
        return <Globe className="h-4 w-4 text-slate-600 dark:text-slate-400" />;

      case "Salesforce":
        return <Building2 className="h-4 w-4 text-slate-600 dark:text-slate-400" />;
      default:
        return null;
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-gradient-to-br from-slate-50 to-blue-50/30">
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <p className="text-sm font-medium text-red-800">{error}</p>
            </div>
            <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700 transition-colors">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col min-h-0" style={{ overflowY: 'auto' }}>
        <Card className="flex-1 border-0 shadow-lg bg-card/80 backdrop-blur-sm flex flex-col">
          <CardHeader className="pb-6 border-b border-border flex-shrink-0">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
              <div className="space-y-2">
                <CardTitle className="text-2xl">
                  Data Ingestion
                </CardTitle>
                <p className="text-muted-foreground text-lg leading-relaxed max-w-2xl">
                  Seamlessly manage your knowledge base data sources and streamline content ingestion workflows
                </p>
              </div>
              <Button 
                onClick={() => setIsAddDialogOpen(true)}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5"
              >
                <Plus className="h-5 w-5" />
                Add New Source
              </Button>

        <EditSourceDrawer 
          isOpen={isEditDialogOpen}
          onClose={() => handleEditDialogChange(false)}
          source={editingSource}
        />
          </div>
        </CardHeader>
          <CardContent className="p-6 flex flex-col h-full">
            {/* Main Content Area with Fixed Height */}
            <div className="flex flex-col h-full">
              {/* Table Container - Scrollable */}
              <div className="rounded-xl border border-border bg-card shadow-sm flex-1 overflow-hidden">
                <div className="h-full overflow-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-track]:bg-muted [&::-webkit-scrollbar-thumb]:bg-muted-foreground/30 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:hover:bg-muted-foreground/50">
              <Table>
                <TableHeader className="sticky top-0 z-10">
                  <TableRow className="bg-muted/50 border-b border-border">
                    <TableHead className="font-semibold text-foreground p-4 text-sm uppercase tracking-wide">Name</TableHead>
                    <TableHead className="font-semibold text-foreground text-sm uppercase tracking-wide">Type</TableHead>
                    <TableHead className="font-semibold text-foreground text-sm uppercase tracking-wide">Status</TableHead>
                    <TableHead className="font-semibold text-foreground text-sm uppercase tracking-wide">Connection</TableHead>
                    <TableHead className="font-semibold text-foreground text-sm uppercase tracking-wide">Last Ingested</TableHead>
                    <TableHead className="font-semibold text-foreground text-right text-sm uppercase tracking-wide">Records</TableHead>
                    <TableHead className="font-semibold text-foreground text-right text-sm uppercase tracking-wide">Actions</TableHead>
                  </TableRow>
                </TableHeader>
              <TableBody>
                {sources.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-16">
                      <div className="flex flex-col items-center justify-center space-y-6">
                        <div className="relative">
                          <div className="rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 p-8 shadow-lg">
                            <Database className="h-16 w-16 text-primary" />
                          </div>
                          <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center">
                            <Plus className="h-3 w-3 text-primary-foreground" />
                          </div>
                        </div>
                        <div className="space-y-3 max-w-md mx-auto">
                          <h3 className="text-2xl font-bold text-foreground">Start Building Your Knowledge Base</h3>
                          <p className="text-muted-foreground leading-relaxed">
                            Connect your data sources to create a comprehensive knowledge base.
                            Upload documents, integrate APIs, or connect databases to get started.
                          </p>
                        </div>
                        <Button 
                          onClick={() => setIsAddDialogOpen(true)} 
                          className="mt-4 flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5"
                        >
                          <Plus className="h-5 w-5" />
                          Add Your First Source
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
              ) : (
                  currentItems.map((source, index) => (
                    <TableRow key={source.id} className="bg-card hover:bg-muted/50 transition-colors duration-150 border-b border-border last:border-b-0">
                      <TableCell className="font-semibold p-4 text-foreground">{source.name}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-muted">
                            {getTypeIcon(source.type)}
                          </div>
                          <span className="font-medium text-foreground">{source.type}</span>
                        </div>
                      </TableCell>
                      <TableCell className="p-4">{getStatusBadge(source.status)}</TableCell>
                      <TableCell>
                        {["JIRA", "Salesforce", "API Endpoint", "Database"].includes(source.type) && source.url ? (
                          <div className="text-sm space-y-1">
                            <div className="flex items-center gap-2 truncate max-w-[200px]" title={source.url}>
                              <div className="p-1 rounded bg-primary/20">
                                <Link className="h-3 w-3 text-primary" />
                              </div>
                              <span className="truncate font-mono text-muted-foreground">{source.url}</span>
                            </div>
                            {source.username && (
                              <div className="text-muted-foreground text-xs pl-6">
                                User: <span className="font-medium">{source.username}</span>
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-400 font-medium">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className={`text-sm font-medium ${
                          source.lastIngested ? 'text-slate-600' : 'text-slate-400'
                        }`}>
                          {source.lastIngested 
                            ? formatDistanceToNow(new Date(source.lastIngested), { addSuffix: true }) 
                            : "Never"}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className={`text-sm font-semibold ${
                          source.recordCount ? 'text-slate-800' : 'text-slate-400'
                        }`}>
                          {source.recordCount ? source.recordCount.toLocaleString() : "—"}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="h-9 px-3 text-slate-600 border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-all duration-150"
                            onClick={() => {
                              setTrackingSourceId(source.id);
                              setIsTrackingModalOpen(true);
                            }}
                          >
                            <FileText className="h-4 w-4 mr-2" />
                            Details
                          </Button>
                        
                          {source.status === "Ready" || source.status === "Completed" || source.status === "Failed" ? (
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className={`h-9 px-3 transition-all duration-150 ${
                                processingSourceId === source.id 
                                  ? "bg-blue-50 border-blue-200 text-blue-700" 
                                  : source.status === "Failed" 
                                    ? "text-orange-600 border-orange-200 hover:bg-orange-50" 
                                    : "text-blue-600 border-blue-200 hover:bg-blue-50"
                              }`}
                              onClick={() => handleStartIngestion(source.id)}
                              disabled={processingSourceId !== null}
                            >
                              {processingSourceId === source.id ? (
                                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                              ) : source.status === "Completed" ? (
                                <RefreshCw className="h-4 w-4 mr-2" />
                              ) : source.status === "Failed" ? (
                                <RefreshCw className="h-4 w-4 mr-2" />
                              ) : (
                                <Play className="h-4 w-4 mr-2" />
                              )}
                              {processingSourceId === source.id ? "Processing..." : 
                                source.status === "Completed" ? "Re-ingest" : 
                                source.status === "Failed" ? "Retry" : "Start Ingestion"}
                            </Button>
                          ) : source.status === "Processing" ? (
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="h-9 px-3 bg-amber-50 border-amber-200 text-amber-700"
                              disabled
                            >
                              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                              Processing...
                            </Button>
                          ) : null}
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="h-9 w-9 p-0 text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition-all duration-150"
                            onClick={() => handleEditSource(source)}
                            disabled={processingSourceId === source.id || source.status === "Processing"}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="h-9 w-9 p-0 text-slate-600 hover:text-red-600 hover:bg-red-50 transition-all duration-150"
                            onClick={() => deleteSource(source.id)}
                            disabled={processingSourceId === source.id || source.status === "Processing"}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
                )}
                </TableBody>
                </Table>
                </div>
              </div>
              
              {/* Pagination Footer - Always visible */}
              {sources.length > itemsPerPage && (
              <div className="mt-4 py-4 border-t border-border bg-muted/30 rounded-b-xl flex-shrink-0">
                <div className="flex items-center justify-between px-6">
                  <p className="text-sm text-muted-foreground font-medium">
                    Showing <span className="font-semibold text-foreground">{indexOfFirstItem + 1}</span> to{" "}
                    <span className="font-semibold text-foreground">{Math.min(indexOfLastItem, sources.length)}</span>{" "}
                    of <span className="font-semibold text-foreground">{sources.length}</span> results
                  </p>
                </div>
              
              <Pagination className="mt-2">
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      href="#" 
                      onClick={(e) => {
                        e.preventDefault();
                        if (currentPage > 1) handlePageChange(currentPage - 1);
                      }} 
                      aria-disabled={currentPage === 1}
                      className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                    />
                  </PaginationItem>
                  
                  {totalPages <= 7 ? (
                    // Show all pages if there are 7 or fewer
                    Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <PaginationItem key={page}>
                        <PaginationLink 
                          href="#" 
                          onClick={(e) => {
                            e.preventDefault();
                            handlePageChange(page);
                          }}
                          isActive={currentPage === page}
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    ))
                  ) : (
                    // Show pagination with ellipsis for more than 7 pages
                    <>
                      {/* First page */}
                      <PaginationItem>
                        <PaginationLink 
                          href="#" 
                          onClick={(e) => {
                            e.preventDefault();
                            handlePageChange(1);
                          }}
                          isActive={currentPage === 1}
                        >
                          1
                        </PaginationLink>
                      </PaginationItem>
                      
                      {/* Show ellipsis if current page is > 3 */}
                      {currentPage > 3 && (
                        <PaginationItem>
                          <PaginationEllipsis />
                        </PaginationItem>
                      )}
                      
                      {/* Pages around current page */}
                      {Array.from({ length: totalPages }, (_, i) => i + 1)
                        .filter(page => {
                          if (totalPages <= 7) return true;
                          if (page === 1 || page === totalPages) return false;
                          if (currentPage <= 3) return page <= 5;
                          if (currentPage >= totalPages - 2) return page >= totalPages - 4;
                          return page >= currentPage - 1 && page <= currentPage + 1;
                        })
                        .map(page => (
                          <PaginationItem key={page}>
                            <PaginationLink 
                              href="#" 
                              onClick={(e) => {
                                e.preventDefault();
                                handlePageChange(page);
                              }}
                              isActive={currentPage === page}
                            >
                              {page}
                            </PaginationLink>
                          </PaginationItem>
                        ))
                      }
                      
                      {/* Show ellipsis if current page is < totalPages - 2 */}
                      {currentPage < totalPages - 2 && (
                        <PaginationItem>
                          <PaginationEllipsis />
                        </PaginationItem>
                      )}
                      
                      {/* Last page */}
                      <PaginationItem>
                        <PaginationLink 
                          href="#" 
                          onClick={(e) => {
                            e.preventDefault();
                            handlePageChange(totalPages);
                          }}
                          isActive={currentPage === totalPages}
                        >
                          {totalPages}
                        </PaginationLink>
                      </PaginationItem>
                    </>
                  )}
                  
                  <PaginationItem>
                    <PaginationNext 
                      href="#" 
                      onClick={(e) => {
                        e.preventDefault();
                        if (currentPage < totalPages) handlePageChange(currentPage + 1);
                      }} 
                      aria-disabled={currentPage === totalPages}
                      className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
              </div>
            )} 
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tracking drawer */}
      <IngestionTrackingDrawer
        isOpen={isTrackingModalOpen}
        onOpenChange={setIsTrackingModalOpen}
        sourceId={trackingSourceId}
      />
      
      {/* Add new source drawer */}
      <AddSourceDrawer
        isOpen={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onSave={(data) => {
          const sourceData = {
            name: data.name,
            type: data.type,
            url: data.url,
            username: data.username,
            password: data.password,
            description: data.description,
          };
          
          const newSourceId = addSource(sourceData);
          
          // Reset form and close drawer
          resetForm();
          setIsAddDialogOpen(false);
          
          // Show success message or handle as needed
          console.log('Source created:', newSourceId, data);
        }}
      />
      
      {/* GitHub source configuration drawer */}
      <GitHubSourceDrawer
        isOpen={isGitHubDrawerOpen}
        onOpenChange={setIsGitHubDrawerOpen}
        onSave={(settings) => {
          const sourceData = {
            name: settings.name,
            type: 'GitHub' as IngestionSourceType,
            url: settings.repository,
            // Store GitHub-specific settings in a way that can be retrieved later
            // You might want to extend the IngestionSource interface to include these
            username: settings.accessToken ? 'token' : undefined,
            password: settings.accessToken || undefined,
          };
          
          const newSourceId = addSource(sourceData);
          
          // Reset form and close dialog
          resetForm();
          setIsAddDialogOpen(false);
          
          // Show success message or handle as needed
          console.log('GitHub source created:', newSourceId, settings);
        }}
        sourceName={newSourceName}
      />
    </div>
  );
}
