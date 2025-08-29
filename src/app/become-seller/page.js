'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Image from 'next/image';

// Import step components
import StepIndicator from '@/components/become-sellerComponents/StepIndicator';
import PersonalInfoStep from '@/components/become-sellerComponents/PersonalInfoStep';
import BusinessDetailsStep from '@/components/become-sellerComponents/BusinessDetailsStep';
import StoreSetupStep from '@/components/become-sellerComponents/StoreSetupStep';
import BankingInfoStep from '@/components/become-sellerComponents/BankingInfoStep';
import DocumentsStep from '@/components/become-sellerComponents/DocumentsStep';
import SecurityStep from '@/components/become-sellerComponents/SecurityStep';

// Import hooks and utilities
import { useFormData } from '@/hooks/useFormData';
import { useLocationData } from '@/hooks/useLocationData';
import { useFileUpload } from '@/hooks/useFileUpload';
import { useFormValidation } from '@/hooks/useFormValidation';

export default function SellerSignupPage() {
  const router = useRouter();

  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Custom hooks
  const { formData, handleInputChange, updateFormData, errors, setErrors, setFormData } = useFormData();
const { 
  countries, 
  states, 
  businessStates, 
  addressSuggestions,
  businessAddressSuggestions,
  billingAddressSuggestions,
  showAddressSuggestions,
  showBusinessAddressSuggestions,
  showBillingAddressSuggestions,
  handleAddressInput,
  selectAddress,
  setShowAddressSuggestions,
  setShowBusinessAddressSuggestions,
  setShowBillingAddressSuggestions
} = useLocationData(formData);
  const { uploadedFiles, uploading, handleFileUpload, removeFile, validateAllFiles } = useFileUpload(updateFormData);
  const { validateStep } = useFormValidation();

  const handleNextStep = () => {
    // Pass uploadedFiles to validateStep for step 5 (documents step)
    if (validateStep(currentStep, formData, setErrors, currentStep === 5 ? uploadedFiles : null)) {
      setCurrentStep(prev => Math.min(prev + 1, 6));
    }
  };

  const handlePrevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Final validation with uploadedFiles
    if (!validateStep(6, formData, setErrors, uploadedFiles)) return;
    
    // Additional file validation
    if (!validateAllFiles()) return;
    
    setLoading(true);
    
    try {
      const endpoint = `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3092'}/register`;
      
      // Create FormData for multipart/form-data request
      const formDataPayload = new FormData();
      
      // Add all text fields to match backend schema
      formDataPayload.append('role', 'seller');
      formDataPayload.append('fullName', `${formData.firstName} ${formData.lastName}`);
      formDataPayload.append('email', formData.email);
      formDataPayload.append('phone', formData.phone);
      formDataPayload.append('password', formData.password);
      
      // Personal details
      formDataPayload.append('firstName', formData.firstName);
      formDataPayload.append('lastName', formData.lastName);
      formDataPayload.append('countryOfCitizenship', formData.countryOfCitizenship);
      formDataPayload.append('countryOfBirth', formData.countryOfBirth);
      formDataPayload.append('dateOfBirth', formData.dateOfBirth);
      
      // Business details
      formDataPayload.append('businessType', formData.businessType);
      formDataPayload.append('businessLocation', formData.businessLocation);
      formDataPayload.append('businessName', formData.businessName);
      
      // Store details
      formDataPayload.append('storeName', formData.storeName);
      formDataPayload.append('subscriptionType', formData.subscriptionType);
      formDataPayload.append('payoutMethod', formData.payoutMethod);
      
      // Banking details
      formDataPayload.append('bankName', formData.bankName);
      formDataPayload.append('accountNumber', formData.accountNumber);
      formDataPayload.append('accountHolderName', formData.accountHolderName);
      
      // Document types
      formDataPayload.append('governmentIdType', formData.governmentIdType);
      formDataPayload.append('proofOfResidenceType', formData.proofOfResidenceType);
      formDataPayload.append('identityProofType', formData.governmentIdType); // Backend expects this field too
      formDataPayload.append('identityProofCountryOfIssue', formData.identityProofCountryOfIssue);
      
      // Addresses - convert objects to JSON strings or individual fields
   if (formData.residentialAddress && formData.residentialAddress.addressLine1) {
  formDataPayload.append('residentialAddress', JSON.stringify(formData.residentialAddress));
}

if (formData.businessAddress && formData.businessAddress.addressLine1) {
  formDataPayload.append('businessAddress', JSON.stringify(formData.businessAddress));
}

if (formData.subscriptionType === 'professional') {
  // Add card information
  if (formData.cardNumber) formDataPayload.append('cardNumber', formData.cardNumber.replace(/\s/g, ''));
  if (formData.expiresOn) formDataPayload.append('expiresOn', formData.expiresOn);
  if (formData.year) formDataPayload.append('year', formData.year);
  if (formData.cardHolderName) formDataPayload.append('cardHolderName', formData.cardHolderName);
  if (formData.cvv) formDataPayload.append('cvv', formData.cvv);
  
  // Add billing address
  if (formData.billingAddress && formData.billingAddress.addressLine1) {
    formDataPayload.append('billingAddress', JSON.stringify(formData.billingAddress));
  }
}
      // Shipping countries
      if (formData.shippingCountries && formData.shippingCountries.length > 0) {
        formData.shippingCountries.forEach(country => {
          formDataPayload.append('shippingCountries[]', country);
        });
      }
      
      // Optional fields
      if (formData.companyRegistrationNumber) {
        formDataPayload.append('companyRegistrationNumber', formData.companyRegistrationNumber);
      }
      if (formData.routingNumber) {
        formDataPayload.append('routingNumber', formData.routingNumber);
      }
      if (formData.bankCountry) {
        formDataPayload.append('bankCountry', formData.bankCountry);
      }

      // Add document files with correct field names
      const documentMapping = {
        'governmentId': 'governmentId',
        'proofOfResidence': 'proofOfResidence', 
        'selfieWithId': 'selfieWithId'
      };
      
      for (const [frontendField, backendField] of Object.entries(documentMapping)) {
        const fileData = uploadedFiles[frontendField];
        if (fileData && fileData.file) {
          formDataPayload.append(backendField, fileData.file);
        } else {
          throw new Error(`${frontendField} document is required`);
        }
      }

      console.log('Sending form data to backend...'); // Debug log

      const response = await fetch(endpoint, {
        method: 'POST',
        body: formDataPayload
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      toast.success('Seller registration successful! Please check your email to verify your account.');
      setTimeout(() => router.push('/verify'), 2000);
      
    } catch (error) {
      console.error('Registration error:', error);
      toast.error(error.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderCurrentStep = () => {
    const stepProps = {
      formData,
      handleInputChange,
      updateFormData,
      errors,
      setErrors
    };

    switch (currentStep) {
      case 1:
        return (
          <PersonalInfoStep
            {...stepProps}
            countries={countries}
            states={states}
            addressSuggestions={addressSuggestions}
            showAddressSuggestions={showAddressSuggestions}
            handleAddressInput={handleAddressInput}
            selectAddress={selectAddress}
            setShowAddressSuggestions={setShowAddressSuggestions}
          />
        );
      case 2:
        return (
          <BusinessDetailsStep
            {...stepProps}
            countries={countries}
            businessStates={businessStates}
            businessAddressSuggestions={businessAddressSuggestions}
            showBusinessAddressSuggestions={showBusinessAddressSuggestions}
            handleAddressInput={handleAddressInput}
            selectAddress={selectAddress}
            setShowBusinessAddressSuggestions={setShowBusinessAddressSuggestions}
          />
        );
      case 3:
        return <StoreSetupStep {...stepProps} />;
      case 4:
  return (
    <BankingInfoStep
      {...stepProps}
      countries={countries}
      billingAddressSuggestions={billingAddressSuggestions}
      showBillingAddressSuggestions={showBillingAddressSuggestions}
      handleAddressInput={handleAddressInput}
      selectAddress={selectAddress}
      setShowBillingAddressSuggestions={setShowBillingAddressSuggestions}
    />
  );
      case 5:
        return (
          <DocumentsStep
            {...stepProps}
            uploadedFiles={uploadedFiles}
            uploading={uploading}
            handleFileUpload={handleFileUpload}
            removeFile={removeFile}
          />
        );
      case 6:
        return <SecurityStep {...stepProps} onSubmit={handleSubmit} loading={loading} />;
      default:
        return null;
    }
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex flex-col items-center justify-center px-4 py-8">
         <Image
                  src="https://res.cloudinary.com/khalifrex/image/upload/v1756240354/ChatGPT_Image_Aug_26_2025_09_26_58_PM_blhroo.png"
                  alt="Khalifrex Logo"
                  width={250}
                  height={60}
                  priority
                  className="object-contain"
                />

        
        <ToastContainer position="top-right" />
        
        <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          {/* Header */}
          <div className="px-8 py-6 text-white" style={{ backgroundColor: '#0C7FD2' }}>
            <h1 className="text-2xl font-bold text-center">Become a Seller</h1>
            <p className="text-blue-100 text-center mt-1 text-sm">Start selling your products today</p>
          </div>

          <StepIndicator currentStep={currentStep} />

          {/* Form Content */}
          <div className="px-8 py-6">
            {renderCurrentStep()}

            {/* Action Buttons */}
            <div className="flex justify-between pt-6 border-t border-gray-200">
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={handlePrevStep}
                  className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 focus:ring-4 focus:ring-gray-100 transition-all duration-200"
                >
                  Previous
                </button>
              )}
              
              <div className="flex-1 flex justify-end">
                {currentStep < 6 ? (
                  <button
                    type="button"
                    onClick={handleNextStep}
                    className="px-8 py-3 text-white rounded-lg font-medium hover:opacity-90 focus:ring-4 transition-all duration-200 transform hover:scale-[1.02]"
                    style={{ 
                      backgroundColor: '#0C7FD2',
                      '--tw-ring-color': '#0C7FD2',
                      '--tw-ring-opacity': '0.3'
                    }}
                  >
                    Next Step
                  </button>
                ) : (
                  <button
                    type="submit"
                    onClick={handleSubmit}
                    disabled={loading}
                    className="px-8 py-3 text-white rounded-lg font-medium hover:opacity-90 focus:ring-4 transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    style={{ 
                      backgroundColor: '#0C7FD2',
                      '--tw-ring-color': '#0C7FD2',
                      '--tw-ring-opacity': '0.3'
                    }}
                  >
                    {loading ? (
                      <div className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Creating Account...
                      </div>
                    ) : (
                      'Create Seller Account'
                    )}
                  </button>
                )}
              </div>
            </div>

            {/* Terms and Login Link */}
            {currentStep === 6 && (
              <div className="text-center pt-4 space-y-2 border-t border-gray-200">
                <p className="text-xs text-gray-500">
                  By creating an account, you agree to our{' '}
                  <Link href="/terms" className="hover:underline" style={{ color: '#0C7FD2' }}>Terms of Service</Link>
                  {' '}and{' '}
                  <Link href="/privacy" className="hover:underline" style={{ color: '#0C7FD2' }}>Privacy Policy</Link>
                </p>
                <p className="text-sm text-gray-600">
                  Already have an account?{' '}
                  <Link
                    href="/login"
                    className="hover:underline font-medium"
                    style={{ color: '#0C7FD2' }}
                  >
                    Sign in here
                  </Link>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}