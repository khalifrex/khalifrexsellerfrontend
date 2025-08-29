"use client";

import Skeleton from "../../../../components/sellerDashboardComponents/Skeleton";
import { PlusCircle, Trash2, Plus, X, Upload, Lock, Minus } from "lucide-react";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import Image from "next/image";

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

    // Generate all combinations
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

    // Initialize combination data for new combinations
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
          stock: ''
      };
    });

    // Remove data for combinations that no longer exist
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
      // Clear variants and variation theme when disabled
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
    
    // Clear theme values for unselected themes
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

      // Generate variant name from brand, product name, and combination
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
        imagePreview: comboData.imagePreview
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

        {/* Show available variation themes for selected category */}
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
              
              {/* Add new value */}
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

              {/* Display current values */}
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

      {/* Combinations Table */}
      {hasVariants && combinations.length > 0 && (
        <div className="space-y-6 mt-8">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-800 border-b pb-2 flex-1">
              Product Combinations ({combinations.length})
            </h3>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="text-sm font-medium text-blue-900 mb-2">Instructions:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Each row represents a unique combination of your selected variation values</li>
              <li>• Fill in the required information for each combination</li>
              <li>• Product names will be auto-generated based on your brand, product name, and combination</li>
              <li>• Each combination will become a separate child variant under the main product catalog</li>
            </ul>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                    Combination
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                    Image
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                    SKU *
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                    Identifiers
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                    Condition *
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                    Price ($) *
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                    Stock *
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {combinations.map((combination, index) => {
                  const comboKey = `combo_${index}`;
                  const comboData = combinationData[comboKey] || {};
                  
                  return (
                    <tr key={comboKey} className="hover:bg-gray-50">
                      {/* Combination */}
                      <td className="px-4 py-4 border-b">
                        <div className="text-sm font-medium text-gray-900">
                          {generateCombinationName(combination)}
                        </div>
                      </td>

                      {/* Image */}
                      <td className="px-4 py-4 border-b">
                        <div className="flex items-center gap-2">
                          {comboData.imagePreview ? (
                            <div className="relative">
                              <Image
                                src={comboData.imagePreview}
                                alt="Combination image"
                                width={60}
                                height={60}
                                className="rounded border object-cover"
                              />
                              <button
                                type="button"
                                onClick={() => handleCombinationChange(comboKey, 'image', null)}
                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
                              >
                                ×
                              </button>
                            </div>
                          ) : (
                            <div className="w-16 h-16 bg-gray-100 border-2 border-dashed border-gray-300 rounded flex items-center justify-center">
                              <Upload size={20} className="text-gray-400" />
                            </div>
                          )}
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleCombinationImage(comboKey, e.target.files[0])}
                            className="text-xs"
                          />
                        </div>
                      </td>

                      {/* SKU */}
                      <td className="px-4 py-4 border-b">
                        <input
                          type="text"
                          value={comboData.sku || ''}
                          onChange={(e) => handleCombinationChange(comboKey, 'sku', e.target.value)}
                          placeholder="Required"
                          className={`w-full border ${formErrors[`${comboKey}_sku`] ? 'border-red-500' : 'border-gray-300'} rounded px-2 py-1 text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500`}
                        />
                        {formErrors[`${comboKey}_sku`] && (
                          <p className="text-red-500 text-xs mt-1">{formErrors[`${comboKey}_sku`]}</p>
                        )}
                      </td>

                      {/* Identifiers */}
                      <td className="px-4 py-4 border-b">
                        <div className="space-y-2">
                          <input
                            type="text"
                            value={comboData.ean || ''}
                            onChange={(e) => handleCombinationChange(comboKey, 'ean', e.target.value)}
                            placeholder="EAN (13 digits)"
                            className="w-full border border-gray-300 rounded px-2 py-1 text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                          />
                          <input
                            type="text"
                            value={comboData.upc || ''}
                            onChange={(e) => handleCombinationChange(comboKey, 'upc', e.target.value)}
                            placeholder="UPC (12 digits)"
                            className="w-full border border-gray-300 rounded px-2 py-1 text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                          />
                          <input
                            type="text"
                            value={comboData.modelNumber || ''}
                            onChange={(e) => handleCombinationChange(comboKey, 'modelNumber', e.target.value)}
                            placeholder="Model Number"
                            className="w-full border border-gray-300 rounded px-2 py-1 text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                      </td>

                      {/* Condition */}
                      <td className="px-4 py-4 border-b">
                        <select
                          value={comboData.condition || 'new'}
                          onChange={(e) => handleCombinationChange(comboKey, 'condition', e.target.value)}
                          className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="new">New</option>
                          <option value="used">Used</option>
                          <option value="refurbished">Refurbished</option>
                        </select>
                      </td>

                      {/* Price */}
                      <td className="px-4 py-4 border-b">
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={comboData.price || ''}
                          onChange={(e) => handleCombinationChange(comboKey, 'price', e.target.value)}
                          placeholder="0.00"
                          className={`w-full border ${formErrors[`${comboKey}_price`] ? 'border-red-500' : 'border-gray-300'} rounded px-2 py-1 text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500`}
                        />
                        {formErrors[`${comboKey}_price`] && (
                          <p className="text-red-500 text-xs mt-1">{formErrors[`${comboKey}_price`]}</p>
                        )}
                      </td>

                      {/* Stock */}
                      <td className="px-4 py-4 border-b">
                        <input
                          type="number"
                          min="0"
                          value={comboData.stock || ''}
                          onChange={(e) => handleCombinationChange(comboKey, 'stock', e.target.value)}
                          placeholder="0"
                          className={`w-full border ${formErrors[`${comboKey}_stock`] ? 'border-red-500' : 'border-gray-300'} rounded px-2 py-1 text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500`}
                        />
                        {formErrors[`${comboKey}_stock`] && (
                          <p className="text-red-500 text-xs mt-1">{formErrors[`${comboKey}_stock`]}</p>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Summary */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="font-medium text-green-900 mb-2">Combinations Summary</h4>
            <p className="text-sm text-green-800">
              {combinations.length} combination{combinations.length !== 1 ? 's' : ''} will be created as child variants.
            </p>
            <div className="text-xs text-green-700 mt-1">
              Total stock across all combinations: {Object.values(combinationData).reduce((sum, combo) => sum + (parseInt(combo.stock) || 0), 0)} units
            </div>
          </div>
        </div>
      )}
    </>
  );
}