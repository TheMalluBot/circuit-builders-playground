
import { Circuit } from '@/types/circuit';

export function findItemAtPosition(
  circuit: Circuit,
  x: number,
  y: number,
  nodeRadius: number = 10,
  componentRadius: number = 30
): { type: 'component' | 'node'; id: string } | null {
  // Check for nodes first (higher priority for connections)
  for (const node of circuit.nodes) {
    const distance = Math.sqrt(
      Math.pow(node.position.x - x, 2) + Math.pow(node.position.y - y, 2)
    );
    
    if (distance <= nodeRadius) {
      return { type: 'node', id: node.id };
    }
  }
  
  // Then check for components
  for (const component of circuit.components) {
    const distance = Math.sqrt(
      Math.pow(component.position.x - x, 2) + Math.pow(component.position.y - y, 2)
    );
    
    if (distance <= componentRadius) {
      return { type: 'component', id: component.id };
    }
  }
  
  return null;
}
