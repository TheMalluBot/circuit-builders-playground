export type LessonCategory = 'beginner' | 'intermediate' | 'advanced';

export interface Lesson {
  id: number;
  title: string;
  description: string;
  image: string;
  duration: string;
  difficulty: LessonCategory;
  completed?: boolean;
  slug: string;
  category: LessonCategory;
  content?: {
    sections: LessonSection[];
    simulationActivity?: SimulationActivity;
  };
}

export interface LessonSection {
  title: string;
  content: string;
  simulatorState?: string;
  interactiveElements?: InteractiveElement[];
}

export interface InteractiveElement {
  type: 'component-card' | 'animation' | 'challenge' | 'measurement';
  id: string;
  title?: string;
  description?: string;
  image?: string;
  symbol?: string;
  details?: string;
}

export interface SimulationActivity {
  title: string;
  description: string;
  components: string[];
  instructions: string[];
  objectives: string[];
  states?: {
    [key: string]: {
      components: string[];
      connections?: string[][];
      measurements?: {
        type: string;
        position: string;
        value: string;
      }[];
    };
  };
}

export const lessons: Lesson[] = [
  // Beginner Lessons
  {
    id: 1,
    title: "Introduction to Basic Circuits",
    description: "Learn the fundamentals of electrical circuits and build your first LED circuit.",
    image: "/placeholder.svg",
    duration: "30 min",
    difficulty: "beginner",
    completed: false,
    slug: "intro-basic-circuits",
    category: "beginner",
    content: {
      sections: [
        {
          title: "Welcome to Circuit Building",
          content: "Welcome to your first lesson in circuit building! An electrical circuit is a complete path that allows electricity to flow from a power source, through components, and back to the source.\n\nCircuits are the foundation of all electronics, from simple flashlights to complex computers. In this lesson, you'll learn the basics of circuits and build your very first working LED circuit.\n\nAs you work through this lesson, you'll discover how electricity flows, how components work together, and how to create a functional circuit that lights up an LED.",
          simulatorState: "empty"
        },
        {
          title: "Meet the Components",
          content: "Let's explore the basic components we'll use to build our first circuit. Click on each component to learn more about it:",
          simulatorState: "components-showcase",
          interactiveElements: [
            {
              type: "component-card",
              id: "battery",
              title: "Battery",
              description: "The power source that provides electrical energy to the circuit.",
              details: "Has positive (+) and negative (-) terminals. Creates voltage that pushes electrons through the circuit.",
              image: "/placeholder.svg",
              symbol: "/placeholder.svg"
            },
            {
              type: "component-card",
              id: "led",
              title: "LED",
              description: "Light Emitting Diode - converts electrical energy into light.",
              details: "Has polarity (anode/cathode). Only allows current in one direction. Requires current limiting to prevent damage.",
              image: "/placeholder.svg",
              symbol: "/placeholder.svg"
            },
            {
              type: "component-card",
              id: "resistor",
              title: "Resistor",
              description: "Limits the flow of electrical current in a circuit.",
              details: "Measured in ohms (Ω). Higher resistance = less current flow. Essential for protecting components from too much current.",
              image: "/placeholder.svg",
              symbol: "/placeholder.svg"
            },
            {
              type: "component-card",
              id: "switch",
              title: "Switch",
              description: "Controls the flow of electricity by creating an open or closed path.",
              details: "In 'on' position, allows current to flow. In 'off' position, breaks the circuit path.",
              image: "/placeholder.svg",
              symbol: "/placeholder.svg"
            },
            {
              type: "component-card",
              id: "wires",
              title: "Wires",
              description: "Conductive paths that connect components together.",
              details: "Allow electrons to flow between components. Create the complete circuit path.",
              image: "/placeholder.svg",
              symbol: "/placeholder.svg"
            }
          ]
        },
        {
          title: "Building Your First Circuit",
          content: "Now it's time to build your first circuit! We'll connect a battery to an LED with a resistor to create a simple light.\n\nFollow these steps in the simulator:\n\n1. Place the battery on the left side of the workspace\n2. Place the LED to the right of the battery\n3. Place the resistor between the battery and the LED\n4. Connect the positive (+) terminal of the battery to one end of the resistor\n5. Connect the other end of the resistor to the anode (longer leg) of the LED\n6. Connect the cathode (shorter leg) of the LED back to the negative (-) terminal of the battery\n\nAs you complete each step, watch for visual feedback in the simulator.",
          simulatorState: "guided-build"
        },
        {
          title: "Understanding Current Flow",
          content: "Great job building your first circuit! Now let's understand how it works.\n\nElectricity flows in a complete loop, from the power source, through components, and back to the source. This loop is called a circuit.\n\nIn your LED circuit:\n\n- **Voltage** from the battery (measured in volts, V) creates electrical pressure that pushes electrons through the circuit\n- **Current** (measured in amperes or amps, A) flows from the battery's positive terminal through the resistor, through the LED, and back to the negative terminal\n- The **Resistor** limits the flow of current to protect the LED from damage\n- The **LED** converts electrical energy into light when current flows through it\n\nThe simulator now shows animated current flow. Notice how the electrons move through the complete circuit path.",
          simulatorState: "complete-circuit",
          interactiveElements: [
            {
              type: "animation",
              id: "current-flow",
              title: "Current Flow Animation"
            },
            {
              type: "measurement",
              id: "voltage-measurement",
              title: "Voltage Measurement"
            }
          ]
        },
        {
          title: "Why We Need Resistors",
          content: "You might wonder why we need a resistor in our LED circuit. Let's find out!\n\nLEDs are sensitive components that can be damaged by too much current. Without a resistor, the current would be too high and could burn out the LED instantly.\n\nThe resistor limits the current to a safe level for the LED. Using Ohm's Law (I = V/R), we can calculate the right resistor value:\n\n- If our battery is 9V and our LED has a forward voltage of 2V\n- The voltage across the resistor is 7V (9V - 2V)\n- If our LED needs 15mA (0.015A) of current\n- Then using Ohm's Law: R = V/I = 7V / 0.015A = 466.67Ω\n- So we would use a 470Ω resistor (the nearest standard value)\n\nThe simulator now shows a comparison of an LED with and without a proper resistor. See the difference!",
          simulatorState: "resistor-demo",
          interactiveElements: [
            {
              type: "animation",
              id: "with-without-resistor",
              title: "LEDs With and Without Resistors"
            }
          ]
        },
        {
          title: "Practice Challenge",
          content: "Now it's your turn to apply what you've learned! Your challenge is to modify the circuit by adding a switch to control the LED.\n\nIn the simulator:\n\n1. Add a switch to the circuit\n2. Place it between the battery and the resistor\n3. Connect the components correctly to create a working switch-controlled LED\n\nWhen done correctly, you should be able to turn the LED on and off using the switch. Give it a try!",
          simulatorState: "challenge",
          interactiveElements: [
            {
              type: "challenge",
              id: "add-switch-challenge",
              title: "Add a Switch Challenge"
            }
          ]
        },
        {
          title: "What You've Learned",
          content: "Congratulations on completing your first circuit lesson! Here's what you've learned:\n\n- The basic components of an electrical circuit\n- How to connect components to create a functional circuit\n- How current flows through a complete circuit path\n- Why resistors are essential for protecting sensitive components\n- How to use a switch to control a circuit\n\nNext up, we'll explore more about resistors and Ohm's Law, which will help you design more complex circuits. You might also try building a simple flashlight at home using what you've learned today!\n\nFeel free to experiment more with the circuit simulator or continue to the next lesson.",
          simulatorState: "complete-challenge"
        }
      ],
      simulationActivity: {
        title: "Build Your First LED Circuit",
        description: "Connect a battery, resistor, and LED to create a simple light circuit.",
        components: ["9V Battery", "LED", "470Ω Resistor", "Switch", "Wires"],
        instructions: [
          "Drag components from the panel to the workspace",
          "Connect the battery's positive terminal to the resistor",
          "Connect the resistor to the LED's anode (longer leg)",
          "Connect the LED's cathode (shorter leg) to the battery's negative terminal",
          "For the challenge: add a switch between the battery and resistor"
        ],
        objectives: [
          "Build a working LED circuit",
          "Understand current flow direction",
          "Learn the purpose of current-limiting resistors",
          "Successfully add a switch to control the circuit"
        ],
        states: {
          "empty": {
            components: []
          },
          "components-showcase": {
            components: ["battery", "led", "resistor", "switch", "wires"]
          },
          "guided-build": {
            components: ["battery", "led", "resistor"],
            connections: []
          },
          "complete-circuit": {
            components: ["battery", "led", "resistor"],
            connections: [
              ["battery-positive", "resistor-start"],
              ["resistor-end", "led-anode"],
              ["led-cathode", "battery-negative"]
            ],
            measurements: [
              {
                type: "voltage",
                position: "battery",
                value: "9V"
              },
              {
                type: "voltage",
                position: "led",
                value: "2V"
              },
              {
                type: "current",
                position: "circuit",
                value: "15mA"
              }
            ]
          },
          "resistor-demo": {
            components: ["battery", "led", "resistor", "led-no-resistor"],
            connections: [
              ["battery-positive", "resistor-start"],
              ["resistor-end", "led-anode"],
              ["led-cathode", "battery-negative"],
              ["battery-positive", "led-no-resistor-anode"],
              ["led-no-resistor-cathode", "battery-negative"]
            ]
          },
          "challenge": {
            components: ["battery", "led", "resistor", "switch"],
            connections: []
          },
          "complete-challenge": {
            components: ["battery", "led", "resistor", "switch"],
            connections: [
              ["battery-positive", "switch-1"],
              ["switch-2", "resistor-start"],
              ["resistor-end", "led-anode"],
              ["led-cathode", "battery-negative"]
            ]
          }
        }
      }
    }
  },
  {
    id: 2,
    title: "Resistors and Ohm's Law",
    description: "Understand the difference between series and parallel connections.",
    image: "/placeholder.svg",
    duration: "45 min",
    difficulty: "beginner",
    completed: false,
    slug: "resistors-ohms-law",
    category: "beginner",
    content: {
      sections: [
        {
          title: "Introduction to Resistors",
          content: "Resistors are fundamental components that limit the flow of current in a circuit. They convert electrical energy into heat and are essential for protecting sensitive components like LEDs. Resistors are color-coded to indicate their value in ohms (Ω)."
        },
        {
          title: "Understanding Ohm's Law",
          content: "Ohm's Law is the relationship between voltage (V), current (I), and resistance (R): V = I × R. This fundamental equation allows us to calculate any one of these values if we know the other two. For example, if we know the voltage and resistance, we can calculate the current: I = V/R."
        },
        {
          title: "LED Circuits with Resistors",
          content: "LEDs require a resistor to limit current and prevent damage. To calculate the appropriate resistor value, you need to know:\n\n- Supply voltage (V)\n- LED forward voltage (Vf)\n- Desired LED current (typically 15-20mA)\n\nThe formula is: R = (V - Vf) / I"
        },
        {
          title: "Resistor Calculation Exercise",
          content: "Let's calculate a resistor value for a red LED with:\n- Supply voltage: 9V\n- LED forward voltage: 2V\n- Desired current: 15mA\n\nR = (9V - 2V) / 0.015A = 7V / 0.015A = 467Ω\n\nSince 467Ω is not a standard value, we would typically choose 470Ω."
        },
        {
          title: "Practical Applications",
          content: "Resistors are used in countless applications:\n\n- Current limiting for LEDs and other components\n- Voltage dividers to create different voltage levels\n- Pull-up and pull-down resistors in digital circuits\n- Timing elements when paired with capacitors"
        },
        {
          title: "Advanced Concepts Preview",
          content: "In future lessons, we'll explore:\n\n- Voltage dividers using resistors\n- Series and parallel resistor combinations\n- Variable resistors (potentiometers) for adjustable circuits"
        }
      ],
      simulationActivity: {
        title: "Interactive Ohm's Law Circuit",
        description: "Experiment with resistor values in an LED circuit and observe how current and brightness change.",
        components: ["9V Battery", "Variable Resistor (100Ω to 1kΩ)", "LED", "Ammeter", "Voltmeter", "Wires"],
        instructions: [
          "Observe the pre-built circuit with a battery, resistor, and LED",
          "Adjust the resistor value using the slider",
          "Monitor the current and voltage readings",
          "Notice how LED brightness changes with different current levels"
        ],
        objectives: [
          "Find the minimum safe resistor value",
          "Calculate the expected current at different resistor values",
          "Understand the relationship between resistance and LED brightness"
        ]
      }
    }
  },
  {
    id: 3,
    title: "Series and Parallel Circuits",
    description: "Learn how to analyze simple circuits using Kirchhoff's laws.",
    image: "/placeholder.svg",
    duration: "40 min",
    difficulty: "beginner",
    completed: false,
    slug: "series-parallel-circuits",
    category: "beginner",
    content: {
      sections: [
        {
          title: "Circuit Configurations",
          content: "There are two fundamental ways to connect components in a circuit: series and parallel. Understanding these configurations is essential for circuit design and analysis."
        },
        {
          title: "Series Circuits",
          content: "In a series circuit, components are connected end-to-end in a single path. Key characteristics:\n\n- Same current flows through all components\n- Voltage is divided across components\n- Total resistance is the sum of individual resistances (Rtotal = R1 + R2 + R3...)\n- If one component fails open, the entire circuit stops working"
        },
        {
          title: "Parallel Circuits",
          content: "In a parallel circuit, components are connected across common points, creating multiple paths. Key characteristics:\n\n- Same voltage across all branches\n- Current divides between parallel paths\n- Total resistance decreases with more parallel paths (1/Rtotal = 1/R1 + 1/R2 + 1/R3...)\n- If one component fails open, other branches continue to work"
        },
        {
          title: "Comparing Series and Parallel",
          content: "Series and parallel configurations have different advantages:\n\n- Series: Simple to wire, predictable current, good for current-sensitive applications\n- Parallel: Maintains voltage across components, provides redundancy, allows different currents through different branches"
        },
        {
          title: "Mixed Circuits",
          content: "Most real-world circuits combine both series and parallel elements. Analysis requires identifying which components are in series and which are in parallel, then applying the appropriate rules to each section."
        },
        {
          title: "Knowledge Assessment",
          content: "Check your understanding:\n\n1. What happens to current in a series circuit if you add more resistors?\n2. What happens to total resistance in a parallel circuit if you add more resistors?\n3. In which configuration would adding a second light bulb make all bulbs dimmer?\n4. How does battery life compare between series and parallel configurations of the same components?"
        }
      ],
      simulationActivity: {
        title: "Series vs. Parallel Exploration",
        description: "Compare the behavior of series and parallel circuits with identical components.",
        components: ["Battery", "Resistors (3)", "LEDs (3)", "Ammeters", "Voltmeters", "Switches", "Wires"],
        instructions: [
          "Examine both the series and parallel circuits",
          "Measure voltage across each component in both configurations",
          "Measure current through each component in both configurations",
          "Try opening one branch in each circuit and observe what happens"
        ],
        objectives: [
          "Verify current behavior in series and parallel circuits",
          "Verify voltage behavior in series and parallel circuits",
          "Compare brightness of LEDs in different configurations",
          "Understand failure modes in different configurations"
        ]
      }
    }
  },
  {
    id: 4,
    title: "Building a Basic LED Flashlight",
    description: "Explore different types of sensors and how to use them in circuits.",
    image: "/placeholder.svg",
    duration: "35 min",
    difficulty: "beginner",
    completed: false,
    slug: "led-flashlight",
    category: "beginner",
    content: {
      sections: [
        {
          title: "Project Introduction",
          content: "In this lesson, we'll apply what we've learned to build a practical device: an LED flashlight. This project combines power sources, switches, resistors, and LEDs into a functional circuit with real-world applications."
        },
        {
          title: "Circuit Design",
          content: "Our flashlight circuit consists of:\n\n- Battery: Provides electrical power\n- Switch: Controls on/off functionality\n- Resistor: Limits current to protect the LED\n- LED: Produces light\n- Connecting wires: Create the conductive path"
        },
        {
          title: "Building the Circuit",
          content: "We'll assemble our circuit step by step, ensuring correct component placement and secure connections. The switch will be placed between the battery and the rest of the circuit to completely disconnect power when not in use."
        },
        {
          title: "Testing and Analysis",
          content: "After building the circuit, we'll test its functionality by toggling the switch and observing the LED. We'll also measure voltage and current at various points to verify our design calculations."
        },
        {
          title: "Optimization",
          content: "We can improve our basic flashlight by:\n\n- Adding multiple LEDs for increased brightness\n- Incorporating a variable resistor for brightness control\n- Using a more efficient battery configuration\n- Adding a blinking function for emergency signaling"
        },
        {
          title: "Real-World Considerations",
          content: "When taking this design from concept to physical product, consider:\n\n- Battery type and life expectancy\n- Physical enclosure and switch accessibility\n- Water and impact resistance\n- Heat dissipation from LEDs and resistors"
        }
      ],
      simulationActivity: {
        title: "Virtual Flashlight Construction",
        description: "Build a functional LED flashlight with a battery, switch, resistor, and LED.",
        components: ["Battery", "Toggle Switch", "Resistor", "LED", "Wires"],
        instructions: [
          "Place all components in the workspace",
          "Connect the positive battery terminal to one side of the switch",
          "Connect the other side of the switch to the resistor",
          "Connect the resistor to the anode (longer leg) of the LED",
          "Connect the LED cathode (shorter leg) to the negative battery terminal",
          "Test the circuit by toggling the switch"
        ],
        objectives: [
          "Build a working flashlight circuit",
          "Understand the role of each component",
          "Verify correct current and voltage throughout the circuit",
          "Calculate battery life based on current draw"
        ]
      }
    }
  },
  {
    id: 5,
    title: "Introduction to Capacitors",
    description: "Learn about electronic components that store electrical charge.",
    image: "/placeholder.svg",
    duration: "50 min",
    difficulty: "beginner",
    completed: false,
    slug: "intro-to-capacitors",
    category: "beginner",
    content: {
      sections: [
        {
          title: "Capacitor Fundamentals",
          content: "Capacitors are electronic components that store electrical energy in an electric field. They consist of two conductive plates separated by an insulating material (dielectric). Capacitance is measured in farads (F), though most capacitors use smaller units like microfarads (μF) or picofarads (pF)."
        },
        {
          title: "Capacitor Behavior",
          content: "Unlike resistors that impede current flow, capacitors temporarily store and release charge. When connected to a voltage source, a capacitor charges up until its voltage equals the source voltage. When disconnected, it maintains this charge until a path for discharge is provided."
        },
        {
          title: "Charging and Discharging",
          content: "The charging and discharging of a capacitor follows an exponential curve. The time constant (τ = RC) determines how quickly this happens, where R is the resistance in ohms and C is the capacitance in farads. After one time constant, the capacitor reaches about 63% of its final value."
        },
        {
          title: "Types of Capacitors",
          content: "Common capacitor types include:\n\n- Ceramic: Small values, non-polarized, stable\n- Electrolytic: Larger values, polarized (+ and - terminals matter)\n- Tantalum: High capacity, stable, polarized\n- Film: Precise values, good for timing circuits"
        },
        {
          title: "Practical Applications",
          content: "Capacitors serve many functions in circuits:\n\n- Power supply filtering and smoothing\n- Coupling and decoupling (blocking DC while allowing AC)\n- Timing elements in oscillator circuits\n- Energy storage for quick discharge (camera flash)\n- Filtering unwanted frequencies"
        },
        {
          title: "Safety Considerations",
          content: "Important safety notes:\n\n- Large capacitors can store lethal charges even when power is disconnected\n- Electrolytic capacitors must be connected with correct polarity\n- Exceeding voltage ratings can cause catastrophic failure\n- Capacitors should be discharged before handling"
        }
      ],
      simulationActivity: {
        title: "Capacitor Charging and Discharging",
        description: "Observe how capacitors charge and discharge through resistors and how changing component values affects the time constant.",
        components: ["DC Power Source", "Resistor", "Capacitor", "Switch", "LED", "Voltmeter"],
        instructions: [
          "Observe the circuit with power source, resistor, capacitor, and switch",
          "Close the switch to begin charging the capacitor",
          "Monitor the voltage across the capacitor as it charges",
          "Open the switch and observe the capacitor discharge through the LED",
          "Adjust resistor and capacitor values to see how they affect charging/discharging time"
        ],
        objectives: [
          "Visualize capacitor charging and discharging curves",
          "Calculate and verify RC time constants",
          "Understand how resistor and capacitor values affect timing",
          "Observe energy storage and release in action"
        ]
      }
    }
  },
  
  // Intermediate Lessons
  {
    id: 6,
    title: "Transistors and Amplifiers",
    description: "Learn how transistors work and build simple amplifier circuits.",
    image: "/placeholder.svg",
    duration: "50 min",
    difficulty: "intermediate",
    completed: false,
    slug: "transistors-amplifiers",
    category: "intermediate"
  },
  {
    id: 7,
    title: "Operational Amplifiers",
    description: "Understand op-amp configurations and practical applications.",
    image: "/placeholder.svg",
    duration: "55 min",
    difficulty: "intermediate",
    completed: false,
    slug: "op-amps",
    category: "intermediate"
  },
  {
    id: 8,
    title: "Digital Logic Circuits",
    description: "Explore logic gates and design basic digital circuits.",
    image: "/placeholder.svg",
    duration: "60 min",
    difficulty: "intermediate",
    completed: false,
    slug: "digital-logic",
    category: "intermediate"
  },
  {
    id: 9,
    title: "Power Supply Design",
    description: "Learn how to design and build regulated power supplies.",
    image: "/placeholder.svg",
    duration: "65 min",
    difficulty: "intermediate",
    completed: false,
    slug: "power-supplies",
    category: "intermediate"
  },
  
  // Advanced Lessons
  {
    id: 10,
    title: "Microcontroller Integration",
    description: "Connect circuits to microcontrollers like Arduino and Raspberry Pi.",
    image: "/placeholder.svg",
    duration: "70 min",
    difficulty: "advanced",
    completed: false,
    slug: "microcontroller-integration",
    category: "advanced"
  },
  {
    id: 11,
    title: "PCB Design Fundamentals",
    description: "Move from breadboard to PCB with professional design techniques.",
    image: "/placeholder.svg",
    duration: "75 min",
    difficulty: "advanced",
    completed: false,
    slug: "pcb-design",
    category: "advanced"
  },
  {
    id: 12,
    title: "RF Circuit Basics",
    description: "Learn the principles of radio frequency circuits and antennas.",
    image: "/placeholder.svg",
    duration: "80 min",
    difficulty: "advanced",
    completed: false,
    slug: "rf-circuits",
    category: "advanced"
  },
  {
    id: 13,
    title: "Final Project: Weather Station",
    description: "Design a complete electronic system with multiple subsystems.",
    image: "/placeholder.svg",
    duration: "90 min",
    difficulty: "advanced",
    completed: false,
    slug: "final-project",
    category: "advanced"
  }
];

export const getLessonsByCategory = (category: LessonCategory): Lesson[] => {
  return lessons.filter(lesson => lesson.category === category);
};

export const getLessonBySlug = (slug: string): Lesson | undefined => {
  return lessons.find(lesson => lesson.slug === slug);
};
