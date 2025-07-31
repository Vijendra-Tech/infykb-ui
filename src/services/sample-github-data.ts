import { db } from '@/lib/database';

export interface SampleGitHubIssue {
  uuid?: string;
  githubId: number;
  number: number;
  title: string;
  body: string;
  state: 'open' | 'closed';
  html_url: string;
  repository: string;
  user: {
    login: string;
    id: number;
    avatar_url: string;
  };
  labels: Array<{
    name: string;
    color: string;
  }>;
  assignees: any[];
  created_at: string;
  updated_at: string;
  comments: number;
  syncedAt?: Date;
  organizationId?: string;
}

export const sampleGitHubIssues: SampleGitHubIssue[] = [
  {
    githubId: 1001,
    number: 101,
    title: "TypeScript compilation error with React components",
    body: "Getting compilation errors when using TypeScript with React functional components. The error occurs when trying to use hooks with proper type definitions.",
    state: "open",
    html_url: "https://github.com/microsoft/TypeScript/issues/101",
    repository: "microsoft/TypeScript",
    user: {
      login: "developer1",
      id: 12345,
      avatar_url: "https://github.com/developer1.png"
    },
    labels: [
      { name: "bug", color: "d73a49" },
      { name: "typescript", color: "0075ca" },
      { name: "react", color: "1d76db" }
    ],
    assignees: [],
    created_at: "2024-01-15T10:30:00Z",
    updated_at: "2024-01-16T14:20:00Z",
    comments: 5
  },
  {
    githubId: 1002,
    number: 102,
    title: "Performance optimization for large datasets",
    body: "Need to optimize performance when handling large datasets in React applications. Currently experiencing slow rendering with 10k+ items.",
    state: "open",
    html_url: "https://github.com/facebook/react/issues/102",
    repository: "facebook/react",
    user: {
      login: "perfdev",
      id: 23456,
      avatar_url: "https://github.com/perfdev.png"
    },
    labels: [
      { name: "performance", color: "fbca04" },
      { name: "react", color: "1d76db" },
      { name: "optimization", color: "0e8a16" }
    ],
    assignees: [],
    created_at: "2024-01-14T09:15:00Z",
    updated_at: "2024-01-17T11:45:00Z",
    comments: 12
  },
  {
    githubId: 1003,
    number: 103,
    title: "Next.js routing issue with dynamic pages",
    body: "Dynamic routing in Next.js is not working correctly with nested routes. Getting 404 errors on valid dynamic page paths.",
    state: "closed",
    html_url: "https://github.com/vercel/next.js/issues/103",
    repository: "vercel/next.js",
    user: {
      login: "nextjsdev",
      id: 34567,
      avatar_url: "https://github.com/nextjsdev.png"
    },
    labels: [
      { name: "bug", color: "d73a49" },
      { name: "routing", color: "c5def5" },
      { name: "nextjs", color: "000000" }
    ],
    assignees: [],
    created_at: "2024-01-12T16:20:00Z",
    updated_at: "2024-01-18T13:30:00Z",
    comments: 8
  },
  {
    githubId: 1004,
    number: 104,
    title: "CSS-in-JS performance concerns",
    body: "Investigating performance implications of CSS-in-JS solutions. Comparing styled-components vs emotion vs other alternatives.",
    state: "open",
    html_url: "https://github.com/styled-components/styled-components/issues/104",
    repository: "styled-components/styled-components",
    user: {
      login: "cssexpert",
      id: 45678,
      avatar_url: "https://github.com/cssexpert.png"
    },
    labels: [
      { name: "performance", color: "fbca04" },
      { name: "css", color: "1d76db" },
      { name: "discussion", color: "d4c5f9" }
    ],
    assignees: [],
    created_at: "2024-01-13T12:45:00Z",
    updated_at: "2024-01-16T09:20:00Z",
    comments: 15
  },
  {
    githubId: 1005,
    number: 105,
    title: "GraphQL integration with React Query",
    body: "How to properly integrate GraphQL with React Query for optimal caching and data fetching patterns.",
    state: "open",
    html_url: "https://github.com/TanStack/query/issues/105",
    repository: "TanStack/query",
    user: {
      login: "graphqldev",
      id: 56789,
      avatar_url: "https://github.com/graphqldev.png"
    },
    labels: [
      { name: "graphql", color: "e10098" },
      { name: "react-query", color: "ff6154" },
      { name: "integration", color: "0e8a16" }
    ],
    assignees: [],
    created_at: "2024-01-11T14:10:00Z",
    updated_at: "2024-01-17T16:55:00Z",
    comments: 7
  },
  {
    githubId: 1006,
    number: 106,
    title: "State management with Zustand vs Redux",
    body: "Comparing state management solutions for medium-sized React applications. Looking at Zustand as a lightweight alternative to Redux.",
    state: "closed",
    html_url: "https://github.com/pmndrs/zustand/issues/106",
    repository: "pmndrs/zustand",
    user: {
      login: "statemanager",
      id: 67890,
      avatar_url: "https://github.com/statemanager.png"
    },
    labels: [
      { name: "state-management", color: "0075ca" },
      { name: "comparison", color: "d4c5f9" },
      { name: "zustand", color: "ff6b6b" }
    ],
    assignees: [],
    created_at: "2024-01-10T11:30:00Z",
    updated_at: "2024-01-15T10:15:00Z",
    comments: 20
  },
  {
    githubId: 1007,
    number: 107,
    title: "Webpack 5 migration issues",
    body: "Encountering various issues when migrating from Webpack 4 to Webpack 5. Module federation and polyfill problems.",
    state: "open",
    html_url: "https://github.com/webpack/webpack/issues/107",
    repository: "webpack/webpack",
    user: {
      login: "buildtool",
      id: 78901,
      avatar_url: "https://github.com/buildtool.png"
    },
    labels: [
      { name: "webpack5", color: "8dd3c7" },
      { name: "migration", color: "fbca04" },
      { name: "module-federation", color: "0e8a16" }
    ],
    assignees: [],
    created_at: "2024-01-09T13:20:00Z",
    updated_at: "2024-01-16T15:40:00Z",
    comments: 18
  },
  {
    githubId: 1008,
    number: 108,
    title: "Testing React components with Jest and RTL",
    body: "Best practices for testing React components using Jest and React Testing Library. Focus on integration tests vs unit tests.",
    state: "open",
    html_url: "https://github.com/testing-library/react-testing-library/issues/108",
    repository: "testing-library/react-testing-library",
    user: {
      login: "testingguru",
      id: 89012,
      avatar_url: "https://github.com/testingguru.png"
    },
    labels: [
      { name: "testing", color: "0e8a16" },
      { name: "jest", color: "c21325" },
      { name: "react-testing-library", color: "e10098" }
    ],
    assignees: [],
    created_at: "2024-01-08T15:45:00Z",
    updated_at: "2024-01-17T12:30:00Z",
    comments: 9
  },
  {
    githubId: 1009,
    number: 109,
    title: "Accessibility improvements for form components",
    body: "Need to improve accessibility (a11y) for custom form components. ARIA labels, keyboard navigation, and screen reader support.",
    state: "closed",
    html_url: "https://github.com/react-hook-form/react-hook-form/issues/109",
    repository: "react-hook-form/react-hook-form",
    user: {
      login: "a11ydev",
      id: 90123,
      avatar_url: "https://github.com/a11ydev.png"
    },
    labels: [
      { name: "accessibility", color: "0075ca" },
      { name: "forms", color: "1d76db" },
      { name: "a11y", color: "0e8a16" }
    ],
    assignees: [],
    created_at: "2024-01-07T10:20:00Z",
    updated_at: "2024-01-14T14:50:00Z",
    comments: 6
  },
  {
    githubId: 1010,
    number: 110,
    title: "Server-side rendering optimization",
    body: "Optimizing server-side rendering performance in Next.js applications. Looking at streaming and partial hydration strategies.",
    state: "open",
    html_url: "https://github.com/vercel/next.js/issues/110",
    repository: "vercel/next.js",
    user: {
      login: "ssrexpert",
      id: 10234,
      avatar_url: "https://github.com/ssrexpert.png"
    },
    labels: [
      { name: "ssr", color: "000000" },
      { name: "performance", color: "fbca04" },
      { name: "hydration", color: "c5def5" }
    ],
    assignees: [],
    created_at: "2024-01-06T12:15:00Z",
    updated_at: "2024-01-17T17:25:00Z",
    comments: 11
  }
];

