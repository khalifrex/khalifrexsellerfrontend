"use client";

import { useEffect, useRef, useState } from "react";
import { Search, ShoppingBag } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

export default function SearchBar({ searchOpen, setSearchOpen }) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState({ products: [], orders: [], customers: [] });
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const suggestTimeout = useRef();

  useEffect(() => {
    if (!searchOpen || !searchQuery.trim()) {
      setSuggestions({ products: [], orders: [], customers: [] });
      setShowSuggestions(false);
      return;
    }
    setLoading(true);
    if (suggestTimeout.current) clearTimeout(suggestTimeout.current);
    suggestTimeout.current = setTimeout(() => {
      fetch(`http://localhost:3092/seller/search-suggestions?q=${encodeURIComponent(searchQuery.trim())}`, { credentials: "include" })
        .then(res => res.json())
        .then(data => {
          setSuggestions(data);
          setShowSuggestions(true);
        })
        .catch(() => setSuggestions({ products: [], orders: [], customers: [] }))
        .finally(() => setLoading(false));
    }, 300);
    return () => clearTimeout(suggestTimeout.current);
  }, [searchQuery, searchOpen]);

  const handleSuggestionClick = (type, id) => {
    setShowSuggestions(false);
    setSearchOpen(false);
    setSearchQuery("");
    if (type === "product") router.push(`/dashboard/inventory/edit/${id}`);
    if (type === "order") router.push(`/dashboard/orders?orderId=${id}`);
    if (type === "customer") router.push(`/dashboard/customers?customerId=${id}`);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/dashboard/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery("");
      setShowSuggestions(false);
    }
  };

  return !searchOpen ? (
    <button
      onClick={() => setSearchOpen(true)}
      className="p-2 rounded hover:bg-gray-100 transition"
    >
      <Search size={18} />
    </button>
  ) : (
    <form
      onSubmit={handleSearch}
      className="flex items-center gap-2 animate-fadeIn relative"
      autoComplete="off"
    >
      <input
        type="text"
        placeholder="Search..."
        className="border border-gray-200 rounded-full px-4 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-[#1888CA] w-48"
        autoFocus
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        onFocus={() => setShowSuggestions(true)}
        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
        onKeyDown={(e) => {
          if (e.key === "Escape") setSearchOpen(false);
        }}
      />
      <button type="submit" className="p-2 rounded hover:bg-gray-100 transition">
        <Search size={16} />
      </button>
      <Link href="/dashboard/orders" className="p-2 rounded hover:bg-gray-100 transition">
        <ShoppingBag size={16} />
      </Link>
      {showSuggestions && (
        <div className="absolute left-0 top-10 w-80 bg-white border border-gray-200 rounded shadow z-50">
          {loading ? (
            <div className="p-3 text-sm text-gray-500">Loading...</div>
          ) : (
            <>
              {["products", "orders", "customers"].every(
                (key) => suggestions[key].length === 0
              ) ? (
                <div className="p-3 text-sm text-gray-500">No results</div>
              ) : (
                ["products", "orders", "customers"].map((type) =>
                  suggestions[type].length > 0 ? (
                    <div key={type}>
                      <div className="px-3 pt-2 pb-1 text-xs text-gray-400 capitalize">{type}</div>
                      {suggestions[type].map((item) => (
                        <div
                          key={item._id || item.orderId}
                          className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 cursor-pointer"
                          onMouseDown={() =>
                            handleSuggestionClick(type.slice(0, -1), item._id || item.orderId)
                          }
                        >
                          {type === "products" && (
                            <Image
                              src={item.images?.[0]?.url || "/placeholder.jpg"}
                              alt={item.name}
                              width={28}
                              height={28}
                              className="rounded"
                            />
                          )}
                          <span className="text-sm">
                            {type === "products" && item.name}
                            {type === "orders" && `Order: ${item.orderReference}`}
                            {type === "customers" && `${item.firstName} ${item.lastName}`}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : null
                )
              )}
            </>
          )}
        </div>
      )}
    </form>
  );
}
