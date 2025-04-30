
import { useState, useCallback } from 'react';
import { useSimulation } from '../../context/useSimulation';
import { isInsideComponent } from '../../utils/geometryUtils';

export const useComponentDrag = () => {
  const { selectComponent, moveComponent, toggleSwitch } = useSimulation();
  
  // Dragging placed components
  const [draggingComponentId, setDraggingComponentId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  
  /**
   * Handle component drag start
   */
  const handleComponentDragStart = useCallback((
    coords: { x: number, y: number }, 
    componentId: string, 
    isRunning: boolean, 
    componentType: string
  ) => {
    // Toggle switch if running
    if (isRunning && componentType === 'switch') {
      toggleSwitch(componentId);
      return true; // Indicates we handled it as a switch toggle
    }
    
    // Select component and start dragging
    selectComponent(componentId);
    setDraggingComponentId(componentId);
    setDragOffset({
      x: coords.x - coords.position.x,
      y: coords.y - coords.position.y
    });
    return false; // Indicates we handled it as a drag start
  }, [selectComponent, toggleSwitch]);
  
  /**
   * Handle component drag
   */
  const handleComponentDrag = useCallback((coords: { x: number, y: number }) => {
    if (draggingComponentId) {
      const newPos = {
        x: coords.x - dragOffset.x,
        y: coords.y - dragOffset.y
      };
      
      moveComponent(draggingComponentId, newPos);
    }
  }, [draggingComponentId, dragOffset, moveComponent]);
  
  /**
   * End component drag
   */
  const endComponentDrag = useCallback(() => {
    setDraggingComponentId(null);
  }, []);
  
  return {
    draggingComponentId,
    dragOffset,
    handleComponentDragStart,
    handleComponentDrag,
    endComponentDrag
  };
};
