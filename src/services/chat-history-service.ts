import { db } from '@/lib/database';
import { ChatSession, ChatMessage } from '@/lib/database';
import { generateUUID } from '@/lib/utils';

export interface CreateChatSessionData {
  title: string;
  userId: string;
  organizationId: string;
  projectId?: string;
  metadata?: {
    tags?: string[];
    isFavorite?: boolean;
    summary?: string;
    aiModel?: string;
    totalTokens?: number;
  };
}

export interface CreateChatMessageData {
  sessionId: string;
  content: string;
  sender: 'user' | 'assistant';
  type?: 'text' | 'code' | 'analysis' | 'error' | 'ai_response';
  metadata?: {
    analysis?: any;
    suggestions?: any[];
    relatedIssues?: any[];
    confidence?: number;
    followUpQuestions?: string[];
    tokenCount?: number;
    processingTime?: number;
  };
  parentMessageId?: string;
}

export interface UpdateChatSessionData {
  title?: string;
  status?: 'active' | 'archived' | 'deleted';
  metadata?: {
    tags?: string[];
    isFavorite?: boolean;
    summary?: string;
    aiModel?: string;
    totalTokens?: number;
  };
}

export interface ChatHistoryFilters {
  userId?: string;
  organizationId?: string;
  projectId?: string;
  status?: 'active' | 'archived' | 'deleted';
  isFavorite?: boolean;
  tags?: string[];
  dateRange?: {
    start: Date;
    end: Date;
  };
  searchQuery?: string;
}

export class ChatHistoryService {
  // Chat Session Operations
  static async createChatSession(data: CreateChatSessionData): Promise<ChatSession> {
    try {
      const sessionId = await db.chatSessions.add({
        uuid: generateUUID(),
        title: data.title,
        userId: data.userId,
        organizationId: data.organizationId,
        projectId: data.projectId,
        status: 'active',
        messageCount: 0,
        lastMessageAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
        metadata: data.metadata
      });

      const session = await db.chatSessions.get(sessionId);
      if (!session) {
        throw new Error('Failed to create chat session');
      }

      return session;
    } catch (error) {
      console.error('Error creating chat session:', error);
      throw error;
    }
  }

  static async getChatSession(sessionId: string): Promise<ChatSession | undefined> {
    try {
      return await db.chatSessions.where('uuid').equals(sessionId).first();
    } catch (error) {
      console.error('Error getting chat session:', error);
      throw error;
    }
  }

