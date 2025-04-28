
import React, { createContext } from 'react';
import { CircuitEngine } from '../CircuitEngine';
import { CircuitRenderer, RenderOptions } from '../CircuitRenderer';
import { Component, SimulationState, Node, Wire } from '../types';

interface SimulationContextType {
  engine: CircuitEngine | null;
  renderer: CircuitRenderer | null;
  simulationState: SimulationState | null;
  isRunning: boolean;
  simulationSpeed: number;
  selectedComponent: Component | null;
  addComponent: (type: string, position: { x: number; y: number }, properties?: Record<string, any>) => void;
  removeComponent: (componentId: string) => void;
  selectComponent: (componentId: string | null) => void;
  deleteSelectedComponent: () => void;
  rotateSelectedComponent: () => void;
  moveComponent: (componentId: string, position: { x: number; y: number }) => void;
  updateComponentProperty: (componentId: string, property: string, value: any) => void;
  createWire: (startNodeId: string, endNodeId: string) => void;
  deleteWire: (wireId: string) => void;
  toggleSimulation: () => void;
  resetSimulation: () => void;
  setRenderOptions: (options: Partial<RenderOptions>) => void;
  toggleSwitch: (componentId: string) => void;
  setSimulationSpeed: (speed: number) => void;
}

export const SimulationContext = createContext<SimulationContextType>({
  engine: null,
  renderer: null,
  simulationState: null,
  isRunning: false,
  simulationSpeed: 1,
  selectedComponent: null,
  addComponent: () => {},
  removeComponent: () => {},
  selectComponent: () => {},
  deleteSelectedComponent: () => {},
  rotateSelectedComponent: () => {},
  moveComponent: () => {},
  updateComponentProperty: () => {},
  createWire: () => {},
  deleteWire: () => {},
  toggleSimulation: () => {},
  resetSimulation: () => {},
  setRenderOptions: () => {},
  toggleSwitch: () => {},
  setSimulationSpeed: () => {}
});
