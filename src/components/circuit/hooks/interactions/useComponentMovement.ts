
import { useCallback } from 'react';
import { useDrag } from '../useDrag';
import { useCanvasMousePosition } from './useCanvasMousePosition';

/**
 * Hook to manage component movement on the canvas
 */
export function useComponentMovement(
  canvasRef: React.RefObject<HTMLCanvasElement>,
  onMoveComponent?: (id: string, dx: number, dy: number) => void,
  onMoveComplete?: () => void
) {
  const { getCanvasCoords } = useCanvasMousePosition(canvasRef);
  const { isDragging, dragState, hasDragged, startDrag, updateDrag, endDrag } = useDrag();
  
  /**
   * Start dragging a component
   */
  const startComponentDrag = useCallback((e: React.MouseEvent, id: string) => {
    e.stopPropagation(); // Prevent event bubbling
    const coords = getCanvasCoords(e);
    startDrag(id, coords.x, coords.y);
  }, [startDrag, getCanvasCoords]);
  
  /**
   * Update component position during drag
   */
  const updateComponentDrag = useCallback((e: React.MouseEvent, id: string) => {
    if (!dragState || dragState.id !== id) return;
    
    // Prevent accidental interactions during drag
    e.stopPropagation();
    e.preventDefault();
    
    const coords = getCanvasCoords(e);
    const dx = coords.x - dragState.startX;
    const dy = coords.y - dragState.startY;
    
    updateDrag(coords.x, coords.y);
    
    if (onMoveComponent) {
      onMoveComponent(id, dx, dy);
    }
  }, [dragState, onMoveComponent, updateDrag, getCanvasCoords]);
  
  /**
   * Complete component drag
   */
  const completeComponentDrag = useCallback(() => {
    endDrag();
    
    if (onMoveComplete) {
      onMoveComplete();
    }
  }, [endDrag, onMoveComplete]);

  return {
    isDragging,
    hasDragged,
    dragState,
    startComponentDrag,
    updateComponentDrag,
    completeComponentDrag
  };
}
