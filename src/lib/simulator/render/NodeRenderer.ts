
import { Node, Component } from '../types';
import { BaseRenderer } from './BaseRenderer';

export class NodeRenderer extends BaseRenderer {
  drawNodes(nodes: Node[], components: Component[]): void {
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
  }
  
  drawVoltageLabels(nodes: Node[]): void {
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
}
