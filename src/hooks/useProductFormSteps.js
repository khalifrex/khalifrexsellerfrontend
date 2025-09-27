'use client';
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";

// GTIN validation utilities
const validateGTIN = (gtin, type) => {
  if (!gtin || !type) return false;
  
  const cleanGtin = gtin.replace(/\D/g, '');
  
  if (type === 'UPC' && cleanGtin.length !== 12) return false;
  if (type === 'EAN' && cleanGtin.length !== 13) return false;
  
  return true;
};

const generateUniqueSku = (brand, modelNumber, variantName = null, index = null) => {
  const timestamp = Date.now().toString().slice(-6);
  const randomStr = Math.random().toString(36).substring(2, 5).toUpperCase();
  
  let baseSku = '';
  if (brand && modelNumber) {
    baseSku = `${brand}-${modelNumber}`.toUpperCase().replace(/[^A-Z0-9]/g, '-');
  } else {
    baseSku = 'PRODUCT';
  }
  
  if (variantName) {
    baseSku += `-${variantName.toUpperCase().replace(/[^A-Z0-9]/g, '-')}`;
  }
  
  if (index !== null) {
    baseSku += `-${index + 1}`;
  }
  
  return `${baseSku}-${timestamp}-${randomStr}`;
};

export function useProductFormSteps() {
  // Form state matching backend createProduct fields
  const [form, setForm] = useState({
    // Product fields (backend createProduct)
    itemName: "",
    brand: "",
    modelName: "", 
    modelNumber: "",
    category: "",
    variationTheme: [],
    description: "",
    attributes: {} // Additional attributes map
  });

  const [formErrors, setFormErrors] = useState({});
  const [hasVariants, setHasVariants] = useState(false);
  
  // Variant data for products with variations (backend createProduct variant fields)
  const [variantData, setVariantData] = useState([]);
  
  // Offer data for createOffer endpoint
  const [offerData, setOfferData] = useState([]);

  const [step, setStep] = useState(1);
  const [completedStep, setCompletedStep] = useState(1);
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const [createdProductId, setCreatedProductId] = useState(null);
  const [createdVariantIds, setCreatedVariantIds] = useState([]);

  const router = useRouter();

  const validateStep = (showToasts = false) => {
    const errors = {};
    const errorMessages = [];
    
    if (step === 1) {
      // Step 1 validation - Basic Info (backend required fields)
      if (!form.itemName?.trim()) {
        errors.itemName = "Item name is required.";
        errorMessages.push("Please enter an item name");
      }
      
      if (!form.brand?.trim()) {
        errors.brand = "Brand is required.";
        errorMessages.push("Please enter the brand name");
      }
      
      if (!form.modelName?.trim()) {
        errors.modelName = "Model name is required.";
        errorMessages.push("Please enter the model name");
      }
      
      if (!form.modelNumber?.trim()) {
        errors.modelNumber = "Model number is required.";
        errorMessages.push("Please enter the model number");
      }
      
      if (!form.description?.trim()) {
        errors.description = "Description is required.";
        errorMessages.push("Please add a product description");
      } else if (form.description.trim().length < 10) {
        errors.description = "Description must be at least 10 characters.";
        errorMessages.push("Please provide a more detailed description (at least 10 characters)");
      }
    }
    
    if (step === 2) {
      // Step 2 validation - Category and Variants
      if (!form.category?.trim()) {
        errors.category = "Category selection is required.";
        errorMessages.push("Please select a product category");
      }
      
      if (hasVariants) {
        if (!form.variationTheme || form.variationTheme.length === 0) {
          errors.variationTheme = "Variation theme is required for products with variants.";
          errorMessages.push("Please select at least one variation theme for your variants");
        }
        
        if (variantData.length === 0) {
          errors.variants = "Please create at least one variant combination.";
          errorMessages.push("You need to create at least one product variant");
        } else {
          // Validate variants with backend-required fields
          variantData.forEach((variant, index) => {
            const variantLabel = `Variant ${index + 1}${variant.name ? ` (${variant.name})` : ''}`;
            
            if (!variant.sku?.trim()) {
              errors[`combo_${index}_sku`] = "SKU is required.";
              errorMessages.push(`${variantLabel}: SKU is required`);
            }
            
            // GTIN validation (required in backend)
            if (!variant.gtinType) {
              errors[`combo_${index}_gtinType`] = "GTIN type is required.";
              errorMessages.push(`${variantLabel}: Please select GTIN type (UPC or EAN)`);
            }
            
            if (!variant.gtin?.trim()) {
              errors[`combo_${index}_gtin`] = "GTIN is required.";
              errorMessages.push(`${variantLabel}: GTIN is required`);
            } else if (!validateGTIN(variant.gtin, variant.gtinType)) {
              errors[`combo_${index}_gtin`] = "Invalid GTIN format.";
              errorMessages.push(`${variantLabel}: Invalid ${variant.gtinType} format`);
            }
          });
        }
      }
    }
    
    if (step === 3) {
      // Step 3 validation - Images and Offers
      if (images.length === 0) {
        errors.images = "At least one product image is required.";
        errorMessages.push("Please add at least one product image");
      }
      
      // Validate offers based on backend createOffer requirements
      if (hasVariants) {
        // For variants, offers are created based on variant data
        variantData.forEach((variant, index) => {
          const variantLabel = `Variant ${index + 1}`;
          
          if (!variant.price || parseFloat(variant.price) <= 0) {
            errors[`variant_${index}_price`] = "Valid price is required.";
            errorMessages.push(`${variantLabel}: Please enter a valid price greater than 0`);
          }
          
          if (variant.stock === undefined || variant.stock === null || parseInt(variant.stock) < 0) {
            errors[`variant_${index}_stock`] = "Valid stock quantity is required.";
            errorMessages.push(`${variantLabel}: Please enter a valid stock quantity (0 or more)`);
          }
        });
      } else {
        // For standalone products, validate single offer
        if (offerData.length === 0) {
          errors.offers = "Please create at least one offer.";
          errorMessages.push("You need to create at least one product offer");
        } else {
          offerData.forEach((offer, index) => {
            const offerLabel = `Offer ${index + 1}`;
            
            if (!offer.price || parseFloat(offer.price) <= 0) {
              errors[`offer_${index}_price`] = "Valid price is required.";
              errorMessages.push(`${offerLabel}: Please enter a valid price greater than 0`);
            }
            
            if (offer.stock === undefined || offer.stock === null || parseInt(offer.stock) < 0) {
              errors[`offer_${index}_stock`] = "Valid stock quantity is required.";
              errorMessages.push(`${offerLabel}: Please enter a valid stock quantity (0 or more)`);
            }
          });
        }
      }
    }
    
    setFormErrors(errors);
    
    // Show toast messages for validation errors
    if (showToasts && errorMessages.length > 0) {
      toast.error(`Please fix ${errorMessages.length} issue${errorMessages.length > 1 ? 's' : ''} to continue`, {
        duration: 4000,
      });
      
      errorMessages.slice(0, 5).forEach((message, index) => {
        setTimeout(() => {
          toast.error(message, { duration: 3000 });
        }, (index + 1) * 300);
      });
      
      if (errorMessages.length > 5) {
        setTimeout(() => {
          toast.error(`...and ${errorMessages.length - 5} more issues. Please check all fields.`, {
            duration: 4000,
          });
        }, 6 * 300);
      }
    }
    
    return Object.keys(errors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(true)) {
      setStep((s) => {
        const next = s + 1;
        setCompletedStep((prev) => Math.max(prev, next));
        return next;
      });
      setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 100);
      toast.success(`Step ${step} completed!`, { duration: 2000 });
    }
  };

  const prevStep = () => {
    setStep((s) => s - 1);
    setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 100);
  };

  const handleStepClick = (targetStep) => {
    if (targetStep === step) return;
    if (targetStep < step) {
      setStep(targetStep);
      toast.success(`Navigated to Step ${targetStep}`, { duration: 1500 });
    } else if (targetStep === step + 1) {
      if (validateStep(true)) {
        setStep(targetStep);
        setCompletedStep((prev) => Math.max(prev, targetStep));
        toast.success(`Advanced to Step ${targetStep}`, { duration: 2000 });
      }
    } else {
      toast.error("Please complete the current step before jumping ahead.", {
        duration: 3000,
      });
    }
  };

  const handleInput = (field, value) => {
    if (field === 'variationTheme') {
      setForm((prev) => ({ ...prev, [field]: value }));
    } else if (field === 'attributes') {
      setForm((prev) => ({ ...prev, attributes: { ...prev.attributes, ...value } }));
    } else {
      setForm((prev) => ({ ...prev, [field]: value }));
    }
    
    // Clear field error when user starts typing
    if (formErrors[field]) {
      setFormErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const handleRemoveImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
    toast.success("Image removed", { duration: 1500 });
  };

  // Create product with multiple variants using the single /products endpoint
  const createProduct = async () => {
    const formData = new FormData();
    
    // Add product creation fields (matching backend createProduct)
    Object.entries(form).forEach(([key, value]) => {
      if (key === 'variationTheme' && Array.isArray(value)) {
        // Don't add variationTheme as JSON - handle separately below
        return;
      } else if (key === 'attributes' && typeof value === 'object') {
        formData.append(key, JSON.stringify(value));
      } else if (value !== '' && value !== null && value !== undefined) {
        formData.append(key, value);
      }
    });

    // Add each variation theme as separate form field
    if (form.variationTheme && Array.isArray(form.variationTheme)) {
      form.variationTheme.forEach(theme => {
        formData.append('variationTheme', theme);
      });
    }

    // NEW: Prepare variants array for backend
    let variantsToSend = [];

    if (hasVariants && variantData.length > 0) {
      // For products with variations, send all variants
      variantsToSend = variantData.map((variant, index) => ({
        name: variant.name || `${form.itemName} - Variant ${index + 1}`,
        variantAttributes: variant.variantAttributes || {},
        sku: variant.sku || generateUniqueSku(form.brand, form.modelNumber, variant.name, index),
        gtinType: variant.gtinType || 'UPC',
        gtin: variant.gtin || '000000000000',
        weight: variant.weight,
        dimensions: variant.dimensions
      }));
    } else {
      // For standalone products, create single variant
      variantsToSend = [{
        name: form.itemName,
        variantAttributes: {},
        sku: generateUniqueSku(form.brand, form.modelNumber),
        gtinType: 'UPC',
        gtin: '000000000000'
      }];
    }

    // Add variants array as JSON string
    formData.append('variants', JSON.stringify(variantsToSend));

    // Add images
    images.forEach((img) => formData.append("images", img));

    const response = await fetch("http://localhost:3092/products", {
      method: "POST",
      credentials: "include",
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      
      if (response.status === 409) {
        const errorMessage = errorData.error || 'Product already exists';
        if (errorData.existingVariants) {
          toast.error(`${errorMessage}. Found conflicts: ${errorData.existingVariants.length} variant(s)`);
        } else {
          toast.error(`${errorMessage}. ${errorData.message || ''}`);
        }
        throw new Error(errorData.error);
      }
      
      if (response.status === 400 && errorData.validationErrors) {
        const validationMsg = `Validation failed: ${errorData.validationErrors.slice(0, 3).join(', ')}`;
        toast.error(validationMsg);
        throw new Error(errorData.error);
      }
      
      throw new Error(errorData.error || 'Failed to create product');
    }

    const result = await response.json();
    return result;
  };

  // Create offers for ALL created variants
  const createOffersForAllVariants = async (productResult) => {
    const offers = [];
    const variants = productResult.variants || []; // Now we get an array of variants

    if (!variants || variants.length === 0) {
      throw new Error('No variants returned from product creation');
    }

    // Store all created variant IDs
    const allVariantIds = variants.map(v => v._id);
    setCreatedVariantIds(prev => [...prev, ...allVariantIds]);

    if (hasVariants) {
      // For products with variations, create offers for each variant based on pricing data
      for (let i = 0; i < variants.length && i < variantData.length; i++) {
        const variant = variants[i];
        const variantPricing = variantData[i];
        
        if (!variantPricing || !variantPricing.price || variantPricing.stock === undefined) {
          toast.warning(`Skipping offer creation for variant ${i + 1}: Missing price or stock data`, { duration: 2000 });
          continue;
        }
        
        const offerPayload = {
          price: parseFloat(variantPricing.price),
          stock: parseInt(variantPricing.stock),
          condition: variantPricing.condition || 'new',
          sellerSku: variantPricing.sku || variant.sku,
          useDefaultZones: true,
          shippingZoneIds: [],
          pickup: {
            available: false,
            address: {},
            instructions: '',
            hours: {}
          }
        };

        try {
          const response = await fetch(`http://localhost:3092/variants/${variant._id}/offers`, {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(offerPayload),
          });

          if (!response.ok) {
            const errorData = await response.json();
            
            if (response.status === 409) {
              toast.warning(`Offer already exists for variant: ${variant.name}`, { duration: 2000 });
              continue; // Skip this offer but continue with others
            }
            
            throw new Error(errorData.error || `Failed to create offer for variant: ${variant.name}`);
          }

          const result = await response.json();
          offers.push(result.offer);
          
          toast.success(`Offer created for: ${variant.name}`, { duration: 1500 });
          
        } catch (error) {
          console.error(`Error creating offer for variant ${variant.name}:`, error);
          toast.error(`Failed to create offer for ${variant.name}: ${error.message}`, { duration: 2000 });
          // Continue with other offers instead of failing completely
        }
      }

    } else {
      // For standalone products, create offers based on Step 3 offer data
      const variant = variants[0]; // Should only be one variant for standalone
      
      for (const [index, offer] of offerData.entries()) {
        const offerPayload = {
          price: parseFloat(offer.price),
          stock: parseInt(offer.stock),
          condition: offer.condition || 'new',
          sellerSku: offer.sellerSku || variant.sku,
          useDefaultZones: offer.useDefaultZones || true,
          shippingZoneIds: offer.shippingZoneIds || [],
          pickup: offer.pickup || {
            available: false,
            address: {},
            instructions: '',
            hours: {}
          }
        };

        try {
          const response = await fetch(`http://localhost:3092/variants/${variant._id}/offers`, {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(offerPayload),
          });

          if (!response.ok) {
            const errorData = await response.json();
            
            if (response.status === 409) {
              toast.warning(`Offer ${index + 1} already exists for this variant`, { duration: 2000 });
              continue;
            }
            
            throw new Error(errorData.error || `Failed to create offer ${index + 1}`);
          }

          const result = await response.json();
          offers.push(result.offer);
          
        } catch (error) {
          console.error(`Error creating offer ${index + 1}:`, error);
          toast.error(`Failed to create offer ${index + 1}: ${error.message}`, { duration: 2000 });
          // Continue with other offers
        }
      }
    }

    return offers;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep(true)) {
      return;
    }

    setSubmitting(true);
    setUploadProgress(0);

    try {
      setUploadProgress(20);
      toast.loading("Creating product and all variants...", { id: 'product-creation' });
      
      // Create product with all variants in one API call
      const productResult = await createProduct();
      
      // Store the created product ID
      if (productResult.product) {
        setCreatedProductId(productResult.product._id);
      }
      
      const isNewProduct = productResult.isNewProduct;
      const variants = productResult.variants || [];
      const summary = productResult.summary || {};
      
      // Show appropriate success message based on what was created
      const variantsCreated = summary.variantsCreated || variants.length;
      const variantsFailed = summary.variantsFailed || 0;
      
      if (isNewProduct) {
        toast.success(`New product created with ${variantsCreated} variant${variantsCreated !== 1 ? 's' : ''}!`, { id: 'product-creation' });
      } else {
        toast.success(`${variantsCreated} variant${variantsCreated !== 1 ? 's' : ''} added to existing product!`, { id: 'product-creation' });
      }

      // Show warning if some variants failed
      if (variantsFailed > 0) {
        toast.warning(`Note: ${variantsFailed} variant${variantsFailed !== 1 ? 's' : ''} failed to create. Check for duplicate SKUs/GTINs.`, {
          duration: 4000
        });
      }

      // Show variant creation errors if any
      if (productResult.variantErrors && productResult.variantErrors.length > 0) {
        setTimeout(() => {
          productResult.variantErrors.forEach(err => {
            toast.error(`Variant ${err.variant}: ${err.error}`, { duration: 3000 });
          });
        }, 1000);
      }

      setUploadProgress(70);
      toast.loading(`Creating offers for ${variants.length} variant${variants.length !== 1 ? 's' : ''}...`, { id: 'offer-creation' });
      
      // Create offers for all successfully created variants
      const offers = await createOffersForAllVariants(productResult);
      
      const offersCount = offers.length;
      if (offersCount > 0) {
        toast.success(`${offersCount} offer${offersCount !== 1 ? 's' : ''} created successfully!`, { 
          id: 'offer-creation' 
        });
      } else {
        toast.warning("No offers were created. Please check pricing data for your variants.", { 
          id: 'offer-creation' 
        });
      }

      setUploadProgress(100);
      
      // Final success message with complete summary
      const finalMessage = isNewProduct 
        ? `Product listing completed! Created new product with ${variantsCreated} variant${variantsCreated !== 1 ? 's' : ''} and ${offersCount} offer${offersCount !== 1 ? 's' : ''}. Redirecting...`
        : `Variants added successfully! Created ${variantsCreated} variant${variantsCreated !== 1 ? 's' : ''} with ${offersCount} offer${offersCount !== 1 ? 's' : ''}. Redirecting...`;
        
      toast.success(finalMessage, {
        duration: 4000,
      });
      
      // Show detailed summary
      setTimeout(() => {
        const productCount = isNewProduct ? 1 : 0;
        toast.success(`Summary: ${productCount} Product${productCount !== 1 ? 's' : ''} + ${variantsCreated} Variant${variantsCreated !== 1 ? 's' : ''} + ${offersCount} Offer${offersCount !== 1 ? 's' : ''} = Complete!`, {
          duration: 3000,
        });
      }, 500);
      
      // Clear saved draft
      localStorage.removeItem("productDraft");
      localStorage.removeItem("productDraftSavedAt");
      
      setTimeout(() => {
        router.push("/dashboard/inventory");
      }, 2500);

    } catch (error) {
      console.error('Submit Error:', error);
      toast.error(`Error: ${error.message}`, { duration: 5000 });
      setUploadProgress(0);
    } finally {
      setSubmitting(false);
    }
  };

  return {
    form,
    setForm,
    formErrors,
    setFormErrors,
    step,
    setStep,
    completedStep,
    setCompletedStep,
    images,
    setImages,
    imagePreviews,
    setImagePreviews,
    handleRemoveImage,
    hasVariants,
    setHasVariants,
    variantData,
    setVariantData,
    offerData,
    setOfferData,
    submitting,
    setSubmitting,
    uploadProgress,
    setUploadProgress,
    handleSubmit,
    nextStep,
    prevStep,
    handleStepClick,
    validateStep,
    handleInput,
    createdProductId,
    createdVariantIds,
    // Utility functions for components
    validateGTIN,
    generateUniqueSku
  };
}