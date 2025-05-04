
import { useCallback } from 'react';
import { useCursorStyle } from './interactions/useCursorStyle';
import { CircuitItemType } from '@/types/circuit';

/**
 * Hook to provide appropriate cursor styles based on canvas state
 */
export function useCircuitCanvasCursor() {
  const { getCursor } = useCursorStyle();

  /**
   * Determine appropriate cursor based on current state
   */
  const getCanvasCursor = useCallback((params: {
    isDragging: boolean;
    isConnecting: boolean;
    hoveredItem: { type: CircuitItemType; id: string } | null;
    isRunning: boolean;
    draggedWire: boolean;
    selectedComponent: string | null;
  }) => {
    return getCursor(params);
  }, [getCursor]);

  return { getCanvasCursor };
}
