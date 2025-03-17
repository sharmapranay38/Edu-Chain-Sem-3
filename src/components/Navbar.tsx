import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { ChevronDown, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import LoginButton from "./LoginButton";
import { Link } from "react-router-dom";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 w-full z-50 transition-all duration-300",
        scrolled ? "py-3 bg-white/80 backdrop-blur-sm border-b border-gray-100" : "py-4 bg-transparent"
      )}
    >
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-md flex items-center justify-center">
              <span className="text-white font-semibold">EB</span>
            </div>
            <span className="font-semibold text-lg">EduBounty</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              to="#features"
              className="text-sm font-medium hover:text-blue-600 transition-colors"
            >
              How it Works
            </Link>
            <Link
              to="#user-journey"
              className="text-sm font-medium hover:text-blue-600 transition-colors"
            >
              For Users
            </Link>
            <Link
              to="/login"
              className="text-sm font-medium hover:text-blue-600 transition-colors"
            >
              Get Started
            </Link>
          </nav>

          <div className="hidden md:block">
            <LoginButton />
          </div>

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
          "md:hidden absolute w-full bg-white/90 backdrop-blur-sm transition-all duration-300 ease-in-out overflow-hidden border-b border-gray-100",
          isOpen ? "max-h-72 py-4" : "max-h-0"
        )}
      >
        <div className="container mx-auto px-4 flex flex-col space-y-4">
          <Link
            to="#features"
            className="text-sm font-medium py-2 hover:text-blue-600 transition-colors"
            onClick={() => setIsOpen(false)}
          >
            How it Works
          </Link>
          <Link
            to="#user-journey"
            className="text-sm font-medium py-2 hover:text-blue-600 transition-colors"
            onClick={() => setIsOpen(false)}
          >
            For Users
          </Link>
          <Link
            to="/login"
            className="text-sm font-medium py-2 hover:text-blue-600 transition-colors"
            onClick={() => setIsOpen(false)}
          >
            Get Started
          </Link>
          <div className="pt-2">
            <LoginButton />
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
