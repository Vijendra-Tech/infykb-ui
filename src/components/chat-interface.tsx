"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles, Send } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function ChatInterface() {
  const [inputValue, setInputValue] = useState("");
  const [messages, setMessages] = useState<{type: 'user' | 'assistant', content: string}[]>([]);
  
  const handleSendMessage = () => {
    if (inputValue.trim()) {
      // Add user message
      setMessages([...messages, { type: 'user', content: inputValue }]);
      
      // Simulate assistant response after a delay
      setTimeout(() => {
        setMessages(prev => [...prev, { 
          type: 'assistant', 
          content: `This is a simulated response to: "${inputValue}"` 
        }]);
      }, 1000);
      
      setInputValue("");
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Chat content area */}
      <div className="flex-1 overflow-auto p-4 flex flex-col bg-background dark:bg-gray-900">
        {messages.length === 0 ? (
          <motion.div 
            className="flex-1 flex items-center justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="max-w-2xl w-full text-center space-y-4">
              <motion.h1 
                className="text-2xl font-medium"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                Good morning,
              </motion.h1>
              <motion.p 
                className="text-xl"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.5 }}
              >
                What do you want to create?
              </motion.p>
            </div>
          </motion.div>
        ) : (
          <div className="max-w-3xl w-full mx-auto py-4 space-y-6">
            <AnimatePresence>
              {messages.map((message, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <motion.div 
                    className={`max-w-[80%] rounded-2xl p-4 ${message.type === 'user' 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-muted'}`}
                    initial={{ scale: 0.95 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  >
                    {message.content}
                  </motion.div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Input area - fixed at bottom */}
      <motion.div 
        className="border-t p-4 bg-background dark:bg-gray-900"
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5, type: "spring" }}
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
                    <div className="flex items-end gap-1.5 md:gap-2 pl-4">
                      <div className="flex min-w-0 flex-1 flex-col">
                        <textarea
                          id="prompt-textarea"
                          tabIndex={0}
                          dir="auto"
                          rows={2}
                          placeholder="Message InfinityKB..."
                          className="mb-2 resize-none border-0 focus:outline-none text-sm text-foreground dark:text-gray-100 bg-transparent px-0 pb-6 pt-2"
                          value={inputValue}
                          onChange={(e) => setInputValue(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              handleSendMessage();
                            }
                          }}
                        />
                      </div>
                      <motion.button
                        disabled={!inputValue.trim()}
                        data-testid="send-button"
                        className="flex h-8 w-8 items-center justify-center rounded-full bg-primary dark:bg-primary text-primary-foreground hover:opacity-90 disabled:bg-muted disabled:text-muted-foreground transition-colors focus:outline-none cursor-pointer"
                        onClick={handleSendMessage}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        initial={{ scale: 0.9, opacity: 0.8 }}
                        animate={{ 
                          scale: inputValue.trim() ? 1 : 0.9,
                          opacity: inputValue.trim() ? 1 : 0.8
                        }}
                        transition={{ type: "spring", stiffness: 400, damping: 17 }}
                      >
                        <Send className="h-4 w-4" />
                      </motion.button>
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
