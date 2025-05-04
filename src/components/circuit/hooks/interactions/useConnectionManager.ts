
import { useCallback } from 'react';
import { Circuit } from '@/types/circuit';
import { useConnectionPreview } from '../useConnectionPreview';
import { useCanvasMousePosition } from './useCanvasMousePosition';

/**
 * Hook to manage wire connections between components
 */
export function useConnectionManager(
  canvasRef: React.RefObject<HTMLCanvasElement>,
  circuit: Circuit,
  onConnectNodes: (sourceId: string, targetId: string) => void
) {
  const { getCanvasCoords } = useCanvasMousePosition(canvasRef);
  const connectionPreview = useConnectionPreview();
  
  /**
   * Start a new connection from a pin
   */
  const startConnection = useCallback((e: React.MouseEvent, sourceId: string, pinId: string, componentId: string) => {
    const coords = getCanvasCoords(e);
    
    connectionPreview.startConnection({
      nodeId: sourceId,
      pinId: pinId,
      componentId: componentId,
      position: coords
    });
  }, [connectionPreview, getCanvasCoords]);
  
  /**
   * Update connection end position during drag
   */
  const updateConnection = useCallback((e: React.MouseEvent, nodeId: string | null) => {
    const coords = getCanvasCoords(e);
    connectionPreview.updateConnectionEnd(coords, nodeId, circuit);
  }, [circuit, connectionPreview, getCanvasCoords]);
  
  /**
   * Complete connection between two pins
   */
  const completeConnection = useCallback((e: React.MouseEvent) => {
    if (!connectionPreview.isConnecting || !connectionPreview.connectionStart) {
      return;
    }
    
    const coords = getCanvasCoords(e);
    const hoveredItem = circuit ? findHoveredItem(circuit, coords.x, coords.y) : null;
    
    if (hoveredItem?.type === 'pin' && connectionPreview.connectionStart && 
        hoveredItem.id !== connectionPreview.connectionStart.nodeId) {
      onConnectNodes(connectionPreview.connectionStart.nodeId || "", hoveredItem.id);
    }
    
    connectionPreview.resetConnection();
  }, [circuit, connectionPreview, onConnectNodes, getCanvasCoords]);

  return {
    connectionPreview,
    startConnection,
    updateConnection,
    completeConnection
  };
}

// Import findHoveredItem to avoid type errors
import { findHoveredItem } from '../../utils/ItemFinder';
