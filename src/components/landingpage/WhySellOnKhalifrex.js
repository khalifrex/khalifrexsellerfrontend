"use client";
import React, { useState } from 'react';
import { Menu, X, ShoppingCart, TrendingUp, Shield, Users } from 'lucide-react';

export const WhySellSection = () => {
  const features = [
    {
      icon: <Users className="w-8 h-8 text-[#127ACA]" />,
      title: "Massive Customer Base",
      description: "Access millions of potential customers across Nigeria looking for your products every day."
    },
    {
      icon: <TrendingUp className="w-8 h-8 text-[#127ACA]" />,
      title: "Boost Your Sales",
      description: "Increase your revenue with our advanced marketing tools and promoted listings features."
    },
    {
      icon: <Shield className="w-8 h-8 text-[#127ACA]" />,
      title: "Secure Payments",
      description: "Get paid safely and on time with our secure payment processing and seller protection."
    },
    {
      icon: <ShoppingCart className="w-8 h-8 text-[#127ACA]" />,
      title: "Easy Store Management",
      description: "Manage your inventory, orders, and customer service all from one powerful dashboard."
    }
  ];

  return (
    <section id="features" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-5xl font-bold text-gray-900 mb-6">
            Why Sell on Khalifrex?
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Join Nigerias most trusted marketplace and take your business to the next level. 
            Everything you need to succeed is right here.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="text-center group hover:transform hover:scale-105 transition-all duration-300">
              <div className="bg-blue-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-[#127ACA] group-hover:text-white transition-all duration-300">
                {React.cloneElement(feature.icon, {
                  className: `w-8 h-8 text-[#127ACA] group-hover:text-white transition-all duration-300`
                })}
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
              <p className="text-gray-600 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>

        <div className="mt-16 bg-gradient-to-r from-[#127ACA] to-blue-600 rounded-2xl p-8 lg:p-12 text-white">
          <div className="grid lg:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-3xl lg:text-4xl font-bold mb-2">2M+</div>
              <div className="text-blue-100">Monthly Visitors</div>
            </div>
            <div>
              <div className="text-3xl lg:text-4xl font-bold mb-2">10K+</div>
              <div className="text-blue-100">Active Sellers</div>
            </div>
            <div>
              <div className="text-3xl lg:text-4xl font-bold mb-2">98%</div>
              <div className="text-blue-100">Seller Satisfaction</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};