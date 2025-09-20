// Enhanced ProductCard.js - Location & Currency Aware
import { motion } from "framer-motion";
import { Package, Tag, Layers, ShoppingCart, MapPin, Truck } from "lucide-react";


export const ProductCard = ({ product, index, onProductSelect, loading }) => {
  const {
    _id,
    parentId,
    name,
    description,
    image,
    price,
    priceMax,
    currencySymbol = '$',
    displayCurrency = 'USD',
    rating,
    shipsToUserLocation,
    userCountry,
    condition,
    stock,
    brand,
    sku,
    upc,
    ean,
    mpn
  } = product;

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
  const stockStatus = stock > 0 
    ? stock > 10 ? 'In Stock' : `Only ${stock} left`
    : 'Out of Stock';
    
  const stockColor = stock > 10 
    ? 'text-green-600' 
    : stock > 0 
      ? 'text-orange-600' 
      : 'text-red-600';

  if (!_id) return null;

  return (
    <motion.div
      key={_id || index}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-200 relative"
    >
      {/* Shipping Badge */}
      {shipsToUserLocation && userCountry && (
        <div className="absolute top-2 right-2 bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full flex items-center gap-1">
          <Truck className="w-3 h-3" />
          Ships to {userCountry}
        </div>
      )}

      {/* Product Image */}
      <div className="aspect-square bg-gray-100 rounded-lg mb-4 overflow-hidden">
        {image ? (
          <img
            src={image}
            alt={name || 'Product'}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextElementSibling?.style.setProperty('display', 'flex');
            }}
          />
        ) : null}
        <div 
          className="w-full h-full flex items-center justify-center" 
          style={{ display: image ? 'none' : 'flex' }}
        >
          <Package className="w-12 h-12 text-gray-400" />
        </div>
      </div>

      {/* Product Info */}
      <div className="space-y-3">
        <h3 className="font-semibold text-gray-900 line-clamp-2 min-h-[2.5rem]">
          {name || 'Unknown Product'}
        </h3>

        {/* Price Display - Most Prominent */}
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
        
        {/* Product Identifiers */}
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Tag className="w-4 h-4" />
          <span className="font-mono">{sku || _id}</span>
        </div>

        {/* Brand & Condition */}
        <div className="flex justify-between items-center text-sm">
          {brand && (
            <div className="text-gray-600">
              <span className="font-medium">{brand}</span>
            </div>
          )}
          {condition && (
            <div className="text-gray-600 capitalize">
              {condition}
            </div>
          )}
        </div>

        {/* Stock Status */}
        <div className={`text-sm font-medium ${stockColor}`}>
          {stockStatus}
        </div>

        {/* Additional product codes - Compact */}
        {(upc || ean || mpn) && (
          <div className="text-xs text-gray-500 space-y-1">
            {upc && (
              <div>UPC: <span className="font-mono">{upc}</span></div>
            )}
            {ean && (
              <div>EAN: <span className="font-mono">{ean}</span></div>
            )}
            {mpn && (
              <div>MPN: <span className="font-mono">{mpn}</span></div>
            )}
          </div>
        )}

        {/* Shipping Info */}
        {shipsToUserLocation && (
          <div className="flex items-center gap-1 text-xs text-green-600">
            <MapPin className="w-3 h-3" />
            <span>Available in your location</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-2 pt-2">
          {parentId && (
            <button
              onClick={() => onProductSelect?.({ 
                _id: parentId, 
                variants: [product],
                selectedVariant: product 
              })}
              disabled={loading || stock === 0}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
            >
              <Layers className="w-4 h-4" />
              View Product
            </button>
          )}
          
          {stock > 0 && (
            <button
              disabled={loading}
              className="w-full border border-blue-600 text-blue-600 hover:bg-blue-50 py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
            >
              <ShoppingCart className="w-4 h-4" />
              Add to Cart
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};