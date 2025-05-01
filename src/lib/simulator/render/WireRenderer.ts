
import { Wire, Node } from '../types';
import { BaseRenderer } from './BaseRenderer';

interface Particle {
  position: number; // 0 to 1 along the wire
  speed: number;    // Movement speed factor
}

export class WireRenderer extends BaseRenderer {
  private particles: Map<string, Particle[]> = new Map();
  private wireStartPin: {componentId: string, pinId: string, position: {x: number, y: number}} | null = null;
  private wireEndPosition: {x: number, y: number} | null = null;
  
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
  
  // Calculate a path for wire auto-routing
  calculateWirePath(start: {x: number, y: number}, end: {x: number, y: number}): {x: number, y: number}[] {
    // Simple Manhattan routing
    const midX = (start.x + end.x) / 2;
    
    return [
      { x: start.x, y: start.y },
      { x: midX, y: start.y },
      { x: midX, y: end.y },
      { x: end.x, y: end.y }
    ];
  }
  
  // Draw the temporary wire being created
  drawTemporaryWire(): void {
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
  
  drawWires(wires: Wire[], nodes: Node[]): void {
    // Set wire style
    const wireColor = this.options.theme === 'light' ? '#333333' : '#cccccc';
    this.ctx.strokeStyle = wireColor;
    this.ctx.lineWidth = 2;
    this.ctx.lineCap = 'round';
    
    // Draw temporary wire if needed
    if (this.wireStartPin && this.wireEndPosition) {
      this.drawTemporaryWire();
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
  
  drawCurrentLabels(wires: Wire[]): void {
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
  
  animateCurrentFlow(wires: Wire[], deltaTime: number): void {
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
      
      // Placeholder start/end positions
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
  }
}
