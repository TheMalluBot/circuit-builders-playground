
import React from 'react';
import { Circuit, CircuitItemType } from '@/types/circuit';
import { findHoveredItem } from '../utils/ItemFinder';

interface CanvasInteractionHandlerProps {
  circuit: Circuit;
  hoveredItem: { type: CircuitItemType; id: string } | null;
  hoveredNodeId: string | null;
  connectionPreview: any;
  isDragging: boolean;
  draggedWire: any;
  handleCanvasClick: (e: React.MouseEvent) => void;
  handleMouseDown: (e: React.MouseEvent) => void;
  handleMouseMove: (e: React.MouseEvent) => void;
  handleMouseUp: (e: React.MouseEvent) => void;
  handleDoubleClick: (e: React.MouseEvent) => void;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  selectedComponent: string | null;
  cursor: string;
  children: React.ReactNode;
}

/**
 * Component that wraps canvas and handles interaction events
 */
export const CanvasInteractionHandler: React.FC<CanvasInteractionHandlerProps> = ({
  children,
  canvasRef,
  handleCanvasClick,
  handleMouseDown,
  handleMouseMove,
  handleMouseUp,
  handleDoubleClick,
  cursor
}) => {
  return (
    <div className="relative w-full h-full">
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        onClick={handleCanvasClick}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onDoubleClick={handleDoubleClick}
        style={{ cursor }}
      />
      {children}
    </div>
  );
};
