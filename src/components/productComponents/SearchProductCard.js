// Enhanced ProductCard.js - Location & Currency Aware
import { motion } from "framer-motion";
import { Package, Tag, Layers, ShoppingCart, MapPin, Truck } from "lucide-react";

export const ProductCard = ({ productGroup, index, onProductSelect, loading }) => {
  if (!productGroup || !productGroup.variants || productGroup.variants.length === 0) {
    return null;
  }

  // Use the first variant for display, or parent info if available
  const displayVariant = productGroup.variants[0];
  const parent = productGroup.parent;
  
  const {
    objectID,
    title,
    brand,
    category,
    mainImage,
    attributes = {},
    offers = {},
    totalStock = 0,
    parentId
  } = displayVariant;

  // Product info - prioritize parent info if available
  const productName = parent?.title || title || 'Unknown Product';
  const productBrand = parent?.brand || brand;
  const productCategory = parent?.category || category;
  const productImage = parent?.mainImage || mainImage;

  // Price information
  const currencySymbol = '$'; // Default, you might want to get this from offers
  const displayCurrency = offers.currency || 'USD';
  const price = offers.minPrice;
  const priceMax = offers.maxPrice;

  // Format price display
  const formatPrice = (priceValue) => {
    if (!priceValue) return `${currencySymbol}0.00`;
    
    // Format based on currency (some currencies don't need decimal places)
    const needsDecimals = !['JPY', 'KRW', 'VND'].includes(displayCurrency);
    const formattedPrice = needsDecimals 
      ? priceValue.toFixed(2) 
      : Math.round(priceValue).toString();
    
    return `${currencySymbol}${formattedPrice}`;
  };

  const displayPrice = formatPrice(price);
  const hasPriceRange = priceMax && priceMax !== price;
  const priceRangeText = hasPriceRange 
    ? `${displayPrice} - ${formatPrice(priceMax)}`
    : displayPrice;

  // Stock status
  const stock = totalStock;
  const stockStatus = stock > 0 
    ? stock > 10 ? 'In Stock' : `Only ${stock} left`
    : 'Out of Stock';
    
  const stockColor = stock > 10 
    ? 'text-green-600' 
    : stock > 0 
      ? 'text-orange-600' 
      : 'text-red-600';

  // Multiple variants indicator
  const hasMultipleVariants = productGroup.variants.length > 1;

  return (
    <motion.div
      key={productGroup.khalifrexId || objectID || index}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-200 relative"
    >
      {/* Multiple Variants Badge */}
      {hasMultipleVariants && (
        <div className="absolute top-2 right-2 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full flex items-center gap-1">
          <Layers className="w-3 h-3" />
          {productGroup.variants.length} variants
        </div>
      )}

      {/* Product Image */}
      <div className="aspect-square bg-gray-100 rounded-lg mb-4 overflow-hidden">
        {productImage ? (
          <img
            src={productImage}
            alt={productName}
            className="w-full h-full object-contain"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextElementSibling?.style.setProperty('display', 'flex');
            }}
          />
        ) : null}
        <div 
          className="w-full h-full flex items-center justify-center" 
          style={{ display: productImage ? 'none' : 'flex' }}
        >
          <Package className="w-12 h-12 text-gray-400" />
        </div>
      </div>

      {/* Product Info */}
      <div className="space-y-3">
        <h3 className="font-semibold text-gray-900 line-clamp-2 min-h-[2.5rem]">
          {productName}
        </h3>

        {/* Price Display - Most Prominent */}
        {price && (
          <div className="space-y-1">
            <div className="text-xl font-bold text-blue-600">
              {priceRangeText}
            </div>
            {displayCurrency !== 'USD' && (
              <div className="text-xs text-gray-500">
                Converted to {displayCurrency}
              </div>
            )}
          </div>
        )}
        
        {/* Product Identifiers */}
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Tag className="w-4 h-4" />
          <span className="font-mono">{productGroup.khalifrexId || objectID}</span>
        </div>

        {/* Brand & Category */}
        <div className="flex justify-between items-center text-sm">
          {productBrand && (
            <div className="text-gray-600">
              <span className="font-medium">{productBrand}</span>
            </div>
          )}
          {productCategory && (
            <div className="text-gray-600 capitalize">
              {productCategory}
            </div>
          )}
        </div>

        {/* Stock Status */}
        {stock > 0 && (
          <div className={`text-sm font-medium ${stockColor}`}>
            {stockStatus}
          </div>
        )}

        {/* Variant attributes preview (for single variants) */}
        {!hasMultipleVariants && attributes && Object.keys(attributes).length > 0 && (
          <div className="text-xs text-gray-500 space-y-1">
            {Object.entries(attributes).slice(0, 2).map(([key, value]) => (
              <div key={key}>
                <span className="capitalize">{key}:</span> <span className="font-mono">{value}</span>
              </div>
            ))}
          </div>
        )}

        {/* Action Button */}
        <div className="pt-2">
          <button
            onClick={() => onProductSelect?.(productGroup)}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
          >
            {hasMultipleVariants ? (
              <>
                <Layers className="w-4 h-4" />
                Choose Variant
              </>
            ) : (
              <>
                <ShoppingCart className="w-4 h-4" />
                Create Offer
              </>
            )}
          </button>
        </div>
      </div>
    </motion.div>
  );
};