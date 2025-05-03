
import React from 'react';

interface VoltageOverlayProps {
  show: boolean;
}

export function VoltageOverlay({ show }: VoltageOverlayProps) {
  if (!show) return null;
  
  return (
    <div className="absolute top-2 right-2 bg-white/80 rounded shadow p-2 text-xs font-mono">
      <div className="flex items-center gap-1">
        <div className="w-3 h-3 rounded-full bg-blue-500"></div>
        <span>5V</span>
      </div>
      <div className="flex items-center gap-1">
        <div className="w-3 h-3 rounded-full bg-green-500"></div>
        <span>3.3V</span>
      </div>
      <div className="flex items-center gap-1">
        <div className="w-3 h-3 rounded-full bg-orange-500"></div>
        <span>1.7V</span>
      </div>
      <div className="flex items-center gap-1">
        <div className="w-3 h-3 rounded-full bg-gray-400"></div>
        <span>0V</span>
      </div>
    </div>
  );
}
