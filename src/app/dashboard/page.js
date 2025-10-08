"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  ShoppingBag, 
  DollarSign,
  TrendingUp,
  Package,
  Clock,
  Users,
  Crown,
  Lock,
  AlertCircle
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

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
  const [loading, setLoading] = useState(true);
  const [sellerInfo, setSellerInfo] = useState(null);

  const [stats, setStats] = useState({
    todaySales: 0,
    yesterdaySales: 0,
    pendingOrders: 0,
    pendingYesterday: 0,
    customersToday: 0,
    customersYesterday: 0,
    totalOrders: 0,
    deliveredOrders: 0,
    rejectedOrders: 0,
    recentOrders: [],
  });

  const [balance, setBalance] = useState({
    available: 0,
    pending: 0,
    total: 0,
    canWithdraw: false,
    minimumWithdrawal: 10,
    commissionRate: "10%",
    currency: "USD"
  });

  const [revenueData, setRevenueData] = useState({
    week: [],
    month: [],
    year: [],
  });

  const [topProducts, setTopProducts] = useState([]);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchSellerInfo(),
        fetchStats(),
        fetchBalance(),
        fetchRevenueData(),
      ]);
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSellerInfo = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/seller/store-info`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch seller info");
      const data = await res.json();
      setSellerInfo(data);
      
      // Fetch top products only for professional sellers
      if (data.subscriptionType === "professional") {
        fetchTopProducts();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/seller/dashboard-stats`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch stats");
      const data = await res.json();
      setStats(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchBalance = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/seller/balance`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch balance");
      const data = await res.json();
      setBalance(data.balance);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchRevenueData = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/seller/revenue-data`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch revenue data");
      const data = await res.json();
      setRevenueData(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchTopProducts = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/seller/top-products`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch top products");
      const data = await res.json();
      setTopProducts(data);
    } catch (err) {
      console.error(err);
    }
  };

  const isProfessional = sellerInfo?.subscriptionType === "professional";

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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-4">
            <div className="absolute inset-0 border-4 border-slate-200 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-emerald-500 rounded-full border-t-transparent animate-spin"></div>
          </div>
          <p className="text-slate-600 font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
              Welcome back, {sellerInfo?.storeName || "Seller"}
            </h1>
            {isProfessional && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-amber-400 to-orange-500 text-white text-xs font-semibold rounded-full">
                <Crown size={14} />
                PRO
              </span>
            )}
          </div>
          <p className="text-slate-600 text-sm">Your control center for growth & success</p>
        </div>
        {!isProfessional && (
          <Link
            href="/dashboard/subscription"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-5 py-2.5 rounded-lg hover:from-emerald-600 hover:to-teal-700 transition-all shadow-md hover:shadow-lg font-medium"
          >
            <Crown size={18} />
            Upgrade to Pro
          </Link>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          label="Today's Sales" 
          value={`$${stats.todaySales.toLocaleString()}`} 
          change={salesChange}
          icon={DollarSign}
          gradient="from-emerald-500 to-teal-600"
        />
        <StatCard 
          label="Pending Orders" 
          value={stats.pendingOrders} 
          change={ordersChange}
          icon={Clock}
          gradient="from-amber-500 to-orange-600"
        />
        <StatCard 
          label="New Customers" 
          value={stats.customersToday} 
          change={customerChange}
          icon={Users}
          gradient="from-blue-500 to-indigo-600"
        />
        <StatCard 
          label="Total Balance" 
          value={`$${balance.total.toFixed(2)}`}
          subtitle={`$${balance.available.toFixed(2)} available`}
          icon={TrendingUp}
          gradient="from-purple-500 to-pink-600"
          actionLink="/dashboard/balance"
        />
      </div>

      {/* Balance Overview */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-700 rounded-xl p-6 text-white shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold mb-1">Balance Overview</h2>
            <p className="text-slate-300 text-sm">Track your earnings and withdrawals</p>
          </div>
          <DollarSign className="w-10 h-10 text-emerald-400" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
            <p className="text-slate-300 text-sm mb-1">Available Balance</p>
            <p className="text-2xl font-bold text-emerald-400">${balance.available.toFixed(2)}</p>
            <p className="text-xs text-slate-400 mt-1">Ready to withdraw</p>
          </div>
          <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
            <p className="text-slate-300 text-sm mb-1">Pending Balance</p>
            <p className="text-2xl font-bold text-amber-400">${balance.pending.toFixed(2)}</p>
            <p className="text-xs text-slate-400 mt-1">Processing orders</p>
          </div>
          <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
            <p className="text-slate-300 text-sm mb-1">Total Earnings</p>
            <p className="text-2xl font-bold">${balance.total.toFixed(2)}</p>
            <p className="text-xs text-slate-400 mt-1">Commission: {balance.commissionRate}</p>
          </div>
        </div>

        <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/20">
          <div className="flex items-center gap-2 text-sm">
            <AlertCircle size={16} className="text-slate-300" />
            <span className="text-slate-300">
              Min. withdrawal: ${balance.minimumWithdrawal}
            </span>
          </div>
          <Link
            href="/dashboard/balance"
            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 rounded-lg font-medium text-sm transition-colors"
          >
            View Details
          </Link>
        </div>
      </div>

      {/* Revenue Chart & Recent Orders */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        {isProfessional ? (
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 xl:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Revenue Analytics</h2>
                <p className="text-sm text-slate-600">Track your earnings over time</p>
              </div>
              <select
                value={timeframe}
                onChange={(e) => setTimeframe(e.target.value)}
                className="border border-slate-300 text-sm rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="year">This Year</option>
              </select>
            </div>
            <div className="w-full h-64 sm:h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={revenueData[timeframe]}
                  margin={{ top: 10, right: 20, left: -10, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="label" fontSize={12} stroke="#64748b" />
                  <YAxis fontSize={12} stroke="#64748b" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#fff',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#10b981"
                    strokeWidth={3}
                    dot={{ r: 4, fill: '#10b981' }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        ) : (
          <div className="bg-gradient-to-br from-slate-100 to-slate-50 p-6 rounded-xl border border-slate-200 xl:col-span-2 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center mb-4">
              <Lock className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Premium Analytics</h3>
            <p className="text-slate-600 mb-4 max-w-md">
              Upgrade to Professional to unlock detailed revenue analytics and insights
            </p>
            <Link
              href="/dashboard/subscription"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-5 py-2.5 rounded-lg hover:from-emerald-600 hover:to-teal-700 transition-all font-medium"
            >
              <Crown size={18} />
              Upgrade Now
            </Link>
          </div>
        )}

        {/* Recent Orders */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-900">Recent Orders</h2>
            <Link href="/dashboard/orders" className="text-sm text-emerald-600 hover:text-emerald-700 font-medium">
              View All
            </Link>
          </div>
          <div className="space-y-3">
            {stats.recentOrders.length === 0 ? (
              <div className="text-center py-8">
                <ShoppingBag className="w-12 h-12 mx-auto text-slate-300 mb-2" />
                <p className="text-slate-500 text-sm">No recent orders</p>
              </div>
            ) : (
              stats.recentOrders.map(order => (
                <div key={order._id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                      <ShoppingBag size={20} className="text-emerald-600" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-900 text-sm">{order.buyerName}</p>
                      <p className="text-xs text-slate-500">#{order.orderReference}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-slate-900">${order.totalAmount.toFixed(2)}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Top Products - Professional Only */}
      {isProfessional && topProducts.length > 0 && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Top Performing Products</h2>
              <p className="text-sm text-slate-600">Your best sellers this period</p>
            </div>
            <Link
              href="/dashboard/products"
              className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
            >
              View All Products
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {topProducts.map((product, idx) => (
              <div
                key={product._id || idx}
                className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <div className="relative w-16 h-16 flex-shrink-0 bg-white rounded-lg overflow-hidden">
                  <Image
                    src={product.image || "/placeholder.png"}
                    alt={product.name}
                    fill
                    className="object-contain p-2"
                    sizes="64px"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-900 text-sm truncate">{product.variantName}</p>
                  <p className="text-xs text-slate-600 mt-1">{product.sales} Sold</p>
                  <div className="mt-2 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full"
                      style={{ width: `${Math.min(product.sales / 10 * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-slate-600 font-medium">Total Orders</p>
            <Package className="w-5 h-5 text-slate-400" />
          </div>
          <p className="text-2xl font-bold text-slate-900">{stats.totalOrders}</p>
          <p className="text-xs text-slate-500 mt-1">All time</p>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-slate-600 font-medium">Delivered</p>
            <TrendingUp className="w-5 h-5 text-emerald-500" />
          </div>
          <p className="text-2xl font-bold text-slate-900">{stats.deliveredOrders}</p>
          <p className="text-xs text-emerald-600 mt-1">
            {stats.totalOrders > 0 ? Math.round((stats.deliveredOrders / stats.totalOrders) * 100) : 0}% success rate
          </p>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-slate-600 font-medium">Rejected</p>
            <AlertCircle className="w-5 h-5 text-rose-500" />
          </div>
          <p className="text-2xl font-bold text-slate-900">{stats.rejectedOrders}</p>
          <p className="text-xs text-slate-500 mt-1">Cancelled/Rejected</p>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, change, subtitle, icon: Icon, gradient, actionLink }) {
  const isPositive = change >= 0;
  
  return (
    <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <p className="text-sm text-slate-600 font-medium mb-1">{label}</p>
          <h2 className="text-2xl font-bold text-slate-900">{value}</h2>
          {subtitle && (
            <p className="text-xs text-slate-500 mt-1">{subtitle}</p>
          )}
        </div>
        <div className={`w-12 h-12 bg-gradient-to-br ${gradient} rounded-lg flex items-center justify-center`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
      {change !== undefined && (
        <div className={`flex items-center text-sm ${isPositive ? "text-emerald-600" : "text-rose-600"}`}>
          {isPositive ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
          <span className="ml-1 font-medium">{Math.abs(change)}%</span>
          <span className="ml-1 text-slate-500">from yesterday</span>
        </div>
      )}
      {actionLink && (
        <Link 
          href={actionLink}
          className="inline-block mt-2 text-xs text-emerald-600 hover:text-emerald-700 font-medium"
        >
          View details →
        </Link>
      )}
    </div>
  );
}