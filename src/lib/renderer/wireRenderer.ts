
import { Circuit, Node, Wire } from '@/types/circuit';
import { CircuitRenderOptions } from './index';

interface Particle {
  position: number;  // Position along the wire path (0-1)
  speed: number;     // Speed multiplier
  size: number;      // Particle size
}

// Manages particles for each wire
const wireParticles = new Map<string, Particle[]>();
let lastAnimationTime = 0;

export function renderWires(
  ctx: CanvasRenderingContext2D,
  wires: Wire[],
  nodes: Node[],
  circuit: Circuit,
  options: CircuitRenderOptions,
  selectedWireId?: string
): void {
  const now = performance.now();
  const deltaTime = Math.min((now - lastAnimationTime) / 1000, 0.05); // Cap at 50ms to avoid jumps
  lastAnimationTime = now;
  
  // Set up basic wire styling
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  
  // Draw all wires
  wires.forEach(wire => {
    const isSelected = selectedWireId === wire.id;
    
    // Set wire path style based on current, voltage, and selection state
    const current = Math.abs(wire.current || 0);
    const hasFlow = current > 0.0001;
    
    // Create color gradient based on voltage levels if voltages are shown
    let wireColor = options.theme === 'light' ? '#333' : '#aaa';
    
    if (isSelected) {
      // Selected wire styling
      wireColor = '#0088FF';
      ctx.lineWidth = 3;
    } else if (hasFlow && options.showCurrents) {
      // Current-carrying wire styling - adjust color by current magnitude
      const intensity = Math.min(1, current * 5);
      if (wire.current > 0) {
        // Positive current: blue shades
        wireColor = `rgb(${Math.round(50 - 50 * intensity)}, ${Math.round(100 + 155 * intensity)}, 255)`;
      } else {
        // Negative current: red shades
        wireColor = `rgb(255, ${Math.round(100 + 155 * intensity)}, ${Math.round(50 - 50 * intensity)})`;
      }
      ctx.lineWidth = 2 + intensity;
    } else {
      // Default wire styling
      ctx.lineWidth = 2;
    }
    
    ctx.strokeStyle = wireColor;
    
    // Draw wire path
    if (wire.path && wire.path.length > 1) {
      ctx.beginPath();
      ctx.moveTo(wire.path[0].x, wire.path[0].y);
      
      for (let i = 1; i < wire.path.length; i++) {
        ctx.lineTo(wire.path[i].x, wire.path[i].y);
      }
      
      ctx.stroke();
      
      // Draw control points if selected
      if (isSelected) {
        wire.path.forEach((point, index) => {
          // Draw larger dots at endpoints, smaller ones for control points
          const isEndpoint = index === 0 || index === wire.path.length - 1;
          const radius = isEndpoint ? 5 : 4;
          
          ctx.fillStyle = isEndpoint ? '#0066cc' : '#44aaff';
          ctx.beginPath();
          ctx.arc(point.x, point.y, radius, 0, Math.PI * 2);
          ctx.fill();
        });
      }
      
      // Draw current labels if needed
      if (options.showCurrents && hasFlow) {
        drawCurrentLabel(ctx, wire);
      }
      
      // Animate current flow
      if (options.animateCurrentFlow && hasFlow) {
        animateCurrentFlow(ctx, wire, deltaTime);
      }
    }
  });
}

// Draw current value label on the wire
function drawCurrentLabel(ctx: CanvasRenderingContext2D, wire: Wire): void {
  if (!wire.path || wire.path.length < 2) return;
  
  // Find midpoint of the wire path for label placement
  let midSegmentIndex = Math.floor(wire.path.length / 2) - 1;
  if (midSegmentIndex < 0) midSegmentIndex = 0;
  
  const p1 = wire.path[midSegmentIndex];
  const p2 = wire.path[midSegmentIndex + 1];
  const midpoint = {
    x: (p1.x + p2.x) / 2,
    y: (p1.y + p2.y) / 2
  };
  
  // Calculate angle of the wire segment
  const angle = Math.atan2(p2.y - p1.y, p2.x - p1.x);
  
  // Format current value
  const current = Math.abs(wire.current || 0);
  let currentText;
  if (current < 0.001) {
    currentText = `${(current * 1000000).toFixed(1)}µA`;
  } else if (current < 1) {
    currentText = `${(current * 1000).toFixed(1)}mA`;
  } else {
    currentText = `${current.toFixed(2)}A`;
  }
  
  // Add direction indicator
  const arrowChar = wire.current > 0 ? '→' : '←';
  currentText = `${currentText} ${arrowChar}`;
  
  // Setup text properties
  ctx.save();
  ctx.font = '11px Arial';
  ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  // Determine if angle adjustment is needed
  let textX = midpoint.x;
  let textY = midpoint.y - 12; // Offset above the wire
  
  // Draw background for better readability
  const metrics = ctx.measureText(currentText);
  const textWidth = metrics.width;
  const textHeight = 14; // Approximate height
  
  ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
  ctx.fillRect(
    textX - textWidth / 2 - 2,
    textY - textHeight / 2 - 1,
    textWidth + 4,
    textHeight + 2
  );
  
  // Draw the text
  ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
  ctx.fillText(currentText, textX, textY);
  ctx.restore();
}

