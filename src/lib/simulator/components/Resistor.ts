
import { MatrixContribution } from '../types';
import { BaseComponent } from './BaseComponent';

export class Resistor extends BaseComponent {
  constructor(
    id: string, 
    position: { x: number; y: number },
    resistance: number = 1000 // Default: 1kΩ
  ) {
    super(id, 'resistor', position, { resistance });
    
    // Create two pins
    this.pins = [
      {
        id: 'p1',
        position: { x: position.x - 40, y: position.y }, // Left pin
        nodeId: undefined,
        componentId: id,
        type: 'bidirectional'
      },
      {
        id: 'p2',
        position: { x: position.x + 40, y: position.y }, // Right pin
        nodeId: undefined,
        componentId: id,
        type: 'bidirectional'
      }
    ];
  }
  
  getMatrixContribution(timeStep: number): MatrixContribution {
    // Both pins must be connected to nodes
    if (!this.pins[0].nodeId || !this.pins[1].nodeId) {
      return { conductanceMatrix: [], currentVector: [], nodeMap: {} };
    }
    
    const nodeMap: Record<string, number> = {
      [this.pins[0].nodeId]: 0,
      [this.pins[1].nodeId]: 1
    };
    
    const conductance = 1 / this.properties.resistance;
    const conductanceMatrix = [
      [conductance, -conductance],
      [-conductance, conductance]
    ];
    
    const currentVector = [0, 0];
    
    return { conductanceMatrix, currentVector, nodeMap };
  }
  
  updateState(voltages: number[], timeStep: number): void {
    // Resistors don't have state to update
    // But we can calculate current for visualization
    if (voltages.length >= 2) {
      const voltageDrop = voltages[0] - voltages[1];
      this.properties.current = voltageDrop / this.properties.resistance;
    }
  }
  
  getCurrents(): Record<string, number> {
    const current = this.properties.current || 0;
    // Current flows out of p1 and into p2
    return {
      'p1': current,
      'p2': -current
    };
  }
}
