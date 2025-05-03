
import React from 'react';
import { ComponentType } from '@/types/circuit';

interface CursorModeFeedbackProps {
  mode: 'default' | 'add' | 'connect' | 'drag' | 'select';
  selectedComponent: ComponentType | null;
  position: { x: number; y: number };
  visible: boolean;
}

export function CursorModeFeedback({ mode, selectedComponent, position, visible }: CursorModeFeedbackProps) {
  if (!visible) return null;
  
  const getBgColor = () => {
    switch (mode) {
      case 'add': return 'bg-green-500';
      case 'connect': return 'bg-blue-500';
      case 'drag': return 'bg-amber-500';
      case 'select': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };
  
  const getText = () => {
    switch (mode) {
      case 'add': return selectedComponent ? `Add ${selectedComponent}` : 'Add';
      case 'connect': return 'Connect';
      case 'drag': return 'Move';
      case 'select': return 'Selected';
      default: return '';
    }
  };
  
  return (
    <div 
      className={`absolute z-50 px-2 py-1 rounded-md text-white text-xs font-medium ${getBgColor()} shadow-md`}
      style={{
        left: position.x + 20,
        top: position.y - 10,
        pointerEvents: 'none',
        opacity: 0.9
      }}
    >
      {getText()}
    </div>
  );
}
