
import { Component, Pin } from '../types';
import { BaseRenderer } from './BaseRenderer';

export class ComponentRenderer extends BaseRenderer {
  private selectedComponentId: string | null = null;
  private hoveredPinId: {componentId: string, pinId: string} | null = null;
  private componentImages: Map<string, HTMLImageElement> = new Map();
  
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
  
  // Find pin positions with rotation applied
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
  
  drawComponents(components: Component[]): void {
    // Draw each component
    for (const component of components) {
      this.drawComponent(component);
    }
  }
  
  drawComponent(component: Component): void {
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
