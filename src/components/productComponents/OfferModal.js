import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, Truck, AlertCircle, MapPin, Globe, Loader } from "lucide-react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

const FieldError = ({ error }) => {
  if (!error) return null;
  return (
    <div className="flex items-center gap-1 text-red-600 text-sm mt-1">
      <AlertCircle className="w-4 h-4" />
      <span>{error}</span>
    </div>
  );
};

// Helper function to get zone type display name
const getZoneTypeDisplay = (zoneType) => {
  const displays = {
    worldwide: "Worldwide",
    country: "Country",
    state: "State/Region", 
    city: "City",
    postcode: "Postcode/ZIP",
    street: "Street"
  };
  return displays[zoneType] || zoneType;
};

// Helper function to format zone description
const formatZoneDescription = (zone) => {
  if (zone.description) return zone.description;
  
  switch (zone.zoneType) {
    case 'worldwide':
      return 'Ships worldwide';
    case 'country':
      return `Ships to ${zone.country}`;
    case 'state':
      return `Ships to ${zone.state}, ${zone.country}`;
    case 'city':
      return `Ships to ${zone.city}, ${zone.state}, ${zone.country}`;
    case 'postcode':
      return `Ships to ${zone.postcode}, ${zone.city}, ${zone.country}`;
    case 'street':
      return `Ships to ${zone.street}, ${zone.city}, ${zone.country}`;
    default:
      return 'Custom shipping zone';
  }
};

