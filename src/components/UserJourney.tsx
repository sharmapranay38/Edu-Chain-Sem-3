
import React, { useEffect, useRef } from 'react';
import { ArrowRight } from 'lucide-react';

const UserJourney = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const leftColRef = useRef<HTMLDivElement>(null);
  const rightColRef = useRef<HTMLDivElement>(null);

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
    const leftColElement = leftColRef.current;
    const rightColElement = rightColRef.current;

    if (sectionElement) observer.observe(sectionElement);
    if (leftColElement) observer.observe(leftColElement);
    if (rightColElement) observer.observe(rightColElement);

    return () => {
      if (sectionElement) observer.unobserve(sectionElement);
      if (leftColElement) observer.unobserve(leftColElement);
      if (rightColElement) observer.unobserve(rightColElement);
    };
  }, []);

  return (
    <section id="user-journey" className="section">
      <div 
        ref={sectionRef}
        className="container mx-auto reveal-animation translate-y-4"
      >
        <div className="text-center mb-16">
          <div className="inline-block px-3 py-1 rounded-full bg-blue-50 border border-blue-100 mb-4">
            <span className="text-sm font-medium text-blue-600">For Users</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Two Ways to Participate
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Whether you're creating educational content or completing tasks, 
            EduBounty provides value for all participants.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          <div 
            ref={leftColRef}
            className="glass rounded-xl p-8 reveal-animation translate-x-[-20px]"
          >
            <div className="w-12 h-12 rounded-lg bg-indigo-50 flex items-center justify-center mb-6">
              <span className="font-bold text-indigo-500">1</span>
            </div>
            <h3 className="text-2xl font-semibold mb-4">Task Creators</h3>
            <p className="text-gray-600 mb-6">
              For educators, subject matter experts, and organizations who want to:
            </p>
            <ul className="space-y-4 mb-8">
              {[
                "Create educational assignments and challenges",
                "Set token rewards for successful completion",
                "Receive quality submissions and solutions",
                "Build a portfolio of educational content"
              ].map((item, index) => (
                <li key={index} className="flex items-start">
                  <ArrowRight size={18} className="text-indigo-500 mt-1 mr-2 flex-shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <div className="h-1 w-24 bg-indigo-500 rounded-full mb-6"></div>
            <p className="text-sm text-gray-500 italic">
              "I can create educational tasks and receive quality submissions while 
              rewarding learners for their efforts." 
            </p>
          </div>

          <div 
            ref={rightColRef}
            className="glass rounded-xl p-8 reveal-animation translate-x-[20px]"
          >
            <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center mb-6">
              <span className="font-bold text-blue-500">2</span>
            </div>
            <h3 className="text-2xl font-semibold mb-4">Task Completers</h3>
            <p className="text-gray-600 mb-6">
              For students, lifelong learners, and knowledge seekers who want to:
            </p>
            <ul className="space-y-4 mb-8">
              {[
                "Complete educational tasks and earn EDU tokens",
                "Review others' submissions for additional rewards",
                "Learn new skills and gain knowledge",
                "Build a verifiable portfolio of completed work"
              ].map((item, index) => (
                <li key={index} className="flex items-start">
                  <ArrowRight size={18} className="text-blue-500 mt-1 mr-2 flex-shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <div className="h-1 w-24 bg-blue-500 rounded-full mb-6"></div>
            <p className="text-sm text-gray-500 italic">
              "I can learn new skills, complete interesting educational tasks, 
              and earn tokens for my contributions and reviews."
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default UserJourney;
