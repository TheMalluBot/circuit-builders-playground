
import React from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw,
  Trash2,
  Zap,
  RotateCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { useSimulation } from '@/lib/simulator/context/useSimulation';

const CircuitControls: React.FC = () => {
  const { 
    isRunning, 
    toggleSimulation, 
    resetSimulation,
    deleteSelectedComponent,
    rotateSelectedComponent,
    simulationSpeed,
    setSimulationSpeed
  } = useSimulation();

  return (
    <div className="flex flex-col gap-3 p-3 bg-white shadow-inner rounded-md">
      <div className="flex gap-2">
        <Button 
          variant="outline" 
          size="sm"
          onClick={toggleSimulation}
          className="flex-1"
        >
          {isRunning ? 
            <><Pause className="w-4 h-4 mr-1" /> Pause</> : 
            <><Play className="w-4 h-4 mr-1" /> Run</>
          }
        </Button>
        
        <Button 
          variant="outline" 
          size="sm"
          onClick={resetSimulation}
        >
          <RotateCcw className="w-4 h-4" />
        </Button>
      </div>
      
      <div className="flex gap-2">
        <Button 
          variant="outline" 
          size="sm"
          onClick={rotateSelectedComponent}
        >
          <RotateCw className="w-4 h-4 mr-1" />
          Rotate
        </Button>
        
        <Button 
          variant="outline" 
          size="sm"
          onClick={deleteSelectedComponent}
          className="text-red-500"
        >
          <Trash2 className="w-4 h-4 mr-1" />
          Delete
        </Button>
      </div>
      
      <div className="mt-2">
        <label className="block text-xs text-gray-500 mb-1">Simulation Speed</label>
        <div className="flex items-center gap-2">
          <Zap className="w-3 h-3 text-gray-400" />
          <Slider 
            value={[simulationSpeed]} 
            onValueChange={(value) => setSimulationSpeed(value[0])}
            min={0.25}
            max={2}
            step={0.25}
            className="flex-1"
          />
          <Zap className="w-5 h-5 text-blue-500" />
        </div>
      </div>
    </div>
  );
};

export default CircuitControls;
