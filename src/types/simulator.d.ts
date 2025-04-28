
export interface CircuitComponentProps {
  name: string;
  icon: string;
  description: string;
  highlight?: boolean;
}

export interface SimulationActivity {
  title: string;
  description: string;
  components: string[];
  states?: {
    [key: string]: {
      components: string[];
      connections?: string[][];
    };
  };
  instructions: string[];
  objectives: string[];
}

export interface SimulationState {
  components: Component[];
  nodes: Node[];
  wires: Wire[];
  time: number;
  running: boolean;
}

export interface RenderOptions {
  showVoltages: boolean;
  showCurrents: boolean;
  showGrid: boolean;
  animateCurrentFlow: boolean;
  theme: 'light' | 'dark';
}

export interface DragInfo {
  type: string;
  offsetX: number;
  offsetY: number;
  isPaletteDrag?: boolean;
}

export interface NodePosition {
  x: number;
  y: number;
}

export interface PinConnection {
  componentId: string;
  pinId: string;
  nodeId: string;
}

export interface WireConnectionState {
  isConnecting: boolean;
  startNodeId: string | null;
  startPos: NodePosition | null;
  endPos: NodePosition | null;
  hoveredNodeId: string | null;
}

// Added for consistency with the component factory
export interface ComponentInfo {
  displayName: string;
  description: string;
  category: string;
  defaultProperties: Record<string, any>;
}
