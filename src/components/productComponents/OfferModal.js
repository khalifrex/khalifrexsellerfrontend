import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Truck, BarChart3, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { getVariantDisplayName, formatPrice, getCleanVariantId } from "../../utils/productUtils";

const FieldError = ({ error }) => {
  if (!error) return null;
  return (
    <div className="flex items-center gap-1 text-red-600 text-sm mt-1">
      <AlertCircle className="w-4 h-4" />
      <span>{error}</span>
    </div>
  );
};

export const OfferModal = ({ 
  show, 
  onClose, 
  selectedVariant, 
  selectedProduct 
}) => {
  const [submitting, setSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [offerForm, setOfferForm] = useState({
    price: "",
    stock: "1",
    condition: "new",
    sellerSku: "",
    shippingInfo: {
      freeShipping: false,
      shippingCost: "",
      estimatedDelivery: "2-3 business days",
      shippingClass: "standard"
    },
    inventoryTracking: {
      inboundStock: "0"
    }
  });

  const router = useRouter();

  if (!show || !selectedVariant || !selectedProduct) return null;

  // Set suggested price when modal opens
  useState(() => {
    if (selectedVariant && (selectedVariant.lowestPrice || selectedVariant.price)) {
      const suggestedPrice = selectedVariant.lowestPrice || selectedVariant.price;
      setOfferForm(prev => ({
        ...prev,
        price: suggestedPrice ? suggestedPrice.toString() : ""
      }));
    }
  }, [selectedVariant]);

  const handleOfferFormChange = (field, value) => {
    // Clear error for this field when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }

    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setOfferForm(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setOfferForm(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!offerForm.price || parseFloat(offerForm.price) <= 0) {
      errors.price = "Please enter a valid price greater than 0";
    }

    if (!offerForm.stock || parseInt(offerForm.stock) <= 0) {
      errors.stock = "Please enter valid stock quantity";
    }

    if (!offerForm.condition) {
      errors.condition = "Please select a condition";
    }

    if (!offerForm.shippingInfo.freeShipping && 
        offerForm.shippingInfo.shippingCost && 
        parseFloat(offerForm.shippingInfo.shippingCost) < 0) {
      errors.shippingCost = "Shipping cost cannot be negative";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmitOffer = async () => {
    if (!validateForm()) {
      toast.error("Please fix the form errors before submitting");
      return;
    }

    setSubmitting(true);
    try {
      const cleanVariantId = getCleanVariantId(selectedVariant);
      const response = await fetch(`http://localhost:3092/variants/${cleanVariantId}/offers`, {
        method: 'POST', 
        headers: {
          'Content-Type':'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          price: parseFloat(offerForm.price),
          stock: parseInt(offerForm.stock),
          condition: offerForm.condition,
          sellerSku: offerForm.sellerSku || null,
          shippingInfo: {
            freeShipping: Boolean(offerForm.shippingInfo.freeShipping),
            shippingCost: offerForm.shippingInfo.freeShipping ? 0 : (parseFloat(offerForm.shippingInfo.shippingCost) || 0),
            estimatedDelivery: offerForm.shippingInfo.estimatedDelivery,
            shippingClass: offerForm.shippingInfo.shippingClass
          },
          inventoryTracking: {
            inboundStock: parseInt(offerForm.inventoryTracking.inboundStock) || 0
          }
        })
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Your offer has been created successfully!");
        onClose();
        
        // Reset form for next use
        setOfferForm({
          price: "",
          stock: "1",
          condition: "new",
          sellerSku: "",
          shippingInfo: {
            freeShipping: false,
            shippingCost: "",
            estimatedDelivery: "2-3 business days",
            shippingClass: "standard"
          },
          inventoryTracking: {
            inboundStock: "0"
          }
        });
        
        router.push('/dashboard/offers');
      } else {
        // Handle specific error cases
        if (response.status === 409) {
          toast.error("You already have an offer for this variant. Please update your existing offer instead.");
        } else if (response.status === 400 && data.details) {
          // Handle validation errors from backend
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
        className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-bold mb-4">Create Your Offer</h2>
        
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
                Your Price ($) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={offerForm.price}
                onChange={(e) => handleOfferFormChange('price', e.target.value)}
                className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  formErrors.price ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="0.00"
                required
              />
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

          {/* Shipping Information */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Truck className="w-5 h-5" />
              Shipping Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={offerForm.shippingInfo.freeShipping}
                    onChange={(e) => handleOfferFormChange('shippingInfo.freeShipping', e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Free Shipping</span>
                </label>
              </div>

              {!offerForm.shippingInfo.freeShipping && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Shipping Cost ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={offerForm.shippingInfo.shippingCost}
                    onChange={(e) => handleOfferFormChange('shippingInfo.shippingCost', e.target.value)}
                    className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      formErrors.shippingCost ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="0.00"
                  />
                  <FieldError error={formErrors.shippingCost} />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Shipping Class
                </label>
                <select
                  value={offerForm.shippingInfo.shippingClass}
                  onChange={(e) => handleOfferFormChange('shippingInfo.shippingClass', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="standard">Standard</option>
                  <option value="expedited">Expedited</option>
                  <option value="overnight">Overnight</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estimated Delivery
                </label>
                <input
                  type="text"
                  value={offerForm.shippingInfo.estimatedDelivery}
                  onChange={(e) => handleOfferFormChange('shippingInfo.estimatedDelivery', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="2-3 business days"
                />
              </div>
            </div>
          </div>

          {/* Inventory Tracking */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Inventory Tracking
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Inbound Stock (Optional)
                </label>
                <input
                  type="number"
                  min="0"
                  value={offerForm.inventoryTracking.inboundStock}
                  onChange={(e) => handleOfferFormChange('inventoryTracking.inboundStock', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Stock youre expecting to receive
                </p>
              </div>
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