
import React from 'react';
import { getNodePositionFromId } from '@/lib/simulator/utils/geometryUtils';
import { SimulationState } from '@/lib/simulator/types';

interface NodeHighlightProps {
  nodeId: string | null;
  wireStart: { x: number; y: number } | null;
  simulationState: SimulationState | null;
}

/**
 * Component that highlights nodes during hover
 */
export const NodeHighlight: React.FC<NodeHighlightProps> = ({ 
  nodeId, 
  wireStart,
  simulationState 
}) => {
  if (!nodeId || wireStart) return null;
  
  // If we don't have simulationState, we can't determine the position
  if (!simulationState) return null;
  
  const nodePosition = getNodePositionFromId(nodeId, simulationState.components);
  
  return (
    <div 
      className="absolute w-3 h-3 bg-blue-500 rounded-full pointer-events-none"
      style={{ 
        left: nodePosition.x - 6, 
        top: nodePosition.y - 6,
        zIndex: 5
      }}
    />
  );
};
