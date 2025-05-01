
import { Component, ComponentType } from '@/types/circuit';

export function createComponent(
  type: ComponentType,
  id: string,
  position: { x: number; y: number }
): Component {
  switch (type) {
    case 'battery':
      return {
        id,
        type,
        position: { ...position },
        rotation: 0,
        pins: [
          {
            id: `${id}_positive`,
            nodeId: null,
            position: { x: 0, y: -30 },
            type: 'output'
          },
          {
            id: `${id}_negative`,
            nodeId: null,
            position: { x: 0, y: 30 },
            type: 'input'
          }
        ],
        properties: {
          voltage: 5,
          current: 0
        }
      };
      
    case 'resistor':
      return {
        id,
        type,
        position: { ...position },
        rotation: 0,
        pins: [
          {
            id: `${id}_terminal1`,
            nodeId: null,
            position: { x: -30, y: 0 },
            type: 'bidirectional'
          },
          {
            id: `${id}_terminal2`,
            nodeId: null,
            position: { x: 30, y: 0 },
            type: 'bidirectional'
          }
        ],
        properties: {
          resistance: 1000,
          current: 0,
          power: 0
        }
      };
      
    case 'led':
      return {
        id,
        type,
        position: { ...position },
        rotation: 0,
        pins: [
          {
            id: `${id}_anode`,
            nodeId: null,
            position: { x: -30, y: 0 },
            type: 'input'
          },
          {
            id: `${id}_cathode`,
            nodeId: null,
            position: { x: 30, y: 0 },
            type: 'output'
          }
        ],
        properties: {
          forwardVoltage: 1.7,
          color: 'red',
          current: 0,
          brightness: 0
        }
      };
      
    case 'switch':
      return {
        id,
        type,
        position: { ...position },
        rotation: 0,
        pins: [
          {
            id: `${id}_terminal1`,
            nodeId: null,
            position: { x: -30, y: 0 },
            type: 'bidirectional'
          },
          {
            id: `${id}_terminal2`,
            nodeId: null,
            position: { x: 30, y: 0 },
            type: 'bidirectional'
          }
        ],
        properties: {
          closed: false,
          current: 0
        }
      };
      
    default:
      throw new Error(`Unknown component type: ${type}`);
  }
}
