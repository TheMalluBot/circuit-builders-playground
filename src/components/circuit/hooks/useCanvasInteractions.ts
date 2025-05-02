
import { useState, useCallback, RefObject } from 'react';
import { Circuit, ComponentType, CircuitItemType } from '@/types/circuit';
import { findHoveredItem } from '../utils/ItemFinder';
import { getMousePosition } from '../utils/CanvasUtils';
import { useConnectionPreview } from './useConnectionPreview';

/**
 * Hook to handle canvas interactions
 */
export function useCanvasInteractions(
  canvasRef: RefObject<HTMLCanvasElement>,
  circuit: Circuit,
  options: {
    selectedComponent: ComponentType | null;
    onAddComponent: (type: ComponentType, x: number, y: number) => void;
    onConnectNodes: (sourceId: string, targetId: string) => void;
    onToggleSwitch: (componentId: string) => void;
  }
) {
  // Interaction state
  const [isDragging, setIsDragging] = useState(false);
  const [draggedItem, setDraggedItem] = useState<{ id: string, type: CircuitItemType, segmentIndex?: number } | null>(null);
  const [dragStartPos, setDragStartPos] = useState({ x: 0, y: 0 });
  
  // Hover state for highlighting
  const [hoveredItem, setHoveredItem] = useState<{
    type: CircuitItemType;
    id: string;
    pinId?: string;
    componentId?: string;
    position?: { x: number; y: number };
  } | null>(null);
  
  // Connection state
  const connectionPreview = useConnectionPreview();
  
  // Handle canvas click for component placement and interaction
  const handleCanvasClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isDragging) return; // Don't handle click if we're currently dragging
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const { x, y } = getMousePosition(e, canvas);
    
    // Find if we're clicking on a component, node, or pin
    const item = findHoveredItem(circuit, x, y);
    
    if (item) {
      // Handle pin click for connections
      if (item.type === 'pin') {
        if (connectionPreview.connectionStart) {
          // Complete connection if clicking on a different pin
          if (connectionPreview.connectionStart.componentId !== item.componentId) {
            if (connectionPreview.connectionStart.nodeId && item.id) {
              options.onConnectNodes(connectionPreview.connectionStart.nodeId, item.id);
            }
          }
          connectionPreview.resetConnection();
        } else {
          // Start new connection
          const component = circuit.components.find(c => c.id === item.componentId);
          const pin = component?.pins.find(p => p.id === item.pinId);
          
          if (component && pin && item.position) {
            connectionPreview.startConnection({
              nodeId: pin.nodeId,
              pinId: pin.id,
              componentId: component.id,
              position: item.position
            });
          }
        }
        return;
      }
      
      // Handle component interaction
      if (item.type === 'component') {
        const component = circuit.components.find(c => c.id === item.id);
        if (component?.type === 'switch') {
          options.onToggleSwitch(item.id);
          return;
        }
      }
      
      // Handle node click
      if (item.type === 'node') {
        if (connectionPreview.connectionStart) {
          // Complete connection if we started from a pin
          if (connectionPreview.connectionStart.nodeId && connectionPreview.connectionStart.nodeId !== item.id) {
            options.onConnectNodes(connectionPreview.connectionStart.nodeId, item.id);
          }
          connectionPreview.resetConnection();
        }
        return;
      }
    } else {
      // If clicking empty space and we have a component selected, place it
      if (options.selectedComponent) {
        options.onAddComponent(options.selectedComponent, x, y);
      } else if (connectionPreview.connectionStart) {
        // Cancel connection if clicking empty space
        connectionPreview.resetConnection();
      }
    }
  }, [isDragging, canvasRef, circuit, options, connectionPreview]);
  
  // Handle mouse down for dragging components
  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (connectionPreview.isConnecting) return; // Don't start drag if we're making a connection
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const { x, y } = getMousePosition(e, canvas);
    
    // Find if we're clicking on a draggable item
    const item = findHoveredItem(circuit, x, y);
    
    if (item && (item.type === 'component' || item.type === 'wire')) {
      setIsDragging(true);
      setDraggedItem(item);
      setDragStartPos({ x, y });
      e.preventDefault(); // Prevent text selection during drag
    }
  }, [canvasRef, circuit, connectionPreview.isConnecting]);
  
  // Handle mouse move for dragging and hovering
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const { x, y } = getMousePosition(e, canvas);
    
    // Update current mouse position (used for drawing connection preview)
    if (connectionPreview.isConnecting) {
      const hoveredItem = findHoveredItem(circuit, x, y);
      const hoveredNodeId = hoveredItem?.type === 'node' || hoveredItem?.type === 'pin' 
        ? hoveredItem.id 
        : null;
        
      connectionPreview.updateConnectionEnd({ x, y }, hoveredNodeId);
    }
    
    // Handle hovering
    if (!isDragging) {
      const item = findHoveredItem(circuit, x, y);
      setHoveredItem(item);
    }
    
    // Handle dragging
    if (isDragging && draggedItem) {
      const dx = x - dragStartPos.x;
      const dy = y - dragStartPos.y;
      
      if (draggedItem.type === 'component') {
        // TODO: Implement component dragging via a moveComponent function
        // moveComponent(draggedItem.id, dx, dy);
      } else if (draggedItem.type === 'wire') {
        // TODO: Implement wire segment dragging
        // updateWirePath(draggedItem.id, draggedItem.segmentIndex, dx, dy);
      }
      
      setDragStartPos({ x, y });
    }
  }, [canvasRef, circuit, isDragging, draggedItem, dragStartPos, connectionPreview]);
  
  // Handle mouse up to end dragging
  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setDraggedItem(null);
    
    // Also complete any active connection
    if (connectionPreview.isConnecting) {
      connectionPreview.resetConnection();
    }
  }, [connectionPreview]);
  
  return {
    hoveredItem,
    hoveredNodeId: hoveredItem?.type === 'node' ? hoveredItem.id : null,
    connectionPreview,
    handleCanvasClick,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    isDragging
  };
}
