"use client";


import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Package, Search, Plus, ArrowRight } from "lucide-react";
import toast from "react-hot-toast";

export default function ProductCreationOptions() {
  const router = useRouter();

  const handleOptionSelect = (option) => {
    if (option === 'existing') {
      router.push('/dashboard/sell-existing');
    } else if (option === 'new') {
      router.push('/dashboard/create-new');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto p-6 mt-10"
    >
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Add Product</h1>
        <p className="text-gray-600">Choose how you want to add your product to Khalifrex</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Sell Existing Product Option */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="bg-white border-2 border-gray-200 rounded-xl p-8 cursor-pointer hover:border-blue-500 hover:shadow-lg transition-all duration-200"
          onClick={() => handleOptionSelect('existing')}
        >
          <div className="text-center">
            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-blue-600" />
            </div>
            
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              Sell Existing Khalifrex Product
            </h3>
            
            <p className="text-gray-600 mb-6 leading-relaxed">
              Search and sell products that are already in the Khalifrex catalog. 
              Perfect for popular items with established listings.
            </p>
            
            <div className="space-y-2 text-sm text-gray-500 mb-6">
              <div className="flex items-center justify-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Faster listing process</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Pre-filled product details</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Set your own price & condition</span>
              </div>
            </div>
            
            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-medium transition-colors flex items-center justify-center gap-2">
              Search Products
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>

        {/* Add New Product Option */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="bg-white border-2 border-gray-200 rounded-xl p-8 cursor-pointer hover:border-green-500 hover:shadow-lg transition-all duration-200"
          onClick={() => handleOptionSelect('new')}
        >
          <div className="text-center">
            <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="w-8 h-8 text-green-600" />
            </div>
            
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              Add New Product Not on Khalifrex
            </h3>
            
            <p className="text-gray-600 mb-6 leading-relaxed">
              Create a completely new product listing. Ideal for unique items, 
              custom products, or items not yet in our catalog.
            </p>
            
            <div className="space-y-2 text-sm text-gray-500 mb-6">
              <div className="flex items-center justify-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>Full product customization</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>Add detailed descriptions</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>Upload product images</span>
              </div>
            </div>
            
            <button className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-lg font-medium transition-colors flex items-center justify-center gap-2">
              Create New Product
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      </div>

      {/* Help Section */}
      <div className="mt-12 bg-gray-50 rounded-xl p-6">
        <div className="flex items-start gap-4">
          <div className="bg-yellow-100 w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0">
            <Package className="w-5 h-5 text-yellow-600" />
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Need help deciding?</h4>
            <p className="text-gray-600 text-sm leading-relaxed">
              <strong>Choose Sell Existing</strong> if youre selling popular electronics, books, or branded items that might already be in our catalog.
              <br />
              <strong>Choose Add New Product</strong> if youre selling handmade items, vintage products, or anything unique that wouldnt be in our existing catalog.
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}