
export interface RenderOptions {
  showVoltages: boolean;
  showCurrents: boolean;
  showGrid: boolean;
  animateCurrentFlow: boolean;
  theme: 'light' | 'dark';
}

export interface Pin {
  id: string;
  position: { x: number; y: number };
  nodeId?: string;
  componentId: string;
  type?: 'input' | 'output' | 'bidirectional';
}

export interface Component {
  id: string;
  type: string;
  position: { x: number; y: number };
  rotation: number;
  properties: Record<string, any>;
  pins: Pin[];
  
  // Add required methods
  getMatrixContribution(timeStep: number): MatrixContribution;
  updateState(voltages: number[], timeStep: number): void;
  getCurrents(): Record<string, number>;
}

export interface Node {
  id: string;
  voltage: number;
  connections: { componentId: string; pinId: string; nodeId?: string }[];
}

export interface Wire {
  id: string;
  nodes: [string, string];
  current: number;
}

export interface SimulationState {
  components: Component[];
  nodes: Node[];
  wires: Wire[];
  time?: number;
  running?: boolean;
}

export interface SimulationActivity {
  title: string;
  description: string;
  components: string[];
  states: {
    [key: string]: {
      components: string[];
      connections?: string[][];
    };
  };
  instructions: string[];
  objectives: string[];
}

export interface CircuitComponentProps {
  x: number;
  y: number;
}

// Add the MatrixContribution interface
export interface MatrixContribution {
  conductanceMatrix: number[][];
  currentVector: number[];
  nodeMap: Record<string, number>;
}

// Add Connection type
export interface Connection {
  componentId: string;
  pinId: string;
  nodeId?: string;
}
