
import React, { useRef, useState } from 'react';
import { Circuit, ComponentType } from '@/types/circuit';
import { useCanvasInteractions } from './hooks/useCanvasInteractions';
import { useCanvasDrawing } from './hooks/useCanvasDrawing';
import { useWireManipulation } from './hooks/useWireManipulation';
import { resizeCanvas } from './utils/CanvasUtils';
import { findHoveredItem } from './utils/ItemFinder';
import { useToast } from '@/hooks/use-toast';
import { InfoPanel } from './canvas/InfoPanel';
import { ContextMenu } from './canvas/ContextMenu';
import { VoltageOverlay } from './canvas/VoltageOverlay';
import { CanvasEvents } from './canvas/CanvasEvents';

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
  
  // State for info panel (showing component properties)
  const [infoPanel, setInfoPanel] = useState<{
    show: boolean;
    componentId: string | null;
    position: { x: number; y: number };
  }>({
    show: false,
    componentId: null,
    position: { x: 0, y: 0 }
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
  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Set canvas size
    const handleResize = () => canvas && resizeCanvas(canvas);
    handleResize();
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Component selection handler
  const selectComponent = React.useCallback((componentId: string | null) => {
    setSelectedComponentId(componentId);
    if (componentId) {
      const component = circuit.components.find(c => c.id === componentId);
      if (component) {
        toast({
          title: "Component Selected",
          description: `${component.type.charAt(0).toUpperCase() + component.type.slice(1)} selected. Use R to rotate or Delete to remove.`
        });
      }
    }
    
    // Hide info panel when deselecting
    if (!componentId) {
      setInfoPanel({...infoPanel, show: false});
    }
  }, [toast, circuit.components, infoPanel]);
  
  // Handle right-click context menu
  const handleContextMenu = React.useCallback((e: React.MouseEvent) => {
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
  
  // Show info panel with component properties on double click
  const handleDoubleClick = React.useCallback((e: React.MouseEvent) => {
    if (!canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const item = findHoveredItem(circuit, x, y);
    
    if (item?.type === 'component') {
      const component = circuit.components.find(c => c.id === item.id);
      if (component) {
        setInfoPanel({
          show: true,
          componentId: item.id,
          position: { x: e.clientX, y: e.clientY }
        });
      }
    } else {
      setInfoPanel({...infoPanel, show: false});
    }
  }, [circuit, infoPanel]);

  // Get canvas event handlers
  const canvasEvents = CanvasEvents({
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
    onSelectComponent: selectComponent,
    onSelectWire: selectWire,
    onContextMenu: handleContextMenu,
    onDoubleClick: handleDoubleClick,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    dragControlPoint,
    endDragControlPoint,
    startDragControlPoint,
    addControlPoint,
    selectedComponent
  });
  
  // Set up canvas drawing with enhanced wire preview and wire selection
  useCanvasDrawing(canvasRef, circuit, {
    showVoltages,
    showCurrents,
    hoveredNodeId,
    selectedWireId,
    selectedComponentId,
    animateCurrentFlow: isRunning,
    theme: 'light',
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
  
  const closeContextMenu = () => {
    setRightClickMenu({ show: false, x: 0, y: 0, componentId: null });
  };

  const closeInfoPanel = () => {
    setInfoPanel({...infoPanel, show: false});
  };
  
  return (
    <div className="relative w-full h-full">
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        onClick={handleCanvasClick}
        onMouseDown={canvasEvents.handleMouseDownWithInteraction}
        onMouseMove={canvasEvents.handleMouseMoveWithInteraction}
        onMouseUp={canvasEvents.handleMouseUpWithInteraction}
        onMouseLeave={canvasEvents.handleMouseUpWithInteraction}
        onContextMenu={handleContextMenu}
        onDoubleClick={handleDoubleClick}
        style={{ cursor: canvasEvents.getCursor() }}
      />
      
      {/* Context Menu */}
      <ContextMenu 
        show={rightClickMenu.show}
        x={rightClickMenu.x}
        y={rightClickMenu.y}
        componentId={rightClickMenu.componentId}
        onClose={closeContextMenu}
      />
      
      {/* Component properties info panel */}
      <InfoPanel 
        show={infoPanel.show}
        componentId={infoPanel.componentId}
        position={infoPanel.position}
        circuit={circuit}
      />
      
      {/* Voltage overlay */}
      <VoltageOverlay show={showVoltages && isRunning} />
    </div>
  );
}
