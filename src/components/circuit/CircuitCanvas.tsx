
import React, { useRef, useState, useEffect } from 'react';
import { Circuit, ComponentType } from '@/types/circuit';
import { renderCircuit } from '@/lib/renderer';
import { findItemAtPosition } from '@/lib/interaction';

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
  const [draggedItem, setDraggedItem] = useState<{ id: string, type: 'component' | 'node' } | null>(null);
  const [dragStartPos, setDragStartPos] = useState({ x: 0, y: 0 });
  const [connectionStart, setConnectionStart] = useState<string | null>(null); // node ID
  
  // Handle canvas click for component placement and interaction
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Find if we're clicking on a component or node
    const item = findItemAtPosition(circuit, x, y);
    
    if (item) {
      if (item.type === 'node') {
        // Handle node click for connections
        if (!connectionStart) {
          setConnectionStart(item.id);
        } else if (connectionStart !== item.id) {
          onConnectNodes(connectionStart, item.id);
          setConnectionStart(null);
        }
        return;
      } else if (item.type === 'component') {
        // Handle component interaction
        const component = circuit.components.find(c => c.id === item.id);
        if (component?.type === 'switch') {
          onToggleSwitch(item.id);
          return;
        }
      }
    }
    
    // If nothing clicked and we have a component selected, place it
    if (selectedComponent) {
      onAddComponent(selectedComponent, x, y);
    } else if (connectionStart) {
      // Clear connection if clicking empty space
      setConnectionStart(null);
    }
  };
  
  // Render circuit on canvas
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
    
    // Render circuit with options
    const render = () => {
      if (!ctx) return;
      
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Render circuit with options
      renderCircuit(ctx, circuit, {
        showVoltages,
        showCurrents,
        highlightedNodeId: connectionStart,
        theme: 'light',
      });
      
      // Request next frame
      requestAnimationFrame(render);
    };
    
    const animationId = requestAnimationFrame(render);
    
    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [circuit, connectionStart, showVoltages, showCurrents]);
  
  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full"
      onClick={handleCanvasClick}
      style={{ 
        cursor: selectedComponent ? 'crosshair' : 
                connectionStart ? 'pointer' :
                isDragging ? 'grabbing' : 'default'
      }}
    />
  );
}
