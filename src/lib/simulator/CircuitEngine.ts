import { Component, Node, Wire, Connection, Pin, MatrixContribution, SimulationState } from './types';

export class CircuitEngine {
  private components: Component[] = [];
  private nodes: Map<string, Node> = new Map();
  private wires: Wire[] = [];
  private time: number = 0;
  private running: boolean = false;
  private lastUpdateTime: number = 0;
  
  constructor() {
    this.lastUpdateTime = performance.now();
  }
  
  addComponent(component: Component): void {
    this.components.push(component);
    this.rebuildCircuit();
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
  }
  
  connectPins(pin1: Pin, pin2: Pin): void {
    // If either pin is already connected to a node
    const node1 = pin1.nodeId ? this.nodes.get(pin1.nodeId) : null;
    const node2 = pin2.nodeId ? this.nodes.get(pin2.nodeId) : null;
    
    if (node1 && node2) {
      // Merge nodes
      this.mergeNodes(node1.id, node2.id);
    } else if (node1) {
      // Connect pin2 to node1
      this.connectPinToNode(pin2, node1.id);
    } else if (node2) {
      // Connect pin1 to node2
      this.connectPinToNode(pin1, node2.id);
    } else {
      // Create new node and connect both pins
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
  }
  
  private simulationLoop(timestamp: number): void {
    if (!this.running) return;
    
    const deltaTime = (timestamp - this.lastUpdateTime) / 1000; // Convert to seconds
    this.lastUpdateTime = timestamp;
    
    // Limit time step to avoid instability with large steps
    const timeStep = Math.min(deltaTime, 0.02); // Maximum 20ms step
    
    // Perform simulation step
    this.step(timeStep);
    
    // Update wires with current values
    this.updateWireCurrents();
    
    // Schedule next frame
    requestAnimationFrame(this.simulationLoop.bind(this));
  }
  
  private step(timeStep: number): void {
    // Build circuit matrices
    const { conductanceMatrix, currentVector, nodeMap } = this.buildCircuitMatrix(timeStep);
    
    if (conductanceMatrix.length === 0) return; // No circuit to solve
    
    // Solve system of equations
    const voltages = this.solveCircuit(conductanceMatrix, currentVector);
    
    // Update node voltages
    for (const [nodeId, index] of Object.entries(nodeMap)) {
      const node = this.nodes.get(nodeId);
      if (node) {
        node.voltage = voltages[index];
      }
    }
    
    // Update component states
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
    
    this.time += timeStep;
  }
  
  private buildCircuitMatrix(timeStep: number): MatrixContribution {
    // Create node mapping (excluding ground node)
    const nodeIds = Array.from(this.nodes.keys());
    if (nodeIds.length === 0) {
      return { conductanceMatrix: [], currentVector: [], nodeMap: {} };
    }
    
    // Choose a ground node (reference)
    const groundNodeId = nodeIds[0];
    const matrixSize = nodeIds.length - 1;
    
    // Create node mapping excluding ground node
    const nodeMap: Record<string, number> = {};
    let idx = 0;
    for (const nodeId of nodeIds) {
      if (nodeId !== groundNodeId) {
        nodeMap[nodeId] = idx++;
      }
    }
    
    // Initialize matrices
    const conductanceMatrix = Array(matrixSize).fill(0).map(() => Array(matrixSize).fill(0));
    const currentVector = Array(matrixSize).fill(0);
    
    // Get contributions from each component
    for (const component of this.components) {
      const contribution = component.getMatrixContribution(timeStep);
      
      // Apply contribution to our matrices
      for (const [sourceNodeId, sourceIdx] of Object.entries(contribution.nodeMap)) {
        // Skip ground node
        if (sourceNodeId === groundNodeId) continue;
        
        const i = nodeMap[sourceNodeId];
        
        // Add current contributions
        currentVector[i] += contribution.currentVector[sourceIdx];
        
        for (const [targetNodeId, targetIdx] of Object.entries(contribution.nodeMap)) {
          // Skip ground node
          if (targetNodeId === groundNodeId) continue;
          
          const j = nodeMap[targetNodeId];
          conductanceMatrix[i][j] += contribution.conductanceMatrix[sourceIdx][targetIdx];
        }
      }
    }
    
    return { conductanceMatrix, currentVector, nodeMap };
  }
  
  private solveCircuit(conductanceMatrix: number[][], currentVector: number[]): number[] {
    // For small matrices, use direct Gaussian elimination
    return this.gaussianElimination(conductanceMatrix, currentVector);
  }
  
  private gaussianElimination(A: number[][], b: number[]): number[] {
    const n = A.length;
    if (n === 0) return [];
    
    // Create augmented matrix
    const augMatrix = A.map((row, i) => [...row, b[i]]);
    
    // Gaussian elimination
    for (let i = 0; i < n; i++) {
      // Find pivot
      let maxRow = i;
      for (let j = i + 1; j < n; j++) {
        if (Math.abs(augMatrix[j][i]) > Math.abs(augMatrix[maxRow][i])) {
          maxRow = j;
        }
      }
      
      // Swap rows
      if (maxRow !== i) {
        [augMatrix[i], augMatrix[maxRow]] = [augMatrix[maxRow], augMatrix[i]];
      }
      
      // Check for singular matrix
      if (Math.abs(augMatrix[i][i]) < 1e-10) {
        // Handle singular matrix (add small conductance to diagonal)
        augMatrix[i][i] += 1e-9;
      }
      
      // Eliminate below
      for (let j = i + 1; j < n; j++) {
        const factor = augMatrix[j][i] / augMatrix[i][i];
        for (let k = i; k <= n; k++) {
          augMatrix[j][k] -= factor * augMatrix[i][k];
        }
      }
    }
    
    // Back substitution
    const x = new Array(n).fill(0);
    for (let i = n - 1; i >= 0; i--) {
      let sum = 0;
      for (let j = i + 1; j < n; j++) {
        sum += augMatrix[i][j] * x[j];
      }
      x[i] = (augMatrix[i][n] - sum) / augMatrix[i][i];
    }
    
    return x;
  }
  
  private updateWireCurrents(): void {
    // Clear previous currents
    for (const wire of this.wires) {
      wire.current = 0;
    }
    
    // Get current values from components
    for (const component of this.components) {
      const currents = component.getCurrents();
      
      for (const [pinId, current] of Object.entries(currents)) {
        // Find pin
        const pin = component.pins.find(p => p.id === pinId);
        if (!pin || !pin.nodeId) continue;
        
        // Find wires connected to this pin's node
        for (const wire of this.wires) {
          if (wire.nodes.includes(pin.nodeId)) {
            // Determine current direction relative to wire direction
            if (wire.nodes[0] === pin.nodeId) {
              wire.current += current; // Flowing away from first node
            } else {
              wire.current -= current; // Flowing into second node
            }
          }
        }
      }
    }
  }
  
  private connectPinToNode(pin: Pin, nodeId: string): void {
    // Disconnect pin from any existing node
    if (pin.nodeId) {
      this.disconnectPin(pin);
    }
    
    // Connect to new node
    const node = this.nodes.get(nodeId);
    if (!node) return;
    
    node.connections.push({
      nodeId: nodeId,
      componentId: pin.componentId,
      pinId: pin.id
    });
    
    pin.nodeId = nodeId;
  }
  
  private mergeNodes(nodeId1: string, nodeId2: string): void {
    const node1 = this.nodes.get(nodeId1);
    const node2 = this.nodes.get(nodeId2);
    
    if (!node1 || !node2 || nodeId1 === nodeId2) return;
    
    // Move all connections from node2 to node1
    for (const connection of node2.connections) {
      // Find the component and pin
      const component = this.components.find(c => c.id === connection.componentId);
      if (!component) continue;
      
      const pin = component.pins.find(p => p.id === connection.pinId);
      if (!pin) continue;
      
      // Update pin to point to node1
      pin.nodeId = node1.id;
      
      // Add connection to node1
      node1.connections.push({
        nodeId: node1.id,
        componentId: connection.componentId,
        pinId: connection.pinId
      });
    }
    
    // Update wires
    for (const wire of this.wires) {
      if (wire.nodes[0] === nodeId2) {
        wire.nodes[0] = nodeId1;
      }
      if (wire.nodes[1] === nodeId2) {
        wire.nodes[1] = nodeId1;
      }
    }
    
    // Delete node2
    this.nodes.delete(nodeId2);
  }
  
  private rebuildCircuit(): void {
    // Rebuild nodes and connections if needed
    this.validateCircuitTopology();
    
    // Rebuild wires based on node connections
    this.rebuildWires();
  }
  
  private validateCircuitTopology(): void {
    // Check for disconnected pins and orphaned nodes
    // This is a place to improve circuit validation
  }
  
  private rebuildWires(): void {
    // This method rebuilds wire segments based on connected nodes
    // For now, we'll use a simple approach with direct wires between pins
    
    this.wires = [];
    
    const processedConnections = new Set<string>();
    
    // For each node
    for (const [nodeId, node] of this.nodes.entries()) {
      // For each pair of connections in this node
      for (let i = 0; i < node.connections.length; i++) {
        for (let j = i + 1; j < node.connections.length; j++) {
          const conn1 = node.connections[i];
          const conn2 = node.connections[j];
          
          // Create a unique connection identifier
          const connPair = [
            `${conn1.componentId}-${conn1.pinId}`,
            `${conn2.componentId}-${conn2.pinId}`
          ].sort().join('_');
          
          // Skip if we've already processed this connection
          if (processedConnections.has(connPair)) continue;
          processedConnections.add(connPair);
          
          // Create a wire between these two pins
          this.wires.push({
            id: `wire_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
            nodes: [nodeId, nodeId], // Same node for both ends
            current: 0
          });
        }
      }
    }
  }
  
  // Public methods to get circuit state
  getComponents(): Component[] {
    return [...this.components];
  }
  
  getNodes(): Node[] {
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
