
import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronRight, Info } from 'lucide-react';
import { InteractiveElement } from '@/data/lessonData';

export const ComponentCard: React.FC<{ 
  component: InteractiveElement,
  onSelect?: (id: string) => void
}> = ({ component, onSelect }) => {
  const [flipped, setFlipped] = useState(false);

  return (
    <div className="perspective" onClick={() => onSelect?.(component.id)}>
      <Card 
        className={`w-full transition-transform duration-500 cursor-pointer transform-style-3d ${flipped ? 'rotate-y-180' : ''}`}
      >
        <div className="absolute inset-0 backface-hidden">
          <CardHeader className="p-4">
            <CardTitle className="text-base">{component.title}</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            {component.image && (
              <div className="flex justify-center mb-3">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center">
                  <img 
                    src={component.image} 
                    alt={component.title || ''} 
                    className="w-12 h-12 object-contain"
                  />
                </div>
              </div>
            )}
            <p className="text-sm text-muted-foreground">{component.description}</p>
          </CardContent>
          <CardFooter className="p-4 pt-0">
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full"
              onClick={(e) => {
                e.stopPropagation();
                setFlipped(true);
              }}
            >
              <Info className="mr-1 w-4 h-4" />
              Learn More
            </Button>
          </CardFooter>
        </div>
        
        <div className="absolute inset-0 backface-hidden rotate-y-180">
          <CardHeader className="p-4">
            <CardTitle className="text-base">{component.title}</CardTitle>
            {component.symbol && (
              <div className="ml-auto">
                <img 
                  src={component.symbol} 
                  alt={`${component.title} symbol`}
                  className="w-8 h-8 object-contain"
                />
              </div>
            )}
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <p className="text-sm text-muted-foreground mb-3">{component.details}</p>
          </CardContent>
          <CardFooter className="p-4 pt-0">
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full"
              onClick={(e) => {
                e.stopPropagation();
                setFlipped(false);
              }}
            >
              Back
            </Button>
          </CardFooter>
        </div>
      </Card>
    </div>
  );
};

export const ComponentsGallery: React.FC<{
  components: InteractiveElement[],
  onSelect?: (id: string) => void
}> = ({ components, onSelect }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {components.map((component) => (
        <ComponentCard 
          key={component.id} 
          component={component}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
};

export const AnimationElement: React.FC<{
  element: InteractiveElement
}> = ({ element }) => {
  return (
    <div className="my-4 p-4 bg-blue-50 border border-blue-100 rounded-lg">
      <h4 className="font-medium mb-2">{element.title}</h4>
      <div className="bg-gray-200 rounded-lg aspect-video flex items-center justify-center">
        <div className="text-center text-gray-600">
          <p className="mb-2">Animation: {element.id}</p>
          <p className="text-sm">(Interactive animation would appear here)</p>
        </div>
      </div>
    </div>
  );
};

export const MeasurementTool: React.FC<{
  element: InteractiveElement
}> = ({ element }) => {
  return (
    <div className="my-4 p-4 bg-yellow-50 border border-yellow-100 rounded-lg">
      <h4 className="font-medium mb-2">{element.title}</h4>
      <div className="flex items-center justify-between p-3 bg-white border border-yellow-200 rounded-lg">
        <span>Measurement Point</span>
        <div className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded font-mono">
          Value
        </div>
      </div>
      <p className="mt-2 text-sm text-muted-foreground">
        Click on circuit points to measure values
      </p>
    </div>
  );
};

export const ChallengeElement: React.FC<{
  element: InteractiveElement,
  onComplete?: () => void
}> = ({ element, onComplete }) => {
  const [completed, setCompleted] = useState(false);

  const handleComplete = () => {
    setCompleted(true);
    if (onComplete) {
      onComplete();
    }
  };

  return (
    <div className="my-4 p-4 bg-green-50 border border-green-100 rounded-lg">
      <h4 className="font-medium mb-2">{element.title}</h4>
      {!completed ? (
        <>
          <p className="text-sm text-muted-foreground mb-4">
            Complete the challenge in the simulator on the right.
          </p>
          <Button 
            className="w-full"
            onClick={handleComplete}
          >
            Check My Circuit
            <ChevronRight className="ml-1 w-4 h-4" />
          </Button>
        </>
      ) : (
        <div className="p-3 bg-green-100 text-green-800 rounded-lg">
          <p className="font-medium">Challenge completed! 🎉</p>
          <p className="text-sm mt-1">Well done! You've successfully completed this challenge.</p>
        </div>
      )}
    </div>
  );
};

export const RenderInteractiveElement: React.FC<{
  element: InteractiveElement,
  onSelect?: (id: string) => void,
  onComplete?: () => void
}> = ({ element, onSelect, onComplete }) => {
  switch (element.type) {
    case 'component-card':
      return <ComponentCard component={element} onSelect={onSelect} />;
    case 'animation':
      return <AnimationElement element={element} />;
    case 'measurement':
      return <MeasurementTool element={element} />;
    case 'challenge':
      return <ChallengeElement element={element} onComplete={onComplete} />;
    default:
      return null;
  }
};
