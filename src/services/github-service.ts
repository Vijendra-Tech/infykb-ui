export interface GitHubIssue {
  id: number;
  number: number;
  title: string;
  body: string;
  state: 'open' | 'closed';
  created_at: string;
  updated_at: string;
  html_url: string;
  user: {
    login: string;
    avatar_url: string;
  };
  labels: Array<{
    name: string;
    color: string;
  }>;
  assignees: Array<{
    login: string;
    avatar_url: string;
  }>;
  repository: string;
}

export interface GitHubPullRequest {
  id: number;
  number: number;
  title: string;
  body: string | null;
  state: 'open' | 'closed' | 'merged';
  created_at: string;
  updated_at: string;
  merged_at: string | null;
  user: {
    login: string;
    avatar_url: string;
  };
  html_url: string;
  head: {
    ref: string;
    sha: string;
  };
  base: {
    ref: string;
    sha: string;
  };
}

export interface GitHubDiscussion {
  id: string;
  number: number;
  title: string;
  body: string;
  state: 'open' | 'closed';
  created_at: string;
  updated_at: string;
  author: {
    login: string;
    avatarUrl: string;
  };
  url: string;
  category: {
    name: string;
    description: string;
  };
}

export interface GitHubSettings {
  repository: string;
  accessToken?: string;
  syncIssues: boolean;
  syncPRs: boolean;
  syncDiscussions: boolean;
}

export interface GitHubIngestionResult {
  issues: GitHubIssue[];
  pullRequests: GitHubPullRequest[];
  discussions: GitHubDiscussion[];
  totalCount: number;
  errors: string[];
}

export interface GitHubSearchOptions {
  state?: 'open' | 'closed';
  repository?: string;
  labels?: string[];
  dateRange?: string;
}

export interface SimilaritySearchResult {
  issue: GitHubIssue;
  score: number;
  snippet: string;
}

import { traceHttpCall, traceApiCall } from '../lib/browser-telemetry';

export class GitHubService {
  private baseUrl = 'https://api.github.com';
  
  private getHeaders(accessToken?: string): HeadersInit {
    const headers: HeadersInit = {
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'InfyKB-DataIngestion/1.0'
    };
    
    if (accessToken) {
      headers['Authorization'] = `token ${accessToken}`;
    }
    
    return headers;
  }

  private parseRepositoryUrl(url: URL): { owner: string; repo: string } | null {
    try {
      // Handle various GitHub URL formats
      const fullUrl = url.toString();
      const pathname = url.pathname;
      
      // Pattern for full GitHub URLs
      const githubPattern = /github\.com\/([^\/]+)\/([^\/]+)(?:\.git)?(?:\/.*)?$/;
      // Pattern for owner/repo format
      const shortPattern = /^\/([^\/]+)\/([^\/]+)(?:\.git)?(?:\/.*)?$/;
      
      let match = null;
      
      // Try matching against full URL first
      match = fullUrl.match(githubPattern);
      if (match) {
        return {
          owner: match[1],
          repo: match[2].replace('.git', '')
        };
      }
      
      // Try matching against pathname for owner/repo format
      match = pathname.match(shortPattern);
      if (match) {
        return {
          owner: match[1],
          repo: match[2].replace('.git', '')
        };
      }
      
      // If no match found, throw error
      throw new Error(`Invalid GitHub repository URL format: ${fullUrl}`);
    } catch (error) {
      console.error('Error parsing repository URL:', error);
      return null;
    }
  }

  async testConnection(repositoryUrl: string, accessToken?: string): Promise<{ success: boolean; error?: string }> {
    return await traceApiCall(
      'GitHub Connection Test',
      async () => {
        try {
          const repoInfo = this.parseRepositoryUrl(new URL(repositoryUrl));
          if (!repoInfo) {
            return { success: false, error: 'Invalid repository URL format' };
          }

          const apiUrl = `${this.baseUrl}/repos/${repoInfo.owner}/${repoInfo.repo}`;
          const response = await traceHttpCall(
            'GitHub Repository Info',
            async () => await fetch(apiUrl, {
              headers: this.getHeaders(accessToken)
            }),
            {
              method: 'GET',
              url: apiUrl,
              metadata: {
                repository: repositoryUrl,
                owner: repoInfo.owner,
                repo: repoInfo.repo,
                hasAccessToken: !!accessToken
              },
              tags: {
                operation: 'connection-test',
                source: 'github',
                component: 'github-service'
              }
            }
          );

          if (response.status === 404) {
            return { success: false, error: 'Repository not found or not accessible' };
          }

          if (response.status === 401) {
            return { success: false, error: 'Invalid access token or insufficient permissions' };
          }

          if (!response.ok) {
            return { success: false, error: `GitHub API error: ${response.status} ${response.statusText}` };
          }

          return { success: true };
        } catch (error) {
          console.error('GitHub connection test failed:', error);
          return { success: false, error: error instanceof Error ? error.message : 'Connection test failed' };
        }
      },
      {
        metadata: {
          repository: repositoryUrl,
          hasAccessToken: !!accessToken,
          operation: 'connection-test'
        },
        tags: {
          operation: 'connection-test',
          source: 'github',
          component: 'github-service'
        }
      }
    );
  }

