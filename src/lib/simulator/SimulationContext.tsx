
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
  toggleSwitch: (componentId: string) => void;
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
  setRenderOptions: () => {},
  toggleSwitch: () => {}
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
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  
  // Set up the renderer when canvas is available
  useEffect(() => {
    if (!canvasRef.current) return;
    
    // Create the renderer instance
    const newRenderer = new CircuitRenderer(canvasRef.current);
    setRenderer(newRenderer);
    
    // Set up resize handler
    const handleResize = () => {
      if (canvasRef.current) {
        const container = canvasRef.current.parentElement;
        if (container) {
          canvasRef.current.width = container.clientWidth;
          canvasRef.current.height = container.clientHeight;
          
          // Force a re-render
          updateSimulationState();
        }
      }
    };
    
    // Initial sizing
    handleResize();
    
    // Add resize listener
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
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
  
  // Function to toggle switch component
  const toggleSwitch = (componentId: string) => {
    if (!engine || !simulationState) return;
    
    const component = simulationState.components.find(c => c.id === componentId);
    if (component && component.type === 'switch') {
      // Access the toggle method through the component's properties
      if (typeof component.properties.toggle === 'function') {
        component.properties.toggle();
        updateSimulationState();
      }
    }
  };
  
  // Function to toggle simulation running state
  const toggleSimulation = () => {
    if (!engine) return;
    
    if (isRunning) {
      engine.stop();
      setIsRunning(false);
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    } else {
      engine.start();
      setIsRunning(true);
      
      // Start rendering loop
      if (animationFrameRef.current === null) {
        animationFrameRef.current = requestAnimationFrame(renderLoop);
      }
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
    if (simulationState) {
      renderer.render(
        simulationState.components, 
        simulationState.nodes, 
        simulationState.wires
      );
    }
  };
  
  // Function to update the simulation state
  const updateSimulationState = () => {
    if (!engine) return;
    
    const newState = engine.getState();
    setSimulationState(newState);
    
    // Single render for non-running state
    if (renderer && !isRunning) {
      renderer.render(newState.components, newState.nodes, newState.wires);
    }
  };
  
  // The rendering loop
  const renderLoop = () => {
    if (!isRunning || !engine || !renderer) {
      animationFrameRef.current = null;
      return;
    }
    
    const state = engine.getState();
    renderer.render(state.components, state.nodes, state.wires);
    
    setSimulationState(state);
    
    animationFrameRef.current = requestAnimationFrame(renderLoop);
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
        setRenderOptions,
        toggleSwitch
      }}
    >
      {/* Canvas for rendering the circuit */}
      <canvas
        ref={canvasRef}
        className="circuit-canvas absolute inset-0 w-full h-full"
        style={{ zIndex: 0 }}
      />
      
      {children}
    </SimulationContext.Provider>
  );
};

export const useSimulation = () => useContext(SimulationContext);
