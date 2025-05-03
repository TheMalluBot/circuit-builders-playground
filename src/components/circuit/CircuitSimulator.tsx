
import React, { useState, useCallback, useEffect } from 'react';
import { ComponentPalette } from './ComponentPalette';
import { CircuitCanvas } from './CircuitCanvas';
import { SimulationControls } from './SimulationControls';
import { UndoRedoToolbar } from './UndoRedoToolbar';
import { useSimulation } from '@/hooks/useSimulation';
import { useUndoRedo } from '@/hooks/useUndoRedo';
import { ComponentType, CircuitItemType, Circuit } from '@/types/circuit';
import { useCircuitKeyboard } from '@/hooks/useCircuitKeyboard';
import { useToast } from '@/hooks/use-toast';
import { ActionFeedback } from './canvas/ActionFeedback';

export function CircuitSimulator() {
  const { toast } = useToast();
  
  // Simulation state
  const { 
    circuit: currentCircuit, 
    isRunning, 
    addComponent: addComponentToSimulation,
    connectNodes: connectNodesInSimulation,
    toggleSwitch: toggleSwitchInSimulation,
    moveComponent: moveComponentInSimulation,
    rotateComponent: rotateComponentInSimulation,
    deleteItem: deleteItemInSimulation,
    startSimulation, 
    stopSimulation, 
    resetSimulation
  } = useSimulation();
  
  // Implement undo/redo functionality
  const {
    currentCircuit: circuitWithHistory,
    addToHistory,
    undo,
    redo,
    canUndo,
    canRedo,
    currentActionDescription
  } = useUndoRedo(currentCircuit);
  
  // UI state
  const [selectedComponent, setSelectedComponent] = useState<ComponentType | null>(null);
  const [showVoltages, setShowVoltages] = useState(true);
  const [showCurrents, setShowCurrents] = useState(true);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [selectedItemType, setSelectedItemType] = useState<CircuitItemType | null>(null);
  const [cursorMode, setCursorMode] = useState<'default' | 'add' | 'connect' | 'drag' | 'select'>('default');
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  const [showCursorFeedback, setShowCursorFeedback] = useState(false);
  
  // Action feedback state
  const [actionFeedback, setActionFeedback] = useState({
    show: false,
    message: '',
    type: 'success' as 'success' | 'error' | 'info',
    position: { x: 0, y: 0 }
  });
  
  // Track mouse movement for cursor feedback
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    setCursorPosition({ x: e.clientX, y: e.clientY });
  }, []);
  
  // Show action feedback with automatic timeout
  const showFeedback = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success', position?: { x: number, y: number }) => {
    setActionFeedback({
      show: true,
      message,
      type,
      position: position || cursorPosition
    });
    
    setTimeout(() => {
      setActionFeedback(prev => ({ ...prev, show: false }));
    }, 2000);
  }, [cursorPosition]);
  
  // Enhanced operations that update history
  const addComponent = useCallback((type: ComponentType, x: number, y: number) => {
    const componentId = addComponentToSimulation(type, { x, y });
    
    // Add to history after a delay to ensure state is updated
    setTimeout(() => {
      addToHistory(currentCircuit, `Add ${type}`);
    }, 50);
    
    // Show feedback
    showFeedback(`Added ${type}`, 'success', { x, y });
    
    return componentId;
  }, [addComponentToSimulation, currentCircuit, addToHistory, showFeedback]);
  
  const connectNodes = useCallback((sourceId: string, targetId: string) => {
    if (sourceId && targetId && sourceId !== targetId) {
      connectNodesInSimulation(sourceId, targetId);
      
      // Add to history
      setTimeout(() => {
        addToHistory(currentCircuit, 'Connect components');
      }, 50);
      
      showFeedback('Connection created', 'success');
    } else {
      showFeedback('Cannot connect to the same node', 'error');
    }
  }, [connectNodesInSimulation, currentCircuit, addToHistory, showFeedback]);
  
  const rotateComponent = useCallback((componentId: string) => {
    rotateComponentInSimulation(componentId, 90);
    
    // Add to history
    setTimeout(() => {
      addToHistory(currentCircuit, 'Rotate component');
    }, 50);
    
    showFeedback('Component rotated', 'success');
  }, [rotateComponentInSimulation, currentCircuit, addToHistory, showFeedback]);
  
  const deleteItem = useCallback((type: CircuitItemType, id: string) => {
    deleteItemInSimulation(type, id);
    
    // Add to history
    setTimeout(() => {
      addToHistory(currentCircuit, `Delete ${type}`);
    }, 50);
    
    // Clear selection if deleted item was selected
    if (selectedItemId === id && selectedItemType === type) {
      setSelectedItemId(null);
      setSelectedItemType(null);
    }
    
    showFeedback(`${type} deleted`, 'info');
  }, [deleteItemInSimulation, currentCircuit, addToHistory, selectedItemId, selectedItemType, showFeedback]);
  
  const moveComponent = useCallback((id: string, dx: number, dy: number) => {
    moveComponentInSimulation(id, dx, dy);
  }, [moveComponentInSimulation]);
  
  const finalizeComponentMove = useCallback(() => {
    // Add to history after dragging is complete
    setTimeout(() => {
      addToHistory(currentCircuit, 'Move component');
    }, 50);
  }, [currentCircuit, addToHistory]);
  
  const toggleSwitch = useCallback((componentId: string) => {
    toggleSwitchInSimulation(componentId);
    
    // Add to history
    setTimeout(() => {
      addToHistory(currentCircuit, 'Toggle switch');
    }, 50);
    
    showFeedback('Switch toggled', 'info');
  }, [toggleSwitchInSimulation, currentCircuit, addToHistory, showFeedback]);
  
  // Handle undo/redo actions
  const handleUndo = useCallback(() => {
    const previousCircuit = undo();
    // Update the simulation with the previous state
    // This would need to be implemented in useSimulation to accept a full circuit state
    showFeedback('Undo: ' + currentActionDescription, 'info');
  }, [undo, currentActionDescription, showFeedback]);
  
  const handleRedo = useCallback(() => {
    const nextCircuit = redo();
    // Update the simulation with the next state
    showFeedback('Redo', 'info');
  }, [redo, showFeedback]);
  
  // Handle component selection with clear visual and toast feedback
  const handleComponentSelect = (type: ComponentType) => {
    setSelectedComponent(currentType => currentType === type ? null : type);
    
    // Update cursor mode
    if (type && cursorMode !== 'add') {
      setCursorMode('add');
      setShowCursorFeedback(true);
    } else if (!type) {
      setCursorMode('default');
      setShowCursorFeedback(false);
    }
    
    if (type) {
      toast({
        title: "Component Selected",
        description: `${type.charAt(0).toUpperCase() + type.slice(1)} selected. Click on the canvas to place it.`
      });
    }
  };
  
  // Handle item selection with cursor mode change
  const handleSelectItem = useCallback((type: CircuitItemType, id: string) => {
    setSelectedItemId(id);
    setSelectedItemType(type);
    
    // Update cursor mode
    setCursorMode('select');
    setShowCursorFeedback(true);
    
    if (type === 'component') {
      const componentType = id.split('_')[0];
      toast({
        title: `${componentType.charAt(0).toUpperCase() + componentType.slice(1)} Selected`,
        description: "Use R to rotate, Delete to remove, or drag to move."
      });
    }
  }, [toast]);
  
  // Handle wire update with history
  const handleUpdateWirePath = useCallback((wireId: string, newPath: { x: number, y: number }[]) => {
    // Update the circuit with the new wire path
    if (!currentCircuit) return;
    
    // Make deep copy of circuit
    const updatedCircuit: Circuit = {
      ...currentCircuit,
      wires: currentCircuit.wires.map(wire => {
        if (wire.id === wireId) {
          return { ...wire, path: newPath };
        }
        return wire;
      })
    };
    
    // Add to history after a small delay to ensure the state is updated
    setTimeout(() => {
      addToHistory(updatedCircuit, 'Adjust wire path');
    }, 50);
  }, [currentCircuit, addToHistory]);
  
  // Show cursor feedback when starting to drag
  const handleDragStart = useCallback(() => {
    setCursorMode('drag');
    setShowCursorFeedback(true);
  }, []);
  
  // Show cursor feedback when starting to connect
  const handleConnectionStart = useCallback(() => {
    setCursorMode('connect');
    setShowCursorFeedback(true);
  }, []);
  
  // Reset cursor mode when operations complete
  const handleOperationComplete = useCallback(() => {
    if (!selectedComponent) {
      setCursorMode('default');
      setShowCursorFeedback(false);
    } else {
      setCursorMode('add');
    }
  }, [selectedComponent]);
  
  // Set up keyboard shortcuts
  useCircuitKeyboard({
    onRotate: rotateComponent,
    onDelete: deleteItem,
    selectedItemId,
    selectedItemType,
    onUndo: canUndo ? handleUndo : undefined,
    onRedo: canRedo ? handleRedo : undefined
  });

  // Show initial help tooltip on component
  useEffect(() => {
    const timer = setTimeout(() => {
      toast({
        title: "Circuit Simulator Ready",
        description: "Select components from the palette and place them on the canvas. Right-click components for options.",
        duration: 5000
      });
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [toast]);
  
  return (
    <div className="w-full h-full flex flex-col" onMouseMove={handleMouseMove}>
      <div className="flex items-center justify-between px-2 py-1">
        <ComponentPalette 
          selectedComponent={selectedComponent} 
          onSelectComponent={handleComponentSelect}
        />
        
        <UndoRedoToolbar
          canUndo={canUndo}
          canRedo={canRedo}
          onUndo={handleUndo}
          onRedo={handleRedo}
          currentActionDescription={currentActionDescription}
        />
      </div>
      
      <div className="flex-1 bg-white border border-gray-200 relative overflow-hidden">
        <CircuitCanvas
          circuit={currentCircuit}
          selectedComponent={selectedComponent}
          onAddComponent={addComponent}
          onConnectNodes={connectNodes}
          onToggleSwitch={toggleSwitch}
          onUpdateWirePath={handleUpdateWirePath}
          showVoltages={showVoltages}
          showCurrents={showCurrents}
          isRunning={isRunning}
          onMoveComponent={moveComponent}
          onMoveComplete={finalizeComponentMove}
          onSelectItem={handleSelectItem}
          selectedItemId={selectedItemId}
          selectedItemType={selectedItemType}
          onRenameComponent={() => {}}
          onUndo={handleUndo}
          onRedo={handleRedo}
          canUndo={canUndo}
          canRedo={canRedo}
          onDragStart={handleDragStart}
          onConnectionStart={handleConnectionStart}
          onOperationComplete={handleOperationComplete}
        />
        
        <CursorModeFeedback
          mode={cursorMode}
          selectedComponent={selectedComponent}
          position={cursorPosition}
          visible={showCursorFeedback}
        />
        
        <ActionFeedback
          message={actionFeedback.message}
          type={actionFeedback.type}
          position={actionFeedback.position}
          show={actionFeedback.show}
        />
      </div>
      
      <SimulationControls
        isRunning={isRunning}
        onStart={startSimulation}
        onStop={stopSimulation}
        onReset={resetSimulation}
        showVoltages={showVoltages}
        onToggleVoltages={() => setShowVoltages(prev => !prev)}
        showCurrents={showCurrents}
        onToggleCurrents={() => setShowCurrents(prev => !prev)}
      />
    </div>
  );
}