// Animate current flow with particles
function animateCurrentFlow(ctx: CanvasRenderingContext2D, wire: Wire, deltaTime: number): void {
  if (!wire.path || wire.path.length < 2) return;
  
  const current = wire.current || 0;
  if (Math.abs(current) < 0.0001) {
    // No significant current, clear particles
    wireParticles.delete(wire.id);
    return;
  }
  
  // Get or initialize particle array for this wire
  let particles = wireParticles.get(wire.id);
  if (!particles) {
    particles = [];
    const particleCount = Math.ceil(getWireLength(wire.path) / 30); // One particle per ~30px
    
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        position: i / particleCount,
        speed: 0.8 + Math.random() * 0.4,  // Random speed variation
        size: 2 + Math.random() * 2        // Random size variation
      });
    }
    
    wireParticles.set(wire.id, particles);
  }
  
  // Update and draw particles
  const currentMagnitude = Math.abs(current);
  const currentDirection = Math.sign(current);
  const baseSpeed = Math.min(1.5, 0.2 + currentMagnitude * 10); // Cap speed
  
  // Calculate total path length and segment lengths
  const { totalLength, segments } = calculatePathLengths(wire.path);
  
  // Update particle positions
  particles.forEach(particle => {
    // Move particle along the path
    particle.position += currentDirection * baseSpeed * particle.speed * deltaTime;
    
    // Wrap around
    if (particle.position > 1) {
      particle.position -= 1;
    } else if (particle.position < 0) {
      particle.position += 1;
    }
    
    // Calculate the actual position along the path
    const { point, tangent } = getPointAlongPath(
      wire.path, 
      particle.position, 
      totalLength, 
      segments
    );
    
    // Draw the particle
    const particleSize = Math.max(2, Math.min(4, particle.size * currentMagnitude * 2));
    
    // Color based on current direction
    ctx.fillStyle = current > 0 ? 
      'rgba(0, 128, 255, 0.8)' : 
      'rgba(255, 100, 100, 0.8)';
      
    // Draw elongated particle in direction of flow
    ctx.beginPath();
    ctx.ellipse(
      point.x, point.y, 
      particleSize * 1.5, particleSize * 0.8, 
      Math.atan2(tangent.y, tangent.x), 
      0, Math.PI * 2
    );
    ctx.fill();
    
    // Add glow effect for stronger currents
    if (currentMagnitude > 0.01) {
      ctx.fillStyle = current > 0 ? 
        'rgba(150, 200, 255, 0.3)' : 
        'rgba(255, 180, 180, 0.3)';
      
      ctx.beginPath();
      ctx.arc(
        point.x, point.y,
        particleSize * 2.5,
        0, Math.PI * 2
      );
      ctx.fill();
    }
  });
}

// Calculate lengths of wire path segments
function calculatePathLengths(path: { x: number; y: number; }[]): {
  totalLength: number;
  segments: number[];
} {
  const segments: number[] = [];
  let totalLength = 0;
  
  for (let i = 0; i < path.length - 1; i++) {
    const dx = path[i+1].x - path[i].x;
    const dy = path[i+1].y - path[i].y;
    const length = Math.sqrt(dx * dx + dy * dy);
    
    segments.push(length);
    totalLength += length;
  }
  
  return { totalLength, segments };
}

// Calculate position and tangent along a path
function getPointAlongPath(
  path: { x: number; y: number; }[], 
  t: number, 
  totalLength: number, 
  segments: number[]
): {
  point: { x: number; y: number; };
  tangent: { x: number; y: number; };
} {
  let distanceAlongPath = t * totalLength;
  let segmentIndex = 0;
  
  // Find which segment contains the point
  while (segmentIndex < segments.length && distanceAlongPath > segments[segmentIndex]) {
    distanceAlongPath -= segments[segmentIndex];
    segmentIndex++;
  }
  
  // If we've reached the end, return the last point
  if (segmentIndex >= segments.length) {
    return {
      point: { ...path[path.length - 1] },
      tangent: { 
        x: path[path.length - 1].x - path[path.length - 2].x,
        y: path[path.length - 1].y - path[path.length - 2].y
      }
    };
  }
  
  // Calculate position along the current segment
  const p1 = path[segmentIndex];
  const p2 = path[segmentIndex + 1];
  const segmentLength = segments[segmentIndex];
  
  const ratio = segmentLength > 0 ? distanceAlongPath / segmentLength : 0;
  
  return {
    point: {
      x: p1.x + (p2.x - p1.x) * ratio,
      y: p1.y + (p2.y - p1.y) * ratio
    },
    tangent: {
      x: p2.x - p1.x,
      y: p2.y - p1.y
    }
  };
}

// Get total wire length
function getWireLength(path: { x: number; y: number; }[]): number {
  let length = 0;
  
  for (let i = 0; i < path.length - 1; i++) {
    const dx = path[i+1].x - path[i].x;
    const dy = path[i+1].y - path[i].y;
    length += Math.sqrt(dx * dx + dy * dy);
  }
  
  return length;
}
