'use client';

import { useState, useEffect, useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Line,
} from "recharts";

export default function SellerRevenuePage() {
  const [revenueData, setRevenueData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedRange, setSelectedRange] = useState("week");

  useEffect(() => {
    const fetchRevenue = async () => {
      try {
        const res = await fetch("http://localhost:3092/seller/revenue-data", {
          credentials: "include",
        });
        if (!res.ok) throw new Error("Failed to fetch revenue");
        const data = await res.json();
        setRevenueData(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchRevenue();
  }, []);

  const rawData = revenueData ? revenueData[selectedRange] : [];

  // Compute cumulative revenue
const chartData = useMemo(() => {
  if (!revenueData) return [];
  const raw = revenueData[selectedRange] || [];
  let cumulative = 0;
  return raw.map((d) => {
    cumulative += d.revenue;
    return { ...d, cumulative };
  });
}, [revenueData, selectedRange]);


  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <p>Loading revenue data...</p>
      </div>
    );
  }

  if (!revenueData) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <p className="text-red-500">Failed to load revenue data.</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Revenue Analytics</h1>

      {/* Range Tabs */}
      <div className="flex gap-2 flex-wrap mb-6">
        {["today", "week", "month", "year"].map((range) => (
          <button
            key={range}
            onClick={() => setSelectedRange(range)}
            className={`px-4 py-2 rounded-md text-sm font-medium border ${
              selectedRange === range
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-700 hover:bg-gray-100"
            }`}
          >
            {range.charAt(0).toUpperCase() + range.slice(1)}
          </button>
        ))}
      </div>

      {/* Chart */}
      <div className="bg-white border rounded-xl shadow-sm p-4">
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="label" />
            <YAxis />
            <Tooltip
              formatter={(value, name) => {
                if (name === "cumulative") {
                  return [`$${value.toLocaleString()}`, "Cumulative Revenue"];
                }
                return [`$${value.toLocaleString()}`, "Revenue"];
              }}
            />
            <Bar
              dataKey="revenue"
              fill="#3B82F6"
              radius={[4, 4, 0, 0]}
              name="Revenue"
            />
            <Line
              type="monotone"
              dataKey="cumulative"
              stroke="#10B981"
              strokeWidth={2}
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
              name="Cumulative Revenue"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
