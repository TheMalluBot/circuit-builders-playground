
import { useState, useCallback, RefObject } from 'react';
import { Circuit, ComponentType, CircuitItemType } from '@/types/circuit';
import { useItemInteraction } from './interactions/useItemInteraction';
import { useMousePosition } from './interactions/useMousePosition';
import { useCursorStyle } from './interactions/useCursorStyle';
import { useConnectionHandling } from './interactions/useConnectionHandling';
import { useConnectionPreview } from './useConnectionPreview';

interface CanvasInteractionOptions {
  selectedComponent: ComponentType | null;
  onAddComponent: (type: ComponentType, x: number, y: number) => void;
  onConnectNodes: (sourceId: string, targetId: string) => void;
  onToggleSwitch: (componentId: string) => void;
  selectedWireId?: string | null;
  selectWire?: (wireId: string | null) => void;
}

/**
 * Hook to handle canvas interactions with improved wire connection experience
 */
export function useCanvasInteractions(
  canvasRef: RefObject<HTMLCanvasElement>,
  circuit: Circuit,
  options: CanvasInteractionOptions
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
    wireId?: string;
    segmentIndex?: number;
    pointIndex?: number;
    start?: { x: number; y: number };
    end?: { x: number; y: number };
  } | null>(null);
  
  // Initialize sub-hooks
  const connectionPreview = useConnectionPreview();
  const { findItemAtPosition, isOverComponent, isOverPin, isOverWire } = useItemInteraction(circuit);
  const { getCanvasCoordinates } = useMousePosition(canvasRef);
  const { getCursor } = useCursorStyle();
  const { completeConnection, resetCurrentConnection } = useConnectionHandling({
    connectionPreview,
    onConnectNodes: options.onConnectNodes
  });
  
  // Handle canvas click for component placement and interaction
  const handleCanvasClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isDragging) return; // Don't handle click if we're currently dragging
    
    const { x, y } = getCanvasCoordinates(e);
    const item = findItemAtPosition(x, y);
    
    if (item) {
      // Handle wire selection
      if (item.type === 'wire' && options.selectWire) {
        options.selectWire(item.id);
        return;
      }
      
      // Handle wire segment or control point clicks
      if ((item.type === 'wireSegment' || item.type === 'wireControlPoint') && options.selectWire) {
        // These clicks are handled by the wire manipulation hooks
        return;
      }
      
      // Handle pin click for connections
      if (item.type === 'pin') {
        handlePinClick(item);
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
        handleNodeClick(item);
        return;
      }
    } else {
      // If clicking empty space and we have a component selected, place it
      if (options.selectedComponent) {
        options.onAddComponent(options.selectedComponent, x, y);
      } else if (connectionPreview.connectionStart) {
        // Cancel connection if clicking empty space
        resetCurrentConnection();
      } else if (options.selectWire) {
        // Deselect wire when clicking on empty space
        options.selectWire(null);
      }
    }
  }, [isDragging, circuit, options, connectionPreview, findItemAtPosition, getCanvasCoordinates, resetCurrentConnection]);
  
  // Handle pin click for connections
  const handlePinClick = useCallback((item: any) => {
    if (!item.position) return;
    
    if (connectionPreview.connectionStart) {
      // Complete connection if clicking on a different pin
      if (connectionPreview.connectionStart.componentId !== item.componentId) {
        if (connectionPreview.connectionStart.nodeId && item.id) {
          completeConnection(item.id, item.componentId || '');
        }
      }
      resetCurrentConnection();
    } else {
      // Start new connection
      const component = circuit.components.find(c => c.id === item.componentId);
      const pin = component?.pins.find(p => p.id === item.pinId);
      
      if (component && pin && item.position) {
        connectionPreview.startConnection({
          nodeId: pin.nodeId || '',
          pinId: pin.id,
          componentId: component.id,
          position: item.position
        });
      }
    }
  }, [circuit, connectionPreview, completeConnection, resetCurrentConnection]);
  
  // Handle node click for connections
  const handleNodeClick = useCallback((item: any) => {
    if (connectionPreview.connectionStart) {
      // Complete connection if we started from a pin
      if (connectionPreview.connectionStart.nodeId && connectionPreview.connectionStart.nodeId !== item.id) {
        completeConnection(item.id, '');
      }
      resetCurrentConnection();
    }
  }, [connectionPreview, completeConnection, resetCurrentConnection]);
  
  // Handle mouse down for dragging components and starting wire connections
  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (connectionPreview.isConnecting) return; // Don't start drag if we're making a connection
    
    const { x, y } = getCanvasCoordinates(e);
    const item = findItemAtPosition(x, y);
    
    if (item) {
      if (item.type === 'component' || item.type === 'wire') {
        setIsDragging(true);
        setDraggedItem(item);
        setDragStartPos({ x, y });
        if (item.type === 'wire' && options.selectWire) {
          options.selectWire(item.id);
        }
        e.preventDefault(); // Prevent text selection during drag
      } else if (item.type === 'pin' && item.position) {
        // Start wire connection immediately on mouse down
        handlePinMouseDown(item);
        e.preventDefault();
      }
    }
  }, [getCanvasCoordinates, findItemAtPosition, options, connectionPreview]);
  
  // Handle pin mouse down for starting connections
  const handlePinMouseDown = useCallback((item: any) => {
    const component = circuit.components.find(c => c.id === item.componentId);
    const pin = component?.pins.find(p => p.id === item.pinId);
    
    if (component && pin && item.position) {
      connectionPreview.startConnection({
        nodeId: pin.nodeId || '',
        pinId: pin.id,
        componentId: component.id,
        position: item.position
      });
      
      // Initialize connection end at the same point
      connectionPreview.updateConnectionEnd(item.position, null, circuit);
    }
  }, [circuit, connectionPreview]);
  
  // Handle mouse move for dragging and wire connections
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const { x, y } = getCanvasCoordinates(e);
    
    // Update current mouse position (used for drawing connection preview)
    if (connectionPreview.isConnecting) {
      const hoveredItem = findItemAtPosition(x, y);
      const hoveredNodeId = hoveredItem?.type === 'node' || hoveredItem?.type === 'pin' 
        ? hoveredItem.id 
        : null;
        
      connectionPreview.updateConnectionEnd({ x, y }, hoveredNodeId, circuit);
    }
    
    // Handle hovering for better visual feedback
    if (!isDragging && !connectionPreview.isConnecting) {
      const item = findItemAtPosition(x, y);
      setHoveredItem(item);
    }
    
    // Handle dragging components or wire segments
    if (isDragging && draggedItem) {
      const dx = x - dragStartPos.x;
      const dy = y - dragStartPos.y;
      
      if (draggedItem.type === 'component') {
        // This would be implemented in your circuit simulation engine
        setDragStartPos({ x, y });
      }
    }
  }, [circuit, isDragging, draggedItem, dragStartPos, connectionPreview, getCanvasCoordinates, findItemAtPosition]);
  
  // Handle mouse up to end dragging or complete connections
  const handleMouseUp = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    // End component or wire dragging
    if (isDragging) {
      setIsDragging(false);
      setDraggedItem(null);
    }
    
    // Complete any active wire connection
    if (connectionPreview.isConnecting) {
      const { x, y } = getCanvasCoordinates(e);
      const targetItem = findItemAtPosition(x, y);
      
      if (targetItem && (targetItem.type === 'node' || targetItem.type === 'pin')) {
        if (connectionPreview.connectionStart?.nodeId && targetItem.id) {
          const targetComponentId = targetItem.componentId || '';
          completeConnection(targetItem.id, targetComponentId);
        }
      }
      resetCurrentConnection();
    }
  }, [isDragging, connectionPreview, getCanvasCoordinates, findItemAtPosition, completeConnection, resetCurrentConnection]);
  
  // Get cursor style based on current state
  const getCurrentCursor = useCallback(() => {
    return getCursor({
      isDragging,
      isConnecting: connectionPreview.isConnecting,
      hoveredItem,
      isRunning: !!options.selectedWireId,
      draggedWire: false,
      selectedComponent: options.selectedComponent
    });
  }, [getCursor, isDragging, connectionPreview.isConnecting, hoveredItem, options.selectedWireId, options.selectedComponent]);
  
  return {
    hoveredItem,
    hoveredNodeId: connectionPreview.hoveredNodeId || (hoveredItem?.type === 'node' ? hoveredItem.id : null),
    connectionPreview,
    handleCanvasClick,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    isDragging,
    getCursor: getCurrentCursor
  };
}
