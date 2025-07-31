import { db } from '@/lib/database';
import { GitHubIssue } from '@/lib/github-service';

export interface IngestedSearchOptions {
  limit?: number;
  minRelevance?: number;
  includeBody?: boolean;
  includePullRequests?: boolean;
  includeDiscussions?: boolean;
}

export interface IngestedSearchResult extends GitHubIssue {
  relevance_score: number;
  match_type: 'title' | 'body' | 'labels' | 'combined';
  repository?: string;
}

export class IngestedGitHubSearchService {
  /**
   * Search through ingested GitHub data (issues, PRs, discussions) stored in IndexedDB
   */
  async searchIngestedData(
    query: string, 
    options: IngestedSearchOptions = {}
  ): Promise<IngestedSearchResult[]> {
    const {
      limit = 10,
      minRelevance = 0.3,
      includeBody = true,
      includePullRequests = false,
      includeDiscussions = false
    } = options;

    const searchTerms = this.extractSearchTerms(query);
    const results: IngestedSearchResult[] = [];

    try {
      // Search GitHub Issues
      const issues = await db.githubIssues.toArray();
      const issueResults = this.searchInCollection(issues, searchTerms, 'issue');
      results.push(...issueResults);

      // Search GitHub Pull Requests if requested
      if (includePullRequests) {
        const pullRequests = await db.githubPullRequests.toArray();
        const prResults = this.searchInCollection(pullRequests, searchTerms, 'pull_request');
        results.push(...prResults);
      }

      // Search GitHub Discussions if requested
      if (includeDiscussions) {
        const discussions = await db.githubDiscussions.toArray();
        const discussionResults = this.searchInCollection(discussions, searchTerms, 'discussion');
        results.push(...discussionResults);
      }

      // Filter by minimum relevance and sort by relevance score
      const filteredResults = results
        .filter(result => result.relevance_score >= minRelevance)
        .sort((a, b) => b.relevance_score - a.relevance_score)
        .slice(0, limit);

      console.log(`Ingested data search for "${query}":`, {
        totalFound: results.length,
        afterFiltering: filteredResults.length,
        searchTerms
      });

      return filteredResults;

    } catch (error) {
      console.error('Error searching ingested GitHub data:', error);
      return [];
    }
  }

  /**
   * Search within a collection of GitHub items (issues, PRs, or discussions)
   */
  private searchInCollection(
    items: any[], 
    searchTerms: string[], 
    itemType: 'issue' | 'pull_request' | 'discussion'
  ): IngestedSearchResult[] {
    const results: IngestedSearchResult[] = [];

    for (const item of items) {
      const relevanceScore = this.calculateRelevanceScore(item, searchTerms);
      
      if (relevanceScore > 0) {
        // Convert to GitHubIssue format for consistency
        const searchResult: IngestedSearchResult = {
          id: item.githubId,
          number: item.number,
          title: item.title,
          body: item.body || '',
          state: item.state,
          html_url: item.html_url || item.url, // discussions use 'url'
          repository: item.repository,
          user: item.user || item.author, // discussions use 'author'
          labels: item.labels || [],
          assignees: item.assignees || [],
          created_at: item.created_at,
          updated_at: item.updated_at,
          comments: item.comments || 0,
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
          }, // Default reactions structure
          locked: false, // Default value
          relevance_score: relevanceScore,
          match_type: this.getMatchType(item, searchTerms)
        };

        results.push(searchResult);
      }
    }

    return results;
  }

  /**
   * Calculate relevance score based on title, body, and labels matches
   */
  private calculateRelevanceScore(item: any, searchTerms: string[]): number {
    let score = 0;
    const title = (item.title || '').toLowerCase();
    const body = (item.body || '').toLowerCase();
    const labels = (item.labels || []).map((label: any) => 
      typeof label === 'string' ? label.toLowerCase() : (label.name || '').toLowerCase()
    );

    for (const term of searchTerms) {
      const termLower = term.toLowerCase();
      
      // Title matches (highest weight)
      if (title.includes(termLower)) {
        score += 0.4;
        // Exact title match gets bonus
        if (title === termLower) {
          score += 0.3;
        }
      }

      // Body matches (medium weight)
      if (body.includes(termLower)) {
        score += 0.2;
        // Count multiple occurrences (up to 3)
        const occurrences = Math.min((body.match(new RegExp(termLower, 'g')) || []).length, 3);
        score += (occurrences - 1) * 0.05;
      }

      // Label matches (medium-high weight)
      for (const label of labels) {
        if (label.includes(termLower)) {
          score += 0.3;
        }
      }
    }

    // Normalize score to 0-1 range
    return Math.min(score, 1.0);
  }

  /**
   * Determine the primary match type for the result
   */
  private getMatchType(item: any, searchTerms: string[]): 'title' | 'body' | 'labels' | 'combined' {
    const title = (item.title || '').toLowerCase();
    const body = (item.body || '').toLowerCase();
    const labels = (item.labels || []).map((label: any) => 
      typeof label === 'string' ? label.toLowerCase() : (label.name || '').toLowerCase()
    );

    let titleMatch = false;
    let bodyMatch = false;
    let labelMatch = false;

    for (const term of searchTerms) {
      const termLower = term.toLowerCase();
      
      if (title.includes(termLower)) titleMatch = true;
      if (body.includes(termLower)) bodyMatch = true;
      if (labels.some((label: string | string[]) => label.includes(termLower))) labelMatch = true;
    }

    const matchCount = [titleMatch, bodyMatch, labelMatch].filter(Boolean).length;
    
    if (matchCount > 1) return 'combined';
    if (titleMatch) return 'title';
    if (bodyMatch) return 'body';
    if (labelMatch) return 'labels';
    
    return 'combined';
  }

  /**
   * Extract search terms from query string
   */
  private extractSearchTerms(query: string): string[] {
    // Remove common stop words and extract meaningful terms
    const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'can', 'cannot', 'how', 'what', 'when', 'where', 'why', 'which', 'who', 'whom']);
    
    return query
      .toLowerCase()
      .replace(/[^\w\s-]/g, ' ') // Replace punctuation with spaces
      .split(/\s+/)
      .filter(term => term.length > 2 && !stopWords.has(term))
      .slice(0, 10); // Limit to 10 terms for performance
  }

  /**
   * Get statistics about ingested data
   */
  async getIngestedDataStats(): Promise<{
    totalIssues: number;
    totalPullRequests: number;
    totalDiscussions: number;
    repositories: string[];
  }> {
    try {
      const [issues, pullRequests, discussions] = await Promise.all([
        db.githubIssues.toArray(),
        db.githubPullRequests.toArray(),
        db.githubDiscussions.toArray()
      ]);

      const repositories = new Set<string>();
      [...issues, ...pullRequests, ...discussions].forEach(item => {
        if (item.repository) repositories.add(item.repository);
      });

      return {
        totalIssues: issues.length,
        totalPullRequests: pullRequests.length,
        totalDiscussions: discussions.length,
        repositories: Array.from(repositories)
      };
    } catch (error) {
      console.error('Error getting ingested data stats:', error);
      return {
        totalIssues: 0,
        totalPullRequests: 0,
        totalDiscussions: 0,
        repositories: []
      };
    }
  }
}

// Export singleton instance
export const ingestedGitHubSearchService = new IngestedGitHubSearchService();
