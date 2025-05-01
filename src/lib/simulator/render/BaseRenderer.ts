
import { RenderOptions } from '../types';

export class BaseRenderer {
  protected canvas: HTMLCanvasElement;
  protected ctx: CanvasRenderingContext2D;
  protected options: RenderOptions;
  protected scaleFactor: number = 1;
  protected panOffset: {x: number; y: number} = {x: 0, y: 0};
  protected lastRenderTime: number = 0;
  
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
    this.resizeCanvas();
    
    // Add resize listener
    window.addEventListener('resize', this.resizeCanvas.bind(this));
  }
  
  protected resizeCanvas(): void {
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
  
  // Draw grid on the canvas
  protected drawGrid(): void {
    const gridColor = this.options.theme === 'light' ? '#e0e0e0' : '#333333';
    const { x: startX, y: startY } = this.canvasToCircuitCoords(0, 0);
    const { x: endX, y: endY } = this.canvasToCircuitCoords(this.canvas.width, this.canvas.height);
    
    // Round to nearest grid line
    const gridSize = 20; // Grid size in pixels
    const startGridX = Math.floor(startX / gridSize) * gridSize;
    const endGridX = Math.ceil(endX / gridSize) * gridSize;
    const startGridY = Math.floor(startY / gridSize) * gridSize;
    const endGridY = Math.ceil(endY / gridSize) * gridSize;
    
    this.ctx.strokeStyle = gridColor;
    this.ctx.lineWidth = 0.5;
    this.ctx.beginPath();
    
    // Draw dots instead of lines for a lighter grid
    for (let x = startGridX; x <= endGridX; x += gridSize) {
      for (let y = startGridY; y <= endGridY; y += gridSize) {
        this.ctx.rect(x, y, 1, 1);
      }
    }
    
    this.ctx.stroke();
  }
  
  dispose(): void {
    window.removeEventListener('resize', this.resizeCanvas.bind(this));
  }
}
