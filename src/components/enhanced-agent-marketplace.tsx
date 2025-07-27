'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Search, Star, Users, Zap, Crown, MessageCircle, TrendingUp, Clock, Grid, List, ArrowLeft } from 'lucide-react';
import { Agent, AgentFilter, AgentStats } from '@/types/agent-types';
import { AgentMarketplaceService } from '@/services/agent-marketplace-service';
import { agentCategories, popularTags } from '@/data/sample-agents';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AgentSpecificChatInterface } from '@/components/agent-specific-chat-interface';
import { ElegantAgentCard, ElegantMarketplaceHeader, ElegantSearchBar } from './elegant-agent-enhancements';

interface EnhancedAgentMarketplaceProps {
  onAgentSelect?: (agent: Agent) => void;
  className?: string;
}

export function EnhancedAgentMarketplace({ onAgentSelect, className = '' }: EnhancedAgentMarketplaceProps) {
  // Agent marketplace state
  const [agents, setAgents] = useState<Agent[]>([]);
  const [stats, setStats] = useState<AgentStats | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showPremiumOnly, setShowPremiumOnly] = useState(false);
  const [sortBy, setSortBy] = useState<'popularity' | 'rating' | 'name' | 'recent'>('popularity');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isLoading, setIsLoading] = useState(true);
  
  // Chat state
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const agentListScrollRef = useRef<HTMLDivElement>(null);
  const [lastScrollPosition, setLastScrollPosition] = useState(0);
  
  // Scroll state
  const [agentListScrollProgress, setAgentListScrollProgress] = useState(0);
  const [isAgentListScrolling, setIsAgentListScrolling] = useState(false);

  // Load agents and stats
  useEffect(() => {
    const loadData = async () => {
      try {
        const [agentsData, statsData] = await Promise.all([
          AgentMarketplaceService.getAllAgents(),
          AgentMarketplaceService.getAgentStats()
        ]);
        setAgents(agentsData);
        setStats(statsData);
      } catch (error) {
        console.error('Failed to load marketplace data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Filter and sort agents
  const filteredAndSortedAgents = useMemo(() => {
    let filtered = agents.filter(agent => {
      const matchesCategory = selectedCategory === 'all' || agent.category === selectedCategory;
      const matchesSearch = agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           agent.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           agent.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesTags = selectedTags.length === 0 || selectedTags.some(tag => agent.tags.includes(tag));
      const matchesPremium = !showPremiumOnly || agent.isPremium;
      
      return matchesCategory && matchesSearch && matchesTags && matchesPremium;
    });

    // Sort agents
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'popularity':
          return b.popularity - a.popularity;
        case 'rating':
          return b.rating - a.rating;
        case 'name':
          return a.name.localeCompare(b.name);
        case 'recent':
          return new Date(b.lastUpdated || 0).getTime() - new Date(a.lastUpdated || 0).getTime();
        default:
          return 0;
      }
    });

    return filtered;
  }, [agents, selectedCategory, searchQuery, selectedTags, showPremiumOnly, sortBy]);

  // Handle agent selection
  const handleAgentSelect = (agent: Agent) => {
    if (agentListScrollRef.current) {
      setLastScrollPosition(agentListScrollRef.current.scrollTop);
    }
    setSelectedAgent(agent);
    if (onAgentSelect) {
      onAgentSelect(agent);
    }
  };

  // Handle back to agent list
  const handleBackToList = () => {
    setSelectedAgent(null);
    // Restore scroll position after a brief delay
    setTimeout(() => {
      if (agentListScrollRef.current) {
        agentListScrollRef.current.scrollTop = lastScrollPosition;
      }
    }, 100);
  };

  // Handle agent list scroll
  const handleAgentListScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const target = event.target as HTMLDivElement;
    const scrollTop = target.scrollTop;
    const scrollHeight = target.scrollHeight;
    const clientHeight = target.clientHeight;
    
    const progress = scrollHeight > clientHeight ? (scrollTop / (scrollHeight - clientHeight)) * 100 : 0;
    setAgentListScrollProgress(progress);
    
    setIsAgentListScrolling(true);
    clearTimeout((window as any).scrollTimeout);
    (window as any).scrollTimeout = setTimeout(() => {
      setIsAgentListScrolling(false);
    }, 150);
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
    <div className={`min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 dark:from-slate-900 dark:to-slate-800 ${className}`}>
      {/* Professional Header */}
      <div className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-b border-slate-200/60 dark:border-slate-700/60 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {selectedAgent ? (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleBackToList}
                    className="hover:bg-slate-100 dark:hover:bg-slate-700/50 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Marketplace
                  </Button>
                  <Separator orientation="vertical" className="h-6" />
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl bg-gradient-to-br ${selectedAgent.gradient} text-white shadow-md`}>
                      {selectedAgent.icon}
                    </div>
                    <div>
                      <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{selectedAgent.name}</h1>
                      <p className="text-sm text-slate-600 dark:text-slate-400">{selectedAgent.category}</p>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-4">
                  <div className="p-2 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 text-white shadow-md">
                    <Zap className="h-5 w-5" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">AI Agent Marketplace</h1>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Discover and chat with specialized AI assistants</p>
                  </div>
                </div>
              )}
            </div>
            
            {!selectedAgent && stats && (
              <div className="hidden md:flex items-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 dark:bg-blue-500 rounded-full"></div>
                  <span className="text-slate-600 dark:text-slate-400">{stats.totalAgents} Agents</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-emerald-500 dark:bg-emerald-500 rounded-full"></div>
                  <span className="text-slate-600 dark:text-slate-400">{stats.activeChats} Active Chats</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-amber-500 dark:bg-amber-500 rounded-full"></div>
                  <span className="text-slate-600 dark:text-slate-400">{agents.filter(a => a.isPremium).length} Premium</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="flex gap-6 min-h-[calc(100vh-140px)]">
          {/* Left Panel - Agent Marketplace */}
          <div className={`${selectedAgent ? 'hidden lg:block lg:w-96' : 'w-full'} transition-all duration-300`}>
            <div className="h-full flex flex-col bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200/60 dark:border-slate-700/60 overflow-hidden">
              {/* Search and Filters */}
            {!selectedAgent && (
              <div className="p-6 space-y-6 border-b border-slate-200/60 dark:border-slate-700/60">
                {/* Search Bar */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500" />
                  <Input
                    placeholder="Search agents by name, description, or tags..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-slate-50/50 dark:bg-slate-700/50 border-slate-200/60 dark:border-slate-700/60 focus:bg-white dark:focus:bg-slate-800 focus:border-blue-300 dark:focus:border-blue-500 transition-all"
                  />
                </div>

                {/* Category Pills */}
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300">Categories</h4>
                  <div className="flex flex-wrap gap-2">
                    <Badge
                      variant={selectedCategory === 'all' ? 'default' : 'secondary'}
                      className={`cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-950/30 hover:border-blue-200 dark:hover:border-blue-800 transition-colors text-xs ${selectedCategory === 'all' ? 'bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800' : 'text-slate-600 dark:text-slate-400'}`}
                      onClick={() => setSelectedCategory('all')}
                    >
                      All
                    </Badge>
                    {agentCategories.map(category => (
                      <Badge
                        key={category.id}
                        variant={selectedCategory === category.id ? 'default' : 'secondary'}
                        className={`cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-950/30 hover:border-blue-200 dark:hover:border-blue-800 transition-colors text-xs ${selectedCategory === category.id ? 'bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800' : 'text-slate-600 dark:text-slate-400'}`}
                        onClick={() => setSelectedCategory(category.id)}
                      >
                        {category.name}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Filters and Controls */}
                <div className="flex flex-wrap gap-3 items-center justify-between">
                  <div className="flex gap-2">
                    <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                      <SelectTrigger className="w-40 bg-slate-50/50 dark:bg-slate-700/50 border-slate-200/60 dark:border-slate-700/60">
                        <SelectValue placeholder="Sort by" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="popularity">Most Popular</SelectItem>
                        <SelectItem value="rating">Highest Rated</SelectItem>
                        <SelectItem value="name">Name A-Z</SelectItem>
                        <SelectItem value="recent">Recently Updated</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <Button
                      variant={showPremiumOnly ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setShowPremiumOnly(!showPremiumOnly)}
                      className="px-3"
                    >
                      <Crown className="h-3 w-3 mr-1" />
                      Premium
                    </Button>
                  </div>

                  <div className="flex gap-1">
                    <Button
                      variant={viewMode === 'grid' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setViewMode('grid')}
                      className="px-2"
                    >
                      <Grid className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={viewMode === 'list' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setViewMode('list')}
                      className="px-2"
                    >
                      <List className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Popular Tags */}
                {popularTags.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300">Popular Tags</h4>
                    <div className="flex flex-wrap gap-2">
                      {popularTags.slice(0, 6).map(tag => (
                        <Badge
                          key={tag}
                          variant={selectedTags.includes(tag) ? "default" : "outline"}
                          className={`cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-950/30 hover:border-blue-200 dark:hover:border-blue-800 transition-colors text-xs ${selectedTags.includes(tag) ? 'bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800' : 'text-slate-600 dark:text-slate-400'}`}
                          onClick={() => toggleTag(tag)}
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Active Filters */}
                {(selectedCategory !== 'all' || searchQuery || selectedTags.length > 0 || showPremiumOnly) && (
                  <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
                    <span className="text-sm text-slate-600 dark:text-slate-400">
                      {filteredAndSortedAgents.length} agent{filteredAndSortedAgents.length !== 1 ? 's' : ''} found
                    </span>
                    <Button variant="ghost" size="sm" onClick={clearFilters} className="text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200">
                      Clear Filters
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* Agent List */}
            {!selectedAgent && (
              <div className="flex-1 overflow-hidden">
                <ScrollArea
                  ref={agentListScrollRef}
                  className="h-full"
                  onScroll={handleAgentListScroll}
                >
                  <div className="p-6">
                    {filteredAndSortedAgents.length === 0 ? (
                      <div className="text-center py-16">
                        <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                          <MessageCircle className="h-8 w-8 text-slate-400 dark:text-slate-500" />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">No agents found</h3>
                        <p className="text-slate-600 dark:text-slate-400 max-w-sm mx-auto">Try adjusting your search criteria or browse different categories.</p>
                        {(selectedCategory !== 'all' || searchQuery || selectedTags.length > 0 || showPremiumOnly) && (
                          <Button variant="outline" size="sm" onClick={clearFilters} className="mt-4">
                            Clear all filters
                          </Button>
                        )}
                      </div>
                    ) : (
                      <div className={viewMode === 'grid' ? 'grid grid-cols-1 gap-4' : 'space-y-3'}>
                        {filteredAndSortedAgents.map(agent => (
                          <ElegantAgentCard
                            key={agent.id}
                            agent={agent}
                            isSelected={false}
                            onSelect={() => handleAgentSelect(agent)}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </div>
              )}
            </div>
          </div>

          {/* Right Panel - Chat Interface */}
          {selectedAgent && (
            <div className="flex-1 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200/60 dark:border-slate-700/60 overflow-hidden">
              <div className="h-full flex flex-col">
                {/* Chat Header with Agent Info and Back Button */}
                <div className="flex items-center justify-between p-4 border-b border-slate-200/60 dark:border-slate-700/60 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700">
                  <div className="flex items-center gap-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleBackToList}
                      className="lg:hidden hover:bg-slate-200 dark:hover:bg-slate-600"
                    >
                      <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div className="text-2xl">{selectedAgent.icon}</div>
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-slate-100">{selectedAgent.name}</h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400">{selectedAgent.category}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {selectedAgent.isPremium && (
                      <Badge variant="secondary" className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0">
                        <Crown className="h-3 w-3 mr-1" />
                        Premium
                      </Badge>
                    )}
                    <div className="flex items-center gap-1 text-sm text-slate-600 dark:text-slate-400">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span>{selectedAgent.rating}</span>
                    </div>
                  </div>
                </div>
                
                {/* Enhanced Chat Interface */}
                <div className="flex-1 overflow-hidden">
                  <AgentSpecificChatInterface agent={selectedAgent} className="h-full" />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
