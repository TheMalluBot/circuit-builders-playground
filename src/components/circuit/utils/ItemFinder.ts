
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
  // First check for pins (highest priority for connections)
  for (const component of circuit.components) {
    for (const pin of component.pins) {
      // Calculate actual pin position based on component position and rotation
      let pinX = component.position.x + pin.position.x;
      let pinY = component.position.y + pin.position.y;
      
      // Apply rotation if component is rotated
      if (component.rotation) {
        const radians = (component.rotation * Math.PI) / 180;
        const cos = Math.cos(radians);
        const sin = Math.sin(radians);
        
        // Rotate around component center
        const rotatedX = pin.position.x * cos - pin.position.y * sin;
        const rotatedY = pin.position.x * sin + pin.position.y * cos;
        
        pinX = component.position.x + rotatedX;
        pinY = component.position.y + rotatedY;
      }
      
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

  // Check for components (more accurate hit detection)
  for (const component of circuit.components) {
    // More accurate component hit detection based on component type and size
    if (isInsideComponent(x, y, component)) {
      return {
        type: 'component',
        id: component.id
      };
    }
  }
  
  // Check for wire control points
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

  // Check for whole wires
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

/**
 * Check if a point is inside a component based on its type and dimensions
 */
function isInsideComponent(x: number, y: number, component: any): boolean {
  // Default bounding box size
  let width = 60;
  let height = 60;
  
  // Adjust size based on component type
  switch (component.type) {
    case 'battery':
      width = 60;
      height = 80;
      break;
    case 'resistor':
      width = 80;
      height = 40;
      break;
    case 'led':
      width = 60;
      height = 60;
      break;
    case 'switch':
      width = 80;
      height = 40;
      break;
    default:
      width = 60;
      height = 60;
  }
  
  // Apply rotation if needed
  if (component.rotation) {
    const radians = (component.rotation * Math.PI) / 180;
    
    // Translate point to origin of component
    const dx = x - component.position.x;
    const dy = y - component.position.y;
    
    // Rotate point
    const cos = Math.cos(-radians);
    const sin = Math.sin(-radians);
    const rotX = dx * cos - dy * sin;
    const rotY = dx * sin + dy * cos;
    
    // Check if point is inside rotated box
    return (
      rotX >= -width / 2 &&
      rotX <= width / 2 &&
      rotY >= -height / 2 &&
      rotY <= height / 2
    );
  } else {
    // No rotation - simple box check
    return (
      x >= component.position.x - width / 2 &&
      x <= component.position.x + width / 2 &&
      y >= component.position.y - height / 2 &&
      y <= component.position.y + height / 2
    );
  }
}
