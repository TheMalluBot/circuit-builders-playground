
import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { CircuitEngine } from './CircuitEngine';
import { ComponentFactory } from './ComponentFactory';
import { CircuitRenderer, RenderOptions } from './CircuitRenderer';
import { Component, SimulationState } from './types';

interface SimulationContextType {
  engine: CircuitEngine | null;
  renderer: CircuitRenderer | null;
  simulationState: SimulationState | null;
  isRunning: boolean;
  addComponent: (type: string, position: { x: number; y: number }, properties?: Record<string, any>) => void;
  removeComponent: (componentId: string) => void;
  toggleSimulation: () => void;
  resetSimulation: () => void;
  setRenderOptions: (options: Partial<RenderOptions>) => void;
}

const SimulationContext = createContext<SimulationContextType>({
  engine: null,
  renderer: null,
  simulationState: null,
  isRunning: false,
  addComponent: () => {},
  removeComponent: () => {},
  toggleSimulation: () => {},
  resetSimulation: () => {},
  setRenderOptions: () => {}
});

interface SimulationProviderProps {
  children: React.ReactNode;
  initialState?: SimulationState;
}

export const SimulationProvider: React.FC<SimulationProviderProps> = ({ children, initialState }) => {
  const [engine] = useState(() => new CircuitEngine());
  const [renderer, setRenderer] = useState<CircuitRenderer | null>(null);
  const [simulationState, setSimulationState] = useState<SimulationState | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  
  // Function to add a component to the circuit
  const addComponent = (type: string, position: { x: number; y: number }, properties: Record<string, any> = {}) => {
    if (!engine) return;
    
    const id = `comp_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const component = ComponentFactory.createComponent(type, id, position, properties);
    
    if (component) {
      engine.addComponent(component);
      updateSimulationState();
    }
  };
  
  // Function to remove a component from the circuit
  const removeComponent = (componentId: string) => {
    if (!engine) return;
    
    engine.removeComponent(componentId);
    updateSimulationState();
  };
  
  // Function to toggle simulation running state
  const toggleSimulation = () => {
    if (!engine) return;
    
    if (isRunning) {
      engine.stop();
      setIsRunning(false);
    } else {
      engine.start();
      setIsRunning(true);
      
      // Start rendering loop
      requestAnimationFrame(renderLoop);
    }
  };
  
  // Function to reset the simulation
  const resetSimulation = () => {
    if (!engine) return;
    
    engine.reset();
    updateSimulationState();
  };
  
  // Function to set render options
  const setRenderOptions = (options: Partial<RenderOptions>) => {
    if (!renderer) return;
    
    renderer.setOptions(options);
    // Trigger a render
    updateSimulationState();
  };
  
  // Function to update the simulation state
  const updateSimulationState = () => {
    if (!engine) return;
    
    setSimulationState(engine.getState());
  };
  
  // Set up the renderer when canvas is available
  useEffect(() => {
    if (!canvasRef.current) return;
    
    const newRenderer = new CircuitRenderer(canvasRef.current);
    setRenderer(newRenderer);
    
    return () => {
      // Clean up renderer if needed
    };
  }, [canvasRef.current]);
  
  // Set up initial state if provided
  useEffect(() => {
    if (!engine || !initialState) return;
    
    // Add initial components
    initialState.components.forEach(component => {
      engine.addComponent(component);
    });
    
    updateSimulationState();
  }, [engine, initialState]);
  
  // The rendering loop
  const renderLoop = () => {
    if (!isRunning || !engine || !renderer) return;
    
    const state = engine.getState();
    renderer.render(state.components, state.nodes, state.wires);
    
    setSimulationState(state);
    
    requestAnimationFrame(renderLoop);
  };
  
  return (
    <SimulationContext.Provider
      value={{
        engine,
        renderer,
        simulationState,
        isRunning,
        addComponent,
        removeComponent,
        toggleSimulation,
        resetSimulation,
        setRenderOptions
      }}
    >
      {/* Canvas for rendering the circuit */}
      <canvas
        ref={canvasRef}
        className="circuit-canvas"
        width={800}
        height={600}
        style={{ display: 'block', width: '100%', height: '100%' }}
      />
      
      {children}
    </SimulationContext.Provider>
  );
};

export const useSimulation = () => useContext(SimulationContext);
