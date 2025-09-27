"use client";

import { useState, useEffect } from "react";
import StoreProfile from "./components/StoreProfile";
import GeneralSettings from "./components/GeneralSettings";
import PlanSection from "./components/PlanSection";
import StoreModal from "./components/StoreModal";
import KycSection from "./components/KycSection";
import FooterUserInfo from "./components/FooterUserInfo";
import PrivacyPolicyModal from "./components/PrivacyPolicyModal";
import PrivacyPolicySection from "./components/PrivacyPolicySection";
import toast from "react-hot-toast";

export default function SettingsPage() {
  const [sellerInfo, setSellerInfo] = useState(null);
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const [generalOpen, setGeneralOpen] = useState(false);
  const [storeModalOpen, setStoreModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [storeForm, setStoreForm] = useState({
    storeName: "",
  });

  useEffect(() => {
    const fetchSellerInfo = async () => {
      try {
        setLoading(true);
        const res = await fetch("http://localhost:3092/seller/store-info", {
          credentials: "include",
        });
        
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        
        const data = await res.json();
        setSellerInfo(data);

        setStoreForm({
          storeName: data.storeName || "",
        });

      } catch (err) {
        console.error("Failed to fetch seller info", err);
        setError("Failed to load seller information");
        toast.error("Failed to load seller information");
      } finally {
        setLoading(false);
      }
    };

    fetchSellerInfo();
  }, []);

  const handleUpgradeSuccess = async () => {
    try {
      const res = await fetch("http://localhost:3092/seller/store-info", {
        credentials: "include",
      });
      const data = await res.json();
      setSellerInfo(data);
      toast.success("Successfully upgraded to Professional!");
    } catch (err) {
      console.error("Failed to refresh seller info after upgrade", err);
      toast.error("Failed to refresh seller info");
    }
  };

  const handleStoreInputChange = (e) => {
    const { name, value } = e.target;
    setStoreForm((prev) => ({ ...prev, [name]: value }));
  };

  // Updated to only handle store name
  const handleSaveStore = async () => {
    try {
      const res = await fetch("http://localhost:3092/seller/update-store-name", {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json" 
        },
        credentials: "include",
        body: JSON.stringify({ storeName: storeForm.storeName.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || data.error || "Failed to update store name");
      }

      // Update the seller info with new store name
      setSellerInfo((prev) => ({
        ...prev,
        storeName: data.storeName,
      }));

      toast.success("Store name updated successfully!");
      setStoreModalOpen(false);

      // Trigger success animation in GeneralSettings
      window.dispatchEvent(new CustomEvent('storeNameUpdated'));

    } catch (err) {
      console.error("Error updating store name:", err);
      toast.error(err.message || "Failed to update store name");
    }
  };

  // Callback to refresh seller info after KYC submission
  const handleKycStatusChange = async () => {
    try {
      const res = await fetch("http://localhost:3092/seller/store-info", {
        credentials: "include",
      });
      const data = await res.json();
      setSellerInfo(data);
    } catch (err) {
      console.error("Failed to refresh seller info after KYC update", err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-xl shadow-lg">
          <div className="flex items-center space-x-4">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent"></div>
            <span className="text-gray-600 font-medium">Loading seller information...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-md text-center">
          <div className="text-red-500 mb-4">
            <svg className="h-12 w-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Failed to Load</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!sellerInfo) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-xl shadow-lg">
          <div className="text-gray-500 text-center">
            <svg className="h-12 w-12 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path>
            </svg>
            <p className="font-medium">No seller information found</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-10">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
        <p className="text-gray-600">Manage your store settings and preferences</p>
      </div>

      <div className="space-y-8">
        <StoreProfile sellerInfo={sellerInfo} />
        
        <GeneralSettings
          generalOpen={generalOpen}
          setGeneralOpen={setGeneralOpen}
          storeModalOpen={storeModalOpen}
          setStoreModalOpen={setStoreModalOpen}
          storeForm={storeForm}
        />

        <PlanSection 
          sellerInfo={sellerInfo} 
          onUpgradeSuccess={handleUpgradeSuccess}
        />

        <KycSection onKycStatusChange={handleKycStatusChange} />
      </div>

      <PrivacyPolicySection setPrivacyOpen={setPrivacyOpen} />
      <hr className="my-12" />
      <FooterUserInfo user={sellerInfo} />

      {/* Store Name Modal */}
      {storeModalOpen && (
        <StoreModal
          storeForm={storeForm}
          handleStoreInputChange={handleStoreInputChange}
          handleSaveStore={handleSaveStore}
          setStoreModalOpen={setStoreModalOpen}
          sellerInfo={sellerInfo}
        />
      )}

      {/* Privacy Policy Modal */}
      {privacyOpen && (
        <PrivacyPolicyModal setPrivacyOpen={setPrivacyOpen} />
      )}
    </div>
  );
}