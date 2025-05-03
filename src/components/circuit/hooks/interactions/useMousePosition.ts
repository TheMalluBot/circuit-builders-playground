
import { useCallback, RefObject } from 'react';

/**
 * Hook to handle mouse position calculations
 */
export function useMousePosition(canvasRef: RefObject<HTMLCanvasElement>) {
  /**
   * Get canvas coordinates from a mouse event
   */
  const getCanvasCoordinates = useCallback((e: React.MouseEvent) => {
    if (!canvasRef.current) return { x: 0, y: 0 };
    
    const rect = canvasRef.current.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  }, [canvasRef]);

  return {
    getCanvasCoordinates
  };
}
