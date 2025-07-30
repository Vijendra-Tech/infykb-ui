import { useState, useEffect, useCallback } from 'react';
import { ChatSession, ChatMessage } from '@/lib/database';
import ChatHistoryService, { 
  CreateChatSessionData, 
  CreateChatMessageData, 
  UpdateChatSessionData,
  ChatHistoryFilters 
} from '@/services/chat-history-service';

export interface UseChatHistoryReturn {
  // State
  sessions: ChatSession[];
  currentSession: ChatSession | null;
  messages: ChatMessage[];
  loading: boolean;
  error: string | null;

  // Session Operations
  createSession: (data: CreateChatSessionData) => Promise<ChatSession>;
  loadSession: (sessionId: string) => Promise<void>;
  updateSession: (sessionId: string, data: UpdateChatSessionData) => Promise<void>;
  deleteSession: (sessionId: string) => Promise<void>;
  loadSessions: (filters?: ChatHistoryFilters) => Promise<void>;

  // Message Operations
  addMessage: (data: CreateChatMessageData) => Promise<ChatMessage>;
  updateMessage: (messageId: string, content: string) => Promise<void>;
  deleteMessage: (messageId: string) => Promise<void>;
  addReaction: (messageId: string, reaction: 'up' | 'down') => Promise<void>;

  // Utility Operations
  searchHistory: (query: string) => Promise<{ sessions: ChatSession[]; messages: ChatMessage[] }>;
  getRecentSessions: (limit?: number) => Promise<void>;
  getFavorites: () => Promise<void>;
  exportSession: (sessionId: string) => Promise<{ session: ChatSession; messages: ChatMessage[] }>;

  // Clear operations
  clearCurrentSession: () => void;
  clearError: () => void;
}

