
export interface CircuitComponentData {
  id: number;
  name: string;
  icon: string;
  description: string;
  category: 'passive' | 'active' | 'power' | 'logic' | 'sensor';
  properties?: {
    resistance?: string;
    capacitance?: string;
    voltage?: string;
    current?: string;
    power?: string;
    forwardVoltage?: string;
  };
}

export const components: CircuitComponentData[] = [
  {
    id: 1,
    name: "Resistor",
    icon: "/placeholder.svg",
    description: "Limits current flow in a circuit",
    category: "passive",
    properties: {
      resistance: "1kΩ to 10kΩ"
    }
  },
  {
    id: 2,
    name: "Capacitor",
    icon: "/placeholder.svg",
    description: "Stores electrical charge temporarily",
    category: "passive",
    properties: {
      capacitance: "1μF to 100μF"
    }
  },
  {
    id: 3,
    name: "Inductor",
    icon: "/placeholder.svg",
    description: "Stores energy in magnetic field",
    category: "passive"
  },
  {
    id: 4,
    name: "Diode",
    icon: "/placeholder.svg",
    description: "Allows current to flow in one direction only",
    category: "passive",
    properties: {
      forwardVoltage: "0.7V"
    }
  },
  {
    id: 5,
    name: "LED",
    icon: "/placeholder.svg",
    description: "Light-emitting diode that produces light when current flows",
    category: "passive",
    properties: {
      forwardVoltage: "2.0V",
      current: "20mA typical"
    }
  },
  {
    id: 6,
    name: "Transistor",
    icon: "/placeholder.svg",
    description: "Amplifies or switches electronic signals",
    category: "active"
  },
  {
    id: 7,
    name: "Op-Amp",
    icon: "/placeholder.svg",
    description: "Differential voltage amplifier with high gain",
    category: "active"
  },
  {
    id: 8,
    name: "Battery",
    icon: "/placeholder.svg",
    description: "DC power source that provides voltage",
    category: "power",
    properties: {
      voltage: "9V"
    }
  },
  {
    id: 9,
    name: "Voltage Regulator",
    icon: "/placeholder.svg",
    description: "Maintains steady voltage output regardless of input",
    category: "power"
  },
  {
    id: 10,
    name: "Switch",
    icon: "/placeholder.svg",
    description: "Makes or breaks electrical connections to control circuits",
    category: "passive"
  },
  {
    id: 11,
    name: "AND Gate",
    icon: "/placeholder.svg",
    description: "Digital logic gate that outputs 1 only when all inputs are 1",
    category: "logic"
  },
  {
    id: 12,
    name: "OR Gate",
    icon: "/placeholder.svg",
    description: "Digital logic gate that outputs 1 when any input is 1",
    category: "logic"
  },
  {
    id: 13,
    name: "Potentiometer",
    icon: "/placeholder.svg",
    description: "Variable resistor with adjustable resistance",
    category: "passive",
    properties: {
      resistance: "0-10kΩ variable"
    }
  },
  {
    id: 14,
    name: "Photoresistor",
    icon: "/placeholder.svg",
    description: "Light-dependent resistor that changes resistance based on light",
    category: "sensor"
  }
];

export const getComponentsByCategory = (category: CircuitComponentData['category']): CircuitComponentData[] => {
  return components.filter(component => component.category === category);
};

export const getSensorComponents = (): CircuitComponentData[] => {
  return components.filter(component => component.category === 'sensor');
};

export const getComponentByName = (name: string): CircuitComponentData | undefined => {
  return components.find(component => 
    component.name.toLowerCase() === name.toLowerCase()
  );
};

