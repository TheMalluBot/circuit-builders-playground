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
}

export interface Component {
  id: string;
  type: string;
  position: { x: number; y: number };
  rotation: number;
  properties: Record<string, any>;
  pins: Pin[];
}

export interface Node {
  id: string;
  voltage: number;
  connections: { componentId: string; pinId: string }[];
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
