
import React from 'react';
import { cn } from '@/lib/utils';

type CircuitComponentProps = {
  name: string;
  icon: string;
  description: string;
  className?: string;
  onClick?: () => void;
  highlight?: boolean;
};

const CircuitComponent: React.FC<CircuitComponentProps> = ({
  name,
  icon,
  description,
  className,
  onClick,
  highlight,
}) => {
  return (
    <div 
      className={cn(
        "circuit-component cursor-pointer transition-all duration-300", 
        highlight && "ring-2 ring-blue-500 scale-105",
        className
      )}
      onClick={onClick}
    >
      <div className="flex flex-col items-center text-center">
        <img src={icon} alt={name} className="w-12 h-12 mb-2" />
        <h4 className="font-medium text-sm">{name}</h4>
        <p className="text-xs text-muted-foreground mt-1">{description}</p>
      </div>
    </div>
  );
};

export default CircuitComponent;
