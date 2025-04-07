
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
}

export const lessons: Lesson[] = [
  // Beginner Lessons
  {
    id: 1,
    title: "Introduction to Circuits",
    description: "Learn the basics of electrical circuits and understand Ohm's Law.",
    image: "/placeholder.svg",
    duration: "30 min",
    difficulty: "beginner",
    completed: false,
    slug: "intro-to-circuits",
    category: "beginner"
  },
  {
    id: 2,
    title: "Series vs. Parallel Circuits",
    description: "Understand the difference between series and parallel connections.",
    image: "/placeholder.svg",
    duration: "45 min",
    difficulty: "beginner",
    completed: false,
    slug: "series-vs-parallel",
    category: "beginner"
  },
  {
    id: 3,
    title: "Basic Circuit Analysis",
    description: "Learn how to analyze simple circuits using Kirchhoff's laws.",
    image: "/placeholder.svg",
    duration: "40 min",
    difficulty: "beginner",
    completed: false,
    slug: "basic-circuit-analysis",
    category: "beginner"
  },
  {
    id: 4,
    title: "Introduction to Sensors",
    description: "Explore different types of sensors and how to use them in circuits.",
    image: "/placeholder.svg",
    duration: "35 min",
    difficulty: "beginner",
    completed: false,
    slug: "intro-to-sensors",
    category: "beginner"
  },
  
  // Intermediate Lessons
  {
    id: 5,
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
    id: 6,
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
    id: 7,
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
    id: 8,
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
    id: 9,
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
    id: 10,
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
    id: 11,
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
    id: 12,
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
