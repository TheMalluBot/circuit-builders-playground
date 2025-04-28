
import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw,
  Trash2, 
  Zap,
  RotateCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { SimulationProvider, useSimulation } from '@/lib/simulator/SimulationContext';
import { type CircuitComponentProps, type DragInfo } from '@/types/simulator';
import { ComponentFactory } from '@/lib/simulator/ComponentFactory';

interface CircuitPlaygroundProps {
  className?: string;
}

const ComponentPalette: React.FC = () => {
  const { addComponent } = useSimulation();
  const [draggingComponent, setDraggingComponent] = useState<string | null>(null);

  const handleDragStart = (type: string, e: React.DragEvent) => {
    setDraggingComponent(type);
    // Standardize the component type using the factory
    const canonicalType = ComponentFactory.getCanonicalTypeName(type);
    e.dataTransfer.setData('component/type', canonicalType);
    e.dataTransfer.effectAllowed = 'copy';
  };

  const handleMouseDown = (type: string, e: React.MouseEvent) => {
    e.preventDefault();
    
    // Standardize the component type using the factory
    const canonicalType = ComponentFactory.getCanonicalTypeName(type);
    
    const dragStartEvent = new CustomEvent('component-drag-start', {
      detail: {
        type: canonicalType,
        clientX: e.clientX,
        clientY: e.clientY
      },
      bubbles: true
    });
    
    e.currentTarget.dispatchEvent(dragStartEvent);
  };

  const components: CircuitComponentProps[] = [
    { name: 'Battery', icon: '/placeholder.svg', description: 'DC power source' },
    { name: 'Resistor', icon: '/placeholder.svg', description: 'Limits current flow' },
    { name: 'LED', icon: '/placeholder.svg', description: 'Light emitting diode' },
    { name: 'Switch', icon: '/placeholder.svg', description: 'Controls circuit flow' }
  ];

  return (
    <div className="grid grid-cols-2 gap-2 p-3 bg-white shadow-inner rounded-md">
      {components.map((comp) => (
        <div 
          key={comp.name}
          draggable
          onDragStart={(e) => handleDragStart(comp.name.toLowerCase(), e)}
          onMouseDown={(e) => handleMouseDown(comp.name.toLowerCase(), e)}
          className={`flex flex-col items-center p-2 rounded-md bg-gray-50 hover:bg-gray-100 cursor-grab active:cursor-grabbing transition-colors ${
            draggingComponent === comp.name.toLowerCase() ? 'ring-2 ring-blue-500' : ''
          }`}
        >
          <img src={comp.icon} alt={comp.name} className="w-8 h-8 mb-1" />
          <span className="text-xs font-medium">{comp.name}</span>
        </div>
      ))}
    </div>
  );
};

const CircuitControls: React.FC = () => {
  const { 
    isRunning, 
    toggleSimulation, 
    resetSimulation,
    deleteSelectedComponent,
    rotateSelectedComponent,
    simulationSpeed,
    setSimulationSpeed
  } = useSimulation();

  return (
    <div className="flex flex-col gap-3 p-3 bg-white shadow-inner rounded-md">
      <div className="flex gap-2">
        <Button 
          variant="outline" 
          size="sm"
          onClick={toggleSimulation}
          className="flex-1"
        >
          {isRunning ? 
            <><Pause className="w-4 h-4 mr-1" /> Pause</> : 
            <><Play className="w-4 h-4 mr-1" /> Run</>
          }
        </Button>
        
        <Button 
          variant="outline" 
          size="sm"
          onClick={resetSimulation}
        >
          <RotateCcw className="w-4 h-4" />
        </Button>
      </div>
      
      <div className="flex gap-2">
        <Button 
          variant="outline" 
          size="sm"
          onClick={rotateSelectedComponent}
        >
          <RotateCw className="w-4 h-4 mr-1" />
          Rotate
        </Button>
        
        <Button 
          variant="outline" 
          size="sm"
          onClick={deleteSelectedComponent}
          className="text-red-500"
        >
          <Trash2 className="w-4 h-4 mr-1" />
          Delete
        </Button>
      </div>
      
      <div className="mt-2">
        <label className="block text-xs text-gray-500 mb-1">Simulation Speed</label>
        <div className="flex items-center gap-2">
          <Zap className="w-3 h-3 text-gray-400" />
          <Slider 
            value={[simulationSpeed]} 
            onValueChange={(value) => setSimulationSpeed(value[0])}
            min={0.25}
            max={2}
            step={0.25}
            className="flex-1"
          />
          <Zap className="w-5 h-5 text-blue-500" />
        </div>
      </div>
    </div>
  );
};

