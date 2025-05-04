
import { Pin, RenderOptions } from '@/types/circuit';

/**
 * Draws a component pin
 */
export function drawPin(
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
