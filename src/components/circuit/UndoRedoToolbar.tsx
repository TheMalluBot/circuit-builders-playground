
import React from 'react';
import { Button } from '@/components/ui/button';
import { Undo, Redo } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface UndoRedoToolbarProps {
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  className?: string;
  currentActionDescription?: string;
}

export function UndoRedoToolbar({
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  className = '',
  currentActionDescription
}: UndoRedoToolbarProps) {
  return (
    <TooltipProvider>
      <div className={`flex items-center gap-2 ${className}`}>
        <Tooltip>
          <TooltipTrigger asChild>
            <span>
              <Button 
                variant="outline" 
                size="icon" 
                onClick={onUndo} 
                disabled={!canUndo}
                className="h-8 w-8"
              >
                <Undo className="h-4 w-4" />
              </Button>
            </span>
          </TooltipTrigger>
          <TooltipContent>
            <p>Undo {canUndo && currentActionDescription ? `(${currentActionDescription})` : ''}</p>
          </TooltipContent>
        </Tooltip>
        
        <Tooltip>
          <TooltipTrigger asChild>
            <span>
              <Button 
                variant="outline" 
                size="icon" 
                onClick={onRedo} 
                disabled={!canRedo}
                className="h-8 w-8"
              >
                <Redo className="h-4 w-4" />
              </Button>
            </span>
          </TooltipTrigger>
          <TooltipContent>
            <p>Redo</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}
