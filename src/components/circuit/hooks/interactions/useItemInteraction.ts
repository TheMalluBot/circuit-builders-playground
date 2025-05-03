
import { useCallback } from 'react';
import { Circuit, CircuitItemType } from '@/types/circuit';
import { findHoveredItem } from '../../utils/ItemFinder';

/**
 * Hook to handle interactions with circuit items (components, wires, nodes, pins)
 */
export function useItemInteraction(circuit: Circuit) {
  /**
   * Find the item at the given position
   */
  const findItemAtPosition = useCallback((x: number, y: number) => {
    return findHoveredItem(circuit, x, y);
  }, [circuit]);

  /**
   * Check if coordinates are over a component
   */
  const isOverComponent = useCallback((x: number, y: number) => {
    const item = findHoveredItem(circuit, x, y);
    return item?.type === 'component' ? item.id : null;
  }, [circuit]);

  /**
   * Check if coordinates are over a pin
   */
  const isOverPin = useCallback((x: number, y: number) => {
    const item = findHoveredItem(circuit, x, y);
    if (item?.type === 'pin') {
      return {
        pinId: item.pinId,
        componentId: item.componentId,
        nodeId: item.id
      };
    }
    return null;
  }, [circuit]);

  /**
   * Check if coordinates are over a wire or wire control point
   */
  const isOverWire = useCallback((x: number, y: number) => {
    const item = findHoveredItem(circuit, x, y);
    if (item?.type === 'wire' || item?.type === 'wireSegment' || item?.type === 'wireControlPoint') {
      return {
        type: item.type as CircuitItemType,
        wireId: item.id || item.wireId,
        segmentIndex: item.segmentIndex,
        pointIndex: item.pointIndex
      };
    }
    return null;
  }, [circuit]);

  return {
    findItemAtPosition,
    isOverComponent,
    isOverPin,
    isOverWire
  };
}
