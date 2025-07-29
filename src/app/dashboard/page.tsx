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
  activeProjects: 3,
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
  const { user, organization, isAdmin, isApprover, isAuthenticated } = useDexieAuthStore();
  const { stats, loadStats } = useDexieOrganizationStore();

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/auth/login');
    } else {
      loadStats();
    }
  }, [isAuthenticated, router, loadStats]);

  // Role-based permissions are handled by the auth store
  
  // Filter data based on user role
  const getFilteredStats = () => {
    if (isAdmin()) {
      return {
        totalProjects: stats?.totalProjects || mockStats.totalProjects,
        totalMembers: stats?.totalMembers || mockStats.totalMembers,
        pendingRequests: stats?.pendingRequests || mockStats.pendingRequests,
        activeProjects: stats?.activeProjects || mockStats.activeProjects,
      };
    } else if (isApprover()) {
      return {
        totalProjects: stats?.totalProjects || 3,
        totalMembers: stats?.totalMembers || 8,
        pendingRequests: stats?.pendingRequests || mockStats.pendingRequests,
        activeProjects: stats?.activeProjects || 2,
      };
    } else {
      return {
        totalProjects: stats?.totalProjects || 2,
        totalMembers: stats?.totalMembers || 5,
        pendingRequests: 0, // Members don't see pending requests
        activeProjects: stats?.activeProjects || 1,
      };
    }
  };
  
  const filteredStats = getFilteredStats();
  
  // Filter projects based on user role
  const getFilteredProjects = () => {
    if (isAdmin()) {
      return mockProjects; // Admin sees all projects
    } else {
      // Filter to show only projects user has access to
      return mockProjects.filter(project => 
        project.members <= 4 || project.name.includes('Support')
      ).slice(0, isApprover() ? 3 : 2);
    }
  };
  
  const filteredProjects = getFilteredProjects();
  
  // Filter requests based on user role
  const getFilteredRequests = () => {
    if (isAdmin()) {
      return mockRecentRequests; // Admin sees all requests
    } else if (isApprover()) {
      return mockRecentRequests.filter(req => req.status === 'pending'); // Approvers see pending requests
    } else {
      return []; // Members don't see request management
    }
  };
  
  const filteredRequests = getFilteredRequests();

  if (!isAuthenticated() || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center gap-4"
        >
          <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground">Loading your personalized dashboard...</p>
        </motion.div>
      </div>
    );
  }

  // Role-based welcome message
  const getWelcomeMessage = () => {
    if (isAdmin()) {
      return {
        title: `Welcome back, ${user.name || user.email.split('@')[0]}! 👋`,
        subtitle: `You have full administrative access to ${organization?.name || 'your organization'}.`,
        accent: 'from-purple-600 to-blue-600'
      };
    } else if (isApprover()) {
      return {
        title: `Good to see you, ${user.name || user.email.split('@')[0]}! 🎯`,
        subtitle: `Ready to review requests and manage your team projects.`,
        accent: 'from-blue-600 to-indigo-600'
      };
    } else {
      return {
        title: `Hello, ${user.name || user.email.split('@')[0]}! ✨`,
        subtitle: `Your projects and tools are ready for you.`,
        accent: 'from-indigo-600 to-purple-600'
      };
    }
  };
  
  const welcomeMsg = getWelcomeMessage();

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
    <div className="min-h-full max-h-full bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 pt-16 pb-10 px-4 md:px-6 lg:px-8 overflow-y-auto">
      <div className="max-w-7xl mx-auto space-y-6 pb-8">
        {/* Enhanced Welcome Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-white/95 via-white/90 to-blue-50/80 dark:from-slate-900/95 dark:via-slate-800/90 dark:to-slate-900/80 backdrop-blur-xl border border-white/30 dark:border-slate-700/30 shadow-2xl shadow-blue-500/10 dark:shadow-blue-900/20"
        >
          {/* Animated Background Pattern */}
          <div className="absolute inset-0 opacity-5 dark:opacity-10">
            <div className="absolute top-0 left-0 w-72 h-72 bg-gradient-to-br from-blue-400 to-purple-600 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" />
            <div className="absolute top-0 right-0 w-72 h-72 bg-gradient-to-bl from-cyan-400 to-blue-600 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
          </div>
          
          <div className="relative p-8 lg:p-10">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
              <div className="space-y-4">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                  <h1 className={`text-4xl lg:text-5xl font-bold bg-gradient-to-r ${welcomeMsg.accent} bg-clip-text text-transparent leading-tight`}>
                    {welcomeMsg.title}
                  </h1>
                  <p className="text-xl text-slate-600 dark:text-slate-300 mt-2 max-w-2xl">
                    {welcomeMsg.subtitle}
                  </p>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  className="flex flex-wrap items-center gap-3 mt-6"
                >
                  <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-full border border-blue-200/50 dark:border-blue-700/50">
                    <Building className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <span className="text-sm font-semibold text-blue-900 dark:text-blue-100">{organization?.name}</span>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/30 dark:to-green-900/30 rounded-full border border-emerald-200/50 dark:border-emerald-700/50">
                    <UserCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    <span className="text-sm font-semibold text-emerald-900 dark:text-emerald-100">{user.role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/30 dark:to-orange-900/30 rounded-full border border-amber-200/50 dark:border-amber-700/50">
                    <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                    <span className="text-sm font-semibold text-amber-900 dark:text-amber-100">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</span>
                  </div>
                </motion.div>
              </div>
              
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="flex flex-col sm:flex-row gap-3 lg:flex-col xl:flex-row"
              >
                {isApprover() && (
                  <Button 
                    onClick={() => router.push('/requests')}
                    variant="outline"
                    className="group flex items-center gap-2 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm hover:bg-white dark:hover:bg-slate-700 transition-all duration-300 hover:scale-105 hover:shadow-lg border-slate-200/50 dark:border-slate-600/50"
                  >
                    <AlertCircle className="h-4 w-4 group-hover:rotate-12 transition-transform duration-300" />
                    {isAdmin() ? 'Manage Requests' : 'Review Requests'}
                    {filteredRequests.length > 0 && (
                      <Badge className="ml-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white animate-pulse">{filteredRequests.length}</Badge>
                    )}
                  </Button>
                )}
                {isAdmin() && (
                  <Button 
                    onClick={() => router.push('/organization/members')}
                    variant="outline"
                    className="group flex items-center gap-2 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm hover:bg-white dark:hover:bg-slate-700 transition-all duration-300 hover:scale-105 hover:shadow-lg border-slate-200/50 dark:border-slate-600/50"
                  >
                    <Users className="h-4 w-4 group-hover:scale-110 transition-transform duration-300" />
                    Manage Members
                  </Button>
                )}
                <Button 
                  onClick={() => router.push(isAdmin() ? '/projects/new' : '/requests/new')}
                  className={`group bg-gradient-to-r ${welcomeMsg.accent} hover:shadow-xl hover:scale-105 flex items-center gap-2 transition-all duration-300 shadow-lg`}
                >
                  <Plus className="h-4 w-4 group-hover:rotate-90 transition-transform duration-300" />
                  {isAdmin() ? 'New Project' : 'Request Access'}
                </Button>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Enhanced Role-based Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6"
        >
          {/* Projects Stats */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 1.0 }}
            whileHover={{ scale: 1.03, y: -4 }}
            className="group"
          >
            <Card className="relative overflow-hidden bg-gradient-to-br from-white/95 via-blue-50/50 to-indigo-50/30 dark:from-slate-900/95 dark:via-blue-900/20 dark:to-indigo-900/10 backdrop-blur-xl border-0 shadow-xl hover:shadow-2xl transition-all duration-500 group-hover:shadow-blue-500/25">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <CardContent className="relative p-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                      {isAdmin() ? 'Total Projects' : isApprover() ? 'My Projects' : 'Accessible Projects'}
                    </p>
                    <div className="flex items-baseline gap-2">
                      <p className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                        {filteredStats.totalProjects}
                      </p>
                      <span className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">+12%</span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {isAdmin() ? 'Organization-wide projects' : 'Available to you'}
                    </p>
                  </div>
                  <div className="p-3 bg-gradient-to-br from-blue-100 via-purple-100 to-indigo-100 dark:from-blue-900/40 dark:via-purple-900/40 dark:to-indigo-900/40 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                    <Database className="h-7 w-7 text-blue-600 dark:text-blue-400 group-hover:rotate-12 transition-transform duration-300" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Team Members Stats */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 1.1 }}
            whileHover={{ scale: 1.03, y: -4 }}
            className="group"
          >
            <Card className="relative overflow-hidden bg-gradient-to-br from-white/95 via-emerald-50/50 to-green-50/30 dark:from-slate-900/95 dark:via-emerald-900/20 dark:to-green-900/10 backdrop-blur-xl border-0 shadow-xl hover:shadow-2xl transition-all duration-500 group-hover:shadow-emerald-500/25">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-green-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <CardContent className="relative p-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                      {isAdmin() ? 'Total Members' : 'Team Members'}
                    </p>
                    <div className="flex items-baseline gap-2">
                      <p className="text-4xl font-bold bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 bg-clip-text text-transparent">
                        {filteredStats.totalMembers}
                      </p>
                      <span className="text-sm text-blue-600 dark:text-blue-400 font-medium">+3</span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {isAdmin() ? 'Active organization members' : 'In your projects'}
                    </p>
                  </div>
                  <div className="p-3 bg-gradient-to-br from-emerald-100 via-green-100 to-teal-100 dark:from-emerald-900/40 dark:via-green-900/40 dark:to-teal-900/40 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                    <Users className="h-7 w-7 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform duration-300" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Pending Requests Stats (Admin/Approver only) */}
          {(isAdmin() || isApprover()) && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 1.2 }}
              whileHover={{ scale: 1.03, y: -4 }}
              className="group"
            >
              <Card className="relative overflow-hidden bg-gradient-to-br from-white/95 via-amber-50/50 to-orange-50/30 dark:from-slate-900/95 dark:via-amber-900/20 dark:to-orange-900/10 backdrop-blur-xl border-0 shadow-xl hover:shadow-2xl transition-all duration-500 group-hover:shadow-amber-500/25">
                <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <CardContent className="relative p-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <p className="text-sm font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                        {isAdmin() ? 'Pending Requests' : 'Requests to Review'}
                      </p>
                      <div className="flex items-baseline gap-2">
                        <p className="text-4xl font-bold bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 bg-clip-text text-transparent">
                          {filteredStats.pendingRequests}
                        </p>
                        {filteredStats.pendingRequests > 0 && (
                          <span className="text-sm text-red-600 dark:text-red-400 font-medium animate-pulse">urgent</span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {filteredStats.pendingRequests > 0 ? 'Requires your attention' : 'All caught up! 🎉'}
                      </p>
                    </div>
                    <div className="p-3 bg-gradient-to-br from-amber-100 via-orange-100 to-red-100 dark:from-amber-900/40 dark:via-orange-900/40 dark:to-red-900/40 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                      <AlertCircle className={`h-7 w-7 text-amber-600 dark:text-amber-400 transition-transform duration-300 ${filteredStats.pendingRequests > 0 ? 'animate-pulse group-hover:rotate-12' : 'group-hover:rotate-12'}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Active Projects Stats */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: isAdmin() || isApprover() ? 1.3 : 1.2 }}
            whileHover={{ scale: 1.03, y: -4 }}
            className="group"
          >
            <Card className="relative overflow-hidden bg-gradient-to-br from-white/95 via-purple-50/50 to-pink-50/30 dark:from-slate-900/95 dark:via-purple-900/20 dark:to-pink-900/10 backdrop-blur-xl border-0 shadow-xl hover:shadow-2xl transition-all duration-500 group-hover:shadow-purple-500/25">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <CardContent className="relative p-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                      {isAdmin() ? 'Active Projects' : 'Available Projects'}
                    </p>
                    <div className="flex items-baseline gap-2">
                      <p className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 bg-clip-text text-transparent">
                        {filteredStats.activeProjects}
                      </p>
                      <span className="text-sm text-purple-600 dark:text-purple-400 font-medium">live</span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {isAdmin() ? 'Currently running projects' : 'Ready for your use'}
                    </p>
                  </div>
                  <div className="p-3 bg-gradient-to-br from-purple-100 via-pink-100 to-rose-100 dark:from-purple-900/40 dark:via-pink-900/40 dark:to-rose-900/40 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                    <TrendingUp className="h-7 w-7 text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform duration-300" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Requests (Admin/Approver View) */}
          {(isAdmin() || isApprover()) && filteredRequests.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              whileHover={{ scale: 1.01 }}
            >
              <Card className="bg-gradient-to-br from-white/90 to-white/70 dark:from-slate-900/90 dark:to-slate-800/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2 text-xl">
                        <div className="p-2 bg-gradient-to-r from-yellow-100 to-orange-100 dark:from-yellow-900/30 dark:to-orange-900/30 rounded-lg">
                          <UserCheck className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                        </div>
                        {isAdmin() ? 'Pending Requests' : 'Requests to Review'}
                      </CardTitle>
                      <CardDescription className="text-base">
                        {isAdmin() ? 'Manage access requests from team members' : 'Review and approve team requests'}
                      </CardDescription>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => router.push('/requests')}
                      className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm hover:bg-white dark:hover:bg-slate-700 transition-all duration-200"
                    >
                      View All
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {filteredRequests.slice(0, 3).map((request, index) => (
                    <motion.div 
                      key={request.id} 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      whileHover={{ scale: 1.02, x: 4 }}
                      className="flex items-center justify-between p-4 bg-gradient-to-r from-white/60 to-white/40 dark:from-slate-800/60 dark:to-slate-700/40 rounded-xl border border-white/20 hover:shadow-md transition-all duration-200"
                    >
                      <div className="flex-1">
                        <p className="font-semibold text-slate-900 dark:text-slate-100">{request.user}</p>
                        <p className="text-sm text-slate-600 dark:text-slate-400">{request.project}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {request.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        {getStatusBadge(request.status)}
                        {request.status === 'pending' && (
                          <div className="flex gap-1">
                            <Button size="sm" variant="outline" className="h-8 px-2 bg-green-50 hover:bg-green-100 border-green-200 text-green-700">
                              <CheckCircle className="h-3 w-3" />
                            </Button>
                            <Button size="sm" variant="outline" className="h-8 px-2 bg-red-50 hover:bg-red-100 border-red-200 text-red-700">
                              <XCircle className="h-3 w-3" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                  {filteredRequests.length === 0 && (
                    <div className="text-center py-8">
                      <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
                      <p className="text-muted-foreground">All requests have been processed!</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Role-based Projects */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: (isAdmin() || isApprover()) && filteredRequests.length > 0 ? 0.3 : 0.2 }}
            whileHover={{ scale: 1.01 }}
          >
            <Card className="bg-gradient-to-br from-white/90 to-white/70 dark:from-slate-900/90 dark:to-slate-800/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-xl">
                      <div className="p-2 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-lg">
                        <Database className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      {isAdmin() ? 'All Projects' : isApprover() ? 'My Projects' : 'Available Projects'}
                    </CardTitle>
                    <CardDescription className="text-base">
                      {isAdmin() ? 'Manage all organization projects' : isApprover() ? 'Projects you manage and contribute to' : 'Projects you have access to'}
                    </CardDescription>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => router.push('/projects')}
                    className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm hover:bg-white dark:hover:bg-slate-700 transition-all duration-200"
                  >
                    View All
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {filteredProjects.slice(0, 3).map((project) => (
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
                  onClick={() => router.push('/projects/new')}
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

                {isAdmin() && (
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
function isAuthenticated() {
  throw new Error('Function not implemented.');
}

