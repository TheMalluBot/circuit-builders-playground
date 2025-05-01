import { useReducer, useCallback, useEffect, useRef } from 'react';
import { Circuit, Component, Node, Wire, ComponentType } from '@/types/circuit';
import { createComponent } from '@/lib/components';
import { solveCircuit } from '@/lib/solver';

interface SimulationState {
  circuit: Circuit;
  isRunning: boolean;
}

type SimulationAction =
  | { type: 'ADD_COMPONENT'; componentType: ComponentType; x: number; y: number }
  | { type: 'CONNECT_NODES'; sourceId: string; targetId: string }
  | { type: 'TOGGLE_SWITCH'; componentId: string }
  | { type: 'MOVE_COMPONENT'; componentId: string; dx: number; dy: number }
  | { type: 'START_SIMULATION' }
  | { type: 'STOP_SIMULATION' }
  | { type: 'RESET_SIMULATION' }
  | { type: 'UPDATE_CIRCUIT'; circuit: Circuit };

const initialState: SimulationState = {
  circuit: {
    components: [],
    nodes: [],
    wires: []
  },
  isRunning: false
};

function simulationReducer(state: SimulationState, action: SimulationAction): SimulationState {
  switch (action.type) {
    case 'ADD_COMPONENT': {
      const newComponent = createComponent(
        action.componentType,
        `${action.componentType}_${Date.now()}`,
        { x: action.x, y: action.y }
      );
      
      // Create nodes for component pins
      const newNodes: Node[] = newComponent.pins.map(pin => ({
        id: `node_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
        voltage: 0,
        position: {
          x: newComponent.position.x + pin.position.x,
          y: newComponent.position.y + pin.position.y
        }
      }));
      
      // Connect pins to nodes
      const updatedComponent = {
        ...newComponent,
        pins: newComponent.pins.map((pin, index) => ({
          ...pin,
          nodeId: newNodes[index].id
        }))
      };
      
      return {
        ...state,
        circuit: {
          ...state.circuit,
          components: [...state.circuit.components, updatedComponent],
          nodes: [...state.circuit.nodes, ...newNodes]
        }
      };
    }
    
    case 'CONNECT_NODES': {
      // Find the nodes
      const sourceNode = state.circuit.nodes.find(n => n.id === action.sourceId);
      const targetNode = state.circuit.nodes.find(n => n.id === action.targetId);
      
      if (!sourceNode || !targetNode) return state;
      
      // Create new wire
      const newWire: Wire = {
        id: `wire_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
        nodeIds: [action.sourceId, action.targetId],
        current: 0
      };
      
      return {
        ...state,
        circuit: {
          ...state.circuit,
          wires: [...state.circuit.wires, newWire]
        }
      };
    }
    
    case 'TOGGLE_SWITCH': {
      // Find the switch component
      const updatedComponents = state.circuit.components.map(component => {
        if (component.id === action.componentId && component.type === 'switch') {
          return {
            ...component,
            properties: {
              ...component.properties,
              closed: !component.properties.closed
            }
          };
        }
        return component;
      });
      
      return {
        ...state,
        circuit: {
          ...state.circuit,
          components: updatedComponents
        }
      };
    }
    
    case 'MOVE_COMPONENT': {
      // Update component position
      const updatedComponents = state.circuit.components.map(component => {
        if (component.id === action.componentId) {
          // Calculate new position
          const newPosition = {
            x: component.position.x + action.dx,
            y: component.position.y + action.dy
          };
          
          // Update component and its pins
          return {
            ...component,
            position: newPosition
          };
        }
        return component;
      });
      
      // Also update associated node positions
      const movedComponent = state.circuit.components.find(c => c.id === action.componentId);
      if (!movedComponent) return state;
      
      const updatedNodes = state.circuit.nodes.map(node => {
        // Check if node is connected to moved component
        const connectedPin = movedComponent.pins.find(pin => pin.nodeId === node.id);
        if (connectedPin) {
          return {
            ...node,
            position: {
              x: movedComponent.position.x + action.dx + connectedPin.position.x,
              y: movedComponent.position.y + action.dy + connectedPin.position.y
            }
          };
        }
        return node;
      });
      
      return {
        ...state,
        circuit: {
          ...state.circuit,
          components: updatedComponents,
          nodes: updatedNodes
        }
      };
    }
    
    case 'START_SIMULATION':
      return { ...state, isRunning: true };
      
    case 'STOP_SIMULATION':
      return { ...state, isRunning: false };
      
    case 'RESET_SIMULATION': {
      // Reset voltages and currents, but keep circuit structure
      const resetNodes = state.circuit.nodes.map(node => ({
        ...node,
        voltage: 0
      }));
      
      const resetWires = state.circuit.wires.map(wire => ({
        ...wire,
        current: 0
      }));
      
      const resetComponents = state.circuit.components.map(component => ({
        ...component,
        properties: {
          ...component.properties,
          current: 0,
          brightness: 0
        }
      }));
      
      return {
        ...state,
        isRunning: false,
        circuit: {
          ...state.circuit,
          nodes: resetNodes,
          wires: resetWires,
          components: resetComponents
        }
      };
    }
    
    case 'UPDATE_CIRCUIT':
      return {
        ...state,
        circuit: action.circuit
      };
      
    default:
      return state;
  }
}

export function useSimulation() {
  const [state, dispatch] = useReducer(simulationReducer, initialState);
  const animationRef = useRef<number>();
  
  // Simulation loop
  useEffect(() => {
    if (!state.isRunning) {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      return;
    }
    
    const simulationStep = () => {
      const updatedCircuit = solveCircuit(state.circuit);
      dispatch({ type: 'UPDATE_CIRCUIT', circuit: updatedCircuit });
      animationRef.current = requestAnimationFrame(simulationStep);
    };
    
    animationRef.current = requestAnimationFrame(simulationStep);
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [state.isRunning, state.circuit]);
  
  // Exposed actions
  const addComponent = useCallback((type: ComponentType, x: number, y: number) => {
    dispatch({ type: 'ADD_COMPONENT', componentType: type, x, y });
  }, []);
  
  const connectNodes = useCallback((sourceId: string, targetId: string) => {
    dispatch({ type: 'CONNECT_NODES', sourceId, targetId });
  }, []);
  
  const toggleSwitch = useCallback((componentId: string) => {
    dispatch({ type: 'TOGGLE_SWITCH', componentId });
  }, []);
  
  const moveComponent = useCallback((componentId: string, dx: number, dy: number) => {
    dispatch({ type: 'MOVE_COMPONENT', componentId, dx, dy });
  }, []);
  
  const startSimulation = useCallback(() => {
    dispatch({ type: 'START_SIMULATION' });
  }, []);
  
  const stopSimulation = useCallback(() => {
    dispatch({ type: 'STOP_SIMULATION' });
  }, []);
  
  const resetSimulation = useCallback(() => {
    dispatch({ type: 'RESET_SIMULATION' });
  }, []);
  
  return {
    circuit: state.circuit,
    isRunning: state.isRunning,
    addComponent,
    connectNodes,
    toggleSwitch,
    moveComponent,
    startSimulation,
    stopSimulation,
    resetSimulation
  };
}
