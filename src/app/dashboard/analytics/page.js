'use client';

import { useEffect, useState } from 'react';
import SellerRevenuePage from '../../../components/sellerDashboardComponents/SellerRevenuePage';

export default function SellerAnalyticsPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formattedOrders, setFormattedOrders] = useState([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch("http://localhost:3092/seller/dashboard-stats", {
          credentials: "include",
        });
        if (!res.ok) throw new Error('Failed to fetch stats');
        const data = await res.json();
        setStats(data);

        // Format dates here in client
        if (data?.recentOrders?.length) {
          const formatted = data.recentOrders.map((order) => ({
            ...order,
            formattedDate: new Date(order.createdAt).toLocaleDateString(),
            formattedTotal: `$${order.totalAmount.toLocaleString()}`
          }));
          setFormattedOrders(formatted);
        } else {
          setFormattedOrders([]);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <p>Loading analytics...</p>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <p className="text-red-500">Failed to load analytics.</p>
      </div>
    );
  }

  return (
    <>
      <SellerRevenuePage />
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Seller Analytics</h1>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <SummaryCard title="Total Orders" value={stats.totalOrders} />
          <SummaryCard title="Delivered Orders" value={stats.deliveredOrders} />
          <SummaryCard title="Rejected Orders" value={stats.rejectedOrders} />
          <SummaryCard title="Today's Sales" value={`$${stats.todaySales?.toLocaleString()}`} />
          <SummaryCard title="Yesterday's Sales" value={`$${stats.yesterdaySales?.toLocaleString()}`} />
          <SummaryCard title="Pending Orders (Today)" value={stats.pendingOrders} />
          <SummaryCard title="Pending Orders (Yesterday)" value={stats.pendingYesterday} />
          <SummaryCard title="Today's Customers" value={stats.customersToday} />
          <SummaryCard title="Yesterday's Customers" value={stats.customersYesterday} />
        </div>

        {/* Recent Orders */}
        <div className="bg-white border rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">Recent Orders</h2>
          {formattedOrders.length > 0 ? (
            <ul className="divide-y">
              {formattedOrders.map((order) => (
                <li key={order._id} className="py-3">
                  <p className="text-gray-800 font-medium">
                    {order.orderReference}
                  </p>
                  <p className="text-gray-500 text-sm">
                    Buyer: {order.buyerName}
                  </p>
                  <p className="text-gray-500 text-sm">
                    Date: {order.formattedDate}
                  </p>
                  <p className="text-gray-700">
                    Total: {order.formattedTotal}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No recent orders.</p>
          )}
        </div>
      </div>
    </>
  );
}

function SummaryCard({ title, value }) {
  return (
    <div className="bg-white border rounded-xl p-5 shadow-sm hover:shadow-md transition">
      <h3 className="text-sm font-medium text-gray-500 mb-1">{title}</h3>
      <p className="text-xl font-bold text-gray-900">{value}</p>
    </div>
  );
}
