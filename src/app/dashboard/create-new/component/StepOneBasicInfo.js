"use client";

import { motion } from "framer-motion";
import { Package, Tag, Hash, FileText, Info } from "lucide-react";

export default function StepOneBasicInfo({ form, formErrors, handleInput }) {
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      {/* Header Section */}
      <motion.div variants={itemVariants} className="text-center border-b border-gray-200 pb-6">
        <div className="flex items-center justify-center mb-4">
          <div className="p-3 bg-blue-100 rounded-full">
            <Package className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Basic Product Information</h2>
        <p className="text-gray-600 max-w-md mx-auto">
          Let&apos;s start with the essential details about your product. These fields help customers find and understand what you&apos;re selling.
        </p>
      </motion.div>

      {/* Info Card */}
      <motion.div 
        variants={itemVariants}
        className="bg-blue-50 border border-blue-200 rounded-xl p-4"
      >
        <div className="flex items-start space-x-3">
          <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm">
            <p className="text-blue-800 font-medium mb-1">Required Information</p>
            <p className="text-blue-700">
              All fields marked with <span className="text-red-500 font-semibold">*</span> are required to create your product listing.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Form Fields */}
      <motion.div variants={itemVariants} className="grid gap-6">
        
        {/* Product Name */}
        <div className="space-y-2">
          <label className="flex items-center text-sm font-semibold text-gray-800 mb-2">
            <Package className="w-4 h-4 mr-2 text-gray-600" />
            Product Name <span className="text-red-500 ml-1">*</span>
          </label>
          <div className="relative">
            <input
              type="text"
              value={form.itemName || ""}
              onChange={(e) => handleInput("itemName", e.target.value)}
              className={`w-full border-2 transition-all duration-200 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-500 focus:outline-none ${
                formErrors.itemName 
                  ? "border-red-300 bg-red-50 focus:border-red-500 focus:ring-4 focus:ring-red-100" 
                  : "border-gray-200 bg-white hover:border-gray-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              }`}
              placeholder="e.g., Apple iPhone 15 Pro Max 256GB Silver"
            />
            {formErrors.itemName && (
              <motion.p 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-red-600 text-sm mt-2 flex items-center"
              >
                <span className="w-1 h-1 bg-red-500 rounded-full mr-2"></span>
                {formErrors.itemName}
              </motion.p>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Choose a clear, descriptive name that customers will easily recognize
          </p>
        </div>

        {/* Brand and Model Name Row */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Brand */}
          <div className="space-y-2">
            <label className="flex items-center text-sm font-semibold text-gray-800 mb-2">
              <Tag className="w-4 h-4 mr-2 text-gray-600" />
              Brand <span className="text-red-500 ml-1">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={form.brand || ""}
                onChange={(e) => handleInput("brand", e.target.value)}
                className={`w-full border-2 transition-all duration-200 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-500 focus:outline-none ${
                  formErrors.brand 
                    ? "border-red-300 bg-red-50 focus:border-red-500 focus:ring-4 focus:ring-red-100" 
                    : "border-gray-200 bg-white hover:border-gray-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                }`}
                placeholder="e.g., Apple"
              />
              {formErrors.brand && (
                <motion.p 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-600 text-sm mt-2 flex items-center"
                >
                  <span className="w-1 h-1 bg-red-500 rounded-full mr-2"></span>
                  {formErrors.brand}
                </motion.p>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              The manufacturer or brand name
            </p>
          </div>

          {/* Model Name */}
          <div className="space-y-2">
            <label className="flex items-center text-sm font-semibold text-gray-800 mb-2">
              <Hash className="w-4 h-4 mr-2 text-gray-600" />
              Model Name <span className="text-red-500 ml-1">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={form.modelName || ""}
                onChange={(e) => handleInput("modelName", e.target.value)}
                className={`w-full border-2 transition-all duration-200 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-500 focus:outline-none ${
                  formErrors.modelName 
                    ? "border-red-300 bg-red-50 focus:border-red-500 focus:ring-4 focus:ring-red-100" 
                    : "border-gray-200 bg-white hover:border-gray-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                }`}
                placeholder="e.g., iPhone 15 Pro Max"
              />
              {formErrors.modelName && (
                <motion.p 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-600 text-sm mt-2 flex items-center"
                >
                  <span className="w-1 h-1 bg-red-500 rounded-full mr-2"></span>
                  {formErrors.modelName}
                </motion.p>
              )}
            </div>
          </div>
        </div>

        {/* Model Number */}
        <div className="space-y-2">
          <label className="flex items-center text-sm font-semibold text-gray-800 mb-2">
            <Hash className="w-4 h-4 mr-2 text-gray-600" />
            Model Number <span className="text-red-500 ml-1">*</span>
          </label>
          <div className="relative">
            <input
              type="text"
              value={form.modelNumber || ""}
              onChange={(e) => handleInput("modelNumber", e.target.value)}
              className={`w-full border-2 transition-all duration-200 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-500 focus:outline-none ${
                formErrors.modelNumber 
                  ? "border-red-300 bg-red-50 focus:border-red-500 focus:ring-4 focus:ring-red-100" 
                  : "border-gray-200 bg-white hover:border-gray-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              }`}
              placeholder="e.g., A2848"
            />
            {formErrors.modelNumber && (
              <motion.p 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-red-600 text-sm mt-2 flex items-center"
              >
                <span className="w-1 h-1 bg-red-500 rounded-full mr-2"></span>
                {formErrors.modelNumber}
              </motion.p>
            )}
          </div>

        </div>

        {/* Description */}
        <div className="space-y-2">
          <label className="flex items-center text-sm font-semibold text-gray-800 mb-2">
            <FileText className="w-4 h-4 mr-2 text-gray-600" />
            Product Description <span className="text-red-500 ml-1">*</span>
          </label>
          <div className="relative">
            <textarea
              value={form.description || ""}
              onChange={(e) => handleInput("description", e.target.value)}
              className={`w-full border-2 transition-all duration-200 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-500 focus:outline-none resize-none ${
                formErrors.description 
                  ? "border-red-300 bg-red-50 focus:border-red-500 focus:ring-4 focus:ring-red-100" 
                  : "border-gray-200 bg-white hover:border-gray-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              }`}
              placeholder="Describe your product in detail. Include key features, specifications, condition, and what makes it special..."
              rows="5"
            />
            <div className="absolute bottom-3 right-3 text-xs text-gray-400">
              {form.description?.length || 0} characters
            </div>
            {formErrors.description && (
              <motion.p 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-red-600 text-sm mt-2 flex items-center"
              >
                <span className="w-1 h-1 bg-red-500 rounded-full mr-2"></span>
                {formErrors.description}
              </motion.p>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Write a comprehensive description to help customers understand your product
          </p>
        </div>
      </motion.div>

      {/* Progress Indicator */}
      <motion.div 
        variants={itemVariants}
        className="bg-gray-50 rounded-lg p-4 border border-gray-200"
      >
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-gray-700">Step 1 of 3</span>
          <span className="text-gray-500">Basic Information</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
          <div className="bg-blue-600 h-2 rounded-full" style={{ width: '33.33%' }}></div>
        </div>
      </motion.div>
    </motion.div>
  );
}