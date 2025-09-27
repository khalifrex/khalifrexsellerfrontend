"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function StoreModal({
  storeForm,
  handleStoreInputChange,
  handleSaveStore,
  setStoreModalOpen,
  sellerInfo,
}) {
  const [isChecking, setIsChecking] = useState(false);
  const [isAvailable, setIsAvailable] = useState(null);
  const [availabilityMessage, setAvailabilityMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [localStoreName, setLocalStoreName] = useState(storeForm.storeName || "");
  const [hasChanged, setHasChanged] = useState(false);
  const [inputError, setInputError] = useState("");
  
  const debounceRef = useRef(null);
  const inputRef = useRef(null);

  // Focus input when modal opens
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
      // Set cursor at end of text
      const len = localStoreName.length;
      inputRef.current.setSelectionRange(len, len);
    }
  }, []);

  // Check store name availability with debouncing
  const checkStoreNameAvailability = async (storeName) => {
    if (!storeName || storeName.length < 3) {
      setIsAvailable(null);
      setAvailabilityMessage("");
      return;
    }

    setIsChecking(true);
    try {
      const response = await fetch("http://localhost:3092/check-store-name", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ storeName }),
      });

      const data = await response.json();

      if (data.success) {
        setIsAvailable(data.available);
        setAvailabilityMessage(data.message);
      } else {
        setIsAvailable(false);
        setAvailabilityMessage(data.message || "Error checking availability");
      }
    } catch (error) {
      console.error("Error checking store name:", error);
      setIsAvailable(false);
      setAvailabilityMessage("Failed to check availability");
    } finally {
      setIsChecking(false);
    }
  };

  // Validate input format
  const validateStoreName = (name) => {
    if (!name || name.trim().length === 0) {
      return "Store name is required";
    }
    if (name.trim().length < 3) {
      return "Store name must be at least 3 characters";
    }
    if (name.trim().length > 50) {
      return "Store name must be less than 50 characters";
    }
    if (!/^[a-zA-Z0-9\s\-_]+$/.test(name)) {
      return "Store name can only contain letters, numbers, spaces, hyphens, and underscores";
    }
    return "";
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setLocalStoreName(value);
    setHasChanged(value.trim() !== storeForm.storeName.trim());
    
    // Validate input format
    const error = validateStoreName(value);
    setInputError(error);

    // Reset availability state
    setIsAvailable(null);
    setAvailabilityMessage("");

    // Clear previous debounce
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // Only check availability if input is valid and different from current
    if (!error && value.trim() !== storeForm.storeName.trim() && value.trim().length >= 3) {
      debounceRef.current = setTimeout(() => {
        checkStoreNameAvailability(value.trim());
      }, 500);
    }
  };

  const handleSave = async () => {
    const trimmedName = localStoreName.trim();
    
    // Final validation
    const error = validateStoreName(trimmedName);
    if (error) {
      setInputError(error);
      return;
    }

    if (!hasChanged) {
      setStoreModalOpen(false);
      return;
    }

    if (isAvailable === false) {
      setInputError("Please choose a different store name");
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch("http://localhost:3092/seller/update-store-name", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ storeName: trimmedName }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || "Failed to update store name");
      }

      // Update the form data
      handleStoreInputChange({
        target: { name: "storeName", value: trimmedName }
      });

      // Close modal and show success
      setStoreModalOpen(false);
      
      // You might want to show a toast notification here
      if (typeof window !== 'undefined' && window.toast) {
        window.toast.success("Store name updated successfully!");
      }

    } catch (error) {
      console.error("Error updating store name:", error);
      setInputError(error.message || "Failed to update store name");
    } finally {
      setIsSaving(false);
    }
  };

  const getInputBorderColor = () => {
    if (inputError) return "border-red-500";
    if (isChecking) return "border-yellow-400";
    if (isAvailable === true) return "border-green-500";
    if (isAvailable === false) return "border-red-500";
    return "border-gray-300 focus:border-blue-500";
  };

  const getStatusIcon = () => {
    if (isChecking) {
      return (
        <div className="animate-spin rounded-full h-4 w-4 border-2 border-yellow-400 border-t-transparent"></div>
      );
    }
    if (isAvailable === true) {
      return (
        <svg className="h-4 w-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
        </svg>
      );
    }
    if (isAvailable === false || inputError) {
      return (
        <svg className="h-4 w-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
        </svg>
      );
    }
    return null;
  };

  const canSave = hasChanged && !inputError && isAvailable === true && !isChecking && !isSaving;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={(e) => e.target === e.currentTarget && setStoreModalOpen(false)}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Edit Store Name</h3>
            <button
              onClick={() => setStoreModalOpen(false)}
              className="text-blue-100 hover:text-white transition-colors"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Store Name
              </label>
              <div className="relative">
                <input
                  ref={inputRef}
                  type="text"
                  value={localStoreName}
                  onChange={handleInputChange}
                  placeholder="Enter your store name"
                  className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-all duration-200 ${getInputBorderColor()}`}
                  maxLength={50}
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  {getStatusIcon()}
                </div>
              </div>
              
              {/* Character counter */}
              <div className="flex justify-between items-center mt-1">
                <div className="text-xs text-gray-500">
                  {localStoreName.length}/50 characters
                </div>
                {hasChanged && (
                  <div className="text-xs text-blue-600 font-medium">
                    • Changes will be saved
                  </div>
                )}
              </div>
            </div>

            {/* Status messages */}
            <AnimatePresence>
              {(inputError || availabilityMessage) && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className={`p-3 rounded-lg text-sm ${
                    inputError
                      ? "bg-red-50 text-red-700 border border-red-200"
                      : isAvailable === true
                      ? "bg-green-50 text-green-700 border border-green-200"
                      : "bg-red-50 text-red-700 border border-red-200"
                  }`}
                >
                  {inputError || availabilityMessage}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Current vs New comparison */}
            {hasChanged && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="bg-gray-50 rounded-lg p-3 border"
              >
                <div className="text-xs font-medium text-gray-600 mb-2">Preview Changes:</div>
                <div className="space-y-1">
                  <div className="text-sm">
                    <span className="text-gray-500">Current:</span>{" "}
                    <span className="line-through text-gray-400">{storeForm.storeName}</span>
                  </div>
                  <div className="text-sm">
                    <span className="text-gray-500">New:</span>{" "}
                    <span className="font-medium text-blue-700">{localStoreName}</span>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex gap-3 mt-8">
            <button
              onClick={() => setStoreModalOpen(false)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              disabled={isSaving}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!canSave}
              className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                canSave
                  ? "bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg"
                  : "bg-gray-100 text-gray-400 cursor-not-allowed"
              }`}
            >
              {isSaving ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                  Saving...
                </div>
              ) : (
                "Save Changes"
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}