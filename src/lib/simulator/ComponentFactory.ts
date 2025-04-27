
import { DCVoltageSource } from './components/DCVoltageSource';
import { Resistor } from './components/Resistor';
import { LED } from './components/LED';
import { Switch } from './components/Switch';
import { Component } from './types';

export class ComponentFactory {
  static createComponent(
    type: string,
    id: string,
    position: { x: number; y: number },
    properties: Record<string, any> = {}
  ): Component | null {
    switch (type.toLowerCase()) {
      case 'dcvoltagesource':
      case 'battery':
        return new DCVoltageSource(id, position, properties.voltage || 5);
      
      case 'resistor':
        return new Resistor(id, position, properties.resistance || 1000);
      
      case 'led':
        return new LED(
          id, 
          position, 
          properties.forwardVoltage || 1.7, 
          properties.color || 'red'
        );
      
      case 'switch':
        return new Switch(id, position, properties.closed || false);
      
      default:
        console.error(`Unknown component type: ${type}`);
        return null;
    }
  }
}
