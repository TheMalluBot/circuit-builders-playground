
import { Component, RenderOptions } from '@/types/circuit';

/**
 * Draws a switch component
 */
export function drawSwitch(
  ctx: CanvasRenderingContext2D, 
  component: Component,
  options: RenderOptions
): void {
  const closed = component.properties.closed || false;
  
  ctx.strokeStyle = options.theme === 'light' ? '#000' : '#fff';
  ctx.lineWidth = 2;
  
  // Draw terminals
  ctx.fillStyle = ctx.strokeStyle;
  ctx.beginPath();
  ctx.arc(-20, 0, 3, 0, Math.PI * 2);
  ctx.arc(20, 0, 3, 0, Math.PI * 2);
  ctx.fill();
  
  // Draw switch lever
  ctx.beginPath();
  ctx.moveTo(-20, 0);
  
  if (closed) {
    // Closed position
    ctx.lineTo(20, 0);
  } else {
    // Open position
    ctx.lineTo(10, -15);
  }
  ctx.stroke();
  
  // Draw leads
  ctx.beginPath();
  ctx.moveTo(-30, 0);
  ctx.lineTo(-20, 0);
  ctx.moveTo(20, 0);
  ctx.lineTo(30, 0);
  ctx.stroke();
}
