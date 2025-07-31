'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { IngestedSearchResult } from '@/services/ingested-github-search-service';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Maximize2, 
  GitBranch, 
  User, 
  Tag,
  ExternalLink,
  Network
} from 'lucide-react';

interface GraphNode {
  id: string;
  type: 'issue' | 'repository' | 'user' | 'label';
  title: string;
  subtitle?: string;
  x: number;
  y: number;
  radius: number;
  color: string;
  data: any;
  connections: string[];
}

interface GraphEdge {
  id: string;
  source: string;
  target: string;
  type: 'belongs_to' | 'created_by' | 'has_label' | 'similar_to';
  color: string;
  width: number;
}

interface EnhancedGraphVisualizationProps {
  searchResults: IngestedSearchResult[];
  onNodeClick?: (node: any) => void;
  className?: string;
}

export function EnhancedGraphVisualization({ 
  searchResults, 
  onNodeClick, 
  className 
}: EnhancedGraphVisualizationProps) {
  const [zoom, setZoom] = useState(1);
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Generate graph data from search results
  const { nodes, edges } = useMemo(() => {
    if (!searchResults || searchResults.length === 0) {
      return { nodes: [], edges: [] };
    }

    const graphNodes: GraphNode[] = [];
    const graphEdges: GraphEdge[] = [];
    const nodeMap = new Map<string, GraphNode>();

    // Create repository nodes
    const repositories = new Set(searchResults.map(r => r.repository).filter(Boolean));
    const repoPositions = new Map<string, { x: number; y: number }>();
    
    Array.from(repositories).forEach((repo, index) => {
      const angle = (index / repositories.size) * 2 * Math.PI;
      const radius = 200;
      const x = 400 + Math.cos(angle) * radius;
      const y = 300 + Math.sin(angle) * radius;
      
      const repoNode: GraphNode = {
        id: `repo-${repo}`,
        type: 'repository',
        title: repo || 'Unknown',
        x,
        y,
        radius: 40,
        color: '#3b82f6',
        data: { name: repo },
        connections: []
      };
      
      graphNodes.push(repoNode);
      nodeMap.set(repoNode.id, repoNode);
      repoPositions.set(repo || '', { x, y });
    });

    // Create user nodes
    const users = new Set(searchResults.map(r => r.user?.login).filter(Boolean));
    Array.from(users).forEach((user, index) => {
      const angle = (index / users.size) * 2 * Math.PI + Math.PI;
      const radius = 150;
      const x = 400 + Math.cos(angle) * radius;
      const y = 300 + Math.sin(angle) * radius;
      
      const userNode: GraphNode = {
        id: `user-${user}`,
        type: 'user',
        title: user || 'Unknown',
        x,
        y,
        radius: 25,
        color: '#10b981',
        data: { login: user },
        connections: []
      };
      
      graphNodes.push(userNode);
      nodeMap.set(userNode.id, userNode);
    });

    // Create issue nodes
    searchResults.forEach((result, index) => {
      const repoPos = repoPositions.get(result.repository || '');
      if (!repoPos) return;

      // Position issues around their repository
      const angle = (index / searchResults.length) * 2 * Math.PI;
      const distance = 80 + Math.random() * 40;
      const x = repoPos.x + Math.cos(angle) * distance;
      const y = repoPos.y + Math.sin(angle) * distance;

      const issueNode: GraphNode = {
        id: `issue-${result.id}`,
        type: 'issue',
        title: result.title.length > 30 ? `${result.title.substring(0, 30)}...` : result.title,
        subtitle: `#${result.number} • ${result.state}`,
        x,
        y,
        radius: 20,
        color: result.state === 'open' ? '#22c55e' : '#ef4444',
        data: result,
        connections: []
      };

      graphNodes.push(issueNode);
      nodeMap.set(issueNode.id, issueNode);

      // Create edges
      // Issue to repository
      graphEdges.push({
        id: `edge-${result.id}-repo`,
        source: issueNode.id,
        target: `repo-${result.repository}`,
        type: 'belongs_to',
        color: '#64748b',
        width: 2
      });

      // Issue to user
      if (result.user?.login) {
        graphEdges.push({
          id: `edge-${result.id}-user`,
          source: issueNode.id,
          target: `user-${result.user.login}`,
          type: 'created_by',
          color: '#94a3b8',
          width: 1
        });
      }

      // Update connections
      issueNode.connections.push(`repo-${result.repository}`);
      if (result.user?.login) {
        issueNode.connections.push(`user-${result.user.login}`);
      }
    });

    // Update connections for all nodes
    graphEdges.forEach(edge => {
      const sourceNode = nodeMap.get(edge.source);
      const targetNode = nodeMap.get(edge.target);
      if (sourceNode && targetNode) {
        if (!sourceNode.connections.includes(edge.target)) {
          sourceNode.connections.push(edge.target);
        }
        if (!targetNode.connections.includes(edge.source)) {
          targetNode.connections.push(edge.source);
        }
      }
    });

    return { nodes: graphNodes, edges: graphEdges };
  }, [searchResults]);

  // Handle zoom
  const handleZoomIn = () => setZoom(prev => Math.min(prev * 1.2, 3));
  const handleZoomOut = () => setZoom(prev => Math.max(prev / 1.2, 0.3));
  const handleReset = () => {
    setZoom(1);
    setPanX(0);
    setPanY(0);
    setSelectedNode(null);
  };

  // Handle mouse events
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - panX, y: e.clientY - panY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPanX(e.clientX - dragStart.x);
      setPanY(e.clientY - dragStart.y);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Handle node click
  const handleNodeClick = (node: GraphNode) => {
    setSelectedNode(node.id);
    if (onNodeClick && node.data) {
      onNodeClick(node.data);
    }
  };

  // Get node icon
  const getNodeIcon = (type: string) => {
    switch (type) {
      case 'repository': return <GitBranch className="h-4 w-4" />;
      case 'user': return <User className="h-4 w-4" />;
      case 'label': return <Tag className="h-4 w-4" />;
      default: return <Network className="h-4 w-4" />;
    }
  };

  if (!searchResults || searchResults.length === 0) {
    return (
      <div className={className}>
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardContent className="p-8">
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <Network className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold text-muted-foreground mb-2">
                No Data to Visualize
              </h3>
              <p className="text-sm text-muted-foreground">
                Add some issues or data to see the graph visualization
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={className}>
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg h-full">
        <CardContent className="p-0 h-full flex flex-col">
          {/* Controls */}
          <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-slate-50 to-blue-50">
            <div className="flex items-center gap-2">
              <Network className="h-5 w-5 text-blue-600" />
              <h3 className="font-semibold text-slate-700">
                Graph Visualization
              </h3>
              <Badge variant="secondary" className="text-xs">
                {nodes.length} nodes, {edges.length} edges
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleZoomIn}
                className="h-8 w-8 p-0"
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleZoomOut}
                className="h-8 w-8 p-0"
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleReset}
                className="h-8 w-8 p-0"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Graph Canvas */}
          <div className="flex-1 relative overflow-hidden bg-gradient-to-br from-slate-50 to-blue-50/30">
            <svg
              ref={svgRef}
              className="w-full h-full cursor-move"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            >
              <defs>
                <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                  <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#e2e8f0" strokeWidth="0.5"/>
                </pattern>
                <filter id="glow">
                  <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                  <feMerge> 
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              </defs>

              <g transform={`translate(${panX}, ${panY}) scale(${zoom})`}>
                {/* Grid background */}
                <rect width="800" height="600" fill="url(#grid)" opacity="0.5" />

                {/* Edges */}
                {edges.map(edge => {
                  const sourceNode = nodes.find(n => n.id === edge.source);
                  const targetNode = nodes.find(n => n.id === edge.target);
                  if (!sourceNode || !targetNode) return null;

                  const isHighlighted = selectedNode === edge.source || selectedNode === edge.target;

                  return (
                    <line
                      key={edge.id}
                      x1={sourceNode.x}
                      y1={sourceNode.y}
                      x2={targetNode.x}
                      y2={targetNode.y}
                      stroke={isHighlighted ? '#3b82f6' : edge.color}
                      strokeWidth={isHighlighted ? edge.width * 2 : edge.width}
                      opacity={isHighlighted ? 0.8 : 0.4}
                      className="transition-all duration-200"
                    />
                  );
                })}

                {/* Nodes */}
                {nodes.map(node => {
                  const isSelected = selectedNode === node.id;
                  const isHovered = hoveredNode === node.id;
                  const isConnected = selectedNode && node.connections.includes(selectedNode);

                  return (
                    <g key={node.id}>
                      {/* Node circle */}
                      <circle
                        cx={node.x}
                        cy={node.y}
                        r={node.radius}
                        fill={node.color}
                        stroke={isSelected ? '#1e40af' : '#ffffff'}
                        strokeWidth={isSelected ? 3 : 2}
                        opacity={isSelected || isConnected || !selectedNode ? 1 : 0.3}
                        className="cursor-pointer transition-all duration-200 hover:stroke-blue-500"
                        filter={isSelected ? "url(#glow)" : undefined}
                        onClick={() => handleNodeClick(node)}
                        onMouseEnter={() => setHoveredNode(node.id)}
                        onMouseLeave={() => setHoveredNode(null)}
                      />

                      {/* Node icon */}
                      <foreignObject
                        x={node.x - 8}
                        y={node.y - 8}
                        width="16"
                        height="16"
                        className="pointer-events-none"
                      >
                        <div className="text-white flex items-center justify-center">
                          {getNodeIcon(node.type)}
                        </div>
                      </foreignObject>

                      {/* Node label */}
                      <text
                        x={node.x}
                        y={node.y + node.radius + 15}
                        textAnchor="middle"
                        className="text-xs font-medium fill-slate-700 pointer-events-none"
                        opacity={zoom > 0.7 ? 1 : 0}
                      >
                        {node.title}
                      </text>

                      {/* Subtitle for issues */}
                      {node.subtitle && (
                        <text
                          x={node.x}
                          y={node.y + node.radius + 28}
                          textAnchor="middle"
                          className="text-xs fill-slate-500 pointer-events-none"
                          opacity={zoom > 0.8 ? 1 : 0}
                        >
                          {node.subtitle}
                        </text>
                      )}
                    </g>
                  );
                })}
              </g>
            </svg>

            {/* Node details panel */}
            {selectedNode && (
              <div className="absolute top-4 right-4 w-64">
                <Card className="bg-white/95 backdrop-blur-sm border shadow-lg">
                  <CardContent className="p-4">
                    {(() => {
                      const node = nodes.find(n => n.id === selectedNode);
                      if (!node) return null;

                      return (
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            {getNodeIcon(node.type)}
                            <span className="font-semibold text-sm capitalize">
                              {node.type}
                            </span>
                          </div>
                          
                          <div>
                            <h4 className="font-medium text-sm mb-1">{node.title}</h4>
                            {node.subtitle && (
                              <p className="text-xs text-muted-foreground">{node.subtitle}</p>
                            )}
                          </div>

                          {node.type === 'issue' && node.data && (
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <Badge 
                                  variant={node.data.state === 'open' ? 'default' : 'secondary'}
                                  className="text-xs"
                                >
                                  {node.data.state}
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                  #{node.data.number}
                                </span>
                              </div>
                              
                              {node.data.html_url && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="w-full h-8 text-xs"
                                  onClick={() => window.open(node.data.html_url, '_blank')}
                                >
                                  <ExternalLink className="h-3 w-3 mr-1" />
                                  View on GitHub
                                </Button>
                              )}
                            </div>
                          )}

                          <div className="text-xs text-muted-foreground">
                            Connected to {node.connections.length} nodes
                          </div>
                        </div>
                      );
                    })()}
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Legend */}
            <div className="absolute bottom-4 left-4">
              <Card className="bg-white/95 backdrop-blur-sm border shadow-lg">
                <CardContent className="p-3">
                  <div className="space-y-2">
                    <h4 className="font-medium text-xs text-slate-700 mb-2">Legend</h4>
                    <div className="flex items-center gap-2 text-xs">
                      <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                      <span>Repository</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      <span>User</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      <span>Open Issue</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      <span>Closed Issue</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
