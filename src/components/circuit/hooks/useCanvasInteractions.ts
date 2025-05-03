
import { useState, useCallback, RefObject } from 'react';
import { Circuit, ComponentType, CircuitItemType } from '@/types/circuit';
import { findHoveredItem } from '../utils/ItemFinder';
import { getMousePosition } from '../utils/CanvasUtils';
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
  
  // Connection state with enhanced preview
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
      // Handle wire selection
      if (item.type === 'wire' && options.selectWire) {
        options.selectWire(item.id);
        return;
      }
      
      // Handle wire segment or control point clicks - these are handled by useWireManipulation
      if ((item.type === 'wireSegment' || item.type === 'wireControlPoint') && options.selectWire) {
        // These clicks will be handled by the wire manipulation hooks
        return;
      }
      
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
        } else if (item.position) {
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
      } else if (options.selectWire) {
        // Deselect wire when clicking on empty space
        options.selectWire(null);
      }
    }
  }, [isDragging, canvasRef, circuit, options, connectionPreview]);
  
  // Handle mouse down for dragging components and starting wire connections
  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (connectionPreview.isConnecting) return; // Don't start drag if we're making a connection
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const { x, y } = getMousePosition(e, canvas);
    
    // Find if we're clicking on a draggable item
    const item = findHoveredItem(circuit, x, y);
    
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
        const component = circuit.components.find(c => c.id === item.componentId);
        const pin = component?.pins.find(p => p.id === item.pinId);
        
        if (component && pin) {
          connectionPreview.startConnection({
            nodeId: pin.nodeId,
            pinId: pin.id,
            componentId: component.id,
            position: item.position
          });
          
          // Initialize connection end at the same point
          connectionPreview.updateConnectionEnd(item.position, null, circuit);
          e.preventDefault(); // Prevent text selection during drag
        }
      }
    }
  }, [canvasRef, circuit, connectionPreview, options]);
  
  // Handle mouse move for dragging and wire connections
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
        
      connectionPreview.updateConnectionEnd({ x, y }, hoveredNodeId, circuit);
    }
    
    // Handle hovering for better visual feedback
    if (!isDragging && !connectionPreview.isConnecting) {
      const item = findHoveredItem(circuit, x, y);
      setHoveredItem(item);
    }
    
    // Handle dragging components or wire segments
    if (isDragging && draggedItem) {
      const dx = x - dragStartPos.x;
      const dy = y - dragStartPos.y;
      
      if (draggedItem.type === 'component') {
        // Implement component dragging
        // This functionality would typically be provided by your circuit simulation engine
        // For now, we'll leave this as a placeholder
        
        setDragStartPos({ x, y });
      }
    }
  }, [canvasRef, circuit, isDragging, draggedItem, dragStartPos, connectionPreview]);
  
  // Handle mouse up to end dragging or complete connections
  const handleMouseUp = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    // End component or wire dragging
    if (isDragging) {
      setIsDragging(false);
      setDraggedItem(null);
    }
    
    // Complete any active wire connection
    if (connectionPreview.isConnecting) {
      const canvas = canvasRef.current;
      if (canvas) {
        const { x, y } = getMousePosition(e, canvas);
        const targetItem = findHoveredItem(circuit, x, y);
        
        if (targetItem && (targetItem.type === 'node' || targetItem.type === 'pin')) {
          if (connectionPreview.connectionStart?.nodeId && targetItem.id && 
              connectionPreview.connectionStart.nodeId !== targetItem.id &&
              connectionPreview.connectionStart.componentId !== targetItem.componentId) {
            // Connect if we're on a different node or pin
            options.onConnectNodes(connectionPreview.connectionStart.nodeId, targetItem.id);
          }
        }
      }
      connectionPreview.resetConnection();
    }
  }, [isDragging, connectionPreview, canvasRef, circuit, options]);
  
  return {
    hoveredItem,
    hoveredNodeId: connectionPreview.hoveredNodeId || (hoveredItem?.type === 'node' ? hoveredItem.id : null),
    connectionPreview,
    handleCanvasClick,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    isDragging
  };
}
