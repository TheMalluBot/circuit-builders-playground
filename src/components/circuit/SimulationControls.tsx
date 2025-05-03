
import React from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Zap, 
  Waves,
  Thermometer
} from 'lucide-react';

interface SimulationControlsProps {
  isRunning: boolean;
  onStart: () => void;
  onStop: () => void;
  onReset: () => void;
  showVoltages: boolean;
  onToggleVoltages: () => void;
  showCurrents: boolean;
  onToggleCurrents: () => void;
  animateCurrentFlow?: boolean;
  onToggleAnimation?: () => void;
}

export function SimulationControls({
  isRunning,
  onStart,
  onStop,
  onReset,
  showVoltages,
  onToggleVoltages,
  showCurrents,
  onToggleCurrents,
  animateCurrentFlow = true,
  onToggleAnimation = () => {}
}: SimulationControlsProps) {
  return (
    <div className="p-2 border-t border-gray-200 bg-white flex justify-between items-center">
      <div className="flex items-center space-x-2">
        <Button 
          variant="outline" 
          size="sm" 
          className={isRunning ? "bg-amber-50" : ""}
          onClick={isRunning ? onStop : onStart}
        >
          {isRunning ? <Pause size={16} className="mr-1" /> : <Play size={16} className="mr-1" />}
          {isRunning ? 'Pause' : 'Run'}
        </Button>
        
        <Button 
          variant="outline" 
          size="sm"
          onClick={onReset}
          disabled={isRunning}
        >
          <RotateCcw size={16} />
        </Button>
      </div>
      
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <label htmlFor="toggle-voltage" className="text-sm flex items-center">
            <Zap size={16} className="mr-1 text-blue-500" />
            Voltage
          </label>
          <Switch
            id="toggle-voltage"
            checked={showVoltages}
            onCheckedChange={onToggleVoltages}
          />
        </div>
        
        <div className="flex items-center space-x-2">
          <label htmlFor="toggle-current" className="text-sm flex items-center">
            <Waves size={16} className="mr-1 text-orange-500" />
            Current
          </label>
          <Switch
            id="toggle-current"
            checked={showCurrents}
            onCheckedChange={onToggleCurrents}
          />
        </div>
        
        <div className="flex items-center space-x-2">
          <label htmlFor="toggle-animation" className="text-sm flex items-center">
            <Thermometer size={16} className="mr-1 text-green-500" />
            Animation
          </label>
          <Switch
            id="toggle-animation"
            checked={animateCurrentFlow}
            onCheckedChange={onToggleAnimation}
          />
        </div>
      </div>
    </div>
  );
}
