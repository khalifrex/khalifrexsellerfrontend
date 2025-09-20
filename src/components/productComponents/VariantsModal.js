import { motion } from "framer-motion";
import { Plus, Package } from "lucide-react";
import { getVariantDisplayName, formatPrice } from "@/utils/productUtils";

export const VariantsModal = ({ 
  show, 
  onClose, 
  selectedProduct, 
  productVariants,
  onVariantSelect,
  onAddNewVariant 
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
          <div className="flex gap-4 text-sm text-gray-600">
            {selectedProduct.khalifrexId && <span>ID: {selectedProduct.khalifrexId}</span>}
            {selectedProduct.brand && <span>Brand: {selectedProduct.brand}</span>}
            {selectedProduct.variationTheme && selectedProduct.variationTheme.length > 0 && (
              <span>Variation themes: {selectedProduct.variationTheme.join(', ')}</span>
            )}
          </div>
        </div>

        {/* Add New Variant Button */}
        <div className="mb-6">
          <button
            onClick={onAddNewVariant}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 border-2 border-dashed border-green-300 bg-green-50 text-green-700 hover:bg-green-100"
            style={{
              background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
              border: '2px dashed #22c55e'
            }}
          >
            <Plus className="w-5 h-5" />
            Add New Variant
          </button>
          <p className="text-sm text-gray-500 mt-2 text-center">
            Dont see the variant you want to sell? Create a new one!
          </p>
        </div>

        {/* Existing Variants Grid */}
        {productVariants.length > 0 ? (
          <>
            <h3 className="text-lg font-semibold mb-4">Existing Variants</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {productVariants.map((variant) => (
                <div
                  key={variant._id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start mb-3">
                    <h4 className="font-medium text-sm">{getVariantDisplayName(variant)}</h4>
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                      {variant.offerCount || 0} seller{(variant.offerCount || 0) !== 1 ? 's' : ''}
                    </span>
                  </div>
                  
                  {variant.khalifrexId && (
                    <p className="text-xs text-gray-600 mb-2 font-mono">ID: {variant.khalifrexId}</p>
                  )}
                  
                  {(variant.price || variant.lowestPrice) && (
                    <p className="text-lg font-semibold text-green-600 mb-3">
                      {variant.lowestPrice ? (
                        <>
                          From {formatPrice(variant.lowestPrice)}
                          {variant.price && variant.price !== variant.lowestPrice && (
                            <span className="text-sm text-gray-500 ml-2">
                              (MSRP: {formatPrice(variant.price)})
                            </span>
                          )}
                        </>
                      ) : (
                        formatPrice(variant.price)
                      )}
                    </p>
                  )}
                  
                  <button
                    onClick={() => onVariantSelect(variant)}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 text-sm"
                  >
                    <Plus className="w-4 h-4" />
                    Create Offer
                  </button>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-8">
            <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 mb-4">No existing variants for this product</p>
            <p className="text-sm text-gray-400">You can be the first to add a variant!</p>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};