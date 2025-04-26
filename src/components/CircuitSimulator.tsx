
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Play, Pause, RotateCcw, AlertCircle, CheckCircle, Lightbulb, Battery, Component, Gauge, Plus, Minus, ZoomIn, ZoomOut, ArrowRight, CircuitBoard } from 'lucide-react';
import { SimulationActivity } from '@/data/lessonData';
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from '@/components/ui/tooltip';
import { Slider } from '@/components/ui/slider';
import { toast } from 'sonner';

interface CircuitSimulatorProps {
  simulatorState?: string;
  simulationActivity?: SimulationActivity;
  onHighlightComponent?: (id: string) => void;
  currentState: string;
}

interface CircuitComponent {
  id: string;
  type: string;
  label: string;
  position: { x: number, y: number };
  value?: string | number;
  state?: 'on' | 'off' | 'active';
  rotation?: number;
}

interface Connection {
  id: string;
  from: string;
  to: string;
  fromPin?: string;
  toPin?: string;
  current?: number;
}

interface Measurement {
  id: string;
  point: string;
  value: string;
  type: string;
  position: { x: number, y: number };
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
  const [placedComponents, setPlacedComponents] = useState<CircuitComponent[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [simulationSpeed, setSimulationSpeed] = useState(1);
  const [zoom, setZoom] = useState(1);
  const [draggingComponent, setDraggingComponent] = useState<string | null>(null);
  const [connectingFrom, setConnectingFrom] = useState<string | null>(null);
  const [simulationTime, setSimulationTime] = useState(0);
  const [showVoltageColors, setShowVoltageColors] = useState(false);
  const [showCurrentFlow, setShowCurrentFlow] = useState(false);
  
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);
  
  useEffect(() => {
    if (simulatorState) {
      setActiveState(simulatorState);
      setCircuitValid(null); // Reset validation when state changes
      
      // Load initial components if defined in the simulation activity state
      if (simulationActivity?.states && simulationActivity.states[simulatorState]) {
        const stateConfig = simulationActivity.states[simulatorState];
        
        // Initialize with components from the state configuration
        const initialComponents = stateConfig.components?.map((comp, index) => ({
          id: `${comp}-${index}`,
          type: comp.split('-')[0] || 'unknown',
          label: getComponentLabel(comp),
          position: { x: 100 + index * 80, y: 100 + (index % 3) * 60 },
          value: getDefaultComponentValue(comp),
          rotation: 0
        })) || [];
        
        setPlacedComponents(initialComponents);
        
        // Initialize connections
        const initialConnections = stateConfig.connections?.map((conn, index) => ({
          id: `connection-${index}`,
          from: conn[0],
          to: conn[1],
          current: 0
        })) || [];
        
        setConnections(initialConnections);
        
        // Initialize measurements
        const initialMeasurements = stateConfig.measurements?.map((m, index) => ({
          id: `measurement-${index}`,
          point: m.position,
          value: m.value,
          type: m.type,
          position: { x: 200 + index * 30, y: 150 }
        })) || [];
        
        setMeasurements(initialMeasurements);
      } else {
        // Reset if no specific state configuration
        setPlacedComponents([]);
        setConnections([]);
        setMeasurements([]);
      }
    }
  }, [simulatorState, simulationActivity]);
  
  useEffect(() => {
    // Set up animation loop for simulation
    if (simulationRunning) {
      lastTimeRef.current = performance.now();
      const animate = (time: number) => {
        const deltaTime = (time - lastTimeRef.current) * simulationSpeed / 1000;
        lastTimeRef.current = time;
        
        // Update simulation time
        setSimulationTime(prevTime => prevTime + deltaTime);
        
        // Update component states based on simulation
        updateComponentStates(deltaTime);
        
        // Update connection currents
        updateConnectionCurrents(deltaTime);
        
        // Render current visualization
        if (showCurrentFlow && canvasRef.current) {
          renderCurrentFlow();
        }
        
        animationFrameRef.current = requestAnimationFrame(animate);
      };
      
      animationFrameRef.current = requestAnimationFrame(animate);
      
      return () => {
        if (animationFrameRef.current !== null) {
          cancelAnimationFrame(animationFrameRef.current);
        }
      };
    }
  }, [simulationRunning, simulationSpeed, showCurrentFlow, placedComponents, connections]);
  
