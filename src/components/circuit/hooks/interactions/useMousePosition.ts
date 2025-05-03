
import { useCallback, RefObject, useState, useEffect } from 'react';

/**
 * Hook to handle mouse position calculations with enhanced tracking
 */
export function useMousePosition(canvasRef: RefObject<HTMLCanvasElement>) {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isInCanvas, setIsInCanvas] = useState(false);
  
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
  
  /**
   * Track mouse movement over the canvas
   */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      setPosition({ x, y });
    };
    
    const handleMouseEnter = () => setIsInCanvas(true);
    const handleMouseLeave = () => setIsInCanvas(false);
    
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseenter', handleMouseEnter);
    canvas.addEventListener('mouseleave', handleMouseLeave);
    
    return () => {
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseenter', handleMouseEnter);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [canvasRef]);

  return {
    getCanvasCoordinates,
    position,
    isInCanvas
  };
}
