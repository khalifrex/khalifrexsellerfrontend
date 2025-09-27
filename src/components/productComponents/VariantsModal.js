// components/productComponents/VariantsModal.js
import { motion } from "framer-motion";
import { Package, RefreshCw } from "lucide-react";
import { getVariantDisplayName, formatPrice } from "@/utils/productUtils";

export const VariantsModal = ({ 
  show, 
  onClose, 
  selectedProduct, 
  productVariants,
  onVariantSelect,
  onLoadMoreVariants,
  loadingVariants
}) => {
  if (!show || !selectedProduct) return null;

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
          <h2 className="text-xl font-bold">Select Variant to Sell</h2>
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
            {selectedProduct.variationTheme && selectedProduct.variationTheme.length > 0 && (
              <span>Variation themes: {selectedProduct.variationTheme.join(', ')}</span>
            )}
          </div>
        </div>

        {/* Variants Grid */}
        {productVariants.length > 0 ? (
          <>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Available Variants ({productVariants.length})</h3>
              {onLoadMoreVariants && selectedProduct.khalifrexId && (
                <button
                  onClick={() => onLoadMoreVariants(selectedProduct.khalifrexId)}
                  disabled={loadingVariants}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1 disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 ${loadingVariants ? 'animate-spin' : ''}`} />
                  {loadingVariants ? 'Loading...' : 'Refresh Variants'}
                </button>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
              {productVariants.map((variant) => (
                <motion.div
                  key={variant._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all hover:border-blue-300 cursor-pointer"
                  onClick={() => onVariantSelect(variant)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h4 className="font-medium text-sm mb-1">{getVariantDisplayName(variant)}</h4>
                      {variant.khalifrexId && (
                        <p className="text-xs text-gray-600 font-mono">ID: {variant.khalifrexId}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                        {variant.offerCount || 0} offer{(variant.offerCount || 0) !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>

                  {/* Variant Attributes */}
                  {variant.attributes && Object.keys(variant.attributes).length > 0 && (
                    <div className="mb-3">
                      <div className="flex flex-wrap gap-1">
                        {Object.entries(variant.attributes)
                          .slice(0, 3)
                          .map(([key, value]) => (
                            <span 
                              key={key} 
                              className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full"
                            >
                              {key}: {value}
                            </span>
                          ))}
                        {Object.keys(variant.attributes).length > 3 && (
                          <span className="text-xs text-gray-500 px-2 py-1">
                            +{Object.keys(variant.attributes).length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Price and Stock Info */}
                  <div className="space-y-2">
                    {(variant.price || variant.lowestPrice) && (
                      <div className="text-lg font-semibold text-green-600">
                        {variant.lowestPrice ? (
                          <>
                            From {formatPrice(variant.lowestPrice)}
                            {variant.price && variant.price !== variant.lowestPrice && (
                              <span className="text-sm text-gray-500 ml-2 font-normal">
                                (MSRP: {formatPrice(variant.price)})
                              </span>
                            )}
                          </>
                        ) : (
                          formatPrice(variant.price)
                        )}
                      </div>
                    )}

                    <div className="flex items-center justify-between text-sm">
                      <span className={`${
                        variant.stock > 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {variant.stock > 0 ? `${variant.stock} in stock` : 'Out of stock'}
                      </span>
                      
                      {variant.offerCount > 0 && (
                        <span className="text-gray-500">
                          {variant.offerCount} seller{variant.offerCount !== 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Action Button */}
                  <button
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 text-sm mt-3"
                    onClick={(e) => {
                      e.stopPropagation();
                      onVariantSelect(variant);
                    }}
                  >
                    <Package className="w-4 h-4" />
                    Create Offer for This Variant
                  </button>
                </motion.div>
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No variants found</h3>
            <p className="text-gray-500 mb-4">
              No variants are currently available for this product.
            </p>
            {onLoadMoreVariants && selectedProduct.khalifrexId && (
              <button
                onClick={() => onLoadMoreVariants(selectedProduct.khalifrexId)}
                disabled={loadingVariants}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2 mx-auto"
              >
                <RefreshCw className={`w-4 h-4 ${loadingVariants ? 'animate-spin' : ''}`} />
                {loadingVariants ? 'Loading...' : 'Try Refreshing'}
              </button>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="mt-6 pt-4 border-t text-center text-sm text-gray-500">
          Select a variant above to create your offer and start selling
        </div>
      </motion.div>
    </motion.div>
  );
};