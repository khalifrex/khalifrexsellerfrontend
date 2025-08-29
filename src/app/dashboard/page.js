"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";

import { ArrowUpRight, ArrowDownRight, ShoppingBag } from "lucide-react";
import Link from "next/link";

import TopProducts from "@/components/sellerDashboardComponents/TopProducts";

const ResponsiveContainer = dynamic(
  () => import("recharts").then(m => m.ResponsiveContainer),
  { ssr: false }
);
const LineChart = dynamic(
  () => import("recharts").then(m => m.LineChart),
  { ssr: false }
);
const Line = dynamic(
  () => import("recharts").then(m => m.Line),
  { ssr: false }
);
const XAxis = dynamic(
  () => import("recharts").then(m => m.XAxis),
  { ssr: false }
);
const YAxis = dynamic(
  () => import("recharts").then(m => m.YAxis),
  { ssr: false }
);
const CartesianGrid = dynamic(
  () => import("recharts").then(m => m.CartesianGrid),
  { ssr: false }
);
const Tooltip = dynamic(
  () => import("recharts").then(m => m.Tooltip),
  { ssr: false }
);

export default function SellerHomePage() {
  const [timeframe, setTimeframe] = useState("week");

   const [stats, setStats] = useState({
    todaySales: 0,
    yesterdaySales: 0,
    pendingOrders: 0,
    pendingYesterday: 0,
    customersToday: 0,
    customersYesterday: 0,
    recentOrders: [],
  });

  const [revenueData, setRevenueData] = useState({
  week: [],
  month: [],
  year: [],
});



   useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch("http://localhost:3092/seller/dashboard-stats", {
          credentials: "include", 
        });
        if (!res.ok) throw new Error("Failed to fetch stats");
        const data = await res.json();
        setStats(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchStats();
  }, []);

  useEffect(() => {
  const fetchRevenueData = async () => {
    try {
      const res = await fetch("http://localhost:3092/seller/revenue-data", {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch revenue data");
      const data = await res.json();
      setRevenueData(data);
    } catch (err) {
      console.error(err);
    }
  };
  fetchRevenueData();
}, []);



  // Calculate changes
  const salesChange = stats.yesterdaySales
    ? (((stats.todaySales - stats.yesterdaySales) / stats.yesterdaySales) * 100).toFixed(1)
    : 0;
  const ordersChange = stats.pendingYesterday
    ? (((stats.pendingOrders - stats.pendingYesterday) / stats.pendingYesterday) * 100).toFixed(1)
    : 0;
  const customerChange = stats.customersYesterday
    ? (((stats.customersToday - stats.customersYesterday) / stats.customersYesterday) * 100).toFixed(1)
    : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold text-[#1888CA]">
            Welcome back to Khalifrex Seller
          </h1>
          <p className="text-gray-500 text-sm">Your control center for growth & success</p>
        </div>
        <button className="bg-[#1888CA] text-white px-4 py-2 rounded hover:opacity-90 transition">
          Upgrade Plan
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Today's Sales" value={`$${stats.todaySales.toLocaleString()}`} change={salesChange} />
        <StatCard label="Pending Orders" value={stats.pendingOrders} change={ordersChange} />
        <StatCard label="New Customers" value={stats.customersToday} change={customerChange} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded shadow space-y-4 xl:col-span-2">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-500">Revenue</p>
            <select
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value)}
              className="border text-sm rounded px-3 py-1 focus:outline-none focus:ring-[#1888CA]"
            >
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="year">This Year</option>
            </select>
          </div>
          <div className="w-full h-56 sm:h-72 md:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={revenueData[timeframe]}
                margin={{ top: 10, right: 20, left: -10, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" fontSize={11} />
                <YAxis fontSize={11} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#1888CA"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-4 rounded shadow space-y-3">
          <div className="flex items-center justify-between mb-2">
            <p className="font-medium">Recent Orders</p>
            <Link href="/dashboard/orders" className="text-sm text-[#1888CA] hover:underline">
              View All
            </Link>
          </div>
          <div className="space-y-2">
            {stats.recentOrders.length === 0 && (
              <div className="text-gray-400 text-sm">No recent orders</div>
            )}
            {stats.recentOrders.map(order => (
              <div key={order._id} className="flex items-center justify-between text-sm bg-gray-50 p-2 rounded">
                <div className="flex items-center gap-2">
                  <ShoppingBag size={16} className="text-gray-500" />
                  <p className="font-medium">{order.buyerName}</p>
                </div>
                <div className="flex items-center gap-3">
                  <p className="font-semibold">${order.totalAmount}</p>
                  <span className={`text-xs px-2 py-0.5 rounded ${order.status === "delivered" ? "bg-green-100 text-green-600" : "bg-yellow-100 text-yellow-600"}`}>
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <TopProducts />
    </div>
  );
}

function StatCard({ label, value, change }) {
  return (
    <div className="bg-white p-4 rounded shadow space-y-2">
      <p className="text-sm text-gray-500">{label}</p>
      <h2 className="text-2xl font-bold">{value}</h2>
      <div className={`flex items-center text-sm ${change >= 0 ? "text-green-600" : "text-red-500"}`}>
        {change >= 0 ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
        <span className="ml-1">{Math.abs(change)}% from yesterday</span>
      </div>
    </div>
  );
}