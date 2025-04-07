
export interface CircuitComponentData {
  id: number;
  name: string;
  icon: string;
  description: string;
  category: 'passive' | 'active' | 'power' | 'logic' | 'sensor';
}

export const components: CircuitComponentData[] = [
  {
    id: 1,
    name: "Resistor",
    icon: "/placeholder.svg",
    description: "Limits current flow",
    category: "passive"
  },
  {
    id: 2,
    name: "Capacitor",
    icon: "/placeholder.svg",
    description: "Stores electrical charge",
    category: "passive"
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
    description: "Allows current in one direction",
    category: "passive"
  },
  {
    id: 5,
    name: "LED",
    icon: "/placeholder.svg",
    description: "Light-emitting diode",
    category: "passive"
  },
  {
    id: 6,
    name: "Transistor",
    icon: "/placeholder.svg",
    description: "Amplifies or switches signals",
    category: "active"
  },
  {
    id: 7,
    name: "Op-Amp",
    icon: "/placeholder.svg",
    description: "Differential voltage amplifier",
    category: "active"
  },
  {
    id: 8,
    name: "Battery",
    icon: "/placeholder.svg",
    description: "DC power source",
    category: "power"
  },
  {
    id: 9,
    name: "Voltage Regulator",
    icon: "/placeholder.svg",
    description: "Maintains steady voltage",
    category: "power"
  },
  {
    id: 10,
    name: "Switch",
    icon: "/placeholder.svg",
    description: "Makes/breaks connections",
    category: "passive"
  },
  {
    id: 11,
    name: "AND Gate",
    icon: "/placeholder.svg",
    description: "Logic AND operation",
    category: "logic"
  },
  {
    id: 12,
    name: "OR Gate",
    icon: "/placeholder.svg",
    description: "Logic OR operation",
    category: "logic"
  }
];

export const getComponentsByCategory = (category: CircuitComponentData['category']): CircuitComponentData[] => {
  return components.filter(component => component.category === category);
};
