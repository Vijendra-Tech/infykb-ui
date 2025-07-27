'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion } from 'framer-motion';
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
import { AgentChatInterface } from './agent-chat-interface';
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
    <div className={`page-container bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20 ${className}`}>
      <div className="flex full-height-minus-header">
        {/* Left Panel - Agent Marketplace */}
        <div className={`${selectedAgent ? 'hidden md:block md:w-1/3 lg:w-2/5' : 'w-full'} transition-all duration-300 border-r border-gray-200 bg-white/50 backdrop-blur-sm`}>
          <div className="h-full flex flex-col">
            {/* Enhanced Header */}
            <div className="p-6 border-b border-gray-200/50 bg-gradient-to-r from-white via-slate-50/30 to-white">
              {!selectedAgent && (
                <ElegantMarketplaceHeader agentCount={filteredAndSortedAgents.length} />
              )}
              
              {selectedAgent && (
                <div className="flex items-center gap-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleBackToList}
                    className="hover:bg-gray-100"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Agents
                  </Button>
                  <div className="flex items-center gap-2">
                    <div className={`text-lg p-1.5 rounded-lg bg-gradient-to-br ${selectedAgent.gradient} text-white shadow-sm`}>
                      {selectedAgent.icon}
                    </div>
                    <span className="font-semibold text-gray-900">{selectedAgent.name}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Search and Filters */}
            {!selectedAgent && (
              <div className="p-6 space-y-4 border-b border-gray-200/50 bg-white/30">
                <ElegantSearchBar
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                  placeholder="Search agents by name, description, or tags..."
                />

                {/* Filters Row */}
                <div className="flex flex-wrap gap-3">
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="w-40 bg-white/70 border-gray-200/50">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {agentCategories.map(category => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                    <SelectTrigger className="w-36 bg-white/70 border-gray-200/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="popularity">Most Popular</SelectItem>
                      <SelectItem value="rating">Highest Rated</SelectItem>
                      <SelectItem value="name">Name A-Z</SelectItem>
                      <SelectItem value="recent">Recently Updated</SelectItem>
                    </SelectContent>
                  </Select>

                  <div className="flex gap-2">
                    <Button
                      variant={viewMode === 'grid' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setViewMode('grid')}
                      className="px-3"
                    >
                      <Grid className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={viewMode === 'list' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setViewMode('list')}
                      className="px-3"
                    >
                      <List className="h-4 w-4" />
                    </Button>
                  </div>

                  {(selectedCategory !== 'all' || searchQuery || selectedTags.length > 0 || showPremiumOnly) && (
                    <Button variant="ghost" size="sm" onClick={clearFilters} className="text-gray-600">
                      Clear Filters
                    </Button>
                  )}
                </div>

                {/* Popular Tags */}
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-gray-700">Popular Tags</h4>
                  <div className="flex flex-wrap gap-2">
                    {popularTags.slice(0, 8).map(tag => (
                      <Badge
                        key={tag}
                        variant={selectedTags.includes(tag) ? "default" : "secondary"}
                        className="cursor-pointer hover:bg-blue-100 transition-colors"
                        onClick={() => toggleTag(tag)}
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Agent List */}
            {!selectedAgent && (
              <div className="flex-1 relative">
                <ScrollArea
                  ref={agentListScrollRef}
                  className="h-full"
                  onScroll={handleAgentListScroll}
                >
                  <div className="p-6">
                    {filteredAndSortedAgents.length === 0 ? (
                      <div className="text-center py-12">
                        <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No agents found</h3>
                        <p className="text-gray-600">Try adjusting your search criteria or filters.</p>
                      </div>
                    ) : (
                      <div className={viewMode === 'grid' ? 'grid grid-cols-1 lg:grid-cols-2 gap-4' : 'space-y-3'}>
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

                {/* Scroll Progress Indicator */}
                <motion.div
                  className="absolute bottom-4 right-4 w-2 h-16 bg-gray-200/50 rounded-full overflow-hidden backdrop-blur-sm"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: isAgentListScrolling ? 1 : 0.3 }}
                  transition={{ duration: 0.2 }}
                >
                  <motion.div
                    className="w-full bg-gradient-to-t from-blue-500 to-purple-500 rounded-full"
                    style={{ height: `${agentListScrollProgress}%` }}
                    transition={{ duration: 0.1 }}
                  />
                </motion.div>
              </div>
            )}
          </div>
        </div>

        {/* Right Panel - Chat Interface */}
        {selectedAgent && (
          <div className="flex-1 bg-gradient-to-br from-white via-slate-50/50 to-blue-50/30">
            <AgentChatInterface
              agentId={selectedAgent.id}
              onBack={handleBackToList}
              className="h-full"
            />
          </div>
        )}
      </div>
    </div>
  );
}
