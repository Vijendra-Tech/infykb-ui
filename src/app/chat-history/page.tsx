"use client";

import { useState, useEffect } from "react";
import { 
  Search, 
  Filter, 
  Calendar, 
  Clock, 
  MessageSquare, 
  Trash2, 
  Archive, 
  Star, 
  MoreVertical,
  Download,
  Share2,
  Eye,
  ArrowRight,
  SortAsc,
  SortDesc,
  Grid3X3,
  List
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useChatHistoryStore, ChatItem } from "@/store/use-chat-history-store";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

export default function ChatHistoryPage() {
  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"date" | "title">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const [selectedChats, setSelectedChats] = useState<string[]>([]);
  const [filterBy, setFilterBy] = useState<"all" | "today" | "week" | "month">("all");
  
  const { chats, deleteChat, toggleFavorite } = useChatHistoryStore();
  const router = useRouter();

  // Prevent hydration errors by only rendering after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  // Filter and sort chats (only after mounted to prevent hydration errors)
  const filteredChats = !mounted ? [] : chats
    .filter(chat => {
      const matchesSearch = chat.title.toLowerCase().includes(searchQuery.toLowerCase());
      
      if (filterBy === "all") return matchesSearch;
      
      const chatDate = new Date(chat.date);
      const now = new Date();
      
      switch (filterBy) {
        case "today":
          return matchesSearch && chatDate.toDateString() === now.toDateString();
        case "week":
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          return matchesSearch && chatDate >= weekAgo;
        case "month":
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          return matchesSearch && chatDate >= monthAgo;
        default:
          return matchesSearch;
      }
    })
    .sort((a, b) => {
      const aValue = sortBy === "date" ? new Date(a.date).getTime() : a.title.toLowerCase();
      const bValue = sortBy === "date" ? new Date(b.date).getTime() : b.title.toLowerCase();
      
      if (sortOrder === "asc") {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

  // Group chats by date
  const groupedChats = filteredChats.reduce((groups, chat) => {
    const date = new Date(chat.date);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    let groupKey: string;
    if (date.toDateString() === today.toDateString()) {
      groupKey = "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      groupKey = "Yesterday";
    } else if (date.getTime() > today.getTime() - 7 * 24 * 60 * 60 * 1000) {
      groupKey = "This Week";
    } else if (date.getTime() > today.getTime() - 30 * 24 * 60 * 60 * 1000) {
      groupKey = "This Month";
    } else {
      groupKey = "Older";
    }
    
    if (!groups[groupKey]) {
      groups[groupKey] = [];
    }
    groups[groupKey].push(chat);
    return groups;
  }, {} as Record<string, ChatItem[]>);

  const handleChatClick = (chatId: string) => {
    router.push(`/chat?id=${chatId}`);
  };

  const handleSelectChat = (chatId: string) => {
    setSelectedChats(prev => 
      prev.includes(chatId) 
        ? prev.filter(id => id !== chatId)
        : [...prev, chatId]
    );
  };

  const handleBulkDelete = () => {
    selectedChats.forEach(chatId => deleteChat(chatId));
    setSelectedChats([]);
  };

  const ChatCard = ({ chat, isSelected, onSelect }: { chat: ChatItem; isSelected: boolean; onSelect: () => void }) => (
    <Card className={cn(
      "group hover:shadow-md transition-all duration-200 cursor-pointer border-slate-200 dark:border-slate-700",
      isSelected && "ring-2 ring-blue-500 border-blue-500"
    )}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={onSelect}
            className="mt-1 rounded border-slate-300 dark:border-slate-600"
            onClick={(e) => e.stopPropagation()}
          />
          
          <div className="w-10 h-10 bg-gradient-to-br from-slate-600 to-slate-700 dark:from-slate-700 dark:to-slate-800 rounded-lg flex items-center justify-center shadow-sm">
            <span className="text-white font-semibold text-sm">
              {chat.title.charAt(0).toUpperCase()}
            </span>
          </div>
          
          <div className="flex-1 min-w-0" onClick={() => handleChatClick(chat.id)}>
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-medium text-slate-900 dark:text-slate-100 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400">
                {chat.title}
              </h3>
              <DropdownMenu>
                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleChatClick(chat.id)}>
                    <Eye className="h-4 w-4 mr-2" />
                    Open Chat
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => deleteChat(chat.id)}>
                    <Archive className="h-4 w-4 mr-2" />
                    Archive
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => deleteChat(chat.id)} className="text-red-600 dark:text-red-400">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            
            <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-2">
              <Clock className="h-3 w-3" />
              <span>{new Date(chat.date).toLocaleDateString()}</span>
              <span>•</span>
              <span>{new Date(chat.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800">
                Active
              </Badge>
              <ArrowRight className="h-4 w-4 text-slate-400 dark:text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const ChatListItem = ({ chat, isSelected, onSelect }: { chat: ChatItem; isSelected: boolean; onSelect: () => void }) => (
    <div className={cn(
      "group flex items-center gap-4 p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700 cursor-pointer transition-colors",
      isSelected && "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800"
    )}>
      <input
        type="checkbox"
        checked={isSelected}
        onChange={onSelect}
        className="rounded border-slate-300 dark:border-slate-600"
        onClick={(e) => e.stopPropagation()}
      />
      
      <div className="w-8 h-8 bg-gradient-to-br from-slate-600 to-slate-700 dark:from-slate-700 dark:to-slate-800 rounded-lg flex items-center justify-center shadow-sm">
        <span className="text-white font-semibold text-xs">
          {chat.title.charAt(0).toUpperCase()}
        </span>
      </div>
      
      <div className="flex-1 min-w-0" onClick={() => handleChatClick(chat.id)}>
        <div className="flex items-center justify-between mb-1">
          <h3 className="font-medium text-slate-900 dark:text-slate-100 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400">
            {chat.title}
          </h3>
          <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
            <Clock className="h-3 w-3" />
            <span>{new Date(chat.date).toLocaleDateString()}</span>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800 text-xs">
              Active
            </Badge>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {new Date(chat.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
          
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                  <MoreVertical className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleChatClick(chat.id)}>
                  <Eye className="h-4 w-4 mr-2" />
                  Open Chat
                </DropdownMenuItem>
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); toggleFavorite(chat.id); }}>
                  <Star className={`h-4 w-4 mr-2 ${chat.isFavorite ? 'fill-yellow-400 text-yellow-400' : ''}`} />
                  {chat.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); /* Archive functionality */ }}>
                  <Archive className="h-4 w-4 mr-2" />
                  Archive
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); deleteChat(chat.id); }} className="text-red-600 dark:text-red-400">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <ArrowRight className="h-3 w-3 text-slate-400 dark:text-slate-500" />
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-900/50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                Chat History
              </h1>
              <p className="text-slate-600 dark:text-slate-400">
                Manage and organize your conversation history
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button variant="outline" size="sm">
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
            </div>
          </div>
          
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                    <MessageSquare className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Total Chats</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{chats.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                    <Clock className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Today</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                      {groupedChats["Today"]?.length || 0}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                    <Calendar className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">This Week</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                      {groupedChats["This Week"]?.length || 0}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
                    <Star className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Favorites</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">0</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 p-4 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500" />
                <Input
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            {/* Filters */}
            <div className="flex items-center gap-3">
              <Select value={filterBy} onValueChange={(value: any) => setFilterBy(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date">Sort by Date</SelectItem>
                  <SelectItem value="title">Sort by Title</SelectItem>
                </SelectContent>
              </Select>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
              >
                {sortOrder === "asc" ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
              </Button>
              
              <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-md">
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                  className="rounded-r-none"
                >
                  <List className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  className="rounded-l-none"
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
          
          {/* Bulk Actions */}
          {selectedChats.length > 0 && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {selectedChats.length} chat{selectedChats.length !== 1 ? 's' : ''} selected
              </p>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => setSelectedChats([])}>
                  Clear Selection
                </Button>
                <Button variant="outline" size="sm">
                  <Archive className="h-4 w-4 mr-2" />
                  Archive
                </Button>
                <Button variant="destructive" size="sm" onClick={handleBulkDelete}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
          {filteredChats.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-xl mb-4">
                <MessageSquare className="h-12 w-12 text-slate-400 dark:text-slate-500" />
              </div>
              <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2">
                {searchQuery ? 'No conversations found' : 'No chat history yet'}
              </h3>
              <p className="text-slate-500 dark:text-slate-400 max-w-md leading-relaxed">
                {searchQuery 
                  ? 'Try adjusting your search terms or filters to find what you\'re looking for' 
                  : 'Start a new conversation to see your chat history here'}
              </p>
              {searchQuery && (
                <Button
                  variant="outline"
                  onClick={() => setSearchQuery('')}
                  className="mt-4"
                >
                  Clear search
                </Button>
              )}
            </div>
          ) : (
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="w-full justify-start border-b border-slate-200 dark:border-slate-700 bg-transparent rounded-none p-0">
                <TabsTrigger value="all" className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500">
                  All ({filteredChats.length})
                </TabsTrigger>
                {Object.entries(groupedChats).map(([group, chats]) => (
                  <TabsTrigger key={group} value={group.toLowerCase()} className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500">
                    {group} ({chats.length})
                  </TabsTrigger>
                ))}
              </TabsList>
              
              <TabsContent value="all" className="mt-0">
                {viewMode === "grid" ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
                    {filteredChats.map((chat) => (
                      <ChatCard
                        key={chat.id}
                        chat={chat}
                        isSelected={selectedChats.includes(chat.id)}
                        onSelect={() => handleSelectChat(chat.id)}
                      />
                    ))}
                  </div>
                ) : (
                  <div>
                    {filteredChats.map((chat) => (
                      <ChatListItem
                        key={chat.id}
                        chat={chat}
                        isSelected={selectedChats.includes(chat.id)}
                        onSelect={() => handleSelectChat(chat.id)}
                      />
                    ))}
                  </div>
                )}
              </TabsContent>
              
              {Object.entries(groupedChats).map(([group, chats]) => (
                <TabsContent key={group} value={group.toLowerCase()} className="mt-0">
                  {viewMode === "grid" ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
                      {chats.map((chat) => (
                        <ChatCard
                          key={chat.id}
                          chat={chat}
                          isSelected={selectedChats.includes(chat.id)}
                          onSelect={() => handleSelectChat(chat.id)}
                        />
                      ))}
                    </div>
                  ) : (
                    <div>
                      {chats.map((chat) => (
                        <ChatListItem
                          key={chat.id}
                          chat={chat}
                          isSelected={selectedChats.includes(chat.id)}
                          onSelect={() => handleSelectChat(chat.id)}
                        />
                      ))}
                    </div>
                  )}
                </TabsContent>
              ))}
            </Tabs>
          )}
        </div>
      </div>
    </div>
  );
}
