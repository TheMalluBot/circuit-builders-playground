import { useReducer, useCallback, useEffect, useRef } from 'react';
import { Circuit, Component, Node, Wire, ComponentType, CircuitItemType } from '@/types/circuit';
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
  | { type: 'ROTATE_COMPONENT'; componentId: string; angle: number }
  | { type: 'DELETE_ITEM'; itemType: CircuitItemType; itemId: string }
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
        current: 0,
        // Add path for wire routing visualization
        path: [
          { x: sourceNode.position.x, y: sourceNode.position.y },
          { x: (sourceNode.position.x + targetNode.position.x) / 2, y: sourceNode.position.y },
          { x: (sourceNode.position.x + targetNode.position.x) / 2, y: targetNode.position.y },
          { x: targetNode.position.x, y: targetNode.position.y }
        ]
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
          
          // Update component position
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
              x: node.position.x + action.dx,
              y: node.position.y + action.dy
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
    
    case 'ROTATE_COMPONENT': {
      // Find the component to rotate
      const componentToRotate = state.circuit.components.find(c => c.id === action.componentId);
      if (!componentToRotate) return state;
      
      // Calculate new rotation angle
      const newRotation = (componentToRotate.rotation + action.angle) % 360;
      
      // Update component rotation
      const updatedComponents = state.circuit.components.map(component => {
        if (component.id === action.componentId) {
          return {
            ...component,
            rotation: newRotation
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
    
    case 'DELETE_ITEM': {
      switch (action.itemType) {
        case 'component': {
          // Get the component to delete
          const componentToDelete = state.circuit.components.find(c => c.id === action.itemId);
          if (!componentToDelete) return state;
          
          // Get node IDs connected to this component's pins
          const nodeIds = componentToDelete.pins
            .map(pin => pin.nodeId)
            .filter(nodeId => nodeId !== null) as string[];
          
          // Remove component
          const updatedComponents = state.circuit.components.filter(c => c.id !== action.itemId);
          
          // Remove associated nodes
          const updatedNodes = state.circuit.nodes.filter(n => !nodeIds.includes(n.id));
          
          // Remove wires connected to those nodes
          const updatedWires = state.circuit.wires.filter(w => 
            !nodeIds.includes(w.nodeIds[0]) && !nodeIds.includes(w.nodeIds[1])
          );
          
          return {
            ...state,
            circuit: {
              components: updatedComponents,
              nodes: updatedNodes,
              wires: updatedWires
            }
          };
        }
        
        case 'wire': {
          // Remove the wire
          const updatedWires = state.circuit.wires.filter(w => w.id !== action.itemId);
          
          return {
            ...state,
            circuit: {
              ...state.circuit,
              wires: updatedWires
            }
          };
        }
        
        case 'node': {
          // Remove the node
          const updatedNodes = state.circuit.nodes.filter(n => n.id !== action.itemId);
          
          // Remove wires connected to this node
          const updatedWires = state.circuit.wires.filter(w => 
            w.nodeIds[0] !== action.itemId && w.nodeIds[1] !== action.itemId
          );
          
          return {
            ...state,
            circuit: {
              ...state.circuit,
              nodes: updatedNodes,
              wires: updatedWires
            }
          };
        }
        
        default:
          return state;
      }
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
  const addComponent = useCallback((type: ComponentType, position: { x: number, y: number }) => {
    const componentId = `${type}_${Date.now()}`;
    dispatch({ type: 'ADD_COMPONENT', componentType: type, x: position.x, y: position.y });
    return componentId;
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
  
  const rotateComponent = useCallback((componentId: string, angle: number) => {
    dispatch({ type: 'ROTATE_COMPONENT', componentId, angle });
  }, []);
  
  const deleteItem = useCallback((itemType: CircuitItemType, itemId: string) => {
    dispatch({ type: 'DELETE_ITEM', itemType, itemId });
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
    rotateComponent,
    deleteItem,
    startSimulation,
    stopSimulation,
    resetSimulation
  };
}
