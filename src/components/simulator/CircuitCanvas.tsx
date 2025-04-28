
import React, { useRef, useState, useEffect } from 'react';
import { useSimulation } from '@/lib/simulator/context/useSimulation';
import { DragInfo, NodePosition } from '@/types/simulator';
import { getNodePositionFromId } from '@/lib/simulator/utils/geometryUtils';

const CircuitCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { 
    addComponent, 
    selectComponent, 
    moveComponent,
    toggleSwitch,
    createWire,
    simulationState,
    isRunning
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
  }, [simulationState, wireStart, hoveredNodeId, draggingPlacedComponentId, dragOffset, selectComponent, moveComponent, isRunning, toggleSwitch, createWire]);
  
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

  return (
    <div className="relative w-full h-full">
      <canvas 
        ref={canvasRef} 
        className="w-full h-full bg-gray-50 circuit-canvas"
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
            left: getNodePositionFromId(hoveredNodeId, simulationState.components).x - 6, 
            top: getNodePositionFromId(hoveredNodeId, simulationState.components).y - 6,
            zIndex: 5
          }}
        />
      )}
    </div>
  );
};

export default CircuitCanvas;
