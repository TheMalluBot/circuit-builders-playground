
import { useCallback } from 'react';
import { CircuitItemType } from '@/types/circuit';

/**
 * Hook to determine cursor style based on interaction context with enhanced feedback
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

    // Custom cursors for specific scenarios
    if (draggedWire) return 'grabbing';
    
    // Wire interaction cursors
    if (hoveredItem?.type === 'wireControlPoint') return 'pointer';
    if (hoveredItem?.type === 'wireSegment') return 'pointer';
    
    // Pin interaction cursors
    if (hoveredItem?.type === 'pin') return 'crosshair';
    
    // Interactive components
    if (hoveredItem?.type === 'component' && isRunning && hoveredItem.id.includes('switch')) return 'pointer';
    
    // Component interaction cursors
    if (hoveredItem?.type === 'component') return isDragging ? 'grabbing' : 'grab';
    
    // Placement mode - use a cursor that matches the feedback
    if (selectedComponent) return 'crosshair';
    
    // Connection mode
    if (isConnecting) return 'crosshair';
    
    // Dragging mode
    if (isDragging) return 'grabbing';
    
    // Default cursor
    return 'default';
  }, []);

  return {
    getCursor
  };
}