export const OfferModal = ({ 
  show, 
  onClose, 
  selectedVariant, 
  selectedProduct 
}) => {
  const [submitting, setSubmitting] = useState(false);
  const [loadingZones, setLoadingZones] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [shippingZones, setShippingZones] = useState([]);
  const [offerForm, setOfferForm] = useState({
    price: "",
    stock: "1",
    condition: "new",
    sellerSku: "",
    currency: "USD",
    
    // Updated shipping configuration
    useDefaultZones: false,
    selectedZoneIds: [],
    
    // Pickup configuration
    pickup: {
      available: false,
      address: {
        street: "",
        city: "",
        state: "",
        postcode: "",
        country: "Nigeria",
        countryCode: "NG"
      },
      instructions: "",
      hours: {
        monday: { open: "09:00", close: "17:00", available: true },
        tuesday: { open: "09:00", close: "17:00", available: true },
        wednesday: { open: "09:00", close: "17:00", available: true },
        thursday: { open: "09:00", close: "17:00", available: true },
        friday: { open: "09:00", close: "17:00", available: true },
        saturday: { open: "09:00", close: "17:00", available: true },
        sunday: { open: "09:00", close: "17:00", available: false }
      }
    }
  });

  const router = useRouter();

  // Load shipping zones when modal opens
  useEffect(() => {
    if (show) {
      loadShippingZones();
      
      // Set suggested price if available
      if (selectedVariant && (selectedVariant.lowestPrice || selectedVariant.price)) {
        const suggestedPrice = selectedVariant.lowestPrice || selectedVariant.price;
        setOfferForm(prev => ({
          ...prev,
          price: suggestedPrice ? suggestedPrice.toString() : ""
        }));
      }
    }
  }, [show, selectedVariant]);

  const loadShippingZones = async () => {
    setLoadingZones(true);
    try {
      const response = await fetch('http://localhost:3092/seller/zones', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setShippingZones(data.zones.all || []);
      } else {
        console.error('Failed to load shipping zones');
        toast.error('Failed to load shipping zones');
      }
    } catch (error) {
      console.error('Error loading shipping zones:', error);
      toast.error('Error loading shipping zones');
    } finally {
      setLoadingZones(false);
    }
  };

  if (!show || !selectedVariant || !selectedProduct) return null;

  const handleOfferFormChange = (field, value) => {
    // Clear error for this field when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }

    if (field.includes('.')) {
      const [parent, child, grandchild] = field.split('.');
      setOfferForm(prev => {
        if (grandchild) {
          return {
            ...prev,
            [parent]: {
              ...prev[parent],
              [child]: {
                ...prev[parent][child],
                [grandchild]: value
              }
            }
          };
        } else {
          return {
            ...prev,
            [parent]: {
              ...prev[parent],
              [child]: value
            }
          };
        }
      });
    } else {
      setOfferForm(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleZoneSelection = (zoneId) => {
    setOfferForm(prev => ({
      ...prev,
      selectedZoneIds: prev.selectedZoneIds.includes(zoneId)
        ? prev.selectedZoneIds.filter(id => id !== zoneId)
        : [...prev.selectedZoneIds, zoneId]
    }));
  };

  const handlePickupHourChange = (day, field, value) => {
    setOfferForm(prev => ({
      ...prev,
      pickup: {
        ...prev.pickup,
        hours: {
          ...prev.pickup.hours,
          [day]: {
            ...prev.pickup.hours[day],
            [field]: value
          }
        }
      }
    }));
  };

  const validateForm = () => {
    const errors = {};

    // Basic validation
    if (!offerForm.price || parseFloat(offerForm.price) <= 0) {
      errors.price = "Please enter a valid price greater than 0";
    }

    if (!offerForm.stock || parseInt(offerForm.stock) <= 0) {
      errors.stock = "Please enter valid stock quantity";
    }

    if (!offerForm.condition) {
      errors.condition = "Please select a condition";
    }

    // Shipping validation - must have at least one shipping option
    const hasShippingZones = offerForm.useDefaultZones || offerForm.selectedZoneIds.length > 0;
    const hasPickup = offerForm.pickup.available;

    if (!hasShippingZones && !hasPickup) {
      errors.shipping = "Please select at least one shipping option (zones or pickup)";
    }

    // Pickup address validation
    if (offerForm.pickup.available) {
      if (!offerForm.pickup.address.street) {
        errors.pickupStreet = "Street address is required for pickup";
      }
      if (!offerForm.pickup.address.city) {
        errors.pickupCity = "City is required for pickup";
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const getCleanVariantId = (variant) => {
    return variant._id || variant.objectID || variant.khalifrexId;
  };

  const getVariantDisplayName = (variant) => {
    if (!variant) return 'Unknown Variant';
    
    let displayName = variant.name || variant.title || 'Variant';
    
    if (variant.attributes && Object.keys(variant.attributes).length > 0) {
      const attributeStrings = Object.entries(variant.attributes)
        .slice(0, 2)
        .map(([key, value]) => `${key}: ${value}`);
      
      if (attributeStrings.length > 0) {
        displayName += ` (${attributeStrings.join(', ')})`;
      }
    }
    
    return displayName;
  };

  const formatPrice = (price) => {
    if (price === null || price === undefined) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(price);
  };

  const handleSubmitOffer = async () => {
    if (!validateForm()) {
      toast.error("Please fix the form errors before submitting");
      return;
    }

    setSubmitting(true);
    try {
      const cleanVariantId = getCleanVariantId(selectedVariant);
      
      // Prepare the request body according to your backend schema
      const requestBody = {
        price: parseFloat(offerForm.price),
        stock: parseInt(offerForm.stock),
        condition: offerForm.condition,
        sellerSku: offerForm.sellerSku || null,
        currency: offerForm.currency,
        
        // Shipping configuration
        useDefaultZones: offerForm.useDefaultZones,
        shippingZoneIds: offerForm.useDefaultZones ? [] : offerForm.selectedZoneIds,
        
        // Pickup configuration
        pickup: offerForm.pickup.available ? {
          available: true,
          address: {
            street: offerForm.pickup.address.street,
            city: offerForm.pickup.address.city,
            state: offerForm.pickup.address.state,
            postcode: offerForm.pickup.address.postcode,
            country: offerForm.pickup.address.country,
            countryCode: offerForm.pickup.address.countryCode
          },
          instructions: offerForm.pickup.instructions,
          hours: offerForm.pickup.hours
        } : {
          available: false
        }
      };

      const response = await fetch(`http://localhost:3092/variants/${cleanVariantId}/offers`, {
        method: 'POST', 
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(requestBody)
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Your offer has been created successfully!");
        onClose();
      } else {
        if (response.status === 409) {
          toast.error("You already have an offer for this variant. Please update your existing offer instead.");
        } else if (response.status === 400 && data.details) {
          const backendErrors = {};
          data.details.forEach(error => {
            if (error.includes('Price')) backendErrors.price = error;
            if (error.includes('Stock')) backendErrors.stock = error;
            if (error.includes('Condition')) backendErrors.condition = error;
          });
          setFormErrors(backendErrors);
          toast.error("Please fix the form errors");
        } else {
          toast.error(data.message || data.error || "Failed to create offer");
        }
      }
    } catch (error) {
      console.error('Submit error:', error);
      toast.error("Network error. Please check your connection and try again.");
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
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Create Your Offer</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
          >
            ✕
          </button>
        </div>
        
        {/* Selected Variant Summary */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h3 className="font-medium mb-2">{getVariantDisplayName(selectedVariant)}</h3>
          <p className="text-sm text-gray-600">Product: {selectedProduct.name}</p>
          {selectedVariant.khalifrexId && (
            <p className="text-sm text-gray-600 font-mono">Variant ID: {selectedVariant.khalifrexId}</p>
          )}
          {selectedVariant.lowestPrice && (
            <p className="text-sm text-green-600 mt-1">
              Current lowest price: {formatPrice(selectedVariant.lowestPrice)}
            </p>
          )}
        </div>

        <div className="space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Price *
              </label>
              <div className="relative">
                <select
                  value={offerForm.currency}
                  onChange={(e) => handleOfferFormChange('currency', e.target.value)}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 bg-transparent border-none text-sm focus:outline-none"
                >
                  <option value="USD">$</option>
                  <option value="NGN">₦</option>
                  <option value="EUR">€</option>
                  <option value="GBP">£</option>
                </select>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={offerForm.price}
                  onChange={(e) => handleOfferFormChange('price', e.target.value)}
                  className={`w-full border rounded-lg pl-12 pr-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    formErrors.price ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="0.00"
                  required
                />
              </div>
              <FieldError error={formErrors.price} />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Stock Quantity *
              </label>
              <input
                type="number"
                min="1"
                value={offerForm.stock}
                onChange={(e) => handleOfferFormChange('stock', e.target.value)}
                className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  formErrors.stock ? 'border-red-500' : 'border-gray-300'
                }`}
                required
              />
              <FieldError error={formErrors.stock} />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Condition *
              </label>
              <select
                value={offerForm.condition}
                onChange={(e) => handleOfferFormChange('condition', e.target.value)}
                className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  formErrors.condition ? 'border-red-500' : 'border-gray-300'
                }`}
                required
              >
                <option value="new">New</option>
                <option value="used">Used</option>
                <option value="refurbished">Refurbished</option>
              </select>
              <FieldError error={formErrors.condition} />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your SKU (Optional)
              </label>
              <input
                type="text"
                value={offerForm.sellerSku}
                onChange={(e) => handleOfferFormChange('sellerSku', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Your internal SKU"
              />
            </div>
          </div>

          {/* Shipping Zones Configuration */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Truck className="w-5 h-5" />
              Shipping Configuration
            </h3>

            {loadingZones ? (
              <div className="flex items-center justify-center py-8">
                <Loader className="w-6 h-6 animate-spin text-blue-600 mr-2" />
                <span className="text-gray-600">Loading shipping zones...</span>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Use Default Zones Option */}
                <div className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg">
                  <input
                    type="checkbox"
                    id="useDefaultZones"
                    checked={offerForm.useDefaultZones}
                    onChange={(e) => {
                      handleOfferFormChange('useDefaultZones', e.target.checked);
                      if (e.target.checked) {
                        handleOfferFormChange('selectedZoneIds', []);
                      }
                    }}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <div>
                    <label htmlFor="useDefaultZones" className="font-medium text-gray-700 cursor-pointer">
                      Use All My Active Shipping Zones
                    </label>
                    <p className="text-sm text-gray-500">
                      Automatically use all your active shipping zones for this offer
                    </p>
                  </div>
                </div>

                {/* Manual Zone Selection */}
                {!offerForm.useDefaultZones && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Specific Shipping Zones
                    </label>
                    {shippingZones.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-64 overflow-y-auto border border-gray-200 rounded-lg p-3">
                        {shippingZones.map((zone) => (
                          <div
                            key={zone._id}
                            className={`flex items-start gap-3 p-3 border rounded-lg cursor-pointer transition-all ${
                              offerForm.selectedZoneIds.includes(zone._id)
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                            onClick={() => handleZoneSelection(zone._id)}
                          >
                            <input
                              type="checkbox"
                              checked={offerForm.selectedZoneIds.includes(zone._id)}
                              onChange={() => handleZoneSelection(zone._id)}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mt-0.5"
                            />
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <Globe className="w-4 h-4 text-gray-500" />
                                <span className="font-medium text-sm">
                                  {getZoneTypeDisplay(zone.zoneType)}
                                </span>
                                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                                  Priority: {zone.priority}
                                </span>
                              </div>
                              <p className="text-xs text-gray-600 mb-1">
                                {formatZoneDescription(zone)}
                              </p>
                              <div className="flex items-center gap-2 text-xs">
                                <span className="text-green-600 font-medium">
                                  {zone.shippingCost === 0 ? 'Free' : `${zone.currency} ${zone.shippingCost}`}
                                </span>
                                <span className="text-gray-500">
                                  {zone.estimatedDeliveryDays.min}-{zone.estimatedDeliveryDays.max} days
                                </span>
                              </div>
                              {zone.usage && (
                                <p className="text-xs text-gray-500 mt-1">
                                  Used by {zone.usage.offerCount} offer{zone.usage.offerCount !== 1 ? 's' : ''}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 border border-gray-200 rounded-lg">
                        <Truck className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-600 mb-2">No shipping zones found</p>
                        <p className="text-sm text-gray-500">
                          Create shipping zones first to enable delivery options
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            <FieldError error={formErrors.shipping} />
          </div>

          {/* Pickup Configuration */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Pickup Option
            </h3>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="pickupAvailable"
                  checked={offerForm.pickup.available}
                  onChange={(e) => handleOfferFormChange('pickup.available', e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <div>
                  <label htmlFor="pickupAvailable" className="font-medium text-gray-700 cursor-pointer">
                    Offer Pickup Option
                  </label>
                  <p className="text-sm text-gray-500">
                    Allow buyers to pick up items from your location
                  </p>
                </div>
              </div>

              {offerForm.pickup.available && (
                <div className="pl-6 border-l-2 border-blue-200 space-y-4">
                  {/* Pickup Address */}
                  <div>
                    <h4 className="font-medium text-gray-700 mb-3">Pickup Address</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Street Address *
                        </label>
                        <input
                          type="text"
                          value={offerForm.pickup.address.street}
                          onChange={(e) => handleOfferFormChange('pickup.address.street', e.target.value)}
                          className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                            formErrors.pickupStreet ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="123 Main Street"
                        />
                        <FieldError error={formErrors.pickupStreet} />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          City *
                        </label>
                        <input
                          type="text"
                          value={offerForm.pickup.address.city}
                          onChange={(e) => handleOfferFormChange('pickup.address.city', e.target.value)}
                          className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                            formErrors.pickupCity ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="Lagos"
                        />
                        <FieldError error={formErrors.pickupCity} />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          State/Region
                        </label>
                        <input
                          type="text"
                          value={offerForm.pickup.address.state}
                          onChange={(e) => handleOfferFormChange('pickup.address.state', e.target.value)}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Lagos State"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Postcode/ZIP
                        </label>
                        <input
                          type="text"
                          value={offerForm.pickup.address.postcode}
                          onChange={(e) => handleOfferFormChange('pickup.address.postcode', e.target.value)}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="100001"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Pickup Instructions */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Pickup Instructions (Optional)
                    </label>
                    <textarea
                      value={offerForm.pickup.instructions}
                      onChange={(e) => handleOfferFormChange('pickup.instructions', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      rows={3}
                      placeholder="Special instructions for pickup (e.g., parking info, entrance to use, etc.)"
                    />
                  </div>

                  {/* Pickup Hours */}
                  <div>
                    <h4 className="font-medium text-gray-700 mb-3">Pickup Hours</h4>
                    <div className="space-y-2">
                      {Object.entries(offerForm.pickup.hours).map(([day, hours]) => (
                        <div key={day} className="flex items-center gap-4">
                          <div className="w-20">
                            <label className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={hours.available}
                                onChange={(e) => handlePickupHourChange(day, 'available', e.target.checked)}
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              />
                              <span className="text-sm font-medium capitalize">{day}</span>
                            </label>
                          </div>
                          
                          {hours.available && (
                            <>
                              <input
                                type="time"
                                value={hours.open}
                                onChange={(e) => handlePickupHourChange(day, 'open', e.target.value)}
                                className="border border-gray-300 rounded px-3 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              />
                              <span className="text-gray-500">to</span>
                              <input
                                type="time"
                                value={hours.close}
                                onChange={(e) => handlePickupHourChange(day, 'close', e.target.value)}
                                className="border border-gray-300 rounded px-3 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              />
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
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
              type="submit"
              onClick={handleSubmitOffer}
              disabled={submitting}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 font-medium"
            >
              {submitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  Create Offer
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};