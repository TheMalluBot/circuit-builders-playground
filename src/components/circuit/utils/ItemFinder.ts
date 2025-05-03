
import { Circuit, CircuitItemType } from '@/types/circuit';
import { findItemAtPosition, calculatePinPosition } from '@/lib/interaction';

/**
 * Utility to find interactive circuit elements at a position
 */
export function findHoveredItem(
  circuit: Circuit,
  x: number,
  y: number
): { 
  type: CircuitItemType; 
  id: string; 
  pinId?: string;
  pointIndex?: number;
  segmentIndex?: number;
  componentId?: string;
  wireId?: string;
  start?: { x: number, y: number };
  end?: { x: number, y: number };
  position?: { x: number; y: number };
} | null {
  // First, check for wire control points (highest priority)
  const controlPoint = findWireControlPoint(circuit, x, y);
  if (controlPoint) return controlPoint;
  
  // Then check for wire segments
  const wireSegment = findWireSegment(circuit, x, y);
  if (wireSegment) return wireSegment;
  
  // Then check for pins, components, etc.
  const item = findItemAtPosition(circuit, x, y);
  if (!item) return null;

  // For pins, calculate position
  if (item.type === 'pin' && item.componentId) {
    const component = circuit.components.find(c => c.id === item.componentId);
    const pin = component?.pins.find(p => p.id === item.pinId);
    
    if (component && pin) {
      const pinPos = calculatePinPosition(component, pin);
      return {
        ...item,
        position: pinPos
      };
    }
  }
  
  return item;
}

/**
 * Find a wire control point at the given position
 */
function findWireControlPoint(
  circuit: Circuit,
  x: number,
  y: number,
  threshold: number = 8
): { 
  type: 'wireControlPoint'; 
  id: string; 
  wireId: string;
  pointIndex: number;
  position: { x: number; y: number };
} | null {
  for (const wire of circuit.wires) {
    if (!wire.path || wire.path.length < 2) continue;
    
    for (let i = 0; i < wire.path.length; i++) {
      const point = wire.path[i];
      
      // Calculate distance to point
      const dx = x - point.x;
      const dy = y - point.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance <= threshold) {
        return {
          type: 'wireControlPoint',
          id: `${wire.id}-point-${i}`,
          wireId: wire.id,
          pointIndex: i,
          position: { x: point.x, y: point.y }
        };
      }
    }
  }
  
  return null;
}

/**
 * Find a wire segment at the given position
 */
function findWireSegment(
  circuit: Circuit,
  x: number,
  y: number,
  threshold: number = 5
): { 
  type: 'wireSegment'; 
  id: string; 
  wireId: string;
  segmentIndex: number;
  start: { x: number; y: number };
  end: { x: number; y: number };
} | null {
  for (const wire of circuit.wires) {
    if (!wire.path || wire.path.length < 2) continue;
    
    for (let i = 0; i < wire.path.length - 1; i++) {
      const start = wire.path[i];
      const end = wire.path[i + 1];
      
      // Calculate distance to line segment
      const distance = distanceToSegment(x, y, start.x, start.y, end.x, end.y);
      
      if (distance <= threshold) {
        return {
          type: 'wireSegment',
          id: `${wire.id}-segment-${i}`,
          wireId: wire.id,
          segmentIndex: i,
          start: { x: start.x, y: start.y },
          end: { x: end.x, y: end.y }
        };
      }
    }
  }
  
  return null;
}

/**
 * Calculate distance from a point to a line segment
 */
function distanceToSegment(
  x: number, y: number,
  x1: number, y1: number,
  x2: number, y2: number
): number {
  // Vector from start to end of the segment
  const A = x2 - x1;
  const B = y2 - y1;
  
  // Square length of segment
  const squaredLength = A * A + B * B;
  
  // If segment is a point, return distance to that point
  if (squaredLength === 0) {
    return Math.sqrt((x - x1) * (x - x1) + (y - y1) * (y - y1));
  }
  
  // Calculate projection of point onto segment
  const t = ((x - x1) * A + (y - y1) * B) / squaredLength;
  
  if (t < 0) {
    // Projection is beyond start of segment, return distance to start
    return Math.sqrt((x - x1) * (x - x1) + (y - y1) * (y - y1));
  }
  
  if (t > 1) {
    // Projection is beyond end of segment, return distance to end
    return Math.sqrt((x - x2) * (x - x2) + (y - y2) * (y - y2));
  }
  
  // Projection is on segment, return perpendicular distance
  const projectionX = x1 + t * A;
  const projectionY = y1 + t * B;
  
  return Math.sqrt((x - projectionX) * (x - projectionX) + (y - projectionY) * (y - projectionY));
}
