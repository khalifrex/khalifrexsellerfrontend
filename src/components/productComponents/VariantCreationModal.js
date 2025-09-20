import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, Upload, X, AlertCircle, Loader, Lock } from "lucide-react";
import toast from "react-hot-toast";
import { apiService } from "@/services/api";

const FieldError = ({ error }) => {
  if (!error) return null;
  return (
    <div className="flex items-center gap-1 text-red-600 text-sm mt-1">
      <AlertCircle className="w-4 h-4" />
      <span>{error}</span>
    </div>
  );
};

export const VariantCreationModal = ({ 
  show, 
  onClose, 
  selectedProduct, 
  onVariantCreated 
}) => {
  const [submitting, setSubmitting] = useState(false);
  const [loadingThemes, setLoadingThemes] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [availableThemes, setAvailableThemes] = useState([]);
  const [selectedThemes, setSelectedThemes] = useState({});
  const [themeValues, setThemeValues] = useState({});
  const [requiredThemes, setRequiredThemes] = useState([]);
  const [variantForm, setVariantForm] = useState({
    name: "",
    variantAttributes: {},
    sku: "",
    upc: "",
    ean: "",
    mpn: "",
    modelNumber: "",
    description: "",
    weight: "",
    dimensions: {
      length: "",
      width: "",
      height: ""
    }
  });
  const [uploadedImages, setUploadedImages] = useState([]);
  const [dragActive, setDragActive] = useState(false);

  // Fetch available variation themes and parent info when modal opens
  useEffect(() => {
    if (show && selectedProduct) {
      fetchVariationThemes();
      fetchParentVariationThemes();
    }
  }, [show, selectedProduct]);

  const fetchVariationThemes = async () => {
    setLoadingThemes(true);
    try {
      const response = await apiService.getVariationThemes(selectedProduct.categoryId);
      
      // Handle the response structure: {"variationThemes":["Model","Storage","Color","Carrier","Condition"]}
      const themes = response.variationThemes || [];
      
      // Convert array of theme names to objects with more structure
      const themeObjects = themes.map(themeName => ({
        name: themeName,
        description: getThemeDescription(themeName),
        predefinedValues: getPredefinedValues(themeName),
        isRequired: false // Will be set after fetching parent info
      }));
      
      setAvailableThemes(themeObjects);
    } catch (error) {
      console.error('Error fetching variation themes:', error);
      toast.error('Failed to load variation themes');
      setAvailableThemes([]);
    } finally {
      setLoadingThemes(false);
    }
  };

  const fetchParentVariationThemes = async () => {
    try {
      // Use parentId if available, or the product's own ID if it's already a parent
      const parentId = selectedProduct.parentId || selectedProduct._id;
      
      const response = await apiService.getParentVariationThemes(parentId);
      const parentRequiredThemes = response.variationThemes || [];
      
      setRequiredThemes(parentRequiredThemes);
      
      // Pre-select required themes and mark them
      const preSelectedThemes = {};
      parentRequiredThemes.forEach(theme => {
        preSelectedThemes[theme] = true;
      });
      setSelectedThemes(preSelectedThemes);
      
      // Update available themes to mark required ones
      setAvailableThemes(prev => prev.map(theme => ({
        ...theme,
        isRequired: parentRequiredThemes.includes(theme.name)
      })));
      
      console.log('Required themes from parent:', parentRequiredThemes);
    } catch (error) {
      console.error('Error fetching parent variation themes:', error);
      toast.error('Failed to load parent product information');
      // Continue without required themes if this fails
      setRequiredThemes([]);
    }
  };

  // Helper function to get theme descriptions
  const getThemeDescription = (themeName) => {
    const descriptions = {
      'Model': 'Product model or version',
      'Storage': 'Storage capacity (e.g., 128GB, 256GB)',
      'Color': 'Product color or finish',
      'Carrier': 'Network carrier or compatibility',
      'Condition': 'Product condition (New, Used, Refurbished)',
      'Size': 'Physical size or dimensions',
      'Material': 'Material composition',
      'Style': 'Design style or variant'
    };
    return descriptions[themeName] || `${themeName} specification`;
  };

  // Helper function to get predefined values for common themes
  const getPredefinedValues = (themeName) => {
    const predefinedValues = {
      'Condition': ['New', 'Used - Like New', 'Used - Very Good', 'Used - Good', 'Used - Acceptable', 'Refurbished'],
      'Storage': ['16GB', '32GB', '64GB', '128GB', '256GB', '512GB', '1TB', '2TB'],
      'Color': ['Black', 'White', 'Silver', 'Gold', 'Rose Gold', 'Blue', 'Red', 'Green', 'Purple', 'Gray'],
      'Size': ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Small', 'Medium', 'Large'],
      'Carrier': ['Unlocked', 'Verizon', 'AT&T', 'T-Mobile', 'Sprint']
    };
    return predefinedValues[themeName] || [];
  };

  if (!show || !selectedProduct) return null;

  const handleFormChange = (field, value) => {
    // Clear error for this field when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }

    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setVariantForm(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setVariantForm(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleThemeSelection = (themeName) => {
    const isRequired = requiredThemes.includes(themeName);
    
    // Don't allow deselecting required themes
    if (isRequired) {
      toast.warning(`${themeName} is required for this product and cannot be deselected`);
      return;
    }
    
    const isSelected = selectedThemes[themeName];
    
    setSelectedThemes(prev => ({
      ...prev,
      [themeName]: !isSelected
    }));

    // If deselecting, remove from variant attributes and theme values
    if (isSelected) {
      setVariantForm(prev => {
        const newAttributes = { ...prev.variantAttributes };
        delete newAttributes[themeName];
        return {
          ...prev,
          variantAttributes: newAttributes
        };
      });
      
      setThemeValues(prev => {
        const newValues = { ...prev };
        delete newValues[themeName];
        return newValues;
      });
    }

    // Clear related error
    if (formErrors.variantAttributes) {
      setFormErrors(prev => ({
        ...prev,
        variantAttributes: null
      }));
    }
  };

  const handleThemeValueChange = (themeName, value) => {
    // Update theme values for custom input tracking
    setThemeValues(prev => ({
      ...prev,
      [themeName]: value
    }));

    // Update variant attributes
    setVariantForm(prev => ({
      ...prev,
      variantAttributes: {
        ...prev.variantAttributes,
        [themeName]: value
      }
    }));

    // Clear related error
    if (formErrors.variantAttributes) {
      setFormErrors(prev => ({
        ...prev,
        variantAttributes: null
      }));
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!variantForm.name.trim()) {
      errors.name = "Variant name is required";
    }

    if (!variantForm.sku.trim()) {
      errors.sku = "SKU is required";
    }

    // Validate required themes from parent product
    const missingRequiredThemes = requiredThemes.filter(
      theme => !variantForm.variantAttributes[theme] || !variantForm.variantAttributes[theme].trim()
    );

    if (missingRequiredThemes.length > 0) {
      errors.variantAttributes = `Please provide values for required themes: ${missingRequiredThemes.join(', ')}`;
    }

    // Check if at least one theme is selected and has a value (fallback validation)
    const selectedThemeKeys = Object.keys(selectedThemes).filter(key => selectedThemes[key]);
    if (selectedThemeKeys.length === 0) {
      errors.variantAttributes = "Please select at least one variation theme";
    } else {
      const missingValues = selectedThemeKeys.filter(
        theme => !variantForm.variantAttributes[theme] || !variantForm.variantAttributes[theme].trim()
      );
      if (missingValues.length > 0 && !errors.variantAttributes) {
        errors.variantAttributes = `Please provide values for: ${missingValues.join(', ')}`;
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleImageUpload = (files) => {
    const validFiles = Array.from(files).filter(file => 
      file.type.startsWith('image/') && file.size <= 5 * 1024 * 1024
    );

    if (validFiles.length !== files.length) {
      toast.error("Some files were skipped. Please upload images under 5MB.");
    }

    const newImages = validFiles.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      id: Math.random().toString(36).substr(2, 9)
    }));

    setUploadedImages(prev => [...prev, ...newImages]);
  };

  const removeImage = (imageId) => {
    setUploadedImages(prev => {
      const imageToRemove = prev.find(img => img.id === imageId);
      if (imageToRemove && imageToRemove.preview) {
        URL.revokeObjectURL(imageToRemove.preview);
      }
      return prev.filter(img => img.id !== imageId);
    });
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageUpload(e.dataTransfer.files);
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      toast.error("Please fix the form errors before submitting");
      return;
    }

    setSubmitting(true);
    
    try {
      const variantData = {
        name: variantForm.name,
        variantAttributes: variantForm.variantAttributes,
        sku: variantForm.sku,
        upc: variantForm.upc,
        ean: variantForm.ean,
        mpn: variantForm.mpn,
        modelNumber: variantForm.modelNumber,
        description: variantForm.description,
        weight: variantForm.weight,
        dimensions: variantForm.dimensions,
        images: uploadedImages
      };

      const response = await apiService.createVariant(selectedProduct._id, variantData);

      toast.success("Variant created successfully!");
      onVariantCreated(response.variant);
      onClose();
      
      // Reset form
      setVariantForm({
        name: "",
        variantAttributes: {},
        sku: "",
        upc: "",
        ean: "",
        mpn: "",
        modelNumber: "",
        description: "",
        weight: "",
        dimensions: { length: "", width: "", height: "" }
      });
      setSelectedThemes({});
      setThemeValues({});
      setUploadedImages([]);
      setFormErrors({});
      setRequiredThemes([]);
    } catch (error) {
      console.error('Variant creation error:', error);
      
      if (error.message.includes('SKU already exists')) {
        setFormErrors({ sku: error.message });
        toast.error("SKU already exists for this product");
      } else if (error.message.includes('already exists')) {
        toast.error("A variant with these attributes already exists");
      } else if (error.message.includes('Missing required') || error.message.includes('Invalid variant')) {
        setFormErrors({ variantAttributes: error.message });
        toast.error(error.message);
      } else {
        toast.error(error.message || "Failed to create variant");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white rounded-xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">Add New Variant</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
          >
            ✕
          </button>
        </div>

        {/* Product Summary */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h3 className="font-medium mb-2">{selectedProduct.name}</h3>
          <div className="flex gap-4 text-sm text-gray-600 flex-wrap">
            {selectedProduct.khalifrexId && <span>ID: {selectedProduct.khalifrexId}</span>}
            {selectedProduct.brand && <span>Brand: {selectedProduct.brand}</span>}
            {selectedProduct.categoryName && <span>Category: {selectedProduct.categoryName}</span>}
            {requiredThemes.length > 0 && (
              <span className="text-red-600 font-medium">
                Required themes: {requiredThemes.join(', ')}
              </span>
            )}
          </div>
        </div>

        <div className="space-y-6">
          {/* Variation Themes Selection */}
          {loadingThemes ? (
            <div className="flex items-center justify-center py-8">
              <Loader className="w-6 h-6 animate-spin text-blue-600" />
              <span className="ml-2 text-gray-600">Loading variation themes...</span>
            </div>
          ) : availableThemes.length > 0 ? (
            <div>
              <h3 className="text-lg font-semibold mb-4">Select Variation Themes</h3>
              <p className="text-sm text-gray-600 mb-4">
                Choose which attributes will differentiate this variant from others:
              </p>
              
              {/* Show info about required themes */}
              {requiredThemes.length > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                  <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4 text-yellow-600" />
                    <span className="text-sm font-medium text-yellow-800">
                      Required by parent product: {requiredThemes.join(', ')}
                    </span>
                  </div>
                  <p className="text-xs text-yellow-700 mt-1">
                    These themes are mandatory and cannot be deselected.
                  </p>
                </div>
              )}
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
                {availableThemes.map((theme) => {
                  const isRequired = requiredThemes.includes(theme.name);
                  const isSelected = selectedThemes[theme.name];
                  
                  return (
                    <label
                      key={theme.name}
                      className={`flex items-center gap-2 p-3 border rounded-lg transition-colors ${
                        isSelected
                          ? isRequired 
                            ? 'border-red-500 bg-red-50' 
                            : 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      } ${isRequired ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected || false}
                        onChange={() => handleThemeSelection(theme.name)}
                        disabled={isRequired}
                        className={`focus:ring-blue-500 rounded ${
                          isRequired ? 'text-red-600' : 'text-blue-600'
                        }`}
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-1">
                          <span className="font-medium text-sm">{theme.name}</span>
                          {isRequired && (
                            <Lock className="w-3 h-3 text-red-500" />
                          )}
                          {isRequired && (
                            <span className="text-xs bg-red-100 text-red-700 px-1 rounded">
                              Required
                            </span>
                          )}
                        </div>
                        {theme.description && (
                          <p className="text-xs text-gray-500">{theme.description}</p>
                        )}
                      </div>
                    </label>
                  );
                })}
              </div>
              <FieldError error={formErrors.variantAttributes} />

              {/* Dynamic Input Fields for Selected Themes */}
              {Object.keys(selectedThemes).some(key => selectedThemes[key]) && (
                <div className="border-t pt-4">
                  <h4 className="font-medium mb-3">Enter Values for Selected Themes</h4>
                  <p className="text-sm text-gray-600 mb-4">
                    Provide specific values for each selected theme. Required themes must be filled before submission.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.keys(selectedThemes)
                      .filter(key => selectedThemes[key])
                      .sort((a, b) => {
                        // Sort required themes first
                        const aRequired = requiredThemes.includes(a);
                        const bRequired = requiredThemes.includes(b);
                        if (aRequired && !bRequired) return -1;
                        if (!aRequired && bRequired) return 1;
                        return a.localeCompare(b);
                      })
                      .map((themeName) => {
                        const theme = availableThemes.find(t => t.name === themeName);
                        const hasPredefinedValues = theme?.predefinedValues && theme.predefinedValues.length > 0;
                        const isRequired = requiredThemes.includes(themeName);
                        
                        return (
                          <div key={themeName} className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">
                              <div className="flex items-center gap-2">
                                {themeName}
                                {isRequired && (
                                  <>
                                    <span className="text-red-500">*</span>
                                    <span className="text-xs bg-red-100 text-red-700 px-1 rounded">
                                      Required
                                    </span>
                                  </>
                                )}
                              </div>
                            </label>
                            
                            {hasPredefinedValues && (
                              <div className="space-y-2">
                                <select
                                  value={variantForm.variantAttributes[themeName] || ''}
                                  onChange={(e) => handleThemeValueChange(themeName, e.target.value)}
                                  className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                    isRequired && !variantForm.variantAttributes[themeName] 
                                      ? 'border-red-300 bg-red-50' 
                                      : 'border-gray-300'
                                  }`}
                                  required={isRequired}
                                >
                                  <option value="">Select {themeName}</option>
                                  {theme.predefinedValues.map((value) => (
                                    <option key={value} value={value}>{value}</option>
                                  ))}
                                  <option value="__custom__">Other (enter custom value)</option>
                                </select>
                                
                                {(variantForm.variantAttributes[themeName] === '__custom__' || 
                                  (variantForm.variantAttributes[themeName] && 
                                   !theme.predefinedValues.includes(variantForm.variantAttributes[themeName]))) && (
                                  <input
                                    type="text"
                                    value={themeValues[themeName] || ''}
                                    onChange={(e) => {
                                      setThemeValues(prev => ({
                                        ...prev,
                                        [themeName]: e.target.value
                                      }));
                                      handleThemeValueChange(themeName, e.target.value);
                                    }}
                                    className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                      isRequired && !themeValues[themeName] 
                                        ? 'border-red-300 bg-red-50' 
                                        : 'border-gray-300'
                                    }`}
                                    placeholder={`Enter custom ${themeName.toLowerCase()}`}
                                    required={isRequired}
                                  />
                                )}
                              </div>
                            )}
                            
                            {!hasPredefinedValues && (
                              <input
                                type="text"
                                value={variantForm.variantAttributes[themeName] || ''}
                                onChange={(e) => handleThemeValueChange(themeName, e.target.value)}
                                className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                  isRequired && !variantForm.variantAttributes[themeName] 
                                    ? 'border-red-300 bg-red-50' 
                                    : 'border-gray-300'
                                }`}
                                placeholder={`Enter ${themeName.toLowerCase()} (e.g., ${
                                  themeName.toLowerCase() === 'model' ? 'iPhone 12 Pro, Galaxy S21' :
                                  themeName.toLowerCase() === 'carrier' ? 'Unlocked, Verizon' :
                                  'your custom value'
                                })`}
                                required={isRequired}
                              />
                            )}
                          </div>
                        );
                      })}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 mb-2">No variation themes available for this category</p>
              <p className="text-sm text-gray-400">Contact support to add variation themes for this category.</p>
            </div>
          )}

          {/* Basic Information */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Variant Name *
                </label>
                <input
                  type="text"
                  value={variantForm.name}
                  onChange={(e) => handleFormChange('name', e.target.value)}
                  className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    formErrors.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="e.g., iPhone 12 Pro Max - Green"
                  required
                />
                <FieldError error={formErrors.name} />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  SKU *
                </label>
                <input
                  type="text"
                  value={variantForm.sku}
                  onChange={(e) => handleFormChange('sku', e.target.value)}
                  className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    formErrors.sku ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Your unique SKU"
                  required
                />
                <FieldError error={formErrors.sku} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={variantForm.description}
                  onChange={(e) => handleFormChange('description', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                  placeholder="Variant-specific description (optional)"
                />
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Weight (lbs)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={variantForm.weight}
                      onChange={(e) => handleFormChange('weight', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="0.00"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Model Number
                    </label>
                    <input
                      type="text"
                      value={variantForm.modelNumber}
                      onChange={(e) => handleFormChange('modelNumber', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Model number"
                    />
                  </div>
                </div>

                {/* Dimensions */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Dimensions (inches)
                  </label>
                  <div className="grid grid-cols-3 gap-4">
                    <input
                      type="number"
                      step="0.01"
                      value={variantForm.dimensions.length}
                      onChange={(e) => handleFormChange('dimensions.length', e.target.value)}
                      className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Length"
                    />
                    <input
                      type="number"
                      step="0.01"
                      value={variantForm.dimensions.width}
                      onChange={(e) => handleFormChange('dimensions.width', e.target.value)}
                      className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Width"
                    />
                    <input
                      type="number"
                      step="0.01"
                      value={variantForm.dimensions.height}
                      onChange={(e) => handleFormChange('dimensions.height', e.target.value)}
                      className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Height"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Product Codes */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Product Codes (Optional)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">UPC</label>
                <input
                  type="text"
                  value={variantForm.upc}
                  onChange={(e) => handleFormChange('upc', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Universal Product Code"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">EAN</label>
                <input
                  type="text"
                  value={variantForm.ean}
                  onChange={(e) => handleFormChange('ean', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="European Article Number"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">MPN</label>
                <input
                  type="text"
                  value={variantForm.mpn}
                  onChange={(e) => handleFormChange('mpn', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Manufacturer Part Number"
                />
              </div>
            </div>
          </div>

          {/* Images Upload */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Images</h3>
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragActive 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600 mb-2">Drag and drop images here, or click to select</p>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => handleImageUpload(e.target.files)}
                className="hidden"
                id="image-upload"
              />
              <label
                htmlFor="image-upload"
                className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-blue-700 transition-colors"
              >
                Select Images
              </label>
              <p className="text-xs text-gray-500 mt-2">Max 5MB per image</p>
            </div>

            {/* Image Previews */}
            {uploadedImages.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                {uploadedImages.map((image) => (
                  <div key={image.id} className="relative">
                    <img
                      src={image.preview}
                      alt="Preview"
                      className="w-full h-24 object-cover rounded-lg border"
                    />
                    <button
                      onClick={() => removeImage(image.id)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 font-medium"
            >
              {submitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Creating Variant...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  Create Variant
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};