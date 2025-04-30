import React from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { useSimulation } from '@/lib/simulator/context/useSimulation';
import { CircuitEngine } from '@/lib/simulator/engine';

interface CircuitControlsProps {
  className?: string;
}

const CircuitControls: React.FC<CircuitControlsProps> = ({ className }) => {
  const { 
    isRunning, 
    toggleSimulation, 
    resetSimulation, 
    simulationSpeed, 
    setSimulationSpeed,
    selectedComponent,
    deleteSelectedComponent,
    rotateSelectedComponent
  } = useSimulation();

  const handleSpeedChange = (value: number[]) => {
    setSimulationSpeed(value[0]);
  };

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <div className="flex items-center space-x-2">
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

      <div>
        <p className="text-xs text-muted-foreground">Simulation Speed</p>
        <Slider
          defaultValue={[simulationSpeed]}
          max={10}
          min={0.1}
          step={0.1}
          onValueChange={handleSpeedChange}
          aria-label="Simulation speed"
        />
      </div>
      
      <div className="flex items-center space-x-2">
        <Button 
          variant="outline" 
          size="sm" 
          className="bg-white shadow"
          onClick={deleteSelectedComponent}
          disabled={!selectedComponent}
        >
          Delete
        </Button>
        
        <Button 
          variant="outline" 
          size="sm" 
          className="bg-white shadow"
          onClick={rotateSelectedComponent}
          disabled={!selectedComponent}
        >
          Rotate
        </Button>
      </div>
    </div>
  );
};

export default CircuitControls;
