'use client';

import React, { useCallback, useMemo } from 'react';
import {
  ReactFlow,
  Node,
  Edge,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  BackgroundVariant,
  MiniMap,
  addEdge,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { IngestedSearchResult } from '@/services/ingested-github-search-service';

interface GraphVisualizationProps {
  searchResults: IngestedSearchResult[];
  onNodeClick?: (node: any) => void;
  onEdgeClick?: (edge: any) => void;
  className?: string;
}

// Convert GitHub issues to React Flow nodes and edges
function convertToReactFlowData(searchResults: IngestedSearchResult[]) {
  const nodes: Node[] = [];
  const edges: Edge[] = [];
  const processedRepos = new Set<string>();
  const processedUsers = new Set<string>();
  
  // Create nodes for each issue
  searchResults.forEach((result, index) => {
    // Use deterministic positioning based on issue ID to avoid hydration issues
    const seedX = result.id % 100; // Use issue ID for consistent positioning
    const seedY = (result.id * 7) % 100; // Different multiplier for Y to spread nodes
    const x = (index % 4) * 300 + seedX;
    const y = Math.floor(index / 4) * 200 + seedY;
    
    // Issue node
    nodes.push({
      id: `issue-${result.id}`,
      type: 'default',
      position: { x, y },
      data: {
        label: result.title.length > 30 ? `${result.title.substring(0, 30)}...` : result.title,
        issue: result,
      },
      style: {
        background: result.state === 'open' ? '#22c55e' : '#ef4444',
        color: 'white',
        border: '2px solid #fff',
        borderRadius: '8px',
        fontSize: '12px',
        width: 200,
        height: 60,
      },
    });
    
    // Repository node (create once per repo)
    const repository = result.repository || 'unknown';
    const repoId = `repo-${repository}`;
    if (!processedRepos.has(repository)) {
      processedRepos.add(repository);
      nodes.push({
        id: repoId,
        type: 'default',
        position: { x: x + 250, y: y - 100 },
        data: {
          label: repository,
        },
        style: {
          background: '#3b82f6',
          color: 'white',
          border: '2px solid #fff',
          borderRadius: '8px',
          fontSize: '12px',
          width: 150,
          height: 40,
        },
      });
    }
    
    // Edge from issue to repository
    edges.push({
      id: `edge-${result.id}-${repoId}`,
      source: `issue-${result.id}`,
      target: repoId,
      type: 'smoothstep',
      style: { stroke: '#64748b', strokeWidth: 2 },
      animated: false,
    });
    
    // User node (create once per user)
    if (result.user?.login && !processedUsers.has(result.user.login)) {
      processedUsers.add(result.user.login);
      const userId = `user-${result.user.login}`;
      nodes.push({
        id: userId,
        type: 'default',
        position: { x: x - 200, y: y + 50 },
        data: {
          label: result.user.login,
        },
        style: {
          background: '#8b5cf6',
          color: 'white',
          border: '2px solid #fff',
          borderRadius: '50%',
          fontSize: '12px',
          width: 80,
          height: 80,
        },
      });
      
      // Edge from user to issue
      edges.push({
        id: `edge-${userId}-${result.id}`,
        source: userId,
        target: `issue-${result.id}`,
        type: 'smoothstep',
        style: { stroke: '#64748b', strokeWidth: 1 },
        animated: false,
      });
    }
  });
  
  return { nodes, edges };
}

export function GraphVisualization({ 
  searchResults, 
  onNodeClick, 
  onEdgeClick, 
  className 
}: GraphVisualizationProps) {
  console.log('GraphVisualization: Component mounting/rendering');
  console.log('GraphVisualization: searchResults:', searchResults);
  
  const { nodes: initialNodes, edges: initialEdges } = useMemo(
    () => convertToReactFlowData(searchResults || []),
    [searchResults]
  );
  
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onNodeClickHandler = useCallback((event: React.MouseEvent, node: Node) => {
    console.log('Node clicked:', node);
    if (onNodeClick && node.data.issue) {
      onNodeClick(node.data.issue);
    }
  }, [onNodeClick]);

  const onConnect = useCallback(
    (params: any) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  if (!searchResults || searchResults.length === 0) {
    return (
      <div className={className}>
        <div className="flex items-center justify-center h-full bg-gray-50 rounded-lg">
          <div className="text-center py-8">
            <div className="text-muted-foreground">No data available to visualize</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={className} style={{ width: '100%', height: '100%' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClickHandler}
        fitView
        attributionPosition="top-right"
      >
        <Controls />
        <MiniMap 
          nodeStrokeColor="#fff"
          nodeColor={(node) => {
            if (node.id.startsWith('issue-')) return String(node.style?.background || '#22c55e');
            if (node.id.startsWith('repo-')) return '#3b82f6';
            if (node.id.startsWith('user-')) return '#8b5cf6';
            return '#64748b';
          }}
        />
        <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
      </ReactFlow>
    </div>
  );
}
