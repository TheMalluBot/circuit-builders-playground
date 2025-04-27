
import { Component, Pin, MatrixContribution } from '../types';

export abstract class BaseComponent implements Component {
  id: string;
  type: string;
  position: { x: number; y: number };
  rotation: number;
  properties: Record<string, any>;
  pins: Pin[];
  
  constructor(id: string, type: string, position: { x: number; y: number }, properties: Record<string, any> = {}) {
    this.id = id;
    this.type = type;
    this.position = position;
    this.rotation = 0;
    this.properties = { ...properties };
    this.pins = [];
  }
  
  abstract getMatrixContribution(timeStep: number): MatrixContribution;
  abstract updateState(voltages: number[], timeStep: number): void;
  abstract getCurrents(): Record<string, number>;
  
  // Helper method to get pin positions accounting for rotation
  protected getPinPositions(): { x: number; y: number }[] {
    return this.pins.map(pin => {
      // Apply rotation around component center
      const cos = Math.cos(this.rotation * Math.PI / 180);
      const sin = Math.sin(this.rotation * Math.PI / 180);
      
      const dx = pin.position.x - this.position.x;
      const dy = pin.position.y - this.position.y;
      
      const rotatedX = dx * cos - dy * sin + this.position.x;
      const rotatedY = dx * sin + dy * cos + this.position.y;
      
      return { x: rotatedX, y: rotatedY };
    });
  }
}
