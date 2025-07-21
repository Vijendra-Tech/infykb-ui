"use client";

import { useState, useEffect, useRef } from "react";
import { Search, X, MessageSquare, Clock, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useChatHistoryStore, ChatItem } from "@/store/use-chat-history-store";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

interface ChatHistoryProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ChatHistory({ isOpen, onClose }: ChatHistoryProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const { chats } = useChatHistoryStore();
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();



  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Filter chats based on search query
  const filteredChats = chats.filter(chat => 
    chat.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Group chats by date
  const today = new Date().toDateString();
  const todayChats = filteredChats.filter(chat => {
    const chatDate = new Date(chat.date);
    return chatDate.toDateString() === today;
  });

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-14">
          {/* Backdrop */}
          <motion.div 
            className="fixed inset-0 bg-black/20 backdrop-blur-sm -z-10" 
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          />
          
          {/* Chat History Panel */}
          <motion.div
            ref={containerRef}
            className="w-[380px] bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200/50 dark:border-slate-700/50 rounded-2xl shadow-2xl shadow-slate-200/30 dark:shadow-slate-900/50 overflow-hidden max-h-[80vh] flex flex-col"
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
          >
            {/* Header */}
            <div className="p-4 bg-gradient-to-r from-blue-50/80 via-purple-50/60 to-blue-50/80 dark:from-slate-800/80 dark:via-slate-700/60 dark:to-slate-800/80 border-b border-blue-200/40 dark:border-slate-600/40 backdrop-blur-sm relative overflow-hidden">
              {/* Animated background gradient */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-blue-500/5 dark:from-blue-400/10 dark:via-purple-400/10 dark:to-blue-400/10"
                animate={{
                  backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                }}
                transition={{
                  duration: 8,
                  repeat: Infinity,
                  ease: 'linear',
                }}
                style={{
                  backgroundSize: '200% 200%',
                }}
              />
              
              <div className="relative z-10 flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-lg shadow-blue-500/25 dark:shadow-blue-400/30">
                    <MessageSquare className="h-5 w-5 text-white" />
                  </div>
                  <h2 className="text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Chat History
                  </h2>
                </div>
                <motion.button
                  onClick={onClose}
                  className="p-2 rounded-xl hover:bg-white/80 dark:hover:bg-slate-700/80 hover:shadow-lg hover:shadow-blue-200/30 dark:hover:shadow-slate-900/50 transition-all duration-200 group"
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X className="h-4 w-4 text-slate-600 dark:text-slate-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200" />
                </motion.button>
              </div>
              
              {/* Search Input */}
              <div className="relative z-10">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-500 dark:text-slate-400" />
                <Input
                  type="search"
                  placeholder="Search conversations..."
                  className="pl-10 bg-white/80 dark:bg-slate-800/80 border-slate-200/50 dark:border-slate-600/50 rounded-xl backdrop-blur-sm focus:bg-white dark:focus:bg-slate-800 focus:border-blue-300 dark:focus:border-blue-500 transition-all duration-200"
                  value={searchQuery}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            
            {/* Chat List */}
            <div className="flex-1 overflow-auto p-4 space-y-3">
              {todayChats.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Today</h3>
                    <Badge variant="secondary" className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 text-xs">
                      {todayChats.length}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    {todayChats.map((chat, index) => (
                      <motion.button
                        key={chat.id}
                        className="group flex items-center gap-3 w-full p-3 rounded-2xl hover:bg-gradient-to-r hover:from-blue-50/80 hover:via-purple-50/30 hover:to-blue-50/80 dark:hover:from-slate-800/60 dark:hover:via-slate-700/40 dark:hover:to-slate-800/60 transition-all duration-300 text-left hover:shadow-lg hover:shadow-slate-200/30 dark:hover:shadow-slate-900/40 hover:border hover:border-slate-200/50 dark:hover:border-slate-600/50 hover:backdrop-blur-sm relative overflow-hidden"
                        onClick={() => {
                          router.push(`/chat?id=${chat.id}`);
                          onClose();
                        }}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: 0.1 + index * 0.05 }}
                        whileHover={{ scale: 1.02, x: 4 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        {/* Chat Avatar */}
                        <div className="relative">
                          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25 dark:shadow-blue-400/30 group-hover:shadow-blue-500/40 dark:group-hover:shadow-blue-400/50 transition-shadow duration-300">
                            <span className="text-white font-semibold text-sm">
                              {chat.title.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-slate-900 flex items-center justify-center">
                            <Sparkles className="h-2 w-2 text-white" />
                          </div>
                        </div>
                        
                        {/* Chat Info */}
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors duration-200">
                            {chat.title}
                          </h4>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            {new Date(chat.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                        
                        {/* Status Badge */}
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-700/50 text-xs">
                          Active
                        </Badge>
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              )}
              
              {/* Empty State */}
              {filteredChats.length === 0 && (
                <motion.div 
                  className="flex flex-col items-center justify-center py-12 text-center"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  <div className="p-4 bg-gradient-to-r from-slate-100 to-slate-50 dark:from-slate-800 dark:to-slate-700 rounded-2xl mb-4">
                    <MessageSquare className="h-8 w-8 text-slate-400 dark:text-slate-500" />
                  </div>
                  <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    No conversations found
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-[200px]">
                    {searchQuery ? 'Try adjusting your search terms' : 'Start a new conversation to see it here'}
                  </p>
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
