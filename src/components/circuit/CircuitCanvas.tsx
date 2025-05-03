
import React, { useRef, useEffect, useCallback } from 'react';
import { Circuit, ComponentType } from '@/types/circuit';
import { useCanvasInteractions } from './hooks/useCanvasInteractions';
import { useCanvasDrawing } from './hooks/useCanvasDrawing';
import { useWireManipulation } from './hooks/useWireManipulation';
import { resizeCanvas } from './utils/CanvasUtils';
import { findHoveredItem } from './utils/ItemFinder';

interface CircuitCanvasProps {
  circuit: Circuit;
  selectedComponent: ComponentType | null;
  onAddComponent: (type: ComponentType, x: number, y: number) => void;
  onConnectNodes: (sourceId: string, targetId: string) => void;
  onUpdateWirePath: (wireId: string, newPath: { x: number; y: number }[]) => void;
  onToggleSwitch: (componentId: string) => void;
  showVoltages: boolean;
  showCurrents: boolean;
  isRunning: boolean;
}

export function CircuitCanvas({
  circuit,
  selectedComponent,
  onAddComponent,
  onConnectNodes,
  onUpdateWirePath,
  onToggleSwitch,
  showVoltages,
  showCurrents,
  isRunning
}: CircuitCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Set up wire manipulation - fixed integration with other hooks
  const {
    draggedWire,
    selectedWireId,
    startDragControlPoint,
    dragControlPoint,
    endDragControlPoint,
    addControlPoint,
    selectWire
  } = useWireManipulation(onUpdateWirePath);

  // Set up canvas interactions with enhanced wire connection experience
  const {
    hoveredItem,
    hoveredNodeId,
    connectionPreview,
    handleCanvasClick,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    isDragging
  } = useCanvasInteractions(canvasRef, circuit, {
    selectedComponent,
    onAddComponent,
    onConnectNodes,
    onToggleSwitch,
    selectedWireId,
    selectWire
  });
  
  // Handle canvas resizing
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Set canvas size
    const handleResize = () => canvas && resizeCanvas(canvas);
    handleResize();
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Custom mouse handlers for wire manipulation
  const handleMouseDownWithWireManipulation = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Check if clicking on a wire control point
    const item = findHoveredItem(circuit, x, y);
    
    if (item?.type === 'wireControlPoint' && item.wireId && item.pointIndex !== undefined) {
      startDragControlPoint(item.wireId, item.pointIndex, { x, y });
      e.preventDefault(); // Prevent default to ensure drag works properly
      return;
    }
    
    if (item?.type === 'wireSegment' && item.wireId && item.segmentIndex !== undefined) {
      // Get midpoint of segment to add a new control point
      const midX = (item.start.x + item.end.x) / 2;
      const midY = (item.start.y + item.end.y) / 2;
      
      addControlPoint(item.wireId, item.segmentIndex, { x: midX, y: midY }, circuit);
      e.preventDefault();
      return;
    }
    
    if (item?.type === 'wire') {
      selectWire(item.id);
      e.preventDefault();
      return;
    } else if (!item) {
      // Clicking empty space, deselect wire
      selectWire(null);
    }
    
    // Fall back to regular mouse handler
    handleMouseDown(e);
  }, [handleMouseDown, circuit, startDragControlPoint, addControlPoint, selectWire]);
  
  const handleMouseMoveWithWireManipulation = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Check if we're dragging a wire control point
    if (draggedWire) {
      dragControlPoint({ x, y }, circuit);
      e.preventDefault();
      return;
    }
    
    // Fall back to regular mouse handler
    handleMouseMove(e);
  }, [handleMouseMove, draggedWire, dragControlPoint, circuit]);
  
  const handleMouseUpWithWireManipulation = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    // End wire control point dragging if active
    if (draggedWire) {
      endDragControlPoint();
      e.preventDefault();
      return;
    }
    
    // Fall back to regular mouse handler
    handleMouseUp(e);
  }, [handleMouseUp, draggedWire, endDragControlPoint]);
  
  // Set up canvas drawing with enhanced wire preview and wire selection
  useCanvasDrawing(canvasRef, circuit, {
    showVoltages,
    showCurrents,
    hoveredNodeId,
    selectedWireId,
    connectionPreview: {
      getPreviewPath: (c: Circuit) => connectionPreview.getPreviewPath(c),
      connectionStart: connectionPreview.connectionStart,
      isConnecting: connectionPreview.isConnecting,
      magneticSnap: connectionPreview.magneticSnap
    }
  });
  
  // Determine cursor based on current state for better visual feedback
  const getCursor = () => {
    if (draggedWire) return 'grabbing';
    if (hoveredItem?.type === 'wireControlPoint') return 'pointer';
    if (hoveredItem?.type === 'wireSegment') return 'pointer';
    if (selectedComponent) return 'crosshair';
    if (connectionPreview.isConnecting) return 'crosshair';
    if (hoveredItem?.type === 'pin') return 'pointer';
    if (isDragging) return 'grabbing';
    return 'default';
  };
  
  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full"
      onClick={handleCanvasClick}
      onMouseDown={handleMouseDownWithWireManipulation}
      onMouseMove={handleMouseMoveWithWireManipulation}
      onMouseUp={handleMouseUpWithWireManipulation}
      onMouseLeave={handleMouseUpWithWireManipulation}
      style={{ cursor: getCursor() }}
    />
  );
}
