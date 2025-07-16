"use client";

import { useState, useEffect } from "react";
import { fetchIngestedData, deleteIngestedDocument, type IngestedDataInfo } from "@/services/azure-functions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Loader2, RefreshCw, FileText, Trash2, Eye, AlertCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { formatDistanceToNow, format } from "date-fns";

export function IngestedDataList() {
  const { toast } = useToast();
  const [ingestedData, setIngestedData] = useState<IngestedDataInfo[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage] = useState<number>(5);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDocument, setSelectedDocument] = useState<IngestedDataInfo | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Calculate pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = ingestedData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(ingestedData.length / itemsPerPage);
  
  // Handle page changes
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };
  
  // Add mock data for demonstration
  const addMockData = () => {
    const mockData: IngestedDataInfo[] = [];
    const fileTypes = ["PDF", "DOCX", "TXT", "CSV", "JSON"];
    
    for (let i = 1; i <= 15; i++) {
      const fileType = fileTypes[Math.floor(Math.random() * fileTypes.length)];
      mockData.push({
        id: `doc-${i}`,
        fileName: `Document ${i}.${fileType.toLowerCase()}`,
        fileType,
        uploadDate: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString(),
        size: Math.floor(Math.random() * 10000) + 100,
        status: Math.random() > 0.2 ? "processed" : "failed",
        metadata: {
          sourceName: `Mock Source ${Math.floor(Math.random() * 5) + 1}`,
          errorMessage: Math.random() > 0.8 ? "Processing error" : undefined
        }
      });
    }
    
    setIngestedData(mockData);
    setLoading(false);
    
    toast({
      title: "Mock data loaded",
      description: "15 mock documents have been loaded for demonstration",
    });
  };

  // Function to load ingested data from Azure Function
  const loadIngestedData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // For demonstration, use mock data instead of real API call
      setTimeout(() => {
        addMockData();
      }, 500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch ingested data');
      toast({
        title: "Error",
        description: "Failed to fetch ingested data. Please try again.",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  // Load data on component mount
  useEffect(() => {
    // Use mock data instead of real API call for demonstration
    setTimeout(() => {
      addMockData();
    }, 500);
  }, []);

  // Function to handle document deletion
  const handleDeleteDocument = async () => {
    if (!deletingId) return;

    setIsDeleting(true);

    try {
      await deleteIngestedDocument(deletingId);

      // Update local state
      setIngestedData(prev => prev.filter(doc => doc.id !== deletingId));
      toast({
        title: "Document deleted",
        description: "The document has been successfully deleted.",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to delete document. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
      setDeletingId(null);
    }
  };

  const confirmDelete = (id: string) => {
    setDeletingId(id);
    setIsDeleteDialogOpen(true);
  };

  const viewDetails = (doc: IngestedDataInfo) => {
    setSelectedDocument(doc);
    setIsDetailsOpen(true);
  };

  // Format file size to human-readable format
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Function to get status badge color
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'processed':
        return <Badge className="bg-green-500">Processed</Badge>;
      case 'processing':
        return <Badge className="bg-blue-500">Processing</Badge>;
      case 'failed':
        return <Badge className="bg-red-500">Failed</Badge>;
      default:
        return <Badge className="bg-gray-500">{status}</Badge>;
    }
  };

  return (
    <Card className="w-full shadow-xl border-0 rounded-xl overflow-hidden bg-card mx-auto">
      <CardHeader className="flex flex-row items-center justify-between bg-muted/30 px-6 py-5 border-b">
        <div>
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent drop-shadow-sm">Document Repository</CardTitle>
          <CardDescription className="text-muted-foreground mt-1.5">Browse and manage processed files in your knowledge base</CardDescription>
        </div>
        <Button 
          variant="outline" 
          size="default" 
          onClick={loadIngestedData}
          disabled={loading}
          className="px-5 py-2 font-medium shadow-sm"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Loading...
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-5 w-5" />
              Refresh
            </>
          )}
        </Button>
      </CardHeader>
      <CardContent className="p-0 mx-auto max-h-[600px] overflow-y-auto">
        {error ? (
          <div className="text-center py-16 px-4">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 text-red-500" />
            <p className="text-red-500 text-lg font-medium mb-2">{error}</p>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">There was an error loading your ingested documents.</p>
            <Button 
              variant="outline" 
              onClick={loadIngestedData} 
              className="mt-4 px-5 py-2 font-medium shadow-sm"
            >
              Try Again
            </Button>
          </div>
        ) : loading ? (
          <div className="flex flex-col justify-center items-center py-16">
            <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Loading documents...</p>
          </div>
        ) : ingestedData.length === 0 ? (
          <div className="text-center py-16 px-4">
            <div className="rounded-full bg-primary/10 p-5 mb-6 shadow-inner mx-auto w-24 h-24 flex items-center justify-center">
              <FileText className="h-12 w-12 text-primary/70" />
            </div>
            <h3 className="font-medium text-xl mb-3">Your Document Repository is Empty</h3>
            <p className="text-muted-foreground text-base max-w-md mx-auto">Processed files will appear here once they've been successfully added to your knowledge base.</p>
          </div>
        ) : (
          <div className="overflow-x-auto overflow-y-visible">
            <Table className="border-collapse">
              <TableHeader>
                <TableRow>
                  <TableHead>File Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Upload Date</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentItems.map((doc) => (
                  <TableRow key={doc.id}>
                    <TableCell className="font-medium">{doc.fileName}</TableCell>
                    <TableCell>{doc.fileType}</TableCell>
                    <TableCell>{doc.metadata?.sourceName || 'N/A'}</TableCell>
                    <TableCell>
                      {doc.uploadDate ? format(new Date(doc.uploadDate), 'MMM dd, yyyy HH:mm') : 'N/A'}
                    </TableCell>
                    <TableCell>{formatFileSize(doc.size)}</TableCell>
                    <TableCell>
                      <Badge variant={doc.status === "processed" ? "default" : "destructive"} className="capitalize">
                        {doc.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => viewDetails(doc)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => confirmDelete(doc.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            
            {/* Pagination */}
            {ingestedData.length > 0 && (
              <div className="flex items-center justify-between px-6 py-4 bg-muted/20 border-t">
                <div className="text-sm text-muted-foreground">
                  Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, ingestedData.length)} of {ingestedData.length} items
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="h-8 w-8 p-0"
                  >
                    <span className="sr-only">Previous Page</span>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      onClick={() => handlePageChange(page)}
                      className={`h-8 w-8 p-0 ${currentPage === page ? 'bg-primary text-primary-foreground' : ''}`}
                    >
                      {page}
                    </Button>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages || totalPages === 0}
                    className="h-8 w-8 p-0"
                  >
                    <span className="sr-only">Next Page</span>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>

      {/* Document Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Document Details</DialogTitle>
          </DialogHeader>
          {selectedDocument && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">File Name</h4>
                  <p>{selectedDocument.fileName}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">File Type</h4>
                  <p>{selectedDocument.fileType}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Size</h4>
                  <p>{formatFileSize(selectedDocument.size)}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Upload Date</h4>
                  <p>{format(new Date(selectedDocument.uploadDate), 'PPpp')}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Status</h4>
                  <p>{getStatusBadge(selectedDocument.status)}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Document ID</h4>
                  <p className="font-mono text-xs">{selectedDocument.id}</p>
                </div>
              </div>
              
              {selectedDocument.metadata && (
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-2">Metadata</h4>
                  <pre className="bg-muted p-4 rounded-md overflow-auto text-xs">
                    {JSON.stringify(selectedDocument.metadata, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the document from the knowledge base.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteDocument}
              disabled={isDeleting}
              className="bg-red-500 hover:bg-red-600"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
