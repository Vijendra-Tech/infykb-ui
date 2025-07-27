export interface Agent {
  [x: string]: any;
  id: string;
  name: string;
  description: string;
  category: AgentCategory;
  icon: string;
  color: string;
  gradient: string;
  capabilities: string[];
  tags: string[];
  popularity: number;
  rating: number;
  totalChats: number;
  isActive: boolean;
  isPremium: boolean;
  provider: string;
  version: string;
  lastUpdated: string;
  documentation?: string;
  examples?: AgentExample[];
  pricing?: AgentPricing;
}

export interface AgentExample {
  title: string;
  description: string;
  prompt: string;
  expectedOutput: string;
}

export interface AgentPricing {
  type: 'free' | 'premium' | 'enterprise';
  price?: number;
  currency?: string;
  billingPeriod?: 'monthly' | 'yearly' | 'per-use';
}

export type AgentCategory = 
  | 'development'
  | 'project-management' 
  | 'sales-crm'
  | 'productivity'
  | 'analytics'
  | 'support'
  | 'marketing'
  | 'hr'
  | 'finance'
  | 'general';

export interface AgentChatSession {
  id: string;
  agentId: string;
  userId: string;
  title: string;
  messages: AgentMessage[];
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
  metadata?: Record<string, any>;
}

export interface AgentMessage {
  id: string;
  role: 'user' | 'agent' | 'system';
  content: string;
  timestamp: string;
  metadata?: {
    agentName?: string;
    agentIcon?: string;
    actions?: AgentAction[];
    attachments?: AgentAttachment[];
  };
}

export interface AgentAction {
  id: string;
  type: 'link' | 'button' | 'form' | 'download';
  label: string;
  action: string;
  data?: Record<string, any>;
}

export interface AgentAttachment {
  id: string;
  type: 'image' | 'file' | 'code' | 'link';
  name: string;
  url: string;
  size?: number;
  mimeType?: string;
}

export interface AgentFilter {
  category?: AgentCategory;
  tags?: string[];
  isPremium?: boolean;
  minRating?: number;
  searchQuery?: string;
}

export interface AgentStats {
  totalAgents: number;
  activeChats: number;
  popularAgents: Agent[];
  recentlyUsed: Agent[];
  categories: { category: AgentCategory; count: number }[];
}
