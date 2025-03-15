
import React, { useEffect, useRef } from 'react';
import { BookOpen, Award, CheckCircle, UserPlus } from 'lucide-react';

const featureData = [
  {
    title: "Create Tasks",
    description: "Design educational assignments and set token rewards for completion.",
    icon: <BookOpen className="h-6 w-6 text-blue-500" />,
    delay: 0
  },
  {
    title: "Complete Tasks",
    description: "Browse and complete available tasks to earn valuable EDU tokens.",
    icon: <CheckCircle className="h-6 w-6 text-blue-500" />,
    delay: 200
  },
  {
    title: "Review Work",
    description: "Provide feedback on others' submissions to earn additional tokens.",
    icon: <UserPlus className="h-6 w-6 text-blue-500" />,
    delay: 400
  },
  {
    title: "Earn Rewards",
    description: "Accumulate and redeem EDU tokens for exclusive benefits and rewards.",
    icon: <Award className="h-6 w-6 text-blue-500" />,
    delay: 600
  }
];

const Features = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<(HTMLDivElement | null)[]>([]);

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

    const sectionElement = sectionRef.current;
    if (sectionElement) {
      observer.observe(sectionElement);
    }

    featuresRef.current.forEach((feature) => {
      if (feature) observer.observe(feature);
    });

    return () => {
      if (sectionElement) {
        observer.unobserve(sectionElement);
      }
      featuresRef.current.forEach((feature) => {
        if (feature) observer.unobserve(feature);
      });
    };
  }, []);

  return (
    <section id="features" className="section bg-gray-50">
      <div 
        ref={sectionRef}
        className="container mx-auto reveal-animation translate-y-4"
      >
        <div className="text-center mb-16">
          <div className="inline-block px-3 py-1 rounded-full bg-blue-50 border border-blue-100 mb-4">
            <span className="text-sm font-medium text-blue-600">How It Works</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Simple. Educational. Rewarding.
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Our platform makes it easy to participate in educational tasks and earn rewards. 
            Here's how the EduBounty ecosystem functions.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {featureData.map((feature, index) => (
            <div
              key={index}
              ref={el => featuresRef.current[index] = el}
              className="glass rounded-xl p-6 reveal-animation translate-y-4"
              style={{ transitionDelay: `${feature.delay}ms` }}
            >
              <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center mb-6">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
