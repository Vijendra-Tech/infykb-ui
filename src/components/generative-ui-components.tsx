"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';

import {
  Code,
  Copy,
  Play,
  Github,
  ExternalLink,
  Sparkles,
  Zap,
  Bug,
  Lightbulb,
  FileText,
  Send,
  CheckCircle,
  AlertCircle,
  Loader2,
  BookOpen,
  Target,
  Settings,
  Plus,
  Search,
  Filter,
  Star,
  GitBranch,
  MessageSquare,
  Clock,
  User,
  Tag
} from 'lucide-react';

import { SolutionSuggestion } from '@/lib/agentic-ai-service';
import { enhancedGitHubService, MultiRepoSearchResult, RepositoryConfig } from '@/lib/enhanced-github-service';
import { GitHubIssue } from '@/lib/github-service';

interface CodeSnippetCardProps {
  suggestion: SolutionSuggestion;
  onCopy: (code: string) => void;
  onRun?: (code: string) => void;
}

export function CodeSnippetCard({ suggestion, onCopy, onRun }: CodeSnippetCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { toast } = useToast();

  const handleCopy = () => {
    if (suggestion.code?.snippet) {
      onCopy(suggestion.code.snippet);
      toast({
        title: "Code copied!",
        description: "Code snippet has been copied to clipboard.",
      });
    }
  };

  const handleRun = () => {
    if (suggestion.code?.snippet && onRun) {
      onRun(suggestion.code.snippet);
      toast({
        title: "Code executed!",
        description: "Code snippet has been executed in the playground.",
      });
    }
  };

  if (!suggestion.code) return null;

  return (
    <Card className="group hover:shadow-lg transition-all duration-200 border-l-4 border-l-blue-500">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Code className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <CardTitle className="text-sm font-medium">{suggestion.title}</CardTitle>
              <p className="text-xs text-muted-foreground mt-1">{suggestion.description}</p>
            </div>
          </div>
          <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">
            {Math.round(suggestion.confidence * 100)}% match
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-3">
          {/* Code Preview */}
          <div className="relative">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  {suggestion.code.language}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {suggestion.code.snippet.split('\n').length} lines
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopy}
                  className="h-7 px-2 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Copy className="h-3 w-3" />
                </Button>
                {onRun && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleRun}
                    className="h-7 px-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Play className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3 font-mono text-sm overflow-x-auto">
              <pre className={`${isExpanded ? '' : 'line-clamp-4'}`}>
                {suggestion.code.snippet}
              </pre>
            </div>
            
            {suggestion.code.snippet.split('\n').length > 4 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
                className="mt-2 h-7 text-xs"
              >
                {isExpanded ? 'Show less' : 'Show more'}
              </Button>
            )}
          </div>

          {/* Explanation */}
          {suggestion.code.explanation && (
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <Lightbulb className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  {suggestion.code.explanation}
                </p>
              </div>
            </div>
          )}

          {/* References */}
          {suggestion.references && suggestion.references.length > 0 && (
            <div className="space-y-2">
              <Label className="text-xs font-medium text-muted-foreground">References</Label>
              <div className="flex flex-wrap gap-2">
                {suggestion.references.map((ref, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    asChild
                    className="h-7 text-xs"
                  >
                    <a href={ref.url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-3 w-3 mr-1" />
                      {ref.title}
                    </a>
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

interface GitHubIssueCreatorProps {
  messageContext?: string;
  suggestedTitle?: string;
  suggestedBody?: string;
  suggestedLabels?: string[];
  onIssueCreated?: (issue: GitHubIssue) => void;
  showTriggerButton?: boolean;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function GitHubIssueCreator({
  messageContext,
  suggestedTitle = '',
  suggestedBody = '',
  suggestedLabels = [],
  onIssueCreated,
  showTriggerButton = true,
  isOpen: externalIsOpen,
  onOpenChange: externalOnOpenChange
}: GitHubIssueCreatorProps) {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  
  // Use external control if provided, otherwise use internal state
  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;
  const setIsOpen = externalOnOpenChange || setInternalIsOpen;
  const [isCreating, setIsCreating] = useState(false);
  const [selectedRepo, setSelectedRepo] = useState<string>('');
  const [title, setTitle] = useState(suggestedTitle);
  const [body, setBody] = useState(suggestedBody);
  const [labels, setLabels] = useState<string[]>(suggestedLabels);
  const [repositories, setRepositories] = useState<RepositoryConfig[]>([]);
  
  const { toast } = useToast();

  React.useEffect(() => {
    setRepositories(enhancedGitHubService.getRepositories());
  }, []);

  const handleCreateIssue = async () => {
    if (!selectedRepo || !title.trim()) {
      toast({
        title: "Missing information",
        description: "Please select a repository and provide a title.",
        variant: "destructive"
      });
      return;
    }

    setIsCreating(true);
    
    try {
      const issue = await enhancedGitHubService.createIssueWithTemplate(selectedRepo, {
        title: title.trim(),
        body: body.trim(),
        labels,
        messageContext
      });

      toast({
        title: "Issue created successfully!",
        description: `Issue #${issue.number} has been created in ${selectedRepo}`,
      });

      onIssueCreated?.(issue);
      setIsOpen(false);
      
      // Reset form
      setTitle('');
      setBody('');
      setLabels([]);
      setSelectedRepo('');
      
    } catch (error) {
      console.error('Error creating issue:', error);
      toast({
        title: "Failed to create issue",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {showTriggerButton && (
        <DialogTrigger asChild>
          <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white">
            <Github className="h-4 w-4 mr-2" />
            Create GitHub Issue
          </Button>
        </DialogTrigger>
      )}
      
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Github className="h-5 w-5" />
            Create New GitHub Issue
          </DialogTitle>
          <DialogDescription>
            Create a new issue in a GitHub repository with context from your chat message.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Repository Selection */}
          <div className="space-y-2">
            <Label htmlFor="repository">Repository</Label>
            <Select value={selectedRepo} onValueChange={setSelectedRepo}>
              <SelectTrigger>
                <SelectValue placeholder="Select a repository" />
              </SelectTrigger>
              <SelectContent>
                {repositories.map((repo) => (
                  <SelectItem key={repo.fullName} value={repo.fullName}>
                    <div className="flex items-center gap-2">
                      <GitBranch className="h-4 w-4" />
                      <span>{repo.fullName}</span>
                      <Badge variant="outline" className="ml-auto">
                        Priority {repo.priority}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Issue Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Brief description of the issue"
              className="font-medium"
            />
          </div>

          {/* Issue Body */}
          <div className="space-y-2">
            <Label htmlFor="body">Description</Label>
            <Textarea
              id="body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Detailed description of the issue, steps to reproduce, expected behavior, etc."
              className="min-h-[120px] resize-none"
            />
          </div>

          {/* Labels */}
          <div className="space-y-2">
            <Label>Labels</Label>
            <div className="flex flex-wrap gap-2">
              {['bug', 'enhancement', 'question', 'documentation', 'help wanted', 'good first issue'].map((label) => (
                <Button
                  key={label}
                  variant={labels.includes(label) ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    if (labels.includes(label)) {
                      setLabels(labels.filter(l => l !== label));
                    } else {
                      setLabels([...labels, label]);
                    }
                  }}
                  className="h-7 text-xs"
                >
                  <Tag className="h-3 w-3 mr-1" />
                  {label}
                </Button>
              ))}
            </div>
          </div>

          {/* Message Context Preview */}
          {messageContext && (
            <div className="space-y-2">
              <Label>Chat Context (will be included)</Label>
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3 text-sm">
                <div className="flex items-center gap-2 mb-2">
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium text-muted-foreground">Original Message</span>
                </div>
                <p className="text-muted-foreground line-clamp-3">
                  {messageContext}
                </p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleCreateIssue}
              disabled={isCreating || !selectedRepo || !title.trim()}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              {isCreating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Create Issue
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface EnhancedIssueSearchProps {
  messageContent?: string;
  onIssueSelect?: (issue: MultiRepoSearchResult) => void;
}

export function EnhancedIssueSearch({ messageContent, onIssueSelect }: EnhancedIssueSearchProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<MultiRepoSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedRepos, setSelectedRepos] = useState<string[]>([]);
  const [repositories, setRepositories] = useState<RepositoryConfig[]>([]);

  React.useEffect(() => {
    setRepositories(enhancedGitHubService.getRepositories());
    setSelectedRepos(enhancedGitHubService.getRepositories().map(r => r.fullName));
  }, []);

  React.useEffect(() => {
    if (messageContent) {
      handleMessageSearch(messageContent);
    }
  }, [messageContent]);

  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    
    try {
      const results = await enhancedGitHubService.searchAcrossRepositories({
        query: query.trim(),
        repositories: selectedRepos.length > 0 ? selectedRepos : undefined,
        includeBody: true,
        includeComments: false,
        state: 'all',
        limit: 30,
        minRelevance: 0.3
      });

      setSearchResults(results);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleMessageSearch = async (content: string) => {
    setIsSearching(true);
    
    try {
      const results = await enhancedGitHubService.searchByMessageContent(content);
      setSearchResults(results);
    } catch (error) {
      console.error('Message search error:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const toggleRepository = (repoName: string) => {
    if (selectedRepos.includes(repoName)) {
      setSelectedRepos(selectedRepos.filter(r => r !== repoName));
    } else {
      setSelectedRepos([...selectedRepos, repoName]);
    }
  };

  return (
    <div className="space-y-4">
      {/* Search Header */}
      <div className="flex items-center gap-2">
        <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
          <Search className="h-5 w-5 text-purple-600 dark:text-purple-400" />
        </div>
        <div>
          <h3 className="text-lg font-semibold">Enhanced Issue Search</h3>
          <p className="text-sm text-muted-foreground">
            Search across multiple repositories with message content analysis
          </p>
        </div>
        <Badge variant="secondary" className="ml-auto">
          {searchResults.length} results
        </Badge>
      </div>

      <Separator />

      {/* Search Controls */}
      <div className="space-y-3">
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search issues across repositories..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              handleSearch(e.target.value);
            }}
            className="pl-9"
          />
          {isSearching && (
            <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
          )}
        </div>

        {/* Repository Filter */}
        <div className="space-y-2">
          <Label className="text-xs font-medium text-muted-foreground">Filter by Repository</Label>
          <div className="flex flex-wrap gap-2">
            {repositories.map((repo) => (
              <Button
                key={repo.fullName}
                variant={selectedRepos.includes(repo.fullName) ? "default" : "outline"}
                size="sm"
                onClick={() => toggleRepository(repo.fullName)}
                className="h-7 text-xs"
              >
                <GitBranch className="h-3 w-3 mr-1" />
                {repo.name}
                <Badge variant="secondary" className="ml-1 text-xs">
                  {repo.priority}
                </Badge>
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Search Results */}
      <ScrollArea className="h-[400px]">
        <div className="space-y-3">
          {searchResults.length === 0 && !isSearching ? (
            <div className="text-center py-8">
              <Search className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                {searchQuery || messageContent ? 'No issues found matching your search.' : 'Enter a search query or provide message content to find related issues.'}
              </p>
            </div>
          ) : (
            searchResults.map((result, index) => (
              <Card 
                key={`${result.repository}-${result.issue.id}`}
                className="cursor-pointer hover:shadow-md transition-all duration-200 group"
                onClick={() => onIssueSelect?.(result)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      {/* Repository and Issue Number */}
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className="text-xs">
                          {result.repository}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          #{result.issue.number}
                        </span>
                        <Badge 
                          variant={result.issue.state === 'open' ? 'default' : 'secondary'}
                          className="text-xs"
                        >
                          {result.issue.state}
                        </Badge>
                      </div>

                      {/* Issue Title */}
                      <h4 className="font-medium text-sm mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {result.issue.title}
                      </h4>

                      {/* Matched Text */}
                      <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                        {result.matchedText}
                      </p>

                      {/* Metadata */}
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          <span>{result.issue.user.login}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>{new Date(result.issue.created_at).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MessageSquare className="h-3 w-3" />
                          <span>{result.issue.comments}</span>
                        </div>
                      </div>
                    </div>

                    {/* Relevance Score and Match Type */}
                    <div className="flex flex-col items-end gap-2">
                      <Badge 
                        variant="secondary" 
                        className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                      >
                        {Math.round(result.relevanceScore * 100)}%
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {result.matchType}
                      </Badge>
                    </div>
                  </div>

                  {/* Labels */}
                  {result.issue.labels.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-3">
                      {result.issue.labels.slice(0, 3).map((label) => (
                        <Badge 
                          key={label.id}
                          variant="outline" 
                          className="text-xs"
                          style={{ 
                            backgroundColor: `#${label.color}20`,
                            borderColor: `#${label.color}50`
                          }}
                        >
                          {label.name}
                        </Badge>
                      ))}
                      {result.issue.labels.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{result.issue.labels.length - 3} more
                        </Badge>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

interface AgenticActionSuggestionsProps {
  messageContent: string;
  analysisResult?: any;
  onActionSelect: (action: string, data?: any) => void;
}

export function AgenticActionSuggestions({ 
  messageContent, 
  analysisResult, 
  onActionSelect 
}: AgenticActionSuggestionsProps) {
  const [suggestions, setSuggestions] = useState<Array<{
    id: string;
    title: string;
    description: string;
    icon: React.ReactNode;
    action: string;
    confidence: number;
    data?: any;
  }>>([]);

  React.useEffect(() => {
    generateActionSuggestions();
  }, [messageContent, analysisResult]);

  const generateActionSuggestions = () => {
    const newSuggestions = [];

    // Always suggest issue search
    newSuggestions.push({
      id: 'search-issues',
      title: 'Search Related Issues',
      description: 'Find similar issues across multiple repositories',
      icon: <Search className="h-4 w-4" />,
      action: 'search-issues',
      confidence: 0.9,
      data: { query: messageContent }
    });

    // Suggest code snippet if technical content detected
    if (containsTechnicalContent(messageContent)) {
      newSuggestions.push({
        id: 'generate-code',
        title: 'Generate Code Solution',
        description: 'Get AI-generated code snippets for your problem',
        icon: <Code className="h-4 w-4" />,
        action: 'generate-code',
        confidence: 0.8,
        data: { context: messageContent }
      });
    }

    // Suggest issue creation if problem detected
    if (containsProblemIndicators(messageContent)) {
      newSuggestions.push({
        id: 'create-issue',
        title: 'Create GitHub Issue',
        description: 'Create a new issue with context from your message',
        icon: <Github className="h-4 w-4" />,
        action: 'create-issue',
        confidence: 0.7,
        data: { 
          context: messageContent,
          suggestedTitle: generateIssueTitle(messageContent)
        }
      });
    }

    // Suggest documentation search
    newSuggestions.push({
      id: 'search-docs',
      title: 'Search Documentation',
      description: 'Find relevant documentation and guides',
      icon: <BookOpen className="h-4 w-4" />,
      action: 'search-docs',
      confidence: 0.6,
      data: { query: extractKeywords(messageContent) }
    });

    setSuggestions(newSuggestions.sort((a, b) => b.confidence - a.confidence));
  };

  const containsTechnicalContent = (content: string): boolean => {
    const technicalKeywords = [
      'function', 'class', 'interface', 'type', 'error', 'bug', 'code',
      'typescript', 'javascript', 'react', 'node', 'api', 'async', 'await'
    ];
    
    return technicalKeywords.some(keyword => 
      content.toLowerCase().includes(keyword)
    );
  };

  const containsProblemIndicators = (content: string): boolean => {
    const problemKeywords = [
      'error', 'issue', 'problem', 'bug', 'broken', 'not working',
      'fail', 'crash', 'exception', 'unexpected'
    ];
    
    return problemKeywords.some(keyword => 
      content.toLowerCase().includes(keyword)
    );
  };

  const generateIssueTitle = (content: string): string => {
    const words = content.split(' ').slice(0, 8);
    return words.join(' ') + (content.split(' ').length > 8 ? '...' : '');
  };

  const extractKeywords = (content: string): string => {
    const words = content.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 3)
      .slice(0, 5);
    
    return words.join(' ');
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <div className="p-1.5 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-lg">
          <Sparkles className="h-4 w-4 text-purple-600 dark:text-purple-400" />
        </div>
        <span className="text-sm font-medium">Suggested Actions</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {suggestions.map((suggestion) => (
          <Button
            key={suggestion.id}
            variant="outline"
            className="h-auto p-3 justify-start hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 dark:hover:from-purple-900/20 dark:hover:to-pink-900/20 transition-all duration-200"
            onClick={() => onActionSelect(suggestion.action, suggestion.data)}
          >
            <div className="flex items-start gap-3 w-full">
              <div className="p-1.5 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-lg flex-shrink-0">
                {suggestion.icon}
              </div>
              <div className="flex-1 text-left">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-sm">{suggestion.title}</span>
                  <Badge variant="secondary" className="text-xs">
                    {Math.round(suggestion.confidence * 100)}%
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground text-wrap">
                  {suggestion.description}
                </p>
              </div>
            </div>
          </Button>
        ))}
      </div>
    </div>
  );
}
