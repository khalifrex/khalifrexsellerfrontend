"use client";

import { useState, useEffect, useRef } from 'react';
import { Search, Edit3, Package, CheckCircle, XCircle } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

const SellerInventoryPage = () => {
  const router = useRouter();
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    page: 1
  });
  const [pagination, setPagination] = useState({});
  const [editingOffer, setEditingOffer] = useState(null);
  const [editForm, setEditForm] = useState({ price: '', stock: '', isActive: true });
  const [updating, setUpdating] = useState(false);
  
  const searchTimeoutRef = useRef(null);

  // Handle row click - navigate to edit page
  const handleRowClick = (item) => {
    router.push(`/dashboard/inventory/edit/${item.variantId}`);
  };

  // Fetch inventory data
  const fetchInventory = async (newFilters = filters) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: newFilters.page,
        limit: 20,
        status: newFilters.status,
        search: newFilters.search.trim()
      });

      const res = await fetch(`http://localhost:3092/seller/inventory?${params}`, {
        credentials: 'include'
      });

      if (!res.ok) throw new Error('Failed to fetch inventory');
      
      const data = await res.json();
      setInventory(data.inventory);
      setPagination(data.pagination);
      setError('');
    } catch (err) {
      console.error('Fetch inventory error:', err);
      setError(err.message || 'Failed to load inventory');
      setInventory([]);
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchInventory();
  }, []);

  // Handle search with debouncing
  const handleSearchChange = (value) => {
    setFilters(prev => ({ ...prev, search: value, page: 1 }));
    
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    searchTimeoutRef.current = setTimeout(() => {
      fetchInventory({ ...filters, search: value, page: 1 });
    }, 500);
  };

  // Handle status filter change
  const handleStatusChange = (status) => {
    const newFilters = { ...filters, status, page: 1 };
    setFilters(newFilters);
    fetchInventory(newFilters);
  };

  // Handle pagination
  const handlePageChange = (newPage) => {
    const newFilters = { ...filters, page: newPage };
    setFilters(newFilters);
    fetchInventory(newFilters);
  };

  // Open edit modal
  const startEditing = (item) => {
    setEditingOffer(item.offerId);
    setEditForm({
      price: item.price.toString(),
      stock: item.stock.toString(),
      isActive: item.isActive
    });
  };

  // Handle quick update
  const handleQuickUpdate = async () => {
    if (!editingOffer) return;

    try {
      setUpdating(true);
      
      const res = await fetch(`http://localhost:3092/seller/offers/${editingOffer}/quick-update`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          price: parseFloat(editForm.price),
          stock: parseInt(editForm.stock),
          isActive: editForm.isActive
        })
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Update failed');
      }

      await fetchInventory();
      setEditingOffer(null);
      
    } catch (err) {
      console.error('Quick update error:', err);
      setError(err.message || 'Update failed');
    } finally {
      setUpdating(false);
    }
  };

  const getStatusIcon = (isActive) => {
    return isActive ? (
      <CheckCircle className="w-4 h-4 text-green-500" />
    ) : (
      <XCircle className="w-4 h-4 text-red-500" />
    );
  };

  const getStockStatus = (stock) => {
    if (stock === 0) return { color: 'text-red-600' };
    if (stock < 10) return { color: 'text-yellow-600' };
    return { color: 'text-green-600' };
  };

  if (loading && inventory.length === 0) {
    return (
      <div className="p-8 text-center">
        <Package className="w-12 h-12 text-gray-400 mx-auto mb-4 animate-pulse" />
        <p className="text-gray-500">Loading inventory...</p>
      </div>
    );
  }

  return (
    <div className="p-4">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">My Inventory</h1>
        <p className="text-gray-600 text-sm">Manage your offers</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded border p-4 mb-4">
        <div className="flex gap-4 items-center">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              value={filters.search}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded text-sm focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <select
            value={filters.status}
            onChange={(e) => handleStatusChange(e.target.value)}
            className="border rounded px-3 py-2 text-sm focus:ring-1 focus:ring-blue-500"
          >
            <option value="all">All</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded p-3 mb-4 text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Inventory Table */}
      <div className="bg-white rounded border overflow-hidden">
        {inventory.length === 0 && !loading ? (
          <div className="p-8 text-center">
            <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No inventory found</p>
          </div>
        ) : (
          <table className="w-full table-fixed">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left py-4 px-4 font-medium max-w-xs">Product</th>
                <th className="text-left py-4 px-4 font-medium w-24 min-w-[96px]">Price</th>
                <th className="text-left py-4 px-4 font-medium w-20 min-w-[80px]">Stock</th>
                <th className="text-left py-4 px-4 font-medium w-24 min-w-[96px]">Status</th>
                <th className="text-left py-4 px-4 font-medium w-16 min-w-[64px]">Edit</th>
              </tr>
            </thead>
            <tbody>
              {inventory.map((item) => {
                const stockStatus = getStockStatus(item.stock);
                return (
                  <tr 
                    key={item.offerId} 
                    className="border-b hover:bg-gray-50 cursor-pointer"
                    onClick={() => handleRowClick(item)}
                  >
                    <td className="py-4 px-4 max-w-xs">
                      <div className="flex items-start gap-3">
                        <div className="relative w-10 h-10 rounded bg-gray-100 flex-shrink-0">
                          {item.mainImage ? (
                            <Image
                              src={item.mainImage.url}
                              alt="Product"
                              fill
                              className="object-cover rounded"
                            />
                          ) : (
                            <Package className="w-5 h-5 text-gray-400 absolute inset-0 m-auto" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-gray-900 leading-tight break-words">
                            {item.variantName || 'Unnamed Variant'}
                          </p>
                          {item.variantAttributes && Object.entries(item.variantAttributes).length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {Object.entries(item.variantAttributes).slice(0, 2).map(([key, value]) => (
                                <span key={key} className="text-xs bg-gray-100 px-2 py-0.5 rounded">
                                  {value}
                                </span>
                              ))}
                            </div>
                          )}
                          {item.sellerSku && (
                            <p className="text-xs text-gray-400 mt-1 truncate">
                              {item.sellerSku}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="font-semibold text-gray-900">${item.price.toFixed(2)}</span>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`font-semibold ${stockStatus.color}`}>
                        {item.stock}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(item.isActive)}
                        <span className={`text-xs font-medium ${item.isActive ? 'text-green-600' : 'text-red-600'}`}>
                          {item.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          startEditing(item);
                        }}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-between items-center mt-4">
          <span className="text-gray-600">
            {pagination.totalItems} items
          </span>
          <div className="flex gap-2">
            {pagination.currentPage > 1 && (
              <button
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                className="px-4 py-2 border rounded hover:bg-gray-50 transition-colors"
              >
                Previous
              </button>
            )}
            {pagination.currentPage < pagination.totalPages && (
              <button
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                className="px-4 py-2 border rounded hover:bg-gray-50 transition-colors"
              >
                Next
              </button>
            )}
          </div>
        </div>
      )}

      {/* Quick Edit Modal */}
      {editingOffer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded shadow-xl max-w-sm w-full p-4">
            <h3 className="text-lg font-semibold mb-4">Quick Edit</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">Price ($)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={editForm.price}
                  onChange={(e) => setEditForm(prev => ({ ...prev, price: e.target.value }))}
                  className="w-full border rounded px-3 py-2 text-sm focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Stock</label>
                <input
                  type="number"
                  min="0"
                  value={editForm.stock}
                  onChange={(e) => setEditForm(prev => ({ ...prev, stock: e.target.value }))}
                  className="w-full border rounded px-3 py-2 text-sm focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={editForm.isActive}
                  onChange={(e) => setEditForm(prev => ({ ...prev, isActive: e.target.checked }))}
                  className="rounded"
                />
                <label htmlFor="isActive" className="text-sm font-medium">
                  Active
                </label>
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  onClick={handleQuickUpdate}
                  disabled={updating}
                  className="flex-1 bg-blue-600 text-white py-2 px-3 rounded text-sm hover:bg-blue-700 disabled:opacity-50"
                >
                  {updating ? 'Updating...' : 'Update'}
                </button>
                <button
                  onClick={() => setEditingOffer(null)}
                  disabled={updating}
                  className="px-3 py-2 border rounded text-sm hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SellerInventoryPage;