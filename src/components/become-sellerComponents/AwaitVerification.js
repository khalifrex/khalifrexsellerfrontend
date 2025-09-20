'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

const AwaitVerification = ({ subscriptionType = 'free', paymentAmount = null }) => {
  const router = useRouter();
  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
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
  }, [router]);

  const isProfessional = subscriptionType === 'professional';

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

          {/* Main Message */}
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

          {/* What happens next */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-medium text-blue-800 mb-3">What happens next?</h3>
            <div className="text-left space-y-2 text-sm text-blue-700">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                <span>Our team reviews your documents and business information</span>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                <span>We verify your identity and business details</span>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                <span>You receive an email notification when approved</span>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                <span>Start selling on Khalifrex marketplace</span>
              </div>
            </div>
          </div>

          {/* Contact Support */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
            <p className="text-gray-700 text-sm">
              Questions about your application? Contact our support team at{' '}
              <a href="mailto:support@khalifrex.com" className="text-blue-600 hover:underline">
                support@khalifrex.com
              </a>
            </p>
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