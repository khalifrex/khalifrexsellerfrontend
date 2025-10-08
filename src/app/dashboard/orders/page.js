'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Package, 
  TrendingUp, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Truck,
  AlertCircle,
  Search,
  Filter,
  ChevronDown,
  MapPin,
  User,
  Mail,
  Phone
} from 'lucide-react';
import Image from 'next/image';
import toast from 'react-hot-toast';

export default function SellerOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [updatingItem, setUpdatingItem] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [allOrdersStats, setAllOrdersStats] = useState({
    total: 0,
    pending: 0,
    accepted: 0,
    delivered: 0,
    totalRevenue: 0
  });
  const router = useRouter();

  useEffect(() => {
    fetchOrders();
    fetchAllOrdersForStats();
  }, [filterStatus]);

  const fetchAllOrdersForStats = async () => {
    try {
      // Fetch ALL orders without pagination to calculate correct stats
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/orders/seller?limit=1000`, {
        credentials: 'include',
      });
      
      if (!res.ok) throw new Error('Failed to fetch order stats');

      const data = await res.json();
      const allOrders = data.orders || [];
      
      // Calculate stats from all orders
      setAllOrdersStats({
        total: allOrders.length,
        pending: allOrders.filter(o => o.items.some(i => !i.status || i.status === 'pending')).length,
        accepted: allOrders.filter(o => o.items.some(i => i.status === 'accepted')).length,
        delivered: allOrders.filter(o => o.items.some(i => i.status === 'delivered')).length,
        totalRevenue: allOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0)
      });
    } catch (err) {
      console.error('Error fetching order stats:', err);
    }
  };

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const url = filterStatus === 'all' 
        ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/orders/seller`
        : `${process.env.NEXT_PUBLIC_BACKEND_URL}/orders/seller?status=${filterStatus}`;

      const res = await fetch(url, {
        credentials: 'include',
      });
      
      if (!res.ok) throw new Error('Failed to fetch orders');

      const data = await res.json();
      setOrders(data.orders || []);
    } catch (err) {
      console.error('Error fetching orders:', err);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId, productId, newStatus) => {
    const itemKey = `${orderId}-${productId}`;
    
    // Confirmation for critical actions
    if (newStatus === 'cancelled') {
      const confirmed = window.confirm(
        'Are you sure you want to cancel this item? Stock will be restored and the buyer will be notified.'
      );
      if (!confirmed) return;
    }

    setUpdatingItem(itemKey);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/orders/${orderId}/product/${productId}/status`,
        {
          method: 'PATCH',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to update status');
      }

      const result = await res.json();

      // Update local state
      setOrders((prevOrders) =>
        prevOrders.map((order) => {
          if (order.orderId !== orderId) return order;

          return {
            ...order,
            items: order.items.map((item) =>
              item.productId === productId 
                ? { ...item, status: newStatus } 
                : item
            ),
            deliveryStatus: result.deliveryStatus || order.deliveryStatus
          };
        })
      );

      const statusMessages = {
        accepted: '✅ Order accepted! The buyer has been notified.',
        delivered: '🎉 Marked as delivered! Your balance will be updated shortly.',
        cancelled: '❌ Order cancelled. Stock has been restored.'
      };

      toast.success(statusMessages[newStatus] || 'Status updated successfully');
    } catch (err) {
      console.error('Error updating status:', err);
      toast.error(err.message || 'Failed to update status');
    } finally {
      setUpdatingItem(null);
    }
  };

  const statusConfig = {
    pending: { 
      bg: 'bg-amber-50 border-amber-200', 
      text: 'text-amber-700', 
      dot: 'bg-amber-500',
      label: 'Pending',
      icon: Clock 
    },
    accepted: { 
      bg: 'bg-blue-50 border-blue-200', 
      text: 'text-blue-700', 
      dot: 'bg-blue-500',
      label: 'Accepted',
      icon: CheckCircle 
    },
    processing: { 
      bg: 'bg-purple-50 border-purple-200', 
      text: 'text-purple-700', 
      dot: 'bg-purple-500',
      label: 'Processing',
      icon: Package 
    },
    shipped: { 
      bg: 'bg-indigo-50 border-indigo-200', 
      text: 'text-indigo-700', 
      dot: 'bg-indigo-500',
      label: 'Shipped',
      icon: Truck 
    },
    delivered: { 
      bg: 'bg-emerald-50 border-emerald-200', 
      text: 'text-emerald-700', 
      dot: 'bg-emerald-500',
      label: 'Delivered',
      icon: CheckCircle 
    },
    cancelled: { 
      bg: 'bg-rose-50 border-rose-200', 
      text: 'text-rose-700', 
      dot: 'bg-rose-500',
      label: 'Cancelled',
      icon: XCircle 
    }
  };

  const getStatusBadge = (status) => {
    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;
    
    return (
      <span className={`inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full font-medium border ${config.bg} ${config.text}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`}></span>
        {config.label}
      </span>
    );
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = searchQuery === '' || 
      order.orderNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.buyerDetails?.fullName?.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesSearch;
  });

  const orderStats = {
    total: orders.length,
    pending: orders.filter(o => o.items.some(i => i.status === 'pending')).length,
    accepted: orders.filter(o => o.items.some(i => i.status === 'accepted')).length,
    delivered: orders.filter(o => o.items.some(i => i.status === 'delivered')).length,
    totalRevenue: orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0)
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-4">
            <div className="absolute inset-0 border-4 border-slate-200 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-emerald-500 rounded-full border-t-transparent animate-spin"></div>
          </div>
          <p className="text-slate-600 font-medium">Loading your orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <button
            onClick={() => router.push('/dashboard')}
            className="inline-flex items-center text-slate-600 hover:text-slate-900 mb-4 group transition-colors"
          >
            <ArrowLeft size={20} className="mr-2 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Back to Dashboard</span>
          </button>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-1">
                Order Management
              </h1>
              <p className="text-slate-600">Track and manage your customer orders</p>
            </div>
            <div className="flex items-center gap-3 bg-gradient-to-br from-emerald-500 to-teal-600 text-white px-5 py-3 rounded-xl shadow-lg">
              <TrendingUp size={24} />
              <div>
                <p className="text-xs text-emerald-50">Total Revenue</p>
                <p className="text-xl font-bold">${orderStats.totalRevenue.toFixed(2)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-slate-600 font-medium">Total Orders</p>
              <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                <Package size={20} className="text-slate-600" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-slate-900">{orderStats.total}</p>
            <p className="text-xs text-slate-500 mt-1">All time</p>
          </div>

          <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-4 sm:p-5 border border-amber-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-amber-900 font-medium">Pending</p>
              <div className="w-10 h-10 bg-white/80 rounded-lg flex items-center justify-center">
                <Clock size={20} className="text-amber-600" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-amber-900">{orderStats.pending}</p>
            <p className="text-xs text-amber-700 mt-1">Awaiting action</p>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 sm:p-5 border border-blue-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-blue-900 font-medium">Accepted</p>
              <div className="w-10 h-10 bg-white/80 rounded-lg flex items-center justify-center">
                <CheckCircle size={20} className="text-blue-600" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-blue-900">{orderStats.accepted}</p>
            <p className="text-xs text-blue-700 mt-1">In progress</p>
          </div>

          <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl p-4 sm:p-5 border border-emerald-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-emerald-900 font-medium">Delivered</p>
              <div className="w-10 h-10 bg-white/80 rounded-lg flex items-center justify-center">
                <CheckCircle size={20} className="text-emerald-600" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-emerald-900">{orderStats.delivered}</p>
            <p className="text-xs text-emerald-700 mt-1">Completed</p>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input
                type="text"
                placeholder="Search by order number or buyer name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>

            {/* Filter Button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg transition-colors"
            >
              <Filter size={20} />
              <span className="hidden sm:inline">Filters</span>
              <ChevronDown size={16} className={`transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>
          </div>

          {/* Filter Options */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-slate-200">
              <p className="text-sm font-medium text-slate-700 mb-3">Filter by status:</p>
              <div className="flex flex-wrap gap-2">
                {['all', 'pending', 'accepted', 'processing', 'shipped', 'delivered', 'cancelled'].map((status) => (
                  <button
                    key={status}
                    onClick={() => setFilterStatus(status)}
                    className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                      filterStatus === status
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border border-slate-200 shadow-sm">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="w-10 h-10 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No orders found</h3>
            <p className="text-slate-600">
              {searchQuery ? 'Try adjusting your search criteria' : 'Your orders will appear here once customers place them'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => {
              const isExpanded = expandedOrder === order.orderId;
              
              return (
                <div 
                  key={order.orderId} 
                  className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-lg transition-all overflow-hidden"
                >
                  {/* Order Header */}
                  <div className="bg-gradient-to-r from-slate-800 to-slate-700 p-4 sm:p-5 text-white">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h2 className="text-lg sm:text-xl font-bold">#{order.orderNumber}</h2>
                          {getStatusBadge(order.deliveryStatus || 'pending')}
                        </div>
                        <div className="flex flex-wrap items-center gap-3 text-sm text-slate-300">
                          <span className="flex items-center gap-1">
                            <User size={14} />
                            {order.buyerDetails?.fullName || 'N/A'}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock size={14} />
                            {new Date(order.createdAt).toLocaleDateString()}
                          </span>
                          <span className="flex items-center gap-1">
                            <Package size={14} />
                            {order.items?.length || 0} item(s)
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-slate-300 mb-1">Order Total</p>
                        <p className="text-2xl sm:text-3xl font-bold">${order.totalAmount?.toFixed(2)}</p>
                      </div>
                    </div>
                  </div>

                  {/* Buyer & Shipping Info */}
                  <div className="p-4 sm:p-5 bg-slate-50 border-b border-slate-200">
                    <div className="grid sm:grid-cols-2 gap-4">
                      {/* Buyer Info */}
                      <div>
                        <p className="text-xs font-semibold text-slate-500 uppercase mb-2">Buyer Information</p>
                        <div className="space-y-1.5 text-sm">
                          <div className="flex items-start gap-2 text-slate-700">
                            <User size={16} className="mt-0.5 flex-shrink-0" />
                            <span>{order.buyerDetails?.fullName || 'N/A'}</span>
                          </div>
                          {order.buyerDetails?.email && (
                            <div className="flex items-start gap-2 text-slate-700">
                              <Mail size={16} className="mt-0.5 flex-shrink-0" />
                              <span className="break-all">{order.buyerDetails.email}</span>
                            </div>
                          )}
                          {order.buyerDetails?.phoneNumber && (
                            <div className="flex items-start gap-2 text-slate-700">
                              <Phone size={16} className="mt-0.5 flex-shrink-0" />
                              <span>{order.buyerDetails.phoneNumber}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Shipping Address */}
                      <div>
                        <p className="text-xs font-semibold text-slate-500 uppercase mb-2">Shipping Address</p>
                        <div className="flex items-start gap-2 text-sm text-slate-700">
                          <MapPin size={16} className="mt-0.5 flex-shrink-0" />
                          <p>
                            {order.shippingAddress?.street}, {order.shippingAddress?.city},{' '}
                            {order.shippingAddress?.state}, {order.shippingAddress?.country}
                            {order.shippingAddress?.postalCode && ` - ${order.shippingAddress.postalCode}`}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="p-4 sm:p-5">
                    <button
                      onClick={() => setExpandedOrder(isExpanded ? null : order.orderId)}
                      className="w-full flex items-center justify-between text-left mb-4 pb-3 border-b border-slate-200"
                    >
                      <h3 className="text-base font-semibold text-slate-900">
                        Order Items ({order.items?.length || 0})
                      </h3>
                      <ChevronDown 
                        size={20} 
                        className={`text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
                      />
                    </button>

                    {isExpanded && (
                      <div className="space-y-3">
                        {order.items?.map((item, idx) => {
                          const itemKey = `${order.orderId}-${item.productId}`;
                          const isUpdating = updatingItem === itemKey;
                          const itemStatus = item.status || 'pending';

                          return (
                            <div 
                              key={`${item.productId}-${idx}`} 
                              className="border border-slate-200 rounded-lg p-4 bg-slate-50/50 hover:bg-slate-50 transition-colors"
                            >
                              <div className="flex flex-col sm:flex-row gap-4">
                                {/* Product Image */}
                                <div className="relative w-full sm:w-24 h-24 flex-shrink-0 bg-white rounded-lg overflow-hidden border border-slate-200">
                                  <Image
                                    src={item.productDetails?.images?.[0]?.url || '/placeholder.png'}
                                    alt={item.productDetails?.name || 'Product'}
                                    fill
                                    className="object-contain p-2"
                                    sizes="(max-width: 640px) 100vw, 96px"
                                  />
                                </div>
                                
                                {/* Product Details */}
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-semibold text-slate-900 mb-2 line-clamp-2">
                                    {item.productDetails?.name || 'Product'}
                                  </h4>
                                  <div className="grid grid-cols-2 gap-2 text-sm">
                                    <div>
                                      <span className="text-slate-500">Quantity:</span>
                                      <span className="ml-2 font-medium text-slate-900">{item.quantity}</span>
                                    </div>
                                    <div>
                                      <span className="text-slate-500">Unit Price:</span>
                                      <span className="ml-2 font-medium text-slate-900">${item.unitPrice?.toFixed(2)}</span>
                                    </div>
                                    <div className="col-span-2">
                                      <span className="text-slate-500">Total:</span>
                                      <span className="ml-2 font-bold text-emerald-600">${item.total?.toFixed(2)}</span>
                                    </div>
                                  </div>
                                  <div className="mt-3">
                                    {getStatusBadge(itemStatus)}
                                  </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex sm:flex-col gap-2 sm:min-w-[140px]">
                                  {itemStatus === 'pending' && order.paymentStatus === 'paid' && (
                                    <>
                                      <button
                                        onClick={() => handleStatusUpdate(order.orderId, item.productId, 'accepted')}
                                        disabled={isUpdating}
                                        className="flex-1 sm:flex-initial px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-sm font-medium rounded-lg hover:from-emerald-600 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md"
                                      >
                                        {isUpdating ? (
                                          <span className="flex items-center justify-center gap-2">
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                          </span>
                                        ) : (
                                          '✓ Accept'
                                        )}
                                      </button>
                                      <button
                                        onClick={() => handleStatusUpdate(order.orderId, item.productId, 'cancelled')}
                                        disabled={isUpdating}
                                        className="flex-1 sm:flex-initial px-4 py-2.5 bg-rose-500 text-white text-sm font-medium rounded-lg hover:bg-rose-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                      >
                                        {isUpdating ? '...' : '✕ Decline'}
                                      </button>
                                    </>
                                  )}

                                  {itemStatus === 'pending' && order.paymentStatus !== 'paid' && (
                                    <div className="flex items-center gap-2 text-sm text-amber-600 bg-amber-50 px-3 py-2 rounded-lg border border-amber-200">
                                      <AlertCircle size={16} />
                                      <span>Awaiting payment</span>
                                    </div>
                                  )}

                                  {itemStatus === 'accepted' && (
                                    <button
                                      onClick={() => handleStatusUpdate(order.orderId, item.productId, 'delivered')}
                                      disabled={isUpdating}
                                      className="px-4 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-sm font-medium rounded-lg hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md"
                                    >
                                      {isUpdating ? (
                                        <span className="flex items-center justify-center gap-2">
                                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        </span>
                                      ) : (
                                        '📦 Mark Delivered'
                                      )}
                                    </button>
                                  )}

                                  {itemStatus === 'cancelled' && (
                                    <div className="flex items-center justify-center gap-2 text-sm text-rose-600 font-medium bg-rose-50 px-3 py-2 rounded-lg">
                                      <XCircle size={16} />
                                      Cancelled
                                    </div>
                                  )}

                                  {itemStatus === 'delivered' && (
                                    <div className="flex items-center justify-center gap-2 text-sm text-emerald-600 font-medium bg-emerald-50 px-3 py-2 rounded-lg">
                                      <CheckCircle size={16} />
                                      Delivered
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}