export class SampleDataService {
  static async populateGitHubData(): Promise<void> {
    try {
      // Clear existing data
      await db.githubIssues.clear();
      
      // Add missing properties to sample issues
      const issuesWithMissingProps = sampleGitHubIssues.map(issue => ({
        ...issue,
        uuid: `github-${issue.githubId}`,
        syncedAt: new Date(),
        organizationId: 'sample-org'
      }));
      
      // Add sample issues
      await db.githubIssues.bulkAdd(issuesWithMissingProps);
      
      console.log(`✅ Successfully populated ${sampleGitHubIssues.length} sample GitHub issues`);
    } catch (error) {
      console.error('❌ Error populating sample GitHub data:', error);
      throw error;
    }
  }

  static async clearGitHubData(): Promise<void> {
    try {
      await db.githubIssues.clear();
      await db.githubPullRequests.clear();
      await db.githubDiscussions.clear();
      
      console.log('✅ Successfully cleared all GitHub data');
    } catch (error) {
      console.error('❌ Error clearing GitHub data:', error);
      throw error;
    }
  }

  static async getDataStats(): Promise<{
    totalIssues: number;
    totalPullRequests: number;
    totalDiscussions: number;
  }> {
    try {
      const [issues, pullRequests, discussions] = await Promise.all([
        db.githubIssues.count(),
        db.githubPullRequests.count(),
        db.githubDiscussions.count()
      ]);

      return {
        totalIssues: issues,
        totalPullRequests: pullRequests,
        totalDiscussions: discussions
      };
    } catch (error) {
      console.error('❌ Error getting data stats:', error);
      return {
        totalIssues: 0,
        totalPullRequests: 0,
        totalDiscussions: 0
      };
    }
  }
}
