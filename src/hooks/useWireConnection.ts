
import { useState, useCallback } from 'react';
import { Pin, Component } from '@/types/circuit';
import { calculatePinPosition } from '@/lib/interaction';

export function useWireConnection(
  onConnect: (sourceId: string, targetId: string) => void
) {
  // Active connection state
  const [connection, setConnection] = useState<{
    sourcePin: {
      nodeId: string | null;
      pinId: string;
      componentId: string;
      position: { x: number; y: number };
    } | null;
    currentEnd: { x: number; y: number } | null;
    targetPin: {
      nodeId: string | null;
      pinId: string;
      componentId: string;
    } | null;
  }>({
    sourcePin: null,
    currentEnd: null,
    targetPin: null
  });
  
  // Start a new connection
  const startConnection = useCallback((
    component: Component, 
    pin: Pin, 
    position: { x: number; y: number }
  ) => {
    const pinPos = calculatePinPosition(component, pin);
    
    setConnection({
      sourcePin: {
        nodeId: pin.nodeId,
        pinId: pin.id,
        componentId: component.id,
        position: pinPos
      },
      currentEnd: pinPos,
      targetPin: null
    });
  }, []);
  
  // Update connection while dragging
  const updateConnection = useCallback((
    position: { x: number; y: number },
    targetComponent?: Component,
    targetPin?: Pin
  ) => {
    setConnection(prev => ({
      ...prev,
      currentEnd: position,
      targetPin: targetComponent && targetPin ? {
        nodeId: targetPin.nodeId,
        pinId: targetPin.id,
        componentId: targetComponent.id
      } : null
    }));
  }, []);
  
  // Complete connection
  const completeConnection = useCallback(() => {
    if (connection.sourcePin?.nodeId && 
        connection.targetPin?.nodeId && 
        connection.sourcePin.componentId !== connection.targetPin.componentId) {
      // Connect the nodes
      onConnect(connection.sourcePin.nodeId, connection.targetPin.nodeId);
    }
    
    // Reset connection state
    setConnection({
      sourcePin: null,
      currentEnd: null,
      targetPin: null
    });
  }, [connection.sourcePin, connection.targetPin, onConnect]);
  
  // Cancel active connection
  const cancelConnection = useCallback(() => {
    setConnection({
      sourcePin: null,
      currentEnd: null,
      targetPin: null
    });
  }, []);
  
  return {
    hasActiveConnection: !!connection.sourcePin,
    connectionSource: connection.sourcePin,
    connectionEnd: connection.currentEnd,
    targetPin: connection.targetPin,
    startConnection,
    updateConnection,
    completeConnection,
    cancelConnection
  };
}
