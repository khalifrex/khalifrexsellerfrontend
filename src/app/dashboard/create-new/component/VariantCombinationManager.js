import { Package, DollarSign, Truck, Plus, X, Upload, CheckCircle, AlertTriangle, Edit3, Weight, Ruler, Barcode } from "lucide-react";
import Image from "next/image";

// GTIN validation utilities
const validateGTIN = (gtin, type) => {
  if (!gtin || !type) return false;
  
  const cleanGtin = gtin.replace(/\D/g, '');
  
  if (type === 'UPC' && cleanGtin.length !== 12) return false;
  if (type === 'EAN' && cleanGtin.length !== 13) return false;
  
  return true;
};

const normalizeToGTIN14 = (gtin, type) => {
  if (!gtin) return '';
  
  const cleanGtin = gtin.replace(/\D/g, '');
  
  if (type === 'UPC' && cleanGtin.length === 12) {
    return '0' + cleanGtin; // Pad UPC-12 to GTIN-14
  }
  if (type === 'EAN' && cleanGtin.length === 13) {
    return '0' + cleanGtin; // Pad EAN-13 to GTIN-14
  }
  
  return cleanGtin;
};

export default function VariantCombinationManager({
  combinations,
  combinationData,
  setCombinationData,
  formErrors,
  form,
  expandedVariant,
  setExpandedVariant,
  shippingZones,
  isLoadingZones,
  selectedZones,
  setSelectedZones,
  showZoneSelector,
  setShowZoneSelector,
  currentVariantIndex,
  setCurrentVariantIndex,
  handleZoneSelection,
  handleSelectAllZones,
  handleClearAllZones,
}) {

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

  // Handle nested field changes (dimensions, pickup address)
  const handleNestedFieldChange = (comboKey, parentField, childField, value) => {
    setCombinationData(prev => ({
      ...prev,
      [comboKey]: {
        ...prev[comboKey],
        [parentField]: {
          ...prev[comboKey][parentField],
          [childField]: value
        }
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

  // Auto-generate SKU based on form data and combination
  const generateSKU = (combination, index) => {
    const brand = (form.brand || 'BRAND').toUpperCase().replace(/[^A-Z0-9]/g, '');
    const model = (form.modelNumber || 'MODEL').toUpperCase().replace(/[^A-Z0-9]/g, '');
    const variant = Object.values(combination).join('-').toUpperCase().replace(/[^A-Z0-9]/g, '-');
    const timestamp = Date.now().toString().slice(-4);
    
    return `${brand}-${model}-${variant}-${timestamp}`;
  };

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

    if (field.includes('.')) {
      const [parentField, childField] = field.split('.');
      setCombinationData(prev => ({
        ...prev,
        [comboKey]: {
          ...prev[comboKey],
          pickup: {
            ...prev[comboKey].pickup,
            [parentField]: {
              ...prev[comboKey].pickup[parentField],
              [childField]: value
            }
          }
        }
      }));
    } else {
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
    }
  };

  // Check if variant is complete
  const isVariantComplete = (comboData) => {
    const hasBasicInfo = comboData.sku && comboData.price && comboData.stock !== undefined;
    const hasGTIN = comboData.gtinType && comboData.gtin && validateGTIN(comboData.gtin, comboData.gtinType);
    const hasShipping = (comboData.selectedShippingZones?.length > 0 || comboData.pickup?.available);
    
    return hasBasicInfo && hasGTIN && hasShipping;
  };

  const completedVariants = Object.values(combinationData).filter(isVariantComplete).length;
  const totalStock = Object.values(combinationData).reduce((sum, combo) => sum + (parseInt(combo.stock) || 0), 0);
  const totalValue = Object.values(combinationData)
    .filter(combo => combo.price)
    .reduce((sum, combo) => sum + parseFloat(combo.price || 0), 0);

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Product Variants</h3>
          <p className="text-sm text-gray-600 mt-1">
            Configure complete variant details including GTIN, dimensions, pricing, and shipping
          </p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-blue-600">{combinations.length}</div>
          <div className="text-xs text-gray-500">Total Variants</div>
        </div>
      </div>

      {/* Enhanced Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex items-start gap-3">
          <div className="bg-blue-100 p-1 rounded">
            <Edit3 className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <h4 className="text-sm font-medium text-blue-900 mb-2">Complete Variant Configuration</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Each variant needs a unique SKU and valid GTIN (UPC-12 or EAN-13)</li>
              <li>• Add weight and dimensions for accurate shipping calculations</li>
              <li>• Configure pricing, inventory, and shipping zones for each variant</li>
              <li>• Upload variant-specific images to help customers distinguish options</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Variants Grid */}
      <div className="grid gap-6">
        {combinations.map((combination, index) => {
          const comboKey = `combo_${index}`;
          const comboData = combinationData[comboKey] || {};
          const isExpanded = expandedVariant === index;
          const isComplete = isVariantComplete(comboData);
          const hasGTINError = comboData.gtinType && comboData.gtin && !validateGTIN(comboData.gtin, comboData.gtinType);
          
          return (
            <div key={comboKey} className="bg-gray-50 border border-gray-200 rounded-lg overflow-hidden">
              {/* Variant Header */}
              <div className="bg-white px-6 py-4 border-b">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
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
                  </div>
                  
                  <div className="flex items-center gap-3">
                    {/* Status Indicator */}
                    <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${
                      isComplete 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {isComplete ? (
                        <><CheckCircle className="w-3 h-3" /> Complete</>
                      ) : (
                        <><AlertTriangle className="w-3 h-3" /> Incomplete</>
                      )}
                    </div>
                    
                    {/* Toggle Button */}
                    <button
                      type="button"
                      onClick={() => setExpandedVariant(isExpanded ? null : index)}
                      className={`px-4 py-2 rounded-lg transition-colors text-sm font-medium ${
                        isExpanded 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-white text-blue-600 border border-blue-600 hover:bg-blue-50'
                      }`}
                    >
                      {isExpanded ? 'Collapse' : 'Configure'}
                    </button>
                  </div>
                </div>

                {/* Quick Summary */}
                {!isExpanded && (
                  <div className="mt-4 grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500 font-medium">SKU:</span>
                      <span className={comboData.sku ? 'text-gray-900' : 'text-gray-400'}>
                        {comboData.sku || 'Not set'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500 font-medium">GTIN:</span>
                      <span className={
                        comboData.gtin 
                          ? (hasGTINError ? 'text-red-600' : 'text-green-600')
                          : 'text-gray-400'
                      }>
                        {comboData.gtin ? `${comboData.gtinType}-${comboData.gtin.slice(-4)}` : 'Not set'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500 font-medium">Price:</span>
                      <span className={comboData.price ? 'text-green-600 font-medium' : 'text-gray-400'}>
                        ${comboData.price || '0.00'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500 font-medium">Stock:</span>
                      <span className={comboData.stock ? 'text-blue-600 font-medium' : 'text-gray-400'}>
                        {comboData.stock || '0'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500 font-medium">Shipping:</span>
                      <span className={
                        (comboData.selectedShippingZones?.length > 0 || comboData.pickup?.available) 
                          ? 'text-green-600' 
                          : 'text-red-500'
                      }>
                        {comboData.selectedShippingZones?.length > 0 
                          ? `${comboData.selectedShippingZones.length} zones` 
                          : comboData.pickup?.available 
                            ? 'Pickup only'
                            : 'Not configured'}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Expanded Content */}
              {isExpanded && (
                <div className="p-6 space-y-6 bg-white">
                  {/* Image Upload */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Variant Image (Optional)
                    </label>
                    <div className="flex items-center gap-4">
                      {comboData.imagePreview ? (
                        <div className="relative">
                          <Image
                            src={comboData.imagePreview}
                            alt="Variant image"
                            width={100}
                            height={100}
                            className="rounded-lg border object-cover"
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
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                          >
                            ×
                          </button>
                        </div>
                      ) : (
                        <div className="w-24 h-24 bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                          <Upload size={24} className="text-gray-400" />
                        </div>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleCombinationImage(comboKey, e.target.files[0])}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* Basic Information Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Left Column - Identification */}
                    <div className="space-y-4">
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <Barcode className="w-5 h-5 text-blue-600" />
                          <h5 className="font-medium text-blue-900">Product Identification</h5>
                        </div>
                        
                        <div className="space-y-3">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              SKU <span className="text-red-500">*</span>
                            </label>
                            <div className="flex gap-2">
                              <input
                                type="text"
                                value={comboData.sku || ''}
                                onChange={(e) => handleCombinationChange(comboKey, 'sku', e.target.value)}
                                placeholder="Enter unique SKU"
                                className={`flex-1 border ${formErrors[`${comboKey}_sku`] ? 'border-red-500' : 'border-gray-300'} rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                              />
                              <button
                                type="button"
                                onClick={() => handleCombinationChange(comboKey, 'sku', generateSKU(combination, index))}
                                className="px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm"
                                title="Generate SKU"
                              >
                                Generate
                              </button>
                            </div>
                            {formErrors[`${comboKey}_sku`] && (
                              <p className="text-red-500 text-xs mt-1">{formErrors[`${comboKey}_sku`]}</p>
                            )}
                          </div>

                          {/* GTIN Configuration */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              GTIN Type <span className="text-red-500">*</span>
                            </label>
                            <select
                              value={comboData.gtinType || ''}
                              onChange={(e) => {
                                handleCombinationChange(comboKey, 'gtinType', e.target.value);
                                // Clear GTIN when type changes
                                if (comboData.gtin) {
                                  handleCombinationChange(comboKey, 'gtin', '');
                                }
                              }}
                              className={`w-full border ${formErrors[`${comboKey}_gtinType`] ? 'border-red-500' : 'border-gray-300'} rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                            >
                              <option value="">Select GTIN Type</option>
                              <option value="UPC">UPC (12 digits)</option>
                              <option value="EAN">EAN (13 digits)</option>
                            </select>
                            {formErrors[`${comboKey}_gtinType`] && (
                              <p className="text-red-500 text-xs mt-1">{formErrors[`${comboKey}_gtinType`]}</p>
                            )}
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              GTIN <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              value={comboData.gtin || ''}
                              onChange={(e) => {
                                const value = e.target.value.replace(/\D/g, ''); // Only digits
                                handleCombinationChange(comboKey, 'gtin', value);
                              }}
                              placeholder={comboData.gtinType === 'UPC' ? '123456789012' : comboData.gtinType === 'EAN' ? '1234567890123' : 'Select GTIN type first'}
                              disabled={!comboData.gtinType}
                              maxLength={comboData.gtinType === 'UPC' ? 12 : 13}
                              className={`w-full border ${
                                formErrors[`${comboKey}_gtin`] || hasGTINError
                                  ? 'border-red-500' 
                                  : comboData.gtin && validateGTIN(comboData.gtin, comboData.gtinType)
                                    ? 'border-green-500'
                                    : 'border-gray-300'
                              } rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${!comboData.gtinType ? 'bg-gray-100' : ''}`}
                            />
                            {hasGTINError && (
                              <p className="text-red-500 text-xs mt-1">
                                Invalid {comboData.gtinType}: Must be {comboData.gtinType === 'UPC' ? '12' : '13'} digits
                              </p>
                            )}
                            {comboData.gtin && validateGTIN(comboData.gtin, comboData.gtinType) && (
                              <p className="text-green-600 text-xs mt-1">
                                ✓ Valid {comboData.gtinType} - Will be normalized to GTIN-14: {normalizeToGTIN14(comboData.gtin, comboData.gtinType)}
                              </p>
                            )}
                            {formErrors[`${comboKey}_gtin`] && (
                              <p className="text-red-500 text-xs mt-1">{formErrors[`${comboKey}_gtin`]}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right Column - Physical Properties */}
                    <div className="space-y-4">
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <Weight className="w-5 h-5 text-green-600" />
                          <h5 className="font-medium text-green-900">Physical Properties</h5>
                        </div>
                        
                        <div className="space-y-3">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Weight (grams)
                            </label>
                            <input
                              type="number"
                              min="0"
                              step="0.1"
                              value={comboData.weight || ''}
                              onChange={(e) => handleCombinationChange(comboKey, 'weight', e.target.value)}
                              placeholder="e.g., 500"
                              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>

                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <Ruler className="w-4 h-4 text-green-600" />
                              <label className="block text-sm font-medium text-gray-700">
                                Dimensions (cm)
                              </label>
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                              <input
                                type="number"
                                min="0"
                                step="0.1"
                                value={comboData.dimensions?.length || ''}
                                onChange={(e) => handleNestedFieldChange(comboKey, 'dimensions', 'length', e.target.value)}
                                placeholder="Length"
                                className="w-full border border-gray-300 rounded-lg px-2 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              />
                              <input
                                type="number"
                                min="0"
                                step="0.1"
                                value={comboData.dimensions?.width || ''}
                                onChange={(e) => handleNestedFieldChange(comboKey, 'dimensions', 'width', e.target.value)}
                                placeholder="Width"
                                className="w-full border border-gray-300 rounded-lg px-2 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              />
                              <input
                                type="number"
                                min="0"
                                step="0.1"
                                value={comboData.dimensions?.height || ''}
                                onChange={(e) => handleNestedFieldChange(comboKey, 'dimensions', 'height', e.target.value)}
                                placeholder="Height"
                                className="w-full border border-gray-300 rounded-lg px-2 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Condition <span className="text-red-500">*</span>
                            </label>
                            <select
                              value={comboData.condition || 'new'}
                              onChange={(e) => handleCombinationChange(comboKey, 'condition', e.target.value)}
                              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                              <option value="new">New</option>
                              <option value="used">Used</option>
                              <option value="refurbished">Refurbished</option>
                            </select>
                          </div>
                        </div>
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
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Price ($) <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={comboData.price || ''}
                          onChange={(e) => handleCombinationChange(comboKey, 'price', e.target.value)}
                          placeholder="0.00"
                          className={`w-full border ${formErrors[`${comboKey}_price`] ? 'border-red-500' : 'border-gray-300'} rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                        />
                        {formErrors[`${comboKey}_price`] && (
                          <p className="text-red-500 text-xs mt-1">{formErrors[`${comboKey}_price`]}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Stock Quantity <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={comboData.stock || ''}
                          onChange={(e) => handleCombinationChange(comboKey, 'stock', e.target.value)}
                          placeholder="0"
                          className={`w-full border ${formErrors[`${comboKey}_stock`] ? 'border-red-500' : 'border-gray-300'} rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
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
                                <div key={zone._id} className="bg-white border border-gray-200 rounded-lg p-2">
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
                            className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            <Plus size={14} />
                            Select Shipping Zones
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Pickup Configuration */}
                    <div className="border-t pt-4">
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
                        <div className="space-y-3 bg-white border border-gray-200 rounded-lg p-3">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <input
                              type="text"
                              value={comboData.pickup?.address?.street || ''}
                              onChange={(e) => handleVariantPickupChange(index, 'address.street', e.target.value)}
                              placeholder="Street Address"
                              className={`w-full border ${formErrors[`${comboKey}_pickup_address`] ? 'border-red-500' : 'border-gray-300'} rounded-lg px-2 py-1 text-sm focus:ring-1 focus:ring-blue-500`}
                            />
                            <input
                              type="text"
                              value={comboData.pickup?.address?.city || ''}
                              onChange={(e) => handleVariantPickupChange(index, 'address.city', e.target.value)}
                              placeholder="City"
                              className={`w-full border ${formErrors[`${comboKey}_pickup_city`] ? 'border-red-500' : 'border-gray-300'} rounded-lg px-2 py-1 text-sm focus:ring-1 focus:ring-blue-500`}
                            />
                          </div>
                          <textarea
                            value={comboData.pickup?.instructions || ''}
                            onChange={(e) => handleVariantPickupChange(index, 'instructions', e.target.value)}
                            placeholder="Pickup instructions (optional)"
                            rows={2}
                            className="w-full border border-gray-300 rounded-lg px-2 py-1 text-sm focus:ring-1 focus:ring-blue-500"
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Validation Status */}
                  <div className={`border rounded-lg p-3 ${
                    isComplete
                      ? 'bg-green-50 border-green-200'
                      : 'bg-yellow-50 border-yellow-200'
                  }`}>
                    <div className="flex items-start gap-2 text-sm">
                      {isComplete ? (
                        <>
                          <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                          <div>
                            <span className="text-green-800 font-medium">Variant Complete</span>
                            <p className="text-green-700 text-xs mt-1">
                              All required fields filled: SKU, GTIN, pricing, and shipping configured
                            </p>
                          </div>
                        </>
                      ) : (
                        <>
                          <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5" />
                          <div>
                            <span className="text-yellow-800 font-medium">Missing Required Fields:</span>
                            <div className="text-yellow-700 text-xs mt-1 space-y-1">
                              {!comboData.sku && <div>• SKU is required</div>}
                              {!comboData.gtinType && <div>• GTIN Type must be selected</div>}
                              {!comboData.gtin && <div>• GTIN is required</div>}
                              {comboData.gtin && !validateGTIN(comboData.gtin, comboData.gtinType) && <div>• Valid GTIN is required</div>}
                              {!comboData.price && <div>• Price must be set</div>}
                              {comboData.stock === undefined && <div>• Stock quantity is required</div>}
                              {!comboData.selectedShippingZones?.length && !comboData.pickup?.available && <div>• Shipping zones or pickup option required</div>}
                            </div>
                          </div>
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

      {/* Summary Statistics */}
      <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
        <h4 className="font-medium text-green-900 mb-3">Variants Summary</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-900">{combinations.length}</div>
            <div className="text-green-700">Total Variants</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-900">{completedVariants}</div>
            <div className="text-green-700">Configured</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-900">{totalStock}</div>
            <div className="text-green-700">Total Stock</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-900">${totalValue.toFixed(2)}</div>
            <div className="text-green-700">Total Value</div>
          </div>
        </div>
        
        {completedVariants < combinations.length && (
          <div className="mt-3 flex items-center gap-2 text-sm text-yellow-800 bg-yellow-100 rounded-lg p-2">
            <AlertTriangle className="w-4 h-4" />
            <span>
              {combinations.length - completedVariants} variant{combinations.length - completedVariants !== 1 ? 's' : ''} still need configuration
            </span>
          </div>
        )}
      </div>

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
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => applyZonesToVariant(currentVariantIndex)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  disabled={selectedZones.size === 0}
                >
                  Apply Selected Zones
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}