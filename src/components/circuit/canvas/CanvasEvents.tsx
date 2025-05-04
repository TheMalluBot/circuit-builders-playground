
import { RefObject } from 'react';
import { Circuit, ComponentType } from '@/types/circuit';
import { useCursorStyle } from '../hooks/interactions/useCursorStyle';

export function CanvasEvents({
  circuit,
  canvasRef,
  connectionPreview,
  draggedWire,
  isDragging,
  hoveredItem,
  isRunning,
  onAddComponent,
  onConnectNodes,
  onToggleSwitch,
  onSelectComponent,
  onSelectWire,
  onContextMenu,
  onDoubleClick,
  handleMouseDown,
  handleMouseMove,
  handleMouseUp,
  dragControlPoint,
  endDragControlPoint,
  startDragControlPoint,
  addControlPoint,
  selectedComponent
}) {
  const { getCursor } = useCursorStyle();
  
  // Combined event handlers
  const handleMouseDownWithInteraction = (e) => {
    if (e.button === 0) {  // Left click
      handleMouseDown(e);
      
      // Toggle switch if clicked while simulation is running
      if (hoveredItem?.type === 'component' && hoveredItem.id.includes('switch') && isRunning) {
        onToggleSwitch(hoveredItem.id);
      }
      
      // Select component
      if (hoveredItem?.type === 'component') {
        onSelectComponent(hoveredItem.id);
      }
      
      // Select wire
      if (hoveredItem?.type === 'wire' || hoveredItem?.type === 'wireSegment') {
        onSelectWire(hoveredItem.wireId || hoveredItem.id);
      }
      
      // Start dragging wire control point
      if (hoveredItem?.type === 'wireControlPoint') {
        startDragControlPoint(
          hoveredItem.wireId, 
          hoveredItem.pointIndex, 
          hoveredItem.position.x, 
          hoveredItem.position.y
        );
      }
      
      // Add control point to wire segment
      if (hoveredItem?.type === 'wireSegment' && e.altKey) {
        addControlPoint(hoveredItem.wireId, hoveredItem.segmentIndex, {
          x: e.nativeEvent.offsetX,
          y: e.nativeEvent.offsetY
        });
      }
    } else if (e.button === 2) {  // Right click
      onContextMenu(e);
    }
  };
  
  const handleMouseMoveWithInteraction = (e) => {
    handleMouseMove(e);
    
    // Handle wire control point dragging
    if (draggedWire) {
      dragControlPoint(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
    }
  };
  
  const handleMouseUpWithInteraction = (e) => {
    handleMouseUp(e);
    
    // End wire control point dragging
    if (draggedWire) {
      endDragControlPoint();
    }
  };
  
  return {
    handleMouseDownWithInteraction,
    handleMouseMoveWithInteraction,
    handleMouseUpWithInteraction,
    getCursor: () => getCursor({
      isDragging,
      isConnecting: connectionPreview?.isConnecting || false,
      hoveredItem,
      isRunning,
      draggedWire: !!draggedWire,
      selectedComponent
    })
  };
}
