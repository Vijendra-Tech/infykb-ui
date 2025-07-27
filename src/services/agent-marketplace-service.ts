import { Agent, AgentFilter, AgentChatSession, AgentMessage, AgentStats } from '@/types/agent-types';
import { sampleAgents } from '@/data/sample-agents';

export class AgentMarketplaceService {
  private static agents: Agent[] = [...sampleAgents];
  private static chatSessions: AgentChatSession[] = [];

  // Agent Management
  static getAllAgents(): Agent[] {
    return this.agents.filter(agent => agent.isActive);
  }

  static getAgentById(id: string): Agent | undefined {
    return this.agents.find(agent => agent.id === id);
  }

  static getAgentsByCategory(category: string): Agent[] {
    if (category === 'all') return this.getAllAgents();
    return this.agents.filter(agent => agent.category === category && agent.isActive);
  }

  static searchAgents(query: string): Agent[] {
    const lowercaseQuery = query.toLowerCase();
    return this.agents.filter(agent => 
      agent.isActive && (
        agent.name.toLowerCase().includes(lowercaseQuery) ||
        agent.description.toLowerCase().includes(lowercaseQuery) ||
        agent.capabilities.some(cap => cap.toLowerCase().includes(lowercaseQuery)) ||
        agent.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
      )
    );
  }

