'use client';

import { IngestedSearchResult } from './ingested-github-search-service';

export interface GraphNode {
  id: string;
  type: 'issue' | 'pull_request' | 'user' | 'repository' | 'label';
  title: string;
  label: string;
  subtitle?: string;
  data: any;
  x?: number;
  y?: number;
  size: number;
  color: string;
  group?: string;
  metadata: {
    repository?: string;
    state?: string;
    author?: string;
    labels?: string[];
    created_at?: string;
    relevance_score?: number;
    html_url?: string;
  };
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  type: 'reference' | 'similarity' | 'shared_label' | 'same_author' | 'same_repository' | 'dependency';
  weight: number;
  width: number;
  label?: string;
  color: string;
  metadata: {
    reason?: string;
    strength?: number;
  };
}

export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
  clusters: GraphCluster[];
}

export interface GraphCluster {
  id: string;
  name: string;
  nodes: string[];
  color: string;
  center: { x: number; y: number };
}

export class GraphVisualizationService {
  private static readonly NODE_COLORS = {
    issue: '#3b82f6', // blue
    pull_request: '#8b5cf6', // purple
    user: '#10b981', // green
    repository: '#f59e0b', // amber
    label: '#ef4444' // red
  };

  private static readonly EDGE_COLORS = {
    reference: '#6b7280',
    similarity: '#3b82f6',
    shared_label: '#ef4444',
    same_author: '#10b981',
    same_repository: '#f59e0b',
    dependency: '#8b5cf6'
  };

  static buildGraphFromSearchResults(searchResults: IngestedSearchResult[]): GraphData {
    const nodes: GraphNode[] = [];
    const edges: GraphEdge[] = [];
    const nodeMap = new Map<string, GraphNode>();

    // Create issue nodes
    searchResults.forEach((result, index) => {
      const issueNode: GraphNode = {
        id: `issue-${result.id}`,
        type: result.body?.includes('pull_request') ? 'pull_request' : 'issue',
        title: result.title,
        label: result.title,
        subtitle: `${result.repository} • ${result.state}`,
        data: result,
        size: Math.max(10, Math.min(30, (result.relevance_score || 0) * 40)),
        color: result.body?.includes('pull_request') ? '#8b5cf6' : '#3b82f6',
        group: result.repository,
        metadata: {
          repository: result.repository,
          state: result.state,
          author: result.user.login,
          labels: result.labels.map(l => l.name),
          created_at: result.created_at,
          relevance_score: result.relevance_score,
          html_url: result.html_url
        }
      };
      nodes.push(issueNode);
      nodeMap.set(issueNode.id, issueNode);
    });

    // Create repository nodes
    const repositories = new Set(searchResults.map(r => r.repository).filter(Boolean));
    repositories.forEach(repo => {
      if (repo) {
        const repoNode: GraphNode = {
          id: `repo-${repo}`,
          type: 'repository',
          title: repo,
          label: repo,
          subtitle: 'Repository',
          data: { name: repo },
          size: 40,
          color: this.NODE_COLORS.repository,
          group: repo,
          metadata: { repository: repo }
        };
        nodes.push(repoNode);
        nodeMap.set(repoNode.id, repoNode);
      }
    });

    // Create user nodes
    const users = new Set(searchResults.map(r => r.user?.login).filter(Boolean));
    users.forEach(user => {
      if (user) {
        const userNode: GraphNode = {
          id: `user-${user}`,
          type: 'user',
          title: user,
          label: user,
          subtitle: 'Author',
          data: { login: user },
          size: 30,
          color: this.NODE_COLORS.user,
          metadata: { author: user }
        };
        nodes.push(userNode);
        nodeMap.set(userNode.id, userNode);
      }
    });

    // Create label nodes (for most common labels)
    const labelCounts = new Map<string, number>();
    searchResults.forEach(result => {
      result.labels?.forEach(label => {
        const labelName = typeof label === 'string' ? label : label.name;
        labelCounts.set(labelName, (labelCounts.get(labelName) || 0) + 1);
      });
    });

    // Only show labels that appear in multiple issues
    Array.from(labelCounts.entries())
      .filter(([_, count]) => count > 1)
      .slice(0, 10) // Limit to top 10 labels
      .forEach(([labelName, labelCount]) => {
        const labelNode: GraphNode = {
          id: `label-${labelName}`,
          type: 'label',
          title: labelName,
          label: labelName,
          subtitle: `${labelCount} items`,
          data: { name: labelName, count: labelCount },
          size: Math.max(8, Math.min(20, labelCount * 1.5)),
          color: this.NODE_COLORS.label,
          metadata: {}
        };
        nodes.push(labelNode);
        nodeMap.set(labelNode.id, labelNode);
      });

    // Create edges
    this.createEdges(searchResults, nodeMap, edges);

    // Create clusters
    const clusters = this.createClusters(nodes);

    // Apply force-directed layout
    this.applyForceLayout(nodes, edges);

    return { nodes, edges, clusters };
  }

