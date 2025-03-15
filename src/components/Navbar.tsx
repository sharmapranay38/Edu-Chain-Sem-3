
import React, { useState, useEffect } from 'react';
import { cn } from "@/lib/utils";
import { ChevronDown, Menu, X } from 'lucide-react';
import { Button } from "@/components/ui/button";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 w-full z-50 transition-all duration-300",
        scrolled 
          ? "py-2 glass" 
          : "py-4 bg-transparent"
      )}
    >
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between">
          <a href="#" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
              <span className="text-white font-semibold">EB</span>
            </div>
            <span className="font-semibold text-lg">EduBounty</span>
          </a>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-sm font-medium hover:text-blue-500 transition-colors">How it Works</a>
            <a href="#user-journey" className="text-sm font-medium hover:text-blue-500 transition-colors">For Users</a>
            <a href="#cta" className="text-sm font-medium hover:text-blue-500 transition-colors">Get Started</a>
          </nav>

          <Button className="hidden md:inline-flex" size="sm">
            Sign Up
          </Button>

          {/* Mobile menu button */}
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-md"
            aria-label="Toggle menu"
          >
            {isOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      <nav
        className={cn(
          "md:hidden absolute w-full glass transition-all duration-300 ease-in-out overflow-hidden",
          isOpen ? "max-h-60 py-4 border-t" : "max-h-0"
        )}
      >
        <div className="container mx-auto px-4 flex flex-col space-y-4">
          <a 
            href="#features" 
            className="text-sm font-medium py-2 hover:text-blue-500 transition-colors"
            onClick={() => setIsOpen(false)}
          >
            How it Works
          </a>
          <a 
            href="#user-journey" 
            className="text-sm font-medium py-2 hover:text-blue-500 transition-colors"
            onClick={() => setIsOpen(false)}
          >
            For Users
          </a>
          <a 
            href="#cta" 
            className="text-sm font-medium py-2 hover:text-blue-500 transition-colors"
            onClick={() => setIsOpen(false)}
          >
            Get Started
          </a>
          <Button 
            size="sm" 
            className="w-full mt-2"
            onClick={() => setIsOpen(false)}
          >
            Sign Up
          </Button>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