  static async updateChatSession(sessionId: string, data: UpdateChatSessionData): Promise<void> {
    try {
      await db.chatSessions.where('uuid').equals(sessionId).modify({
        ...data,
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Error updating chat session:', error);
      throw error;
    }
  }

  static async deleteChatSession(sessionId: string): Promise<void> {
    try {
      // Soft delete - mark as deleted instead of removing
      await db.chatSessions.where('uuid').equals(sessionId).modify({
        status: 'deleted',
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Error deleting chat session:', error);
      throw error;
    }
  }

  static async getChatSessions(filters: ChatHistoryFilters = {}): Promise<ChatSession[]> {
    try {
      let query = db.chatSessions.orderBy('lastMessageAt').reverse();

      // Apply filters
      if (filters.userId) {
        query = query.filter(session => session.userId === filters.userId);
      }

      if (filters.organizationId) {
        query = query.filter(session => session.organizationId === filters.organizationId);
      }

      if (filters.projectId) {
        query = query.filter(session => session.projectId === filters.projectId);
      }

      if (filters.status) {
        query = query.filter(session => session.status === filters.status);
      } else {
        // Default to active sessions only
        query = query.filter(session => session.status !== 'deleted');
      }

      if (filters.isFavorite !== undefined) {
        query = query.filter(session => session.metadata?.isFavorite === filters.isFavorite);
      }

      if (filters.tags && filters.tags.length > 0) {
        query = query.filter(session => {
          const sessionTags = session.metadata?.tags || [];
          return filters.tags!.some(tag => sessionTags.includes(tag));
        });
      }

      if (filters.dateRange) {
        query = query.filter(session => 
          session.createdAt >= filters.dateRange!.start && 
          session.createdAt <= filters.dateRange!.end
        );
      }

      let sessions = await query.toArray();

      // Apply search query filter
      if (filters.searchQuery) {
        const searchLower = filters.searchQuery.toLowerCase();
        sessions = sessions.filter(session => 
          session.title.toLowerCase().includes(searchLower) ||
          session.metadata?.summary?.toLowerCase().includes(searchLower)
        );
      }

      return sessions;
    } catch (error) {
      console.error('Error getting chat sessions:', error);
      throw error;
    }
  }

  // Chat Message Operations
  static async addChatMessage(data: CreateChatMessageData): Promise<ChatMessage> {
    try {
      const messageId = await db.chatMessages.add({
        uuid: generateUUID(),
        sessionId: data.sessionId,
        content: data.content,
        sender: data.sender,
        type: data.type || 'text',
        timestamp: new Date(),
        metadata: data.metadata,
        parentMessageId: data.parentMessageId
      });

      // Update session message count and last message time
      await db.chatSessions.where('uuid').equals(data.sessionId).modify(session => {
        session.messageCount = (session.messageCount || 0) + 1;
        session.lastMessageAt = new Date();
        session.updatedAt = new Date();
      });

      const message = await db.chatMessages.get(messageId);
      if (!message) {
        throw new Error('Failed to create chat message');
      }

      return message;
    } catch (error) {
      console.error('Error adding chat message:', error);
      throw error;
    }
  }

  static async getChatMessages(sessionId: string): Promise<ChatMessage[]> {
    try {
      const messages = await db.chatMessages
        .where('sessionId')
        .equals(sessionId)
        .toArray();
      
      return messages.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    } catch (error) {
      console.error('Error getting chat messages:', error);
      throw error;
    }
  }

  static async updateChatMessage(messageId: string, content: string): Promise<void> {
    try {
      await db.chatMessages.where('uuid').equals(messageId).modify({
        content,
        isEdited: true,
        editedAt: new Date()
      });
    } catch (error) {
      console.error('Error updating chat message:', error);
      throw error;
    }
  }

  static async deleteChatMessage(messageId: string): Promise<void> {
    try {
      const message = await db.chatMessages.where('uuid').equals(messageId).first();
      if (!message) {
        throw new Error('Message not found');
      }

      await db.chatMessages.where('uuid').equals(messageId).delete();

      // Update session message count
      await db.chatSessions.where('uuid').equals(message.sessionId).modify(session => {
        session.messageCount = Math.max(0, (session.messageCount || 1) - 1);
        session.updatedAt = new Date();
      });
    } catch (error) {
      console.error('Error deleting chat message:', error);
      throw error;
    }
  }

  static async addMessageReaction(messageId: string, reaction: 'up' | 'down'): Promise<void> {
    try {
      await db.chatMessages.where('uuid').equals(messageId).modify(message => {
        if (!message.reactions) {
          message.reactions = { thumbsUp: 0, thumbsDown: 0, userReaction: null };
        }

        // Remove previous reaction if exists
        if (message.reactions.userReaction === 'up') {
          message.reactions.thumbsUp = Math.max(0, (message.reactions.thumbsUp || 0) - 1);
        } else if (message.reactions.userReaction === 'down') {
          message.reactions.thumbsDown = Math.max(0, (message.reactions.thumbsDown || 0) - 1);
        }

        // Add new reaction
        if (reaction === 'up') {
          message.reactions.thumbsUp = (message.reactions.thumbsUp || 0) + 1;
        } else {
          message.reactions.thumbsDown = (message.reactions.thumbsDown || 0) + 1;
        }

        message.reactions.userReaction = reaction;
      });
    } catch (error) {
      console.error('Error adding message reaction:', error);
      throw error;
    }
  }

  // Utility Methods
  static async getRecentSessions(userId: string, limit: number = 10): Promise<ChatSession[]> {
    try {
      console.log('ChatHistoryService.getRecentSessions: Querying for userId:', userId);
      
      // First, let's check if there are any sessions at all
      const allSessions = await db.chatSessions.toArray();
      console.log('ChatHistoryService.getRecentSessions: Total sessions in DB:', allSessions.length);
      
      const sessions = await db.chatSessions
        .where('userId')
        .equals(userId)
        .filter(session => session.status === 'active')
        .toArray();
      
      console.log('ChatHistoryService.getRecentSessions: Found sessions for user:', sessions.length);
      
      const sortedSessions = sessions
        .sort((a, b) => b.lastMessageAt.getTime() - a.lastMessageAt.getTime())
        .slice(0, limit);
        
      console.log('ChatHistoryService.getRecentSessions: Returning sessions:', sortedSessions.length);
      return sortedSessions;
    } catch (error) {
      console.error('Error getting recent sessions:', error);
      throw error;
    }
  }

  static async getFavoriteSessions(userId: string): Promise<ChatSession[]> {
    try {
      const sessions = await db.chatSessions
        .where('userId')
        .equals(userId)
        .filter(session => 
          session.status === 'active' && 
          session.metadata?.isFavorite === true
        )
        .toArray();
      
      return sessions.sort((a, b) => b.lastMessageAt.getTime() - a.lastMessageAt.getTime());
    } catch (error) {
      console.error('Error getting favorite sessions:', error);
      throw error;
    }
  }

  static async searchChatHistory(userId: string, query: string): Promise<{
    sessions: ChatSession[];
    messages: ChatMessage[];
  }> {
    try {
      const searchLower = query.toLowerCase();

      // Search sessions by title and summary
      const sessionsData = await db.chatSessions
        .where('userId')
        .equals(userId)
        .filter(session => {
          const titleMatch = session.title.toLowerCase().includes(searchLower);
          const summaryMatch = session.metadata?.summary ? 
            session.metadata.summary.toLowerCase().includes(searchLower) : false;
          return session.status === 'active' && (titleMatch || summaryMatch);
        })
        .toArray();
      
      const sessions = sessionsData.sort((a, b) => b.lastMessageAt.getTime() - a.lastMessageAt.getTime());

      // Search messages by content
      const messagesData = await db.chatMessages
        .filter(message => message.content.toLowerCase().includes(searchLower))
        .toArray();
      
      const messages = messagesData
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
        .slice(0, 50);

      return { sessions, messages };
    } catch (error) {
      console.error('Error searching chat history:', error);
      throw error;
    }
  }

  static async getChatStatistics(userId: string): Promise<{
    totalSessions: number;
    totalMessages: number;
    favoriteSessions: number;
    averageMessagesPerSession: number;
    mostActiveDay: string;
  }> {
    try {
      const sessions = await db.chatSessions
        .where('userId')
        .equals(userId)
        .filter(session => session.status === 'active')
        .toArray();

      const totalSessions = sessions.length;
      const totalMessages = sessions.reduce((sum, session) => sum + (session.messageCount || 0), 0);
      const favoriteSessions = sessions.filter(session => session.metadata?.isFavorite).length;
      const averageMessagesPerSession = totalSessions > 0 ? Math.round(totalMessages / totalSessions) : 0;

      // Calculate most active day
      const dayCount: Record<string, number> = {};
      sessions.forEach(session => {
        const day = session.createdAt.toLocaleDateString('en-US', { weekday: 'long' });
        dayCount[day] = (dayCount[day] || 0) + 1;
      });

      const mostActiveDay = Object.entries(dayCount).reduce((a, b) => 
        dayCount[a[0]] > dayCount[b[0]] ? a : b
      )?.[0] || 'No data';

      return {
        totalSessions,
        totalMessages,
        favoriteSessions,
        averageMessagesPerSession,
        mostActiveDay
      };
    } catch (error) {
      console.error('Error getting chat statistics:', error);
      throw error;
    }
  }

  // Bulk Operations
  static async archiveOldSessions(userId: string, daysOld: number = 30): Promise<number> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);

      const sessionsToArchive = await db.chatSessions
        .where('userId')
        .equals(userId)
        .filter(session => 
          session.status === 'active' && 
          session.lastMessageAt < cutoffDate &&
          !session.metadata?.isFavorite
        )
        .toArray();

      await Promise.all(
        sessionsToArchive.map(session =>
          db.chatSessions.where('uuid').equals(session.uuid).modify({
            status: 'archived',
            updatedAt: new Date()
          })
        )
      );

      return sessionsToArchive.length;
    } catch (error) {
      console.error('Error archiving old sessions:', error);
      throw error;
    }
  }

  static async exportChatHistory(sessionId: string): Promise<{
    session: ChatSession;
    messages: ChatMessage[];
  }> {
    try {
      const session = await this.getChatSession(sessionId);
      if (!session) {
        throw new Error('Session not found');
      }

      const messages = await this.getChatMessages(sessionId);

      return { session, messages };
    } catch (error) {
      console.error('Error exporting chat history:', error);
      throw error;
    }
  }
}

export default ChatHistoryService;
