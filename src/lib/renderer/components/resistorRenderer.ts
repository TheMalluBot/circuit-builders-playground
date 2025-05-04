
import { Component, RenderOptions } from '@/types/circuit';

/**
 * Draws a resistor component
 */
export function drawResistor(
  ctx: CanvasRenderingContext2D, 
  component: Component,
  options: RenderOptions
): void {
  // Draw zigzag resistor
  ctx.strokeStyle = options.theme === 'light' ? '#000' : '#fff';
  ctx.lineWidth = 2;
  
  ctx.beginPath();
  ctx.moveTo(-30, 0);
  ctx.lineTo(-20, 0);
  ctx.lineTo(-15, -10);
  ctx.lineTo(-5, 10);
  ctx.lineTo(5, -10);
  ctx.lineTo(15, 10);
  ctx.lineTo(20, 0);
  ctx.lineTo(30, 0);
  ctx.stroke();
  
  // Value label
  const resistance = component.properties.resistance || 1000;
  let label: string;
  
  if (resistance >= 1000000) {
    label = `${(resistance / 1000000).toFixed(1)}MΩ`;
  } else if (resistance >= 1000) {
    label = `${(resistance / 1000).toFixed(1)}kΩ`;
  } else {
    label = `${resistance}Ω`;
  }
  
  ctx.fillStyle = options.theme === 'light' ? '#000' : '#fff';
  ctx.font = '12px Arial';
  ctx.textAlign = 'center';
  ctx.fillText(label, 0, -15);
}
