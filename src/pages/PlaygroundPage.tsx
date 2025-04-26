
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Save,
  Download,
  Upload,
  Play,
  Pause,
  RotateCcw,
  Trash2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import CircuitComponent from '@/components/CircuitComponent';
import CircuitSimulator from '@/components/CircuitSimulator';
import { components, getComponentsByCategory } from '@/data/componentData';

const PlaygroundPage = () => {
  const [simulatorState, setSimulatorState] = useState('empty');
  const [highlightedComponent, setHighlightedComponent] = useState<string | null>(null);
  
  const passiveComponents = getComponentsByCategory('passive');
  const activeComponents = getComponentsByCategory('active');
  const powerComponents = getComponentsByCategory('power');
  const logicComponents = getComponentsByCategory('logic');
  
  const handleComponentHighlight = (id: string) => {
    setHighlightedComponent(id);
    setTimeout(() => setHighlightedComponent(null), 1500);
  };
  
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
            <span className="text-sm">Circuit Playground</span>
          </div>
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-2">Circuit Playground</h1>
              <p className="text-muted-foreground">Design, build, and test your own circuits</p>
            </div>
            
            <div className="flex gap-2 flex-wrap">
              <Button size="sm" variant="outline" className="gap-1">
                <Save className="w-4 h-4" />
                <span>Save</span>
              </Button>
              <Button size="sm" variant="outline" className="gap-1">
                <Download className="w-4 h-4" />
                <span>Download</span>
              </Button>
              <Button size="sm" variant="outline" className="gap-1">
                <Upload className="w-4 h-4" />
                <span>Import</span>
              </Button>
            </div>
          </div>
          
          <div className="grid lg:grid-cols-4 gap-6 mb-6">
            <div className="lg:col-span-3">
              <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden h-[600px]">
                {/* Pass enhanced simulator component */}
                <CircuitSimulator 
                  simulatorState={simulatorState}
                  simulationActivity={{
                    title: "Circuit Playground",
                    description: "Design and test circuits",
                    components: [
                      "Battery", "Resistor", "LED", "Capacitor", 
                      "Switch", "Diode", "Transistor"
                    ],
                    states: {
                      empty: { 
                        components: [] 
                      },
                      "basic-led-circuit": {
                        components: ["battery", "resistor", "led"],
                        connections: [["battery-0", "resistor-0"], ["resistor-0", "led-0"]]
                      },
                      "components-showcase": {
                        components: [
                          "battery", "resistor-220", "resistor-1k", 
                          "led", "capacitor", "switch"
                        ]
                      }
                    },
                    instructions: "Follow the guided instructions to build circuits",
                    objectives: ["Learn basic components", "Build working circuits", "Understand electrical principles"]
                  }}
                  onHighlightComponent={handleComponentHighlight}
                  currentState="Build Circuit"
                />
              </div>
            </div>
            
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
              <div className="p-4 border-b border-gray-200">
                <h2 className="font-semibold">Components</h2>
              </div>
              
              <div className="h-[548px] overflow-y-auto">
                <Tabs defaultValue="passive">
                  <TabsList className="p-2 bg-transparent w-full grid grid-cols-4 h-auto">
                    <TabsTrigger value="passive" className="text-xs h-8">Passive</TabsTrigger>
                    <TabsTrigger value="active" className="text-xs h-8">Active</TabsTrigger>
                    <TabsTrigger value="power" className="text-xs h-8">Power</TabsTrigger>
                    <TabsTrigger value="logic" className="text-xs h-8">Logic</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="passive" className="m-0 p-3">
                    <div className="grid grid-cols-2 gap-3">
                      {passiveComponents.map(component => (
                        <CircuitComponent
                          key={component.id}
                          name={component.name}
                          icon={component.icon}
                          description={component.description}
                          highlight={highlightedComponent === component.name}
                        />
                      ))}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="active" className="m-0 p-3">
                    <div className="grid grid-cols-2 gap-3">
                      {activeComponents.map(component => (
                        <CircuitComponent
                          key={component.id}
                          name={component.name}
                          icon={component.icon}
                          description={component.description}
                          highlight={highlightedComponent === component.name}
                        />
                      ))}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="power" className="m-0 p-3">
                    <div className="grid grid-cols-2 gap-3">
                      {powerComponents.map(component => (
                        <CircuitComponent
                          key={component.id}
                          name={component.name}
                          icon={component.icon}
                          description={component.description}
                          highlight={highlightedComponent === component.name}
                        />
                      ))}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="logic" className="m-0 p-3">
                    <div className="grid grid-cols-2 gap-3">
                      {logicComponents.map(component => (
                        <CircuitComponent
                          key={component.id}
                          name={component.name}
                          icon={component.icon}
                          description={component.description}
                          highlight={highlightedComponent === component.name}
                        />
                      ))}
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
            <h2 className="text-xl font-bold mb-4">Getting Started with the Circuit Playground</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h3 className="font-medium mb-2">1. Choose Components</h3>
                <p className="text-sm text-muted-foreground">
                  Select components from the panel and drag them onto the workspace.
                </p>
              </div>
              <div>
                <h3 className="font-medium mb-2">2. Make Connections</h3>
                <p className="text-sm text-muted-foreground">
                  Use the wire tool to connect components and create a circuit.
                </p>
              </div>
              <div>
                <h3 className="font-medium mb-2">3. Run Simulation</h3>
                <p className="text-sm text-muted-foreground">
                  Click the Run button to see how your circuit behaves in real-time.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default PlaygroundPage;
