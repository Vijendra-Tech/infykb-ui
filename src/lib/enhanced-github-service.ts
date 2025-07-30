import { ReactNode } from 'react';
import { GitHubIssue, GitHubService } from './github-service';

export interface MultiRepoSearchResult {
  title: ReactNode;
  issue: GitHubIssue;
  repository: string;
  relevanceScore: number;
  matchType: 'title' | 'body' | 'comments' | 'labels';
  matchedText: string;
}

export interface RepositoryConfig {
  owner: string;
  name: string;
  fullName: string;
  apiKey?: string;
  priority: number; // Higher priority repos appear first
  enabled: boolean;
}

export interface SearchOptions {
  query: string;
  repositories?: string[]; // If not provided, searches all enabled repos
  includeBody: boolean;
  includeComments: boolean;
  state?: 'open' | 'closed' | 'all';
  limit?: number;
  minRelevance?: number;
}

export class EnhancedGitHubService {
  private services: Map<string, GitHubService> = new Map();
  private repositories: RepositoryConfig[] = [
    {
      owner: 'microsoft',
      name: 'TypeScript',
      fullName: 'microsoft/TypeScript',
      priority: 10,
      enabled: true
    },
    {
      owner: 'facebook',
      name: 'react',
      fullName: 'facebook/react',
      priority: 9,
      enabled: true
    },
    {
      owner: 'nodejs',
      name: 'node',
      fullName: 'nodejs/node',
      priority: 8,
      enabled: true
    },
    {
      owner: 'vercel',
      name: 'next.js',
      fullName: 'vercel/next.js',
      priority: 7,
      enabled: true
    },
    {
      owner: 'vitejs',
      name: 'vite',
      fullName: 'vitejs/vite',
      priority: 6,
      enabled: true
    },
    {
      owner: 'webpack',
      name: 'webpack',
      fullName: 'webpack/webpack',
      priority: 5,
      enabled: true
    }
  ];

  constructor() {
    this.initializeServices();
  }

  private initializeServices(): void {
    this.repositories.forEach(repo => {
      if (repo.enabled) {
        const service = new GitHubService(repo.fullName, repo.apiKey);
        this.services.set(repo.fullName, service);
      }
    });
  }

  /**
   * Add or update repository configuration
   */
  addRepository(config: RepositoryConfig): void {
    const existingIndex = this.repositories.findIndex(r => r.fullName === config.fullName);
    
    if (existingIndex >= 0) {
      this.repositories[existingIndex] = config;
    } else {
      this.repositories.push(config);
    }

    if (config.enabled) {
      const service = new GitHubService(config.fullName, config.apiKey);
      this.services.set(config.fullName, service);
    } else {
      this.services.delete(config.fullName);
    }
  }

  /**
   * Get all configured repositories
   */
  getRepositories(): RepositoryConfig[] {
    return [...this.repositories].sort((a, b) => b.priority - a.priority);
  }

  /**
   * Enhanced search across multiple repositories with message content analysis
   */
  async searchAcrossRepositories(options: SearchOptions): Promise<MultiRepoSearchResult[]> {
    const {
      query,
      repositories,
      includeBody = true,
      includeComments = false,
      state = 'all',
      limit = 50,
      minRelevance = 0.3
    } = options;

    const targetRepos = repositories || 
      this.repositories.filter(r => r.enabled).map(r => r.fullName);

    const searchPromises = targetRepos.map(async (repoName) => {
      const service = this.services.get(repoName);
      if (!service) return [];

      try {
        // Search issues in this repository
        const issues = await service.searchIssues(query, {
          state,
          limit: Math.ceil(limit / targetRepos.length),
          minRelevance: minRelevance * 0.8 // Lower threshold for individual repos
        });

        // Enhanced relevance scoring with message content analysis
        const results: MultiRepoSearchResult[] = [];

        for (const issue of issues) {
          const relevanceData = this.calculateEnhancedRelevance(issue, query, {
            includeBody,
            includeComments
          });

          if (relevanceData.score >= minRelevance) {
            results.push({
              title: issue.title,
              issue,
              repository: repoName,
              relevanceScore: relevanceData.score,
              matchType: relevanceData.matchType,
              matchedText: relevanceData.matchedText
            });
          }
        }

        return results;
      } catch (error) {
        console.error(`Error searching repository ${repoName}:`, error);
        return [];
      }
    });

    const allResults = (await Promise.all(searchPromises)).flat();

    // Sort by relevance score and repository priority
    return allResults
      .sort((a, b) => {
        const repoA = this.repositories.find(r => r.fullName === a.repository);
        const repoB = this.repositories.find(r => r.fullName === b.repository);
        
        const priorityA = repoA?.priority || 0;
        const priorityB = repoB?.priority || 0;
        
        // First sort by relevance, then by repository priority
        if (Math.abs(a.relevanceScore - b.relevanceScore) < 0.1) {
          return priorityB - priorityA;
        }
        return b.relevanceScore - a.relevanceScore;
      })
      .slice(0, limit);
  }

