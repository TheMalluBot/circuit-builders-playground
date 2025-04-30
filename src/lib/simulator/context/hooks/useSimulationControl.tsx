
import { useState, useCallback, useRef } from 'react';

export const useSimulationControl = (engine: any, renderer: any, updateSimulationState: () => void) => {
  const [isRunning, setIsRunning] = useState(false);
  const [simulationSpeed, setSimulationSpeed] = useState(1);
  const animationFrameRef = useRef<number | null>(null);
  
  const toggleSimulation = useCallback(() => {
    if (!engine) return;
    
    if (isRunning) {
      engine.stop();
      setIsRunning(false);
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    } else {
      engine.start();
      setIsRunning(true);
      
      if (animationFrameRef.current === null) {
        const renderLoop = () => {
          if (!isRunning || !engine || !renderer) {
            animationFrameRef.current = null;
            return;
          }
          
          const state = engine.getState();
          renderer.render(state.components, state.nodes, state.wires);
          
          animationFrameRef.current = requestAnimationFrame(renderLoop);
        };
        
        animationFrameRef.current = requestAnimationFrame(renderLoop);
      }
    }
  }, [engine, renderer, isRunning]);
  
  const resetSimulation = useCallback(() => {
    if (!engine) return;
    
    engine.reset();
    updateSimulationState();
  }, [engine, updateSimulationState]);
  
  const setRenderOptions = useCallback((options: Partial<any>) => {
    if (!renderer) return;
    
    renderer.setOptions(options);
    if (engine) {
      const state = engine.getState();
      renderer.render(
        state.components, 
        state.nodes, 
        state.wires
      );
    }
  }, [renderer, engine]);

  return {
    isRunning,
    simulationSpeed,
    setSimulationSpeed,
    toggleSimulation,
    resetSimulation,
    setRenderOptions,
    animationFrameRef
  };
};
