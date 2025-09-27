'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

const DashboardStatusHandler = ({ children }) => {
  const router = useRouter();
  const [accountStatus, setAccountStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [seller, setSeller] = useState(null);

  useEffect(() => {
    checkAccountStatus();
  }, []);

  const checkAccountStatus = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/seller/account-status`, {
        method: 'GET',
        credentials: 'include'
      });

      const data = await response.json();

      if (response.ok) {
        setAccountStatus(data.status);
        setSeller(data.seller);
      } else {
        // If not authenticated or no seller account, redirect appropriately
        if (data.redirect) {
          router.push(data.redirect);
          return;
        }
      }
    } catch (error) {
      console.error('Account status check failed:', error);
      router.push('/signin');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Show account status messages based on current state
  if (accountStatus === 'under_review' || accountStatus === 'pending_review') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-50 flex flex-col items-center justify-center px-4 py-8">
        <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="px-8 py-6 text-center bg-amber-500">
            <Image
              src="https://res.cloudinary.com/khalifrex/image/upload/v1756240354/ChatGPT_Image_Aug_26_2025_09_26_58_PM_blhroo.png"
              alt="Khalifrex Logo"
              width={200}
              height={50}
              className="mx-auto mb-4"
              priority
            />
            <h1 className="text-2xl font-bold text-white">Account Under Review</h1>
          </div>

          <div className="px-8 py-8 text-center">
            <div className="mx-auto mb-6 w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>

            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Your Account is Being Reviewed</h2>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 mb-6">
              <div className="text-left">
                <h3 className="text-lg font-medium text-amber-800 mb-2">What&apos;s happening?</h3>
                <p className="text-amber-700 text-sm mb-3">
                  Our verification team is currently reviewing your seller account and documents. 
                  This process typically takes 24 hours to 3 business days.
                </p>
                <p className="text-amber-700 text-sm">
                  <strong>You will be notified via email</strong> once your account has been approved and is ready to use.
                </p>
              </div>
            </div>

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
                  <span>Full access to sell on Khalifrex marketplace</span>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
              <p className="text-gray-700 text-sm">
                Questions about your application? Contact our support team at{' '}
                <a href="mailto:support@khalifrex.com" className="text-blue-600 hover:underline">
                  support@khalifrex.com
                </a>
              </p>
            </div>

            <button
              onClick={() => router.push('/signin')}
              className="px-6 py-3 text-white rounded-lg font-medium hover:opacity-90 transition-all duration-200"
              style={{ backgroundColor: '#0C7FD2' }}
            >
              Back to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (accountStatus === 'rejected' || accountStatus === 'inactive') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-pink-50 flex flex-col items-center justify-center px-4 py-8">
        <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.924-.833-2.598 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
              </svg>
            </div>

            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Account Access Restricted</h2>

            <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
              <p className="text-red-800 font-medium">Your seller account has been temporarily suspended</p>
              <p className="text-red-700 text-sm mt-2">
                {seller?.verificationNotes || 'Our team is reviewing your account. You will be notified via email once the review is complete.'}
              </p>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
              <p className="text-gray-700 text-sm">
                For questions or appeals, contact our support team at{' '}
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

  // Account is active, render dashboard content
  return <>{children}</>;
};

export default DashboardStatusHandler;