const PropertyPanel: React.FC = () => {
  const { 
    selectedComponent, 
    updateComponentProperty
  } = useSimulation();

  if (!selectedComponent) {
    return (
      <div className="p-3 bg-white shadow-inner rounded-md text-center text-sm text-gray-500">
        Select a component to view properties
      </div>
    );
  }

  const renderPropertyEditors = () => {
    switch (selectedComponent.type) {
      case 'battery':
        return (
          <>
            <div className="mb-3">
              <label className="block text-xs text-gray-500 mb-1">Voltage (V)</label>
              <div className="flex items-center gap-2">
                <Slider 
                  value={[selectedComponent.properties.voltage || 5]} 
                  onValueChange={(value) => updateComponentProperty(selectedComponent.id, 'voltage', value[0])}
                  min={1}
                  max={12}
                  step={0.5}
                  className="flex-1"
                />
                <span className="text-xs font-mono w-8 text-right">{selectedComponent.properties.voltage || 5}V</span>
              </div>
            </div>
          </>
        );
      
      case 'resistor':
        return (
          <>
            <div className="mb-3">
              <label className="block text-xs text-gray-500 mb-1">Resistance (Ω)</label>
              <div className="flex items-center gap-2">
                <Slider 
                  value={[Math.log10(selectedComponent.properties.resistance || 1000)]} 
                  onValueChange={(value) => updateComponentProperty(
                    selectedComponent.id, 
                    'resistance', 
                    Math.pow(10, value[0])
                  )}
                  min={1}
                  max={6}
                  step={0.1}
                  className="flex-1"
                />
                <span className="text-xs font-mono w-16 text-right">
                  {formatResistance(selectedComponent.properties.resistance || 1000)}
                </span>
              </div>
            </div>
          </>
        );
      
      case 'led':
        return (
          <>
            <div className="mb-3">
              <label className="block text-xs text-gray-500 mb-1">Color</label>
              <div className="flex gap-1 justify-between">
                {['red', 'green', 'blue', 'yellow', 'white'].map(color => (
                  <div 
                    key={color} 
                    className={`w-6 h-6 rounded-full cursor-pointer border-2 ${
                      (selectedComponent.properties.color || 'red') === color
                        ? 'border-black dark:border-white'
                        : 'border-transparent'
                    }`}
                    style={{ backgroundColor: color }}
                    onClick={() => updateComponentProperty(selectedComponent.id, 'color', color)}
                  />
                ))}
              </div>
            </div>
          </>
        );
      
      case 'switch':
        return (
          <>
            <div className="mb-3">
              <label className="block text-xs text-gray-500 mb-1">State</label>
              <Button 
                variant={selectedComponent.properties.closed ? "default" : "outline"}
                size="sm" 
                className="w-full"
                onClick={() => updateComponentProperty(
                  selectedComponent.id, 
                  'closed', 
                  !selectedComponent.properties.closed
                )}
              >
                {selectedComponent.properties.closed ? "Closed (ON)" : "Open (OFF)"}
              </Button>
            </div>
          </>
        );
      
      default:
        return <div className="text-sm">No editable properties</div>;
    }
  };

  return (
    <div className="p-3 bg-white shadow-inner rounded-md">
      <h3 className="font-medium text-sm mb-2">{selectedComponent.type.toUpperCase()} Properties</h3>
      {renderPropertyEditors()}
    </div>
  );
};

