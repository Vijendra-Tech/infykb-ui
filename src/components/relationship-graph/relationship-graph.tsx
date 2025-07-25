"use client";

import { useState, useCallback, useEffect } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Panel,
  MarkerType,
  NodeTypes,
  Connection,
  BackgroundVariant,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Search, Maximize2, RefreshCw } from 'lucide-react';
// Import the custom node component
import CustomNode from './custom-node';

// Define node data types (commented out as unused)
// type NodeType = 'Bug' | 'Story' | 'HLD' | 'Task' | 'Epic' | 'Requirement';
// type StatusType = 'Open' | 'In Progress' | 'Done' | 'Closed' | 'Approved' | 'Rejected';
// type PriorityType = 'Low' | 'Medium' | 'High' | 'Critical';

// interface CustomNodeData {
//   label: string;
//   type: NodeType;
//   id: string;
//   description: string;
//   status: StatusType;
//   priority?: PriorityType;
//   points?: number;
//   version?: string;
// }

// Define custom node types
const nodeTypes: NodeTypes = {
  custom: CustomNode,
};

// Define node types with their colors
const nodeTypeColors = {
  'Bug': '#f87171', // red-400
  'Story': '#60a5fa', // blue-400
  'HLD': '#34d399', // emerald-400
  'Task': '#a78bfa', // violet-400
  'Epic': '#f59e0b', // amber-500
  'Requirement': '#8b5cf6', // violet-500
};

// Sample initial data - in a real app, this would come from your API
const initialNodes = [
  {
    id: 'bug-1',
    type: 'custom',
    data: { 
      label: 'Bug: Login Failure',
      type: 'Bug',
      id: 'BUG-101',
      description: 'Users unable to login with correct credentials',
      priority: 'High',
      status: 'In Progress'
    },
    position: { x: 250, y: 50 },
  },
  {
    id: 'story-1',
    type: 'custom',
    data: { 
      label: 'Story: Auth System',
      type: 'Story',
      id: 'STORY-42',
      description: 'Implement secure authentication system',
      points: 8,
      status: 'In Progress'
    },
    position: { x: 250, y: 200 },
  },
  {
    id: 'hld-1',
    type: 'custom',
    data: { 
      label: 'HLD: Security Architecture',
      type: 'HLD',
      id: 'HLD-7',
      description: 'High-level design for system security',
      version: '2.1',
      status: 'Approved'
    },
    position: { x: 250, y: 350 },
  },
  {
    id: 'bug-2',
    type: 'custom',
    data: { 
      label: 'Bug: Data Loss',
      type: 'Bug',
      id: 'BUG-102',
      description: 'Intermittent data loss during form submission',
      priority: 'Critical',
      status: 'Open'
    },
    position: { x: 500, y: 100 },
  },
  {
    id: 'story-2',
    type: 'custom',
    data: { 
      label: 'Story: Form Handling',
      type: 'Story',
      id: 'STORY-45',
      description: 'Implement robust form handling with validation',
      points: 5,
      status: 'In Progress'
    },
    position: { x: 500, y: 250 },
  },
];

const initialEdges = [
  {
    id: 'e1-2',
    source: 'bug-1',
    target: 'story-1',
    animated: true,
    label: 'blocks',
    labelBgStyle: { fill: '#f3f4f6' },
    markerEnd: {
      type: MarkerType.ArrowClosed,
    },
  },
  {
    id: 'e2-3',
    source: 'story-1',
    target: 'hld-1',
    animated: true,
    label: 'implements',
    labelBgStyle: { fill: '#f3f4f6' },
    markerEnd: {
      type: MarkerType.ArrowClosed,
    },
  },
  {
    id: 'e4-5',
    source: 'bug-2',
    target: 'story-2',
    animated: true,
    label: 'affects',
    labelBgStyle: { fill: '#f3f4f6' },
    markerEnd: {
      type: MarkerType.ArrowClosed,
    },
  },
  {
    id: 'e5-3',
    source: 'story-2',
    target: 'hld-1',
    animated: true,
    label: 'implements',
    labelBgStyle: { fill: '#f3f4f6' },
    markerEnd: {
      type: MarkerType.ArrowClosed,
    },
  },
];

export function RelationshipGraph() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Handle connections between nodes
  const onConnect = useCallback((params: Connection) => {
    setEdges((eds) => addEdge({ 
      ...params,
      id: `${params.source}-${params.target}`,
      animated: true,
      label: 'relates to',
      labelBgStyle: { fill: '#f3f4f6' },
      markerEnd: {
        type: MarkerType.ArrowClosed,
      },
    }, eds));
  }, [setEdges]);

  // Filter nodes based on search term and type
  useEffect(() => {
    setNodes((nds) =>
      nds.map((node) => {
        // Check if node matches search term
        const matchesSearch = searchTerm === '' || 
          node.data.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
          node.data.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          node.data.description.toLowerCase().includes(searchTerm.toLowerCase());
        
        // Check if node matches filter type
        const matchesType = !filterType || filterType === 'all' || node.data.type === filterType;
        
        // Set hidden property based on matches
        return {
          ...node,
          hidden: !(matchesSearch && matchesType),
        };
      })
    );
  }, [searchTerm, filterType, setNodes]);

  // Toggle fullscreen mode
  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
  };

  // Simulate loading new data
  const refreshData = () => {
    setIsLoading(true);
    setTimeout(() => {
      // In a real app, you would fetch new data here
      setIsLoading(false);
    }, 1000);
  };

  return (
    <Card className={`${isFullScreen ? 'fixed inset-0 z-50 rounded-none' : 'w-full h-[600px]'}`}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle>Relationship Graph</CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={toggleFullScreen}>
              <Maximize2 className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={refreshData} disabled={isLoading}>
              {isLoading ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0 h-full">
        <div className="h-full w-full">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            fitView
          >
            <Controls />
            <MiniMap />
            <Background variant={"dots" as BackgroundVariant} gap={12} size={1} />
            <Panel position="top-left" className="bg-white p-2 rounded-md shadow-md">
              <div className="flex flex-col gap-2 w-64">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search nodes..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>
                <Select value={filterType || 'all'} onValueChange={(value) => setFilterType(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="Bug">Bug</SelectItem>
                    <SelectItem value="Story">Story</SelectItem>
                    <SelectItem value="HLD">HLD</SelectItem>
                    <SelectItem value="Task">Task</SelectItem>
                    <SelectItem value="Epic">Epic</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </Panel>
            <Panel position="bottom-center" className="bg-white px-4 py-3 rounded-t-md shadow-md mb-1">
              <div className="flex flex-wrap justify-center gap-6">
                {Object.entries(nodeTypeColors).map(([type, color]) => (
                  <div key={type} className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: color }}></div>
                    <span className="text-xs font-medium">{type}</span>
                  </div>
                ))}
              </div>
            </Panel>
          </ReactFlow>
        </div>
      </CardContent>
    </Card>
  );
}
