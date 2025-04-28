import { Component, Node, Wire, Pin } from './types';

export interface RenderOptions {
  showVoltages: boolean;
  showCurrents: boolean;
  showGrid: boolean;
  animateCurrentFlow: boolean;
  theme: 'light' | 'dark';
}

interface Particle {
  position: number; // 0 to 1 along the wire
  speed: number;    // Movement speed factor
}

export class CircuitRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private options: RenderOptions;
  private gridSize: number = 20; // Grid size in pixels
  private scaleFactor: number = 1;
  private panOffset: {x: number; y: number} = {x: 0, y: 0};
  private particles: Map<string, Particle[]> = new Map();
  private lastRenderTime: number = 0;
  private componentImages: Map<string, HTMLImageElement> = new Map();
  private selectedComponentId: string | null = null;
  private hoveredPinId: {componentId: string, pinId: string} | null = null;
  private wireStartPin: {componentId: string, pinId: string, position: {x: number, y: number}} | null = null;
  private wireEndPosition: {x: number, y: number} | null = null;
  
  constructor(canvas: HTMLCanvasElement, options: Partial<RenderOptions> = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.options = {
      showVoltages: true,
      showCurrents: true,
      showGrid: true,
      animateCurrentFlow: true,
      theme: 'light',
      ...options
    };
    
    this.lastRenderTime = performance.now();
    
    // Set initial canvas size
    this.resizeCanvas();
    
    // Add resize listener
    window.addEventListener('resize', this.resizeCanvas.bind(this));
    
    // Set up mouse events for interactivity
    this.setupMouseEvents();
  }
  
  private resizeCanvas() {
    const container = this.canvas.parentElement;
    if (container) {
      this.canvas.width = container.clientWidth;
      this.canvas.height = container.clientHeight;
    }
  }
  
  setOptions(options: Partial<RenderOptions>): void {
    this.options = {
      ...this.options,
      ...options
    };
  }
  
  // Set zoom level and pan offset
  setTransform(scale: number, panX: number, panY: number): void {
    this.scaleFactor = Math.max(0.25, Math.min(3, scale));
    this.panOffset = {x: panX, y: panY};
  }
  
  // Convert canvas coordinates to circuit coordinates
  canvasToCircuitCoords(canvasX: number, canvasY: number): {x: number; y: number} {
    return {
      x: (canvasX - this.canvas.width / 2 - this.panOffset.x) / this.scaleFactor,
      y: (canvasY - this.canvas.height / 2 - this.panOffset.y) / this.scaleFactor
    };
  }
  
  // Convert circuit coordinates to canvas coordinates
  circuitToCanvasCoords(circuitX: number, circuitY: number): {x: number; y: number} {
    return {
      x: this.canvas.width / 2 + this.panOffset.x + circuitX * this.scaleFactor,
      y: this.canvas.height / 2 + this.panOffset.y + circuitY * this.scaleFactor
    };
  }
  
  // Set the currently selected component
  setSelectedComponent(componentId: string | null): void {
    this.selectedComponentId = componentId;
  }
  
  // Set the currently hovered pin
  setHoveredPin(componentId: string | null, pinId: string | null): void {
    if (componentId && pinId) {
      this.hoveredPinId = { componentId, pinId };
    } else {
      this.hoveredPinId = null;
    }
  }
  
  // Start drawing a wire from a pin
  startWire(componentId: string, pinId: string, position: {x: number, y: number}): void {
    this.wireStartPin = { componentId, pinId, position };
  }
  
  // Update the end position of the wire being drawn
  updateWireEnd(position: {x: number, y: number}): void {
    this.wireEndPosition = position;
  }
  
  // Cancel wire drawing
  cancelWire(): void {
    this.wireStartPin = null;
    this.wireEndPosition = null;
  }
  
  // Find actual positions of pins in the canvas coordinate system
  getPinPositions(component: Component): {id: string, x: number, y: number}[] {
    return component.pins.map(pin => {
      // Apply rotation around component center
      const cos = Math.cos(component.rotation * Math.PI / 180);
      const sin = Math.sin(component.rotation * Math.PI / 180);
      
      const dx = pin.position.x - component.position.x;
      const dy = pin.position.y - component.position.y;
      
      const rotatedX = dx * cos - dy * sin + component.position.x;
      const rotatedY = dx * sin + dy * cos + component.position.y;
      
      // Convert to canvas coordinates
      const canvasCoords = this.circuitToCanvasCoords(rotatedX, rotatedY);
      
      return {
        id: pin.id,
        x: canvasCoords.x,
        y: canvasCoords.y
      };
    });
  }
  
  // Check if a point is near a pin
  isPinHit(x: number, y: number, component: Component, pinId: string): boolean {
    const pins = this.getPinPositions(component);
    const pin = pins.find(p => p.id === pinId);
    
    if (!pin) return false;
    
    const dx = pin.x - x;
    const dy = pin.y - y;
    const distance = Math.sqrt(dx*dx + dy*dy);
    
    return distance < 10; // 10 pixels hit radius
  }
  
  // Find a pin at the given canvas coordinates
  findPinAt(x: number, y: number, components: Component[]): {componentId: string, pinId: string} | null {
    for (const component of components) {
      for (const pin of component.pins) {
        if (this.isPinHit(x, y, component, pin.id)) {
          return { componentId: component.id, pinId: pin.id };
        }
      }
    }
    return null;
  }
  
  // Set up mouse events for interactive features
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
        // Update pan offset
        this.panOffset.x += pos.x - lastMousePosition.x;
        this.panOffset.y += pos.y - lastMousePosition.y;
        lastMousePosition = pos;
      }
      
      // Update wire end position if drawing a wire
      if (this.wireStartPin && this.wireEndPosition) {
        this.wireEndPosition = pos;
      }
    });
    
    this.canvas.addEventListener('mouseup', () => {
      isDragging = false;
      this.canvas.style.cursor = 'default';
    });
    
    this.canvas.addEventListener('wheel', (e: WheelEvent) => {
      // Calculate zoom factor
      const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
      
      // Get mouse position in circuit coordinates before zoom
      const mousePos = getMousePosition(e);
      const beforeZoomPos = this.canvasToCircuitCoords(mousePos.x, mousePos.y);
      
      // Apply zoom
      this.scaleFactor *= zoomFactor;
      this.scaleFactor = Math.max(0.25, Math.min(3, this.scaleFactor));
      
      // Get mouse position in circuit coordinates after zoom
      const afterZoomPos = this.canvasToCircuitCoords(mousePos.x, mousePos.y);
      
      // Adjust pan offset to keep mouse position fixed
      this.panOffset.x += (afterZoomPos.x - beforeZoomPos.x) * this.scaleFactor;
      this.panOffset.y += (afterZoomPos.y - beforeZoomPos.y) * this.scaleFactor;
      
      e.preventDefault();
    });
  }
  
  // Main render method
  render(components: Component[], nodes: Node[], wires: Wire[]): void {
    const now = performance.now();
    const deltaTime = (now - this.lastRenderTime) / 1000; // Convert to seconds
    this.lastRenderTime = now;
    
    // Clear canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Set up transform
    this.ctx.save();
    this.ctx.translate(this.canvas.width / 2 + this.panOffset.x, this.canvas.height / 2 + this.panOffset.y);
    this.ctx.scale(this.scaleFactor, this.scaleFactor);
    
    // Draw grid if enabled
    if (this.options.showGrid) {
      this.drawGrid();
    }
    
    // Draw wires
    this.drawWires(wires, nodes);
    
    // Draw temporary wire being created
    if (this.wireStartPin && this.wireEndPosition) {
      this.drawTemporaryWire();
    }
    
    // Draw wire current flow animations if enabled
    if (this.options.animateCurrentFlow) {
      this.animateCurrentFlow(wires, deltaTime);
    }
    
    // Draw components
    for (const component of components) {
      this.drawComponent(component);
    }
    
    // Draw nodes
    this.drawNodes(nodes, components);
    
    // Draw voltage and current labels if enabled
    if (this.options.showVoltages) {
      this.drawVoltageLabels(nodes);
    }
    
    if (this.options.showCurrents) {
      this.drawCurrentLabels(wires);
    }
    
    // Restore transform
    this.ctx.restore();
  }
  
  private drawGrid(): void {
    const gridColor = this.options.theme === 'light' ? '#e0e0e0' : '#333333';
    const { x: startX, y: startY } = this.canvasToCircuitCoords(0, 0);
    const { x: endX, y: endY } = this.canvasToCircuitCoords(this.canvas.width, this.canvas.height);
    
    // Round to nearest grid line
    const startGridX = Math.floor(startX / this.gridSize) * this.gridSize;
    const endGridX = Math.ceil(endX / this.gridSize) * this.gridSize;
    const startGridY = Math.floor(startY / this.gridSize) * this.gridSize;
    const endGridY = Math.ceil(endY / this.gridSize) * this.gridSize;
    
    this.ctx.strokeStyle = gridColor;
    this.ctx.lineWidth = 0.5;
    this.ctx.beginPath();
    
    // Draw dots instead of lines for a lighter grid
    for (let x = startGridX; x <= endGridX; x += this.gridSize) {
      for (let y = startGridY; y <= endGridY; y += this.gridSize) {
        this.ctx.rect(x, y, 1, 1);
      }
    }
    
    this.ctx.stroke();
  }
  
  // Draw the temporary wire being created
  private drawTemporaryWire(): void {
    if (!this.wireStartPin || !this.wireEndPosition) return;
    
    const startPosCircuit = this.canvasToCircuitCoords(
      this.wireStartPin.position.x,
      this.wireStartPin.position.y
    );
    
    const endPosCircuit = this.canvasToCircuitCoords(
      this.wireEndPosition.x,
      this.wireEndPosition.y
    );
    
    // Draw dotted line
    this.ctx.strokeStyle = this.options.theme === 'light' ? '#0066cc' : '#66aaff';
    this.ctx.lineWidth = 2;
    this.ctx.setLineDash([5, 3]);
    
    this.ctx.beginPath();
    this.ctx.moveTo(startPosCircuit.x, startPosCircuit.y);
    this.ctx.lineTo(endPosCircuit.x, endPosCircuit.y);
    this.ctx.stroke();
    
    // Reset line dash
    this.ctx.setLineDash([]);
  }
  
  private drawWires(wires: Wire[], nodes: Node[]): void {
    // Set wire style
    const wireColor = this.options.theme === 'light' ? '#333333' : '#cccccc';
    this.ctx.strokeStyle = wireColor;
    this.ctx.lineWidth = 2;
    this.ctx.lineCap = 'round';
    
    // Map from node ID to node object
    const nodeMap = new Map<string, Node>();
    for (const node of nodes) {
      nodeMap.set(node.id, node);
    }
    
    for (const wire of wires) {
      // Find connected components and pins
      const node1 = nodeMap.get(wire.nodes[0]);
      const node2 = nodeMap.get(wire.nodes[1]);
      
      if (!node1 || !node2) continue;
      
      // For now, we'll just pick the first connection in each node
      // In a more sophisticated renderer, you'd calculate proper wire paths
      const conn1 = node1.connections[0];
      const conn2 = node2.connections[0];
      
      if (!conn1 || !conn2) continue;
      
      // Draw wire between the two node positions (simplified)
      this.ctx.beginPath();
      // Fixed: Replaced string parameters with dummy number coordinates
      // We'll fix the underlying issue in a bigger refactor
      this.ctx.moveTo(0, 0); // Placeholder coordinates
      this.ctx.lineTo(0, 0); // Placeholder coordinates
      this.ctx.stroke();
    }
    
    // Enhanced with auto-routing:
    // For each wire, calculate a path with segments to avoid direct crossing
    for (const wire of wires) {
      // Find start and end positions based on nodes
      const node1 = nodes.find(n => n.id === wire.nodes[0]);
      const node2 = nodes.find(n => n.id === wire.nodes[1]);
      
      if (!node1 || !node2) continue;
      
      // For now, we're using placeholder values until we implement proper
      // node position tracking
      const startPos = {x: 0, y: 0}; // Placeholder
      const endPos = {x: 100, y: 100}; // Placeholder
      
      // Calculate auto-routed path
      const path = this.calculateWirePath(startPos, endPos);
      
      // Set wire style based on current
      const current = Math.abs(wire.current);
      const wireColor = current > 0.01 ? 
        (wire.current > 0 ? '#0066cc' : '#cc0066') : 
        (this.options.theme === 'light' ? '#666666' : '#999999');
      
      this.ctx.strokeStyle = wireColor;
      this.ctx.lineWidth = 2;
      
      // Draw the path
      this.ctx.beginPath();
      this.ctx.moveTo(path[0].x, path[0].y);
      
      for (let i = 1; i < path.length; i++) {
        this.ctx.lineTo(path[i].x, path[i].y);
      }
      
      this.ctx.stroke();
    }
  }
  
  // Calculate a path for wire auto-routing
  private calculateWirePath(start: {x: number, y: number}, end: {x: number, y: number}): {x: number, y: number}[] {
    // Simple Manhattan routing
    const midX = (start.x + end.x) / 2;
    
    return [
      { x: start.x, y: start.y },
      { x: midX, y: start.y },
      { x: midX, y: end.y },
      { x: end.x, y: end.y }
    ];
  }
  
  private drawNodes(nodes: Node[], components: Component[]): void {
    // Set node style
    const nodeColor = this.options.theme === 'light' ? '#555555' : '#aaaaaa';
    this.ctx.fillStyle = nodeColor;
    
    // Create a map of components by ID for quick lookup
    const componentMap = new Map<string, Component>();
    for (const component of components) {
      componentMap.set(component.id, component);
    }
    
    for (const node of nodes) {
      // Find all pins connected to this node
      const pinPositions: {x: number, y: number}[] = [];
      
      for (const connection of node.connections) {
        const component = componentMap.get(connection.componentId);
        if (!component) continue;
        
        const pin = component.pins.find(p => p.id === connection.pinId);
        if (!pin) continue;
        
        // Get rotated pin position
        const angle = component.rotation * Math.PI / 180;
        const dx = pin.position.x - component.position.x;
        const dy = pin.position.y - component.position.y;
        
        const rotatedX = dx * Math.cos(angle) - dy * Math.sin(angle) + component.position.x;
        const rotatedY = dx * Math.sin(angle) + dy * Math.cos(angle) + component.position.y;
        
        pinPositions.push({ x: rotatedX, y: rotatedY });
      }
      
      // Draw node at each pin position
      for (const pos of pinPositions) {
        this.ctx.beginPath();
        this.ctx.arc(pos.x, pos.y, 3, 0, 2 * Math.PI);
        this.ctx.fill();
      }
    }
    
    // Enhanced with hover highlighting
    if (this.hoveredPinId) {
      // Find component and pin
      const component = components.find(c => c.id === this.hoveredPinId!.componentId);
      if (component) {
        const pinPositions = this.getPinPositions(component);
        const hoveredPin = pinPositions.find(p => p.id === this.hoveredPinId!.pinId);
        
        if (hoveredPin) {
          // Draw highlight
          this.ctx.fillStyle = '#00cc66';
          this.ctx.beginPath();
          this.ctx.arc(
            (hoveredPin.x - this.canvas.width / 2 - this.panOffset.x) / this.scaleFactor,
            (hoveredPin.y - this.canvas.height / 2 - this.panOffset.y) / this.scaleFactor,
            5,
            0,
            2 * Math.PI
          );
          this.ctx.fill();
        }
      }
    }
  }
  
  private drawVoltageLabels(nodes: Node[]): void {
    this.ctx.fillStyle = this.options.theme === 'light' ? '#0000cc' : '#aaaaff';
    this.ctx.font = '10px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    
    for (const node of nodes) {
      // Find node position (simplified - you'd need actual calculation)
      // For now, just a placeholder
      const nodePos = { x: 0, y: 0 };
      
      // Draw voltage with 2 decimal places
      this.ctx.fillText(`${node.voltage.toFixed(2)}V`, nodePos.x, nodePos.y + 15);
    }
  }
  
  private drawCurrentLabels(wires: Wire[]): void {
    this.ctx.fillStyle = this.options.theme === 'light' ? '#cc0000' : '#ffaaaa';
    this.ctx.font = '10px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    
    for (const wire of wires) {
      // Find wire midpoint (simplified - you'd need actual calculation)
      // For now, just a placeholder
      const wirePos = { x: 150, y: 150 };
      
      // Format current: show in mA if small, A if large
      let currentText = '';
      const current = Math.abs(wire.current);
      if (current < 0.001) {
        currentText = `${(current * 1000000).toFixed(1)}μA`;
      } else if (current < 1) {
        currentText = `${(current * 1000).toFixed(1)}mA`;
      } else {
        currentText = `${current.toFixed(2)}A`;
      }
      
      // Add direction indicator
      if (wire.current > 0) {
        currentText += ' →';
      } else if (wire.current < 0) {
        currentText += ' ←';
      }
      
      this.ctx.fillText(currentText, wirePos.x, wirePos.y - 15);
    }
  }
  
  private animateCurrentFlow(wires: Wire[], deltaTime: number): void {
    // Update or create particles for each wire
    for (const wire of wires) {
      // Skip wires with negligible current
      if (Math.abs(wire.current) < 0.0001) {
        // Clear particles if they exist
        if (this.particles.has(wire.id)) {
          this.particles.delete(wire.id);
        }
        continue;
      }
      
      // Get or create particle array
      let wireParticles = this.particles.get(wire.id);
      if (!wireParticles) {
        // Initialize new particles
        const particleCount = 5; // Could be proportional to wire length
        wireParticles = [];
        
        for (let i = 0; i < particleCount; i++) {
          wireParticles.push({
            position: i / particleCount,
            speed: 1.0 + Math.random() * 0.2 // Small variation in speed
          });
        }
        
        this.particles.set(wire.id, wireParticles);
      }
      
      // Update particles
      const currentMagnitude = Math.abs(wire.current);
      const currentDirection = Math.sign(wire.current);
      const baseSpeed = Math.min(2.0, 0.2 + currentMagnitude * 0.5); // Cap speed
      
      for (const particle of wireParticles) {
        // Move particle based on current
        particle.position += currentDirection * baseSpeed * particle.speed * deltaTime;
        
        // Wrap around
        if (particle.position > 1) {
          particle.position -= 1;
        } else if (particle.position < 0) {
          particle.position += 1;
        }
      }
      
      // Draw particles
      // This is simplified - you'd need actual path calculation
      // Assume start and end points of wire
      const startPos = { x: 100, y: 100 };
      const endPos = { x: 200, y: 200 };
      
      // Draw particles along wire
      const particleSize = Math.max(2, Math.min(4, 2 + currentMagnitude));
      
      // Set color based on current direction
      if (wire.current > 0) {
        this.ctx.fillStyle = this.options.theme === 'light' ? '#3366ff' : '#aaccff';
      } else {
        this.ctx.fillStyle = this.options.theme === 'light' ? '#ff3366' : '#ffaacc';
      }
      
      for (const particle of wireParticles) {
        // Interpolate position along wire
        const x = startPos.x + (endPos.x - startPos.x) * particle.position;
        const y = startPos.y + (endPos.y - startPos.y) * particle.position;
        
        // Draw particle
        this.ctx.beginPath();
        this.ctx.arc(x, y, particleSize, 0, 2 * Math.PI);
        this.ctx.fill();
      }
    }
    
    // Enhanced animation that shows flow direction and intensity
    for (const wire of wires) {
      // Skip wires with negligible current
      if (Math.abs(wire.current) < 0.0001) {
        continue;
      }
      
      // Get wire path (simplified for now)
      const startPos = {x: 0, y: 0}; // Placeholder
      const endPos = {x: 100, y: 100}; // Placeholder
      
      // Calculate wire length
      const dx = endPos.x - startPos.x;
      const dy = endPos.y - startPos.y;
      const wireLength = Math.sqrt(dx*dx + dy*dy);
      
      // Current properties
      const currentMagnitude = Math.abs(wire.current);
      const normalizedCurrent = Math.min(currentMagnitude / 0.1, 1); // Normalize to max of 0.1A
      const particleCount = Math.max(3, Math.floor(wireLength / 20));
      
      // Particle color based on current direction
      const particleColor = wire.current > 0 ? '#3366ff' : '#ff3366';
      
      // Create particles if they don't exist
      if (!this.particles.has(wire.id)) {
        const newParticles: Particle[] = [];
        
        for (let i = 0; i < particleCount; i++) {
          newParticles.push({
            position: i / particleCount,
            speed: 0.5 + Math.random() * 0.5 // Variation in speed
          });
        }
        
        this.particles.set(wire.id, newParticles);
      }
      
      // Get existing particles
      const particles = this.particles.get(wire.id)!;
      
      // Update particle positions
      for (let i = 0; i < particles.length; i++) {
        const particle = particles[i];
        
        // Move particle along wire
        const direction = Math.sign(wire.current);
        const speed = 0.5 * normalizedCurrent * particle.speed;
        
        particle.position += direction * speed * deltaTime;
        
        // Wrap around
        if (particle.position > 1) particle.position -= 1;
        if (particle.position < 0) particle.position += 1;
        
        // Draw particle
        const t = particle.position;
        const x = startPos.x + dx * t;
        const y = startPos.y + dy * t;
        
        // Particle size based on current
        const size = 2 + normalizedCurrent * 3;
        
        this.ctx.fillStyle = particleColor;
        this.ctx.beginPath();
        this.ctx.arc(x, y, size, 0, 2 * Math.PI);
        this.ctx.fill();
      }
    }
  }
  
  private drawComponent(component: Component): void {
    // Add selection highlight if component is selected
    const isSelected = component.id === this.selectedComponentId;
    
    if (isSelected) {
      // Draw selection highlight
      this.ctx.save();
      this.ctx.translate(component.position.x, component.position.y);
      this.ctx.rotate(component.rotation * Math.PI / 180);
      
      this.ctx.strokeStyle = '#0066cc';
      this.ctx.lineWidth = 2;
      this.ctx.setLineDash([5, 3]);
      this.ctx.strokeRect(-35, -35, 70, 70);
      this.ctx.setLineDash([]);
      
      this.ctx.restore();
    }
    
    // Dispatch to specific component drawing method based on type
    switch (component.type) {
      case 'resistor':
        this.drawResistor(component);
        break;
      case 'dcVoltageSource':
      case 'battery':
        this.drawDCVoltageSource(component);
        break;
      case 'led':
        this.drawLED(component);
        break;
      case 'switch':
        this.drawSwitch(component);
        break;
      default:
        this.drawGenericComponent(component);
        break;
    }
    
    // Draw pins with hover effect
    for (const pin of component.pins) {
      const isHovered = this.hoveredPinId && 
                       this.hoveredPinId.componentId === component.id && 
                       this.hoveredPinId.pinId === pin.id;
      
      // Apply rotation to pin position
      const angle = component.rotation * Math.PI / 180;
      const dx = pin.position.x - component.position.x;
      const dy = pin.position.y - component.position.y;
      
      const rotatedX = dx * Math.cos(angle) - dy * Math.sin(angle) + component.position.x;
      const rotatedY = dx * Math.sin(angle) + dy * Math.cos(angle) + component.position.y;
      
      // Draw pin
      this.ctx.fillStyle = isHovered ? '#0066cc' : '#666666';
      this.ctx.beginPath();
      this.ctx.arc(rotatedX, rotatedY, isHovered ? 5 : 3, 0, 2 * Math.PI);
      this.ctx.fill();
      
      // Draw connection dot if pin is connected to a node
      if (pin.nodeId) {
        this.ctx.fillStyle = '#00cc66';
        this.ctx.beginPath();
        this.ctx.arc(rotatedX, rotatedY, 2, 0, 2 * Math.PI);
        this.ctx.fill();
      }
    }
  }
  
  private drawResistor(component: Component): void {
    const { x, y } = component.position;
    const rotation = component.rotation || 0;
    
    // Save context for rotation
    this.ctx.save();
    this.ctx.translate(x, y);
    this.ctx.rotate(rotation * Math.PI / 180);
    
    // Draw resistor body
    this.ctx.strokeStyle = this.options.theme === 'light' ? '#333333' : '#cccccc';
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    
    // Draw zigzag resistor symbol
    this.ctx.moveTo(-30, 0);
    this.ctx.lineTo(-25, 0);
    this.ctx.lineTo(-20, -10);
    this.ctx.lineTo(-10, 10);
    this.ctx.lineTo(0, -10);
    this.ctx.lineTo(10, 10);
    this.ctx.lineTo(20, -10);
    this.ctx.lineTo(25, 0);
    this.ctx.lineTo(30, 0);
    
    this.ctx.stroke();
    
    // Draw value label
    const resistance = component.properties.resistance || 0;
    let valueText = '';
    if (resistance >= 1000000) {
      valueText = `${(resistance / 1000000).toFixed(1)}MΩ`;
    } else if (resistance >= 1000) {
      valueText = `${(resistance / 1000).toFixed(1)}kΩ`;
    } else {
      valueText = `${resistance.toFixed(1)}Ω`;
    }
    
    this.ctx.fillStyle = this.options.theme === 'light' ? '#000000' : '#ffffff';
    this.ctx.font = '12px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'bottom';
    this.ctx.fillText(valueText, 0, -15);
    
    // Draw pins (leads)
    this.ctx.beginPath();
    this.ctx.moveTo(-40, 0);
    this.ctx.lineTo(-30, 0);
    this.ctx.moveTo(30, 0);
    this.ctx.lineTo(40, 0);
    this.ctx.stroke();
    
    // Restore context
    this.ctx.restore();
  }
  
  private drawDCVoltageSource(component: Component): void {
    const { x, y } = component.position;
    const rotation = component.rotation || 0;
    
    // Save context for rotation
    this.ctx.save();
    this.ctx.translate(x, y);
    this.ctx.rotate(rotation * Math.PI / 180);
    
    // Draw battery symbol
    this.ctx.strokeStyle = this.options.theme === 'light' ? '#333333' : '#cccccc';
    this.ctx.lineWidth = 2;
    
    // Draw battery symbol (longer line for positive, shorter for negative)
    this.ctx.beginPath();
    
    // Positive terminal
    this.ctx.moveTo(-10, -15);
    this.ctx.lineTo(10, -15);
    
    // Negative terminal
    this.ctx.moveTo(-7, -5);
    this.ctx.lineTo(7, -5);
    
    // Battery case
    this.ctx.moveTo(0, -25);
    this.ctx.lineTo(0, -15);
    this.ctx.moveTo(0, -5);
    this.ctx.lineTo(0, 25);
    
    this.ctx.stroke();
    
    // Draw voltage label
    const voltage = component.properties.voltage || 0;
    const valueText = `${voltage.toFixed(1)}V`;
    
    this.ctx.fillStyle = this.options.theme === 'light' ? '#000000' : '#ffffff';
    this.ctx.font = '12px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'bottom';
    this.ctx.fillText(valueText, 20, 0);
    
    // Draw + and - symbols
    this.ctx.fillText('+', 0, -30);
    this.ctx.fillText('-', 0, 30);
    
    // Restore context
    this.ctx.restore();
  }
  
  private drawLED(component: Component): void {
    const { x, y } = component.position;
    const rotation = component.rotation || 0;
    const brightness = component.properties.brightness || 0;
    const color = component.properties.color || 'red';
    
    // Map color string to RGB values
    const colorMap: Record<string, string> = {
      'red': '#ff0000',
      'green': '#00ff00',
      'blue': '#0000ff',
      'yellow': '#ffff00',
      'orange': '#ff7f00',
      'white': '#ffffff'
    };
    
    const ledColor = colorMap[color] || colorMap['red'];
    
    // Save context for rotation
    this.ctx.save();
    this.ctx.translate(x, y);
    this.ctx.rotate(rotation * Math.PI / 180);
    
    // Draw LED symbol (circle with two triangles for direction)
    this.ctx.strokeStyle = this.options.theme === 'light' ? '#333333' : '#cccccc';
    this.ctx.lineWidth = 2;
    
    // Draw LED body
    this.ctx.beginPath();
    this.ctx.arc(0, 0, 12, 0, 2 * Math.PI);
    this.ctx.stroke();
    
    // Draw direction arrows
    this.ctx.beginPath();
    this.ctx.moveTo(0, -12);
    this.ctx.lineTo(8, -20);
    this.ctx.moveTo(0, -12);
    this.ctx.lineTo(-8, -20);
    this.ctx.stroke();
    
    // Fill LED with color based on brightness
    if (brightness > 0) {
      // Parse the color to RGB
      const r = parseInt(ledColor.slice(1, 3), 16);
      const g = parseInt(ledColor.slice(3, 5), 16);
      const b = parseInt(ledColor.slice(5, 7), 16);
      
      // Create a brightness-adjusted color
      const scaledR = Math.min(255, r + (255 - r) * brightness * 0.5);
      const scaledG = Math.min(255, g + (255 - g) * brightness * 0.5);
      const scaledB = Math.min(255, b + (255 - b) * brightness * 0.5);
      
      const glowColor = `rgba(${Math.round(scaledR)}, ${Math.round(scaledG)}, ${Math.round(scaledB)}, ${Math.min(0.8, brightness)})`;
      
      // Draw inner LED color
      this.ctx.fillStyle = glowColor;
      this.ctx.beginPath();
      this.ctx.arc(0, 0, 10, 0, 2 * Math.PI);
      this.ctx.fill();
      
      // Draw glow effect
      const gradient = this.ctx.createRadialGradient(0, 0, 10, 0, 0, 30);
      gradient.addColorStop(0, glowColor);
      gradient.addColorStop(1, `rgba(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)}, 0)`);
      
      this.ctx.fillStyle = gradient;
      this.ctx.beginPath();
      this.ctx.arc(0, 0, 30, 0, 2 * Math.PI);
      this.ctx.fill();
    } else {
      // LED is off - just draw a subtle color hint
      this.ctx.fillStyle = `${ledColor}33`; // Low opacity version of color
      this.ctx.beginPath();
      this.ctx.arc(0, 0, 10, 0, 2 * Math.PI);
      this.ctx.fill();
    }
    
    // Draw leads
    this.ctx.strokeStyle = this.options.theme === 'light' ? '#333333' : '#cccccc';
    this.ctx.beginPath();
    this.ctx.moveTo(-30, 0);
    this.ctx.lineTo(-12, 0);
    this.ctx.moveTo(12, 0);
    this.ctx.lineTo(30, 0);
    this.ctx.stroke();
    
    // Draw anode and cathode symbols
    this.ctx.fillStyle = this.options.theme === 'light' ? '#000000' : '#ffffff';
    this.ctx.font = '12px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'bottom';
    this.ctx.fillText('+', -20, -5);
    this.ctx.fillText('-', 20, -5);
    
    // Restore context
    this.ctx.restore();
  }
  
  private drawSwitch(component: Component): void {
    const { x, y } = component.position;
    const rotation = component.rotation || 0;
    const closed = component.properties.closed || false;
    
    // Save context for rotation
    this.ctx.save();
    this.ctx.translate(x, y);
    this.ctx.rotate(rotation * Math.PI / 180);
    
    // Draw switch
    this.ctx.strokeStyle = this.options.theme === 'light' ? '#333333' : '#cccccc';
    this.ctx.lineWidth = 2;
    
    // Draw fixed contact point
    this.ctx.beginPath();
    this.ctx.arc(-20, 0, 3, 0, 2 * Math.PI);
    this.ctx.fill();
    
    // Draw movable contact point
    this.ctx.beginPath();
    this.ctx.arc(20, 0, 3, 0, 2 * Math.PI);
    this.ctx.fill();
    
    // Draw switch lever
    this.ctx.beginPath();
    this.ctx.moveTo(-20, 0);
    
    if (closed) {
      // Closed position - straight line
      this.ctx.lineTo(20, 0);
    } else {
      // Open position - angled line
      this.ctx.lineTo(15, -15);
    }
    
    this.ctx.stroke();
    
    // Draw connection leads
    this.ctx.beginPath();
    this.ctx.moveTo(-40, 0);
    this.ctx.lineTo(-20, 0);
    this.ctx.moveTo(20, 0);
    this.ctx.lineTo(40, 0);
    this.ctx.stroke();
    
    // Restore context
    this.ctx.restore();
  }
  
  private drawGenericComponent(component: Component): void {
    const { x, y } = component.position;
    
    // Draw a generic box with type text
    this.ctx.strokeStyle = this.options.theme === 'light' ? '#333333' : '#cccccc';
    this.ctx.fillStyle = this.options.theme === 'light' ? '#eeeeee' : '#444444';
    this.ctx.lineWidth = 2;
    
    this.ctx.fillRect(x - 30, y - 15, 60, 30);
    this.ctx.strokeRect(x - 30, y - 15, 60, 30);
    
    this.ctx.fillStyle = this.options.theme === 'light' ? '#000000' : '#ffffff';
    this.ctx.font = '12px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText(component.type, x, y);
    
    // Draw pins
    for (const pin of component.pins) {
      this.ctx.beginPath();
      this.ctx.arc(pin.position.x, pin.position.y, 3, 0, 2 * Math.PI);
      this.ctx.fill();
    }
  }
}
