
import { useCallback } from 'react';

export const useWireManagement = (engine: any, simulationState: any, setSimulationState: any) => {
  const createWire = useCallback((startNodeId: string, endNodeId: string) => {
    if (!engine || !simulationState) return;
    
    console.log(`Creating wire between ${startNodeId} and ${endNodeId}`);
    
    const wireId = `wire_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    
    // Get node positions for start and end
    const startNode = simulationState.nodes.find((n: any) => n.id === startNodeId);
    const endNode = simulationState.nodes.find((n: any) => n.id === endNodeId);
    
    let wirePath = [];
    
    if (startNode && endNode) {
      // Calculate a smart path between the nodes
      const dx = endNode.position.x - startNode.position.x;
      const dy = endNode.position.y - startNode.position.y;
      const midX = startNode.position.x + dx / 2;
      
      wirePath = [
        { x: startNode.position.x, y: startNode.position.y },
        { x: midX, y: startNode.position.y },
        { x: midX, y: endNode.position.y },
        { x: endNode.position.x, y: endNode.position.y }
      ];
    }
    
    const newWires = [
      ...simulationState.wires,
      {
        id: wireId,
        nodeIds: [startNodeId, endNodeId] as [string, string],
        current: 0,
        path: wirePath
      }
    ];
    
    setSimulationState({
      ...simulationState,
      wires: newWires
    });
  }, [engine, simulationState, setSimulationState]);
  
  const updateWirePath = useCallback((wireId: string, newPath: { x: number, y: number }[]) => {
    if (!engine || !simulationState) return;
    
    console.log(`Updating wire path for ${wireId}`);
    
    const updatedWires = simulationState.wires.map((wire: any) => {
      if (wire.id === wireId) {
        return {
          ...wire,
          path: newPath
        };
      }
      return wire;
    });
    
    setSimulationState({
      ...simulationState,
      wires: updatedWires
    });
  }, [engine, simulationState, setSimulationState]);
  
  const deleteWire = useCallback((wireId: string) => {
    if (!engine || !simulationState) return;
    
    const newWires = simulationState.wires.filter((w: any) => w.id !== wireId);
    
    setSimulationState({
      ...simulationState,
      wires: newWires
    });
  }, [engine, simulationState, setSimulationState]);

  return {
    createWire,
    updateWirePath,
    deleteWire
  };
};
