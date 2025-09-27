import React, { useState } from 'react';
import { Check, X, Star, Shield, Zap, TrendingUp, CreditCard, Lock, AlertCircle, Loader } from 'lucide-react';

// Main PlanSection Component
export default function PlanSection({ sellerInfo, onUpgradeSuccess }) {
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);

  const currentPlan = sellerInfo?.subscriptionType || 'free';
  const subscriptionStatus = sellerInfo?.subscriptionStatus || 'inactive';

  const handleUpgradeClick = () => {
    setUpgradeModalOpen(true);
  };

  const handleCancelClick = () => {
    setCancelModalOpen(true);
  };

  return (
    <>
      <section className="bg-white shadow-sm border border-gray-200 rounded-xl p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Subscription Plan</h2>
            <p className="text-gray-600">Manage your seller subscription and unlock premium features</p>
          </div>
          <div className="flex items-center space-x-2">
            {currentPlan === 'professional' && subscriptionStatus === 'active' && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                <Star className="w-4 h-4 mr-1" />
                Pro Active
              </span>
            )}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Current Plan Card */}
          <div className={`border rounded-xl p-6 ${
            currentPlan === 'free' 
              ? 'border-gray-300 bg-gray-50' 
              : 'border-green-300 bg-green-50'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {currentPlan === 'free' ? 'Basic Plan' : 'Professional Plan'}
              </h3>
              <span className="text-2xl font-bold text-gray-900">
                {currentPlan === 'free' ? '₦0' : '₦25,000'}
                {currentPlan === 'professional' && <span className="text-sm font-normal text-gray-600">/month</span>}
              </span>
            </div>
            
            <div className="space-y-3 mb-6">
              {currentPlan === 'free' ? (
                <>
                  <div className="flex items-center text-sm text-gray-600">
                    <Check className="w-4 h-4 text-green-600 mr-2 flex-shrink-0" />
                    Basic store setup
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Check className="w-4 h-4 text-green-600 mr-2 flex-shrink-0" />
                    Up to 10 products
                  </div>
                  <div className="flex items-center text-sm text-gray-400">
                    <X className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0" />
                    Priority support
                  </div>
                  <div className="flex items-center text-sm text-gray-400">
                    <X className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0" />
                    Advanced analytics
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center text-sm text-green-700">
                    <Check className="w-4 h-4 text-green-600 mr-2 flex-shrink-0" />
                    Unlimited products
                  </div>
                  <div className="flex items-center text-sm text-green-700">
                    <Check className="w-4 h-4 text-green-600 mr-2 flex-shrink-0" />
                    Priority customer support
                  </div>
                  <div className="flex items-center text-sm text-green-700">
                    <Check className="w-4 h-4 text-green-600 mr-2 flex-shrink-0" />
                    Advanced analytics & insights
                  </div>
                  <div className="flex items-center text-sm text-green-700">
                    <Check className="w-4 h-4 text-green-600 mr-2 flex-shrink-0" />
                    Custom store branding
                  </div>
                </>
              )}
            </div>

            {currentPlan === 'free' ? (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-200 text-gray-800">
                Current Plan
              </span>
            ) : (
              <div className="space-y-2">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-200 text-green-800">
                  Current Plan
                </span>
                {subscriptionStatus === 'active' ? (
                  <p className="text-sm text-green-600">Active until {sellerInfo?.subscriptionEndDate ? new Date(sellerInfo.subscriptionEndDate).toLocaleDateString() : 'N/A'}</p>
                ) : (
                  <p className="text-sm text-orange-600">Status: {subscriptionStatus}</p>
                )}
              </div>
            )}
          </div>

          {/* Action Card */}
          <div className="border border-blue-200 rounded-xl p-6 bg-gradient-to-br from-blue-50 to-indigo-50">
            <div className="text-center">
              {currentPlan === 'free' ? (
                <>
                  <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                    <TrendingUp className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Ready to grow your business?</h3>
                  <p className="text-sm text-gray-600 mb-6">
                    Unlock professional features and take your store to the next level
                  </p>
                  <button
                    onClick={handleUpgradeClick}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium py-3 px-4 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-sm hover:shadow-md"
                  >
                    Upgrade to Professional
                  </button>
                </>
              ) : (
                <>
                  <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                    <Star className="w-6 h-6 text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">You&apos;re on Professional!</h3>
                  <p className="text-sm text-gray-600 mb-6">
                    Enjoying all premium features. Need to make changes?
                  </p>
                  <button
                    onClick={handleCancelClick}
                    className="w-full bg-gray-100 text-gray-700 font-medium py-3 px-4 rounded-lg hover:bg-gray-200 transition-colors duration-200"
                  >
                    Manage Subscription
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Upgrade Modal */}
      {upgradeModalOpen && (
        <UpgradeModal
          sellerInfo={sellerInfo}
          onClose={() => setUpgradeModalOpen(false)}
          onSuccess={onUpgradeSuccess}
        />
      )}

      {/* Cancel Modal */}
      {cancelModalOpen && (
        <CancelModal
          onClose={() => setCancelModalOpen(false)}
        />
      )}
    </>
  );
}


function UpgradeModal({ sellerInfo, onClose, onSuccess }) {
  const [step, setStep] = useState('features'); 
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [paymentUrl, setPaymentUrl] = useState('');

  const professionalFeatures = [
    {
      icon: <Zap className="w-5 h-5" />,
      title: "Unlimited Products",
      description: "Add as many products as you need to your store"
    },
    {
      icon: <TrendingUp className="w-5 h-5" />,
      title: "Advanced Analytics",
      description: "Detailed insights into your sales, customers, and performance"
    },
    {
      icon: <Shield className="w-5 h-5" />,
      title: "Priority Support",
      description: "Get help when you need it with priority customer support"
    },
    {
      icon: <Star className="w-5 h-5" />,
      title: "Custom Branding",
      description: "Customize your store with your own branding and colors"
    }
  ];

  const handleUpgrade = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:3092/initialize-professional-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          sellerId: sellerInfo._id,
          firstName: sellerInfo.firstName,
          lastName: sellerInfo.lastName
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to initialize payment');
      }

      if (data.success) {
        setPaymentUrl(data.authorizationUrl);
        setStep('payment');
        
        // Redirect to Paystack
        window.open(data.authorizationUrl, '_blank');
        
        // Start polling for payment verification
        pollForPaymentVerification(data.reference);
      } else {
        throw new Error(data.message || 'Payment initialization failed');
      }
    } catch (err) {
      console.error('Upgrade error:', err);
      setError(err.message);
      setStep('error');
    } finally {
      setLoading(false);
    }
  };

  const pollForPaymentVerification = async (reference) => {
    setStep('processing');
    
    const maxAttempts = 30; // 5 minutes of polling
    let attempts = 0;

    const poll = async () => {
      try {
        const response = await fetch('http://localhost:3092/verify-professional-payment', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            reference: reference,
            sellerId: sellerInfo._id
          })
        });

        const data = await response.json();

        if (data.success) {
          setStep('success');
          setTimeout(() => {
            onSuccess?.();
            onClose();
            window.location.reload(); // Refresh to show updated status
          }, 3000);
        } else if (attempts < maxAttempts) {
          attempts++;
          setTimeout(poll, 10000); // Poll every 10 seconds
        } else {
          setError('Payment verification timed out. Please contact support if payment was successful.');
          setStep('error');
        }
      } catch (err) {
        console.error('Verification polling error:', err);
        if (attempts < maxAttempts) {
          attempts++;
          setTimeout(poll, 10000);
        } else {
          setError('Unable to verify payment. Please contact support.');
          setStep('error');
        }
      }
    };

    // Start polling after a short delay
    setTimeout(poll, 5000);
  };

  const renderStep = () => {
    switch (step) {
      case 'features':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                Upgrade to Professional
              </h3>
              <p className="text-gray-600">
                Unlock powerful features to grow your business
              </p>
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 text-center">
              <div className="text-3xl font-bold text-gray-900 mb-2">₦25,000</div>
              <div className="text-sm text-gray-600">per month</div>
            </div>

            <div className="space-y-4">
              {professionalFeatures.map((feature, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                    {feature.icon}
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{feature.title}</h4>
                    <p className="text-sm text-gray-600">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex space-x-3 pt-4">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleUpgrade}
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 disabled:opacity-50 flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <Loader className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4 mr-2" />
                    Upgrade Now
                  </>
                )}
              </button>
            </div>
          </div>
        );

      case 'payment':
        return (
          <div className="text-center space-y-6">
            <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <CreditCard className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Complete Your Payment</h3>
              <p className="text-gray-600">
                We&apos;ve opened a secure payment window. Complete your payment to activate Professional features.
              </p>
            </div>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 text-yellow-600 mr-2" />
                <p className="text-sm text-yellow-800">
                  Don&apos;t close this window. We&apos;ll automatically detect when payment is complete.
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              I&apos;ll complete payment later
            </button>
          </div>
        );

      case 'processing':
        return (
          <div className="text-center space-y-6">
            <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <Loader className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Processing Payment</h3>
              <p className="text-gray-600">
                Please wait while we verify your payment and activate your Professional subscription.
              </p>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                This may take a few moments. Please don&apos;t close this window.
              </p>
            </div>
          </div>
        );

      case 'success':
        return (
          <div className="text-center space-y-6">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Welcome to Professional!</h3>
              <p className="text-gray-600">
                Your upgrade was successful. You now have access to all Professional features.
              </p>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-sm text-green-800">
                Your account will be refreshed automatically in a few seconds.
              </p>
            </div>
          </div>
        );

      case 'error':
        return (
          <div className="text-center space-y-6">
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
              <X className="w-8 h-8 text-red-600" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Upgrade Failed</h3>
              <p className="text-gray-600 mb-4">{error}</p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setStep('features')}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Try Again
              </button>
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
        {step !== 'processing' && step !== 'success' && (
          <div className="flex justify-end mb-4">
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        )}
        {renderStep()}
      </div>
    </div>
  );
}


function CancelModal({ onClose }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Manage Subscription</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="space-y-4">
          <p className="text-gray-600">
            You can manage your Professional subscription settings, billing information, or cancel your subscription.
          </p>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start">
              <AlertCircle className="w-5 h-5 text-yellow-600 mr-2 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-yellow-800 font-medium mb-1">Important</p>
                <p className="text-sm text-yellow-700">
                  Canceling your subscription will remove access to Professional features at the end of your current billing period.
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Keep Subscription
            </button>
            <button className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
              Cancel Subscription
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}