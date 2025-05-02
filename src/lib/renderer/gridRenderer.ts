
/**
 * Renders a grid on the canvas
 */
export function renderGrid(ctx: CanvasRenderingContext2D, theme: string): void {
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
