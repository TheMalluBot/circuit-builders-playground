
import { MatrixContribution } from '../types';
import { BaseComponent } from './BaseComponent';

export class LED extends BaseComponent {
  constructor(
    id: string,
    position: { x: number; y: number },
    forwardVoltage: number = 1.7, // Default: 1.7V for red LED
    color: string = 'red'
  ) {
    super(id, 'led', position, { 
      forwardVoltage, 
      current: 0, 
      brightness: 0,
      color,
      forwardCurrent: 0.020, // 20mA typical
      emissionIntensity: 1.0  // Relative brightness scale
    });
    
    // Create two pins
    this.pins = [
      {
        id: 'anode',
        position: { x: position.x - 30, y: position.y }, // Left pin (anode)
        nodeId: undefined,
        componentId: id,
        type: 'input'
      },
      {
        id: 'cathode',
        position: { x: position.x + 30, y: position.y }, // Right pin (cathode)
        nodeId: undefined,
        componentId: id,
        type: 'output'
      }
    ];
  }
  
  getMatrixContribution(timeStep: number): MatrixContribution {
    // Both pins must be connected to nodes
    if (!this.pins[0].nodeId || !this.pins[1].nodeId) {
      return { conductanceMatrix: [], currentVector: [], nodeMap: {} };
    }
    
    const nodeMap: Record<string, number> = {
      [this.pins[0].nodeId]: 0, // Anode
      [this.pins[1].nodeId]: 1  // Cathode
    };
    
    // Simplified diode model with piecewise linear approximation
    // When forward biased, act like a voltage source in series with small resistance
    // When reverse biased, act like a very large resistor
    
    // Use previous state to estimate operating point
    const current = this.properties.current || 0;
    const forwardVoltage = this.properties.forwardVoltage;
    
    // Small conductance for forward bias, very small for reverse
    const forwardConductance = 1 / 10; // 10 ohms when on
    const reverseConductance = 1 / 1e6; // 1MΩ when off
    
    let conductance: number;
    let eqCurrent: number;
    
    if (current > 0 || this.properties.brightness > 0) {
      // Forward biased - use forward model
      conductance = forwardConductance;
      eqCurrent = forwardConductance * forwardVoltage;
    } else {
      // Reverse biased - use reverse model
      conductance = reverseConductance;
      eqCurrent = 0;
    }
    
    const conductanceMatrix = [
      [conductance, -conductance],
      [-conductance, conductance]
    ];
    
    const currentVector = [
      eqCurrent,
      -eqCurrent
    ];
    
    return { conductanceMatrix, currentVector, nodeMap };
  }
  
  updateState(voltages: number[], timeStep: number): void {
    if (voltages.length >= 2) {
      const voltageDiff = voltages[0] - voltages[1]; // Anode - Cathode
      
      // Simplified diode equation
      if (voltageDiff > this.properties.forwardVoltage) {
        // Forward biased - conducting
        // Use a simplified model: I = (V - Vf) / Rf
        const forwardResistance = 10; // Ohms when forward biased
        this.properties.current = (voltageDiff - this.properties.forwardVoltage) / forwardResistance;
        
        // Calculate brightness based on current
        // Normalize to nominal forward current
        this.properties.brightness = Math.min(
          this.properties.current / this.properties.forwardCurrent, 
          1.5
        ) * this.properties.emissionIntensity;
      } else {
        // Reverse biased or below forward voltage - minimal conduction
        this.properties.current = voltageDiff / 1e6; // Very small leakage current
        this.properties.brightness = 0;
      }
    } else {
      this.properties.current = 0;
      this.properties.brightness = 0;
    }
  }
  
  getCurrents(): Record<string, number> {
    const current = this.properties.current || 0;
    // Current flows into anode and out of cathode
    return {
      'anode': -current,
      'cathode': current
    };
  }
}
