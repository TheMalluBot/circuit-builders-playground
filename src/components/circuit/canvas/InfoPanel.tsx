
import React from 'react';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { Circuit } from '@/types/circuit';

export interface InfoPanelProps {
  show: boolean;
  componentId: string | null;
  position: { x: number; y: number };
  circuit: Circuit;
  onClose: () => void;
}

export function InfoPanel({ show, componentId, position, circuit, onClose }: InfoPanelProps) {
  if (!show || !componentId) return null;
  
  const component = circuit.components.find(c => c.id === componentId);
  if (!component) return null;
  
  // Get component properties based on component type
  const getComponentProperties = () => {
    const type = component.id.split('_')[0];
    
    switch (type) {
      case 'battery':
        return { voltage: '5V', type: 'DC' };
      case 'resistor':
        return { resistance: '1kΩ' };
      case 'led':
        return { color: 'Red', forwardVoltage: '1.8V' };
      case 'switch':
        // Safely access the closed property from component.properties instead of component.state
        return { state: component.properties.closed ? 'Closed' : 'Open' };
      default:
        return {};
    }
  };
  
  const properties = getComponentProperties();
  
  return (
    <div 
      className="absolute z-50 bg-white border border-gray-200 rounded-lg shadow-lg p-3 min-w-[200px]"
      style={{
        left: position.x + 10,
        top: position.y - 100
      }}
    >
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-medium">{component.id.split('_')[0].toUpperCase()}</h3>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-6 w-6" 
          onClick={onClose}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="space-y-2 text-sm">
        <div>
          <span className="text-gray-500">ID:</span> {component.id}
        </div>
        {Object.entries(properties).map(([key, value]) => (
          <div key={key}>
            <span className="text-gray-500">{key.charAt(0).toUpperCase() + key.slice(1)}:</span> {value}
          </div>
        ))}
      </div>
    </div>
  );
}
