
import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { SimulationProvider } from '@/lib/simulator/context/SimulationProvider';
import ComponentPalette from '../simulator/ComponentPalette';
import CircuitControls from '../simulator/CircuitControls';
import PropertyPanel from '../simulator/PropertyPanel';
import CircuitCanvas from '../simulator/CircuitCanvas';

interface CircuitPlaygroundProps {
  className?: string;
}

const CircuitPlayground: React.FC<CircuitPlaygroundProps> = ({ className }) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Delete' || e.key === 'Backspace') {
        // Delete component functionality moved to CircuitControls
      } else if (e.key === 'r' || e.key === 'R') {
        // Rotate component functionality moved to CircuitControls
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className={`grid grid-cols-5 gap-4 ${className}`}>
      <div className="col-span-4 bg-white border border-gray-200 rounded-lg overflow-hidden h-[600px] relative">
        <SimulationProvider>
          <CircuitCanvas />
          <div className="absolute bottom-4 right-4 flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              className="bg-white/90 backdrop-blur-sm"
            >
              Toggle Grid
            </Button>
            <Button
              variant="secondary"
              size="sm"
              className="bg-white/90 backdrop-blur-sm"
            >
              Toggle Measurements
            </Button>
          </div>
        </SimulationProvider>
      </div>
      <div className="col-span-1 flex flex-col gap-4">
        <div>
          <h3 className="font-medium text-sm mb-2">Components</h3>
          <ComponentPalette />
        </div>
        
        <div>
          <h3 className="font-medium text-sm mb-2">Controls</h3>
          <SimulationProvider>
            <CircuitControls />
          </SimulationProvider>
        </div>
        
        <div>
          <h3 className="font-medium text-sm mb-2">Properties</h3>
          <SimulationProvider>
            <PropertyPanel />
          </SimulationProvider>
        </div>
      </div>
    </div>
  );
};

export default CircuitPlayground;
