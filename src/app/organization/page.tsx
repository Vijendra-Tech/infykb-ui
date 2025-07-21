"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useDexieAuthStore } from '@/store/use-dexie-auth-store';
import { useDexieOrganizationStore } from '@/store/use-dexie-organization-store';
import { User, Project, AccessRequest } from '@/lib/database';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Building2,
  Users,
  FileText,
  BarChart3,
  Clock,
  UserCheck,
  Settings,
  Crown,
  Globe,
  Database,
  Activity,
  ArrowRight,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function OrganizationPage() {
  const router = useRouter();
  const { user, organization, isAuthenticated, isAdmin } = useDexieAuthStore();
  const { 
    members, 
    projects, 
    accessRequests,
    loadMembers, 
    loadProjects, 
    loadAccessRequests,
    isLoading: storeLoading,
    error: storeError 
  } = useDexieOrganizationStore();
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/auth/login');
      return;
    }
    
    if (!isAdmin()) {
      router.push('/dashboard');
      return;
    }
    
    loadOrganizationData();
  }, [isAuthenticated, isAdmin, router]);

  const loadOrganizationData = async () => {
    try {
      setIsLoading(true);
      await Promise.all([
        loadMembers(),
        loadProjects(),
        loadAccessRequests()
      ]);
      setError('');
    } catch (err) {
      setError('Failed to load organization data');
      console.error('Error loading organization data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'free': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
      case 'pro': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'enterprise': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 dark:text-green-400';
      case 'inactive': return 'text-yellow-600 dark:text-yellow-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  // Calculate statistics
  const activeMembers = members.filter((m: User) => m.isActive).length;
  const activeProjects = projects.filter((p: Project) => p.status === 'active').length;
  const pendingRequests = accessRequests.filter((r: AccessRequest & { user: User; project?: Project }) => r.status === 'pending').length;
  const recentRequests = accessRequests.slice(0, 5);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-4 border-blue-600/30 border-t-blue-600 rounded-full animate-spin"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 p-6">
        <div className="max-w-7xl mx-auto">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 p-6 overflow-y-auto">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
              Organization Overview
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              Manage your organization settings, members, and projects
            </p>
          </div>
          
          <div className="flex gap-3">
            <Link href="/organization/members">
              <Button variant="outline" className="gap-2">
                <Users className="w-4 h-4" />
                Manage Members
              </Button>
            </Link>
            <Button className="gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
              <Settings className="w-4 h-4" />
              Organization Settings
            </Button>
          </div>
        </div>

        {/* Organization Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <Card className="backdrop-blur-sm bg-white/80 dark:bg-slate-900/80 border-slate-200/60 dark:border-slate-700/60 shadow-xl">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">{organization?.name || 'Demo Organization'}</CardTitle>
                    <CardDescription className="flex items-center gap-2">
                      <Globe className="w-4 h-4" />
                      {organization?.domain || 'example.com'}
                    </CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge className={getPlanColor(organization?.plan || 'pro')}>
                    <Crown className="w-3 h-3 mr-1" />
                    {organization?.plan?.toUpperCase() || 'PRO'}
                  </Badge>
                  <div className={`flex items-center gap-1 ${getStatusColor('active')}`}>
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-sm font-medium">Active</span>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{activeMembers}</div>
                  <div className="text-sm text-muted-foreground">Active Members</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">{activeProjects}</div>
                  <div className="text-sm text-muted-foreground">Active Projects</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{pendingRequests}</div>
                  <div className="text-sm text-muted-foreground">Pending Requests</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {organization?.settings?.maxMembers || 100}
                  </div>
                  <div className="text-sm text-muted-foreground">Member Limit</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Actions & Stats Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Members Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card className="backdrop-blur-sm bg-white/80 dark:bg-slate-900/80 border-slate-200/60 dark:border-slate-700/60 hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Users className="w-5 h-5 text-blue-600" />
                    Members
                  </CardTitle>
                  <Link href="/organization/members">
                    <Button variant="ghost" size="sm" className="gap-1">
                      View All
                      <ArrowRight className="w-3 h-3" />
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Total Members</span>
                    <span className="font-semibold">{members.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Active</span>
                    <span className="font-semibold text-green-600">{activeMembers}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Admins</span>
                    <span className="font-semibold">{members.filter((m: User) => m.role === 'admin').length}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Projects Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="backdrop-blur-sm bg-white/80 dark:bg-slate-900/80 border-slate-200/60 dark:border-slate-700/60 hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Database className="w-5 h-5 text-green-600" />
                    Projects
                  </CardTitle>
                  <Link href="/projects">
                    <Button variant="ghost" size="sm" className="gap-1">
                      View All
                      <ArrowRight className="w-3 h-3" />
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Total Projects</span>
                    <span className="font-semibold">{projects.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Active</span>
                    <span className="font-semibold text-green-600">{activeProjects}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Archived</span>
                    <span className="font-semibold">{projects.filter((p: Project) => p.status === 'archived').length}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Requests Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card className="backdrop-blur-sm bg-white/80 dark:bg-slate-900/80 border-slate-200/60 dark:border-slate-700/60 hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <UserCheck className="w-5 h-5 text-orange-600" />
                    Requests
                  </CardTitle>
                  <Link href="/requests">
                    <Button variant="ghost" size="sm" className="gap-1">
                      View All
                      <ArrowRight className="w-3 h-3" />
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Total Requests</span>
                    <span className="font-semibold">{accessRequests.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Pending</span>
                    <span className="font-semibold text-orange-600">{pendingRequests}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Approved</span>
                    <span className="font-semibold text-green-600">{accessRequests.filter((r: AccessRequest & { user: User; project?: Project }) => r.status === 'approved').length}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Card className="backdrop-blur-sm bg-white/80 dark:bg-slate-900/80 border-slate-200/60 dark:border-slate-700/60">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-red-600" />
                Recent Activity
              </CardTitle>
              <CardDescription>
                Latest organization activity and access requests
              </CardDescription>
            </CardHeader>
            <CardContent>
              {recentRequests.length > 0 ? (
                <div className="space-y-4">
                  {recentRequests.map((request: AccessRequest & { user: User; project?: Project }, index: number) => (
                    <div key={request.uuid || index} className="flex items-start gap-3 p-4 border rounded-lg hover:bg-muted/30 transition-colors">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm">
                          <span className="font-medium">User</span> requested{' '}
                          <span className="font-medium">{request.requestType?.replace('_', ' ')}</span>
                          {request.projectId && ' for project'}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge 
                            variant={request.status === 'pending' ? 'secondary' : request.status === 'approved' ? 'default' : 'destructive'}
                          >
                            {request.status}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {new Date(request.requestedAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No recent activity</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
