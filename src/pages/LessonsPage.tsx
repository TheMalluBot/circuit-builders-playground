
import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Book, 
  Filter,
  Search,
  ChevronDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import LessonCard from '@/components/LessonCard';
import { getLessonsByCategory, LessonCategory } from '@/data/lessonData';

const LessonsPage = () => {
  const { category = 'beginner' } = useParams<{ category: LessonCategory }>();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState<'newest' | 'popular' | 'name'>('newest');
  
  const categoryLessons = getLessonsByCategory(category as LessonCategory);
  
  const filteredLessons = categoryLessons.filter(lesson => 
    lesson.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    lesson.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Simple sorting function
  const sortedLessons = [...filteredLessons].sort((a, b) => {
    if (sortOption === 'name') {
      return a.title.localeCompare(b.title);
    } else if (sortOption === 'popular') {
      // In a real app, this would use actual popularity metrics
      return b.id - a.id;
    } else {
      // newest
      return b.id - a.id;
    }
  });
  
  const getCategoryTitle = () => {
    switch(category) {
      case 'beginner': return 'Beginner Lessons';
      case 'intermediate': return 'Intermediate Lessons';
      case 'advanced': return 'Advanced Lessons';
      default: return 'All Lessons';
    }
  };
  
  return (
    <div className="flex flex-col min-h-screen">
      <Navigation />
      
      <main className="flex-1">
        <div className="container py-12">
          <div className="flex items-center gap-2 mb-8">
            <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors text-sm">
              Home
            </Link>
            <span className="text-muted-foreground">/</span>
            <Link to="/lessons" className="text-muted-foreground hover:text-foreground transition-colors text-sm">
              Lessons
            </Link>
            <span className="text-muted-foreground">/</span>
            <span className="text-sm">{getCategoryTitle()}</span>
          </div>
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-2">{getCategoryTitle()}</h1>
              <p className="text-muted-foreground">Master electronics with our structured learning path</p>
            </div>
            
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <input
                  type="search"
                  placeholder="Search lessons..."
                  className="rounded-md border border-input bg-white pl-9 pr-4 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-1">
                    <Filter className="w-4 h-4" />
                    <span>Sort</span>
                    <ChevronDown className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setSortOption('newest')}>
                    Newest
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortOption('popular')}>
                    Most Popular
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortOption('name')}>
                    Alphabetical
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          
          <Tabs defaultValue={category}>
            <TabsList className="mb-8">
              <TabsTrigger value="beginner" asChild>
                <Link to="/lessons/beginner">Beginner</Link>
              </TabsTrigger>
              <TabsTrigger value="intermediate" asChild>
                <Link to="/lessons/intermediate">Intermediate</Link>
              </TabsTrigger>
              <TabsTrigger value="advanced" asChild>
                <Link to="/lessons/advanced">Advanced</Link>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value={category} className="mt-0">
              {sortedLessons.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {sortedLessons.map((lesson) => (
                    <LessonCard
                      key={lesson.id}
                      title={lesson.title}
                      description={lesson.description}
                      image={lesson.image}
                      duration={lesson.duration}
                      difficulty={lesson.difficulty}
                      completed={lesson.completed}
                      slug={lesson.slug}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Book className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-medium mb-2">No lessons found</h3>
                  <p className="text-muted-foreground mb-6">
                    We couldn't find any lessons matching your search criteria.
                  </p>
                  <Button onClick={() => setSearchQuery('')}>
                    Clear Search
                  </Button>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default LessonsPage;
