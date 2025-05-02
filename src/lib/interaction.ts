
import { Circuit, Component, Pin, CircuitItemType } from '@/types/circuit';

export function findItemAtPosition(
  circuit: Circuit,
  x: number,
  y: number,
  nodeRadius: number = 10,
  componentRadius: number = 30
): { type: CircuitItemType; id: string; pinId?: string; componentId?: string; segmentIndex?: number } | null {
  // Check for pins first (highest priority for connections)
  for (const component of circuit.components) {
    for (const pin of component.pins) {
      // Calculate absolute pin position based on component position and rotation
      const pinPos = calculatePinPosition(component, pin);
      const distance = calculateDistance(pinPos.x, pinPos.y, x, y);
      
      if (distance <= nodeRadius) {
        return { 
          type: 'pin', 
          id: pin.nodeId || '', 
          pinId: pin.id, 
          componentId: component.id 
        };
      }
    }
  }
  
  // Check for nodes (second priority)
  for (const node of circuit.nodes) {
    const distance = calculateDistance(node.position.x, node.position.y, x, y);
    
    if (distance <= nodeRadius) {
      return { type: 'node', id: node.id };
    }
  }
  
  // Check for wire segments (third priority)
  for (const wire of circuit.wires) {
    if (wire.path && wire.path.length > 1) {
      // Check each segment of the wire
      for (let i = 0; i < wire.path.length - 1; i++) {
        const distToSegment = distanceToSegment(
          x, y,
          wire.path[i].x, wire.path[i].y,
          wire.path[i+1].x, wire.path[i+1].y
        );
        
        if (distToSegment <= 8) { // 8px hit tolerance for wires
          return { type: 'wire', id: wire.id, segmentIndex: i };
        }
      }
    } else {
      // Fallback for wires without paths
      const startNode = circuit.nodes.find(n => n.id === wire.nodeIds[0]);
      const endNode = circuit.nodes.find(n => n.id === wire.nodeIds[1]);
      
      if (startNode && endNode) {
        const distToSegment = distanceToSegment(
          x, y,
          startNode.position.x, startNode.position.y,
          endNode.position.x, endNode.position.y
        );
        
        if (distToSegment <= 8) {
          return { type: 'wire', id: wire.id };
        }
      }
    }
  }
  
  // Finally check for components
  for (const component of circuit.components) {
    const distance = calculateDistance(component.position.x, component.position.y, x, y);
    
    if (distance <= componentRadius) {
      return { type: 'component', id: component.id };
    }
  }
  
  return null;
}

// Calculate absolute position of a pin based on component position and rotation
export function calculatePinPosition(component: Component, pin: Pin): { x: number; y: number } {
  const radians = (component.rotation * Math.PI) / 180;
  const cos = Math.cos(radians);
  const sin = Math.sin(radians);
  
  // Apply rotation transformation
  const rotatedX = pin.position.x * cos - pin.position.y * sin;
  const rotatedY = pin.position.x * sin + pin.position.y * cos;
  
  // Add component position to get absolute pin position
  return {
    x: component.position.x + rotatedX,
    y: component.position.y + rotatedY
  };
}

// Calculate distance between two points
export function calculateDistance(x1: number, y1: number, x2: number, y2: number): number {
  return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}

// Calculate distance from point to line segment
export function distanceToSegment(
  px: number, py: number,
  x1: number, y1: number,
  x2: number, y2: number
): number {
  const A = px - x1;
  const B = py - y1;
  const C = x2 - x1;
  const D = y2 - y1;
  
  const dot = A * C + B * D;
  const len_sq = C * C + D * D;
  let param = -1;
  
  if (len_sq !== 0) param = dot / len_sq;
  
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

// Calculate a smart wire path between two points
export function calculateWirePath(
  start: { x: number; y: number },
  end: { x: number; y: number },
  startPinAngle?: number,
  endPinAngle?: number
): { x: number; y: number }[] {
  // Create a Manhattan path (only horizontal and vertical segments)
  const path: { x: number; y: number }[] = [];
  
  // Start with the first position
  path.push({ x: start.x, y: start.y });
  
  // Calculate differences
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  
  // If pins are close together, just go directly
  if (Math.abs(dx) < 20 && Math.abs(dy) < 20) {
    path.push({ x: end.x, y: end.y });
    return path;
  }
  
  // Create an L-shaped path with midpoint
  if (startPinAngle !== undefined && endPinAngle !== undefined) {
    // Use pin angles to determine which direction to go first
    const startHorizontal = Math.abs(Math.cos(startPinAngle * Math.PI / 180)) > 0.7;
    const endHorizontal = Math.abs(Math.cos(endPinAngle * Math.PI / 180)) > 0.7;
    
    // If pins point in compatible directions
    if (startHorizontal && !endHorizontal) {
      // Go horizontal from start, then vertical to end
      path.push({ x: end.x, y: start.y });
    } else if (!startHorizontal && endHorizontal) {
      // Go vertical from start, then horizontal to end
      path.push({ x: start.x, y: end.y });
    } else {
      // Default L-routing based on which delta is larger
      if (Math.abs(dx) > Math.abs(dy)) {
        // Horizontal first, then vertical
        path.push({ x: start.x + dx/2, y: start.y });
        path.push({ x: start.x + dx/2, y: end.y });
      } else {
        // Vertical first, then horizontal
        path.push({ x: start.x, y: start.y + dy/2 });
        path.push({ x: end.x, y: start.y + dy/2 });
      }
    }
  } else {
    // Without angle info, use simple L-routing
    if (Math.abs(dx) > Math.abs(dy)) {
      // Horizontal first
      path.push({ x: start.x + dx/2, y: start.y });
      path.push({ x: start.x + dx/2, y: end.y });
    } else {
      // Vertical first
      path.push({ x: start.x, y: start.y + dy/2 });
      path.push({ x: end.x, y: start.y + dy/2 });
    }
  }
  
  // Add the end point
  path.push({ x: end.x, y: end.y });
  return path;
}
