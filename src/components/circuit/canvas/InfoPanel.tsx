
import React from 'react';
import { Component } from '@/types/circuit';

interface InfoPanelProps {
  show: boolean;
  componentId: string | null;
  position: { x: number; y: number };
  circuit: { components: Component[] };
}

export function InfoPanel({ show, componentId, position, circuit }: InfoPanelProps) {
  // Get the component for the info panel
  const getSelectedComponent = () => {
    if (!show || !componentId) return null;
    return circuit.components.find(c => c.id === componentId);
  };

  // Format properties for display
  const formatPropValue = (key: string, value: any): string => {
    if (key === 'current') {
      const current = Math.abs(value);
      if (current < 0.001) return `${(current * 1000000).toFixed(2)} µA`;
      if (current < 1) return `${(current * 1000).toFixed(2)} mA`;
      return `${current.toFixed(2)} A`;
    }
    
    if (key === 'voltage') return `${value.toFixed(2)} V`;
    if (key === 'resistance') return `${value.toFixed(0)} Ω`;
    if (key === 'power') {
      const power = Math.abs(value);
      if (power < 0.001) return `${(power * 1000000).toFixed(2)} µW`;
      if (power < 1) return `${(power * 1000).toFixed(2)} mW`;
      return `${power.toFixed(2)} W`;
    }
    if (key === 'brightness') return `${(value * 100).toFixed(0)}%`;
    if (key === 'temperature') return `${value.toFixed(1)} °C`;
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    
    return String(value);
  };

  const selectedComponent = getSelectedComponent();
  if (!show || !selectedComponent) return null;

  return (
    <div 
      className="absolute bg-white shadow-lg rounded-md border border-gray-200 p-3 z-50"
      style={{
        left: Math.min(position.x, window.innerWidth - 240),
        top: Math.min(position.y, window.innerHeight - 300),
        width: '220px'
      }}
    >
      <div className="flex justify-between items-center border-b pb-2 mb-2">
        <h3 className="font-semibold text-sm capitalize">
          {selectedComponent.type} Properties
        </h3>
        <button 
          className="text-gray-500 hover:text-gray-700"
          onClick={() => {}}
        >
          ✕
        </button>
      </div>
      
      <div className="space-y-2 max-h-60 overflow-y-auto text-sm">
        {selectedComponent && Object.entries(selectedComponent.properties)
          .filter(([key]) => !key.includes('_') && typeof key === 'string' && key !== 'id')
          .map(([key, value]) => (
            <div key={key} className="grid grid-cols-3 gap-2">
              <span className="text-gray-600 capitalize">{key}:</span>
              <span className="col-span-2 font-medium">
                {formatPropValue(key, value)}
              </span>
            </div>
          ))}
        
        {selectedComponent.type === 'led' && (
          <div className="mt-2 pt-2 border-t border-gray-100">
            <div className="text-xs text-blue-600 font-medium mb-1">Real-time Values</div>
            <div className={`h-3 rounded-full transition-all duration-200 bg-gradient-to-r from-yellow-200 to-yellow-400`} 
              style={{ 
                width: `${(selectedComponent.properties.brightness || 0) * 100}%`, 
                opacity: (selectedComponent.properties.brightness || 0)
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
