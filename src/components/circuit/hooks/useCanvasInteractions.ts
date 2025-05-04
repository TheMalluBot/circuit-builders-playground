
// Import necessary dependencies
import { useCallback, useState, RefObject, useEffect } from 'react';
import { Circuit, ComponentType } from '@/types/circuit';
import { findHoveredItem } from '../utils/ItemFinder';
import { useConnectionPreview } from './useConnectionPreview';
import { useDrag } from './useDrag';
import { useCursorStyle } from './interactions/useCursorStyle';
import { CircuitItemType } from '@/types/circuit';

interface CanvasPosition {
  x: number;
  y: number;
}

export interface CanvasInteractionOptions {
  selectedComponent: ComponentType | null;
  onAddComponent: (type: ComponentType, x: number, y: number) => void;
  onConnectNodes: (sourceId: string, targetId: string) => void;
  onToggleSwitch: (componentId: string) => void;
  selectedWireId: string | null;
  selectWire: (wireId: string | null) => void;
  onMoveComponent?: (id: string, dx: number, dy: number) => void;
  onMoveComplete?: () => void;
  onDragStart?: () => void;
  onConnectionStart?: () => void;
  onOperationComplete?: () => void;
}

export function useCanvasInteractions(
  canvasRef: RefObject<HTMLCanvasElement>,
  circuit: Circuit,
  options: CanvasInteractionOptions
) {
  const [hoveredItem, setHoveredItem] = useState<{ type: CircuitItemType; id: string } | null>(null);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [clickStartPosition, setClickStartPosition] = useState<CanvasPosition | null>(null);
  
  const { getCursor } = useCursorStyle();
  
  const {
    selectedComponent,
    onAddComponent,
    onConnectNodes,
    onToggleSwitch,
    selectedWireId,
    selectWire,
    onMoveComponent,
    onMoveComplete,
    onDragStart,
    onConnectionStart,
    onOperationComplete
  } = options;

  const connectionPreview = useConnectionPreview();
  const { isDragging, dragState, hasDragged, startDrag, updateDrag, endDrag } = useDrag();
  
  // Handle mouse down on canvas
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Store click start position to detect if this was a click or a drag later
    setClickStartPosition({ x, y });
    
    const item = findHoveredItem(circuit, x, y);
    
    if (item) {
      setHoveredItem(item);
      
      // Start dragging component
      if (item.type === 'component') {
        startDrag(item.id, x, y);
        if (onDragStart) {
          onDragStart();
        }
      }
      
      // Select wire if clicked on wire or wire segment
      if (item.type === 'wire' || item.type === 'wireSegment') {
        selectWire(item.id);
      }
    }
    
    // Handle connection start
    if (item?.type === 'pin') {
      connectionPreview.startConnection({
        nodeId: item.id,
        pinId: item.pinId || "",
        componentId: item.componentId || "",
        position: { x, y }
      });
      
      if (onConnectionStart) {
        onConnectionStart();
      }
    }
  }, [circuit, connectionPreview, onConnectionStart, onDragStart, selectWire, startDrag, canvasRef]);

  // Handle mouse move on canvas
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const item = findHoveredItem(circuit, x, y);
    setHoveredItem(item);
    
    // Update hovered node for connection preview
    if (item?.type === 'pin') {
      setHoveredNodeId(item.id);
      connectionPreview.updateConnectionEnd({ x, y }, item.id, circuit);
    } else {
      setHoveredNodeId(null);
      connectionPreview.updateConnectionEnd({ x, y }, null, circuit);
    }
    
    // Handle component dragging
    if (dragState && hoveredItem?.type === 'component' && onMoveComponent) {
      const dx = x - dragState.startX;
      const dy = y - dragState.startY;
      
      updateDrag(x, y); // Update drag state to track if this is a real drag
      onMoveComponent(hoveredItem.id, dx, dy);
    }
  }, [circuit, connectionPreview, hoveredItem, dragState, onMoveComponent, canvasRef, updateDrag]);

  // Handle mouse up on canvas
  const handleMouseUp = useCallback((e: React.MouseEvent) => {
    if (!canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Handle connection end
    if (connectionPreview.isConnecting) {
      const item = findHoveredItem(circuit, x, y);
      
      if (item?.type === 'pin' && connectionPreview.connectionStart && 
          item.id !== connectionPreview.connectionStart.nodeId) {
        onConnectNodes(connectionPreview.connectionStart.nodeId || "", item.id);
      }
      
      connectionPreview.resetConnection();
    }
    
    // Handle end of component drag
    if (dragState && hoveredItem?.type === 'component') {
      endDrag();
      if (onMoveComplete) {
        onMoveComplete();
      }
    }
    
    setClickStartPosition(null);
    setHoveredItem(null);
  }, [circuit, connectionPreview, endDrag, hoveredItem, dragState, onConnectNodes, onMoveComplete, canvasRef]);
  
  // Handle canvas click
  const handleCanvasClick = useCallback((e: React.MouseEvent) => {
    if (!canvasRef.current || hasDragged) return; // Skip if we actually dragged
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const item = findHoveredItem(circuit, x, y);
    
    // Add component if selected
    if (selectedComponent && !item) {
      onAddComponent(selectedComponent, x, y);
    }
  }, [circuit, onAddComponent, selectedComponent, canvasRef, hasDragged]);
  
  // Cleanup function when operations complete
  useEffect(() => {
    if (!isDragging && !connectionPreview.isConnecting && onOperationComplete) {
      onOperationComplete();
    }
  }, [isDragging, connectionPreview.isConnecting, onOperationComplete]);
  
  return {
    hoveredItem,
    hoveredNodeId,
    connectionPreview,
    handleCanvasClick,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    isDragging
  };
}
