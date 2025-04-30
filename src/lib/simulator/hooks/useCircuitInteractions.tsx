
import { useState, useCallback, useRef, useEffect } from 'react';
import { useSimulation } from '../context/useSimulation';
import { isInsideComponent } from '../utils/geometryUtils';
import { DragInfo } from '@/types/simulator';
import { useWireConnection } from './interaction/useWireConnection';
import { useComponentDrag } from './interaction/useComponentDrag';
import { useDragAndDrop } from './interaction/useDragAndDrop';
import { useCanvasInteraction } from './interaction/useCanvasInteraction';

export const useCircuitInteractions = () => {
  const {
    addComponent,
    selectComponent,
    moveComponent,
    createWire,
    simulationState,
    isRunning,
    toggleSwitch
  } = useSimulation();
  
  // Canvas reference for coordinate calculations
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  
  // Initialize sub-hooks
  const { wireStart, tempWireEnd, hoveredNodeId, setHoveredNodeId, startWireCreation, 
          updateWireEnd, completeWireCreation } = useWireConnection();
  
  const { draggingComponentId, dragOffset, handleComponentDragStart, 
          handleComponentDrag, endComponentDrag } = useComponentDrag();
  
  const { paletteDragInfo, ghostPosition, placementFeedback, handlePaletteDragStart,
          handleDrop, handleDragOver } = useDragAndDrop();
  
  const { checkPinHover, getCanvasCoords } = useCanvasInteraction();
  
  /**
   * Set the canvas reference
   */
  const setCanvas = useCallback((canvas: HTMLCanvasElement | null) => {
    canvasRef.current = canvas;
  }, []);
  
  /**
   * Get canvas coordinates from mouse event (using our canvas ref)
   */
  const getCanvasCoordsWithRef = useCallback((e: MouseEvent | React.MouseEvent): { x: number, y: number } => {
    return getCanvasCoords(e, canvasRef.current);
  }, [getCanvasCoords]);
  
  /**
   * Handle mouse down on canvas
   */
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!simulationState) return;
    
    const coords = getCanvasCoordsWithRef(e);
    
    // If hovering over a node, start wire creation
    if (hoveredNodeId) {
      startWireCreation(hoveredNodeId, coords);
      return;
    }
    
    // Check if clicking on a component
    for (const comp of simulationState.components) {
      if (isInsideComponent(coords, comp)) {
        // Try to handle as component drag or switch toggle
        const wasToggleSwitch = handleComponentDragStart(coords, comp.id, isRunning, comp.type);
        if (wasToggleSwitch) return;
        return;
      }
    }
    
    // Deselect if clicking empty space
    selectComponent(null);
  }, [simulationState, hoveredNodeId, isRunning, selectComponent, startWireCreation, handleComponentDragStart, getCanvasCoordsWithRef]);
  
  /**
   * Handle mouse move on canvas
   */
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!simulationState) return;
    
    const coords = getCanvasCoordsWithRef(e);
    
    // Update wire end position during wire creation
    if (wireStart) {
      updateWireEnd(coords, simulationState.components);
      return;
    }
    
    // Move component during drag
    if (draggingComponentId) {
      handleComponentDrag(coords);
      return;
    }
    
    // Highlight pins on hover
    const foundNodeId = checkPinHover(coords, simulationState.components);
    setHoveredNodeId(foundNodeId);
    
  }, [simulationState, wireStart, draggingComponentId, updateWireEnd, handleComponentDrag, checkPinHover, setHoveredNodeId, getCanvasCoordsWithRef]);
  
  /**
   * Handle mouse up on canvas
   */
  const handleMouseUp = useCallback(() => {
    // Complete wire connection if in progress
    completeWireCreation();
    
    // End component drag if in progress
    endComponentDrag();
  }, [completeWireCreation, endComponentDrag]);
  
  // Set up event listeners for palette drag
  const setupPaletteDragListeners = useCallback(() => {
    const handleComponentDragStart = (e: Event) => {
      handlePaletteDragStart(e as CustomEvent);
    };
    
    document.addEventListener('component-drag-start', handleComponentDragStart as EventListener);
    
    return () => {
      document.removeEventListener('component-drag-start', handleComponentDragStart as EventListener);
    };
  }, [handlePaletteDragStart]);
  
  // Fix missing canvasRef in useDragAndDrop
  useEffect(() => {
    if (paletteDragInfo) {
      Object.assign(paletteDragInfo, { canvasRef });
    }
  }, [paletteDragInfo]);
  
  return {
    // Canvas reference
    canvasRef,
    setCanvas,
    
    // Drag states
    draggingComponentId,
    dragOffset,
    paletteDragInfo,
    ghostPosition,
    
    // Wire states
    wireStart,
    tempWireEnd,
    hoveredNodeId,
    
    // Feedback states
    placementFeedback,
    
    // Event handlers
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleDrop,
    handleDragOver,
    setupPaletteDragListeners
  };
};
