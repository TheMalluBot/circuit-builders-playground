
import { useState, useCallback, useRef } from 'react';

export interface DragState {
  id: string;
  startX: number;
  startY: number;
}

export function useDrag() {
  const [dragState, setDragState] = useState<DragState | null>(null);
  const draggedRef = useRef(false);
  const dragTimeoutRef = useRef<number | null>(null);
  
  const startDrag = useCallback((id: string, x: number, y: number) => {
    // Prevent starting a new drag if we're already dragging
    if (dragState) return;
    
    // Clear any existing timeout to prevent state conflicts
    if (dragTimeoutRef.current !== null) {
      clearTimeout(dragTimeoutRef.current);
      dragTimeoutRef.current = null;
    }
    
    draggedRef.current = false;
    setDragState({
      id,
      startX: x,
      startY: y
    });
  }, [dragState]);
  
  const updateDrag = useCallback((currentX: number, currentY: number) => {
    if (!dragState) return;
    
    // Check if we've moved more than 3 pixels (indicating a real drag, not just a click)
    // Reduced threshold for more responsive detection
    const dx = Math.abs(currentX - dragState.startX);
    const dy = Math.abs(currentY - dragState.startY);
    
    if (dx > 3 || dy > 3) {
      draggedRef.current = true;
    }
  }, [dragState]);
  
  const endDrag = useCallback(() => {
    // Add a more robust delay to ensure dragging state is properly reset
    // before allowing other interactions like click events
    
    // Store the current dragState in a local variable for the timeout callback
    const currentDragState = dragState;
    
    // Clear any existing timeout
    if (dragTimeoutRef.current !== null) {
      clearTimeout(dragTimeoutRef.current);
    }
    
    // Set a new timeout
    dragTimeoutRef.current = window.setTimeout(() => {
      setDragState(null);
      dragTimeoutRef.current = null;
    }, 100); // Slightly longer delay for better reliability
    
  }, [dragState]);
  
  return {
    isDragging: !!dragState, // Return boolean for type safety
    dragState, // Return the actual state for position calculations
    hasDragged: draggedRef.current, // Return whether a real drag occurred
    startDrag,
    updateDrag,
    endDrag
  };
}
