import { 
  GitHubService, 
  GitHubSettings, 
  GitHubIngestionResult, 
  GitHubIssue, 
  GitHubPullRequest, 
  GitHubDiscussion,
  GitHubSearchOptions,
  SimilaritySearchResult
} from './github-service'
import { instrumentedGitHubApiCall, instrumentedServiceCall } from '@/lib/instrumented-api'

/**
 * Instrumented GitHub Service with OpenTelemetry tracing
 * Wraps the original GitHubService with tracing capabilities
 */
export class InstrumentedGitHubService extends GitHubService {

  async testConnection(repositoryUrl: string, accessToken?: string): Promise<{ success: boolean; error?: string }> {
    return instrumentedServiceCall(
      'GitHubService',
      'testConnection',
      () => super.testConnection(repositoryUrl, accessToken),
      {
        'github.repository': repositoryUrl,
        'github.has_token': !!accessToken,
      }
    )
  }

  async fetchIssues(
    repositoryUrl: string, 
    accessToken?: string, 
    options: { state?: 'open' | 'closed' | 'all'; per_page?: number; page?: number } = {}
  ): Promise<GitHubIssue[]> {
    return instrumentedServiceCall(
      'GitHubService',
      'fetchIssues',
      () => super.fetchIssues(repositoryUrl, accessToken, options),
      {
        'github.repository': repositoryUrl,
        'github.issues.state': options.state || 'all',
        'github.issues.per_page': options.per_page || 30,
        'github.issues.page': options.page || 1,
      }
    )
  }

  async fetchPullRequests(
    repositoryUrl: string, 
    accessToken?: string, 
    options: { state?: 'open' | 'closed' | 'all'; per_page?: number; page?: number } = {}
  ): Promise<GitHubPullRequest[]> {
    return instrumentedServiceCall(
      'GitHubService',
      'fetchPullRequests',
      () => super.fetchPullRequests(repositoryUrl, accessToken, options),
      {
        'github.repository': repositoryUrl,
        'github.prs.state': options.state || 'all',
        'github.prs.per_page': options.per_page || 30,
        'github.prs.page': options.page || 1,
      }
    )
  }

  async fetchDiscussions(
    repositoryUrl: string, 
    accessToken?: string, 
    options: { per_page?: number; page?: number } = {}
  ): Promise<GitHubDiscussion[]> {
    return instrumentedServiceCall(
      'GitHubService',
      'fetchDiscussions',
      () => super.fetchDiscussions(repositoryUrl, accessToken, options),
      {
        'github.repository': repositoryUrl,
        'github.discussions.per_page': options.per_page || 10,
        'github.discussions.page': options.page || 1,
      }
    )
  }

  async ingestGitHubData(settings: GitHubSettings): Promise<GitHubIngestionResult> {
    return instrumentedServiceCall(
      'GitHubService',
      'ingestGitHubData',
      () => super.ingestGitHubData(settings),
      {
        'github.repository': settings.repository,
        'github.sync_issues': settings.syncIssues,
        'github.sync_prs': settings.syncPRs,
        'github.sync_discussions': settings.syncDiscussions,
      }
    )
  }

  async searchSimilarIssues(query: string, options: GitHubSearchOptions = {}): Promise<SimilaritySearchResult[]> {
    return instrumentedServiceCall(
      'GitHubService',
      'searchSimilarIssues',
      () => super.searchSimilarIssues(query, options),
      {
        'github.search.query': query,
        'github.search.state': options.state,
        'github.search.repository': options.repository,
        'github.search.labels': options.labels?.join(','),
        'github.search.date_range': options.dateRange,
      }
    )
  }

  async generateSearchSuggestions(query: string): Promise<string[]> {
    return instrumentedServiceCall(
      'GitHubService',
      'generateSearchSuggestions',
      () => super.generateSearchSuggestions(query),
      {
        'github.suggestions.query': query,
        'github.suggestions.query_length': query.length,
      }
    )
  }

  async getTrendingSearchTerms(): Promise<Array<{ term: string; count: number }>> {
    return instrumentedServiceCall(
      'GitHubService',
      'getTrendingSearchTerms',
      () => super.getTrendingSearchTerms(),
      {
        'github.trending.requested_at': new Date().toISOString(),
      }
    )
  }
}

// Export instrumented instance
export const instrumentedGitHubService = new InstrumentedGitHubService()
