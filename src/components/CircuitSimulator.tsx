
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Play, RotateCcw, AlertCircle, CheckCircle, Lightbulb, Battery, Component, Metering, Plus, Minus } from 'lucide-react';
import { SimulationActivity } from '@/data/lessonData';
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from '@/components/ui/tooltip';
import { toast } from 'sonner';

interface CircuitSimulatorProps {
  simulatorState?: string;
  simulationActivity?: SimulationActivity;
  onHighlightComponent?: (id: string) => void;
  currentState: string;
}

const CircuitSimulator: React.FC<CircuitSimulatorProps> = ({
  simulatorState,
  simulationActivity,
  onHighlightComponent,
  currentState
}) => {
  const [activeState, setActiveState] = useState('');
  const [simulationRunning, setSimulationRunning] = useState(false);
  const [circuitValid, setCircuitValid] = useState<boolean | null>(null);
  const [selectedTool, setSelectedTool] = useState<string | null>(null);
  const [placedComponents, setPlacedComponents] = useState<string[]>([]);
  const [connections, setConnections] = useState<{from: string, to: string}[]>([]);
  const [measurements, setMeasurements] = useState<{point: string, value: string, type: string}[]>([]);

  useEffect(() => {
    if (simulatorState) {
      setActiveState(simulatorState);
      setCircuitValid(null); // Reset validation when state changes
      
      // Load initial components if defined in the simulation activity state
      if (simulationActivity?.states && simulationActivity.states[simulatorState]) {
        const stateConfig = simulationActivity.states[simulatorState];
        setPlacedComponents(stateConfig.components || []);
        setConnections(
          stateConfig.connections?.map(conn => ({ from: conn[0], to: conn[1] })) || []
        );
        setMeasurements(
          stateConfig.measurements?.map(m => ({ 
            point: m.position, 
            value: m.value, 
            type: m.type 
          })) || []
        );
      } else {
        // Reset if no specific state configuration
        setPlacedComponents([]);
        setConnections([]);
        setMeasurements([]);
      }
    }
  }, [simulatorState, simulationActivity]);

  const handleComponentClick = (id: string) => {
    if (onHighlightComponent) {
      onHighlightComponent(id);
    }
    
    if (selectedTool === 'multimeter') {
      // Simulate taking a measurement
      const newMeasurement = {
        point: id,
        value: getMeasurementValue(id),
        type: 'voltage'
      };
      
      setMeasurements(prev => [...prev, newMeasurement]);
      toast.info(`Measured ${newMeasurement.type}: ${newMeasurement.value} at ${id}`);
    }
  };
  
  const getMeasurementValue = (componentId: string) => {
    // Simulate realistic measurements based on component
    if (componentId.includes('battery')) return '9V';
    if (componentId.includes('led')) return '2V';
    if (componentId.includes('resistor-220')) return '7V';
    if (componentId.includes('resistor-1k')) return '8V';
    return '0V';
  };

  const handleAddComponent = (component: string) => {
    setPlacedComponents(prev => [...prev, component]);
    toast.success(`Added ${component} to circuit`);
  };

  const handleConnect = (from: string, to: string) => {
    setConnections(prev => [...prev, {from, to}]);
    toast.success(`Connected ${from} to ${to}`);
  };

  const getStateConfig = () => {
    if (simulationActivity?.states && activeState in simulationActivity.states) {
      return simulationActivity.states[activeState];
    }
    return { components: [] };
  };

  const getStateDescription = () => {
    switch (activeState) {
      case 'empty':
        return "Let's get started with building our first circuit!";
      case 'components-showcase':
        return "Click on components to learn more about them.";
      case 'guided-build':
        return "Follow the instructions to build your first circuit.";
      case 'basic-led-circuit':
        return "Build a simple LED circuit with a battery, resistor, and LED.";
      case 'circuit-exercises':
        return "Complete the practice exercises to reinforce your knowledge.";
      case 'complete-circuit':
        return "Congratulations! Your circuit is complete.";
      case 'resistor-demo':
        return "Compare LEDs with and without current-limiting resistors.";
      case 'challenge':
        return "Add a switch to control the LED.";
      case 'component-testing':
        return "Test different components and observe their behavior.";
      case 'complete-challenge':
        return "Great job! You've completed the challenge.";
      default:
        return "Interactive circuit simulator";
    }
  };

  const runSimulation = () => {
    setSimulationRunning(true);
    
    // Simulate validation process
    setTimeout(() => {
      // In a real implementation, this would check the actual circuit
      const success = verifyCircuit();
      setCircuitValid(success);
      setSimulationRunning(false);
      
      if (success) {
        toast.success("Circuit is working correctly!");
      } else {
        toast.error("Circuit has issues. Check your connections.");
      }
    }, 1500);
  };
  
  const verifyCircuit = () => {
    // This is a simplified check - in a real implementation,
    // we would have more sophisticated validation logic
    
    // For basic-led-circuit, check if we have battery, resistor, and LED
    if (activeState === 'basic-led-circuit') {
      const hasRequiredComponents = 
        placedComponents.some(c => c.includes('battery')) &&
        placedComponents.some(c => c.includes('resistor')) &&
        placedComponents.some(c => c.includes('led'));
        
      const hasRequiredConnections = connections.length >= 2;
      
      return hasRequiredComponents && hasRequiredConnections;
    }
    
    // For other states, check if it includes "complete" in the name
    return activeState.includes('complete');
  };

  const resetSimulation = () => {
    setCircuitValid(null);
    setSimulationRunning(false);
    setMeasurements([]);
    
    // Optionally reset to initial state components
    if (simulationActivity?.states && simulationActivity.states[activeState]) {
      const stateConfig = simulationActivity.states[activeState];
      setPlacedComponents(stateConfig.components || []);
      setConnections([]);
    }
    
    toast.info("Simulation reset");
  };

  const renderComponent = (component: string) => {
    // This is a simplified representation. In a real implementation,
    // this would render actual interactive circuit components
    let icon = <Component className="w-6 h-6" />;
    let label = component;
    
    if (component.includes('battery')) {
      icon = <Battery className="w-6 h-6" />;
      label = "Battery";
    } else if (component.includes('led')) {
      icon = <Lightbulb className="w-6 h-6" />;
      label = "LED";
    } else if (component.includes('resistor')) {
      icon = <Component className="w-6 h-6" />;
      
      if (component.includes('220')) {
        label = "220Ω Resistor";
      } else if (component.includes('1k')) {
        label = "1kΩ Resistor";
      } else if (component.includes('10k')) {
        label = "10kΩ Resistor";
      } else {
        label = "Resistor";
      }
    } else if (component.includes('switch')) {
      icon = <Metering className="w-6 h-6" />;
      label = "Switch";
    }
    
    return (
      <div 
        key={component} 
        className={`inline-block m-2 p-2 bg-white border border-gray-200 rounded shadow-sm cursor-pointer ${
          circuitValid === true ? 'ring-2 ring-green-400' : 
          circuitValid === false ? 'ring-2 ring-red-400' : ''
        }`}
        onClick={() => handleComponentClick(component)}
      >
        <div className="text-center">
          <div className="w-12 h-12 bg-gray-100 rounded-full mx-auto mb-2 flex items-center justify-center">
            {icon}
          </div>
          <p className="text-xs font-medium">{label}</p>
        </div>
      </div>
    );
  };
  
  const renderToolbar = () => (
    <div className="flex items-center justify-center my-3 bg-gray-50 p-2 rounded-md border border-gray-200">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              className={`mx-1 ${selectedTool === 'wire' ? 'bg-blue-100' : ''}`}
              onClick={() => setSelectedTool('wire')}
            >
              <div className="w-5 h-1 bg-blue-600 rounded-full"></div>
              <span className="sr-only">Wire Tool</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>Wire Tool</TooltipContent>
        </Tooltip>
        
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              className={`mx-1 ${selectedTool === 'multimeter' ? 'bg-blue-100' : ''}`}
              onClick={() => setSelectedTool('multimeter')}
            >
              <Metering className="w-5 h-5" />
              <span className="sr-only">Multimeter</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>Multimeter</TooltipContent>
        </Tooltip>
        
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon"
              className="mx-1"
              onClick={() => setSelectedTool(null)}
            >
              <Plus className="w-5 h-5" />
              <span className="sr-only">Add Component</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>Add Component</TooltipContent>
        </Tooltip>
        
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon"
              className="mx-1"
              onClick={() => {
                if (placedComponents.length > 0) {
                  setPlacedComponents(prev => prev.slice(0, -1));
                  toast.info("Removed last component");
                }
              }}
            >
              <Minus className="w-5 h-5" />
              <span className="sr-only">Remove Component</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>Remove Component</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );

  const renderStateMessage = () => {
    if (circuitValid === true) {
      return (
        <div className="p-3 bg-green-100 text-green-800 rounded-lg flex items-center my-2">
          <CheckCircle className="w-5 h-5 mr-2" />
          <span>Circuit is working correctly!</span>
        </div>
      );
    } else if (circuitValid === false) {
      return (
        <div className="p-3 bg-red-100 text-red-800 rounded-lg flex items-center my-2">
          <AlertCircle className="w-5 h-5 mr-2" />
          <span>Circuit has issues. Check your connections.</span>
        </div>
      );
    }
    return null;
  };
  
  const renderMeasurements = () => {
    if (measurements.length === 0) return null;
    
    return (
      <div className="mb-3 p-2 bg-yellow-50 border border-yellow-100 rounded-lg">
        <h4 className="text-sm font-medium mb-1">Measurements</h4>
        <div className="space-y-1">
          {measurements.map((m, index) => (
            <div key={index} className="flex justify-between text-xs p-1 bg-white rounded border border-yellow-200">
              <span>{m.point}</span>
              <span className="font-mono">{m.value}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col border border-gray-200 rounded-lg overflow-hidden bg-gray-50">
      <div className="p-3 border-b border-gray-200 bg-white flex justify-between items-center">
        <div>
          <h3 className="font-medium text-sm">Circuit Simulator</h3>
          <p className="text-xs text-muted-foreground">{getStateDescription()}</p>
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant={simulationRunning ? "outline" : "default"}
            onClick={runSimulation}
            disabled={simulationRunning}
          >
            <Play className="w-4 h-4 mr-1" />
            Run
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={resetSimulation}
          >
            <RotateCcw className="w-4 h-4 mr-1" />
            Reset
          </Button>
        </div>
      </div>
      
      {renderStateMessage()}
      {renderMeasurements()}
      
      <div className="flex-1 p-4">
        {currentState === "Meet the Components" || activeState === "components-showcase" ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 justify-items-center">
            {getStateConfig().components.map(renderComponent)}
          </div>
        ) : (
          <div className="h-full flex flex-col">
            {renderToolbar()}
            
            <div className="flex-1 bg-gray-100 rounded-lg border border-dashed border-gray-300">
              <div className="h-full p-3">
                {simulationRunning && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/10 z-10">
                    <div className="p-4 bg-white rounded shadow-lg">
                      <p className="text-center">Running simulation...</p>
                    </div>
                  </div>
                )}
                
                {placedComponents.length > 0 ? (
                  <div className="flex flex-wrap gap-3">
                    {placedComponents.map(renderComponent)}
                    
                    {connections.map((conn, idx) => (
                      <div key={`conn-${idx}`} className="text-xs text-blue-600 py-1">
                        {conn.from} → {conn.to}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <div className="text-center p-4">
                      <p className="text-sm text-gray-500">
                        Drag components here to build your circuit
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="mt-3 p-2 bg-white rounded-lg border border-gray-200 shadow-sm">
              <div className="grid grid-cols-2 gap-2">
                {simulationActivity && simulationActivity.components.slice(0, 6).map((comp, idx) => (
                  <Button 
                    key={idx}
                    variant="outline" 
                    size="sm"
                    className="text-xs h-auto py-1"
                    onClick={() => handleAddComponent(`${comp.toLowerCase().replace(/\s+/g, '-')}-${idx}`)}
                  >
                    {comp}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CircuitSimulator;
