"use client";

import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Filler,
  Tooltip,
} from "chart.js";

// Register Chart.js components
ChartJS.register(
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Filler,
  Tooltip
);

import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";

// Dynamically import Line to avoid hydration error
const Line = dynamic(() => import("react-chartjs-2").then(mod => mod.Line), {
  ssr: false,
});

export default function TopProducts() {
  const [topProducts, setTopProducts] = useState([]);

  useEffect(() => {
    const fetchTopProducts = async () => {
      try {
        const res = await fetch("http://localhost:3092/top-products", {
          credentials: "include",
        });
        if (!res.ok) throw new Error("Failed to fetch top products");
        const data = await res.json();
        setTopProducts(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchTopProducts();
  }, []);

  return (
    <div className="bg-white p-4 rounded shadow space-y-4">
      <div className="flex items-center justify-between mb-2">
        <p className="font-medium">Top Products</p>
        <Link
          href="/dashboard/products"
          className="text-sm text-[#1888CA] hover:underline"
        >
          View All
        </Link>
      </div>

      <div className="space-y-4">
        {topProducts.length === 0 && (
          <div className="text-gray-400 text-sm">No top products</div>
        )}
        {topProducts.map((product, idx) => {
          const progress = product.target
            ? Math.min((product.sales / product.target) * 100, 100)
            : 100;

          return (
            <div
              key={product._id || idx}
              className="flex flex-col space-y-2 bg-gray-50 p-3 rounded"
            >
              <div className="flex items-center justify-between">
                {/* Make product clickable */}
                <Link
                  href={`/dashboard/products/${product.slug || product._id}`}
                  className="flex items-center gap-3 hover:opacity-80 transition"
                >
                  <div className="w-10 h-10 relative">
                    <Image
                      src={product.image}
                      alt={product.variantName}
                      fill
                      className="rounded object-cover"
                    />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{product.variantName}</p>
                    <p className="text-xs text-gray-500">{product.sales} Sold</p>
                  </div>
                </Link>

                {/* Mini Sparkline */}
                <div className="w-24 h-10">
                  <Line
                    data={{
                      labels: product.trend ? product.trend.map((_, i) => i + 1) : [],
                      datasets: [
                        {
                          data: product.trend || [],
                          borderColor: "#1888CA",
                          backgroundColor: "rgba(24,136,202,0.1)",
                          borderWidth: 2,
                          fill: true,
                          pointRadius: 0,
                          tension: 0.4,
                        },
                      ],
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: { display: false },
                        tooltip: { enabled: false },
                      },
                      scales: {
                        x: { display: false },
                        y: { display: false },
                      },
                    }}
                  />
                </div>
              </div>

              {/* Progress Bar */}
              <div className="h-2 bg-gray-200 rounded-full">
                <div
                  className="h-full bg-[#1888CA] rounded-full transition-all"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>

              <p className="text-xs text-gray-500">
                {progress.toFixed(0)}% of target
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
