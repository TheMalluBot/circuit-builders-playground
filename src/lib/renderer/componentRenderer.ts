
import { Component, Pin, RenderOptions } from '@/types/circuit';
import { drawBattery } from './components/batteryRenderer';
import { drawResistor } from './components/resistorRenderer';
import { drawLED } from './components/ledRenderer';
import { drawSwitch } from './components/switchRenderer';
import { drawPin } from './components/pinRenderer';

/**
 * Renders all components in the circuit
 */
export function renderComponents(
  ctx: CanvasRenderingContext2D, 
  components: Component[],
  options: RenderOptions
): void {
  components.forEach(component => {
    drawComponent(ctx, component, options);
  });
}

/**
 * Draws a single component
 */
function drawComponent(
  ctx: CanvasRenderingContext2D, 
  component: Component,
  options: RenderOptions
): void {
  ctx.save();
  
  // Translate to component position and apply rotation
  ctx.translate(component.position.x, component.position.y);
  ctx.rotate(component.rotation * Math.PI / 180);
  
  // Draw based on component type
  switch (component.type) {
    case 'battery':
      drawBattery(ctx, component, options);
      break;
    case 'resistor':
      drawResistor(ctx, component, options);
      break;
    case 'led':
      drawLED(ctx, component, options);
      break;
    case 'switch':
      drawSwitch(ctx, component, options);
      break;
  }
  
  // Draw pins for each component
  component.pins.forEach(pin => {
    drawPin(ctx, pin, options);
  });
  
  ctx.restore();
}
