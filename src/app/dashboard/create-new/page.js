"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";
import ProductCard from "@/components/productComponents/ProductCard";
import StepOneBasicInfo from "./component/StepOneBasicInfo";
import StepTwoDetails from "./component/StepTwoDetails";
import StepThreeOffers from "./component/StepThreeOffers";
import { useProductFormSteps } from "@/hooks/useProductFormSteps";

export default function CreateProduct() {
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [lastSavedAt, setLastSavedAt] = useState(null);
  const [hasMounted, setHasMounted] = useState(false);

  const {
    form,
    formErrors,
    step,
    completedStep,
    images,
    setFormErrors,
    setForm,
    setImages,
    imagePreviews,
    setImagePreviews,
    handleInput,
    handleRemoveImage,
    handleSubmit,
    hasVariants,
    setHasVariants,
    variantData,
    setVariantData,
    offerData,
    setOfferData,
    nextStep,
    prevStep,
    handleStepClick,
    submitting,
    uploadProgress,
  } = useProductFormSteps();

  const router = useRouter();

  useEffect(() => {
    setHasMounted(true);
  }, []);

  const previewProduct = hasMounted
    ? {
        _id: "preview",
        name: form.itemName || "Product Name",
        description: form.description || "Product description...",
        price: offerData[0]?.price || "0.00",
        rating: 4,
        image: imagePreviews[0] || "/placeholder.png",
      }
    : null;

  useEffect(() => {
    const saved = localStorage.getItem("productDraftSavedAt");
    if (saved) {
      setLastSavedAt(new Date(parseInt(saved)));
    }
  }, []);

  // Get selected category data
  const selectedCategory = categories.find(cat => cat._id === form.category);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("http://localhost:3092/buyer/categories");
        const data = await res.json();
        setCategories(data);
      } catch {
        toast.error("Failed to load categories.");
      } finally {
        setLoadingCategories(false);
      }
    };
    
    fetchCategories();
    
    // Load draft
    const draft = localStorage.getItem("productDraft");
    if (draft) {
      const parsed = JSON.parse(draft);
      setForm(parsed.form || {});
      setHasVariants(parsed.hasVariants || false);
      setVariantData(parsed.variantData || []);
      setOfferData(parsed.offerData || []);
      toast("Draft loaded.");
    }
  }, [setForm]);

  // Auto-save draft
  useEffect(() => {
    const interval = setInterval(() => {
      localStorage.setItem("productDraft", JSON.stringify({ 
        form, 
        hasVariants, 
        variantData, 
        offerData 
      }));
      localStorage.setItem("productDraftSavedAt", Date.now());
    }, 10000);
    return () => clearInterval(interval);
  }, [form, hasVariants, variantData, offerData]);

  const dropzoneConfig = {
    accept: { "image/*": [] },
    maxFiles: 5,
    onDrop: (acceptedFiles) => {
      setImages(acceptedFiles);
      setImagePreviews(acceptedFiles.map((f) => URL.createObjectURL(f)));
      setFormErrors((prev) => ({ ...prev, images: null }));
    },
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone(dropzoneConfig);

  const stepTitles = {
    1: "Basic Information",
    2: "Product Details",
    3: "Offers & Images"
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto p-6 mt-10"
    >
      {/* Header with back button */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => router.push('/dashboard/seller/inventory')}
          className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Add New Product</h1>
          <p className="text-gray-600">Create a new product listing for Khalifrex</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex flex-col items-center flex-1">
              <button
                type="button"
                onClick={() => handleStepClick(s)}
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium border transition-all ${
                  s === step
                    ? "bg-blue-600 text-white border-blue-600"
                    : s <= completedStep
                    ? "bg-blue-100 text-blue-800 border-blue-300 hover:bg-blue-200"
                    : "bg-gray-100 text-gray-600 border-gray-300 cursor-not-allowed"
                }`}
                aria-label={`Go to step ${s}`}
                disabled={s > completedStep + 1}
              >
                {s}
              </button>
              <span className="text-xs text-gray-600 mt-2 text-center">
                {stepTitles[s]}
              </span>
            </div>
          ))}
        </div>
        
        {/* Progress line */}
        <div className="relative">
          <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-200 -translate-y-1/2"></div>
          <div 
            className="absolute top-1/2 left-0 h-0.5 bg-blue-600 -translate-y-1/2 transition-all duration-300"
            style={{ width: `${((Math.min(step, 3) - 1) / 2) * 100}%` }}
          ></div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          className="space-y-6"
        >
          {step === 1 && (
            <StepOneBasicInfo 
              form={form} 
              formErrors={formErrors} 
              handleInput={handleInput} 
            />
          )}

          {step === 2 && (
            <StepTwoDetails
              form={form}
              formErrors={formErrors}
              handleInput={handleInput}
              hasMounted={hasMounted}
              loadingCategories={loadingCategories}
              categories={categories}
              selectedCategory={selectedCategory}
              hasVariants={hasVariants}
              setHasVariants={setHasVariants}
              variantData={variantData}
              setVariantData={setVariantData}
            />
          )}

          {step === 3 && (
            <StepThreeOffers
              form={form}
              formErrors={formErrors}
              handleInput={handleInput}
              getRootProps={getRootProps}
              getInputProps={getInputProps}
              isDragActive={isDragActive}
              hasMounted={hasMounted}
              imagePreviews={imagePreviews}
              handleRemoveImage={handleRemoveImage}
              hasVariants={hasVariants}
              variantData={variantData}
              offerData={offerData}
              setOfferData={setOfferData}
            />
          )}
        </motion.div>
      </AnimatePresence>

      {/* Live Preview */}
      <div className="mt-10 border-t pt-6">
        <h2 className="text-xl font-semibold mb-4">Live Preview</h2>
        <div className="flex justify-center">
         
            {previewProduct && (
              <ProductCard product={previewProduct} />
            )}
            {imagePreviews.length === 0 && (
              <p className="text-xs text-gray-500 mt-2 text-center p-4">
                Using placeholder image until you add photos.
              </p>
            )}
         
        </div>
      </div>

      {/* Auto-save indicator */}
      {hasMounted && lastSavedAt && (
        <p className="text-xs text-gray-500 mt-2 text-center">
          Last auto-saved at {lastSavedAt.toLocaleTimeString()}
        </p>
      )}

      {/* Navigation buttons */}
      <div className="mt-6 flex justify-between">
        {step > 1 && (
          <button 
            onClick={prevStep} 
            className="bg-gray-200 hover:bg-gray-300 px-6 py-2 rounded-lg transition-colors"
          >
            Back
          </button>
        )}
        
        {step < 3 ? (
          <button 
            onClick={nextStep} 
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg ml-auto transition-colors"
          >
            Next
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white px-8 py-3 rounded-lg flex justify-center items-center gap-2 text-lg font-medium transition-colors ml-auto"
          >
            {submitting ? (
              <>
                <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                Creating Product...
              </>
            ) : (
              "Create Product"
            )}
          </button>
        )}
      </div>

      {/* Progress Bar during submission */}
      {submitting && (
        <div className="mt-4">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Creating your product...</span>
            <span>{uploadProgress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div 
              className="bg-green-600 h-3 transition-all duration-300 ease-out" 
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Important Notes */}
      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h4 className="font-medium text-yellow-800 mb-2">Important:</h4>
        <ul className="text-sm text-yellow-700 space-y-1">
          <li>• All required fields must be completed before submission</li>
          <li>• {hasVariants ? 'Each variant needs' : 'Your product needs'} at least one offer with valid pricing</li>
          <li>• Product images help customers make purchasing decisions</li>
          <li>• Your draft is automatically saved every 10 seconds</li>
        </ul>
      </div>
    </motion.div>
  );
}