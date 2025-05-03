
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
  // Enhanced path property with control points for manipulating wire routes
  path: { x: number; y: number }[];
  // New property to identify if wire is selected for manipulation
  selected?: boolean;
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

// Updated to include 'wireSegment' for wire manipulation
export type CircuitItemType = 'component' | 'node' | 'pin' | 'wire' | 'wireSegment' | 'wireControlPoint';

// New interface for wire segment interaction
export interface WireSegment {
  wireId: string;
  segmentIndex: number;
  start: { x: number; y: number };
  end: { x: number; y: number };
}

// New interface for wire control point interaction
export interface WireControlPoint {
  wireId: string;
  pointIndex: number;
  position: { x: number; y: number };
}
