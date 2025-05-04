
import { Component, RenderOptions } from '@/types/circuit';

/**
 * Draws an LED component
 */
export function drawLED(
  ctx: CanvasRenderingContext2D, 
  component: Component,
  options: RenderOptions
): void {
  const brightness = component.properties.brightness || 0;
  const color = component.properties.color || 'red';
  
  const colorMap: Record<string, string> = {
    'red': '#ff0000',
    'green': '#00ff00',
    'blue': '#0000ff',
    'yellow': '#ffff00',
    'white': '#ffffff'
  };
  
  const ledColor = colorMap[color] || colorMap.red;
  
  // Draw LED body (circle)
  ctx.strokeStyle = options.theme === 'light' ? '#000' : '#fff';
  ctx.lineWidth = 2;
  
  ctx.beginPath();
  ctx.arc(0, 0, 15, 0, Math.PI * 2);
  ctx.stroke();
  
  // Draw LED direction indicator (arrow)
  ctx.beginPath();
  ctx.moveTo(-7, -7);
  ctx.lineTo(7, 0);
  ctx.lineTo(-7, 7);
  ctx.closePath();
  ctx.stroke();
  
  // Fill with color based on brightness
  if (brightness > 0) {
    // Parse color components for glow effect
    const r = parseInt(ledColor.slice(1, 3), 16);
    const g = parseInt(ledColor.slice(3, 5), 16);
    const b = parseInt(ledColor.slice(5, 7), 16);
    
    // Fill LED with color
    ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${0.3 + brightness * 0.7})`;
    ctx.beginPath();
    ctx.arc(0, 0, 14, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.beginPath();
    ctx.moveTo(-7, -7);
    ctx.lineTo(7, 0);
    ctx.lineTo(-7, 7);
    ctx.closePath();
    ctx.fill();
    
    // Draw glow effect for lit LED
    if (brightness > 0.2) {
      const glow = ctx.createRadialGradient(0, 0, 14, 0, 0, 30);
      glow.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${0.7 * brightness})`);
      glow.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);
      
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(0, 0, 30, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  
  // Draw terminals
  ctx.beginPath();
  ctx.moveTo(-30, 0);
  ctx.lineTo(-15, 0);
  ctx.moveTo(15, 0);
  ctx.lineTo(30, 0);
  ctx.stroke();
}
