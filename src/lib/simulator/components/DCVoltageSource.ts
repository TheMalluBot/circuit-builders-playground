
import { MatrixContribution } from '../types';
import { BaseComponent } from './BaseComponent';

export class DCVoltageSource extends BaseComponent {
  constructor(
    id: string,
    position: { x: number; y: number },
    voltage: number = 5 // Default: 5V
  ) {
    super(id, 'dcVoltageSource', position, { voltage, current: 0 });
    
    // Create two pins
    this.pins = [
      {
        id: 'positive',
        position: { x: 0, y: -40 }, // Top pin (positive)
        nodeId: undefined,
        componentId: id,
        type: 'output'
      },
      {
        id: 'negative',
        position: { x: 0, y: 40 }, // Bottom pin (negative)
        nodeId: undefined,
        componentId: id,
        type: 'input'
      }
    ];
  }
  
  getMatrixContribution(timeStep: number): MatrixContribution {
    // Both pins must be connected to nodes
    if (!this.pins[0].nodeId || !this.pins[1].nodeId) {
      return { conductanceMatrix: [], currentVector: [], nodeMap: {} };
    }
    
    const nodeMap: Record<string, number> = {
      [this.pins[0].nodeId]: 0, // Positive terminal
      [this.pins[1].nodeId]: 1  // Negative terminal
    };
    
    // Using Modified Nodal Analysis approach for voltage sources
    // Very large conductance to enforce voltage difference
    const largeValue = 1e9;
    
    const conductanceMatrix = [
      [largeValue, 0],
      [0, largeValue]
    ];
    
    // Current vector with voltage source contribution
    const currentVector = [
      largeValue * this.properties.voltage,
      0
    ];
    
    return { conductanceMatrix, currentVector, nodeMap };
  }
  
  updateState(voltages: number[], timeStep: number): void {
    if (voltages.length >= 2) {
      // Calculate current based on voltage difference and internal resistance
      const internalResistance = 0.1; // Small internal resistance
      const voltageDiff = voltages[0] - voltages[1];
      this.properties.current = (this.properties.voltage - voltageDiff) / internalResistance;
    }
  }
  
  getCurrents(): Record<string, number> {
    const current = this.properties.current || 0;
    // Current flows out of positive pin and into negative pin
    return {
      'positive': current,
      'negative': -current
    };
  }
}
