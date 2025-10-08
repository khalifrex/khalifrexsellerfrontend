import { useState } from 'react';

export function useFormData() {
  const [formData, setFormData] = useState({
    // Personal Info
    firstName: '',
    lastName: '',
    middleName: '',
    phoneNumber: '',
    
    // Personal Details
    countryOfCitizenship: '',
    countryOfBirth: '',
    dateOfBirth: '',
    
    // Address fields
    userAddress: '',
    residentialAddress: {
      fullName: '',
      country: '',
      zipCode: '',
      addressLine1: '',
      addressLine2: '',
      city: '',
      state: '',
      phoneNumber: ''
    },
    
    // Business Info
    businessType: 'individual business',
    businessName: '',
    businessLocation: '',
    companyRegistrationNumber: '',
    
    // Business Address
    businessAddressDisplay: '',
    businessAddress: {
      fullName: '',
      country: '',
      zipCode: '',
      addressLine1: '',
      addressLine2: '',
      city: '',
      state: '',
    },
    
    // Tax Configuration
    taxStatus: 'non-taxable', // Default for individual business
    taxId: '',
    taxConfig: {
      taxName: '',
      taxRate: 0,
      country: '',
      includeInPrices: false
    },
    
    storeName: '',
    subscriptionType: 'free',
    
    // Document Info
    governmentIdType: '',
    proofOfResidenceType: '',
    identityProofType: '',
    identityProofCountryOfIssue: '',
  });

  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Auto-update taxStatus when businessType changes
    if (name === 'businessType') {
      const newTaxStatus = value === 'individual business' ? 'non-taxable' : 'taxable';
      setFormData(prev => ({ 
        ...prev, 
        [name]: value,
        taxStatus: newTaxStatus
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const updateFormData = (fieldName, value) => {
    setFormData(prev => ({ ...prev, [fieldName]: value }));
    
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