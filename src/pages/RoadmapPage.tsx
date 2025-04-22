
import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, Circle, Zap } from 'lucide-react';

import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Progress } from '@/components/ui/progress';

const RoadmapPage = () => {
  // These represent the categories from the comprehensive development plan
  const roadmapCategories = [
    {
      id: 'educational',
      title: 'Educational Structure & Content',
      description: 'Comprehensive learning pathways from beginner to expert',
      progress: 35,
      features: [
        { name: 'Complete Learning Pathway', status: 'in-progress' },
        { name: 'Rich Lesson Content', status: 'in-progress' },
        { name: 'Interactive Exercises', status: 'planned' },
        { name: 'Knowledge Assessment', status: 'planned' },
      ]
    },
    {
      id: 'simulation',
      title: 'Interactive Features & Simulation',
      description: 'Professional-grade circuit simulation environment',
      progress: 20,
      features: [
        { name: 'Basic Circuit Simulator', status: 'completed' },
        { name: 'Component Library', status: 'in-progress' },
        { name: 'Real-time Validation', status: 'planned' },
        { name: 'Measurement Tools', status: 'planned' },
      ]
    },
    {
      id: 'ux',
      title: 'User Experience & Interface',
      description: 'Responsive, intuitive design across all devices',
      progress: 40,
      features: [
        { name: 'Responsive Design', status: 'in-progress' },
        { name: 'Consistent Visual Hierarchy', status: 'in-progress' },
        { name: 'Touch-friendly Controls', status: 'planned' },
        { name: 'Accessibility Improvements', status: 'planned' },
      ]
    },
    {
      id: 'community',
      title: 'Community & Social Features',
      description: 'Collaboration tools and knowledge sharing',
      progress: 10,
      features: [
        { name: 'Project Showcase', status: 'planned' },
        { name: 'User Profiles', status: 'planned' },
        { name: 'Discussion Forums', status: 'planned' },
        { name: 'Collaborative Editing', status: 'planned' },
      ]
    },
    {
      id: 'technical',
      title: 'Technical & Performance',
      description: 'Optimized platform for speed and reliability',
      progress: 25,
      features: [
        { name: 'Performance Optimization', status: 'in-progress' },
        { name: 'User Authentication', status: 'planned' },
        { name: 'Project Storage', status: 'planned' },
        { name: 'Analytics Integration', status: 'planned' },
      ]
    },
    {
      id: 'monetization',
      title: 'Monetization & Sustainability',
      description: 'Business model to support ongoing development',
      progress: 5,
      features: [
        { name: 'Freemium Model', status: 'planned' },
        { name: 'Educational Licensing', status: 'planned' },
        { name: 'Premium Content', status: 'planned' },
        { name: 'Certification Programs', status: 'planned' },
      ]
    },
    {
      id: 'advanced',
      title: 'Advanced Topics & Extensions',
      description: 'Cutting-edge topics and real-world applications',
      progress: 15,
      features: [
        { name: 'Microcontroller Programming', status: 'planned' },
        { name: 'PCB Design Tutorials', status: 'planned' },
        { name: 'IoT Projects', status: 'planned' },
        { name: 'Industry Case Studies', status: 'planned' },
      ]
    },
    {
      id: 'accessibility',
      title: 'Accessibility & Global Reach',
      description: 'Inclusive design for diverse users worldwide',
      progress: 10,
      features: [
        { name: 'Screen Reader Support', status: 'in-progress' },
        { name: 'Keyboard Navigation', status: 'planned' },
        { name: 'Internationalization', status: 'planned' },
        { name: 'Regional Adaptations', status: 'planned' },
      ]
    },
  ];

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'in-progress':
        return <Zap className="w-5 h-5 text-amber-500" />;
      default:
        return <Circle className="w-5 h-5 text-gray-300" />;
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
            <span className="text-sm">Development Roadmap</span>
          </div>
          
          <div className="mb-10">
            <h1 className="text-3xl font-bold mb-4">CircuitBuilders Development Roadmap</h1>
            <p className="text-muted-foreground max-w-3xl">
              Welcome to our development roadmap. This page outlines the planned features and improvements
              for CircuitBuilders. We're committed to building a comprehensive electronics learning
              platform with world-class circuit simulation capabilities.
            </p>
          </div>
          
          <div className="grid gap-8 md:grid-cols-2">
            {roadmapCategories.map((category) => (
              <div key={category.id} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h2 className="text-xl font-bold mb-2">{category.title}</h2>
                <p className="text-muted-foreground mb-4">{category.description}</p>
                
                <div className="mb-4">
                  <div className="flex justify-between items-center text-sm mb-1">
                    <span className="font-medium">Progress</span>
                    <span className="text-muted-foreground">{category.progress}%</span>
                  </div>
                  <Progress value={category.progress} className="h-2" />
                </div>
                
                <h3 className="text-sm font-medium mb-3">Key Features:</h3>
                <ul className="space-y-3">
                  {category.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-3">
                      {getStatusIcon(feature.status)}
                      <div>
                        <span className="font-medium">{feature.name}</span>
                        <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 capitalize">
                          {feature.status.replace('-', ' ')}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          
          <div className="mt-12 bg-blue-50 p-8 rounded-lg border border-blue-100">
            <h2 className="text-xl font-bold mb-4">Implementation Strategy & Timeline</h2>
            <p className="mb-6">
              Our development is guided by the following implementation priorities:
            </p>
            
            <ol className="list-decimal list-inside space-y-2 ml-4 mb-6">
              <li className="text-primary font-medium">Core Educational Structure & Curriculum</li>
              <li>Simulator Functionality & Technical Foundation</li>
              <li>Engaging Lesson Content Development</li>
              <li>User Experience & Interface Improvements</li>
              <li>Cross-device Responsive Design</li>
              <li>Community & Collaborative Features</li>
              <li>Technical Optimization & Performance</li>
              <li>Sustainable Business Model</li>
              <li>Advanced Topic Expansion</li>
              <li>Global Reach & Internationalization</li>
            </ol>
            
            <p className="text-muted-foreground">
              This sequence allows for incremental improvement while ensuring core functionality
              remains solid throughout the development process.
            </p>
            
            <div className="mt-6 flex justify-center">
              <Link 
                to="/contact" 
                className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
              >
                Share Your Feedback
              </Link>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default RoadmapPage;
