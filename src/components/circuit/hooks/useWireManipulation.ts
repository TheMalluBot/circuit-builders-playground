
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
    x: number,
    y: number
  ) => {
    console.log(`Starting to drag control point ${pointIndex} of wire ${wireId}`);
    setDraggedWire({
      wireId,
      pointIndex,
      startPos: { x, y }
    });
    setSelectedWireId(wireId);
  }, []);
  
  /**
   * Handle dragging of a wire control point
   */
  const dragControlPoint = useCallback((
    x: number,
    y: number,
    circuit?: Circuit
  ) => {
    if (!draggedWire) return;
    
    // If no circuit provided, just update the control point position
    if (!circuit) {
      const newPosition = { x, y };
      onUpdateWirePath(draggedWire.wireId, [newPosition]);
      return;
    }
    
    // Find the wire being manipulated
    const wire = circuit.wires.find(w => w.id === draggedWire.wireId);
    if (!wire || !wire.path) return;
    
    // Create a copy of the path
    const newPath = [...wire.path];
    
    // Update the position of the dragged point
    newPath[draggedWire.pointIndex] = { x, y };
    
    // If dragging first or last point, handle attachment to nodes
    if (draggedWire.pointIndex === 0 || draggedWire.pointIndex === newPath.length - 1) {
      // Find attached node positions to maintain connections
      const nodeIndex = draggedWire.pointIndex === 0 ? 0 : 1;
      const nodeId = wire.nodeIds[nodeIndex];
      
      // Find the node position from the circuit
      const node = circuit.nodes.find(n => n.id === nodeId);
      
      // If node exists, keep the endpoint attached to the node
      if (node) {
        newPath[draggedWire.pointIndex] = { ...node.position };
      }
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
    circuit?: Circuit
  ) => {
    if (circuit) {
      const wire = circuit.wires.find(w => w.id === wireId);
      if (!wire || !wire.path || wire.path.length <= segmentIndex) return;
      
      console.log(`Adding control point to wire ${wireId} at segment ${segmentIndex}`);
      
      // Create a new path with the point inserted
      const newPath = [...wire.path];
      newPath.splice(segmentIndex + 1, 0, position);
      
      // Update the wire
      onUpdateWirePath(wireId, newPath);
    } else {
      // Simplified version for when circuit isn't provided
      console.log(`Adding control point to wire ${wireId} at segment ${segmentIndex}`);
      onUpdateWirePath(wireId, [position]);
    }
    
    // Select the wire for further manipulation
    setSelectedWireId(wireId);
  }, [onUpdateWirePath]);
  
  /**
   * End control point dragging
   */
  const endDragControlPoint = useCallback(() => {
    console.log(`End dragging control point`);
    setDraggedWire(null);
  }, []);
  
  /**
   * Select a wire for manipulation
   */
  const selectWire = useCallback((wireId: string | null) => {
    console.log(`Wire ${wireId || 'none'} selected`);
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
