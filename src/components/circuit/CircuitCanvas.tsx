
import React, { useRef, useState } from 'react';
import { Circuit, ComponentType, CircuitItemType } from '@/types/circuit';
import { useCanvasInteractions } from './hooks/useCanvasInteractions';
import { useCanvasDrawing } from './hooks/useCanvasDrawing';
import { useWireManipulation } from './hooks/useWireManipulation';
import { resizeCanvas } from './utils/CanvasUtils';
import { findHoveredItem } from './utils/ItemFinder';
import { useToast } from '@/hooks/use-toast';
import { EnhancedContextMenu } from './canvas/EnhancedContextMenu';
import { CanvasInteractionHandler } from './canvas/CanvasInteractionHandler';
import { CanvasOverlay } from './canvas/CanvasOverlay';
import { GhostElement } from './canvas/GhostElement';
import { NodeHighlight } from './canvas/NodeHighlight';
import { useCircuitCanvasCursor } from './hooks/useCircuitCanvasCursor';
import { CanvasEvents } from './canvas/CanvasEvents';

interface CircuitCanvasProps {
  circuit: Circuit;
  selectedComponent: ComponentType | null;
  onAddComponent: (type: ComponentType, x: number, y: number) => void;
  onConnectNodes: (sourceId: string, targetId: string) => void;
  onUpdateWirePath: (wireId: string, newPath: { x: number; y: number }[]) => void;
  onToggleSwitch: (componentId: string) => void;
  onMoveComponent?: (id: string, dx: number, dy: number) => void;
  onMoveComplete?: () => void;
  onSelectItem?: (type: CircuitItemType, id: string) => void;
  selectedItemId?: string | null;
  selectedItemType?: CircuitItemType | null;
  onRenameComponent?: (id: string, name: string) => void;
  showVoltages: boolean;
  showCurrents: boolean;
  isRunning: boolean;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

export function CircuitCanvas({
  circuit,
  selectedComponent,
  onAddComponent,
  onConnectNodes,
  onUpdateWirePath,
  onToggleSwitch,
  onMoveComponent,
  onMoveComplete,
  onSelectItem,
  selectedItemId,
  selectedItemType,
  onRenameComponent,
  showVoltages,
  showCurrents,
  isRunning,
  onUndo,
  onRedo,
  canUndo,
  canRedo
}: CircuitCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();
  const { getCanvasCursor } = useCircuitCanvasCursor();
  
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
    selectWire,
    onMoveComponent,
    onMoveComplete,
    onDragStart: () => {}, // Provide empty handlers to fix TypeScript errors
    onConnectionStart: () => {},
    onOperationComplete: () => {}
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
  const handleSelectItem = React.useCallback((itemType: CircuitItemType, itemId: string | null) => {
    // Call the parent's handler if provided
    if (onSelectItem && itemId) {
      onSelectItem(itemType, itemId);
    }
    
    // Select wires
    if (itemType === 'wire' && itemId) {
      selectWire(itemId);
    } else if (itemType !== 'wire') {
      selectWire(null);
    }
    
    // Hide info panel when deselecting
    if (!itemId) {
      setInfoPanel({...infoPanel, show: false});
    }
  }, [onSelectItem, selectWire, infoPanel]);
  
  // Handle rotation from context menu
  const handleRotate = React.useCallback((componentId: string) => {
    if (onMoveComponent) {
      onMoveComponent(componentId, 0, 0); // This would be replaced with actual rotation logic
    }
  }, [onMoveComponent]);
  
  // Handle deletion from context menu
  const handleDelete = React.useCallback((itemType: CircuitItemType, itemId: string) => {
    // This would be implemented in the parent component
  }, []);
  
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

  // Get canvas events
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
    onSelectComponent: (id) => handleSelectItem('component', id),
    onSelectWire: selectWire,
    onContextMenu: () => {}, // Context menu now handled by EnhancedContextMenu
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
    selectedComponentId: selectedItemType === 'component' ? selectedItemId : null,
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
  
  const closeInfoPanel = () => {
    setInfoPanel({...infoPanel, show: false});
  };
  
  // Handler for opening properties dialog
  const handleOpenProperties = (id: string) => {
    const component = circuit.components.find(c => c.id === id);
    if (component) {
      setInfoPanel({
        show: true,
        componentId: id,
        position: { x: window.innerWidth / 2, y: window.innerHeight / 3 }
      });
    }
  };

  // Get cursor style
  const cursor = getCanvasCursor({
    isDragging,
    isConnecting: connectionPreview.isConnecting,
    hoveredItem,
    isRunning,
    draggedWire: !!draggedWire,
    selectedComponent
  });
  
  // Extract the properties we need from connectionPreview
  const wireStart = connectionPreview.connectionStart?.position || null;
  const tempWireEnd = connectionPreview.currentMousePos || null;
  
  // We need to handle the drag and drop states separately as they don't exist on connectionPreview
  const [ghostPosition, setGhostPosition] = useState<{x: number, y: number} | null>(null);
  const [paletteDragInfo, setPaletteDragInfo] = useState<{
    type: string;
    offsetX: number;
    offsetY: number;
  } | null>(null);
  const [placementFeedback, setPlacementFeedback] = useState<{x: number, y: number} | null>(null);
  
  return (
    <EnhancedContextMenu
      itemType={selectedItemType || null}
      itemId={selectedItemId || null}
      onRotate={handleRotate}
      onDelete={handleDelete}
      onOpenProperties={handleOpenProperties}
      onUndo={onUndo}
      onRedo={onRedo}
      canUndo={canUndo}
      canRedo={canRedo}
    >
      <CanvasInteractionHandler
        circuit={circuit}
        hoveredItem={hoveredItem}
        hoveredNodeId={hoveredNodeId}
        connectionPreview={connectionPreview}
        isDragging={isDragging}
        draggedWire={draggedWire}
        handleCanvasClick={handleCanvasClick}
        handleMouseDown={canvasEvents.handleMouseDownWithInteraction}
        handleMouseMove={canvasEvents.handleMouseMoveWithInteraction}
        handleMouseUp={canvasEvents.handleMouseUpWithInteraction}
        handleDoubleClick={handleDoubleClick}
        canvasRef={canvasRef}
        selectedComponent={selectedComponent}
        cursor={cursor}
      >
        <CanvasOverlay
          infoPanel={infoPanel}
          circuit={circuit}
          showVoltages={showVoltages}
          isRunning={isRunning}
          onCloseInfoPanel={closeInfoPanel}
          wireStart={wireStart}
          tempWireEnd={tempWireEnd}
          hoveredNodeId={hoveredNodeId}
          placementFeedback={placementFeedback}
        />

        <GhostElement
          position={ghostPosition}
          dragInfo={paletteDragInfo}
        />

        <NodeHighlight
          nodeId={hoveredNodeId}
          wireStart={wireStart}
          simulationState={null} // We don't have access to simulationState here
        />
      </CanvasInteractionHandler>
    </EnhancedContextMenu>
  );
}

