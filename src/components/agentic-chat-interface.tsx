"use client";

import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
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
  Target,
  Paperclip,
  Code,
  Settings,
  Plus,
  MessageSquare
} from "lucide-react";

import { GitHubIssue, githubService, formatIssueDate } from "@/lib/github-service";
import { enhancedGitHubService, MultiRepoSearchResult } from "@/lib/enhanced-github-service";
import { agenticAI, AnalysisResult, SolutionSuggestion } from "@/lib/agentic-ai-service";
import { CodeSnippetCard } from "@/components/generative-ui-components";
import { useToast } from "@/components/ui/use-toast";
import { useChatHistory } from "@/hooks/use-chat-history";
import { generateUUID } from "@/lib/utils";

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
  const [knowledgeNodes] = useState<KnowledgeGraphNode[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [sideDrawerOpen, setSideDrawerOpen] = useState(false);
  const [sideDrawerContent, setSideDrawerContent] = useState<'issues' | 'knowledge' | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [messageReactions, setMessageReactions] = useState<Record<string, 'up' | 'down' | null>>({});
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  
  // Dexie-based chat history integration
  const chatHistory = useChatHistory();
  
  // Load existing sessions on component mount
  useEffect(() => {
    chatHistory.loadSessions();
  }, []);

  const { toast } = useToast();
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom when new messages are added
  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Create a new chat session when the first user message is sent
  useEffect(() => {
    const createNewSession = async () => {
      if (messages.length > 0 && !currentChatId) {
        const firstUserMessage = messages.find(m => m.sender === 'user');
        if (firstUserMessage) {
          const chatTitle = firstUserMessage.content.length > 50 
            ? firstUserMessage.content.substring(0, 50) + '...'
            : firstUserMessage.content;
          
          try {
            console.log('Creating new chat session:', chatTitle);
            // Create new chat session in Dexie
            const session = await chatHistory.createSession({
              title: chatTitle || 'New Chat',
              userId: 'user-123', // TODO: Get actual user ID from auth context
              organizationId: 'org-123', // TODO: Get actual org ID from auth context
              metadata: {
                isFavorite: false,
                summary: firstUserMessage.content.substring(0, 100)
              }
            });
            
            console.log('Chat session created:', session);
            setCurrentChatId(session.uuid);
            
            // Save the first user message to the new session
            await chatHistory.addMessage({
              sessionId: session.uuid,
              content: firstUserMessage.content,
              sender: 'user',
              type: 'text'
            });
            
            console.log('First message saved to session');
          } catch (err) {
            console.error('Failed to create chat session:', err);
          }
        }
      }
    };
    
    createNewSession();
  }, [messages, currentChatId, chatHistory]);

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
    // Auto-resize textarea
    e.target.style.height = 'auto';
    e.target.style.height = e.target.scrollHeight + 'px';
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
      id: generateUUID(),
      content: inputValue,
      sender: 'user',
      timestamp: new Date(),
      type: 'text'
    };

    setMessages(prev => [...prev, userMessage]);
    
    // Save user message to Dexie if we have a current chat session
    // (Skip saving if this is the first message as it's handled in the useEffect)
    if (currentChatId && messages.length > 0) {
      try {
        await chatHistory.addMessage({
          sessionId: currentChatId,
          content: inputValue,
          sender: 'user',
          type: 'text'
        });
        console.log('User message saved to session');
      } catch (err) {
        console.error('Failed to save user message:', err);
      }
    }
    setInputValue("");
    setIsLoading(true);
    setIsTyping(true);

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    try {
      // Simulate AI processing
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

      // Get AI analysis
      const analysis = await agenticAI.analyzeQuery(userMessage.content);
      
      // Search for related issues
      const issues = await githubService.searchIssues(userMessage.content);
      setRelatedIssues(issues);

      // Enhanced search across multiple repositories
      const enhancedResults = await enhancedGitHubService.searchAcrossRepositories({
        query: userMessage.content,
        includeBody: true,
        includeComments: false,
        state: 'all',
        limit: 20,
        minRelevance: 0.3
      });

      const assistantMessage: Message = {
        id: generateUUID(),
        content: analysis.response,
        sender: 'assistant',
        timestamp: new Date(),
        type: analysis.type,
        metadata: {
          analysis,
          relatedIssues: issues,
          enhancedIssues: enhancedResults,
          confidence: analysis.confidence,
          followUpQuestions: analysis.followUpQuestions
        }
      };

      setMessages(prev => [...prev, assistantMessage]);
      
      // Save assistant message to Dexie if we have a current chat session
      if (currentChatId) {
        try {
          await chatHistory.addMessage({
            sessionId: currentChatId,
            content: analysis.response,
            sender: 'assistant',
            type: analysis.type as 'text' | 'code' | 'analysis' | 'error',
            metadata: {
              analysis,
              relatedIssues: issues,
              confidence: analysis.confidence,
              followUpQuestions: analysis.followUpQuestions
            }
          });
          console.log('Assistant message saved to session');
        } catch (err) {
          console.error('Failed to save assistant message:', err);
        }
      }
    } catch (error) {
      console.error('Error processing message:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "I apologize, but I encountered an error processing your request. Please try again.",
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

  const startNewChat = () => {
    setMessages([]);
    setCurrentChatId(null);
    setInputValue("");
    setRelatedIssues([]);
    setMessageReactions({});
    setSideDrawerOpen(false);
    setSideDrawerContent(null);
    setSearchQuery("");
    
    toast({
      title: "New Chat Started",
      description: "Previous conversation has been saved to history.",
    });
  };



  const handleMessageReaction = (messageId: string, reaction: 'up' | 'down') => {
    setMessageReactions(prev => ({
      ...prev,
      [messageId]: prev[messageId] === reaction ? null : reaction
    }));
  };

  // Filter issues based on search query
  const filteredIssues = relatedIssues.filter(issue =>
    issue.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    issue.body?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderMessage = (message: Message) => {
    const isUser = message.sender === 'user';
    const reaction = messageReactions[message.id];
    
    return (
      <div key={message.id} className={`group flex ${isUser ? 'justify-end' : 'justify-start'} mb-8`}>
        <div className={`flex items-start gap-4 max-w-[85%] ${isUser ? 'flex-row-reverse' : ''}`}>
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg ring-2 ring-white dark:ring-slate-900 ${
              isUser 
                ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white' 
                : 'bg-gradient-to-br from-slate-800 to-slate-900 dark:from-slate-200 dark:to-slate-300 text-white dark:text-slate-900'
            }`}>
              {isUser ? <User className="h-5 w-5" /> : <Bot className="h-5 w-5" />}
            </div>
            {!isUser && (
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-900 shadow-sm animate-pulse" />
            )}
          </div>

          {/* Message Content */}
          <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
            {/* Message Header */}
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                {isUser ? 'You' : 'AI Assistant'}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {message.timestamp.toLocaleTimeString()}
              </span>
              {message.metadata?.confidence && (
                <Badge variant="secondary" className="text-xs">
                  {Math.round(message.metadata.confidence * 100)}% confident
                </Badge>
              )}
            </div>

            {/* Professional Message Bubble */}
            <div className={`relative rounded-2xl px-5 py-4 max-w-full shadow-sm ${
              isUser
                ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white ml-16 rounded-br-md'
                : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200/60 dark:border-slate-700/60 mr-16 rounded-bl-md hover:shadow-md transition-shadow duration-200'
            }`}>
              {/* Message Content */}
              <div className="prose prose-sm max-w-none dark:prose-invert">
                {message.type === 'code' ? (
                  <CodeSnippetCard 
                    suggestion={{
                      type: 'code_snippet',
                      confidence: 1.0,
                      title: 'Code Snippet',
                      description: 'Generated code snippet',
                      code: {
                        language: 'javascript',
                        snippet: message.content,
                        explanation: 'Code snippet from chat message'
                      }
                    }}
                    onCopy={(code) => {
                      navigator.clipboard.writeText(code);
                    }}
                  />
                ) : (
                  <p className="whitespace-pre-wrap break-words">{message.content}</p>
                )}
              </div>

              {/* Enhanced Issues Display */}
              {message.metadata?.enhancedIssues && message.metadata.enhancedIssues.length > 0 && (
                <div className="mt-4 p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-700">
                  <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    Related Issues Across Repositories
                  </h4>
                  <div className="space-y-2">
                    {message.metadata.enhancedIssues.slice(0, 3).map((result, index) => (
                      <div key={index} className="text-sm p-2 bg-white dark:bg-slate-800 rounded border">
                        <div className="font-medium">{result.repository}</div>
                        <div className="text-slate-600 dark:text-slate-400">{result.title}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Follow-up Questions */}
              {message.metadata?.followUpQuestions && message.metadata.followUpQuestions.length > 0 && (
                <div className="mt-4 space-y-2">
                  <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300">Follow-up questions:</h4>
                  <div className="flex flex-wrap gap-2">
                    {message.metadata.followUpQuestions.map((question, index) => (
                      <button
                        key={index}
                        onClick={() => setInputValue(question)}
                        className="text-sm px-3 py-2 rounded-lg transition-all duration-200 hover:shadow-sm bg-gradient-to-r from-amber-50 to-orange-50 hover:from-amber-100 hover:to-orange-100 text-amber-800 border border-amber-200 dark:from-amber-900/20 dark:to-orange-900/20 dark:hover:from-amber-900/30 dark:hover:to-orange-900/30 dark:text-amber-300 dark:border-amber-800"
                      >
                        {question}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(message.content)}
                    className="h-7 px-2 text-xs"
                  >
                    <Copy className="h-3 w-3 mr-1" />
                    Copy
                  </Button>
                  {message.metadata?.relatedIssues && message.metadata.relatedIssues.length > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openSideDrawer('issues')}
                      className="h-7 px-2 text-xs"
                    >
                      <Bug className="h-3 w-3 mr-1" />
                      {message.metadata.relatedIssues?.length || 0} Similar Issues
                    </Button>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleMessageReaction(message.id, 'up')}
                    className={`h-7 w-7 p-0 ${reaction === 'up' ? 'text-green-600 bg-green-50 dark:bg-green-900/20' : ''}`}
                  >
                    <ThumbsUp className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleMessageReaction(message.id, 'down')}
                    className={`h-7 w-7 p-0 ${reaction === 'down' ? 'text-red-600 bg-red-50 dark:bg-red-900/20' : ''}`}
                  >
                    <ThumbsDown className="h-3 w-3" />
                  </Button>
                </div>
              </div>
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
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Similar Issues ({filteredIssues.length})</h3>
          </div>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search issues..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <ScrollArea className="h-[400px]">
            <div className="space-y-3">
              {filteredIssues.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  {searchQuery ? 'No issues match your search.' : 'No related issues found.'}
                </p>
              ) : (
                filteredIssues.map((issue) => (
                  <Card key={issue.id} className="p-3 hover:shadow-md transition-shadow cursor-pointer">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm line-clamp-2 mb-1">{issue.title}</h4>
                        <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                          {issue.body?.substring(0, 100)}...
                        </p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>#{issue.number}</span>
                          <span>•</span>
                          <span>{issue.state}</span>
                          <span>•</span>
                          <span>{formatIssueDate(issue.created_at)}</span>
                        </div>
                      </div>
                      <ExternalLink className="h-4 w-4 text-muted-foreground flex-shrink-0" />
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
          <h3 className="text-lg font-semibold">Knowledge Graph ({knowledgeNodes.length})</h3>
          <ScrollArea className="h-[400px]">
            <div className="space-y-3">
              {knowledgeNodes.map((node) => (
                <Card key={node.id} className="p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`w-2 h-2 rounded-full ${
                      node.type === 'concept' ? 'bg-blue-500' :
                      node.type === 'issue' ? 'bg-red-500' :
                      node.type === 'solution' ? 'bg-green-500' : 'bg-purple-500'
                    }`} />
                    <span className="font-medium text-sm">{node.label}</span>
                  </div>
                  {node.description && (
                    <p className="text-xs text-muted-foreground mb-2">{node.description}</p>
                  )}
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Network className="h-3 w-3" />
                    <span>{node.connections.length} connections</span>
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
            <div className="px-6 py-6">
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
                    </div>
                    
                    <div className="space-y-4 mb-12">
                      <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 via-slate-700 to-slate-900 dark:from-slate-100 dark:via-slate-300 dark:to-slate-100 bg-clip-text text-transparent">
                        AI Assistant
                      </h1>
                      <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
                        Your intelligent coding companion. Ask questions, get solutions, and explore your codebase with AI-powered insights.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl">
                      <Card className="p-6 hover:shadow-lg transition-all duration-300 cursor-pointer border-slate-200/50 dark:border-slate-800/50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                            <Bug className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                          </div>
                          <h3 className="font-semibold text-slate-900 dark:text-slate-100">Debug Issues</h3>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          Get help with debugging, error analysis, and code troubleshooting.
                        </p>
                      </Card>

                      <Card className="p-6 hover:shadow-lg transition-all duration-300 cursor-pointer border-slate-200/50 dark:border-slate-800/50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                            <Lightbulb className="h-5 w-5 text-green-600 dark:text-green-400" />
                          </div>
                          <h3 className="font-semibold text-slate-900 dark:text-slate-100">Code Solutions</h3>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          Discover optimal solutions and best practices for your coding challenges.
                        </p>
                      </Card>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {messages.map(renderMessage)}
                    {isTyping && (
                      <div className="flex justify-start mb-8">
                        <div className="flex items-start gap-4 max-w-[85%]">
                          <div className="relative flex-shrink-0">
                            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 dark:from-slate-200 dark:to-slate-300 flex items-center justify-center shadow-lg ring-2 ring-white dark:ring-slate-900 text-white dark:text-slate-900">
                              <Bot className="h-5 w-5" />
                            </div>
                            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-900 shadow-sm animate-pulse" />
                          </div>
                          <div className="bg-white dark:bg-slate-800 rounded-2xl px-4 py-3 shadow-sm border border-slate-200 dark:border-slate-700">
                            <div className="flex items-center gap-1">
                              <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                              <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                              <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </ScrollArea>
        </div>

        {/* Professional Chat Input Area */}
        <div className="flex-shrink-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-t border-slate-200/50 dark:border-slate-800/50">
          <div className="max-w-4xl mx-auto px-6 py-6">
            {/* Quick Response Buttons */}
            <div className="mb-6">
              <div className="flex flex-wrap gap-2 justify-center">
                <button 
                  onClick={startNewChat}
                  className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-full transition-colors border border-blue-200 dark:border-blue-800"
                >
                  <Plus className="h-3 w-3" />
                  New Chat
                </button>
                <button 
                  onClick={() => setInputValue("Help me explore this ticket and understand the issue better")}
                  className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors"
                >
                  <Search className="h-3 w-3" />
                  Explore ticket
                </button>
                <button 
                  onClick={() => setInputValue("Create a test scenario for this issue")}
                  className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors"
                >
                  <Settings className="h-3 w-3" />
                  Create scenario
                </button>
                <button 
                  onClick={() => setInputValue("Help me diagnose the trace and identify the root cause")}
                  className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors"
                >
                  <Target className="h-3 w-3" />
                  Diagnose trace
                </button>
                <button 
                  onClick={() => setInputValue("Assess the infrastructure and suggest improvements")}
                  className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors"
                >
                  <Network className="h-3 w-3" />
                  Assess infrastructure
                </button>
                <button 
                  onClick={() => setInputValue("Review my code and suggest improvements")}
                  className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors"
                >
                  <Code className="h-3 w-3" />
                  Improve code
                </button>
                <button 
                  onClick={startNewChat}
                  className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors"
                >
                  <Plus className="h-3 w-3" />
                  New Chat
                </button>
              </div>
            </div>

            {/* Enhanced Chat Input */}
            <div className="relative">
              <div className="flex items-end gap-4 p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all duration-200">
                <Textarea
                  ref={textareaRef}
                  placeholder="Ask me anything about your code, debugging, or development challenges..."
                  value={inputValue}
                  onChange={handleTextareaChange}
                  onKeyDown={handleKeyPress}
                  className="flex-1 min-h-[80px] max-h-[200px] resize-none border-0 bg-transparent text-base leading-relaxed placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-0 focus:outline-none p-0"
                  disabled={isLoading}
                />
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                  >
                    <Paperclip className="h-4 w-4" />
                  </Button>
                  <Button
                    onClick={handleSendMessage}
                    disabled={!inputValue.trim() || isLoading}
                    size="sm"
                    className="h-8 w-8 p-0 bg-blue-500 hover:bg-blue-600 disabled:bg-slate-300 dark:disabled:bg-slate-600 text-white rounded-lg transition-all duration-200"
                  >
                    {isLoading ? (
                      <RefreshCw className="h-3 w-3 animate-spin" />
                    ) : (
                      <Send className="h-3 w-3" />
                    )}
                  </Button>
                </div>
              </div>
            </div>

            {/* Enhanced Status and Shortcuts */}
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">AI Ready</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                  <span>Press</span>
                  <kbd className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-md text-xs font-mono border border-slate-200 dark:border-slate-700">⏎</kbd>
                  <span>to send</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                  <span>or</span>
                  <kbd className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-md text-xs font-mono border border-slate-200 dark:border-slate-700">Shift</kbd>
                  <span>+</span>
                  <kbd className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-md text-xs font-mono border border-slate-200 dark:border-slate-700">⏎</kbd>
                  <span>for new line</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-sm font-medium transition-colors ${
                  inputValue.length > 1800 ? 'text-red-500 dark:text-red-400' : 
                  inputValue.length > 1500 ? 'text-amber-500 dark:text-amber-400' : 
                  'text-slate-400 dark:text-slate-500'
                }`}>
                  {inputValue.length}/2000
                </span>
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


    </div>
  );
}
