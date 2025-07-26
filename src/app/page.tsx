"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  ArrowRight, 
  MessageCircle, 
  FolderOpen, 
  BarChart3, 
  Star, 
  Clock, 
  Users, 
  TrendingUp, 
  Activity, 
  Bot, 
  FileText, 
  Search, 
  Plus, 
  Bell, 
  Target,
  Zap,
  Brain,
  ChevronRight,
  ThumbsUp,
  Database
} from "lucide-react";
import { useDexieAuthStore } from '@/store/use-dexie-auth-store';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

// Force dynamic rendering to avoid build-time prerendering issues
export const dynamic = 'force-dynamic';

export default function Home() {
  const { user } = useDexieAuthStore();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');

  // If user is logged in, show dashboard
  if (user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Dashboard Header */}
          <div className="mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-slate-900 via-blue-800 to-indigo-700 bg-clip-text text-transparent">
                  Welcome back, {user.name || user.email}
                </h1>
                <p className="text-slate-600 text-lg mt-2">
                  Here's what's happening with your knowledge base today.
                </p>
              </div>
              
              {/* Quick Actions */}
              <div className="flex flex-wrap gap-3">
                <Button 
                  onClick={() => router.push('/chat')}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                >
                  <Bot className="h-4 w-4 mr-2" />
                  Start Chat
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => router.push('/projects/new')}
                  className="border-slate-300 hover:bg-slate-50 transition-all duration-300"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  New Project
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => router.push('/data-ingestion')}
                  className="border-slate-300 hover:bg-slate-50 transition-all duration-300"
                >
                  <Database className="h-4 w-4 mr-2" />
                  Import Data
                </Button>
              </div>
            </div>
          </div>

          {/* Dashboard Navigation Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:grid-cols-none lg:flex bg-white/60 backdrop-blur-sm border border-slate-200 rounded-xl p-1">
              <TabsTrigger 
                value="overview" 
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white transition-all duration-300"
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                Overview
              </TabsTrigger>
              <TabsTrigger 
                value="chats" 
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white transition-all duration-300"
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                Recent Chats
              </TabsTrigger>
              <TabsTrigger 
                value="projects" 
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white transition-all duration-300"
              >
                <FolderOpen className="h-4 w-4 mr-2" />
                Projects
              </TabsTrigger>
              <TabsTrigger 
                value="feedback" 
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white transition-all duration-300"
              >
                <ThumbsUp className="h-4 w-4 mr-2" />
                Feedback
              </TabsTrigger>
            </TabsList>

            {/* Tab Content with ScrollArea for proper scrolling */}
            <div className="mt-8">
              <TabsContent value="overview" className="space-y-6">
                <ScrollArea className="h-[calc(100vh-280px)] pr-4">
                {/* Quick Stats Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                  <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200 hover:shadow-lg transition-all duration-300">
                    <CardContent className="p-6 text-center">
                      <div className="flex items-center justify-center mb-3">
                        <div className="p-3 bg-blue-500 rounded-full">
                          <MessageCircle className="h-6 w-6 text-white" />
                        </div>
                      </div>
                      <div className="text-3xl font-bold text-blue-600 mb-1">47</div>
                      <div className="text-sm text-blue-700 font-medium">Total Chats</div>
                      <div className="text-xs text-blue-600 mt-1">+8 this week</div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-gradient-to-r from-emerald-50 to-emerald-100 border-emerald-200 hover:shadow-lg transition-all duration-300">
                    <CardContent className="p-6 text-center">
                      <div className="flex items-center justify-center mb-3">
                        <div className="p-3 bg-emerald-500 rounded-full">
                          <FolderOpen className="h-6 w-6 text-white" />
                        </div>
                      </div>
                      <div className="text-3xl font-bold text-emerald-600 mb-1">12</div>
                      <div className="text-sm text-emerald-700 font-medium">Active Projects</div>
                      <div className="text-xs text-emerald-600 mt-1">3 completed</div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200 hover:shadow-lg transition-all duration-300">
                    <CardContent className="p-6 text-center">
                      <div className="flex items-center justify-center mb-3">
                        <div className="p-3 bg-purple-500 rounded-full">
                          <FileText className="h-6 w-6 text-white" />
                        </div>
                      </div>
                      <div className="text-3xl font-bold text-purple-600 mb-1">156</div>
                      <div className="text-sm text-purple-700 font-medium">Knowledge Articles</div>
                      <div className="text-xs text-purple-600 mt-1">+12 this month</div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-gradient-to-r from-amber-50 to-amber-100 border-amber-200 hover:shadow-lg transition-all duration-300">
                    <CardContent className="p-6 text-center">
                      <div className="flex items-center justify-center mb-3">
                        <div className="p-3 bg-amber-500 rounded-full">
                          <Star className="h-6 w-6 text-white" />
                        </div>
                      </div>
                      <div className="text-3xl font-bold text-amber-600 mb-1">4.8</div>
                      <div className="text-sm text-amber-700 font-medium">Satisfaction</div>
                      <div className="text-xs text-amber-600 mt-1">247 reviews</div>
                    </CardContent>
                  </Card>
                </div>

                {/* Recent Activity and Quick Actions */}
                <div className="grid lg:grid-cols-3 gap-6 mb-8">
                  {/* Recent Activity */}
                  <Card className="lg:col-span-2 bg-white/60 backdrop-blur-sm border-slate-200">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Activity className="h-5 w-5 text-blue-600" />
                        Recent Activity
                      </CardTitle>
                      <CardDescription>Latest updates across your knowledge base</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {[
                        {
                          type: 'chat',
                          title: 'New chat started: React Performance Tips',
                          user: 'You',
                          timestamp: '2 hours ago',
                          icon: MessageCircle,
                          color: 'blue'
                        },
                        {
                          type: 'project',
                          title: 'Frontend Guide project updated',
                          user: 'Sarah Chen',
                          timestamp: '4 hours ago',
                          icon: FolderOpen,
                          color: 'emerald'
                        },
                        {
                          type: 'document',
                          title: 'New document added: TypeScript Best Practices',
                          user: 'Mike Johnson',
                          timestamp: '1 day ago',
                          icon: FileText,
                          color: 'purple'
                        },
                        {
                          type: 'feedback',
                          title: 'Positive feedback received on API Documentation',
                          user: 'Emily Rodriguez',
                          timestamp: '2 days ago',
                          icon: ThumbsUp,
                          color: 'amber'
                        },
                        {
                          type: 'user',
                          title: 'New team member joined: Alex Thompson',
                          user: 'System',
                          timestamp: '3 days ago',
                          icon: Users,
                          color: 'indigo'
                        }
                      ].map((activity, index) => {
                        const IconComponent = activity.icon;
                        return (
                          <div key={index} className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50/50 transition-colors duration-200">
                            <div className={`p-2 rounded-lg ${
                              activity.color === 'blue' ? 'bg-blue-100' :
                              activity.color === 'emerald' ? 'bg-emerald-100' :
                              activity.color === 'purple' ? 'bg-purple-100' :
                              activity.color === 'amber' ? 'bg-amber-100' :
                              'bg-indigo-100'
                            }`}>
                              <IconComponent className={`h-4 w-4 ${
                                activity.color === 'blue' ? 'text-blue-600' :
                                activity.color === 'emerald' ? 'text-emerald-600' :
                                activity.color === 'purple' ? 'text-purple-600' :
                                activity.color === 'amber' ? 'text-amber-600' :
                                'text-indigo-600'
                              }`} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-slate-900 mb-1">{activity.title}</p>
                              <div className="flex items-center gap-2 text-xs text-slate-500">
                                <span>by {activity.user}</span>
                                <span>•</span>
                                <span>{activity.timestamp}</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </CardContent>
                  </Card>

                  {/* Quick Actions */}
                  <Card className="bg-white/60 backdrop-blur-sm border-slate-200">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Zap className="h-5 w-5 text-purple-600" />
                        Quick Actions
                      </CardTitle>
                      <CardDescription>Common tasks and shortcuts</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {[
                        {
                          title: 'Start New Chat',
                          description: 'Ask AI assistant',
                          icon: Bot,
                          color: 'blue',
                          action: () => router.push('/chat')
                        },
                        {
                          title: 'Create Project',
                          description: 'Organize knowledge',
                          icon: Plus,
                          color: 'emerald',
                          action: () => router.push('/projects/new')
                        },
                        {
                          title: 'Import Data',
                          description: 'Add documents',
                          icon: Database,
                          color: 'purple',
                          action: () => router.push('/data-ingestion')
                        },
                        {
                          title: 'View Analytics',
                          description: 'Usage insights',
                          icon: BarChart3,
                          color: 'amber',
                          action: () => setActiveTab('feedback')
                        },
                        {
                          title: 'Manage Team',
                          description: 'User permissions',
                          icon: Users,
                          color: 'indigo',
                          action: () => router.push('/organization')
                        }
                      ].map((action, index) => {
                        const IconComponent = action.icon;
                        return (
                          <button
                            key={index}
                            onClick={action.action}
                            className="w-full flex items-center gap-3 p-3 rounded-lg border border-slate-200 hover:border-slate-300 hover:bg-slate-50/50 transition-all duration-200 text-left group"
                          >
                            <div className={`p-2 rounded-lg ${
                              action.color === 'blue' ? 'bg-blue-100 group-hover:bg-blue-200' :
                              action.color === 'emerald' ? 'bg-emerald-100 group-hover:bg-emerald-200' :
                              action.color === 'purple' ? 'bg-purple-100 group-hover:bg-purple-200' :
                              action.color === 'amber' ? 'bg-amber-100 group-hover:bg-amber-200' :
                              'bg-indigo-100 group-hover:bg-indigo-200'
                            } transition-colors duration-200`}>
                              <IconComponent className={`h-4 w-4 ${
                                action.color === 'blue' ? 'text-blue-600' :
                                action.color === 'emerald' ? 'text-emerald-600' :
                                action.color === 'purple' ? 'text-purple-600' :
                                action.color === 'amber' ? 'text-amber-600' :
                                'text-indigo-600'
                              }`} />
                            </div>
                            <div className="flex-1">
                              <div className="font-medium text-slate-900 text-sm">{action.title}</div>
                              <div className="text-xs text-slate-500">{action.description}</div>
                            </div>
                            <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-slate-600 transition-colors duration-200" />
                          </button>
                        );
                      })}
                    </CardContent>
                  </Card>
                </div>

                {/* Progress Overview */}
                <div className="grid lg:grid-cols-2 gap-6">
                  {/* Project Progress */}
                  <Card className="bg-white/60 backdrop-blur-sm border-slate-200">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-green-600" />
                        Project Progress
                      </CardTitle>
                      <CardDescription>Current project completion status</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {[
                        { name: 'Frontend Guide', progress: 85, color: 'blue' },
                        { name: 'API Handbook', progress: 60, color: 'emerald' },
                        { name: 'Database Patterns', progress: 95, color: 'purple' },
                        { name: 'Security Practices', progress: 40, color: 'amber' }
                      ].map((project) => (
                        <div key={project.name} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-slate-700">{project.name}</span>
                            <span className="text-sm text-slate-500">{project.progress}%</span>
                          </div>
                          <Progress 
                            value={project.progress} 
                            className={`h-2 ${
                              project.color === 'blue' ? '[&>div]:bg-blue-500' :
                              project.color === 'emerald' ? '[&>div]:bg-emerald-500' :
                              project.color === 'purple' ? '[&>div]:bg-purple-500' :
                              '[&>div]:bg-amber-500'
                            }`}
                          />
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  {/* Usage Insights */}
                  <Card className="bg-white/60 backdrop-blur-sm border-slate-200">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Target className="h-5 w-5 text-purple-600" />
                        Usage Insights
                      </CardTitle>
                      <CardDescription>Key metrics and trends</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-3 bg-blue-50 rounded-lg">
                          <div className="text-2xl font-bold text-blue-600">89%</div>
                          <div className="text-xs text-blue-700">Search Success Rate</div>
                        </div>
                        <div className="text-center p-3 bg-emerald-50 rounded-lg">
                          <div className="text-2xl font-bold text-emerald-600">2.4m</div>
                          <div className="text-xs text-emerald-700">Monthly Queries</div>
                        </div>
                        <div className="text-center p-3 bg-purple-50 rounded-lg">
                          <div className="text-2xl font-bold text-purple-600">15s</div>
                          <div className="text-xs text-purple-700">Avg Response Time</div>
                        </div>
                        <div className="text-center p-3 bg-amber-50 rounded-lg">
                          <div className="text-2xl font-bold text-amber-600">94%</div>
                          <div className="text-xs text-amber-700">User Retention</div>
                        </div>
                      </div>
                      
                      <div className="pt-2">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-slate-700">Overall Health Score</span>
                          <span className="text-sm text-slate-500">92/100</span>
                        </div>
                        <Progress value={92} className="h-3 [&>div]:bg-gradient-to-r [&>div]:from-green-500 [&>div]:to-emerald-500" />
                      </div>
                    </CardContent>
                  </Card>
                </div>
                </ScrollArea>
              </TabsContent>
              
              <TabsContent value="chats" className="space-y-6">
                <ScrollArea className="h-[calc(100vh-280px)] pr-4">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900">Recent Chats</h2>
                    <p className="text-slate-600 mt-1">Continue your conversations or start fresh</p>
                  </div>
                  <Button 
                    onClick={() => router.push('/chat')}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    New Chat
                  </Button>
                </div>

                {/* Recent Chats Grid */}
                <div className="grid gap-4 md:gap-6">
                  {/* Mock recent chats data - replace with real data */}
                  {[
                    {
                      id: '1',
                      title: 'React Performance Optimization',
                      lastMessage: 'How can I optimize my React components for better performance?',
                      timestamp: '2 hours ago',
                      messageCount: 12,
                      project: 'Frontend Development',
                      status: 'active'
                    },
                    {
                      id: '2', 
                      title: 'Database Schema Design',
                      lastMessage: 'What are the best practices for designing a scalable database schema?',
                      timestamp: '1 day ago',
                      messageCount: 8,
                      project: 'Backend Architecture',
                      status: 'completed'
                    },
                    {
                      id: '3',
                      title: 'API Integration Questions',
                      lastMessage: 'I need help integrating the payment gateway API...',
                      timestamp: '3 days ago',
                      messageCount: 15,
                      project: 'E-commerce Platform',
                      status: 'active'
                    },
                    {
                      id: '4',
                      title: 'TypeScript Best Practices',
                      lastMessage: 'What are the recommended TypeScript configurations for a large project?',
                      timestamp: '1 week ago',
                      messageCount: 6,
                      project: 'Code Quality',
                      status: 'archived'
                    }
                  ].map((chat) => (
                    <Card key={chat.id} className="group hover:shadow-lg transition-all duration-300 border-slate-200 bg-white/60 backdrop-blur-sm hover:bg-white/80">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-3">
                              <div className="p-2 rounded-lg bg-gradient-to-r from-blue-100 to-purple-100">
                                <MessageCircle className="h-5 w-5 text-blue-600" />
                              </div>
                              <div className="flex-1">
                                <h3 className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors duration-200 truncate">
                                  {chat.title}
                                </h3>
                                <div className="flex items-center gap-2 mt-1">
                                  <Badge 
                                    variant={chat.status === 'active' ? 'default' : chat.status === 'completed' ? 'secondary' : 'outline'}
                                    className={`text-xs ${
                                      chat.status === 'active' ? 'bg-green-100 text-green-700 border-green-200' :
                                      chat.status === 'completed' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                                      'bg-slate-100 text-slate-600 border-slate-200'
                                    }`}
                                  >
                                    {chat.status}
                                  </Badge>
                                  <span className="text-sm text-slate-500">•</span>
                                  <span className="text-sm text-slate-600">{chat.project}</span>
                                </div>
                              </div>
                            </div>
                            
                            <p className="text-slate-600 text-sm mb-4 line-clamp-2">
                              {chat.lastMessage}
                            </p>
                            
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4 text-sm text-slate-500">
                                <div className="flex items-center gap-1">
                                  <Clock className="h-4 w-4" />
                                  {chat.timestamp}
                                </div>
                                <div className="flex items-center gap-1">
                                  <MessageCircle className="h-4 w-4" />
                                  {chat.messageCount} messages
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-2">
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => router.push(`/chat/${chat.id}`)}
                                  className="opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-600"
                                >
                                  Continue
                                  <ChevronRight className="h-3 w-3 ml-1" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Empty State for when no chats exist */}
                {/* Uncomment this when implementing real data fetching
                <div className="text-center py-16 bg-white/60 backdrop-blur-sm rounded-xl border border-slate-200">
                  <div className="relative inline-block mb-6">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full blur-lg opacity-20 animate-pulse"></div>
                    <div className="relative p-4 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full">
                      <MessageCircle className="h-8 w-8 text-blue-600" />
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold text-slate-700 mb-2">No chats yet</h3>
                  <p className="text-slate-500 mb-6 max-w-md mx-auto">
                    Start your first conversation with our AI assistant to get help with your projects.
                  </p>
                  <Button 
                    onClick={() => router.push('/chat')}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Start Your First Chat
                  </Button>
                </div>
                */}

                {/* Load More Button */}
                <div className="text-center pt-6">
                  <Button 
                    variant="outline"
                    className="border-slate-300 hover:bg-slate-50 transition-all duration-300"
                  >
                    <Activity className="h-4 w-4 mr-2" />
                    Load More Chats
                  </Button>
                </div>
                </ScrollArea>
              </TabsContent>
              
              <TabsContent value="projects" className="space-y-6">
                <ScrollArea className="h-[calc(100vh-280px)] pr-4">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900">Projects</h2>
                    <p className="text-slate-600 mt-1">Manage your knowledge base projects and data sources</p>
                  </div>
                  <Button 
                    onClick={() => router.push('/projects/new')}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    New Project
                  </Button>
                </div>

                {/* Projects Grid */}
                <div className="grid gap-4 md:gap-6 lg:grid-cols-2">
                  {/* Mock projects data - replace with real data */}
                  {[
                    {
                      id: '1',
                      name: 'Frontend Development Guide',
                      description: 'Comprehensive documentation for React, TypeScript, and modern frontend practices',
                      progress: 85,
                      documentsCount: 24,
                      lastUpdated: '2 hours ago',
                      status: 'active',
                      category: 'Documentation',
                      members: 5,
                      color: 'blue'
                    },
                    {
                      id: '2',
                      name: 'API Integration Handbook',
                      description: 'Best practices and examples for integrating third-party APIs and services',
                      progress: 60,
                      documentsCount: 18,
                      lastUpdated: '1 day ago',
                      status: 'in-progress',
                      category: 'Technical',
                      members: 3,
                      color: 'emerald'
                    },
                    {
                      id: '3',
                      name: 'Database Design Patterns',
                      description: 'Collection of database schemas, optimization techniques, and performance tips',
                      progress: 95,
                      documentsCount: 31,
                      lastUpdated: '3 days ago',
                      status: 'completed',
                      category: 'Architecture',
                      members: 7,
                      color: 'purple'
                    },
                    {
                      id: '4',
                      name: 'Security Best Practices',
                      description: 'Security guidelines, vulnerability assessments, and compliance documentation',
                      progress: 40,
                      documentsCount: 12,
                      lastUpdated: '1 week ago',
                      status: 'draft',
                      category: 'Security',
                      members: 2,
                      color: 'amber'
                    }
                  ].map((project) => (
                    <Card key={project.id} className="group hover:shadow-lg transition-all duration-300 border-slate-200 bg-white/60 backdrop-blur-sm hover:bg-white/80">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between gap-4 mb-4">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg bg-gradient-to-r ${
                              project.color === 'blue' ? 'from-blue-100 to-blue-200' :
                              project.color === 'emerald' ? 'from-emerald-100 to-emerald-200' :
                              project.color === 'purple' ? 'from-purple-100 to-purple-200' :
                              'from-amber-100 to-amber-200'
                            }`}>
                              <FolderOpen className={`h-5 w-5 ${
                                project.color === 'blue' ? 'text-blue-600' :
                                project.color === 'emerald' ? 'text-emerald-600' :
                                project.color === 'purple' ? 'text-purple-600' :
                                'text-amber-600'
                              }`} />
                            </div>
                            <div className="flex-1">
                              <h3 className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors duration-200">
                                {project.name}
                              </h3>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge 
                                  variant={project.status === 'active' ? 'default' : project.status === 'completed' ? 'secondary' : 'outline'}
                                  className={`text-xs ${
                                    project.status === 'active' ? 'bg-green-100 text-green-700 border-green-200' :
                                    project.status === 'completed' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                                    project.status === 'in-progress' ? 'bg-yellow-100 text-yellow-700 border-yellow-200' :
                                    'bg-slate-100 text-slate-600 border-slate-200'
                                  }`}
                                >
                                  {project.status}
                                </Badge>
                                <span className="text-sm text-slate-500">•</span>
                                <span className="text-sm text-slate-600">{project.category}</span>
                              </div>
                            </div>
                          </div>
                          
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => router.push(`/projects/${project.id}`)}
                            className="opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-600"
                          >
                            View
                            <ChevronRight className="h-3 w-3 ml-1" />
                          </Button>
                        </div>
                        
                        <p className="text-slate-600 text-sm mb-4 line-clamp-2">
                          {project.description}
                        </p>
                        
                        {/* Progress Bar */}
                        <div className="mb-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-slate-700">Progress</span>
                            <span className="text-sm text-slate-500">{project.progress}%</span>
                          </div>
                          <Progress 
                            value={project.progress} 
                            className={`h-2 ${
                              project.color === 'blue' ? '[&>div]:bg-blue-500' :
                              project.color === 'emerald' ? '[&>div]:bg-emerald-500' :
                              project.color === 'purple' ? '[&>div]:bg-purple-500' :
                              '[&>div]:bg-amber-500'
                            }`}
                          />
                        </div>
                        
                        {/* Project Stats */}
                        <div className="flex items-center justify-between text-sm text-slate-500">
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1">
                              <FileText className="h-4 w-4" />
                              {project.documentsCount} docs
                            </div>
                            <div className="flex items-center gap-1">
                              <Users className="h-4 w-4" />
                              {project.members} members
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {project.lastUpdated}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Project Statistics */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
                  <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-blue-600 mb-1">4</div>
                      <div className="text-sm text-blue-700">Total Projects</div>
                    </CardContent>
                  </Card>
                  <Card className="bg-gradient-to-r from-emerald-50 to-emerald-100 border-emerald-200">
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-emerald-600 mb-1">85</div>
                      <div className="text-sm text-emerald-700">Total Documents</div>
                    </CardContent>
                  </Card>
                  <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-purple-600 mb-1">17</div>
                      <div className="text-sm text-purple-700">Team Members</div>
                    </CardContent>
                  </Card>
                  <Card className="bg-gradient-to-r from-amber-50 to-amber-100 border-amber-200">
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-amber-600 mb-1">70%</div>
                      <div className="text-sm text-amber-700">Avg Progress</div>
                    </CardContent>
                  </Card>
                </div>

                {/* Empty State for when no projects exist */}
                {/* Uncomment this when implementing real data fetching
                <div className="text-center py-16 bg-white/60 backdrop-blur-sm rounded-xl border border-slate-200">
                  <div className="relative inline-block mb-6">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full blur-lg opacity-20 animate-pulse"></div>
                    <div className="relative p-4 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full">
                      <FolderOpen className="h-8 w-8 text-blue-600" />
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold text-slate-700 mb-2">No projects yet</h3>
                  <p className="text-slate-500 mb-6 max-w-md mx-auto">
                    Create your first project to start organizing your knowledge base and documentation.
                  </p>
                  <Button 
                    onClick={() => router.push('/projects/new')}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Project
                  </Button>
                </div>
                */}
                </ScrollArea>
              </TabsContent>
              
              <TabsContent value="feedback" className="space-y-6">
                <ScrollArea className="h-[calc(100vh-280px)] pr-4">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900">Feedback Dashboard</h2>
                    <p className="text-slate-600 mt-1">Monitor user satisfaction and gather insights</p>
                  </div>
                  <Button 
                    onClick={() => router.push('/feedback/survey')}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create Survey
                  </Button>
                </div>

                {/* Feedback Statistics */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                  <Card className="bg-gradient-to-r from-emerald-50 to-emerald-100 border-emerald-200">
                    <CardContent className="p-4 text-center">
                      <div className="flex items-center justify-center mb-2">
                        <ThumbsUp className="h-5 w-5 text-emerald-600 mr-1" />
                        <div className="text-2xl font-bold text-emerald-600">4.8</div>
                      </div>
                      <div className="text-sm text-emerald-700">Avg Satisfaction</div>
                    </CardContent>
                  </Card>
                  <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-blue-600 mb-1">247</div>
                      <div className="text-sm text-blue-700">Total Responses</div>
                    </CardContent>
                  </Card>
                  <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-purple-600 mb-1">89%</div>
                      <div className="text-sm text-purple-700">Response Rate</div>
                    </CardContent>
                  </Card>
                  <Card className="bg-gradient-to-r from-amber-50 to-amber-100 border-amber-200">
                    <CardContent className="p-4 text-center">
                      <div className="flex items-center justify-center mb-2">
                        <TrendingUp className="h-5 w-5 text-amber-600 mr-1" />
                        <div className="text-2xl font-bold text-amber-600">+12%</div>
                      </div>
                      <div className="text-sm text-amber-700">This Month</div>
                    </CardContent>
                  </Card>
                </div>

                {/* Recent Feedback and Satisfaction Breakdown */}
                <div className="grid lg:grid-cols-2 gap-6 mb-8">
                  {/* Recent Feedback Comments */}
                  <Card className="bg-white/60 backdrop-blur-sm border-slate-200">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <MessageCircle className="h-5 w-5 text-blue-600" />
                        Recent Feedback
                      </CardTitle>
                      <CardDescription>Latest user comments and suggestions</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {[
                        {
                          id: '1',
                          user: 'Sarah Chen',
                          rating: 5,
                          comment: 'The AI chat feature is incredibly helpful for finding documentation quickly. Love the new interface!',
                          timestamp: '2 hours ago',
                          project: 'Frontend Guide'
                        },
                        {
                          id: '2',
                          user: 'Mike Johnson',
                          rating: 4,
                          comment: 'Great improvement in search functionality. Would love to see more filtering options.',
                          timestamp: '1 day ago',
                          project: 'API Handbook'
                        },
                        {
                          id: '3',
                          user: 'Emily Rodriguez',
                          rating: 5,
                          comment: 'The project organization is much cleaner now. Easy to navigate and find what I need.',
                          timestamp: '2 days ago',
                          project: 'Database Patterns'
                        }
                      ].map((feedback) => (
                        <div key={feedback.id} className="p-4 bg-slate-50/50 rounded-lg border border-slate-200">
                          <div className="flex items-start justify-between gap-3 mb-2">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                                {feedback.user.split(' ').map(n => n[0]).join('')}
                              </div>
                              <div>
                                <div className="font-medium text-slate-900">{feedback.user}</div>
                                <div className="text-sm text-slate-500">{feedback.timestamp}</div>
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              {Array.from({ length: 5 }, (_, i) => (
                                <Star 
                                  key={i} 
                                  className={`h-4 w-4 ${
                                    i < feedback.rating ? 'text-yellow-400 fill-current' : 'text-slate-300'
                                  }`} 
                                />
                              ))}
                            </div>
                          </div>
                          <p className="text-slate-700 text-sm mb-2">{feedback.comment}</p>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {feedback.project}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  {/* Satisfaction Breakdown */}
                  <Card className="bg-white/60 backdrop-blur-sm border-slate-200">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="h-5 w-5 text-purple-600" />
                        Satisfaction Breakdown
                      </CardTitle>
                      <CardDescription>Rating distribution and trends</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {[
                        { rating: 5, count: 156, percentage: 63, color: 'emerald' },
                        { rating: 4, count: 67, percentage: 27, color: 'blue' },
                        { rating: 3, count: 18, percentage: 7, color: 'yellow' },
                        { rating: 2, count: 4, percentage: 2, color: 'orange' },
                        { rating: 1, count: 2, percentage: 1, color: 'red' }
                      ].map((item) => (
                        <div key={item.rating} className="flex items-center gap-3">
                          <div className="flex items-center gap-1 w-12">
                            <span className="text-sm font-medium text-slate-700">{item.rating}</span>
                            <Star className="h-4 w-4 text-yellow-400 fill-current" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm text-slate-600">{item.count} responses</span>
                              <span className="text-sm text-slate-500">{item.percentage}%</span>
                            </div>
                            <Progress 
                              value={item.percentage} 
                              className={`h-2 ${
                                item.color === 'emerald' ? '[&>div]:bg-emerald-500' :
                                item.color === 'blue' ? '[&>div]:bg-blue-500' :
                                item.color === 'yellow' ? '[&>div]:bg-yellow-500' :
                                item.color === 'orange' ? '[&>div]:bg-orange-500' :
                                '[&>div]:bg-red-500'
                              }`}
                            />
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </div>

                {/* Feedback Categories */}
                <Card className="bg-white/60 backdrop-blur-sm border-slate-200">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5 text-indigo-600" />
                      Feedback Categories
                    </CardTitle>
                    <CardDescription>Common themes and improvement areas</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {[
                        {
                          category: 'User Interface',
                          count: 89,
                          sentiment: 'positive',
                          trend: '+15%',
                          color: 'blue',
                          icon: 'Zap'
                        },
                        {
                          category: 'Search Functionality',
                          count: 67,
                          sentiment: 'positive',
                          trend: '+8%',
                          color: 'emerald',
                          icon: 'Search'
                        },
                        {
                          category: 'Performance',
                          count: 45,
                          sentiment: 'mixed',
                          trend: '+3%',
                          color: 'yellow',
                          icon: 'Zap'
                        },
                        {
                          category: 'Documentation',
                          count: 34,
                          sentiment: 'positive',
                          trend: '+12%',
                          color: 'purple',
                          icon: 'FileText'
                        },
                        {
                          category: 'Mobile Experience',
                          count: 23,
                          sentiment: 'mixed',
                          trend: '-2%',
                          color: 'amber',
                          icon: 'Users'
                        },
                        {
                          category: 'AI Features',
                          count: 78,
                          sentiment: 'positive',
                          trend: '+25%',
                          color: 'indigo',
                          icon: 'Brain'
                        }
                      ].map((category) => {
                        const IconComponent = category.icon === 'Zap' ? Zap : 
                                            category.icon === 'Search' ? Search :
                                            category.icon === 'FileText' ? FileText :
                                            category.icon === 'Users' ? Users : Brain;
                        
                        return (
                          <div key={category.category} className={`p-4 rounded-lg border ${
                            category.color === 'blue' ? 'bg-blue-50 border-blue-200' :
                            category.color === 'emerald' ? 'bg-emerald-50 border-emerald-200' :
                            category.color === 'yellow' ? 'bg-yellow-50 border-yellow-200' :
                            category.color === 'purple' ? 'bg-purple-50 border-purple-200' :
                            category.color === 'amber' ? 'bg-amber-50 border-amber-200' :
                            'bg-indigo-50 border-indigo-200'
                          }`}>
                            <div className="flex items-center justify-between mb-2">
                              <IconComponent className={`h-5 w-5 ${
                                category.color === 'blue' ? 'text-blue-600' :
                                category.color === 'emerald' ? 'text-emerald-600' :
                                category.color === 'yellow' ? 'text-yellow-600' :
                                category.color === 'purple' ? 'text-purple-600' :
                                category.color === 'amber' ? 'text-amber-600' :
                                'text-indigo-600'
                              }`} />
                              <Badge 
                                variant={category.sentiment === 'positive' ? 'default' : 'secondary'}
                                className={`text-xs ${
                                  category.sentiment === 'positive' ? 'bg-green-100 text-green-700' :
                                  'bg-yellow-100 text-yellow-700'
                                }`}
                              >
                                {category.sentiment}
                              </Badge>
                            </div>
                            <h4 className="font-medium text-slate-900 mb-1">{category.category}</h4>
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-slate-600">{category.count} mentions</span>
                              <span className={`font-medium ${
                                category.trend.startsWith('+') ? 'text-green-600' : 'text-red-600'
                              }`}>
                                {category.trend}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>

                {/* Action Items */}
                <Card className="bg-gradient-to-r from-slate-50 to-blue-50/30 border-slate-200">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Bell className="h-5 w-5 text-orange-600" />
                      Action Items
                    </CardTitle>
                    <CardDescription>Recommended improvements based on feedback</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {[
                        {
                          priority: 'high',
                          title: 'Improve mobile search experience',
                          description: 'Multiple users reported difficulty using search on mobile devices',
                          mentions: 12
                        },
                        {
                          priority: 'medium',
                          title: 'Add more filtering options',
                          description: 'Users want advanced filtering capabilities for better content discovery',
                          mentions: 8
                        },
                        {
                          priority: 'low',
                          title: 'Enhance AI response accuracy',
                          description: 'Some users noted occasional inaccuracies in AI-generated responses',
                          mentions: 5
                        }
                      ].map((item, index) => (
                        <div key={index} className="flex items-start gap-3 p-3 bg-white/60 rounded-lg border border-slate-200">
                          <div className={`w-2 h-2 rounded-full mt-2 ${
                            item.priority === 'high' ? 'bg-red-500' :
                            item.priority === 'medium' ? 'bg-yellow-500' :
                            'bg-green-500'
                          }`}></div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <h4 className="font-medium text-slate-900">{item.title}</h4>
                              <Badge variant="outline" className="text-xs">
                                {item.mentions} mentions
                              </Badge>
                            </div>
                            <p className="text-sm text-slate-600">{item.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
                </ScrollArea>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    );
  }

  // If user is not logged in, show landing page
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
      <div className="relative">
        <main className="relative">
          <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 text-white">
            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
              <div className="text-center">
                <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-blue-100 to-indigo-200 bg-clip-text text-transparent">
                  Infinity Knowledge Base
                </h1>
                
                <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto leading-relaxed">
                  Transform your organization's knowledge into actionable insights with AI-powered search, 
                  intelligent organization, and seamless collaboration.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
                  <Button 
                    size="lg" 
                    onClick={() => router.push('/auth/login')}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                  >
                    Get Started Free
                    <ArrowRight className="h-5 w-5 ml-2" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="lg"
                    className="border-white/20 text-white hover:bg-white/10 px-8 py-4 text-lg font-semibold rounded-xl backdrop-blur-sm transition-all duration-300"
                  >
                    Watch Demo
                  </Button>
                </div>
              </div>
            </div>
          </section>

          <section className="py-24 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">
                  Everything you need to manage knowledge
                </h2>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                  Our comprehensive platform provides all the tools your team needs to capture, 
                  organize, and leverage organizational knowledge effectively.
                </p>
              </div>
            </div>
          </section>

          <section className="py-24 bg-gradient-to-r from-blue-600 to-purple-600">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="bg-white/10 backdrop-blur-lg border border-white/20 shadow-2xl rounded-xl p-12 text-center">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                  Ready to transform your knowledge management?
                </h2>
                <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
                  Join thousands of organizations already using InfinityKB to unlock their collective intelligence.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button 
                    size="lg" 
                    onClick={() => router.push('/auth/login')}
                    className="bg-white text-blue-600 hover:bg-blue-50 px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                  >
                    Start Your Free Trial
                    <ArrowRight className="h-5 w-5 ml-2" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="lg"
                    className="border-white/20 text-white hover:bg-white/10 px-8 py-4 text-lg font-semibold rounded-xl backdrop-blur-sm transition-all duration-300"
                  >
                    Learn More
                  </Button>
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
