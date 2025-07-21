"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useDexieAuthStore } from '@/store/use-dexie-auth-store';
import { useOrganizationStore } from '@/store/use-organization-store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  UserCheck, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Key, 
  Database,
  User,
  MessageSquare,
  Calendar,
  AlertCircle,
  ArrowLeft,
  Filter
} from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function RequestsPage() {
  const router = useRouter();
  const { user, isAuthenticated, isApprover, isInitialized, isLoading } = useDexieAuthStore();
  const { 
    accessRequests,
    members,
    projects,
    isLoading: orgLoading, 
    fetchAccessRequests,
    fetchMembers,
    fetchProjects,
    approveAccessRequest,
    rejectAccessRequest
  } = useOrganizationStore();

  const [activeTab, setActiveTab] = useState('pending');
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    // Wait for auth initialization to complete
    if (!isInitialized || isLoading) {
      return;
    }

    // Check if user is authenticated
    if (!user) {
      router.push('/auth/login');
      return;
    }

    // Check if user has approval permissions
    if (!isApprover()) {
      router.push('/dashboard');
      return;
    }

    fetchAccessRequests();
    fetchMembers();
    fetchProjects();
  }, [user, isInitialized, isLoading, isApprover, router, fetchAccessRequests, fetchMembers, fetchProjects]);

  const handleApproveRequest = async (requestId: string) => {
    setError('');
    setSuccess('');

    const result = await approveAccessRequest(requestId, reviewNotes);
    if (result.success) {
      setSuccess('Request approved successfully');
      setSelectedRequest(null);
      setReviewNotes('');
      setTimeout(() => setSuccess(''), 3000);
    } else {
      setError(result.error || 'Failed to approve request');
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    setError('');
    setSuccess('');

    const result = await rejectAccessRequest(requestId, reviewNotes);
    if (result.success) {
      setSuccess('Request rejected');
      setSelectedRequest(null);
      setReviewNotes('');
      setTimeout(() => setSuccess(''), 3000);
    } else {
      setError(result.error || 'Failed to reject request');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        );
      case 'approved':
        return (
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Approved
          </Badge>
        );
      case 'rejected':
        return (
          <Badge variant="secondary" className="bg-red-100 text-red-800">
            <XCircle className="w-3 h-3 mr-1" />
            Rejected
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getRequestTypeIcon = (type: string) => {
    switch (type) {
      case 'model_key_access':
        return <Key className="h-4 w-4 text-purple-600" />;
      case 'project_access':
        return <Database className="h-4 w-4 text-blue-600" />;
      default:
        return <User className="h-4 w-4 text-gray-600" />;
    }
  };

  const getRequestTypeName = (type: string) => {
    switch (type) {
      case 'model_key_access':
        return 'Model Key Access';
      case 'project_access':
        return 'Project Access';
      default:
        return type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
  };

  const getUserName = (userId: string) => {
    const member = members.find(m => m.id === userId);
    return member ? member.name : 'Unknown User';
  };

  const getProjectName = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    return project ? project.name : 'Unknown Project';
  };

  const filteredRequests = accessRequests.filter(request => {
    if (activeTab === 'all') return true;
    return request.status === activeTab;
  });

  const pendingCount = accessRequests.filter(r => r.status === 'pending').length;
  const approvedCount = accessRequests.filter(r => r.status === 'approved').length;
  const rejectedCount = accessRequests.filter(r => r.status === 'rejected').length;

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 pt-20 pb-10 px-6 md:px-10 lg:px-12">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
        >
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Link
                href="/dashboard"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
                Access Requests
              </h1>
            </div>
            <p className="text-muted-foreground">
              Review and manage team member access requests
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {pendingCount} Pending
            </Badge>
          </div>
        </motion.div>

        {/* Alerts */}
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            transition={{ duration: 0.3 }}
          >
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </motion.div>
        )}

        {success && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            transition={{ duration: 0.3 }}
          >
            <Alert className="border-green-200 bg-green-50 text-green-800">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          </motion.div>
        )}

        {/* Requests Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCheck className="h-5 w-5" />
                Request Management
              </CardTitle>
              <CardDescription>
                Review access requests from team members
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="pending" className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Pending ({pendingCount})
                  </TabsTrigger>
                  <TabsTrigger value="approved" className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    Approved ({approvedCount})
                  </TabsTrigger>
                  <TabsTrigger value="rejected" className="flex items-center gap-2">
                    <XCircle className="h-4 w-4" />
                    Rejected ({rejectedCount})
                  </TabsTrigger>
                  <TabsTrigger value="all" className="flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    All ({accessRequests.length})
                  </TabsTrigger>
                </TabsList>

                <div className="mt-6">
                  <TabsContent value={activeTab} className="space-y-4">
                    {filteredRequests.length === 0 ? (
                      <div className="text-center py-8">
                        <div className="w-12 h-12 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
                          <UserCheck className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <h3 className="font-semibold mb-2">No Requests Found</h3>
                        <p className="text-muted-foreground">
                          {activeTab === 'pending' 
                            ? 'No pending requests at the moment'
                            : `No ${activeTab} requests found`
                          }
                        </p>
                      </div>
                    ) : (
                      filteredRequests.map((request) => (
                        <Card key={request.id} className="border hover:shadow-md transition-shadow">
                          <CardContent className="p-6">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-3">
                                  <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                                    {getUserName(request.userId).charAt(0).toUpperCase()}
                                  </div>
                                  <div>
                                    <h3 className="font-semibold">{getUserName(request.userId)}</h3>
                                    <p className="text-sm text-muted-foreground">
                                      {getProjectName(request.projectId)}
                                    </p>
                                  </div>
                                </div>
                                
                                <div className="flex items-center gap-4 mb-3">
                                  <div className="flex items-center gap-2">
                                    {getRequestTypeIcon(request.requestType)}
                                    <span className="text-sm font-medium">
                                      {getRequestTypeName(request.requestType)}
                                    </span>
                                  </div>
                                  {getStatusBadge(request.status)}
                                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                    <Calendar className="h-3 w-3" />
                                    {new Date(request.requestedAt).toLocaleDateString()}
                                  </div>
                                </div>
                                
                                {request.message && (
                                  <div className="bg-muted/30 rounded-lg p-3 mb-3">
                                    <div className="flex items-start gap-2">
                                      <MessageSquare className="h-4 w-4 text-muted-foreground mt-0.5" />
                                      <p className="text-sm">{request.message}</p>
                                    </div>
                                  </div>
                                )}
                                
                                {request.reviewNotes && (
                                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 mb-3">
                                    <div className="flex items-start gap-2">
                                      <MessageSquare className="h-4 w-4 text-blue-600 mt-0.5" />
                                      <div>
                                        <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                                          Review Notes:
                                        </p>
                                        <p className="text-sm text-blue-800 dark:text-blue-200">
                                          {request.reviewNotes}
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                              
                              <div className="flex gap-2 ml-4">
                                {request.status === 'pending' && (
                                  <>
                                    <Dialog>
                                      <DialogTrigger asChild>
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                          onClick={() => {
                                            setSelectedRequest(request);
                                            setReviewNotes('');
                                          }}
                                        >
                                          <CheckCircle className="h-4 w-4 mr-1" />
                                          Approve
                                        </Button>
                                      </DialogTrigger>
                                      <DialogContent>
                                        <DialogHeader>
                                          <DialogTitle>Approve Request</DialogTitle>
                                          <DialogDescription>
                                            Approve {getRequestTypeName(request.requestType).toLowerCase()} 
                                            for {getUserName(request.userId)} on {getProjectName(request.projectId)}
                                          </DialogDescription>
                                        </DialogHeader>
                                        
                                        <div className="space-y-4 py-4">
                                          <div className="space-y-2">
                                            <Label htmlFor="approve-notes">Review Notes (Optional)</Label>
                                            <Textarea
                                              id="approve-notes"
                                              placeholder="Add any notes about this approval..."
                                              value={reviewNotes}
                                              onChange={(e) => setReviewNotes(e.target.value)}
                                              rows={3}
                                            />
                                          </div>
                                        </div>
                                        
                                        <DialogFooter>
                                          <Button
                                            variant="outline"
                                            onClick={() => {
                                              setSelectedRequest(null);
                                              setReviewNotes('');
                                            }}
                                          >
                                            Cancel
                                          </Button>
                                          <Button
                                            onClick={() => handleApproveRequest(request.id)}
                                            disabled={isLoading}
                                            className="bg-green-600 hover:bg-green-700"
                                          >
                                            {isLoading ? 'Approving...' : 'Approve Request'}
                                          </Button>
                                        </DialogFooter>
                                      </DialogContent>
                                    </Dialog>

                                    <Dialog>
                                      <DialogTrigger asChild>
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                          onClick={() => {
                                            setSelectedRequest(request);
                                            setReviewNotes('');
                                          }}
                                        >
                                          <XCircle className="h-4 w-4 mr-1" />
                                          Reject
                                        </Button>
                                      </DialogTrigger>
                                      <DialogContent>
                                        <DialogHeader>
                                          <DialogTitle>Reject Request</DialogTitle>
                                          <DialogDescription>
                                            Reject {getRequestTypeName(request.requestType).toLowerCase()} 
                                            for {getUserName(request.userId)} on {getProjectName(request.projectId)}
                                          </DialogDescription>
                                        </DialogHeader>
                                        
                                        <div className="space-y-4 py-4">
                                          <div className="space-y-2">
                                            <Label htmlFor="reject-notes">Reason for Rejection</Label>
                                            <Textarea
                                              id="reject-notes"
                                              placeholder="Please provide a reason for rejecting this request..."
                                              value={reviewNotes}
                                              onChange={(e) => setReviewNotes(e.target.value)}
                                              rows={3}
                                              required
                                            />
                                          </div>
                                        </div>
                                        
                                        <DialogFooter>
                                          <Button
                                            variant="outline"
                                            onClick={() => {
                                              setSelectedRequest(null);
                                              setReviewNotes('');
                                            }}
                                          >
                                            Cancel
                                          </Button>
                                          <Button
                                            variant="destructive"
                                            onClick={() => handleRejectRequest(request.id)}
                                            disabled={isLoading || !reviewNotes.trim()}
                                          >
                                            {isLoading ? 'Rejecting...' : 'Reject Request'}
                                          </Button>
                                        </DialogFooter>
                                      </DialogContent>
                                    </Dialog>
                                  </>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </TabsContent>
                </div>
              </Tabs>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
