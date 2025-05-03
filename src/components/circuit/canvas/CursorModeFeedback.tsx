
import React from 'react';
import { ComponentType } from '@/types/circuit';
import { Battery, Lightbulb, Zap, ToggleRight } from 'lucide-react';

interface CursorModeFeedbackProps {
  mode: 'default' | 'add' | 'connect' | 'drag' | 'select';
  selectedComponent?: ComponentType | null;
  position: { x: number; y: number };
  visible: boolean;
}

export function CursorModeFeedback({
  mode,
  selectedComponent,
  position,
  visible
}: CursorModeFeedbackProps) {
  // Don't render if not visible
  if (!visible) return null;
  
  // Get icon based on selected component
  const getComponentIcon = () => {
    switch (selectedComponent) {
      case 'battery':
        return <Battery className="w-4 h-4" />;
      case 'led':
        return <Lightbulb className="w-4 h-4" />;
      case 'resistor':
        return <Zap className="w-4 h-4" />;
      case 'switch':
        return <ToggleRight className="w-4 h-4" />;
      default:
        return null;
    }
  };
  
  // Get background color based on mode
  const getBgColor = () => {
    switch (mode) {
      case 'add':
        return 'bg-green-500';
      case 'connect':
        return 'bg-blue-500';
      case 'drag':
        return 'bg-amber-500';
      case 'select':
        return 'bg-purple-500';
      default:
        return 'bg-gray-400';
    }
  };
  
  // Get text label based on mode
  const getLabel = () => {
    switch (mode) {
      case 'add':
        return selectedComponent ? `Add ${selectedComponent}` : 'Add';
      case 'connect':
        return 'Connect';
      case 'drag':
        return 'Move';
      case 'select':
        return 'Select';
      default:
        return '';
    }
  };
  
  const bgColor = getBgColor();
  const label = getLabel();
  const icon = mode === 'add' ? getComponentIcon() : null;
  
  // Position slightly offset from cursor
  const style = {
    left: position.x + 20,
    top: position.y + 20
  };
  
  // Only show the indicator in certain modes
  if (mode === 'default' && !selectedComponent) return null;
  
  return (
    <div 
      className={`absolute z-50 rounded-md px-2 py-1 ${bgColor} text-white text-xs flex items-center gap-1 pointer-events-none`}
      style={style}
    >
      {icon}
      {label}
    </div>
  );
}
