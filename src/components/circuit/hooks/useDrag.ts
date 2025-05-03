
import { useState, useCallback } from 'react';

interface DragState {
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
    isDragging: dragState,
    startDrag,
    endDrag
  };
}
