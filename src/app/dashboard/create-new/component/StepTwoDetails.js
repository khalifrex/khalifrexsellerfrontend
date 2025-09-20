"use client";

import Skeleton from "../../../../components/sellerDashboardComponents/Skeleton";
import { PlusCircle, Trash2, Plus, X, Upload, Lock, Minus, Package, DollarSign, Truck } from "lucide-react";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import Image from "next/image";
import ShippingConfiguration from "./ShippingConfiguration";
import { useShippingZones } from "@/hooks/useShippingZones";

export default function StepTwoDetails({
  form,
  formErrors,
  handleInput,
  hasMounted,
  loadingCategories,
  categories,
  selectedCategory,
  hasVariants,
  setHasVariants,
  variantData,
  setVariantData,
}) {
  const [categoryVariationThemes, setCategoryVariationThemes] = useState([]);
  const [loadingVariationThemes, setLoadingVariationThemes] = useState(false);
  const [themeValues, setThemeValues] = useState({});
  const [combinations, setCombinations] = useState([]);
  const [combinationData, setCombinationData] = useState({});
  const [expandedVariant, setExpandedVariant] = useState(null);
  const [showZoneSelector, setShowZoneSelector] = useState(false);
  const [currentVariantIndex, setCurrentVariantIndex] = useState(null);

  // Shipping zones hook
  const {
    shippingZones,
    isLoadingZones,
    selectedZones,
    setSelectedZones,
    fetchShippingZones,
    handleZoneSelection,
    handleSelectAllZones,
    handleClearAllZones,
    applyZonesToOffer,
  } = useShippingZones();

  // Initialize shipping zones
  useEffect(() => {
    if (hasVariants) {
      fetchShippingZones();
    }
  }, [hasVariants]);

  // Open zone selector for specific variant
  const openZoneSelector = (variantIndex) => {
    setCurrentVariantIndex(variantIndex);
    setShowZoneSelector(true);
    
    const currentVariant = Object.values(combinationData)[variantIndex];
    if (currentVariant?.shippingZoneIds) {
      setSelectedZones(new Set(currentVariant.shippingZoneIds));
    } else if (currentVariant?.useDefaultZones) {
      handleSelectAllZones();
    } else {
      setSelectedZones(new Set());
    }
  };

  // Apply zones to variant
  const applyZonesToVariant = (variantIndex) => {
    const comboKeys = Object.keys(combinationData);
    const comboKey = comboKeys[variantIndex];
    
    if (!comboKey) return;

    const selectedZoneObjects = shippingZones.filter(zone =>
      selectedZones.has(zone._id)
    );

    setCombinationData(prev => ({
      ...prev,
      [comboKey]: {
        ...prev[comboKey],
        useDefaultZones: selectedZones.size === shippingZones.length,
        selectedShippingZones: selectedZoneObjects,
        shippingZoneIds: Array.from(selectedZones),
      }
    }));

    setShowZoneSelector(false);
    setCurrentVariantIndex(null);
    setSelectedZones(new Set());
  };

  // Handle pickup changes for variants
  const handleVariantPickupChange = (variantIndex, field, value) => {
    const comboKeys = Object.keys(combinationData);
    const comboKey = comboKeys[variantIndex];
    
    if (!comboKey) return;

    setCombinationData(prev => ({
      ...prev,
      [comboKey]: {
        ...prev[comboKey],
        pickup: {
          ...prev[comboKey].pickup,
          [field]: value
        }
      }
    }));
  };

  // Fetch variation themes when category is selected
  useEffect(() => {
    const fetchVariationThemes = async () => {
      if (!form.category || !selectedCategory) {
        setCategoryVariationThemes([]);
        return;
      }

      setLoadingVariationThemes(true);
      try {
        const response = await fetch(`http://localhost:3092/${form.category}/variation-themes`, {
          credentials: 'include'
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch variation themes');
        }
        
        const data = await response.json();
        setCategoryVariationThemes(data.variationThemes || []);
      } catch (error) {
        console.error('Error fetching variation themes:', error);
        toast.error('Failed to load variation themes for this category');
        setCategoryVariationThemes([]);
      } finally {
        setLoadingVariationThemes(false);
      }
    };

    fetchVariationThemes();
  }, [form.category, selectedCategory]);

  // Generate combinations when theme values change
  useEffect(() => {
    if (!hasVariants || !form.variationTheme || form.variationTheme.length === 0) {
      setCombinations([]);
      setCombinationData({});
      return;
    }

    const selectedThemes = form.variationTheme;
    const hasAllValues = selectedThemes.every(theme => 
      themeValues[theme] && themeValues[theme].length > 0
    );

    if (!hasAllValues) {
      setCombinations([]);
      setCombinationData({});
      return;
    }

    const generateCombinations = (themes, values) => {
      if (themes.length === 0) return [{}];
      
      const [firstTheme, ...restThemes] = themes;
      const restCombinations = generateCombinations(restThemes, values);
      
      const combinations = [];
      for (const value of values[firstTheme] || []) {
        for (const restCombination of restCombinations) {
          combinations.push({
            [firstTheme]: value,
            ...restCombination
          });
        }
      }
      return combinations;
    };

    const newCombinations = generateCombinations(selectedThemes, themeValues);
    setCombinations(newCombinations);

    const newCombinationData = {};

    newCombinations.forEach((combination, index) => {
      const key = `combo_${index}`;
      newCombinationData[key] = combinationData[key] || {
        combination,
        image: null,
        imagePreview: null,
        sku: '',
        ean: '',
        upc: '',
        modelNumber: '',
        condition: 'new',
        price: '',
        stock: '',
        // Shipping configuration
        useDefaultZones: false,
        selectedShippingZones: [],
        shippingZoneIds: [],
        pickup: {
          available: false,
          address: {
            street: '',
            city: '',
            state: '',
            postcode: '',
            country: ''
          },
          instructions: '',
          hours: {}
        }
      };
    });

    const validKeys = newCombinations.map((_, index) => `combo_${index}`);
    Object.keys(newCombinationData).forEach(key => {
      if (!validKeys.includes(key)) {
        delete newCombinationData[key];
      }
    });

    setCombinationData(newCombinationData);
  }, [hasVariants, form.variationTheme, themeValues]);

  // Handle variant toggle
  const handleVariantToggle = (value) => {
    const hasVariantsValue = value === 'yes';
    setHasVariants(hasVariantsValue);
    
    if (!hasVariantsValue) {
      setVariantData([]);
      handleInput("variationTheme", []);
      setThemeValues({});
      setCombinations([]);
      setCombinationData({});
    }
  };

  // Handle variation theme selection
  const handleVariationThemeChange = (selectedThemes) => {
    handleInput("variationTheme", selectedThemes);
    
    const newThemeValues = { ...themeValues };
    Object.keys(newThemeValues).forEach(theme => {
      if (!selectedThemes.includes(theme)) {
        delete newThemeValues[theme];
      }
    });
    setThemeValues(newThemeValues);
  };

  // Handle theme value changes
  const handleThemeValueChange = (theme, values) => {
    setThemeValues(prev => ({
      ...prev,
      [theme]: values
    }));
  };

  // Add value to theme
  const addThemeValue = (theme, value) => {
    if (!value.trim()) return;
    
    const currentValues = themeValues[theme] || [];
    if (currentValues.includes(value.trim())) {
      toast.error(`Value "${value}" already exists for ${theme}`);
      return;
    }
    
    handleThemeValueChange(theme, [...currentValues, value.trim()]);
  };

  // Remove value from theme
  const removeThemeValue = (theme, valueToRemove) => {
    const currentValues = themeValues[theme] || [];
    handleThemeValueChange(theme, currentValues.filter(v => v !== valueToRemove));
  };

  // Handle combination data changes
  const handleCombinationChange = (comboKey, field, value) => {
    setCombinationData(prev => ({
      ...prev,
      [comboKey]: {
        ...prev[comboKey],
        [field]: value
      }
    }));
  };

  // Handle combination image upload
  const handleCombinationImage = (comboKey, file) => {
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setCombinationData(prev => ({
        ...prev,
        [comboKey]: {
          ...prev[comboKey],
          image: file,
          imagePreview: imageUrl
        }
      }));
    }
  };

  // Generate combination name
  const generateCombinationName = (combination) => {
    return Object.entries(combination)
      .map(([key, value]) => `${key}: ${value}`)
      .join(', ');
  };

  // Update variantData based on combinations
  useEffect(() => {
    if (combinations.length === 0) {
      setVariantData([]);
      return;
    }

    const newVariantData = combinations.map((combination, index) => {
      const comboKey = `combo_${index}`;
      const comboData = combinationData[comboKey];
      
      if (!comboData) return null;

      const combinationString = Object.values(combination).join(' ');
      const variantName = `${form.brand || ''} ${form.itemName || ''} ${combinationString}`.trim();

      return {
        name: variantName,
        variantAttributes: combination,
        sku: comboData.sku || '',
        upc: comboData.upc || '',
        ean: comboData.ean || '',
        modelNumber: comboData.modelNumber || '',
        condition: comboData.condition || 'new',
        price: comboData.price || '',
        stock: comboData.stock || '',
        image: comboData.image,
        imagePreview: comboData.imagePreview,
        // Include shipping configuration
        useDefaultZones: comboData.useDefaultZones || false,
        selectedShippingZones: comboData.selectedShippingZones || [],
        shippingZoneIds: comboData.shippingZoneIds || [],
        pickup: comboData.pickup || {
          available: false,
          address: {},
          instructions: '',
          hours: {}
        }
      };
    }).filter(Boolean);

    setVariantData(newVariantData);
  }, [combinations, combinationData, form.brand, form.itemName]);

  return (
    <>
      <h2 className="text-xl font-semibold">Details</h2>

      {/* Category Selection */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Category <span className="text-red-500">*</span>
          </label>
          {!hasMounted || loadingCategories ? (
            <Skeleton />
          ) : (
            <select
              value={form.category}
              onChange={(e) => handleInput("category", e.target.value)}
              className={`w-full border ${formErrors.category ? "border-red-500" : "border-gray-300"} rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
            >
              <option value="">Select a category</option>
              {categories.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
          )}
          {formErrors.category && (
            <p className="text-red-500 text-sm mt-1">{formErrors.category}</p>
          )}
        </div>

        {/* Show available variation themes */}
        {selectedCategory && categoryVariationThemes.length > 0 && (
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="text-sm font-medium text-blue-900 mb-2">
              Available Variation Themes for {selectedCategory.name}:
            </h4>
            <div className="flex flex-wrap gap-2">
              {categoryVariationThemes.map((theme) => (
                <span 
                  key={theme} 
                  className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs"
                >
                  {theme}
                </span>
              ))}
            </div>
            <p className="text-xs text-blue-700 mt-2">
              You can use these themes if your product has variants
            </p>
          </div>
        )}
      </div>

      {/* Variant Option */}
      <div className="space-y-4 mt-8">
        <h3 className="text-lg font-medium text-gray-800 border-b pb-2">Product Variants</h3>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Does your product have variants? (e.g., different colors, sizes, models)
          </label>
          <div className="flex gap-4">
            <label className="flex items-center">
              <input
                type="radio"
                name="hasVariants"
                value="no"
                checked={!hasVariants}
                onChange={(e) => handleVariantToggle(e.target.value)}
                className="mr-2"
              />
              No, single product
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="hasVariants"
                value="yes"
                checked={hasVariants}
                onChange={(e) => handleVariantToggle(e.target.value)}
                className="mr-2"
              />
              Yes, has variants
            </label>
          </div>
        </div>
      </div>

      {/* Variation Theme Selection */}
      {hasVariants && form.category && (
        <div className="space-y-4 mt-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Variation Theme <span className="text-red-500">*</span>
            </label>
            
            {loadingVariationThemes ? (
              <Skeleton />
            ) : categoryVariationThemes.length > 0 ? (
              <div className="space-y-2">
                <p className="text-sm text-gray-600">
                  Select the attributes that vary between your product variants:
                </p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {categoryVariationThemes.map((theme) => (
                    <label key={theme} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={form.variationTheme?.includes(theme) || false}
                        onChange={(e) => {
                          const currentThemes = form.variationTheme || [];
                          let newThemes;
                          
                          if (e.target.checked) {
                            newThemes = [...currentThemes, theme];
                          } else {
                            newThemes = currentThemes.filter(t => t !== theme);
                          }
                          
                          handleVariationThemeChange(newThemes);
                        }}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">{theme}</span>
                    </label>
                  ))}
                </div>
                
                {form.variationTheme && form.variationTheme.length > 0 && (
                  <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded">
                    <p className="text-sm text-green-800">
                      Selected: {form.variationTheme.join(', ')}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  This category does not have predefined variation themes. 
                  You can still create variants, but you will need to define your own attributes.
                </p>
                <input
                  type="text"
                  value={form.variationTheme ? form.variationTheme.join(', ') : ''}
                  onChange={(e) => {
                    const themes = e.target.value.split(',').map(t => t.trim()).filter(Boolean);
                    handleVariationThemeChange(themes);
                  }}
                  className={`mt-2 w-full border ${formErrors.variationTheme ? "border-red-500" : "border-gray-300"} rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                  placeholder="e.g., Color, Size, Storage (comma-separated)"
                />
              </div>
            )}
            
            {formErrors.variationTheme && (
              <p className="text-red-500 text-sm mt-1">{formErrors.variationTheme}</p>
            )}
          </div>
        </div>
      )}

      {/* Theme Values Input */}
      {hasVariants && form.variationTheme && form.variationTheme.length > 0 && (
        <div className="space-y-6 mt-8">
          <h3 className="text-lg font-medium text-gray-800 border-b pb-2">
            Define Variation Values
          </h3>
          <p className="text-sm text-gray-600">
            Add the possible values for each variation theme. These will be used to generate all possible combinations.
          </p>

          {form.variationTheme.map((theme) => (
            <div key={theme} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium text-gray-800 mb-3">{theme}</h4>
              
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  placeholder={`Add ${theme.toLowerCase()} value...`}
                  className="flex-1 border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      addThemeValue(theme, e.target.value);
                      e.target.value = '';
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={(e) => {
                    const input = e.target.previousElementSibling;
                    addThemeValue(theme, input.value);
                    input.value = '';
                  }}
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
                >
                  <Plus size={16} />
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                {(themeValues[theme] || []).map((value, index) => (
                  <div key={index} className="bg-white border border-gray-300 rounded px-3 py-1 flex items-center gap-2">
                    <span className="text-sm">{value}</span>
                    <button
                      type="button"
                      onClick={() => removeThemeValue(theme, value)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Minus size={14} />
                    </button>
                  </div>
                ))}
              </div>

              {(themeValues[theme] || []).length === 0 && (
                <p className="text-sm text-gray-500 italic">No values added yet. Press Enter or click + to add values.</p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* New Card-Based Combinations Layout */}
      {hasVariants && combinations.length > 0 && (
        <div className="space-y-6 mt-8">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-800 border-b pb-2 flex-1">
              Product Variants ({combinations.length})
            </h3>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="text-sm font-medium text-blue-900 mb-2">Instructions:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Each card represents a unique variant with its own pricing and shipping</li>
              <li>• Fill in all required information for each variant</li>
              <li>• Configure shipping zones and pickup options for each variant</li>
              <li>• Product names are auto-generated based on combinations</li>
            </ul>
          </div>

          <div className="grid gap-6">
            {combinations.map((combination, index) => {
              const comboKey = `combo_${index}`;
              const comboData = combinationData[comboKey] || {};
              const isExpanded = expandedVariant === index;
              
              return (
                <div key={comboKey} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                  {/* Variant Header */}
                  <div className="bg-gray-50 px-6 py-4 border-b">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Package className="w-5 h-5 text-blue-600" />
                        <div>
                          <h4 className="font-semibold text-gray-900">
                            {generateCombinationName(combination)}
                          </h4>
                          <p className="text-sm text-gray-600">
                            Variant {index + 1} of {combinations.length}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setExpandedVariant(isExpanded ? null : index)}
                        className={`px-4 py-2 rounded transition-colors ${
                          isExpanded 
                            ? 'bg-blue-600 text-white' 
                            : 'bg-white text-blue-600 border border-blue-600 hover:bg-blue-50'
                        }`}
                      >
                        {isExpanded ? 'Collapse' : 'Configure'}
                      </button>
                    </div>

                    {/* Quick Summary */}
                    {!isExpanded && (
                      <div className="mt-3 grid grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">SKU:</span>
                          <span className="ml-1 text-gray-900">{comboData.sku || 'Not set'}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Price:</span>
                          <span className="ml-1 text-gray-900">${comboData.price || '0.00'}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Stock:</span>
                          <span className="ml-1 text-gray-900">{comboData.stock || '0'}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Shipping:</span>
                          <span className="ml-1 text-gray-900">
                            {comboData.selectedShippingZones?.length > 0 
                              ? `${comboData.selectedShippingZones.length} zones` 
                              : 'Not configured'}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Expanded Content */}
                  {isExpanded && (
                    <div className="p-6 space-y-6">
                      {/* Image Upload */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Variant Image
                        </label>
                        <div className="flex items-center gap-4">
                          {comboData.imagePreview ? (
                            <div className="relative">
                              <Image
                                src={comboData.imagePreview}
                                alt="Variant image"
                                width={100}
                                height={100}
                                className="rounded border object-cover"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  setCombinationData(prev => ({
                                    ...prev,
                                    [comboKey]: {
                                      ...prev[comboKey],
                                      image: null,
                                      imagePreview: null
                                    }
                                  }));
                                }}
                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                              >
                                ×
                              </button>
                            </div>
                          ) : (
                            <div className="w-24 h-24 bg-gray-100 border-2 border-dashed border-gray-300 rounded flex items-center justify-center">
                              <Upload size={24} className="text-gray-400" />
                            </div>
                          )}
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleCombinationImage(comboKey, e.target.files[0])}
                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                          />
                        </div>
                      </div>

                      {/* Basic Information */}
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Left Column */}
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              SKU <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              value={comboData.sku || ''}
                              onChange={(e) => handleCombinationChange(comboKey, 'sku', e.target.value)}
                              placeholder="Enter unique SKU"
                              className={`w-full border ${formErrors[`${comboKey}_sku`] ? 'border-red-500' : 'border-gray-300'} rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                            />
                            {formErrors[`${comboKey}_sku`] && (
                              <p className="text-red-500 text-xs mt-1">{formErrors[`${comboKey}_sku`]}</p>
                            )}
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              EAN (13 digits)
                            </label>
                            <input
                              type="text"
                              value={comboData.ean || ''}
                              onChange={(e) => handleCombinationChange(comboKey, 'ean', e.target.value)}
                              placeholder="Enter EAN barcode"
                              className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              UPC (12 digits)
                            </label>
                            <input
                              type="text"
                              value={comboData.upc || ''}
                              onChange={(e) => handleCombinationChange(comboKey, 'upc', e.target.value)}
                              placeholder="Enter UPC barcode"
                              className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>
                        </div>

                        {/* Right Column */}
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Model Number
                            </label>
                            <input
                              type="text"
                              value={comboData.modelNumber || ''}
                              onChange={(e) => handleCombinationChange(comboKey, 'modelNumber', e.target.value)}
                              placeholder="Enter model number"
                              className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Condition <span className="text-red-500">*</span>
                            </label>
                            <select
                              value={comboData.condition || 'new'}
                              onChange={(e) => handleCombinationChange(comboKey, 'condition', e.target.value)}
                              className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                              <option value="new">New</option>
                              <option value="used">Used</option>
                              <option value="refurbished">Refurbished</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      {/* Pricing and Stock */}
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-4">
                          <DollarSign className="w-5 h-5 text-green-600" />
                          <h5 className="font-medium text-green-900">Pricing & Inventory</h5>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Price ($) <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              value={comboData.price || ''}
                              onChange={(e) => handleCombinationChange(comboKey, 'price', e.target.value)}
                              placeholder="0.00"
                              className={`w-full border ${formErrors[`${comboKey}_price`] ? 'border-red-500' : 'border-gray-300'} rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                            />
                            {formErrors[`${comboKey}_price`] && (
                              <p className="text-red-500 text-xs mt-1">{formErrors[`${comboKey}_price`]}</p>
                            )}
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Stock Quantity <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="number"
                              min="0"
                              value={comboData.stock || ''}
                              onChange={(e) => handleCombinationChange(comboKey, 'stock', e.target.value)}
                              placeholder="0"
                              className={`w-full border ${formErrors[`${comboKey}_stock`] ? 'border-red-500' : 'border-gray-300'} rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                            />
                            {formErrors[`${comboKey}_stock`] && (
                              <p className="text-red-500 text-xs mt-1">{formErrors[`${comboKey}_stock`]}</p>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Shipping Configuration */}
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-4">
                          <Truck className="w-5 h-5 text-blue-600" />
                          <h5 className="font-medium text-blue-900">Shipping Configuration</h5>
                          <span className="text-red-500">*</span>
                        </div>

                        {/* Shipping Zones Display */}
                        <div className="mb-4">
                          {comboData.selectedShippingZones && comboData.selectedShippingZones.length > 0 ? (
                            <div>
                              <div className="flex items-center justify-between mb-3">
                                <span className="text-sm font-medium text-gray-700">
                                  Selected Zones ({comboData.selectedShippingZones.length})
                                </span>
                                <button
                                  type="button"
                                  onClick={() => openZoneSelector(index)}
                                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                >
                                  Modify Zones
                                </button>
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                                {comboData.selectedShippingZones.map((zone) => {
                                  const getZoneTypeInfo = (zoneType) => {
                                    const types = {
                                      worldwide: { label: 'Worldwide', color: 'bg-purple-100 text-purple-800', icon: '🌍' },
                                      country: { label: 'Country', color: 'bg-blue-100 text-blue-800', icon: '🏛️' },
                                      state: { label: 'State/Region', color: 'bg-green-100 text-green-800', icon: '🗺️' },
                                      city: { label: 'City', color: 'bg-orange-100 text-orange-800', icon: '🏙️' },
                                      postcode: { label: 'Postcode', color: 'bg-red-100 text-red-800', icon: '📮' },
                                      street: { label: 'Street', color: 'bg-gray-100 text-gray-800', icon: '🏠' }
                                    };
                                    return types[zoneType] || types.country;
                                  };

                                  const zoneInfo = getZoneTypeInfo(zone.zoneType);
                                  return (
                                    <div key={zone._id} className="bg-white border border-gray-200 rounded p-2">
                                      <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                          <span className="text-sm">{zoneInfo.icon}</span>
                                          <div>
                                            <div className="text-xs font-medium text-gray-900 truncate max-w-24">
                                              {zone.name || `${zone.city || zone.state || zone.country}`}
                                            </div>
                                            <div className={`text-xs px-1 py-0.5 rounded ${zoneInfo.color}`}>
                                              {zoneInfo.label}
                                            </div>
                                          </div>
                                        </div>
                                        <div className="text-right">
                                          <div className="text-xs font-medium text-gray-900">
                                            ${zone.shippingCost || '0.00'}
                                          </div>
                                          <div className="text-xs text-gray-500">
                                            {zone.estimatedDeliveryDays?.min || 2}-{zone.estimatedDeliveryDays?.max || 7}d
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          ) : (
                            <div className="text-center py-6 border-2 border-dashed border-gray-300 rounded-lg">
                              <Truck className="mx-auto mb-2 text-gray-400" size={24} />
                              <p className="text-gray-600 text-sm font-medium">No shipping zones selected</p>
                              <p className="text-xs text-gray-500 mb-3">This variant needs shipping configuration</p>
                              <button
                                type="button"
                                onClick={() => openZoneSelector(index)}
                                className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                              >
                                <Plus size={14} />
                                Select Shipping Zones
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Pickup Configuration */}
                        <div className="mt-4 border-t pt-4">
                          <div className="flex items-center justify-between mb-3">
                            <label className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={comboData.pickup?.available || false}
                                onChange={(e) => handleVariantPickupChange(index, 'available', e.target.checked)}
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              />
                              <span className="text-sm font-medium text-gray-700">Enable Local Pickup</span>
                            </label>
                          </div>

                          {comboData.pickup?.available && (
                            <div className="space-y-3 bg-white border border-gray-200 rounded p-3">
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <input
                                  type="text"
                                  value={comboData.pickup?.address?.street || ''}
                                  onChange={(e) => handleVariantPickupChange(index, 'address', {
                                    ...comboData.pickup.address,
                                    street: e.target.value
                                  })}
                                  placeholder="Street Address"
                                  className={`w-full border ${formErrors[`${comboKey}_pickup_address`] ? 'border-red-500' : 'border-gray-300'} rounded px-2 py-1 text-sm focus:ring-1 focus:ring-blue-500`}
                                />
                                <input
                                  type="text"
                                  value={comboData.pickup?.address?.city || ''}
                                  onChange={(e) => handleVariantPickupChange(index, 'address', {
                                    ...comboData.pickup.address,
                                    city: e.target.value
                                  })}
                                  placeholder="City"
                                  className={`w-full border ${formErrors[`${comboKey}_pickup_city`] ? 'border-red-500' : 'border-gray-300'} rounded px-2 py-1 text-sm focus:ring-1 focus:ring-blue-500`}
                                />
                              </div>
                              <textarea
                                value={comboData.pickup?.instructions || ''}
                                onChange={(e) => handleVariantPickupChange(index, 'instructions', e.target.value)}
                                placeholder="Pickup instructions (optional)"
                                rows={2}
                                className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:ring-1 focus:ring-blue-500"
                              />
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Validation Status */}
                      <div className={`border rounded p-3 ${
                        comboData.sku && comboData.price && comboData.stock && 
                        (comboData.selectedShippingZones?.length > 0 || comboData.pickup?.available)
                          ? 'bg-green-50 border-green-200'
                          : 'bg-yellow-50 border-yellow-200'
                      }`}>
                        <div className="flex items-center gap-2 text-sm">
                          {comboData.sku && comboData.price && comboData.stock && 
                           (comboData.selectedShippingZones?.length > 0 || comboData.pickup?.available) ? (
                            <>
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              <span className="text-green-800 font-medium">Variant Complete</span>
                            </>
                          ) : (
                            <>
                              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                              <span className="text-yellow-800 font-medium">
                                Missing: {[
                                  !comboData.sku && 'SKU',
                                  !comboData.price && 'Price',
                                  !comboData.stock && 'Stock',
                                  !comboData.selectedShippingZones?.length && !comboData.pickup?.available && 'Shipping'
                                ].filter(Boolean).join(', ')}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Summary */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="font-medium text-green-900 mb-2">Variants Summary</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <div className="font-medium text-green-900">{combinations.length}</div>
                <div className="text-green-700">Total Variants</div>
              </div>
              <div>
                <div className="font-medium text-green-900">
                  {Object.values(combinationData).filter(combo => 
                    combo.sku && combo.price && combo.stock && 
                    (combo.selectedShippingZones?.length > 0 || combo.pickup?.available)
                  ).length}
                </div>
                <div className="text-green-700">Configured</div>
              </div>
              <div>
                <div className="font-medium text-green-900">
                  {Object.values(combinationData).reduce((sum, combo) => sum + (parseInt(combo.stock) || 0), 0)}
                </div>
                <div className="text-green-700">Total Stock</div>
              </div>
              <div>
                <div className="font-medium text-green-900">
                  ${Object.values(combinationData)
                    .filter(combo => combo.price)
                    .reduce((sum, combo) => sum + parseFloat(combo.price || 0), 0)
                    .toFixed(2)}
                </div>
                <div className="text-green-700">Total Value</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Zone Selector Modal */}
      {showZoneSelector && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-medium text-gray-900">Select Shipping Zones</h3>
              <button
                type="button"
                onClick={() => {
                  setShowZoneSelector(false);
                  setCurrentVariantIndex(null);
                  setSelectedZones(new Set());
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-4 border-b bg-gray-50">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">
                  {selectedZones.size} of {shippingZones.length} zones selected
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleSelectAllZones}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    Select All
                  </button>
                  <button
                    type="button"
                    onClick={handleClearAllZones}
                    className="text-sm text-red-600 hover:text-red-800"
                  >
                    Clear All
                  </button>
                </div>
              </div>
            </div>

            <div className="p-4 max-h-96 overflow-y-auto">
              {isLoadingZones ? (
                <div className="text-center py-8">Loading shipping zones...</div>
              ) : shippingZones.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No shipping zones available. Please create zones first.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {shippingZones.map((zone) => {
                    const getZoneTypeInfo = (zoneType) => {
                      const types = {
                        worldwide: { label: 'Worldwide', color: 'bg-purple-100 text-purple-800', icon: '🌍' },
                        country: { label: 'Country', color: 'bg-blue-100 text-blue-800', icon: '🏛️' },
                        state: { label: 'State/Region', color: 'bg-green-100 text-green-800', icon: '🗺️' },
                        city: { label: 'City', color: 'bg-orange-100 text-orange-800', icon: '🏙️' },
                        postcode: { label: 'Postcode', color: 'bg-red-100 text-red-800', icon: '📮' },
                        street: { label: 'Street', color: 'bg-gray-100 text-gray-800', icon: '🏠' }
                      };
                      return types[zoneType] || types.country;
                    };

                    const zoneInfo = getZoneTypeInfo(zone.zoneType);
                    const isSelected = selectedZones.has(zone._id);

                    return (
                      <div
                        key={zone._id}
                        className={`border rounded-lg p-3 cursor-pointer transition-all ${
                          isSelected 
                            ? 'border-blue-500 bg-blue-50' 
                            : 'border-gray-200 bg-white hover:border-gray-300'
                        }`}
                        onClick={() => handleZoneSelection(zone._id, !isSelected)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleZoneSelection(zone._id, !isSelected)}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-lg">{zoneInfo.icon}</span>
                            <div>
                              <div className="font-medium text-gray-900 text-sm">
                                {zone.name || `${zone.city || zone.state || zone.country}`}
                              </div>
                              <div className={`text-xs px-2 py-0.5 rounded inline-block ${zoneInfo.color}`}>
                                {zoneInfo.label}
                              </div>
                            </div>
                          </div>
                          <div className="text-right text-sm">
                            <div className="font-medium text-gray-900">
                              ${zone.shippingCost || '0.00'}
                            </div>
                            <div className="text-gray-500 text-xs">
                              {zone.estimatedDeliveryDays?.min || 2}-{zone.estimatedDeliveryDays?.max || 7} days
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between p-4 border-t bg-gray-50">
              <div className="text-sm text-gray-600">
                {selectedZones.size} zone{selectedZones.size !== 1 ? 's' : ''} selected
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowZoneSelector(false);
                    setCurrentVariantIndex(null);
                    setSelectedZones(new Set());
                  }}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => applyZonesToVariant(currentVariantIndex)}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  disabled={selectedZones.size === 0}
                >
                  Apply Selected Zones
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}