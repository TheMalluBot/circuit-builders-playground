
import React from 'react';
import { Link } from 'react-router-dom';
import { Zap } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-border mt-auto">
      <div className="container py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <Link to="/" className="flex items-center gap-2 mb-4">
              <Zap className="w-5 h-5 text-primary" />
              <span className="text-lg font-bold">CircuitBuilders</span>
            </Link>
            <p className="text-muted-foreground text-sm">
              Learn electronics with interactive lessons and simulations
            </p>
          </div>
          
          <div>
            <h4 className="font-medium mb-4">Learn</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/lessons/beginner" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Beginner Lessons
                </Link>
              </li>
              <li>
                <Link to="/lessons/intermediate" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Intermediate Lessons
                </Link>
              </li>
              <li>
                <Link to="/lessons/advanced" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Advanced Lessons
                </Link>
              </li>
              <li>
                <Link to="/playground" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Sandbox Mode
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium mb-4">Resources</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/projects" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Community Projects
                </Link>
              </li>
              <li>
                <Link to="/forum" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Discussion Forum
                </Link>
              </li>
              <li>
                <Link to="/downloads" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Downloadable Resources
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium mb-4">Company</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/about" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link to="/pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Pricing
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-border mt-8 pt-8 flex flex-col sm:flex-row justify-between items-center">
          <p className="text-sm text-muted-foreground">
            © 2025 CircuitBuilders. All rights reserved.
          </p>
          <div className="flex gap-6 mt-4 sm:mt-0">
            <Link to="/privacy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
