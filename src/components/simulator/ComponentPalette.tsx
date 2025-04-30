
import React, { useState } from 'react';
import { useSimulation } from '@/lib/simulator/context/useSimulation';
import { ComponentFactory } from '@/lib/simulator/ComponentFactory';
import { CircuitComponentProps } from '@/types/simulator';
import { Battery, Lightbulb, Zap, ToggleRight } from 'lucide-react';

const ComponentPalette: React.FC = () => {
  const { addComponent } = useSimulation();
  const [draggingComponent, setDraggingComponent] = useState<string | null>(null);

  const handleDragStart = (type: string, e: React.DragEvent) => {
    setDraggingComponent(type);
    // Standardize the component type using the factory
    const canonicalType = ComponentFactory.getCanonicalTypeName(type);
    e.dataTransfer.setData('component/type', canonicalType);
    e.dataTransfer.effectAllowed = 'copy';
  };

  const handleMouseDown = (type: string, e: React.MouseEvent) => {
    e.preventDefault();
    
    // Standardize the component type using the factory
    const canonicalType = ComponentFactory.getCanonicalTypeName(type);
    
    const dragStartEvent = new CustomEvent('component-drag-start', {
      detail: {
        type: canonicalType,
        clientX: e.clientX,
        clientY: e.clientY
      },
      bubbles: true
    });
    
    e.currentTarget.dispatchEvent(dragStartEvent);
  };
  
  const handleDragEnd = () => {
    setDraggingComponent(null);
  };

  const components = [
    { name: 'Battery', icon: <Battery className="w-6 h-6" />, description: 'DC power source' },
    { name: 'Resistor', icon: <Zap className="w-6 h-6" />, description: 'Limits current flow' },
    { name: 'LED', icon: <Lightbulb className="w-6 h-6" />, description: 'Light emitting diode' },
    { name: 'Switch', icon: <ToggleRight className="w-6 h-6" />, description: 'Controls circuit flow' }
  ];

  return (
    <div className="grid grid-cols-2 gap-2 p-3 bg-white shadow-inner rounded-md">
      {components.map((comp) => (
        <div 
          key={comp.name}
          draggable
          onDragStart={(e) => handleDragStart(comp.name.toLowerCase(), e)}
          onDragEnd={handleDragEnd}
          onMouseDown={(e) => handleMouseDown(comp.name.toLowerCase(), e)}
          className={`flex flex-col items-center p-2 rounded-md bg-gray-50 hover:bg-gray-100 cursor-grab active:cursor-grabbing transition-colors ${
            draggingComponent === comp.name.toLowerCase() ? 'ring-2 ring-blue-500' : ''
          }`}
        >
          {comp.icon}
          <span className="text-xs font-medium mt-1">{comp.name}</span>
        </div>
      ))}
    </div>
  );
};

export default ComponentPalette;
