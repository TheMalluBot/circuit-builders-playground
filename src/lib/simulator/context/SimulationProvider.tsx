
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { SimulationContext } from './SimulationContext';
import { CircuitEngine } from '../engine';
import { CircuitRenderer } from '../render/CircuitRenderer';
import { RenderOptions } from '../types';
import { Component, SimulationState } from '../types';
import { useComponentManagement } from './hooks/useComponentManagement';
import { useWireManagement } from './hooks/useWireManagement';
import { useSimulationControl } from './hooks/useSimulationControl';

interface SimulationProviderProps {
  children: React.ReactNode;
  initialState?: SimulationState;
}

export const SimulationProvider: React.FC<SimulationProviderProps> = ({ children, initialState }) => {
  const [engine] = useState(() => new CircuitEngine());
  const [renderer, setRenderer] = useState<CircuitRenderer | null>(null);
  const [simulationState, setSimulationState] = useState<SimulationState | null>(null);
  
  // Create updateSimulationState callback
  const updateSimulationState = useCallback(() => {
    if (!engine) return;
    
    const newState = engine.getState();
    setSimulationState(newState);
    
    if (renderer && !simulationControl.isRunning) {
      renderer.render(newState.components, newState.nodes, newState.wires);
    }
  }, [engine, renderer]);
  
  // Initialize the hooks
  const componentManagement = useComponentManagement(engine, updateSimulationState);
  const wireManagement = useWireManagement(engine, simulationState, setSimulationState);
  const simulationControl = useSimulationControl(engine, renderer, updateSimulationState);
  
  // Setup canvas and renderer
  useEffect(() => {
    const canvas = document.querySelector('canvas.circuit-canvas');
    if (!canvas || renderer) return;
    
    const newRenderer = new CircuitRenderer(canvas as HTMLCanvasElement);
    setRenderer(newRenderer);
    
    const handleResize = () => {
      if (canvas) {
        const container = canvas.parentElement;
        if (container) {
          (canvas as HTMLCanvasElement).width = container.clientWidth;
          (canvas as HTMLCanvasElement).height = container.clientHeight;
          
          updateSimulationState();
        }
      }
    };
    
    handleResize();
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      if (simulationControl.animationFrameRef.current !== null) {
        cancelAnimationFrame(simulationControl.animationFrameRef.current);
      }
    };
  }, []);
  
  // Initialize engine with initial state
  useEffect(() => {
    if (!engine || !initialState) return;
    
    initialState.components.forEach(component => {
      engine.addComponent(component);
    });
    
    updateSimulationState();
  }, [engine, initialState, updateSimulationState]);
  
  // Update simulation speed when it changes
  useEffect(() => {
    if (engine) {
      engine.setSimulationSpeed(simulationControl.simulationSpeed);
    }
  }, [engine, simulationControl.simulationSpeed]);
  
  // Create the context value by combining all hook returns
  const contextValue = {
    engine,
    renderer,
    simulationState,
    isRunning: simulationControl.isRunning,
    simulationSpeed: simulationControl.simulationSpeed,
    selectedComponent: componentManagement.selectedComponent,
    addComponent: componentManagement.addComponent,
    removeComponent: componentManagement.removeComponent,
    selectComponent: componentManagement.selectComponent,
    deleteSelectedComponent: componentManagement.deleteSelectedComponent,
    rotateSelectedComponent: componentManagement.rotateSelectedComponent,
    moveComponent: componentManagement.moveComponent,
    updateComponentProperty: componentManagement.updateComponentProperty,
    createWire: wireManagement.createWire,
    deleteWire: wireManagement.deleteWire,
    toggleSimulation: simulationControl.toggleSimulation,
    resetSimulation: simulationControl.resetSimulation,
    setRenderOptions: simulationControl.setRenderOptions,
    toggleSwitch: componentManagement.toggleSwitch,
    setSimulationSpeed: simulationControl.setSimulationSpeed
  };
  
  return (
    <SimulationContext.Provider value={contextValue}>
      {children}
    </SimulationContext.Provider>
  );
};
