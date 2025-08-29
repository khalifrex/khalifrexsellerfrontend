"use client";

import { useState, useEffect } from "react";

export default function AddressAutocomplete({ billingAddress, setBillingAddress }) {
  const [query, setQuery] = useState(billingAddress.apartment || "");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  // Keep query in sync with billingAddress.apartment
  useEffect(() => {
    if (billingAddress.apartment) {
      setQuery(billingAddress.apartment);
    }
  }, [billingAddress.apartment]);

  const handleChange = async (e) => {
    const value = e.target.value;
    setQuery(value);

    if (value.length < 3) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&q=${encodeURIComponent(value)}`
      );
      const data = await res.json();
      setResults(data);
    } catch (err) {
      console.error("Nominatim error:", err);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (item) => {
    const address = item.address;

    setBillingAddress({
      ...billingAddress,
      apartment: item.display_name,
      city: address.city || address.town || address.village || "",
      state: address.state || "",
      postalCode: address.postcode || "",
      country: address.country || ""
    });

    setQuery(item.display_name);
    setResults([]);
  };

  return (
    <div className="relative">
      <input
        type="text"
        value={query}
        onChange={handleChange}
        placeholder="Search address..."
        className="border p-2 rounded w-full"
      />
      {loading && (
        <div className="absolute bg-white border mt-1 rounded shadow p-2">
          Loading...
        </div>
      )}
      {results.length > 0 && (
        <div className="absolute bg-white border mt-1 rounded shadow max-h-60 overflow-y-auto w-full z-50">
          {results.map((item) => (
            <div
              key={item.place_id}
              onClick={() => handleSelect(item)}
              className="p-2 hover:bg-gray-100 cursor-pointer"
            >
              {item.display_name}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
