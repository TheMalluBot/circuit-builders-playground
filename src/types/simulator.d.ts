
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
