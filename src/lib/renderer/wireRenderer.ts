
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
  options: RenderOptions,
  selectedWireId?: string
): void {
  wires.forEach(wire => {
    const isSelected = wire.id === selectedWireId || wire.selected;
    drawWire(ctx, wire, nodes, circuit, options, isSelected);
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
  options: RenderOptions,
  isSelected: boolean = false
): void {
  // Find connected nodes
  const startNode = nodes.find(n => n.id === wire.nodeIds[0]);
  const endNode = nodes.find(n => n.id === wire.nodeIds[1]);
  
  if (!startNode || !endNode) return;
  
  const current = Math.abs(wire.current);
  const lineWidth = 2 + Math.min(current * 3, 4); // Thicker for higher current
  
  // Wire color based on current and selection state
  let color: string;
  if (isSelected) {
    color = options.theme === 'light' ? '#ff6600' : '#ff9933'; // Orange when selected
  } else if (current < 0.001) {
    color = options.theme === 'light' ? '#333' : '#aaa';
  } else if (wire.current > 0) {
    color = options.theme === 'light' ? '#3366ff' : '#66aaff'; // Blue for positive
  } else {
    color = options.theme === 'light' ? '#ff3366' : '#ff6699'; // Red for negative
  }
  
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  
  // Draw wire path with segments
  if (wire.path && wire.path.length > 1) {
    ctx.beginPath();
    ctx.moveTo(wire.path[0].x, wire.path[0].y);
    
    // Draw each segment of the path
    for (let i = 1; i < wire.path.length; i++) {
      ctx.lineTo(wire.path[i].x, wire.path[i].y);
    }
    
    ctx.stroke();
    
    // Draw control points if wire is selected
    if (isSelected) {
      drawWireControlPoints(ctx, wire.path);
    }
    
    // Draw junction dots where wires cross
    drawWireCrossings(ctx, wire, wires, options);
  } else {
    // Calculate path if not available
    const path = calculateWirePath(
      startNode.position, 
      endNode.position
    );
    
    // Store the path on the wire for future reference
    wire.path = path;
    
    ctx.beginPath();
    ctx.moveTo(path[0].x, path[0].y);
    for (let i = 1; i < path.length; i++) {
      ctx.lineTo(path[i].x, path[i].y);
    }
    
    ctx.stroke();
  }
  
  // Draw current label if enabled
  if (options.showCurrents && Math.abs(wire.current) > 0.001) {
    drawCurrentLabel(ctx, wire, startNode, endNode);
  }
}

/**
 * Draws control points on a wire for manipulation
 */
function drawWireControlPoints(ctx: CanvasRenderingContext2D, path: {x: number, y: number}[]): void {
  const pointRadius = 4;
  
  // Draw control points at each vertex in the path
  ctx.fillStyle = '#ff6600'; // Orange control points
  
  for (let i = 0; i < path.length; i++) {
    const point = path[i];
    
    ctx.beginPath();
    ctx.arc(point.x, point.y, pointRadius, 0, 2 * Math.PI);
    ctx.fill();
    
    // Add white center for better visibility
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(point.x, point.y, pointRadius * 0.5, 0, 2 * Math.PI);
    ctx.fill();
    
    ctx.fillStyle = '#ff6600';
  }
}

/**
 * Draws junction dots where wires cross
 */
function drawWireCrossings(
  ctx: CanvasRenderingContext2D,
  wire: Wire,
  allWires: Wire[],
  options: RenderOptions
): void {
  // Skip if no path
  if (!wire.path || wire.path.length <= 1) return;
  
  // Find all crossing points with other wires
  for (const otherWire of allWires) {
    // Skip same wire or wires without paths
    if (wire.id === otherWire.id || !otherWire.path || otherWire.path.length <= 1) continue;
    
    // Check for intersections between segments
    for (let i = 0; i < wire.path.length - 1; i++) {
      const segment1Start = wire.path[i];
      const segment1End = wire.path[i + 1];
      
      for (let j = 0; j < otherWire.path.length - 1; j++) {
        const segment2Start = otherWire.path[j];
        const segment2End = otherWire.path[j + 1];
        
        // Find intersection between these two segments
        const intersection = findSegmentIntersection(
          segment1Start, segment1End, 
          segment2Start, segment2End
        );
        
        if (intersection) {
          // Draw junction dot for wire crossing
          ctx.fillStyle = options.theme === 'light' ? '#ffffff' : '#333333';
          ctx.beginPath();
          ctx.arc(intersection.x, intersection.y, 4, 0, 2 * Math.PI);
          ctx.fill();
          
          // Draw border around dot
          ctx.strokeStyle = options.theme === 'light' ? '#333333' : '#ffffff';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(intersection.x, intersection.y, 4, 0, 2 * Math.PI);
          ctx.stroke();
        }
      }
    }
  }
}

/**
 * Find intersection point between two line segments
 */
function findSegmentIntersection(
  p1: {x: number, y: number}, 
  p2: {x: number, y: number}, 
  p3: {x: number, y: number}, 
  p4: {x: number, y: number}
): {x: number, y: number} | null {
  // Line segment 1: p1 to p2
  // Line segment 2: p3 to p4
  
  // Check if the segments are parallel
  const dx1 = p2.x - p1.x;
  const dy1 = p2.y - p1.y;
  const dx2 = p4.x - p3.x;
  const dy2 = p4.y - p3.y;
  
  // Cross product determines if lines are parallel
  const cross = dx1 * dy2 - dy1 * dx2;
  
  // If cross is zero, lines are parallel
  if (Math.abs(cross) < 0.000001) return null;
  
  // Find t and s parameters for intersection point
  const s = ((p1.x - p3.x) * dy2 - (p1.y - p3.y) * dx2) / cross;
  const t = ((p3.x - p1.x) * dy1 - (p3.y - p1.y) * dx1) / -cross;
  
  // If s and t are within [0,1], the segments intersect
  if (s >= 0 && s <= 1 && t >= 0 && t <= 1) {
    return {
      x: p1.x + s * dx1,
      y: p1.y + s * dy1
    };
  }
  
  return null;
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
