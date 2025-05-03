
import React, { useCallback } from 'react';
import { Circuit, ComponentType, CircuitItemType } from '@/types/circuit';
import { findHoveredItem } from '../utils/ItemFinder';
import { useToast } from '@/hooks/use-toast';

interface CanvasEventsProps {
  circuit: Circuit;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  connectionPreview: any;
  draggedWire: any;
  isDragging: boolean;
  hoveredItem: any;
  isRunning: boolean;
  onAddComponent: (type: ComponentType, x: number, y: number) => void;
  onConnectNodes: (sourceId: string, targetId: string) => void;
  onToggleSwitch: (componentId: string) => void;
  onSelectComponent: (componentId: string | null) => void;
  onSelectWire: (wireId: string | null) => void;
  onContextMenu: (e: React.MouseEvent) => void;
  onDoubleClick: (e: React.MouseEvent) => void;
  handleMouseDown: (e: React.MouseEvent) => void;
  handleMouseMove: (e: React.MouseEvent) => void;
  handleMouseUp: (e: React.MouseEvent) => void;
  dragControlPoint: (position: { x: number; y: number }, circuit: Circuit) => void;
  endDragControlPoint: () => void;
  startDragControlPoint: (wireId: string, pointIndex: number, position: { x: number; y: number }) => void;
  addControlPoint: (wireId: string, segmentIndex: number, position: { x: number; y: number }, circuit: Circuit) => void;
  selectedComponent: ComponentType | null;
}

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
}: CanvasEventsProps) {
  const { toast } = useToast();
  
  // Handle mouse down with interaction logic
  const handleMouseDownWithInteraction = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    // Hide context menu when clicking anywhere
    
    // Right-click is handled separately
    if (e.button === 2) return;
    
    if (connectionPreview.isConnecting) return; // Don't handle if already connecting
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Check what was clicked
    const item = findHoveredItem(circuit, x, y);
    
    if (item?.type === 'component') {
      // Select the component
      onSelectComponent(item.id);
      
      // Special handling for switches during simulation
      if (isRunning && item.id.includes('switch')) {
        onToggleSwitch(item.id);
        e.preventDefault();
        return;
      }
    } else if (!item) {
      // Clicked empty space, deselect
      onSelectComponent(null);
    }
    
    // Wire interaction handling
    if (item?.type === 'wireControlPoint' && item.wireId && item.pointIndex !== undefined && item.position) {
      startDragControlPoint(item.wireId, item.pointIndex, item.position);
      e.preventDefault();
      return;
    }
    
    if (item?.type === 'wireSegment' && item.wireId && item.segmentIndex !== undefined && 
        item.start && item.end) {
      // Add a new control point
      const midX = (item.start.x + item.end.x) / 2;
      const midY = (item.start.y + item.end.y) / 2;
      
      addControlPoint(item.wireId, item.segmentIndex, { x: midX, y: midY }, circuit);
      e.preventDefault();
      return;
    }
    
    if (item?.type === 'wire' && item.id) {
      onSelectWire(item.id);
      e.preventDefault();
      return;
    } else if (!item || (item.type !== 'wireControlPoint' && item.type !== 'wireSegment')) {
      onSelectWire(null);
    }
    
    // Pin interaction for connections
    if (item?.type === 'pin' && item.position) {
      const component = circuit.components.find(c => c.id === item.componentId);
      const pin = component?.pins.find(p => p.id === item.pinId);
      
      if (component && pin && item.position) {
        console.log("Starting connection from pin:", pin.id, "on component:", component.id);
        connectionPreview.startConnection({
          nodeId: pin.nodeId!,
          pinId: pin.id,
          componentId: component.id,
          position: item.position
        });
        
        // Initialize connection end at the same position
        connectionPreview.updateConnectionEnd(item.position, null, circuit);
        e.preventDefault();
        return;
      }
    }
    
    // Fall back to regular mouse handler for other interactions
    handleMouseDown(e);
  }, [handleMouseDown, circuit, startDragControlPoint, addControlPoint, onSelectWire, 
      connectionPreview, isRunning, onToggleSwitch, onSelectComponent, canvasRef]);
  
  // Handle mouse move with interaction logic
  const handleMouseMoveWithInteraction = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Check if we're dragging a wire control point
    if (draggedWire) {
      dragControlPoint({ x, y }, circuit);
      e.preventDefault();
      return;
    }
    
    // Check if we're creating a connection
    if (connectionPreview.isConnecting) {
      const targetItem = findHoveredItem(circuit, x, y);
      const targetNodeId = targetItem?.type === 'pin' ? 
        circuit.components.find(c => c.id === targetItem.componentId)?.pins.find(p => p.id === targetItem.pinId)?.nodeId : 
        targetItem?.type === 'node' ? targetItem.id : null;
      
      connectionPreview.updateConnectionEnd({ x, y }, targetNodeId, circuit);
      e.preventDefault();
      return;
    }
    
    // Fall back to regular mouse handler for other interactions
    handleMouseMove(e);
  }, [handleMouseMove, draggedWire, dragControlPoint, circuit, connectionPreview, canvasRef]);
  
  // Handle mouse up with interaction logic
  const handleMouseUpWithInteraction = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // End wire control point dragging if active
    if (draggedWire) {
      endDragControlPoint();
      e.preventDefault();
      return;
    }
    
    // Complete connection if we're connecting
    if (connectionPreview.isConnecting) {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const targetItem = findHoveredItem(circuit, x, y);
      
      if (targetItem?.type === 'pin' && connectionPreview.connectionStart?.nodeId) {
        // Complete connection to this pin
        const component = circuit.components.find(c => c.id === targetItem.componentId);
        const pin = component?.pins.find(p => p.id === targetItem.pinId);
        
        if (component && pin && pin.nodeId && 
            connectionPreview.connectionStart.componentId !== component.id) {
          console.log("Completing connection to pin:", pin.id, "on component:", component.id);
          onConnectNodes(connectionPreview.connectionStart.nodeId, pin.nodeId);
          
          // Show a success toast
          toast({
            title: "Connection Created",
            description: "Components connected successfully"
          });
        }
      }
      
      connectionPreview.resetConnection();
      e.preventDefault();
      return;
    }
    
    // Fall back to regular mouse handler for other interactions
    handleMouseUp(e);
  }, [handleMouseUp, draggedWire, endDragControlPoint, connectionPreview, circuit, onConnectNodes, toast, canvasRef]);

  // Determine cursor based on current state for better visual feedback
  const getCursor = () => {
    if (draggedWire) return 'grabbing';
    if (hoveredItem?.type === 'wireControlPoint') return 'pointer';
    if (hoveredItem?.type === 'wireSegment') return 'pointer';
    if (hoveredItem?.type === 'pin') return 'crosshair';
    if (hoveredItem?.type === 'component' && isRunning && hoveredItem.id.includes('switch')) return 'pointer';
    if (hoveredItem?.type === 'component') return 'move';
    if (selectedComponent) return 'crosshair';
    if (connectionPreview.isConnecting) return 'crosshair';
    if (isDragging) return 'grabbing';
    return 'default';
  };

  return {
    handleMouseDownWithInteraction,
    handleMouseMoveWithInteraction,
    handleMouseUpWithInteraction,
    getCursor
  };
}
