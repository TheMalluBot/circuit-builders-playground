
export type ComponentType = 'battery' | 'resistor' | 'led' | 'switch';

export interface Pin {
  id: string;
  nodeId: string | null;
  position: { x: number; y: number }; // Relative to component
  type: 'input' | 'output' | 'bidirectional';
}

export interface Component {
  id: string;
  type: ComponentType;
  position: { x: number; y: number };
  rotation: number;
  pins: Pin[];
  properties: Record<string, any>;
}

export interface Node {
  id: string;
  voltage: number;
  position: { x: number; y: number };
}

export interface Wire {
  id: string;
  nodeIds: [string, string]; // Start and end nodes
  current: number;
  // Added path property for wire routing visualization
  path?: { x: number; y: number }[];
}

export interface Circuit {
  components: Component[];
  nodes: Node[];
  wires: Wire[];
}

export interface RenderOptions {
  showVoltages: boolean;
  showCurrents: boolean;
  highlightedNodeId?: string | null;
  theme: 'light' | 'dark';
}

// Update this type to include 'wire' for consistency
export type CircuitItemType = 'component' | 'node' | 'pin' | 'wire';
