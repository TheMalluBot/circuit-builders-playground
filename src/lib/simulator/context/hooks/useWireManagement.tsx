
import { useCallback } from 'react';

export const useWireManagement = (engine: any, simulationState: any, setSimulationState: any) => {
  const createWire = useCallback((startNodeId: string, endNodeId: string) => {
    if (!engine || !simulationState) return;
    
    console.log(`Creating wire between ${startNodeId} and ${endNodeId}`);
    
    const wireId = `wire_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    
    const newWires = [
      ...simulationState.wires,
      {
        id: wireId,
        nodes: [startNodeId, endNodeId] as [string, string],
        current: 0
      }
    ];
    
    setSimulationState({
      ...simulationState,
      wires: newWires
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
    deleteWire
  };
};
