"use client";

import { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';

// Define node types
type NodeType = 'Bug' | 'Story' | 'HLD' | 'Task' | 'Epic' | 'Requirement';
type StatusType = 'Open' | 'In Progress' | 'Done' | 'Closed' | 'Approved' | 'Rejected';
type PriorityType = 'Low' | 'Medium' | 'High' | 'Critical';

// Define custom node data interface
interface CustomNodeData {
  label: string;
  type: NodeType;
  id: string;
  description: string;
  status: StatusType;
  priority?: PriorityType;
  points?: number;
  version?: string;
}

// Define node type colors
const nodeTypeColors: Record<NodeType, string> = {
  'Bug': '#f87171', // red-400
  'Story': '#60a5fa', // blue-400
  'HLD': '#34d399', // emerald-400
  'Task': '#a78bfa', // violet-400
  'Epic': '#f59e0b', // amber-500
  'Requirement': '#8b5cf6', // violet-500
};

// Define status colors
const statusColors: Record<StatusType, string> = {
  'Open': '#f97316', // orange-500
  'In Progress': '#3b82f6', // blue-500
  'Done': '#22c55e', // green-500
  'Closed': '#6b7280', // gray-500
  'Approved': '#8b5cf6', // violet-500
  'Rejected': '#ef4444', // red-500
};

// Custom node component
function CustomNode({ data, isConnectable }: NodeProps) {  
  // Type assertion for data
  const nodeData = data as unknown as CustomNodeData;
  // Get color based on node type
  const backgroundColor = nodeTypeColors[nodeData.type] || '#cbd5e1';
  const statusColor = statusColors[nodeData.status] || '#cbd5e1';
  
  return (
    <div className="relative p-0.5">
      {/* Source handle (top) */}
      <Handle
        type="source"
        position={Position.Top}
        isConnectable={isConnectable}
        className="w-3 h-3 bg-blue-500"
      />
      
      {/* Node content */}
      <div className="rounded-md border shadow-sm bg-white w-[200px] overflow-hidden">
        {/* Header with type color */}
        <div 
          className="px-3 py-1 text-white text-sm font-medium"
          style={{ backgroundColor }}
        >
          {nodeData.type}: {nodeData.id}
        </div>
        
        {/* Content */}
        <div className="p-3 text-sm">
          <div className="font-medium mb-1 truncate">{nodeData.label.split(': ')[1]}</div>
          <div className="text-xs text-gray-500 mb-2 line-clamp-2">{nodeData.description}</div>
          
          {/* Additional fields based on type */}
          <div className="flex flex-col gap-1 text-xs">
            {nodeData.type === 'Bug' && nodeData.priority && (
              <>
                <div className="flex justify-between">
                  <span className="text-gray-500">Priority:</span>
                  <span className={`font-medium ${nodeData.priority === 'Critical' ? 'text-red-600' : ''}`}>
                    {nodeData.priority}
                  </span>
                </div>
              </>
            )}
            
            {nodeData.type === 'Story' && nodeData.points !== undefined && (
              <div className="flex justify-between">
                <span className="text-gray-500">Points:</span>
                <span className="font-medium">{nodeData.points}</span>
              </div>
            )}
            
            {nodeData.type === 'HLD' && nodeData.version && (
              <div className="flex justify-between">
                <span className="text-gray-500">Version:</span>
                <span className="font-medium">{nodeData.version}</span>
              </div>
            )}
            
            {/* Status for all types */}
            <div className="flex justify-between items-center mt-1">
              <span className="text-gray-500">Status:</span>
              <span 
                className="px-1.5 py-0.5 rounded-full text-[10px] text-white font-medium"
                style={{ backgroundColor: statusColor }}
              >
                {nodeData.status}
              </span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Target handle (bottom) */}
      <Handle
        type="target"
        position={Position.Bottom}
        isConnectable={isConnectable}
        className="w-3 h-3 bg-blue-500"
      />
    </div>
  );
}

export default memo(CustomNode);
