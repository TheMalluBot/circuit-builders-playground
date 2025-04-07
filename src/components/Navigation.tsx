
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  Book, 
  Layout, 
  Zap, 
  Search, 
  User
} from 'lucide-react';

const Navigation = () => {
  return (
    <header className="border-b border-border sticky top-0 bg-background z-50">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2">
            <Zap className="w-6 h-6 text-primary" />
            <span className="text-xl font-bold">CircuitBuilders</span>
          </Link>
          
          <nav className="hidden md:flex items-center gap-6">
            <Link to="/lessons" className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors">
              <Book className="w-4 h-4" />
              <span>Lessons</span>
            </Link>
            <Link to="/playground" className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors">
              <Layout className="w-4 h-4" />
              <span>Playground</span>
            </Link>
            <Link to="/projects" className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors">
              <Zap className="w-4 h-4" />
              <span>Projects</span>
            </Link>
          </nav>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative hidden md:flex items-center">
            <Search className="absolute left-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="search"
              placeholder="Search lessons..."
              className="rounded-md border border-input bg-white px-9 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            />
          </div>
          <Button variant="ghost" size="icon" className="rounded-full">
            <User className="h-5 w-5" />
            <span className="sr-only">Account</span>
          </Button>
          <Button variant="default">Sign Up</Button>
        </div>
      </div>
    </header>
  );
};

export default Navigation;
