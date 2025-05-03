
import { useState, useCallback } from 'react';
import { Component } from '@/types/circuit';

interface DragState {
  componentId: string | null;
  startX: number;
  startY: number;
  lastX: number;
  lastY: number;
}

export function useComponentDrag(
  onMoveComponent: (id: string, dx: number, dy: number) => void
) {
  const [dragState, setDragState] = useState<DragState>({
    componentId: null,
    startX: 0,
    startY: 0,
    lastX: 0,
    lastY: 0
  });
  
  // Track if dragging is currently happening
  const [isDraggingActive, setIsDraggingActive] = useState(false);
  
  const startDrag = useCallback((componentId: string, x: number, y: number) => {
    console.log(`Starting drag for component: ${componentId} at (${x}, ${y})`);
    setDragState({
      componentId,
      startX: x,
      startY: y,
      lastX: x,
      lastY: y
    });
    setIsDraggingActive(true);
  }, []);
  
  const updateDrag = useCallback((x: number, y: number) => {
    if (!dragState.componentId) return;
    
    const dx = x - dragState.lastX;
    const dy = y - dragState.lastY;
    
    if (dx !== 0 || dy !== 0) {
      onMoveComponent(dragState.componentId, dx, dy);
      
      // Update last position for next drag event
      setDragState(prev => ({
        ...prev,
        lastX: x,
        lastY: y
      }));
    }
  }, [dragState, onMoveComponent]);
  
  const endDrag = useCallback(() => {
    console.log(`Ending drag for component: ${dragState.componentId}`);
    setDragState({
      componentId: null,
      startX: 0,
      startY: 0,
      lastX: 0,
      lastY: 0
    });
    setIsDraggingActive(false);
  }, [dragState.componentId]);
  
  return {
    isDragging: isDraggingActive,
    draggedComponentId: dragState.componentId,
    dragOffset: {
      x: dragState.lastX - dragState.startX,
      y: dragState.lastY - dragState.startY
    },
    startDrag,
    updateDrag,
    endDrag
  };
}
