import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import { debounce } from "lodash";
import { searchClient } from '@/lib/algoliaClient';
import { normalizeToGTIN14, isProductCode } from '@/utils/normalizeGtin';

export const useProductSearch = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);

  // Group results by parent product
  const groupResultsByParent = (hits) => {
    const groups = new Map();
    const standaloneVariants = [];

    hits.forEach(hit => {
      if (hit.type === 'parent') {
        if (!groups.has(hit.objectID)) {
          groups.set(hit.objectID, {
            parent: hit,
            variants: [],
            khalifrexId: hit.khalifrexId || hit.objectID
          });
        }
      } else if (hit.type === 'variant') {
        const parentId = hit.parentId;
        
        if (parentId && groups.has(parentId)) {
          groups.get(parentId).variants.push(hit);
        } else if (parentId) {
          if (!groups.has(parentId)) {
            groups.set(parentId, {
              parent: {
                _id: parentId,
                khalifrexId: hit.parentKhalifrexId,
                title: hit.title,
                brand: hit.brand,
                model: hit.model,
                category: hit.category,
                mainImage: hit.mainImage,
                isParent: true
              },
              variants: [],
              khalifrexId: hit.parentKhalifrexId || parentId
            });
          }
          groups.get(parentId).variants.push(hit);
        } else {
          standaloneVariants.push({
            parent: null,
            variants: [hit],
            khalifrexId: hit.khalifrexId || hit.objectID
          });
        }
      }
    });

    return [...groups.values(), ...standaloneVariants];
  };

  const debouncedSearch = useCallback(
    debounce(async (term) => {
      if (term.trim().length < 2) {
        setSearchResults([]);
        return;
      }

      setLoading(true);
      try {
        const trimmedQuery = term.trim();
        let searchParams = {
          indexName: 'seller_products_search',
          query: trimmedQuery,
          hitsPerPage: 20,
          page: 0,
          attributesToRetrieve: [
            'objectID',
            'type',
            'title',
            'brand',
            'model',
            'category',
            'description',
            'mainImage',
            'attributes',
            'offers',
            'totalStock',
            'parentId',
            'parentKhalifrexId',
            'khalifrexId',
            'searchableCodes',
            'gtin',
            'gtin14',
            'sku',
            'isActive'
          ],
          filters: 'isActive:true'
        };

        // Check if query might be a product code (UPC, EAN, GTIN, etc.)
        if (isProductCode(trimmedQuery)) {
          const normalizedGTIN = normalizeToGTIN14(trimmedQuery);
          
          if (normalizedGTIN) {
            const gtinFilters = [
              `gtin14:${normalizedGTIN}`,
              `khalifrexId:${trimmedQuery}`,
              `parentKhalifrexId:${trimmedQuery}`,
              `searchableCodes:${trimmedQuery}`,
              `searchableCodes:${normalizedGTIN}`
            ];

            searchParams.filters = `isActive:true AND (${gtinFilters.join(' OR ')})`;
            searchParams.query = ''; 
          }
        }

        const results = await searchClient.search({
          requests: [searchParams]
        });
        
        const searchResult = results.results[0];
        const groupedResults = groupResultsByParent(searchResult.hits || []);
        
        console.log('Algolia search results:', groupedResults);
        setSearchResults(groupedResults);
        
      } catch (error) {
        console.error('Search error:', error);
        toast.error('Failed to search products');
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

  const searchVariants = useCallback(async (parentKhalifrexId) => {
    try {
      setLoading(true);
      const results = await searchClient.search({
        requests: [{
          indexName: 'seller_products_search',
          query: '',
          filters: `parentKhalifrexId:${parentKhalifrexId} AND type:variant AND isActive:true`,
          hitsPerPage: 100,
          attributesToRetrieve: [
            'objectID',
            'title',
            'khalifrexId',
            'attributes',
            'mainImage',
            'offers',
            'totalStock',
            'parentId',
            'parentKhalifrexId',
            'isActive'
          ]
        }]
      });

      const searchResult = results.results[0];
      
      return (searchResult.hits || []).map(hit => ({
        _id: hit.objectID,
        objectID: hit.objectID,
        name: hit.title,
        khalifrexId: hit.khalifrexId,
        attributes: hit.attributes || {},
        images: hit.mainImage ? [hit.mainImage] : [],
        price: hit.offers?.minPrice,
        stock: hit.totalStock || 0,
        offerCount: hit.offers?.totalOffers || 0,
        lowestPrice: hit.offers?.minPrice
      }));
    } catch (error) {
      console.error('Error fetching variants:', error);
      toast.error('Failed to load product variants');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    searchTerm,
    setSearchTerm,
    searchResults,
    loading,
    searchVariants
  };
};