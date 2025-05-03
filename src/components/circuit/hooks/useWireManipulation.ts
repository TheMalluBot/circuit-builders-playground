
import { useState, useCallback } from 'react';
import { Wire, Circuit } from '@/types/circuit';

export function useWireManipulation(
  onUpdateWirePath: (wireId: string, newPath: { x: number, y: number }[]) => void
) {
  // Track which wire and point are being dragged
  const [draggedWire, setDraggedWire] = useState<{
    wireId: string;
    pointIndex: number;
    startPos: { x: number; y: number };
  } | null>(null);
  
  // Track the selected wire for manipulation
  const [selectedWireId, setSelectedWireId] = useState<string | null>(null);
  
  /**
   * Start dragging a wire control point
   */
  const startDragControlPoint = useCallback((
    wireId: string,
    pointIndex: number,
    position: { x: number; y: number }
  ) => {
    setDraggedWire({
      wireId,
      pointIndex,
      startPos: position
    });
    setSelectedWireId(wireId);
  }, []);
  
  /**
   * Handle dragging of a wire control point
   */
  const dragControlPoint = useCallback((
    position: { x: number; y: number },
    circuit: Circuit
  ) => {
    if (!draggedWire) return;
    
    // Find the wire being manipulated
    const wire = circuit.wires.find(w => w.id === draggedWire.wireId);
    if (!wire || !wire.path) return;
    
    // Create a copy of the path
    const newPath = [...wire.path];
    
    // Update the position of the dragged point
    newPath[draggedWire.pointIndex] = {
      x: position.x,
      y: position.y
    };
    
    // For endpoints, make sure they stay connected to the nodes
    if (draggedWire.pointIndex > 0 && draggedWire.pointIndex < newPath.length - 1) {
      // When dragging middle points, we might need to update adjacent segments
      // This is a simple implementation - more advanced routing would adjust connected segments
      
      // If dragging a middle point, we might want to maintain right angles
      // For example, if the point is part of an L-shaped segment:
      // In this basic implementation, we'll allow free movement
    }
    
    // Update the wire path
    onUpdateWirePath(draggedWire.wireId, newPath);
  }, [draggedWire, onUpdateWirePath]);
  
  /**
   * Add a new control point to a wire segment
   */
  const addControlPoint = useCallback((
    wireId: string,
    segmentIndex: number,
    position: { x: number; y: number },
    circuit: Circuit
  ) => {
    const wire = circuit.wires.find(w => w.id === wireId);
    if (!wire || !wire.path || wire.path.length <= segmentIndex) return;
    
    // Create a new path with the point inserted
    const newPath = [...wire.path];
    newPath.splice(segmentIndex + 1, 0, position);
    
    // Update the wire
    onUpdateWirePath(wireId, newPath);
    
    // Select the wire for further manipulation
    setSelectedWireId(wireId);
  }, [onUpdateWirePath]);
  
  /**
   * End control point dragging
   */
  const endDragControlPoint = useCallback(() => {
    setDraggedWire(null);
  }, []);
  
  /**
   * Select a wire for manipulation
   */
  const selectWire = useCallback((wireId: string | null) => {
    setSelectedWireId(wireId);
  }, []);
  
  return {
    draggedWire,
    selectedWireId,
    startDragControlPoint,
    dragControlPoint,
    endDragControlPoint,
    addControlPoint,
    selectWire,
  };
}
