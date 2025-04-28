
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
  const { addComponent, removeComponent, engine, renderer, simulationState, selectComponent, createWire } = useSimulation();
  const [selectedComponentType, setSelectedComponentType] = useState<string | null>(null);
  const [draggedComponent, setDraggedComponent] = useState<Component | null>(null);
  const [isDrawingWire, setIsDrawingWire] = useState(false);
  const [wireStart, setWireStart] = useState<{nodeId: string, x: number, y: number} | null>(null);
  const [wireEnd, setWireEnd] = useState<{x: number, y: number} | null>(null);
  const [hoveredNode, setHoveredNode] = useState<{componentId: string, nodeId: string} | null>(null);
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
      if (state.connections && engine) {
        setTimeout(() => {
          if (simulationState && state.connections) {
            state.connections.forEach(connection => {
              // Find actual node IDs from component-pin references
              const [startRef, endRef] = connection;
              const [startCompId, startPinId] = startRef.split('-');
              const [endCompId, endPinId] = endRef.split('-');
              
              // Find components
              const startComp = simulationState.components.find(c => c.id.includes(startCompId));
              const endComp = simulationState.components.find(c => c.id.includes(endCompId));
              
              if (startComp && endComp) {
                // Find pins
                const startPin = startComp.pins.find(p => p.id === startPinId);
                const endPin = endComp.pins.find(p => p.id === endPinId);
                
                // Connect if both pins exist and have node IDs
                if (startPin && endPin && startPin.nodeId && endPin.nodeId) {
                  createWire(startPin.nodeId, endPin.nodeId);
                }
              }
            });
          }
        }, 500); // Delay to ensure components are fully added
      }
    }
  }, [simulatorState, simulationActivity, simulationState, engine]);

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
      
      // Check if we're drawing a wire
      if (isDrawingWire) {
        if (hoveredNode) {
          // Complete wire connection
          if (wireStart && wireStart.nodeId !== hoveredNode.nodeId) {
            createWire(wireStart.nodeId, hoveredNode.nodeId);
          }
          
          // Reset wire drawing state
          setIsDrawingWire(false);
          setWireStart(null);
          setWireEnd(null);
          return;
        }
        
        // If not hovering over a node, check if we're starting a new wire
        // by checking if clicked on a component pin
        if (simulationState) {
          for (const comp of simulationState.components) {
            for (const pin of comp.pins) {
              // Calculate actual pin position based on component position/rotation
              const pinPos = calculatePinPosition(comp, pin);
              const dx = pinPos.x - coords.x;
              const dy = pinPos.y - coords.y;
              const distance = Math.sqrt(dx*dx + dy*dy);
              
              if (distance < 10) { // Pin click radius
                if (pin.nodeId) {
                  setWireStart({
                    nodeId: pin.nodeId,
                    x: pinPos.x,
                    y: pinPos.y
                  });
                  setWireEnd(coords);
                  return;
                }
              }
            }
          }
        }
        
        // If clicked elsewhere, cancel wire drawing
        setIsDrawingWire(false);
        setWireStart(null);
        setWireEnd(null);
        return;
      }
      
      // Check if clicked on a component
      if (simulationState) {
        // Find component under mouse
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
          // Check if clicked on a pin to start drawing a wire
          for (const comp of simulationState.components) {
            for (const pin of comp.pins) {
              // Calculate actual pin position
              const pinPos = calculatePinPosition(comp, pin);
              const dx = pinPos.x - coords.x;
              const dy = pinPos.y - coords.y;
              const distance = Math.sqrt(dx*dx + dy*dy);
              
              if (distance < 10) { // Pin click radius
                if (pin.nodeId) {
                  setIsDrawingWire(true);
                  setWireStart({
                    nodeId: pin.nodeId,
                    x: pinPos.x,
                    y: pinPos.y
                  });
                  setWireEnd(coords);
                  return;
                }
              }
            }
          }
          
          // Clicked on empty area - deselect
          selectComponent(null);
        }
      }
    };
    
    const handleMouseMove = (e: MouseEvent) => {
      const coords = getCanvasCoords(e);
      
      // Update wire end position if drawing a wire
      if (isDrawingWire && wireStart) {
        setWireEnd(coords);
        
        // Check if hovering over a valid node to connect to
        let foundNode = false;
        if (simulationState) {
          for (const comp of simulationState.components) {
            for (const pin of comp.pins) {
              // Skip if pin doesn't have a node ID or is the same as start
              if (!pin.nodeId || (wireStart && pin.nodeId === wireStart.nodeId)) continue;
              
              // Calculate actual pin position
              const pinPos = calculatePinPosition(comp, pin);
              const dx = pinPos.x - coords.x;
              const dy = pinPos.y - coords.y;
              const distance = Math.sqrt(dx*dx + dy*dy);
              
              if (distance < 10) { // Pin hover radius
                setHoveredNode({
                  componentId: comp.id,
                  nodeId: pin.nodeId
                });
                foundNode = true;
                break;
              }
            }
            if (foundNode) break;
          }
        }
        
        if (!foundNode) {
          setHoveredNode(null);
        }
        
        return;
      }
      
      // Update position of dragged component
      if (isDragging && draggedComponentId && simulationState) {
        const component = simulationState.components.find(c => c.id === draggedComponentId);
        if (component && engine && renderer) {
          const newPosition = {
            x: coords.x - dragOffset.x,
            y: coords.y - dragOffset.y
          };
          
          // Update component position in engine
          component.position = newPosition;
          
          // Update rendering
          renderer.render(
            simulationState.components,
            simulationState.nodes,
            simulationState.wires
          );
        }
      } else {
        // Check if hovering over a pin
        let foundNode = false;
        if (simulationState) {
          for (const comp of simulationState.components) {
            for (const pin of comp.pins) {
              if (!pin.nodeId) continue;
              
              // Calculate actual pin position
              const pinPos = calculatePinPosition(comp, pin);
              const dx = pinPos.x - coords.x;
              const dy = pinPos.y - coords.y;
              const distance = Math.sqrt(dx*dx + dy*dy);
              
              if (distance < 10) { // Pin hover radius
                setHoveredNode({
                  componentId: comp.id,
                  nodeId: pin.nodeId
                });
                canvas.style.cursor = 'crosshair';
                foundNode = true;
                break;
              }
            }
            if (foundNode) break;
          }
        }
        
        if (!foundNode) {
          setHoveredNode(null);
          canvas.style.cursor = selectedComponentType ? 'crosshair' : 'default';
        }
      }
    };
    
    const handleMouseUp = (e: MouseEvent) => {
      // Reset dragging state
      if (isDragging && draggedComponentId) {
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
  }, [simulationState, engine, renderer, selectedComponentType, isDrawingWire, wireStart, hoveredNode]);

  // Helper function to calculate pin position with component rotation
  const calculatePinPosition = (component: Component, pin: any) => {
    const angle = (component.rotation || 0) * Math.PI / 180;
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    
    // Pin position is relative to component position
    const relX = pin.position.x - component.position.x;
    const relY = pin.position.y - component.position.y;
    
    // Apply rotation
    const rotX = relX * cos - relY * sin;
    const rotY = relX * sin + relY * cos;
    
    // Return absolute position
    return {
      x: component.position.x + rotX,
      y: component.position.y + rotY
    };
  };

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

      {/* Wire drawing overlay */}
      {isDrawingWire && wireStart && wireEnd && (
        <svg
          className="absolute inset-0 pointer-events-none"
          style={{ zIndex: 5 }}
        >
          <line
            x1={wireStart.x}
            y1={wireStart.y}
            x2={wireEnd.x}
            y2={wireEnd.y}
            stroke={hoveredNode ? "#0088ff" : "#888"}
            strokeWidth={2}
            strokeDasharray={hoveredNode ? "" : "5,5"}
          />
        </svg>
      )}

      {/* Node hover indicator */}
      {hoveredNode && !isDrawingWire && (
        <div 
          className="absolute w-3 h-3 bg-blue-400 rounded-full pointer-events-none"
          style={{ 
            zIndex: 10,
            // We'd calculate the actual position here based on the component and pin
          }}
        />
      )}

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
