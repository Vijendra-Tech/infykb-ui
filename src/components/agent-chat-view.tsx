"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { 
  Cpu, 
  MessageSquare, 
  Send, 
  ChevronDown, 
  PenLine, 
  Check, 
  Sparkles, 
  Search,
  FileText,
  Database,
  Terminal,
  AlertCircle,
  CheckCircle,
  ExternalLink,
  Workflow
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useChatHistoryStore } from "@/store/use-chat-history-store";

type AgentAction = {
  id: string;
  type: 'search' | 'database' | 'api' | 'code' | 'file';
  status: 'pending' | 'completed' | 'failed';
  description: string;
  result?: string;
  timestamp: Date;
};

type Message = {
  id: string;
  type: 'user' | 'assistant' | 'system' | 'thinking';
  content: string;
  timestamp: Date;
  actions?: AgentAction[];
};

export function AgentChatView() {
  const [inputValue, setInputValue] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      type: 'system',
      content: 'Hi, I\'m your AI assistant. How can I help you today?',
      timestamp: new Date(),
    }
  ]);
  const [selectedModel, setSelectedModel] = useState("Cascade");
  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [agentMode, setAgentMode] = useState<'chat' | 'agent'>('agent');
  const { addChat } = useChatHistoryStore();
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Scroll to bottom of messages when they change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Close model dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsModelDropdownOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Available models for dropdown
  const models = [
    { name: "Cascade", description: "Agentic AI" },
    { name: "GPT-4", description: null },
    { name: "Claude 3", description: null },
    { name: "Gemini", description: null },
    { name: "Llama 3", description: null }
  ];

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;
    
    const messageId = Math.random().toString(36).substring(2, 9);
    
    // Add user message
    const newMessages = [
      ...messages,
      { 
        id: messageId,
        type: 'user' as const, 
        content: inputValue,
        timestamp: new Date(),
      },
    ];
    
    setMessages(newMessages);
    setInputValue("");
    
    // Add to chat history if this is the first user message
    if (messages.length === 1 && messages[0].type === 'system') {
      const title = inputValue.length > 30 ? `${inputValue.substring(0, 30)}...` : inputValue;
      addChat({ title });
    }
    
    // Show thinking state
    setIsThinking(true);
    
    // Simulate agent actions and response
    simulateAgentResponse(newMessages, messageId);
  };
  
  const simulateAgentResponse = (currentMessages: Message[], replyToId: string) => {
    // First add a thinking message
    setTimeout(() => {
      setMessages([
        ...currentMessages,
        {
          id: "thinking-" + Math.random().toString(36).substring(2, 9),
          type: 'thinking',
          content: 'Thinking...',
          timestamp: new Date(),
        }
      ]);
      
      // Simulate agent actions
      simulateAgentActions(currentMessages);
    }, 500);
  };
  
  const simulateAgentActions = (currentMessages: Message[]) => {
    const lastUserMessage = currentMessages.filter(m => m.type === 'user').pop();
    if (!lastUserMessage) return;
    
    const actions: AgentAction[] = [];
    
    // Simulate search action
    setTimeout(() => {
      const searchAction: AgentAction = {
        id: "action-" + Math.random().toString(36).substring(2, 9),
        type: 'search',
        status: 'pending',
        description: 'Searching for relevant information...',
        timestamp: new Date()
      };
      
      actions.push(searchAction);
      
      setMessages(prev => {
        // Remove thinking message
        const filteredMessages = prev.filter(m => m.type !== 'thinking');
        
        return [
          ...filteredMessages,
          {
            id: "agent-" + Math.random().toString(36).substring(2, 9),
            type: 'assistant',
            content: '',
            timestamp: new Date(),
            actions: [...actions]
          }
        ];
      });
      
      // Complete search action
      setTimeout(() => {
        searchAction.status = 'completed';
        searchAction.result = 'Found relevant information in knowledge base.';
        
        setMessages(prev => {
          const lastMessage = prev[prev.length - 1];
          if (lastMessage.type === 'assistant' && lastMessage.actions) {
            return [
              ...prev.slice(0, -1),
              {
                ...lastMessage,
                actions: lastMessage.actions.map(a => 
                  a.id === searchAction.id ? searchAction : a
                )
              }
            ];
          }
          return prev;
        });
        
        // Add database action
        simulateDatabaseAction(actions);
      }, 1500);
    }, 1000);
  };
  
  const simulateDatabaseAction = (actions: AgentAction[]) => {
    const dbAction: AgentAction = {
      id: "action-" + Math.random().toString(36).substring(2, 9),
      type: 'database',
      status: 'pending',
      description: 'Querying database for context...',
      timestamp: new Date()
    };
    
    actions.push(dbAction);
    
    setMessages(prev => {
      const lastMessage = prev[prev.length - 1];
      if (lastMessage.type === 'assistant' && lastMessage.actions) {
        return [
          ...prev.slice(0, -1),
          {
            ...lastMessage,
            actions: [...actions]
          }
        ];
      }
      return prev;
    });
    
    // Complete database action
    setTimeout(() => {
      dbAction.status = 'completed';
      dbAction.result = 'Retrieved relevant context from database.';
      
      setMessages(prev => {
        const lastMessage = prev[prev.length - 1];
        if (lastMessage.type === 'assistant' && lastMessage.actions) {
          return [
            ...prev.slice(0, -1),
            {
              ...lastMessage,
              actions: lastMessage.actions.map(a => 
                a.id === dbAction.id ? dbAction : a
              )
            }
          ];
        }
        return prev;
      });
      
      // Add final response
      setTimeout(() => {
        setMessages(prev => {
          const lastMessage = prev[prev.length - 1];
          if (lastMessage.type === 'assistant') {
            return [
              ...prev.slice(0, -1),
              {
                ...lastMessage,
                content: `Based on my analysis, here's what I found:\n\n1. The information you requested is available in our knowledge base.\n2. I've analyzed the relevant data and can provide you with a comprehensive answer.\n3. Let me know if you need any clarification or have follow-up questions.`
              }
            ];
          }
          return prev;
        });
        
        setIsThinking(false);
      }, 1000);
    }, 2000);
  };

  const renderActionIcon = (type: AgentAction['type']) => {
    switch (type) {
      case 'search':
        return <Search className="h-4 w-4" />;
      case 'database':
        return <Database className="h-4 w-4" />;
      case 'api':
        return <ExternalLink className="h-4 w-4" />;
      case 'code':
        return <Terminal className="h-4 w-4" />;
      case 'file':
        return <FileText className="h-4 w-4" />;
      default:
        return <Workflow className="h-4 w-4" />;
    }
  };

  const renderActionStatus = (status: AgentAction['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'pending':
        return (
          <div className="animate-spin h-4 w-4 border-2 border-muted-foreground border-t-transparent rounded-full" />
        );
      default:
        return null;
    }
  };

  // Render different UI based on agent mode
  const renderAgentUI = () => (
    <div className="flex flex-col h-full w-full bg-gradient-to-b from-background to-muted/20">
      {/* Agent-specific header */}
      <div className="flex items-center justify-between border-b border-border p-4 bg-background sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <Cpu className="h-4 w-4 text-primary" />
            <h1 className="text-lg font-semibold">Agent Assistant</h1>
          </div>
        </div>
        
        <div className="relative" ref={dropdownRef}>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsModelDropdownOpen(!isModelDropdownOpen)}
            className="flex items-center gap-1.5 rounded-full border-border hover:bg-muted/50 h-9 px-3"
          >
            <Sparkles className="h-3 w-3 text-primary mr-1" />
            <span className="text-sm">{selectedModel}</span>
            <ChevronDown className="h-3 w-3 ml-1 text-muted-foreground" />
          </Button>
          
          {isModelDropdownOpen && (
            <div className="absolute right-0 top-full mt-2 w-60 rounded-lg shadow-lg bg-background border border-border z-10 overflow-hidden">
              <div className="py-1">
                {models.map((model) => (
                  <button
                    key={model.name}
                    className={`w-full text-left px-4 py-2.5 text-sm hover:bg-muted flex items-center justify-between ${selectedModel === model.name ? 'bg-primary/5' : ''}`}
                    onClick={() => {
                      setSelectedModel(model.name);
                      setIsModelDropdownOpen(false);
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <Sparkles className={`h-4 w-4 ${selectedModel === model.name ? 'text-primary' : 'text-muted-foreground/70'}`} />
                      <span>{model.name}</span>
                    </div>
                    {selectedModel === model.name && (
                      <Check className="h-4 w-4 text-primary" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Agent-specific content area */}
      <div className="flex-1 w-full flex flex-col">
        <div className="flex-1 overflow-auto px-4 py-6 space-y-6 max-w-4xl mx-auto w-full">
          <div className="bg-background border border-border rounded-lg shadow-sm p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-primary/10 p-2 rounded-full">
                <Cpu className="h-5 w-5 text-primary" />
              </div>
              <h2 className="text-lg font-medium">Agent Mode</h2>
            </div>
            <p className="text-muted-foreground mb-4">
              In agent mode, I can perform actions on your behalf, like searching for information, analyzing data, and more.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
              <div className="bg-muted/30 border border-border/50 rounded-lg p-3 flex items-start gap-3">
                <Search className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <h3 className="font-medium text-sm">Information Retrieval</h3>
                  <p className="text-xs text-muted-foreground mt-1">I can search and retrieve information from various sources.</p>
                </div>
              </div>
              <div className="bg-muted/30 border border-border/50 rounded-lg p-3 flex items-start gap-3">
                <Database className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <h3 className="font-medium text-sm">Data Analysis</h3>
                  <p className="text-xs text-muted-foreground mt-1">I can analyze data and provide insights.</p>
                </div>
              </div>
              <div className="bg-muted/30 border border-border/50 rounded-lg p-3 flex items-start gap-3">
                <FileText className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <h3 className="font-medium text-sm">Content Generation</h3>
                  <p className="text-xs text-muted-foreground mt-1">I can draft emails, reports, and other content.</p>
                </div>
              </div>
              <div className="bg-muted/30 border border-border/50 rounded-lg p-3 flex items-start gap-3">
                <Terminal className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <h3 className="font-medium text-sm">Code Assistance</h3>
                  <p className="text-xs text-muted-foreground mt-1">I can help with code snippets and programming tasks.</p>
                </div>
              </div>
            </div>
          </div>
          
          <AnimatePresence>
            {messages.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center p-8 text-center"
              >
                <div className="mb-8 bg-primary/10 p-5 rounded-full shadow-inner">
                  <Sparkles className="h-14 w-14 text-primary" />
                </div>
                <h2 className="text-2xl font-bold mb-3">How can I assist you today?</h2>
                <p className="text-muted-foreground mb-10 max-w-md text-base">
                  I can help with knowledge retrieval, data analysis, and more.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-lg">
                  <Button 
                    variant="outline" 
                    onClick={() => setInputValue("Find information about our latest product release")}
                    className="bg-background border-primary/20 hover:bg-primary/5 shadow-sm h-auto py-3 px-4 justify-start"
                  >
                    <Search className="h-4 w-4 mr-2 text-primary" />
                    <div className="text-left">
                      <div className="font-medium">Product information</div>
                      <div className="text-xs text-muted-foreground mt-0.5">Find details about our products</div>
                    </div>
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setInputValue("Analyze our sales data from last quarter")}
                    className="bg-background border-primary/20 hover:bg-primary/5 shadow-sm h-auto py-3 px-4 justify-start"
                  >
                    <Database className="h-4 w-4 mr-2 text-primary" />
                    <div className="text-left">
                      <div className="font-medium">Data analysis</div>
                      <div className="text-xs text-muted-foreground mt-0.5">Analyze business metrics</div>
                    </div>
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setInputValue("Help me draft an email to our clients")}
                    className="bg-background border-primary/20 hover:bg-primary/5 shadow-sm h-auto py-3 px-4 justify-start"
                  >
                    <FileText className="h-4 w-4 mr-2 text-primary" />
                    <div className="text-left">
                      <div className="font-medium">Content creation</div>
                      <div className="text-xs text-muted-foreground mt-0.5">Draft emails and documents</div>
                    </div>
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setInputValue("Explain how our knowledge base works")}
                    className="bg-background border-primary/20 hover:bg-primary/5 shadow-sm h-auto py-3 px-4 justify-start"
                  >
                    <Workflow className="h-4 w-4 mr-2 text-primary" />
                    <div className="text-left">
                      <div className="font-medium">Knowledge base</div>
                      <div className="text-xs text-muted-foreground mt-0.5">Learn about our systems</div>
                    </div>
                  </Button>
                </div>
              </motion.div>
            ) : (
              <div className="space-y-8">
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className={cn(
                      "flex",
                      message.type === 'user' ? "justify-end" : "justify-start",
                      message.type === 'thinking' && "justify-start items-center"
                    )}
                  >
                    {message.type === 'thinking' ? (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/30 py-3 px-4 rounded-lg border border-border/30 shadow-sm">
                        <div className="flex gap-1.5">
                          <motion.div
                            className="h-2 w-2 rounded-full bg-primary/60"
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 1, repeat: Infinity, repeatDelay: 0.2 }}
                          />
                          <motion.div
                            className="h-2 w-2 rounded-full bg-primary/60"
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 1, repeat: Infinity, repeatDelay: 0.2, delay: 0.2 }}
                          />
                          <motion.div
                            className="h-2 w-2 rounded-full bg-primary/60"
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 1, repeat: Infinity, repeatDelay: 0.2, delay: 0.4 }}
                          />
                        </div>
                        <span>Processing your request...</span>
                      </div>
                    ) : (
                      <div
                        className={cn(
                          "max-w-[85%] rounded-2xl shadow-sm",
                          message.type === 'user'
                            ? "bg-primary/10 border border-primary/20 p-4"
                            : message.type === 'system'
                            ? "bg-muted/30 border border-border/50 p-4"
                            : "bg-background border border-border/50 p-4"
                        )}
                      >
                        {message.content && (
                          <div className="whitespace-pre-line text-sm">{message.content}</div>
                        )}
                        
                        {message.actions && message.actions.length > 0 && (
                          <div className="mt-4 space-y-3 border-t border-border/50 pt-3">
                            <div className="text-xs font-medium text-muted-foreground mb-2">Actions</div>
                            {message.actions.map((action) => (
                              <div 
                                key={action.id}
                                className={cn(
                                  "flex flex-col gap-2 text-xs p-3 rounded-lg border shadow-sm",
                                  action.status === 'completed' ? "bg-green-50/50 border-green-200/70 text-green-800" :
                                  action.status === 'failed' ? "bg-red-50/50 border-red-200/70 text-red-800" :
                                  "bg-blue-50/50 border-blue-200/70 text-blue-800"
                                )}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <div className="p-1.5 rounded-md bg-white/80 shadow-sm">
                                      {renderActionIcon(action.type)}
                                    </div>
                                    <span className="font-medium">{action.description}</span>
                                  </div>
                                  <div className="flex items-center gap-1 text-xs">
                                    {renderActionStatus(action.status)}
                                  </div>
                                </div>
                                
                                {action.result && action.status === 'completed' && (
                                  <div className="mt-1 text-xs bg-white/60 p-2 rounded border border-border/30 max-h-32 overflow-auto">
                                    {action.result}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </motion.div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
  
  const renderChatUI = () => (
    <div className="flex flex-col h-full w-full bg-gradient-to-b from-background to-muted/20">
      {/* Chat-specific header */}
      <div className="flex items-center justify-between border-b border-border p-4 bg-background sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <MessageSquare className="h-4 w-4 text-primary" />
            <h1 className="text-lg font-semibold">Chat Assistant</h1>
          </div>
        </div>
        
        <div className="relative" ref={dropdownRef}>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsModelDropdownOpen(!isModelDropdownOpen)}
            className="flex items-center gap-1.5 rounded-full border-border hover:bg-muted/50 h-9 px-3"
          >
            <Sparkles className="h-3 w-3 text-primary mr-1" />
            <span className="text-sm">{selectedModel}</span>
            <ChevronDown className="h-3 w-3 ml-1 text-muted-foreground" />
          </Button>
          
          {isModelDropdownOpen && (
            <div className="absolute right-0 top-full mt-2 w-60 rounded-lg shadow-lg bg-background border border-border z-10 overflow-hidden">
              <div className="py-1">
                {models.map((model) => (
                  <button
                    key={model.name}
                    className={`w-full text-left px-4 py-2.5 text-sm hover:bg-muted flex items-center justify-between ${selectedModel === model.name ? 'bg-primary/5' : ''}`}
                    onClick={() => {
                      setSelectedModel(model.name);
                      setIsModelDropdownOpen(false);
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <Sparkles className={`h-4 w-4 ${selectedModel === model.name ? 'text-primary' : 'text-muted-foreground/70'}`} />
                      <span>{model.name}</span>
                    </div>
                    {selectedModel === model.name && (
                      <Check className="h-4 w-4 text-primary" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Main content area */}
      <div className="flex-1 w-full flex flex-col">
        <div className="flex-1 overflow-auto px-4 py-6 space-y-6 max-w-4xl mx-auto w-full">
          <AnimatePresence>
            {messages.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center h-full p-8 text-center"
              >
                <div className="mb-8 bg-primary/10 p-5 rounded-full shadow-inner">
                  <Sparkles className="h-14 w-14 text-primary" />
                </div>
                <h2 className="text-2xl font-bold mb-3">How can I assist you today?</h2>
                <p className="text-muted-foreground mb-10 max-w-md text-base">
                  I can help with knowledge retrieval, data analysis, and more.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-lg">
                  <Button 
                    variant="outline" 
                    onClick={() => setInputValue("Find information about our latest product release")}
                    className="bg-background border-primary/20 hover:bg-primary/5 shadow-sm h-auto py-3 px-4 justify-start"
                  >
                    <Search className="h-4 w-4 mr-2 text-primary" />
                    <div className="text-left">
                      <div className="font-medium">Product information</div>
                      <div className="text-xs text-muted-foreground mt-0.5">Find details about our products</div>
                    </div>
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setInputValue("Analyze our sales data from last quarter")}
                    className="bg-background border-primary/20 hover:bg-primary/5 shadow-sm h-auto py-3 px-4 justify-start"
                  >
                    <Database className="h-4 w-4 mr-2 text-primary" />
                    <div className="text-left">
                      <div className="font-medium">Data analysis</div>
                      <div className="text-xs text-muted-foreground mt-0.5">Analyze business metrics</div>
                    </div>
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setInputValue("Help me draft an email to our clients")}
                    className="bg-background border-primary/20 hover:bg-primary/5 shadow-sm h-auto py-3 px-4 justify-start"
                  >
                    <FileText className="h-4 w-4 mr-2 text-primary" />
                    <div className="text-left">
                      <div className="font-medium">Content creation</div>
                      <div className="text-xs text-muted-foreground mt-0.5">Draft emails and documents</div>
                    </div>
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setInputValue("Explain how our knowledge base works")}
                    className="bg-background border-primary/20 hover:bg-primary/5 shadow-sm h-auto py-3 px-4 justify-start"
                  >
                    <Workflow className="h-4 w-4 mr-2 text-primary" />
                    <div className="text-left">
                      <div className="font-medium">Knowledge base</div>
                      <div className="text-xs text-muted-foreground mt-0.5">Learn about our systems</div>
                    </div>
                  </Button>
                </div>
              </motion.div>
            ) : (
              <div className="space-y-8">
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className={cn(
                      "flex",
                      message.type === 'user' ? "justify-end" : "justify-start",
                      message.type === 'thinking' && "justify-start items-center"
                    )}
                  >
                    {message.type === 'thinking' ? (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/30 py-3 px-4 rounded-lg border border-border/30 shadow-sm">
                        <div className="flex gap-1.5">
                          <motion.div
                            className="h-2 w-2 rounded-full bg-primary/60"
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 1, repeat: Infinity, repeatDelay: 0.2 }}
                          />
                          <motion.div
                            className="h-2 w-2 rounded-full bg-primary/60"
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 1, repeat: Infinity, repeatDelay: 0.2, delay: 0.2 }}
                          />
                          <motion.div
                            className="h-2 w-2 rounded-full bg-primary/60"
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 1, repeat: Infinity, repeatDelay: 0.2, delay: 0.4 }}
                          />
                        </div>
                        <span>Processing your request...</span>
                      </div>
                    ) : (
                      <div
                        className={cn(
                          "max-w-[85%] rounded-2xl shadow-sm",
                          message.type === 'user'
                            ? "bg-primary/10 border border-primary/20 p-4"
                            : message.type === 'system'
                            ? "bg-muted/30 border border-border/50 p-4"
                            : "bg-background border border-border/50 p-4"
                        )}
                      >
                        {message.content && (
                          <div className="whitespace-pre-line text-sm">{message.content}</div>
                        )}
                        
                        {message.actions && message.actions.length > 0 && (
                          <div className="mt-4 space-y-3 border-t border-border/50 pt-3">
                            <div className="text-xs font-medium text-muted-foreground mb-2">Actions</div>
                            {message.actions.map((action) => (
                              <div 
                                key={action.id}
                                className={cn(
                                  "flex flex-col gap-2 text-xs p-3 rounded-lg border shadow-sm",
                                  action.status === 'completed' ? "bg-green-50/50 border-green-200/70 text-green-800" :
                                  action.status === 'failed' ? "bg-red-50/50 border-red-200/70 text-red-800" :
                                  "bg-blue-50/50 border-blue-200/70 text-blue-800"
                                )}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <div className="p-1.5 rounded-md bg-white/80 shadow-sm">
                                      {renderActionIcon(action.type)}
                                    </div>
                                    <span className="font-medium">{action.description}</span>
                                  </div>
                                  <div className="flex items-center gap-1 text-xs">
                                    {renderActionStatus(action.status)}
                                  </div>
                                </div>
                                
                                {action.result && action.status === 'completed' && (
                                  <div className="mt-1 text-xs bg-white/60 p-2 rounded border border-border/30 max-h-32 overflow-auto">
                                    {action.result}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </motion.div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            )}
          </AnimatePresence>
        </div>
        
        {/* Input area */}
        <div className="p-4 border-t border-border bg-background sticky bottom-0 shadow-sm">
          <div className="relative w-full max-w-3xl mx-auto">
            <div className="flex items-center gap-2">
              <div className="flex-1 relative">
                <input
                  type="text"
                  className="w-full h-12 rounded-full border border-border bg-background px-4 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/30 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder={isThinking ? "Waiting for response..." : "Reply to Claude..."}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  disabled={isThinking}
                />
                <div className="absolute left-3 top-1/2 -translate-y-1/2 flex gap-1">
                  <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full">
                    <PenLine className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </div>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-1">
                  <Button 
                    size="icon" 
                    variant="ghost" 
                    className="h-8 w-8 rounded-full"
                    onClick={handleSendMessage}
                    disabled={!inputValue.trim() || isThinking}
                  >
                    <Send className="h-4 w-4 text-primary" />
                  </Button>
                </div>
              </div>
              
              <div className="relative" ref={dropdownRef}>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsModelDropdownOpen(!isModelDropdownOpen)}
                  className="rounded-full h-10 px-3 flex items-center gap-1 text-sm bg-background border-border hover:bg-muted"
                >
                  <span className="text-muted-foreground">Claude Sonnet 4</span>
                  <ChevronDown className="h-3.5 w-3.5 ml-1 text-muted-foreground" />
                </Button>
                
                {isModelDropdownOpen && (
                  <div className="absolute right-0 bottom-full mb-2 w-56 rounded-md shadow-lg bg-background border border-border z-10 overflow-hidden">
                    <div className="py-1">
                      {models.map((model) => (
                        <button
                          key={model.name}
                          className={`w-full text-left px-4 py-2 text-sm hover:bg-muted flex items-center justify-between ${selectedModel === model.name ? 'bg-primary/5' : ''}`}
                          onClick={() => {
                            setSelectedModel(model.name);
                            setIsModelDropdownOpen(false);
                          }}
                        >
                          <span>{model.name}</span>
                          {selectedModel === model.name && (
                            <Check className="h-4 w-4 text-primary" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex justify-center mt-2">
              <div className="inline-flex items-center bg-background border border-border rounded-full p-0.5 shadow-sm">
                <Button
                  variant={agentMode === 'agent' ? "default" : "ghost"}
                  size="sm"
                  className="rounded-full flex items-center gap-1.5 text-xs h-7 px-3"
                  onClick={() => setAgentMode('agent')}
                >
                  <Cpu className="h-3 w-3" />
                  <span>Agent</span>
                </Button>
                <Button
                  variant={agentMode === 'chat' ? "default" : "ghost"}
                  size="sm"
                  className="rounded-full flex items-center gap-1.5 text-xs h-7 px-3"
                  onClick={() => setAgentMode('chat')}
                >
                  <MessageSquare className="h-3 w-3" />
                  <span>Chat</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
  
  // Return the appropriate UI based on the selected mode
  return agentMode === 'agent' ? renderAgentUI() : renderChatUI();
}
