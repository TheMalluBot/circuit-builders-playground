
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  Plus, Search, FilterX, Check, Edit, Trash, 
  AlertCircle, ChevronDown, Copy, Eye, Calendar 
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { format } from 'date-fns';
import { lessons, Lesson } from '@/data/lessonData';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";

const LessonsManagement = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [difficultyFilter, setDifficultyFilter] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [view, setView] = useState<'table' | 'cards'>('table');
  const [selectedLessons, setSelectedLessons] = useState<number[]>([]);
  
  // Add mock dates for the lessons
  const lessonDates = lessons.map(lesson => ({
    ...lesson,
    createdAt: new Date(2023, (lesson.id % 12), lesson.id + 1),
    updatedAt: new Date(2024, (lesson.id % 3), lesson.id + 15),
  }));
  
  const filteredLessons = lessonDates.filter(lesson => {
    // Search filter
    if (searchQuery && !lesson.title.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    // Status filter (placeholder since we don't have status in the data model yet)
    if (statusFilter === 'published' && lesson.id > 5) return false;
    if (statusFilter === 'draft' && lesson.id <= 5) return false;
    if (statusFilter === 'archived' && lesson.id !== 3) return false;
    
    // Difficulty filter
    if (difficultyFilter && lesson.difficulty !== difficultyFilter) {
      return false;
    }
    
    // Category filter
    if (categoryFilter && lesson.category !== categoryFilter) {
      return false;
    }
    
    return true;
  });
  
  const handleEditLesson = (lesson: Lesson) => {
    navigate(`/admin/lessons/${lesson.id}/edit`);
  };
  
  const handleDeleteLesson = (lesson: Lesson) => {
    toast.error(`Delete lesson: ${lesson.title}`);
    // This would show a confirmation dialog
  };
  
  const handleDuplicateLesson = (lesson: Lesson) => {
    toast.info(`Duplicating lesson: ${lesson.title}`);
    // This would duplicate the lesson
  };
  
  const handleCreateLesson = () => {
    navigate('/admin/lessons/new');
  };
  
  const clearFilters = () => {
    setSearchQuery('');
    setStatusFilter(null);
    setDifficultyFilter(null);
    setCategoryFilter(null);
  };
  
  const getStatusBadge = (lesson: Lesson) => {
    // Simulate status based on lesson ID for demonstration
    if (lesson.id <= 5) {
      return <Badge className="bg-green-500">Published</Badge>;
    } else if (lesson.id === 3) {
      return <Badge variant="outline" className="text-gray-500 border-gray-500">Archived</Badge>;
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
  
  const toggleSelectLesson = (lessonId: number) => {
    setSelectedLessons(prev => 
      prev.includes(lessonId)
        ? prev.filter(id => id !== lessonId)
        : [...prev, lessonId]
    );
  };
  
  const selectAllLessons = () => {
    if (selectedLessons.length === filteredLessons.length) {
      setSelectedLessons([]);
    } else {
      setSelectedLessons(filteredLessons.map(l => l.id));
    }
  };
  
  const handleBulkAction = (action: string) => {
    if (selectedLessons.length === 0) return;
    
    switch (action) {
      case 'delete':
        toast.error(`Deleting ${selectedLessons.length} lessons`);
        break;
      case 'publish':
        toast.success(`Publishing ${selectedLessons.length} lessons`);
        break;
      case 'draft':
        toast.info(`Moving ${selectedLessons.length} lessons to draft`);
        break;
      case 'archive':
        toast.info(`Archiving ${selectedLessons.length} lessons`);
        break;
    }
    
    // Clear selection after action
    setSelectedLessons([]);
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
              <DropdownMenuItem onClick={() => setStatusFilter('archived')}>
                Archived
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
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-[130px]">
                Category
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setCategoryFilter(null)}>
                All
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setCategoryFilter('beginner')}>
                Basics
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setCategoryFilter('intermediate')}>
                Components
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setCategoryFilter('advanced')}>
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
        
        <div className="mb-4">
          <Tabs value={view} onValueChange={(v) => setView(v as 'table' | 'cards')}>
            <div className="flex justify-between items-center">
              <TabsList>
                <TabsTrigger value="table">Table View</TabsTrigger>
                <TabsTrigger value="cards">Card View</TabsTrigger>
              </TabsList>
              
              {selectedLessons.length > 0 && (
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-muted-foreground">
                    {selectedLessons.length} selected
                  </span>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm">
                        Bulk Actions
                        <ChevronDown className="ml-2 h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleBulkAction('publish')}>
                        Publish Selected
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleBulkAction('draft')}>
                        Move to Draft
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleBulkAction('archive')}>
                        Archive Selected
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        className="text-red-600"
                        onClick={() => handleBulkAction('delete')}
                      >
                        Delete Selected
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              )}
            </div>
          </Tabs>
        </div>
        
        <TabsContent value="table" className="mt-0">
          <div className="border rounded-md">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-slate-50">
                  <th className="p-3 w-10">
                    <Checkbox 
                      checked={selectedLessons.length === filteredLessons.length && filteredLessons.length > 0}
                      onCheckedChange={selectAllLessons}
                      aria-label="Select all"
                    />
                  </th>
                  <th className="text-left p-3 text-sm font-medium">Title</th>
                  <th className="text-left p-3 text-sm font-medium hidden md:table-cell">Status</th>
                  <th className="text-left p-3 text-sm font-medium hidden md:table-cell">Difficulty</th>
                  <th className="text-left p-3 text-sm font-medium hidden md:table-cell">Duration</th>
                  <th className="text-left p-3 text-sm font-medium hidden lg:table-cell">Created</th>
                  <th className="text-left p-3 text-sm font-medium hidden lg:table-cell">Updated</th>
                  <th className="text-right p-3 text-sm font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredLessons.map((lesson) => (
                  <tr key={lesson.id} className="border-b hover:bg-slate-50">
                    <td className="p-3">
                      <Checkbox 
                        checked={selectedLessons.includes(lesson.id)}
                        onCheckedChange={() => toggleSelectLesson(lesson.id)}
                        aria-label={`Select ${lesson.title}`}
                      />
                    </td>
                    <td className="p-3">
                      <div className="font-medium">{lesson.title}</div>
                      <div className="text-sm text-muted-foreground line-clamp-1 md:hidden mt-1">
                        {getStatusBadge(lesson)} {getDifficultyBadge(lesson.difficulty)}
                      </div>
                    </td>
                    <td className="p-3 hidden md:table-cell">{getStatusBadge(lesson)}</td>
                    <td className="p-3 hidden md:table-cell">{getDifficultyBadge(lesson.difficulty)}</td>
                    <td className="p-3 hidden md:table-cell">{lesson.duration}</td>
                    <td className="p-3 hidden lg:table-cell text-sm text-muted-foreground">
                      {format(lesson.createdAt, 'MMM d, yyyy')}
                    </td>
                    <td className="p-3 hidden lg:table-cell text-sm text-muted-foreground">
                      {format(lesson.updatedAt, 'MMM d, yyyy')}
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
                          <DropdownMenuItem onClick={() => handleDuplicateLesson(lesson)}>
                            <Copy className="mr-2 h-4 w-4" /> Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => toast.success(`Preview lesson: ${lesson.title}`)}>
                            <Eye className="mr-2 h-4 w-4" /> Preview
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
                    <td colSpan={8} className="p-10 text-center text-muted-foreground">
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
        </TabsContent>
        
        <TabsContent value="cards" className="mt-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredLessons.map((lesson) => (
              <Card key={lesson.id} className="overflow-hidden">
                <div className="relative">
                  <div className="absolute top-2 right-2">
                    <Checkbox 
                      checked={selectedLessons.includes(lesson.id)}
                      onCheckedChange={() => toggleSelectLesson(lesson.id)}
                      aria-label={`Select ${lesson.title}`}
                    />
                  </div>
                  <div className="h-40 bg-slate-100 flex items-center justify-center">
                    <div className="text-slate-400">
                      <img 
                        src={lesson.image || "/placeholder.svg"} 
                        alt={lesson.title} 
                        className="h-40 w-full object-cover"
                      />
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium truncate">{lesson.title}</h3>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    {getStatusBadge(lesson)}
                    {getDifficultyBadge(lesson.difficulty)}
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                    {lesson.description}
                  </p>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      {format(lesson.updatedAt, 'MMM d, yyyy')}
                    </div>
                    <div>
                      {lesson.duration}
                    </div>
                  </div>
                  <div className="mt-4 flex justify-end gap-2">
                    <Button variant="ghost" size="sm" onClick={() => toast.success(`Preview lesson: ${lesson.title}`)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDuplicateLesson(lesson)}>
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleEditLesson(lesson)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDeleteLesson(lesson)}>
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
            
            {filteredLessons.length === 0 && (
              <div className="col-span-full p-10 text-center text-muted-foreground">
                No lessons found matching your filters.
                <div className="mt-2">
                  <Button variant="outline" size="sm" onClick={clearFilters}>
                    Clear Filters
                  </Button>
                </div>
              </div>
            )}
          </div>
        </TabsContent>
      </div>
    </div>
  );
};

export default LessonsManagement;
