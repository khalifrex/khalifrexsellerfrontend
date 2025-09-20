const BASE_URL = 'http://localhost:3092';

export const apiService = {
  // Search existing products
  searchProducts: async (query, limit = 20) => {
    const response = await fetch(`${BASE_URL}/existing-products?q=${encodeURIComponent(query)}&limit=${limit}`, {
      credentials: 'include',
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Search failed with status ${response.status}`);
    }

    return response.json();
  },

  // Get product variants
  getProductVariants: async (productId) => {
    const response = await fetch(`${BASE_URL}/products/${productId}/variants`, {
      credentials: 'include',
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to load product variants');
    }

    return response.json();
  },

  // Get variation themes for a category
  getVariationThemes: async (categoryId) => {
    const response = await fetch(`${BASE_URL}/${categoryId}/variation-themes`, {
      credentials: 'include',
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to load variation themes');
    }

    return response.json();
  },

   async getParentVariationThemes(parentId) {
    const response = await fetch(`${BASE_URL}/${parentId}/required/variation-themes`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch parent variation themes: ${response.statusText}`);
    }

    return response.json();
  },

  // Create new variant
  createVariant: async (productId, variantData) => {
    const formData = new FormData();
    
    // Add variant data
    Object.keys(variantData).forEach(key => {
      if (key === 'images') {
        // Handle images separately
        variantData.images.forEach((image) => {
          formData.append('images', image.file);
        });
      } else if (typeof variantData[key] === 'object') {
        formData.append(key, JSON.stringify(variantData[key]));
      } else {
        formData.append(key, variantData[key]);
      }
    });

    const response = await fetch(`${BASE_URL}/products/${productId}/variants`, {
      method: 'POST',
      credentials: 'include',
      body: formData
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to create variant');
    }

    return data;
  },

  // Create offer
  createOffer: async (variantId, offerData) => {
    const response = await fetch(`${BASE_URL}/variants/${variantId}/offers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(offerData)
    });

    const data = await response.json();
    
    if (!response.ok) {
      const error = new Error(data.message || data.error || 'Failed to create offer');
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  }
};

// Error handler utility
export const handleApiError = (error, defaultMessage = 'An error occurred') => {
  console.error('API Error:', error);
  
  if (error.message) {
    return error.message;
  }
  
  return defaultMessage;
};