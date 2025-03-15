
import React from 'react';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="py-12 px-4 border-t border-gray-100">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          <div className="md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                <span className="text-white font-semibold">EB</span>
              </div>
              <span className="font-semibold text-lg">EduBounty</span>
            </div>
            <p className="text-gray-600 max-w-md">
              A platform for creating and completing educational tasks 
              while earning tokens for your contributions.
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4">Platform</h3>
            <ul className="space-y-3">
              <li><a href="#" className="text-gray-600 hover:text-blue-500 transition-colors">How it Works</a></li>
              <li><a href="#" className="text-gray-600 hover:text-blue-500 transition-colors">For Creators</a></li>
              <li><a href="#" className="text-gray-600 hover:text-blue-500 transition-colors">For Learners</a></li>
              <li><a href="#" className="text-gray-600 hover:text-blue-500 transition-colors">Token System</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4">Company</h3>
            <ul className="space-y-3">
              <li><a href="#" className="text-gray-600 hover:text-blue-500 transition-colors">About Us</a></li>
              <li><a href="#" className="text-gray-600 hover:text-blue-500 transition-colors">Careers</a></li>
              <li><a href="#" className="text-gray-600 hover:text-blue-500 transition-colors">Blog</a></li>
              <li><a href="#" className="text-gray-600 hover:text-blue-500 transition-colors">Contact</a></li>
            </ul>
          </div>
        </div>
        
        <div className="pt-8 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-600 text-sm mb-4 md:mb-0">
            © {currentYear} EduBounty. All rights reserved.
          </p>
          
          <div className="flex space-x-6">
            <a href="#" className="text-gray-600 hover:text-blue-500 transition-colors text-sm">Terms</a>
            <a href="#" className="text-gray-600 hover:text-blue-500 transition-colors text-sm">Privacy</a>
            <a href="#" className="text-gray-600 hover:text-blue-500 transition-colors text-sm">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
