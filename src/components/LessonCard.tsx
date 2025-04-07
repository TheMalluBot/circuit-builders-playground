
import React from 'react';
import { Link } from 'react-router-dom';
import { 
  CircleCheck, 
  Clock,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface LessonCardProps {
  title: string;
  description: string;
  image: string;
  duration: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  completed?: boolean;
  slug: string;
  className?: string;
}

const difficultyStyles = {
  beginner: 'bg-green-100 text-green-800',
  intermediate: 'bg-yellow-100 text-yellow-800',
  advanced: 'bg-red-100 text-red-800',
};

const LessonCard: React.FC<LessonCardProps> = ({
  title,
  description,
  image,
  duration,
  difficulty,
  completed = false,
  slug,
  className,
}) => {
  return (
    <div className={cn("lesson-card group", className)}>
      <Link to={`/lessons/${slug}`}>
        <div className="relative">
          <img 
            src={image} 
            alt={title} 
            className="w-full h-40 object-cover" 
          />
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-200"></div>
          {completed && (
            <div className="absolute top-2 right-2 bg-white rounded-full p-1">
              <CircleCheck className="w-5 h-5 text-green-500" />
            </div>
          )}
        </div>
        <div className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className={cn("text-xs font-medium px-2 py-1 rounded-full", difficultyStyles[difficulty])}>
              {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
            </span>
            <div className="flex items-center text-muted-foreground">
              <Clock className="w-3 h-3 mr-1" />
              <span className="text-xs">{duration}</span>
            </div>
          </div>
          <h3 className="font-medium text-lg mb-2 group-hover:text-primary transition-colors">{title}</h3>
          <p className="text-muted-foreground text-sm mb-4">{description}</p>
          <div className="flex items-center text-primary text-sm font-medium">
            <span>Start Lesson</span>
            <ChevronRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" />
          </div>
        </div>
      </Link>
    </div>
  );
};

export default LessonCard;
