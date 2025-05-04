
import { useState, useCallback, useRef } from 'react';

export interface DragState {
  id: string;
  startX: number;
  startY: number;
}

export function useDrag() {
  const [dragState, setDragState] = useState<DragState | null>(null);
  const draggedRef = useRef(false);
  
  const startDrag = useCallback((id: string, x: number, y: number) => {
    // Prevent starting a new drag if we're already dragging
    if (dragState) return;
    
    draggedRef.current = false;
    setDragState({
      id,
      startX: x,
      startY: y
    });
  }, [dragState]);
  
  const updateDrag = useCallback((currentX: number, currentY: number) => {
    if (!dragState) return;
    
    // Check if we've moved more than 5 pixels (indicating a real drag, not just a click)
    const dx = Math.abs(currentX - dragState.startX);
    const dy = Math.abs(currentY - dragState.startY);
    
    if (dx > 5 || dy > 5) {
      draggedRef.current = true;
    }
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
    hasDragged: draggedRef.current, // Return whether a real drag occurred
    startDrag,
    updateDrag,
    endDrag
  };
}
