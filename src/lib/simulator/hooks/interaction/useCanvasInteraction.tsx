
import { useCallback } from 'react';
import { isNearPin } from '../../utils/geometryUtils';

export const useCanvasInteraction = () => {
  /**
   * Check if coordinates are over a pin
   */
  const checkPinHover = useCallback((coords: { x: number, y: number }, components: any[]) => {
    let foundNodeId = null;
    let foundNode = false;
    
    for (const comp of components) {
      for (const pin of comp.pins) {
        // Calculate actual pin position considering rotation
        const actualPinPos = {
          x: pin.position.x + comp.position.x,
          y: pin.position.y + comp.position.y
        };
        
        if (isNearPin(coords, actualPinPos)) {
          foundNodeId = pin.nodeId || `${comp.id}-${pin.id}`;
          foundNode = true;
          break;
        }
      }
      if (foundNode) break;
    }
    
    return foundNodeId;
  }, []);
  
  /**
   * Get canvas coordinates from mouse event
   */
  const getCanvasCoords = useCallback((e: MouseEvent | React.MouseEvent, canvasElement: HTMLCanvasElement | null): { x: number, y: number } => {
    if (!canvasElement) return { x: 0, y: 0 };
    
    const rect = canvasElement.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  }, []);
  
  return {
    checkPinHover,
    getCanvasCoords
  };
};
