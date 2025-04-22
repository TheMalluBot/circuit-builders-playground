
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
}

export interface SimulationActivity {
  title: string;
  description: string;
  components: string[];
  instructions: string[];
  objectives: string[];
}

export const lessons: Lesson[] = [
  // Beginner Lessons
  {
    id: 1,
    title: "Introduction to Circuits and Components",
    description: "Learn the basics of electrical circuits and understand Ohm's Law.",
    image: "/placeholder.svg",
    duration: "30 min",
    difficulty: "beginner",
    completed: false,
    slug: "intro-to-circuits",
    category: "beginner",
    content: {
      sections: [
        {
          title: "Welcome to Circuit Building",
          content: "Electrical circuits are the foundation of all modern electronics. They provide a path for electricity to flow and perform useful work. In this lesson, you'll learn about basic circuit components and how they work together."
        },
        {
          title: "Component Explorer",
          content: "Every circuit is built from components. The most basic circuit requires:\n\n- Power Source (Battery/Power Supply): Provides electrical energy\n- Conductive Path (Wires): Allows electricity to flow\n- Load (Resistor, LED, etc.): Uses the electrical energy\n- Control Element (Switch): Controls the flow of electricity"
        },
        {
          title: "Circuit Fundamentals",
          content: "To understand circuits, you need to know three fundamental concepts:\n\n- Voltage (V): The electrical pressure measured in volts (V)\n- Current (I): The flow of electricity measured in amperes (A)\n- Resistance (R): The opposition to current flow measured in ohms (Ω)\n\nThese three concepts are related by Ohm's Law: V = I × R"
        },
        {
          title: "Your First Circuit",
          content: "Let's build a simple LED circuit. An LED (Light Emitting Diode) converts electrical energy into light. However, LEDs need current limitation to prevent damage. We'll connect a battery to an LED and observe what happens."
        },
        {
          title: "Knowledge Check",
          content: "Test your understanding:\n\n1. What provides the electrical energy in a circuit?\n2. What happens if too much current flows through an LED?\n3. Which direction does conventional current flow?\n4. What does a switch do in a circuit?"
        },
        {
          title: "Next Steps",
          content: "In our next lesson, we'll learn about resistors and how they help us control current in our circuits. We'll also dive deeper into Ohm's Law and see it in action."
        }
      ],
      simulationActivity: {
        title: "Build Your First LED Circuit",
        description: "Connect a battery to an LED to make it light up. Observe what happens when you connect it correctly and incorrectly.",
        components: ["9V Battery", "LED", "Wires"],
        instructions: [
          "Drag wires to connect the positive terminal of the battery to the anode (longer leg) of the LED",
          "Connect the cathode (shorter leg) of the LED to the negative terminal of the battery",
          "Observe the LED lighting up when connected correctly"
        ],
        objectives: [
          "Successfully light the LED",
          "Understand polarity in a circuit",
          "Observe what happens with incorrect connections"
        ]
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
