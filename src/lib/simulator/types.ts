
export interface Node {
  id: string;
  voltage: number;
  connections: Connection[];
}

export interface Connection {
  nodeId: string;
  componentId: string;
  pinId: string;
}

export interface Component {
  id: string;
  type: string;
  position: { x: number; y: number };
  rotation: number;
  properties: Record<string, any>;
  pins: Pin[];
  
  // Component behavior methods
  getMatrixContribution(timeStep: number): MatrixContribution;
  updateState(voltages: number[], timeStep: number): void;
  getCurrents(): Record<string, number>;
}

export interface Pin {
  id: string;
  position: { x: number; y: number };
  nodeId: string | null;
  componentId: string;
  type: 'input' | 'output' | 'bidirectional';
}

export interface Wire {
  id: string;
  nodes: [string, string]; // Start and end node IDs
  current: number;
}

export interface MatrixContribution {
  conductanceMatrix: number[][];
  currentVector: number[];
  nodeMap: Record<string, number>; // Maps node IDs to matrix indices
}

export interface SimulationState {
  components: Component[];
  nodes: Node[];
  wires: Wire[];
  time: number;
  running: boolean;
}
