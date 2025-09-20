// Updated useProductFormSteps hook with enhanced variant validation
'use client';
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";

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
  const [form, setForm] = useState({
    itemName: "",
    brand: "",
    modelNumber: "",
    description: "",
    upc: "",
    ean: "",
    seoTitle: "",
    seoDescription: "",
    keywords: "",
    category: "",
    variationTheme: [],
  });

  const [formErrors, setFormErrors] = useState({});
  const [hasVariants, setHasVariants] = useState(false);
  const [variantData, setVariantData] = useState([]);
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
      // Step 1 validation (unchanged)
      if (!form.itemName?.trim()) {
        errors.itemName = "Product name is required.";
        errorMessages.push("Product name is required");
      }
      if (!form.brand?.trim()) {
        errors.brand = "Brand is required.";
        errorMessages.push("Brand is required");
      }
      if (!form.modelNumber?.trim()) {
        errors.modelNumber = "Model number is required.";
        errorMessages.push("Model number is required");
      }
      if (!form.description?.trim()) {
        errors.description = "Description is required.";
        errorMessages.push("Description is required");
      }
      
      if (form.upc && form.upc.length !== 12) {
        errors.upc = "UPC must be 12 digits.";
        errorMessages.push("UPC must be 12 digits");
      }
      if (form.ean && form.ean.length !== 13) {
        errors.ean = "EAN must be 13 digits.";
        errorMessages.push("EAN must be 13 digits");
      }
      
      if (form.seoTitle && form.seoTitle.length > 60) {
        errors.seoTitle = "SEO title must be 60 characters or less.";
        errorMessages.push("SEO title must be 60 characters or less");
      }
      if (form.seoDescription && form.seoDescription.length > 160) {
        errors.seoDescription = "SEO description must be 160 characters or less.";
        errorMessages.push("SEO description must be 160 characters or less");
      }
    }
    
    if (step === 2) {
      if (!form.category?.trim()) {
        errors.category = "Category is required.";
        errorMessages.push("Category is required");
      }
      
      if (hasVariants) {
        if (!form.variationTheme || form.variationTheme.length === 0) {
          errors.variationTheme = "Variation theme is required for products with variants.";
          errorMessages.push("Variation theme is required for products with variants");
        }
        
        if (variantData.length === 0) {
          errors.variants = "Please create at least one variant combination.";
          errorMessages.push("Please create at least one variant combination");
        } else {
          // Enhanced variant validation with shipping requirements
          variantData.forEach((variant, index) => {
            if (!variant.sku?.trim()) {
              errors[`combo_${index}_sku`] = "SKU is required.";
              errorMessages.push(`SKU is required for variant ${index + 1}`);
            }
            if (!variant.price || parseFloat(variant.price) <= 0) {
              errors[`combo_${index}_price`] = "Valid price is required.";
              errorMessages.push(`Valid price is required for variant ${index + 1}`);
            }
            if (!variant.stock || parseInt(variant.stock) < 0) {
              errors[`combo_${index}_stock`] = "Valid stock quantity is required.";
              errorMessages.push(`Valid stock quantity is required for variant ${index + 1}`);
            }
            
            // Validate shipping configuration for variants
            const hasShippingZones = variant.shippingZoneIds && Array.isArray(variant.shippingZoneIds) && variant.shippingZoneIds.length > 0;
            const hasPickup = variant.pickup && variant.pickup.available === true;
            
            if (!hasShippingZones && !hasPickup) {
              errors[`combo_${index}_shipping`] = "At least one shipping option is required (shipping zones or pickup).";
              errorMessages.push(`At least one shipping option is required for variant ${index + 1} (shipping zones or pickup)`);
            }
            
            // Validate pickup address if pickup is enabled for variant
            if (hasPickup) {
              if (!variant.pickup.address?.street?.trim()) {
                errors[`combo_${index}_pickup_address`] = "Pickup street address is required when pickup is enabled.";
                errorMessages.push(`Pickup street address is required for variant ${index + 1} when pickup is enabled`);
              }
              if (!variant.pickup.address?.city?.trim()) {
                errors[`combo_${index}_pickup_city`] = "Pickup city is required when pickup is enabled.";
                errorMessages.push(`Pickup city is required for variant ${index + 1} when pickup is enabled`);
              }
            }
          });
        }
      }
    }
    
    if (step === 3) {
      if (images.length === 0) {
        errors.images = "At least one image is required.";
        errorMessages.push("At least one image is required");
      }
      
      // Only validate offers for single products (non-variants)
      if (!hasVariants) {
        if (offerData.length === 0) {
          errors.offers = "Please create at least one offer.";
          errorMessages.push("Please create at least one offer");
        } else {
          offerData.forEach((offer, index) => {
            if (!offer.price || parseFloat(offer.price) <= 0) {
              errors[`offer_${index}_price`] = "Valid price is required.";
              errorMessages.push(`Valid price is required for offer ${index + 1}`);
            }
            if (!offer.stock || parseInt(offer.stock) < 0) {
              errors[`offer_${index}_stock`] = "Valid stock quantity is required.";
              errorMessages.push(`Valid stock quantity is required for offer ${index + 1}`);
            }
            
            // Updated shipping validation: Check for selected zones or pickup
            const hasShippingZones = offer.shippingZoneIds && Array.isArray(offer.shippingZoneIds) && offer.shippingZoneIds.length > 0;
            const hasPickup = offer.pickup && offer.pickup.available === true;
            
            if (!hasShippingZones && !hasPickup) {
              errors[`offer_${index}_shipping`] = "At least one shipping option is required (shipping zones or pickup).";
              errorMessages.push(`At least one shipping option is required for offer ${index + 1} (shipping zones or pickup)`);
            }
            
            // Validate pickup address if pickup is enabled
            if (hasPickup) {
              if (!offer.pickup.address?.street?.trim()) {
                errors[`offer_${index}_pickup_address`] = "Pickup street address is required when pickup is enabled.";
                errorMessages.push(`Pickup street address is required for offer ${index + 1} when pickup is enabled`);
              }
              if (!offer.pickup.address?.city?.trim()) {
                errors[`offer_${index}_pickup_city`] = "Pickup city is required when pickup is enabled.";
                errorMessages.push(`Pickup city is required for offer ${index + 1} when pickup is enabled`);
              }
            }
          });
        }
      }
    }
    
    setFormErrors(errors);
    
    // Show toast messages if requested and there are errors
    if (showToasts && errorMessages.length > 0) {
      errorMessages.forEach((message, index) => {
        setTimeout(() => {
          toast.error(message);
        }, index * 200); // Stagger the toasts to avoid overlap
      });
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
      if (validateStep(true)) {
        setStep(targetStep);
        setCompletedStep((prev) => Math.max(prev, targetStep));
      }
    } else {
      toast.error("Please complete previous steps first.");
    }
  };

  const handleInput = (field, value) => {
    if (field === 'keywords') {
      setForm((prev) => ({ 
        ...prev, 
        [field]: value
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

  const createProduct = async () => {
    const formData = new FormData();
    
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

    images.forEach((img) => formData.append("images", img));

    const response = await fetch("http://localhost:3092/products", {
      method: "POST",
      credentials: "include",
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      
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
      return [result.variant];
    }

    const variants = [];
    for (const [index, variant] of variantData.entries()) {
      const variantFormData = new FormData();
      
      const finalSku = variant.sku?.trim() || generateUniqueSku(form.brand, form.modelNumber, variant.name, index);
      
      variantFormData.append('name', variant.name);
      variantFormData.append('variantAttributes', JSON.stringify(variant.variantAttributes));
      variantFormData.append('sku', finalSku);
      
      if (variant.upc) variantFormData.append('upc', variant.upc);
      if (variant.ean) variantFormData.append('ean', variant.ean);
      if (variant.modelNumber) variantFormData.append('modelNumber', variant.modelNumber);
      
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
        stock: variant.stock,
        // Include shipping configuration from Step 2
        useDefaultZones: variant.useDefaultZones,
        shippingZoneIds: variant.shippingZoneIds,
        pickup: variant.pickup
      });
    }

    return variants;
  };

  const createOffers = async (variants) => {
    const offers = [];

    for (const variant of variants) {
      if (hasVariants && variant.price && variant.stock) {
        // For variants, use the shipping configuration from Step 2
        const sellerSku = variant.sku || generateUniqueSku(form.brand, form.modelNumber, variant.name);
        
        const offerPayload = {
          price: parseFloat(variant.price),
          stock: parseInt(variant.stock),
          condition: variant.condition || 'new',
          sellerSku: sellerSku,
          // Use variant's shipping configuration instead of default zones
          useDefaultZones: variant.useDefaultZones || false,
          shippingZoneIds: variant.shippingZoneIds || [],
          pickup: variant.pickup || {
            available: false,
            address: {},
            instructions: '',
            hours: {}
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
          
          if (response.status === 409) {
            toast.error(`You already have an offer for this variant. ${errorData.message}`);
            throw new Error(errorData.error);
          }
          
          throw new Error(errorData.error || `Failed to create offer for variant: ${variant.name}`);
        }

        const result = await response.json();
        offers.push(result.offer);
      } else if (!hasVariants) {
        // For simple products, use the configured offer data from Step 3
        for (const [index, offer] of offerData.entries()) {
          const sellerSku = offer.sellerSku?.trim() || variant.sku || generateUniqueSku(form.brand, form.modelNumber, 'offer', index);
          
          const offerPayload = {
            price: parseFloat(offer.price),
            stock: parseInt(offer.stock),
            condition: offer.condition || 'new',
            sellerSku: sellerSku,
            
            // Use Step 3 shipping configuration
            useDefaultZones: offer.useDefaultZones || false,
            shippingZoneIds: offer.shippingZoneIds || [],
            
            pickup: offer.pickup || {
              available: false,
              address: {},
              instructions: '',
              hours: {}
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
    if (!validateStep(true)) {
      return;
    }

    setSubmitting(true);
    setUploadProgress(0);

    try {
      setUploadProgress(20);
      toast.loading("Creating product...", { id: 'product-creation' });
      const product = await createProduct();
      setCreatedProductId(product._id);
      toast.success("Product created successfully!", { id: 'product-creation' });

      setUploadProgress(50);
      toast.loading("Creating variants...", { id: 'variant-creation' });
      const variants = await createVariants(product._id);
      setCreatedVariantIds(variants.map(v => v._id));
      toast.success(`${variants.length} variant${variants.length !== 1 ? 's' : ''} created!`, { id: 'variant-creation' });

      setUploadProgress(80);
      toast.loading("Creating offers...", { id: 'offer-creation' });
      const offers = await createOffers(variants);
      toast.success(`${offers.length} offer${offers.length !== 1 ? 's' : ''} created!`, { id: 'offer-creation' });

      setUploadProgress(100);
      toast.success("Product listing completed successfully!");
      
      localStorage.removeItem("productDraft");
      localStorage.removeItem("productDraftSavedAt");
      
      setTimeout(() => {
        router.push("/dashboard/inventory");
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
  };
}