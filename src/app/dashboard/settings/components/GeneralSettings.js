"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import AddressAutocomplete from "./AddressAutocomplete";
import toast from "react-hot-toast";

export default function GeneralSettings({
  generalOpen,
  setGeneralOpen,
  storeModalOpen,
  setStoreModalOpen,
  storeForm,
  billingAddress,
  currency,
  setCurrency,
  handleBillingInputChange,
}) {
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [selectedCountryId, setSelectedCountryId] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Load countries + prefill if billing address has country
  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const res = await fetch("http://localhost:3092/api/location/countries");
        const data = await res.json();
        setCountries(data);

        if (billingAddress.country) {
          const matched = data.find(
            (c) => c.name.toLowerCase() === billingAddress.country.toLowerCase()
          );
          if (matched) {
            setSelectedCountryId(matched.id);
            const resStates = await fetch(`http://localhost:3092/api/location/states/${matched.id}`);
            const statesData = await resStates.json();
            setStates(statesData);
          }
        }
      } catch (err) {
        console.error("Failed to load countries", err);
      }
    };
    fetchCountries();
  }, [billingAddress.country]);

  // Country change handler
  const handleCountryChange = async (e) => {
    const countryId = e.target.value;
    setSelectedCountryId(countryId);

    const selectedCountry = countries.find((c) => c.id === Number(countryId))?.name || "";
    handleBillingInputChange({
      target: { name: "country", value: selectedCountry },
    });

    try {
      const res = await fetch(`http://localhost:3092/api/location/states/${countryId}`);
      const data = await res.json();
      setStates(data);
    } catch (err) {
      console.error("Failed to load states", err);
      setStates([]);
    }
  };

  // Adapter for AddressAutocomplete
  const handleBillingInputChangeFromObj = async (addressObj) => {
    for (let key in addressObj) {
      handleBillingInputChange({
        target: { name: key, value: addressObj[key] },
      });
    }

    if (addressObj.country) {
      const matchedCountry = countries.find(
        (c) => c.name.toLowerCase() === addressObj.country.toLowerCase()
      );
      if (matchedCountry) {
        setSelectedCountryId(matchedCountry.id);
        try {
          const res = await fetch(`http://localhost:3092/api/location/states/${matchedCountry.id}`);
          const data = await res.json();
          setStates(data);
        } catch (err) {
          console.error("Failed to load states", err);
        }
      }
    }
  };

  // Save handler
  const handleSaveSettings = async () => {
    try {
      setIsSaving(true);
      const res = await fetch("http://localhost:3092/seller/update-settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          billingAddress,
          currency,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong");

      toast.success("Settings updated successfully");
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err) {
      console.error("Error saving settings:", err);
      toast.error(err.message || "Failed to update settings");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section className="bg-white shadow rounded p-6 relative overflow-hidden">
      <button
        onClick={() => setGeneralOpen(!generalOpen)}
        className="flex justify-between w-full text-left"
      >
        <h2 className="text-xl font-medium">General</h2>
        <span className="text-gray-500">{generalOpen ? "−" : "+"}</span>
      </button>

      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-2 left-1/2 transform -translate-x-1/2 bg-green-100 border border-green-300 text-green-700 px-4 py-2 rounded shadow"
          >
            ✅ Settings saved successfully
          </motion.div>
        )}
      </AnimatePresence>

      {generalOpen && (
        <div className="mt-6 space-y-4">
          {/* Store Details */}
          <div className="border rounded p-4 hover:bg-gray-50">
            <h3 className="font-semibold mb-2">Store Details</h3>

            <div
              className="flex justify-between items-center p-3 border rounded hover:bg-gray-100 cursor-pointer"
              onClick={() => setStoreModalOpen(true)}
            >
              <div>
                <p className="font-medium">Store</p>
                <p className="text-sm text-gray-600">{storeForm.storeName}</p>
              </div>
              <span className="text-blue-600">Edit</span>
            </div>

            {/* Billing Address */}
            <div className="mt-3 p-3 border rounded">
              <p className="font-medium mb-2">Billing Address</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  name="legalName"
                  value={billingAddress.legalName}
                  onChange={handleBillingInputChange}
                  placeholder="Legal Business Name"
                  className="border p-2 rounded"
                />

                <AddressAutocomplete
                  billingAddress={billingAddress}
                  setBillingAddress={handleBillingInputChangeFromObj}
                />

                <input
                  type="text"
                  name="city"
                  value={billingAddress.city}
                  onChange={handleBillingInputChange}
                  placeholder="City"
                  className="border p-2 rounded"
                />

                <input
                  type="text"
                  name="postalCode"
                  value={billingAddress.postalCode}
                  onChange={handleBillingInputChange}
                  placeholder="Postal Code"
                  className="border p-2 rounded"
                />

                <select
                  value={selectedCountryId}
                  onChange={handleCountryChange}
                  className="border p-2 rounded"
                >
                  <option value="">Select Country</option>
                  {countries.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>

                <select
                  value={billingAddress.state}
                  name="state"
                  onChange={handleBillingInputChange}
                  className="border p-2 rounded"
                  disabled={!states.length}
                >
                  <option value="">Select State/Province</option>
                  {states.map((s) => (
                    <option key={s.id} value={s.name}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={handleSaveSettings}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                disabled={isSaving}
              >
                {isSaving ? "Saving..." : "Save Settings"}
              </button>
            </div>
          </div>

          {/* Store Defaults */}
          <div className="border rounded p-4 hover:bg-gray-50">
            <h3 className="font-semibold mb-2">Store Defaults</h3>
            <div>
              <label className="block text-sm font-medium mb-1">Display Currency</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full border p-2 rounded"
              >
                {["USD", "EUR", "GBP", "NGN", "JPY"].map((cur) => (
                  <option key={cur} value={cur}>
                    {cur}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
