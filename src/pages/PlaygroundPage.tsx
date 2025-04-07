
import React from 'react';
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
import { components, getComponentsByCategory } from '@/data/componentData';

const PlaygroundPage = () => {
  const passiveComponents = getComponentsByCategory('passive');
  const activeComponents = getComponentsByCategory('active');
  const powerComponents = getComponentsByCategory('power');
  const logicComponents = getComponentsByCategory('logic');
  
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
          
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden mb-4">
            <div className="flex gap-2 p-2 border-b border-gray-200">
              <Button size="sm" variant="default" className="gap-1">
                <Play className="w-4 h-4" />
                <span>Run</span>
              </Button>
              <Button size="sm" variant="outline" className="gap-1">
                <Pause className="w-4 h-4" />
                <span>Pause</span>
              </Button>
              <Button size="sm" variant="outline" className="gap-1">
                <RotateCcw className="w-4 h-4" />
                <span>Reset</span>
              </Button>
              <div className="ml-auto">
                <Button size="sm" variant="destructive" className="gap-1">
                  <Trash2 className="w-4 h-4" />
                  <span>Clear</span>
                </Button>
              </div>
            </div>
            
            <div className="flex flex-col lg:flex-row h-[600px]">
              <div className="w-full lg:w-72 border-r border-gray-200 overflow-y-auto">
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
                        />
                      ))}
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
              
              <div className="flex-1 relative">
                <div className="simulator-grid h-full w-full p-4">
                  {/* This would be the actual simulator canvas */}
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <img src="/placeholder.svg" alt="Circuit" className="w-32 h-32 mx-auto mb-4 opacity-30" />
                      <p className="text-muted-foreground mb-3">Drag components from the left panel to start building your circuit</p>
                      <p className="text-sm text-muted-foreground max-w-md">
                        Connect components by clicking and dragging between terminals. 
                        Use the toolbar above to simulate your circuit.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
            <h2 className="text-xl font-bold mb-4">Getting Started with the Circuit Playground</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h3 className="font-medium mb-2">1. Choose Components</h3>
                <p className="text-sm text-muted-foreground">
                  Select components from the left panel and drag them onto the workspace.
                </p>
              </div>
              <div>
                <h3 className="font-medium mb-2">2. Make Connections</h3>
                <p className="text-sm text-muted-foreground">
                  Connect components by clicking and dragging between terminals.
                </p>
              </div>
              <div>
                <h3 className="font-medium mb-2">3. Run Simulation</h3>
                <p className="text-sm text-muted-foreground">
                  Click the Run button to see how your circuit behaves.
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