  private static calculateNodeSize(result: IngestedSearchResult): number {
    let size = 25; // base size
    
    // Increase size based on relevance score
    if (result.relevance_score) {
      size += result.relevance_score * 20;
    }
    
    // Increase size based on comments
    if (result.comments) {
      size += Math.min(result.comments * 2, 20);
    }
    
    return Math.min(Math.max(size, 20), 60);
  }

  private static createEdges(
    searchResults: IngestedSearchResult[],
    nodeMap: Map<string, GraphNode>,
    edges: GraphEdge[]
  ): void {
    // Repository connections
    searchResults.forEach(result => {
      const issueId = `issue-${result.id}`;
      const repoId = `repo-${result.repository}`;
      
      if (nodeMap.has(repoId)) {
        edges.push({
          id: `${issueId}-${repoId}`,
          source: issueId,
          target: repoId,
          type: 'same_repository',
          weight: 1,
          width: 2,
          color: this.EDGE_COLORS.same_repository,
          metadata: { reason: 'Same repository' }
        });
      }
    });

    // Author connections
    searchResults.forEach(result => {
      const issueId = `issue-${result.id}`;
      const userId = `user-${result.user?.login}`;
      
      if (nodeMap.has(userId)) {
        edges.push({
          id: `${issueId}-${userId}`,
          source: issueId,
          target: userId,
          type: 'same_author',
          weight: 1,
          width: 2,
          color: this.EDGE_COLORS.same_author,
          metadata: { reason: 'Same author' }
        });
      }
    });

    // Label connections
    searchResults.forEach(result => {
      const issueId = `issue-${result.id}`;
      
      result.labels?.forEach(label => {
        const labelName = typeof label === 'string' ? label : label.name;
        const labelId = `label-${labelName}`;
        
        if (nodeMap.has(labelId)) {
          edges.push({
            id: `${issueId}-${labelId}`,
            source: issueId,
            target: labelId,
            type: 'shared_label',
            weight: 1,
            width: 1,
            color: this.EDGE_COLORS.shared_label,
            metadata: { reason: 'Shared label' }
          });
        }
      });
    });

    // Similarity connections (based on relevance scores)
    for (let i = 0; i < searchResults.length; i++) {
      for (let j = i + 1; j < searchResults.length; j++) {
        const result1 = searchResults[i];
        const result2 = searchResults[j];
        const similarity = this.calculateSimilarity(result1, result2);
        
        if (similarity > 0.3) { // Only connect if similarity is high enough
          const id1 = `issue-${result1.id}`;
          const id2 = `issue-${result2.id}`;
          
          edges.push({
            id: `${id1}-${id2}`,
            source: id1,
            target: id2,
            type: 'similarity',
            weight: similarity,
            width: Math.max(1, similarity * 3),
            color: this.EDGE_COLORS.similarity,
            metadata: { 
              reason: 'Content similarity',
              strength: similarity
            }
          });
        }
      }
    }
  }

