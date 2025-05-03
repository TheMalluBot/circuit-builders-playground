
import { useCallback } from 'react';
import { CircuitItemType } from '@/types/circuit';

/**
 * Hook to determine cursor style based on interaction context
 */
export function useCursorStyle() {
  /**
   * Get appropriate cursor based on current state and hover
   */
  const getCursor = useCallback((params: {
    isDragging: boolean;
    isConnecting: boolean;
    hoveredItem: { type: CircuitItemType; id: string } | null;
    isRunning: boolean;
    draggedWire: boolean;
    selectedComponent: string | null;
  }) => {
    const { isDragging, isConnecting, hoveredItem, isRunning, draggedWire, selectedComponent } = params;

    if (draggedWire) return 'grabbing';
    if (hoveredItem?.type === 'wireControlPoint') return 'pointer';
    if (hoveredItem?.type === 'wireSegment') return 'pointer';
    if (hoveredItem?.type === 'pin') return 'crosshair';
    if (hoveredItem?.type === 'component' && isRunning && hoveredItem.id.includes('switch')) return 'pointer';
    if (hoveredItem?.type === 'component') return 'move';
    if (selectedComponent) return 'crosshair';
    if (isConnecting) return 'crosshair';
    if (isDragging) return 'grabbing';
    return 'default';
  }, []);

  return {
    getCursor
  };
}
