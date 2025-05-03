
import { useEffect, RefObject } from 'react';
import { Circuit } from '@/types/circuit';
import { renderCircuit } from '@/lib/renderer';

/**
 * Hook to handle canvas drawing with enhanced wire preview and manipulation
 */
export function useCanvasDrawing(
  canvasRef: RefObject<HTMLCanvasElement>,
  circuit: Circuit,
  options: {
    showVoltages: boolean;
    showCurrents: boolean;
    hoveredNodeId?: string;
    selectedWireId?: string;
    selectedComponentId?: string;
    animateCurrentFlow?: boolean; 
    theme?: 'light' | 'dark';
    connectionPreview?: {
      getPreviewPath: (circuit: Circuit) => { path: { x: number; y: number }[]; isValidTarget: boolean; endPos: { x: number; y: number } };
      connectionStart: { nodeId: string | null; pinId: string; componentId: string; position: { x: number; y: number } } | null;
      isConnecting: boolean;
      magneticSnap: { point: { x: number; y: number }; nodeId: string | null };
    };
  }
) {
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const render = () => {
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Render circuit with options
      renderCircuit(ctx, circuit, {
        showVoltages: options.showVoltages,
        showCurrents: options.showCurrents,
        highlightedNodeId: options.hoveredNodeId,
        selectedWireId: options.selectedWireId,
        selectedComponentId: options.selectedComponentId,
        animateCurrentFlow: options.animateCurrentFlow, 
        theme: options.theme || 'light',
        connectionPreview: options.connectionPreview
      });
      
      // Request next frame
      requestAnimationFrame(render);
    };
    
    const animationId = requestAnimationFrame(render);
    
    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [canvasRef, circuit, options]);
}
