
import React from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { useSimulation } from '@/lib/simulator/context/useSimulation';
import { formatResistance } from '@/lib/simulator/utils/formatUtils';

const PropertyPanel: React.FC = () => {
  const { 
    selectedComponent, 
    updateComponentProperty
  } = useSimulation();

  if (!selectedComponent) {
    return (
      <div className="p-3 bg-white shadow-inner rounded-md text-center text-sm text-gray-500">
        Select a component to view properties
      </div>
    );
  }

  const renderPropertyEditors = () => {
    switch (selectedComponent.type) {
      case 'battery':
        return (
          <>
            <div className="mb-3">
              <label className="block text-xs text-gray-500 mb-1">Voltage (V)</label>
              <div className="flex items-center gap-2">
                <Slider 
                  value={[selectedComponent.properties.voltage || 5]} 
                  onValueChange={(value) => updateComponentProperty(selectedComponent.id, 'voltage', value[0])}
                  min={1}
                  max={12}
                  step={0.5}
                  className="flex-1"
                />
                <span className="text-xs font-mono w-8 text-right">{selectedComponent.properties.voltage || 5}V</span>
              </div>
            </div>
          </>
        );
      
      case 'resistor':
        return (
          <>
            <div className="mb-3">
              <label className="block text-xs text-gray-500 mb-1">Resistance (Ω)</label>
              <div className="flex items-center gap-2">
                <Slider 
                  value={[Math.log10(selectedComponent.properties.resistance || 1000)]} 
                  onValueChange={(value) => updateComponentProperty(
                    selectedComponent.id, 
                    'resistance', 
                    Math.pow(10, value[0])
                  )}
                  min={1}
                  max={6}
                  step={0.1}
                  className="flex-1"
                />
                <span className="text-xs font-mono w-16 text-right">
                  {formatResistance(selectedComponent.properties.resistance || 1000)}
                </span>
              </div>
            </div>
          </>
        );
      
      case 'led':
        return (
          <>
            <div className="mb-3">
              <label className="block text-xs text-gray-500 mb-1">Color</label>
              <div className="flex gap-1 justify-between">
                {['red', 'green', 'blue', 'yellow', 'white'].map(color => (
                  <div 
                    key={color} 
                    className={`w-6 h-6 rounded-full cursor-pointer border-2 ${
                      (selectedComponent.properties.color || 'red') === color
                        ? 'border-black dark:border-white'
                        : 'border-transparent'
                    }`}
                    style={{ backgroundColor: color }}
                    onClick={() => updateComponentProperty(selectedComponent.id, 'color', color)}
                  />
                ))}
              </div>
            </div>
          </>
        );
      
      case 'switch':
        return (
          <>
            <div className="mb-3">
              <label className="block text-xs text-gray-500 mb-1">State</label>
              <Button 
                variant={selectedComponent.properties.closed ? "default" : "outline"}
                size="sm" 
                className="w-full"
                onClick={() => updateComponentProperty(
                  selectedComponent.id, 
                  'closed', 
                  !selectedComponent.properties.closed
                )}
              >
                {selectedComponent.properties.closed ? "Closed (ON)" : "Open (OFF)"}
              </Button>
            </div>
          </>
        );
      
      default:
        return <div className="text-sm">No editable properties</div>;
    }
  };

  return (
    <div className="p-3 bg-white shadow-inner rounded-md">
      <h3 className="font-medium text-sm mb-2">{selectedComponent.type.toUpperCase()} Properties</h3>
      {renderPropertyEditors()}
    </div>
  );
};

export default PropertyPanel;
