
import { useState, useCallback } from 'react';
import { Circuit } from '@/types/circuit';

type HistoryEntry = {
  circuit: Circuit;
  description: string;
};

export function useUndoRedo(initialCircuit: Circuit) {
  const [history, setHistory] = useState<HistoryEntry[]>([{ circuit: initialCircuit, description: 'Initial state' }]);
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // Add a new state to history
  const addToHistory = useCallback((newCircuit: Circuit, description: string) => {
    // Remove any future states if we've gone back in history and then made changes
    const newHistory = history.slice(0, currentIndex + 1);
    
    // Add new state
    newHistory.push({ circuit: newCircuit, description });
    
    // Update history and current index
    setHistory(newHistory);
    setCurrentIndex(newHistory.length - 1);
  }, [history, currentIndex]);
  
  // Undo to previous state
  const undo = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      return history[currentIndex - 1].circuit;
    }
    return history[currentIndex].circuit;
  }, [currentIndex, history]);
  
  // Redo to next state
  const redo = useCallback(() => {
    if (currentIndex < history.length - 1) {
      setCurrentIndex(currentIndex + 1);
      return history[currentIndex + 1].circuit;
    }
    return history[currentIndex].circuit;
  }, [currentIndex, history]);
  
  // Check if undo/redo are available
  const canUndo = currentIndex > 0;
  const canRedo = currentIndex < history.length - 1;
  
  // Get current state description
  const currentActionDescription = history[currentIndex]?.description || '';
  
  return {
    currentCircuit: history[currentIndex].circuit,
    addToHistory,
    undo,
    redo,
    canUndo,
    canRedo,
    currentActionDescription,
    historyLength: history.length,
    currentIndex
  };
}
