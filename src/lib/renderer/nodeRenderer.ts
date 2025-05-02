
import { Node, RenderOptions } from '@/types/circuit';

/**
 * Renders all nodes in the circuit
 */
export function renderNodes(
  ctx: CanvasRenderingContext2D, 
  nodes: Node[], 
  options: RenderOptions
): void {
  nodes.forEach(node => {
    const isHighlighted = node.id === options.highlightedNodeId;
    drawNode(ctx, node, isHighlighted, options);
    
    // Draw voltage labels if enabled
    if (options.showVoltages && Math.abs(node.voltage) > 0.01) {
      drawVoltageLabel(ctx, node);
    }
  });
}

/**
 * Draws a single node
 */
function drawNode(
  ctx: CanvasRenderingContext2D, 
  node: Node, 
  isHighlighted: boolean,
  options: RenderOptions
): void {
  const radius = isHighlighted ? 6 : 4;
  
  ctx.fillStyle = isHighlighted 
    ? '#ff6600' 
    : options.theme === 'light' ? '#333' : '#ccc';
  
  ctx.beginPath();
  ctx.arc(node.position.x, node.position.y, radius, 0, Math.PI * 2);
  ctx.fill();
}

/**
 * Draws a voltage label for a node
 */
function drawVoltageLabel(ctx: CanvasRenderingContext2D, node: Node): void {
  const voltage = node.voltage.toFixed(1);
  
  ctx.font = '12px Arial';
  ctx.fillStyle = '#0066cc';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillText(`${voltage}V`, node.position.x, node.position.y + 5);
}
