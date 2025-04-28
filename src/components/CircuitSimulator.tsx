
import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw,
  Battery, 
  Lightbulb,
  Zap,
  ToggleRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SimulationProvider, useSimulation } from '@/lib/simulator/SimulationContext';
import { type SimulationActivity, type RenderOptions } from '@/types/simulator';
import { type Component } from '@/lib/simulator/types';

interface CircuitSimulatorProps {
  simulatorState: string;
  simulationActivity: SimulationActivity;
  onHighlightComponent?: (id: string) => void;
  currentState?: string;
  renderOptions?: Partial<RenderOptions>;
}

const CircuitControls: React.FC = () => {
  const { isRunning, toggleSimulation, resetSimulation } = useSimulation();

  return (
    <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2">
      <Button 
        variant="outline" 
        size="sm" 
        className="bg-white shadow"
        onClick={toggleSimulation}
      >
        {isRunning ? <Pause className="w-4 h-4 mr-1" /> : <Play className="w-4 h-4 mr-1" />}
        {isRunning ? 'Pause' : 'Run'}
      </Button>
      
      <Button 
        variant="outline" 
        size="sm" 
        className="bg-white shadow"
        onClick={resetSimulation}
      >
        <RotateCcw className="w-4 h-4" />
      </Button>
    </div>
  );
};

const CircuitComponentButton: React.FC<{
  icon: React.ReactNode;
  type: string;
  selected: boolean;
  onClick: () => void;
}> = ({ icon, type, selected, onClick }) => (
  <Button
    variant={selected ? "default" : "outline"}
    size="sm"
    className="w-12 h-12 p-0"
    onClick={onClick}
  >
    {icon}
  </Button>
);

const CircuitSimulatorContent: React.FC<CircuitSimulatorProps> = ({
  simulatorState,
  simulationActivity,
  onHighlightComponent,
  renderOptions
}) => {
  const { addComponent, removeComponent, engine, renderer, simulationState, selectComponent } = useSimulation();
  const [selectedComponentType, setSelectedComponentType] = useState<string | null>(null);
  const [draggedComponent, setDraggedComponent] = useState<Component | null>(null);
  const [isDrawingWire, setIsDrawingWire] = useState(false);
  const [wireStart, setWireStart] = useState<{x: number, y: number} | null>(null);
  const [wireEnd, setWireEnd] = useState<{x: number, y: number} | null>(null);
  const [hoveredPin, setHoveredPin] = useState<{componentId: string, pinId: string} | null>(null);
  const [scale, setScale] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Load initial state from activity
  useEffect(() => {
    if (simulationActivity.states && simulationActivity.states[simulatorState]) {
      const state = simulationActivity.states[simulatorState];
      
      // Clear existing components first
      if (simulationState) {
        simulationState.components.forEach(comp => {
          removeComponent(comp.id);
        });
      }
      
      // Add components from the selected state
      state.components.forEach((type, index) => {
        addComponent(type, { 
          x: 100 + index * 120, 
          y: 200 
        });
      });
      
      // Add connections if present in state.connections
      if (state.connections) {
        // Implementation for connections
      }
    }
  }, [simulatorState, simulationActivity, simulationState]);

  // Update render options when they change
  useEffect(() => {
    if (renderer && renderOptions) {
      renderer.setOptions(renderOptions);
    }
  }, [renderer, renderOptions]);

  // Set up canvas event listeners for component manipulation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let isDragging = false;
    let draggedComponentId: string | null = null;
    let dragOffset = { x: 0, y: 0 };
    
    const getCanvasCoords = (e: MouseEvent): { x: number, y: number } => {
      const rect = canvas.getBoundingClientRect();
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
    };

    const handleMouseDown = (e: MouseEvent) => {
      const coords = getCanvasCoords(e);
      
      // Check if clicked on a component
      if (simulationState) {
        // Find component under mouse
        // This is simplified - a real implementation would need proper hit testing
        const component = simulationState.components.find(comp => {
          const dx = comp.position.x - coords.x;
          const dy = comp.position.y - coords.y;
          return Math.sqrt(dx*dx + dy*dy) < 30; // Simple radius check
        });
        
        if (component) {
          isDragging = true;
          draggedComponentId = component.id;
          dragOffset = {
            x: coords.x - component.position.x,
            y: coords.y - component.position.y
          };
          selectComponent(component.id);
        } else {
          // Clicked on empty area - deselect
          selectComponent(null);
        }
      }
    };
    
    const handleMouseMove = (e: MouseEvent) => {
      const coords = getCanvasCoords(e);
      
      // Update position of dragged component
      if (isDragging && draggedComponentId && simulationState) {
        const component = simulationState.components.find(c => c.id === draggedComponentId);
        if (component && engine && renderer) {
          const newPosition = {
            x: coords.x - dragOffset.x,
            y: coords.y - dragOffset.y
          };
          
          // Move the component
          component.position = newPosition;
          
          // Update rendering
          renderer.render(
            simulationState.components,
            simulationState.nodes,
            simulationState.wires
          );
        }
      }
    };
    
    const handleMouseUp = (e: MouseEvent) => {
      if (isDragging && draggedComponentId) {
        // Finalize component position
        isDragging = false;
        draggedComponentId = null;
      }
    };
    
    // Add event listeners
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseup', handleMouseUp);
    
    return () => {
      // Remove event listeners
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseup', handleMouseUp);
    };
  }, [simulationState, engine, renderer]);

  const handleComponentSelect = (type: string) => {
    setSelectedComponentType(prev => prev === type ? null : type);
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!renderer || !selectedComponentType) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const canvasX = e.clientX - rect.left;
    const canvasY = e.clientY - rect.top;
    
    // In a real implementation, we'd convert canvas coordinates to simulation coordinates
    const circuitCoords = { x: canvasX, y: canvasY };
    
    addComponent(selectedComponentType, circuitCoords);
    setSelectedComponentType(null);
  };

  return (
    <div className="relative w-full h-full bg-neutral-50">
      <div className="absolute top-4 left-4 flex flex-col space-y-2">
        <CircuitComponentButton
          icon={<Battery />}
          type="battery"
          selected={selectedComponentType === 'battery'}
          onClick={() => handleComponentSelect('battery')}
        />
        <CircuitComponentButton
          icon={<Zap />}
          type="resistor"
          selected={selectedComponentType === 'resistor'}
          onClick={() => handleComponentSelect('resistor')}
        />
        <CircuitComponentButton
          icon={<Lightbulb />}
          type="led"
          selected={selectedComponentType === 'led'}
          onClick={() => handleComponentSelect('led')}
        />
        <CircuitComponentButton
          icon={<ToggleRight />}
          type="switch"
          selected={selectedComponentType === 'switch'}
          onClick={() => handleComponentSelect('switch')}
        />
      </div>

      <canvas 
        ref={canvasRef}
        className="circuit-canvas w-full h-full"
        style={{ cursor: selectedComponentType ? 'crosshair' : 'default' }}
      />

      <CircuitControls />
    </div>
  );
};

const CircuitSimulator: React.FC<CircuitSimulatorProps> = (props) => {
  return (
    <SimulationProvider>
      <CircuitSimulatorContent {...props} />
    </SimulationProvider>
  );
};

export default CircuitSimulator;
