
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
    // Normalize the component type to handle case differences and shortcuts
    const normalizedType = type.toLowerCase().trim();
    
    switch (normalizedType) {
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
  
  static getComponentInfo(type: string): { 
    displayName: string; 
    description: string;
    category: string;
    defaultProperties: Record<string, any>
  } {
    // Normalize the component type
    const normalizedType = type.toLowerCase().trim();
    
    switch (normalizedType) {
      case 'dcvoltagesource':
      case 'battery':
        return {
          displayName: 'DC Voltage Source',
          description: 'Provides a constant voltage',
          category: 'power',
          defaultProperties: { voltage: 5 }
        };
      
      case 'resistor':
        return {
          displayName: 'Resistor',
          description: 'Limits current flow',
          category: 'passive',
          defaultProperties: { resistance: 1000 }
        };
      
      case 'led':
        return {
          displayName: 'LED',
          description: 'Light Emitting Diode',
          category: 'passive',
          defaultProperties: { forwardVoltage: 1.7, color: 'red' }
        };
      
      case 'switch':
        return {
          displayName: 'Switch',
          description: 'Opens or closes a circuit',
          category: 'passive',
          defaultProperties: { closed: false }
        };
      
      default:
        return {
          displayName: 'Unknown Component',
          description: 'Unknown component type',
          category: 'unknown',
          defaultProperties: {}
        };
    }
  }

  // Add a method to get the canonical type name
  static getCanonicalTypeName(type: string): string {
    const normalizedType = type.toLowerCase().trim();
    
    switch (normalizedType) {
      case 'dcvoltagesource':
      case 'battery':
        return 'battery';
      
      case 'resistor':
        return 'resistor';
      
      case 'led':
        return 'led';
      
      case 'switch':
        return 'switch';
      
      default:
        return normalizedType;
    }
  }
}
