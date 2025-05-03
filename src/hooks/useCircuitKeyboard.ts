
import { useEffect } from 'react';
import { CircuitItemType } from '@/types/circuit';

interface KeyboardOptions {
  onRotate?: (componentId: string) => void;
  onDelete?: (type: CircuitItemType, id: string) => void;
  selectedItemId: string | null;
  selectedItemType: CircuitItemType | null;
  onUndo?: () => void;  // Added undo support
  onRedo?: () => void;  // Added redo support
}

export function useCircuitKeyboard({
  onRotate,
  onDelete,
  selectedItemId,
  selectedItemType,
  onUndo,  // Added undo parameter
  onRedo   // Added redo parameter
}: KeyboardOptions) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Skip if we're in an input field
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      
      // Handle component rotation with R key
      if (e.key === 'r' || e.key === 'R') {
        if (onRotate && selectedItemId && selectedItemType === 'component') {
          onRotate(selectedItemId);
          e.preventDefault();
        }
      }
      
      // Handle deletion with Delete or Backspace
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (onDelete && selectedItemId && selectedItemType) {
          onDelete(selectedItemType, selectedItemId);
          e.preventDefault();
        }
      }
      
      // Handle undo with Ctrl/Cmd+Z
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        if (onUndo) {
          onUndo();
          e.preventDefault();
        }
      }
      
      // Handle redo with Ctrl/Cmd+Shift+Z or Ctrl/Cmd+Y
      if ((e.ctrlKey || e.metaKey) && ((e.key === 'z' && e.shiftKey) || e.key === 'y')) {
        if (onRedo) {
          onRedo();
          e.preventDefault();
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onRotate, onDelete, selectedItemId, selectedItemType, onUndo, onRedo]);
}
