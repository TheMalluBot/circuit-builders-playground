
import { Circuit, RenderOptions } from '@/types/circuit';
import { renderGrid } from './gridRenderer';
import { renderWires } from './wireRenderer';
import { renderComponents } from './componentRenderer';
import { renderNodes } from './nodeRenderer';

export interface CircuitRenderOptions extends RenderOptions {
  selectedWireId?: string | null;
  selectedComponentId?: string | null;
  connectionPreview?: {
    getPreviewPath: (circuit: Circuit) => { path: { x: number; y: number; }[]; isValidTarget: boolean; endPos: { x: number; y: number; } };
    connectionStart: { nodeId: string | null; pinId: string; componentId: string; position: { x: number; y: number; } } | null;
    isConnecting: boolean;
    magneticSnap: {
      point: { x: number; y: number; };
      nodeId: string | null;
    };
  };
}

export function renderCircuit(
  ctx: CanvasRenderingContext2D, 
  circuit: Circuit, 
  options: CircuitRenderOptions
): void {
  // Clear canvas
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  
  // Draw grid
  renderGrid(ctx, options.theme);
  
  // Draw wires first (so they appear behind components)
  renderWires(ctx, circuit.wires, circuit.nodes, circuit, {
    ...options,
    animateCurrentFlow: options.animateCurrentFlow ?? true
  }, options.selectedWireId || undefined);
  
  // Draw components
  renderComponents(ctx, circuit.components, options);
  
  // Draw nodes and pins
  renderNodes(ctx, circuit.nodes, options);
  
  // Draw connection preview if active
  if (options.connectionPreview?.isConnecting) {
    drawConnectionPreview(ctx, circuit, options.connectionPreview);
  }
}

// Function to draw the connection preview while creating a new wire
function drawConnectionPreview(
  ctx: CanvasRenderingContext2D, 
  circuit: Circuit,
  connectionPreview: NonNullable<CircuitRenderOptions['connectionPreview']>
): void {
  if (!connectionPreview.connectionStart) return;
  
  const previewResult = connectionPreview.getPreviewPath(circuit);
  const { path, isValidTarget } = previewResult;
  
  // Draw preview path with appropriate style
  ctx.strokeStyle = isValidTarget ? '#22cc66' : '#ff6644';
  ctx.lineWidth = 2;
  ctx.setLineDash([5, 3]);
  
  ctx.beginPath();
  if (path.length > 0) {
    ctx.moveTo(path[0].x, path[0].y);
    
    for (let i = 1; i < path.length; i++) {
      ctx.lineTo(path[i].x, path[i].y);
    }
  }
  ctx.stroke();
  ctx.setLineDash([]);
  
  // Draw magnetic snap indicator if active
  if (connectionPreview.magneticSnap.nodeId) {
    ctx.fillStyle = '#33aaff';
    ctx.beginPath();
    ctx.arc(
      connectionPreview.magneticSnap.point.x,
      connectionPreview.magneticSnap.point.y,
      6, 0, Math.PI * 2
    );
    ctx.fill();
    
    // Add pulse effect
    ctx.strokeStyle = '#33aaff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(
      connectionPreview.magneticSnap.point.x,
      connectionPreview.magneticSnap.point.y,
      10, 0, Math.PI * 2
    );
    ctx.stroke();
  }
}

// Re-export all renderers
export * from './gridRenderer';
export * from './wireRenderer';
export * from './componentRenderer';
export * from './nodeRenderer';
