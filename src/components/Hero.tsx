
import React, { useEffect, useRef } from 'react';
import { ArrowRight } from 'lucide-react';
import { Button } from "@/components/ui/button";

const Hero = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  const tokenRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
          }
        });
      },
      { threshold: 0.1 }
    );

    const heroElement = heroRef.current;
    if (heroElement) {
      observer.observe(heroElement);
    }

    return () => {
      if (heroElement) {
        observer.unobserve(heroElement);
      }
    };
  }, []);

  useEffect(() => {
    const token = tokenRef.current;
    if (!token) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = token.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      const distance = Math.sqrt(x * x + y * y);
      const maxDistance = Math.sqrt(window.innerWidth * window.innerWidth + window.innerHeight * window.innerHeight) / 8;
      const scale = 1 - Math.min(distance / maxDistance, 0.1);
      
      token.style.transform = `translate(${x / 20}px, ${y / 20}px) scale(${scale})`;
    };

    document.addEventListener('mousemove', handleMouseMove);
    return () => document.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden section pt-20">
      <div 
        ref={heroRef} 
        className="container mx-auto flex flex-col items-center text-center reveal-animation translate-y-4"
      >
        <div className="inline-block mb-4 px-3 py-1 rounded-full bg-blue-50 border border-blue-100">
          <span className="text-sm font-medium text-blue-600">Introducing EduBounty</span>
        </div>
        
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6 max-w-4xl">
          <span className="block">Earn Tokens for Learning</span>
          <span className="block text-gradient">and Contributing</span>
        </h1>
        
        <p className="text-lg md:text-xl text-gray-600 max-w-2xl mb-10">
          Create or complete educational tasks, review work from others, 
          and earn tokens for your contributions to the learning community.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 mb-16">
          <Button size="lg" className="group">
            Get Started
            <ArrowRight size={16} className="ml-2 transition-transform group-hover:translate-x-1" />
          </Button>
          <Button size="lg" variant="outline">
            Learn More
          </Button>
        </div>

        <div className="relative w-full max-w-3xl h-64 md:h-80 mt-10">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background z-10"></div>
          <div 
            ref={tokenRef}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 md:w-40 md:h-40 bg-blue-500 rounded-full token-glow flex items-center justify-center transition-transform duration-200 ease-out z-0"
          >
            <div className="text-white font-bold text-lg md:text-2xl">EDU</div>
          </div>
          <div className="absolute top-4 left-8 w-20 h-20 bg-indigo-400 rounded-full token-glow opacity-60 animate-slow-pulse"></div>
          <div className="absolute bottom-10 right-10 w-16 h-16 bg-blue-300 rounded-full token-glow opacity-60 animate-slow-pulse"></div>
          <div className="absolute bottom-20 left-1/4 w-10 h-10 bg-indigo-300 rounded-full token-glow opacity-40 animate-slow-pulse"></div>
          <div className="absolute top-1/3 right-1/4 w-14 h-14 bg-blue-400 rounded-full token-glow opacity-50 animate-slow-pulse"></div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