const formatResistance = (ohms: number): string => {
  if (ohms >= 1000000) {
    return `${(ohms / 1000000).toFixed(1)}MΩ`;
  } else if (ohms >= 1000) {
    return `${(ohms / 1000).toFixed(1)}kΩ`;
  } else {
    return `${ohms.toFixed(0)}Ω`;
  }
};

const CircuitCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { 
    addComponent, 
    selectComponent, 
    moveComponent,
    toggleSwitch,
    createWire,
    engine,
    renderer,
    simulationState,
    isRunning,
    selectedComponent
  } = useSimulation();
  
  const [draggingPlacedComponentId, setDraggingPlacedComponentId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [paletteDragInfo, setPaletteDragInfo] = useState<DragInfo | null>(null);
  const [ghostPosition, setGhostPosition] = useState<{x: number, y: number} | null>(null);
  const [wireStart, setWireStart] = useState<{
    nodeId: string;
    x: number;
    y: number;
  } | null>(null);
  const [tempWireEnd, setTempWireEnd] = useState<{x: number, y: number} | null>(null);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [placementFeedback, setPlacementFeedback] = useState<{ x: number, y: number, type: string } | null>(null);
  
  // Show feedback when a component is placed
  useEffect(() => {
    if (placementFeedback) {
      const timer = setTimeout(() => {
        setPlacementFeedback(null);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [placementFeedback]);
  
  useEffect(() => {
    const handleComponentDragStart = (e: CustomEvent) => {
      const { type, clientX, clientY } = e.detail;
      
      setPaletteDragInfo({
        type,
        offsetX: 30,
        offsetY: 30,
        isPaletteDrag: true
      });
      
      setGhostPosition({
        x: clientX,
        y: clientY
      });
      
      document.addEventListener('mousemove', handlePaletteDragMove);
      document.addEventListener('mouseup', handlePaletteDragEnd);
    };
    
    const handlePaletteDragMove = (e: MouseEvent) => {
      if (ghostPosition) {
        setGhostPosition({
          x: e.clientX,
          y: e.clientY
        });
      }
    };
    
    const handlePaletteDragEnd = (e: MouseEvent) => {
      if (paletteDragInfo && ghostPosition && canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect();
        
        if (
          e.clientX >= rect.left &&
          e.clientX <= rect.right &&
          e.clientY >= rect.top &&
          e.clientY <= rect.bottom
        ) {
          const canvasX = e.clientX - rect.left;
          const canvasY = e.clientY - rect.top;
          
          // Create a unique ID for the component
          const id = `${paletteDragInfo.type}_${Date.now()}`;
          
          // Add the component to the simulation
          addComponent(paletteDragInfo.type, { x: canvasX, y: canvasY });
          
          // Show placement feedback
          setPlacementFeedback({
            x: canvasX,
            y: canvasY,
            type: paletteDragInfo.type
          });
        }
      }
      
      setPaletteDragInfo(null);
      setGhostPosition(null);
      
      document.removeEventListener('mousemove', handlePaletteDragMove);
      document.removeEventListener('mouseup', handlePaletteDragEnd);
    };
    
    document.addEventListener('component-drag-start', handleComponentDragStart as EventListener);
    
    return () => {
      document.removeEventListener('component-drag-start', handleComponentDragStart as EventListener);
      document.removeEventListener('mousemove', handlePaletteDragMove);
      document.removeEventListener('mouseup', handlePaletteDragEnd);
    };
  }, [addComponent, ghostPosition, paletteDragInfo]);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const getCanvasCoords = (e: MouseEvent): { x: number, y: number } => {
      const rect = canvas.getBoundingClientRect();
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
    };

    const handleMouseDown = (e: MouseEvent) => {
      if (!simulationState) return;
      
      const coords = getCanvasCoords(e);
      
      if (hoveredNodeId) {
        setWireStart({
          nodeId: hoveredNodeId,
          x: coords.x,
          y: coords.y
        });
        setTempWireEnd(coords);
        return;
      }
      
      for (const comp of simulationState.components) {
        const dx = comp.position.x - coords.x;
        const dy = comp.position.y - coords.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 30) {
          if (isRunning && comp.type === 'switch') {
            toggleSwitch(comp.id);
            return;
          }
          
          selectComponent(comp.id);
          setDraggingPlacedComponentId(comp.id);
          setDragOffset({
            x: coords.x - comp.position.x,
            y: coords.y - comp.position.y
          });
          return;
        }
      }
      
      selectComponent(null);
    };
    
    const handleMouseMove = (e: MouseEvent) => {
      const coords = getCanvasCoords(e);
      
      if (wireStart) {
        setTempWireEnd(coords);
        
        let foundNode = false;
        if (simulationState) {
          for (const comp of simulationState.components) {
            for (const pin of comp.pins) {
              const pinPos = getPinPosition(comp, pin);
              const dx = pinPos.x - coords.x;
              const dy = pinPos.y - coords.y;
              const distance = Math.sqrt(dx * dx + dy * dy);
              
              if (distance < 10) {
                if (pin.nodeId !== wireStart.nodeId) {
                  setHoveredNodeId(pin.nodeId || `${comp.id}-${pin.id}`);
                  foundNode = true;
                  break;
                }
              }
            }
            if (foundNode) break;
          }
        }
        
        if (!foundNode) {
          setHoveredNodeId(null);
        }
        return;
      }
      
      if (draggingPlacedComponentId && simulationState) {
        const newPos = {
          x: coords.x - dragOffset.x,
          y: coords.y - dragOffset.y
        };
        
        moveComponent(draggingPlacedComponentId, newPos);
        return;
      }
      
      let foundNode = false;
      if (simulationState) {
        for (const comp of simulationState.components) {
          for (const pin of comp.pins) {
            const pinPos = getPinPosition(comp, pin);
            const dx = pinPos.x - coords.x;
            const dy = pinPos.y - coords.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < 10) {
              setHoveredNodeId(pin.nodeId || `${comp.id}-${pin.id}`);
              foundNode = true;
              break;
            }
          }
          if (foundNode) break;
        }
      }
      
      if (!foundNode) {
        setHoveredNodeId(null);
      }
    };
    
    const handleMouseUp = (e: MouseEvent) => {
      if (wireStart && hoveredNodeId && wireStart.nodeId !== hoveredNodeId) {
        // Use the createWire from the simulation context
        createWire(wireStart.nodeId, hoveredNodeId);
      }
      
      setWireStart(null);
      setTempWireEnd(null);
      
      setDraggingPlacedComponentId(null);
    };
    
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseup', handleMouseUp);
    
    return () => {
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseup', handleMouseUp);
    };
  }, [simulationState, wireStart, hoveredNodeId, draggingPlacedComponentId, dragOffset, engine, selectComponent, moveComponent, isRunning, toggleSwitch, createWire]);
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const componentType = e.dataTransfer.getData('component/type');
    
    if (componentType && canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      addComponent(componentType, { x, y });
      
      // Show placement feedback
      setPlacementFeedback({
        x,
        y,
        type: componentType
      });
    }
  };
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };
  
  const getPinPosition = (component: any, pin: any) => {
    const rad = (component.rotation || 0) * Math.PI / 180;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);
    
    const dx = pin.position.x - component.position.x;
    const dy = pin.position.y - component.position.y;
    
    const rotatedX = dx * cos - dy * sin;
    const rotatedY = dx * sin + dy * cos;
    
    return {
      x: component.position.x + rotatedX,
      y: component.position.y + rotatedY
    };
  };
  
  // Utility function to get a node position from its ID
  const getNodePositionFromId = (nodeId: string, state: any) => {
    for (const comp of state.components) {
      for (const pin of comp.pins) {
        if (pin.nodeId === nodeId || `${comp.id}-${pin.id}` === nodeId) {
          return getPinPosition(comp, pin);
        }
      }
    }
    return { x: 0, y: 0 };
  };

  return (
    <div className="relative w-full h-full">
      <canvas 
        ref={canvasRef} 
        className="w-full h-full bg-gray-50 simulator-grid"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      />
      
      {/* Ghost element during drag */}
      {ghostPosition && paletteDragInfo && (
        <div 
          className="absolute pointer-events-none z-50 w-16 h-16 bg-blue-100 border-2 border-dashed border-blue-500 rounded-md flex items-center justify-center"
          style={{
            left: ghostPosition.x - paletteDragInfo.offsetX,
            top: ghostPosition.y - paletteDragInfo.offsetY
          }}
        >
          <div className="text-blue-500 text-sm font-medium">
            {paletteDragInfo.type.charAt(0).toUpperCase() + paletteDragInfo.type.slice(1)}
          </div>
        </div>
      )}
      
      {/* Placement feedback animation */}
      {placementFeedback && (
        <div 
          className="absolute pointer-events-none z-40 w-20 h-20 rounded-full animate-ping"
          style={{
            left: placementFeedback.x - 40,
            top: placementFeedback.y - 40,
            backgroundColor: 'rgba(59, 130, 246, 0.2)',
            border: '2px solid rgba(59, 130, 246, 0.5)'
          }}
        />
      )}
      
      {/* Wire drawing visualization */}
      {wireStart && tempWireEnd && (
        <svg
          className="absolute inset-0 pointer-events-none"
          style={{ zIndex: 10 }}
        >
          <line
            x1={wireStart.x}
            y1={wireStart.y}
            x2={tempWireEnd.x}
            y2={tempWireEnd.y}
            stroke={hoveredNodeId ? "#0088ff" : "#888"}
            strokeWidth="2"
            strokeDasharray={hoveredNodeId ? "" : "5,5"}
          />
        </svg>
      )}
      
      {/* Node hover indicator */}
      {hoveredNodeId && !wireStart && simulationState && (
        <div 
          className="absolute w-3 h-3 bg-blue-500 rounded-full pointer-events-none"
          style={{ 
            left: getNodePositionFromId(hoveredNodeId, simulationState).x - 6, 
            top: getNodePositionFromId(hoveredNodeId, simulationState).y - 6,
            zIndex: 5
          }}
        />
      )}
    </div>
  );
};

