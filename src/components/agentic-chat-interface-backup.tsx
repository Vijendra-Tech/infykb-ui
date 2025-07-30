"use client";

import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";

import { 
  Send, 
  Bot, 
  User, 
  ExternalLink,
  Sparkles,
  Bug,
  Lightbulb,
  Copy,
  ThumbsUp,
  ThumbsDown,
  Network,
  Search,
  RefreshCw,
  Target
} from "lucide-react";

import { GitHubIssue, githubService, formatIssueDate } from "@/lib/github-service";
import { enhancedGitHubService, MultiRepoSearchResult } from "@/lib/enhanced-github-service";
import { agenticAI, AnalysisResult, SolutionSuggestion } from "@/lib/agentic-ai-service";
import { 
  CodeSnippetCard, 
  EnhancedIssueSearch, 
  AgenticActionSuggestions 
} from "@/components/generative-ui-components";
import { useToast } from "@/components/ui/use-toast";
import { db } from "@/lib/database";
import { useLiveQuery } from "dexie-react-hooks";

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
  type?: 'text' | 'code' | 'analysis';
  metadata?: {
    analysis?: AnalysisResult;
    suggestions?: SolutionSuggestion[];
    relatedIssues?: GitHubIssue[];
    enhancedIssues?: MultiRepoSearchResult[];
    confidence?: number;
    followUpQuestions?: string[];
    showGenerativeActions?: boolean;
  };
}

interface KnowledgeGraphNode {
  id: string;
  label: string;
  type: 'concept' | 'issue' | 'solution' | 'code';
  description?: string;
  connections: string[];
}

interface AgenticChatProps {
  className?: string;
}

