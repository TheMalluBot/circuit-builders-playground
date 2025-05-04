
import React from 'react';
import { InfoPanel } from './InfoPanel';
import { VoltageOverlay } from './VoltageOverlay';
import { Circuit } from '@/types/circuit';

interface CanvasOverlayProps {
  infoPanel: {
    show: boolean;
    componentId: string | null;
    position: { x: number; y: number };
  };
  circuit: Circuit;
  showVoltages: boolean;
  isRunning: boolean;
  onCloseInfoPanel: () => void;
  wireStart?: { x: number; y: number } | null;
  tempWireEnd?: { x: number; y: number } | null;
  hoveredNodeId?: string | null;
  placementFeedback?: { x: number; y: number } | null;
}

/**
 * Component that renders overlays on top of the canvas
 */
export const CanvasOverlay: React.FC<CanvasOverlayProps> = ({
  infoPanel,
  circuit,
  showVoltages,
  isRunning,
  onCloseInfoPanel,
  wireStart,
  tempWireEnd,
  hoveredNodeId,
  placementFeedback
}) => {
  return (
    <>
      {/* Component properties info panel */}
      <InfoPanel 
        show={infoPanel.show}
        componentId={infoPanel.componentId}
        position={infoPanel.position}
        circuit={circuit}
        onClose={onCloseInfoPanel}
      />
      
      {/* Voltage overlay */}
      <VoltageOverlay show={showVoltages && isRunning} />
      
      {/* Wire drawing visualization */}
      {wireStart && tempWireEnd && (
        <svg
          className="absolute inset-0 pointer-events-none"
          style={{ zIndex: 10 }}
        >
          <line
            x1={wireStart.x}
            y1={wireStart.y}
            x2={tempWireEnd.x}
            y2={tempWireEnd.y}
            stroke={hoveredNodeId ? "#0088ff" : "#888"}
            strokeWidth="2"
            strokeDasharray={hoveredNodeId ? "" : "5,5"}
          />
        </svg>
      )}
      
      {/* Placement feedback animation */}
      {placementFeedback && (
        <div 
          className="absolute pointer-events-none z-40 w-20 h-20 rounded-full animate-ping"
          style={{
            left: placementFeedback.x - 40,
            top: placementFeedback.y - 40,
            backgroundColor: 'rgba(59, 130, 246, 0.2)',
            border: '2px solid rgba(59, 130, 246, 0.5)'
          }}
        />
      )}
    </>
  );
};
