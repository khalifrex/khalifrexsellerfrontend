import { useState } from "react";

export function useFormData() {
  const [formData, setFormData] = useState({
    // Personal Info - matching backend schema
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    
    // Personal Details
    countryOfCitizenship: '',
    countryOfBirth: '',
    dateOfBirth: '',
    
    // Address fields
userAddress: '', // Keep for backward compatibility with address search
residentialAddress: { // Structured address object
  fullName: '',
  country: '',
  zipCode: '',
  addressLine1: '',
  addressLine2: '',
  city: '',
  state: '',
  phoneNumber: ''
},
    
    // Business Info - matching backend schema
    businessType: 'individual',
    businessName: '',
    businessLocation: '', // Country
    companyRegistrationNumber: '',
    
    // Business Address
  businessAddressDisplay: '', // Keep for backward compatibility with address search
businessAddress: { // Structured address object
  fullName: '',
  country: '',
  zipCode: '',
  addressLine1: '',
  addressLine2: '',
  city: '',
  state: '',
  phoneNumber: ''
},

    
    // Store Info
    storeName: '',
    subscriptionType: 'free',
    
    // Banking Info - matching backend schema
    bankName: '',
    accountNumber: '',
    accountHolderName: '',
    bankCountry: '',
    routingNumber: '',
    
    // Subscription Card Info (NEW)
    cardNumber: '',
    cvv: '',
    expiresOn: '',
    year: '',
    cardHolderName: '',
  billingAddressDisplay: '', // Keep for backward compatibility with address search
billingAddress: { // Structured billing address object
  fullName: '',
  country: '',
  zipCode: '',
  addressLine1: '',
  addressLine2: '',
  city: '',
  state: '',
  phoneNumber: ''
},
    // Document Info - matching backend schema
    governmentIdType: '', // passport, drivers_license, national_id
    proofOfResidenceType: '', // utility_bill, bank_statement
    identityProofCountryOfIssue: '',
    
    // Shipping
    shippingCountries: [],
    
    // Payment method
    payoutMethod: 'paystack'
  });

  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear specific error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Function to update form data programmatically (e.g., for address selection)
  const updateFormData = (fieldName, value) => {
    setFormData(prev => ({ ...prev, [fieldName]: value }));
    
    // Clear specific error
    if (errors[fieldName]) {
      setErrors(prev => ({ ...prev, [fieldName]: '' }));
    }
  };

  return {
    formData,
    setFormData,
    handleInputChange,
    updateFormData,
    errors,
    setErrors
  };
}