  const updateComponentStates = (deltaTime: number) => {
    // Simplified state update based on component type
    setPlacedComponents(prev => prev.map(comp => {
      if (comp.type === 'led') {
        // Find connections to this LED
        const ledConnections = connections.filter(c => 
          c.from === comp.id || c.to === comp.id
        );
        
        // Check if connected to power source
        const hasPower = ledConnections.some(c => {
          const connectedComponentId = c.from === comp.id ? c.to : c.from;
          const connectedComponent = placedComponents.find(p => p.id === connectedComponentId);
          return connectedComponent && connectedComponent.type === 'battery';
        });
        
        return {
          ...comp,
          state: hasPower ? 'on' : 'off'
        };
      }
      
      // Handle other components (like capacitor charging)
      if (comp.type === 'capacitor' && typeof comp.value === 'number') {
        // Simple capacitor charging simulation
        const chargeRate = 0.2 * deltaTime; // Simple charge rate
        const newValue = Math.min(100, (comp.value as number) + chargeRate);
        
        return {
          ...comp,
          value: newValue
        };
      }
      
      return comp;
    }));
  };
  
  const updateConnectionCurrents = (deltaTime: number) => {
    // Update current flow in connections based on component types
    setConnections(prev => prev.map(conn => {
      // Get connected components
      const sourceComponent = placedComponents.find(c => c.id === conn.from);
      const targetComponent = placedComponents.find(c => c.id === conn.to);
      
      // Calculate current based on components
      let currentValue = 0;
      
      if (sourceComponent?.type === 'battery' && targetComponent?.type === 'resistor') {
        // Simple I = V/R calculation (assuming 9V battery)
        const voltage = 9; // volts
        const resistance = 1000; // ohms (default)
        currentValue = voltage / resistance;
      } else if (sourceComponent?.type === 'battery' && targetComponent?.type === 'led') {
        // LED typically draws around 20mA
        currentValue = 0.02;
      } else if ((sourceComponent?.type === 'battery' || targetComponent?.type === 'battery')
                && (sourceComponent?.type === 'capacitor' || targetComponent?.type === 'capacitor')) {
        // Capacitor charging current decreases over time
        const capacitor = sourceComponent?.type === 'capacitor' ? sourceComponent : targetComponent;
        const chargeLevel = typeof capacitor?.value === 'number' ? capacitor.value as number : 0;
        currentValue = 0.1 * (1 - chargeLevel / 100);
      }
      
      return {
        ...conn,
        current: currentValue
      };
    }));
  };
  
