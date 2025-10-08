'use client';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Image from 'next/image';

// Import step components
import PersonalInfoStep from '@/components/become-sellerComponents/PersonalInfoStep';
import BusinessDetailsStep from '@/components/become-sellerComponents/BusinessDetailsStep';
import StoreSetupStep from '@/components/become-sellerComponents/StoreSetupStep';
import DocumentsStep from '@/components/become-sellerComponents/DocumentsStep';
import SecurityStep from '@/components/become-sellerComponents/SecurityStep';
import ProfessionalPaymentStep from '@/components/become-sellerComponents/ProfessionalPaymentStep';
import TaxConfigurationStep from '@/components/become-sellerComponents/TaxConfigurationStep';
// Import hooks and utilities
import { useFormData } from '@/hooks/useFormData';
import { useLocationData } from '@/hooks/useLocationData';
import { useFileUpload } from '@/hooks/useFileUpload';
import { useFormValidation } from '@/hooks/useFormValidation';

export default function SellOnKhalifrex() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [sellerCreated, setSellerCreated] = useState(false);
  const [sellerId, setSellerId] = useState(null);
  
  // Payment callback state
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [paymentCompleted, setPaymentCompleted] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState(null);

  useEffect(() => {
    const handlePaymentCallback = async () => {
      const reference = searchParams.get('reference');
      const trxref = searchParams.get('trxref');
      const status = searchParams.get('status');
      const paymentType = searchParams.get('paymentType');
      const sellerIdFromUrl = searchParams.get('sellerId');
      
      console.log('Checking for payment callback:', {
        reference,
        trxref, 
        status,
        paymentType,
        sellerIdFromUrl,
        localStorage: localStorage.getItem('pendingSellerId')
      });
      
      // Check if this is a payment callback
      if ((reference || trxref) && paymentType === 'professional') {
        console.log('Payment callback detected for professional subscription');
        
        // Try multiple ways to get seller ID
        let targetSellerId = sellerIdFromUrl || 
                           localStorage.getItem('pendingSellerId') || 
                           sessionStorage.getItem('pendingSellerId');
        
        if (!targetSellerId) {
          // Try to extract from reference if it follows our pattern
          const referenceToUse = reference || trxref;
          if (referenceToUse && referenceToUse.includes('prof_payment_')) {
            const parts = referenceToUse.split('_');
            if (parts.length >= 3) {
              targetSellerId = parts[2]; // prof_payment_{sellerId}_{timestamp}_{random}
              console.log('Extracted seller ID from reference:', targetSellerId);
            }
          }
        }
        
        if (!targetSellerId) {
          console.error('No seller ID found in any location');
          toast.error('Payment callback received but seller ID not found. Please contact support with reference: ' + (reference || trxref));
          return;
        }
        
        console.log('Processing payment for seller ID:', targetSellerId);
        
        setPaymentProcessing(true);
        setSellerId(targetSellerId);
        setSellerCreated(true);
        setCurrentStep(6);
        
        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/verify-professional-payment`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({ 
              reference: reference || trxref,
              sellerId: targetSellerId 
            })
          });

          const data = await response.json();


          if (data.success) {
            setPaymentCompleted(true);
            setPaymentProcessing(false);
            setPaymentAmount(data.amount);
            
            // Clear stored seller IDs
            localStorage.removeItem('pendingSellerId');
            sessionStorage.removeItem('pendingSellerId');
            
            toast.success(`Payment successful! Professional subscription (${data.amount}) is now active.`);
            

            setTimeout(() => {
              router.push(`/await-verification?type=professional&amount=${encodeURIComponent(data.amount)}`);
            }, 3000);
          } else {
            throw new Error(data.message || 'Payment verification failed');
          }
        } catch (error) {
          console.error('Payment verification error:', error);
          setPaymentProcessing(false);
          toast.error('Payment verification failed: ' + error.message);
        }
        

        window.history.replaceState({}, document.title, window.location.pathname);
      }
    };
    
    handlePaymentCallback();
  }, [searchParams, router]);
  
  // Custom hooks
  const { formData, handleInputChange, updateFormData, errors, setErrors, setFormData } = useFormData();

  const { 
    countries, 
    states, 
    businessStates, 
    addressSuggestions,
    businessAddressSuggestions,
    showAddressSuggestions,
    showBusinessAddressSuggestions,
    handleAddressInput,
    selectAddress,
    setShowAddressSuggestions,
    setShowBusinessAddressSuggestions
  } = useLocationData(formData);
  const { uploadedFiles, uploading, handleFileUpload, removeFile, validateAllFiles } = useFileUpload(updateFormData);
  const { validateStep } = useFormValidation();

  // Calculate total steps based on subscription type
  const totalSteps = formData.subscriptionType === 'professional' ? 7 : 6;

const handleNextStep = () => {
  let nextStep = currentStep + 1;
  
  // For free users, skip step 5 (subscription) and go from 4 to 6
  if (formData.subscriptionType === 'free' && currentStep === 4) {
    nextStep = 6;
  }
  
  // Validate current step
    if (validateStep(currentStep, formData, setErrors, currentStep === 6 ? uploadedFiles : null)) {
    setCurrentStep(Math.min(nextStep, totalSteps));
  }

};

  const handlePrevStep = () => {
    let prevStep = currentStep - 1;
    
    // For free users, skip banking step when going back
    if (formData.subscriptionType === 'free' && currentStep === 6) {
      prevStep = 4;
    }
    
    setCurrentStep(Math.max(prevStep, 1));
  };

  // Create seller account first (without payment)
 const handleCreateSellerAccount = async (e) => {
  e.preventDefault();
  
  // Final validation
  if (!validateStep(currentStep, formData, setErrors, uploadedFiles)) return;
  if (!validateAllFiles()) return;
  
  setLoading(true);
  
  try {
    const endpoint = `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3092'}/create-seller-profile`;
    
    const formDataPayload = new FormData();
    
    // Add all text fields
    formDataPayload.append('firstName', formData.firstName);
    formDataPayload.append('lastName', formData.lastName);
    if (formData.middleName) formDataPayload.append('middleName', formData.middleName);
    formDataPayload.append('phoneNumber', formData.phoneNumber);
    
    // Personal details
    formDataPayload.append('countryOfCitizenship', formData.countryOfCitizenship);
    formDataPayload.append('countryOfBirth', formData.countryOfBirth);
    formDataPayload.append('dateOfBirth', formData.dateOfBirth);
    
    // Business details
    formDataPayload.append('businessType', formData.businessType);
    formDataPayload.append('businessLocation', formData.businessLocation);
    formDataPayload.append('businessName', formData.businessName);
    if (formData.companyRegistrationNumber) {
      formDataPayload.append('companyRegistrationNumber', formData.companyRegistrationNumber);
    }
    
    // Tax configuration
    formDataPayload.append('taxStatus', formData.taxStatus);
    if (formData.taxId) {
      formDataPayload.append('taxId', formData.taxId);
    }
    if (formData.taxConfig && formData.taxStatus === 'taxable') {
      formDataPayload.append('taxConfig', JSON.stringify(formData.taxConfig));
    }
    
    // Store details
    formDataPayload.append('storeName', formData.storeName);
    formDataPayload.append('subscriptionType', formData.subscriptionType);
    
    // Document types
    formDataPayload.append('governmentIdType', formData.governmentIdType);
    formDataPayload.append('proofOfResidenceType', formData.proofOfResidenceType);
    formDataPayload.append('identityProofType', formData.governmentIdType);
    formDataPayload.append('identityProofCountryOfIssue', formData.identityProofCountryOfIssue);
    
    // Addresses
    if (formData.residentialAddress && formData.residentialAddress.addressLine1) {
      formDataPayload.append('residentialAddress', JSON.stringify(formData.residentialAddress));
    }
    if (formData.businessAddress && formData.businessAddress.addressLine1) {
      formDataPayload.append('businessAddress', JSON.stringify(formData.businessAddress));
    }

    // Add document files
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

    const response = await fetch(endpoint, {
      method: 'POST',
      credentials: 'include',
      body: formDataPayload
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Seller profile creation failed');
    }

    setSellerCreated(true);
    setSellerId(data.sellerId);
    
    // Build success message with tax info
    let successMessage = 'Account created successfully!';
    if (data.taxStatus === 'taxable' && data.taxInfo) {
      successMessage += ` Tax registered: ${data.taxInfo.taxName} (${data.taxInfo.taxRate}%)`;
    }
    
    // If professional subscription, go to payment step
    if (formData.subscriptionType === 'professional') {
      localStorage.setItem('pendingSellerId', data.sellerId);
      sessionStorage.setItem('pendingSellerId', data.sellerId);
      
      console.log('Stored seller ID for payment:', data.sellerId);
      
      setCurrentStep(7); // Updated to step 7 (was 6)
      toast.success(successMessage + ' Now complete your $25 subscription payment.');
    } else {
      // For free accounts, redirect to AwaitVerification
      toast.success(successMessage + ' Your documents will be reviewed within 2-3 business days.');
      setTimeout(() => {
        router.push('/await-verification?type=free');
      }, 2000);
    }
    
  } catch (error) {
    console.error('Seller profile creation error:', error);
    toast.error(error.message || 'Profile creation failed. Please try again.');
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
      // NEW: Tax Configuration Step
      return (
        <TaxConfigurationStep
          {...stepProps}
          countries={countries}
        />
      );
      case 4:
        return <StoreSetupStep {...stepProps} />;
      case 5:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Subscription Information</h2>
            
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <h3 className="text-lg font-medium text-amber-800 mb-2">
                Professional Subscription - $25/month
              </h3>
              <p className="text-sm text-amber-700 mb-4">
                Payment will be processed after your account is created. This ensures you don&apos;t lose your registration data.
              </p>
              
              <div className="bg-white border border-amber-200 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-gray-800 mb-2">Professional Features Include:</h4>
                <ul className="text-xs text-gray-600 space-y-1">
                  <li className="flex items-center">
                    <svg className="w-3 h-3 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    5% commission rate (instead of 10%)
                  </li>
                  <li className="flex items-center">
                    <svg className="w-3 h-3 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Advanced analytics and reporting
                  </li>
                  <li className="flex items-center">
                    <svg className="w-3 h-3 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Priority customer support
                  </li>
                  <li className="flex items-center">
                    <svg className="w-3 h-3 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Early access to new features
                  </li>
                </ul>
              </div>
            </div>
          </div>
        );
      case 6:
        return (
          <DocumentsStep
            {...stepProps}
            uploadedFiles={uploadedFiles}
            uploading={uploading}
            handleFileUpload={handleFileUpload}
            removeFile={removeFile}
          />
        );
      case 7:
        // Payment step for professional users (after account creation)
        if (formData.subscriptionType === 'professional' && sellerCreated) {
          return (
            <ProfessionalPaymentStep
              sellerId={sellerId}
              formData={formData}
              paymentProcessing={paymentProcessing}
              paymentCompleted={paymentCompleted}
              onPaymentSuccess={() => {
                toast.success('Payment successful! Your professional subscription is now active.');
                // UPDATED: Redirect to AwaitVerification instead of dashboard
                setTimeout(() => {
                  router.push(`/await-verification?type=professional&amount=${encodeURIComponent(paymentAmount || '₦25,000')}`);
                }, 2000);
              }}
            />
          );
        } else {
          return <SecurityStep {...stepProps} onSubmit={handleCreateSellerAccount} loading={loading} />;
        }
      default:
        return null;
    }
  };

  // Update step indicator to show correct steps
  const getStepName = (step) => {
    const stepNames = {
      1: 'Personal Info',
      2: 'Business Details',
      3: 'Tax Config', 
      4: 'Store Setup',
      5: 'Subscription',
      6: 'Documents',
      7: formData.subscriptionType === 'professional' && sellerCreated ? 'Payment' : 'Review'
    };
    
    // For free users, adjust step names
    if (formData.subscriptionType === 'free') {
      return {
        1: 'Personal Info',
        2: 'Business Details',
        3: 'Tax Config',
        4: 'Store Setup', 
        6: 'Documents',
        7: 'Review'
      }[step];
    }
    
    return stepNames[step];
  };

  if (paymentProcessing && !paymentCompleted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex flex-col items-center justify-center px-4 py-8">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-gray-100 p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Processing Payment</h2>
          <p className="text-gray-600 text-sm">Please wait while we verify your payment and activate your subscription...</p>
        </div>
        <ToastContainer position="top-right" />
      </div>
    );
  }

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

          {/* Custom Step Indicator */}
          <div className="px-8 py-4 bg-gray-50 border-b">
            <div className="flex items-center justify-between">
              {Array.from({ length: totalSteps }, (_, i) => {
                const stepNumber = i + 1;
                const isActive = stepNumber === currentStep;
                const isCompleted = stepNumber < currentStep;
                const stepName = getStepName(stepNumber);
                
                // Skip rendering step 4 for free users
                if (formData.subscriptionType === 'free' && stepNumber === 4) {
                  return null;
                }
                
                return (
                  <div key={stepNumber} className="flex items-center">
                    <div className={`flex flex-col items-center ${stepNumber < totalSteps ? 'flex-1' : ''}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                        isCompleted 
                          ? 'bg-green-500 text-white' 
                          : isActive 
                            ? 'bg-blue-600 text-white' 
                            : 'bg-gray-200 text-gray-400'
                      }`}>
                        {isCompleted ? '✓' : stepNumber}
                      </div>
                      <span className={`text-xs mt-1 text-center ${isActive ? 'text-blue-600 font-medium' : 'text-gray-400'}`}>
                        {stepName}
                      </span>
                    </div>
                    {stepNumber < totalSteps && formData.subscriptionType === 'professional' && (
                      <div className={`h-0.5 flex-1 mx-2 ${isCompleted ? 'bg-green-500' : 'bg-gray-200'}`} />
                    )}
                    {stepNumber < totalSteps - 1 && formData.subscriptionType === 'free' && stepNumber !== 3 && (
                      <div className={`h-0.5 flex-1 mx-2 ${isCompleted ? 'bg-green-500' : 'bg-gray-200'}`} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Form Content */}
          <div className="px-8 py-6">
            {renderCurrentStep()}

            {/* Action Buttons */}
            <div className="flex justify-between pt-6 border-t border-gray-200">
  {currentStep > 1 && currentStep !== 7 && (
    <button
      type="button"
      onClick={handlePrevStep}
      className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 focus:ring-4 focus:ring-gray-100 transition-all duration-200"
    >
      Previous
    </button>
  )}
  
  <div className="flex-1 flex justify-end">
    {currentStep < totalSteps && (
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
    )}
  </div>
</div>
          </div>
        </div>
      </div>
    </>
  );
}