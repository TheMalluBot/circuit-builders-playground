
import { useState, useCallback, RefObject } from 'react';
import { Circuit, CircuitItemType } from '@/types/circuit';
import { findHoveredItem } from '../../utils/ItemFinder';
import { useCanvasMousePosition } from './useCanvasMousePosition';

/**
 * Hook to detect and track hovered items on the canvas
 */
export function useCanvasHover(
  canvasRef: RefObject<HTMLCanvasElement>,
  circuit: Circuit
) {
  const { getCanvasCoords } = useCanvasMousePosition(canvasRef);
  const [hoveredItem, setHoveredItem] = useState<{ type: CircuitItemType; id: string } | null>(null);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  /**
   * Update hover state based on mouse position
   */
  const updateHoverState = useCallback((e: React.MouseEvent, isDraggingComponent: boolean = false) => {
    if (!canvasRef.current) return null;
    
    // Store dragging state for other methods
    setIsDragging(isDraggingComponent);
    
    const coords = getCanvasCoords(e);
    
    // When dragging components, ignore component detection to prevent issues
    const item = findHoveredItem(circuit, coords.x, coords.y, 10, isDraggingComponent);
    
    setHoveredItem(item);
    
    // Track hovered node separately for connection handling
    if (item?.type === 'pin') {
      setHoveredNodeId(item.id);
    } else {
      setHoveredNodeId(null);
    }
    
    return item;
  }, [circuit, canvasRef, getCanvasCoords]);

  /**
   * Reset hover state
   */
  const resetHoverState = useCallback(() => {
    setHoveredItem(null);
    setHoveredNodeId(null);
    setIsDragging(false);
  }, []);

  return {
    hoveredItem,
    hoveredNodeId,
    isDragging,
    updateHoverState,
    resetHoverState
  };
}
