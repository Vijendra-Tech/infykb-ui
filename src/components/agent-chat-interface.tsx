'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, Star, Crown, ArrowLeft, MoreVertical, Copy, Share2, ThumbsUp, ThumbsDown, Sparkles, Maximize2, Minimize2, MessageCircle, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Agent, AgentChatSession, AgentMessage } from '@/types/agent-types';
import { AgentMarketplaceService } from '@/services/agent-marketplace-service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useRouter } from 'next/navigation';

interface AgentChatInterfaceProps {
  agentId: string;
  sessionId?: string;
  onBack?: () => void;
  className?: string;
  isFullScreen?: boolean;
  onToggleFullScreen?: () => void;
}

export function AgentChatInterface({ agentId, sessionId, onBack, className = '', isFullScreen = false, onToggleFullScreen }: AgentChatInterfaceProps) {
  const router = useRouter();
  const [agent, setAgent] = useState<Agent | null>(null);
  const [session, setSession] = useState<AgentChatSession | null>(null);
  const [messages, setMessages] = useState<AgentMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isInternalFullScreen, setIsInternalFullScreen] = useState(false);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const effectiveFullScreen = isFullScreen || isInternalFullScreen;

  const handleToggleFullScreen = () => {
    if (onToggleFullScreen) {
      onToggleFullScreen();
    } else {
      setIsInternalFullScreen(!isInternalFullScreen);
    }
  };

  // Load agent and session data
  useEffect(() => {
    const loadData = async () => {
      const agentData = AgentMarketplaceService.getAgentById(agentId);
      if (!agentData) {
        console.error('Agent not found');
        return;
      }

      setAgent(agentData);

      let sessionData: AgentChatSession;
      if (sessionId) {
        const existingSession = AgentMarketplaceService.getChatSession(sessionId);
        if (existingSession) {
          sessionData = existingSession;
        } else {
          sessionData = AgentMarketplaceService.createChatSession(agentId, 'current-user');
        }
      } else {
        sessionData = AgentMarketplaceService.createChatSession(agentId, 'current-user');
      }

      setSession(sessionData);
      setMessages(sessionData.messages);

      // Add welcome message if no messages exist
      if (sessionData.messages.length === 0) {
        const welcomeMessage = AgentMarketplaceService.addMessageToSession(sessionData.id, {
          role: 'agent',
          content: `Hello! I'm ${agentData.name}. ${agentData.description} How can I assist you today?`,
          metadata: {
            agentName: agentData.name,
            agentIcon: agentData.icon
          }
        });
        setMessages([welcomeMessage]);
      }
    };

    loadData();
  }, [agentId, sessionId]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (shouldAutoScroll && messagesEndRef.current) {
      const scrollTimeout = setTimeout(() => {
        if (effectiveFullScreen) {
          // For full screen, use scrollIntoView with better options
          messagesEndRef.current?.scrollIntoView({ 
            behavior: 'smooth',
            block: 'end',
            inline: 'nearest'
          });
        } else {
          // For regular mode, use existing behavior
          messagesEndRef.current?.scrollIntoView({ 
            behavior: 'smooth',
            block: 'end',
            inline: 'nearest'
          });
        }
      }, 100);
      return () => clearTimeout(scrollTimeout);
    }
  }, [messages, shouldAutoScroll, effectiveFullScreen]);

  // Scroll to bottom when agent is first selected
  useEffect(() => {
    if (agent && messages.length > 0) {
      const scrollTimeout = setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ 
          behavior: 'smooth',
          block: 'end',
          inline: 'nearest'
        });
      }, 200);
      
      return () => clearTimeout(scrollTimeout);
    }
  }, [agent]);

  // Enhanced scroll handler with momentum and visual feedback
  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const container = event.currentTarget;
    const { scrollTop, scrollHeight, clientHeight } = container;
    
    // Calculate scroll progress (0-1)
    const progress = scrollTop / (scrollHeight - clientHeight);
    setScrollProgress(Math.min(Math.max(progress, 0), 1));
    
    // Check if user is near the bottom (within 100px)
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
    
    // Show/hide scroll to bottom button
    setShowScrollToBottom(!isNearBottom && scrollTop > 200);
    
    // Only auto-scroll if user is near the bottom
    setShouldAutoScroll(isNearBottom);
    
    // Visual feedback for scrolling
    setIsScrolling(true);
    
    // Clear existing timeout
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }
    
    // Set scrolling to false after scroll ends
    scrollTimeoutRef.current = setTimeout(() => {
      setIsScrolling(false);
    }, 150);
  };

  // Scroll to bottom function
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ 
      behavior: 'smooth',
      block: 'end',
      inline: 'nearest'
    });
    setShouldAutoScroll(true);
  };

  // Focus input on load
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !session || isLoading) return;

    const userMessage = inputMessage.trim();
    setInputMessage('');
    setIsLoading(true);
    setIsTyping(true);

    try {
      // Ensure auto-scroll is enabled when sending a message
      setShouldAutoScroll(true);
      
      // Add user message
      const newUserMessage = AgentMarketplaceService.addMessageToSession(session.id, {
        role: 'user',
        content: userMessage
      });

      setMessages(prev => [...prev, newUserMessage]);

      // Simulate agent response
      const agentResponse = await AgentMarketplaceService.simulateAgentResponse(agentId, userMessage);
      
      // Add agent response
      const newAgentMessage = AgentMarketplaceService.addMessageToSession(session.id, {
        role: 'agent',
        content: agentResponse,
        metadata: {
          agentName: agent?.name,
          agentIcon: agent?.icon
        }
      });

      setMessages(prev => [...prev, newAgentMessage]);
      
      // Ensure we scroll to the new message
      setShouldAutoScroll(true);
    } catch (error) {
      console.error('Error sending message:', error);
      // Add error message
      const errorMessage = AgentMarketplaceService.addMessageToSession(session.id, {
        role: 'agent',
        content: 'I apologize, but I encountered an error processing your request. Please try again.',
        metadata: {
          agentName: agent?.name,
          agentIcon: agent?.icon
        }
      });
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.push('/agents');
    }
  };

  const copyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
  };

  const rateMessage = (messageId: string, rating: 'up' | 'down') => {
    // In a real app, you'd send this to your backend
    console.log(`Rated message ${messageId} as ${rating}`);
  };

  if (!agent || !session) {
    return (
      <div className={`flex items-center justify-center min-h-[400px] ${className}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading chat...</p>
        </div>
      </div>
    );
  }

  const containerClasses = effectiveFullScreen 
    ? 'fixed inset-0 z-50 bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20 backdrop-blur-sm flex flex-col'
    : `flex flex-col h-full bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20 ${className}`;

  return (
    <AnimatePresence>
      <motion.div 
        className={containerClasses}
        initial={effectiveFullScreen ? { opacity: 0, scale: 0.95 } : false}
        animate={effectiveFullScreen ? { opacity: 1, scale: 1 } : {}}
        exit={effectiveFullScreen ? { opacity: 0, scale: 0.95 } : {}}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        {/* Enhanced Header */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="rounded-none border-x-0 border-t-0 bg-white/90 backdrop-blur-md shadow-lg border-b border-slate-200/50">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {(onBack || effectiveFullScreen) && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={effectiveFullScreen ? handleToggleFullScreen : handleBack}
                      className="h-9 w-9 p-0 hover:bg-slate-100 rounded-lg transition-colors duration-200"
                    >
                      <ArrowLeft className="h-4 w-4" />
                    </Button>
                  )}
                  
                  {agent && (
                    <>
                      <motion.div 
                        className={`text-2xl p-3 rounded-xl bg-gradient-to-br ${agent.gradient} text-white shadow-lg relative overflow-hidden`}
                        whileHover={{ scale: 1.05 }}
                        transition={{ type: "spring", stiffness: 400, damping: 25 }}
                      >
                        {/* Shimmer effect */}
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                          animate={{ x: ['-100%', '100%'] }}
                          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        />
                        <span className="relative z-10">{agent.icon}</span>
                      </motion.div>
                      
                      <div>
                        <div className="flex items-center gap-2">
                          <CardTitle className="text-lg bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                            {agent.name}
                          </CardTitle>
                          {agent.isPremium && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ delay: 0.3, type: "spring" }}
                            >
                              <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs shadow-md">
                                <Crown className="h-2 w-2 mr-1" />
                                Premium
                              </Badge>
                            </motion.div>
                          )}
                        </div>
                        <CardDescription className="text-sm text-slate-600">
                          {agent.description}
                        </CardDescription>
                      </div>
                    </>
                  )}
                </div>
                
                <div className="flex items-center gap-3">
                  {agent && (
                    <motion.div 
                      className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200/50 text-sm text-yellow-700"
                      whileHover={{ scale: 1.05 }}
                    >
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      <span className="font-medium">{agent.rating.toFixed(1)}</span>
                    </motion.div>
                  )}
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleToggleFullScreen}
                    className="h-9 w-9 p-0 hover:bg-slate-100 rounded-lg transition-all duration-200"
                    title={effectiveFullScreen ? "Exit Full Screen" : "Enter Full Screen"}
                  >
                    {effectiveFullScreen ? (
                      <Minimize2 className="h-4 w-4" />
                    ) : (
                      <Maximize2 className="h-4 w-4" />
                    )}
                  </Button>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-9 w-9 p-0 hover:bg-slate-100 rounded-lg">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-white/95 backdrop-blur-md border border-slate-200/50">
                      <DropdownMenuItem className="hover:bg-slate-50 transition-colors duration-200">
                        <Copy className="h-4 w-4 mr-2" />
                        Copy Session
                      </DropdownMenuItem>
                      <DropdownMenuItem className="hover:bg-slate-50 transition-colors duration-200">
                        <Share2 className="h-4 w-4 mr-2" />
                        Share Chat
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </CardHeader>
          </Card>
        </motion.div>

        {/* Enhanced Messages Area */}
        <div className="flex-1 overflow-hidden relative">
          {/* Scroll Progress Indicator */}
          <motion.div 
            className="absolute top-0 left-0 h-1 bg-gradient-to-r from-blue-500 to-purple-500 z-20 opacity-70"
            style={{ width: `${scrollProgress * 100}%` }}
            initial={{ opacity: 0 }}
            animate={{ opacity: isScrolling ? 1 : 0.3 }}
            transition={{ duration: 0.2 }}
          />
          
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-30">
            <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/20 to-slate-50/30" />
            <div className="absolute inset-0" style={{
              backgroundImage: `radial-gradient(circle at 25% 25%, rgba(139, 92, 246, 0.1) 0%, transparent 50%), 
                               radial-gradient(circle at 75% 75%, rgba(59, 130, 246, 0.1) 0%, transparent 50%)`
            }} />
          </div>
          
          {/* Scroll to Bottom Button */}
          <AnimatePresence>
            {showScrollToBottom && (
              <motion.div
                className="absolute bottom-6 right-6 z-30"
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: 20 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
              >
                <Button
                  onClick={scrollToBottom}
                  size="sm"
                  className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300 p-0"
                >
                  <motion.div
                    animate={{ y: [0, 2, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <ArrowLeft className="h-4 w-4 rotate-[-90deg]" />
                  </motion.div>
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
          
          <ScrollArea 
            className={`h-full px-6 py-6 relative z-10 ${effectiveFullScreen ? 'max-h-screen' : ''}`}
            ref={scrollAreaRef}
            onScrollCapture={handleScroll}
            style={effectiveFullScreen ? { height: 'calc(100vh - 200px)' } : {}}
          >
            <div 
              className={`space-y-6 max-w-4xl mx-auto ${effectiveFullScreen ? 'pb-8' : ''}`}
              ref={messagesContainerRef}
              style={effectiveFullScreen ? { 
                WebkitOverflowScrolling: 'touch',
                scrollBehavior: 'smooth'
              } : {}}
            >
              <AnimatePresence>
                {messages.map((message, index) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -20, scale: 0.95 }}
                    transition={{ 
                      duration: 0.4, 
                      delay: index * 0.1,
                      ease: "easeOut"
                    }}
                  >
                    <MessageBubble
                      message={message}
                      agent={agent!}
                      onCopy={() => copyMessage(message.content)}
                      onRate={(rating) => rateMessage(message.id, rating)}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
              
              {isTyping && (
                <motion.div 
                  className="flex items-start gap-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <motion.div 
                    className={`text-2xl p-3 rounded-xl bg-gradient-to-br ${agent?.gradient} text-white shadow-lg`}
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    {agent?.icon}
                  </motion.div>
                  <div className="bg-white/90 backdrop-blur-sm rounded-2xl rounded-tl-md px-5 py-4 shadow-lg border border-slate-200/50">
                    <div className="flex items-center gap-3">
                      <div className="flex space-x-1">
                        <motion.div 
                          className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                          animate={{ y: [0, -8, 0] }}
                          transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                        />
                        <motion.div 
                          className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                          animate={{ y: [0, -8, 0] }}
                          transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                        />
                        <motion.div 
                          className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                          animate={{ y: [0, -8, 0] }}
                          transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                        />
                      </div>
                      <span className="text-sm text-slate-600 font-medium">AI is thinking...</span>
                      <Sparkles className="h-4 w-4 text-purple-500 animate-pulse" />
                    </div>
                  </div>
                </motion.div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
        </div>

        {/* Enhanced Input Area */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="rounded-none border-x-0 border-b-0 bg-white/95 backdrop-blur-md shadow-xl border-t border-slate-200/50">
            <CardContent className="p-6">
              <div className="flex items-end gap-4">
                <div className="flex-1 relative">
                  <div className="relative">
                    <Input
                      ref={inputRef}
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder={`Message ${agent?.name || 'Agent'}...`}
                      disabled={isLoading}
                      className="min-h-[52px] text-base border-slate-300 focus:border-purple-500 focus:ring-purple-500/20 bg-white/80 backdrop-blur-sm rounded-xl shadow-sm transition-all duration-200 pr-12"
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <MessageCircle className="h-4 w-4 text-slate-400" />
                    </div>
                  </div>
                </div>
                
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    onClick={handleSendMessage}
                    disabled={!inputMessage.trim() || isLoading}
                    className="h-[52px] px-8 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 hover:opacity-90 shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <motion.div 
                        className="flex items-center gap-2"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                      >
                        <motion.div
                          className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        />
                        <span>Sending</span>
                      </motion.div>
                    ) : (
                      <motion.div 
                        className="flex items-center gap-2"
                        whileHover={{ x: 2 }}
                      >
                        <Send className="h-4 w-4" />
                        <span>Send</span>
                      </motion.div>
                    )}
                  </Button>
                </motion.div>
              </div>
              
              <div className="flex items-center justify-between mt-3 text-xs">
                <div className="flex items-center gap-4 text-slate-500">
                  <span>Press Enter to send, Shift+Enter for new line</span>
                  <div className="flex items-center gap-1">
                    <Zap className="h-3 w-3" />
                    <span>AI-powered responses</span>
                  </div>
                </div>
                <div className={`font-medium ${
                  inputMessage.length > 800 ? 'text-red-500' : 
                  inputMessage.length > 600 ? 'text-yellow-500' : 
                  'text-slate-500'
                }`}>
                  {inputMessage.length}/1000
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

interface MessageBubbleProps {
  message: AgentMessage;
  agent: Agent;
  onCopy: () => void;
  onRate: (rating: 'up' | 'down') => void;
}

function MessageBubble({ message, agent, onCopy, onRate }: MessageBubbleProps) {
  const [showActions, setShowActions] = useState(false);

  if (message.role === 'user') {
    return (
      <div className="flex items-start gap-3 justify-end">
        <div 
          className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl rounded-tr-md px-4 py-3 shadow-md max-w-[70%] group relative"
          onMouseEnter={() => setShowActions(true)}
          onMouseLeave={() => setShowActions(false)}
        >
          <p className="text-sm leading-relaxed">{message.content}</p>
          
          {showActions && (
            <div className="absolute -left-10 top-1/2 transform -translate-y-1/2 transition-opacity duration-200">
              <Button variant="ghost" size="sm" onClick={onCopy} className="h-8 w-8 p-0 bg-white shadow-md hover:bg-gray-50 transition-colors duration-200">
                <Copy className="h-3 w-3" />
              </Button>
            </div>
          )}
        </div>
        
        <div className="text-2xl p-2 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 text-white shadow-md">
          <User className="h-4 w-4" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-3">
      <div className={`text-2xl p-2 rounded-lg bg-gradient-to-br ${agent.gradient} text-white shadow-md`}>
        {agent.icon}
      </div>
      
      <div 
        className="bg-white rounded-2xl rounded-tl-md px-4 py-3 shadow-md border max-w-[70%] group relative"
        onMouseEnter={() => setShowActions(true)}
        onMouseLeave={() => setShowActions(false)}
      >
        <div className="flex items-center gap-2 mb-2">
          <span className="text-sm font-medium text-gray-900">{agent.name}</span>
          <Sparkles className="h-3 w-3 text-blue-500" />
        </div>
        
        <p className="text-sm leading-relaxed text-gray-800">{message.content}</p>
        
        <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-100">
          <span className="text-xs text-gray-500">
            {new Date(message.timestamp).toLocaleTimeString()}
          </span>
          
          {showActions && (
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="sm" onClick={onCopy} className="h-6 w-6 p-0 hover:bg-gray-100 transition-colors duration-200">
                <Copy className="h-3 w-3" />
              </Button>
              <Button variant="ghost" size="sm" onClick={() => onRate('up')} className="h-6 w-6 p-0 hover:bg-green-100 transition-colors duration-200">
                <ThumbsUp className="h-3 w-3" />
              </Button>
              <Button variant="ghost" size="sm" onClick={() => onRate('down')} className="h-6 w-6 p-0 hover:bg-red-100 transition-colors duration-200">
                <ThumbsDown className="h-3 w-3" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
