"use client";

import { useState, useRef, useEffect } from "react";
import { useSafeDate } from "@/utils/safe-hydration";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { 
  Sparkles, 
  Send, 
  MessageSquare, 
  Layers, 
  FileText, 
  Code, 
  Terminal, 
  Database, 
  Cpu, 
  Info, 
  PenLine, 
  Settings, 
  HelpCircle,
  Brain,
  ChevronRight,
  ChevronLeft
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type Message = {
  id: string;
  type: 'user' | 'agent' | 'system' | 'action';
  content: string;
  timestamp: Date;
  metadata?: {
    actionType?: 'code' | 'terminal' | 'file' | 'database' | 'thinking';
    actionStatus?: 'pending' | 'success' | 'error';
    actionDetails?: string;
  };
};

type AgentAction = {
  id: string;
  type: 'code' | 'terminal' | 'file' | 'database' | 'thinking';
  status: 'pending' | 'success' | 'error';
  description: string;
  details?: string;
  timestamp: Date;
};

type ContextItem = {
  id: string;
  type: 'file' | 'terminal' | 'database' | 'note';
  title: string;
  content: string;
  timestamp: Date;
};

export function AgentMode() {
  // Use safe date formatting to prevent hydration errors
  const { formatDate } = useSafeDate();
  
  // Static timestamp for SSR
  const staticTimestamp = new Date('2023-01-01T00:00:00Z');

  const [inputValue, setInputValue] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      type: "system",
      content: "Welcome to Agent Mode. How can I assist you today?",
      timestamp: new Date()
    }
  ]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [agentActions, setAgentActions] = useState<AgentAction[]>([]);
  const [contextItems, setContextItems] = useState<ContextItem[]>([
    {
      id: "context-1",
      type: "file",
      title: "Project Overview",
      content: "This is a Next.js project with TypeScript and TailwindCSS.",
      timestamp: staticTimestamp
    },
    {
      id: "context-2",
      type: "note",
      title: "User Requirements",
      content: "The user wants to implement a Windsurf-style agent mode UI.",
      timestamp: new Date()
    }
  ]);
  const [activeTab, setActiveTab] = useState<'chat' | 'actions' | 'context'>('chat');
  const [showSidebar, setShowSidebar] = useState(true);
  // Add state for agent capabilities checkboxes
  const [capabilities, setCapabilities] = useState({
    code: true,
    terminal: true,
    files: true,
    web: true
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (inputValue.trim()) {
      // Add user message
      const userMessage: Message = {
        id: `user-${Date.now()}`,
        type: 'user',
        content: inputValue,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, userMessage]);
      setInputValue("");
      
      // Simulate processing
      setIsProcessing(true);
      
      // Simulate thinking action
      const thinkingAction: AgentAction = {
        id: `action-${Date.now()}`,
        type: 'thinking',
        status: 'pending',
        description: 'Analyzing your request...',
        timestamp: new Date()
      };
      
      setAgentActions(prev => [thinkingAction, ...prev]);
      
      // Simulate agent response after a delay
      setTimeout(() => {
        // Update thinking action to success
        setAgentActions(prev => 
          prev.map(action => 
            action.id === thinkingAction.id 
              ? {...action, status: 'success', description: 'Request analyzed'} 
              : action
          )
        );
        
        // Add code action
        const codeAction: AgentAction = {
          id: `action-${Date.now() + 1}`,
          type: 'code',
          status: 'pending',
          description: 'Generating code solution...',
          timestamp: new Date()
        };
        
        setAgentActions(prev => [codeAction, ...prev]);
        
        setTimeout(() => {
          // Update code action to success
          setAgentActions(prev => 
            prev.map(action => 
              action.id === codeAction.id 
                ? {...action, status: 'success', description: 'Code solution generated'} 
                : action
            )
          );
          
          // Add agent response
          const agentResponse: Message = {
            id: `agent-${Date.now()}`,
            type: 'agent',
            content: `I've analyzed your request about "${inputValue}". Here's what I can do to help...`,
            timestamp: new Date()
          };
          
          setMessages(prev => [...prev, agentResponse]);
          
          // Add action message with code
          const actionMessage: Message = {
            id: `action-msg-${Date.now()}`,
            type: 'action',
            content: '```tsx\n// Example code implementation\nconst WindsurfStyle = () => {\n  return (\n    <div className="windsurf-container">\n      <h1>Windsurf UI</h1>\n    </div>\n  );\n};\n```',
            timestamp: staticTimestamp,
            metadata: {
              actionType: 'code',
              actionStatus: 'success'
            }
          };
          
          setMessages(prev => [...prev, actionMessage]);
          setIsProcessing(false);
        }, 1500);
      }, 2000);
    }
  };

  const renderActionIcon = (type: AgentAction['type']) => {
    switch (type) {
      case 'code':
        return <Code className="h-4 w-4" />;
      case 'terminal':
        return <Terminal className="h-4 w-4" />;
      case 'file':
        return <FileText className="h-4 w-4" />;
      case 'database':
        return <Database className="h-4 w-4" />;
      case 'thinking':
        return <Cpu className="h-4 w-4" />;
      default:
        return <Info className="h-4 w-4" />;
    }
  };

  const renderContextIcon = (type: ContextItem['type']) => {
    switch (type) {
      case 'file':
        return <FileText className="h-4 w-4" />;
      case 'terminal':
        return <Terminal className="h-4 w-4" />;
      case 'database':
        return <Database className="h-4 w-4" />;
      case 'note':
        return <PenLine className="h-4 w-4" />;
      default:
        return <Info className="h-4 w-4" />;
    }
  };

  const renderStatusColor = (status: AgentAction['status']) => {
    switch (status) {
      case 'pending':
        return 'text-yellow-500 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-300';
      case 'success':
        return 'text-green-500 bg-green-100 dark:bg-green-900 dark:text-green-300';
      case 'error':
        return 'text-red-500 bg-red-100 dark:bg-red-900 dark:text-red-300';
      default:
        return 'text-blue-500 bg-blue-100 dark:bg-blue-900 dark:text-blue-300';
    }
  };

  return (
    <div className="flex h-full overflow-hidden bg-white dark:bg-gray-950 rounded-lg border border-border">
      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Tabs */}
        <div className="flex items-center border-b border-border px-4 h-12">
          <div className="flex space-x-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={activeTab === 'chat' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setActiveTab('chat')}
                  className="flex items-center gap-1.5"
                >
                  <MessageSquare className="h-4 w-4" />
                  <span className={!showSidebar ? "sr-only" : ""}>Chat</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                Chat
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={activeTab === 'actions' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setActiveTab('actions')}
                  className="flex items-center gap-1.5"
                >
                  <Layers className="h-4 w-4" />
                  <span className={!showSidebar ? "sr-only" : ""}>Actions</span>
                  {agentActions.length > 0 && (
                    <span className="ml-1 bg-primary/20 text-primary text-xs px-1.5 py-0.5 rounded-full">
                      {agentActions.length}
                    </span>
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                Actions
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={activeTab === 'context' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setActiveTab('context')}
                  className="flex items-center gap-1.5"
                >
                  <FileText className="h-4 w-4" />
                  <span className={!showSidebar ? "sr-only" : ""}>Context</span>
                  {contextItems.length > 0 && (
                    <span className="ml-1 bg-primary/20 text-primary text-xs px-1.5 py-0.5 rounded-full">
                      {contextItems.length}
                    </span>
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                Context
              </TooltipContent>
            </Tooltip>
          </div>
          <div className="ml-auto">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowSidebar(!showSidebar)}
                  className="h-8 w-8"
                >
                  {showSidebar ? (
                    <ChevronRight className="h-4 w-4" />
                  ) : (
                    <ChevronLeft className="h-4 w-4" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="left">
                {showSidebar ? "Hide settings" : "Show settings"}
              </TooltipContent>
            </Tooltip>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-auto p-4">
          {activeTab === 'chat' && (
            <div className="space-y-6">
              <AnimatePresence>
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-lg ${
                        message.type === 'user'
                          ? 'bg-primary text-primary-foreground ml-auto'
                          : message.type === 'system'
                          ? 'bg-muted text-muted-foreground'
                          : message.type === 'action'
                          ? 'bg-secondary/50 border border-border'
                          : 'bg-card text-card-foreground border border-border'
                      } ${message.type !== 'action' ? 'p-4' : 'overflow-hidden'}`}
                    >
                      {message.type === 'action' ? (
                        <div>
                          <div className="bg-secondary/30 px-3 py-1.5 flex items-center gap-2">
                            {message.metadata?.actionType && renderActionIcon(message.metadata.actionType)}
                            <span className="text-xs font-medium">
                              {message.metadata?.actionType === 'code' ? 'Code' : 
                               message.metadata?.actionType === 'terminal' ? 'Terminal' : 
                               message.metadata?.actionType === 'file' ? 'File' : 
                               message.metadata?.actionType === 'database' ? 'Database' : 
                               'Action'}
                            </span>
                          </div>
                          <div className="p-4">
                            <div className="prose dark:prose-invert prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: message.content.replace(/```(.+?)\n([\s\S]*?)```/g, '<pre class="bg-muted p-3 rounded-md overflow-x-auto"><code>$2</code></pre>') }} />
                          </div>
                        </div>
                      ) : (
                        <p className="whitespace-pre-line text-sm">{message.content}</p>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              <div ref={messagesEndRef} />
              
              {isProcessing && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-2 text-sm text-muted-foreground"
                >
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                  <span>Agent is working...</span>
                </motion.div>
              )}
            </div>
          )}
          
          {activeTab === 'actions' && (
            <div className="space-y-3">
              {agentActions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Layers className="h-12 w-12 mx-auto mb-4 opacity-20" />
                  <p>No actions yet</p>
                </div>
              ) : (
                agentActions.map(action => (
                  <div 
                    key={action.id} 
                    className="border border-border rounded-lg overflow-hidden"
                  >
                    <div className="flex items-center p-3 bg-card">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${renderStatusColor(action.status)}`}>
                        {renderActionIcon(action.type)}
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium">{action.description}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(action.timestamp)}
                        </p>
                      </div>
                      <div className="ml-auto">
                        <span className={`text-xs px-2 py-1 rounded-full ${renderStatusColor(action.status)}`}>
                          {action.status}
                        </span>
                      </div>
                    </div>
                    {action.details && (
                      <div className="p-3 border-t border-border bg-muted/30">
                        <p className="text-xs">{action.details}</p>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
          
          {activeTab === 'context' && (
            <div className="space-y-3">
              {contextItems.map(item => (
                <div 
                  key={item.id} 
                  className="border border-border rounded-lg overflow-hidden"
                >
                  <div className="flex items-center p-3 bg-card">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center bg-secondary/30 text-secondary-foreground">
                      {renderContextIcon(item.type)}
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium">{item.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.type} • {item.timestamp.toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="p-3 border-t border-border bg-muted/30">
                    <p className="text-sm whitespace-pre-line">{item.content}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-border">
          <div className="relative">
            <textarea 
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 resize-none min-h-[80px]"
              placeholder="Ask the agent to help you..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              disabled={isProcessing}
            />
            <Button 
              className="absolute bottom-2 right-2"
              size="sm"
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isProcessing}
            >
              {isProcessing ? (
                <span className="flex items-center gap-1">
                  <span className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full"></span>
                  Working
                </span>
              ) : (
                <span className="flex items-center gap-1">
                  <Send className="h-4 w-4" />
                  Send
                </span>
              )}
            </Button>
          </div>
          <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
            <div>
              <span>Press Shift + Enter for a new line</span>
            </div>
            <div>
              <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
                <HelpCircle className="h-3 w-3 mr-1" />
                Help
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <div className={`${showSidebar ? 'w-64' : 'w-12'} border-l border-border bg-muted/30 flex flex-col h-full transition-all duration-200`}>
          <div className="p-4 border-b border-border flex items-center justify-between">
            {showSidebar ? (
              <h3 className="font-medium text-sm">Agent Settings</h3>
            ) : (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-6 w-6 p-0">
                    <Sparkles className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="left">Agent Settings</TooltipContent>
              </Tooltip>
            )}
          </div>
          <div className="p-4 flex-1 overflow-auto">
            <div className="space-y-4">
              <div>
                {showSidebar ? (
                  <>
                    <label className="text-xs font-medium block mb-1.5">Agent Mode</label>
                    <select className="w-full text-sm rounded-md border border-input bg-background px-3 py-1.5">
                      <option>Windsurf Agent</option>
                      <option>Standard Assistant</option>
                      <option>Code Expert</option>
                    </select>
                  </>
                ) : (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex justify-center mb-2">
                        <Sparkles className="h-4 w-4" />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="left">Agent Mode: Windsurf Agent</TooltipContent>
                  </Tooltip>
                )}
              </div>
              
              <div>
                {showSidebar ? (
                  <>
                    <label className="text-xs font-medium block mb-1.5">Model</label>
                    <select className="w-full text-sm rounded-md border border-input bg-background px-3 py-1.5">
                      <option>Cascade</option>
                      <option>GPT-4</option>
                      <option>Claude 3</option>
                    </select>
                  </>
                ) : (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex justify-center mb-2">
                        <Cpu className="h-4 w-4" />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="left">Model: Cascade</TooltipContent>
                  </Tooltip>
                )}
              </div>
              
              <div className="pt-2">
                {showSidebar ? (
                  <h4 className="text-xs font-medium mb-2">Agent Capabilities</h4>
                ) : (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex justify-center mb-2">
                        <Code className="h-4 w-4" />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="left">Agent Capabilities</TooltipContent>
                  </Tooltip>
                )}
                <div className="space-y-2">
                  <div className="flex items-center">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex items-center">
                          <input 
                            type="checkbox" 
                            id="code" 
                            className="rounded text-primary" 
                            checked={capabilities.code} 
                            onChange={(e) => setCapabilities({...capabilities, code: e.target.checked})} 
                          />
                          {showSidebar && (
                            <label htmlFor="code" className="ml-2 text-xs">Code Generation</label>
                          )}
                        </div>
                      </TooltipTrigger>
                      {!showSidebar && (
                        <TooltipContent side="left">Code Generation</TooltipContent>
                      )}
                    </Tooltip>
                  </div>
                  <div className="flex items-center">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex items-center">
                          <input 
                            type="checkbox" 
                            id="terminal" 
                            className="rounded text-primary" 
                            checked={capabilities.terminal} 
                            onChange={(e) => setCapabilities({...capabilities, terminal: e.target.checked})} 
                          />
                          {showSidebar && (
                            <label htmlFor="terminal" className="ml-2 text-xs">Terminal Access</label>
                          )}
                        </div>
                      </TooltipTrigger>
                      {!showSidebar && (
                        <TooltipContent side="left">Terminal Access</TooltipContent>
                      )}
                    </Tooltip>
                  </div>
                  <div className="flex items-center">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex items-center">
                          <input 
                            type="checkbox" 
                            id="files" 
                            className="rounded text-primary" 
                            checked={capabilities.files} 
                            onChange={(e) => setCapabilities({...capabilities, files: e.target.checked})} 
                          />
                          {showSidebar && (
                            <label htmlFor="files" className="ml-2 text-xs">File System Access</label>
                          )}
                        </div>
                      </TooltipTrigger>
                      {!showSidebar && (
                        <TooltipContent side="left">File System Access</TooltipContent>
                      )}
                    </Tooltip>
                  </div>
                  <div className="flex items-center">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex items-center">
                          <input 
                            type="checkbox" 
                            id="web" 
                            className="rounded text-primary" 
                            checked={capabilities.web} 
                            onChange={(e) => setCapabilities({...capabilities, web: e.target.checked})} 
                          />
                          {showSidebar && (
                            <label htmlFor="web" className="ml-2 text-xs">Web Browsing</label>
                          )}
                        </div>
                      </TooltipTrigger>
                      {!showSidebar && (
                        <TooltipContent side="left">Web Browsing</TooltipContent>
                      )}
                    </Tooltip>
                  </div>
                </div>
              </div>
              
              <div className="pt-2">
                {showSidebar ? (
                  <h4 className="text-xs font-medium mb-2">Memory & Context</h4>
                ) : (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex justify-center mb-2">
                        <Brain className="h-4 w-4" />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="left">Memory & Context</TooltipContent>
                  </Tooltip>
                )}
                <div className="space-y-2">
                  <div>
                    {showSidebar ? (
                      <>
                        <label className="text-xs block mb-1">Context Window</label>
                        <div className="w-full">
                          <input 
                            type="range" 
                            min="1" 
                            max="10" 
                            value="5" 
                            className="w-full h-1.5 bg-gray-300 rounded-lg appearance-none cursor-pointer"
                          />
                        </div>
                        <div className="flex justify-between text-xs text-muted-foreground mt-1">
                          <span>Small</span>
                          <span>Large</span>
                        </div>
                      </>
                    ) : (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="flex justify-center">
                            <input 
                              type="range" 
                              min="1" 
                              max="10" 
                              value="5" 
                              className="w-6 h-1.5 bg-gray-300 rounded-lg appearance-none cursor-pointer"
                            />
                          </div>
                        </TooltipTrigger>
                        <TooltipContent side="left">Context Window: Medium</TooltipContent>
                      </Tooltip>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="p-4 border-t border-border">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="sm" className={showSidebar ? "w-full" : "w-8 h-8 p-0"}>
                  <Settings className="h-4 w-4" />
                  {showSidebar && <span className="ml-2">Advanced Settings</span>}
                </Button>
              </TooltipTrigger>
              {!showSidebar && (
                <TooltipContent side="left">Advanced Settings</TooltipContent>
              )}
            </Tooltip>
          </div>
        </div>
    </div>
  );
}
