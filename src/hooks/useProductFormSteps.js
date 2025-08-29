'use client';
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";

const generateUniqueSku = (brand, modelNumber, variantName = null, index = null) => {
  const timestamp = Date.now().toString().slice(-6); // Last 6 digits of timestamp
  const randomStr = Math.random().toString(36).substring(2, 5).toUpperCase(); // 3 random chars
  
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
  const [form, setForm] = useState({
    // Step 1: Basic Info
    itemName: "",
    brand: "",
    modelNumber: "",
    description: "",
    upc: "",
    ean: "",
    seoTitle: "",
    seoDescription: "",
    keywords: "",
    
    // Step 2: Details
    category: "",
    variationTheme: [],
  });

  const [formErrors, setFormErrors] = useState({});
  
  // Step 2: Variant data (now generated from combinations)
  const [hasVariants, setHasVariants] = useState(false);
  const [variantData, setVariantData] = useState([]);
  
  // Step 3: Offer data (deprecated - now handled in combination table)
  const [offerData, setOfferData] = useState([]);

  const [step, setStep] = useState(1);
  const [completedStep, setCompletedStep] = useState(1);
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // API response states
  const [createdProductId, setCreatedProductId] = useState(null);
  const [createdVariantIds, setCreatedVariantIds] = useState([]);

  const router = useRouter();

  const validateStep = () => {
    const errors = {};
    
    if (step === 1) {
      // Required fields validation
      if (!form.itemName?.trim()) errors.itemName = "Product name is required.";
      if (!form.brand?.trim()) errors.brand = "Brand is required.";
      if (!form.modelNumber?.trim()) errors.modelNumber = "Model number is required.";
      if (!form.description?.trim()) errors.description = "Description is required.";
      
      // Optional validation for identifiers (if they exist, they should be valid)
      if (form.upc && form.upc.length !== 12) {
        errors.upc = "UPC must be 12 digits.";
      }
      if (form.ean && form.ean.length !== 13) {
        errors.ean = "EAN must be 13 digits.";
      }
      
      // SEO field length validation
      if (form.seoTitle && form.seoTitle.length > 60) {
        errors.seoTitle = "SEO title must be 60 characters or less.";
      }
      if (form.seoDescription && form.seoDescription.length > 160) {
        errors.seoDescription = "SEO description must be 160 characters or less.";
      }
    }
    
    if (step === 2) {
      if (!form.category?.trim()) errors.category = "Category is required.";
      
      if (hasVariants) {
        if (!form.variationTheme || form.variationTheme.length === 0) {
          errors.variationTheme = "Variation theme is required for products with variants.";
        }
        
        // Validate variant data (now from combinations)
        if (variantData.length === 0) {
          errors.variants = "Please create at least one variant combination.";
        } else {
          variantData.forEach((variant, index) => {
            if (!variant.sku?.trim()) {
              errors[`combo_${index}_sku`] = "SKU is required.";
            }
            if (!variant.price || parseFloat(variant.price) <= 0) {
              errors[`combo_${index}_price`] = "Valid price is required.";
            }
            if (!variant.stock || parseInt(variant.stock) < 0) {
              errors[`combo_${index}_stock`] = "Valid stock quantity is required.";
            }
          });
        }
      }
    }
    
    if (step === 3) {
      if (images.length === 0) errors.images = "At least one image is required.";
      
      // For simple products without variants, validate offer data
      if (!hasVariants) {
        if (offerData.length === 0) {
          errors.offers = "Please create at least one offer.";
        } else {
          offerData.forEach((offer, index) => {
            if (!offer.price || parseFloat(offer.price) <= 0) {
              errors[`offer_${index}_price`] = "Valid price is required.";
            }
            if (!offer.stock || parseInt(offer.stock) < 0) {
              errors[`offer_${index}_stock`] = "Valid stock quantity is required.";
            }
          });
        }
      }
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const nextStep = () => {
    if (validateStep()) {
      setStep((s) => {
        const next = s + 1;
        setCompletedStep((prev) => Math.max(prev, next));
        return next;
      });
      setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 100);
    } else {
      toast.error("Fix errors before continuing.");
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
    } else if (targetStep === step + 1) {
      if (validateStep()) {
        setStep(targetStep);
        setCompletedStep((prev) => Math.max(prev, targetStep));
      } else {
        toast.error("Fix errors before continuing.");
      }
    } else {
      toast.error("Please complete previous steps first.");
    }
  };

  const handleInput = (field, value) => {
    // Special handling for keywords - convert to array format expected by backend
    if (field === 'keywords') {
      setForm((prev) => ({ 
        ...prev, 
        [field]: value // Keep as string for UI, will convert to array on submit
      }));
    } else if (field === 'variationTheme') {
      setForm((prev) => ({ ...prev, [field]: value }));
    } else {
      setForm((prev) => ({ ...prev, [field]: value }));
    }
    
    if (formErrors[field]) {
      setFormErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const handleRemoveImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  // Submit handlers for each step
  const createProduct = async () => {
    const formData = new FormData();
    
    // Add form fields
    Object.entries(form).forEach(([key, value]) => {
      if (key === 'keywords' && value) {
        const keywordsArray = value.split(',').map(keyword => keyword.trim()).filter(Boolean);
        formData.append(key, JSON.stringify(keywordsArray));
      } else if (key === 'variationTheme' && Array.isArray(value)) {
        formData.append(key, JSON.stringify(value));
      } else if (value !== '' && value !== null && value !== undefined) {
        formData.append(key, value);
      }
    });

    // Add main product images
    images.forEach((img) => formData.append("images", img));

    const response = await fetch("http://localhost:3092/products", {
      method: "POST",
      credentials: "include",
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      
      // Handle duplicate product case
      if (response.status === 409) {
        toast.error(`Product already exists in catalog. ${errorData.message}`);
        throw new Error(errorData.error);
      }
      
      throw new Error(errorData.error || 'Failed to create product');
    }

    const result = await response.json();
    return result.product;
  };

const createVariants = async (productId) => {
  if (!hasVariants || variantData.length === 0) {
    // For simple products, create a default variant
    const defaultSku = generateUniqueSku(form.brand, form.modelNumber);
    
    const defaultVariant = {
      name: form.itemName,
      variantAttributes: {},
      sku: defaultSku,
    };

    const response = await fetch(`http://localhost:3092/products/${productId}/variants`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(defaultVariant),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to create default variant');
    }

    const result = await response.json();
    console.log([result.variant])
    return [result.variant];
  }

  // Create variants for products with variants (from combinations)
  const variants = [];
  for (const [index, variant] of variantData.entries()) {
    const variantFormData = new FormData();
    
    // Generate SKU if not provided
    const finalSku = variant.sku?.trim() || generateUniqueSku(form.brand, form.modelNumber, variant.name, index);
    
    // Add variant data
    variantFormData.append('name', variant.name);
    variantFormData.append('variantAttributes', JSON.stringify(variant.variantAttributes));
    variantFormData.append('sku', finalSku);
    
    // Add optional identifiers
    if (variant.upc) variantFormData.append('upc', variant.upc);
    if (variant.ean) variantFormData.append('ean', variant.ean);
    if (variant.modelNumber) variantFormData.append('modelNumber', variant.modelNumber);
    
    // Add variant-specific image if exists
    if (variant.image) {
      variantFormData.append('images', variant.image);
    }

    const response = await fetch(`http://localhost:3092/products/${productId}/variants`, {
      method: "POST",
      credentials: "include",
      body: variantFormData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      
      // Handle duplicate variant case
      if (response.status === 409) {
        toast.error(`Variant "${variant.name}" already exists. ${errorData.message}`);
        throw new Error(errorData.error);
      }
      
      throw new Error(errorData.error || `Failed to create variant: ${variant.name}`);
    }

    const result = await response.json();
    variants.push({
      ...result.variant,
      condition: variant.condition,
      price: variant.price,
      stock: variant.stock
    });
  }

  return variants;
};

const createOffers = async (variants) => {
  const offers = [];
    console.log(variants)
  for (const variant of variants) {
    // For variants with combination data, use that for offers
    if (hasVariants && variant.price && variant.stock) {
      // Generate unique sellerSku if variant.sku is missing
      const sellerSku = variant.sku || generateUniqueSku(form.brand, form.modelNumber, variant.name);
      
      const offerPayload = {
        price: parseFloat(variant.price),
        stock: parseInt(variant.stock),
        condition: variant.condition || 'new',
        sellerSku: sellerSku,
        shippingInfo: {
          freeShipping: false,
          shippingCost: 0,
          estimatedDelivery: '2-3 business days',
          shippingClass: ''
        },
        inventoryTracking: {
          reservedStock: 0,
          inboundStock: 0
        }
      };

      const response = await fetch(`http://localhost:3092/variants/${variant._id}/offers`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(offerPayload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        
        // Handle duplicate offer case
        if (response.status === 409) {
          toast.error(`You already have an offer for this variant. ${errorData.message}`);
          throw new Error(errorData.error);
        }
        
        throw new Error(errorData.error || `Failed to create offer for variant: ${variant.name}`);
      }

      const result = await response.json();
      offers.push(result.offer);
    } else if (!hasVariants) {
      // For simple products, use offerData
      for (const [index, offer] of offerData.entries()) {
        // Generate unique sellerSku if not provided by user or if variant sku is missing
        const sellerSku = offer.sellerSku?.trim() || variant.sku || generateUniqueSku(form.brand, form.modelNumber, 'offer', index);
        
        const offerPayload = {
          price: parseFloat(offer.price),
          stock: parseInt(offer.stock),
          condition: offer.condition || 'new',
          sellerSku: sellerSku,
          shippingInfo: {
            freeShipping: offer.shippingInfo?.freeShipping || false,
            shippingCost: offer.shippingInfo?.freeShipping ? 0 : parseFloat(offer.shippingInfo?.shippingCost || 0),
            estimatedDelivery: offer.shippingInfo?.estimatedDelivery || '2-3 business days',
            shippingClass: offer.shippingInfo?.shippingClass || ''
          },
          inventoryTracking: {
            reservedStock: parseInt(offer.inventoryTracking?.reservedStock || 0),
            inboundStock: parseInt(offer.inventoryTracking?.inboundStock || 0)
          }
        };

        const response = await fetch(`http://localhost:3092/variants/${variant._id}/offers`, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(offerPayload),
        });

        if (!response.ok) {
          const errorData = await response.json();
          
          // Handle duplicate offer case
          if (response.status === 409) {
            toast.error(`You already have an offer for this variant. ${errorData.message}`);
            throw new Error(errorData.error);
          }
          
          throw new Error(errorData.error || `Failed to create offer for variant: ${variant.name}`);
        }

        const result = await response.json();
        offers.push(result.offer);
      }
    }
  }

  return offers;
};

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep()) {
      toast.error("Fix validation errors before submitting.");
      return;
    }

    setSubmitting(true);
    setUploadProgress(0);

    try {
      // Step 1: Create Product
      setUploadProgress(20);
      toast.loading("Creating product...", { id: 'product-creation' });
      const product = await createProduct();
      setCreatedProductId(product._id);
      toast.success("Product created successfully!", { id: 'product-creation' });

      // Step 2: Create Variants
      setUploadProgress(50);
      toast.loading("Creating variants...", { id: 'variant-creation' });
      const variants = await createVariants(product._id);
      setCreatedVariantIds(variants.map(v => v._id));
      toast.success(`${variants.length} variant${variants.length !== 1 ? 's' : ''} created!`, { id: 'variant-creation' });

      // Step 3: Create Offers
      setUploadProgress(80);
      toast.loading("Creating offers...", { id: 'offer-creation' });
      const offers = await createOffers(variants);
      toast.success(`${offers.length} offer${offers.length !== 1 ? 's' : ''} created!`, { id: 'offer-creation' });

      setUploadProgress(100);
      toast.success("Product listing completed successfully!");
      
      // Clear draft and redirect
      localStorage.removeItem("productDraft");
      localStorage.removeItem("productDraftSavedAt");
      
      // Delay redirect to show success message
      setTimeout(() => {
        router.push("/dashboard/seller/inventory");
      }, 2000);

    } catch (error) {
      console.error('Submit Error:', error);
      toast.error(`Error: ${error.message}`);
      setUploadProgress(0);
    } finally {
      setSubmitting(false);
    }
  };

  return {
    // Form state
    form,
    setForm,
    formErrors,
    setFormErrors,
    
    // Step management
    step,
    setStep,
    completedStep,
    setCompletedStep,
    
    // Image handling
    images,
    setImages,
    imagePreviews,
    setImagePreviews,
    handleRemoveImage,
    
    // Variant and offer state
    hasVariants,
    setHasVariants,
    variantData,
    setVariantData,
    offerData,
    setOfferData,
    
    // Submission
    submitting,
    setSubmitting,
    uploadProgress,
    setUploadProgress,
    handleSubmit,
    
    // Navigation
    nextStep,
    prevStep,
    handleStepClick,
    validateStep,
    handleInput,
    
    // API response state
    createdProductId,
    createdVariantIds,
  };
}