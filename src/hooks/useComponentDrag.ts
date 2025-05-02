
import { useState, useCallback } from 'react';
import { Component } from '@/types/circuit';

interface DragState {
  componentId: string | null;
  startX: number;
  startY: number;
}

export function useComponentDrag(
  onMoveComponent: (id: string, dx: number, dy: number) => void
) {
  const [dragState, setDragState] = useState<DragState>({
    componentId: null,
    startX: 0,
    startY: 0
  });
  
  const startDrag = useCallback((componentId: string, x: number, y: number) => {
    setDragState({
      componentId,
      startX: x,
      startY: y
    });
  }, []);
  
  const updateDrag = useCallback((x: number, y: number) => {
    if (!dragState.componentId) return;
    
    const dx = x - dragState.startX;
    const dy = y - dragState.startY;
    
    if (dx !== 0 || dy !== 0) {
      onMoveComponent(dragState.componentId, dx, dy);
      
      // Update start position for next drag event
      setDragState(prev => ({
        ...prev,
        startX: x,
        startY: y
      }));
    }
  }, [dragState, onMoveComponent]);
  
  const endDrag = useCallback(() => {
    setDragState({
      componentId: null,
      startX: 0,
      startY: 0
    });
  }, []);
  
  return {
    isDragging: !!dragState.componentId,
    draggedComponentId: dragState.componentId,
    startDrag,
    updateDrag,
    endDrag
  };
}
