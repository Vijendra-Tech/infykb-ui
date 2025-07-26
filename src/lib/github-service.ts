import Dexie, { Table } from 'dexie';

export interface GitHubIssue {
  id: number;
  number: number;
  title: string;
  body: string;
  state: 'open' | 'closed';
  labels: Array<{
    id: number;
    name: string;
    color: string;
    description?: string;
  }>;
  user: {
    login: string;
    id: number;
    avatar_url: string;
    html_url: string;
  };
  assignees: Array<{
    login: string;
    id: number;
    avatar_url: string;
  }>;
  milestone?: {
    title: string;
    number: number;
    state: string;
  };
  created_at: string;
  updated_at: string;
  closed_at?: string;
  html_url: string;
  comments: number;
  reactions: {
    total_count: number;
    '+1': number;
    '-1': number;
    laugh: number;
    hooray: number;
    confused: number;
    heart: number;
    rocket: number;
    eyes: number;
  };
  locked: boolean;
  pull_request?: {
    url: string;
    html_url: string;
  };
  // Enhanced fields for search and relevance
  relevance_score?: number;
  search_vector?: string;
  indexed_at?: string;
  comment_count?: number;
  last_activity?: string;
}

export interface GitHubComment {
  id: number;
  user: {
    login: string;
    avatar_url: string;
  };
  created_at: string;
  updated_at: string;
  body: string;
  html_url: string;
  issue_number: number;
}

export interface GitHubRepository {
  id: number;
  name: string;
  full_name: string;
  description: string;
  html_url: string;
  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;
  language: string;
  topics: string[];
  updated_at: string;
}

interface SearchCacheEntry {
  query: string;
  results: number[];
  timestamp: string;
  expires_at: string;
}

interface SyncMetadata {
  key: string;
  last_sync: string;
  total_issues: number;
  total_comments: number;
  sync_status: 'idle' | 'syncing' | 'error';
  error_message?: string;
}

class GitHubDB extends Dexie {
  issues!: Table<GitHubIssue>;
  comments!: Table<GitHubComment>;
  repositories!: Table<GitHubRepository>;
  search_cache!: Table<SearchCacheEntry>;
  sync_metadata!: Table<SyncMetadata>;

  constructor() {
    super('GitHubCache');
    this.version(1).stores({
      issues: 'id, number, state, updated_at, relevance_score, search_vector',
      comments: 'id, issue_number, created_at',
      repositories: 'id, full_name, updated_at',
      search_cache: 'query, expires_at',
      sync_metadata: 'key'
    });
  }
}

export class GitHubService {
  private db: GitHubDB;
  private readonly API_BASE = 'https://api.github.com';
  private readonly CACHE_DURATION = 1000 * 60 * 30; // 30 minutes
  
  // Default repository - can be configured
  public repository = 'microsoft/TypeScript';
  public apiKey?: string;

  constructor(repository?: string, apiKey?: string) {
    this.db = new GitHubDB();
    if (repository) this.repository = repository;
    if (apiKey) this.apiKey = apiKey;
  }

  /**
   * Initialize the IndexedDB database
   */
  async initDB(): Promise<void> {
    try {
      await this.db.open();
    } catch (error) {
      console.error('Failed to initialize GitHub database:', error);
      throw error;
    }
  }

