export function useFormValidation() {
  const validateStep = (step, formData, setErrors, uploadedFiles = null) => {
    const newErrors = {};
    
    switch (step) {
      case 1: // Personal Information
        if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
        if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
        if (!formData.email.trim()) {
          newErrors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
          newErrors.email = 'Please enter a valid email';
        }
        if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
        if (!formData.countryOfCitizenship) newErrors.countryOfCitizenship = 'Country of citizenship is required';
        if (!formData.countryOfBirth) newErrors.countryOfBirth = 'Country of birth is required';
        if (!formData.dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required';
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
if (!formData.residentialAddress?.phoneNumber?.trim()) {
  if (!newErrors.residentialAddress) newErrors.residentialAddress = {};
  newErrors.residentialAddress.phoneNumber = 'Phone number is required';
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
        
        if (formData.businessType === 'company' && !formData.companyRegistrationNumber.trim()) {
          newErrors.companyRegistrationNumber = 'Registration number is required for companies';
        }
        
        // Validate business address (either same as residential or provided)
        if (!formData.businessAddress?.addressLine1) {
  if (!newErrors.businessAddress) newErrors.businessAddress = {};
  newErrors.businessAddress.addressLine1 = 'Business address is required';
}
        // Validate shipping countries
        if (!formData.shippingCountries || formData.shippingCountries.length === 0) {
          newErrors.shippingCountries = 'At least one shipping country is required';
        }
        break;
        
      case 3: // Store Setup
        if (!formData.storeName.trim()) newErrors.storeName = 'Store name is required';
        if (formData.storeName.trim().length < 3) newErrors.storeName = 'Store name must be at least 3 characters';
        break;
        
      case 4: // Banking Info
        if (!formData.bankName.trim()) newErrors.bankName = 'Bank name is required';
        if (!formData.accountNumber.trim()) newErrors.accountNumber = 'Account number is required';
        if (!formData.accountHolderName.trim()) newErrors.accountHolderName = 'Account holder name is required';
        if (!formData.bankCountry) newErrors.bankCountry = 'Bank country is required';
        
        // Validate account number format (basic validation)
        if (formData.accountNumber && !/^\d{10,}$/.test(formData.accountNumber.replace(/\s/g, ''))) {
          newErrors.accountNumber = 'Please enter a valid account number';
        }

        // Professional subscription card validation
        if (formData.subscriptionType === 'professional') {
          // Card validation
          if (!formData.cardNumber?.trim()) {
            newErrors.cardNumber = 'Card number is required for professional subscription';
          } else {
            const cardNumberClean = formData.cardNumber.replace(/\s/g, '');
            if (cardNumberClean.length < 13 || cardNumberClean.length > 19) {
              newErrors.cardNumber = 'Please enter a valid card number';
            }
          }

          if (!formData.cardHolderName?.trim()) {
            newErrors.cardHolderName = 'Card holder name is required for professional subscription';
          }

          if (!formData.expiresOn?.trim()) {
            newErrors.expiresOn = 'Expiry month is required for professional subscription';
          }

          if (!formData.year?.toString().trim()) {
            newErrors.year = 'Expiry year is required for professional subscription';
          }

          if (!formData.cvv?.trim()) {
            newErrors.cvv = 'CVV is required for professional subscription';
          } else if (formData.cvv.length < 3 || formData.cvv.length > 4) {
            newErrors.cvv = 'CVV must be 3 or 4 digits';
          }

          // Validate expiration date
          if (formData.expiresOn && formData.year) {
            const currentYear = new Date().getFullYear();
            const currentMonth = new Date().getMonth() + 1;
            const expYear = parseInt(formData.year);
            const expMonth = parseInt(formData.expiresOn);

            if (expYear < currentYear || (expYear === currentYear && expMonth < currentMonth)) {
              newErrors.year = 'Card has expired';
            }
          }

          // Billing address validation for professional
         if (!formData.billingAddress?.fullName?.trim()) {
  if (!newErrors.billingAddress) newErrors.billingAddress = {};
  newErrors.billingAddress.fullName = 'Full name is required for billing address';
}
if (!formData.billingAddress?.addressLine1?.trim()) {
  if (!newErrors.billingAddress) newErrors.billingAddress = {};
  newErrors.billingAddress.addressLine1 = 'Address line 1 is required for billing address';
}
if (!formData.billingAddress?.city?.trim()) {
  if (!newErrors.billingAddress) newErrors.billingAddress = {};
  newErrors.billingAddress.city = 'City is required for billing address';
}
if (!formData.billingAddress?.state?.trim()) {
  if (!newErrors.billingAddress) newErrors.billingAddress = {};
  newErrors.billingAddress.state = 'State is required for billing address';
}
if (!formData.billingAddress?.country?.trim()) {
  if (!newErrors.billingAddress) newErrors.billingAddress = {};
  newErrors.billingAddress.country = 'Country is required for billing address';
}
if (!formData.billingAddress?.phoneNumber?.trim()) {
  if (!newErrors.billingAddress) newErrors.billingAddress = {};
  newErrors.billingAddress.phoneNumber = 'Phone number is required for billing address';
}
        }
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
        
      case 6: // Security
        // Password validation
        if (!formData.password) {
          newErrors.password = 'Password is required';
        } else {
          const passwordRequirements = {
            length: formData.password.length >= 6,
            lowercase: /[a-z]/.test(formData.password),
            uppercase: /[A-Z]/.test(formData.password),
            number: /\d/.test(formData.password),
            special: /[!@#$%^&*(),.?\":{}|<>]/.test(formData.password)
          };
          
          if (!Object.values(passwordRequirements).every(Boolean)) {
            newErrors.password = 'Please meet all password requirements';
          }
        }
        
        if (!formData.confirmPassword) {
          newErrors.confirmPassword = 'Please confirm your password';
        } else if (formData.password !== formData.confirmPassword) {
          newErrors.confirmPassword = 'Passwords do not match';
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