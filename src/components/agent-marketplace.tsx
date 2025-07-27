'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Search, Filter, Star, Users, Zap, Crown, ExternalLink, MessageCircle, TrendingUp, Clock, Grid, List, ArrowLeft, Send, Bot, User, Copy, ThumbsUp, ThumbsDown, Sparkles, MoreVertical, Share2 } from 'lucide-react';
import { Agent, AgentFilter, AgentStats, AgentChatSession, AgentMessage } from '@/types/agent-types';
import { AgentMarketplaceService } from '@/services/agent-marketplace-service';
import { agentCategories, popularTags } from '@/data/sample-agents';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useRouter } from 'next/navigation';

interface AgentMarketplaceProps {
  onAgentSelect?: (agent: Agent) => void;
  className?: string;
}

export function AgentMarketplace({ onAgentSelect, className = '' }: AgentMarketplaceProps) {
  const router = useRouter();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [filteredAgents, setFilteredAgents] = useState<Agent[]>([]);
  const [stats, setStats] = useState<AgentStats | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showPremiumOnly, setShowPremiumOnly] = useState(false);
  const [minRating, setMinRating] = useState<number>(0);
  const [sortBy, setSortBy] = useState<'popularity' | 'rating' | 'name' | 'recent'>('popularity');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isLoading, setIsLoading] = useState(true);
  
  // Chat state
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [chatSession, setChatSession] = useState<AgentChatSession | null>(null);
  const [messages, setMessages] = useState<AgentMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const allAgents = AgentMarketplaceService.getAllAgents();
        const agentStats = AgentMarketplaceService.getAgentStats();
        
        setAgents(allAgents);
        setStats(agentStats);
      } catch (error) {
        console.error('Error loading agents:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Filter and sort agents
  const filteredAndSortedAgents = useMemo(() => {
    const filter: AgentFilter = {
      category: selectedCategory === 'all' ? undefined : selectedCategory as any,
      tags: selectedTags.length > 0 ? selectedTags : undefined,
      isPremium: showPremiumOnly ? true : undefined,
      minRating: minRating > 0 ? minRating : undefined,
      searchQuery: searchQuery.trim() || undefined
    };

    let filtered = AgentMarketplaceService.filterAgents(filter);

    // Sort agents
    switch (sortBy) {
      case 'popularity':
        filtered.sort((a, b) => b.popularity - a.popularity);
        break;
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case 'name':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'recent':
        filtered.sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime());
        break;
    }

    return filtered;
  }, [agents, selectedCategory, searchQuery, selectedTags, showPremiumOnly, minRating, sortBy]);

  const handleAgentSelect = (agent: Agent) => {
    if (onAgentSelect) {
      onAgentSelect(agent);
    } else {
      // Navigate to agent chat
      router.push(`/agents/${agent.id}/chat`);
    }
  };

  const handleStartChat = (agent: Agent) => {
    AgentMarketplaceService.incrementAgentUsage(agent.id);
    handleAgentSelect(agent);
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const clearFilters = () => {
    setSelectedCategory('all');
    setSearchQuery('');
    setSelectedTags([]);
    setShowPremiumOnly(false);
    setMinRating(0);
  };

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center min-h-[400px] ${className}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading agents...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`max-w-7xl mx-auto p-6 space-y-8 ${className}`}>
      {/* Header Section */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-50 to-purple-50 rounded-full border border-blue-200">
          <Zap className="h-5 w-5 text-blue-600" />
          <span className="text-sm font-medium text-blue-700">Agent Marketplace</span>
        </div>
        
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent">
          Choose Your AI Assistant
        </h1>
        
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Discover powerful AI agents specialized for different tasks. From GitHub management to sales automation, 
          find the perfect assistant for your workflow.
        </p>

        {/* Stats */}
        {stats && (
          <div className="flex items-center justify-center gap-8 mt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.totalAgents}</div>
              <div className="text-sm text-gray-500">Available Agents</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.activeChats}</div>
              <div className="text-sm text-gray-500">Active Chats</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{stats.categories.length}</div>
              <div className="text-sm text-gray-500">Categories</div>
            </div>
          </div>
        )}
      </div>

      {/* Search and Filters */}
      <Card className="border-0 shadow-lg bg-gradient-to-r from-slate-50 to-blue-50/30">
        <CardContent className="p-6">
          <div className="space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search agents by name, capabilities, or tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12 text-base border-gray-200 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            {/* Filter Controls */}
            <div className="flex flex-wrap items-center gap-4">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {agentCategories.map(category => (
                    <SelectItem key={category.id} value={category.id}>
                      <div className="flex items-center gap-2">
                        <span>{category.icon}</span>
                        <span>{category.name}</span>
                        <Badge variant="secondary" className="ml-auto">
                          {category.count}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="popularity">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      <span>Popularity</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="rating">
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4" />
                      <span>Rating</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="recent">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span>Recently Updated</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>

              <div className="flex items-center gap-2">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowPremiumOnly(!showPremiumOnly)}
                className={showPremiumOnly ? 'bg-yellow-50 border-yellow-300 text-yellow-700' : ''}
              >
                <Crown className="h-4 w-4 mr-1" />
                Premium Only
              </Button>

              {(selectedCategory !== 'all' || searchQuery || selectedTags.length > 0 || showPremiumOnly || minRating > 0) && (
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  Clear Filters
                </Button>
              )}
            </div>

            {/* Popular Tags */}
            <div className="space-y-2">
              <div className="text-sm font-medium text-gray-700">Popular Tags:</div>
              <div className="flex flex-wrap gap-2">
                {popularTags.map(tag => (
                  <Badge
                    key={tag}
                    variant={selectedTags.includes(tag) ? 'default' : 'secondary'}
                    className="cursor-pointer hover:bg-blue-100 transition-colors"
                    onClick={() => toggleTag(tag)}
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="text-lg font-semibold text-gray-900">
            {filteredAndSortedAgents.length} {filteredAndSortedAgents.length === 1 ? 'Agent' : 'Agents'} Found
          </div>
        </div>

        {filteredAndSortedAgents.length === 0 ? (
          <Card className="border-dashed border-2 border-gray-200">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="text-6xl mb-4">🤖</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No agents found</h3>
              <p className="text-gray-600 text-center mb-4">
                Try adjusting your filters or search terms to find the perfect agent for your needs.
              </p>
              <Button onClick={clearFilters} variant="outline">
                Clear All Filters
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className={viewMode === 'grid' 
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' 
            : 'space-y-4'
          }>
            {filteredAndSortedAgents.map(agent => (
              <AgentCard
                key={agent.id}
                agent={agent}
                viewMode={viewMode}
                onStartChat={() => handleStartChat(agent)}
                onViewDetails={() => handleAgentSelect(agent)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

interface AgentCardProps {
  agent: Agent;
  viewMode: 'grid' | 'list';
  onStartChat: () => void;
  onViewDetails: () => void;
}

function AgentCard({ agent, viewMode, onStartChat, onViewDetails }: AgentCardProps) {
  if (viewMode === 'list') {
    return (
      <Card className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-blue-500">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4 flex-1">
              <div className={`text-3xl p-3 rounded-xl bg-gradient-to-br ${agent.gradient} text-white shadow-lg`}>
                {agent.icon}
              </div>
              
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-semibold text-gray-900">{agent.name}</h3>
                  {agent.isPremium && (
                    <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
                      <Crown className="h-3 w-3 mr-1" />
                      Premium
                    </Badge>
                  )}
                </div>
                
                <p className="text-gray-600 line-clamp-2">{agent.description}</p>
                
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span>{agent.rating.toFixed(1)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span>{agent.totalChats.toLocaleString()} chats</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <TrendingUp className="h-4 w-4" />
                    <span>{agent.popularity}% popularity</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1">
                  {agent.tags.slice(0, 4).map(tag => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {agent.tags.length > 4 && (
                    <Badge variant="secondary" className="text-xs">
                      +{agent.tags.length - 4} more
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2 ml-4">
              <Button onClick={onStartChat} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                <MessageCircle className="h-4 w-4 mr-2" />
                Start Chat
              </Button>
              <Button variant="outline" size="sm" onClick={onViewDetails}>
                <ExternalLink className="h-4 w-4 mr-2" />
                Details
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-0 shadow-lg bg-gradient-to-br from-white to-gray-50/50">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className={`text-4xl p-4 rounded-2xl bg-gradient-to-br ${agent.gradient} text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
            {agent.icon}
          </div>
          {agent.isPremium && (
            <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-md">
              <Crown className="h-3 w-3 mr-1" />
              Premium
            </Badge>
          )}
        </div>
        
        <div className="space-y-2">
          <CardTitle className="text-xl group-hover:text-blue-600 transition-colors">
            {agent.name}
          </CardTitle>
          <CardDescription className="text-gray-600 line-clamp-3">
            {agent.description}
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span className="font-medium">{agent.rating.toFixed(1)}</span>
          </div>
          <div className="flex items-center gap-1 text-gray-500">
            <Users className="h-4 w-4" />
            <span>{agent.totalChats.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-1 text-gray-500">
            <TrendingUp className="h-4 w-4" />
            <span>{agent.popularity}%</span>
          </div>
        </div>

        <div className="space-y-2">
          <div className="text-sm font-medium text-gray-700">Key Capabilities:</div>
          <div className="flex flex-wrap gap-1">
            {agent.capabilities.slice(0, 3).map(capability => (
              <Badge key={capability} variant="secondary" className="text-xs">
                {capability}
              </Badge>
            ))}
            {agent.capabilities.length > 3 && (
              <Badge variant="secondary" className="text-xs">
                +{agent.capabilities.length - 3}
              </Badge>
            )}
          </div>
        </div>

        <Separator />

        <div className="flex gap-2">
          <Button 
            onClick={onStartChat} 
            className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-md hover:shadow-lg transition-all duration-200"
          >
            <MessageCircle className="h-4 w-4 mr-2" />
            Start Chat
          </Button>
          <Button variant="outline" size="sm" onClick={onViewDetails}>
            <ExternalLink className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
