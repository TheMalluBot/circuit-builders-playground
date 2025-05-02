
import React, { useRef, useState, useEffect } from 'react';
import { Circuit, ComponentType, Component, Pin, Node } from '@/types/circuit';
import { renderCircuit } from '@/lib/renderer';
import { 
  findItemAtPosition, 
  calculatePinPosition, 
  calculateDistance,
  calculateWirePath 
} from '@/lib/interaction';

interface CircuitCanvasProps {
  circuit: Circuit;
  selectedComponent: ComponentType | null;
  onAddComponent: (type: ComponentType, x: number, y: number) => void;
  onConnectNodes: (sourceId: string, targetId: string) => void;
  onToggleSwitch: (componentId: string) => void;
  showVoltages: boolean;
  showCurrents: boolean;
  isRunning: boolean;
}

export function CircuitCanvas({
  circuit,
  selectedComponent,
  onAddComponent,
  onConnectNodes,
  onToggleSwitch,
  showVoltages,
  showCurrents,
  isRunning
}: CircuitCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Interaction state
  const [isDragging, setIsDragging] = useState(false);
  const [draggedItem, setDraggedItem] = useState<{ id: string, type: 'component' | 'node' | 'wire', segmentIndex?: number } | null>(null);
  const [dragStartPos, setDragStartPos] = useState({ x: 0, y: 0 });
  const [currentMousePos, setCurrentMousePos] = useState({ x: 0, y: 0 });
  
  // Wire connection state
  const [connectionStart, setConnectionStart] = useState<{
    nodeId: string | null;
    pinId: string;
    componentId: string;
    position: { x: number; y: number };
  } | null>(null);
  
  // Hover state
  const [hoveredItem, setHoveredItem] = useState<{
    type: 'pin' | 'component' | 'node' | 'wire';
    id: string;
    pinId?: string;
    componentId?: string;
    position?: { x: number; y: number };
  } | null>(null);
  
  // Handle canvas click for component placement and interaction
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isDragging) return; // Don't handle click if we're currently dragging
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Find if we're clicking on a component, node, or pin
    const item = findItemAtPosition(circuit, x, y);
    
    if (item) {
      // Handle pin click for connections
      if (item.type === 'pin') {
        if (connectionStart) {
          // Complete connection if clicking on a different pin
          if (connectionStart.componentId !== item.componentId) {
            if (connectionStart.nodeId && item.id) {
              onConnectNodes(connectionStart.nodeId, item.id);
            }
          }
          setConnectionStart(null);
        } else {
          // Start new connection
          const component = circuit.components.find(c => c.id === item.componentId);
          const pin = component?.pins.find(p => p.id === item.pinId);
          
          if (component && pin) {
            const pinPos = calculatePinPosition(component, pin);
            setConnectionStart({
              nodeId: pin.nodeId,
              pinId: pin.id,
              componentId: component.id,
              position: pinPos
            });
          }
        }
        return;
      }
      
      // Handle component interaction
      if (item.type === 'component') {
        const component = circuit.components.find(c => c.id === item.id);
        if (component?.type === 'switch') {
          onToggleSwitch(item.id);
          return;
        }
      }
      
      // Handle node click
      if (item.type === 'node') {
        if (connectionStart) {
          // Complete connection if we started from a pin
          if (connectionStart.nodeId && connectionStart.nodeId !== item.id) {
            onConnectNodes(connectionStart.nodeId, item.id);
          }
          setConnectionStart(null);
        }
        return;
      }
    } else {
      // If clicking empty space and we have a component selected, place it
      if (selectedComponent) {
        onAddComponent(selectedComponent, x, y);
      } else if (connectionStart) {
        // Cancel connection if clicking empty space
        setConnectionStart(null);
      }
    }
  };
  
  // Handle mouse down for dragging components
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (connectionStart) return; // Don't start drag if we're making a connection
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Find if we're clicking on a draggable item
    const item = findItemAtPosition(circuit, x, y);
    
    if (item && (item.type === 'component' || item.type === 'wire')) {
      setIsDragging(true);
      setDraggedItem(item);
      setDragStartPos({ x, y });
      e.preventDefault(); // Prevent text selection during drag
    }
  };
  
  // Handle mouse move for dragging and hovering
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Update current mouse position (used for drawing connection preview)
    setCurrentMousePos({ x, y });
    
    // Handle hovering
    if (!isDragging) {
      const item = findItemAtPosition(circuit, x, y);
      setHoveredItem(item);
    }
    
    // Handle dragging
    if (isDragging && draggedItem) {
      const dx = x - dragStartPos.x;
      const dy = y - dragStartPos.y;
      
      if (draggedItem.type === 'component') {
        // TODO: Implement component dragging via a moveComponent function
        // moveComponent(draggedItem.id, dx, dy);
      } else if (draggedItem.type === 'wire') {
        // TODO: Implement wire segment dragging
        // updateWirePath(draggedItem.id, draggedItem.segmentIndex, dx, dy);
      }
      
      setDragStartPos({ x, y });
    }
  };
  
  // Handle mouse up to end dragging
  const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDragging(false);
    setDraggedItem(null);
  };
  
  // Render circuit on canvas with interactive elements
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas size
    const resizeCanvas = () => {
      const container = canvas.parentElement;
      if (container) {
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight;
      }
    };
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    // Define render function
    const render = () => {
      if (!ctx) return;
      
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Render circuit with options
      renderCircuit(ctx, circuit, {
        showVoltages,
        showCurrents,
        highlightedNodeId: hoveredItem?.type === 'node' ? hoveredItem.id : null,
        theme: 'light',
      });
      
      // Highlight hovered pin if any
      if (hoveredItem?.type === 'pin') {
        const component = circuit.components.find(c => c.id === hoveredItem.componentId);
        const pin = component?.pins.find(p => p.id === hoveredItem.pinId);
        
        if (component && pin) {
          const pinPos = calculatePinPosition(component, pin);
          
          ctx.fillStyle = '#4299e1'; // Highlight color
          ctx.beginPath();
          ctx.arc(pinPos.x, pinPos.y, 6, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      
      // Draw connection preview if dragging a wire
      if (connectionStart) {
        ctx.strokeStyle = '#4299e1';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 3]);
        
        // Find target pin if hovering over one
        let endPos = currentMousePos;
        let isValidTarget = false;
        
        if (hoveredItem?.type === 'pin' && hoveredItem.componentId !== connectionStart.componentId) {
          const targetComponent = circuit.components.find(c => c.id === hoveredItem.componentId);
          const targetPin = targetComponent?.pins.find(p => p.id === hoveredItem.pinId);
          
          if (targetComponent && targetPin) {
            endPos = calculatePinPosition(targetComponent, targetPin);
            isValidTarget = true;
          }
        }
        
        // Draw smart routed preview path
        const path = calculateWirePath(connectionStart.position, endPos);
        
        ctx.beginPath();
        ctx.moveTo(path[0].x, path[0].y);
        
        for (let i = 1; i < path.length; i++) {
          ctx.lineTo(path[i].x, path[i].y);
        }
        
        ctx.stroke();
        ctx.setLineDash([]);
        
        // Draw highlight on valid target pin
        if (isValidTarget) {
          ctx.fillStyle = '#4299e1';
          ctx.beginPath();
          ctx.arc(endPos.x, endPos.y, 8, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      
      // Request next frame
      requestAnimationFrame(render);
    };
    
    const animationId = requestAnimationFrame(render);
    
    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [
    circuit, 
    hoveredItem, 
    connectionStart, 
    currentMousePos, 
    showVoltages, 
    showCurrents
  ]);
  
  // Add keyboard shortcuts for component rotation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Rotation functionality would be implemented here
      if (e.key.toLowerCase() === 'r' && hoveredItem?.type === 'component') {
        // TODO: Implement component rotation
        // rotateComponent(hoveredItem.id);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [hoveredItem]);
  
  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full"
      onClick={handleCanvasClick}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      style={{ 
        cursor: selectedComponent 
          ? 'crosshair' 
          : connectionStart 
            ? 'pointer' 
            : hoveredItem?.type === 'pin' 
              ? 'pointer'
              : isDragging 
                ? 'grabbing' 
                : 'default'
      }}
    />
  );
}
