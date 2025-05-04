
import { useCallback, useState, RefObject } from 'react';
import { Circuit, ComponentType, CircuitItemType } from '@/types/circuit';
import { useCanvasHover } from './interactions/useCanvasHover';
import { useComponentPlacement } from './interactions/useComponentPlacement'; 
import { useConnectionManager } from './interactions/useConnectionManager';
import { useComponentMovement } from './interactions/useComponentMovement';
import { useCanvasMousePosition } from './interactions/useCanvasMousePosition';
import { findHoveredItem } from '../utils/ItemFinder';

interface CanvasInteractionOptions {
  selectedComponent: ComponentType | null;
  onAddComponent: (type: ComponentType, x: number, y: number) => void;
  onConnectNodes: (sourceId: string, targetId: string) => void;
  onToggleSwitch: (componentId: string) => void;
  selectedWireId: string | null;
  selectWire: (wireId: string | null) => void;
  onMoveComponent?: (id: string, dx: number, dy: number) => void;
  onMoveComplete?: () => void;
  onDragStart?: () => void;
  onConnectionStart?: () => void;
  onOperationComplete?: () => void;
}

export function useCanvasInteractions(
  canvasRef: RefObject<HTMLCanvasElement>,
  circuit: Circuit,
  options: CanvasInteractionOptions
) {
  const {
    selectedComponent,
    onAddComponent,
    onConnectNodes,
    onToggleSwitch,
    selectedWireId,
    selectWire,
    onMoveComponent,
    onMoveComplete,
    onDragStart,
    onConnectionStart,
    onOperationComplete
  } = options;

  // Compose the smaller hooks
  const { clickStartPosition, getCanvasCoords, setStartPosition, resetStartPosition } = useCanvasMousePosition(canvasRef);
  const { hoveredItem, hoveredNodeId, updateHoverState, resetHoverState } = useCanvasHover(canvasRef, circuit);
  const { handleCanvasClick } = useComponentPlacement(canvasRef, selectedComponent, onAddComponent);
  const { connectionPreview, startConnection, updateConnection, completeConnection } = useConnectionManager(canvasRef, circuit, onConnectNodes);
  const { isDragging, hasDragged, startComponentDrag, updateComponentDrag, completeComponentDrag } = useComponentMovement(canvasRef, onMoveComponent, onMoveComplete);

  // Handle mouse down on canvas
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!canvasRef.current) return;
    
    const coords = setStartPosition(e);
    const item = findHoveredItem(circuit, coords.x, coords.y);
    
    if (item) {
      // Start dragging component
      if (item.type === 'component') {
        startComponentDrag(e, item.id);
        if (onDragStart) {
          onDragStart();
        }
      }
      
      // Select wire if clicked on wire or wire segment
      if (item.type === 'wire' || item.type === 'wireSegment') {
        selectWire(item.id);
      }
      
      // Handle connection start
      if (item.type === 'pin') {
        startConnection(e, item.id, item.pinId || "", item.componentId || "");
        
        if (onConnectionStart) {
          onConnectionStart();
        }
      }
    }
  }, [circuit, setStartPosition, startComponentDrag, selectWire, startConnection, onDragStart, onConnectionStart]);

  // Handle mouse move on canvas
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!canvasRef.current) return;
    
    const item = updateHoverState(e);
    
    // Update connection preview
    if (connectionPreview.isConnecting) {
      updateConnection(e, item?.type === 'pin' ? item.id : null);
    }
    
    // Handle component dragging
    if (isDragging && hoveredItem?.type === 'component') {
      updateComponentDrag(e, hoveredItem.id);
    }
  }, [updateHoverState, connectionPreview.isConnecting, updateConnection, isDragging, hoveredItem, updateComponentDrag]);

  // Handle mouse up on canvas
  const handleMouseUp = useCallback((e: React.MouseEvent) => {
    if (!canvasRef.current) return;
    
    // Handle connection end
    if (connectionPreview.isConnecting) {
      completeConnection(e);
    }
    
    // Handle end of component drag
    if (isDragging && hoveredItem?.type === 'component') {
      completeComponentDrag();
    }
    
    resetStartPosition();
    resetHoverState();
  }, [connectionPreview.isConnecting, completeConnection, isDragging, hoveredItem, completeComponentDrag, resetStartPosition, resetHoverState]);
  
  // Handle canvas click for component placement
  const handleCanvasClick = useCallback((e: React.MouseEvent) => {
    handleCanvasClick(e, hasDragged);
  }, [handleCanvasClick, hasDragged]);

  return {
    hoveredItem,
    hoveredNodeId,
    connectionPreview,
    handleCanvasClick,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    isDragging
  };
}
