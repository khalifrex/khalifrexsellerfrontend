"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, 
  Package, 
  ArrowLeft,
  Info,
  Zap,
  Target
} from "lucide-react";
import toast from "react-hot-toast";

// Import custom hooks and components
import { useProductSearch } from "@/hooks/useProductSearch";
import { ProductCard } from "@/components/productComponents/SearchProductCard";
import { VariantsModal } from "@/components/productComponents/VariantsModal";
import { OfferModal } from "@/components/productComponents/OfferModal";
import { getCleanVariantId } from "@/utils/productUtils";

export default function SellExistingProduct() {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [productVariants, setProductVariants] = useState([]);
  const [showVariantsModal, setShowVariantsModal] = useState(false);
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [loadingVariants, setLoadingVariants] = useState(false);
  
  const router = useRouter();
  const { searchTerm, setSearchTerm, searchResults, loading, searchVariants } = useProductSearch();

  const handleProductSelect = async (productGroup) => {
    try {
      const { parent, variants } = productGroup;
      
      // Check if this is a single variant or multiple variants
      if (variants.length === 1) {
        // Single variant - go directly to offer creation
        const variant = variants[0];
        const parentInfo = parent || {
          name: variant.title || 'Unknown Product',
          brand: variant.brand,
          khalifrexId: variant.parentKhalifrexId || variant.khalifrexId,
          _id: variant.parentId || variant.objectID,
          categoryName: variant.category
        };
        
        setSelectedProduct(parentInfo);
        setSelectedVariant({
          _id: getCleanVariantId(variant),
          objectID: variant.objectID,
          name: variant.title,
          khalifrexId: variant.khalifrexId,
          attributes: variant.attributes || {},
          images: variant.mainImage ? [variant.mainImage] : [],
          price: variant.offers?.minPrice,
          stock: variant.totalStock || 0,
          offerCount: variant.offers?.totalOffers || 0,
          lowestPrice: variant.offers?.minPrice
        });
        setShowOfferModal(true);
      } else {
        // Multiple variants - show variants selection modal
        const parentInfo = parent || {
          name: variants[0]?.title || 'Unknown Product',
          brand: variants[0]?.brand,
          khalifrexId: variants[0]?.parentKhalifrexId,
          _id: variants[0]?.parentId,
          categoryName: variants[0]?.category,
          variationTheme: []
        };
        
        setSelectedProduct(parentInfo);
        
        // Transform variants for the modal
        const transformedVariants = variants.map(variant => ({
          _id: getCleanVariantId(variant),
          objectID: variant.objectID,
          name: variant.title,
          khalifrexId: variant.khalifrexId,
          attributes: variant.attributes || {},
          images: variant.mainImage ? [variant.mainImage] : [],
          price: variant.offers?.minPrice,
          stock: variant.totalStock || 0,
          offerCount: variant.offers?.totalOffers || 0,
          lowestPrice: variant.offers?.minPrice
        }));
        
        setProductVariants(transformedVariants);
        setShowVariantsModal(true);
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

  const handleLoadMoreVariants = async (parentKhalifrexId) => {
    setLoadingVariants(true);
    try {
      const additionalVariants = await searchVariants(parentKhalifrexId);
      setProductVariants(additionalVariants);
    } catch (error) {
      console.error('Error loading additional variants:', error);
      toast.error('Failed to load additional variants');
    } finally {
      setLoadingVariants(false);
    }
  };

  const closeAllModals = () => {
    setShowVariantsModal(false);
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
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Sell Existing Product</h1>
          <p className="text-gray-600">Search by product name, brand, UPC, EAN, GTIN, or Khalifrex ID</p>
        </div>
      </div>

      {/* Search Tips */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 mb-8 border border-blue-100">
        <div className="flex items-start gap-4">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Info className="w-5 h-5 text-blue-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-blue-900 mb-2">Search Tips</h3>
            <div className="grid md:grid-cols-3 gap-4 text-sm text-blue-800">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-blue-600" />
                <span><strong>Product Codes:</strong> Enter UPC, EAN, GTIN, or Khalifrex ID for exact matches</span>
              </div>
              <div className="flex items-center gap-2">
                <Search className="w-4 h-4 text-blue-600" />
                <span><strong>Text Search:</strong> Search by product name, brand, or model</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-blue-600" />
                <span><strong>Quick Results:</strong> Powered by Algolia for instant search</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative mb-8">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by product name, UPC, EAN, GTIN, or Khalifrex ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg shadow-sm"
            autoFocus
          />
        </div>
        {loading && (
          <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
          </div>
        )}
      </div>

      {/* Search State Messages */}
      {searchTerm.length === 0 && (
        <div className="text-center py-16">
          <Package className="w-20 h-20 text-gray-300 mx-auto mb-6" />
          <h3 className="text-2xl font-semibold text-gray-600 mb-3">Ready to Search</h3>
          <p className="text-gray-500 max-w-md mx-auto">
            Enter a product name, brand, or product code to find existing products you can sell
          </p>
        </div>
      )}

      {searchTerm.length > 0 && searchTerm.length < 2 && (
        <div className="text-center py-12">
          <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">Keep typing...</h3>
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
            className="space-y-6"
          >
            {/* Results Header */}
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">
                Search Results ({searchResults.length})
              </h2>
              <div className="text-sm text-gray-500">
                Showing results for &quot;{searchTerm}&quot;
              </div>
            </div>

            {/* Results Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {searchResults.map((productGroup, index) => (
                <ProductCard
                  key={productGroup.khalifrexId || productGroup.parent?._id || productGroup.variants[0]?.khalifrexId || productGroup.variants[0]?.objectID || `${index}-${Date.now()}`}
                  productGroup={productGroup}
                  index={index}
                  onProductSelect={handleProductSelect}
                  loading={loadingVariants}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* No Results */}
      {searchTerm.length >= 2 && !loading && searchResults.length === 0 && (
        <div className="text-center py-16">
          <Search className="w-20 h-20 text-gray-300 mx-auto mb-6" />
          <h3 className="text-2xl font-semibold text-gray-600 mb-3">No products found</h3>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">
            We couldn&apos;t find any products matching &quot;<strong>{searchTerm}</strong>&quot;. Try a different search term or create a new product.
          </p>
          <div className="space-y-3">
            <button
              onClick={() => router.push('/dashboard/products/create-new')}
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-medium transition-colors inline-flex items-center gap-2"
            >
              <Package className="w-5 h-5" />
              Add New Product Instead
            </button>
            <div className="text-sm text-gray-400">
              or try searching with different keywords
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && searchTerm.length >= 2 && (
        <div className="text-center py-16">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h3 className="text-xl font-semibold text-gray-600 mb-2">Searching...</h3>
          <p className="text-gray-500">Finding products for &quot;{searchTerm}&quot;</p>
        </div>
      )}

      {/* Modals */}
      <AnimatePresence>
        {/* Variants Selection Modal */}
        {showVariantsModal && (
          <VariantsModal
            key="variants-modal"
            show={showVariantsModal}
            onClose={() => setShowVariantsModal(false)}
            selectedProduct={selectedProduct}
            productVariants={productVariants}
            onVariantSelect={handleVariantSelect}
            onLoadMoreVariants={handleLoadMoreVariants}
            loadingVariants={loadingVariants}
          />
        )}

        {/* Offer Creation Modal */}
        {showOfferModal && (
          <OfferModal
            key="offer-modal"
            show={showOfferModal}
            onClose={closeAllModals}
            selectedVariant={selectedVariant}
            selectedProduct={selectedProduct}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}