  /**
   * Calculate enhanced relevance score with message content analysis
   */
  private calculateEnhancedRelevance(
    issue: GitHubIssue,
    query: string,
    options: { includeBody: boolean; includeComments: boolean }
  ): { score: number; matchType: MultiRepoSearchResult['matchType']; matchedText: string } {
    const queryLower = query.toLowerCase();
    const queryWords = queryLower.split(/\s+/).filter(word => word.length > 2);
    
    let bestScore = 0;
    let bestMatchType: MultiRepoSearchResult['matchType'] = 'title';
    let bestMatchedText = '';

    // Title matching (highest weight)
    const titleLower = issue.title.toLowerCase();
    const titleScore = this.calculateTextRelevance(titleLower, queryWords);
    if (titleScore > bestScore) {
      bestScore = titleScore * 1.0; // Full weight for title
      bestMatchType = 'title';
      bestMatchedText = this.extractMatchedText(issue.title, queryWords);
    }

    // Body matching (medium weight)
    if (options.includeBody && issue.body) {
      const bodyLower = issue.body.toLowerCase();
      const bodyScore = this.calculateTextRelevance(bodyLower, queryWords);
      const weightedBodyScore = bodyScore * 0.7;
      
      if (weightedBodyScore > bestScore) {
        bestScore = weightedBodyScore;
        bestMatchType = 'body';
        bestMatchedText = this.extractMatchedText(issue.body, queryWords);
      }
    }

    // Labels matching (medium weight)
    const labelsText = issue.labels.map(l => l.name).join(' ').toLowerCase();
    const labelsScore = this.calculateTextRelevance(labelsText, queryWords);
    const weightedLabelsScore = labelsScore * 0.6;
    
    if (weightedLabelsScore > bestScore) {
      bestScore = weightedLabelsScore;
      bestMatchType = 'labels';
      bestMatchedText = issue.labels.map(l => l.name).join(', ');
    }

    // Boost score for recent activity
    const daysSinceUpdate = (Date.now() - new Date(issue.updated_at).getTime()) / (1000 * 60 * 60 * 24);
    const recencyBoost = Math.max(0, 1 - daysSinceUpdate / 365) * 0.1;
    
    // Boost score for open issues
    const stateBoost = issue.state === 'open' ? 0.1 : 0;
    
    // Boost score for issues with reactions
    const reactionBoost = Math.min(issue.reactions.total_count / 10, 0.1);

    const finalScore = Math.min(bestScore + recencyBoost + stateBoost + reactionBoost, 1.0);

    return {
      score: finalScore,
      matchType: bestMatchType,
      matchedText: bestMatchedText
    };
  }

  /**
   * Calculate text relevance score using multiple techniques
   */
  private calculateTextRelevance(text: string, queryWords: string[]): number {
    if (!text || queryWords.length === 0) return 0;

    let score = 0;
    const textWords = text.split(/\s+/);
    
    for (const queryWord of queryWords) {
      // Exact word match
      if (textWords.some(word => word === queryWord)) {
        score += 0.3;
      }
      // Partial word match
      else if (textWords.some(word => word.includes(queryWord))) {
        score += 0.2;
      }
      // Substring match
      else if (text.includes(queryWord)) {
        score += 0.1;
      }
    }

    // Normalize by query length
    return Math.min(score / queryWords.length, 1.0);
  }

