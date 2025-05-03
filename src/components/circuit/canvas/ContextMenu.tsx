
import React from 'react';
import { useToast } from '@/hooks/use-toast';

interface ContextMenuProps {
  show: boolean;
  x: number;
  y: number;
  componentId: string | null;
  onClose: () => void;
}

export function ContextMenu({ show, x, y, componentId, onClose }: ContextMenuProps) {
  const { toast } = useToast();

  if (!show) return null;

  const handleRotate = () => {
    if (componentId) {
      toast({
        title: "Component Rotated",
        description: "Component rotated 90 degrees clockwise",
      });
      
      // Trigger the rotation action
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'r' }));
    }
    onClose();
  };

  const handleDelete = () => {
    if (componentId) {
      // Trigger the delete action
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Delete' }));
    }
    onClose();
  };

  return (
    <div 
      className="absolute bg-white shadow-lg rounded border border-gray-200 py-1 z-50"
      style={{ left: x, top: y }}
    >
      <button 
        className="w-full text-left px-4 py-2 hover:bg-gray-100"
        onClick={handleRotate}
      >
        Rotate
      </button>
      <button 
        className="w-full text-left px-4 py-2 hover:bg-gray-100"
        onClick={handleDelete}
      >
        Delete
      </button>
    </div>
  );
}
