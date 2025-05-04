
import { useCallback } from 'react';
import { ComponentType } from '@/types/circuit';
import { useCanvasMousePosition } from './useCanvasMousePosition';

/**
 * Hook to manage component placement on the canvas
 */
export function useComponentPlacement(
  canvasRef: React.RefObject<HTMLCanvasElement>,
  selectedComponent: ComponentType | null,
  onAddComponent: (type: ComponentType, x: number, y: number) => void
) {
  const { getCanvasCoords } = useCanvasMousePosition(canvasRef);

  /**
   * Handle canvas click for component placement
   */
  const handleCanvasClick = useCallback((e: React.MouseEvent, hasDragged: boolean = false) => {
    if (!canvasRef.current || hasDragged || !selectedComponent) return;
    
    const coords = getCanvasCoords(e);
    onAddComponent(selectedComponent, coords.x, coords.y);
  }, [canvasRef, selectedComponent, onAddComponent, getCanvasCoords]);

  return {
    handleCanvasClick
  };
}
