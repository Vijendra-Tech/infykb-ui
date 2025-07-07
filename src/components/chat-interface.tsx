"use client";

import { useState, useRef, useEffect } from "react";
import ClientOnly from "./client-only";
import { useClientOnly } from "@/utils/use-client-only";
import { useSafeDate } from "@/utils/safe-hydration";
import "@/styles/scrollbar.css";
import { Button } from "@/components/ui/button";
import { 
  Sparkles, 
  Send, 
  ChevronDown, 
  MessageSquare, 
  Cpu,
  Check,
  Search,
  FileText,
  Database,
  Terminal,
  AlertCircle,
  CheckCircle,
  Clock,
  HelpCircle,
  Layers
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { AgentMode } from "./agent-mode";

type Message = {
  id?: string;
  type: 'user' | 'system' | 'assistant';
  content: string;
  timestamp: Date;
  category?: 'question' | 'error' | 'solution' | 'diagnostic';
  severity?: 'low' | 'medium' | 'high' | 'critical';
  status?: 'pending' | 'resolved' | 'escalated';
};

export function ChatInterface() {
  // Use safe date formatting to prevent hydration errors
  const { formatDate } = useSafeDate();
  const [inputValue, setInputValue] = useState("");
  // Use a static timestamp for SSR to prevent hydration errors
  const staticTimestamp = new Date('2023-01-01T00:00:00Z');
  
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      type: 'system',
      content: 'Welcome to L2 Technical Support. How can I assist you today?',
      timestamp: staticTimestamp,
      category: 'question'
    }
  ]);
  
  // Update timestamps on client-side only
  useEffect(() => {
    // Client-side timestamp update no longer needed with useSafeDate
  }, []);

  const [selectedModel, setSelectedModel] = useState("Cascade");
  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);
  const [activeButton, setActiveButton] = useState('chat');
  const [ticketInfo, setTicketInfo] = useState({
    id: 'TKT-000000',
    status: 'open',
    priority: 'medium',
    category: 'software'
  });
  
  // Generate random ticket ID on client-side only
  useEffect(() => {
    setTicketInfo(prev => ({
      ...prev,
      id: 'TKT-' + Math.floor(100000 + Math.random() * 900000)
    }));
  }, []);
  const [showKnowledgePanel, setShowKnowledgePanel] = useState(false);
  const [relatedArticles, setRelatedArticles] = useState([
    { id: 'KB001', title: 'Common Network Connectivity Issues', relevance: 0.85 },
    { id: 'KB002', title: 'Database Connection Troubleshooting', relevance: 0.72 },
    { id: 'KB003', title: 'System Performance Optimization', relevance: 0.68 }
  ]);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Scroll to bottom of messages when they change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, activeButton]);

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

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;
    
    // Add user message
    const newMessages = [
      ...messages,
      { 
        type: 'user' as const, 
        content: inputValue,
        timestamp: new Date(),
        category: detectMessageCategory(inputValue)
      },
    ];
    
    setMessages(newMessages);
    setInputValue("");
    
    // Update knowledge panel based on message content
    if (inputValue.length > 10) {
      setShowKnowledgePanel(true);
      // In a real app, this would call an API to fetch relevant articles
      setRelatedArticles([
        { id: 'KB001', title: 'Common Network Connectivity Issues', relevance: 0.85 },
        { id: 'KB002', title: 'Database Connection Troubleshooting', relevance: 0.72 },
        { id: 'KB003', title: 'System Performance Optimization', relevance: 0.68 }
      ]);
    }
    
    // Simulate AI response after a short delay
    setTimeout(() => {
      const responseCategory = detectResponseCategory(inputValue);
      const severity = detectSeverity(inputValue);
      
      setMessages([
        ...newMessages,
        { 
          type: 'assistant' as const, 
          content: generateTechnicalResponse(inputValue, selectedModel),
          timestamp: new Date(),
          category: responseCategory,
          severity: severity,
          status: 'pending'
        },
      ]);
    }, 1000);
  };
  
  // Helper functions for L2 support features
  const detectMessageCategory = (message: string): 'question' | 'error' | 'solution' | 'diagnostic' => {
    if (message.includes('error') || message.includes('issue') || message.includes('problem')) {
      return 'error';
    } else if (message.includes('how') || message.includes('?')) {
      return 'question';
    } else if (message.includes('fix') || message.includes('solve')) {
      return 'solution';
    } else {
      return 'diagnostic';
    }
  };
  
  const detectResponseCategory = (message: string): 'question' | 'error' | 'solution' | 'diagnostic' => {
    // In a real app, this would use NLP to determine the appropriate category
    return 'solution';
  };
  
  const detectSeverity = (message: string): 'low' | 'medium' | 'high' | 'critical' => {
    // In a real app, this would use NLP to determine severity
    if (message.includes('urgent') || message.includes('critical')) {
      return 'critical';
    } else if (message.includes('important')) {
      return 'high';
    } else {
      return 'medium';
    }
  };
  
  const generateTechnicalResponse = (message: string, model: string): string => {
    // In a real app, this would call the AI model API
    return `Based on your issue description, I recommend checking the following:\n\n1. Verify network connectivity\n2. Check system logs for errors\n3. Ensure all services are running properly\n\nWould you like me to guide you through any of these steps?`;
  };
  
  // Available models for dropdown
  const models = [
    "Cascade",
    "GPT-4",
    "Claude 3",
    "Technical Support Specialist",
    "System Diagnostic"
  ];

  return (
    <div className="flex flex-col h-full w-full bg-gradient-to-b from-background to-muted/20">
      {/* Header with ticket info and model selector */}
      <div className="flex items-center justify-between border-b border-border p-3 bg-muted/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="flex items-center gap-4">
          
          {/* Ticket information */}
          <div className="flex items-center gap-2 bg-muted/70 px-3 py-1.5 rounded-md text-xs border border-border/50 shadow-sm">
            <span className="font-medium">{ticketInfo.id}</span>
            <span className="text-muted-foreground">|</span>
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3 text-muted-foreground" />
              <span>Open</span>
            </div>
            <span className="text-muted-foreground">|</span>
            <ClientOnly>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="font-medium">Ticket: {ticketInfo.id}</span>
                <span className="px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700 capitalize">{ticketInfo.status}</span>
                <span className="px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-700 capitalize">{ticketInfo.priority}</span>
              </div>
            </ClientOnly>
          </div>
        </div>
        
        <div className="relative" ref={dropdownRef}>
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              setIsModelDropdownOpen(!isModelDropdownOpen);
            }}
            className="flex items-center gap-1.5 text-xs bg-background/80 border-border/50 hover:bg-background shadow-sm"
          >
            <Sparkles className="h-3 w-3 text-primary mr-1" />
            <span>{selectedModel}</span>
            <ChevronDown className="h-3 w-3 ml-1 opacity-70" />
          </Button>
          
          {isModelDropdownOpen && (
            <div className="absolute right-0 top-full mt-1 w-56 rounded-md shadow-lg bg-white dark:bg-gray-800 border border-border z-10 overflow-hidden">
              <div className="py-1">
                {models.map((model) => (
                  <button
                    key={model}
                    className={`w-full text-left px-4 py-2.5 text-sm hover:bg-muted flex items-center justify-between ${selectedModel === model ? 'bg-primary/5' : ''}`}
                    onClick={() => {
                      setSelectedModel(model);
                      setIsModelDropdownOpen(false);
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <Sparkles className={`h-4 w-4 ${selectedModel === model ? 'text-primary' : 'text-muted-foreground/70'}`} />
                      <span>{model}</span>
                    </div>
                    {selectedModel === model && (
                      <Check className="h-4 w-4 text-primary" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Main content area - conditionally render chat or agent mode */}
      {activeButton === 'chat' ? (
        // Regular Chat Interface
        <div className="flex-1 w-full flex flex-col">
          <div className="flex-1 scrollbar-custom scrollbar-always">
            <div className="flex flex-col">
              <AnimatePresence>
              {messages.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center h-full p-8 text-center bg-gradient-to-b from-transparent to-muted/20"
                >
                  <div className="mb-6 bg-primary/10 p-4 rounded-full">
                    <Sparkles className="h-12 w-12 text-primary" />
                  </div>
                  <h2 className="text-2xl font-bold mb-2">How can I help you today?</h2>
                  <p className="text-muted-foreground mb-8 max-w-md">
                    Ask me anything or start with one of the suggestions below.
                  </p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    <Button 
                      variant="outline" 
                      onClick={() => setInputValue("Tell me about the latest features")}
                      className="bg-background/80 border-primary/20 hover:bg-background shadow-sm"
                    >
                      Latest features
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => setInputValue("How do I create a new project?")}
                      className="bg-background/80 border-primary/20 hover:bg-background shadow-sm"
                    >
                      Create a project
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => setInputValue("What are the best practices?")}
                      className="bg-background/80 border-primary/20 hover:bg-background shadow-sm"
                    >
                      Best practices
                    </Button>
                  </div>
                </motion.div>
              ) : (
                <div className="p-4 space-y-4">
                  {messages.map((message, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] p-3 rounded-lg shadow-sm ${
                          message.type === 'user'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-background border border-border/50'
                        }`}
                      >
                        <p className="whitespace-pre-line">{message.content}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
              </AnimatePresence>
              <div ref={messagesEndRef} />
            </div>
          </div>
          
          <div className="p-4 border-t border-border bg-muted/20 backdrop-blur-sm sticky bottom-0">
            <div className="relative w-full max-w-5xl mx-auto">
              <textarea 
                className="w-full rounded-lg border border-input bg-background/80 px-4 py-3 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 disabled:cursor-not-allowed disabled:opacity-50 resize-none min-h-[80px] shadow-sm" 
                placeholder="Type a message..." 
                rows={3}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
              />
              <Button 
                className="absolute bottom-3 right-3 shadow-sm"
                size="sm"
                onClick={handleSendMessage}
                disabled={!inputValue.trim()}
              >
                <Send className="h-4 w-4 mr-1" />
                Send
              </Button>
            </div>
          </div>
        </div>
      ) : (
        // L2 Technical Support Interface
        <div className="flex h-full w-full">
          {/* Main chat area */}
          <div className="flex-1 flex flex-col h-full">
            {/* Messages area */}
            <div className="flex-1 flex flex-col">
              <div className="flex-1 scrollbar-custom scrollbar-always p-4 space-y-4">
                {messages.map((message, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] p-3 rounded-lg shadow-sm ${
                        message.type === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : message.type === 'system'
                          ? 'bg-muted/30 border border-border/50'
                          : 'bg-background border border-border/50'
                      } ${
                        message.severity === 'critical' ? 'border-l-4 border-l-red-500' :
                        message.severity === 'high' ? 'border-l-4 border-l-amber-500' : ''
                      }`}
                    >
                      {message.type !== 'user' && message.category && (
                        <div className="flex items-center gap-2 mb-1 text-xs text-muted-foreground">
                          {message.category === 'error' && <AlertCircle className="h-3 w-3 text-red-500" />}
                          {message.category === 'solution' && <CheckCircle className="h-3 w-3 text-green-500" />}
                          {message.category === 'diagnostic' && <Terminal className="h-3 w-3 text-blue-500" />}
                          {message.category === 'question' && <HelpCircle className="h-3 w-3 text-amber-500" />}
                          <span className="capitalize">{message.category}</span>
                          {message.status && (
                            <>
                              <span className="text-muted-foreground">•</span>
                              <span className="capitalize">{message.status}</span>
                            </>
                          )}
                        </div>
                      )}
                      <p className="whitespace-pre-line">{message.content}</p>
                      {message.timestamp && (
                        <div className="text-xs text-muted-foreground mt-1">
                          {formatDate(message.timestamp, { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
              <div ref={messagesEndRef} />
            </div>
            
            {/* Input area */}
            <div className="p-4 border-t border-border bg-muted/20 backdrop-blur-sm sticky bottom-0">
              <div className="flex gap-2 w-full max-w-5xl mx-auto">
                <div className="flex gap-2 bg-muted/30 p-0.5 rounded-lg self-end">
                  <Button
                    variant={activeButton === 'chat' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setActiveButton('chat')}
                    className={`flex items-center gap-1.5 ${activeButton === 'chat' ? 'shadow-sm' : ''}`}
                  >
                    <MessageSquare className="h-4 w-4" />
                    <span>Chat</span>
                  </Button>
                  <Button
                    variant={activeButton === 'agent' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setActiveButton('agent')}
                    className={`flex items-center gap-1.5 ${activeButton === 'agent' ? 'shadow-sm' : ''}`}
                  >
                    <Cpu className="h-4 w-4" />
                    <span>L2 Support</span>
                  </Button>
                </div>
                <div className="relative flex-1">
                  <textarea 
                    className="w-full rounded-lg border border-input bg-background/80 px-4 py-3 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 disabled:cursor-not-allowed disabled:opacity-50 resize-none min-h-[80px] shadow-sm" 
                    placeholder="Describe the technical issue in detail..." 
                    rows={3}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                  />
                  <div className="absolute bottom-3 right-3 flex gap-2">
                    <Button 
                      size="sm"
                      variant="outline"
                      onClick={() => setShowKnowledgePanel(!showKnowledgePanel)}
                      className="flex items-center gap-1"
                    >
                      <Search className="h-3 w-3" />
                      <span>KB</span>
                    </Button>
                    <Button 
                      size="sm"
                      onClick={handleSendMessage}
                      disabled={!inputValue.trim()}
                      className="flex items-center gap-1"
                    >
                      <Send className="h-3 w-3" />
                      <span>Send</span>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Knowledge base panel - redesigned without border */}
          {showKnowledgePanel && (
            <div className="w-80 bg-background/80 flex flex-col h-full shadow-sm">
              {/* KB Header with model selector */}
              <div className="p-3 bg-muted/30 backdrop-blur-sm">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium">Knowledge Base</h3>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setShowKnowledgePanel(false)}
                    className="h-6 w-6 p-0"
                  >
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <input 
                    type="text" 
                    placeholder="Search knowledge base..."
                    className="w-full pl-8 pr-3 py-2 text-sm rounded-md bg-background border border-input/50" 
                  />
                </div>
              </div>
              
              {/* KB Content */}
              <div className="flex-1 overflow-auto scrollbar-custom p-3">
                <h4 className="text-xs font-medium mb-2 text-muted-foreground">Related Articles</h4>
                <div className="space-y-2">
                  {relatedArticles.map(article => (
                    <div 
                      key={article.id} 
                      className="p-3 rounded-md hover:bg-muted/20 cursor-pointer bg-background shadow-sm transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">{article.title}</span>
                      </div>
                      <div className="mt-1 flex items-center gap-2">
                        <div className="text-xs text-muted-foreground">{article.id}</div>
                        <div className="text-xs bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 px-1.5 py-0.5 rounded-full">
                          {Math.round(article.relevance * 100)}% match
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <h4 className="text-xs font-medium mb-2 mt-4 text-muted-foreground">Diagnostic Tools</h4>
                <div className="space-y-2">
                  <Button variant="outline" size="sm" className="w-full justify-start bg-background hover:bg-muted/10 shadow-sm">
                    <div className="flex items-center justify-center bg-blue-100 dark:bg-blue-900/30 p-1 rounded-md mr-2">
                      <Terminal className="h-3.5 w-3.5 text-blue-500" />
                    </div>
                    <span>Run System Diagnostics</span>
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start bg-background hover:bg-muted/10 shadow-sm">
                    <div className="flex items-center justify-center bg-amber-100 dark:bg-amber-900/30 p-1 rounded-md mr-2">
                      <Database className="h-3.5 w-3.5 text-amber-500" />
                    </div>
                    <span>Check Database Status</span>
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start bg-background hover:bg-muted/10 shadow-sm">
                    <div className="flex items-center justify-center bg-green-100 dark:bg-green-900/30 p-1 rounded-md mr-2">
                      <Layers className="h-3.5 w-3.5 text-green-500" />
                    </div>
                    <span>View System Logs</span>
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}