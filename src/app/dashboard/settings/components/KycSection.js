"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import AddressAutocomplete from "./AddressAutocomplete";

export default function KycSection() {
  const [form, setForm] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    dateOfBirth: "",
    countryOfCitizenship: "",
    countryOfBirth: "",
    governmentIdType: "",
    governmentIdCountry: "",
    proofOfResidenceType: "",
  });

  const [businessAddress, setBusinessAddress] = useState({
    country: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    zipCode: "",
  });

  const [residentialAddress, setResidentialAddress] = useState({
    country: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    zipCode: "",
  });

  const [files, setFiles] = useState({
    governmentId: null,
    proofOfResidence: null,
    selfieWithId: null,
  });

  const [errors, setErrors] = useState({});
  const [kycStatus, setKycStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [countries, setCountries] = useState([]);

  const governmentIdTypes = [
    "passport",
    "drivers_license", 
    "national_id"
  ];

  const proofOfResidenceTypes = [
    "utility_bill",
    "bank_statement"
  ];

  // Fetch KYC status and countries on mount
  useEffect(() => {
    const fetchInitial = async () => {
      try {
        // Fetch KYC status
        const res = await fetch("http://localhost:3092/seller/kyc/status", {
          credentials: "include",
        });
        
        if (res.ok) {
          const data = await res.json();
          setKycStatus(data.kyc);
        }
      } catch (err) {
        console.error("Failed to fetch KYC status", err);
      }

      try {
        // Fetch countries
        const resCountries = await fetch("http://localhost:3092/location/countries");
        const dataCountries = await resCountries.json();
        setCountries(dataCountries);
      } catch (err) {
        console.error("Failed to fetch countries", err);
      }
    };

    fetchInitial();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const { name, files: fileList } = e.target;
    setFiles(prev => ({ ...prev, [name]: fileList[0] }));
  };

  const validateForm = () => {
    const newErrors = {};

    // Personal information validation
    if (!form.firstName?.trim()) {
      newErrors.firstName = "First name is required.";
    }
    if (!form.lastName?.trim()) {
      newErrors.lastName = "Last name is required.";
    }
    if (!form.dateOfBirth) {
      newErrors.dateOfBirth = "Date of birth is required.";
    }
    if (!form.countryOfCitizenship?.trim()) {
      newErrors.countryOfCitizenship = "Country of citizenship is required.";
    }
    if (!form.countryOfBirth?.trim()) {
      newErrors.countryOfBirth = "Country of birth is required.";
    }

    // Address validation
    if (!businessAddress.addressLine1?.trim()) {
      newErrors.businessAddress = "Business address is required.";
    }
    if (!businessAddress.country?.trim()) {
      newErrors.businessCountry = "Business country is required.";
    }
    if (!businessAddress.city?.trim()) {
      newErrors.businessCity = "Business city is required.";
    }
    if (!businessAddress.state?.trim()) {
      newErrors.businessState = "Business state is required.";
    }

    if (!residentialAddress.addressLine1?.trim()) {
      newErrors.residentialAddress = "Residential address is required.";
    }
    if (!residentialAddress.country?.trim()) {
      newErrors.residentialCountry = "Residential country is required.";
    }
    if (!residentialAddress.city?.trim()) {
      newErrors.residentialCity = "Residential city is required.";
    }
    if (!residentialAddress.state?.trim()) {
      newErrors.residentialState = "Residential state is required.";
    }

    // Document validation
    if (!form.governmentIdType?.trim()) {
      newErrors.governmentIdType = "Government ID type is required.";
    }
    if (!form.governmentIdCountry?.trim()) {
      newErrors.governmentIdCountry = "Government ID country is required.";
    }
    if (!form.proofOfResidenceType?.trim()) {
      newErrors.proofOfResidenceType = "Proof of residence type is required.";
    }

    // File validation
    if (!files.governmentId) {
      newErrors.governmentId = "Government ID document is required.";
    }
    if (!files.proofOfResidence) {
      newErrors.proofOfResidence = "Proof of residence document is required.";
    }
    if (!files.selfieWithId) {
      newErrors.selfieWithId = "Selfie with ID is required.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return toast.error("Please fix the validation errors.");
    }

    const formData = new FormData();
    
    // Add personal information
    Object.entries(form).forEach(([key, value]) => {
      if (value) formData.append(key, value);
    });

    // Add addresses as JSON strings
    formData.append('businessAddress', JSON.stringify(businessAddress));
    formData.append('residentialAddress', JSON.stringify(residentialAddress));

    // Add files
    Object.entries(files).forEach(([key, file]) => {
      if (file) formData.append(key, file);
    });

    try {
      setLoading(true);
      const res = await fetch("http://localhost:3092/seller/kyc", {
        method: "POST",
        credentials: "include",
        body: formData,
      });
      
      const data = await res.json();
      setLoading(false);

      if (!res.ok) {
        throw new Error(data.error || "Submission failed.");
      }

      toast.success("KYC documents submitted successfully.");
      
      // Refresh KYC status
      const statusRes = await fetch("http://localhost:3092/seller/kyc/status", {
        credentials: "include",
      });
      
      if (statusRes.ok) {
        const statusData = await statusRes.json();
        setKycStatus(statusData.kyc);
      }
      
    } catch (err) {
      console.error(err);
      toast.error(err.message);
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-700";
      case "rejected":
        return "bg-red-100 text-red-700";
      case "documents_submitted":
      case "under_review":
        return "bg-blue-100 text-blue-700";
      default:
        return "bg-yellow-100 text-yellow-700";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "pending":
        return "Pending Submission";
      case "documents_submitted":
        return "Documents Submitted";
      case "under_review":
        return "Under Review";
      case "approved":
        return "Approved";
      case "rejected":
        return "Rejected";
      default:
        return status;
    }
  };

  return (
    <>
      <section className="bg-white shadow rounded p-6 mb-6">
        <h2 className="text-xl font-medium mb-4">KYC Verification Status</h2>
        {kycStatus ? (
          <div className="space-y-3">
            <p className={`inline-block px-3 py-1 rounded text-sm font-medium ${getStatusColor(kycStatus.status)}`}>
              {getStatusText(kycStatus.status)}
            </p>
            
            {kycStatus.verificationNotes && (
              <p className="text-gray-600 text-sm">
                <strong>Notes:</strong> {kycStatus.verificationNotes}
              </p>
            )}
            
            {kycStatus.verifiedAt && (
              <p className="text-green-600 text-sm">
                <strong>Verified on:</strong> {new Date(kycStatus.verifiedAt).toLocaleDateString()}
              </p>
            )}

            {kycStatus.hasDocuments && (
              <div className="mt-4">
                <h4 className="font-medium text-sm mb-2">Submitted Documents:</h4>
                <div className="grid grid-cols-3 gap-4 text-xs">
                  <div className={`flex items-center ${kycStatus.documents?.governmentId ? 'text-green-600' : 'text-red-500'}`}>
                    <span className="mr-2">•</span>
                    Government ID: {kycStatus.documents?.governmentId ? 'Submitted' : 'Missing'}
                  </div>
                  <div className={`flex items-center ${kycStatus.documents?.proofOfResidence ? 'text-green-600' : 'text-red-500'}`}>
                    <span className="mr-2">•</span>
                    Proof of Residence: {kycStatus.documents?.proofOfResidence ? 'Submitted' : 'Missing'}
                  </div>
                  <div className={`flex items-center ${kycStatus.documents?.selfieWithId ? 'text-green-600' : 'text-red-500'}`}>
                    <span className="mr-2">•</span>
                    Selfie with ID: {kycStatus.documents?.selfieWithId ? 'Submitted' : 'Missing'}
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <p className="text-gray-500">Loading KYC status...</p>
        )}
      </section>

      {(!kycStatus || kycStatus.status === "rejected" || kycStatus.status === "pending") && (
        <section className="bg-white shadow rounded p-6">
          <h2 className="text-xl font-medium mb-4">
            {kycStatus?.status === "rejected" ? "Resubmit KYC Documents" : "Submit KYC Documents"}
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Information */}
            <div className="border-b pb-6">
              <h3 className="text-lg font-medium mb-4">Personal Information</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <input
                    name="firstName"
                    placeholder="First Name *"
                    value={form.firstName}
                    onChange={handleChange}
                    className="w-full border p-3 rounded-lg"
                  />
                  {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>}
                </div>

                <div>
                  <input
                    name="middleName"
                    placeholder="Middle Name (Optional)"
                    value={form.middleName}
                    onChange={handleChange}
                    className="w-full border p-3 rounded-lg"
                  />
                </div>

                <div>
                  <input
                    name="lastName"
                    placeholder="Last Name *"
                    value={form.lastName}
                    onChange={handleChange}
                    className="w-full border p-3 rounded-lg"
                  />
                  {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>}
                </div>

                <div>
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={form.dateOfBirth}
                    onChange={handleChange}
                    className="w-full border p-3 rounded-lg"
                  />
                  {errors.dateOfBirth && <p className="text-red-500 text-sm mt-1">{errors.dateOfBirth}</p>}
                </div>

                <div>
                  <select
                    name="countryOfCitizenship"
                    value={form.countryOfCitizenship}
                    onChange={handleChange}
                    className="w-full border p-3 rounded-lg"
                  >
                    <option value="">Country of Citizenship *</option>
                    {countries.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                  {errors.countryOfCitizenship && <p className="text-red-500 text-sm mt-1">{errors.countryOfCitizenship}</p>}
                </div>

                <div>
                  <select
                    name="countryOfBirth"
                    value={form.countryOfBirth}
                    onChange={handleChange}
                    className="w-full border p-3 rounded-lg"
                  >
                    <option value="">Country of Birth *</option>
                    {countries.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                  {errors.countryOfBirth && <p className="text-red-500 text-sm mt-1">{errors.countryOfBirth}</p>}
                </div>
              </div>
            </div>

            {/* Business Address */}
            <div className="border-b pb-6">
              <h3 className="text-lg font-medium mb-4">Business Address</h3>
              <AddressAutocomplete
                billingAddress={businessAddress}
                setBillingAddress={setBusinessAddress}
                label="Business Address"
              />
              {errors.businessAddress && <p className="text-red-500 text-sm mt-1">{errors.businessAddress}</p>}
            </div>

            {/* Residential Address */}
            <div className="border-b pb-6">
              <h3 className="text-lg font-medium mb-4">Residential Address</h3>
              <AddressAutocomplete
                billingAddress={residentialAddress}
                setBillingAddress={setResidentialAddress}
                label="Residential Address"
              />
              {errors.residentialAddress && <p className="text-red-500 text-sm mt-1">{errors.residentialAddress}</p>}
            </div>

            {/* Identity Documents */}
            <div className="border-b pb-6">
              <h3 className="text-lg font-medium mb-4">Identity Documents</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <select
                    name="governmentIdType"
                    value={form.governmentIdType}
                    onChange={handleChange}
                    className="w-full border p-3 rounded-lg"
                  >
                    <option value="">Select Government ID Type *</option>
                    {governmentIdTypes.map((type) => (
                      <option key={type} value={type}>
                        {type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </option>
                    ))}
                  </select>
                  {errors.governmentIdType && <p className="text-red-500 text-sm mt-1">{errors.governmentIdType}</p>}
                </div>

                <div>
                  <select
                    name="governmentIdCountry"
                    value={form.governmentIdCountry}
                    onChange={handleChange}
                    className="w-full border p-3 rounded-lg"
                  >
                    <option value="">Country of Issue *</option>
                    {countries.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                  {errors.governmentIdCountry && <p className="text-red-500 text-sm mt-1">{errors.governmentIdCountry}</p>}
                </div>

                <div>
                  <select
                    name="proofOfResidenceType"
                    value={form.proofOfResidenceType}
                    onChange={handleChange}
                    className="w-full border p-3 rounded-lg"
                  >
                    <option value="">Select Proof of Residence Type *</option>
                    {proofOfResidenceTypes.map((type) => (
                      <option key={type} value={type}>
                        {type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </option>
                    ))}
                  </select>
                  {errors.proofOfResidenceType && <p className="text-red-500 text-sm mt-1">{errors.proofOfResidenceType}</p>}
                </div>
              </div>
            </div>

            {/* File Uploads */}
            <div>
              <h3 className="text-lg font-medium mb-4">Upload Documents</h3>
              <div className="grid md:grid-cols-3 gap-4">
                <label className="block">
                  <span className="text-sm font-medium text-gray-700">Government ID Document *</span>
                  <input
                    type="file"
                    name="governmentId"
                    accept="image/*,application/pdf"
                    onChange={handleFileChange}
                    className="mt-1 block w-full border p-2 rounded-lg"
                  />
                  {errors.governmentId && <p className="text-red-500 text-sm mt-1">{errors.governmentId}</p>}
                </label>

                <label className="block">
                  <span className="text-sm font-medium text-gray-700">Proof of Residence *</span>
                  <input
                    type="file"
                    name="proofOfResidence"
                    accept="image/*,application/pdf"
                    onChange={handleFileChange}
                    className="mt-1 block w-full border p-2 rounded-lg"
                  />
                  {errors.proofOfResidence && <p className="text-red-500 text-sm mt-1">{errors.proofOfResidence}</p>}
                </label>

                <label className="block">
                  <span className="text-sm font-medium text-gray-700">Selfie with ID *</span>
                  <input
                    type="file"
                    name="selfieWithId"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="mt-1 block w-full border p-2 rounded-lg"
                  />
                  {errors.selfieWithId && <p className="text-red-500 text-sm mt-1">{errors.selfieWithId}</p>}
                </label>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full md:w-auto bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {loading ? "Submitting..." : "Submit KYC Documents"}
            </button>
          </form>
        </section>
      )}
    </>
  );
}