  async fetchIssues(
    repositoryUrl: string, 
    accessToken?: string, 
    options: { state?: 'open' | 'closed' | 'all'; per_page?: number; page?: number } = {}
  ): Promise<GitHubIssue[]> {
    return await traceApiCall(
      'GitHub Fetch Issues',
      async () => {
        try {
          const repoInfo = this.parseRepositoryUrl(new URL(repositoryUrl));
          if (!repoInfo) {
            throw new Error('Invalid repository URL format');
          }

          const params = new URLSearchParams({
            state: options.state || 'all',
            per_page: (options.per_page || 100).toString(),
            page: (options.page || 1).toString()
          });

          const apiUrl = `${this.baseUrl}/repos/${repoInfo.owner}/${repoInfo.repo}/issues?${params}`;
          const response = await traceHttpCall(
            'GitHub Issues API',
            async () => await fetch(apiUrl, {
              headers: this.getHeaders(accessToken)
            }),
            {
              method: 'GET',
              url: apiUrl,
              metadata: {
                repository: repositoryUrl,
                owner: repoInfo.owner,
                repo: repoInfo.repo,
                state: options.state || 'all',
                perPage: options.per_page || 100,
                page: options.page || 1,
                hasAccessToken: !!accessToken
              },
              tags: {
                operation: 'fetch-issues',
                source: 'github',
                component: 'github-service'
              }
            }
          );

          if (!response.ok) {
            throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
          }

          const issues = await response.json();
          const filteredIssues = issues.filter((issue: any) => !issue.pull_request).map((issue: any) => ({
            ...issue,
            repository: `${repoInfo.owner}/${repoInfo.repo}`
          }));

          console.log(`✅ Fetched ${filteredIssues.length} issues from ${repoInfo.owner}/${repoInfo.repo}`);
          return filteredIssues;
        } catch (error) {
          console.error('Failed to fetch GitHub issues:', error);
          throw error;
        }
      },
      {
        metadata: {
          repository: repositoryUrl,
          options,
          hasAccessToken: !!accessToken,
          operation: 'fetch-issues'
        },
        tags: {
          operation: 'fetch-issues',
          source: 'github',
          component: 'github-service'
        }
      }
    );
  }

  async fetchPullRequests(
    repositoryUrl: string, 
    accessToken?: string, 
    options: { state?: 'open' | 'closed' | 'all'; per_page?: number; page?: number } = {}
  ): Promise<GitHubPullRequest[]> {
    return await traceApiCall(
      'GitHub Fetch Pull Requests',
      async () => {
        try {
          const repoInfo = this.parseRepositoryUrl(new URL(repositoryUrl));
          if (!repoInfo) {
            throw new Error('Invalid repository URL format');
          }

          const params = new URLSearchParams({
            state: options.state || 'all',
            per_page: (options.per_page || 100).toString(),
            page: (options.page || 1).toString()
          });

          const apiUrl = `${this.baseUrl}/repos/${repoInfo.owner}/${repoInfo.repo}/pulls?${params}`;
          const response = await traceHttpCall(
            'GitHub Pull Requests API',
            async () => await fetch(apiUrl, {
              headers: this.getHeaders(accessToken)
            }),
            {
              method: 'GET',
              url: apiUrl,
              metadata: {
                repository: repositoryUrl,
                owner: repoInfo.owner,
                repo: repoInfo.repo,
                state: options.state || 'all',
                perPage: options.per_page || 100,
                page: options.page || 1,
                hasAccessToken: !!accessToken
              },
              tags: {
                operation: 'fetch-pull-requests',
                source: 'github',
                component: 'github-service'
              }
            }
          );

          if (!response.ok) {
            throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
          }

          const pullRequests = await response.json();
          console.log(`✅ Fetched ${pullRequests.length} pull requests from ${repoInfo.owner}/${repoInfo.repo}`);
          return pullRequests;
        } catch (error) {
          console.error('Failed to fetch GitHub pull requests:', error);
          throw error;
        }
      },
      {
        metadata: {
          repository: repositoryUrl,
          options,
          hasAccessToken: !!accessToken,
          operation: 'fetch-pull-requests'
        },
        tags: {
          operation: 'fetch-pull-requests',
          source: 'github',
          component: 'github-service'
        }
      }
    );
  }

