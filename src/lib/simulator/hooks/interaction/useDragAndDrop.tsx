
import { useState, useCallback } from 'react';
import { useSimulation } from '../../context/useSimulation';
import { DragInfo } from '@/types/simulator';

export const useDragAndDrop = () => {
  const { addComponent } = useSimulation();
  
  // Palette drag state
  const [paletteDragInfo, setPaletteDragInfo] = useState<DragInfo | null>(null);
  const [ghostPosition, setGhostPosition] = useState<{x: number, y: number} | null>(null);
  
  // Placement feedback
  const [placementFeedback, setPlacementFeedback] = useState<{ x: number, y: number, type: string } | null>(null);
  
  /**
   * Handle component drag start from palette
   */
  const handlePaletteDragStart = useCallback((e: CustomEvent) => {
    const { type, clientX, clientY } = e.detail;
    
    setPaletteDragInfo({
      type,
      offsetX: 30,
      offsetY: 30,
      isPaletteDrag: true
    });
    
    setGhostPosition({
      x: clientX,
      y: clientY
    });
    
    document.addEventListener('mousemove', handlePaletteDragMove);
    document.addEventListener('mouseup', handlePaletteDragEnd);
  }, []);
  
  /**
   * Handle palette drag move
   */
  const handlePaletteDragMove = useCallback((e: MouseEvent) => {
    if (ghostPosition) {
      setGhostPosition({
        x: e.clientX,
        y: e.clientY
      });
    }
  }, [ghostPosition]);
  
  /**
   * Handle palette drag end
   */
  const handlePaletteDragEnd = useCallback((e: MouseEvent) => {
    if (paletteDragInfo && ghostPosition && canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      
      if (
        e.clientX >= rect.left &&
        e.clientX <= rect.right &&
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom
      ) {
        const canvasX = e.clientX - rect.left;
        const canvasY = e.clientY - rect.top;
        
        // Add the component to the simulation
        addComponent(paletteDragInfo.type, { x: canvasX, y: canvasY });
        
        // Show placement feedback
        setPlacementFeedback({
          x: canvasX,
          y: canvasY,
          type: paletteDragInfo.type
        });
        
        // Clear feedback after animation
        setTimeout(() => {
          setPlacementFeedback(null);
        }, 1000);
      }
    }
    
    setPaletteDragInfo(null);
    setGhostPosition(null);
    
    document.removeEventListener('mousemove', handlePaletteDragMove);
    document.removeEventListener('mouseup', handlePaletteDragEnd);
  }, [addComponent, paletteDragInfo, ghostPosition]);
  
  /**
   * Handle drop event for component placement
   */
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const componentType = e.dataTransfer.getData('component/type');
    
    if (componentType && canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      addComponent(componentType, { x, y });
      
      // Show placement feedback
      setPlacementFeedback({
        x,
        y,
        type: componentType
      });
      
      // Clear feedback after animation
      setTimeout(() => {
        setPlacementFeedback(null);
      }, 1000);
    }
  }, [addComponent]);
  
  /**
   * Handle drag over event
   */
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  }, []);
  
  // We need the canvasRef to be shared between these hooks
  const canvasRef = { current: null as HTMLCanvasElement | null };
  
  return {
    paletteDragInfo,
    ghostPosition,
    placementFeedback,
    handlePaletteDragStart,
    handleDrop,
    handleDragOver,
    canvasRef
  };
};
