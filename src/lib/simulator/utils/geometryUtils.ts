
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
  const dx = pin.position.x - component.position.x;
  const dy = pin.position.y - component.position.y;
  
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
  // Simple Manhattan routing
  const midX = (start.x + end.x) / 2;
  
  return [
    { x: start.x, y: start.y },
    { x: midX, y: start.y },
    { x: midX, y: end.y },
    { x: end.x, y: end.y }
  ];
};