  async fetchDiscussions(
    repositoryUrl: string, 
    accessToken?: string, 
    options: { per_page?: number; page?: number } = {}
  ): Promise<GitHubDiscussion[]> {
    const repoInfo = this.parseRepositoryUrl(new URL(repositoryUrl));
    if (!repoInfo) {
      throw new Error('Invalid repository URL format');
    }

    // GitHub Discussions require GraphQL API
    const query = `
      query($owner: String!, $repo: String!, $first: Int!, $after: String) {
        repository(owner: $owner, name: $repo) {
          discussions(first: $first, after: $after) {
            nodes {
              id
              number
              title
              body
              state
              createdAt
              updatedAt
              author {
                login
                avatarUrl
              }
              url
              category {
                name
                description
              }
            }
            pageInfo {
              hasNextPage
              endCursor
            }
          }
        }
      }
    `;

    const variables = {
      owner: repoInfo.owner,
      repo: repoInfo.repo,
      first: options.per_page || 100,
      after: null
    };

    const response = await fetch('https://api.github.com/graphql', {
      method: 'POST',
      headers: {
        ...this.getHeaders(accessToken),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ query, variables })
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch discussions: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    
    if (result.errors) {
      throw new Error(`GraphQL errors: ${result.errors.map((e: any) => e.message).join(', ')}`);
    }

    return result.data?.repository?.discussions?.nodes || [];
  }

  async ingestGitHubData(settings: GitHubSettings): Promise<GitHubIngestionResult> {
    const result: GitHubIngestionResult = {
      issues: [],
      pullRequests: [],
      discussions: [],
      totalCount: 0,
      errors: []
    };

    try {
      // Test connection first
      const connectionTest = await this.testConnection(settings.repository, settings.accessToken);
      if (!connectionTest.success) {
        result.errors.push(connectionTest.error || 'Connection test failed');
        return result;
      }

      // Fetch issues if enabled
      if (settings.syncIssues) {
        try {
          const issues = await this.fetchIssues(settings.repository, settings.accessToken);
          result.issues = issues;
          result.totalCount += issues.length;
        } catch (error) {
          result.errors.push(`Issues fetch failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      // Fetch pull requests if enabled
      if (settings.syncPRs) {
        try {
          const pullRequests = await this.fetchPullRequests(settings.repository, settings.accessToken);
          result.pullRequests = pullRequests;
          result.totalCount += pullRequests.length;
        } catch (error) {
          result.errors.push(`Pull requests fetch failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      // Fetch discussions if enabled
      if (settings.syncDiscussions) {
        try {
          const discussions = await this.fetchDiscussions(settings.repository, settings.accessToken);
          result.discussions = discussions;
          result.totalCount += discussions.length;
        } catch (error) {
          result.errors.push(`Discussions fetch failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

    } catch (error) {
      result.errors.push(`Ingestion failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    return result;
  }

  async searchSimilarIssues(query: string, options: GitHubSearchOptions = {}): Promise<SimilaritySearchResult[]> {
    try {
      // For now, we'll search using GitHub's search API
      // You can enhance this with local similarity search if you have stored issues
      const searchQuery = this.buildSearchQuery(query, options);
      
      const response = await fetch(
        `${this.baseUrl}/search/issues?q=${encodeURIComponent(searchQuery)}&sort=updated&order=desc&per_page=50`,
        {
          headers: this.getHeaders()
        }
      );

      if (!response.ok) {
        throw new Error(`GitHub search failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      return data.items.map((item: any) => ({
        issue: {
          id: item.id,
          number: item.number,
          title: item.title,
          body: item.body || '',
          state: item.state,
          created_at: item.created_at,
          updated_at: item.updated_at,
          html_url: item.html_url,
          user: item.user,
          labels: item.labels || [],
          assignees: item.assignees || [],
          repository: item.repository_url?.split('/').slice(-2).join('/') || ''
        },
        score: this.calculateSimilarityScore(query, item),
        snippet: this.generateSnippet(item.body || item.title, query)
      })).sort((a: SimilaritySearchResult, b: SimilaritySearchResult) => b.score - a.score);

    } catch (error) {
      console.error('Error searching similar issues:', error);
      return [];
    }
  }

  private buildSearchQuery(query: string, options: GitHubSearchOptions): string {
    let searchQuery = query;
    
    // Add repository filter if specified
    if (options.repository) {
      searchQuery += ` repo:${options.repository}`;
    }
    
    // Add state filter if specified
    if (options.state) {
      searchQuery += ` state:${options.state}`;
    }
    
    // Add labels filter if specified
    if (options.labels && options.labels.length > 0) {
      options.labels.forEach(label => {
        searchQuery += ` label:"${label}"`;
      });
    }
    
    // Add date range filter if specified
    if (options.dateRange && options.dateRange !== 'all') {
      const dateFilter = this.getDateFilter(options.dateRange);
      if (dateFilter) {
        searchQuery += ` ${dateFilter}`;
      }
    }
    
    // Ensure we're only searching issues (not PRs)
    searchQuery += ' type:issue';
    
    return searchQuery;
  }
  
  private getDateFilter(dateRange: string): string {
    const now = new Date();
    let date: Date;
    
    switch (dateRange) {
      case 'week':
        date = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        date = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case 'year':
        date = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        return '';
    }
    
    return `created:>=${date.toISOString().split('T')[0]}`;
  }
  
  private calculateSimilarityScore(query: string, item: any): number {
    let score = 0;
    const queryLower = query.toLowerCase();
    const titleLower = (item.title || '').toLowerCase();
    const bodyLower = (item.body || '').toLowerCase();
    
    // Title exact match gets highest score
    if (titleLower.includes(queryLower)) {
      score += 10;
    }
    
    // Body content match
    if (bodyLower.includes(queryLower)) {
      score += 5;
    }
    
    // Label match
    if (item.labels && item.labels.some((label: any) => 
      label.name.toLowerCase().includes(queryLower))) {
      score += 7;
    }
    
    // Recency boost (more recent issues get higher score)
    const daysSinceUpdate = (Date.now() - new Date(item.updated_at).getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceUpdate < 30) {
      score += 2;
    } else if (daysSinceUpdate < 90) {
      score += 1;
    }
    
    // Open issues get slight boost
    if (item.state === 'open') {
      score += 1;
    }
    
    return score;
  }
  
  private generateSnippet(text: string, query: string, maxLength: number = 200): string {
    if (!text) return '';
    
    const queryLower = query.toLowerCase();
    const textLower = text.toLowerCase();
    const queryIndex = textLower.indexOf(queryLower);
    
    if (queryIndex === -1) {
      // If query not found, return beginning of text
      return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
    }
    
    // Extract snippet around the query match
    const start = Math.max(0, queryIndex - 50);
    const end = Math.min(text.length, start + maxLength);
    let snippet = text.substring(start, end);
    
    if (start > 0) snippet = '...' + snippet;
    if (end < text.length) snippet = snippet + '...';
    
    return snippet;
  }

  async generateSearchSuggestions(query: string): Promise<string[]> {
    try {
      // For now, return some basic suggestions based on common GitHub issue patterns
      // In a real implementation, you might want to use stored issue data or GitHub's API
      const suggestions: string[] = [];
      
      if (query.length < 2) return suggestions;
      
      const commonPatterns = [
        'bug',
        'feature request',
        'documentation',
        'enhancement',
        'help wanted',
        'good first issue',
        'typescript',
        'react',
        'performance',
        'security',
        'api',
        'ui',
        'ux',
        'test',
        'build',
        'deploy'
      ];
      
      // Filter patterns that match the query
      const matchingPatterns = commonPatterns.filter(pattern => 
        pattern.toLowerCase().includes(query.toLowerCase())
      );
      
      // Add query variations
      suggestions.push(
        ...matchingPatterns,
        `${query} bug`,
        `${query} feature`,
        `${query} issue`,
        `${query} error`,
        `${query} problem`
      );
      
      // Remove duplicates and limit to 5 suggestions
      return [...new Set(suggestions)].slice(0, 5);
    } catch (error) {
      console.error('Error generating search suggestions:', error);
      return [];
    }
  }

  async getTrendingSearchTerms(): Promise<Array<{ term: string; count: number }>> {
    try {
      // For now, return some mock trending terms
      // In a real implementation, you might analyze recent search patterns or GitHub trends
      return [
        { term: 'typescript', count: 245 },
        { term: 'react', count: 189 },
        { term: 'bug', count: 156 },
        { term: 'performance', count: 134 },
        { term: 'feature request', count: 123 },
        { term: 'documentation', count: 98 },
        { term: 'api', count: 87 },
        { term: 'security', count: 76 },
        { term: 'ui', count: 65 },
        { term: 'test', count: 54 }
      ];
    } catch (error) {
      console.error('Error getting trending search terms:', error);
      return [];
    }
  }

  // Helper method to get rate limit information
  private async makeRequest(url: string, options: RequestInit = {}): Promise<Response | null> {
    try {
      const response = await fetch(url, options);

      if (response.ok) {
        return response;
      }
    } catch (error) {
      console.error('Failed to make request:', error);
    }
    return null;
  }

  private async getRateLimit(accessToken?: string): Promise<unknown> {
    try {
      const response = await this.makeRequest(`${this.baseUrl}/rate_limit`, {
        headers: this.getHeaders(accessToken)
      });

      if (response) {
        return await response.json();
      }
    } catch (error) {
      console.error('Failed to fetch rate limit:', error);
    }
    return null;
  }
}

export const githubService = new GitHubService();
