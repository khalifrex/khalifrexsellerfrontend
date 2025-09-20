import { useState, useEffect } from 'react';
import AddressInput from "./AddressInput";

export default function BankingInfoStep({ 
  formData, 
  handleInputChange, 
  updateFormData,
  errors,
  setErrors,
  countries,
  billingAddressSuggestions,
  showBillingAddressSuggestions,
  handleAddressInput,
  selectAddress,
  setShowBillingAddressSuggestions
}) {
  const [paymentInitialized, setPaymentInitialized] = useState(false);
  const [paymentVerified, setPaymentVerified] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState('');

  const isProfessional = formData.subscriptionType === 'professional';

  // Initialize Paystack payment
  const initializePayment = async () => {
    if (!formData.firstName || !formData.lastName) {
      setPaymentError('Please complete your personal information first');
      return;
    }

    if (!formData.billingAddress?.addressLine1) {
      setPaymentError('Please complete your billing address first');
      return;
    }

    setIsProcessingPayment(true);
    setPaymentError('');

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/initialize-subscription-payment`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'salehdiddi@gmail.com',
          firstName: formData.firstName,
          lastName: formData.lastName,
          businessName: formData.businessName,
          userId: formData.userId
        })
      });

      const data = await response.json();

      if (data.success) {
        // Store payment reference
        updateFormData('paymentReference', data.reference);
        
        // Redirect to Paystack payment page
        window.location.href = data.authorizationUrl;
      } else {
        setPaymentError(data.message || 'Failed to initialize payment');
      }
    } catch (error) {
      console.error('Payment initialization error:', error);
      setPaymentError('Failed to initialize payment. Please try again.');
    } finally {
      setIsProcessingPayment(false);
    }
  };


  const verifyPayment = async (reference) => {
    if (!reference) return;

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/verify-subscription-payment`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reference })
      });

      const data = await response.json();

      if (data.success) {
        setPaymentVerified(true);
        setPaymentError('');
        updateFormData('authorizationCode', data.authorizationCode);
        
        // Clear any payment errors
        if (errors.payment) {
          const newErrors = { ...errors };
          delete newErrors.payment;
          setErrors(newErrors);
        }
      } else {
        setPaymentError('Payment verification failed. Please try again.');
        setPaymentVerified(false);
      }
    } catch (error) {
      console.error('Payment verification error:', error);
      setPaymentError('Payment verification failed. Please try again.');
      setPaymentVerified(false);
    }
  };

  // Check for payment callback on component mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const reference = urlParams.get('reference');
    const status = urlParams.get('status');
    
    if (reference && status === 'success') {
      updateFormData('paymentReference', reference);
      verifyPayment(reference);
      
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  // Check if payment is already completed
  useEffect(() => {
    if (formData.paymentReference && formData.authorizationCode) {
      setPaymentVerified(true);
    }
  }, [formData.paymentReference, formData.authorizationCode]);

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Payment Information</h2>
      
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <p className="text-sm text-blue-800">
          <strong>Payment Information:</strong> Only required for Professional subscription ($15/month). Banking details for payouts will be collected after account verification.
        </p>
      </div>

      {/* Professional subscription payment */}
      {isProfessional ? (
        <div className="space-y-4 border-t pt-6">
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
            <h3 className="text-lg font-medium text-amber-800 border-b border-amber-200 pb-2 mb-2">
              Professional Subscription - $15/month
            </h3>
            <p className="text-sm text-amber-700">
              <strong>Secure Payment:</strong> Your first payment will be processed immediately via Paystack, then automatically charged monthly.
            </p>
            <div className="mt-2 flex items-center space-x-2">
              <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-xs text-green-700">Secured by Paystack</span>
            </div>
          </div>

          {/* Billing Address */}
          <div className="mb-6">
            <AddressInput
              label="Billing Address"
              addressData={formData.billingAddress}
              updateAddress={(addressData) => updateFormData('billingAddress', addressData)}
              errors={errors.billingAddress}
              suggestions={billingAddressSuggestions}
              showSuggestions={showBillingAddressSuggestions}
              onAddressLineInput={(value) => {
                updateFormData('billingAddressDisplay', value);
                handleAddressInput(value, 'billing');
              }}
              onSelectSuggestion={(suggestion) => selectAddress(suggestion, 'billing')}
              setShowSuggestions={setShowBillingAddressSuggestions}
              countries={countries}
              required={true}
            />
          </div>

          {/* Payment Section */}
          <div className="space-y-4">
            {!paymentVerified ? (
              <>
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h4 className="text-md font-medium text-gray-900 mb-2">Payment Required</h4>
                  <p className="text-sm text-gray-600 mb-4">
                    Complete your payment to activate your Professional subscription with advanced seller tools.
                  </p>
                  
                  <button
                    type="button"
                    onClick={initializePayment}
                    disabled={isProcessingPayment || !formData.billingAddress?.addressLine1}
                    className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
                      isProcessingPayment || !formData.billingAddress?.addressLine1
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-green-600 text-white hover:bg-green-700 focus:ring-4 focus:ring-green-200'
                    }`}
                  >
                    {isProcessingPayment ? (
                      <div className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                      </div>
                    ) : (
                      'Pay $15.00 with Paystack'
                    )}
                  </button>
                  
                  {!formData.billingAddress?.addressLine1 && (
                    <p className="text-xs text-gray-500 mt-2 text-center">
                      Please complete your billing address to continue
                    </p>
                  )}
                </div>

                {paymentError && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <p className="text-sm text-red-700">{paymentError}</p>
                  </div>
                )}
              </>
            ) : (
              /* Payment Verified */
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center">
                  <svg className="h-6 w-6 text-green-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  <div>
                    <p className="text-sm font-medium text-green-800">Payment Successful!</p>
                    <p className="text-xs text-green-700">Your Professional subscription is ready to activate.</p>
                  </div>
                </div>
              </div>
            )}

            {/* Payment Features */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h5 className="text-sm font-semibold text-gray-800 mb-2">Professional Features Include:</h5>
              <ul className="text-xs text-gray-600 space-y-1">
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
                  Bulk product management tools
                </li>
                <li className="flex items-center">
                  <svg className="w-3 h-3 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Enhanced store customization
                </li>
              </ul>
            </div>
          </div>
        </div>
      ) : (
        /* Free subscription note */
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-sm text-green-700">
            <strong>Free Plan Selected:</strong> No payment information required. You can upgrade to Professional later from your dashboard.
          </p>
        </div>
      )}

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-yellow-800 mb-2">What&apos;s Next:</h4>
        <ul className="text-xs text-yellow-700 space-y-1">
          <li>• Banking details for payouts will be collected after verification</li>
          <li>• All payment processing is handled securely by Paystack</li>
          <li>• Monthly billing is automatic - cancel anytime from your dashboard</li>
          <li>• Professional features activate immediately after verification</li>
        </ul>
      </div>
    </div>
  );
}