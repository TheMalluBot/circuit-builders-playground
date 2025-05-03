
import React from 'react';
import { ComponentType, CircuitItemType } from '@/types/circuit';

interface CursorModeFeedbackProps {
  cursorMode: 'default' | 'connect' | 'drag' | 'addComponent';
  selectedComponent: ComponentType | null;
  position: { x: number; y: number } | null;
}

/**
 * Displays visual feedback about the current cursor mode
 */
export function CursorModeFeedback({ 
  cursorMode, 
  selectedComponent, 
  position 
}: CursorModeFeedbackProps) {
  if (!position) return null;
  
  // Don't show feedback in default mode
  if (cursorMode === 'default') return null;
  
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
      {cursorMode === 'connect' && (
        <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
          <div className="w-4 h-4 bg-white rounded-full"></div>
        </div>
      )}
      
      {cursorMode === 'drag' && (
        <div className="w-8 h-8 border-2 border-blue-500 rounded-full flex items-center justify-center">
          <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
        </div>
      )}
      
      {cursorMode === 'addComponent' && selectedComponent && (
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
