
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
  componentId?: string;
  position?: { x: number; y: number };
} | null {
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
