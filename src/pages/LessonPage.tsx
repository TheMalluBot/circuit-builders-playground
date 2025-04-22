
import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ChevronLeft,
  ChevronRight,
  Clock,
  BookOpen,
  Layout,
  CheckCircle,
  PlayCircle,
  Layers,
  List,
  Settings
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import CircuitComponent from '@/components/CircuitComponent';
import { getLessonBySlug } from '@/data/lessonData';
import { components } from '@/data/componentData';

const LessonPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const lesson = getLessonBySlug(slug || '');
  const [activeTab, setActiveTab] = useState<'learn' | 'simulator'>('learn');
  const [activeSection, setActiveSection] = useState(0);
  
  if (!lesson) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navigation />
        <div className="container py-12 text-center">
          <h1 className="text-3xl font-bold mb-4">Lesson not found</h1>
          <p className="text-muted-foreground mb-6">
            The lesson you're looking for doesn't exist.
          </p>
          <Button asChild>
            <Link to="/lessons/beginner">Back to Lessons</Link>
          </Button>
        </div>
        <Footer />
      </div>
    );
  }
  
  // For demo purposes, let's assume these are steps in the lesson
  const lessonSteps = lesson.content?.sections?.map((section, index) => ({
    id: index + 1,
    title: section.title,
    completed: index < activeSection
  })) || [
    {
      id: 1,
      title: "What is a Circuit?",
      completed: true
    },
    {
      id: 2,
      title: "Basic Components",
      completed: true
    },
    {
      id: 3,
      title: "Ohm's Law",
      completed: false
    },
    {
      id: 4,
      title: "Circuit Analysis",
      completed: false
    }
  ];
  
  // Just use a subset of components for the demo
  const availableComponents = components.slice(0, 6);
  
  // Get the current section content
  const currentSection = lesson.content?.sections?.[activeSection];
  const nextSection = lesson.content?.sections?.[activeSection + 1];
  const prevSection = activeSection > 0 ? lesson.content?.sections?.[activeSection - 1] : null;
  
  // Calculate lesson progress
  const totalSections = lesson.content?.sections?.length || 4;
  const progress = Math.round((activeSection / totalSections) * 100);
  
  const handleNextSection = () => {
    if (lesson.content?.sections && activeSection < lesson.content.sections.length - 1) {
      setActiveSection(activeSection + 1);
    }
  };
  
  const handlePrevSection = () => {
    if (activeSection > 0) {
      setActiveSection(activeSection - 1);
    }
  };
  
  const simulationActivity = lesson.content?.simulationActivity;
  
  return (
    <div className="flex flex-col min-h-screen">
      <Navigation />
      
      <main className="flex-1">
        <div className="container py-8">
          <div className="flex items-center gap-2 mb-4">
            <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors text-sm">
              Home
            </Link>
            <span className="text-muted-foreground">/</span>
            <Link to={`/lessons/${lesson.category}`} className="text-muted-foreground hover:text-foreground transition-colors text-sm">
              {lesson.category.charAt(0).toUpperCase() + lesson.category.slice(1)} Lessons
            </Link>
            <span className="text-muted-foreground">/</span>
            <span className="text-sm">{lesson.title}</span>
          </div>
          
          <div className="flex flex-col lg:flex-row justify-between items-start gap-6">
            <div className="w-full lg:w-2/3">
              <h1 className="text-3xl font-bold mb-4">{lesson.title}</h1>
              
              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6">
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  <span>{lesson.duration}</span>
                </div>
                <div className="flex items-center">
                  <span className="capitalize">{lesson.difficulty}</span>
                </div>
              </div>
              
              <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden mb-8">
                <div className="border-b border-gray-200">
                  <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'learn' | 'simulator')}>
                    <TabsList className="p-0 h-auto bg-transparent border-b border-gray-200 w-full flex rounded-none">
                      <TabsTrigger 
                        value="learn" 
                        className="flex-1 py-3 rounded-none data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary"
                      >
                        <BookOpen className="w-4 h-4 mr-2" />
                        <span>Learn</span>
                      </TabsTrigger>
                      <TabsTrigger 
                        value="simulator" 
                        className="flex-1 py-3 rounded-none data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary"
                      >
                        <Layout className="w-4 h-4 mr-2" />
                        <span>Simulator</span>
                      </TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="learn" className="m-0 p-6">
                      {currentSection ? (
                        <>
                          <h2 className="text-xl font-medium mb-4">{currentSection.title}</h2>
                          <div className="prose max-w-none">
                            {currentSection.content.split('\n\n').map((paragraph, i) => (
                              <p key={i} className="text-muted-foreground mb-4">
                                {paragraph.includes('\n- ') ? (
                                  <>
                                    {paragraph.split('\n- ')[0]}
                                    <ul className="list-disc pl-6 mt-2 space-y-1">
                                      {paragraph.split('\n- ').slice(1).map((item, j) => (
                                        <li key={j} className="text-muted-foreground">{item}</li>
                                      ))}
                                    </ul>
                                  </>
                                ) : (
                                  paragraph
                                )}
                              </p>
                            ))}
                          </div>
                        </>
                      ) : (
                        <>
                          <h2 className="text-xl font-medium mb-2">Lesson Content</h2>
                          <p className="text-muted-foreground mb-6">
                            {lesson.description} This is where the detailed lesson content would be displayed,
                            with text, images, and interactive elements to help you learn about circuits.
                          </p>
                          
                          <h3 className="text-lg font-medium mb-3">What is a Circuit?</h3>
                          <p className="text-muted-foreground mb-4">
                            An electrical circuit is a path in which electrons flow from a voltage or current source.
                            The point where those electrons enter an electrical circuit is called the "source" of electrons.
                            The point where the electrons leave an electrical circuit is called the "return" or "earth ground".
                          </p>
                          
                          <div className="bg-gray-100 p-4 rounded-lg mb-6">
                            <h4 className="font-medium mb-2">Components of a Basic Circuit</h4>
                            <ul className="list-disc list-inside text-muted-foreground space-y-1">
                              <li>Power Source (Battery, Power Supply)</li>
                              <li>Conductive Path (Wires, Traces)</li>
                              <li>Load (Resistor, LED, Motor)</li>
                              <li>Control Element (Switch, Transistor)</li>
                            </ul>
                          </div>
                          
                          <h3 className="text-lg font-medium mb-3">Key Concepts</h3>
                          <p className="text-muted-foreground mb-4">
                            Electricity always flows in a complete loop, from the power source, through the circuit, and back to the source.
                            This is why a broken circuit (like an open switch) stops the flow of electricity.
                          </p>
                        </>
                      )}
                      
                      <div className="flex justify-between mt-8">
                        <Button 
                          variant="outline" 
                          onClick={handlePrevSection}
                          disabled={!prevSection}
                        >
                          <ChevronLeft className="w-4 h-4 mr-2" />
                          Previous
                        </Button>
                        
                        <Button 
                          onClick={handleNextSection}
                          disabled={!nextSection}
                        >
                          Next
                          <ChevronRight className="w-4 h-4 ml-2" />
                        </Button>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="simulator" className="m-0">
                      <div className="p-6 border-b border-gray-200">
                        <h2 className="text-xl font-medium mb-2">Circuit Simulator</h2>
                        {simulationActivity ? (
                          <div>
                            <h3 className="font-medium text-lg mb-3">{simulationActivity.title}</h3>
                            <p className="text-muted-foreground mb-4">{simulationActivity.description}</p>
                            
                            <div className="mb-4">
                              <h4 className="font-medium mb-2">Components:</h4>
                              <div className="flex flex-wrap gap-2">
                                {simulationActivity.components.map((component, index) => (
                                  <span key={index} className="bg-blue-100 text-blue-800 text-xs font-medium py-1 px-2 rounded">
                                    {component}
                                  </span>
                                ))}
                              </div>
                            </div>
                            
                            <div className="mb-4">
                              <h4 className="font-medium mb-2">Objectives:</h4>
                              <ul className="list-disc list-inside text-muted-foreground">
                                {simulationActivity.objectives.map((objective, index) => (
                                  <li key={index}>{objective}</li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        ) : (
                          <p className="text-muted-foreground">
                            Build and test the circuit from this lesson in our interactive simulator.
                          </p>
                        )}
                      </div>
                      
                      <div className="flex flex-col lg:flex-row h-[500px]">
                        <div className="w-full lg:w-64 p-4 border-r border-gray-200 overflow-y-auto">
                          <h3 className="font-medium mb-3">Components</h3>
                          <div className="grid grid-cols-2 lg:grid-cols-1 gap-3">
                            {availableComponents.map(component => (
                              <CircuitComponent
                                key={component.id}
                                name={component.name}
                                icon={component.icon}
                                description={component.description}
                              />
                            ))}
                          </div>
                        </div>
                        
                        <div className="flex-1 relative">
                          <div className="simulator-grid h-full w-full p-4">
                            {simulationActivity ? (
                              <div className="h-full flex flex-col">
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                                  <h4 className="font-medium mb-2">Instructions:</h4>
                                  <ol className="list-decimal list-inside text-muted-foreground space-y-2">
                                    {simulationActivity.instructions.map((instruction, index) => (
                                      <li key={index}>{instruction}</li>
                                    ))}
                                  </ol>
                                </div>
                                
                                <div className="flex-1 flex items-center justify-center">
                                  <div className="text-center">
                                    <img src="/placeholder.svg" alt="Circuit" className="w-32 h-32 mx-auto mb-4 opacity-30" />
                                    <p className="text-muted-foreground mb-3">Drag components to build your circuit</p>
                                    <Button variant="outline" size="sm">
                                      <PlayCircle className="w-4 h-4 mr-2" />
                                      <span>Watch Tutorial</span>
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <div className="flex items-center justify-center h-full">
                                <div className="text-center">
                                  <img src="/placeholder.svg" alt="Circuit" className="w-32 h-32 mx-auto mb-4 opacity-30" />
                                  <p className="text-muted-foreground mb-3">Drag components from the left panel to start building your circuit</p>
                                  <Button variant="outline" size="sm">
                                    <PlayCircle className="w-4 h-4 mr-2" />
                                    <span>Watch Tutorial</span>
                                  </Button>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>
              </div>
            </div>
            
            <div className="w-full lg:w-1/3">
              <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden mb-6">
                <div className="p-4 border-b border-gray-200">
                  <h3 className="font-medium">Lesson Progress</h3>
                </div>
                <div className="p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm">{progress}% Complete</span>
                    <span className="text-sm text-muted-foreground">{activeSection}/{totalSections} Sections</span>
                  </div>
                  <Progress value={progress} className="h-2 mb-6" />
                  
                  <div className="space-y-3">
                    {lessonSteps.map(step => (
                      <div 
                        key={step.id} 
                        className={`flex items-center p-2 rounded-md cursor-pointer ${step.completed ? 'bg-green-50' : activeSection === step.id - 1 ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
                        onClick={() => setActiveSection(step.id - 1)}
                      >
                        {step.completed ? (
                          <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                        ) : activeSection === step.id - 1 ? (
                          <div className="w-5 h-5 rounded-full border-2 border-blue-500 mr-3 flex-shrink-0 flex items-center justify-center">
                            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                          </div>
                        ) : (
                          <div className="w-5 h-5 rounded-full border-2 border-gray-300 mr-3 flex-shrink-0"></div>
                        )}
                        <span className={activeSection === step.id - 1 ? 'font-medium' : ''}>{step.title}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="text-base">Key Concepts</CardTitle>
                  <CardDescription>Important ideas covered in this lesson</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex gap-2 items-start">
                      <Layers className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-medium text-sm">Circuit Components</h4>
                        <p className="text-sm text-muted-foreground">Understand the basic building blocks of circuits</p>
                      </div>
                    </div>
                    <div className="flex gap-2 items-start">
                      <List className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-medium text-sm">Circuit Connections</h4>
                        <p className="text-sm text-muted-foreground">Learn how to connect components correctly</p>
                      </div>
                    </div>
                    <div className="flex gap-2 items-start">
                      <Settings className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-medium text-sm">Circuit Analysis</h4>
                        <p className="text-sm text-muted-foreground">Techniques to understand circuit behavior</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                <div className="p-4 border-b border-gray-200">
                  <h3 className="font-medium">Next Steps</h3>
                </div>
                <div className="p-4">
                  <ul className="space-y-4">
                    <li>
                      <Link to={`/lessons/resistors-ohms-law`} className="group block">
                        <h4 className="font-medium group-hover:text-primary transition-colors">Resistors and Ohm's Law</h4>
                        <p className="text-sm text-muted-foreground">Learn about current limitation and calculation</p>
                      </Link>
                    </li>
                    <li>
                      <Link to={`/lessons/series-parallel-circuits`} className="group block">
                        <h4 className="font-medium group-hover:text-primary transition-colors">Series and Parallel Circuits</h4>
                        <p className="text-sm text-muted-foreground">Understand different ways to connect components</p>
                      </Link>
                    </li>
                    <li>
                      <Link to={`/lessons/led-flashlight`} className="group block">
                        <h4 className="font-medium group-hover:text-primary transition-colors">Building a Basic LED Flashlight</h4>
                        <p className="text-sm text-muted-foreground">Apply your knowledge to create a useful device</p>
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default LessonPage;
