"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAnimation } from '@/components/animation-provider';
import { 
  Search, 
  Filter, 
  Clock, 
  ExternalLink, 
  Tag, 
  GitBranch, 
  Calendar,
  TrendingUp,
  Sparkles,
  X,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Circle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from '@/components/ui/popover';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { GitHubService, GitHubIssue, SimilaritySearchResult } from '@/services/github-service';
import { IngestedSearchResult, ingestedGitHubSearchService } from '@/services/ingested-github-search-service';



interface GitHubSimilaritySearchProps {
  onIssueSelect?: (result: SimilaritySearchResult) => void;
  onSearchResults?: (results: IngestedSearchResult[]) => void;
  className?: string;
}

export function GitHubSimilaritySearch({ onIssueSelect, onSearchResults, className }: GitHubSimilaritySearchProps) {
  const { getMotionProps } = useAnimation();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SimilaritySearchResult[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [trendingTerms, setTrendingTerms] = useState<Array<{ term: string; count: number }>>([]);
  const [filters, setFilters] = useState({
    state: 'all',
    repository: '',
    dateRange: 'all',
    labels: [] as string[]
  });

  const searchInputRef = useRef<HTMLInputElement>(null);
  const githubService = new GitHubService();

  // Load initial data
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      // Load trending terms
      const trending = await githubService.getTrendingSearchTerms();
      setTrendingTerms(trending);
    } catch (error) {
      console.error('Failed to load initial data:', error);
    }
  };

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (query.trim()) {
        handleSearch();
      } else {
        setResults([]);
        setShowSuggestions(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query, filters]);

  // Generate suggestions
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (query.trim() && query.length > 2) {
        generateSuggestions();
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 200);

    return () => clearTimeout(timeoutId);
  }, [query]);

  const handleSearch = async () => {
    if (!query.trim()) return;

    setIsLoading(true);
    setError(null);
    setShowSuggestions(false);

    try {
      // Use ingested data search service
      const ingestedResults = await ingestedGitHubSearchService.searchIngestedData(query, {
        limit: 50,
        minRelevance: 0.1,
        includeBody: true,
        includePullRequests: true,
        includeDiscussions: true
      });

      console.log('Ingested search results:', ingestedResults);

      // Convert ingested results to similarity search results format
      const searchResults: SimilaritySearchResult[] = ingestedResults.map(result => ({
        issue: {
          id: result.id,
          title: result.title,
          body: result.body,
          state: result.state,
          labels: result.labels,
          user: result.user,
          html_url: result.html_url,
          number: result.number,
          created_at: result.created_at,
          updated_at: result.updated_at,
          comments: result.comments,
          assignees: [],
          reactions: {
            total_count: 0,
            '+1': 0,
            '-1': 0,
            laugh: 0,
            hooray: 0,
            confused: 0,
            heart: 0,
            rocket: 0,
            eyes: 0
          },
          locked: false,
          pull_request: result.pull_request,
          relevance_score: result.relevance_score,
          search_vector: '',
          indexed_at: new Date().toISOString(),
          comment_count: result.comments,
          last_activity: result.updated_at,
          repository: result.repository || 'unknown'
        },
        score: result.relevance_score || 0,
        snippet: result.title
      }));

      setResults(searchResults);
      
      // Call the onSearchResults callback for graph visualization
      if (onSearchResults) {
        onSearchResults(ingestedResults);
      }
    } catch (error) {
      console.error('Search failed:', error);
      setError('Failed to search issues. Please try again.');
      setResults([]);
      
      // Call callback with empty results on error
      if (onSearchResults) {
        onSearchResults([]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const generateSuggestions = async () => {
    try {
      const suggestions = await githubService.generateSearchSuggestions(query);
      setSuggestions(suggestions);
      setShowSuggestions(suggestions.length > 0);
    } catch (error) {
      console.error('Failed to generate suggestions:', error);
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    setShowSuggestions(false);
    searchInputRef.current?.focus();
  };

  const handleTrendingClick = (term: string) => {
    setQuery(term);
    searchInputRef.current?.focus();
  };

  const clearSearch = () => {
    setQuery('');
    setResults([]);
    setSuggestions([]);
    setShowSuggestions(false);
    setError(null);
    searchInputRef.current?.focus();
  };

  const getStateIcon = (state: string) => {
    return state === 'open' ? (
      <Circle className="h-4 w-4 text-green-500" />
    ) : (
      <CheckCircle2 className="h-4 w-4 text-purple-500" />
    );
  };

  const getScoreColor = (score: number) => {
    if (score >= 0.8) return 'text-green-600 bg-green-50 border-green-200';
    if (score >= 0.6) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 30) return `${diffInDays}d ago`;
    const diffInMonths = Math.floor(diffInDays / 30);
    return `${diffInMonths}mo ago`;
  };

  return (
    <motion.div 
      className={`bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-lg ${className}`}
      {...getMotionProps('fade')}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <div className="p-8 space-y-8">
        {/* Enhanced Search Input */}
        <div className="relative">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
            <Input
              ref={searchInputRef}
              type="text"
              placeholder="Search for similar GitHub issues..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-12 pr-12 h-14 text-lg bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
            />
            {query && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearSearch}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Enhanced Search Suggestions */}
          <AnimatePresence>
            {showSuggestions && suggestions.length > 0 && (
              <motion.div 
                className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-600 shadow-xl backdrop-blur-sm z-50"
                {...getMotionProps('fade')}
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
              >
              <div className="p-4">
                <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Suggestions</h4>
                <div className="space-y-2">
                  {suggestions.map((suggestion, index) => (
                    <Button
                      key={index}
                      variant="ghost"
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="w-full justify-start h-10 px-3 text-left hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-700 dark:hover:text-blue-300 transition-all duration-200 rounded-lg"
                    >
                      <Sparkles className="h-4 w-4 mr-3 text-blue-500" />
                      <span className="text-sm">{suggestion}</span>
                    </Button>
                  ))}
                </div>
              </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Enhanced Filters and Trending */}
        <div className="flex flex-wrap gap-4">
          {/* Enhanced Filters */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="h-12 px-6 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all duration-200 rounded-xl">
                <Filter className="h-4 w-4 mr-3" />
                <span className="font-medium text-slate-700 dark:text-slate-300">Filters</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80" align="start">
              <div className="space-y-6">
                <h4 className="font-semibold text-slate-900 dark:text-slate-100">Search Filters</h4>
                
                {/* State Filter */}
                <div className="space-y-3">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Issue State</label>
                  <Select value={filters.state} onValueChange={(value) => setFilters(prev => ({ ...prev, state: value }))}>
                    <SelectTrigger className="h-10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Issues</SelectItem>
                      <SelectItem value="open">Open Issues</SelectItem>
                      <SelectItem value="closed">Closed Issues</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Date Range Filter */}
                <div className="space-y-3">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Date Range</label>
                  <Select value={filters.dateRange} onValueChange={(value) => setFilters(prev => ({ ...prev, dateRange: value }))}>
                    <SelectTrigger className="h-10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Time</SelectItem>
                      <SelectItem value="week">Past Week</SelectItem>
                      <SelectItem value="month">Past Month</SelectItem>
                      <SelectItem value="quarter">Past Quarter</SelectItem>
                      <SelectItem value="year">Past Year</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          {/* Enhanced Trending Terms */}
          {!query && trendingTerms.length > 0 && (
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="h-12 px-6 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all duration-200 rounded-xl">
                  <TrendingUp className="h-4 w-4 mr-3" />
                  <span className="font-medium text-slate-700 dark:text-slate-300">Trending</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80" align="start">
                <div className="space-y-4">
                  <h4 className="font-semibold text-slate-900 dark:text-slate-100">Trending Terms</h4>
                  <div className="space-y-2">
                    {trendingTerms.map((term, index) => (
                      <Button
                        key={index}
                        variant="ghost"
                        onClick={() => handleTrendingClick(term.term)}
                        className="w-full justify-between h-12 px-4 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-700 dark:hover:text-blue-300 transition-all duration-200 rounded-lg"
                      >
                        <span className="text-sm font-medium">{term.term}</span>
                        <Badge variant="secondary" className="h-6 px-3 text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full">
                          {term.count}
                        </Badge>
                      </Button>
                    ))}
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          )}
        </div>

        {/* Enhanced Results Section */}
        <motion.div 
          className="space-y-6"
          {...getMotionProps('fade')}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          {isLoading ? (
            <motion.div 
              className="flex flex-col items-center justify-center py-16"
              {...getMotionProps('fade')}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <Loader2 className="h-8 w-8 animate-spin text-blue-500 mb-4" />
              <span className="text-lg font-medium text-slate-600 dark:text-slate-400">
                Searching for similar issues...
              </span>
              <span className="text-sm text-slate-500 dark:text-slate-500 mt-2">
                This may take a moment
              </span>
            </motion.div>
          ) : results.length > 0 ? (
            <ScrollArea className="h-[600px]">
              <div className="space-y-4 pr-4">
                <AnimatePresence>
                  {results.map((result, index) => (
                    <motion.div
                      key={`${result.issue.id}-${index}`}
                      {...getMotionProps('slide')}
                      initial={{ opacity: 0, y: 20, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -20, scale: 0.95 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Card
                        className="cursor-pointer hover:shadow-lg transition-all duration-300 border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-600 bg-white dark:bg-slate-800 hover:bg-blue-50/50 dark:hover:bg-blue-900/10 group"
                        onClick={() => onIssueSelect?.(result)}
                      >
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        {/* Header */}
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            {getStateIcon(result.issue.state)}
                            <span className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
                              #{result.issue.number}
                            </span>
                            {query && (
                              <Badge 
                                variant="outline" 
                                className={`text-xs ${getScoreColor(result.score)}`}
                              >
                                {result.score.toFixed(1)}
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                            <Clock className="h-3 w-3" />
                            {formatTimeAgo(result.issue.created_at)}
                          </div>
                        </div>

                        {/* Title */}
                        <h4 className="text-sm font-medium text-slate-900 dark:text-slate-100 line-clamp-2">
                          {result.issue.title}
                        </h4>

                        {/* Snippet */}
                        <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
                          {result.snippet}
                        </p>

                        {/* Metadata */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <GitBranch className="h-3 w-3 text-slate-400" />
                            <span className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-24">
                              {result.issue.repository}
                            </span>
                          </div>
                          
                          {result.issue.labels.length > 0 && (
                            <div className="flex items-center gap-1">
                              <Tag className="h-3 w-3 text-slate-400" />
                              <div className="flex gap-1">
                                {result.issue.labels.slice(0, 2).map((label, idx) => (
                                  <Badge
                                    key={idx}
                                    variant="secondary"
                                    className="text-xs h-4 px-1"
                                    style={{ backgroundColor: `#${label.color}20` }}
                                  >
                                    {label.name}
                                  </Badge>
                                ))}
                                {result.issue.labels.length > 2 && (
                                  <Badge variant="secondary" className="text-xs h-4 px-1">
                                    +{result.issue.labels.length - 2}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Action */}
                        <div className="flex justify-end pt-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 px-3 text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open(result.issue.html_url, '_blank');
                            }}
                          >
                            <ExternalLink className="h-3 w-3 mr-1" />
                            View on GitHub
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </ScrollArea>
          ) : (
            <motion.div 
              className="text-center py-16"
              {...getMotionProps('fade')}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <AlertCircle className="h-8 w-8 text-slate-400 mx-auto mb-4" />
              <p className="text-lg font-medium text-slate-600 dark:text-slate-400">
                {query ? 'No issues found matching your search' : 'No issues available'}
              </p>
              {query && (
                <p className="text-sm text-slate-500 dark:text-slate-500 mt-2">
                  Try adjusting your search terms or filters
                </p>
              )}
            </motion.div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}
