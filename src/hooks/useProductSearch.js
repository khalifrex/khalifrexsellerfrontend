import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import { debounce } from "lodash";

export const useProductSearch = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);

  // Debounced search function with improved error handling
  const debouncedSearch = useCallback(
    debounce(async (term) => {
      if (term.trim().length < 2) {
        setSearchResults([]);
        return;
      }

      setLoading(true);
      try {
        const response = await fetch(`http://localhost:3092/existing-products?q=${encodeURIComponent(term)}&limit=20`, {
          credentials: 'include',
        });
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || `Search failed with status ${response.status}`);
        }

        const data = await response.json();
        setSearchResults(data.products || []);
        
        // Show helpful message if no results
        if (!data.products || data.products.length === 0) {
          console.log(data.message || 'No products found');
        }
      } catch (error) {
        console.error('Search error:', error);
        toast.error(error.message || 'Failed to search products');
        setSearchResults([]);
      } finally {
        setLoading(false);
      }
    }, 300),
    []
  );

  useEffect(() => {
    debouncedSearch(searchTerm);
  }, [searchTerm, debouncedSearch]);

  return {
    searchTerm,
    setSearchTerm,
    searchResults,
    loading
  };
};