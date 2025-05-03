
import React, { useState, useCallback } from 'react';
import { ComponentPalette } from './ComponentPalette';
import { CircuitCanvas } from './CircuitCanvas';
import { SimulationControls } from './SimulationControls';
import { useSimulation } from '@/hooks/useSimulation';
import { ComponentType, CircuitItemType } from '@/types/circuit';
import { useCircuitKeyboard } from '@/hooks/useCircuitKeyboard';

export function CircuitSimulator() {
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
    setSelectedComponent(prevType => prevType === type ? null : type);
  };
  
  // Handle component placement
  const handleAddComponent = useCallback((type: ComponentType, x: number, y: number) => {
    const componentId = addComponent(type, { x, y });
    setSelectedComponent(null); // Deselect after placement
    return componentId;
  }, [addComponent]);
  
  // Handle item selection
  const handleSelectItem = useCallback((type: CircuitItemType, id: string) => {
    setSelectedItemId(id);
    setSelectedItemType(type);
  }, []);
  
  // Handle component rotation
  const handleRotateComponent = useCallback((componentId: string) => {
    rotateComponent(componentId, 90); // Rotate 90 degrees clockwise
  }, [rotateComponent]);
  
  // Handle item deletion
  const handleDeleteItem = useCallback((type: CircuitItemType, id: string) => {
    deleteItem(type, id);
    
    // Clear selection if deleted item was selected
    if (selectedItemId === id && selectedItemType === type) {
      setSelectedItemId(null);
      setSelectedItemType(null);
    }
  }, [deleteItem, selectedItemId, selectedItemType]);
  
  // Handle component movement
  const handleMoveComponent = useCallback((id: string, dx: number, dy: number) => {
    moveComponent(id, dx, dy);
  }, [moveComponent]);
  
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
          onConnectNodes={connectNodes}
          onToggleSwitch={toggleSwitch}
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
