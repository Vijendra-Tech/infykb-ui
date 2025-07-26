import { GitHubIssue, githubService } from './github-service';

export interface SolutionSuggestion {
  type: 'existing_issue' | 'code_snippet' | 'documentation' | 'create_issue';
  confidence: number;
  title: string;
  description: string;
  content?: string;
  code?: {
    language: string;
    snippet: string;
    explanation: string;
  };
  relatedIssues?: GitHubIssue[];
  suggestedIssue?: {
    title: string;
    body: string;
    labels: string[];
  };
  references?: Array<{
    title: string;
    url: string;
    type: 'documentation' | 'stackoverflow' | 'github' | 'blog';
  }>;
}

export interface AnalysisResult {
  query: string;
  intent: 'bug_report' | 'feature_request' | 'question' | 'configuration' | 'performance' | 'general';
  type: 'text' | 'code' | 'analysis';
  keywords: string[];
  suggestions: SolutionSuggestion[];
  confidence: number;
  processingTime: number;
  response: string;
  followUpQuestions?: string[];
}

export class AgenticAIService {
  private readonly commonPatterns = {
    // TypeScript-specific patterns
    typeErrors: [
      'type error', 'typescript error', 'ts error', 'cannot assign', 'property does not exist',
      'argument of type', 'type assertion', 'type guard', 'union type', 'intersection type'
    ],
    performance: [
      'slow', 'performance', 'memory', 'cpu', 'compilation time', 'build time',
      'typescript slow', 'tsc slow', 'type checking slow'
    ],
    configuration: [
      'tsconfig', 'config', 'setup', 'configure', 'settings', 'options',
      'compiler options', 'strict mode', 'module resolution'
    ],
    features: [
      'feature', 'enhancement', 'new', 'add', 'support', 'implement',
      'proposal', 'suggestion', 'improvement'
    ],
    bugs: [
      'bug', 'issue', 'problem', 'error', 'broken', 'not working',
      'unexpected', 'incorrect', 'wrong'
    ]
  };

  private readonly codeTemplates = {
    typeAssertion: {
      language: 'typescript',
      snippet: `// Type assertion examples
const value = someValue as TargetType;
// or using angle bracket syntax (not recommended in JSX)
const value = <TargetType>someValue;

// Safe type assertion with type guard
function isTargetType(value: unknown): value is TargetType {
  return typeof value === 'object' && value !== null && 'property' in value;
}

if (isTargetType(someValue)) {
  // TypeScript now knows someValue is TargetType
  console.log(someValue.property);
}`,
      explanation: 'Use type assertions carefully. Type guards provide runtime safety.'
    },
    
    unionTypes: {
      language: 'typescript',
      snippet: `// Union type handling
type Status = 'loading' | 'success' | 'error';

function handleStatus(status: Status) {
  switch (status) {
    case 'loading':
      return 'Loading...';
    case 'success':
      return 'Success!';
    case 'error':
      return 'Error occurred';
    default:
      // Exhaustive check
      const _exhaustiveCheck: never = status;
      return _exhaustiveCheck;
  }
}

// Discriminated unions
type ApiResponse = 
  | { status: 'success'; data: any }
  | { status: 'error'; message: string };

function processResponse(response: ApiResponse) {
  if (response.status === 'success') {
    // TypeScript knows this is success case
    console.log(response.data);
  } else {
    // TypeScript knows this is error case
    console.log(response.message);
  }
}`,
      explanation: 'Union types require proper type narrowing using type guards or discriminated unions.'
    },

    generics: {
      language: 'typescript',
      snippet: `// Generic functions and interfaces
interface ApiResponse<T> {
  data: T;
  status: number;
  message: string;
}

function fetchData<T>(url: string): Promise<ApiResponse<T>> {
  return fetch(url).then(res => res.json());
}

// Usage
interface User {
  id: number;
  name: string;
}

const userResponse = await fetchData<User>('/api/user');
// userResponse.data is now typed as User

// Generic constraints
interface Lengthwise {
  length: number;
}

function logLength<T extends Lengthwise>(arg: T): T {
  console.log(arg.length);
  return arg;
}

logLength('hello'); // OK
logLength([1, 2, 3]); // OK
// logLength(123); // Error: number doesn't have length`,
      explanation: 'Generics provide type safety while maintaining flexibility. Use constraints to limit generic types.'
    },

    strictMode: {
      language: 'json',
      snippet: `// tsconfig.json - Recommended strict configuration
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictBindCallApply": true,
    "strictPropertyInitialization": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true
  }
}`,
      explanation: 'Strict mode catches more errors at compile time. Enable gradually in existing projects.'
    },

    performance: {
      language: 'typescript',
      snippet: `// Performance optimization techniques

// 1. Use type-only imports
import type { SomeType } from './types';
import { someFunction } from './utils';

// 2. Prefer interfaces over type aliases for object types
interface User {
  id: number;
  name: string;
}

// 3. Use const assertions for literal types
const themes = ['light', 'dark'] as const;
type Theme = typeof themes[number]; // 'light' | 'dark'

// 4. Avoid complex conditional types in hot paths
// Instead of complex mapped types, use simpler alternatives

// 5. Use project references for large codebases
// tsconfig.json
{
  "references": [
    { "path": "./packages/core" },
    { "path": "./packages/ui" }
  ]
}`,
      explanation: 'Optimize TypeScript performance with proper imports, simple types, and project structure.'
    }
  };

