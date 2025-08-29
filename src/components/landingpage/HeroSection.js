"use client";
import { ArrowRight, Star } from 'lucide-react';

export const HeroSection = () => {
  return (
    <section className="bg-gradient-to-br from-blue-50 to-white py-20 lg:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="text-center lg:text-left">
            <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Grow Your Business on{' '}
              <span className="text-[#127ACA]">Khalifrex</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Join thousands of successful sellers on Nigerias fastest-growing marketplace. 
              Start selling today and reach millions of customers across the country.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <button className="bg-[#127ACA] text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-[#0f6aa3] transition-all transform hover:scale-105 flex items-center justify-center gap-2">
                Start Selling Now
                <ArrowRight size={20} />
              </button>
              <button className="border-2 border-[#127ACA] text-[#127ACA] px-8 py-4 rounded-lg text-lg font-semibold hover:bg-[#127ACA] hover:text-white transition-all">
                Learn More
              </button>
            </div>
            <div className="mt-8 flex items-center justify-center lg:justify-start space-x-6 text-sm text-gray-500">
              <div className="flex items-center space-x-1">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span>4.8/5 Seller Rating</span>
              </div>
              <div>|</div>
              <div>10,000+ Active Sellers</div>
            </div>
          </div>
          
          <div className="relative">
            <div className="bg-white rounded-2xl shadow-2xl p-8 relative z-10">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Seller Dashboard</h3>
                <p className="text-gray-600">Track your success in real-time</p>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg">
                  <span className="text-green-800 font-medium">Total Sales</span>
                  <span className="text-2xl font-bold text-green-600">₦2,450,000</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg">
                  <span className="text-blue-800 font-medium">Orders Today</span>
                  <span className="text-2xl font-bold text-blue-600">47</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-purple-50 rounded-lg">
                  <span className="text-purple-800 font-medium">Active Products</span>
                  <span className="text-2xl font-bold text-purple-600">156</span>
                </div>
              </div>
            </div>
            <div className="absolute -top-4 -right-4 w-72 h-72 bg-[#127ACA] rounded-full opacity-10"></div>
            <div className="absolute -bottom-4 -left-4 w-48 h-48 bg-yellow-400 rounded-full opacity-10"></div>
          </div>
        </div>
      </div>
    </section>
  );
};