  static filterAgents(filter: AgentFilter): Agent[] {
    let filteredAgents = this.getAllAgents();

    if (filter.category && (filter.category as string) !== 'all') {
      filteredAgents = filteredAgents.filter(agent => agent.category === filter.category);
    }

    if (filter.tags && filter.tags.length > 0) {
      filteredAgents = filteredAgents.filter(agent => 
        filter.tags!.some(tag => agent.tags.includes(tag))
      );
    }

    if (filter.isPremium !== undefined) {
      filteredAgents = filteredAgents.filter(agent => agent.isPremium === filter.isPremium);
    }

    if (filter.minRating) {
      filteredAgents = filteredAgents.filter(agent => agent.rating >= filter.minRating!);
    }

    if (filter.searchQuery) {
      const query = filter.searchQuery.toLowerCase();
      filteredAgents = filteredAgents.filter(agent => 
        agent.name.toLowerCase().includes(query) ||
        agent.description.toLowerCase().includes(query) ||
        agent.capabilities.some(cap => cap.toLowerCase().includes(query)) ||
        agent.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    return filteredAgents;
  }

  static getPopularAgents(limit: number = 6): Agent[] {
    return this.getAllAgents()
      .sort((a, b) => b.popularity - a.popularity)
      .slice(0, limit);
  }

  static getRecentlyUsedAgents(userId: string, limit: number = 4): Agent[] {
    const recentSessions = this.chatSessions
      .filter(session => session.userId === userId)
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, limit);

    const agentIds = [...new Set(recentSessions.map(session => session.agentId))];
    return agentIds.map(id => this.getAgentById(id)).filter(Boolean) as Agent[];
  }

  // Chat Session Management
  static createChatSession(agentId: string, userId: string): AgentChatSession {
    const agent = this.getAgentById(agentId);
    if (!agent) {
      throw new Error('Agent not found');
    }

    const session: AgentChatSession = {
      id: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      agentId,
      userId,
      title: `Chat with ${agent.name}`,
      messages: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isActive: true,
      metadata: {
        agentName: agent.name,
        agentIcon: agent.icon,
        agentColor: agent.color
      }
    };

    this.chatSessions.push(session);
    return session;
  }

  static getChatSession(sessionId: string): AgentChatSession | undefined {
    return this.chatSessions.find(session => session.id === sessionId);
  }

  static getUserChatSessions(userId: string): AgentChatSession[] {
    return this.chatSessions
      .filter(session => session.userId === userId)
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }

  static addMessageToSession(sessionId: string, message: Omit<AgentMessage, 'id' | 'timestamp'>): AgentMessage {
    const session = this.getChatSession(sessionId);
    if (!session) {
      throw new Error('Chat session not found');
    }

    const newMessage: AgentMessage = {
      ...message,
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString()
    };

    session.messages.push(newMessage);
    session.updatedAt = new Date().toISOString();

    return newMessage;
  }

  static updateSessionTitle(sessionId: string, title: string): void {
    const session = this.getChatSession(sessionId);
    if (session) {
      session.title = title;
      session.updatedAt = new Date().toISOString();
    }
  }

  static deleteSession(sessionId: string): boolean {
    const index = this.chatSessions.findIndex(session => session.id === sessionId);
    if (index !== -1) {
      this.chatSessions.splice(index, 1);
      return true;
    }
    return false;
  }

  // Agent Response Simulation
  static async simulateAgentResponse(agentId: string, userMessage: string): Promise<string> {
    const agent = this.getAgentById(agentId);
    if (!agent) {
      throw new Error('Agent not found');
    }

    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

    // Generate contextual response based on agent type
    const responses = this.getAgentResponses(agent, userMessage);
    return responses[Math.floor(Math.random() * responses.length)];
  }

  private static getAgentResponses(agent: Agent, userMessage: string): string[] {
    const message = userMessage.toLowerCase();
    
    switch (agent.id) {
      case 'github-assistant':
        if (message.includes('pull request') || message.includes('pr')) {
          return [
            "I'll help you create a pull request! First, let me check your current branch status and suggest the best approach for your PR.",
            "Great! I can assist with PR creation. Would you like me to analyze your changes and generate a comprehensive PR description?",
            "I'll guide you through creating an effective pull request with proper formatting, reviewers, and automated checks."
          ];
        }
        if (message.includes('issue') || message.includes('bug')) {
          return [
            "I can help you create and manage GitHub issues. Let me analyze the problem and suggest the best issue template.",
            "I'll assist with issue tracking! Would you like me to search existing issues or create a new one with proper labeling?",
            "Let me help you with issue management. I can create detailed bug reports or feature requests with all necessary information."
          ];
        }
        return [
          "Hello! I'm your GitHub Assistant. I can help with repository management, code reviews, pull requests, and issue tracking. What would you like to work on?",
          "I'm here to streamline your GitHub workflow! Whether it's managing repos, reviewing code, or automating tasks, I've got you covered.",
          "Ready to enhance your GitHub experience! I can assist with everything from branch management to CI/CD workflows."
        ];

      case 'jira-assistant':
        if (message.includes('sprint') || message.includes('planning')) {
          return [
            "I'll help you with sprint planning! Let me analyze your backlog and suggest optimal sprint composition based on team capacity.",
            "Great! I can assist with sprint management. Would you like me to create a new sprint or optimize your current one?",
            "I'll guide you through effective sprint planning with story point estimation and team velocity analysis."
          ];
        }
        return [
          "Hello! I'm your JIRA Assistant. I can help with project management, sprint planning, issue tracking, and workflow automation. How can I assist you today?",
          "Ready to optimize your JIRA workflow! I can help with backlog management, sprint planning, and team collaboration.",
          "I'm here to streamline your project management! From creating epics to managing sprints, I'll help you stay organized."
        ];

      case 'salesforce-assistant':
        if (message.includes('lead') || message.includes('opportunity')) {
          return [
            "I'll help you manage leads and opportunities! Let me analyze your pipeline and suggest optimization strategies.",
            "Great! I can assist with lead management. Would you like me to create new leads or analyze your current pipeline?",
            "I'll guide you through effective lead nurturing and opportunity management to maximize your sales potential."
          ];
        }
        return [
          "Hello! I'm your Salesforce Assistant. I can help with CRM management, lead tracking, opportunity analysis, and sales automation. What's your goal today?",
          "Ready to boost your sales performance! I can help with pipeline management, forecasting, and customer relationship optimization.",
          "I'm here to enhance your Salesforce experience! From lead generation to deal closure, I'll support your sales journey."
        ];

      default:
        return [
          `Hello! I'm ${agent.name}. I specialize in ${agent.capabilities.slice(0, 3).join(', ')}. How can I help you today?`,
          `Welcome! I'm your ${agent.name} and I'm ready to assist with ${agent.description.toLowerCase()}. What would you like to work on?`,
          `Hi there! As your ${agent.name}, I can help you with ${agent.capabilities.slice(0, 2).join(' and ')}. Let's get started!`
        ];
    }
  }

  // Statistics
  static getAgentStats(): AgentStats {
    const totalAgents = this.agents.filter(agent => agent.isActive).length;
    const activeChats = this.chatSessions.filter(session => session.isActive).length;
    const popularAgents = this.getPopularAgents(5);
    
    const categories = [
      { category: 'development' as const, count: this.getAgentsByCategory('development').length },
      { category: 'project-management' as const, count: this.getAgentsByCategory('project-management').length },
      { category: 'sales-crm' as const, count: this.getAgentsByCategory('sales-crm').length },
      { category: 'productivity' as const, count: this.getAgentsByCategory('productivity').length },
      { category: 'analytics' as const, count: this.getAgentsByCategory('analytics').length },
      { category: 'support' as const, count: this.getAgentsByCategory('support').length },
      { category: 'marketing' as const, count: this.getAgentsByCategory('marketing').length },
    ];

    return {
      totalAgents,
      activeChats,
      popularAgents,
      recentlyUsed: [],
      categories
    };
  }

  // Utility Methods
  static incrementAgentUsage(agentId: string): void {
    const agent = this.getAgentById(agentId);
    if (agent) {
      agent.totalChats += 1;
      agent.popularity = Math.min(100, agent.popularity + 0.1);
    }
  }

  static rateAgent(agentId: string, rating: number): void {
    const agent = this.getAgentById(agentId);
    if (agent && rating >= 1 && rating <= 5) {
      // Simple rating update (in real app, you'd calculate average)
      agent.rating = (agent.rating + rating) / 2;
    }
  }
}
