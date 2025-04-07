
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  Book,
  Layout,
  Zap,
  BookOpen,
  Users
} from 'lucide-react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import LessonCard from '@/components/LessonCard';
import { getLessonsByCategory } from '@/data/lessonData';

const Index = () => {
  const beginnerLessons = getLessonsByCategory('beginner').slice(0, 3);
  
  return (
    <div className="flex flex-col min-h-screen">
      <Navigation />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary/10 to-accent/10 py-20">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight animate-fade-in">
                Learn Circuit Design by Building Real Projects
              </h1>
              <p className="text-xl text-muted-foreground max-w-lg animate-fade-in" style={{animationDelay: '0.1s'}}>
                Master electronics through interactive lessons and hands-on simulations. From basic circuits to PCB design.
              </p>
              <div className="flex flex-wrap gap-4 animate-fade-in" style={{animationDelay: '0.2s'}}>
                <Button size="lg" asChild>
                  <Link to="/lessons/beginner">Start Learning</Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link to="/playground">Try Simulator</Link>
                </Button>
              </div>
            </div>
            <div className="lg:h-[500px] rounded-lg overflow-hidden shadow-xl bg-white border border-gray-200 animate-fade-in" style={{animationDelay: '0.3s'}}>
              <div className="h-full w-full bg-gradient-to-br from-circuit-blue/10 to-circuit-purple/10 flex items-center justify-center">
                <div className="simulator-grid h-[90%] w-[90%] flex items-center justify-center">
                  <img src="/placeholder.svg" alt="Circuit Simulator" className="w-1/2 h-1/2 opacity-50" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Key Features Section */}
      <section className="py-20">
        <div className="container">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold mb-4">Learn Electronics Step by Step</h2>
            <p className="text-muted-foreground text-lg">
              Our interactive platform combines theory with practice, making circuit design accessible for everyone.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-lg border border-gray-200 shadow-sm flex flex-col items-center text-center">
              <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                <Book className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-xl font-medium mb-3">Guided Lessons</h3>
              <p className="text-muted-foreground">
                Step-by-step instruction from basic principles to advanced concepts in electronics.
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-lg border border-gray-200 shadow-sm flex flex-col items-center text-center">
              <div className="h-14 w-14 rounded-full bg-circuit-green/10 flex items-center justify-center mb-6">
                <Layout className="h-7 w-7 text-circuit-green" />
              </div>
              <h3 className="text-xl font-medium mb-3">Interactive Simulator</h3>
              <p className="text-muted-foreground">
                Build and test your circuits in our virtual environment before building them physically.
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-lg border border-gray-200 shadow-sm flex flex-col items-center text-center">
              <div className="h-14 w-14 rounded-full bg-circuit-purple/10 flex items-center justify-center mb-6">
                <Zap className="h-7 w-7 text-circuit-purple" />
              </div>
              <h3 className="text-xl font-medium mb-3">Practical Projects</h3>
              <p className="text-muted-foreground">
                Apply your knowledge with hands-on projects ranging from simple LEDs to complete systems.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Featured Lessons Section */}
      <section className="py-20 bg-gray-50">
        <div className="container">
          <div className="flex justify-between items-center mb-12">
            <h2 className="text-3xl font-bold">Begin Your Journey</h2>
            <Button variant="outline" asChild>
              <Link to="/lessons/beginner">View All Beginner Lessons</Link>
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {beginnerLessons.map((lesson) => (
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
        </div>
      </section>
      
      {/* Testimonials */}
      <section className="py-20">
        <div className="container">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold mb-4">Trusted by Students and Educators</h2>
            <p className="text-muted-foreground text-lg">
              See how our platform is helping people learn electronics around the world.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-lg border border-gray-200 shadow-sm">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 rounded-full bg-gray-200 mr-4"></div>
                <div>
                  <h4 className="font-medium">Alex Johnson</h4>
                  <p className="text-sm text-muted-foreground">Engineering Student</p>
                </div>
              </div>
              <p className="text-muted-foreground">
                "The interactive simulations helped me understand circuit behavior better than any textbook. I can experiment without fear of burning components!"
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-lg border border-gray-200 shadow-sm">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 rounded-full bg-gray-200 mr-4"></div>
                <div>
                  <h4 className="font-medium">Maria Rodriguez</h4>
                  <p className="text-sm text-muted-foreground">Science Teacher</p>
                </div>
              </div>
              <p className="text-muted-foreground">
                "I use CircuitBuilders in my classroom to teach basic electronics. The step-by-step lessons are perfect for students with no prior experience."
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-lg border border-gray-200 shadow-sm">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 rounded-full bg-gray-200 mr-4"></div>
                <div>
                  <h4 className="font-medium">David Chen</h4>
                  <p className="text-sm text-muted-foreground">Hobbyist</p>
                </div>
              </div>
              <p className="text-muted-foreground">
                "From knowing nothing about electronics to building my own Arduino projects in just a few months. The practical approach made all the difference."
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary to-accent text-white">
        <div className="container text-center max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Start Your Electronics Journey?</h2>
          <p className="text-xl mb-8 text-white/80">
            Join thousands of learners mastering electronics through our interactive platform.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Button size="lg" variant="secondary" asChild>
              <Link to="/lessons/beginner">
                <BookOpen className="mr-2 h-5 w-5" />
                <span>Explore Lessons</span>
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="bg-transparent text-white border-white hover:bg-white/10" asChild>
              <Link to="/community">
                <Users className="mr-2 h-5 w-5" />
                <span>Join Community</span>
              </Link>
            </Button>
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default Index;
