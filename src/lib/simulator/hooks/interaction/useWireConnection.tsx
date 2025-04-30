
import { useState, useCallback } from 'react';
import { useSimulation } from '../../context/useSimulation';
import { isNearPin } from '../../utils/geometryUtils';

export const useWireConnection = () => {
  const { createWire } = useSimulation();
  
  // Wire connection state
  const [wireStart, setWireStart] = useState<{nodeId: string; x: number; y: number} | null>(null);
  const [tempWireEnd, setTempWireEnd] = useState<{x: number, y: number} | null>(null);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  
  /**
   * Start wire creation
   */
  const startWireCreation = useCallback((nodeId: string, coords: { x: number, y: number }) => {
    setWireStart({
      nodeId: nodeId,
      x: coords.x,
      y: coords.y
    });
    setTempWireEnd(coords);
  }, []);
  
  /**
   * Update wire end position
   */
  const updateWireEnd = useCallback((coords: { x: number, y: number }, components: any[]) => {
    setTempWireEnd(coords);
    
    // Check if hovering over a pin
    let foundNode = false;
    if (wireStart) {
      for (const comp of components) {
        for (const pin of comp.pins) {
          const actualPinPos = {
            x: pin.position.x + comp.position.x,
            y: pin.position.y + comp.position.y
          };
          
          if (isNearPin(coords, actualPinPos) && pin.nodeId !== wireStart.nodeId) {
            setHoveredNodeId(pin.nodeId || `${comp.id}-${pin.id}`);
            foundNode = true;
            break;
          }
        }
        if (foundNode) break;
      }
      
      if (!foundNode) {
        setHoveredNodeId(null);
      }
    }
  }, [wireStart]);
  
  /**
   * Complete wire creation
   */
  const completeWireCreation = useCallback(() => {
    // Create wire if connecting two pins
    if (wireStart && hoveredNodeId && wireStart.nodeId !== hoveredNodeId) {
      createWire(wireStart.nodeId, hoveredNodeId);
    }
    
    // Reset wire creation state
    setWireStart(null);
    setTempWireEnd(null);
  }, [wireStart, hoveredNodeId, createWire]);
  
  return {
    wireStart,
    tempWireEnd,
    hoveredNodeId,
    setHoveredNodeId,
    startWireCreation,
    updateWireEnd,
    completeWireCreation
  };
};
