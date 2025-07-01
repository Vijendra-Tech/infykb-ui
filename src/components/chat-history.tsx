"use client";

import { useState, useEffect, useRef } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useChatHistoryStore, ChatItem } from "@/store/use-chat-history-store";
import { useRouter } from "next/navigation";



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
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-14">
      <div
        ref={containerRef}
        className="w-[320px] bg-background border rounded-lg shadow-lg overflow-hidden animate-in slide-in-from-top-10 duration-300 max-h-[80vh] flex flex-col"
      >
        <div className="p-3 border-b">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search conversations"
              className="pl-8 bg-muted/80 border-none"
              value={searchQuery}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-auto">
          {todayChats.length > 0 && (
            <div className="px-3 pt-3">
              <h3 className="text-xs font-medium text-muted-foreground mb-2">Today</h3>
              <div className="space-y-2">
                {todayChats.map((chat) => (
                  <button
                    key={chat.id}
                    className="flex items-center gap-3 w-full p-2 rounded-md hover:bg-muted/50 transition-colors text-left"
                    onClick={() => {
                      router.push(`/chat?id=${chat.id}`);
                      onClose();
                    }}
                  >
                    <div className="w-6 h-6 bg-muted rounded flex items-center justify-center overflow-hidden">
                      {chat.thumbnail ? (
                        <div className="w-full h-full bg-gray-600 flex items-center justify-center text-xs text-white">
                          {chat.title.charAt(0).toUpperCase()}
                        </div>
                      ) : (
                        <div className="w-full h-full bg-gray-600 flex items-center justify-center text-xs text-white">
                          {chat.title.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <span className="text-sm truncate">{chat.title}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
          
          {filteredChats.length === 0 && (
            <div className="p-4 text-center text-muted-foreground">
              No conversations found
            </div>
          )}
        </div>
      </div>
      
      <div className="fixed inset-0 bg-black/20 -z-10" onClick={onClose} />
    </div>
  );
}
