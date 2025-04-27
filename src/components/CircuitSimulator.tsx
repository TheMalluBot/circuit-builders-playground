
import React, { useState, useEffect, useRef } from 'react';
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
import { SimulationProvider, useSimulation } from '@/lib/simulator/SimulationContext';
import { type SimulationActivity, type RenderOptions } from '@/types/simulator';
import { type Component } from '@/lib/simulator/types';

interface CircuitSimulatorProps {
  simulatorState: string;
  simulationActivity: SimulationActivity;
  onHighlightComponent?: (id: string) => void;
  currentState?: string;
  renderOptions?: Partial<RenderOptions>;
}

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

const CircuitSimulatorContent: React.FC<CircuitSimulatorProps> = ({
  simulatorState,
  simulationActivity,
  onHighlightComponent,
  renderOptions
}) => {
  const { addComponent, removeComponent, engine, renderer, simulationState } = useSimulation();
  const [selectedComponent, setSelectedComponent] = useState<string | null>(null);
  const [draggedComponent, setDraggedComponent] = useState<Component | null>(null);
  const [scale, setScale] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  
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
      
      // TODO: Add connections if present in state.connections
    }
  }, [simulatorState, simulationActivity, simulationState]);

  // Update render options when they change
  useEffect(() => {
    if (renderer && renderOptions) {
      renderer.setOptions(renderOptions);
    }
  }, [renderer, renderOptions]);

  const handleComponentSelect = (type: string) => {
    setSelectedComponent(prev => prev === type ? null : type);
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!renderer || !selectedComponent) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const canvasX = e.clientX - rect.left;
    const canvasY = e.clientY - rect.top;
    
    const circuitCoords = renderer.canvasToCircuitCoords(canvasX, canvasY);
    
    addComponent(selectedComponent, circuitCoords);
    setSelectedComponent(null);
  };

  return (
    <div className="relative w-full h-full bg-neutral-50">
      <div className="absolute top-4 left-4 flex flex-col space-y-2">
        <CircuitComponentButton
          icon={<Battery />}
          type="battery"
          selected={selectedComponent === 'battery'}
          onClick={() => handleComponentSelect('battery')}
        />
        <CircuitComponentButton
          icon={<Zap />}
          type="resistor"
          selected={selectedComponent === 'resistor'}
          onClick={() => handleComponentSelect('resistor')}
        />
        <CircuitComponentButton
          icon={<Lightbulb />}
          type="led"
          selected={selectedComponent === 'led'}
          onClick={() => handleComponentSelect('led')}
        />
        <CircuitComponentButton
          icon={<ToggleRight />}
          type="switch"
          selected={selectedComponent === 'switch'}
          onClick={() => handleComponentSelect('switch')}
        />
      </div>

      <div 
        className="w-full h-full"
        onClick={handleCanvasClick}
        style={{ cursor: selectedComponent ? 'crosshair' : 'default' }}
      />

      <CircuitControls />
    </div>
  );
};

const CircuitSimulator: React.FC<CircuitSimulatorProps> = (props) => {
  return (
    <SimulationProvider>
      <CircuitSimulatorContent {...props} />
    </SimulationProvider>
  );
};

export default CircuitSimulator;
