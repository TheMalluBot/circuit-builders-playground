
import { useState, useCallback } from 'react';
import { Node, Circuit } from '@/types/circuit';
import { calculateWirePath } from '@/lib/interaction';

/**
 * Hook to manage wire connection previews
 */
export function useConnectionPreview() {
  // Connection state for wire drawing
  const [connectionStart, setConnectionStart] = useState<{
    nodeId: string | null;
    pinId: string;
    componentId: string;
    position: { x: number; y: number };
  } | null>(null);
  
  const [currentMousePos, setCurrentMousePos] = useState({ x: 0, y: 0 });
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  
  const startConnection = useCallback((data: {
    nodeId: string | null;
    pinId: string;
    componentId: string;
    position: { x: number; y: number };
  }) => {
    setConnectionStart(data);
  }, []);
  
  const updateConnectionEnd = useCallback((
    position: { x: number; y: number },
    nodeId: string | null
  ) => {
    setCurrentMousePos(position);
    setHoveredNodeId(nodeId);
  }, []);
  
  const resetConnection = useCallback(() => {
    setConnectionStart(null);
    setHoveredNodeId(null);
  }, []);
  
  const getPreviewPath = useCallback((circuit: Circuit) => {
    if (!connectionStart || !currentMousePos) return null;
    
    // Find target node position if hovering over one
    let endPos = currentMousePos;
    let isValidTarget = false;
    
    if (hoveredNodeId) {
      const targetNode = circuit.nodes.find(n => n.id === hoveredNodeId);
      if (targetNode) {
        endPos = targetNode.position;
        isValidTarget = true;
      }
    }
    
    // Calculate path
    const path = calculateWirePath(connectionStart.position, endPos);
    
    return {
      path,
      isValidTarget,
      endPos
    };
  }, [connectionStart, currentMousePos, hoveredNodeId]);
  
  return {
    connectionStart,
    currentMousePos,
    hoveredNodeId,
    startConnection,
    updateConnectionEnd,
    resetConnection,
    getPreviewPath,
    isConnecting: !!connectionStart
  };
}
