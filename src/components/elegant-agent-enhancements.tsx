'use client';

import React from 'react';
import { Crown, Star, TrendingUp, Users, Bot, Search } from 'lucide-react';
import { Agent } from '@/types/agent-types';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

// Professional Agent Card with clean, minimal styling
export function ElegantAgentCard({ agent, isSelected, onSelect }: {
  agent: Agent;
  isSelected: boolean;
  onSelect: () => void;
}) {
  return (
    <Card 
      className={`cursor-pointer transition-colors duration-200 border ${
        isSelected 
          ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800' 
          : 'bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 hover:border-gray-300 dark:hover:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-700/50'
      }`}
      onClick={onSelect}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {/* Agent Icon with clean styling */}
          <div 
            className={`text-xl p-2.5 rounded-lg bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-300 border border-gray-200 dark:border-slate-600`}
          >
            <span>{agent.icon}</span>
          </div>
          
          <div className="flex-1 min-w-0">
            {/* Agent Name and Premium Badge */}
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-gray-900 dark:text-slate-100 truncate text-base">{agent.name}</h3>
              {agent.isPremium && (
                <Badge className="bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 text-xs border border-amber-200 dark:border-amber-700">
                  <Crown className="h-2 w-2 mr-1" />
                  Premium
                </Badge>
              )}
            </div>
            
            {/* Agent Description */}
            <p className="text-sm text-gray-600 dark:text-slate-400 line-clamp-2 mb-3 leading-relaxed">
              {agent.description}
            </p>
            
            {/* Clean Stats Row */}
            <div className="flex items-center justify-between text-xs mb-3">
              <div className="flex items-center gap-1 px-2 py-1 rounded bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-300">
                <Star className="h-3 w-3" />
                <span className="font-medium">{agent.rating.toFixed(1)}</span>
              </div>
              
              <div className="flex items-center gap-1 px-2 py-1 rounded bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-300">
                <Users className="h-3 w-3" />
                <span className="font-medium">{agent.totalChats.toLocaleString()}</span>
              </div>
              
              <div className="flex items-center gap-1 px-2 py-1 rounded bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-300">
                <TrendingUp className="h-3 w-3" />
                <span className="font-medium">{agent.popularity}%</span>
              </div>
            </div>
            
            {/* Clean Tags */}
            <div className="flex flex-wrap gap-1">
              {agent.tags.slice(0, 3).map((tag, index) => (
                <Badge 
                  key={tag}
                  variant="secondary" 
                  className="text-xs bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-300 border border-gray-200 dark:border-slate-600"
                >
                  {tag}
                </Badge>
              ))}
              {agent.tags.length > 3 && (
                <Badge 
                  variant="secondary" 
                  className="text-xs bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-400 border border-gray-200 dark:border-slate-600"
                >
                  +{agent.tags.length - 3}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Professional Header Component with clean styling
export function ElegantMarketplaceHeader({ agentCount }: { agentCount: number }) {
  return (
    <div className="text-center space-y-6 mb-8">
      {/* Clean Badge */}
      <div className="inline-flex items-center gap-2 px-6 py-3 bg-gray-50 dark:bg-slate-800 rounded-full border border-gray-200 dark:border-slate-700">
        <Bot className="h-5 w-5 text-gray-600 dark:text-slate-400" />
        <span className="text-sm font-semibold text-gray-700 dark:text-slate-300 tracking-wide">AI Agent Marketplace</span>
      </div>
      
      {/* Main Title */}
      <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-slate-100 leading-tight">
        Choose Your AI Assistant
      </h1>
      
      {/* Subtitle */}
      <p className="text-lg text-gray-600 dark:text-slate-400 max-w-3xl mx-auto leading-relaxed">
        Discover powerful AI agents specialized for different tasks. From GitHub management to sales automation, 
        find the perfect assistant for your workflow.
      </p>

      {/* Clean Stats */}
      <div className="flex items-center justify-center gap-8 mt-8">
        <div className="text-center">
          <div className="text-3xl font-bold text-gray-900 dark:text-slate-100">
            {agentCount}
          </div>
          <div className="text-sm text-gray-500 dark:text-slate-400 font-medium">Available Agents</div>
        </div>
        
        <div className="w-px h-12 bg-gray-300 dark:bg-slate-600" />
        
        <div className="text-center">
          <div className="text-3xl font-bold text-gray-900 dark:text-slate-100">
            24/7
          </div>
          <div className="text-sm text-gray-500 dark:text-slate-400 font-medium">Always Available</div>
        </div>
        
        <div className="w-px h-12 bg-gray-300 dark:bg-slate-600" />
        
        <div className="text-center">
          <div className="text-3xl font-bold text-gray-900 dark:text-slate-100">
            10+
          </div>
          <div className="text-sm text-gray-500 dark:text-slate-400 font-medium">Specializations</div>
        </div>
      </div>
    </div>
  );
}

// Professional Search Bar Component
export function ElegantSearchBar({ 
  searchQuery, 
  onSearchChange, 
  placeholder = "Search agents by name, capabilities, or tags..." 
}: {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="relative">
      {/* Search Icon */}
      <div className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10">
        <Search className="h-5 w-5 text-gray-400 dark:text-slate-500" />
      </div>
      
      {/* Clean Input */}
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-12 pr-4 py-4 text-base bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors placeholder-gray-400 dark:placeholder-slate-500 text-gray-900 dark:text-slate-100"
      />
    </div>
  );
}
