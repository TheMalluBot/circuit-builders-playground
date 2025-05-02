
import { useEffect, useCallback } from 'react';
import { CircuitItemType } from '@/types/circuit';

interface KeyboardOptions {
  onRotate?: (componentId: string) => void;
  onDelete?: (itemType: CircuitItemType, itemId: string) => void;
  selectedItemId?: string | null;
  selectedItemType?: CircuitItemType | null;
}

export function useCircuitKeyboard({
  onRotate,
  onDelete,
  selectedItemId,
  selectedItemType
}: KeyboardOptions) {
  
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Rotation with R key
    if ((e.key === 'r' || e.key === 'R') && 
        selectedItemId && 
        selectedItemType === 'component' && 
        onRotate) {
      onRotate(selectedItemId);
      e.preventDefault();
    }
    
    // Delete with Delete or Backspace
    if ((e.key === 'Delete' || e.key === 'Backspace') && 
        selectedItemId && 
        selectedItemType && 
        onDelete) {
      onDelete(selectedItemType, selectedItemId);
      e.preventDefault();
    }
  }, [selectedItemId, selectedItemType, onRotate, onDelete]);
  
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
  
  return { isListening: true };
}
