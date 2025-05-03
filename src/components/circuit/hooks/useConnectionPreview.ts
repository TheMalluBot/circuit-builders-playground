
import { useState, useCallback } from 'react';
import { Node, Circuit, Component, Pin } from '@/types/circuit';
import { calculateWirePath } from '@/lib/interaction';
import { isNearPin } from '@/lib/simulator/utils/geometryUtils';

/**
 * Hook to manage wire connection previews with enhanced visual feedback
 * and smart wire routing with magnetic snapping
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
  const [magneticSnap, setMagneticSnap] = useState<{ 
    position: { x: number; y: number };
    active: boolean;
  }>({ position: { x: 0, y: 0 }, active: false });
  
  // Start connection from a pin
  const startConnection = useCallback((data: {
    nodeId: string | null;
    pinId: string;
    componentId: string;
    position: { x: number; y: number };
  }) => {
    console.log("Connection started from:", data);
    setConnectionStart(data);
  }, []);
  
  // Update connection end position during drag
  const updateConnectionEnd = useCallback((
    position: { x: number; y: number },
    nodeId: string | null,
    circuit: Circuit
  ) => {
    setCurrentMousePos(position);
    setHoveredNodeId(nodeId);
    
    // Check if we're near any pin for magnetic snapping
    let foundSnappablePin = false;
    
    if (circuit && connectionStart) {
      // Don't snap to the starting component's pins
      const componentsToCheck = circuit.components.filter(c => 
        c.id !== connectionStart.componentId
      );
      
      // Find the closest pin within snapping distance
      let closestDistance = 20; // Increased snap threshold
      let closestPin: { position: { x: number; y: number }; nodeId: string | null } | null = null;
      
      for (const comp of componentsToCheck) {
        for (const pin of comp.pins) {
          // Calculate actual pin position
          const radians = (comp.rotation || 0) * Math.PI / 180;
          const cos = Math.cos(radians);
          const sin = Math.sin(radians);
          
          const rotatedX = pin.position.x * cos - pin.position.y * sin;
          const rotatedY = pin.position.x * sin + pin.position.y * cos;
          
          const pinPos = {
            x: comp.position.x + rotatedX,
            y: comp.position.y + rotatedY
          };
          
          // Calculate distance
          const dx = position.x - pinPos.x;
          const dy = position.y - pinPos.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < closestDistance) {
            closestDistance = distance;
            closestPin = { 
              position: pinPos,
              nodeId: pin.nodeId || `${comp.id}-${pin.id}`
            };
            console.log("Found snappable pin:", closestPin.nodeId, "distance:", distance);
          }
        }
      }
      
      if (closestPin) {
        setMagneticSnap({ 
          position: closestPin.position,
          active: true 
        });
        setHoveredNodeId(closestPin.nodeId);
        foundSnappablePin = true;
      }
    }
    
    if (!foundSnappablePin) {
      setMagneticSnap({ position: { x: 0, y: 0 }, active: false });
    }
  }, [connectionStart]);
  
  // Reset connection state
  const resetConnection = useCallback(() => {
    console.log("Connection reset");
    setConnectionStart(null);
    setHoveredNodeId(null);
    setMagneticSnap({ position: { x: 0, y: 0 }, active: false });
  }, []);
  
  // Get smart wire path for preview
  const getPreviewPath = useCallback((circuit: Circuit) => {
    if (!connectionStart) return { path: [], isValidTarget: false, endPos: { x: 0, y: 0 } };
    
    // Use magnetic snapping position if active, otherwise use mouse position
    const endPos = magneticSnap.active 
      ? magneticSnap.position 
      : currentMousePos;
    
    // Determine if this is a valid target
    const isValidTarget = !!hoveredNodeId && 
        hoveredNodeId !== connectionStart.nodeId && 
        connectionStart.componentId !== (circuit?.components.find(c => 
          c.pins.some(p => p.nodeId === hoveredNodeId))?.id || "");
    
    // Calculate path with smart routing (L-shaped)
    const path = calculateSmartWirePath(connectionStart.position, endPos);
    
    return {
      path,
      isValidTarget,
      endPos
    };
  }, [connectionStart, currentMousePos, hoveredNodeId, magneticSnap]);

  // Improved L-shaped wire routing algorithm
  const calculateSmartWirePath = (start: { x: number; y: number }, end: { x: number; y: number }) => {
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);
    
    // If points are very close, just use a direct line
    if (absDx < 10 && absDy < 10) {
      return [start, end];
    }
    
    // Determine the bend point based on which dimension is larger
    // This creates more natural-looking L-shaped paths
    const bendPoint = { x: 0, y: 0 };
    
    if (absDx > absDy) {
      // Horizontal distance is greater, bend vertically first
      bendPoint.x = start.x + dx;
      bendPoint.y = start.y;
    } else {
      // Vertical distance is greater, bend horizontally first
      bendPoint.x = start.x;
      bendPoint.y = start.y + dy;
    }
    
    // Return the three points for the L-shaped wire
    return [
      { x: start.x, y: start.y },
      bendPoint,
      { x: end.x, y: end.y }
    ];
  };
  
  return {
    connectionStart,
    currentMousePos,
    hoveredNodeId,
    magneticSnap,
    startConnection,
    updateConnectionEnd,
    resetConnection,
    getPreviewPath,
    isConnecting: !!connectionStart
  };
}
