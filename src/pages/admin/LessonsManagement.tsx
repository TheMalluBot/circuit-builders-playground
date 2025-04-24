
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Search, FilterX, Check, Edit, Trash, AlertCircle, ChevronDown } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { lessons, Lesson } from '@/data/lessonData';
import { toast } from 'sonner';

const LessonsManagement = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [difficultyFilter, setDifficultyFilter] = useState<string | null>(null);
  
  const filteredLessons = lessons.filter(lesson => {
    // Search filter
    if (searchQuery && !lesson.title.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    // Status filter (placeholder since we don't have status in the data model yet)
    if (statusFilter === 'published' && lesson.id > 5) return false;
    if (statusFilter === 'draft' && lesson.id <= 5) return false;
    
    // Difficulty filter
    if (difficultyFilter && lesson.difficulty !== difficultyFilter) {
      return false;
    }
    
    return true;
  });
  
  const handleEditLesson = (lesson: Lesson) => {
    toast.info(`Editing lesson: ${lesson.title}`);
    // This would open the lesson editor
  };
  
  const handleDeleteLesson = (lesson: Lesson) => {
    toast.error(`Delete lesson: ${lesson.title}`);
    // This would show a confirmation dialog
  };
  
  const handleCreateLesson = () => {
    toast.success("Creating new lesson");
    // This would open the lesson creator
  };
  
  const clearFilters = () => {
    setSearchQuery('');
    setStatusFilter(null);
    setDifficultyFilter(null);
  };
  
  const getStatusBadge = (lesson: Lesson) => {
    // Simulate status based on lesson ID for demonstration
    if (lesson.id <= 5) {
      return <Badge className="bg-green-500">Published</Badge>;
    } else {
      return <Badge variant="outline" className="text-amber-500 border-amber-500">Draft</Badge>;
    }
  };
  
  const getDifficultyBadge = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return <Badge className="bg-blue-500">Beginner</Badge>;
      case 'intermediate':
        return <Badge className="bg-yellow-500">Intermediate</Badge>;
      case 'advanced':
        return <Badge className="bg-red-500">Advanced</Badge>;
      default:
        return null;
    }
  };
  
  const getSectionCount = (lesson: Lesson) => {
    return lesson.content?.sections?.length || 0;
  };
  
  const hasSimulation = (lesson: Lesson) => {
    return !!lesson.content?.simulationActivity;
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Lessons Management</h1>
          <p className="text-muted-foreground">
            Create, edit, and manage your educational lessons
          </p>
        </div>
        <div>
          <Button onClick={handleCreateLesson}>
            <Plus className="mr-2 h-4 w-4" />
            Create New Lesson
          </Button>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-lg border shadow-sm mb-6">
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search lessons..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-[130px]">
                Status
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setStatusFilter(null)}>
                All
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter('published')}>
                Published
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter('draft')}>
                Draft
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-[130px]">
                Difficulty
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setDifficultyFilter(null)}>
                All
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setDifficultyFilter('beginner')}>
                Beginner
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setDifficultyFilter('intermediate')}>
                Intermediate
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setDifficultyFilter('advanced')}>
                Advanced
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          {(searchQuery || statusFilter || difficultyFilter) && (
            <Button variant="ghost" onClick={clearFilters} className="gap-1">
              <FilterX className="h-4 w-4" />
              Clear
            </Button>
          )}
        </div>
        
        <div className="border rounded-md">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-slate-50">
                <th className="text-left p-3 text-sm font-medium">Title</th>
                <th className="text-left p-3 text-sm font-medium hidden md:table-cell">Status</th>
                <th className="text-left p-3 text-sm font-medium hidden md:table-cell">Difficulty</th>
                <th className="text-left p-3 text-sm font-medium hidden md:table-cell">Duration</th>
                <th className="text-left p-3 text-sm font-medium hidden lg:table-cell">Sections</th>
                <th className="text-left p-3 text-sm font-medium hidden lg:table-cell">Simulation</th>
                <th className="text-right p-3 text-sm font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredLessons.map((lesson) => (
                <tr key={lesson.id} className="border-b hover:bg-slate-50">
                  <td className="p-3">
                    <div className="font-medium">{lesson.title}</div>
                    <div className="text-sm text-muted-foreground line-clamp-1 md:hidden mt-1">
                      {getStatusBadge(lesson)} {getDifficultyBadge(lesson.difficulty)}
                    </div>
                  </td>
                  <td className="p-3 hidden md:table-cell">{getStatusBadge(lesson)}</td>
                  <td className="p-3 hidden md:table-cell">{getDifficultyBadge(lesson.difficulty)}</td>
                  <td className="p-3 hidden md:table-cell">{lesson.duration}</td>
                  <td className="p-3 hidden lg:table-cell">{getSectionCount(lesson)}</td>
                  <td className="p-3 hidden lg:table-cell">
                    {hasSimulation(lesson) ? 
                      <Check className="h-5 w-5 text-green-500" /> : 
                      <AlertCircle className="h-5 w-5 text-yellow-500" />}
                  </td>
                  <td className="p-3 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <span className="sr-only">Open menu</span>
                          <ChevronDown className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleEditLesson(lesson)}>
                          <Edit className="mr-2 h-4 w-4" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => toast.success(`Preview lesson: ${lesson.title}`)}>
                          <Search className="mr-2 h-4 w-4" /> Preview
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          className="text-red-600"
                          onClick={() => handleDeleteLesson(lesson)}
                        >
                          <Trash className="mr-2 h-4 w-4" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
              
              {filteredLessons.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-10 text-center text-muted-foreground">
                    No lessons found matching your filters.
                    <div className="mt-2">
                      <Button variant="outline" size="sm" onClick={clearFilters}>
                        Clear Filters
                      </Button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default LessonsManagement;
