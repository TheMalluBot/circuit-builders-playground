
import { useEffect, RefObject } from 'react';
import { Circuit } from '@/types/circuit';
import { renderCircuit } from '@/lib/renderer';

/**
 * Hook to handle canvas drawing with enhanced wire preview
 */
export function useCanvasDrawing(
  canvasRef: RefObject<HTMLCanvasElement>,
  circuit: Circuit,
  options: {
    showVoltages: boolean;
    showCurrents: boolean;
    hoveredNodeId: string | null;
    connectionPreview?: {
      getPreviewPath: (circuit: Circuit) => any;
      connectionStart: any;
      isConnecting: boolean;
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
        theme: 'light',
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
    getPreviewPath: (circuit: Circuit) => any;
    connectionStart: any;
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
  
  // Draw highlight on valid target pin
  if (isValidTarget) {
    const endPos = path[path.length - 1];
    ctx.fillStyle = '#4299e1';
    ctx.beginPath();
    ctx.arc(endPos.x, endPos.y, 8, 0, Math.PI * 2);
    ctx.fill();
  }
}