  /**
   * Analyze user query and determine intent
   */
  private analyzeIntent(query: string): {
    intent: AnalysisResult['intent'];
    keywords: string[];
    confidence: number;
  } {
    const lowerQuery = query.toLowerCase();
    const keywords: string[] = [];
    let intent: AnalysisResult['intent'] = 'general';
    let confidence = 0.5;

    // Extract keywords and determine intent
    if (this.containsPatterns(lowerQuery, this.commonPatterns.bugs)) {
      intent = 'bug_report';
      confidence = 0.8;
      keywords.push(...this.extractMatchingPatterns(lowerQuery, this.commonPatterns.bugs));
    } else if (this.containsPatterns(lowerQuery, this.commonPatterns.features)) {
      intent = 'feature_request';
      confidence = 0.7;
      keywords.push(...this.extractMatchingPatterns(lowerQuery, this.commonPatterns.features));
    } else if (this.containsPatterns(lowerQuery, this.commonPatterns.performance)) {
      intent = 'performance';
      confidence = 0.8;
      keywords.push(...this.extractMatchingPatterns(lowerQuery, this.commonPatterns.performance));
    } else if (this.containsPatterns(lowerQuery, this.commonPatterns.configuration)) {
      intent = 'configuration';
      confidence = 0.8;
      keywords.push(...this.extractMatchingPatterns(lowerQuery, this.commonPatterns.configuration));
    } else if (this.containsPatterns(lowerQuery, this.commonPatterns.typeErrors)) {
      intent = 'bug_report';
      confidence = 0.9;
      keywords.push(...this.extractMatchingPatterns(lowerQuery, this.commonPatterns.typeErrors));
    } else if (lowerQuery.includes('?') || lowerQuery.includes('how')) {
      intent = 'question';
      confidence = 0.6;
    }

    // Add general TypeScript keywords
    const tsKeywords = ['typescript', 'ts', 'type', 'interface', 'generic', 'union', 'intersection'];
    keywords.push(...tsKeywords.filter(keyword => lowerQuery.includes(keyword)));

    return { intent, keywords: [...new Set(keywords)], confidence };
  }

  private containsPatterns(text: string, patterns: string[]): boolean {
    return patterns.some(pattern => text.includes(pattern));
  }

  private extractMatchingPatterns(text: string, patterns: string[]): string[] {
    return patterns.filter(pattern => text.includes(pattern));
  }

  /**
   * Generate code snippet suggestions based on query
   */
  private generateCodeSuggestions(query: string, intent: string): SolutionSuggestion[] {
    const suggestions: SolutionSuggestion[] = [];
    const lowerQuery = query.toLowerCase();

    // Type assertion issues
    if (lowerQuery.includes('type assertion') || lowerQuery.includes('cannot assign')) {
      suggestions.push({
        type: 'code_snippet',
        confidence: 0.9,
        title: 'Type Assertion Solutions',
        description: 'Safe ways to handle type assertions and type narrowing',
        code: this.codeTemplates.typeAssertion
      });
    }

    // Union type issues
    if (lowerQuery.includes('union') || lowerQuery.includes('discriminated')) {
      suggestions.push({
        type: 'code_snippet',
        confidence: 0.9,
        title: 'Union Type Handling',
        description: 'Proper techniques for working with union types',
        code: this.codeTemplates.unionTypes
      });
    }

    // Generic issues
    if (lowerQuery.includes('generic') || lowerQuery.includes('constraint')) {
      suggestions.push({
        type: 'code_snippet',
        confidence: 0.8,
        title: 'Generic Types and Constraints',
        description: 'How to use generics effectively with proper constraints',
        code: this.codeTemplates.generics
      });
    }

    // Configuration issues
    if (intent === 'configuration' || lowerQuery.includes('tsconfig')) {
      suggestions.push({
        type: 'code_snippet',
        confidence: 0.8,
        title: 'TypeScript Configuration',
        description: 'Recommended tsconfig.json settings for strict type checking',
        code: this.codeTemplates.strictMode
      });
    }

    // Performance issues
    if (intent === 'performance' || lowerQuery.includes('slow')) {
      suggestions.push({
        type: 'code_snippet',
        confidence: 0.8,
        title: 'Performance Optimization',
        description: 'Techniques to improve TypeScript compilation and runtime performance',
        code: this.codeTemplates.performance
      });
    }

    return suggestions;
  }

