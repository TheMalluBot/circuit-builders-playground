
import React from 'react';

interface GhostElementProps {
  position: { x: number; y: number } | null;
  dragInfo: {
    type: string;
    offsetX: number;
    offsetY: number;
  } | null;
}

/**
 * Component that shows ghost element during drag operations
 */
export const GhostElement: React.FC<GhostElementProps> = ({ position, dragInfo }) => {
  if (!position || !dragInfo) return null;
  
  return (
    <div 
      className="absolute pointer-events-none z-50 w-16 h-16 bg-blue-100 border-2 border-dashed border-blue-500 rounded-md flex items-center justify-center"
      style={{
        left: position.x - dragInfo.offsetX,
        top: position.y - dragInfo.offsetY
      }}
    >
      <div className="text-blue-500 text-sm font-medium">
        {dragInfo.type.charAt(0).toUpperCase() + dragInfo.type.slice(1)}
      </div>
    </div>
  );
};
