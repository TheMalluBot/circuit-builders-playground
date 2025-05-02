
import { Wire, Node, Component, Pin } from '@/types/circuit';
import { calculatePinPosition } from './interaction';

/**
 * Calculate smart wire paths between pins
 */
export function createWirePath(
  startPin: Pin, 
  startComponent: Component,
  endPin: Pin,
  endComponent: Component
): { x: number; y: number }[] {
  // Get absolute positions of pins
  const startPos = calculatePinPosition(startComponent, startPin);
  const endPos = calculatePinPosition(endComponent, endPin);
  
  // Create a path with manhattan routing
  return calculateManhattanPath(startPos, endPos);
}

/**
 * Calculate a manhattan path (only horizontal and vertical segments) between two points
 */
export function calculateManhattanPath(
  start: { x: number; y: number },
  end: { x: number; y: number }
): { x: number; y: number }[] {
  const path: { x: number; y: number }[] = [];
  
  // Start with the first position
  path.push({ x: start.x, y: start.y });
  
  // Calculate differences
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  
  // If points are close, just go directly
  if (Math.abs(dx) < 20 && Math.abs(dy) < 20) {
    path.push({ x: end.x, y: end.y });
    return path;
  }
  
  // Create an L-shaped path based on which delta is larger
  if (Math.abs(dx) > Math.abs(dy)) {
    // Horizontal first, then vertical
    path.push({ x: start.x + dx/2, y: start.y });
    path.push({ x: start.x + dx/2, y: end.y });
  } else {
    // Vertical first, then horizontal
    path.push({ x: start.x, y: start.y + dy/2 });
    path.push({ x: end.x, y: start.y + dy/2 });
  }
  
  // Add the end point
  path.push({ x: end.x, y: end.y });
  return path;
}

/**
 * Update a wire's path when dragging a segment
 */
export function updateWirePathOnDrag(
  wire: Wire,
  segmentIndex: number,
  dx: number,
  dy: number
): { x: number; y: number }[] {
  if (!wire.path || wire.path.length <= 2) {
    return wire.path || [];
  }
  
  const newPath = [...wire.path];
  
  // Different behavior based on which segment is being dragged
  if (segmentIndex === 0) {
    // First segment - only move the middle point
    if (newPath.length >= 3) {
      newPath[1] = {
        x: newPath[1].x + dx,
        y: newPath[1].y + dy
      };
    }
  } else if (segmentIndex === newPath.length - 2) {
    // Last segment - only move the second-to-last point
    newPath[newPath.length - 2] = {
      x: newPath[newPath.length - 2].x + dx,
      y: newPath[newPath.length - 2].y + dy
    };
  } else {
    // Middle segment - move both ends of the segment
    newPath[segmentIndex] = {
      x: newPath[segmentIndex].x + dx,
      y: newPath[segmentIndex].y + dy
    };
    newPath[segmentIndex + 1] = {
      x: newPath[segmentIndex + 1].x + dx,
      y: newPath[segmentIndex + 1].y + dy
    };
  }
  
  return newPath;
}
