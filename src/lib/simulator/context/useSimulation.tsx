
import { useContext } from 'react';
import { SimulationContext } from './SimulationContext';

/**
 * Hook for accessing the simulation context
 */
export const useSimulation = () => useContext(SimulationContext);
