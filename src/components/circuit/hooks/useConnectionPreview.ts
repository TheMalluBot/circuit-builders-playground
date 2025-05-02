
import { useState, useCallback } from 'react';
import { Node, Circuit } from '@/types/circuit';
import { calculateWirePath } from '@/lib/interaction';

/**
 * Hook to manage wire connection previews with enhanced visual feedback
 * and smart wire routing
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
  
  // Start connection from a pin
  const startConnection = useCallback((data: {
    nodeId: string | null;
    pinId: string;
    componentId: string;
    position: { x: number; y: number };
  }) => {
    setConnectionStart(data);
  }, []);
  
  // Update connection end position during drag
  const updateConnectionEnd = useCallback((
    position: { x: number; y: number },
    nodeId: string | null
  ) => {
    setCurrentMousePos(position);
    setHoveredNodeId(nodeId);
  }, []);
  
  // Reset connection state
  const resetConnection = useCallback(() => {
    setConnectionStart(null);
    setHoveredNodeId(null);
  }, []);
  
  // Get smart wire path for preview
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
      } else {
        // Check if it's a pin's node ID
        for (const component of circuit.components) {
          for (const pin of component.pins) {
            if (pin.nodeId === hoveredNodeId) {
              // Found matching pin, use its position
              const pinPos = calculatePinPosition(component, pin);
              if (pinPos) {
                endPos = pinPos;
                isValidTarget = true;
                break;
              }
            }
          }
          if (isValidTarget) break;
        }
      }
    }
    
    // Calculate path with smart routing
    const path = calculateWirePath(connectionStart.position, endPos);
    
    return {
      path,
      isValidTarget,
      endPos
    };
  }, [connectionStart, currentMousePos, hoveredNodeId]);
  
  // Calculate absolute position of a pin based on component position and rotation
  const calculatePinPosition = (component: any, pin: any): { x: number; y: number } => {
    const radians = (component.rotation * Math.PI) / 180;
    const cos = Math.cos(radians);
    const sin = Math.sin(radians);
    
    // Apply rotation transformation
    const rotatedX = pin.position.x * cos - pin.position.y * sin;
    const rotatedY = pin.position.x * sin + pin.position.y * cos;
    
    // Add component position to get absolute pin position
    return {
      x: component.position.x + rotatedX,
      y: component.position.y + rotatedY
    };
  };
  
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
