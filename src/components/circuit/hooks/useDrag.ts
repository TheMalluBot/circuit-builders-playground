
import { useState, useCallback } from 'react';

export interface DragState {
  id: string;
  startX: number;
  startY: number;
}

export function useDrag() {
  const [dragState, setDragState] = useState<DragState | null>(null);
  
  const startDrag = useCallback((id: string, x: number, y: number) => {
    // Prevent starting a new drag if we're already dragging
    if (dragState) return;
    
    setDragState({
      id,
      startX: x,
      startY: y
    });
  }, [dragState]);
  
  const endDrag = useCallback(() => {
    // Add a small delay to prevent immediate click after drag
    // This helps prevent accidental deletions when ending drag operations
    setTimeout(() => {
      setDragState(null);
    }, 50);
  }, []);
  
  return {
    isDragging: !!dragState, // Return boolean for type safety
    dragState, // Return the actual state for position calculations
    startDrag,
    endDrag
  };
}
