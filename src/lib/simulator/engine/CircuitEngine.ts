
import { Component, Node as CircuitNode, Wire, Connection, Pin, MatrixContribution, SimulationState } from '../types';
import { CircuitSolver } from './CircuitSolver';
import { CircuitBuilder } from './CircuitBuilder';
import { WireManager } from './WireManager';
import { NodeManager } from './NodeManager';

export class CircuitEngine {
  private components: Component[] = [];
  private nodes: Map<string, CircuitNode> = new Map();
  private wires: Wire[] = [];
  private time: number = 0;
  private running: boolean = false;
  private lastUpdateTime: number = 0;
  private simulationSpeed: number = 1.0;
  private changeListeners: Function[] = [];
  private listeners: Function[] = [];
  
  // Utility managers
  private solver: CircuitSolver;
  private builder: CircuitBuilder;
  private wireManager: WireManager;
  private nodeManager: NodeManager;
  
  constructor() {
    this.lastUpdateTime = performance.now();
    this.solver = new CircuitSolver();
    this.builder = new CircuitBuilder();
    this.wireManager = new WireManager();
    this.nodeManager = new NodeManager();
  }
  
  addComponent(component: Component): void {
    this.components.push(component);
    this.rebuildCircuit();
    this.notifyChangeListeners();
  }
  
  removeComponent(componentId: string): void {
    const component = this.components.find(c => c.id === componentId);
    if (!component) return;
    
    // Disconnect all pins from nodes
    for (const pin of component.pins) {
      if (pin.nodeId) {
        this.disconnectPin(pin);
      }
    }
    
    this.components = this.components.filter(c => c.id !== componentId);
    this.rebuildCircuit();
    this.notifyChangeListeners();
  }
  
