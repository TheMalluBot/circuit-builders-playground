
import { Component, Pin } from '../types';

/**
 * Calculate the actual position of a pin considering component rotation
 */
export const calculatePinPosition = (component: Component, pin: Pin): { x: number; y: number } => {
  // Apply rotation around component center
  const rad = (component.rotation || 0) * Math.PI / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  
  // Pin position is relative to component position
  const dx = pin.position.x;
  const dy = pin.position.y;
  
  // Apply rotation
  const rotatedX = dx * cos - dy * sin;
  const rotatedY = dx * sin + dy * cos;
  
  // Return absolute position
  return {
    x: component.position.x + rotatedX,
    y: component.position.y + rotatedY
  };
};

/**
 * Get a node position from its ID by searching components and pins
 */
export const getNodePositionFromId = (nodeId: string, components: Component[]): { x: number; y: number } => {
  if (!nodeId || !components || components.length === 0) {
    return { x: 0, y: 0 };
  }

  for (const comp of components) {
    for (const pin of comp.pins) {
      if (pin.nodeId === nodeId || `${comp.id}-${pin.id}` === nodeId) {
        return calculatePinPosition(comp, pin);
      }
    }
  }
  return { x: 0, y: 0 };
};

/**
 * Calculate Manhattan path for wire routing
 */
export const calculateWirePath = (start: {x: number, y: number}, end: {x: number, y: number}): {x: number, y: number}[] => {
  if (!start || !end) return [];
  
  // Simple Manhattan routing
  const midX = (start.x + end.x) / 2;
  
  return [
    { x: start.x, y: start.y },
    { x: midX, y: start.y },
    { x: midX, y: end.y },
    { x: end.x, y: end.y }
  ];
};

/**
 * Check if a point is near a pin
 */
export const isNearPin = (point: {x: number, y: number}, pin: {x: number, y: number}, threshold: number = 10): boolean => {
  const dx = point.x - pin.x;
  const dy = point.y - pin.y;
  return Math.sqrt(dx * dx + dy * dy) <= threshold;
};

/**
 * Check if mouse position is inside component area
 */
export const isInsideComponent = (mousePos: {x: number, y: number}, component: Component, radius: number = 30): boolean => {
  const dx = component.position.x - mousePos.x;
  const dy = component.position.y - mousePos.y;
  return Math.sqrt(dx * dx + dy * dy) < radius;
};