export function AgenticChatInterface({ className }: AgenticChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [relatedIssues, setRelatedIssues] = useState<GitHubIssue[]>([]);
  const [knowledgeNodes, setKnowledgeNodes] = useState<KnowledgeGraphNode[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [sideDrawerOpen, setSideDrawerOpen] = useState(false);
  const [sideDrawerContent, setSideDrawerContent] = useState<'issues' | 'knowledge' | null>(null);
  const [activeTab, setActiveTab] = useState("chat");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedMessages, setExpandedMessages] = useState<Set<string>>(new Set());
  const [messageReactions, setMessageReactions] = useState<Record<string, 'up' | 'down' | null>>({});

  
  // Live query for synced GitHub issues count
  const syncedIssues = useLiveQuery(() => db.githubIssues.toArray()) || [];
  const syncedIssuesCount = syncedIssues.length;

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const handleScroll = () => {
    // Scroll handling for other features (auto-scroll to bottom, etc.)
    // Header visibility logic removed since header is now always visible
  };  }, []);

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue.trim(),
      sender: 'user',
      timestamp: new Date(),
      type: 'text'
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);
    setIsTyping(true);

    try {
      // Analyze the user's query
      const analysis = await agenticAI.analyzeQuery(userMessage.content);
      
      // Enhanced multi-repository issue search
      const [legacyIssues, enhancedIssues] = await Promise.all([
        githubService.searchIssues(userMessage.content, {
          limit: 5,
          minRelevance: 0.3
        }),
        enhancedGitHubService.searchByMessageContent(userMessage.content)
      ]);

      // Create assistant response with enhanced metadata
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: analysis.response,
        sender: 'assistant',
        timestamp: new Date(),
        type: 'analysis',
        metadata: {
          analysis,
          suggestions: analysis.suggestions,
          relatedIssues: legacyIssues,
          enhancedIssues: enhancedIssues,
          confidence: analysis.confidence,
          followUpQuestions: analysis.followUpQuestions,
          showGenerativeActions: true
        }
      };

      setMessages(prev => [...prev, assistantMessage]);
      setRelatedIssues([...legacyIssues, ...enhancedIssues.map(r => r.issue)]);
      
      // Update knowledge graph (simplified)
      const newNodes: KnowledgeGraphNode[] = [
        {
          id: `query-${Date.now()}`,
          label: analysis.intent.replace('_', ' '),
          type: 'concept',
          description: userMessage.content.substring(0, 100),
          connections: analysis.keywords
        }
      ];
      
      setKnowledgeNodes(prev => [...prev, ...newNodes]);
      
    } catch (error) {
      console.error('Error processing message:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "I apologize, but I encountered an error while processing your request. Please try again.",
        sender: 'assistant',
        timestamp: new Date(),
        type: 'text'
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setIsTyping(false);
    }
  };

  const openSideDrawer = (content: 'issues' | 'knowledge') => {
    setSideDrawerContent(content);
    setSideDrawerOpen(true);
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied to clipboard",
        description: "Text has been copied to your clipboard.",
      });
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const toggleMessageExpansion = (messageId: string) => {
    setExpandedMessages(prev => {
      const newSet = new Set(prev);
      if (newSet.has(messageId)) {
        newSet.delete(messageId);
      } else {
        newSet.add(messageId);
      }
      return newSet;
    });
  };

  const handleMessageReaction = (messageId: string, reaction: 'up' | 'down') => {
    setMessageReactions(prev => ({
      ...prev,
      [messageId]: prev[messageId] === reaction ? null : reaction
    }));
  };

  const filteredIssues = relatedIssues.filter(issue => 
    issue.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    issue.body?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderMessage = (message: Message) => {
    const isUser = message.sender === 'user';
    const isExpanded = expandedMessages.has(message.id);
    const reaction = messageReactions[message.id];
    
    return (
      <div key={message.id} className={`group flex ${isUser ? 'justify-end' : 'justify-start'} mb-8`}>
        <div className={`flex items-start gap-4 max-w-[85%] ${isUser ? 'flex-row-reverse' : ''}`}>
          {/* Enhanced Avatar with Status */}
          <div className="relative flex-shrink-0">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg ${
              isUser 
                ? 'bg-gradient-to-br from-blue-500 to-blue-600 ring-2 ring-blue-200 dark:ring-blue-800' 
                : 'bg-gradient-to-br from-purple-500 via-blue-500 to-indigo-600 ring-2 ring-purple-200 dark:ring-purple-800'
            }`}>
              {isUser ? <User className="h-5 w-5 text-white" /> : <Bot className="h-5 w-5 text-white" />}
            </div>
            {!isUser && (
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-gray-900 flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
              </div>
            )}
          </div>
          
          {/* Enhanced Message Bubble */}
          <div className={`relative rounded-2xl px-6 py-4 shadow-lg backdrop-blur-sm transition-all duration-300 hover:shadow-xl ${
            isUser 
              ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white ml-4' 
              : 'bg-white/80 dark:bg-gray-800/80 border border-white/20 dark:border-gray-700/50 mr-4'
          }`}>
            {/* Message Header */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className={`text-xs font-medium ${
                  isUser ? 'text-blue-100' : 'text-muted-foreground'  
                }`}>
                  {isUser ? 'You' : 'AI Assistant'}
                </span>
                {message.metadata?.confidence && (
                  <Badge variant="secondary" className="text-xs px-2 py-0.5">
                    {Math.round(message.metadata.confidence * 100)}% confidence
                  </Badge>
                )}
              </div>
              <span className={`text-xs ${
                isUser ? 'text-blue-100' : 'text-muted-foreground'
              }`}>
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>

            {/* Message Content */}
            <div className="prose prose-sm max-w-none dark:prose-invert">
              <div className={`whitespace-pre-wrap leading-relaxed ${
                isUser ? 'text-white' : 'text-gray-900 dark:text-gray-100'
              }`}>
                {isExpanded || message.content.length <= 300 
                  ? message.content 
                  : `${message.content.substring(0, 300)}...`
                }
              </div>
              {message.content.length > 300 && (
                <button
                  onClick={() => toggleMessageExpansion(message.id)}
                  className={`mt-2 text-xs underline hover:no-underline ${
                    isUser ? 'text-blue-100' : 'text-blue-600 dark:text-blue-400'
                  }`}
                >
                  {isExpanded ? 'Show less' : 'Show more'}
                </button>
              )}
            </div>
            
            {/* Enhanced Code Snippets */}
            {!isUser && message.metadata?.suggestions && (
              <div className="mt-4 space-y-3">
                {message.metadata.suggestions
                  .filter(suggestion => suggestion.code)
                  .map((suggestion, index) => (
                    <CodeSnippetCard
                      key={index}
                      suggestion={suggestion}
                      onCopy={copyToClipboard}
                    />
                  ))
                }
              </div>
            )}

            {/* Enhanced Action Buttons */}
            {!isUser && message.metadata?.suggestions && (
              <div className="mt-4 pt-4 border-t border-white/10 dark:border-gray-700/50">
                <div className="flex flex-wrap gap-2">
                  {(message.metadata.relatedIssues?.length || 0) > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openSideDrawer('issues')}
                      className="text-xs bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 dark:bg-red-900/20 dark:hover:bg-red-900/30 dark:text-red-300 dark:border-red-800"
                    >
                      <Bug className="h-3 w-3 mr-1" />
                      {message.metadata.relatedIssues?.length || 0} Similar Issues
                    </Button>
                  )}
                  {(message.metadata.enhancedIssues?.length || 0) > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openSideDrawer('issues')}
                      className="text-xs bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 dark:bg-purple-900/20 dark:hover:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800"
                    >
                      <Search className="h-3 w-3 mr-1" />
                      {message.metadata.enhancedIssues?.length || 0} Multi-Repo Issues
                    </Button>
                  )}
                  {knowledgeNodes.length > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openSideDrawer('knowledge')}
                      className="text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 dark:bg-blue-900/20 dark:hover:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800"
                    >
                      <Network className="h-3 w-3 mr-1" />
                      Knowledge Graph
                    </Button>
                  )}
                </div>
              </div>
            )}

            {/* Generative Actions */}
            {!isUser && message.metadata?.showGenerativeActions && (
              <div className="mt-4 pt-4 border-t border-white/10 dark:border-gray-700/50">
                <AgenticActionSuggestions
                  messageContent={message.content}
                  analysisResult={message.metadata.analysis}
                  onActionSelect={(action, data) => {
                    if (action === 'search-issues') {
                      openSideDrawer('issues');
                    } else if (action === 'create-issue') {
                      // GitHub issue creation will be handled by the GitHubIssueCreator component
                    }
                  }}
                />
              </div>
            )}
            
            {/* Enhanced Follow-up Questions */}
            {message.metadata?.followUpQuestions && message.metadata.followUpQuestions.length > 0 && (
              <div className="mt-4 pt-4 border-t border-white/10 dark:border-gray-700/50">
                <div className="flex items-center gap-2 mb-3">
                  <Lightbulb className="h-4 w-4 text-amber-500" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Suggested follow-ups:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {message.metadata.followUpQuestions.map((question, index) => {
                    const isGitHubIssueAction = question.toLowerCase().includes('create github issue');
                    return (
                      <button
                        key={index}
                        onClick={() => {
                          setInputValue(question);
                        }}
                        className={`text-sm px-3 py-2 rounded-lg transition-all duration-200 hover:shadow-sm ${
                          isGitHubIssueAction 
                            ? 'bg-gradient-to-r from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 text-green-800 border border-green-200 dark:from-green-900/20 dark:to-emerald-900/20 dark:hover:from-green-900/30 dark:hover:to-emerald-900/30 dark:text-green-300 dark:border-green-800'
                            : 'bg-gradient-to-r from-amber-50 to-orange-50 hover:from-amber-100 hover:to-orange-100 text-amber-800 border border-amber-200 dark:from-amber-900/20 dark:to-orange-900/20 dark:hover:from-amber-900/30 dark:hover:to-orange-900/30 dark:text-amber-300 dark:border-amber-800'
                        }`}
                      >
                        {isGitHubIssueAction && <GitBranch className="h-3 w-3 mr-1 inline" />}
                        {question}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
            
            {/* Enhanced Message Actions */}
            <div className="absolute -bottom-2 right-4 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200 bg-white dark:bg-gray-800 rounded-full shadow-lg border border-gray-200 dark:border-gray-700 px-2 py-1">
              <button 
                onClick={() => copyToClipboard(message.content)}
                className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                title="Copy message"
              >
                <Copy className="h-3 w-3 text-gray-600 dark:text-gray-400" />
              </button>
              <button 
                className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                title="Share message"
              >
                <Share className="h-3 w-3 text-gray-600 dark:text-gray-400" />
              </button>
              {!isUser && (
                <>
                  <Separator orientation="vertical" className="h-4 mx-1" />
                  <button 
                    onClick={() => handleMessageReaction(message.id, 'up')}
                    className={`p-1.5 rounded-full transition-colors ${
                      reaction === 'up' 
                        ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' 
                        : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400'
                    }`}
                    title="Helpful"
                  >
                    <ThumbsUp className="h-3 w-3" />
                  </button>
                  <button 
                    onClick={() => handleMessageReaction(message.id, 'down')}
                    className={`p-1.5 rounded-full transition-colors ${
                      reaction === 'down' 
                        ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' 
                        : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400'
                    }`}
                    title="Not helpful"
                  >
                    <ThumbsDown className="h-3 w-3" />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderSideDrawerContent = () => {
    if (sideDrawerContent === 'issues') {
      return (
        <div className="space-y-4">
          <EnhancedIssueSearch
            messageContent={messages[messages.length - 1]?.content}
            onIssueSelect={(result) => {
              // Handle issue selection - could open in new tab or show details
              window.open(result.issue.html_url, '_blank');
            }}
          />
        </div>
      );
    }

    if (sideDrawerContent === 'knowledge') {
      return (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Bug className="h-5 w-5 text-red-500" />
            <h3 className="text-lg font-semibold">Similar Issues</h3>
            <Badge variant="secondary">{relatedIssues.length}</Badge>
          </div>
          <Separator />
          
          {/* Search functionality inside drawer */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search issues..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-white/80 dark:bg-gray-800/80 border-gray-200/50 dark:border-gray-700/50"
            />
          </div>
          
          <ScrollArea className="h-[calc(100vh-280px)]">
            <div className="space-y-3">
              {filteredIssues.length === 0 ? (
                <div className="text-center py-8">
                  <Bug className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    {searchQuery ? 'No issues match your search.' : 'No issues found.'}
                  </p>
                </div>
              ) : (
                filteredIssues.map((issue) => (
                <Card key={issue.id} className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <h4 className="font-medium text-sm mb-1">{issue.title}</h4>
                      <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                        {issue.body?.substring(0, 100)}...
                      </p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>#{issue.number}</span>
                        <span>•</span>
                        <span>{formatIssueDate(issue.created_at)}</span>
                        <span>•</span>
                        <Badge variant={issue.state === 'open' ? 'default' : 'secondary'} className="text-xs">
                          {issue.state}
                        </Badge>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" asChild>
                      <a href={issue.html_url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </Button>
                  </div>
                </Card>
                ))
              )}
            </div>
          </ScrollArea>
        </div>
      );
    }

    if (sideDrawerContent === 'knowledge') {
      return (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Network className="h-5 w-5 text-blue-500" />
            <h3 className="text-lg font-semibold">Knowledge Graph</h3>
            <Badge variant="secondary">{knowledgeNodes.length} nodes</Badge>
          </div>
          <Separator />
          <ScrollArea className="h-[calc(100vh-200px)]">
            <div className="space-y-3">
              {knowledgeNodes.map((node) => (
                <Card key={node.id} className="p-4">
                  <div className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      node.type === 'concept' ? 'bg-blue-100 text-blue-600' :
                      node.type === 'solution' ? 'bg-green-100 text-green-600' :
                      node.type === 'code' ? 'bg-purple-100 text-purple-600' :
                      'bg-red-100 text-red-600'
                    }`}>
                      {node.type === 'concept' ? <Lightbulb className="h-4 w-4" /> :
                       node.type === 'solution' ? <Sparkles className="h-4 w-4" /> :
                       node.type === 'code' ? <FileText className="h-4 w-4" /> :
                       <Bug className="h-4 w-4" />}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-sm mb-1">{node.label}</h4>
                      {node.description && (
                        <p className="text-xs text-muted-foreground mb-2">{node.description}</p>
                      )}
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <GitBranch className="h-3 w-3" />
                        <span>{node.connections.length} connections</span>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </div>
      );
    }

    return null;
  };

  return (
    <div className={`flex flex-col h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950/90 ${className || ""}`}>

      {/* Chat Content Area */}
      <div className="flex-1 flex flex-col min-h-0">
            {/* Messages Area */}
            <div className="flex-1 min-h-0 relative">
              <ScrollArea className="absolute inset-0" ref={chatContainerRef}>
                <div className="px-8 py-8">
                  <div className="max-w-4xl mx-auto">
                    {messages.length === 0 ? (
                      <div className="flex flex-col items-center justify-center text-center min-h-[65vh]">
                        <div className="relative mb-10 group">
                          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 dark:from-slate-100 dark:via-slate-200 dark:to-slate-300 flex items-center justify-center shadow-2xl ring-1 ring-slate-900/10 dark:ring-slate-100/10 transition-all duration-500 group-hover:shadow-3xl group-hover:scale-105">
                            <Bot className="h-9 w-9 text-white dark:text-slate-900" />
                          </div>
                          <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full border-3 border-white dark:border-slate-950 shadow-lg flex items-center justify-center">
                            <Sparkles className="h-3 w-3 text-white animate-pulse" />
                          </div>
                          <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-slate-900/5 to-slate-700/5 dark:from-slate-100/5 dark:to-slate-300/5 blur-xl group-hover:blur-2xl transition-all duration-500"></div>
                        </div>
                        <div className="space-y-4 mb-10">
                          <h3 className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
                            AI Assistant
                          </h3>
                          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-lg leading-relaxed font-medium">
                            Your intelligent coding companion for development excellence
                          </p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-2xl mb-8">
                          <div className="group p-4 rounded-2xl bg-slate-50/50 dark:bg-slate-900/50 border border-slate-200/50 dark:border-slate-800/50 hover:bg-slate-100/50 dark:hover:bg-slate-800/50 transition-all duration-300 hover:shadow-lg">
                            <Code className="h-6 w-6 text-blue-600 dark:text-blue-400 mb-2 group-hover:scale-110 transition-transform" />
                            <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-1">Code Analysis</h4>
                            <p className="text-sm text-slate-600 dark:text-slate-400">Review, debug, and optimize your code</p>
                          </div>
                          <div className="group p-4 rounded-2xl bg-slate-50/50 dark:bg-slate-900/50 border border-slate-200/50 dark:border-slate-800/50 hover:bg-slate-100/50 dark:hover:bg-slate-800/50 transition-all duration-300 hover:shadow-lg">
                            <Lightbulb className="h-6 w-6 text-emerald-600 dark:text-emerald-400 mb-2 group-hover:scale-110 transition-transform" />
                            <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-1">Best Practices</h4>
                            <p className="text-sm text-slate-600 dark:text-slate-400">Learn industry standards and patterns</p>
                          </div>
                          <div className="group p-4 rounded-2xl bg-slate-50/50 dark:bg-slate-900/50 border border-slate-200/50 dark:border-slate-800/50 hover:bg-slate-100/50 dark:hover:bg-slate-800/50 transition-all duration-300 hover:shadow-lg">
                            <Bug className="h-6 w-6 text-purple-600 dark:text-purple-400 mb-2 group-hover:scale-110 transition-transform" />
                            <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-1">Debugging</h4>
                            <p className="text-sm text-slate-600 dark:text-slate-400">Identify and resolve issues quickly</p>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-3 justify-center">
                          <Badge variant="secondary" className="bg-blue-50/80 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 border border-blue-200/50 dark:border-blue-800/50 px-4 py-2 font-medium shadow-sm">
                            TypeScript
                          </Badge>
                          <Badge variant="secondary" className="bg-emerald-50/80 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200/50 dark:border-emerald-800/50 px-4 py-2 font-medium shadow-sm">
                            React
                          </Badge>
                          <Badge variant="secondary" className="bg-purple-50/80 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300 border border-purple-200/50 dark:border-purple-800/50 px-4 py-2 font-medium shadow-sm">
                            Node.js
                          </Badge>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-8 pb-32">
                        {messages.map(renderMessage)}
                        <div ref={messagesEndRef} />
                      </div>
                    )}
                  </div>
                </div>
              </ScrollArea>
            </div>

            {/* Executive Typing Indicator */}
            {isTyping && (
              <div className="px-8 py-4 border-t border-slate-200/40 dark:border-slate-800/40 bg-white/98 dark:bg-slate-950/98 backdrop-blur-xl">
                <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400 max-w-4xl mx-auto">
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-slate-900 to-slate-700 dark:from-slate-100 dark:to-slate-300 flex items-center justify-center shadow-sm">
                        <Bot className="h-4 w-4 text-white dark:text-slate-900" />
                      </div>
                      <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse"></div>
                    </div>
                    <div className="flex gap-1.5">
                      <div className="w-2 h-2 bg-slate-400 dark:bg-slate-500 rounded-full animate-pulse" />
                      <div className="w-2 h-2 bg-slate-400 dark:bg-slate-500 rounded-full animate-pulse" style={{ animationDelay: '0.3s' }} />
                      <div className="w-2 h-2 bg-slate-400 dark:bg-slate-500 rounded-full animate-pulse" style={{ animationDelay: '0.6s' }} />
                    </div>
                  </div>
                  <span className="font-medium text-slate-700 dark:text-slate-300">AI is analyzing and crafting response...</span>
                </div>
              </div>
            )}

            {/* Executive Input Area */}
            <div className="flex-shrink-0 border-t border-slate-200/40 dark:border-slate-800/40 bg-white/98 dark:bg-slate-950/98 backdrop-blur-2xl">
              <div className="p-8">
                <div className="max-w-4xl mx-auto">
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-slate-200/20 to-slate-300/20 dark:from-slate-700/20 dark:to-slate-600/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="relative">
                      <Textarea
                        ref={textareaRef}
                        value={inputValue}
                        onChange={handleTextareaChange}
                        onKeyDown={handleKeyPress}
                        placeholder="Ask me anything about development, architecture, or best practices..."
                        className="min-h-[70px] max-h-[200px] resize-none pr-16 bg-white/90 dark:bg-slate-900/90 border border-slate-200/60 dark:border-slate-700/60 focus:ring-2 focus:ring-slate-900/20 dark:focus:ring-slate-100/20 focus:border-slate-400 dark:focus:border-slate-500 rounded-2xl shadow-lg text-base placeholder:text-slate-500 dark:placeholder:text-slate-400 transition-all duration-300 hover:shadow-xl focus:shadow-xl backdrop-blur-sm"
                        disabled={isLoading}
                      />
                      <Button
                        onClick={handleSendMessage}
                        disabled={!inputValue.trim() || isLoading}
                        className="absolute right-4 bottom-4 h-10 w-10 p-0 bg-gradient-to-br from-slate-900 to-slate-700 dark:from-slate-100 dark:to-slate-300 hover:from-slate-800 hover:to-slate-600 dark:hover:from-slate-200 dark:hover:to-slate-400 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105 group"
                      >
                        <Send className="h-4 w-4 text-white dark:text-slate-900 group-hover:scale-110 transition-transform" />
                      </Button>
                    </div>
                  </div>
                  {/* Enhanced Status Bar */}
                  <div className="flex justify-between items-center mt-4 px-1">
                    <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                      <span className="flex items-center gap-1.5">
                        <kbd className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono border border-slate-200 dark:border-slate-700">Ctrl</kbd>
                        <span>+</span>
                        <kbd className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono border border-slate-200 dark:border-slate-700">Enter</kbd>
                        <span className="ml-1">to send</span>
                      </span>
                      <span className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                        <span>AI Ready</span>
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                      <span className={`transition-colors ${
                        inputValue.length > 1800 ? 'text-amber-600 dark:text-amber-400' : 
                        inputValue.length > 1500 ? 'text-orange-600 dark:text-orange-400' : ''
                      }`}>
                        {inputValue.length}/2000
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
      </div>

      {/* Side Drawer */}
      <Sheet open={sideDrawerOpen} onOpenChange={setSideDrawerOpen}>
        <SheetContent side="right" className="w-[400px] sm:w-[540px]">
          <SheetHeader>
            <SheetTitle>
              {sideDrawerContent === 'issues' ? 'Similar Issues' : 'Knowledge Graph'}
            </SheetTitle>
            <SheetDescription>
              {sideDrawerContent === 'issues' 
                ? 'Related GitHub issues that might help with your query'
                : 'Knowledge graph showing relationships between concepts'
              }
            </SheetDescription>
          </SheetHeader>
          <div className="mt-6">
            {renderSideDrawerContent()}
          </div>
        </SheetContent>
      </Sheet>

      {/* GitHub Issue Creator Modal */}
      <GitHubIssueCreator
        messageContext={gitHubIssueContext?.query}
        suggestedTitle={gitHubIssueContext ? `${gitHubIssueContext.intent === 'bug_report' ? 'Bug: ' : 
                         gitHubIssueContext.intent === 'feature_request' ? 'Feature Request: ' : 
                         gitHubIssueContext.intent === 'performance' ? 'Performance: ' : 
                         gitHubIssueContext.intent === 'configuration' ? 'Configuration: ' : 
                         gitHubIssueContext.intent === 'question' ? 'Question: ' : ''}${gitHubIssueContext.query.slice(0, 80)}` : ''}
        suggestedBody={gitHubIssueContext ? `## Context\n${gitHubIssueContext.query}\n\n## Keywords\n${gitHubIssueContext.keywords.join(', ')}\n\n## Additional Information\n<!-- Please provide more details about your issue -->` : ''}
        suggestedLabels={gitHubIssueContext ? (gitHubIssueContext.intent === 'bug_report' ? ['bug'] : 
                        gitHubIssueContext.intent === 'feature_request' ? ['enhancement'] : 
                        gitHubIssueContext.intent === 'performance' ? ['performance'] : 
                        gitHubIssueContext.intent === 'configuration' ? ['question', 'configuration'] : 
                        ['question']) : []}
        showTriggerButton={false}
        isOpen={showGitHubIssueCreator}
        onOpenChange={(open) => {
          setShowGitHubIssueCreator(open);
          if (!open) {
            setGitHubIssueContext(null);
          }
        }}
        onIssueCreated={(issue) => {
          console.log('Issue created:', issue);
          setShowGitHubIssueCreator(false);
          setGitHubIssueContext(null);
          // Optionally show a success message or update the UI
        }}
      />
    </div>
  );
}
