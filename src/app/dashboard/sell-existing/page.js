"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, 
  Package, 
  ArrowLeft
} from "lucide-react";
import toast from "react-hot-toast";

// Import custom hooks and components
import { useProductSearch } from "@/hooks/useProductSearch";
import { ProductCard } from "@/components/productComponents/SearchProductCard";
import { VariantsModal } from "@/components/productComponents/VariantsModal";
import { VariantCreationModal } from "@/components/productComponents/VariantCreationModal";
import { OfferModal } from "@/components/productComponents/OfferModal";
import { getCleanVariantId } from "@/utils/productUtils";

export default function SellExistingProduct() {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [productVariants, setProductVariants] = useState([]);
  const [showVariantsModal, setShowVariantsModal] = useState(false);
  const [showVariantCreationModal, setShowVariantCreationModal] = useState(false);
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [loadingVariants, setLoadingVariants] = useState(false);
  
  const router = useRouter();
  const { searchTerm, setSearchTerm, searchResults, loading } = useProductSearch();

  const handleProductSelect = async (productGroup) => {
    console.log('prdg',productGroup)
    try {
      // Determine parent info - use parent if available, otherwise infer from variants
      const parentInfo = productGroup.parent || {
        name: productGroup.variants[0]?.name || 'Unknown Product',
        brand: productGroup.variants[0]?.brand,
        khalifrexId: productGroup.variants[0]?.khalifrexId,
        _id: productGroup.variants[0]?.parentId,
        categoryId: productGroup.variants[0]?.category._id,
        categoryName: productGroup.variants[0]?.categoryName,
        variationTheme: productGroup.variants[0]?.variationTheme || []
      };
      
      setSelectedProduct(parentInfo);
      
      // Use variants from search results if available
      if (productGroup.variants && productGroup.variants.length > 0) {
        const transformedVariants = productGroup.variants.map(variant => ({
          _id: getCleanVariantId(variant),
          objectID: variant.objectID,
          name: variant.name,
          khalifrexId: variant.khalifrexId,
          attributes: variant.attributes || {},
          images: variant.mainImage ? [variant.mainImage] : [],
          price: variant.price,
          stock: variant.stock,
          offerCount: variant.hasOffers ? 1 : 0,
          lowestPrice: variant.lowestPrice
        }));
        
        setProductVariants(transformedVariants);
        setShowVariantsModal(true);
      } else if (parentInfo._id) {
        // Fallback: fetch variants from dedicated API endpoint
        setLoadingVariants(true);
        try {
          const response = await fetch(`http://localhost:3092/products/${parentInfo._id}/variants`, {
            credentials: 'include',
          });
          
          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || 'Failed to load product variants');
          }

          const data = await response.json();
          setProductVariants(data.variants || []);
          setShowVariantsModal(true);
        } catch (error) {
          console.error('Error loading variants:', error);
          toast.error(error.message || 'Failed to load product variants');
        } finally {
          setLoadingVariants(false);
        }
      } else {
        toast.error('Unable to load product variants - missing product ID');
      }
    } catch (error) {
      console.error('Product selection error:', error);
      toast.error('Failed to load product information');
    }
  };

  const handleVariantSelect = (variant) => {
    setSelectedVariant(variant);
    setShowVariantsModal(false);
    setShowOfferModal(true);
  };

  const handleAddNewVariant = () => {
    setShowVariantsModal(false);
    setShowVariantCreationModal(true);
  };

  const handleVariantCreated = (newVariant) => {
    // Add the new variant to the current list
    setProductVariants(prev => [...prev, {
      _id: newVariant._id,
      name: newVariant.name,
      khalifrexId: newVariant.khalifrexId,
      attributes: newVariant.attributes || {},
      images: newVariant.images || [],
      price: newVariant.price,
      stock: newVariant.stock,
      offerCount: 0,
      lowestPrice: null
    }]);
    
    setShowVariantCreationModal(false);
    setShowVariantsModal(true);
    toast.success("Variant created! You can now create an offer for it.");
  };

  const closeAllModals = () => {
    setShowVariantsModal(false);
    setShowVariantCreationModal(false);
    setShowOfferModal(false);
    setSelectedProduct(null);
    setSelectedVariant(null);
    setProductVariants([]);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-6xl mx-auto p-6 mt-10"
    >
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Sell Existing Product</h1>
          <p className="text-gray-600">Search by Khalifrex ID, UPC, EAN, or product name</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative mb-8">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by Khalifrex ID, UPC, EAN, or product name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
          />
        </div>
        {loading && (
          <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
          </div>
        )}
      </div>

      {/* Search Instructions */}
      {searchTerm.length < 2 && (
        <div className="text-center py-12">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">Start typing to search</h3>
          <p className="text-gray-500">
            Enter at least 2 characters to search for products
          </p>
        </div>
      )}

      {/* Search Results */}
      <AnimatePresence>
        {searchResults.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {searchResults.map((productGroup, index) => (
              <ProductCard
                key={productGroup.parent?.khalifrexId || productGroup.parent?._id || productGroup.variants[0]?.khalifrexId || productGroup.variants[0]?.objectID || `${index}-${Date.now()}`}
                productGroup={productGroup}
                index={index}
                onProductSelect={handleProductSelect}
                loading={loadingVariants}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* No Results */}
      {searchTerm.length >= 2 && !loading && searchResults.length === 0 && (
        <div className="text-center py-12">
          <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">No products found</h3>
          <p className="text-gray-500 mb-4">
            We couldnt find any products matching {searchTerm}
          </p>
          <button
            onClick={() => router.push('/dashboard/products/create-new')}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Add New Product Instead
          </button>
        </div>
      )}

      {/* Modals */}
      <AnimatePresence>
        {/* Variants Selection Modal */}
        {showVariantsModal && (
        <VariantsModal
          key={"variants-modal"}
          show={showVariantsModal}
          onClose={() => setShowVariantsModal(false)}
          selectedProduct={selectedProduct}
          productVariants={productVariants}
          onVariantSelect={handleVariantSelect}
          onAddNewVariant={handleAddNewVariant}
        />
        )}

        {/* Variant Creation Modal */}
        {showVariantCreationModal && (

        <VariantCreationModal
          key={'variant-creation-modal'}
          show={showVariantCreationModal}
          onClose={() => setShowVariantCreationModal(false)}
          selectedProduct={selectedProduct}
          onVariantCreated={handleVariantCreated}
        />
        )}

        {/* Offer Creation Modal */}
        {showOfferModal && (
        <OfferModal
          key={"offer-modal"}
          show={showOfferModal}
          onClose={() => setShowOfferModal(false)}
          selectedVariant={selectedVariant}
          selectedProduct={selectedProduct}
        />
        )}
      </AnimatePresence>
    </motion.div>
  );
}