"use client";

import { useState, useEffect } from "react";
import StoreProfile from "./components/StoreProfile";
import GeneralSettings from "./components/GeneralSettings";
import PlanSection from "./components/PlanSection";
import BillingSection from "./components/BillingSection";
import BillingModal from "./components/BillingModal";
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
  const [billingModalOpen, setBillingModalOpen] = useState(false);


  const [kycStatus] = useState("Pending");

  const [storeForm, setStoreForm] = useState({
    storeName: "",
    email: "",
  });

  const [currency, setCurrency] = useState("USD");
  const [billingAddress, setBillingAddress] = useState({
    legalName: "",
    country: "",
    apartment: "",
    city: "",
    state: "",
    postalCode: "",
  });

  useEffect(() => {
    const fetchSellerInfo = async () => {
      try {
        const res = await fetch("http://localhost:3092/seller/store-info", {
          credentials: "include",
        });
        const data = await res.json();
        setSellerInfo(data);

        setStoreForm({
          storeName: data.storeName || "",
          email: data.email || "",
        });

        const resSettings = await fetch(
          "http://localhost:3092/seller/get-settings",
          { credentials: "include" }
        );
        const settingsData = await resSettings.json();
        setBillingAddress(settingsData.billingAddress);
        setCurrency(settingsData.currency);
      } catch (err) {
        console.error("Failed to fetch seller info", err);
      }
    };

    fetchSellerInfo();
  }, []);

  const handleStoreInputChange = (e) => {
    const { name, value } = e.target;
    setStoreForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleBillingInputChange = (e) => {
    const { name, value } = e.target;
    setBillingAddress((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveStore = async () => {
    try {
      const res = await fetch("http://localhost:3092/seller/update-store", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(storeForm),
      });

      const data = await res.json();

      if (!res.ok || !data.user) {
        throw new Error(data.message || "Failed to save store info");
      }

      setSellerInfo((prev) => ({
        ...prev,
        email: data.user.email,
        pendingEmail: data.user.pendingEmail,
        storeName: data.user.storeName,
      }));

      if (data.user.pendingPhone) {
        setPendingPhone(data.user.pendingPhone);
        setPhoneVerificationOpen(true);
      }

      if (data.user.pendingEmail || data.user.pendingPhone) {
        toast.success("Store info saved. Verification required.");
      } else {
        toast.success("Store info updated successfully.");
      }

      setStoreModalOpen(false);
    } catch (err) {
      console.error(err);
      toast.error("Error updating store information.");
    }
  };

  if (!sellerInfo) {
    return <div className="p-10 text-gray-500">Loading seller info...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-10">
      <h1 className="text-3xl font-semibold mb-8">Settings</h1>

      <div className="space-y-8">
        <StoreProfile sellerInfo={sellerInfo} />
        <GeneralSettings
          generalOpen={generalOpen}
          setGeneralOpen={setGeneralOpen}
          storeModalOpen={storeModalOpen}
          setStoreModalOpen={setStoreModalOpen}
          storeForm={storeForm}
          billingAddress={billingAddress}
          currency={currency}
          setCurrency={setCurrency}
          handleBillingInputChange={handleBillingInputChange}
        />
        <PlanSection />
        <BillingSection setBillingModalOpen={setBillingModalOpen} />
        <KycSection kycStatus={kycStatus} />
      </div>

      <PrivacyPolicySection setPrivacyOpen={setPrivacyOpen} />
      <hr className="my-12" />
      <FooterUserInfo user={sellerInfo} />

      {storeModalOpen && (
        <StoreModal
          storeForm={storeForm}
          handleStoreInputChange={handleStoreInputChange}
          handleSaveStore={handleSaveStore}
          setStoreModalOpen={setStoreModalOpen}
          sellerInfo={sellerInfo}
        />
      )}

      {billingModalOpen && (
        <BillingModal setBillingModalOpen={setBillingModalOpen} />
      )}

      {privacyOpen && (
        <PrivacyPolicyModal setPrivacyOpen={setPrivacyOpen} />
      )}
    </div>
  );
}
