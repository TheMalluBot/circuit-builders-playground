import { Circuit, Component, Node, Wire, RenderOptions, Pin } from '@/types/circuit';
import { calculatePinPosition, calculateWirePath } from './interaction';

export function renderCircuit(
  ctx: CanvasRenderingContext2D, 
  circuit: Circuit, 
  options: RenderOptions
): void {
  // Clear canvas
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  
  // Draw grid
  drawGrid(ctx, options.theme);
  
  // Draw wires first (so they appear behind components)
  circuit.wires.forEach(wire => {
    drawWire(ctx, wire, circuit.nodes, circuit, options);
  });
  
  // Draw components
  circuit.components.forEach(component => {
    drawComponent(ctx, component, options);
  });
  
  // Draw nodes and pins
  circuit.nodes.forEach(node => {
    const isHighlighted = node.id === options.highlightedNodeId;
    drawNode(ctx, node, isHighlighted, options);
    
    // Draw voltage labels if enabled
    if (options.showVoltages && Math.abs(node.voltage) > 0.01) {
      drawVoltageLabel(ctx, node);
    }
  });
}

function drawGrid(ctx: CanvasRenderingContext2D, theme: string): void {
  const width = ctx.canvas.width;
  const height = ctx.canvas.height;
  const gridSize = 20;
  
  ctx.strokeStyle = theme === 'light' ? '#f0f0f0' : '#333333';
  ctx.lineWidth = 1;
  
  // Vertical lines
  for (let x = 0; x < width; x += gridSize) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
  
  // Horizontal lines
  for (let y = 0; y < height; y += gridSize) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }
}

function drawWire(
  ctx: CanvasRenderingContext2D, 
  wire: Wire, 
  nodes: Node[],
  circuit: Circuit,
  options: RenderOptions
): void {
  // Find connected nodes
  const startNode = nodes.find(n => n.id === wire.nodeIds[0]);
  const endNode = nodes.find(n => n.id === wire.nodeIds[1]);
  
  if (!startNode || !endNode) return;
  
  const current = Math.abs(wire.current);
  const lineWidth = 2 + Math.min(current * 3, 4); // Thicker for higher current
  
  // Wire color based on current
  let color: string;
  if (current < 0.001) {
    color = options.theme === 'light' ? '#333' : '#aaa';
  } else if (wire.current > 0) {
    color = options.theme === 'light' ? '#3366ff' : '#66aaff'; // Blue for positive
  } else {
    color = options.theme === 'light' ? '#ff3366' : '#ff6699'; // Red for negative
  }
  
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  
  // Draw wire using path if available, otherwise direct line
  ctx.beginPath();
  
  if (wire.path && wire.path.length > 1) {
    // Use stored path
    ctx.moveTo(wire.path[0].x, wire.path[0].y);
    for (let i = 1; i < wire.path.length; i++) {
      ctx.lineTo(wire.path[i].x, wire.path[i].y);
    }
  } else {
    // Calculate a path if not available
    const path = calculateWirePath(
      startNode.position, 
      endNode.position
    );
    
    ctx.moveTo(path[0].x, path[0].y);
    for (let i = 1; i < path.length; i++) {
      ctx.lineTo(path[i].x, path[i].y);
    }
  }
  
  ctx.stroke();
  
  // Draw current label if enabled
  if (options.showCurrents && Math.abs(wire.current) > 0.001) {
    drawCurrentLabel(ctx, wire, startNode, endNode);
  }
}

function drawNode(
  ctx: CanvasRenderingContext2D, 
  node: Node, 
  isHighlighted: boolean,
  options: RenderOptions
): void {
  const radius = isHighlighted ? 6 : 4;
  
  ctx.fillStyle = isHighlighted 
    ? '#ff6600' 
    : options.theme === 'light' ? '#333' : '#ccc';
  
  ctx.beginPath();
  ctx.arc(node.position.x, node.position.y, radius, 0, Math.PI * 2);
  ctx.fill();
}

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

function drawVoltageLabel(ctx: CanvasRenderingContext2D, node: Node): void {
  const voltage = node.voltage.toFixed(1);
  
  ctx.font = '12px Arial';
  ctx.fillStyle = '#0066cc';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillText(`${voltage}V`, node.position.x, node.position.y + 5);
}

function drawCurrentLabel(
  ctx: CanvasRenderingContext2D,
  wire: Wire,
  startNode: Node,
  endNode: Node
): void {
  // Calculate position for the label
  let midX, midY;
  
  if (wire.path && wire.path.length > 1) {
    // If we have a path with multiple segments, put label at middle segment
    const middleIdx = Math.floor(wire.path.length / 2);
    const pt1 = wire.path[middleIdx - 1];
    const pt2 = wire.path[middleIdx];
    midX = (pt1.x + pt2.x) / 2;
    midY = (pt1.y + pt2.y) / 2;
  } else {
    // Otherwise use midpoint of straight line
    midX = (startNode.position.x + endNode.position.x) / 2;
    midY = (startNode.position.y + endNode.position.y) / 2;
  }
  
  // Format current value
  let currentText: string;
  const current = Math.abs(wire.current);
  
  if (current < 0.001) {
    currentText = `${(current * 1000000).toFixed(1)}µA`;
  } else if (current < 1) {
    currentText = `${(current * 1000).toFixed(1)}mA`;
  } else {
    currentText = `${current.toFixed(2)}A`;
  }
  
  // Add direction arrow
  const directionChar = wire.current > 0 ? '→' : '←';
  currentText = `${currentText} ${directionChar}`;
  
  // Draw background for better readability
  const textWidth = ctx.measureText(currentText).width;
  ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
  ctx.fillRect(midX - textWidth/2 - 2, midY - 15, textWidth + 4, 16);
  
  // Draw text
  ctx.font = '12px Arial';
  ctx.fillStyle = '#cc0000';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'bottom';
  ctx.fillText(currentText, midX, midY - 2);
}
