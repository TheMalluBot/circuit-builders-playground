
import { Circuit, RenderOptions } from '@/types/circuit';
import { renderGrid } from './gridRenderer';
import { renderWires } from './wireRenderer';
import { renderComponents } from './componentRenderer';
import { renderNodes } from './nodeRenderer';

export function renderCircuit(
  ctx: CanvasRenderingContext2D, 
  circuit: Circuit, 
  options: RenderOptions & { selectedWireId?: string | null }
): void {
  // Clear canvas
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  
  // Draw grid
  renderGrid(ctx, options.theme);
  
  // Draw wires first (so they appear behind components)
  renderWires(ctx, circuit.wires, circuit.nodes, circuit, options, options.selectedWireId || undefined);
  
  // Draw components
  renderComponents(ctx, circuit.components, options);
  
  // Draw nodes and pins
  renderNodes(ctx, circuit.nodes, options);
}

// Re-export all renderers
export * from './gridRenderer';
export * from './wireRenderer';
export * from './componentRenderer';
export * from './nodeRenderer';
