
import React, { useRef, useCallback, useState } from 'react';
import { Circuit, ComponentType, CircuitItemType } from '@/types/circuit';
import { useCanvasInteractions } from './hooks/useCanvasInteractions';
import { useCanvasDrawing } from './hooks/useCanvasDrawing';
import { useWireManipulation } from './hooks/useWireManipulation';
import { resizeCanvas } from './utils/CanvasUtils';
import { findHoveredItem } from './utils/ItemFinder';
import { useToast } from '@/hooks/use-toast';

interface CircuitCanvasProps {
  circuit: Circuit;
  selectedComponent: ComponentType | null;
  onAddComponent: (type: ComponentType, x: number, y: number) => void;
  onConnectNodes: (sourceId: string, targetId: string) => void;
  onUpdateWirePath: (wireId: string, newPath: { x: number; y: number }[]) => void;
  onToggleSwitch: (componentId: string) => void;
  showVoltages: boolean;
  showCurrents: boolean;
  isRunning: boolean;
}

export function CircuitCanvas({
  circuit,
  selectedComponent,
  onAddComponent,
  onConnectNodes,
  onUpdateWirePath,
  onToggleSwitch,
  showVoltages,
  showCurrents,
  isRunning
}: CircuitCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();
  
  // Track selected component for visual indication
  const [selectedComponentId, setSelectedComponentId] = useState<string | null>(null);
  const [rightClickMenu, setRightClickMenu] = useState<{
    show: boolean;
    x: number;
    y: number;
    componentId: string | null;
  }>({
    show: false,
    x: 0,
    y: 0,
    componentId: null
  });

  // Set up wire manipulation with proper integration
  const {
    draggedWire,
    selectedWireId,
    startDragControlPoint,
    dragControlPoint,
    endDragControlPoint,
    addControlPoint,
    selectWire
  } = useWireManipulation(onUpdateWirePath);

  // Set up canvas interactions with enhanced wire connection experience
  const {
    hoveredItem,
    hoveredNodeId,
    connectionPreview,
    handleCanvasClick,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    isDragging
  } = useCanvasInteractions(canvasRef, circuit, {
    selectedComponent,
    onAddComponent,
    onConnectNodes,
    onToggleSwitch,
    selectedWireId,
    selectWire
  });
  
  // Handle canvas resizing
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Set canvas size
    const handleResize = () => canvas && resizeCanvas(canvas);
    handleResize();
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Component selection handler
  const selectComponent = useCallback((componentId: string | null) => {
    setSelectedComponentId(componentId);
    if (componentId) {
      toast({
        title: "Component Selected",
        description: `Component ${componentId.split('_')[0]} selected. Use R to rotate or Delete to remove.`
      });
    }
  }, [toast]);
  
  // Rotate the selected component
  const handleRotateComponent = useCallback((componentId: string) => {
    // This will be handled by keyboard shortcut through useCircuitKeyboard
    console.log(`Rotating component: ${componentId}`);
  }, []);
  
  // Handle right-click context menu
  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    
    if (!canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const item = findHoveredItem(circuit, x, y);
    
    if (item?.type === 'component') {
      setRightClickMenu({
        show: true,
        x: e.clientX,
        y: e.clientY,
        componentId: item.id
      });
      
      // Also select the component
      selectComponent(item.id);
    } else {
      // Hide menu if clicked elsewhere
      setRightClickMenu({ show: false, x: 0, y: 0, componentId: null });
    }
  }, [circuit, selectComponent]);
  
  // Handle custom mouse actions for better component interaction
  const handleMouseDownWithInteraction = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    // Hide context menu when clicking anywhere
    setRightClickMenu({ show: false, x: 0, y: 0, componentId: null });
    
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
      selectComponent(item.id);
      
      // Special handling for switches during simulation
      if (isRunning && item.id.includes('switch')) {
        onToggleSwitch(item.id);
        e.preventDefault();
        return;
      }
    } else if (!item) {
      // Clicked empty space, deselect
      selectComponent(null);
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
      selectWire(item.id);
      e.preventDefault();
      return;
    } else if (!item || (item.type !== 'wireControlPoint' && item.type !== 'wireSegment')) {
      selectWire(null);
    }
    
    // Pin interaction for connections
    if (item?.type === 'pin' && item.position) {
      const component = circuit.components.find(c => c.id === item.componentId);
      const pin = component?.pins.find(p => p.id === item.pinId);
      
      if (component && pin && item.position) {
        console.log("Starting connection from pin:", pin.id, "on component:", component.id);
        connectionPreview.startConnection({
          nodeId: pin.nodeId,
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
  }, [handleMouseDown, circuit, startDragControlPoint, addControlPoint, selectWire, 
      connectionPreview, isRunning, onToggleSwitch, selectComponent]);
  
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
        targetItem.id : 
        targetItem?.type === 'node' ? targetItem.id : null;
      
      connectionPreview.updateConnectionEnd({ x, y }, targetNodeId, circuit);
      e.preventDefault();
      return;
    }
    
    // Fall back to regular mouse handler for other interactions
    handleMouseMove(e);
  }, [handleMouseMove, draggedWire, dragControlPoint, circuit, connectionPreview]);
  
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
          
          // Show a success toast - FIX: Change variant from "success" to "default"
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
  }, [handleMouseUp, draggedWire, endDragControlPoint, connectionPreview, circuit, onConnectNodes, toast]);
  
  // Set up canvas drawing with enhanced wire preview and wire selection
  useCanvasDrawing(canvasRef, circuit, {
    showVoltages,
    showCurrents,
    hoveredNodeId,
    selectedWireId,
    selectedComponentId,
    connectionPreview: {
      getPreviewPath: (c: Circuit) => connectionPreview.getPreviewPath(c),
      connectionStart: connectionPreview.connectionStart,
      isConnecting: connectionPreview.isConnecting,
      magneticSnap: {
        point: connectionPreview.magneticSnap?.position || { x: 0, y: 0 },
        nodeId: connectionPreview.hoveredNodeId
      }
    }
  });
  
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
  
  return (
    <div className="relative w-full h-full">
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        onClick={handleCanvasClick}
        onMouseDown={handleMouseDownWithInteraction}
        onMouseMove={handleMouseMoveWithInteraction}
        onMouseUp={handleMouseUpWithInteraction}
        onMouseLeave={handleMouseUpWithInteraction}
        onContextMenu={handleContextMenu}
        style={{ cursor: getCursor() }}
      />
      
      {/* Right-click context menu */}
      {rightClickMenu.show && (
        <div 
          className="absolute bg-white shadow-lg rounded border border-gray-200 py-1 z-50"
          style={{
            left: rightClickMenu.x, 
            top: rightClickMenu.y
          }}
        >
          <button 
            className="w-full text-left px-4 py-2 hover:bg-gray-100"
            onClick={() => {
              if (rightClickMenu.componentId) {
                toast({
                  title: "Component Rotated",
                  description: "Component rotated 90 degrees clockwise",
                });
                
                // This should trigger the rotation action
                document.dispatchEvent(new KeyboardEvent('keydown', { key: 'r' }));
              }
              setRightClickMenu({ show: false, x: 0, y: 0, componentId: null });
            }}
          >
            Rotate
          </button>
          <button 
            className="w-full text-left px-4 py-2 hover:bg-gray-100"
            onClick={() => {
              if (rightClickMenu.componentId) {
                // This should trigger the delete action
                document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Delete' }));
              }
              setRightClickMenu({ show: false, x: 0, y: 0, componentId: null });
            }}
          >
            Delete
          </button>
        </div>
      )}

      {/* Component properties tooltip (for future enhancement) */}
      {selectedComponentId && hoveredItem?.type === 'component' && (
        <div className="absolute bottom-4 right-4 bg-white p-2 rounded shadow">
          <p className="text-sm">{selectedComponentId}</p>
        </div>
      )}
    </div>
  );
}
