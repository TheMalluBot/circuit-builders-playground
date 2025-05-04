
import { Component, RenderOptions } from '@/types/circuit';

/**
 * Draws a battery component
 */
export function drawBattery(
  ctx: CanvasRenderingContext2D, 
  component: Component,
  options: RenderOptions
): void {
  const voltage = component.properties.voltage || 5;
  
  ctx.strokeStyle = options.theme === 'light' ? '#000' : '#fff';
  ctx.lineWidth = 2;
  
  // Positive terminal
  ctx.beginPath();
  ctx.moveTo(-10, -15);
  ctx.lineTo(10, -15);
  ctx.stroke();
  
  // Negative terminal
  ctx.beginPath();
  ctx.moveTo(-7, -5);
  ctx.lineTo(7, -5);
  ctx.stroke();
  
  // Leads
  ctx.beginPath();
  ctx.moveTo(0, -30);
  ctx.lineTo(0, -15);
  ctx.moveTo(0, -5);
  ctx.lineTo(0, 30);
  ctx.stroke();
  
  // Voltage label
  ctx.fillStyle = options.theme === 'light' ? '#000' : '#fff';
  ctx.font = '12px Arial';
  ctx.textAlign = 'center';
  ctx.fillText(`${voltage}V`, 0, 15);
}
