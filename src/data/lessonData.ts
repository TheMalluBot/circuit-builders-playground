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
  type: 'component-card' | 'animation' | 'challenge' | 'measurement' | 'quiz' | 'calculator' | 'slider' | 'drag-drop';
  id: string;
  title?: string;
  description?: string;
  image?: string;
  symbol?: string;
  details?: string;
  options?: any[];
  correctAnswer?: string | number | boolean;
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
  // Getting Started with Electronics
  {
    id: 1,
    title: "Getting Started with Electronics",
    description: "Learn the fundamentals of electronics and get familiar with the CircuitBuilders platform.",
    image: "/placeholder.svg",
    duration: "25 min",
    difficulty: "beginner",
    completed: false,
    slug: "getting-started",
    category: "beginner",
    content: {
      sections: [
        {
          title: "Introduction to CircuitBuilders",
          content: "Welcome to CircuitBuilders! This platform is designed to help you learn electronics through interactive lessons and simulations. Whether you're a complete beginner or looking to brush up on your skills, our step-by-step approach will guide you through the fascinating world of electronics.\n\nIn this introductory lesson, we'll cover the basics of electrical concepts, show you how to use our circuit simulator, and provide important safety guidelines for when you're ready to build real circuits."
        },
        {
          title: "Basic Electrical Concepts",
          content: "Before we dive into building circuits, let's understand some fundamental concepts:\n\n**Electricity** is the flow of electric charge (electrons).\n\n**Voltage** is the electrical pressure that pushes electrons through a circuit, measured in volts (V).\n\n**Current** is the rate at which electrons flow, measured in amperes or amps (A).\n\n**Resistance** is how much a material opposes the flow of electrons, measured in ohms (Ω).\n\nThese concepts work together according to Ohm's Law: V = I × R (Voltage = Current × Resistance)."
        },
        {
          title: "Circuit Simulator Tutorial",
          content: "The CircuitBuilders simulator allows you to create and test virtual circuits before building them with real components. Here's how to use it:\n\n1. **Component Panel**: On the left side, you'll find various components you can drag onto the workspace.\n\n2. **Workspace**: The main area where you build your circuit by placing and connecting components.\n\n3. **Toolbar**: Contains simulation controls like Run, Pause, and Reset.\n\n4. **Measurement Tools**: Use these to measure voltage, current, and other properties in your circuit.\n\nTry dragging a few components onto the workspace and connecting them to get comfortable with the interface."
        },
        {
          title: "Safety Guidelines",
          content: "When you're ready to work with real electronic components, safety is paramount:\n\n- Always disconnect power sources before working on circuits\n- Use insulated tools when working with live circuits\n- Avoid wearing metal jewelry when working with electronics\n- Work in a dry environment to prevent electrical hazards\n- Be cautious with capacitors as they can store charge even when disconnected\n- Keep components and tools away from children and pets\n- Have a fire extinguisher nearby for emergencies\n\nRemember: Most beginner circuits use low voltages (3-12V) which are generally safe, but it's important to develop good safety habits from the start."
        }
      ]
    }
  },
  
  // Understanding Circuit Basics
  {
    id: 2,
    title: "Understanding Circuit Basics",
    description: "Learn the fundamental concepts of electrical circuits through interactive demonstrations and hands-on simulation.",
    image: "/placeholder.svg",
    duration: "30-45 min",
    difficulty: "beginner",
    completed: false,
    slug: "circuit-basics",
    category: "beginner",
    content: {
      sections: [
        {
          title: "What is a Circuit?",
          content: "An electrical circuit is a complete path that allows electricity to flow from a power source, through components, and back to the source.\n\nEvery circuit needs three basic elements:\n\n1. **Power Source**: Provides the electrical energy (like a battery or power supply)\n2. **Conductors**: Allow electricity to flow (typically wires)\n3. **Load**: Uses the electrical energy (like a light bulb, motor, or speaker)\n\nThink of electricity like water flowing through pipes. The battery is like a water pump creating pressure, wires are like pipes that direct the flow, and components like LEDs are like water wheels that use the energy.\n\nCircuits are all around us - in smartphones, computers, household appliances, and vehicles. Even the simplest flashlight contains a circuit with a battery, switch, and light bulb.",
          interactiveElements: [
            {
              type: "drag-drop",
              id: "circuit-components-match",
              title: "Match Circuit Components",
              description: "Drag each circuit element to its correct description",
              options: [
                { item: "Battery", matches: "Provides electrical energy" },
                { item: "Wire", matches: "Conducts electricity between components" },
                { item: "Resistor", matches: "Limits current flow" },
                { item: "Switch", matches: "Controls whether circuit is open or closed" },
                { item: "LED", matches: "Converts electrical energy to light" }
              ]
            }
          ]
        },
        {
          title: "Voltage, Current, and Resistance",
          content: "Let's explore the three fundamental properties of any electrical circuit:\n\n**Voltage (V)** is the electrical pressure or force that pushes electrons through a circuit. It's measured in volts (V). Think of voltage like the pressure in a water pipe.\n\n**Current (I)** is the rate at which electrons flow through a circuit. It's measured in amperes or amps (A). Think of current as the amount of water flowing through a pipe per second.\n\n**Resistance (R)** is how much a material opposes the flow of electricity. It's measured in ohms (Ω). Think of resistance like a narrow section in a pipe that restricts water flow.\n\nThese three properties are related by Ohm's Law: V = I × R\n\nThis means:\n- If voltage increases (with the same resistance), current increases\n- If resistance increases (with the same voltage), current decreases\n\nCommon values you'll encounter:\n- Batteries: 1.5V (AA/AAA), 9V\n- LEDs: 20mA (0.020A) typical current\n- Resistors: 220Ω, 1kΩ (1,000Ω), 10kΩ (10,000Ω)",
          interactiveElements: [
            {
              type: "slider",
              id: "ohms-law-interactive",
              title: "Ohm's Law Interactive",
              description: "Adjust voltage and resistance to see how current changes"
            },
            {
              type: "calculator",
              id: "ohms-law-calculator",
              title: "Ohm's Law Calculator",
              description: "Calculate the unknown value given the other two"
            }
          ]
        },
        {
          title: "Series vs. Parallel Circuits",
          content: "There are two primary ways to connect components in a circuit: in series or in parallel.\n\n**Series Circuits:**\n- Components are connected end-to-end in a single loop\n- The same current flows through all components\n- Voltage is divided among components\n- If one component fails, the entire circuit stops working\n- Example: Old-fashioned Christmas lights where one burnt bulb breaks the whole string\n\n**Parallel Circuits:**\n- Components are connected across common points\n- Voltage is the same across all components\n- Current is divided among different paths\n- If one component fails, others continue to work\n- Example: Home electrical outlets (one appliance can fail while others keep working)\n\nComparing the two configurations:\n\n| Aspect | Series | Parallel |\n|--------|--------|----------|\n| Current | Same through all parts | Divides between paths |\n| Voltage | Divides across components | Same across all branches |\n| Resistance | Rtotal = R1 + R2 + R3... | 1/Rtotal = 1/R1 + 1/R2 + 1/R3... |\n| If one component fails open | Entire circuit fails | Only that branch fails |\n| Application | Current-sensitive devices | Voltage-sensitive devices |",
          interactiveElements: [
            {
              type: "quiz",
              id: "circuit-type-quiz",
              title: "Circuit Type Identification",
              description: "Look at each circuit diagram and identify whether it's series, parallel, or mixed",
              options: [
                { image: "/placeholder.svg", answer: "series" },
                { image: "/placeholder.svg", answer: "parallel" },
                { image: "/placeholder.svg", answer: "mixed" },
                { image: "/placeholder.svg", answer: "parallel" }
              ]
            }
          ]
        },
        {
          title: "Interactive Basic Circuit Simulation",
          content: "Now it's time to build your first circuit! Follow the instructions on the right to create a simple LED circuit with a battery, resistor, and LED.\n\nIn this exercise, you'll:\n1. Place a 9V battery on the workspace\n2. Add a 220Ω resistor to limit current\n3. Add an LED (paying attention to its polarity)\n4. Connect the components correctly\n5. Run the simulation to see the LED light up\n6. Measure voltage at different points\n7. Experiment with different resistor values\n\nThis hands-on experience will help you understand how current flows through a circuit and how each component plays an important role.",
          simulatorState: "basic-led-circuit"
        },
        {
          title: "How This Circuit Works",
          content: "The circuit you just built demonstrates the fundamental principles of electricity and electronic components working together.\n\n**Current Flow:**\nWhen you complete the circuit, electrons flow from the negative terminal of the battery, through the wires, through the LED, through the resistor, and back to the positive terminal of the battery. This creates a closed loop that allows continuous current flow.\n\n**Role of Each Component:**\n\n**Battery**: The 9V battery serves as our power source. It creates an electrical potential difference (voltage) that pushes electrons through the circuit. The battery has a positive terminal (anode) and a negative terminal (cathode).\n\n**Resistor**: The 220Ω resistor limits the current flowing through the circuit. Without this resistor, too much current would flow through the LED, causing it to burn out immediately. The resistor creates a voltage drop according to Ohm's Law (V = I × R).\n\n**LED (Light Emitting Diode)**: The LED converts electrical energy into light. It is a semiconductor device that only allows current to flow in one direction (from anode to cathode). When current passes through the LED, electrons release energy in the form of photons (light).\n\n**Wires**: The wires provide a low-resistance path for current to flow between components.\n\n**Voltage Distribution:**\nIn this simple series circuit, the voltage from the battery (9V) is distributed across the components:\n- LED voltage drop: approximately 2V (depends on LED color)\n- Resistor voltage drop: approximately 7V\n- Total: 9V\n\n**Current Calculation:**\nUsing Ohm's Law, we can calculate the current flowing in the circuit:\n- Voltage across resistor = 7V\n- Resistance = 220Ω\n- Current = V/R = 7V/220Ω = 0.032A or 32mA\n\nThis current level is safe for most standard LEDs, which typically have a maximum current rating of 20-30mA.\n\n**What If Something Goes Wrong?**\n\n**LED Doesn't Light**: Check polarity! LEDs only work when connected in the correct direction. The longer leg is the anode (+) and should connect to the resistor.\n\n**LED Burns Out Quickly**: The resistor value may be too small. A smaller resistance allows more current to flow, potentially exceeding the LED's maximum rating.\n\n**Dim Light**: The resistor value may be too large, limiting the current too much. Try a smaller resistance value for a brighter light.\n\n**Try Experimenting!**\n- Change the resistor to see how it affects brightness\n- Measure the voltage at different points in the circuit\n- Try adding a switch to control the circuit\n- Connect two LEDs in series or parallel and observe the differences"
        },
        {
          title: "Circuit Practice Exercises",
          content: "Now that you understand the basics, try these progressively challenging circuit exercises:\n\n**Exercise 1: Add a Switch**\nAdd a switch to your LED circuit so you can control when it turns on and off. Place the switch between the battery and the resistor.\n\n**Exercise 2: Parallel LEDs**\nCreate a circuit with two LEDs connected in parallel, each with its own resistor. Notice how both LEDs receive the full battery voltage.\n\n**Exercise 3: Voltage Divider**\nBuild a voltage divider using two resistors (1kΩ and 10kΩ). Measure the voltage at the midpoint between the resistors. Can you predict what it will be before measuring?",
          simulatorState: "circuit-exercises",
          interactiveElements: [
            {
              type: "challenge",
              id: "switch-challenge",
              title: "Switch Control Challenge",
              description: "Add a switch to control the LED circuit"
            },
            {
              type: "challenge",
              id: "parallel-leds-challenge",
              title: "Parallel LEDs Challenge",
              description: "Build a circuit with two LEDs in parallel"
            },
            {
              type: "challenge",
              id: "voltage-divider-challenge",
              title: "Voltage Divider Challenge",
              description: "Create a voltage divider and predict the output"
            }
          ]
        }
      ],
      simulationActivity: {
        title: "Basic LED Circuit",
        description: "Build a simple LED circuit with a battery, resistor, and LED",
        components: ["9V Battery", "220Ω Resistor", "1kΩ Resistor", "10kΩ Resistor", "LED", "Switch", "Wires", "Multimeter"],
        instructions: [
          "Place the 9V battery on the left side of the workspace",
          "Place the 220Ω resistor to the right of the battery",
          "Place the LED to the right of the resistor, ensuring correct polarity",
          "Connect the battery's positive terminal to one end of the resistor",
          "Connect the other end of the resistor to the anode (longer leg) of the LED",
          "Connect the cathode (shorter leg) of the LED back to the negative terminal of the battery",
          "Run the simulation to see the LED light up",
          "Use the multimeter to measure voltage across different components"
        ],
        objectives: [
          "Build a working LED circuit",
          "Understand the function of each component",
          "Measure voltage and current in the circuit",
          "Experiment with different resistor values",
          "Complete the practice exercises"
        ],
        states: {
          "basic-led-circuit": {
            components: ["battery", "resistor-220", "led"],
            connections: []
          },
          "circuit-exercises": {
            components: ["battery", "resistor-220", "resistor-1k", "resistor-10k", "led", "led-2", "switch"],
            connections: []
          }
        }
      }
    }
  },
  
  // Essential Electronic Components
  {
    id: 3,
    title: "Essential Electronic Components",
    description: "Learn about fundamental electronic components including resistors, capacitors, LEDs, and switches.",
    image: "/placeholder.svg",
    duration: "40 min",
    difficulty: "beginner",
    completed: false,
    slug: "essential-components",
    category: "beginner",
    content: {
      sections: [
        {
          title: "Resistors: Function and Color Codes",
          content: "Resistors are fundamental components that limit current flow in a circuit. They convert electrical energy into heat by providing resistance to the flow of electrons.\n\nResistors come in various resistance values, measured in ohms (Ω). Common values range from a few ohms to millions of ohms (megaohms).\n\nMost resistors use a color code system to indicate their resistance value and tolerance. The color bands are read from left to right:\n- First band: First digit\n- Second band: Second digit\n- Third band: Multiplier\n- Fourth band: Tolerance\n\nFor example, a resistor with bands Brown, Black, Red, Gold has a value of 1,000Ω (1kΩ) with 5% tolerance."
        },
        {
          title: "Capacitors: Types and Functions",
          content: "Capacitors store electrical energy in an electric field. Unlike resistors that impede current, capacitors temporarily store and release charge.\n\nCapacitance is measured in farads (F), though most capacitors use smaller units like microfarads (μF) or picofarads (pF).\n\nCommon capacitor types include:\n- Ceramic: Small values, non-polarized, stable\n- Electrolytic: Larger values, polarized (+ and - terminals matter)\n- Tantalum: High capacity, stable, polarized\n- Film: Precise values, good for timing circuits\n\nCapacitors serve many functions in circuits: power supply filtering, coupling and decoupling signals, timing elements, and energy storage."
        },
        {
          title: "LEDs and Diodes",
          content: "Diodes are electronic components that allow current to flow in only one direction. They have two terminals: an anode (+) and a cathode (-). Current can flow from anode to cathode, but not in reverse.\n\nLEDs (Light Emitting Diodes) are special diodes that emit light when current flows through them. They come in various colors, sizes, and brightness levels.\n\nKey points about LEDs:\n- They have polarity - they must be connected in the correct direction\n- The longer lead is usually the anode (+), the shorter lead is the cathode (-)\n- They require current-limiting resistors to prevent damage\n- Different colors have different forward voltage drops (red: ~1.8V, blue: ~3.0V)"
        },
        {
          title: "Switches and Buttons",
          content: "Switches and buttons control the flow of electricity by creating an open or closed path in a circuit.\n\nCommon switch types include:\n- Toggle switches: Maintain their position (on/off)\n- Push buttons: Momentary contact only when pressed\n- DIP switches: Multiple tiny switches in one package\n- Slide switches: Slide mechanism for on/off\n\nSwitches are described by their poles and throws:\n- SPST (Single Pole, Single Throw): One input, one output, on/off\n- SPDT (Single Pole, Double Throw): One input, two possible outputs\n- DPDT (Double Pole, Double Throw): Two separate circuits controlled simultaneously"
        },
        {
          title: "Interactive Component Testing Lab",
          content: "In this interactive lab, you can test different electronic components and observe how they behave in various circuits.\n\nExperiment with:\n- Different resistor values and observe current changes\n- Capacitor charging and discharging cycles\n- LEDs of various colors with appropriate resistors\n- Different switch configurations controlling multiple components\n\nThe simulator provides measurements of voltage, current, and other parameters to help you understand component behavior.",
          simulatorState: "component-testing"
        }
      ]
    }
  },
  
  // Building Your First Projects
  {
    id: 4,
    title: "Building Your First Projects",
    description: "Apply your knowledge by building four practical electronic projects with increasing complexity.",
    image: "/placeholder.svg",
    duration: "60 min",
    difficulty: "beginner",
    completed: false,
    slug: "first-projects",
    category: "beginner",
    content: {
      sections: [
        {
          title: "Simple LED Circuit",
          content: "In this project, we'll build a basic LED circuit with a battery, resistor, LED, and switch. This is the foundation for many electronic devices that include indicator lights."
        },
        {
          title: "Light Sensor Circuit",
          content: "This project uses a photoresistor (light-dependent resistor) to detect ambient light levels. The resistance of the photoresistor decreases as light intensity increases, allowing us to create a circuit that responds to light conditions."
        },
        {
          title: "Blinking LED Circuit",
          content: "Creating a blinking LED circuit introduces the concept of timing. We'll use a capacitor and resistor to create an oscillator circuit that turns an LED on and off continuously."
        },
        {
          title: "Tone Generator Circuit",
          content: "This project builds an audio oscillator that produces a tone through a small speaker. By adjusting component values, you can change the pitch of the tone."
        },
        {
          title: "Project Troubleshooting Guide",
          content: "When building electronic projects, things don't always work as expected. This guide covers common issues and how to solve them:\n\n- LED doesn't light up: Check polarity, verify battery, check for loose connections\n- Inconsistent behavior: Look for loose wires or cold solder joints\n- Circuit works briefly then stops: Check for component heating or battery drainage\n- Unexpected readings: Verify your meter settings and connection points\n\nRemember: Troubleshooting is an essential skill for electronics. The ability to methodically identify and fix problems will serve you well as you tackle more complex projects."
        }
      ]
    }
  },
  
  // Introduction to Digital Logic
  {
    id: 5,
    title: "Introduction to Digital Logic",
    description: "Learn the basics of digital electronics, logic gates, and build simple digital circuits.",
    image: "/placeholder.svg",
    duration: "55 min",
    difficulty: "beginner",
    completed: false,
    slug: "digital-logic",
    category: "beginner",
    content: {
      sections: [
        {
          title: "Binary Logic Concepts",
          content: "Digital electronics works with just two voltage levels, represented as binary values 0 and 1 (or LOW and HIGH). This binary system is the foundation of all computers and digital devices."
        },
        {
          title: "Logic Gates Introduction",
          content: "Logic gates are the building blocks of digital circuits. Each gate performs a specific logical operation on one or more binary inputs and produces a single binary output.\n\nBasic logic gates include:\n- AND: Output is 1 only if all inputs are 1\n- OR: Output is 1 if any input is 1\n- NOT: Inverts the input (1 becomes 0, 0 becomes 1)\n- NAND: Combination of NOT and AND\n- NOR: Combination of NOT and OR\n- XOR: Output is 1 when inputs are different"
        },
        {
          title: "Simple Digital Circuits",
          content: "By combining logic gates, we can create circuits that perform useful functions like:\n- Half-adder: Adds two bits together\n- Latch: Stores a single bit of information\n- Decoder: Converts binary code to individual outputs\n- Multiplexer: Selects one of several input signals"
        },
        {
          title: "Binary Counter Project",
          content: "In this project, we'll build a 2-bit binary counter using flip-flops. The circuit counts from 0 to 3 in binary (00, 01, 10, 11) with each clock pulse, displayed on two LEDs."
        },
        {
          title: "Logic Analyzer Tutorial",
          content: "A logic analyzer shows the timing of digital signals. In this tutorial, we'll use the simulator's built-in logic analyzer to visualize signals in our digital circuits and understand timing relationships."
        }
      ]
    }
  },
  
  // Rest of the lessons
  // ... keep existing code
];

export const getLessonsByCategory = (category: LessonCategory): Lesson[] => {
  return lessons.filter(lesson => lesson.category === category);
};

export const getLessonBySlug = (slug: string): Lesson | undefined => {
  return lessons.find(lesson => lesson.slug === slug);
};
