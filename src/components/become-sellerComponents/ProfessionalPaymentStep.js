import { useState } from "react";

export default function ProfessionalPaymentStep({ sellerId, formData, paymentProcessing, paymentCompleted, onPaymentSuccess }) {
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState('');

  
  if (paymentProcessing) {
    return (
      <div className="space-y-6 text-center">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Processing Payment</h2>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-blue-800">Verifying your ₦25,000 payment and activating subscription...</p>
        </div>
      </div>
    );
  }

  if (paymentCompleted) {
    return (
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Payment Successful!</h2>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <svg className="h-6 w-6 text-green-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <div>
              <p className="text-sm font-medium text-green-800">Professional Subscription Activated!</p>
              <p className="text-xs text-green-700">₦25,000/month subscription is now active. Redirecting to verification page...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Initialize payment - UPDATED to remove hardcoded email
  const initializePayment = async () => {
    if (!sellerId) {
      setPaymentError('Seller ID not found. Please try refreshing the page.');
      return;
    }

    setIsProcessingPayment(true);
    setPaymentError('');

    // Store seller ID before redirecting
    localStorage.setItem('pendingSellerId', sellerId);
    sessionStorage.setItem('pendingSellerId', sellerId);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/initialize-professional-payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies for authentication
        body: JSON.stringify({
          sellerId,
          firstName: formData.firstName,
          lastName: formData.lastName,
        })
      });

      const data = await response.json();

      if (data.success) {
        console.log('Payment initialized successfully for user:', data.userEmail);
        
        // Redirect to Paystack
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

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Complete Your Professional Subscription</h2>
      
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
        <div className="flex items-center">
          <svg className="h-6 w-6 text-green-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <div>
            <p className="text-sm font-medium text-green-800">Account Created Successfully!</p>
            <p className="text-xs text-green-700">Now complete your ₦25,000 monthly subscription payment using your registered email.</p>
          </div>
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <h3 className="text-lg font-medium text-amber-800 border-b border-amber-200 pb-2 mb-2">
          Professional Subscription - ₦25,000/month
        </h3>
        <p className="text-sm text-amber-700 mb-4">
          <strong>Secure Payment:</strong> Payment will be processed using your registered account email. Your subscription will be charged monthly automatically.
        </p>
        
        <button
          type="button"
          onClick={initializePayment}
          disabled={isProcessingPayment}
          className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
            isProcessingPayment
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-green-600 text-white hover:bg-green-700'
          }`}
        >
          {isProcessingPayment ? 'Processing...' : 'Complete Subscription - Pay ₦25,000'}
        </button>
        
        <div className="mt-2 flex items-center justify-center space-x-2">
          <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <span className="text-xs text-green-700">Secured by Paystack</span>
        </div>
      </div>

      {paymentError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-sm text-red-700">{paymentError}</p>
          {sellerId && (
            <p className="text-xs text-red-600 mt-1">Seller ID: {sellerId}</p>
          )}
        </div>
      )}

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-blue-800 mb-2">Payment Security</h4>
        <ul className="text-xs text-blue-700 space-y-1">
          <li>• Payment will use your registered account email</li>
          <li>• Each seller gets a unique Paystack customer profile</li>
          <li>• Your account data is already secured</li>
          <li>• No additional email verification required</li>
        </ul>
      </div>
    </div>
  );
};