  /**
   * Extract matched text snippet for display
   */
  private extractMatchedText(text: string, queryWords: string[]): string {
    const maxLength = 150;
    const textLower = text.toLowerCase();
    
    // Find the first match position
    let matchPos = -1;
    for (const word of queryWords) {
      const pos = textLower.indexOf(word);
      if (pos !== -1 && (matchPos === -1 || pos < matchPos)) {
        matchPos = pos;
      }
    }

    if (matchPos === -1) {
      return text.substring(0, maxLength) + (text.length > maxLength ? '...' : '');
    }

    // Extract context around the match
    const start = Math.max(0, matchPos - 50);
    const end = Math.min(text.length, matchPos + 100);
    
    let snippet = text.substring(start, end);
    if (start > 0) snippet = '...' + snippet;
    if (end < text.length) snippet = snippet + '...';
    
    return snippet;
  }

  /**
   * Search for issues that match a specific message content
   */
  async searchByMessageContent(messageContent: string): Promise<MultiRepoSearchResult[]> {
    // Extract key technical terms and concepts from the message
    const keywords = this.extractTechnicalKeywords(messageContent);
    
    if (keywords.length === 0) {
      return [];
    }

    const searchQuery = keywords.join(' ');
    
    return this.searchAcrossRepositories({
      query: searchQuery,
      includeBody: true,
      includeComments: false,
      state: 'all',
      limit: 20,
      minRelevance: 0.4
    });
  }

  /**
   * Extract technical keywords from message content
   */
  private extractTechnicalKeywords(content: string): string[] {
    const technicalPatterns = [
      // Programming languages and frameworks
      /\b(typescript|javascript|react|node|next\.js|vue|angular|svelte)\b/gi,
      // Error types and concepts
      /\b(error|exception|bug|issue|problem|fail|crash|break)\b/gi,
      // Technical terms
      /\b(type|interface|class|function|method|property|variable|const|let|var)\b/gi,
      // Common issues
      /\b(undefined|null|NaN|async|await|promise|callback|event|handler)\b/gi,
      // Build and tooling
      /\b(webpack|vite|babel|eslint|prettier|jest|testing|build|compile)\b/gi
    ];

    const keywords = new Set<string>();
    
    technicalPatterns.forEach(pattern => {
      const matches = content.match(pattern);
      if (matches) {
        matches.forEach(match => keywords.add(match.toLowerCase()));
      }
    });

    // Also extract quoted strings and code blocks
    const codeBlocks = content.match(/`([^`]+)`/g);
    if (codeBlocks) {
      codeBlocks.forEach(block => {
        const cleanBlock = block.replace(/`/g, '').trim();
        if (cleanBlock.length > 2 && cleanBlock.length < 50) {
          keywords.add(cleanBlock);
        }
      });
    }

    return Array.from(keywords).slice(0, 10); // Limit to top 10 keywords
  }

  /**
   * Create a GitHub issue with enhanced template
   */
  async createIssueWithTemplate(
    repository: string,
    template: {
      title: string;
      body: string;
      labels?: string[];
      messageContext?: string;
    }
  ): Promise<GitHubIssue> {
    const service = this.services.get(repository);
    if (!service) {
      throw new Error(`Repository ${repository} not configured`);
    }

    // Enhance the issue body with context
    let enhancedBody = template.body;
    
    if (template.messageContext) {
      enhancedBody = `## Context from Chat

${template.messageContext}

---

${template.body}

---

*This issue was created from InfyKB Agentic Chat Interface*`;
    }

    return service.createIssue({
      title: template.title,
      body: enhancedBody,
      labels: template.labels
    });
  }
}

// Export singleton instance
export const enhancedGitHubService = new EnhancedGitHubService();
