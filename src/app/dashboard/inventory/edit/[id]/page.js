"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Save, Package, Edit3, Lock, CheckCircle, XCircle, DollarSign, Archive, Upload, X, Image as ImageIcon, Plus, GripVertical, Star } from 'lucide-react';
import Image from 'next/image';

// Drag & Drop Image Manager Component
const DragDropImageManager = ({ 
  images = [], 
  onReorder, 
  onDelete, 
  onSetMain, 
  onUpload,
  canEdit = true,
  type = 'product', // 'product' or 'variant'
  uploading = false,
  pendingImages = [],
  onAddImages,
  onRemovePending
}) => {
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [draggedOver, setDraggedOver] = useState(null);

  const handleDragStart = (e, index) => {
    if (!canEdit) return;
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDraggedOver(null);
  };

  const handleDragOver = (e, index) => {
    if (!canEdit) return;
    e.preventDefault();
    setDraggedOver(index);
  };

  const handleDragLeave = (e) => {
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setDraggedOver(null);
    }
  };

  const handleDrop = (e, dropIndex) => {
    if (!canEdit) return;
    e.preventDefault();
    
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      setDraggedOver(null);
      return;
    }

    // Reorder images
    const reorderedImages = [...images];
    const [draggedItem] = reorderedImages.splice(draggedIndex, 1);
    reorderedImages.splice(dropIndex, 0, draggedItem);

    // Update sort orders
    const updatedImages = reorderedImages.map((img, index) => ({
      ...img,
      sortOrder: index
    }));

    onReorder(updatedImages);
    setDraggedIndex(null);
    setDraggedOver(null);
  };

  const handleSetMain = (index) => {
    if (!canEdit) return;
    const updatedImages = images.map((img, i) => ({
      ...img,
      isMain: i === index
    }));
    onSetMain(updatedImages);
  };

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    onAddImages(files);
  };

  if (!images || images.length === 0) {
    return (
      <div className="space-y-4">
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <div className="text-gray-400 mb-2">
            <Upload className="w-8 h-8 mx-auto" />
          </div>
          <p className="text-gray-500 mb-4">No images uploaded yet</p>
          {canEdit && (
            <label className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 cursor-pointer">
              <Plus className="w-4 h-4" />
              Add First Image
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
              />
            </label>
          )}
        </div>

        {pendingImages.length > 0 && (
          <PendingImagesSection 
            pendingImages={pendingImages}
            onRemovePending={onRemovePending}
            onUpload={onUpload}
            uploading={uploading}
            type={type}
          />
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-gray-700">Current Images</h4>
        <div className="space-y-2">
          {images.map((image, index) => (
            <div
              key={image._id || index}
              draggable={canEdit}
              onDragStart={(e) => handleDragStart(e, index)}
              onDragEnd={handleDragEnd}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, index)}
              className={`
                flex items-center gap-3 p-3 border rounded-lg transition-all duration-200
                ${draggedIndex === index ? 'opacity-50 scale-95 rotate-2' : ''}
                ${draggedOver === index && draggedIndex !== index ? 'border-blue-400 bg-blue-50 transform scale-102' : 'border-gray-200'}
                ${canEdit ? 'hover:border-gray-300 cursor-move' : ''}
                ${image.isMain ? 'ring-2 ring-yellow-400 bg-yellow-50' : ''}
              `}
            >
              {canEdit && (
                <div className="text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing">
                  <GripVertical className="w-4 h-4" />
                </div>
              )}

              <div className="relative w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                <Image
                  src={image.url}
                  alt={`${type} image ${index + 1}`}
                  fill
                  className="object-cover"
                  loading="lazy"
                />
                {image.isMain && (
                  <div className="absolute top-1 left-1">
                    <div className="bg-yellow-500 text-white rounded-full p-0.5">
                      <Star className="w-3 h-3 fill-current" />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium text-gray-900 truncate">
                    {image.name || `Image ${index + 1}`}
                  </span>
                  {image.isMain && (
                    <span className="inline-flex items-center gap-1 bg-yellow-100 text-yellow-800 text-xs px-2 py-0.5 rounded-full">
                      <Star className="w-3 h-3 fill-current" />
                      Main
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500">
                  Position: {index + 1} • {image.size ? `${(image.size / 1024).toFixed(1)}KB` : 'Unknown size'}
                </p>
              </div>

              {canEdit && (
                <div className="flex items-center gap-1">
                  {!image.isMain && (
                    <button
                      onClick={() => handleSetMain(index)}
                      title="Set as main image"
                      className="p-2 text-gray-400 hover:text-yellow-500 hover:bg-yellow-50 rounded-lg transition-colors"
                    >
                      <Star className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => onDelete(image._id, type)}
                    title="Delete image"
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {canEdit && (
        <div className="border-2 border-dashed border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors">
          <label className="flex flex-col items-center gap-2 cursor-pointer">
            <div className="text-gray-400">
              <Plus className="w-6 h-6" />
            </div>
            <span className="text-sm font-medium text-gray-600">Add More Images</span>
            <span className="text-xs text-gray-500">Click to browse or drag & drop</span>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageSelect}
              className="hidden"
            />
          </label>
        </div>
      )}

      {pendingImages.length > 0 && (
        <PendingImagesSection 
          pendingImages={pendingImages}
          onRemovePending={onRemovePending}
          onUpload={onUpload}
          uploading={uploading}
          type={type}
        />
      )}
    </div>
  );
};

// Pending Images Component
const PendingImagesSection = ({ pendingImages, onRemovePending, onUpload, uploading, type }) => (
  <div className="space-y-2">
    <div className="flex items-center justify-between">
      <h4 className="text-sm font-medium text-gray-700">New Images (Not Saved)</h4>
      <button
        onClick={onUpload}
        disabled={uploading || pendingImages.length === 0}
        className="flex items-center gap-2 bg-green-600 text-white px-3 py-1.5 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
      >
        <Upload className="w-4 h-4" />
        {uploading ? 'Saving...' : `Save ${pendingImages.length} Image${pendingImages.length > 1 ? 's' : ''}`}
      </button>
    </div>
    
    <div className="space-y-2">
      {pendingImages.map((image, index) => (
        <div
          key={index}
          className="flex items-center gap-3 p-3 border border-orange-200 rounded-lg bg-orange-50"
        >
          <div className="relative w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
            <Image
              src={image.preview}
              alt={`Preview ${index + 1}`}
              fill
              className="object-cover"
            />
            <div className="absolute top-1 right-1">
              <div className="bg-orange-500 text-white text-xs px-1 py-0.5 rounded">
                NEW
              </div>
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-gray-900 truncate">
              {image.file.name}
            </div>
            <div className="text-xs text-gray-500">
              {(image.file.size / 1024).toFixed(1)}KB • Pending upload
            </div>
          </div>

          <button
            onClick={() => onRemovePending(index, type)}
            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
            title="Remove from queue"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  </div>
);

// Main Inventory Edit Page Component
const InventoryEditPage = () => {
  const { id } = useParams();
  const router = useRouter();
  
  const [data, setData] = useState(null);
  const [permissions, setPermissions] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState({});
  const [uploading, setUploading] = useState({});
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Form states
  const [productForm, setProductForm] = useState({});
  const [variantForm, setVariantForm] = useState({});
  const [offerForm, setOfferForm] = useState({});
  
  // Image states
  const [productImages, setProductImages] = useState([]);
  const [variantImages, setVariantImages] = useState([]);
  const [pendingProductImages, setPendingProductImages] = useState([]);
  const [pendingVariantImages, setPendingVariantImages] = useState([]);

  // Fetch data
  useEffect(() => {
    fetchEditData();
  }, [id]);

  const fetchEditData = async () => {
    try {
      setLoading(true);
      const res = await fetch(`http://localhost:3092/seller/inventory/edit/${id}`, {
        credentials: 'include'
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to fetch data');
      }
      
      const result = await res.json();
      
      if (!result?.product || !result?.variant || !result?.offer) {
        throw new Error('Invalid data structure received');
      }
      
      setData(result);
      setPermissions(result.permissions || {});
      
      // Set images
      setProductImages(result.product.images || []);
      setVariantImages(result.variant.images || []);
      
      // Initialize forms
      setTimeout(() => {
        setProductForm({
          name: result.product?.name || '',
          brand: result.product?.brand || '',
          description: result.product?.description || '',
          seoTitle: result.product?.seoTitle || '',
          seoDescription: result.product?.seoDescription || ''
        });
        
        setVariantForm({
          name: result.variant?.name || '',
          description: result.variant?.description || '',
          sku: result.variant?.sku || '',
          upc: result.variant?.upc || '',
          ean: result.variant?.ean || '',
          weight: result.variant?.weight?.toString() || '',
          dimensions: result.variant?.dimensions || {}
        });
        
        setOfferForm({
          price: result.offer?.price?.toString() || '',
          stock: result.offer?.stock?.toString() || '',
          condition: result.offer?.condition || 'new',
          sellerSku: result.offer?.sellerSku || '',
          isActive: result.offer?.isActive ?? true,
          shippingInfo: result.offer?.shippingInfo || {}
        });
      }, 0);
      
    } catch (err) {
      console.error('Fetch edit data error:', err);
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  // Image handlers for drag & drop component
  const handleProductImageSelect = (files) => {
    const newImages = files.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      isNew: true
    }));
    setPendingProductImages(prev => [...prev, ...newImages]);
  };

  const handleVariantImageSelect = (files) => {
    const newImages = files.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      isNew: true
    }));
    setPendingVariantImages(prev => [...prev, ...newImages]);
  };

  const removePendingImage = (index, type) => {
    if (type === 'product') {
      setPendingProductImages(prev => {
        const newImages = [...prev];
        URL.revokeObjectURL(newImages[index].preview);
        newImages.splice(index, 1);
        return newImages;
      });
    } else {
      setPendingVariantImages(prev => {
        const newImages = [...prev];
        URL.revokeObjectURL(newImages[index].preview);
        newImages.splice(index, 1);
        return newImages;
      });
    }
  };

  const removeExistingImage = async (imageId, type) => {
    try {
      const endpoint = type === 'product' 
        ? `http://localhost:3092/seller/inventory/product/${data.product._id}/images/${imageId}`
        : `http://localhost:3092/seller/inventory/variant/${id}/images/${imageId}`;
      
      const res = await fetch(endpoint, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to delete image');
      }

      // Update local state
      if (type === 'product') {
        setProductImages(prev => prev.filter(img => img._id !== imageId));
      } else {
        setVariantImages(prev => prev.filter(img => img._id !== imageId));
      }

      setSuccess('Image deleted successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to delete image');
    }
  };

  const uploadImages = async (type) => {
    const images = type === 'product' ? pendingProductImages : pendingVariantImages;
    if (images.length === 0) return;

    try {
      setUploading(prev => ({ ...prev, [type]: true }));

      const formData = new FormData();
      images.forEach(img => {
        formData.append('images', img.file);
      });

      const endpoint = type === 'product' 
        ? `http://localhost:3092/seller/inventory/product/${data.product._id}/images`
        : `http://localhost:3092/seller/inventory/variant/${id}/images`;

      const res = await fetch(endpoint, {
        method: 'POST',
        credentials: 'include',
        body: formData
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to upload images');
      }

      const result = await res.json();

      // Update state with new images
      if (type === 'product') {
        setProductImages(prev => [...prev, ...result.images]);
        setPendingProductImages([]);
      } else {
        setVariantImages(prev => [...prev, ...result.images]);
        setPendingVariantImages([]);
      }

      setSuccess(`${type === 'product' ? 'Product' : 'Variant'} images uploaded successfully`);
      setTimeout(() => setSuccess(''), 3000);

    } catch (err) {
      setError(err.message || 'Failed to upload images');
    } finally {
      setUploading(prev => ({ ...prev, [type]: false }));
    }
  };

  // Image order/main handlers
  const updateImageOrder = async (updatedImages, type) => {
    try {
      const endpoint = type === 'product'
        ? `http://localhost:3092/seller/inventory/product/${data.product._id}/images/reorder`
        : `http://localhost:3092/seller/inventory/variant/${id}/images/reorder`;

      const imageUpdates = updatedImages.map(img => ({
        _id: img._id,
        sortOrder: img.sortOrder,
        isMain: img.isMain
      }));

      const res = await fetch(endpoint, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ images: imageUpdates })
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to update image order');
      }

      // Update local state
      if (type === 'product') {
        setProductImages(updatedImages);
      } else {
        setVariantImages(updatedImages);
      }

      setSuccess('Image order updated successfully');
      setTimeout(() => setSuccess(''), 3000);

    } catch (err) {
      setError(err.message || 'Failed to update image order');
      // Revert local changes on error
      fetchEditData();
    }
  };

  // Form update handlers
  const handleUpdateProduct = async () => {
    if (!permissions.canEditProduct) return;
    
    try {
      setSaving(prev => ({ ...prev, product: true }));
      
      const res = await fetch(`http://localhost:3092/seller/inventory/product/${data.product._id}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productForm)
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to update product');
      }

      setSuccess('Product updated successfully');
      setTimeout(() => setSuccess(''), 3000);
      
    } catch (err) {
      setError(err.message || 'Failed to update product');
    } finally {
      setSaving(prev => ({ ...prev, product: false }));
    }
  };

  const handleUpdateVariant = async () => {
    if (!permissions.canEditVariant) return;
    
    try {
      setSaving(prev => ({ ...prev, variant: true }));
      
      const res = await fetch(`http://localhost:3092/seller/inventory/variant/${id}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(variantForm)
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to update variant');
      }

      setSuccess('Variant updated successfully');
      setTimeout(() => setSuccess(''), 3000);
      
    } catch (err) {
      setError(err.message || 'Failed to update variant');
    } finally {
      setSaving(prev => ({ ...prev, variant: false }));
    }
  };

  const handleUpdateOffer = async () => {
    try {
      setSaving(prev => ({ ...prev, offer: true }));
      
      const res = await fetch(`http://localhost:3092/seller/offers/${data.offer._id}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          price: parseFloat(offerForm.price),
          stock: parseInt(offerForm.stock),
          condition: offerForm.condition,
          sellerSku: offerForm.sellerSku,
          isActive: offerForm.isActive,
          shippingInfo: offerForm.shippingInfo
        })
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to update offer');
      }

      setSuccess('Offer updated successfully');
      setTimeout(() => setSuccess(''), 3000);
      
    } catch (err) {
      setError(err.message || 'Failed to update offer');
    } finally {
      setSaving(prev => ({ ...prev, offer: false }));
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center">
        <Package className="w-12 h-12 text-gray-400 mx-auto mb-4 animate-pulse" />
        <p className="text-gray-500">Loading product details...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-8 text-center">
        <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500">Product not found</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Inventory
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Edit Inventory Item</h1>
        <p className="text-gray-600 text-sm mt-1">
          Update product information, images, and your offer details
        </p>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span className="text-green-800 font-medium">{success}</span>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-2">
            <XCircle className="w-5 h-5 text-red-600" />
            <span className="text-red-800 font-medium">{error}</span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Product Images Section */}
          <div className="bg-white rounded-lg border p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <ImageIcon className="w-5 h-5" />
                Product Images
              </h2>
              {!permissions.canEditProduct && (
                <div className="flex items-center gap-1 text-gray-500 text-sm">
                  <Lock className="w-4 h-4" />
                  Read Only
                </div>
              )}
            </div>

            <DragDropImageManager
              images={productImages}
              onReorder={(updatedImages) => updateImageOrder(updatedImages, 'product')}
              onDelete={removeExistingImage}
              onSetMain={(updatedImages) => updateImageOrder(updatedImages, 'product')}
              onUpload={() => uploadImages('product')}
              canEdit={permissions.canEditProduct}
              type="product"
              uploading={uploading.product}
              pendingImages={pendingProductImages}
              onAddImages={handleProductImageSelect}
              onRemovePending={removePendingImage}
            />
          </div>

          {/* Variant Images Section */}
          <div className="bg-white rounded-lg border p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <ImageIcon className="w-5 h-5" />
                Variant Images
              </h2>
              {!permissions.canEditVariant && (
                <div className="flex items-center gap-1 text-gray-500 text-sm">
                  <Lock className="w-4 h-4" />
                  Read Only
                </div>
              )}
            </div>

            <DragDropImageManager
              images={variantImages}
              onReorder={(updatedImages) => updateImageOrder(updatedImages, 'variant')}
              onDelete={removeExistingImage}
              onSetMain={(updatedImages) => updateImageOrder(updatedImages, 'variant')}
              onUpload={() => uploadImages('variant')}
              canEdit={permissions.canEditVariant}
              type="variant"
              uploading={uploading.variant}
              pendingImages={pendingVariantImages}
              onAddImages={handleVariantImageSelect}
              onRemovePending={removePendingImage}
            />
          </div>

          {/* Product Details Section */}
          <div className="bg-white rounded-lg border p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Package className="w-5 h-5" />
                Product Details
              </h2>
              {!permissions.canEditProduct && (
                <div className="flex items-center gap-1 text-gray-500 text-sm">
                  <Lock className="w-4 h-4" />
                  Read Only
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Name
                </label>
                <input
                  type="text"
                  value={productForm.name}
                  onChange={(e) => setProductForm(prev => ({ ...prev, name: e.target.value }))}
                  disabled={!permissions.canEditProduct}
                  className={`w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 ${
                    !permissions.canEditProduct ? 'bg-gray-50 text-gray-600' : ''
                  }`}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Brand
                </label>
                <input
                  type="text"
                  value={productForm.brand}
                  onChange={(e) => setProductForm(prev => ({ ...prev, brand: e.target.value }))}
                  disabled={!permissions.canEditProduct}
                  className={`w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 ${
                    !permissions.canEditProduct ? 'bg-gray-50 text-gray-600' : ''
                  }`}
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={productForm.description}
                  onChange={(e) => setProductForm(prev => ({ ...prev, description: e.target.value }))}
                  disabled={!permissions.canEditProduct}
                  rows={4}
                  className={`w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 ${
                    !permissions.canEditProduct ? 'bg-gray-50 text-gray-600' : ''
                  }`}
                />
              </div>
            </div>

            {permissions.canEditProduct && (
              <div className="mt-4 pt-4 border-t">
                <button
                  onClick={handleUpdateProduct}
                  disabled={saving.product}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  {saving.product ? 'Saving...' : 'Save Product'}
                </button>
              </div>
            )}
          </div>

          {/* Variant Details Section */}
          <div className="bg-white rounded-lg border p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Edit3 className="w-5 h-5" />
                Variant Details
              </h2>
              {!permissions.canEditVariant && (
                <div className="flex items-center gap-1 text-gray-500 text-sm">
                  <Lock className="w-4 h-4" />
                  Read Only
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Variant Name
                </label>
                <input
                  type="text"
                  value={variantForm.name}
                  onChange={(e) => setVariantForm(prev => ({ ...prev, name: e.target.value }))}
                  disabled={!permissions.canEditVariant}
                  className={`w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 ${
                    !permissions.canEditVariant ? 'bg-gray-50 text-gray-600' : ''
                  }`}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  SKU
                </label>
                <input
                  type="text"
                  value={variantForm.sku}
                  onChange={(e) => setVariantForm(prev => ({ ...prev, sku: e.target.value }))}
                  disabled={!permissions.canEditVariant}
                  className={`w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 ${
                    !permissions.canEditVariant ? 'bg-gray-50 text-gray-600' : ''
                  }`}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  UPC
                </label>
                <input
                  type="text"
                  value={variantForm.upc}
                  onChange={(e) => setVariantForm(prev => ({ ...prev, upc: e.target.value }))}
                  disabled={!permissions.canEditVariant}
                  className={`w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 ${
                    !permissions.canEditVariant ? 'bg-gray-50 text-gray-600' : ''
                  }`}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Weight (kg)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={variantForm.weight}
                  onChange={(e) => setVariantForm(prev => ({ ...prev, weight: e.target.value }))}
                  disabled={!permissions.canEditVariant}
                  className={`w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 ${
                    !permissions.canEditVariant ? 'bg-gray-50 text-gray-600' : ''
                  }`}
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Variant Description
                </label>
                <textarea
                  value={variantForm.description}
                  onChange={(e) => setVariantForm(prev => ({ ...prev, description: e.target.value }))}
                  disabled={!permissions.canEditVariant}
                  rows={3}
                  className={`w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 ${
                    !permissions.canEditVariant ? 'bg-gray-50 text-gray-600' : ''
                  }`}
                />
              </div>

              {/* Variant Attributes */}
              {data.variant.variantAttributes && Object.keys(data.variant.variantAttributes).length > 0 && (
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Variant Attributes
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(data.variant.variantAttributes).map(([key, value]) => (
                      <span key={key} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                        {key}: {value}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {permissions.canEditVariant && (
              <div className="mt-4 pt-4 border-t">
                <button
                  onClick={handleUpdateVariant}
                  disabled={saving.variant}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  {saving.variant ? 'Saving...' : 'Save Variant'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar - Offer Management & Stats */}
        <div className="space-y-6">
          
          {/* Current Images Preview */}
          <div className="bg-white rounded-lg border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Images</h3>
            <div className="space-y-3">
              {/* Main variant image */}
              {variantImages.length > 0 ? (
                <div className="relative w-full h-32 bg-gray-100 rounded-lg overflow-hidden">
                  <Image
                    src={variantImages[0].url}
                    alt="Main Variant"
                    fill
                    className="object-cover"
                  />
                  <div className="absolute bottom-2 left-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded">
                    Main Variant
                  </div>
                </div>
              ) : productImages.length > 0 ? (
                <div className="relative w-full h-32 bg-gray-100 rounded-lg overflow-hidden">
                  <Image
                    src={productImages[0].url}
                    alt="Main Product"
                    fill
                    className="object-cover"
                  />
                  <div className="absolute bottom-2 left-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded">
                    Main Product
                  </div>
                </div>
              ) : (
                <div className="relative w-full h-32 bg-gray-100 rounded-lg flex items-center justify-center">
                  <Package className="w-8 h-8 text-gray-400" />
                  <div className="absolute bottom-2 left-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded">
                    No Images
                  </div>
                </div>
              )}
              
              {/* Additional images grid */}
              <div className="grid grid-cols-2 gap-2">
                {[...variantImages.slice(1, 3), ...productImages.slice(0, 4 - variantImages.slice(1, 3).length)].map((image, idx) => (
                  <div key={image._id || idx} className="relative w-full h-20 bg-gray-100 rounded overflow-hidden">
                    <Image
                      src={image.url}
                      alt={`Image ${idx + 2}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>

              <div className="text-xs text-gray-500 text-center">
                {variantImages.length + productImages.length} total images
              </div>
            </div>
          </div>

          {/* My Offer Section */}
          <div className="bg-white rounded-lg border p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                My Offer
              </h3>
              <span className="text-sm text-green-600 font-medium">Always Editable</span>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={offerForm.price}
                    onChange={(e) => setOfferForm(prev => ({ ...prev, price: e.target.value }))}
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Stock
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={offerForm.stock}
                    onChange={(e) => setOfferForm(prev => ({ ...prev, stock: e.target.value }))}
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Condition
                </label>
                <select
                  value={offerForm.condition}
                  onChange={(e) => setOfferForm(prev => ({ ...prev, condition: e.target.value }))}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                >
                  <option value="new">New</option>
                  <option value="used">Used</option>
                  <option value="refurbished">Refurbished</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your SKU
                </label>
                <input
                  type="text"
                  value={offerForm.sellerSku}
                  onChange={(e) => setOfferForm(prev => ({ ...prev, sellerSku: e.target.value }))}
                  placeholder="Optional"
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="offerActive"
                  checked={offerForm.isActive}
                  onChange={(e) => setOfferForm(prev => ({ ...prev, isActive: e.target.checked }))}
                  className="rounded"
                />
                <label htmlFor="offerActive" className="text-sm font-medium text-gray-700">
                  Active Offer
                </label>
              </div>

              <div className="pt-4 border-t">
                <button
                  onClick={handleUpdateOffer}
                  disabled={saving.offer}
                  className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  {saving.offer ? 'Saving...' : 'Update My Offer'}
                </button>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-white rounded-lg border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Archive className="w-5 h-5" />
              Quick Stats
            </h3>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Offers</span>
                <span className="font-semibold text-gray-900">
                  {data.variant.metrics?.totalOffers || 0}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Lowest Price</span>
                <span className="font-semibold text-gray-900">
                  ${data.variant.metrics?.lowestPrice ? data.variant.metrics.lowestPrice.toFixed(2) : 'N/A'}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Stock</span>
                <span className="font-semibold text-gray-900">
                  {data.variant.metrics?.totalStock || 0}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Your Position</span>
                <span className={`font-semibold ${
                  data.offer.price === data.variant.metrics?.lowestPrice 
                    ? 'text-green-600' 
                    : 'text-gray-900'
                }`}>
                  {data.offer.price === data.variant.metrics?.lowestPrice ? 'Buy Box' : 'Competing'}
                </span>
              </div>
            </div>
          </div>

          {/* Shipping Information */}
          <div className="bg-white rounded-lg border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Shipping Settings</h3>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="freeShipping"
                  checked={offerForm.shippingInfo?.freeShipping || false}
                  onChange={(e) => setOfferForm(prev => ({
                    ...prev,
                    shippingInfo: {
                      ...prev.shippingInfo,
                      freeShipping: e.target.checked
                    }
                  }))}
                  className="rounded"
                />
                <label htmlFor="freeShipping" className="text-sm font-medium text-gray-700">
                  Free Shipping
                </label>
              </div>

              {!offerForm.shippingInfo?.freeShipping && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Shipping Cost ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={offerForm.shippingInfo?.shippingCost || ''}
                    onChange={(e) => setOfferForm(prev => ({
                      ...prev,
                      shippingInfo: {
                        ...prev.shippingInfo,
                        shippingCost: e.target.value
                      }
                    }))}
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estimated Delivery
                </label>
                <select
                  value={offerForm.shippingInfo?.estimatedDelivery || '2-3 business days'}
                  onChange={(e) => setOfferForm(prev => ({
                    ...prev,
                    shippingInfo: {
                      ...prev.shippingInfo,
                      estimatedDelivery: e.target.value
                    }
                  }))}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                >
                  <option value="1-2 business days">1-2 business days</option>
                  <option value="2-3 business days">2-3 business days</option>
                  <option value="3-5 business days">3-5 business days</option>
                  <option value="5-7 business days">5-7 business days</option>
                  <option value="1-2 weeks">1-2 weeks</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Ownership Info Banner */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-2">Ownership & Permissions</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="flex items-center gap-2">
            {permissions.canEditProduct ? (
              <CheckCircle className="w-4 h-4 text-green-500" />
            ) : (
              <Lock className="w-4 h-4 text-gray-400" />
            )}
            <span className={permissions.canEditProduct ? 'text-green-700' : 'text-gray-600'}>
              Product Owner: {permissions.canEditProduct ? 'You' : 'Other Seller'}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            {permissions.canEditVariant ? (
              <CheckCircle className="w-4 h-4 text-green-500" />
            ) : (
              <Lock className="w-4 h-4 text-gray-400" />
            )}
            <span className={permissions.canEditVariant ? 'text-green-700' : 'text-gray-600'}>
              Variant Owner: {permissions.canEditVariant ? 'You' : 'Other Seller'}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span className="text-green-700">
              Offer Owner: You
            </span>
          </div>
        </div>
        
        <p className="text-blue-700 text-xs mt-2">
          You can always edit your own offer and images. Product and variant editing requires ownership.
        </p>
      </div>
    </div>
  );
};

export default InventoryEditPage;