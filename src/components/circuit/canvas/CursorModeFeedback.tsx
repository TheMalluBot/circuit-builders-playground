
import React from 'react';
import { ComponentType } from '@/types/circuit';
import { Battery, Lightbulb, Zap, ArrowUpDown, HandMetal, ToggleRight } from 'lucide-react';

export interface CursorModeFeedbackProps {
  mode: "default" | "add" | "select" | "drag" | "connect";
  selectedComponent: ComponentType | null;
  position: { x: number; y: number };
  visible: boolean;
}

/**
 * Component that provides visual feedback about the current cursor mode
 * Positioned directly next to the cursor for better usability
 */
export function CursorModeFeedback({ 
  mode, 
  selectedComponent, 
  position, 
  visible 
}: CursorModeFeedbackProps) {
  if (!visible) return null;
  
  // Determine label and icon based on mode
  let label = '';
  let IconComponent = null;
  let bgColor = 'bg-blue-500';
  
  switch (mode) {
    case 'add':
      label = `Add ${selectedComponent || ''}`;
      bgColor = 'bg-green-500';
      
      // Select icon based on component type
      if (selectedComponent === 'battery') {
        IconComponent = Battery;
      } else if (selectedComponent === 'resistor') {
        IconComponent = Zap;
      } else if (selectedComponent === 'led') {
        IconComponent = Lightbulb;
      } else if (selectedComponent === 'switch') {
        IconComponent = ToggleRight;
      }
      break;
      
    case 'select':
      label = 'Selected';
      IconComponent = ArrowUpDown;
      bgColor = 'bg-blue-500';
      break;
      
    case 'drag':
      label = 'Dragging';
      IconComponent = HandMetal;
      bgColor = 'bg-amber-500';
      break;
      
    case 'connect':
      label = 'Connect';
      IconComponent = Zap;
      bgColor = 'bg-indigo-500';
      break;
      
    default:
      return null;
  }
  
  return (
    <div 
      className={`absolute pointer-events-none flex items-center rounded-md px-2 py-1 text-white text-sm ${bgColor} shadow-md z-50 opacity-90`}
      style={{
        left: position.x + 4,  // Position extremely close to cursor (reduced from 16)
        top: position.y,        // Aligned with the cursor height
        transform: 'translateY(-50%)', // Center vertically relative to cursor
      }}
    >
      {IconComponent && <IconComponent size={14} className="mr-1" />}
      <span>{label}</span>
    </div>
  );
}
