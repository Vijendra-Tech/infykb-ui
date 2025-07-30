"use client";

import React, { useState, useEffect } from "react";
import { 
  Search, 
  Clock, 
  MessageSquare, 
  Trash2, 
  Star, 
  MoreHorizontal,
  ArrowRight,
  Plus
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { useChatHistory } from "@/hooks/use-chat-history";
import { ChatSession } from "@/lib/database";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

export default function ChatHistoryPage() {
  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterBy, setFilterBy] = useState<"all" | "recent" | "favorites">("all");
  
  const { sessions, deleteSession, updateSession, loading } = useChatHistory();
  const router = useRouter();

  // Prevent hydration errors by only rendering after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  // Filter sessions
  const filteredSessions = !mounted ? [] : sessions.filter((session: ChatSession) => {
    const matchesSearch = session.title.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (filterBy === "all") return matchesSearch;
    if (filterBy === "favorites") return matchesSearch && session.metadata?.isFavorite;
    if (filterBy === "recent") {
      const sessionDate = new Date(session.createdAt);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return matchesSearch && sessionDate >= weekAgo;
    }
    
    return matchesSearch;
  }).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

  const handleSessionClick = (session: ChatSession) => {
    // Navigate to chat page and load the session (no toast notifications as requested)
    router.push(`/chat?sessionId=${session.id}`);
  };

  const handleToggleFavorite = async (session: ChatSession) => {
    if (!session.id) return;
    await updateSession(session.id.toString(), { 
      metadata: { 
        ...session.metadata, 
        isFavorite: !session.metadata?.isFavorite 
      } 
    });
  };

  const handleDeleteSession = async (sessionId: number | undefined) => {
    if (!sessionId) return;
    await deleteSession(sessionId.toString());
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return "Today";
    if (diffDays === 2) return "Yesterday";
    if (diffDays <= 7) return `${diffDays - 1} days ago`;
    
    return date.toLocaleDateString();
  };

  if (!mounted) {
    return (
      <div className="container mx-auto p-6">
        <div className="space-y-4">
          <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-12 bg-gray-200 rounded animate-pulse"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-gray-200 rounded animate-pulse"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Chat History</h1>
          <p className="text-gray-600 mt-1">Browse and manage your chat sessions</p>
        </div>
        <Button onClick={() => router.push('/chat')} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          New Chat
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search chat history..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant={filterBy === "all" ? "default" : "outline"}
            onClick={() => setFilterBy("all")}
            size="sm"
          >
            All
          </Button>
          <Button
            variant={filterBy === "recent" ? "default" : "outline"}
            onClick={() => setFilterBy("recent")}
            size="sm"
          >
            Recent
          </Button>
          <Button
            variant={filterBy === "favorites" ? "default" : "outline"}
            onClick={() => setFilterBy("favorites")}
            size="sm"
          >
            Favorites
          </Button>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-gray-200 rounded animate-pulse"></div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredSessions.length === 0 && (
        <div className="text-center py-12">
          <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchQuery ? "No matching chats found" : "No chat history yet"}
          </h3>
          <p className="text-gray-600 mb-4">
            {searchQuery 
              ? "Try adjusting your search terms or filters"
              : "Start a conversation to see your chat history here"
            }
          </p>
          <Button onClick={() => router.push('/chat')}>
            Start New Chat
          </Button>
        </div>
      )}

      {/* Chat Sessions List */}
      {!loading && filteredSessions.length > 0 && (
        <div className="space-y-3">
          {filteredSessions.map((session) => (
            <Card 
              key={session.id} 
              className="hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => handleSessionClick(session)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-medium text-gray-900 truncate">
                        {session.title}
                      </h3>
                      {session.metadata?.isFavorite && (
                        <Star className="h-4 w-4 text-yellow-500 fill-current" />
                      )}
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDate(session.updatedAt.toString())}
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageSquare className="h-3 w-3" />
                        {session.messageCount || 0} messages
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 ml-4">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={(e) => {
                          e.stopPropagation();
                          handleToggleFavorite(session);
                        }}>
                          <Star className="h-4 w-4 mr-2" />
                          {session.metadata?.isFavorite ? "Remove from Favorites" : "Add to Favorites"}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteSession(session.id);
                          }}
                          className="text-red-600"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete Chat
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    
                    <ArrowRight className="h-4 w-4 text-gray-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Stats */}
      {!loading && filteredSessions.length > 0 && (
        <div className="mt-8 pt-6 border-t">
          <div className="flex justify-center text-sm text-gray-500">
            Showing {filteredSessions.length} of {sessions.length} chat sessions
          </div>
        </div>
      )}
    </div>
  );
}