const CircuitPlayground: React.FC<CircuitPlaygroundProps> = ({ className }) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Delete' || e.key === 'Backspace') {
      } else if (e.key === 'r' || e.key === 'R') {
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className={`grid grid-cols-5 gap-4 ${className}`}>
      <div className="col-span-4 bg-white border border-gray-200 rounded-lg overflow-hidden h-[600px] relative">
        <SimulationProvider>
          <CircuitCanvas />
          <div className="absolute bottom-4 right-4 flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              className="bg-white/90 backdrop-blur-sm"
            >
              Toggle Grid
            </Button>
            <Button
              variant="secondary"
              size="sm"
              className="bg-white/90 backdrop-blur-sm"
            >
              Toggle Measurements
            </Button>
          </div>
        </SimulationProvider>
      </div>
      <div className="col-span-1 flex flex-col gap-4">
        <div>
          <h3 className="font-medium text-sm mb-2">Components</h3>
          <ComponentPalette />
        </div>
        
        <div>
          <h3 className="font-medium text-sm mb-2">Controls</h3>
          <SimulationProvider>
            <CircuitControls />
          </SimulationProvider>
        </div>
        
        <div>
          <h3 className="font-medium text-sm mb-2">Properties</h3>
          <SimulationProvider>
            <PropertyPanel />
          </SimulationProvider>
        </div>
      </div>
    </div>
  );
};

export default CircuitPlayground;
