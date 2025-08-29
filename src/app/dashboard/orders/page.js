'use client';

import { useState, useEffect } from 'react';

export default function SellerOrdersPage() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch('http://localhost:3092/orders', {
          credentials: 'include',
        });
        if (!res.ok) throw new Error('Failed to fetch orders');

        const data = await res.json();
        setOrders(data.orders || []);
      } catch (err) {
        console.error('Error fetching orders:', err);
      }
    };

    fetchOrders();
  }, []);

  const handleStatusUpdate = async (orderId, productId, status) => {
    try {
      const res = await fetch(`http://localhost:3092/orders/${orderId}/product/${productId}/status`, {
        method: 'PATCH',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      if (!res.ok) throw new Error('Failed to update status');
      const result = await res.json();

      // Only update item-level status
      setOrders((prevOrders) =>
        prevOrders.map((order) => {
          if (order.orderId !== orderId) return order;

          return {
            ...order,
            items: order.items.map((item) =>
              item.productId === productId ? { ...item, status } : item
            ),
          };
        })
      );

    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">My Orders</h1>

      {orders.length === 0 ? (
        <p className="text-gray-500">No orders found.</p>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order.orderId} className="border rounded-xl p-5 shadow-sm hover:shadow-md transition duration-300">
              
              <div className="mb-4">
                <h2 className="text-lg font-semibold">Order Ref: {order.orderReference}</h2>
                <p className="text-sm text-gray-500">
                  Buyer: {order.buyerDetails?.firstName} {order.buyerDetails?.lastName}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Address:{" "}
                  <span className="italic">
                    {order.shippingAddress?.street}, {order.shippingAddress?.city}, {order.shippingAddress?.state}, {order.shippingAddress?.country}
                  </span>
                </p>
              </div>

              <div className="space-y-4">
                {order.items.map((item, idx) => (
                  <div key={`${item.productId}-${idx}`} className="border p-3 rounded bg-gray-50">
                    <h3 className="font-medium">{item.productDetails?.name || 'Product'}</h3>
                    <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                    <p className="text-sm text-gray-500">Price per Unit: ${item.unitPrice}</p>
                    <p className="text-sm text-gray-500">Total: ${item.total}</p>
                    <p className="text-sm text-gray-500">Status: {item.status || 'pending'}</p>

                    {(!item.status || item.status === 'pending') && (
                      <div className="flex gap-2 mt-2">
                        <button
                          className="px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600"
                          onClick={() => handleStatusUpdate(order.orderId, item.productId, 'accepted')}
                        >
                          Accept
                        </button>
                        <button
                          className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600"
                          onClick={() => handleStatusUpdate(order.orderId, item.productId, 'cancelled')}
                        >
                          Cancel
                        </button>
                      </div>
                    )}

                    {item.status === 'accepted' && (
                      <button
                        className="mt-2 px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
                        onClick={() => handleStatusUpdate(order.orderId, item.productId, 'delivered')}
                      >
                        Mark as Delivered
                      </button>
                    )}

                    {item.status === 'cancelled' && (
                      <p className="text-sm text-red-500 mt-2">This item was cancelled.</p>
                    )}

                    {item.status === 'delivered' && (
                      <p className="text-sm text-green-500 mt-2">Delivered successfully.</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
