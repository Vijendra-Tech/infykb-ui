"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { GitHubSimilaritySearch } from '@/components/github-similarity-search';
import { EnhancedGraphVisualization } from '@/components/enhanced-graph-visualization';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Search, Network, List, LayoutGrid, Download, RefreshCw,
  AlertCircle, CheckCircle, GitBranch, MessageSquare, ThumbsUp,
  SortAsc, SortDesc, ExternalLink, User, Clock
} from 'lucide-react';
import { IngestedSearchResult } from '@/services/ingested-github-search-service';

import { IssueDetailsModal } from '@/components/issue-details-modal';
import { DataPopulationHelper } from '@/components/data-population-helper';
import { SampleDataService } from '@/services/sample-github-data';
import { ingestedGitHubSearchService } from '@/services/ingested-github-search-service';

type ViewMode = 'table' | 'cards' | 'kanban' | 'graph';
type SortField = 'updated' | 'created' | 'relevance' | 'comments' | 'title';
type SortOrder = 'asc' | 'desc';

export default function IssuesPage() {
  const [selectedIssue, setSelectedIssue] = useState<IngestedSearchResult | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeView, setActiveView] = useState<ViewMode>('cards');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<SortField>('updated');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  
  // Enhanced mock data
  const mockResults: IngestedSearchResult[] = [
    {
      id: 1001,
      number: 101,
      title: "TypeScript compilation error with React components",
      body: "Getting compilation errors when using TypeScript with React functional components.",
      state: "open",
      html_url: "https://github.com/microsoft/TypeScript/issues/101",
      repository: "microsoft/TypeScript",
      user: { login: "developer1", id: 12345, avatar_url: "", html_url: "https://github.com/developer1" },
      labels: [{ id: 1, name: "bug", color: "d73a49" }, { id: 2, name: "typescript", color: "0075ca" }],
      assignees: [],
      created_at: "2024-01-15T10:30:00Z",
      updated_at: "2024-01-16T14:20:00Z",
      comments: 5,
      reactions: { total_count: 0, '+1': 0, '-1': 0, laugh: 0, hooray: 0, confused: 0, heart: 0, rocket: 0, eyes: 0 },
      locked: false,
      relevance_score: 0.9,
      match_type: "title" as const
    },
    {
      id: 1002,
      number: 102,
      title: "Performance optimization for large datasets",
      body: "Need to optimize performance when handling large datasets in React applications.",
      state: "open",
      html_url: "https://github.com/facebook/react/issues/102",
      repository: "facebook/react",
      user: { login: "perfdev", id: 23456, avatar_url: "", html_url: "https://github.com/perfdev" },
      labels: [{ id: 3, name: "performance", color: "fbca04" }, { id: 4, name: "react", color: "1d76db" }],
      assignees: [],
      created_at: "2024-01-14T09:15:00Z",
      updated_at: "2024-01-17T11:45:00Z",
      comments: 12,
      reactions: { total_count: 0, '+1': 0, '-1': 0, laugh: 0, hooray: 0, confused: 0, heart: 0, rocket: 0, eyes: 0 },
      locked: false,
      relevance_score: 0.8,
      match_type: "body" as const
    },
    {
      id: 1003,
      number: 103,
      title: "Next.js routing issue with dynamic pages",
      body: "Dynamic routing in Next.js is not working correctly with nested routes.",
      state: "closed",
      html_url: "https://github.com/vercel/next.js/issues/103",
      repository: "vercel/next.js",
      user: { login: "nextjsdev", id: 34567, avatar_url: "", html_url: "https://github.com/nextjsdev" },
      labels: [{ id: 5, name: "bug", color: "d73a49" }, { id: 6, name: "routing", color: "c5def5" }],
      assignees: [],
      created_at: "2024-01-12T16:20:00Z",
      updated_at: "2024-01-18T13:30:00Z",
      comments: 8,
      reactions: { total_count: 0, '+1': 0, '-1': 0, laugh: 0, hooray: 0, confused: 0, heart: 0, rocket: 0, eyes: 0 },
      locked: false,
      relevance_score: 0.7,
      match_type: "combined" as const
    },
    {
      id: 1004,
      number: 104,
      title: "CSS-in-JS performance concerns",
      body: "Investigating performance implications of CSS-in-JS solutions.",
      state: "open",
      html_url: "https://github.com/styled-components/styled-components/issues/104",
      repository: "styled-components/styled-components",
      user: { login: "cssexpert", id: 45678, avatar_url: "", html_url: "https://github.com/cssexpert" },
      labels: [{ id: 7, name: "performance", color: "fbca04" }, { id: 8, name: "css", color: "1d76db" }],
      assignees: [],
      created_at: "2024-01-13T12:45:00Z",
      updated_at: "2024-01-16T09:20:00Z",
      comments: 15,
      reactions: { total_count: 0, '+1': 0, '-1': 0, laugh: 0, hooray: 0, confused: 0, heart: 0, rocket: 0, eyes: 0 },
      locked: false,
      relevance_score: 0.6,
      match_type: "labels" as const
    },
    {
      id: 1005,
      number: 105,
      title: "GraphQL integration with React Query",
      body: "How to properly integrate GraphQL with React Query for optimal caching.",
      state: "open",
      html_url: "https://github.com/TanStack/query/issues/105",
      repository: "TanStack/query",
      user: { login: "graphqldev", id: 56789, avatar_url: "", html_url: "https://github.com/graphqldev" },
      labels: [{ id: 9, name: "graphql", color: "e10098" }, { id: 10, name: "react-query", color: "ff6154" }],
      assignees: [],
      created_at: "2024-01-11T14:10:00Z",
      updated_at: "2024-01-17T16:55:00Z",
      comments: 7,
      reactions: { total_count: 0, '+1': 0, '-1': 0, laugh: 0, hooray: 0, confused: 0, heart: 0, rocket: 0, eyes: 0 },
      locked: false,
      relevance_score: 0.5,
      match_type: "title" as const
    }
  ];


  const handleIssueSelect = (issue: any) => {
    // Open the GitHub issue in a new tab
    if (issue.html_url) {
      window.open(issue.html_url, '_blank');
    }
  };

  // Filter and sort issues
  const filteredAndSortedIssues = useMemo(() => {
    let filtered = mockResults.filter(issue => {
      if (searchQuery && !issue.title.toLowerCase().includes(searchQuery.toLowerCase()) && 
          !issue.body.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      return true;
    });

    filtered.sort((a, b) => {
      let aValue, bValue;
      switch (sortField) {
        case 'updated': aValue = new Date(a.updated_at).getTime(); bValue = new Date(b.updated_at).getTime(); break;
        case 'created': aValue = new Date(a.created_at).getTime(); bValue = new Date(b.created_at).getTime(); break;
        case 'relevance': aValue = a.relevance_score; bValue = b.relevance_score; break;
        case 'comments': aValue = a.comments; bValue = b.comments; break;
        case 'title': aValue = a.title.toLowerCase(); bValue = b.title.toLowerCase(); break;
        default: return 0;
      }
      
      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    return filtered;
  }, [mockResults, searchQuery, sortField, sortOrder]);

  // Kanban columns
  const kanbanColumns = useMemo(() => {
    const openIssues = filteredAndSortedIssues.filter(issue => issue.state === 'open');
    const closedIssues = filteredAndSortedIssues.filter(issue => issue.state === 'closed');
    const criticalIssues = openIssues.filter(issue => 
      issue.labels.some(label => label.name.toLowerCase().includes('critical'))
    );
    const inProgressIssues = openIssues.filter(issue => 
      issue.assignees.length > 0 && !issue.labels.some(label => label.name.toLowerCase().includes('critical'))
    );
    const todoIssues = openIssues.filter(issue => 
      issue.assignees.length === 0 && !issue.labels.some(label => label.name.toLowerCase().includes('critical'))
    );

    return {
      critical: { title: 'Critical', issues: criticalIssues, color: 'bg-red-500' },
      inProgress: { title: 'In Progress', issues: inProgressIssues, color: 'bg-blue-500' },
      todo: { title: 'To Do', issues: todoIssues, color: 'bg-yellow-500' },
      done: { title: 'Done', issues: closedIssues, color: 'bg-green-500' }
    };
  }, [filteredAndSortedIssues]);

  const handleSearchResults = (results: IngestedSearchResult[]) => {
    // For now, keep showing mock data for graph visualization
    console.log('Search results received:', results.length);
  };

  const handleNodeClick = (nodeData: any) => {
    // Handle clicks from the enhanced graph visualization
    if (nodeData && (nodeData.id || nodeData.number)) {
      setSelectedIssue(nodeData);
      setIsModalOpen(true);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedIssue(null);
  };

  const getPriorityColor = (issue: IngestedSearchResult) => {
    const hasCritical = issue.labels.some(label => label.name.toLowerCase().includes('critical'));
    const hasBug = issue.labels.some(label => label.name.toLowerCase().includes('bug'));
    const hasSecurity = issue.labels.some(label => label.name.toLowerCase().includes('security'));
    
    if (hasCritical || hasSecurity) return 'bg-red-500';
    if (hasBug) return 'bg-orange-500';
    return 'bg-green-500';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric'
    });
  };

  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    const diffInWeeks = Math.floor(diffInDays / 7);
    return `${diffInWeeks}w ago`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
      <div className="container mx-auto p-6 max-w-8xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-slate-900 via-blue-800 to-indigo-800 bg-clip-text text-transparent mb-2">
                Issues Dashboard
              </h1>
              <p className="text-lg text-muted-foreground">
                Multi-view issue tracking with advanced analytics
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4" />
                Refresh
              </Button>
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                Export
              </Button>
            </div>
          </div>
        </div>

        {/* Search and Controls */}
        <Card className="mb-6 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search issues..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-12 border-0 bg-slate-50 focus:bg-white transition-colors"
                />
              </div>
              <Select value={sortField} onValueChange={(value: SortField) => setSortField(value)}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="updated">Updated</SelectItem>
                  <SelectItem value="created">Created</SelectItem>
                  <SelectItem value="relevance">Relevance</SelectItem>
                  <SelectItem value="comments">Comments</SelectItem>
                  <SelectItem value="title">Title</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="flex items-center gap-2"
              >
                {sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* View Mode Selector */}
        <div className="mb-6">
          <Tabs value={activeView} onValueChange={(value) => setActiveView(value as ViewMode)} className="w-full">
            <TabsList className="grid w-full grid-cols-4 bg-white/80 backdrop-blur-sm h-12">
              <TabsTrigger value="table" className="flex items-center gap-2 h-10">
                <List className="h-4 w-4" />
                Table
              </TabsTrigger>
              <TabsTrigger value="cards" className="flex items-center gap-2 h-10">
                <LayoutGrid className="h-4 w-4" />
                Cards
              </TabsTrigger>
              <TabsTrigger value="kanban" className="flex items-center gap-2 h-10">
                <LayoutGrid className="h-4 w-4" />
                Kanban
              </TabsTrigger>
              <TabsTrigger value="graph" className="flex items-center gap-2 h-10">
                <Network className="h-4 w-4" />
                Graph
              </TabsTrigger>
            </TabsList>

            {/* Table View */}
            <TabsContent value="table" className="mt-6">
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gradient-to-r from-slate-50 to-blue-50 border-b">
                        <tr>
                          <th className="p-4 text-left font-semibold text-slate-700">Priority</th>
                          <th className="p-4 text-left font-semibold text-slate-700">Issue</th>
                          <th className="p-4 text-left font-semibold text-slate-700">Repository</th>
                          <th className="p-4 text-left font-semibold text-slate-700">Assignees</th>
                          <th className="p-4 text-left font-semibold text-slate-700">Labels</th>
                          <th className="p-4 text-left font-semibold text-slate-700">Comments</th>
                          <th className="p-4 text-left font-semibold text-slate-700">Updated</th>
                          <th className="p-4 text-left font-semibold text-slate-700">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredAndSortedIssues.map((issue) => (
                          <tr 
                            key={issue.id} 
                            className="border-b hover:bg-slate-50/50 transition-colors cursor-pointer group"
                            onClick={() => handleIssueSelect(issue)}
                          >
                            <td className="p-4">
                              <div className={`w-3 h-3 rounded-full ${getPriorityColor(issue)}`} />
                            </td>
                            <td className="p-4">
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium text-slate-900 group-hover:text-blue-600 transition-colors">
                                    {issue.title}
                                  </span>
                                  <Badge variant={issue.state === 'open' ? 'default' : 'secondary'} className="text-xs">
                                    {issue.state}
                                  </Badge>
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  #{issue.number} • {getTimeAgo(issue.updated_at)}
                                </div>
                              </div>
                            </td>
                            <td className="p-4">
                              <div className="flex items-center gap-2">
                                <GitBranch className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm font-mono">{issue.repository}</span>
                              </div>
                            </td>
                            <td className="p-4">
                              <div className="flex items-center -space-x-2">
                                {issue.assignees.slice(0, 3).map((assignee) => (
                                  <Avatar key={assignee.id} className="h-6 w-6 border-2 border-white">
                                    <AvatarImage src={assignee.avatar_url} />
                                    <AvatarFallback className="text-xs">{assignee.login.slice(0, 2).toUpperCase()}</AvatarFallback>
                                  </Avatar>
                                ))}
                                {issue.assignees.length > 3 && (
                                  <div className="h-6 w-6 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center">
                                    <span className="text-xs text-slate-600">+{issue.assignees.length - 3}</span>
                                  </div>
                                )}
                              </div>
                            </td>
                            <td className="p-4">
                              <div className="flex items-center gap-1 flex-wrap">
                                {issue.labels.slice(0, 2).map((label) => (
                                  <Badge 
                                    key={label.id} 
                                    variant="secondary" 
                                    className="text-xs"
                                    style={{ backgroundColor: `#${label.color}20`, color: `#${label.color}` }}
                                  >
                                    {label.name}
                                  </Badge>
                                ))}
                                {issue.labels.length > 2 && (
                                  <Badge variant="outline" className="text-xs">
                                    +{issue.labels.length - 2}
                                  </Badge>
                                )}
                              </div>
                            </td>
                            <td className="p-4">
                              <div className="flex items-center gap-2">
                                <MessageSquare className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm">{issue.comments}</span>
                              </div>
                            </td>
                            <td className="p-4">
                              <span className="text-sm text-muted-foreground">{formatDate(issue.updated_at)}</span>
                            </td>
                            <td className="p-4">
                              <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); window.open(issue.html_url, '_blank'); }}>
                                <ExternalLink className="h-4 w-4" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Cards View */}
            <TabsContent value="cards" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredAndSortedIssues.map((issue) => (
                  <Card 
                    key={issue.id} 
                    className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group hover:scale-[1.02]"
                    onClick={() => handleIssueSelect(issue)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <div className={`w-3 h-3 rounded-full ${getPriorityColor(issue)}`} />
                            <Badge variant={issue.state === 'open' ? 'default' : 'secondary'} className="text-xs">
                              {issue.state}
                            </Badge>
                            <span className="text-xs text-muted-foreground">#{issue.number}</span>
                          </div>
                          <CardTitle className="text-lg group-hover:text-blue-600 transition-colors line-clamp-2">
                            {issue.title}
                          </CardTitle>
                        </div>
                        <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); window.open(issue.html_url, '_blank'); }}>
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm text-muted-foreground line-clamp-3">
                        {issue.body}
                      </p>
                      
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <GitBranch className="h-4 w-4" />
                        <span className="font-mono">{issue.repository}</span>
                      </div>

                      <div className="flex items-center gap-1 flex-wrap">
                        {issue.labels.map((label) => (
                          <Badge 
                            key={label.id} 
                            variant="secondary" 
                            className="text-xs"
                            style={{ backgroundColor: `#${label.color}20`, color: `#${label.color}` }}
                          >
                            {label.name}
                          </Badge>
                        ))}
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center -space-x-2">
                          {issue.assignees.slice(0, 3).map((assignee) => (
                            <Avatar key={assignee.id} className="h-6 w-6 border-2 border-white">
                              <AvatarImage src={assignee.avatar_url} />
                              <AvatarFallback className="text-xs">{assignee.login.slice(0, 2).toUpperCase()}</AvatarFallback>
                            </Avatar>
                          ))}
                          {issue.assignees.length > 3 && (
                            <div className="h-6 w-6 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center">
                              <span className="text-xs text-slate-600">+{issue.assignees.length - 3}</span>
                            </div>
                          )}
                          {issue.assignees.length === 0 && (
                            <div className="h-6 w-6 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center">
                              <User className="h-3 w-3 text-slate-400" />
                            </div>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <MessageSquare className="h-4 w-4" />
                            <span>{issue.comments}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <ThumbsUp className="h-4 w-4" />
                            <span>{issue.reactions.total_count}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-xs text-muted-foreground">
                        Updated {getTimeAgo(issue.updated_at)}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Kanban View */}
            <TabsContent value="kanban" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {Object.entries(kanbanColumns).map(([key, column]) => (
                  <Card key={key} className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${column.color}`} />
                        <CardTitle className="text-lg">{column.title}</CardTitle>
                        <Badge variant="secondary" className="ml-auto">
                          {column.issues.length}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {column.issues.map((issue) => (
                        <Card 
                          key={issue.id} 
                          className="p-3 cursor-pointer hover:shadow-md transition-shadow bg-white border"
                          onClick={() => handleIssueSelect(issue)}
                        >
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-muted-foreground">#{issue.number}</span>
                              <Badge variant={issue.state === 'open' ? 'default' : 'secondary'} className="text-xs">
                                {issue.state}
                              </Badge>
                            </div>
                            <h4 className="font-medium text-sm line-clamp-2">{issue.title}</h4>
                            <div className="flex items-center gap-1 flex-wrap">
                              {issue.labels.slice(0, 2).map((label) => (
                                <Badge 
                                  key={label.id} 
                                  variant="secondary" 
                                  className="text-xs"
                                  style={{ backgroundColor: `#${label.color}20`, color: `#${label.color}` }}
                                >
                                  {label.name}
                                </Badge>
                              ))}
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center -space-x-1">
                                {issue.assignees.slice(0, 2).map((assignee) => (
                                  <Avatar key={assignee.id} className="h-5 w-5 border border-white">
                                    <AvatarImage src={assignee.avatar_url} />
                                    <AvatarFallback className="text-xs">{assignee.login.slice(0, 1).toUpperCase()}</AvatarFallback>
                                  </Avatar>
                                ))}
                              </div>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <MessageSquare className="h-3 w-3" />
                                <span>{issue.comments}</span>
                              </div>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Graph View */}
            <TabsContent value="graph" className="mt-6">
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <CardContent className="p-0">

                  <EnhancedGraphVisualization
                    searchResults={filteredAndSortedIssues}
                    onNodeClick={handleNodeClick}
                    className="h-[600px]"
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Issue Details Modal */}
        <IssueDetailsModal
          issue={selectedIssue}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
        />
      </div>
    </div>
  );
}
