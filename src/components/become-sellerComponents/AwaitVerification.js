'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

const AwaitVerification = ({ 
  subscriptionType = 'free', 
  paymentAmount = null, 
  paymentFailed = false,
  accountStatus = 'pending_review'
}) => {
  const router = useRouter();
  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    // Only auto-redirect for successful submissions, not for errors
    if (!paymentFailed && accountStatus !== 'rejected' && accountStatus !== 'inactive') {
      const timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            router.push('/dashboard');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [router, paymentFailed, accountStatus]);

  const isProfessional = subscriptionType === 'professional';

  // Handle payment failure case
  if (paymentFailed) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-pink-50 flex flex-col items-center justify-center px-4 py-8">
        <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          {/* Header */}
          <div className="px-8 py-6 text-center bg-red-600">
            <Image
              src="https://res.cloudinary.com/khalifrex/image/upload/v1756240354/ChatGPT_Image_Aug_26_2025_09_26_58_PM_blhroo.png"
              alt="Khalifrex Logo"
              width={200}
              height={50}
              className="mx-auto mb-4"
              priority
            />
            <h1 className="text-2xl font-bold text-white">Payment Failed</h1>
          </div>

          {/* Content */}
          <div className="px-8 py-8 text-center">
            {/* Error Icon */}
            <div className="mx-auto mb-6 w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </div>

            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Professional Subscription Payment Failed
            </h2>

            <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
              <p className="text-red-800 font-medium">Your seller account has been created successfully</p>
              <p className="text-red-700 text-sm mt-2">
                However, the payment for your Professional subscription could not be processed. 
                You can upgrade to Professional anytime from your dashboard.
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-medium text-blue-800 mb-3">What&apos;s Next?</h3>
              <div className="text-left space-y-2 text-sm text-blue-700">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                  <span>Your seller account is under review</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                  <span>You can upgrade to Professional from your dashboard</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                  <span>Start with our Free plan (10 products limit)</span>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => router.push('/signin')}
                className="flex-1 px-6 py-3 text-blue-600 border border-blue-600 rounded-lg font-medium hover:bg-blue-50 transition-all duration-200"
              >
                Login to Dashboard
              </button>
              <button
                onClick={() => router.push('/dashboard/subscription')}
                className="flex-1 px-6 py-3 text-white rounded-lg font-medium hover:opacity-90 transition-all duration-200 bg-blue-600"
              >
                Upgrade to Professional
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Handle account status cases
  if (accountStatus === 'rejected') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-pink-50 flex flex-col items-center justify-center px-4 py-8">
        <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          {/* Header */}
          <div className="px-8 py-6 text-center bg-red-600">
            <Image
              src="https://res.cloudinary.com/khalifrex/image/upload/v1756240354/ChatGPT_Image_Aug_26_2025_09_26_58_PM_blhroo.png"
              alt="Khalifrex Logo"
              width={200}
              height={50}
              className="mx-auto mb-4"
              priority
            />
            <h1 className="text-2xl font-bold text-white">Account Suspended</h1>
          </div>

          <div className="px-8 py-8 text-center">
            <div className="mx-auto mb-6 w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>

            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Account Under Review</h2>

            <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
              <p className="text-red-800 font-medium">Your seller account has been temporarily suspended</p>
              <p className="text-red-700 text-sm mt-2">
                Our team is reviewing your account. You will be notified via email once the review is complete.
              </p>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
              <p className="text-gray-700 text-sm">
                Questions? Contact our support team at{' '}
                <a href="mailto:support@khalifrex.com" className="text-blue-600 hover:underline">
                  support@khalifrex.com
                </a>
              </p>
            </div>

            <button
              onClick={() => router.push('/signin')}
              className="px-6 py-3 text-white rounded-lg font-medium hover:opacity-90 transition-all duration-200 bg-gray-600"
            >
              Back to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Default success case
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex flex-col items-center justify-center px-4 py-8">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="px-8 py-6 text-center" style={{ backgroundColor: '#0C7FD2' }}>
          <Image
            src="https://res.cloudinary.com/khalifrex/image/upload/v1756240354/ChatGPT_Image_Aug_26_2025_09_26_58_PM_blhroo.png"
            alt="Khalifrex Logo"
            width={200}
            height={50}
            className="mx-auto mb-4"
            priority
          />
          <h1 className="text-2xl font-bold text-white">
            {isProfessional ? 'Payment Successful!' : 'Account Created Successfully!'}
          </h1>
        </div>

        {/* Content */}
        <div className="px-8 py-8 text-center">
          {/* Success Icon */}
          <div className="mx-auto mb-6 w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>

          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            {isProfessional ? 'Welcome to Professional!' : 'Welcome to Khalifrex!'}
          </h2>

          {/* Payment Confirmation for Professional */}
          {isProfessional && paymentAmount && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <p className="text-green-800 font-medium">Payment Confirmed: {paymentAmount}</p>
              <p className="text-green-700 text-sm">Professional subscription activated</p>
            </div>
          )}

          {/* Account Under Review Message */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 mb-6">
            <div className="flex items-start">
              <svg className="w-6 h-6 text-amber-500 mr-3 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <div className="text-left">
                <h3 className="text-lg font-medium text-amber-800 mb-2">Account Under Review</h3>
                <p className="text-amber-700 text-sm mb-3">
                  Your seller account is currently being reviewed by our team. This process may take 24 hours to 3 business days.
                </p>
                <p className="text-amber-700 text-sm">
                  <strong>You will be notified via email</strong> once your account has been approved and is ready to use.
                </p>
              </div>
            </div>
          </div>

          {/* Redirect Notice */}
          <div className="text-center">
            <p className="text-gray-600 text-sm mb-2">
              You will be redirected to your dashboard in {countdown} seconds
            </p>
            <button
              onClick={() => router.push('/dashboard')}
              className="inline-flex items-center px-6 py-3 text-white rounded-lg font-medium hover:opacity-90 transition-all duration-200"
              style={{ backgroundColor: '#0C7FD2' }}
            >
              Go to Dashboard Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AwaitVerification;