
import { MatrixContribution } from '../types';
import { BaseComponent } from './BaseComponent';

export class Switch extends BaseComponent {
  constructor(
    id: string,
    position: { x: number; y: number },
    closed: boolean = false // Default: open switch
  ) {
    super(id, 'switch', position, { closed, current: 0 });
    
    // Create two pins
    this.pins = [
      {
        id: 'p1',
        position: { x: position.x - 40, y: position.y }, // Left pin
        nodeId: null,
        componentId: id,
        type: 'bidirectional'
      },
      {
        id: 'p2',
        position: { x: position.x + 40, y: position.y }, // Right pin
        nodeId: null,
        componentId: id,
        type: 'bidirectional'
      }
    ];
  }
  
  toggle(): void {
    this.properties.closed = !this.properties.closed;
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
    
    // When closed, very high conductance (low resistance)
    // When open, very low conductance (high resistance)
    const conductance = this.properties.closed ? 1e3 : 1e-9;
    
    const conductanceMatrix = [
      [conductance, -conductance],
      [-conductance, conductance]
    ];
    
    const currentVector = [0, 0];
    
    return { conductanceMatrix, currentVector, nodeMap };
  }
  
  updateState(voltages: number[], timeStep: number): void {
    if (voltages.length >= 2) {
      if (this.properties.closed) {
        // Calculate current when closed
        const voltageDrop = voltages[0] - voltages[1];
        const resistance = 1e-3; // 0.001 ohms when closed
        this.properties.current = voltageDrop / resistance;
      } else {
        // Essentially no current when open
        this.properties.current = 0;
      }
    } else {
      this.properties.current = 0;
    }
  }
  
  getCurrents(): Record<string, number> {
    const current = this.properties.current || 0;
    return {
      'p1': current,
      'p2': -current
    };
  }
}
