
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Play, RotateCcw, AlertCircle, CheckCircle } from 'lucide-react';
import { SimulationActivity } from '@/data/lessonData';

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

  useEffect(() => {
    if (simulatorState) {
      setActiveState(simulatorState);
      setCircuitValid(null); // Reset validation when state changes
    }
  }, [simulatorState]);

  const handleComponentClick = (id: string) => {
    if (onHighlightComponent) {
      onHighlightComponent(id);
    }
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
      case 'complete-circuit':
        return "Congratulations! Your circuit is complete.";
      case 'resistor-demo':
        return "Compare LEDs with and without current-limiting resistors.";
      case 'challenge':
        return "Add a switch to control the LED.";
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
      setCircuitValid(activeState.includes('complete'));
      setSimulationRunning(false);
    }, 1500);
  };

  const resetSimulation = () => {
    setCircuitValid(null);
    setSimulationRunning(false);
  };

  const renderComponent = (component: string) => {
    // This is a simplified representation. In a real implementation,
    // this would render actual interactive circuit components
    return (
      <div 
        key={component} 
        className="inline-block m-2 p-2 bg-white border border-gray-200 rounded shadow-sm cursor-pointer"
        onClick={() => handleComponentClick(component)}
      >
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-2 flex items-center justify-center">
            <img 
              src="/placeholder.svg" 
              alt={component} 
              className="w-10 h-10 object-contain"
            />
          </div>
          <p className="text-xs font-medium">{component}</p>
        </div>
      </div>
    );
  };

  const renderStateMessage = () => {
    if (circuitValid === true) {
      return (
        <div className="p-3 bg-green-100 text-green-800 rounded-lg flex items-center">
          <CheckCircle className="w-5 h-5 mr-2" />
          <span>Circuit is working correctly!</span>
        </div>
      );
    } else if (circuitValid === false) {
      return (
        <div className="p-3 bg-red-100 text-red-800 rounded-lg flex items-center">
          <AlertCircle className="w-5 h-5 mr-2" />
          <span>Circuit has issues. Check your connections.</span>
        </div>
      );
    }
    return null;
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
      
      <div className="flex-1 p-4">
        {currentState === "Meet the Components" ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 justify-items-center">
            {getStateConfig().components.map(renderComponent)}
          </div>
        ) : (
          <div className="h-full flex items-center justify-center bg-gray-100 rounded-lg border border-dashed border-gray-300">
            <div className="text-center p-4">
              {getStateConfig().components.length > 0 ? (
                <>
                  <div className="flex flex-wrap justify-center gap-4 mb-4">
                    {getStateConfig().components.map(renderComponent)}
                  </div>
                  <div className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
                    <p className="text-sm mb-2">Circuit Workspace</p>
                    <div className="w-full h-40 bg-gray-50 border border-gray-200 rounded flex items-center justify-center">
                      <p className="text-sm text-gray-500">
                        {simulationRunning 
                          ? "Running simulation..." 
                          : activeState.includes('complete')
                            ? "Circuit complete!"
                            : "Drag components here to build your circuit"}
                      </p>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-muted-foreground">
                  <p className="mb-2">Welcome to the Circuit Simulator!</p>
                  <p className="text-sm">Follow the lesson instructions to start building circuits.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CircuitSimulator;
