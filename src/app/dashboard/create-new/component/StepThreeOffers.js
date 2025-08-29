"use client";

import { UploadCloud, XCircle } from "lucide-react";
import Image from "next/image";
import { useEffect } from "react";

export default function StepThreeOffers({
  form,
  formErrors,
  handleInput,
  getRootProps,
  getInputProps,
  isDragActive,
  hasMounted,
  imagePreviews,
  handleRemoveImage,
  variantData,
  hasVariants,
  offerData,
  setOfferData,
}) {

  // Handle offer input changes (only for simple products)
  const handleOfferInputChange = (index, field, value) => {
    const updated = [...offerData];
    if (!updated[index]) {
      updated[index] = {
        price: '',
        stock: '',
        condition: 'new',
        sellerSku: '',
        shippingInfo: {
          freeShipping: false,
          shippingCost: '',
          estimatedDelivery: '2-3 business days',
          shippingClass: ''
        },
        inventoryTracking: {
          reservedStock: '',
          inboundStock: ''
        }
      };
    }
    
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      updated[index][parent][child] = value;
    } else {
      updated[index][field] = value;
    }
    
    setOfferData(updated);
  };

  // Initialize offers for simple products only
  const initializeOffers = () => {
    if (!hasVariants) {
      // Single offer for simple product
      setOfferData([{
        variantIndex: null,
        variantName: 'Default',
        price: '',
        stock: '',
        condition: 'new',
        sellerSku: '',
        shippingInfo: {
          freeShipping: false,
          shippingCost: '',
          estimatedDelivery: '2-3 business days',
          shippingClass: ''
        },
        inventoryTracking: {
          reservedStock: '',
          inboundStock: ''
        }
      }]);
    } else {
      // For products with variants, offers are handled in the combination table
      setOfferData([]);
    }
  };

  // Initialize offers when component mounts or variants change
  useEffect(() => {
    if (!hasVariants) {
      initializeOffers();
    } else {
      setOfferData([]);
    }
  }, []);

  return (
    <>
      <h2 className="text-xl font-semibold">Images & Final Details</h2>
      
      {/* Product Images */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-800 border-b pb-2">Main Product Images</h3>
        <p className="text-sm text-gray-600">
          {hasVariants 
            ? "Upload main product images. Individual variant images can be added in the combinations table in the previous step."
            : "Upload images that represent your product."
          }
        </p>
        
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
            isDragActive ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-gray-400"
          }`}
        >
          <input {...getInputProps()} />
          <UploadCloud className="mx-auto mb-2 text-blue-500" size={48} />
          <p className="text-gray-700">
            {isDragActive ? "Drop images here..." : "Drag or click to select images"}
          </p>
          <p className="text-xs text-gray-500 mt-1">Maximum 5 images, JPEG/PNG format</p>
        </div>
        
        {formErrors.images && (
          <p className="text-red-500 text-sm">{formErrors.images}</p>
        )}

        {/* Image Previews */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-4">
          {hasMounted &&
            imagePreviews.map((src, idx) => (
              <div key={idx} className="relative group">
                <Image 
                  src={src} 
                  width={200} 
                  height={200} 
                  className="rounded border object-cover" 
                  alt={`Product image ${idx + 1}`} 
                />
                <button
                  type="button"
                  onClick={() => handleRemoveImage(idx)}
                  className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <XCircle size={18} />
                </button>
              </div>
            ))}
        </div>
      </div>

      {/* Variant Summary (for products with variants) */}
      {hasVariants && variantData.length > 0 && (
        <div className="space-y-4 mt-8">
          <h3 className="text-lg font-medium text-gray-800 border-b pb-2">
            Variant Summary ({variantData.length} combinations)
          </h3>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="text-sm font-medium text-blue-900 mb-2">Your Product Variants:</h4>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {variantData.map((variant, index) => (
                <div key={index} className="bg-white rounded p-3 border border-blue-200">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-sm text-gray-900">{variant.name}</p>
                      <p className="text-xs text-gray-600">
                        {Object.entries(variant.variantAttributes || {}).map(([key, value]) => `${key}: ${value}`).join(', ')}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        SKU: {variant.sku} | Price: ${variant.price} | Stock: {variant.stock}
                      </p>
                    </div>
                    {variant.imagePreview && (
                      <Image
                        src={variant.imagePreview}
                        alt="Variant"
                        width={40}
                        height={40}
                        className="rounded border object-cover"
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-3 pt-3 border-t border-blue-200">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-blue-700 font-medium">Total Stock: </span>
                  <span className="text-blue-900">{variantData.reduce((sum, v) => sum + (parseInt(v.stock) || 0), 0)} units</span>
                </div>
                <div>
                  <span className="text-blue-700 font-medium">Price Range: </span>
                  <span className="text-blue-900">
                    ${Math.min(...variantData.map(v => parseFloat(v.price) || 0))} - 
                    ${Math.max(...variantData.map(v => parseFloat(v.price) || 0))}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="font-medium text-green-900 mb-2">Ready to Submit!</h4>
            <p className="text-sm text-green-800">
              All {variantData.length} variants are configured with pricing and inventory. 
              Click "Create Product" to finalize your listing.
            </p>
          </div>
        </div>
      )}

      {/* Offers Section (only for simple products) */}
      {!hasVariants && (
        <div className="space-y-6 mt-8">
          <h3 className="text-lg font-medium text-gray-800 border-b pb-2">
            Create Offer (Single Product)
          </h3>
          
          <p className="text-sm text-gray-600">
            Create an offer for your product with pricing and inventory information.
          </p>

          {offerData.map((offer, index) => (
            <div key={index} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-md font-semibold text-gray-800">Product Offer</h4>
              </div>

              {/* Basic Offer Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {/* Price */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Price ($) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={offer.price || ''}
                    onChange={(e) => handleOfferInputChange(index, 'price', e.target.value)}
                    className={`w-full border ${formErrors[`offer_${index}_price`] ? "border-red-500" : "border-gray-300"} rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                    placeholder="0.00"
                  />
                  {formErrors[`offer_${index}_price`] && (
                    <p className="text-red-500 text-sm mt-1">{formErrors[`offer_${index}_price`]}</p>
                  )}
                </div>

                {/* Stock */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Stock Quantity <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={offer.stock || ''}
                    onChange={(e) => handleOfferInputChange(index, 'stock', e.target.value)}
                    className={`w-full border ${formErrors[`offer_${index}_stock`] ? "border-red-500" : "border-gray-300"} rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                    placeholder="0"
                  />
                  {formErrors[`offer_${index}_stock`] && (
                    <p className="text-red-500 text-sm mt-1">{formErrors[`offer_${index}_stock`]}</p>
                  )}
                </div>

                {/* Condition */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Condition <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={offer.condition || 'new'}
                    onChange={(e) => handleOfferInputChange(index, 'condition', e.target.value)}
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="new">New</option>
                    <option value="used">Used</option>
                    <option value="refurbished">Refurbished</option>
                  </select>
                </div>

                {/* Seller SKU */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Seller SKU
                  </label>
                  <input
                    type="text"
                    value={offer.sellerSku || ''}
                    onChange={(e) => handleOfferInputChange(index, 'sellerSku', e.target.value)}
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Your internal SKU"
                  />
                </div>
              </div>

              {/* Shipping Information */}
              <div className="border-t pt-4 mb-6">
                <h5 className="text-sm font-semibold text-gray-700 mb-3">Shipping Information</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Free Shipping */}
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id={`freeShipping_${index}`}
                      checked={offer.shippingInfo?.freeShipping || false}
                      onChange={(e) => handleOfferInputChange(index, 'shippingInfo.freeShipping', e.target.checked)}
                      className="mr-2"
                    />
                    <label htmlFor={`freeShipping_${index}`} className="text-sm text-gray-700">
                      Free Shipping
                    </label>
                  </div>

                  {/* Shipping Cost */}
                  {!offer.shippingInfo?.freeShipping && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Shipping Cost ($)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={offer.shippingInfo?.shippingCost || ''}
                        onChange={(e) => handleOfferInputChange(index, 'shippingInfo.shippingCost', e.target.value)}
                        className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="0.00"
                      />
                    </div>
                  )}

                  {/* Estimated Delivery */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Estimated Delivery
                    </label>
                    <input
                      type="text"
                      value={offer.shippingInfo?.estimatedDelivery || ''}
                      onChange={(e) => handleOfferInputChange(index, 'shippingInfo.estimatedDelivery', e.target.value)}
                      className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="2-3 business days"
                    />
                  </div>

                  {/* Shipping Class */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Shipping Class
                    </label>
                    <select
                      value={offer.shippingInfo?.shippingClass || ''}
                      onChange={(e) => handleOfferInputChange(index, 'shippingInfo.shippingClass', e.target.value)}
                      className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select shipping class</option>
                      <option value="standard">Standard</option>
                      <option value="expedited">Expedited</option>
                      <option value="overnight">Overnight</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Inventory Tracking */}
              <div className="border-t pt-4">
                <h5 className="text-sm font-semibold text-gray-700 mb-3">Inventory Tracking (Optional)</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Reserved Stock */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Reserved Stock
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={offer.inventoryTracking?.reservedStock || ''}
                      onChange={(e) => handleOfferInputChange(index, 'inventoryTracking.reservedStock', e.target.value)}
                      className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="0"
                    />
                    <p className="text-xs text-gray-500 mt-1">Stock held for pending orders</p>
                  </div>

                  {/* Inbound Stock */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Inbound Stock
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={offer.inventoryTracking?.inboundStock || ''}
                      onChange={(e) => handleOfferInputChange(index, 'inventoryTracking.inboundStock', e.target.value)}
                      className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="0"
                    />
                    <p className="text-xs text-gray-500 mt-1">Stock expected to arrive</p>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Summary for simple products */}
          {offerData.length > 0 && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-medium text-green-900 mb-2">Offer Summary</h4>
              <p className="text-sm text-green-800">
                1 offer configured for your product.
              </p>
              <div className="text-xs text-green-700 mt-1">
                Stock: {offerData.reduce((sum, offer) => sum + (parseInt(offer.stock) || 0), 0)} units
              </div>
            </div>
          )}
        </div>
      )}

      {/* Final Check */}
      <div className="mt-8 p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <h4 className="font-medium text-gray-900 mb-2">Pre-submission Checklist:</h4>
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <div className={`w-4 h-4 rounded-full ${imagePreviews.length > 0 ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className={imagePreviews.length > 0 ? 'text-green-800' : 'text-red-800'}>
              Product images uploaded ({imagePreviews.length}/5)
            </span>
          </div>
          
          {hasVariants ? (
            <div className="flex items-center gap-2">
              <div className={`w-4 h-4 rounded-full ${variantData.length > 0 && variantData.every(v => v.sku && v.price && v.stock) ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className={variantData.length > 0 && variantData.every(v => v.sku && v.price && v.stock) ? 'text-green-800' : 'text-red-800'}>
                All variants configured ({variantData.length} variants)
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <div className={`w-4 h-4 rounded-full ${offerData.length > 0 && offerData.every(o => o.price && o.stock) ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className={offerData.length > 0 && offerData.every(o => o.price && o.stock) ? 'text-green-800' : 'text-red-800'}>
                Product offer configured
              </span>
            </div>
          )}
        </div>
      </div>
    </>
  );
}