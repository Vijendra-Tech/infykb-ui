"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useDexieAuthStore } from '@/store/use-dexie-auth-store';
import { useDexieOrganizationStore } from '@/store/use-dexie-organization-store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Settings, 
  Database, 
  Key, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Plus,
  Building,
  UserCheck,
  AlertCircle,
  TrendingUp
} from 'lucide-react';
import { motion } from 'framer-motion';

// Mock data for demonstration
const mockStats = {
  totalProjects: 5,
  totalMembers: 12,
  pendingRequests: 3,
  activeModels: 4,
};

const mockRecentRequests = [
  {
    id: '1',
    user: 'John Doe',
    project: 'Marketing Analytics',
    type: 'model_key_access',
    status: 'pending',
    requestedAt: new Date('2024-01-15'),
  },
  {
    id: '2',
    user: 'Sarah Wilson',
    project: 'Customer Support Bot',
    type: 'project_access',
    status: 'approved',
    requestedAt: new Date('2024-01-14'),
  },
  {
    id: '3',
    user: 'Mike Johnson',
    project: 'Data Processing',
    type: 'model_key_access',
    status: 'pending',
    requestedAt: new Date('2024-01-13'),
  },
];

const mockProjects = [
  {
    id: '1',
    name: 'Marketing Analytics',
    description: 'AI-powered marketing insights',
    members: 4,
    modelProvider: 'OpenAI',
    lastActivity: new Date('2024-01-15'),
  },
  {
    id: '2',
    name: 'Customer Support Bot',
    description: 'Automated customer service',
    members: 3,
    modelProvider: 'Anthropic',
    lastActivity: new Date('2024-01-14'),
  },
  {
    id: '3',
    name: 'Data Processing',
    description: 'Large-scale data analysis',
    members: 2,
    modelProvider: 'Azure OpenAI',
    lastActivity: new Date('2024-01-12'),
  },
];

export default function DashboardPage() {
  const router = useRouter();
  const { user, organization, isAuthenticated } = useDexieAuthStore();
  const { stats, loadStats } = useDexieOrganizationStore();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
    } else {
      loadStats();
    }
  }, [isAuthenticated, router, loadStats]);

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  const isAdmin = user.role === 'admin' || user.role === 'super_admin';
  const canApprove = user.role === 'admin' || user.role === 'super_admin' || user.role === 'approver';

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case 'approved':
        return <Badge variant="secondary" className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Approved</Badge>;
      case 'rejected':
        return <Badge variant="secondary" className="bg-red-100 text-red-800"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="min-h-full max-h-full bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 pt-20 pb-10 px-6 md:px-10 lg:px-12 overflow-y-auto">
      <div className="max-w-7xl mx-auto space-y-8 pb-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
        >
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
              Welcome back, {user.name}
            </h1>
            <p className="text-muted-foreground mt-1">
              {organization?.name} • {user.role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </p>
          </div>
          
          {isAdmin && (
            <div className="flex gap-3">
              <Button 
                onClick={() => router.push('/organization/members')}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Users className="h-4 w-4" />
                Manage Members
              </Button>
              <Button 
                onClick={() => router.push('/projects/new')}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                New Project
              </Button>
            </div>
          )}
        </motion.div>

        {/* Stats Cards */}
        {isAdmin && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Projects</p>
                    <p className="text-2xl font-bold">{mockStats.totalProjects}</p>
                  </div>
                  <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                    <Database className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Team Members</p>
                    <p className="text-2xl font-bold">{mockStats.totalMembers}</p>
                  </div>
                  <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full">
                    <Users className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Pending Requests</p>
                    <p className="text-2xl font-bold">{mockStats.pendingRequests}</p>
                  </div>
                  <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-full">
                    <AlertCircle className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Active Models</p>
                    <p className="text-2xl font-bold">{mockStats.activeModels}</p>
                  </div>
                  <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-full">
                    <Key className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Requests (Admin/Approver View) */}
          {canApprove && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <UserCheck className="h-5 w-5" />
                        Recent Requests
                      </CardTitle>
                      <CardDescription>
                        Manage access requests from team members
                      </CardDescription>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => router.push('/requests')}
                    >
                      View All
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {mockRecentRequests.map((request) => (
                    <div key={request.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium">{request.user}</p>
                        <p className="text-sm text-muted-foreground">{request.project}</p>
                        <p className="text-xs text-muted-foreground">
                          {request.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(request.status)}
                        {request.status === 'pending' && (
                          <div className="flex gap-1">
                            <Button size="sm" variant="outline" className="h-8 px-2">
                              <CheckCircle className="h-3 w-3" />
                            </Button>
                            <Button size="sm" variant="outline" className="h-8 px-2">
                              <XCircle className="h-3 w-3" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* My Projects */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: canApprove ? 0.3 : 0.2 }}
          >
            <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Database className="h-5 w-5" />
                      {isAdmin ? 'All Projects' : 'My Projects'}
                    </CardTitle>
                    <CardDescription>
                      {isAdmin ? 'Manage organization projects' : 'Projects you have access to'}
                    </CardDescription>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => router.push('/projects')}
                  >
                    View All
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {mockProjects.map((project) => (
                  <div key={project.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                    <div className="flex-1">
                      <p className="font-medium">{project.name}</p>
                      <p className="text-sm text-muted-foreground">{project.description}</p>
                      <div className="flex items-center gap-4 mt-1">
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {project.members} members
                        </span>
                        <Badge variant="secondary" className="text-xs">
                          {project.modelProvider}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">
                        {new Date(project.lastActivity).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Quick Actions
              </CardTitle>
              <CardDescription>
                Common tasks and shortcuts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Button 
                  variant="outline" 
                  className="h-20 flex flex-col items-center gap-2"
                  onClick={() => router.push('/data-ingestion')}
                >
                  <Database className="h-6 w-6" />
                  <span className="text-sm">Data Ingestion</span>
                </Button>
                
                <Button 
                  variant="outline" 
                  className="h-20 flex flex-col items-center gap-2"
                  onClick={() => router.push('/chat')}
                >
                  <Settings className="h-6 w-6" />
                  <span className="text-sm">Start Chat</span>
                </Button>

                <Button 
                  variant="outline" 
                  className="h-20 flex flex-col items-center gap-2"
                  onClick={() => router.push('/settings')}
                >
                  <Key className="h-6 w-6" />
                  <span className="text-sm">Settings</span>
                </Button>

                {!isAdmin && (
                  <Button 
                    variant="outline" 
                    className="h-20 flex flex-col items-center gap-2"
                    onClick={() => router.push('/requests/new')}
                  >
                    <Plus className="h-6 w-6" />
                    <span className="text-sm">Request Access</span>
                  </Button>
                )}

                {isAdmin && (
                  <Button 
                    variant="outline" 
                    className="h-20 flex flex-col items-center gap-2"
                    onClick={() => router.push('/organization')}
                  >
                    <Building className="h-6 w-6" />
                    <span className="text-sm">Organization</span>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
