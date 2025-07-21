"use client";

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useDexieAuthStore } from '@/store/use-dexie-auth-store';
import { useOrganizationStore } from '@/store/use-organization-store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeft, 
  Database, 
  Users, 
  Settings, 
  Key, 
  Activity,
  Calendar,
  User,
  Shield,
  Cpu,
  Globe,
  AlertCircle,
  CheckCircle,
  Clock,
  Edit,
  Trash2,
  UserPlus
} from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

interface ProjectMember {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'member' | 'viewer';
  addedAt: Date;
  isActive: boolean;
}

export default function ProjectDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const projectId = params.id as string;
  
  const { user, isAuthenticated, isAdmin } = useDexieAuthStore();
  const { projects, members, fetchProjects, fetchMembers } = useOrganizationStore();
  
  const [project, setProject] = useState<any>(null);
  const [projectMembers, setProjectMembers] = useState<ProjectMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/auth/login');
      return;
    }
    
    loadProjectData();
  }, [isAuthenticated, router, projectId]);

  const loadProjectData = async () => {
    try {
      setIsLoading(true);
      await fetchProjects();
      await fetchMembers();
      
      // Find project by ID (could be UUID or index)
      const foundProject = projects.find(p => (p as any).uuid === projectId || p.id?.toString() === projectId);
      
      if (!foundProject) {
        setError('Project not found');
        return;
      }
      
      setProject(foundProject);
      
      // Mock project members for now - in real app, fetch from projectMembers table
      const mockMembers: ProjectMember[] = [
        {
          id: '1',
          name: 'John Doe',
          email: 'john@example.com',
          role: 'admin',
          addedAt: new Date('2024-01-15'),
          isActive: true
        },
        {
          id: '2',
          name: 'Jane Smith',
          email: 'jane@example.com',
          role: 'member',
          addedAt: new Date('2024-01-20'),
          isActive: true
        },
        {
          id: '3',
          name: 'Bob Wilson',
          email: 'bob@example.com',
          role: 'viewer',
          addedAt: new Date('2024-02-01'),
          isActive: true
        }
      ];
      
      setProjectMembers(mockMembers);
      
    } catch (error) {
      console.error('Error loading project:', error);
      setError('Failed to load project details');
    } finally {
      setIsLoading(false);
    }
  };

  const getProviderIcon = (provider: string) => {
    switch (provider) {
      case 'openai': return '🤖';
      case 'azure': return '☁️';
      case 'anthropic': return '🧠';
      case 'google': return '🔍';
      case 'ollama': return '🦙';
      default: return '⚡';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'inactive': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'archived': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
      case 'member': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'viewer': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-4 border-blue-600/30 border-t-blue-600 rounded-full animate-spin"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <Link href="/projects">
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back to Projects
              </Button>
            </Link>
          </div>
          
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error || 'Project not found'}
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 p-6 overflow-y-auto">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/projects">
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back to Projects
              </Button>
            </Link>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                  {project.name}
                </h1>
                <Badge className={getStatusColor(project.status)}>
                  {project.status}
                </Badge>
              </div>
              <p className="text-slate-600 dark:text-slate-400 mt-1">
                {project.description}
              </p>
            </div>
          </div>
          
          {isAdmin() && (
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
              <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
            </div>
          )}
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:grid-cols-4">
            <TabsTrigger value="overview" className="gap-2">
              <Database className="w-4 h-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="members" className="gap-2">
              <Users className="w-4 h-4" />
              Members
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-2">
              <Settings className="w-4 h-4" />
              Settings
            </TabsTrigger>
            <TabsTrigger value="activity" className="gap-2">
              <Activity className="w-4 h-4" />
              Activity
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Project Info */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Card className="backdrop-blur-sm bg-white/80 dark:bg-slate-900/80 border-slate-200/60 dark:border-slate-700/60">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Database className="w-5 h-5 text-blue-600" />
                      Project Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Created</label>
                        <p className="text-sm">{new Date(project.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Updated</label>
                        <p className="text-sm">{new Date(project.updatedAt).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Status</label>
                        <Badge className={getStatusColor(project.status)}>
                          {project.status}
                        </Badge>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Members</label>
                        <p className="text-sm">{projectMembers.length} members</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Model Configuration */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <Card className="backdrop-blur-sm bg-white/80 dark:bg-slate-900/80 border-slate-200/60 dark:border-slate-700/60">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Cpu className="w-5 h-5 text-purple-600" />
                      Model Configuration
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{getProviderIcon(project.modelConfig.provider)}</span>
                      <div>
                        <p className="font-medium capitalize">{project.modelConfig.provider}</p>
                        <p className="text-sm text-muted-foreground">{project.modelConfig.modelId}</p>
                      </div>
                    </div>
                    
                    {project.modelConfig.azureConfig && (
                      <div className="space-y-2 p-3 bg-muted/30 rounded-lg">
                        <h4 className="text-sm font-medium">Azure Configuration</h4>
                        <div className="grid grid-cols-1 gap-2 text-xs">
                          <div>
                            <span className="text-muted-foreground">Endpoint:</span>
                            <span className="ml-2">{project.modelConfig.azureConfig.endpoint}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Deployment:</span>
                            <span className="ml-2">{project.modelConfig.azureConfig.deploymentName}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">API Version:</span>
                            <span className="ml-2">{project.modelConfig.azureConfig.apiVersion}</span>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-2 text-sm">
                      <Key className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">API Key:</span>
                      <span className="font-mono">••••••••••••••••</span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </TabsContent>

          {/* Members Tab */}
          <TabsContent value="members" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="backdrop-blur-sm bg-white/80 dark:bg-slate-900/80 border-slate-200/60 dark:border-slate-700/60">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Users className="w-5 h-5 text-green-600" />
                      Project Members ({projectMembers.length})
                    </CardTitle>
                    {isAdmin() && (
                      <Button size="sm" className="gap-2">
                        <UserPlus className="w-4 h-4" />
                        Add Member
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {projectMembers.map((member) => (
                      <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium">
                            {member.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-medium">{member.name}</p>
                            <p className="text-sm text-muted-foreground">{member.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge className={getRoleColor(member.role)}>
                            {member.role}
                          </Badge>
                          <div className="text-xs text-muted-foreground">
                            Added {new Date(member.addedAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="backdrop-blur-sm bg-white/80 dark:bg-slate-900/80 border-slate-200/60 dark:border-slate-700/60">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="w-5 h-5 text-orange-600" />
                    Project Settings
                  </CardTitle>
                  <CardDescription>
                    Manage project permissions and configuration
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <h4 className="font-medium">Permissions</h4>
                    <div className="space-y-2">
                      {(project.permissions?.allowedRoles || ['member', 'admin']).map((role: string) => (
                        <div key={role} className="flex items-center justify-between p-3 border rounded-lg">
                          <span className="capitalize">{role.replace('_', ' ')}</span>
                          <Badge variant="outline">Allowed</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {(project.permissions?.restrictedFeatures || []).length > 0 && (
                    <div className="space-y-4">
                      <h4 className="font-medium">Restricted Features</h4>
                      <div className="space-y-2">
                        {(project.permissions?.restrictedFeatures || []).map((feature: string) => (
                          <div key={feature} className="flex items-center justify-between p-3 border rounded-lg">
                            <span className="capitalize">{feature.replace('_', ' ')}</span>
                            <Badge variant="destructive">Restricted</Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Activity Tab */}
          <TabsContent value="activity" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="backdrop-blur-sm bg-white/80 dark:bg-slate-900/80 border-slate-200/60 dark:border-slate-700/60">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5 text-red-600" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Mock activity data */}
                    <div className="flex items-start gap-3 p-4 border rounded-lg">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                      <div className="flex-1">
                        <p className="text-sm">
                          <span className="font-medium">John Doe</span> updated project settings
                        </p>
                        <p className="text-xs text-muted-foreground">2 hours ago</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3 p-4 border rounded-lg">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                      <div className="flex-1">
                        <p className="text-sm">
                          <span className="font-medium">Jane Smith</span> was added as a member
                        </p>
                        <p className="text-xs text-muted-foreground">1 day ago</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3 p-4 border rounded-lg">
                      <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                      <div className="flex-1">
                        <p className="text-sm">
                          <span className="font-medium">System</span> updated model configuration
                        </p>
                        <p className="text-xs text-muted-foreground">3 days ago</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
