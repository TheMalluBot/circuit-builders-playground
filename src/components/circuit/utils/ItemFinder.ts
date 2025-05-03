
import { Circuit, CircuitItemType } from '@/types/circuit';

// Define the return type for the findHoveredItem function
export type HoveredItem = {
  type: CircuitItemType;
  id: string;
  wireId?: string;
  pinId?: string;
  componentId?: string;
  position?: { x: number; y: number };
  pointIndex?: number;
  segmentIndex?: number;
  start?: { x: number; y: number };
  end?: { x: number; y: number };
};

/**
 * Find the circuit item under the mouse pointer
 */
export function findHoveredItem(
  circuit: Circuit,
  x: number,
  y: number,
  threshold: number = 10
): HoveredItem | null {
  // Check for wire control points and segments first (higher priority)
  for (const wire of circuit.wires) {
    if (!wire.path || wire.path.length <= 1) continue;
    
    // Check if near any control point
    for (let i = 0; i < wire.path.length; i++) {
      const point = wire.path[i];
      const distance = Math.sqrt(Math.pow(x - point.x, 2) + Math.pow(y - point.y, 2));
      
      if (distance <= threshold) {
        return {
          type: 'wireControlPoint',
          id: `${wire.id}_controlPoint_${i}`,
          wireId: wire.id,
          pointIndex: i,
          position: point
        };
      }
    }
    
    // Check if near any wire segment
    for (let i = 0; i < wire.path.length - 1; i++) {
      const start = wire.path[i];
      const end = wire.path[i + 1];
      
      // Calculate distance to line segment
      const distance = distanceToLineSegment(x, y, start.x, start.y, end.x, end.y);
      
      if (distance <= threshold) {
        return {
          type: 'wireSegment',
          id: `${wire.id}_segment_${i}`,
          wireId: wire.id,
          segmentIndex: i,
          start,
          end
        };
      }
    }
  }

  // Continue checking for other elements...
  // (components, pins, nodes, etc.)

  // If no specific part is hovered, check if entire wire is hovered
  for (const wire of circuit.wires) {
    if (!wire.path || wire.path.length <= 1) continue;
    
    for (let i = 0; i < wire.path.length - 1; i++) {
      const start = wire.path[i];
      const end = wire.path[i + 1];
      
      const distance = distanceToLineSegment(x, y, start.x, start.y, end.x, end.y);
      
      if (distance <= threshold * 1.5) { // Slightly larger threshold for the wire itself
        return {
          type: 'wire',
          id: wire.id
        };
      }
    }
  }

  // Check for nodes
  for (const node of circuit.nodes) {
    const distance = Math.sqrt(Math.pow(x - node.position.x, 2) + Math.pow(y - node.position.y, 2));
    
    if (distance <= threshold) {
      return {
        type: 'node',
        id: node.id,
        position: node.position
      };
    }
  }

  // Check for component pins
  for (const component of circuit.components) {
    for (const pin of component.pins) {
      const pinX = component.position.x + pin.position.x;
      const pinY = component.position.y + pin.position.y;
      
      const distance = Math.sqrt(Math.pow(x - pinX, 2) + Math.pow(y - pinY, 2));
      
      if (distance <= threshold) {
        return {
          type: 'pin',
          id: pin.nodeId || '',
          pinId: pin.id,
          componentId: component.id,
          position: { x: pinX, y: pinY }
        };
      }
    }
  }

  // Check for components
  for (const component of circuit.components) {
    // Simple check with fixed radius - could be enhanced for component shape
    const distance = Math.sqrt(Math.pow(x - component.position.x, 2) + Math.pow(y - component.position.y, 2));
    
    if (distance <= 30) {
      return {
        type: 'component',
        id: component.id
      };
    }
  }

  return null;
}

/**
 * Calculate distance from point to line segment
 */
function distanceToLineSegment(
  px: number, py: number,
  x1: number, y1: number,
  x2: number, y2: number
): number {
  const A = px - x1;
  const B = py - y1;
  const C = x2 - x1;
  const D = y2 - y1;

  const dot = A * C + B * D;
  const lenSq = C * C + D * D;
  let param = -1;
  
  if (lenSq !== 0) {
    param = dot / lenSq;
  }

  let xx, yy;

  if (param < 0) {
    xx = x1;
    yy = y1;
  } else if (param > 1) {
    xx = x2;
    yy = y2;
  } else {
    xx = x1 + param * C;
    yy = y1 + param * D;
  }

  const dx = px - xx;
  const dy = py - yy;
  
  return Math.sqrt(dx * dx + dy * dy);
}