  /**
   * Generate issue creation suggestion
   */
  private generateIssueSuggestion(query: string, intent: string): SolutionSuggestion {
    const title = this.generateIssueTitle(query, intent);
    const body = this.generateIssueBody(query, intent);
    const labels = this.suggestLabels(intent);

    return {
      type: 'create_issue',
      confidence: 0.7,
      title: 'Create New Issue',
      description: 'No existing solution found. Create a new issue in the TypeScript repository.',
      suggestedIssue: {
        title,
        body,
        labels
      }
    };
  }

  private generateIssueTitle(query: string, intent: string): string {
    const prefixes = {
      bug_report: 'Bug: ',
      feature_request: 'Feature Request: ',
      performance: 'Performance: ',
      configuration: 'Configuration: ',
      question: 'Question: ',
      general: ''
    };

    const prefix = prefixes[intent as keyof typeof prefixes] || '';
    const cleanQuery = query.charAt(0).toUpperCase() + query.slice(1);
    
    return `${prefix}${cleanQuery}`.slice(0, 100);
  }

  private generateIssueBody(query: string, intent: string): string {
    const templates = {
      bug_report: `## Bug Report

**Description**
${query}

**TypeScript Version**
<!-- Please specify your TypeScript version -->

**Expected Behavior**
<!-- What should happen -->

**Actual Behavior**
<!-- What actually happens -->

**Code Sample**
\`\`\`typescript
// Please provide a minimal code sample that reproduces the issue
\`\`\`

**Additional Information**
<!-- Any other relevant information -->`,

      feature_request: `## Feature Request

**Description**
${query}

**Use Case**
<!-- Describe the use case for this feature -->

**Proposed Solution**
<!-- How do you think this should be implemented? -->

**Alternatives Considered**
<!-- What other approaches have you considered? -->

**Additional Context**
<!-- Any other relevant information -->`,

      performance: `## Performance Issue

**Description**
${query}

**Performance Impact**
<!-- Describe the performance impact -->

**Environment**
- TypeScript Version: 
- Node.js Version: 
- OS: 

**Code Sample**
\`\`\`typescript
// Please provide code that demonstrates the performance issue
\`\`\`

**Profiling Data**
<!-- If available, include profiling information -->`,

      default: `## Issue Report

**Description**
${query}

**Context**
<!-- Please provide additional context about your issue -->

**Environment**
- TypeScript Version: 
- Node.js Version: 
- OS: 

**Additional Information**
<!-- Any other relevant information -->`
    };

    return templates[intent as keyof typeof templates] || templates.default;
  }

  private suggestLabels(intent: string): string[] {
    const labelMap = {
      bug_report: ['Bug', 'Needs Investigation'],
      feature_request: ['Enhancement', 'Suggestion'],
      performance: ['Performance', 'Compiler'],
      configuration: ['Question', 'Configuration'],
      question: ['Question'],
      general: ['Question']
    };

    return labelMap[intent as keyof typeof labelMap] || ['Question'];
  }

