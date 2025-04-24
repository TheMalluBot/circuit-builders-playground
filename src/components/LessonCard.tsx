
import React from 'react';
import { Link } from 'react-router-dom';
import { 
  CircleCheck, 
  Clock,
  ChevronRight,
  Component,
  Lightbulb
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Lesson } from '@/data/lessonData';

interface LessonCardProps {
  title: string;
  description: string;
  image: string;
  duration: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  completed?: boolean;
  slug: string;
  className?: string;
  sections?: number;
  hasSimulation?: boolean;
}

const difficultyStyles = {
  beginner: 'bg-blue-100 text-blue-800',
  intermediate: 'bg-yellow-100 text-yellow-800',
  advanced: 'bg-red-100 text-red-800',
};

const difficultyLabels = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced'
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
  sections = 0,
  hasSimulation = false,
}) => {
  return (
    <div className={cn("lesson-card group relative overflow-hidden", className)}>
      <Link to={`/lessons/${slug}`}>
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300">
          <div className="relative">
            <img 
              src={image} 
              alt={title} 
              className="w-full h-44 object-cover" 
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/0 to-black/60">
              <div className="absolute bottom-3 left-3 right-3">
                <Badge variant="outline" className={cn("text-xs font-medium px-2 py-1 rounded-full border-0", difficultyStyles[difficulty])}>
                  {difficultyLabels[difficulty]}
                </Badge>
              </div>
            </div>
            {completed && (
              <div className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-sm">
                <CircleCheck className="w-5 h-5 text-green-500" />
              </div>
            )}
            {hasSimulation && (
              <div className="absolute top-2 left-2 bg-white rounded-full p-1 shadow-sm">
                <Component className="w-5 h-5 text-blue-500" />
              </div>
            )}
          </div>
          <div className="p-4">
            <div className="flex items-center justify-between mb-2 text-xs text-muted-foreground">
              <div className="flex items-center">
                <Clock className="w-3 h-3 mr-1" />
                <span>{duration}</span>
              </div>
              {sections > 0 && (
                <div className="flex items-center">
                  <Lightbulb className="w-3 h-3 mr-1" />
                  <span>{sections} {sections === 1 ? 'section' : 'sections'}</span>
                </div>
              )}
            </div>
            <h3 className="font-medium text-lg mb-2 group-hover:text-primary transition-colors line-clamp-2">{title}</h3>
            <p className="text-muted-foreground text-sm mb-4 line-clamp-3">{description}</p>
            <div className="flex items-center text-primary text-sm font-medium mt-auto">
              <span>Start Lesson</span>
              <ChevronRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" />
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default LessonCard;
