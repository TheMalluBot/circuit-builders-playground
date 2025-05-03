import React, { useState, useCallback, useEffect } from 'react';
import { ComponentPalette } from './ComponentPalette';
import { CircuitCanvas } from './CircuitCanvas';
import { SimulationControls } from './SimulationControls';
import { useSimulation } from '@/hooks/useSimulation';
import { ComponentType, CircuitItemType } from '@/types/circuit';
import { useCircuitKeyboard } from '@/hooks/useCircuitKeyboard';
import { useToast } from '@/hooks/use-toast';

export function CircuitSimulator() {
  const { toast } = useToast();
  
  // Simulation state
  const { 
    circuit, isRunning, 
    addComponent, connectNodes, toggleSwitch,
    moveComponent, rotateComponent, deleteItem,
    startSimulation, stopSimulation, resetSimulation
  } = useSimulation();
  
  // UI state
  const [selectedComponent, setSelectedComponent] = useState<ComponentType | null>(null);
  const [showVoltages, setShowVoltages] = useState(true);
  const [showCurrents, setShowCurrents] = useState(true);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [selectedItemType, setSelectedItemType] = useState<CircuitItemType | null>(null);
  
  // Handle component selection from palette
  const handleComponentSelect = (type: ComponentType) => {
    setSelectedComponent(currentType => currentType === type ? null : type);
    
    if (type) {
      toast({
        title: "Component Selected",
        description: `${type.charAt(0).toUpperCase() + type.slice(1)} selected. Click on the canvas to place it.`
      });
    }
  };
  
  // Handle component placement with better user feedback
  const handleAddComponent = useCallback((type: ComponentType, x: number, y: number) => {
    const componentId = addComponent(type, { x, y });
    
    toast({
      title: "Component Added",
      description: `${type.charAt(0).toUpperCase() + type.slice(1)} placed on the canvas.`
    });
    
    setSelectedComponent(null); // Deselect after placement
    return componentId;
  }, [addComponent, toast]);
  
  // Handle item selection with clear visual and toast feedback
  const handleSelectItem = useCallback((type: CircuitItemType, id: string) => {
    setSelectedItemId(id);
    setSelectedItemType(type);
    
    if (type === 'component') {
      const componentType = id.split('_')[0];
      toast({
        title: `${componentType.charAt(0).toUpperCase() + componentType.slice(1)} Selected`,
        description: "Use R to rotate, Delete to remove, or drag to move."
      });
    }
  }, [toast]);
  
  // Handle component rotation with better UX
  const handleRotateComponent = useCallback((componentId: string) => {
    rotateComponent(componentId, 90); // Rotate 90 degrees clockwise
    toast({
      title: "Component Rotated",
      description: "Component rotated 90 degrees clockwise"
    });
  }, [rotateComponent, toast]);
  
  // Handle item deletion with confirmation toast
  const handleDeleteItem = useCallback((type: CircuitItemType, id: string) => {
    deleteItem(type, id);
    
    toast({
      title: "Item Deleted",
      description: `${type.charAt(0).toUpperCase() + type.slice(1)} removed from circuit`
    });
    
    // Clear selection if deleted item was selected
    if (selectedItemId === id && selectedItemType === type) {
      setSelectedItemId(null);
      setSelectedItemType(null);
    }
  }, [deleteItem, selectedItemId, selectedItemType, toast]);
  
  // Handle component movement
  const handleMoveComponent = useCallback((id: string, dx: number, dy: number) => {
    moveComponent(id, dx, dy);
  }, [moveComponent]);
  
  // Handle node connection with improved debugging and user feedback
  const handleConnectNodes = useCallback((sourceId: string, targetId: string) => {
    console.log(`Connecting nodes ${sourceId} and ${targetId}`);
    
    // Ensure both nodes exist and are different
    if (sourceId && targetId && sourceId !== targetId) {
      console.log("Creating connection between nodes");
      connectNodes(sourceId, targetId);
      
      toast({
        title: "Connection Created",
        description: "Wire connection created between components"
      });
    } else {
      console.log("Invalid connection attempt:", { sourceId, targetId });
      
      toast({
        title: "Connection Failed",
        description: "Cannot connect to the same node or component",
        variant: "destructive"
      });
    }
  }, [connectNodes, toast]);
  
  // Wire manipulation handler for wire path updates
  const handleUpdateWirePath = useCallback((wireId: string, newPath: { x: number, y: number }[]) => {
    console.log(`Updating wire ${wireId} path:`, newPath);
    
    // Update the circuit state with the new wire path
    if (!circuit) return;
    
    // Update the circuit with the new wire path
    circuit.wires = circuit.wires.map(wire => {
      if (wire.id === wireId) {
        return { ...wire, path: newPath };
      }
      return wire;
    });
  }, [circuit]);
  
  // Toggle switch during simulation with proper feedback
  const handleToggleSwitch = useCallback((componentId: string) => {
    toggleSwitch(componentId);
    
    toast({
      title: "Switch Toggled",
      description: `Switch state changed`,
      duration: 1500
    });
  }, [toggleSwitch, toast]);
  
  // Handle display options
  const handleToggleVoltages = useCallback(() => {
    setShowVoltages(prev => !prev);
  }, []);
  
  const handleToggleCurrents = useCallback(() => {
    setShowCurrents(prev => !prev);
  }, []);
  
  // Set up keyboard shortcuts
  useCircuitKeyboard({
    onRotate: handleRotateComponent,
    onDelete: handleDeleteItem,
    selectedItemId,
    selectedItemType
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
    <div className="w-full h-full flex flex-col">
      <ComponentPalette 
        selectedComponent={selectedComponent} 
        onSelectComponent={handleComponentSelect}
      />
      
      <div className="flex-1 bg-white border border-gray-200 relative overflow-hidden">
        <CircuitCanvas
          circuit={circuit}
          selectedComponent={selectedComponent}
          onAddComponent={handleAddComponent}
          onConnectNodes={handleConnectNodes}
          onToggleSwitch={handleToggleSwitch}
          onUpdateWirePath={handleUpdateWirePath}
          showVoltages={showVoltages}
          showCurrents={showCurrents}
          isRunning={isRunning}
        />
      </div>
      
      <SimulationControls
        isRunning={isRunning}
        onStart={startSimulation}
        onStop={stopSimulation}
        onReset={resetSimulation}
        showVoltages={showVoltages}
        onToggleVoltages={handleToggleVoltages}
        showCurrents={showCurrents}
        onToggleCurrents={handleToggleCurrents}
      />
    </div>
  );
}
