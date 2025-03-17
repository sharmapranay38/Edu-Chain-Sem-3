import React, { useEffect, useRef } from "react";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Hero = () => {
  const navigate = useNavigate();
  const heroRef = useRef(null);
  const tokenRef = useRef(null);

  const handleGetStarted = () => {
    navigate("/login");
  };

  const handleLearnMore = () => {
    navigate("/login");
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("revealed");
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

    const handleMouseMove = (e) => {
      const rect = token.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      const distance = Math.sqrt(x * x + y * y);
      const maxDistance =
        Math.sqrt(
          window.innerWidth * window.innerWidth +
            window.innerHeight * window.innerHeight
        ) / 8;
      const scale = 1 - Math.min(distance / maxDistance, 0.1);

      token.style.transform = `translate(${x / 20}px, ${
        y / 20
      }px) scale(${scale})`;
    };

    document.addEventListener("mousemove", handleMouseMove);
    return () => document.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-b from-blue-50 to-white pt-28">
      <div
        ref={heroRef}
        className="container mx-auto flex flex-col items-center text-center reveal-animation translate-y-4"
      >
        <div className="inline-block mb-4 px-3 py-1 rounded-full bg-blue-100 border border-blue-200">
          <span className="text-sm font-medium text-blue-600">
            Introducing EduBounty
          </span>
        </div>

        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6 max-w-4xl">
          <span className="block text-gray-800">Earn Tokens for Learning</span>
          <span className="block bg-gradient-to-r from-blue-600 to-indigo-600 text-transparent bg-clip-text">
            and Contributing
          </span>
        </h1>

        <p className="text-lg md:text-xl text-gray-600 max-w-2xl mb-10">
          Create or complete educational tasks, review work from others, and
          earn tokens for your contributions to the learning community.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 mb-16">
          <Button 
            size="lg" 
            className="group bg-blue-600 hover:bg-blue-700"
            onClick={handleGetStarted}
          >
            Get Started
            <ArrowRight
              size={16}
              className="ml-2 transition-transform group-hover:translate-x-1"
            />
          </Button>
          <Button 
            size="lg" 
            variant="outline" 
            className="border-blue-200 text-blue-600 hover:bg-blue-50"
            onClick={handleLearnMore}
          >
            Learn More
          </Button>
        </div>

        {/* Abstract shapes */}
        <div className="absolute -z-10 top-1/3 -left-64 w-96 h-96 bg-blue-100 rounded-full blur-3xl opacity-30"></div>
        <div className="absolute -z-10 bottom-1/4 -right-64 w-96 h-96 bg-indigo-100 rounded-full blur-3xl opacity-30"></div>
      </div>
    </div>
  );
};

export default Hero;