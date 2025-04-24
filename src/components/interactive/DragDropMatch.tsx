
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MatchItem {
  item: string;
  matches: string;
}

interface DragDropMatchProps {
  items: MatchItem[];
  title?: string;
  onComplete?: () => void;
}

const DragDropMatch: React.FC<DragDropMatchProps> = ({ 
  items, 
  title = "Match the items", 
  onComplete 
}) => {
  const [draggableItems, setDraggableItems] = useState<string[]>([]);
  const [dropTargets, setDropTargets] = useState<{target: string, matched?: string}[]>([]);
  const [dragItem, setDragItem] = useState<string | null>(null);
  const [completed, setCompleted] = useState(false);
  const [checked, setChecked] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  
  // Initialize the exercise
  useEffect(() => {
    if (!items || items.length === 0) return;
    
    // Shuffle the draggable items
    const shuffledItems = [...items.map(i => i.item)].sort(() => Math.random() - 0.5);
    setDraggableItems(shuffledItems);
    
    // Set up drop targets
    setDropTargets(items.map(i => ({ target: i.matches })));
    
    // Reset states
    setCompleted(false);
    setChecked(false);
    setScore(null);
  }, [items]);
  
  const handleDragStart = (item: string) => {
    setDragItem(item);
  };
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };
  
  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (!dragItem) return;
    
    // If the target already has a match, do nothing
    if (dropTargets[targetIndex].matched) return;
    
    // Update the drop targets with the new match
    const newDropTargets = [...dropTargets];
    newDropTargets[targetIndex] = {
      ...newDropTargets[targetIndex],
      matched: dragItem
    };
    setDropTargets(newDropTargets);
    
    // Remove the item from draggable items
    setDraggableItems(prev => prev.filter(item => item !== dragItem));
    setDragItem(null);
    
    // Check if all targets have been matched
    if (draggableItems.length === 1) {
      setCompleted(true);
    }
  };
  
  const getCorrectMatch = (target: string): string => {
    const item = items.find(i => i.matches === target);
    return item ? item.item : '';
  };
  
  const checkAnswers = () => {
    let correct = 0;
    
    dropTargets.forEach((dt, index) => {
      const correctItem = getCorrectMatch(dt.target);
      if (dt.matched === correctItem) {
        correct++;
      }
    });
    
    const percentage = Math.round((correct / dropTargets.length) * 100);
    setScore(percentage);
    setChecked(true);
    
    if (percentage === 100 && onComplete) {
      onComplete();
    }
  };
  
  const resetExercise = () => {
    // Reshuffle and reset
    const shuffledItems = [...items.map(i => i.item)].sort(() => Math.random() - 0.5);
    setDraggableItems(shuffledItems);
    setDropTargets(items.map(i => ({ target: i.matches })));
    setCompleted(false);
    setChecked(false);
    setScore(null);
  };
  
  const isCorrectMatch = (target: string, matched?: string): boolean => {
    if (!checked || !matched) return false;
    const correctItem = getCorrectMatch(target);
    return matched === correctItem;
  };

  return (
    <div className="border rounded-lg overflow-hidden bg-white">
      <div className="p-4 border-b bg-slate-50">
        <h3 className="font-medium">{title}</h3>
        <p className="text-sm text-muted-foreground">Drag items on the left to their matching descriptions</p>
      </div>
      
      <div className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Draggable items column */}
          <div className="bg-gray-50 p-3 rounded-lg border">
            <h4 className="text-sm font-medium mb-2">Items to Match</h4>
            
            {draggableItems.length > 0 ? (
              <div className="space-y-2">
                {draggableItems.map((item, idx) => (
                  <div
                    key={idx}
                    draggable
                    onDragStart={() => handleDragStart(item)}
                    className="p-2 bg-white border rounded cursor-move hover:bg-blue-50 hover:border-blue-200 transition-colors"
                  >
                    {item}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center p-4 text-muted-foreground text-sm">
                All items have been matched!
              </div>
            )}
          </div>
          
          {/* Drop targets column */}
          <div className="bg-gray-50 p-3 rounded-lg border">
            <h4 className="text-sm font-medium mb-2">Match Descriptions</h4>
            
            <div className="space-y-3">
              {dropTargets.map((dt, idx) => (
                <div
                  key={idx}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, idx)}
                  className={cn(
                    "p-2 rounded border min-h-[60px] flex items-center justify-between",
                    dt.matched 
                      ? "bg-white" 
                      : "bg-gray-100 border-dashed",
                    checked && isCorrectMatch(dt.target, dt.matched)
                      ? "border-green-300 bg-green-50"
                      : checked && dt.matched
                      ? "border-red-300 bg-red-50"
                      : ""
                  )}
                >
                  <div className="flex-1">
                    <p className="text-sm">{dt.target}</p>
                    
                    {dt.matched && (
                      <div className={cn(
                        "mt-1 p-1 text-sm font-medium rounded",
                        checked && isCorrectMatch(dt.target, dt.matched)
                          ? "bg-green-100 text-green-800"
                          : checked
                          ? "bg-red-100 text-red-800"
                          : "bg-blue-100 text-blue-800"
                      )}>
                        {dt.matched}
                      </div>
                    )}
                  </div>
                  
                  {checked && (
                    <div className="ml-2">
                      {isCorrectMatch(dt.target, dt.matched) ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-500" />
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="mt-4 flex justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={resetExercise}
            className="gap-1"
          >
            <RotateCcw className="h-4 w-4" />
            Reset
          </Button>
          
          <Button 
            onClick={checkAnswers}
            disabled={!completed || checked}
            size="sm"
          >
            Check Answers
          </Button>
        </div>
        
        {score !== null && (
          <div className={cn(
            "mt-4 p-3 rounded-md text-center",
            score === 100
              ? "bg-green-100 text-green-800"
              : score >= 50
              ? "bg-yellow-100 text-yellow-800"
              : "bg-red-100 text-red-800"
          )}>
            <p className="font-medium">Your score: {score}%</p>
            {score === 100 ? (
              <p className="text-sm mt-1">Perfect! You matched all items correctly.</p>
            ) : (
              <p className="text-sm mt-1">Try again to improve your score.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DragDropMatch;
