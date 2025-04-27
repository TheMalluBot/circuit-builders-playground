
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
  states: {
    [key: string]: {
      components: string[];
      connections?: string[][];
    };
  };
  instructions: string[];
  objectives: string[];
}
