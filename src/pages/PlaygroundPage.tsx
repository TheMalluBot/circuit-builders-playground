
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Save,
  Download,
  Upload
} from 'lucide-react';
import { Button } from '@/components/ui/button';

import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { CircuitPlayground } from '@/components/interactive';
import { SimulationActivity } from '@/types/simulator';

const PlaygroundPage = () => {
  const [simulatorState, setSimulatorState] = useState('empty');
  const [highlightedComponent, setHighlightedComponent] = useState<string | null>(null);
  
  const simulationActivity: SimulationActivity = {
    title: "Circuit Playground",
    description: "Design and test circuits",
    components: [
      "battery", "resistor", "led", "switch"
    ],
    states: {
      empty: { 
        components: [] 
      },
      "basic-led-circuit": {
        components: ["battery", "resistor", "led"],
        connections: [["battery-positive", "resistor-p1"], ["resistor-p2", "led-anode"], ["led-cathode", "battery-negative"]]
      },
      "switch-led-circuit": {
        components: ["battery", "switch", "led"],
        connections: [["battery-positive", "switch-p1"], ["switch-p2", "led-anode"], ["led-cathode", "battery-negative"]]
      }
    },
    instructions: ["Drag components from the panel to build your circuit", "Connect components by clicking on pins", "Use the play button to simulate your circuit"],
    objectives: ["Learn basic components", "Build working circuits", "Understand electrical principles"]
  };
  
  const handleComponentHighlight = (id: string) => {
    setHighlightedComponent(id);
    setTimeout(() => setHighlightedComponent(null), 1500);
  };
  
  const handleStateChange = (state: string) => {
    setSimulatorState(state);
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
          
          <CircuitPlayground className="mb-6" />
          
          <div className="mt-4 flex gap-2">
            <Button 
              size="sm" 
              variant={simulatorState === 'empty' ? 'default' : 'outline'}
              onClick={() => handleStateChange('empty')}
            >
              Empty Circuit
            </Button>
            <Button 
              size="sm" 
              variant={simulatorState === 'basic-led-circuit' ? 'default' : 'outline'}
              onClick={() => handleStateChange('basic-led-circuit')}
            >
              Basic LED Circuit
            </Button>
            <Button 
              size="sm" 
              variant={simulatorState === 'switch-led-circuit' ? 'default' : 'outline'}
              onClick={() => handleStateChange('switch-led-circuit')}
            >
              LED Switch Circuit
            </Button>
          </div>
          
          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 mt-8">
            <h2 className="text-xl font-bold mb-4">Getting Started with the Circuit Playground</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h3 className="font-medium mb-2">1. Choose Components</h3>
                <p className="text-sm text-muted-foreground">
                  Drag components from the panel onto the workspace or click the component and then the canvas.
                </p>
              </div>
              <div>
                <h3 className="font-medium mb-2">2. Make Connections</h3>
                <p className="text-sm text-muted-foreground">
                  Click on a pin and drag to another pin to create a wire connection.
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
