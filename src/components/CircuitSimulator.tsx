
import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw,
  Battery, 
  Lightbulb,
  Zap,
  ToggleRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SimulationProvider } from '@/lib/simulator/context/SimulationProvider';
import { useSimulation } from '@/lib/simulator/context/useSimulation';
import { type SimulationActivity, type RenderOptions, type CircuitComponentProps } from '@/types/simulator';

interface CircuitSimulatorProps {
  simulatorState: string;
  simulationActivity: SimulationActivity;
  onHighlightComponent?: (id: string) => void;
  currentState?: string;
  renderOptions?: Partial<RenderOptions>;
}

// Simple circuit controls component
const CircuitControls: React.FC = () => {
  const { isRunning, toggleSimulation, resetSimulation } = useSimulation();

  return (
    <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2">
      <Button 
        variant="outline" 
        size="sm" 
        className="bg-white shadow"
        onClick={toggleSimulation}
      >
        {isRunning ? <Pause className="w-4 h-4 mr-1" /> : <Play className="w-4 h-4 mr-1" />}
        {isRunning ? 'Pause' : 'Run'}
      </Button>
      
      <Button 
        variant="outline" 
        size="sm" 
        className="bg-white shadow"
        onClick={resetSimulation}
      >
        <RotateCcw className="w-4 h-4" />
      </Button>
    </div>
  );
};

// Component button that can be selected
const CircuitComponentButton: React.FC<{
  icon: React.ReactNode;
  type: string;
  selected: boolean;
  onClick: () => void;
}> = ({ icon, type, selected, onClick }) => (
  <Button
    variant={selected ? "default" : "outline"}
    size="sm"
    className="w-12 h-12 p-0"
    onClick={onClick}
  >
    {icon}
  </Button>
);

// Main content for the circuit simulator
const CircuitSimulatorContent: React.FC<CircuitSimulatorProps> = ({
  simulatorState,
  simulationActivity,
  onHighlightComponent,
  renderOptions
}) => {
  const { addComponent, engine, createWire, removeComponent, simulationState } = useSimulation();
  const [selectedComponentType, setSelectedComponentType] = useState<string | null>(null);
  
  // Load initial state from activity
  useEffect(() => {
    if (simulationActivity.states && simulationActivity.states[simulatorState]) {
      const state = simulationActivity.states[simulatorState];
      
      // Clear existing components first
      if (simulationState) {
        simulationState.components.forEach(comp => {
          removeComponent(comp.id);
        });
      }
      
      // Add components from the selected state
      state.components.forEach((type, index) => {
        addComponent(type, { 
          x: 100 + index * 120, 
          y: 200 
        });
      });
      
      // Add connections if present in state.connections
      if (state.connections && engine) {
        setTimeout(() => {
          if (simulationState && state.connections) {
            state.connections.forEach(connection => {
              // Find actual node IDs from component-pin references
              const [startRef, endRef] = connection;
              const [startCompId, startPinId] = startRef.split('-');
              const [endCompId, endPinId] = endRef.split('-');
              
              // Find components
              const startComp = simulationState.components.find(c => c.id.includes(startCompId));
              const endComp = simulationState.components.find(c => c.id.includes(endCompId));
              
              if (startComp && endComp) {
                // Find pins
                const startPin = startComp.pins.find(p => p.id === startPinId);
                const endPin = endComp.pins.find(p => p.id === endPinId);
                
                // Connect if both pins exist and have node IDs
                if (startPin && endPin && startPin.nodeId && endPin.nodeId) {
                  createWire(startPin.nodeId, endPin.nodeId);
                }
              }
            });
          }
        }, 500); // Delay to ensure components are fully added
      }
    }
  }, [simulatorState, simulationActivity, simulationState, engine, addComponent, createWire, removeComponent]);

  const handleComponentSelect = (type: string) => {
    setSelectedComponentType(prev => prev === type ? null : type);
  };

  return (
    <div className="relative w-full h-full bg-neutral-50">
      <div className="absolute top-4 left-4 flex flex-col space-y-2">
        <CircuitComponentButton
          icon={<Battery />}
          type="battery"
          selected={selectedComponentType === 'battery'}
          onClick={() => handleComponentSelect('battery')}
        />
        <CircuitComponentButton
          icon={<Zap />}
          type="resistor"
          selected={selectedComponentType === 'resistor'}
          onClick={() => handleComponentSelect('resistor')}
        />
        <CircuitComponentButton
          icon={<Lightbulb />}
          type="led"
          selected={selectedComponentType === 'led'}
          onClick={() => handleComponentSelect('led')}
        />
        <CircuitComponentButton
          icon={<ToggleRight />}
          type="switch"
          selected={selectedComponentType === 'switch'}
          onClick={() => handleComponentSelect('switch')}
        />
      </div>

      <canvas className="circuit-canvas w-full h-full" />

      <CircuitControls />
    </div>
  );
};

// Wrapper component that provides simulation context
const CircuitSimulator: React.FC<CircuitSimulatorProps> = (props) => {
  return (
    <SimulationProvider>
      <CircuitSimulatorContent {...props} />
    </SimulationProvider>
  );
};

export default CircuitSimulator;
