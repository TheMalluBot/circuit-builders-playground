
import { Component, Pin, RenderOptions } from '@/types/circuit';
import { calculatePinPosition } from '../interaction';

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

/**
 * Draws a component pin
 */
function drawPin(
  ctx: CanvasRenderingContext2D,
  pin: Pin,
  options: RenderOptions
): void {
  // Draw the pin as a small circle
  ctx.fillStyle = options.theme === 'light' ? '#555' : '#ddd';
  ctx.beginPath();
  ctx.arc(pin.position.x, pin.position.y, 3, 0, Math.PI * 2);
  ctx.fill();
}

/**
 * Draws a battery component
 */
function drawBattery(
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

/**
 * Draws a resistor component
 */
function drawResistor(
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

/**
 * Draws an LED component
 */
function drawLED(
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

/**
 * Draws a switch component
 */
function drawSwitch(
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
