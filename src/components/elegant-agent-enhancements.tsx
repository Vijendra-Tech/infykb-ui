'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Crown, Star, TrendingUp, Users, Zap, Bot } from 'lucide-react';
import { Agent } from '@/types/agent-types';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

// Enhanced Agent Card with elegant animations and professional styling
export function ElegantAgentCard({ agent, isSelected, onSelect }: {
  agent: Agent;
  isSelected: boolean;
  onSelect: () => void;
}) {
  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      className="relative"
      transition={{ duration: 0.2, ease: "easeOut" }}
    >
      <Card 
        className={`cursor-pointer transition-all duration-300 overflow-hidden hover:shadow-lg hover:shadow-slate-200/50 ${
          isSelected 
            ? 'ring-2 ring-purple-500/50 bg-gradient-to-br from-purple-50/80 via-blue-50/60 to-white shadow-xl shadow-purple-200/30 border-purple-200/50' 
            : 'bg-gradient-to-br from-white via-slate-50/30 to-white border-slate-200/60 hover:border-slate-300/60 hover:bg-gradient-to-br hover:from-white hover:via-slate-50/50 hover:to-blue-50/20'
        }`}
        onClick={onSelect}
      >
        {/* Elegant background gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/20 to-slate-50/30 pointer-events-none" />
        
        {/* Premium glow effect for premium agents - simplified */}
        {agent.isPremium && (
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/10 via-orange-400/5 to-yellow-400/10 pointer-events-none opacity-50" />
        )}

        <CardContent className="p-4 relative z-10">
          <div className="flex items-start gap-3">
            {/* Agent Icon with enhanced styling */}
            <div 
              className={`text-2xl p-3 rounded-xl bg-gradient-to-br ${agent.gradient} text-white shadow-lg relative overflow-hidden transition-all duration-300 hover:shadow-xl`}
            >
              {/* Simplified shimmer effect - only on hover */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-500" />
              <span className="relative z-10">{agent.icon}</span>
            </div>
            
            <div className="flex-1 min-w-0">
              {/* Agent Name and Premium Badge */}
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-gray-900 truncate text-base">{agent.name}</h3>
                {agent.isPremium && (
                  <div className="relative">
                    <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs shadow-md">
                      <Crown className="h-2 w-2 mr-1" />
                      Premium
                    </Badge>
                    {/* Premium sparkle effect */}
                    <div
                      className="absolute -top-1 -right-1"
                    >
                      <Sparkles className="h-3 w-3 text-yellow-400" />
                    </div>
                  </div>
                )}
              </div>
              
              {/* Agent Description */}
              <p className="text-sm text-gray-600 line-clamp-2 mb-3 leading-relaxed">
                {agent.description}
              </p>
              
              {/* Enhanced Stats Row */}
              <div className="flex items-center justify-between text-xs mb-3">
                <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-yellow-50 text-yellow-700 border border-yellow-200/50">
                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium">{agent.rating.toFixed(1)}</span>
                </div>
                
                <div 
                  className="flex items-center gap-1 px-2 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200/50"
                >
                  <Users className="h-3 w-3" />
                  <span className="font-medium">{agent.totalChats.toLocaleString()}</span>
                </div>
                
                <div 
                  className="flex items-center gap-1 px-2 py-1 rounded-full bg-green-50 text-green-700 border border-green-200/50"
                >
                  <TrendingUp className="h-3 w-3" />
                  <span className="font-medium">{agent.popularity}%</span>
                </div>
              </div>
              
              {/* Enhanced Tags */}
              <div className="flex flex-wrap gap-1">
                {agent.tags.slice(0, 3).map((tag, index) => (
                  <Badge 
                    key={tag}
                    variant="secondary" 
                    className="text-xs bg-slate-100 text-slate-700 border border-slate-200/50 hover:bg-slate-200 transition-colors duration-200"
                  >
                    {tag}
                  </Badge>
                ))}
                {agent.tags.length > 3 && (
                  <Badge 
                    variant="secondary" 
                    className="text-xs bg-slate-100 text-slate-600 border border-slate-200/50"
                  >
                    +{agent.tags.length - 3}
                  </Badge>
                )}
              </div>
            </div>
          </div>
          
          {/* Selection Indicator */}
          {isSelected && (
            <motion.div
              className="absolute top-2 right-2"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
            >
              <div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center shadow-lg">
                <Zap className="h-3 w-3 text-white" />
              </div>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Enhanced Header Component with elegant styling
export function ElegantMarketplaceHeader({ agentCount }: { agentCount: number }) {
  return (
    <div className="text-center space-y-6 mb-8">
      {/* Floating Badge */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-50 via-blue-50 to-purple-50 rounded-full border border-purple-200/50 shadow-lg shadow-purple-100/50 backdrop-blur-sm"
      >
        <motion.div
          animate={{
            rotate: [0, 360],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "linear"
          }}
        >
          <Bot className="h-5 w-5 text-purple-600" />
        </motion.div>
        <span className="text-sm font-semibold text-purple-700 tracking-wide">AI Agent Marketplace</span>
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.7, 1, 0.7],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <Sparkles className="h-4 w-4 text-purple-500" />
        </motion.div>
      </motion.div>
      
      {/* Main Title with Gradient */}
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-purple-800 bg-clip-text text-transparent leading-tight"
      >
        Choose Your AI Assistant
      </motion.h1>
      
      {/* Subtitle */}
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.4 }}
        className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed"
      >
        Discover powerful AI agents specialized for different tasks. From GitHub management to sales automation, 
        find the perfect assistant for your workflow.
      </motion.p>

      {/* Stats with Animation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.6 }}
        className="flex items-center justify-center gap-8 mt-8"
      >
        <motion.div 
          className="text-center"
          whileHover={{ scale: 1.05 }}
        >
          <div className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            {agentCount}
          </div>
          <div className="text-sm text-gray-500 font-medium">Available Agents</div>
        </motion.div>
        
        <div className="w-px h-12 bg-gradient-to-b from-transparent via-gray-300 to-transparent" />
        
        <motion.div 
          className="text-center"
          whileHover={{ scale: 1.05 }}
        >
          <div className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
            24/7
          </div>
          <div className="text-sm text-gray-500 font-medium">Always Available</div>
        </motion.div>
        
        <div className="w-px h-12 bg-gradient-to-b from-transparent via-gray-300 to-transparent" />
        
        <motion.div 
          className="text-center"
          whileHover={{ scale: 1.05 }}
        >
          <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
            10+
          </div>
          <div className="text-sm text-gray-500 font-medium">Specializations</div>
        </motion.div>
      </motion.div>
    </div>
  );
}

// Enhanced Search Bar Component
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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="relative group"
    >
      {/* Search Icon with Animation */}
      <motion.div
        className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10"
        animate={{
          scale: searchQuery ? [1, 1.1, 1] : 1,
        }}
        transition={{
          duration: 0.3,
        }}
      >
        <Sparkles className={`h-5 w-5 transition-colors duration-300 ${
          searchQuery ? 'text-purple-500' : 'text-gray-400 group-hover:text-purple-400'
        }`} />
      </motion.div>
      
      {/* Enhanced Input */}
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-12 pr-4 py-4 text-base bg-white/80 backdrop-blur-sm border border-gray-200/60 rounded-2xl shadow-lg shadow-gray-100/50 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-300 transition-all duration-300 placeholder-gray-400 hover:shadow-xl hover:shadow-gray-200/60 hover:border-gray-300/60"
      />
      
      {/* Animated Border */}
      <motion.div
        className="absolute inset-0 rounded-2xl border-2 border-transparent bg-gradient-to-r from-purple-500/20 via-blue-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(147, 51, 234, 0.1), transparent)',
          backgroundSize: '200% 100%',
        }}
        animate={{
          backgroundPosition: ['0% 0%', '200% 0%'],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "linear"
        }}
      />
    </motion.div>
  );
}
