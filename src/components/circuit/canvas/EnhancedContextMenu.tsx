
import React from 'react';
import { 
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger
} from "@/components/ui/context-menu";
import { 
  Undo, 
  Redo, 
  RotateCw, 
  Trash2, 
  Copy, 
  Scissors, 
  FlipHorizontal, 
  FlipVertical,
  Settings
} from "lucide-react";
import { CircuitItemType } from '@/types/circuit';
import { TooltipProvider } from '@/components/ui/tooltip';

interface EnhancedContextMenuProps {
  children: React.ReactNode;
  itemType: CircuitItemType | null;
  itemId: string | null;
  onRotate: (id: string) => void;
  onDelete: (type: CircuitItemType, id: string) => void;
  onCopy?: (type: CircuitItemType, id: string) => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onOpenProperties?: (id: string) => void;
}

export function EnhancedContextMenu({
  children,
  itemType,
  itemId,
  onRotate,
  onDelete,
  onCopy,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  onOpenProperties
}: EnhancedContextMenuProps) {
  
  const handleRotate = () => {
    if (itemId && itemType === 'component') {
      onRotate(itemId);
    }
  };
  
  const handleDelete = () => {
    if (itemId && itemType) {
      onDelete(itemType, itemId);
    }
  };
  
  const handleCopy = () => {
    if (itemId && itemType && onCopy) {
      onCopy(itemType, itemId);
    }
  };
  
  const handleOpenProperties = () => {
    if (itemId && onOpenProperties) {
      onOpenProperties(itemId);
    }
  };

  return (
    <TooltipProvider>
      <ContextMenu>
        <ContextMenuTrigger asChild>
          {children}
        </ContextMenuTrigger>
        
        <ContextMenuContent className="w-48">
          {/* Global actions */}
          <ContextMenuItem 
            onClick={onUndo}
            disabled={!canUndo}
            className={!canUndo ? "text-gray-400" : ""}
          >
            <Undo className="w-4 h-4 mr-2" />
            Undo
          </ContextMenuItem>
          
          <ContextMenuItem 
            onClick={onRedo}
            disabled={!canRedo}
            className={!canRedo ? "text-gray-400" : ""}
          >
            <Redo className="w-4 h-4 mr-2" />
            Redo
          </ContextMenuItem>
          
          <ContextMenuSeparator />
          
          {/* Component-specific actions */}
          {itemType === 'component' && itemId && (
            <>
              <ContextMenuItem onClick={handleRotate}>
                <RotateCw className="w-4 h-4 mr-2" />
                Rotate 90°
              </ContextMenuItem>
              
              {onOpenProperties && (
                <ContextMenuItem onClick={handleOpenProperties}>
                  <Settings className="w-4 h-4 mr-2" />
                  Properties
                </ContextMenuItem>
              )}
              
              {onCopy && (
                <ContextMenuItem onClick={handleCopy}>
                  <Copy className="w-4 h-4 mr-2" />
                  Duplicate
                </ContextMenuItem>
              )}
              
              <ContextMenuSub>
                <ContextMenuSubTrigger>
                  <FlipHorizontal className="w-4 h-4 mr-2" />
                  Flip
                </ContextMenuSubTrigger>
                <ContextMenuSubContent className="w-32">
                  <ContextMenuItem>
                    <FlipHorizontal className="w-4 h-4 mr-2" />
                    Horizontal
                  </ContextMenuItem>
                  <ContextMenuItem>
                    <FlipVertical className="w-4 h-4 mr-2" />
                    Vertical
                  </ContextMenuItem>
                </ContextMenuSubContent>
              </ContextMenuSub>
              
              <ContextMenuSeparator />
            </>
          )}
          
          {/* Wire-specific actions */}
          {itemType === 'wire' && itemId && (
            <>
              {onCopy && (
                <ContextMenuItem onClick={handleCopy}>
                  <Copy className="w-4 h-4 mr-2" />
                  Duplicate
                </ContextMenuItem>
              )}
              
              <ContextMenuItem>
                <Scissors className="w-4 h-4 mr-2" />
                Split Wire
              </ContextMenuItem>
              
              <ContextMenuSeparator />
            </>
          )}
          
          {/* Delete action (available for all items) */}
          {itemId && itemType && (
            <ContextMenuItem onClick={handleDelete} className="text-red-600 focus:text-red-600">
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </ContextMenuItem>
          )}
        </ContextMenuContent>
      </ContextMenu>
    </TooltipProvider>
  );
}
