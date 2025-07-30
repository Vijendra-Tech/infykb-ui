import { githubDataService } from './github-data-service';
import type { GitHubIssue } from '@/lib/database';

export interface SimilaritySearchResult {
  issue: GitHubIssue;
  score: number;
  matchedFields: string[];
  snippet: string;
}

export interface SearchFilters {
  repository?: string;
  state?: 'open' | 'closed' | 'all';
  labels?: string[];
  dateRange?: {
    from: Date;
    to: Date;
  };
  sourceId?: string;
}

export class GitHubSimilaritySearch {
  private stopWords = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must', 'can', 'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them'
  ]);

  /**
   * Perform similarity search on GitHub issues with advanced scoring
   */
  async searchSimilar(
    query: string,
    filters: SearchFilters = {},
    limit: number = 20
  ): Promise<SimilaritySearchResult[]> {
    try {
      // Get all issues or filtered by source
      const allIssues = await githubDataService.searchIssues('', filters.sourceId);
      
      if (!query.trim()) {
        return this.applyFiltersAndLimit(allIssues, filters, limit)
          .map(issue => ({
            issue,
            score: 0,
            matchedFields: [],
            snippet: this.generateSnippet(issue.body || issue.title, '')
          }));
      }

      // Process query
      const queryTerms = this.processQuery(query);
      const results: SimilaritySearchResult[] = [];

      for (const issue of allIssues) {
        const score = this.calculateSimilarityScore(issue, queryTerms);
        
        if (score > 0) {
          const matchedFields = this.getMatchedFields(issue, queryTerms);
          const snippet = this.generateSnippet(issue.body || issue.title, query);
          
          results.push({
            issue,
            score,
            matchedFields,
            snippet
          });
        }
      }

      // Sort by score (descending) and apply filters
      const sortedResults = results.sort((a, b) => b.score - a.score);
      const filteredResults = this.applyFilters(sortedResults, filters);
      
      return filteredResults.slice(0, limit);
    } catch (error) {
      console.error('Similarity search failed:', error);
      throw error;
    }
  }

  /**
   * Get search suggestions based on partial query
   */
  async getSearchSuggestions(partialQuery: string, limit: number = 5): Promise<string[]> {
    try {
      const allIssues = await githubDataService.searchIssues('');
      const suggestions = new Set<string>();
      
      const queryLower = partialQuery.toLowerCase();
      
      for (const issue of allIssues) {
        // Extract keywords from title and body
        const text = `${issue.title} ${issue.body || ''}`.toLowerCase();
        const words = text.split(/\s+/).filter(word => 
          word.length > 3 && 
          !this.stopWords.has(word) &&
          word.includes(queryLower)
        );
        
        words.forEach(word => suggestions.add(word));
        
        if (suggestions.size >= limit * 2) break;
      }
      
      return Array.from(suggestions).slice(0, limit);
    } catch (error) {
      console.error('Failed to get search suggestions:', error);
      return [];
    }
  }

  /**
   * Get trending search terms based on issue frequency
   */
  async getTrendingTerms(limit: number = 10): Promise<Array<{ term: string; count: number }>> {
    try {
      const allIssues = await githubDataService.searchIssues('');
      const termCounts = new Map<string, number>();
      
      for (const issue of allIssues) {
        const text = `${issue.title} ${issue.body || ''}`.toLowerCase();
        const words = text.split(/\s+/).filter(word => 
          word.length > 3 && 
          !this.stopWords.has(word) &&
          /^[a-zA-Z]+$/.test(word)
        );
        
        words.forEach(word => {
          termCounts.set(word, (termCounts.get(word) || 0) + 1);
        });
      }
      
      return Array.from(termCounts.entries())
        .map(([term, count]) => ({ term, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, limit);
    } catch (error) {
      console.error('Failed to get trending terms:', error);
      return [];
    }
  }

  private processQuery(query: string): string[] {
    return query
      .toLowerCase()
      .split(/\s+/)
      .filter(term => term.length > 0 && !this.stopWords.has(term))
      .map(term => term.replace(/[^\w]/g, ''));
  }

  private calculateSimilarityScore(issue: GitHubIssue, queryTerms: string[]): number {
    let score = 0;
    const titleText = issue.title.toLowerCase();
    const bodyText = (issue.body || '').toLowerCase();
    const labelsText = issue.labels.map(l => l.name).join(' ').toLowerCase();
    
    for (const term of queryTerms) {
      // Title matches (highest weight)
      if (titleText.includes(term)) {
        score += 10;
        // Exact word match bonus
        if (titleText.split(/\s+/).includes(term)) {
          score += 5;
        }
      }
      
      // Body matches
      if (bodyText.includes(term)) {
        score += 3;
        // Count frequency in body
        const matches = (bodyText.match(new RegExp(term, 'g')) || []).length;
        score += Math.min(matches * 0.5, 3);
      }
      
      // Label matches
      if (labelsText.includes(term)) {
        score += 7;
      }
      
      // Repository name match
      if (issue.repository.toLowerCase().includes(term)) {
        score += 2;
      }
    }
    
    // Boost score for recent issues
    const daysSinceCreated = (Date.now() - new Date(issue.created_at).getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceCreated < 30) {
      score *= 1.2;
    } else if (daysSinceCreated < 90) {
      score *= 1.1;
    }
    
    // Boost score for open issues
    if (issue.state === 'open') {
      score *= 1.15;
    }
    
    return score;
  }

  private getMatchedFields(issue: GitHubIssue, queryTerms: string[]): string[] {
    const matchedFields: string[] = [];
    const titleText = issue.title.toLowerCase();
    const bodyText = (issue.body || '').toLowerCase();
    const labelsText = issue.labels.map(l => l.name).join(' ').toLowerCase();
    
    for (const term of queryTerms) {
      if (titleText.includes(term) && !matchedFields.includes('title')) {
        matchedFields.push('title');
      }
      if (bodyText.includes(term) && !matchedFields.includes('body')) {
        matchedFields.push('body');
      }
      if (labelsText.includes(term) && !matchedFields.includes('labels')) {
        matchedFields.push('labels');
      }
    }
    
    return matchedFields;
  }

  private generateSnippet(text: string, query: string, maxLength: number = 150): string {
    if (!query.trim()) {
      return text.slice(0, maxLength) + (text.length > maxLength ? '...' : '');
    }
    
    const queryTerms = this.processQuery(query);
    const textLower = text.toLowerCase();
    
    // Find the first occurrence of any query term
    let bestIndex = -1;
    
    for (const term of queryTerms) {
      const index = textLower.indexOf(term);
      if (index !== -1 && (bestIndex === -1 || index < bestIndex)) {
        bestIndex = index;
      }
    }
    
    if (bestIndex === -1) {
      return text.slice(0, maxLength) + (text.length > maxLength ? '...' : '');
    }
    
    // Create snippet around the matched term
    const start = Math.max(0, bestIndex - 50);
    const end = Math.min(text.length, start + maxLength);
    let snippet = text.slice(start, end);
    
    if (start > 0) snippet = '...' + snippet;
    if (end < text.length) snippet = snippet + '...';
    
    return snippet;
  }

  private applyFilters(results: SimilaritySearchResult[], filters: SearchFilters): SimilaritySearchResult[] {
    return results.filter(result => {
      const issue = result.issue;
      
      // Repository filter
      if (filters.repository && issue.repository !== filters.repository) {
        return false;
      }
      
      // State filter
      if (filters.state && filters.state !== 'all' && issue.state !== filters.state) {
        return false;
      }
      
      // Labels filter
      if (filters.labels && filters.labels.length > 0) {
        const issueLabels = issue.labels.map(l => l.name);
        const hasMatchingLabel = filters.labels.some(label => issueLabels.includes(label));
        if (!hasMatchingLabel) {
          return false;
        }
      }
      
      // Date range filter
      if (filters.dateRange) {
        const issueDate = new Date(issue.created_at);
        if (issueDate < filters.dateRange.from || issueDate > filters.dateRange.to) {
          return false;
        }
      }
      
      return true;
    });
  }

  private applyFiltersAndLimit(issues: GitHubIssue[], filters: SearchFilters, limit: number): GitHubIssue[] {
    let filtered = issues;
    
    // Repository filter
    if (filters.repository) {
      filtered = filtered.filter(issue => issue.repository === filters.repository);
    }
    
    // State filter
    if (filters.state && filters.state !== 'all') {
      filtered = filtered.filter(issue => issue.state === filters.state);
    }
    
    // Labels filter
    if (filters.labels && filters.labels.length > 0) {
      filtered = filtered.filter(issue => {
        const issueLabels = issue.labels.map(l => l.name);
        return filters.labels!.some(label => issueLabels.includes(label));
      });
    }
    
    // Date range filter
    if (filters.dateRange) {
      filtered = filtered.filter(issue => {
        const issueDate = new Date(issue.created_at);
        return issueDate >= filters.dateRange!.from && issueDate <= filters.dateRange!.to;
      });
    }
    
    // Sort by creation date (newest first) for non-query results
    filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    
    return filtered.slice(0, limit);
  }
}

export const githubSimilaritySearch = new GitHubSimilaritySearch();