  connectPins(pin1: Pin, pin2: Pin): void {
    // Don't connect if already connected to same node
    if (pin1.nodeId && pin2.nodeId && pin1.nodeId === pin2.nodeId) return;
    
    // If both pins are connected to nodes, merge the nodes
    if (pin1.nodeId && pin2.nodeId) {
      this.mergeNodes(pin1.nodeId, pin2.nodeId);
    } 
    // If one pin is connected, connect the other to same node
    else if (pin1.nodeId) {
      this.connectPinToNode(pin2, pin1.nodeId);
    }
    else if (pin2.nodeId) {
      this.connectPinToNode(pin1, pin2.nodeId);
    }
    // If neither is connected, create a new node
    else {
      const nodeId = `node_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      this.nodes.set(nodeId, { 
        id: nodeId, 
        voltage: 0, 
        connections: [] 
      });
      
      this.connectPinToNode(pin1, nodeId);
      this.connectPinToNode(pin2, nodeId);
    }
    
    this.rebuildCircuit();
    this.notifyListeners();
  }
  
  disconnectPin(pin: Pin): void {
    if (!pin.nodeId) return;
    
    const node = this.nodes.get(pin.nodeId);
    if (!node) return;
    
    // Remove connection from node
    node.connections = node.connections.filter(
      conn => !(conn.componentId === pin.componentId && conn.pinId === pin.id)
    );
    
    // Update pin
    pin.nodeId = null;
    
    // Clean up empty nodes
    if (node.connections.length === 0) {
      this.nodes.delete(node.id);
    } else if (node.connections.length === 1) {
      // If only one connection remains, check if we need to reconsider the topology
      this.rebuildCircuit();
    }
    
    this.notifyChangeListeners();
  }
  
  start(): void {
    if (this.running) return;
    this.running = true;
    this.lastUpdateTime = performance.now();
    requestAnimationFrame(this.simulationLoop.bind(this));
  }
  
  stop(): void {
    this.running = false;
  }
  
  reset(): void {
    // Reset component states
    for (const component of this.components) {
      if (component.properties.hasOwnProperty('reset')) {
        component.properties.reset();
      }
    }
    
    // Reset node voltages
    for (const [_, node] of this.nodes) {
      node.voltage = 0;
    }
    
    // Reset wire currents
    for (const wire of this.wires) {
      wire.current = 0;
    }
    
    this.time = 0;
    this.notifyChangeListeners();
  }
  
  setSimulationSpeed(speed: number): void {
    this.simulationSpeed = Math.max(0.1, Math.min(10, speed));
  }
  
  addChangeListener(listener: Function): void {
    if (!this.changeListeners.includes(listener)) {
      this.changeListeners.push(listener);
    }
  }
  
  removeChangeListener(listener: Function): void {
    this.changeListeners = this.changeListeners.filter(l => l !== listener);
  }
  
  addListener(listener: Function): void {
    if (!this.listeners.includes(listener)) {
      this.listeners.push(listener);
    }
  }
  
  removeListener(listener: Function): void {
    this.listeners = this.listeners.filter(l => l !== listener);
  }
  
  notifyListeners(): void {
    this.listeners.forEach(listener => listener());
  }
  
  private notifyChangeListeners(): void {
    for (const listener of this.changeListeners) {
      listener(this.getState());
    }
  }
  
  getNode(nodeId: string): CircuitNode | undefined {
    return this.nodes.get(nodeId);
  }

  private simulationLoop(timestamp: number): void {
    if (!this.running) return;
    
    // Calculate time step
    const deltaTime = Math.min((timestamp - this.lastUpdateTime) / 1000, 0.1);
    this.lastUpdateTime = timestamp;
    
    // Apply simulation speed factor
    const adjustedTimeStep = deltaTime * this.simulationSpeed;
    
    // Limit time step to avoid instability with large steps
    const timeStep = Math.min(adjustedTimeStep, 0.02 * this.simulationSpeed);
    
    // Solve circuit
    this.step(timeStep);
    
    // Update wire currents
    this.updateWireCurrents();
    
    // Notify listeners
    this.notifyChangeListeners();
    
    // Schedule next frame
    requestAnimationFrame(this.simulationLoop.bind(this));
  }
  
  solveCircuit(): void {
    // Build circuit equations
    const { conductanceMatrix, currentVector, nodeMap } = this.buildCircuitMatrix(0.01); // Use small default timestep
    
    if (conductanceMatrix.length === 0) return;
    
    // Solve for node voltages
    const voltages = this.solver.solveMatrix(conductanceMatrix, currentVector);
    
    // Update node voltages
    Object.entries(nodeMap).forEach(([nodeId, index]) => {
      const node = this.nodes.get(nodeId);
      if (node) {
        node.voltage = voltages[index];
      }
    });
    
    // Update component states
    this.updateComponentStates(0.01); // Use small default timestep
  }
  
  private updateComponentStates(timeStep: number): void {
    for (const component of this.components) {
      // Map node voltages to array for component
      const componentVoltages: number[] = component.pins.map(pin => {
        if (pin.nodeId) {
          const node = this.nodes.get(pin.nodeId);
          return node ? node.voltage : 0;
        }
        return 0;
      });
      
      component.updateState(componentVoltages, timeStep);
    }
  }
  
  private step(timeStep: number): void {
    // Build circuit matrices
    const { conductanceMatrix, currentVector, nodeMap } = this.buildCircuitMatrix(timeStep);
    
    if (conductanceMatrix.length === 0) return; // No circuit to solve
    
    // Solve system of equations
    const voltages = this.solver.solveMatrix(conductanceMatrix, currentVector);
    
    // Update node voltages
    for (const [nodeId, index] of Object.entries(nodeMap)) {
      const node = this.nodes.get(nodeId);
      if (node) {
        node.voltage = voltages[index];
      }
    }
    
    // Update component states
    this.updateComponentStates(timeStep);
    
    this.time += timeStep;
  }
  
  private buildCircuitMatrix(timeStep: number = 0): MatrixContribution {
    return this.builder.buildMatrix(this.components, this.nodes, timeStep);
  }
  
  private updateWireCurrents(): void {
    this.wireManager.updateWireCurrents(this.wires, this.components);
  }
  
  private connectPinToNode(pin: Pin, nodeId: string): void {
    this.nodeManager.connectPinToNode(pin, nodeId, this.nodes, () => {
      this.disconnectPin(pin);
    });
  }
  
  private mergeNodes(nodeId1: string, nodeId2: string): void {
    this.nodeManager.mergeNodes(nodeId1, nodeId2, this.nodes, this.components, this.wires);
  }
  
  private rebuildCircuit(): void {
    // Rebuild nodes and connections if needed
    this.validateCircuitTopology();
    
    // Rebuild wires based on node connections
    this.rebuildWires();
  }
  
  private validateCircuitTopology(): void {
    // Check for disconnected pins and orphaned nodes
    // This is a placeholder for future topology validation
  }
  
  private rebuildWires(): void {
    this.wires = this.wireManager.rebuildWires(this.nodes);
  }
  
  // Public methods to get circuit state
  getComponents(): Component[] {
    return [...this.components];
  }
  
  getNodes(): CircuitNode[] {
    return Array.from(this.nodes.values());
  }
  
  getWires(): Wire[] {
    return [...this.wires];
  }
  
  getTime(): number {
    return this.time;
  }
  
  isRunning(): boolean {
    return this.running;
  }
  
  getState(): SimulationState {
    return {
      components: this.getComponents(),
      nodes: this.getNodes(),
      wires: this.getWires(),
      time: this.time,
      running: this.running
    };
  }
}
