
import React from 'react';
import { Battery, Zap, Lightbulb, ToggleRight } from 'lucide-react';
import { ComponentType } from '@/types/circuit';

interface ComponentPaletteProps {
  selectedComponent: ComponentType | null;
  onSelectComponent: (type: ComponentType) => void;
}

export function ComponentPalette({ selectedComponent, onSelectComponent }: ComponentPaletteProps) {
  const components = [
    { type: 'battery' as const, label: 'Battery', icon: <Battery className="h-5 w-5" /> },
    { type: 'resistor' as const, label: 'Resistor', icon: <Zap className="h-5 w-5" /> },
    { type: 'led' as const, label: 'LED', icon: <Lightbulb className="h-5 w-5" /> },
    { type: 'switch' as const, label: 'Switch', icon: <ToggleRight className="h-5 w-5" /> },
  ];

  return (
    <div className="flex flex-wrap gap-2 p-3 bg-gray-100 border-b border-gray-200">
      {components.map(component => (
        <button
          key={component.type}
          className={`px-3 py-2 rounded border flex items-center gap-2 ${
            selectedComponent === component.type
              ? 'bg-blue-500 text-white border-blue-600'
              : 'bg-white text-gray-800 border-gray-300 hover:bg-gray-50'
          }`}
          onClick={() => onSelectComponent(component.type)}
        >
          {component.icon}
          {component.label}
        </button>
      ))}
    </div>
  );
}
