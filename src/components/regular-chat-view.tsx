"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { 
  Sparkles, 
  Send, 
  ChevronDown, 
  MessageSquare, 
  Check,
  Clock
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useChatHistoryStore } from "@/store/use-chat-history-store";

type Message = {
  id: string;
  type: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
};

export function RegularChatView() {
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
  const [isTyping, setIsTyping] = useState(false);
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
    
    // Show typing indicator
    setIsTyping(true);
    
    // Simulate assistant response
    setTimeout(() => {
      setIsTyping(false);
      setMessages([
        ...newMessages,
        {
          id: "response-" + Math.random().toString(36).substring(2, 9),
          type: 'assistant',
          content: generateResponse(inputValue),
          timestamp: new Date(),
        }
      ]);
    }, 1500);
  };
  
  const generateResponse = (query: string): string => {
    // Simple response generation logic - in a real app this would call an API
    if (query.toLowerCase().includes('hello') || query.toLowerCase().includes('hi')) {
      return "Hello! How can I assist you today?";
    } else if (query.toLowerCase().includes('help')) {
      return "I'm here to help! Please let me know what you need assistance with, and I'll do my best to provide the information or guidance you're looking for.";
    } else if (query.toLowerCase().includes('thank')) {
      return "You're welcome! If you have any other questions, feel free to ask.";
    } else {
      return "Thank you for your message. I've processed your request and am happy to help with any questions you might have about our products, services, or any other information you're looking for.";
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-gradient-to-b from-background to-muted/20">
      {/* Header with model selector */}
      <div className="flex items-center justify-between border-b border-border p-3 bg-muted/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-muted/70 px-3 py-1.5 rounded-md text-xs border border-border/50 shadow-sm">
            <Clock className="h-3 w-3 text-muted-foreground" />
            <span className="font-medium">New Chat</span>
          </div>
        </div>
        
        <div className="relative" ref={dropdownRef}>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsModelDropdownOpen(!isModelDropdownOpen)}
            className="flex items-center gap-1.5 text-xs bg-background/80 border-border/50 hover:bg-background shadow-sm"
          >
            <Sparkles className="h-3 w-3 text-primary mr-1" />
            <span>{selectedModel}</span>
            <ChevronDown className="h-3 w-3 ml-1 opacity-70" />
          </Button>
          
          {isModelDropdownOpen && (
            <div className="absolute right-0 top-full mt-1 w-56 rounded-md shadow-lg bg-background border border-border z-10 overflow-hidden">
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
        <div className="flex-1 overflow-auto p-4 space-y-4">
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
                    onClick={() => setInputValue("Tell me about your features")}
                    className="bg-background/80 border-primary/20 hover:bg-background shadow-sm"
                  >
                    Features
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setInputValue("How can you help me?")}
                    className="bg-background/80 border-primary/20 hover:bg-background shadow-sm"
                  >
                    Help options
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setInputValue("What's new?")}
                    className="bg-background/80 border-primary/20 hover:bg-background shadow-sm"
                  >
                    What's new
                  </Button>
                </div>
              </motion.div>
            ) : (
              <div className="space-y-6">
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className={cn(
                      "flex",
                      message.type === 'user' ? "justify-end" : "justify-start"
                    )}
                  >
                    <div
                      className={cn(
                        "max-w-[85%] rounded-lg shadow-sm p-3",
                        message.type === 'user'
                          ? "bg-primary text-primary-foreground"
                          : message.type === 'system'
                          ? "bg-muted/30 border border-border/50"
                          : "bg-background border border-border/50"
                      )}
                    >
                      <div className="whitespace-pre-line">{message.content}</div>
                    </div>
                  </motion.div>
                ))}
                
                {isTyping && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex justify-start"
                  >
                    <div className="max-w-[85%] rounded-lg shadow-sm p-3 bg-background border border-border/50">
                      <div className="flex space-x-2">
                        <div className="w-2 h-2 rounded-full bg-muted-foreground/30 animate-bounce" style={{ animationDelay: "0ms" }}></div>
                        <div className="w-2 h-2 rounded-full bg-muted-foreground/30 animate-bounce" style={{ animationDelay: "300ms" }}></div>
                        <div className="w-2 h-2 rounded-full bg-muted-foreground/30 animate-bounce" style={{ animationDelay: "600ms" }}></div>
                      </div>
                    </div>
                  </motion.div>
                )}
                
                <div ref={messagesEndRef} />
              </div>
            )}
          </AnimatePresence>
        </div>
        
        {/* Input area */}
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
              disabled={isTyping}
            />
            <Button 
              className="absolute bottom-3 right-3 shadow-sm"
              size="sm"
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isTyping}
            >
              <Send className="h-4 w-4 mr-1" />
              Send
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