  const renderCurrentFlow = () => {
    if (!canvasRef.current) return;
    
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    
    // Draw connections with current flow
    connections.forEach(conn => {
      const fromComponent = placedComponents.find(c => c.id === conn.from);
      const toComponent = placedComponents.find(c => c.id === conn.to);
      
      if (fromComponent && toComponent) {
        const startX = fromComponent.position.x;
        const startY = fromComponent.position.y;
        const endX = toComponent.position.x;
        const endY = toComponent.position.y;
        
        // Draw wire
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);
        
        // Set color based on current
        const currentMagnitude = Math.abs(conn.current || 0);
        const normalizedCurrent = Math.min(1, currentMagnitude * 10); // Scale for visibility
        
        if (showVoltageColors) {
          // Color based on voltage
          ctx.strokeStyle = `rgb(${Math.round(normalizedCurrent * 255)}, ${Math.round(255 - normalizedCurrent * 255)}, 255)`;
        } else {
          ctx.strokeStyle = '#2563eb'; // Blue wire
        }
        
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Draw current flow particles if enabled
        if (showCurrentFlow && conn.current && conn.current > 0) {
          const particleCount = Math.ceil(normalizedCurrent * 5) + 1;
          const time = simulationTime % 1; // Normalized time for animation
          
          for (let i = 0; i < particleCount; i++) {
            const position = (time + i / particleCount) % 1;
            const particleX = startX + (endX - startX) * position;
            const particleY = startY + (endY - startY) * position;
            
            ctx.beginPath();
            ctx.arc(particleX, particleY, 3, 0, Math.PI * 2);
            ctx.fillStyle = 'white';
            ctx.fill();
          }
        }
      }
    });
  };

  const handleComponentClick = (id: string) => {
    if (onHighlightComponent) {
      onHighlightComponent(id);
    }
    
    if (selectedTool === 'multimeter') {
      // Simulate taking a measurement
      const component = placedComponents.find(c => c.id === id);
      
      if (component) {
        const newMeasurement = {
          id: `measurement-${measurements.length}`,
          point: id,
          value: getMeasurementValue(component),
          type: 'voltage',
          position: { ...component.position, x: component.position.x + 20 }
        };
        
        setMeasurements(prev => [...prev, newMeasurement]);
        toast.info(`Measured ${newMeasurement.type}: ${newMeasurement.value} at ${component.label}`);
      }
    } else if (connectingFrom) {
      // Complete a connection
      if (connectingFrom !== id) {
        const newConnection = {
          id: `connection-${connections.length}`,
          from: connectingFrom,
          to: id,
          current: 0
        };
        
        setConnections(prev => [...prev, newConnection]);
        
        const fromComponent = placedComponents.find(c => c.id === connectingFrom);
        const toComponent = placedComponents.find(c => c.id === id);
        
        toast.success(`Connected ${fromComponent?.label || connectingFrom} to ${toComponent?.label || id}`);
        setConnectingFrom(null);
      }
    } else if (selectedTool === 'select') {
      // Select component for dragging
      setDraggingComponent(id);
    } else if (selectedTool === 'wire') {
      // Start creating a wire connection
      setConnectingFrom(id);
    } else if (selectedTool === 'delete') {
      // Remove component and its connections
      setConnections(prev => prev.filter(conn => conn.from !== id && conn.to !== id));
      setPlacedComponents(prev => prev.filter(comp => comp.id !== id));
      toast.info("Component removed");
    }
  };
  
  const getMeasurementValue = (component: CircuitComponent) => {
    // Simulate realistic measurements based on component
    if (component.type === 'battery') return '9V';
    if (component.type === 'led') return component.state === 'on' ? '2V' : '0V';
    if (component.type === 'resistor') {
      if (component.label.includes('220')) return '2.2V';
      if (component.label.includes('1k')) return '5V';
      return '3V';
    }
    if (component.type === 'capacitor') {
      const chargeLevel = typeof component.value === 'number' ? component.value : 0;
      return `${(chargeLevel / 100 * 9).toFixed(1)}V`;
    }
    return '0V';
  };

  const handleAddComponent = (componentType: string) => {
    const componentId = `${componentType}-${placedComponents.length}`;
    const newComponent = {
      id: componentId,
      type: componentType,
      label: getComponentLabel(componentType),
      position: {
        x: 150 + Math.random() * 200,
        y: 150 + Math.random() * 100
      },
      value: getDefaultComponentValue(componentType)
    };
    
    setPlacedComponents(prev => [...prev, newComponent]);
    toast.success(`Added ${newComponent.label} to circuit`);
  };
  
  const getDefaultComponentValue = (componentType: string): string | number => {
    if (componentType.includes('resistor')) {
      if (componentType.includes('220')) return '220Ω';
      if (componentType.includes('1k')) return '1kΩ';
      if (componentType.includes('10k')) return '10kΩ';
      return '1kΩ';
    }
    
    if (componentType.includes('capacitor')) {
      return 0; // Initial charge percentage
    }
    
    if (componentType.includes('battery')) {
      return '9V';
    }
    
    return '';
  };
  
  const getComponentLabel = (componentType: string): string => {
    if (componentType.includes('battery')) return "Battery";
    if (componentType.includes('led')) return "LED";
    if (componentType.includes('resistor')) {
      if (componentType.includes('220')) return "220Ω Resistor";
      if (componentType.includes('1k')) return "1kΩ Resistor";
      if (componentType.includes('10k')) return "10kΩ Resistor";
      return "Resistor";
    }
    if (componentType.includes('capacitor')) return "Capacitor";
    if (componentType.includes('switch')) return "Switch";
    if (componentType.includes('diode')) return "Diode";
    if (componentType.includes('transistor')) return "Transistor";
    
    return componentType.charAt(0).toUpperCase() + componentType.slice(1);
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
    if (simulationRunning) {
      setSimulationRunning(false);
      toast.info("Simulation paused");
      return;
    }
    
    setSimulationRunning(true);
    
    // Simulate validation process
    setTimeout(() => {
      // In a real implementation, this would check the actual circuit
      const success = verifyCircuit();
      setCircuitValid(success);
      
      if (success) {
        toast.success("Circuit is working correctly!");
      } else {
        toast.error("Circuit has issues. Check your connections.");
      }
    }, 500);
  };
  
  const verifyCircuit = () => {
    // This is a simplified check - in a real implementation,
    // we would have more sophisticated validation logic
    
    // For basic-led-circuit, check if we have battery, resistor, and LED
    if (activeState === 'basic-led-circuit') {
      const hasRequiredComponents = 
        placedComponents.some(c => c.type === 'battery') &&
        placedComponents.some(c => c.type === 'resistor') &&
        placedComponents.some(c => c.type === 'led');
        
      const hasRequiredConnections = connections.length >= 2;
      
      return hasRequiredComponents && hasRequiredConnections;
    }
    
    // For other states, check if it includes "complete" in the name
    return activeState.includes('complete') || placedComponents.length >= 3;
  };

  const resetSimulation = () => {
    setCircuitValid(null);
    setSimulationRunning(false);
    setSimulationTime(0);
    setMeasurements([]);
    
    // Reset component states
    setPlacedComponents(prev => prev.map(component => {
      if (component.type === 'capacitor') {
        return { ...component, value: 0 };
      }
      if (component.type === 'led') {
        return { ...component, state: 'off' };
      }
      return component;
    }));
    
    // Reset connection currents
    setConnections(prev => prev.map(conn => ({ ...conn, current: 0 })));
    
    toast.info("Simulation reset");
  };

  const renderComponent = (component: CircuitComponent) => {
    // This is a simplified representation. In a real implementation,
    // this would render actual interactive circuit components
    let icon = <Component className="w-6 h-6" />;
    
    if (component.type === 'battery') {
      icon = <Battery className="w-6 h-6" />;
    } else if (component.type === 'led') {
      // Change LED appearance based on state
      if (component.state === 'on') {
        icon = <Lightbulb className="w-6 h-6 text-yellow-400" />;
      } else {
        icon = <Lightbulb className="w-6 h-6" />;
      }
    } else if (component.type.includes('resistor')) {
      icon = <Component className="w-6 h-6" />;
    } else if (component.type === 'switch') {
      icon = <CircuitBoard className="w-6 h-6" />;
    } else if (component.type === 'capacitor') {
      // Show capacitor with charge level
      const chargeLevel = typeof component.value === 'number' ? component.value as number : 0;
      const chargeColor = `rgba(75, 85, 255, ${chargeLevel / 100})`;
      
      icon = (
        <div className="w-6 h-6 flex items-center justify-center">
          <div className="w-4 h-4 border-2 border-gray-600 relative">
            <div 
              className="absolute bottom-0 left-0 right-0 bg-blue-500 transition-all" 
              style={{ height: `${chargeLevel}%`, backgroundColor: chargeColor }}
            ></div>
          </div>
        </div>
      );
    }
    
    return (
      <div 
        key={component.id} 
        className={`relative cursor-pointer m-2 p-2 bg-white border border-gray-200 rounded shadow-sm ${
          circuitValid === true ? 'ring-2 ring-green-400' : 
          circuitValid === false ? 'ring-2 ring-red-400' : ''
        } ${connectingFrom === component.id ? 'ring-2 ring-blue-500' : ''}`}
        onClick={() => handleComponentClick(component.id)}
        style={{ 
          transform: `rotate(${component.rotation || 0}deg)`,
          transition: 'transform 0.3s ease'
        }}
      >
        <div className="text-center">
          <div 
            className={`w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center
              ${component.state === 'on' ? 'bg-yellow-100' : 'bg-gray-100'}
            `}
          >
            {icon}
          </div>
          <p className="text-xs font-medium">{component.label}</p>
          {component.type === 'capacitor' && typeof component.value === 'number' && (
            <div className="mt-1 w-full bg-gray-200 rounded-full h-1.5">
              <div 
                className="bg-blue-600 h-1.5 rounded-full" 
                style={{ width: `${component.value as number}%` }}
              ></div>
            </div>
          )}
        </div>
        
        {/* Connection points */}
        <div className="absolute left-0 top-1/2 w-2 h-2 bg-blue-600 rounded-full -ml-1 -mt-1"></div>
        <div className="absolute right-0 top-1/2 w-2 h-2 bg-blue-600 rounded-full -mr-1 -mt-1"></div>
      </div>
    );
  };
  
  const renderToolbar = () => (
    <div className="flex flex-wrap items-center justify-center my-3 bg-gray-50 p-2 rounded-md border border-gray-200">
      <TooltipProvider>
        <div className="flex space-x-2 mb-2 mr-4">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className={`${selectedTool === 'select' ? 'bg-blue-100' : ''}`}
                onClick={() => setSelectedTool('select')}
              >
                <Component className="w-4 h-4" />
                <span className="sr-only">Select Tool</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Select Component</TooltipContent>
          </Tooltip>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className={`${selectedTool === 'wire' ? 'bg-blue-100' : ''}`}
                onClick={() => setSelectedTool('wire')}
              >
                <ArrowRight className="w-4 h-4" />
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
                className={`${selectedTool === 'multimeter' ? 'bg-blue-100' : ''}`}
                onClick={() => setSelectedTool('multimeter')}
              >
                <Gauge className="w-4 h-4" />
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
                className={`${selectedTool === 'delete' ? 'bg-red-100' : ''}`}
                onClick={() => setSelectedTool('delete')}
              >
                <Minus className="w-4 h-4" />
                <span className="sr-only">Remove Component</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Delete Component</TooltipContent>
          </Tooltip>
        </div>
        
        <div className="flex space-x-2 mb-2 mr-4">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => setZoom(prev => Math.min(prev + 0.1, 2))}
              >
                <ZoomIn className="w-4 h-4" />
                <span className="sr-only">Zoom In</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Zoom In</TooltipContent>
          </Tooltip>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => setZoom(prev => Math.max(prev - 0.1, 0.5))}
              >
                <ZoomOut className="w-4 h-4" />
                <span className="sr-only">Zoom Out</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Zoom Out</TooltipContent>
          </Tooltip>
        </div>
        
        <div className="flex items-center space-x-2 mb-2">
          <span className="text-xs text-gray-500">Simulation:</span>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon"
                className={showCurrentFlow ? 'bg-blue-100' : ''}
                onClick={() => setShowCurrentFlow(prev => !prev)}
              >
                <CircuitBoard className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Toggle Current Flow</TooltipContent>
          </Tooltip>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon"
                className={showVoltageColors ? 'bg-blue-100' : ''}
                onClick={() => setShowVoltageColors(prev => !prev)}
              >
                <Battery className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Toggle Voltage Visualization</TooltipContent>
          </Tooltip>
          
          <div className="flex items-center space-x-2 ml-2">
            <span className="text-xs text-gray-500">Speed:</span>
            <div className="w-24">
              <Slider 
                value={[simulationSpeed]} 
                min={0.1}
                max={3}
                step={0.1}
                onValueChange={(values) => setSimulationSpeed(values[0])}
              />
            </div>
          </div>
        </div>
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
          >
            {simulationRunning ? (
              <>
                <Pause className="w-4 h-4 mr-1" />
                Pause
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-1" />
                Run
              </>
            )}
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
            {getStateConfig().components?.map((component, index) => renderComponent({
              id: `${component}-${index}`,
              type: component.split('-')[0] || 'unknown',
              label: getComponentLabel(component),
              position: { x: 0, y: 0 }, // Position doesn't matter in showcase
              value: getDefaultComponentValue(component)
            }))}
          </div>
        ) : (
          <div className="h-full flex flex-col">
            {renderToolbar()}
            
            <div className="flex-1 bg-gray-100 rounded-lg border border-dashed border-gray-300 relative overflow-hidden">
              <div 
                className="h-full p-3 relative"
                style={{ 
                  transform: `scale(${zoom})`,
                  transformOrigin: 'center center',
                  transition: 'transform 0.3s ease'
                }}
              >
                {simulationRunning && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/5 z-10">
                    <div className="p-2 text-xs bg-white rounded shadow text-blue-600 font-medium">
                      <span>Running simulation... {simulationTime.toFixed(1)}s</span>
                    </div>
                  </div>
                )}
                
                {/* Current flow canvas */}
                <canvas 
                  ref={canvasRef}
                  width={800}
                  height={600}
                  className="absolute inset-0 w-full h-full z-0"
                />
                
                {/* Components layer */}
                <div className="relative z-10">
                  {placedComponents.length > 0 ? (
                    <div className="flex flex-wrap gap-3">
                      {placedComponents.map(renderComponent)}
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
                
                {/* Show connecting line when creating connection */}
                {connectingFrom && selectedTool === 'wire' && (
                  <div className="text-xs text-blue-600 py-1 px-2 bg-blue-50 rounded-md absolute top-2 right-2">
                    Click on another component to connect
                  </div>
                )}
              </div>
            </div>
            
            <div className="mt-3 p-2 bg-white rounded-lg border border-gray-200 shadow-sm">
              <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                {['battery', 'resistor', 'led', 'capacitor', 'switch', 'diode'].map((comp) => (
                  <Button 
                    key={comp}
                    variant="outline" 
                    size="sm"
                    className="text-xs h-auto py-1"
                    onClick={() => handleAddComponent(comp)}
                  >
                    {getComponentLabel(comp)}
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

