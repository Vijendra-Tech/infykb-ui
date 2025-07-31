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
  Plus,
  Sparkles,
  Filter,
  Calendar,
  Heart,
  TrendingUp
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
  
  const { sessions, deleteSession, updateSession, loading, loadSessions } = useChatHistory('user-123'); // TODO: Get actual user ID from auth context
  const router = useRouter();

  // Prevent hydration errors by only rendering after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  // Load sessions when component mounts
  useEffect(() => {
    if (mounted) {
      console.log('Loading chat sessions...');
      loadSessions().then(() => {
        console.log('Sessions loaded:', sessions.length);
      }).catch((error) => {
        console.error('Failed to load sessions:', error);
      });
    }
  }, [mounted, loadSessions]);

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
    router.push(`/chat?sessionId=${session.uuid}`);
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 dark:from-slate-900 dark:via-slate-800/50 dark:to-slate-900">
      <div className="container mx-auto p-6 max-w-6xl">
        {/* Professional Header with Gradient */}
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-indigo-600/10 rounded-2xl blur-xl"></div>
          <div className="relative bg-white/70 dark:bg-slate-800/70 backdrop-blur-md rounded-2xl border border-white/20 dark:border-slate-700/50 p-8 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl blur-md opacity-30"></div>
                  <div className="relative bg-gradient-to-r from-blue-500 to-purple-600 p-3 rounded-xl">
                    <MessageSquare className="h-8 w-8 text-white" />
                  </div>
                </div>
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 via-blue-800 to-purple-800 dark:from-white dark:via-blue-200 dark:to-purple-200 bg-clip-text text-transparent">
                    Chat History
                  </h1>
                  <p className="text-slate-600 dark:text-slate-300 mt-2 text-lg">
                    Browse and manage your intelligent conversations
                  </p>
                </div>
              </div>
              <Button 
                onClick={() => router.push('/chat')} 
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 px-6 py-3 text-lg font-medium"
              >
                <Plus className="h-5 w-5 mr-2" />
                New Chat
              </Button>
            </div>
          </div>
        </div>

        {/* Enhanced Search and Filters */}
        <div className="relative mb-8">
          <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-md rounded-xl border border-white/20 dark:border-slate-700/50 p-6 shadow-lg">
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Search Bar */}
              <div className="relative flex-1">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg blur-sm"></div>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 dark:text-slate-500 h-5 w-5" />
                  <Input
                    placeholder="Search conversations, topics, or keywords..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-12 pr-4 py-3 bg-white/80 dark:bg-slate-900/80 border-slate-200/50 dark:border-slate-700/50 rounded-lg text-base placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all duration-200"
                  />
                </div>
              </div>
              
              {/* Filter Buttons */}
              <div className="flex gap-3">
                <Button
                  variant={filterBy === "all" ? "default" : "outline"}
                  onClick={() => setFilterBy("all")}
                  className={cn(
                    "px-4 py-2 rounded-lg font-medium transition-all duration-200",
                    filterBy === "all" 
                      ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg hover:shadow-xl transform hover:scale-105" 
                      : "bg-white/80 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 border-slate-200/50 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/50"
                  )}
                >
                  <TrendingUp className="h-4 w-4 mr-2" />
                  All Chats
                </Button>
                <Button
                  variant={filterBy === "recent" ? "default" : "outline"}
                  onClick={() => setFilterBy("recent")}
                  className={cn(
                    "px-4 py-2 rounded-lg font-medium transition-all duration-200",
                    filterBy === "recent" 
                      ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg hover:shadow-xl transform hover:scale-105" 
                      : "bg-white/80 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 border-slate-200/50 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/50"
                  )}
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Recent
                </Button>
                <Button
                  variant={filterBy === "favorites" ? "default" : "outline"}
                  onClick={() => setFilterBy("favorites")}
                  className={cn(
                    "px-4 py-2 rounded-lg font-medium transition-all duration-200",
                    filterBy === "favorites" 
                      ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg hover:shadow-xl transform hover:scale-105" 
                      : "bg-white/80 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 border-slate-200/50 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/50"
                  )}
                >
                  <Heart className="h-4 w-4 mr-2" />
                  Favorites
                </Button>
              </div>
            </div>
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

        {/* Enhanced Empty State */}
        {!loading && filteredSessions.length === 0 && (
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 via-purple-600/5 to-indigo-600/5 rounded-2xl blur-xl"></div>
            <div className="relative bg-white/60 dark:bg-slate-800/60 backdrop-blur-md rounded-2xl border border-white/20 dark:border-slate-700/50 p-12 text-center shadow-lg">
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-600/20 rounded-full blur-lg"></div>
                <div className="relative bg-gradient-to-r from-blue-500 to-purple-600 p-4 rounded-full w-20 h-20 mx-auto flex items-center justify-center">
                  <Sparkles className="h-10 w-10 text-white" />
                </div>
              </div>  
              <h3 className="text-2xl font-bold bg-gradient-to-r from-slate-900 via-blue-800 to-purple-800 dark:from-white dark:via-blue-200 dark:to-purple-200 bg-clip-text text-transparent mb-3">
                {searchQuery ? "No matching conversations found" : "Your chat history awaits"}
              </h3>
              <p className="text-slate-600 dark:text-slate-300 mb-8 text-lg max-w-md mx-auto">
                {searchQuery 
                  ? "Try adjusting your search terms or explore different filters to find what you're looking for"
                  : "Start meaningful conversations with our AI assistant and watch your knowledge base grow"
                }
              </p>
              <Button 
                onClick={() => router.push('/chat')}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 px-8 py-3 text-lg font-medium"
              >
                <Plus className="h-5 w-5 mr-2" />
                Start New Conversation
              </Button>
            </div>
          </div>
        )}

        {/* Enhanced Chat Sessions List */}
        {!loading && filteredSessions.length > 0 && (
          <div className="space-y-4">
            {filteredSessions.map((session) => (
              <div key={session.id} className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 via-purple-600/5 to-indigo-600/5 rounded-xl blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <Card 
                  className="relative bg-white/70 dark:bg-slate-800/70 backdrop-blur-md border border-white/20 dark:border-slate-700/50 hover:shadow-xl transition-all duration-300 cursor-pointer group-hover:transform group-hover:scale-[1.02] group-hover:border-blue-200/50 dark:group-hover:border-blue-700/50"
                  onClick={() => handleSessionClick(session)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-600/20 rounded-lg blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            <div className="relative bg-gradient-to-r from-blue-500/10 to-purple-600/10 dark:from-blue-500/20 dark:to-purple-600/20 p-2 rounded-lg">
                              <MessageSquare className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                            </div>
                          </div>
                          <h3 className="font-semibold text-slate-900 dark:text-slate-100 truncate text-lg group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors duration-200">
                            {session.title}
                          </h3>
                          {session.metadata?.isFavorite && (
                            <div className="relative">
                              <div className="absolute inset-0 bg-yellow-400/20 rounded-full blur-sm"></div>
                              <Star className="relative h-5 w-5 text-yellow-500 fill-current" />
                            </div>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-6 text-sm">
                          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                            <Clock className="h-4 w-4" />
                            <span className="font-medium">{formatDate(session.updatedAt.toString())}</span>
                          </div>
                          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                            <MessageSquare className="h-4 w-4" />
                            <span className="font-medium">{session.messageCount || 0} messages</span>
                          </div>
                          {session.metadata?.tags && session.metadata.tags.length > 0 && (
                            <div className="flex items-center gap-2">
                              {session.metadata.tags.slice(0, 2).map((tag, index) => (
                                <Badge key={index} variant="secondary" className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs px-2 py-1">
                                  {tag}
                                </Badge>
                              ))}
                              {session.metadata.tags.length > 2 && (
                                <Badge variant="secondary" className="bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs px-2 py-1">
                                  +{session.metadata.tags.length - 2}
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3 ml-6">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={(e) => e.stopPropagation()}
                              className="h-8 w-8 p-0 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 opacity-0 group-hover:opacity-100 transition-all duration-200"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-md border border-white/20 dark:border-slate-700/50">
                            <DropdownMenuItem 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleToggleFavorite(session);
                              }}
                              className="hover:bg-slate-50 dark:hover:bg-slate-700/50"
                            >
                              <Star className="h-4 w-4 mr-2" />
                              {session.metadata?.isFavorite ? "Remove from Favorites" : "Add to Favorites"}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-slate-200/50 dark:bg-slate-700/50" />
                            <DropdownMenuItem 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteSession(session.id);
                              }}
                              className="text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete Chat
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                        
                        <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 transform group-hover:scale-110">
                          <ArrowRight className="h-4 w-4 text-white" />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        )}

        {/* Enhanced Stats */}
        {!loading && filteredSessions.length > 0 && (
          <div className="relative mt-8">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 via-purple-600/5 to-indigo-600/5 rounded-xl blur-xl"></div>
            <div className="relative bg-white/60 dark:bg-slate-800/60 backdrop-blur-md rounded-xl border border-white/20 dark:border-slate-700/50 p-6 shadow-lg">
              <div className="flex items-center justify-center gap-8">
                <div className="text-center">
                  <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    {filteredSessions.length}
                  </div>
                  <div className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                    {filteredSessions.length === 1 ? 'Conversation' : 'Conversations'}
                  </div>
                </div>
                <div className="w-px h-8 bg-gradient-to-b from-transparent via-slate-300 dark:via-slate-600 to-transparent"></div>
                <div className="text-center">
                  <div className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                    {sessions.length}
                  </div>
                  <div className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                    Total Saved
                  </div>
                </div>
                <div className="w-px h-8 bg-gradient-to-b from-transparent via-slate-300 dark:via-slate-600 to-transparent"></div>
                <div className="text-center">
                  <div className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
                    {sessions.filter(s => s.metadata?.isFavorite).length}
                  </div>
                  <div className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                    Favorites
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
