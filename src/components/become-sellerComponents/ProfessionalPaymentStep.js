import { useState } from "react";
import { DollarSign, Lock, CreditCard, CheckCircle2, AlertCircle } from "lucide-react";

export default function ProfessionalPaymentStep({ 
  sellerId, 
  formData, 
  paymentProcessing, 
  paymentCompleted, 
  onPaymentSuccess 
}) {
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState('');

  if (paymentProcessing) {
    return (
      <div className="space-y-6 text-center">
        <div className="animate-pulse">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <DollarSign className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        <h2 className="text-2xl font-semibold text-gray-900">Processing Payment</h2>
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-blue-800 font-medium">Verifying your $25 payment and activating subscription...</p>
          <p className="text-blue-600 text-sm mt-2">This may take a few moments</p>
        </div>
      </div>
    );
  }

  if (paymentCompleted) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h2>
          <p className="text-gray-600">Your professional subscription is now active</p>
        </div>
        
        <div className="bg-green-50 border border-green-200 rounded-xl p-6">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-green-800 mb-1">Professional Subscription Activated!</p>
              <p className="text-sm text-green-700 mb-2">
                Your $25/month subscription is now active. You&apos;ll enjoy:
              </p>
              <ul className="text-sm text-green-700 space-y-1">
                <li>✓ 5% commission rate (instead of 10%)</li>
                <li>✓ Advanced analytics and reporting</li>
                <li>✓ Priority customer support</li>
                <li>✓ Early access to new features</li>
              </ul>
            </div>
          </div>
        </div>
        
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <p className="text-sm text-blue-800 text-center">
            Redirecting to verification page...
          </p>
        </div>
      </div>
    );
  }

  const initializePayment = async () => {
    if (!sellerId) {
      setPaymentError('Seller ID not found. Please try refreshing the page.');
      return;
    }

    setIsProcessingPayment(true);
    setPaymentError('');

    // Store seller ID for payment callback
    localStorage.setItem('pendingSellerId', sellerId);
    sessionStorage.setItem('pendingSellerId', sellerId);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/initialize-professional-payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          sellerId,
          firstName: formData.firstName,
          lastName: formData.lastName,
        })
      });

      const data = await response.json();

      if (data.success && data.checkoutUrl) {
        console.log('Payment initialized successfully');
        
        // Redirect to Flutterwave checkout
        window.location.href = data.checkoutUrl;
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
      {/* Header */}
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Complete Your Professional Subscription</h2>
        <p className="text-gray-600">One final step to unlock premium features</p>
      </div>
      
      {/* Success Message */}
      <div className="bg-green-50 border border-green-200 rounded-xl p-4">
        <div className="flex items-center gap-3">
          <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0" />
          <div>
            <p className="font-semibold text-green-800">Account Created Successfully!</p>
            <p className="text-sm text-green-700">Now complete your $25/month subscription payment.</p>
          </div>
        </div>
      </div>

      {/* Subscription Details Card */}
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-200 rounded-xl overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 text-white">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <DollarSign className="w-6 h-6" />
            Professional Seller Subscription
          </h3>
        </div>
        
        <div className="p-6 space-y-4">
          {/* Pricing */}
          <div className="text-center pb-4 border-b border-blue-200">
            <div className="inline-flex items-baseline gap-2">
              <span className="text-4xl font-bold text-gray-900">$25</span>
              <span className="text-gray-600">/month</span>
            </div>
            <p className="text-sm text-gray-600 mt-2">Billed monthly • Cancel anytime</p>
          </div>

          {/* Features */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-3">What&apos;s Included:</h4>
            <div className="space-y-2">
              {[
                { icon: '💰', text: 'Reduced 5% commission (save 50%)', highlight: true },
                { icon: '📊', text: 'Advanced analytics and insights' },
                { icon: '🎯', text: 'Priority customer support' },
                { icon: '🚀', text: 'Bulk product management tools' },
                { icon: '✨', text: 'Enhanced store customization' },
                { icon: '📈', text: 'Marketing and promotion tools' }
              ].map((feature, idx) => (
                <div 
                  key={idx} 
                  className={`flex items-center gap-3 p-3 rounded-lg ${
                    feature.highlight ? 'bg-green-50 border border-green-200' : 'bg-white'
                  }`}
                >
                  <span className="text-xl">{feature.icon}</span>
                  <span className={`text-sm ${feature.highlight ? 'font-semibold text-green-800' : 'text-gray-700'}`}>
                    {feature.text}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Payment Button */}
          <button
            type="button"
            onClick={initializePayment}
            disabled={isProcessingPayment}
            className={`w-full py-4 px-6 rounded-xl font-bold text-lg transition-all duration-200 transform ${
              isProcessingPayment
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-green-600 to-green-700 text-white hover:from-green-700 hover:to-green-800 hover:scale-[1.02] shadow-lg hover:shadow-xl'
            }`}
          >
            {isProcessingPayment ? (
              <div className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Processing...
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <Lock size={20} />
                Complete Payment - $25/month
              </div>
            )}
          </button>

          {/* Security Badge */}
          <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
            <Lock size={16} className="text-green-600" />
            <span>Secured by Flutterwave • 256-bit encryption</span>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {paymentError && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-800">{paymentError}</p>
              {sellerId && (
                <p className="text-xs text-red-600 mt-1">Seller ID: {sellerId}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Payment Security Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
          <Lock size={18} />
          Payment Security
        </h4>
        <ul className="text-sm text-blue-800 space-y-2">
          <li className="flex items-start gap-2">
            <span className="text-blue-600">•</span>
            <span>Payment processed using your registered account email</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600">•</span>
            <span>PCI DSS compliant payment gateway</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600">•</span>
            <span>Your account data is already secured</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600">•</span>
            <span>Cancel anytime from your dashboard</span>
          </li>
        </ul>
      </div>

      {/* Accepted Payment Methods */}
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
        <p className="text-sm text-gray-700 text-center mb-3 font-medium">Accepted Payment Methods</p>
        <div className="flex items-center justify-center gap-6 flex-wrap text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <CreditCard size={16} />
            <span>Cards</span>
          </div>
          <span>Bank Transfer</span>
          <span>USSD</span>
          <span>Mobile Money</span>
        </div>
      </div>
    </div>
  );
}