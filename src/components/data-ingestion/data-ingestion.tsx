"use client";

import { useState } from "react";
import { useDataIngestionStore, type IngestionSourceType, type IngestionSource } from "@/store/use-data-ingestion-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Upload, Database, Globe, RefreshCw, Play, X, Plus, FileText, Link, Pencil } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { formatDistanceToNow } from "date-fns";

export function DataIngestion() {
  // Access the data ingestion store
  const { sources, addSource, editSource, startIngestion, completeIngestion, deleteSource } = useDataIngestionStore();
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

  const resetForm = () => {
    setNewSourceName("");
    setNewSourceType("File Upload");
    setSelectedFile(null);
    setSourceUrl("");
    setSourceUsername("");
    setSourcePassword("");
    setNameError(null);
    setFileError(null);
    setUrlError(null);
    setIsSubmitting(false);
  };
  
  const handleAddSource = () => {
    // Validate form
    if (!newSourceName.trim()) {
      setNameError("Source name is required");
      return;
    }

    if (["JIRA", "Confluence", "ADO", "API Endpoint", "Database"].includes(newSourceType) && !sourceUrl) {
      setUrlError("URL is required for this source type");
      return;
    }

    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      try {
        addSource({
          name: newSourceName.trim(),
          type: newSourceType,
          ...(sourceUrl ? { url: sourceUrl } : {}),
          ...(sourceUsername ? { username: sourceUsername } : {}),
          ...(sourcePassword ? { password: sourcePassword } : {}),
        });

        // Close dialog and reset form
        handleDialogChange(false);
        setIsSubmitting(false);
      } catch (error) {
        setError("Failed to add source. Please try again.");
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

    if (["JIRA", "Confluence", "ADO", "API Endpoint", "Database"].includes(editSourceType) && !editSourceUrl) {
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const [processingSourceId, setProcessingSourceId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleStartIngestion = (id: string) => {
    setProcessingSourceId(id);
    setError(null);
    startIngestion(id);
    
    // Simulate ingestion completion after 3 seconds
    setTimeout(() => {
      try {
        const recordCount = Math.floor(Math.random() * 1000) + 100;
        completeIngestion(id, recordCount);
        setProcessingSourceId(null);
      } catch (err) {
        setError("An error occurred during ingestion. Please try again.");
        setProcessingSourceId(null);
      }
    }, 3000);
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
        return <Upload className="h-4 w-4 text-blue-500" />;
      case "API Endpoint":
        return <Globe className="h-4 w-4 text-green-500" />;
      case "Database":
        return <Database className="h-4 w-4 text-purple-500" />;
      case "JIRA":
        return <Globe className="h-4 w-4 text-orange-500" />;
      case "Confluence":
        return <FileText className="h-4 w-4 text-cyan-500" />;
      case "ADO":
        return <Database className="h-4 w-4 text-indigo-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto py-6 px-4 md:px-6 lg:px-8 space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4 flex items-center justify-between">
          <div className="flex items-center">
            <X className="h-5 w-5 mr-2" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <div className="flex justify-between items-center mb-4 md:mb-6">
        <h1 className="text-2xl font-bold">Data Ingestion</h1>
        <Dialog open={isAddDialogOpen} onOpenChange={handleDialogChange}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2 px-3 md:px-4">
              <Plus className="h-4 w-4" />
              Add New Source
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Add New Ingestion Source</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label htmlFor="sourceName" className="text-sm font-medium">Source Name</label>
                <Input 
                  id="sourceName" 
                  placeholder="e.g., Customer Support Data" 
                  value={newSourceName}
                  onChange={(e) => {
                    setNewSourceName(e.target.value);
                    if (e.target.value.trim()) setNameError(null);
                  }}
                  className={nameError ? "border-red-300 focus:ring-red-500" : ""}
                />
                {nameError && <p className="text-sm text-red-500">{nameError}</p>}
              </div>
              <div className="space-y-2">
                <label htmlFor="sourceType" className="text-sm font-medium">Source Type</label>
                <Select 
                  value={newSourceType} 
                  onValueChange={(value) => setNewSourceType(value as IngestionSourceType)}
                >
                  <SelectTrigger id="sourceType">
                    <SelectValue placeholder="Select source type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="File Upload">File Upload</SelectItem>
                    <SelectItem value="API Endpoint">API Endpoint</SelectItem>
                    <SelectItem value="Database">Database</SelectItem>
                    <SelectItem value="JIRA">JIRA</SelectItem>
                    <SelectItem value="Confluence">Confluence</SelectItem>
                    <SelectItem value="ADO">Azure DevOps</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {newSourceType === "File Upload" && (
                <div className="space-y-2">
                  <label htmlFor="fileUpload" className="text-sm font-medium">Upload File</label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="fileUpload"
                      type="file"
                      onChange={(e) => {
                        handleFileChange(e);
                        if (e.target.files && e.target.files[0]) setFileError(null);
                      }}
                      className={`flex-1 ${fileError ? "border-red-300 focus:ring-red-500" : ""}`}
                    />
                  </div>
                  {selectedFile ? (
                    <p className="text-sm text-green-600 flex items-center">
                      <span className="mr-1">✓</span> Selected: {selectedFile.name}
                    </p>
                  ) : fileError ? (
                    <p className="text-sm text-red-500">{fileError}</p>
                  ) : null}
                </div>
              )}
              
              {/* URL, Username, Password fields for JIRA, Confluence, ADO, API Endpoint, and Database */}
              {["JIRA", "Confluence", "ADO", "API Endpoint", "Database"].includes(newSourceType) && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="sourceUrl" className="text-sm font-medium">URL</label>
                    <Input
                      id="sourceUrl"
                      placeholder={`Enter ${newSourceType} URL`}
                      value={sourceUrl}
                      onChange={(e) => {
                        setSourceUrl(e.target.value);
                        if (e.target.value.trim()) setUrlError(null);
                      }}
                      className={urlError ? "border-red-300 focus:ring-red-500" : ""}
                    />
                    {urlError && <p className="text-sm text-red-500">{urlError}</p>}
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="sourceUsername" className="text-sm font-medium">Username</label>
                    <Input
                      id="sourceUsername"
                      placeholder="Enter username (optional)"
                      value={sourceUsername}
                      onChange={(e) => setSourceUsername(e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="sourcePassword" className="text-sm font-medium">Password/API Key</label>
                    <Input
                      id="sourcePassword"
                      type="password"
                      placeholder="Enter password or API key (optional)"
                      value={sourcePassword}
                      onChange={(e) => setSourcePassword(e.target.value)}
                    />
                  </div>
                </div>
              )}
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => handleDialogChange(false)} disabled={isSubmitting}>Cancel</Button>
                <Button 
                  onClick={handleAddSource} 
                  disabled={isSubmitting}
                  className={isSubmitting ? "opacity-80" : ""}
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Adding...
                    </>
                  ) : "Add Source"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={isEditDialogOpen} onOpenChange={handleEditDialogChange}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Edit Ingestion Source</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label htmlFor="editSourceName" className="text-sm font-medium">Source Name</label>
                <Input 
                  id="editSourceName" 
                  placeholder="e.g., Customer Support Data" 
                  value={editSourceName}
                  onChange={(e) => {
                    setEditSourceName(e.target.value);
                    if (e.target.value.trim()) setNameError(null);
                  }}
                  className={nameError ? "border-red-300 focus:ring-red-500" : ""}
                />
                {nameError && <p className="text-sm text-red-500">{nameError}</p>}
              </div>
              <div className="space-y-2">
                <label htmlFor="editSourceType" className="text-sm font-medium">Source Type</label>
                <Select 
                  value={editSourceType} 
                  onValueChange={(value) => setEditSourceType(value as IngestionSourceType)}
                >
                  <SelectTrigger id="editSourceType">
                    <SelectValue placeholder="Select source type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="File Upload">File Upload</SelectItem>
                    <SelectItem value="API Endpoint">API Endpoint</SelectItem>
                    <SelectItem value="Database">Database</SelectItem>
                    <SelectItem value="JIRA">JIRA</SelectItem>
                    <SelectItem value="Confluence">Confluence</SelectItem>
                    <SelectItem value="ADO">Azure DevOps</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {["JIRA", "Confluence", "ADO", "API Endpoint", "Database"].includes(editSourceType) && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="editSourceUrl" className="text-sm font-medium">URL</label>
                    <Input
                      id="editSourceUrl"
                      placeholder="https://example.com/api"
                      value={editSourceUrl}
                      onChange={(e) => {
                        setEditSourceUrl(e.target.value);
                        if (e.target.value.trim()) setUrlError(null);
                      }}
                      className={urlError ? "border-red-300 focus:ring-red-500" : ""}
                    />
                    {urlError && <p className="text-sm text-red-500">{urlError}</p>}
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="editSourceUsername" className="text-sm font-medium">Username</label>
                    <Input
                      id="editSourceUsername"
                      placeholder="Enter username (optional)"
                      value={editSourceUsername}
                      onChange={(e) => setEditSourceUsername(e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="editSourcePassword" className="text-sm font-medium">Password/API Key</label>
                    <Input
                      id="editSourcePassword"
                      type="password"
                      placeholder="Enter new password or API key (optional)"
                      value={editSourcePassword}
                      onChange={(e) => setEditSourcePassword(e.target.value)}
                    />
                    <p className="text-xs text-gray-500">Leave blank to keep existing password/key</p>
                  </div>
                </div>
              )}
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => handleEditDialogChange(false)} disabled={isSubmitting}>Cancel</Button>
                <Button 
                  onClick={handleUpdateSource} 
                  disabled={isSubmitting}
                  className={isSubmitting ? "opacity-80" : ""}
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Updating...
                    </>
                  ) : "Update Source"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="overflow-hidden shadow-sm md:rounded-lg">
        <CardHeader className="bg-gray-50 p-4 md:p-6 dark:bg-gray-800/50">
          <CardTitle className="text-lg">Knowledge Sources</CardTitle>
        </CardHeader>
        <CardContent className="p-0 md:p-2">
          <Table className="md:table-auto">
            <TableHeader className="bg-gray-50">
              <TableRow>
                <TableHead className="w-[200px] p-3 md:p-4">Source Name</TableHead>
                <TableHead className="w-[120px] p-3 md:p-4">Type</TableHead>
                <TableHead className="w-[100px] p-3 md:p-4">Status</TableHead>
                <TableHead className="w-[180px] p-3 md:p-4">Source Details</TableHead>
                <TableHead className="w-[150px] p-3 md:p-4">Last Ingested</TableHead>
                <TableHead className="w-[100px] text-right p-3 md:p-4">Record Count</TableHead>
                <TableHead className="w-[150px] text-right p-3 md:p-4">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sources.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-8 md:py-12">
                    <div className="flex flex-col items-center justify-center text-center space-y-6">
                      <div className="bg-orange-50 p-4 md:p-5 rounded-full">
                        <Database className="h-10 w-10 text-orange-500" />
                      </div>
                      <div className="space-y-2 px-2 md:px-4">
                        <h3 className="text-xl font-semibold text-gray-900">Data Ingestion</h3>
                        <p className="text-gray-500 max-w-md mx-auto px-2 md:px-4">
                          Upload and manage your knowledge base data sources.
                          Import documents, websites, and other content to train your
                          AI assistant.
                        </p>
                      </div>
                      <Button 
                        onClick={() => setIsAddDialogOpen(true)} 
                        className="mt-2 flex items-center gap-2 px-3 md:px-4"
                      >
                        <Plus className="h-4 w-4" />
                        Add New Source
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                sources.map((source) => (
                  <TableRow key={source.id}>
                    <TableCell className="font-medium p-3 md:p-4">{source.name}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getTypeIcon(source.type)}
                        <span>{source.type}</span>
                      </div>
                    </TableCell>
                    <TableCell className="p-3 md:p-4">{getStatusBadge(source.status)}</TableCell>
                    <TableCell>
                      {["JIRA", "Confluence", "ADO", "API Endpoint", "Database"].includes(source.type) && source.url ? (
                        <div className="text-xs">
                          <div className="flex items-center gap-1 truncate max-w-[180px]" title={source.url}>
                            <Link className="h-3 w-3" />
                            <span className="truncate">{source.url}</span>
                          </div>
                          {source.username && (
                            <div className="text-gray-500 mt-1">
                              User: {source.username}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-500">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {source.lastIngested 
                        ? formatDistanceToNow(new Date(source.lastIngested), { addSuffix: true }) 
                        : "Never"}
                    </TableCell>
                    <TableCell className="text-right">{source.recordCount ?? "-"}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {source.status === "Ready" || source.status === "Completed" ? (
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className={`h-8 px-2 ${processingSourceId === source.id ? "bg-blue-50" : ""} text-blue-600`}
                            onClick={() => handleStartIngestion(source.id)}
                            disabled={processingSourceId !== null}
                          >
                            {processingSourceId === source.id ? (
                              <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
                            ) : source.status === "Completed" ? (
                              <RefreshCw className="h-4 w-4 mr-1" />
                            ) : (
                              <Play className="h-4 w-4 mr-1" />
                            )}
                            {processingSourceId === source.id ? "Processing..." : 
                              source.status === "Completed" ? "Re-ingest" : "Start Ingestion"}
                          </Button>
                        ) : source.status === "Processing" ? (
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="h-8 px-2 bg-yellow-50 text-yellow-600"
                            disabled
                          >
                            <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
                            Processing...
                          </Button>
                        ) : null}
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="h-8 w-8 p-0 text-blue-600"
                          onClick={() => handleEditSource(source)}
                          disabled={processingSourceId === source.id || source.status === "Processing"}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="h-8 w-8 p-0 text-red-600"
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
        </CardContent>
      </Card>
    </div>
  );
}