  private static calculateSimilarity(result1: IngestedSearchResult, result2: IngestedSearchResult): number {
    let similarity = 0;
    
    // Title similarity (simple word overlap)
    const words1 = result1.title.toLowerCase().split(/\s+/);
    const words2 = result2.title.toLowerCase().split(/\s+/);
    const commonWords = words1.filter(word => words2.includes(word));
    similarity += (commonWords.length / Math.max(words1.length, words2.length)) * 0.4;
    
    // Label similarity
    const labels1 = result1.labels?.map(l => typeof l === 'string' ? l : l.name) || [];
    const labels2 = result2.labels?.map(l => typeof l === 'string' ? l : l.name) || [];
    const commonLabels = labels1.filter(label => labels2.includes(label));
    if (labels1.length > 0 || labels2.length > 0) {
      similarity += (commonLabels.length / Math.max(labels1.length, labels2.length)) * 0.3;
    }
    
    // Same repository bonus
    if (result1.repository === result2.repository) {
      similarity += 0.2;
    }
    
    // Same author bonus
    if (result1.user?.login === result2.user?.login) {
      similarity += 0.1;
    }
    
    return Math.min(similarity, 1);
  }

  private static createClusters(nodes: GraphNode[]): GraphCluster[] {
    const clusters: GraphCluster[] = [];
    const repositoryGroups = new Map<string, GraphNode[]>();
    
    // Group by repository
    nodes.forEach(node => {
      if (node.group) {
        if (!repositoryGroups.has(node.group)) {
          repositoryGroups.set(node.group, []);
        }
        repositoryGroups.get(node.group)!.push(node);
      }
    });
    
    repositoryGroups.forEach((groupNodes, repo) => {
      clusters.push({
        id: `cluster-${repo}`,
        name: repo,
        nodes: groupNodes.map(n => n.id),
        color: this.NODE_COLORS.repository + '20', // Semi-transparent
        center: { x: 0, y: 0 } // Will be calculated during layout
      });
    });
    
    return clusters;
  }

  private static applyForceLayout(nodes: GraphNode[], edges: GraphEdge[]): void {
    // Simple force-directed layout algorithm
    const width = 800;
    const height = 600;
    const centerX = width / 2;
    const centerY = height / 2;
    
    // Initialize positions randomly
    nodes.forEach((node, index) => {
      const angle = (index / nodes.length) * 2 * Math.PI;
      const radius = Math.min(width, height) * 0.3;
      node.x = centerX + Math.cos(angle) * radius + (Math.random() - 0.5) * 100;
      node.y = centerY + Math.sin(angle) * radius + (Math.random() - 0.5) * 100;
    });
    
    // Simple clustering by repository
    const repositoryPositions = new Map<string, { x: number; y: number }>();
    let repoIndex = 0;
    
    nodes.filter(n => n.type === 'repository').forEach(repoNode => {
      const angle = (repoIndex / nodes.filter(n => n.type === 'repository').length) * 2 * Math.PI;
      const radius = Math.min(width, height) * 0.25;
      repositoryPositions.set(repoNode.title, {
        x: centerX + Math.cos(angle) * radius,
        y: centerY + Math.sin(angle) * radius
      });
      repoNode.x = centerX + Math.cos(angle) * radius;
      repoNode.y = centerY + Math.sin(angle) * radius;
      repoIndex++;
    });
    
    // Position issues near their repositories
    nodes.filter(n => n.type === 'issue' || n.type === 'pull_request').forEach(issueNode => {
      if (issueNode.metadata.repository && repositoryPositions.has(issueNode.metadata.repository)) {
        const repoPos = repositoryPositions.get(issueNode.metadata.repository)!;
        const angle = Math.random() * 2 * Math.PI;
        const distance = 80 + Math.random() * 60;
        issueNode.x = repoPos.x + Math.cos(angle) * distance;
        issueNode.y = repoPos.y + Math.sin(angle) * distance;
      }
    });
  }

  static getNodeTypeIcon(type: string): string {
    switch (type) {
      case 'issue': return '🐛';
      case 'pull_request': return '🔀';
      case 'user': return '👤';
      case 'repository': return '📁';
      case 'label': return '🏷️';
      default: return '⚪';
    }
  }

  static getEdgeTypeLabel(type: string): string {
    switch (type) {
      case 'reference': return 'References';
      case 'similarity': return 'Similar';
      case 'shared_label': return 'Shared Label';
      case 'same_author': return 'Same Author';
      case 'same_repository': return 'Same Repo';
      case 'dependency': return 'Depends On';
      default: return 'Related';
    }
  }
}
