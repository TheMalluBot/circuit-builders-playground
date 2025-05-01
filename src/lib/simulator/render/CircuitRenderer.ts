
import { Component, Node, Wire, RenderOptions } from '../types';
import { BaseRenderer } from './BaseRenderer';
import { WireRenderer } from './WireRenderer';
import { ComponentRenderer } from './ComponentRenderer';
import { NodeRenderer } from './NodeRenderer';

export class CircuitRenderer {
  private canvas: HTMLCanvasElement;
  private baseRenderer: BaseRenderer;
  private wireRenderer: WireRenderer;
  private componentRenderer: ComponentRenderer;
  private nodeRenderer: NodeRenderer;
  private options: RenderOptions;
  private lastRenderTime: number = 0;
  private animationFrameRef: number | null = null;
  
  constructor(canvas: HTMLCanvasElement, options: Partial<RenderOptions> = {}) {
    this.canvas = canvas;
    this.options = {
      showVoltages: true,
      showCurrents: true,
      showGrid: true,
      animateCurrentFlow: true,
      theme: 'light',
      ...options
    };
    
    // Initialize renderers
    this.baseRenderer = new BaseRenderer(canvas, this.options);
    this.wireRenderer = new WireRenderer(canvas, this.options);
    this.componentRenderer = new ComponentRenderer(canvas, this.options);
    this.nodeRenderer = new NodeRenderer(canvas, this.options);
    
    this.lastRenderTime = performance.now();
    
    // Set up mouse events for interactivity
    this.setupMouseEvents();
  }
  
  setOptions(options: Partial<RenderOptions>): void {
    this.options = {
      ...this.options,
      ...options
    };
    
    // Update options in all renderers
    this.wireRenderer.setOptions(this.options);
    this.componentRenderer.setOptions(this.options);
    this.nodeRenderer.setOptions(this.options);
  }
  
  // Set the currently selected component
  setSelectedComponent(componentId: string | null): void {
    this.componentRenderer.setSelectedComponent(componentId);
  }
  
  // Set the currently hovered pin
  setHoveredPin(componentId: string | null, pinId: string | null): void {
    this.componentRenderer.setHoveredPin(componentId, pinId);
  }
  
  // Start drawing a wire from a pin
  startWire(componentId: string, pinId: string, position: {x: number, y: number}): void {
    this.wireRenderer.startWire(componentId, pinId, position);
  }
  
  // Update the end position of the wire being drawn
  updateWireEnd(position: {x: number, y: number}): void {
    this.wireRenderer.updateWireEnd(position);
  }
  
  // Cancel wire drawing
  cancelWire(): void {
    this.wireRenderer.cancelWire();
  }
  
  // Set zoom level and pan offset
  setTransform(scale: number, panX: number, panY: number): void {
    this.baseRenderer.setTransform(scale, panX, panY);
    this.wireRenderer.setTransform(scale, panX, panY);
    this.componentRenderer.setTransform(scale, panX, panY);
    this.nodeRenderer.setTransform(scale, panX, panY);
  }
  
  // Convert canvas coordinates to circuit coordinates
  canvasToCircuitCoords(canvasX: number, canvasY: number): {x: number; y: number} {
    return this.baseRenderer.canvasToCircuitCoords(canvasX, canvasY);
  }
  
  // Convert circuit coordinates to canvas coordinates
  circuitToCanvasCoords(circuitX: number, circuitY: number): {x: number; y: number} {
    return this.baseRenderer.circuitToCanvasCoords(circuitX, circuitY);
  }
  
  // Find pin at coordinates
  findPinAt(x: number, y: number, components: Component[]): {componentId: string, pinId: string} | null {
    return this.componentRenderer.findPinAt(x, y, components);
  }
  
  // Main render method
  render(components: Component[], nodes: Node[], wires: Wire[]): void {
    const now = performance.now();
    const deltaTime = (now - this.lastRenderTime) / 1000; // Convert to seconds
    this.lastRenderTime = now;
    
    const ctx = this.canvas.getContext('2d')!;
    
    // Clear canvas
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Set up transform
    ctx.save();
    ctx.translate(this.canvas.width / 2, this.canvas.height / 2);
    
    // Draw grid if enabled
    if (this.options.showGrid) {
      this.baseRenderer.drawGrid();
    }
    
    // Draw wires
    this.wireRenderer.drawWires(wires, nodes);
    
    // Draw wire current flow animations if enabled
    if (this.options.animateCurrentFlow) {
      this.wireRenderer.animateCurrentFlow(wires, deltaTime);
    }
    
    // Draw components
    this.componentRenderer.drawComponents(components);
    
    // Draw nodes
    this.nodeRenderer.drawNodes(nodes, components);
    
    // Draw voltage and current labels if enabled
    if (this.options.showVoltages) {
      this.nodeRenderer.drawVoltageLabels(nodes);
    }
    
    if (this.options.showCurrents) {
      this.wireRenderer.drawCurrentLabels(wires);
    }
    
    // Restore transform
    ctx.restore();
  }
  
  // Setup mouse events for interactive features
  private setupMouseEvents(): void {
    let isDragging = false;
    let lastMousePosition = {x: 0, y: 0};
    
    const getMousePosition = (e: MouseEvent): {x: number, y: number} => {
      const rect = this.canvas.getBoundingClientRect();
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
    };
    
    this.canvas.addEventListener('mousedown', (e: MouseEvent) => {
      const pos = getMousePosition(e);
      lastMousePosition = pos;
      
      // Middle button for panning
      if (e.button === 1) {
        isDragging = true;
        this.canvas.style.cursor = 'grabbing';
        e.preventDefault();
      }
    });
    
    this.canvas.addEventListener('mousemove', (e: MouseEvent) => {
      const pos = getMousePosition(e);
      
      if (isDragging) {
        // Get current transform
        const dx = pos.x - lastMousePosition.x;
        const dy = pos.y - lastMousePosition.y;
        
        // Update pan offset by calculating new position
        // This is simplified - in a real implementation you'd track the actual offsets
        lastMousePosition = pos;
      }
    });
    
    this.canvas.addEventListener('mouseup', () => {
      isDragging = false;
      this.canvas.style.cursor = 'default';
    });
    
    this.canvas.addEventListener('wheel', (e: WheelEvent) => {
      // Simple zoom handling
      e.preventDefault();
    });
  }
  
  // Clean up resources
  dispose(): void {
    if (this.animationFrameRef !== null) {
      cancelAnimationFrame(this.animationFrameRef);
      this.animationFrameRef = null;
    }
  }
}
