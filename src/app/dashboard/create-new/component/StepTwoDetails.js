"use client";

import { Info, CheckCircle, AlertCircle, Package2, Layers } from "lucide-react";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";

import { useShippingZones } from "@/hooks/useShippingZones";

// Components
import CategorySelector from "./CategorySelector";
import VariationThemeManager from "./VariationThemeManager";
import VariantCombinationManager from "./VariantCombinationManager";

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
  const [requiredVariants, setRequiredVariants] = useState([]);
  const [standaloneAllowed, setStandaloneAllowed] = useState(false);
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
  } = useShippingZones();

  // Initialize shipping zones - Fixed: Remove fetchShippingZones from dependencies
  useEffect(() => {
    if (hasVariants) {
      fetchShippingZones();
    }
  }, [hasVariants]);

  // Fetch variation themes when category is selected - Fixed: Remove handleInput from dependencies
  useEffect(() => {
    const fetchVariationThemes = async () => {
      if (!form.category || !selectedCategory) {
        setCategoryVariationThemes([]);
        setRequiredVariants([]);
        setStandaloneAllowed(false);
        return;
      }

      setLoadingVariationThemes(true);
      try {
        // Try to fetch from dedicated endpoint first, fallback to category data
        let response;
        try {
          response = await fetch(`http://localhost:3092/categories/${form.category}/variation-themes`, {
            credentials: 'include'
          });
        } catch (err) {
          // If endpoint doesn't exist, use category data directly
          response = null;
        }
        
        let data = {};
        if (response && response.ok) {
          data = await response.json();
        }
        
        // Extract category configuration - backend Category model fields
        const variationThemes = data.variationThemes || selectedCategory.variationThemes || [];
        const requiredVariants = data.requiredVariants || selectedCategory.requiredVariants || [];
        const standaloneAllowed = data.standaloneAllowed !== undefined 
          ? data.standaloneAllowed 
          : selectedCategory.standaloneAllowed || false;
        
        setCategoryVariationThemes(variationThemes);
        setRequiredVariants(requiredVariants);
        setStandaloneAllowed(standaloneAllowed);
        
        // Reset variant state when category changes (don't call handleInput here)
        setHasVariants(false);
        setThemeValues({});
        setCombinations([]);
        setCombinationData({});
        
      } catch (error) {
        console.error('Error fetching variation themes:', error);
        // Use category data as fallback
        setCategoryVariationThemes(selectedCategory.variationThemes || []);
        setRequiredVariants(selectedCategory.requiredVariants || []);
        setStandaloneAllowed(selectedCategory.standaloneAllowed || false);
      } finally {
        setLoadingVariationThemes(false);
      }
    };

    fetchVariationThemes();
  }, [form.category, selectedCategory]);

  // Separate useEffect to reset form variationTheme when category changes
  useEffect(() => {
    if (form.category) {
      handleInput("variationTheme", []);
    }
  }, [form.category]);

  // Auto-handle required variants and standalone logic
  useEffect(() => {
    if (!form.category || loadingVariationThemes) return;

    // If category doesn't allow standalone and has required variants, force variants mode
    if (!standaloneAllowed && requiredVariants.length > 0) {
      setHasVariants(true);
      
      // Auto-select required variants
      const currentThemes = form.variationTheme || [];
      const missingRequired = requiredVariants.filter(req => !currentThemes.includes(req));
      
      if (missingRequired.length > 0) {
        const updatedThemes = [...currentThemes, ...missingRequired];
        handleInput("variationTheme", updatedThemes);
        
        if (missingRequired.length > 0) {
          toast.success(`Required variation themes auto-selected: ${missingRequired.join(', ')}`);
        }
      }
    }
  }, [requiredVariants, standaloneAllowed, form.variationTheme, form.category, loadingVariationThemes, handleInput]);

  // Handle variant toggle with category validation
  const handleVariantToggle = (value) => {
    const hasVariantsValue = value === 'yes';
    
    // Validate against category requirements
    if (!hasVariantsValue && !standaloneAllowed) {
      toast.error('This category requires products to have variations');
      return;
    }
    
    if (!hasVariantsValue && requiredVariants.length > 0) {
      toast.error(`This category requires the following variation themes: ${requiredVariants.join(', ')}`);
      return;
    }
    
    setHasVariants(hasVariantsValue);
    
    if (!hasVariantsValue) {
      // Clear variant data for standalone products
      setVariantData([]);
      handleInput("variationTheme", []);
      setThemeValues({});
      setCombinations([]);
      setCombinationData({});
    } else if (requiredVariants.length > 0) {
      // Auto-select required variants when enabling variants
      handleInput("variationTheme", [...requiredVariants]);
    }
  };

  // Handle variation theme selection with validation
  const handleVariationThemeChange = (selectedThemes) => {
    // Ensure required variants are always included
    const allRequired = requiredVariants.every(req => selectedThemes.includes(req));
    if (requiredVariants.length > 0 && !allRequired) {
      const missingRequired = requiredVariants.filter(req => !selectedThemes.includes(req));
      selectedThemes = [...selectedThemes, ...missingRequired];
      toast.success(`Required themes automatically added: ${missingRequired.join(', ')}`);
    }
    
    // Validate against category's allowed themes (if any are defined)
    if (categoryVariationThemes.length > 0) {
      const invalidThemes = selectedThemes.filter(theme => 
        !categoryVariationThemes.includes(theme)
      );
      
      if (invalidThemes.length > 0) {
        toast.error(`Invalid themes for this category: ${invalidThemes.join(', ')}`);
        selectedThemes = selectedThemes.filter(theme => !invalidThemes.includes(theme));
      }
    }
    
    handleInput("variationTheme", selectedThemes);
    
    // Clean up theme values for removed themes
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

  // Generate combinations when theme values change - Fixed: Remove combinationData from dependencies and use functional update
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

    // Initialize combination data with backend-matching structure using functional update
    setCombinationData(prevCombinationData => {
      const newCombinationData = {};
      newCombinations.forEach((combination, index) => {
        const key = `combo_${index}`;
        newCombinationData[key] = prevCombinationData[key] || {
          combination,
          image: null,
          imagePreview: null,
          
          // Required backend fields
          sku: '',
          gtinType: '', // 'UPC' or 'EAN'
          gtin: '', // 12-digit UPC or 13-digit EAN
          
          // Optional backend fields
          description: '',
          weight: '', // in grams
          dimensions: { // in cm
            length: '',
            width: '',
            height: '',
            unit: 'cm'
          },
          attributes: {}, // Map of additional attributes
          
          // Offer-related fields (used in createOffers)
          condition: 'new',
          price: '',
          stock: '',
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

      // Clean up old combination data
      const validKeys = newCombinations.map((_, index) => `combo_${index}`);
      Object.keys(newCombinationData).forEach(key => {
        if (!validKeys.includes(key)) {
          delete newCombinationData[key];
        }
      });

      return newCombinationData;
    });
  }, [hasVariants, form.variationTheme, themeValues]);

  // Update variantData based on combinations for form submission
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
        // Backend createVariant fields
        name: variantName,
        variantAttributes: combination, // Map matching backend
        sku: comboData.sku || '',
        gtinType: comboData.gtinType || '',
        gtin: comboData.gtin || '',
        description: comboData.description || form.description, // Use product description as fallback
        weight: comboData.weight ? parseFloat(comboData.weight) : null,
        dimensions: (comboData.dimensions?.length || comboData.dimensions?.width || comboData.dimensions?.height) 
          ? {
              length: parseFloat(comboData.dimensions.length) || 0,
              width: parseFloat(comboData.dimensions.width) || 0,
              height: parseFloat(comboData.dimensions.height) || 0,
              unit: 'cm'
            }
          : null,
        attributes: comboData.attributes || {},
        
        // Image handling
        image: comboData.image,
        imagePreview: comboData.imagePreview,
        
        // Offer-related fields for createOffers step
        condition: comboData.condition || 'new',
        price: comboData.price || '',
        stock: comboData.stock || '',
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
  }, [combinations, combinationData, form.brand, form.itemName, form.description, setVariantData]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b pb-4">
        <h2 className="text-2xl font-bold text-gray-900">Product Details</h2>
        <p className="text-gray-600 mt-1">Configure your product category and variations</p>
      </div>

      {/* Category Selection */}
      <CategorySelector
        form={form}
        formErrors={formErrors}
        handleInput={handleInput}
        hasMounted={hasMounted}
        loadingCategories={loadingCategories}
        categories={categories}
        selectedCategory={selectedCategory}
      />

      {/* Category Configuration Display */}
      {selectedCategory && !loadingVariationThemes && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h4 className="font-medium text-blue-900 mb-2">
                Category: {selectedCategory.name}
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <div className="font-medium text-blue-800 mb-1">Available Themes</div>
                  <div className="text-blue-700">
                    {categoryVariationThemes.length > 0 
                      ? categoryVariationThemes.join(', ')
                      : 'Custom themes allowed'}
                  </div>
                </div>
                
                <div>
                  <div className="font-medium text-blue-800 mb-1">Required Themes</div>
                  <div className="text-blue-700">
                    {requiredVariants.length > 0 
                      ? requiredVariants.join(', ')
                      : 'None required'}
                  </div>
                </div>
                
                <div>
                  <div className="font-medium text-blue-800 mb-1">Standalone Products</div>
                  <div className="flex items-center gap-1 text-blue-700">
                    {standaloneAllowed ? (
                      <><CheckCircle className="w-4 h-4" /> Allowed</>
                    ) : (
                      <><AlertCircle className="w-4 h-4" /> Must have variants</>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Product Structure Decision */}
      {form.category && !loadingVariationThemes && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <Package2 className="w-5 h-5 text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900">Product Structure</h3>
          </div>
          
          {!standaloneAllowed && requiredVariants.length > 0 ? (
            // Category requires variants - show info and auto-enable
            <div className="space-y-4">
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-orange-900">Variations Required</h4>
                    <p className="text-orange-800 text-sm mt-1">
                      This category requires products to have variations with the following themes: {' '}
                      <span className="font-medium">{requiredVariants.join(', ')}</span>
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Auto-set hasVariants to true */}
              {!hasVariants && setTimeout(() => setHasVariants(true), 0)}
            </div>
          ) : (
            // Category allows choice between standalone and variations
            <div className="space-y-4">
              <div>
                <p className="text-gray-700 text-sm mb-4">
                  How would you like to structure this product?
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <label className="flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all hover:border-gray-300 has-[:checked]:border-blue-500 has-[:checked]:bg-blue-50">
                    <input
                      type="radio"
                      name="hasVariants"
                      value="no"
                      checked={!hasVariants}
                      onChange={(e) => handleVariantToggle(e.target.value)}
                      className="mt-1 w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Package2 className="w-4 h-4 text-gray-600" />
                        <div className="font-medium text-gray-900">Standalone Product</div>
                      </div>
                      <div className="text-sm text-gray-600">
                        Single product without variations. Best for unique items or when all units are identical.
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Example: A specific book edition, unique artwork
                      </div>
                    </div>
                  </label>
                  
                  <label className="flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all hover:border-gray-300 has-[:checked]:border-blue-500 has-[:checked]:bg-blue-50">
                    <input
                      type="radio"
                      name="hasVariants"
                      value="yes"
                      checked={hasVariants}
                      onChange={(e) => handleVariantToggle(e.target.value)}
                      className="mt-1 w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Layers className="w-4 h-4 text-gray-600" />
                        <div className="font-medium text-gray-900">Product with Variations</div>
                      </div>
                      <div className="text-sm text-gray-600">
                        Product with multiple variants (colors, sizes, models, etc.). Each variant can have different pricing and inventory.
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Example: T-shirt in different colors/sizes, phone in different storage capacities
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Category Requirements Info */}
              {requiredVariants.length > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5" />
                    <div className="text-sm">
                      <p className="text-yellow-800 font-medium">Note for this category:</p>
                      <p className="text-yellow-700">
                        If you choose variations, these themes are required: {' '}
                        <span className="font-medium">{requiredVariants.join(', ')}</span>
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Variation Theme Manager */}
      {hasVariants && form.category && (
        <VariationThemeManager
          form={form}
          formErrors={formErrors}
          handleInput={handleInput}
          categoryVariationThemes={categoryVariationThemes}
          requiredVariants={requiredVariants}
          loadingVariationThemes={loadingVariationThemes}
          handleVariationThemeChange={handleVariationThemeChange}
          themeValues={themeValues}
          addThemeValue={addThemeValue}
          removeThemeValue={removeThemeValue}
        />
      )}

      {/* Enhanced Variant Combination Manager */}
      {hasVariants && combinations.length > 0 && (
        <VariantCombinationManager
          combinations={combinations}
          combinationData={combinationData}
          setCombinationData={setCombinationData}
          formErrors={formErrors}
          form={form}
          expandedVariant={expandedVariant}
          setExpandedVariant={setExpandedVariant}
          shippingZones={shippingZones}
          isLoadingZones={isLoadingZones}
          selectedZones={selectedZones}
          setSelectedZones={setSelectedZones}
          showZoneSelector={showZoneSelector}
          setShowZoneSelector={setShowZoneSelector}
          currentVariantIndex={currentVariantIndex}
          setCurrentVariantIndex={setCurrentVariantIndex}
          handleZoneSelection={handleZoneSelection}
          handleSelectAllZones={handleSelectAllZones}
          handleClearAllZones={handleClearAllZones}
        />
      )}

      {/* Standalone Product Summary */}
      {!hasVariants && form.category && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <h4 className="font-medium text-green-900">Standalone Product Configuration</h4>
          </div>
          <div className="text-sm text-green-800 space-y-2">
            <p>✓ Your product will be created as a single standalone item</p>
            <p>✓ You&apos;ll configure pricing and inventory in the next step</p>
            <p>✓ No variations or combinations needed</p>
          </div>
          <div className="mt-4 p-3 bg-white border border-green-200 rounded">
            <div className="text-sm">
              <div className="font-medium text-gray-900 mb-1">Product Preview:</div>
              <div className="text-gray-700">
                {form.brand} {form.itemName} {form.modelName}
              </div>
              <div className="text-gray-500 text-xs mt-1">
                Category: {selectedCategory?.name} | Model: {form.modelNumber}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Progress Summary */}
      {form.category && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-3">Configuration Progress</h4>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
            <div className="flex items-center gap-2">
              {form.category ? (
                <CheckCircle className="w-4 h-4 text-green-600" />
              ) : (
                <div className="w-4 h-4 border-2 border-gray-300 rounded-full" />
              )}
              <span className={form.category ? 'text-green-700' : 'text-gray-600'}>
                Category Selected
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              {!hasVariants || (hasVariants && form.variationTheme?.length > 0) ? (
                <CheckCircle className="w-4 h-4 text-green-600" />
              ) : (
                <div className="w-4 h-4 border-2 border-gray-300 rounded-full" />
              )}
              <span className={!hasVariants || (hasVariants && form.variationTheme?.length > 0) ? 'text-green-700' : 'text-gray-600'}>
                Structure Defined
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              {!hasVariants || combinations.length > 0 ? (
                <CheckCircle className="w-4 h-4 text-green-600" />
              ) : (
                <div className="w-4 h-4 border-2 border-gray-300 rounded-full" />
              )}
              <span className={!hasVariants || combinations.length > 0 ? 'text-green-700' : 'text-gray-600'}>
                {hasVariants ? `${combinations.length} Variants Generated` : 'Single Product Ready'}
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              {!hasVariants || (combinations.length > 0 && Object.values(combinationData).filter(combo => 
                combo.sku && combo.gtinType && combo.gtin && combo.price && combo.stock !== undefined && 
                (combo.selectedShippingZones?.length > 0 || combo.pickup?.available)
              ).length === combinations.length) ? (
                <CheckCircle className="w-4 h-4 text-green-600" />
              ) : (
                <div className="w-4 h-4 border-2 border-gray-300 rounded-full" />
              )}
              <span className={!hasVariants || (combinations.length > 0 && Object.values(combinationData).filter(combo => 
                combo.sku && combo.gtinType && combo.gtin && combo.price && combo.stock !== undefined && 
                (combo.selectedShippingZones?.length > 0 || combo.pickup?.available)
              ).length === combinations.length) ? 'text-green-700' : 'text-gray-600'}>
                Details Complete
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}