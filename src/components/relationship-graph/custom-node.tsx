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

// Define node type colors - professional, enterprise-grade palette
const nodeTypeColors: Record<NodeType, string> = {
  'Bug': '#dc2626', // red-600 (professional red)
  'Story': '#1e40af', // blue-700 (professional blue)
  'HLD': '#059669', // emerald-600 (professional green)
  'Task': '#7c3aed', // violet-600 (professional purple)
  'Epic': '#d97706', // amber-600 (professional orange)
  'Requirement': '#6366f1', // indigo-500 (professional indigo)
};

// Define status colors - muted, professional palette
const statusColors: Record<StatusType, string> = {
  'Open': '#ea580c', // orange-600 (professional orange)
  'In Progress': '#2563eb', // blue-600 (professional blue)
  'Done': '#16a34a', // green-600 (professional green)
  'Closed': '#64748b', // slate-500 (professional gray)
  'Approved': '#7c3aed', // violet-600 (professional purple)
  'Rejected': '#dc2626', // red-600 (professional red)
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
