
import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { CircuitEngine } from './CircuitEngine';
import { ComponentFactory } from './ComponentFactory';
import { CircuitRenderer, RenderOptions } from './CircuitRenderer';
import { Component, SimulationState, Node, Wire } from './types';

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

const SimulationContext = createContext<SimulationContextType>({
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

interface SimulationProviderProps {
  children: React.ReactNode;
  initialState?: SimulationState;
}

export const SimulationProvider: React.FC<SimulationProviderProps> = ({ children, initialState }) => {
  const [engine] = useState(() => new CircuitEngine());
  const [renderer, setRenderer] = useState<CircuitRenderer | null>(null);
  const [simulationState, setSimulationState] = useState<SimulationState | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [simulationSpeed, setSimulationSpeed] = useState(1);
  const [selectedComponent, setSelectedComponent] = useState<Component | null>(null);
  const [wireStartNode, setWireStartNode] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Function to handle selection of components
  const selectComponent = (componentId: string | null) => {
    if (!simulationState) return;
    
    if (componentId === null) {
      setSelectedComponent(null);
      return;
    }
    
    const component = simulationState.components.find(c => c.id === componentId);
    if (component) {
      setSelectedComponent(component);
    }
  };
  
  // Delete the currently selected component
  const deleteSelectedComponent = () => {
    if (selectedComponent) {
      removeComponent(selectedComponent.id);
      setSelectedComponent(null);
    }
  };
  
  // Rotate the currently selected component
  const rotateSelectedComponent = () => {
    if (!selectedComponent || !engine) return;
    
    const rotationAmount = 90; // Rotate by 90 degrees
    const newRotation = (selectedComponent.rotation + rotationAmount) % 360;
    
    // Find the component in the engine and update its rotation
    const component = engine.getComponents().find(c => c.id === selectedComponent.id);
    if (component) {
      component.rotation = newRotation;
      updateSimulationState();
      
      // Update the selected component state
      setSelectedComponent({...selectedComponent, rotation: newRotation});
    }
  };
  
  // Move component to a new position
  const moveComponent = (componentId: string, position: { x: number; y: number }) => {
    if (!engine) return;
    
    const component = engine.getComponents().find(c => c.id === componentId);
    if (component) {
      component.position = {...position};
      updateSimulationState();
      
      // Update selected component if it's the one being moved
      if (selectedComponent && selectedComponent.id === componentId) {
        setSelectedComponent({...selectedComponent, position: {...position}});
      }
    }
  };
  
  // Update a property of a component
  const updateComponentProperty = (componentId: string, property: string, value: any) => {
    if (!engine) return;
    
    const component = engine.getComponents().find(c => c.id === componentId);
    if (component) {
      component.properties[property] = value;
      
      // Special case for switch toggle
      if (component.type === 'switch' && property === 'closed') {
        if (typeof component.properties.toggle === 'function') {
          component.properties.toggle();
        }
      }
      
      updateSimulationState();
      
      // Update selected component if it's the one being modified
      if (selectedComponent && selectedComponent.id === componentId) {
        setSelectedComponent({
          ...selectedComponent, 
          properties: {...selectedComponent.properties, [property]: value}
        });
      }
    }
  };
  
  // Create a wire between two nodes
  const createWire = (startNodeId: string, endNodeId: string) => {
    if (!engine) return;
    
    // For this implementation, we'll create a simple wire between nodes
    const wireId = `wire_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    
    // In a real implementation, we'd need to check if the nodes are compatible
    // and handle the connection logic correctly
    
    // For now, we'll just add a new wire to the state
    if (simulationState) {
      const newWires = [
        ...simulationState.wires,
        {
          id: wireId,
          nodes: [startNodeId, endNodeId],
          current: 0
        }
      ];
      
      setSimulationState({
        ...simulationState,
        wires: newWires
      });
    }
  };
  
  // Delete a wire
  const deleteWire = (wireId: string) => {
    if (!engine || !simulationState) return;
    
    const newWires = simulationState.wires.filter(w => w.id !== wireId);
    
    setSimulationState({
      ...simulationState,
      wires: newWires
    });
  };
  
  // Set up the renderer when canvas is available
  useEffect(() => {
    const canvas = document.querySelector('canvas.circuit-canvas');
    if (!canvas || renderer) return;
    
    // Create the renderer instance
    const newRenderer = new CircuitRenderer(canvas as HTMLCanvasElement);
    setRenderer(newRenderer);
    
    // Set up resize handler
    const handleResize = () => {
      if (canvas) {
        const container = canvas.parentElement;
        if (container) {
          (canvas as HTMLCanvasElement).width = container.clientWidth;
          (canvas as HTMLCanvasElement).height = container.clientHeight;
          
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
  }, []);
  
  // Set up initial state if provided
  useEffect(() => {
    if (!engine || !initialState) return;
    
    // Add initial components
    initialState.components.forEach(component => {
      engine.addComponent(component);
    });
    
    updateSimulationState();
  }, [engine, initialState]);
  
  // Update simulation speed when it changes
  useEffect(() => {
    if (engine) {
      engine.setSimulationSpeed(simulationSpeed);
    }
  }, [engine, simulationSpeed]);
  
  // Function to add a component to the circuit
  const addComponent = (type: string, position: { x: number; y: number }, properties: Record<string, any> = {}) => {
    if (!engine) return;
    
    const id = `comp_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const component = ComponentFactory.createComponent(type, id, position, properties);
    
    if (component) {
      engine.addComponent(component);
      updateSimulationState();
      
      // Auto-select the newly added component
      setSelectedComponent(component);
    }
  };
  
  // Function to remove a component from the circuit
  const removeComponent = (componentId: string) => {
    if (!engine) return;
    
    engine.removeComponent(componentId);
    updateSimulationState();
    
    // Deselect if the removed component was selected
    if (selectedComponent && selectedComponent.id === componentId) {
      setSelectedComponent(null);
    }
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
        
        // Update selected component if it's the one being toggled
        if (selectedComponent && selectedComponent.id === componentId) {
          setSelectedComponent({
            ...selectedComponent, 
            properties: {...selectedComponent.properties, closed: !selectedComponent.properties.closed}
          });
        }
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
        simulationSpeed,
        selectedComponent,
        addComponent,
        removeComponent,
        selectComponent,
        deleteSelectedComponent,
        rotateSelectedComponent,
        moveComponent,
        updateComponentProperty,
        createWire,
        deleteWire,
        toggleSimulation,
        resetSimulation,
        setRenderOptions,
        toggleSwitch,
        setSimulationSpeed
      }}
    >
      {children}
    </SimulationContext.Provider>
  );
};

export const useSimulation = () => useContext(SimulationContext);
