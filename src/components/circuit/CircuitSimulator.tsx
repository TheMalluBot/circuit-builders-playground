
import React, { useState } from 'react';
import { ComponentPalette } from './ComponentPalette';
import { CircuitCanvas } from './CircuitCanvas';
import { SimulationControls } from './SimulationControls';
import { useSimulation } from '@/hooks/useSimulation';
import { ComponentType } from '@/types/circuit';

export function CircuitSimulator() {
  // Simulation state
  const { 
    circuit, isRunning, 
    addComponent, connectNodes, toggleSwitch,
    startSimulation, stopSimulation, resetSimulation
  } = useSimulation();
  
  // UI state
  const [selectedComponent, setSelectedComponent] = useState<ComponentType | null>(null);
  const [showVoltages, setShowVoltages] = useState(true);
  const [showCurrents, setShowCurrents] = useState(true);
  
  // Handle component selection from palette
  const handleComponentSelect = (type: ComponentType) => {
    setSelectedComponent(prevType => prevType === type ? null : type);
  };
  
  // Handle display options
  const handleToggleVoltages = () => setShowVoltages(prev => !prev);
  const handleToggleCurrents = () => setShowCurrents(prev => !prev);
  
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
          onAddComponent={addComponent}
          onConnectNodes={connectNodes}
          onToggleSwitch={toggleSwitch}
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
