
import { useContext } from 'react';
import { SimulationContext } from './SimulationContext';

/**
 * Hook for accessing the simulation context
 * @returns The simulation context values and functions
 */
export const useSimulation = () => {
  const context = useContext(SimulationContext);
  
  if (context === undefined) {
    throw new Error('useSimulation must be used within a SimulationProvider');
  }
  
  return context;
};
