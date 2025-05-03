
import React from 'react';
import { ComponentType, CircuitItemType } from '@/types/circuit';

interface CursorModeFeedbackProps {
  mode: 'default' | 'add' | 'connect' | 'drag' | 'select'; // Changed from cursorMode to mode to match usage
  selectedComponent: ComponentType | null;
  position: { x: number; y: number } | null;
  visible?: boolean; // Added visible prop to control visibility
}

/**
 * Displays visual feedback about the current cursor mode
 */
export function CursorModeFeedback({ 
  mode, 
  selectedComponent, 
  position,
  visible = true
}: CursorModeFeedbackProps) {
  if (!position || !visible) return null;
  
  // Don't show feedback in default mode
  if (mode === 'default') return null;
  
  const { x, y } = position;
  
  return (
    <div 
      className="absolute pointer-events-none z-50 flex items-center justify-center"
      style={{
        left: x,
        top: y,
        transform: 'translate(-50%, -50%)'
      }}
    >
      {mode === 'connect' && (
        <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
          <div className="w-4 h-4 bg-white rounded-full"></div>
        </div>
      )}
      
      {mode === 'drag' && (
        <div className="w-8 h-8 border-2 border-blue-500 rounded-full flex items-center justify-center">
          <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
        </div>
      )}
      
      {(mode === 'add' || mode === 'select') && selectedComponent && (
        <div className="bg-blue-100 border-2 border-dashed border-blue-500 rounded-md p-2 flex items-center justify-center">
          <div className="text-blue-500 text-sm font-medium">
            {selectedComponent.charAt(0).toUpperCase() + selectedComponent.slice(1)}
          </div>
        </div>
      )}
    </div>
  );
}

export default CursorModeFeedback;
