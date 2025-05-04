
import { useState, useCallback, RefObject } from 'react';
import { CanvasPosition } from '@/types/circuit';

/**
 * Hook to track and manage mouse position on the canvas
 */
export function useCanvasMousePosition(canvasRef: RefObject<HTMLCanvasElement>) {
  const [clickStartPosition, setClickStartPosition] = useState<CanvasPosition | null>(null);

  /**
   * Get canvas coordinates from mouse event
   */
  const getCanvasCoords = useCallback((e: React.MouseEvent): { x: number, y: number } => {
    if (!canvasRef.current) return { x: 0, y: 0 };
    
    const rect = canvasRef.current.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  }, [canvasRef]);

  /**
   * Set the initial click position
   */
  const setStartPosition = useCallback((e: React.MouseEvent) => {
    const coords = getCanvasCoords(e);
    setClickStartPosition(coords);
    return coords;
  }, [getCanvasCoords]);

  /**
   * Reset the click position
   */
  const resetStartPosition = useCallback(() => {
    setClickStartPosition(null);
  }, []);

  return {
    clickStartPosition,
    getCanvasCoords,
    setStartPosition,
    resetStartPosition
  };
}