  /**
   * Main analysis function
   */
  async analyzeQuery(query: string): Promise<AnalysisResult> {
    const startTime = Date.now();
    
    // Analyze intent and extract keywords
    const { intent, keywords, confidence: intentConfidence } = this.analyzeIntent(query);
    
    // Search for existing issues
    const relatedIssues = await githubService.searchIssues(query, {
      limit: 5,
      minRelevance: 0.3
    });

    const suggestions: SolutionSuggestion[] = [];

    // If we found relevant issues, suggest them
    if (relatedIssues.length > 0) {
      suggestions.push({
        type: 'existing_issue',
        confidence: 0.9,
        title: `Found ${relatedIssues.length} Related Issue${relatedIssues.length > 1 ? 's' : ''}`,
        description: 'These existing issues might help solve your problem',
        relatedIssues
      });
    }

    // Generate code suggestions
    const codeSuggestions = this.generateCodeSuggestions(query, intent);
    suggestions.push(...codeSuggestions);

    // If no good existing solutions, suggest creating an issue
    if (relatedIssues.length === 0 || relatedIssues[0].relevance_score! < 0.7) {
      const issueSuggestion = this.generateIssueSuggestion(query, intent);
      suggestions.push(issueSuggestion);
    }

    // Add documentation suggestions
    if (intent === 'question' || intent === 'configuration') {
      suggestions.push({
        type: 'documentation',
        confidence: 0.6,
        title: 'TypeScript Documentation',
        description: 'Check the official TypeScript documentation for detailed information',
        references: [
          {
            title: 'TypeScript Handbook',
            url: 'https://www.typescriptlang.org/docs/',
            type: 'documentation'
          },
          {
            title: 'TypeScript Compiler Options',
            url: 'https://www.typescriptlang.org/tsconfig',
            type: 'documentation'
          }
        ]
      });
    }

    const processingTime = Date.now() - startTime;
    const overallConfidence = Math.min(
      intentConfidence + (relatedIssues.length > 0 ? 0.2 : 0),
      1.0
    );

    // Generate response based on suggestions
    const response = this.generateResponse(suggestions, intent, overallConfidence);
    
    // Generate follow-up questions
    const followUpQuestions = this.generateFollowUpQuestions({
      query,
      intent,
      type: 'analysis',
      keywords,
      suggestions,
      confidence: overallConfidence,
      processingTime,
      response
    });

    return {
      query,
      intent,
      type: 'analysis' as const,
      keywords,
      suggestions,
      confidence: overallConfidence,
      processingTime,
      response,
      followUpQuestions
    };
  }

  /**
   * Generate response text based on suggestions and analysis
   */
  private generateResponse(suggestions: SolutionSuggestion[], intent: string, confidence: number): string {
    if (suggestions.length === 0) {
      return "I couldn't find any specific solutions for your query, but I'd be happy to help you create a new issue or provide general guidance.";
    }

    const topSuggestion = suggestions[0];
    let response = "";

    switch (topSuggestion.type) {
      case 'existing_issue':
        response = `I found ${suggestions.length} related issue${suggestions.length > 1 ? 's' : ''} that might help with your query. The most relevant one appears to be "${topSuggestion.title}" with ${Math.round(topSuggestion.confidence * 100)}% confidence.`;
        break;
      case 'code_snippet':
        response = `I can help you with that! Here's a code solution that should address your ${intent.replace('_', ' ')} with ${Math.round(confidence * 100)}% confidence.`;
        break;
      case 'documentation':
        response = `I found some relevant documentation that should help with your query. Check out the resources below for detailed information.`;
        break;
      case 'create_issue':
        response = `I couldn't find an existing solution for your specific issue. I'd recommend creating a new issue in the TypeScript repository with the suggested template below.`;
        break;
      default:
        response = `I've analyzed your query and found ${suggestions.length} potential solution${suggestions.length > 1 ? 's' : ''} that might help.`;
    }

    if (suggestions.length > 1) {
      response += ` I've also found ${suggestions.length - 1} additional suggestion${suggestions.length > 2 ? 's' : ''} that might be relevant.`;
    }

    return response;
  }

  /**
   * Generate follow-up questions based on the analysis
   */
  generateFollowUpQuestions(analysis: AnalysisResult): string[] {
    const questions: string[] = [];

    switch (analysis.intent) {
      case 'bug_report':
        questions.push(
          'What TypeScript version are you using?',
          'Can you provide a minimal code example?',
          'What error message are you seeing?'
        );
        break;
      case 'feature_request':
        questions.push(
          'What problem would this feature solve?',
          'Have you considered any workarounds?',
          'Would this be a breaking change?'
        );
        break;
      case 'performance':
        questions.push(
          'How large is your codebase?',
          'Are you using project references?',
          'What build tools are you using?'
        );
        break;
      case 'configuration':
        questions.push(
          'What is your current tsconfig.json?',
          'Are you migrating from JavaScript?',
          'What build target do you need?'
        );
        break;
      default:
        questions.push(
          'Can you provide more details?',
          'What have you tried so far?',
          'Is this blocking your development?'
        );
    }

    return questions.slice(0, 3); // Return max 3 questions
  }
}

// Export singleton instance
export const agenticAI = new AgenticAIService();
