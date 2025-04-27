
import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Trash2, 
  Settings, 
  ZoomIn, 
  ZoomOut, 
  Maximize
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SimulationProvider, useSimulation } from '@/lib/simulator/SimulationContext';

interface SimulationActivity {
  title: string;
  description: string;
  components: string[];
  states: {
    [key: string]: {
      components: string[];
      connections?: string[][];
    };
  };
  instructions: string[];
  objectives: string[];
}

interface CircuitSimulatorProps {
  simulatorState: string;
  simulationActivity: SimulationActivity;
  onHighlightComponent?: (id: string) => void;
  currentState?: string;
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
        <RotateCcw className="w-4 h-4 mr-1" />
        Reset
      </Button>
      
      <Button 
        variant="outline" 
        size="sm" 
        className="bg-white shadow"
      >
        <Trash2 className="w-4 h-4 mr-1" />
        Clear
      </Button>
      
      <Button 
        variant="outline" 
        size="sm" 
        className="bg-white shadow"
      >
        <Settings className="w-4 h-4 mr-1" />
        Settings
      </Button>
    </div>
  );
};

const CircuitToolbar: React.FC = () => {
  return (
    <div className="absolute top-4 right-4 flex flex-col space-y-2">
      <Button variant="outline" size="sm" className="bg-white shadow w-9 h-9 p-0">
        <ZoomIn className="w-4 h-4" />
      </Button>
      <Button variant="outline" size="sm" className="bg-white shadow w-9 h-9 p-0">
        <ZoomOut className="w-4 h-4" />
      </Button>
      <Button variant="outline" size="sm" className="bg-white shadow w-9 h-9 p-0">
        <Maximize className="w-4 h-4" />
      </Button>
    </div>
  );
};

const CircuitSimulatorContent: React.FC<CircuitSimulatorProps> = ({
  simulatorState,
  simulationActivity,
  onHighlightComponent
}) => {
  const { addComponent } = useSimulation();
  
  // Add example components when the component mounts
  useEffect(() => {
    // Add a battery
    addComponent('battery', { x: 0, y: -100 }, { voltage: 9 });
    
    // Add a resistor
    addComponent('resistor', { x: 0, y: 0 }, { resistance: 1000 });
    
    // Add an LED
    addComponent('led', { x: 0, y: 100 }, { color: 'red' });
  }, []);
  
  return (
    <div className="relative w-full h-full bg-neutral-50">
      <CircuitToolbar />
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
