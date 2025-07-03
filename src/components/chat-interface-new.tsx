"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles, Send, ChevronDown, MessageSquare, PenLine, ExternalLink } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function ChatInterface() {
  const [inputValue, setInputValue] = useState("");
  const [messages, setMessages] = useState<{type: 'user' | 'assistant', content: string}[]>([]);
  const [selectedModel, setSelectedModel] = useState("Auto");
  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);
  const [activeButton, setActiveButton] = useState<'agent' | 'chat'>('agent');
  
  // Sample customer data for Agent mode
  const customerData = {
    name: "Janet Deer",
    id: "cus_28944",
    orders: 8,
    signupDate: "2023-11-28"
  };
  
  // Sample chat messages for Agent mode
  const customerMessages = [
    { sender: 'agent', content: "Hi, I'm Blossom, your support representative. How can I help you today?" },
    { sender: 'customer', content: "Hi, how can I cancel an order?" },
    { sender: 'agent', content: "To cancel an order, you can do so directly through your account:\n\nLog into your account.\nGo to your order history.\nSelect \"Cancel Order\" for the relevant order.\nIf you have your order ID handy, I can process the cancellation for you!" },
    { sender: 'customer', content: "Can you please help me cancel ORD1001?" }
  ];
  
  const supportMessages = [
    { sender: 'customer', content: "Hi, how can I cancel an order?" },
    { sender: 'agent', content: "To cancel an order, you can do so directly through your account.\nLog into your account.\nGo to your order history.\nSelect \"Cancel Order\" for the relevant order.\nIf you have your order ID handy, I can process the cancellation for you!" },
    { sender: 'customer', content: "Can you please help me cancel ORD1001?" },
    { sender: 'suggestion', content: "Suggested cancel order" },
    { sender: 'suggestion', content: "Called get order" },
    { sender: 'agent', content: "I will proceed to cancel order ORD1001 for you. Please hold on a moment while I handle this." }
  ];
  
  const models = [
    { name: "Auto", description: "Dynamic cost" },
    { name: "Flux Kontext [PRO]", description: null },
    { name: "Flux Kontext [MAX]", description: null },
    { name: "GPT", description: null },
    { name: "GPT-HQ", description: null }
  ];
  
  const handleSendMessage = () => {
    if (inputValue.trim()) {
      // Add user message
      setMessages([...messages, { type: 'user', content: inputValue }]);
      
      // Simulate assistant response after a delay
      setTimeout(() => {
        setMessages(prev => [...prev, { 
          type: 'assistant', 
          content: `This is a simulated response using ${selectedModel} model: "${inputValue}"` 
        }]);
      }, 1000);
      
      setInputValue("");
    }
  };
  
  // Function to render message bubbles for chat
  const renderMessage = (message: any, isCustomerView: boolean = false) => {
    const isCustomer = message.sender === 'customer';
    const isAgent = message.sender === 'agent';
    const isSuggestion = message.sender === 'suggestion';
    
    if (isSuggestion) {
      return (
        <div className="flex justify-end mb-2">
          <button className="flex items-center text-sm text-blue-500 hover:text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-full">
            <span className="mr-1">{message.content}</span>
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 5L16 12L9 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      );
    }
    
    return (
      <div className={`flex ${isCustomer ? 'justify-end' : 'justify-start'} mb-4`}>
        <div className={`max-w-[80%] p-3 rounded-lg ${isCustomer ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
          <p className="whitespace-pre-line text-sm">{message.content}</p>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full">
      {activeButton === 'chat' ? (
        // Regular Chat Interface
        <div className="flex-1 overflow-auto">
          <div className="flex flex-col justify-end min-h-full">
            <AnimatePresence>
              {messages.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center h-full p-8 text-center"
                >
                  <div className="mb-4">
                    <Sparkles className="h-12 w-12 text-muted-foreground" />
                  </div>
                  <h2 className="text-2xl font-bold mb-2">How can I help you today?</h2>
                  <p className="text-muted-foreground mb-8 max-w-md">
                    Ask me anything or start with one of the suggestions below.
                  </p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    <Button variant="outline" onClick={() => setInputValue("Tell me about the latest features")}>
                      Latest features
                    </Button>
                    <Button variant="outline" onClick={() => setInputValue("How do I create a new project?")}>
                      Create a project
                    </Button>
                    <Button variant="outline" onClick={() => setInputValue("What are the best practices?")}>
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
                        className={`max-w-[80%] p-3 rounded-lg ${
                          message.type === 'user'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted'
                        }`}
                      >
                        <p className="whitespace-pre-line">{message.content}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      ) : (
        // Agent Mode Interface with Split View
        <div className="flex-1 overflow-auto">
          <div className="bg-rose-100 text-rose-800 py-1 px-4 text-center text-sm font-medium">
            <div className="flex justify-between">
              <div>Customer View</div>
              <div>Support Representative View</div>
            </div>
          </div>
          
          <div className="flex h-[calc(100%-32px)]">
            {/* Customer View */}
            <div className="w-1/2 border-r border-gray-200 flex flex-col">
              <div className="p-4 bg-gray-50 border-b border-gray-200">
                <div className="text-sm text-gray-600">
                  <p className="font-medium">Hi, I'm Blossom, your support representative.</p>
                  <p>How can I help you today?</p>
                </div>
              </div>
              
              <div className="flex-1 overflow-auto p-4">
                <div className="space-y-4">
                  {customerMessages.map((message, index) => renderMessage(message, true))}
                </div>
              </div>
              
              <div className="p-4 border-t border-gray-200">
                <div className="relative">
                  <textarea 
                    className="w-full rounded-lg border border-gray-300 p-3 pr-10 resize-none focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent" 
                    placeholder="Message..." 
                    rows={1}
                  />
                  <button className="absolute right-3 bottom-3 text-gray-500 hover:text-gray-700">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
            
            {/* Support Representative View */}
            <div className="w-1/2 flex">
              <div className="flex-1 flex flex-col border-r border-gray-200">
                <div className="p-4 bg-gray-50 border-b border-gray-200">
                  <div className="text-sm">
                    <p>Hi, I'm Blossom, your support representative. How can I help you today?</p>
                  </div>
                </div>
                
                <div className="flex-1 overflow-auto p-4">
                  <div className="space-y-4">
                    {supportMessages.map((message, index) => renderMessage(message))}                    
                  </div>
                </div>
                
                <div className="p-4 border-t border-gray-200">
                  <div className="flex items-center gap-2 mb-2">
                    <button className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-full text-xs font-medium">Send now</button>
                    <button className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-full text-xs font-medium">Edit</button>
                  </div>
                  <div className="relative">
                    <textarea 
                      className="w-full rounded-lg border border-gray-300 p-3 pr-10 resize-none focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent" 
                      placeholder="Message..." 
                      rows={1}
                    />
                    <button className="absolute right-3 bottom-3 text-gray-500 hover:text-gray-700">
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Customer Details Panel */}
              <div className="w-64 bg-white border-l border-gray-200 p-4 overflow-auto">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-medium mb-2">Customer details</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Name</span>
                        <span>{customerData.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">ID</span>
                        <span>{customerData.id}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500"># Orders</span>
                        <span>{customerData.orders}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Signup Date</span>
                        <span>{customerData.signupDate}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium mb-2">Recommended actions</h3>
                    <div className="flex gap-2">
                      <button className="px-3 py-1 bg-gray-800 text-white text-xs rounded-md">Create ticket</button>
                      <button className="px-3 py-1 border border-gray-300 text-xs rounded-md">Cancel order</button>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium mb-2">Relevant articles</h3>
                    <div className="space-y-3">
                      <div>
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-medium">Order Cancellation</h4>
                          <span className="text-xs bg-rose-100 text-rose-800 px-1.5 py-0.5 rounded">PUBLIC FAQ</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">If you've changed your mind or made an error with your order, you have up to 1 hour from the time of purchase to cancel directly through your account...</p>
                      </div>
                      
                      <div>
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-medium">Order Cancellation</h4>
                          <span className="text-xs bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded">INTERNAL</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Orders can be cancelled if the request is received: - Within 1 hour of purchase. - Before the order status is marked as "Prepared"...</p>
                      </div>
                      
                      <div>
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-medium">Returns Policy</h4>
                          <span className="text-xs bg-rose-100 text-rose-800 px-1.5 py-0.5 rounded">PUBLIC FAQ</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">We strive to ensure customer satisfaction. If you're not fully satisfied with your purchase, we offer a 30-day return policy from the date of receipt...</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Input area - fixed at bottom */}
      <motion.div 
        className="border-t p-4 bg-background dark:bg-gray-900"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        <div className="max-w-4xl mx-auto">
          <div className="relative">
            <div className="p-2 md:px-4">
              <div className="flex items-center">
                <div className="flex w-full items-center pb-4 md:pb-1">
                  <motion.div 
                    className="flex w-full flex-col gap-1.5 rounded-2xl p-2.5 pl-1.5 bg-background dark:bg-gray-800 border border-input dark:border-gray-700 shadow-sm transition-colors"
                    whileHover={{ boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)" }}
                    animate={{ boxShadow: inputValue ? "0 2px 8px rgba(0, 0, 0, 0.08)" : "none" }}
                  >
                    {/* Model selector and action buttons */}
                    <div className="flex justify-between items-center px-4 py-1">
                      <div className="flex items-center gap-2">
                        <Button 
                          variant={activeButton === 'agent' ? "default" : "ghost"} 
                          size="sm" 
                          className={`flex items-center gap-1 text-xs font-medium ${activeButton === 'agent' ? 'text-foreground dark:text-white' : 'text-muted-foreground hover:text-foreground dark:text-gray-400 dark:hover:text-white'}`}
                          onClick={() => setActiveButton('agent')}
                        >
                          <PenLine className="h-3 w-3" />
                          Agent
                        </Button>
                        <Button 
                          variant={activeButton === 'chat' ? "default" : "ghost"} 
                          size="sm" 
                          className={`flex items-center gap-1 text-xs font-medium ${activeButton === 'chat' ? 'text-foreground dark:text-white' : 'text-muted-foreground hover:text-foreground dark:text-gray-400 dark:hover:text-white'}`}
                          onClick={() => setActiveButton('chat')}
                        >
                          <MessageSquare className="h-3 w-3" />
                          Chat
                        </Button>
                      </div>
                      <div className="relative">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground dark:text-gray-400 dark:hover:text-white"
                          onClick={() => setIsModelDropdownOpen(!isModelDropdownOpen)}
                        >
                          {selectedModel}
                          <ChevronDown className="h-3 w-3" />
                        </Button>
                        
                        {isModelDropdownOpen && (
                          <div className="absolute right-0 bottom-full mb-1 w-48 rounded-md bg-background dark:bg-gray-800 shadow-lg border border-border dark:border-gray-700 z-50">
                            <div className="py-1">
                              {models.map((model) => (
                                <button
                                  key={model.name}
                                  className="flex items-center justify-between w-full px-3 py-1.5 text-sm text-left hover:bg-muted dark:hover:bg-gray-700"
                                  onClick={() => {
                                    setSelectedModel(model.name);
                                    setIsModelDropdownOpen(false);
                                  }}
                                >
                                  <span>{model.name}</span>
                                  {model.description && (
                                    <span className="text-muted-foreground dark:text-gray-400 text-xs">{model.description}</span>
                                  )}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Text input area */}
                    <div className="flex items-end gap-2 px-4 pb-3">
                      <textarea
                        className="flex-1 resize-none bg-transparent border-0 outline-none focus:ring-0 p-0 placeholder:text-muted-foreground text-base h-[24px] max-h-[200px] overflow-y-auto"
                        placeholder="Type a message..."
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage();
                          }
                        }}
                        rows={1}
                        style={{ height: "auto" }}
                      />
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
                        onClick={handleSendMessage}
                        disabled={!inputValue.trim()}
                      >
                        <Send className="h-4 w-4" />
                        <span className="sr-only">Send</span>
                      </Button>
                    </div>
                  </motion.div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
