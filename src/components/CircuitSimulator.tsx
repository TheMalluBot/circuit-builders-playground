
import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw,
  Battery, 
  Resistor as ResistorIcon,
  Lightbulb,
  Switch as SwitchIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SimulationProvider, useSimulation } from '@/lib/simulator/SimulationContext';
import { type SimulationActivity, type RenderOptions } from '@/types/simulator';
import { ComponentFactory } from '@/lib/simulator/ComponentFactory';
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
  const { addComponent, engine, renderer } = useSimulation();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedComponent, setSelectedComponent] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [draggedComponent, setDraggedComponent] = useState<Component | null>(null);
  const [scale, setScale] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  
  // Initialize example components when the component mounts
  useEffect(() => {
    // Add initial components based on simulationActivity
    if (simulationActivity.states[simulatorState]) {
      const state = simulationActivity.states[simulatorState];
      
      state.components.forEach((type, index) => {
        addComponent(type, { 
          x: 100 + index * 100, 
          y: 200 
        });
      });
    }
  }, [simulatorState, simulationActivity]);

  const handleComponentSelect = (type: string) => {
    setSelectedComponent(prev => prev === type ? null : type);
  };

  // Handle canvas interactions
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || !renderer || !selectedComponent) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const canvasX = e.clientX - rect.left;
    const canvasY = e.clientY - rect.top;
    
    const circuitCoords = renderer.canvasToCircuitCoords(canvasX, canvasY);
    
    addComponent(selectedComponent, circuitCoords);
    setSelectedComponent(null);
  };

  return (
    <div className="relative w-full h-full bg-neutral-50">
      {/* Component Palette */}
      <div className="absolute top-4 left-4 flex flex-col space-y-2">
        <CircuitComponentButton
          icon={<Battery />}
          type="battery"
          selected={selectedComponent === 'battery'}
          onClick={() => handleComponentSelect('battery')}
        />
        <CircuitComponentButton
          icon={<ResistorIcon />}
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
          icon={<SwitchIcon />}
          type="switch"
          selected={selectedComponent === 'switch'}
          onClick={() => handleComponentSelect('switch')}
        />
      </div>

      {/* Canvas */}
      <canvas
        ref={canvasRef}
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
