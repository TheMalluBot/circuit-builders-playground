
import React, { useRef, useEffect } from 'react';
import { Circuit, ComponentType } from '@/types/circuit';
import { useCanvasInteractions } from './hooks/useCanvasInteractions';
import { useCanvasDrawing } from './hooks/useCanvasDrawing';
import { resizeCanvas } from './utils/CanvasUtils';

interface CircuitCanvasProps {
  circuit: Circuit;
  selectedComponent: ComponentType | null;
  onAddComponent: (type: ComponentType, x: number, y: number) => void;
  onConnectNodes: (sourceId: string, targetId: string) => void;
  onToggleSwitch: (componentId: string) => void;
  showVoltages: boolean;
  showCurrents: boolean;
  isRunning: boolean;
}

export function CircuitCanvas({
  circuit,
  selectedComponent,
  onAddComponent,
  onConnectNodes,
  onToggleSwitch,
  showVoltages,
  showCurrents,
  isRunning
}: CircuitCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Set up canvas interactions
  const {
    hoveredItem,
    hoveredNodeId,
    connectionPreview,
    handleCanvasClick,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    isDragging
  } = useCanvasInteractions(canvasRef, circuit, {
    selectedComponent,
    onAddComponent,
    onConnectNodes,
    onToggleSwitch
  });
  
  // Handle canvas resizing
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Set canvas size
    const handleResize = () => canvas && resizeCanvas(canvas);
    handleResize();
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Set up canvas drawing with properly wrapped connectionPreview
  useCanvasDrawing(canvasRef, circuit, {
    showVoltages,
    showCurrents,
    hoveredNodeId,
    connectionPreview: {
      getPreviewPath: (c: Circuit) => connectionPreview.getPreviewPath(c),
      connectionStart: connectionPreview.connectionStart,
      isConnecting: connectionPreview.isConnecting
    }
  });
  
  // Determine cursor based on current state
  const getCursor = () => {
    if (selectedComponent) return 'crosshair';
    if (connectionPreview.isConnecting) return 'pointer';
    if (hoveredItem?.type === 'pin') return 'pointer';
    if (isDragging) return 'grabbing';
    return 'default';
  };
  
  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full"
      onClick={handleCanvasClick}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      style={{ cursor: getCursor() }}
    />
  );
}
