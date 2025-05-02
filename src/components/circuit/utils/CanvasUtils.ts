
/**
 * Gets the mouse position relative to the canvas
 */
export function getMousePosition(
  e: React.MouseEvent<HTMLCanvasElement>, 
  canvas: HTMLCanvasElement
): { x: number; y: number } {
  const rect = canvas.getBoundingClientRect();
  return { 
    x: e.clientX - rect.left,
    y: e.clientY - rect.top
  };
}

/**
 * Resizes the canvas to match its parent container
 */
export function resizeCanvas(canvas: HTMLCanvasElement): void {
  if (!canvas) return;
  
  const container = canvas.parentElement;
  if (container) {
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;
  }
}