export function useChatHistory(userId?: string): UseChatHistoryReturn {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Session Operations
  const createSession = useCallback(async (data: CreateChatSessionData): Promise<ChatSession> => {
    try {
      setLoading(true);
      setError(null);
      
      const session = await ChatHistoryService.createChatSession(data);
      setSessions(prev => [session, ...prev]);
      setCurrentSession(session);
      setMessages([]);
      
      return session;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create session';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const loadSession = useCallback(async (sessionId: string): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      const [session, sessionMessages] = await Promise.all([
        ChatHistoryService.getChatSession(sessionId),
        ChatHistoryService.getChatMessages(sessionId)
      ]);

      if (!session) {
        throw new Error('Session not found');
      }

      setCurrentSession(session);
      setMessages(sessionMessages);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load session';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateSession = useCallback(async (sessionId: string, data: UpdateChatSessionData): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      await ChatHistoryService.updateChatSession(sessionId, data);

      // Update local state
      setSessions(prev => prev.map(session => 
        session.uuid === sessionId 
          ? { ...session, ...data, updatedAt: new Date() }
          : session
      ));

      if (currentSession?.uuid === sessionId) {
        setCurrentSession(prev => prev ? { ...prev, ...data, updatedAt: new Date() } : null);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update session';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [currentSession]);

  const deleteSession = useCallback(async (sessionId: string): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      await ChatHistoryService.deleteChatSession(sessionId);

      // Update local state
      setSessions(prev => prev.filter(session => session.uuid !== sessionId));
      
      if (currentSession?.uuid === sessionId) {
        setCurrentSession(null);
        setMessages([]);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete session';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [currentSession]);

  const loadSessions = useCallback(async (filters?: ChatHistoryFilters): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      const loadedSessions = await ChatHistoryService.getChatSessions(filters);
      setSessions(loadedSessions);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load sessions';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Message Operations
  const addMessage = useCallback(async (data: CreateChatMessageData): Promise<ChatMessage> => {
    try {
      setLoading(true);
      setError(null);

      const message = await ChatHistoryService.addChatMessage(data);
      setMessages(prev => [...prev, message]);

      // Update current session message count and last message time
      if (currentSession?.uuid === data.sessionId) {
        setCurrentSession(prev => prev ? {
          ...prev,
          messageCount: (prev.messageCount || 0) + 1,
          lastMessageAt: new Date(),
          updatedAt: new Date()
        } : null);
      }

      // Update sessions list
      setSessions(prev => prev.map(session => 
        session.uuid === data.sessionId
          ? {
              ...session,
              messageCount: (session.messageCount || 0) + 1,
              lastMessageAt: new Date(),
              updatedAt: new Date()
            }
          : session
      ));

      return message;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add message';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [currentSession]);

  const updateMessage = useCallback(async (messageId: string, content: string): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      await ChatHistoryService.updateChatMessage(messageId, content);

      // Update local state
      setMessages(prev => prev.map(message => 
        message.uuid === messageId 
          ? { ...message, content, isEdited: true, editedAt: new Date() }
          : message
      ));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update message';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteMessage = useCallback(async (messageId: string): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      await ChatHistoryService.deleteChatMessage(messageId);

      // Update local state
      setMessages(prev => prev.filter(message => message.uuid !== messageId));

      // Update session message count
      if (currentSession) {
        const newCount = Math.max(0, (currentSession.messageCount || 1) - 1);
        setCurrentSession(prev => prev ? { ...prev, messageCount: newCount } : null);
        setSessions(prev => prev.map(session => 
          session.uuid === currentSession.uuid
            ? { ...session, messageCount: newCount }
            : session
        ));
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete message';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [currentSession]);

  const addReaction = useCallback(async (messageId: string, reaction: 'up' | 'down'): Promise<void> => {
    try {
      setError(null);

      await ChatHistoryService.addMessageReaction(messageId, reaction);

      // Update local state
      setMessages(prev => prev.map(message => {
        if (message.uuid !== messageId) return message;

        const reactions = message.reactions || { thumbsUp: 0, thumbsDown: 0, userReaction: null };
        
        // Remove previous reaction
        if (reactions.userReaction === 'up') {
          reactions.thumbsUp = Math.max(0, (reactions.thumbsUp || 0) - 1);
        } else if (reactions.userReaction === 'down') {
          reactions.thumbsDown = Math.max(0, (reactions.thumbsDown || 0) - 1);
        }

        // Add new reaction
        if (reaction === 'up') {
          reactions.thumbsUp = (reactions.thumbsUp || 0) + 1;
        } else {
          reactions.thumbsDown = (reactions.thumbsDown || 0) + 1;
        }

        reactions.userReaction = reaction;

        return { ...message, reactions };
      }));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add reaction';
      setError(errorMessage);
      throw err;
    }
  }, []);

  // Utility Operations
  const searchHistory = useCallback(async (query: string): Promise<{ sessions: ChatSession[]; messages: ChatMessage[] }> => {
    if (!userId) {
      throw new Error('User ID is required for search');
    }

    try {
      setLoading(true);
      setError(null);

      return await ChatHistoryService.searchChatHistory(userId, query);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to search history';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const getRecentSessions = useCallback(async (limit: number = 10): Promise<void> => {
    if (!userId) return;

    try {
      setLoading(true);
      setError(null);

      const recentSessions = await ChatHistoryService.getRecentSessions(userId, limit);
      setSessions(recentSessions);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load recent sessions';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const getFavorites = useCallback(async (): Promise<void> => {
    if (!userId) return;

    try {
      setLoading(true);
      setError(null);

      const favoriteSessions = await ChatHistoryService.getFavoriteSessions(userId);
      setSessions(favoriteSessions);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load favorite sessions';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const exportSession = useCallback(async (sessionId: string): Promise<{ session: ChatSession; messages: ChatMessage[] }> => {
    try {
      setLoading(true);
      setError(null);

      return await ChatHistoryService.exportChatHistory(sessionId);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to export session';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Clear operations
  const clearCurrentSession = useCallback(() => {
    setCurrentSession(null);
    setMessages([]);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Load initial sessions when userId is available
  useEffect(() => {
    if (userId) {
      getRecentSessions();
    }
  }, [userId, getRecentSessions]);

  return {
    // State
    sessions,
    currentSession,
    messages,
    loading,
    error,

    // Session Operations
    createSession,
    loadSession,
    updateSession,
    deleteSession,
    loadSessions,

    // Message Operations
    addMessage,
    updateMessage,
    deleteMessage,
    addReaction,

    // Utility Operations
    searchHistory,
    getRecentSessions,
    getFavorites,
    exportSession,

    // Clear operations
    clearCurrentSession,
    clearError
  };
}

export default useChatHistory;
