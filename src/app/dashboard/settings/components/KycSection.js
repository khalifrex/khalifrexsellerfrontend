"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";

// Reuse your AddressAutocomplete component
import AddressAutocomplete from "./AddressAutocomplete";

export default function KycSection() {
  const [form, setForm] = useState({
    fullName: "",
    dob: "",
    address: "",
    country: "",
    idType: "",
    idNumber: "",
  });
  const [errors, setErrors] = useState({});
  const [document, setDocument] = useState(null);
  const [selfie, setSelfie] = useState(null);
  const [kycStatus, setKycStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [countries, setCountries] = useState([]);

  const idTypes = [
    "National ID Card",
    "Passport",
    "Driver's License",
    "Voter's Card",
    "Residence Permit",
  ];

  // Fetch KYC status and countries on mount
  useEffect(() => {
    const fetchInitial = async () => {
      try {
        const res = await fetch("http://localhost:3092/seller/store-info", {
          credentials: "include",
        });
        const data = await res.json();
        setKycStatus(data?.kyc);
      } catch (err) {
        console.error("Failed to fetch KYC status", err);
      }

      try {
        const resCountries = await fetch("http://localhost:3092/api/location/countries");
        const dataCountries = await resCountries.json();
        setCountries(dataCountries);
      } catch (err) {
        console.error("Failed to fetch countries", err);
      }
    };

    fetchInitial();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    const newErrors = {};

    if (!form.fullName || form.fullName.trim().length < 3) {
      newErrors.fullName = "Full name must be at least 3 characters.";
    }
    if (!form.dob) {
      newErrors.dob = "Date of birth is required.";
    }
    if (!form.address || !form.address.trim()) {
      newErrors.address = "Address is required.";
    }
    if (!form.country || !form.country.trim()) {
      newErrors.country = "Country is required.";
    }
    if (!form.idType || !form.idType.trim()) {
      newErrors.idType = "ID type is required.";
    }
    if (!form.idNumber || form.idNumber.trim().length < 5) {
      newErrors.idNumber = "ID number must be at least 5 characters.";
    }
    if (!document) {
      newErrors.document = "Document file is required.";
    }
    if (!selfie) {
      newErrors.selfie = "Selfie file is required.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return toast.error("Please fix the validation errors.");
    }

    const fd = new FormData();
    Object.entries(form).forEach(([key, value]) => fd.append(key, value));
    fd.append("document", document);
    fd.append("selfie", selfie);

    try {
      setLoading(true);
      const res = await fetch("http://localhost:3092/seller/kyc", {
        method: "POST",
        credentials: "include",
        body: fd,
      });
      const data = await res.json();
      setLoading(false);

      if (!res.ok) {
        const msg = data.errors?.[0]?.msg || data.error || "Submission failed.";
        throw new Error(msg);
      }

      toast.success("KYC submitted successfully.");
      setKycStatus(data.user.kyc);
    } catch (err) {
      console.error(err);
      toast.error(err.message);
      setLoading(false);
    }
  };

  return (
    <>
      <section className="bg-white shadow rounded p-6 mb-6">
        <h2 className="text-xl font-medium mb-4">KYC Status</h2>
        {kycStatus ? (
          <>
            <p
              className={`inline-block px-3 py-1 rounded text-sm font-medium ${
                kycStatus.status === "approved"
                  ? "bg-green-100 text-green-700"
                  : kycStatus.status === "rejected"
                  ? "bg-red-100 text-red-700"
                  : "bg-yellow-100 text-yellow-700"
              }`}
            >
              {kycStatus.status}
            </p>
            {kycStatus.rejectionReason && (
              <p className="text-red-500 mt-1">
                Reason: {kycStatus.rejectionReason}
              </p>
            )}
          </>
        ) : (
          <p>No KYC submitted yet.</p>
        )}
      </section>

      {!kycStatus && (
        <section className="bg-white shadow rounded p-6">
          <h2 className="text-xl font-medium mb-4">Submit KYC Documents</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div>
              <input
                name="fullName"
                placeholder="Full Name"
                value={form.fullName}
                onChange={handleChange}
                className="w-full border p-2 rounded"
              />
              {errors.fullName && (
                <p className="text-red-500 text-sm">{errors.fullName}</p>
              )}
            </div>

            {/* Date of Birth */}
            <div>
              <input
                type="date"
                name="dob"
                value={form.dob}
                onChange={handleChange}
                className="w-full border p-2 rounded"
              />
              {errors.dob && (
                <p className="text-red-500 text-sm">{errors.dob}</p>
              )}
            </div>

            {/* Address Autocomplete */}
            <AddressAutocomplete
              billingAddress={{ apartment: form.address }}
              setBillingAddress={(newAddress) =>
                setForm((prev) => ({
                  ...prev,
                  address: newAddress.apartment,
                  country: newAddress.country,
                }))
              }
            />
            {errors.address && (
              <p className="text-red-500 text-sm">{errors.address}</p>
            )}

            {/* ID Type */}
            <div>
              <select
                name="idType"
                value={form.idType}
                onChange={handleChange}
                className="w-full border p-2 rounded"
              >
                <option value="">Select ID Type</option>
                {idTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
              {errors.idType && (
                <p className="text-red-500 text-sm">{errors.idType}</p>
              )}
            </div>

            {/* ID Number */}
            <div>
              <input
                name="idNumber"
                placeholder="ID Number"
                value={form.idNumber}
                onChange={handleChange}
                className="w-full border p-2 rounded"
              />
              {errors.idNumber && (
                <p className="text-red-500 text-sm">{errors.idNumber}</p>
              )}
            </div>

            {/* Country */}
            <div>
              <select
                name="country"
                value={form.country}
                onChange={handleChange}
                className="w-full border p-2 rounded"
              >
                <option value="">Select Country</option>
                {countries.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
              {errors.country && (
                <p className="text-red-500 text-sm">{errors.country}</p>
              )}
            </div>

            {/* Document & Selfie */}
            <div className="grid md:grid-cols-2 gap-4">
              <label className="block">
                <span className="text-sm font-medium">Document</span>
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={(e) => setDocument(e.target.files[0])}
                  className="mt-1 block w-full border p-2 rounded"
                />
                {errors.document && (
                  <p className="text-red-500 text-sm">{errors.document}</p>
                )}
              </label>
              <label className="block">
                <span className="text-sm font-medium">Selfie</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setSelfie(e.target.files[0])}
                  className="mt-1 block w-full border p-2 rounded"
                />
                {errors.selfie && (
                  <p className="text-red-500 text-sm">{errors.selfie}</p>
                )}
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              {loading ? "Submitting..." : "Submit KYC"}
            </button>
          </form>
        </section>
      )}
    </>
  );
}