  /**
   * Get API headers with optional authentication
   */
  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'InfyKB-AgenticChat/1.0',
    };

    if (this.apiKey) {
      headers['Authorization'] = `token ${this.apiKey}`;
    }

    return headers;
  }

  /**
   * Make authenticated GitHub API request
   */
  private async apiRequest<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${this.API_BASE}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        ...this.getHeaders(),
        ...options?.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(`GitHub API Error: ${response.status} - ${error.message || response.statusText}`);
    }

    return response.json();
  }

  /**
   * Create search vector for issue (simple keyword extraction)
   */
  private createSearchVector(issue: GitHubIssue): string {
    const text = `${issue.title} ${issue.body} ${issue.labels.map(l => l.name).join(' ')}`;
    return text.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 2)
      .join(' ');
  }

  /**
   * Calculate relevance score based on search query
   */
  private calculateRelevance(issue: GitHubIssue, query: string): number {
    const searchTerms = query.toLowerCase().split(/\s+/);
    const searchVector = issue.search_vector || this.createSearchVector(issue);
    
    let score = 0;
    let maxScore = 0;

    searchTerms.forEach(term => {
      maxScore += 1;
      
      // Title match (higher weight)
      if (issue.title.toLowerCase().includes(term)) {
        score += 0.5;
      }
      
      // Body match
      if (issue.body.toLowerCase().includes(term)) {
        score += 0.3;
      }
      
      // Label match
      if (issue.labels.some(label => label.name.toLowerCase().includes(term))) {
        score += 0.2;
      }
      
      // Search vector match
      if (searchVector.includes(term)) {
        score += 0.1;
      }
    });

    return maxScore > 0 ? score / maxScore : 0;
  }

  /**
   * Sync issues from GitHub API to IndexedDB
   */
  async syncIssues(options: {
    state?: 'open' | 'closed' | 'all';
    labels?: string;
    sort?: 'created' | 'updated' | 'comments';
    direction?: 'asc' | 'desc';
    per_page?: number;
    page?: number;
    onProgress?: (current: number, total: number) => void;
  } = {}): Promise<{ synced: number; total: number }> {
    await this.initDB();

    const {
      state = 'all',
      sort = 'updated',
      direction = 'desc',
      per_page = 100,
      page = 1,
      onProgress
    } = options;

    try {
      // Update sync status
      await this.db.sync_metadata.put({
        key: 'sync_status',
        last_sync: new Date().toISOString(),
        total_issues: 0,
        total_comments: 0,
        sync_status: 'syncing'
      });

      const params = new URLSearchParams({
        state,
        sort,
        direction,
        per_page: per_page.toString(),
        page: page.toString(),
      });

      if (options.labels) {
        params.append('labels', options.labels);
      }

      const endpoint = `/repos/${this.repository}/issues?${params}`;
      const issues: GitHubIssue[] = await this.apiRequest(endpoint);

      let syncedCount = 0;
      const total = issues.length;

      for (const issue of issues) {
        // Skip pull requests (they appear in issues API)
        if (issue.pull_request) continue;

        // Enhance issue with search capabilities
        const enhancedIssue: GitHubIssue = {
          ...issue,
          search_vector: this.createSearchVector(issue),
          indexed_at: new Date().toISOString(),
          comment_count: issue.comments,
          last_activity: issue.updated_at,
        };

        await this.db.issues.put(enhancedIssue);
        syncedCount++;

        if (onProgress) {
          onProgress(syncedCount, total);
        }
      }

      // Update sync metadata
      await this.db.sync_metadata.put({
        key: 'sync_status',
        last_sync: new Date().toISOString(),
        total_issues: syncedCount,
        total_comments: 0,
        sync_status: 'idle'
      });

      return { synced: syncedCount, total };
    } catch (error) {
      // Update sync status with error
      await this.db.sync_metadata.put({
        key: 'sync_status',
        last_sync: new Date().toISOString(),
        total_issues: 0,
        total_comments: 0,
        sync_status: 'error',
        error_message: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  /**
   * Search issues locally with relevance scoring
   */
  async searchIssues(query: string, options: {
    limit?: number;
    state?: 'open' | 'closed' | 'all';
    minRelevance?: number;
    useCache?: boolean;
  } = {}): Promise<GitHubIssue[]> {
    await this.initDB();

    const {
      limit = 10,
      state = 'all',
      minRelevance = 0.1,
      useCache = true
    } = options;

    // Check cache first
    if (useCache) {
      const cached = await this.db.search_cache.get(query);
      if (cached && new Date(cached.expires_at) > new Date()) {
        const issues = await Promise.all(
          cached.results.map(id => this.db.issues.get(id))
        );
        return issues.filter(Boolean) as GitHubIssue[];
      }
    }

    // Get all issues
    let issues: GitHubIssue[];
    if (state === 'all') {
      issues = await this.db.issues.toArray();
    } else {
      issues = await this.db.issues.where('state').equals(state).toArray();
    }

    // Calculate relevance and filter
    const scoredIssues = issues
      .map(issue => ({
        ...issue,
        relevance_score: this.calculateRelevance(issue, query)
      }))
      .filter(issue => issue.relevance_score >= minRelevance)
      .sort((a, b) => (b.relevance_score || 0) - (a.relevance_score || 0))
      .slice(0, limit);

    // Cache results
    if (useCache && scoredIssues.length > 0) {
      await this.db.search_cache.put({
        query,
        results: scoredIssues.map(issue => issue.id),
        timestamp: new Date().toISOString(),
        expires_at: new Date(Date.now() + this.CACHE_DURATION).toISOString()
      });
    }

    return scoredIssues;
  }

  /**
   * Get issue by number
   */
  async getIssue(issueNumber: number): Promise<GitHubIssue | null> {
    await this.initDB();

    // Try local first
    const localIssue = await this.db.issues.where('number').equals(issueNumber).first();
    if (localIssue) return localIssue;

    // Fetch from API
    try {
      const issue: GitHubIssue = await this.apiRequest(`/repos/${this.repository}/issues/${issueNumber}`);
      
      // Skip if it's a pull request
      if (issue.pull_request) return null;

      // Enhance and store
      const enhancedIssue: GitHubIssue = {
        ...issue,
        search_vector: this.createSearchVector(issue),
        indexed_at: new Date().toISOString(),
        comment_count: issue.comments,
        last_activity: issue.updated_at,
      };

      await this.db.issues.put(enhancedIssue);
      return enhancedIssue;
    } catch (error) {
      console.error('Failed to fetch issue:', error);
      return null;
    }
  }

  /**
   * Get comments for an issue
   */
  async getIssueComments(issueNumber: number): Promise<GitHubComment[]> {
    await this.initDB();

    // Try local first
    const localComments = await this.db.comments.where('issue_number').equals(issueNumber).toArray();
    if (localComments.length > 0) return localComments;

    // Fetch from API
    try {
      const comments: GitHubComment[] = await this.apiRequest(
        `/repos/${this.repository}/issues/${issueNumber}/comments`
      );

      // Store comments
      for (const comment of comments) {
        await this.db.comments.put({
          ...comment,
          issue_number: issueNumber
        });
      }

      return comments;
    } catch (error) {
      console.error('Failed to fetch comments:', error);
      return [];
    }
  }

  /**
   * Create a new issue
   */
  async createIssue(issue: {
    title: string;
    body: string;
    labels?: string[];
    assignees?: string[];
    milestone?: number;
  }): Promise<GitHubIssue> {
    const newIssue: GitHubIssue = await this.apiRequest(`/repos/${this.repository}/issues`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(issue),
    });

    // Store locally
    await this.initDB();
    const enhancedIssue: GitHubIssue = {
      ...newIssue,
      search_vector: this.createSearchVector(newIssue),
      indexed_at: new Date().toISOString(),
      comment_count: 0,
      last_activity: newIssue.created_at,
    };

    await this.db.issues.put(enhancedIssue);

    return newIssue;
  }

  /**
   * Get sync status and statistics
   */
  async getSyncStatus(): Promise<{
    status: 'idle' | 'syncing' | 'error';
    lastSync?: string;
    totalIssues: number;
    totalComments: number;
    errorMessage?: string;
  }> {
    await this.initDB();

    const metadata = await this.db.sync_metadata.get('sync_status');
    const totalIssues = await this.db.issues.count();
    const totalComments = await this.db.comments.count();

    return {
      status: metadata?.sync_status || 'idle',
      lastSync: metadata?.last_sync,
      totalIssues,
      totalComments,
      errorMessage: metadata?.error_message,
    };
  }

  /**
   * Clear all cached data
   */
  async clearCache(): Promise<void> {
    await this.initDB();

    await this.db.issues.clear();
    await this.db.comments.clear();
    await this.db.search_cache.clear();
    await this.db.sync_metadata.clear();
  }

  /**
   * Get repository information
   */
  async getRepository(): Promise<GitHubRepository> {
    await this.initDB();
    
    try {
      const repo: GitHubRepository = await this.apiRequest(`/repos/${this.repository}`);
      
      await this.db.repositories.put(repo);
      
      return repo;
    } catch (error) {
      console.error('Failed to fetch repository:', error);
      throw error;
    }
  }

  /**
   * Get suggested labels for issue creation
   */
  async getLabels(): Promise<Array<{ name: string; color: string; description?: string }>> {
    try {
      const labels: Array<{ name: string; color: string; description?: string }> = await this.apiRequest(`/repos/${this.repository}/labels`);
      return labels;
    } catch (error) {
      console.error('Failed to fetch labels:', error);
      return [];
    }
  }
}

// Export singleton instance
export const githubService = new GitHubService();

// Export utility functions
export const formatIssueDate = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
  return `${Math.floor(diffDays / 365)} years ago`;
};

export const getIssueStateColor = (state: string): string => {
  switch (state) {
    case 'open': return 'text-green-600 bg-green-50 border-green-200';
    case 'closed': return 'text-purple-600 bg-purple-50 border-purple-200';
    default: return 'text-gray-600 bg-gray-50 border-gray-200';
  }
};

export const getLabelColor = (color: string): { bg: string; text: string } => {
  const hexColor = color.startsWith('#') ? color : `#${color}`;
  
  // Convert hex to RGB
  const r = parseInt(hexColor.slice(1, 3), 16);
  const g = parseInt(hexColor.slice(3, 5), 16);
  const b = parseInt(hexColor.slice(5, 7), 16);
  
  // Calculate brightness
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  
  return {
    bg: `${hexColor}20`,
    text: brightness > 128 ? hexColor : '#ffffff'
  };
};
