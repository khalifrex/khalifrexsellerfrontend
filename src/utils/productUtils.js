export const formatPrice = (price) => {
  if (!price && price !== 0) return "Price not available";
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(price);
};

export const getProductImage = (item) => {
  const imageSource = item.mainImage || item.images;
  
  if (typeof imageSource === 'string') return imageSource;
  
  if (Array.isArray(imageSource) && imageSource.length > 0) {
    const firstImage = imageSource[0];
    if (typeof firstImage === 'string') return firstImage;
    if (firstImage && firstImage.url) return firstImage.url;
  }
  
  return null;
};

export const getDisplayName = (item) => {
  return item.name || 'Unknown Product';
};

export const getProductId = (item) => {
  return item.khalifrexId || item.objectID || item._id;
};

export const getVariantDisplayName = (variant) => {
  if (variant.name) return variant.name;
  if (variant.attributes && Object.keys(variant.attributes).length > 0) {
    return Object.entries(variant.attributes)
      .filter(([key, value]) => value && value.toString().trim())
      .map(([key, value]) => `${key}: ${value}`)
      .join(', ') || 'Variant';
  }
  return 'Variant';
};

export const getCleanVariantId = (variant) => {
  // Try objectID first (from Algolia search results)
  if (variant.objectID && variant.objectID.startsWith('variant_')) {
    return variant.objectID.replace('variant_', '');
  }
  
  // Fallback to other ID fields
  return variant._id || variant.khalifrexId || variant.id;
};