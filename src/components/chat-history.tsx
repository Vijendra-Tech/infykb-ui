"use client";

import { useState, useEffect, useRef } from "react";
import { Search, X, MessageSquare, Clock, Calendar, ArrowRight, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useChatHistoryStore, ChatItem } from "@/store/use-chat-history-store";
import { useRouter } from "next/navigation";

interface ChatHistoryProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ChatHistory({ isOpen, onClose }: ChatHistoryProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const { chats, deleteChat } = useChatHistoryStore();
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Filter chats based on search query
  const filteredChats = chats.filter(chat => 
    chat.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Group chats by date
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  const todayChats = filteredChats.filter(chat => {
    const chatDate = new Date(chat.date);
    return chatDate.toDateString() === today.toDateString();
  });
  
  const yesterdayChats = filteredChats.filter(chat => {
    const chatDate = new Date(chat.date);
    return chatDate.toDateString() === yesterday.toDateString();
  });
  
  const olderChats = filteredChats.filter(chat => {
    const chatDate = new Date(chat.date);
    return chatDate.toDateString() !== today.toDateString() && 
           chatDate.toDateString() !== yesterday.toDateString();
  });

  const handleChatClick = (chatId: string) => {
    router.push(`/chat?id=${chatId}`);
    onClose();
  };

  const handleDeleteChat = (e: React.MouseEvent, chatId: string) => {
    e.stopPropagation();
    deleteChat(chatId);
  };

  if (!isOpen) return null;

  const ChatGroup = ({ title, chats, icon }: { title: string; chats: ChatItem[]; icon: React.ReactNode }) => {
    if (chats.length === 0) return null;
    
    return (
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2 px-3">
          <div className="text-slate-500 dark:text-slate-400">{icon}</div>
          <h3 className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">{title}</h3>
          <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
          <span className="text-xs text-slate-500 dark:text-slate-400">{chats.length}</span>
        </div>
        
        <div className="space-y-1 px-2">
          {chats.map((chat) => (
            <button
              key={chat.id}
              className="w-full p-3 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-lg transition-all duration-200 group flex items-center gap-3 text-left hover:shadow-sm"
              onClick={() => handleChatClick(chat.id)}
            >
              {/* Chat Avatar */}
              <div className="w-8 h-8 bg-gradient-to-br from-slate-600 to-slate-700 dark:from-slate-700 dark:to-slate-800 rounded-lg flex items-center justify-center shadow-sm">
                <span className="text-white font-semibold text-sm">
                  {chat.title.charAt(0).toUpperCase()}
                </span>
              </div>
              
              {/* Chat Info */}
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate group-hover:text-slate-700 dark:group-hover:text-slate-300 mb-1">
                  {chat.title}
                </h4>
                <div className="flex items-center gap-2">
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {new Date(chat.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                  <span className="text-xs text-slate-400 dark:text-slate-500">•</span>
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800 text-xs px-1.5 py-0.5">
                    Active
                  </Badge>
                </div>
              </div>
              
              {/* Actions */}
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 hover:bg-red-100 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400"
                  onClick={(e) => handleDeleteChat(e, chat.id)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
                <ArrowRight className="h-3 w-3 text-slate-400 dark:text-slate-500" />
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="w-full">
      <div
        ref={containerRef}
        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden flex flex-col shadow-lg"
      >
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-slate-600 dark:bg-slate-700 rounded-lg shadow-sm">
                <MessageSquare className="h-4 w-4 text-white" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-slate-800 dark:text-slate-200">
                  Chat History
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {filteredChats.length} conversation{filteredChats.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-md"
            >
              <X className="h-4 w-4 text-slate-500 dark:text-slate-400" />
            </Button>
          </div>
          
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500" />
            <Input
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-9 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-600 focus:border-slate-400 dark:focus:border-slate-500 rounded-lg text-sm placeholder:text-slate-400 dark:placeholder:text-slate-500 shadow-sm"
            />
          </div>
        </div>
        
        {/* Chat List */}
        <div className="flex-1 overflow-auto max-h-96 bg-slate-50/50 dark:bg-slate-900/50">
          {filteredChats.length > 0 ? (
            <div className="p-2">
              <ChatGroup 
                title="Today" 
                chats={todayChats} 
                icon={<Clock className="h-3 w-3" />} 
              />
              <ChatGroup 
                title="Yesterday" 
                chats={yesterdayChats} 
                icon={<Calendar className="h-3 w-3" />} 
              />
              <ChatGroup 
                title="Older" 
                chats={olderChats} 
                icon={<Calendar className="h-3 w-3" />} 
              />
            </div>
          ) : (
            /* Empty State */
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-xl mb-4">
                <MessageSquare className="h-8 w-8 text-slate-400 dark:text-slate-500" />
              </div>
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                {searchQuery ? 'No conversations found' : 'No chat history yet'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-[250px] leading-relaxed">
                {searchQuery 
                  ? 'Try adjusting your search terms or check your spelling' 
                  : 'Start a new conversation to see your chat history here'}
              </p>
              {searchQuery && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSearchQuery('')}
                  className="mt-3 text-xs"
                >
                  Clear search
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
