import React, { useRef, useEffect, useState } from 'react';
import { useSimulation } from '@/lib/simulator/context/useSimulation';
import { CircuitEngine } from '@/lib/simulator/engine';
import { useCircuitInteractions } from '@/lib/simulator/hooks/useCircuitInteractions';
import { getNodePositionFromId } from '@/lib/simulator/utils/geometryUtils';

const CircuitCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { simulationState } = useSimulation();
  
  const {
    setCanvas,
    draggingComponentId,
    wireStart,
    tempWireEnd,
    hoveredNodeId,
    ghostPosition,
    paletteDragInfo,
    placementFeedback,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleDrop,
    handleDragOver,
    setupPaletteDragListeners
  } = useCircuitInteractions();
  
  // Set canvas reference
  useEffect(() => {
    if (canvasRef.current) {
      setCanvas(canvasRef.current);
    }
  }, [setCanvas]);
  
  // Setup palette drag listeners
  useEffect(() => {
    const cleanup = setupPaletteDragListeners();
    return cleanup;
  }, [setupPaletteDragListeners]);

  return (
    <div className="relative w-full h-full">
      <canvas 
        ref={canvasRef} 
        className="w-full h-full bg-gray-50 circuit-canvas"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      />
      
      {/* Ghost element during drag */}
      {ghostPosition && paletteDragInfo && (
        <div 
          className="absolute pointer-events-none z-50 w-16 h-16 bg-blue-100 border-2 border-dashed border-blue-500 rounded-md flex items-center justify-center"
          style={{
            left: ghostPosition.x - paletteDragInfo.offsetX,
            top: ghostPosition.y - paletteDragInfo.offsetY
          }}
        >
          <div className="text-blue-500 text-sm font-medium">
            {paletteDragInfo.type.charAt(0).toUpperCase() + paletteDragInfo.type.slice(1)}
          </div>
        </div>
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
      
      {/* Node hover indicator */}
      {hoveredNodeId && !wireStart && simulationState && (
        <div 
          className="absolute w-3 h-3 bg-blue-500 rounded-full pointer-events-none"
          style={{ 
            left: getNodePositionFromId(hoveredNodeId, simulationState.components).x - 6, 
            top: getNodePositionFromId(hoveredNodeId, simulationState.components).y - 6,
            zIndex: 5
          }}
        />
      )}
    </div>
  );
};

export default CircuitCanvas;
