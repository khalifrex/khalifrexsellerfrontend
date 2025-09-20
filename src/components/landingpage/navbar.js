'use client';
import React, { useState } from 'react';
import { Menu, X, ShoppingCart, TrendingUp, Shield, Users, ArrowRight, Star } from 'lucide-react';
import Image from 'next/image';

// Navbar Component
export const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Image
              src="https://res.cloudinary.com/khalifrex/image/upload/v1756408090/logowtext_xdnvaw.png"
              alt="Khalifrex" 
              width={160}
              height={32}
              className="h-8 w-auto hidden sm:block"
              priority
            />
            <Image
              src="https://res.cloudinary.com/khalifrex/image/upload/v1756407592/logo_h02gi1.png"
              alt="Khalifrex" 
              width={32}
              height={32}
              className="h-8 w-auto sm:hidden"
              priority
            />
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              <a href="#features" className="text-gray-700 hover:text-[#127ACA] px-3 py-2 text-sm font-medium transition-colors">
                Why Sell
              </a>
              <a href="#pricing" className="text-gray-700 hover:text-[#127ACA] px-3 py-2 text-sm font-medium transition-colors">
                Pricing
              </a>
              <a href="#support" className="text-gray-700 hover:text-[#127ACA] px-3 py-2 text-sm font-medium transition-colors">
                Support
              </a>
              <a href="#resources" className="text-gray-700 hover:text-[#127ACA] px-3 py-2 text-sm font-medium transition-colors">
                Resources
              </a>
            </div>
          </div>

          {/* Desktop CTA Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <a href="/signin" className="text-[#127ACA] hover:text-[#0f6aa3] px-4 py-2 text-sm font-medium transition-colors">
              Sign In
            </a>
            <a href="/signup" className="bg-[#127ACA] text-white px-6 py-2 rounded-md text-sm font-medium hover:bg-[#0f6aa3] transition-colors">
              Sign Up Now
            </a>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 hover:text-[#127ACA] p-2"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-white border-t border-gray-100">
              <a href="#features" className="block px-3 py-2 text-gray-700 hover:text-[#127ACA] text-base font-medium">
                Why Sell
              </a>
              <a href="#pricing" className="block px-3 py-2 text-gray-700 hover:text-[#127ACA] text-base font-medium">
                Pricing
              </a>
              <a href="#support" className="block px-3 py-2 text-gray-700 hover:text-[#127ACA] text-base font-medium">
                Support
              </a>
              <a href="#resources" className="block px-3 py-2 text-gray-700 hover:text-[#127ACA] text-base font-medium">
                Resources
              </a>
              <div className="pt-4 pb-2 border-t border-gray-100">
                <a href="/signin" className="block w-full text-left px-3 py-2 text-[#127ACA] hover:text-[#0f6aa3] text-base font-medium">
                  Sign In
                </a>
                <a href="/become-seller" className="block w-full text-left px-3 py-2 mt-2 bg-[#127ACA] text-white rounded-md text-base font-medium hover:bg-[#0f6aa3] transition-colors">
                  Start Selling
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};