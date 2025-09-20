export function useFormValidation() {
  const validateStep = (step, formData, setErrors, uploadedFiles = null) => {
    const newErrors = {};
    
    switch (step) {
      case 1: // Personal Information
        if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
        if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
        if (!formData.phoneNumber.trim()) newErrors.phoneNumber = 'Phone number is required';
        if (!formData.countryOfCitizenship) newErrors.countryOfCitizenship = 'Country of citizenship is required';
        if (!formData.countryOfBirth) newErrors.countryOfBirth = 'Country of birth is required';
        if (!formData.dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required';
        
        // Validate residential address
        if (!formData.residentialAddress?.fullName?.trim()) {
          if (!newErrors.residentialAddress) newErrors.residentialAddress = {};
          newErrors.residentialAddress.fullName = 'Full name is required';
        }
        if (!formData.residentialAddress?.addressLine1?.trim()) {
          if (!newErrors.residentialAddress) newErrors.residentialAddress = {};
          newErrors.residentialAddress.addressLine1 = 'Address line 1 is required';
        }
        if (!formData.residentialAddress?.city?.trim()) {
          if (!newErrors.residentialAddress) newErrors.residentialAddress = {};
          newErrors.residentialAddress.city = 'City is required';
        }
        if (!formData.residentialAddress?.state?.trim()) {
          if (!newErrors.residentialAddress) newErrors.residentialAddress = {};
          newErrors.residentialAddress.state = 'State is required';
        }
        if (!formData.residentialAddress?.country?.trim()) {
          if (!newErrors.residentialAddress) newErrors.residentialAddress = {};
          newErrors.residentialAddress.country = 'Country is required';
        }
        
        // Validate age (must be 18+)
        if (formData.dateOfBirth) {
          const birthDate = new Date(formData.dateOfBirth);
          const today = new Date();
          const age = today.getFullYear() - birthDate.getFullYear();
          const monthDiff = today.getMonth() - birthDate.getMonth();
          
          if (age < 18 || (age === 18 && monthDiff < 0) || (age === 18 && monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            newErrors.dateOfBirth = 'You must be at least 18 years old';
          }
        }
        break;
        
      case 2: // Business Details
        if (!formData.businessLocation) newErrors.businessLocation = 'Business location is required';
        if (!formData.businessType) newErrors.businessType = 'Business type is required';
        if (!formData.businessName.trim()) newErrors.businessName = 'Business name is required';
        
        if ((formData.businessType === 'company bussinesss' || formData.businessType === 'state-owned business') && !formData.companyRegistrationNumber?.trim()) {
          newErrors.companyRegistrationNumber = 'Registration number is required for this business type';
        }
        
        // Validate business address
        if (!formData.businessAddress?.addressLine1) {
          if (!newErrors.businessAddress) newErrors.businessAddress = {};
          newErrors.businessAddress.addressLine1 = 'Business address is required';
        }
        break;
        
      case 3: // Store Setup
        if (!formData.storeName.trim()) newErrors.storeName = 'Store name is required';
        if (formData.storeName.trim().length < 3) newErrors.storeName = 'Store name must be at least 3 characters';
        break;
        
      case 4: // Subscription Info (Professional only - no payment validation)
        // No validation needed - just informational step
        break;
        
      case 5: // Documents
        // Validate document type selections
        if (!formData.governmentIdType) {
          newErrors.governmentIdType = 'Please select your government ID type';
        }
        if (!formData.proofOfResidenceType) {
          newErrors.proofOfResidenceType = 'Please select your proof of residence type';
        }
        if (!formData.identityProofCountryOfIssue?.trim()) {
          newErrors.identityProofCountryOfIssue = 'ID country of issue is required';
        }
        
        // Check uploadedFiles for document validation
        if (uploadedFiles) {
          if (!uploadedFiles.governmentId || !uploadedFiles.governmentId.file) {
            newErrors.governmentId = 'Government ID is required';
          }
          if (!uploadedFiles.proofOfResidence || !uploadedFiles.proofOfResidence.file) {
            newErrors.proofOfResidence = 'Proof of residence is required';
          }
          if (!uploadedFiles.selfieWithId || !uploadedFiles.selfieWithId.file) {
            newErrors.selfieWithId = 'Selfie with ID is required';
          }
        }
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  return {
    validateStep
  };
}