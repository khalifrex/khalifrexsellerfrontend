"use client";
import { ArrowRight } from 'lucide-react';
export const CallToAction = () => {
  return (
    <section className="py-20 bg-gradient-to-r from-gray-900 to-gray-800">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl lg:text-5xl font-bold text-white mb-6">
          Ready to Start Your Success Story?
        </h2>
        <p className="text-xl text-gray-300 mb-8 leading-relaxed">
          Join thousands of successful sellers who have grown their business with Khalifrex. 
          Its free to start and easy to succeed.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
          <a 
            href="/become-seller"
            className="bg-[#127ACA] text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-[#0f6aa3] transition-all transform hover:scale-105 flex items-center gap-2"
          >
            Create Your Store Now
            <ArrowRight size={20} />
          </a>
          <button className="border-2 border-white text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-white hover:text-gray-900 transition-all">
            Talk to Sales
          </button>
        </div>

        <div className="text-sm text-gray-400">
          ✓ No setup fees  ✓ Free account  ✓ Start selling in minutes
        </div>
      </div>
    </section>
  );
};