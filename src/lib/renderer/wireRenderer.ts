import { Wire, Node, Circuit, RenderOptions } from '@/types/circuit';
import { calculateWirePath } from '../interaction';

/**
 * Renders all wires in the circuit
 */
export function renderWires(
  ctx: CanvasRenderingContext2D, 
  wires: Wire[], 
  nodes: Node[],
  circuit: Circuit,
  options: RenderOptions
): void {
  wires.forEach(wire => {
    drawWire(ctx, wire, nodes, circuit, options);
  });
}

/**
 * Draws a single wire
 */
function drawWire(
  ctx: CanvasRenderingContext2D, 
  wire: Wire, 
  nodes: Node[],
  circuit: Circuit,
  options: RenderOptions
): void {
  // Find connected nodes
  const startNode = nodes.find(n => n.id === wire.nodeIds[0]);
  const endNode = nodes.find(n => n.id === wire.nodeIds[1]);
  
  if (!startNode || !endNode) return;
  
  const current = Math.abs(wire.current);
  const lineWidth = 2 + Math.min(current * 3, 4); // Thicker for higher current
  
  // Wire color based on current
  let color: string;
  if (current < 0.001) {
    color = options.theme === 'light' ? '#333' : '#aaa';
  } else if (wire.current > 0) {
    color = options.theme === 'light' ? '#3366ff' : '#66aaff'; // Blue for positive
  } else {
    color = options.theme === 'light' ? '#ff3366' : '#ff6699'; // Red for negative
  }
  
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  
  // Draw wire using path if available, otherwise direct line
  ctx.beginPath();
  
  if (wire.path && wire.path.length > 1) {
    // Use stored path
    ctx.moveTo(wire.path[0].x, wire.path[0].y);
    for (let i = 1; i < wire.path.length; i++) {
      ctx.lineTo(wire.path[i].x, wire.path[i].y);
    }
  } else {
    // Calculate a path if not available
    const path = calculateWirePath(
      startNode.position, 
      endNode.position
    );
    
    ctx.moveTo(path[0].x, path[0].y);
    for (let i = 1; i < path.length; i++) {
      ctx.lineTo(path[i].x, path[i].y);
    }
  }
  
  ctx.stroke();
  
  // Draw current label if enabled
  if (options.showCurrents && Math.abs(wire.current) > 0.001) {
    drawCurrentLabel(ctx, wire, startNode, endNode);
  }
}

/**
 * Draws a current label for a wire
 */
function drawCurrentLabel(
  ctx: CanvasRenderingContext2D,
  wire: Wire,
  startNode: Node,
  endNode: Node
): void {
  // Calculate position for the label
  let midX, midY;
  
  if (wire.path && wire.path.length > 1) {
    // If we have a path with multiple segments, put label at middle segment
    const middleIdx = Math.floor(wire.path.length / 2);
    const pt1 = wire.path[middleIdx - 1];
    const pt2 = wire.path[middleIdx];
    midX = (pt1.x + pt2.x) / 2;
    midY = (pt1.y + pt2.y) / 2;
  } else {
    // Otherwise use midpoint of straight line
    midX = (startNode.position.x + endNode.position.x) / 2;
    midY = (startNode.position.y + endNode.position.y) / 2;
  }
  
  // Format current value
  let currentText: string;
  const current = Math.abs(wire.current);
  
  if (current < 0.001) {
    currentText = `${(current * 1000000).toFixed(1)}µA`;
  } else if (current < 1) {
    currentText = `${(current * 1000).toFixed(1)}mA`;
  } else {
    currentText = `${current.toFixed(2)}A`;
  }
  
  // Add direction arrow
  const directionChar = wire.current > 0 ? '→' : '←';
  currentText = `${currentText} ${directionChar}`;
  
  // Draw background for better readability
  const textWidth = ctx.measureText(currentText).width;
  ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
  ctx.fillRect(midX - textWidth/2 - 2, midY - 15, textWidth + 4, 16);
  
  // Draw text
  ctx.font = '12px Arial';
  ctx.fillStyle = '#cc0000';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'bottom';
  ctx.fillText(currentText, midX, midY - 2);
}
