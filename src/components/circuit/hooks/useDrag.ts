
import { useState, useCallback } from 'react';

export interface DragState {
  id: string;
  startX: number;
  startY: number;
}

export function useDrag() {
  const [dragState, setDragState] = useState<DragState | null>(null);
  
  const startDrag = useCallback((id: string, x: number, y: number) => {
    setDragState({
      id,
      startX: x,
      startY: y
    });
  }, []);
  
  const endDrag = useCallback(() => {
    setDragState(null);
  }, []);
  
  return {
    isDragging: !!dragState, // Return boolean for type safety
    dragState, // Return the actual state for position calculations
    startDrag,
    endDrag
  };
}
