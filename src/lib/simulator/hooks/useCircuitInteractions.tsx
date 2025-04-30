
import { useState, useCallback, useRef } from 'react';
import { useSimulation } from '../context/useSimulation';
import { isNearPin, isInsideComponent } from '../utils/geometryUtils';
import { DragInfo } from '@/types/simulator';

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
  
  // Dragging placed components
  const [draggingComponentId, setDraggingComponentId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  
  // Palette drag state
  const [paletteDragInfo, setPaletteDragInfo] = useState<DragInfo | null>(null);
  const [ghostPosition, setGhostPosition] = useState<{x: number, y: number} | null>(null);
  
  // Wire connection state
  const [wireStart, setWireStart] = useState<{nodeId: string; x: number; y: number} | null>(null);
  const [tempWireEnd, setTempWireEnd] = useState<{x: number, y: number} | null>(null);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  
  // Placement feedback
  const [placementFeedback, setPlacementFeedback] = useState<{ x: number, y: number, type: string } | null>(null);
  
  // Canvas reference for coordinate calculations
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  
  /**
   * Set the canvas reference
   */
  const setCanvas = useCallback((canvas: HTMLCanvasElement | null) => {
    canvasRef.current = canvas;
  }, []);
  
  /**
   * Get canvas coordinates from mouse event
   */
  const getCanvasCoords = useCallback((e: MouseEvent | React.MouseEvent): { x: number, y: number } => {
    if (!canvasRef.current) return { x: 0, y: 0 };
    
    const rect = canvasRef.current.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  }, []);
  
  /**
   * Handle component drag start from palette
   */
  const handlePaletteDragStart = useCallback((e: CustomEvent) => {
    const { type, clientX, clientY } = e.detail;
    
    setPaletteDragInfo({
      type,
      offsetX: 30,
      offsetY: 30,
      isPaletteDrag: true
    });
    
    setGhostPosition({
      x: clientX,
      y: clientY
    });
    
    document.addEventListener('mousemove', handlePaletteDragMove);
    document.addEventListener('mouseup', handlePaletteDragEnd);
  }, []);
  
  /**
   * Handle palette drag move
   */
  const handlePaletteDragMove = useCallback((e: MouseEvent) => {
    if (ghostPosition) {
      setGhostPosition({
        x: e.clientX,
        y: e.clientY
      });
    }
  }, [ghostPosition]);
  
  /**
   * Handle palette drag end
   */
  const handlePaletteDragEnd = useCallback((e: MouseEvent) => {
    if (paletteDragInfo && ghostPosition && canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      
      if (
        e.clientX >= rect.left &&
        e.clientX <= rect.right &&
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom
      ) {
        const canvasX = e.clientX - rect.left;
        const canvasY = e.clientY - rect.top;
        
        // Add the component to the simulation
        addComponent(paletteDragInfo.type, { x: canvasX, y: canvasY });
        
        // Show placement feedback
        setPlacementFeedback({
          x: canvasX,
          y: canvasY,
          type: paletteDragInfo.type
        });
        
        // Clear feedback after animation
        setTimeout(() => {
          setPlacementFeedback(null);
        }, 1000);
      }
    }
    
    setPaletteDragInfo(null);
    setGhostPosition(null);
    
    document.removeEventListener('mousemove', handlePaletteDragMove);
    document.removeEventListener('mouseup', handlePaletteDragEnd);
  }, [addComponent, paletteDragInfo, ghostPosition]);
  
  /**
   * Handle mouse down on canvas
   */
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!simulationState) return;
    
    const coords = getCanvasCoords(e);
    
    // If hovering over a node, start wire creation
    if (hoveredNodeId) {
      setWireStart({
        nodeId: hoveredNodeId,
        x: coords.x,
        y: coords.y
      });
      setTempWireEnd(coords);
      return;
    }
    
    // Check if clicking on a component
    for (const comp of simulationState.components) {
      if (isInsideComponent(coords, comp)) {
        // Toggle switch if running
        if (isRunning && comp.type === 'switch') {
          toggleSwitch(comp.id);
          return;
        }
        
        // Select component and start dragging
        selectComponent(comp.id);
        setDraggingComponentId(comp.id);
        setDragOffset({
          x: coords.x - comp.position.x,
          y: coords.y - comp.position.y
        });
        return;
      }
    }
    
    // Deselect if clicking empty space
    selectComponent(null);
  }, [simulationState, hoveredNodeId, isRunning, selectComponent, toggleSwitch, getCanvasCoords]);
  
  /**
   * Handle mouse move on canvas
   */
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!simulationState) return;
    
    const coords = getCanvasCoords(e);
    
    // Update wire end position during wire creation
    if (wireStart) {
      setTempWireEnd(coords);
      
      // Check if hovering over a pin
      let foundNode = false;
      for (const comp of simulationState.components) {
        for (const pin of comp.pins) {
          const pinPos = isNearPin(coords, pin.position);
          
          if (pinPos && pin.nodeId !== wireStart.nodeId) {
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
      return;
    }
    
    // Move component during drag
    if (draggingComponentId) {
      const newPos = {
        x: coords.x - dragOffset.x,
        y: coords.y - dragOffset.y
      };
      
      moveComponent(draggingComponentId, newPos);
      return;
    }
    
    // Highlight pins on hover
    let foundNode = false;
    for (const comp of simulationState.components) {
      for (const pin of comp.pins) {
        // Calculate actual pin position considering rotation
        const actualPinPos = {
          x: pin.position.x + comp.position.x,
          y: pin.position.y + comp.position.y
        };
        
        if (isNearPin(coords, actualPinPos)) {
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
  }, [simulationState, wireStart, draggingComponentId, dragOffset, moveComponent, getCanvasCoords]);
  
  /**
   * Handle mouse up on canvas
   */
  const handleMouseUp = useCallback(() => {
    // Create wire if connecting two pins
    if (wireStart && hoveredNodeId && wireStart.nodeId !== hoveredNodeId) {
      createWire(wireStart.nodeId, hoveredNodeId);
    }
    
    // Reset wire creation state
    setWireStart(null);
    setTempWireEnd(null);
    
    // Reset dragging state
    setDraggingComponentId(null);
  }, [wireStart, hoveredNodeId, createWire]);
  
  /**
   * Handle drop event for component placement
   */
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const componentType = e.dataTransfer.getData('component/type');
    
    if (componentType && canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      addComponent(componentType, { x, y });
      
      // Show placement feedback
      setPlacementFeedback({
        x,
        y,
        type: componentType
      });
      
      // Clear feedback after animation
      setTimeout(() => {
        setPlacementFeedback(null);
      }, 1000);
    }
  }, [addComponent]);
  
  /**
   * Handle drag over event
   */
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  }, []);
  
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
