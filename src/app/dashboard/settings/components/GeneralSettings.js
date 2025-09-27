"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

export default function GeneralSettings({
  generalOpen,
  setGeneralOpen,
  setStoreModalOpen,
  storeForm,
}) {
  const [showSuccess, setShowSuccess] = useState(false);

  // Listen for store name updates (you can trigger this from the modal)
  useEffect(() => {
    const handleStoreNameUpdated = () => {
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    };

    // Listen for custom event from modal
    window.addEventListener('storeNameUpdated', handleStoreNameUpdated);
    
    return () => {
      window.removeEventListener('storeNameUpdated', handleStoreNameUpdated);
    };
  }, []);

  return (
    <section className="bg-white shadow-lg rounded-xl border border-gray-100 relative overflow-hidden">
      {/* Success notification */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10"
          >
            <div className="bg-green-500 text-white px-4 py-2 rounded-full shadow-lg flex items-center space-x-2">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
              <span className="text-sm font-medium">Store name updated successfully!</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="p-6 border-b border-gray-100">
        <button
          onClick={() => setGeneralOpen(!generalOpen)}
          className="flex justify-between items-center w-full text-left group"
        >
          <div className="flex items-center space-x-3">
            <div className="bg-blue-100 p-2 rounded-lg">
              <svg className="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-800">General Settings</h2>
              <p className="text-sm text-gray-500">Manage your store information</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <motion.div
              animate={{ rotate: generalOpen ? 180 : 0 }}
              transition={{ duration: 0.2 }}
              className="bg-gray-100 group-hover:bg-gray-200 p-2 rounded-lg transition-colors"
            >
              <svg className="h-5 w-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
              </svg>
            </motion.div>
          </div>
        </button>
      </div>

      {/* Collapsible Content */}
      <AnimatePresence>
        {generalOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="p-6">
              {/* Store Name Card */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-100 rounded-xl p-6 hover:shadow-md transition-all duration-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="bg-blue-500 p-3 rounded-xl">
                      <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800 text-lg">Store Name</h3>
                      <p className="text-gray-600 text-sm mb-1">Your unique store identifier</p>
                      <div className="flex items-center space-x-2">
                        <span className="text-blue-700 font-medium text-lg">
                          {storeForm.storeName || "Not set"}
                        </span>
                        {storeForm.storeName && (
                          <div className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium">
                            Active
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setStoreModalOpen(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium shadow-md hover:shadow-lg transition-all duration-200 flex items-center space-x-2"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                    </svg>
                    <span>Edit</span>
                  </motion.button>
                </div>
                
                {/* Store name guidelines */}
                <div className="mt-4 bg-white bg-opacity-60 rounded-lg p-4 border border-blue-200">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Store Name Guidelines:</h4>
                  <ul className="text-xs text-gray-600 space-y-1">
                    <li className="flex items-center space-x-2">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                      <span>3-50 characters long</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                      <span>Letters, numbers, spaces, hyphens, and underscores only</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                      <span>Must be unique across all stores</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Additional info section */}
              <div className="mt-6 bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="flex items-start space-x-3">
                  <svg className="h-5 w-5 text-gray-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Important Note</p>
                    <p className="text-xs text-gray-600 mt-1">
                      Your store name will be visible to customers and used in your store URL. 
                      Choose something memorable and professional that represents your brand.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}