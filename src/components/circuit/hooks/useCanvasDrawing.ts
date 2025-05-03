
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
    animateCurrentFlow?: boolean; // Add this property
    theme?: 'light' | 'dark';
    connectionPreview?: {
      getPreviewPath: (circuit: Circuit) => { path: { x: number; y: number }[]; isValidTarget: boolean; endPos: { x: number; y: number } };
      connectionStart?: { nodeId: string; componentId: string; position: { x: number; y: number } };
      isConnecting: boolean;
      magneticSnap?: { point: { x: number; y: number }; nodeId: string | null } | null;
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
        animateCurrentFlow: options.animateCurrentFlow, // Pass this property
        theme: options.theme || 'light',
        connectionPreview: options.connectionPreview
      });
      
      // Draw connection preview if active
      if (options.connectionPreview?.isConnecting) {
        drawConnectionPreview(ctx, options.connectionPreview, circuit);
      }
      
      // Request next frame
      requestAnimationFrame(render);
    };
    
    const animationId = requestAnimationFrame(render);
    
    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [canvasRef, circuit, options]);
}

/**
 * Draw enhanced connection preview on the canvas with smart routing
 */
function drawConnectionPreview(
  ctx: CanvasRenderingContext2D,
  connectionPreview: {
    getPreviewPath: (circuit: Circuit) => { path: { x: number; y: number }[]; isValidTarget: boolean; endPos: { x: number; y: number } };
    connectionStart?: { nodeId: string; componentId: string; position: { x: number; y: number } };
    isConnecting: boolean;
    magneticSnap?: { point: { x: number; y: number }; nodeId: string | null } | null;
  },
  circuit: Circuit
) {
  if (!connectionPreview.connectionStart) return;
  
  const previewData = connectionPreview.getPreviewPath(circuit);
  if (!previewData) return;
  
  const { path, isValidTarget } = previewData;
  
  // Draw the wire path with enhanced visual style
  ctx.strokeStyle = isValidTarget ? '#4299e1' : '#9CA3AF';
  ctx.lineWidth = 2;
  ctx.setLineDash([5, 3]);
  
  ctx.beginPath();
  ctx.moveTo(path[0].x, path[0].y);
  
  for (let i = 1; i < path.length; i++) {
    ctx.lineTo(path[i].x, path[i].y);
  }
  
  ctx.stroke();
  ctx.setLineDash([]);
  
  // Draw highlight on valid target pin or magnetic snap point
  const magneticSnapActive = connectionPreview.magneticSnap && 
                            connectionPreview.magneticSnap.point !== undefined;
  
  if (isValidTarget || magneticSnapActive) {
    const endPos = path[path.length - 1];
    
    // Draw outer glow
    const gradient = ctx.createRadialGradient(endPos.x, endPos.y, 2, endPos.x, endPos.y, 12);
    gradient.addColorStop(0, isValidTarget ? 'rgba(66, 153, 225, 0.8)' : 'rgba(156, 163, 175, 0.8)');
    gradient.addColorStop(1, 'rgba(66, 153, 225, 0)');
    ctx.fillStyle = gradient;
    
    ctx.beginPath();
    ctx.arc(endPos.x, endPos.y, 12, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw terminal point
    ctx.fillStyle = isValidTarget ? '#4299e1' : '#9CA3AF';
    ctx.beginPath();
    ctx.arc(endPos.x, endPos.y, 6, 0, Math.PI * 2);
    ctx.fill();
    
    // Add white inner circle for contrast
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(endPos.x, endPos.y, 3, 0, Math.PI * 2);
    ctx.fill();
  }
  
  // Draw starting point highlight
  const startPos = path[0];
  ctx.fillStyle = '#4299e1';
  ctx.beginPath();
  ctx.arc(startPos.x, startPos.y, 6, 0, Math.PI * 2);
  ctx.fill();
}
