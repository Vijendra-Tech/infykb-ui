import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, 
  MessageSquare, 
  Clock, 
  Star, 
  Archive, 
  Trash2, 
  Download, 
  Filter,
  Calendar,
  Tag,
  MoreHorizontal,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { ChatSession, ChatMessage } from '@/lib/database';
import { useChatHistory } from '@/hooks/use-chat-history';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator 
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/components/ui/use-toast';

interface ChatHistoryPanelProps {
  userId: string;
  organizationId: string;
  onSessionSelect?: (session: ChatSession) => void;
  onNewChat?: () => void;
  className?: string;
}

export function ChatHistoryPanel({ 
  userId, 
  organizationId, 
  onSessionSelect, 
  onNewChat,
  className = '' 
}: ChatHistoryPanelProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'favorites' | 'recent'>('recent');
  const [expandedSessions, setExpandedSessions] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  const {
    sessions,
    loading,
    error,
    loadSessions,
    updateSession,
    deleteSession,
    getFavorites,
    getRecentSessions,
    searchHistory,
    exportSession,
    clearError
  } = useChatHistory(userId);

  // Filter and search sessions
  const filteredSessions = useMemo(() => {
    let filtered = sessions;

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(session => 
        session.title.toLowerCase().includes(query) ||
        session.metadata?.summary?.toLowerCase().includes(query) ||
        session.metadata?.tags?.some(tag => tag.toLowerCase().includes(query))
      );
    }

    return filtered;
  }, [sessions, searchQuery]);

  // Load sessions based on filter type
  useEffect(() => {
    const loadData = async () => {
      try {
        switch (filterType) {
          case 'favorites':
            await getFavorites();
            break;
          case 'recent':
            await getRecentSessions(20);
            break;
          case 'all':
            await loadSessions({ userId, organizationId, status: 'active' });
            break;
        }
      } catch (err) {
        console.error('Failed to load sessions:', err);
      }
    };

    loadData();
  }, [filterType, userId, organizationId, getFavorites, getRecentSessions, loadSessions]);

  const handleSessionClick = (session: ChatSession) => {
    onSessionSelect?.(session);
  };

  const handleToggleFavorite = async (session: ChatSession, e: React.MouseEvent) => {
    e.stopPropagation();
    
    try {
      const isFavorite = !session.metadata?.isFavorite;
      await updateSession(session.uuid, {
        metadata: {
          ...session.metadata,
          isFavorite
        }
      });
      
      toast({
        title: isFavorite ? 'Added to favorites' : 'Removed from favorites',
        description: 'Chat session updated successfully'
      });
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to update favorite status',
        variant: 'destructive'
      });
    }
  };

  const handleDeleteSession = async (session: ChatSession, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!confirm(`Delete "${session.title}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await deleteSession(session.uuid);
      toast({
        title: 'Success',
        description: 'Chat session deleted'
      });
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to delete session',
        variant: 'destructive'
      });
    }
  };

  const handleExportSession = async (session: ChatSession, e: React.MouseEvent) => {
    e.stopPropagation();
    
    try {
      const exportData = await exportSession(session.uuid);
      
      // Create downloadable file
      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `chat-${session.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.json`;
      link.click();
      
      URL.revokeObjectURL(url);
      toast({
        title: 'Success',
        description: 'Chat exported successfully'
      });
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to export session',
        variant: 'destructive'
      });
    }
  };

  const toggleSessionExpansion = (sessionId: string) => {
    setExpandedSessions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sessionId)) {
        newSet.delete(sessionId);
      } else {
        newSet.add(sessionId);
      }
      return newSet;
    });
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (days === 1) {
      return 'Yesterday';
    } else if (days < 7) {
      return `${days} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const getSessionPreview = (session: ChatSession) => {
    return session.metadata?.summary || 
           `${session.messageCount || 0} messages`;
  };

  if (error) {
    return (
      <div className={`p-4 ${className}`}>
        <div className="text-center text-red-600">
          <p>Failed to load chat history</p>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={clearError}
            className="mt-2"
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Header */}
      <div className="p-4 border-b bg-gradient-to-r from-slate-50 to-blue-50/30">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold bg-gradient-to-r from-slate-700 to-blue-600 bg-clip-text text-transparent">
            Chat History
          </h2>
          {onNewChat && (
            <Button onClick={onNewChat} size="sm" className="bg-gradient-to-r from-blue-600 to-purple-600">
              New Chat
            </Button>
          )}
        </div>

        {/* Search */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search chat history..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex space-x-1">
          {[
            { key: 'recent', label: 'Recent', icon: Clock },
            { key: 'favorites', label: 'Favorites', icon: Star },
            { key: 'all', label: 'All', icon: MessageSquare }
          ].map(({ key, label, icon: Icon }) => (
            <Button
              key={key}
              variant={filterType === key ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setFilterType(key as any)}
              className="flex items-center space-x-1"
            >
              <Icon className="h-3 w-3" />
              <span>{label}</span>
            </Button>
          ))}
        </div>
      </div>

      {/* Sessions List */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="p-4 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse" />
                <div className="h-3 w-1/2 bg-gray-200 rounded animate-pulse" />
              </div>
            ))}
          </div>
        ) : filteredSessions.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium mb-2">No chat history found</p>
            <p className="text-sm">
              {searchQuery ? 'Try adjusting your search terms' : 'Start a conversation to see your chat history here'}
            </p>
          </div>
        ) : (
          <div className="p-2">
            {filteredSessions.map((session) => {
              const isExpanded = expandedSessions.has(session.uuid);
              const isFavorite = session.metadata?.isFavorite;

              return (
                <div
                  key={session.uuid}
                  className="mb-2 rounded-lg border bg-white hover:bg-gray-50 transition-colors"
                >
                  <div
                    className="p-3 cursor-pointer"
                    onClick={() => handleSessionClick(session)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="font-medium text-gray-900 truncate">
                            {session.title}
                          </h3>
                          {isFavorite && (
                            <Star className="h-4 w-4 text-yellow-500 fill-current" />
                          )}
                        </div>
                        
                        <p className="text-sm text-gray-600 mb-2">
                          {getSessionPreview(session)}
                        </p>

                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <span className="flex items-center space-x-1">
                            <MessageSquare className="h-3 w-3" />
                            <span>{session.messageCount || 0}</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <Clock className="h-3 w-3" />
                            <span>{formatDate(session.lastMessageAt)}</span>
                          </span>
                        </div>

                        {/* Tags */}
                        {session.metadata?.tags && session.metadata.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {session.metadata.tags.slice(0, 3).map((tag, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                            {session.metadata.tags.length > 3 && (
                              <Badge variant="secondary" className="text-xs">
                                +{session.metadata.tags.length - 3}
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center space-x-1 ml-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => handleToggleFavorite(session, e)}
                          className="h-8 w-8 p-0"
                        >
                          <Star 
                            className={`h-4 w-4 ${isFavorite ? 'text-yellow-500 fill-current' : 'text-gray-400'}`} 
                          />
                        </Button>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={(e) => handleExportSession(session, e)}>
                              <Download className="h-4 w-4 mr-2" />
                              Export
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={(e) => handleDeleteSession(session, e)}
                              className="text-red-600"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default ChatHistoryPanel;
