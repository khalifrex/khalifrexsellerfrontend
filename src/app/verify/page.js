'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Mail, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState('verifying'); // 'verifying', 'success', 'error', 'expired'
  const [loading, setLoading] = useState(true);
  const [resendLoading, setResendLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const token = searchParams.get('token');
  const emailParam = searchParams.get('email');

  useEffect(() => {
    if (emailParam) {
      setEmail(emailParam);
    }

    if (token) {
      verifyEmail(token);
    } else {
      setStatus('pending');
      setLoading(false);
    }
  }, [token, emailParam]);

  const verifyEmail = async (verificationToken) => {
    setLoading(true);
    
    try {
      const apiURL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3092';
      const response = await fetch(`${apiURL}/verify-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: verificationToken })
      });

      const data = await response.json();

      if (response.ok) {
        setStatus('success');
        setMessage(data.message || 'Email verified successfully!');
        toast.success('Email verified successfully!');
        
        // Redirect to login after 3 seconds
        setTimeout(() => {
          router.push('/signin');
        }, 3000);
      } else {
        if (response.status === 410) {
          setStatus('expired');
          setMessage(data.message || 'Verification link has expired');
        } else {
          setStatus('error');
          setMessage(data.message || 'Email verification failed');
        }
      }
    } catch (error) {
      console.error('Verification error:', error);
      setStatus('error');
      setMessage('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resendVerificationEmail = async () => {
    if (!email) {
      toast.error('Email address is required to resend verification');
      return;
    }

    setResendLoading(true);

    try {
      const apiURL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3092';
      const response = await fetch(`${apiURL}/resend-verification`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Verification email sent successfully!');
        setStatus('pending');
      } else {
        toast.error(data.message || 'Failed to resend verification email');
      }
    } catch (error) {
      console.error('Resend error:', error);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setResendLoading(false);
    }
  };

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };

  const renderContent = () => {
    switch (status) {
      case 'verifying':
        return (
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 mx-auto mb-4" style={{ borderColor: '#0C7FD2', borderTopColor: 'transparent', borderWidth: '3px' }}></div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Verifying Your Email</h2>
            <p className="text-gray-600">Please wait while we verify your email address...</p>
          </div>
        );

      case 'success':
        return (
          <div className="text-center">
            <CheckCircle className="h-16 w-16 mx-auto mb-4 text-green-500" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Email Verified!</h2>
            <p className="text-gray-600 mb-4">{message}</p>
            <p className="text-sm text-gray-500">You will be redirected to the login page automatically...</p>
            <Link
              href="/signin"
              className="inline-block mt-4 px-6 py-2 text-white rounded-lg font-medium hover:opacity-90 transition-all duration-200"
              style={{ backgroundColor: '#0C7FD2' }}
            >
              Go to Login Now
            </Link>
          </div>
        );

      case 'error':
        return (
          <div className="text-center">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Verification Failed</h2>
            <p className="text-gray-600 mb-6">{message}</p>
            
            <div className="space-y-3">
              <div>
                <input
                  type="email"
                  value={email}
                  onChange={handleEmailChange}
                  placeholder="Enter your email address"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent transition-colors"
                  style={{ '--tw-ring-color': '#0C7FD2' }}
                  onFocus={(e) => e.target.style.borderColor = '#0C7FD2'}
                  onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                />
              </div>
              
              <button
                onClick={resendVerificationEmail}
                disabled={resendLoading || !email}
                className="w-full px-6 py-2.5 text-white rounded-lg font-medium hover:opacity-90 focus:ring-4 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ 
                  backgroundColor: '#0C7FD2',
                  '--tw-ring-color': '#0C7FD2',
                  '--tw-ring-opacity': '0.3'
                }}
              >
                {resendLoading ? (
                  <div className="flex items-center justify-center">
                    <RefreshCw className="animate-spin h-4 w-4 mr-2" />
                    Sending...
                  </div>
                ) : (
                  'Resend Verification Email'
                )}
              </button>
            </div>
          </div>
        );

      case 'expired':
        return (
          <div className="text-center">
            <AlertCircle className="h-16 w-16 text-orange-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Link Expired</h2>
            <p className="text-gray-600 mb-6">{message}</p>
            
            <div className="space-y-3">
              <div>
                <input
                  type="email"
                  value={email}
                  onChange={handleEmailChange}
                  placeholder="Enter your email address"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent transition-colors"
                  style={{ '--tw-ring-color': '#0C7FD2' }}
                  onFocus={(e) => e.target.style.borderColor = '#0C7FD2'}
                  onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                />
              </div>
              
              <button
                onClick={resendVerificationEmail}
                disabled={resendLoading || !email}
                className="w-full px-6 py-2.5 text-white rounded-lg font-medium hover:opacity-90 focus:ring-4 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ 
                  backgroundColor: '#0C7FD2',
                  '--tw-ring-color': '#0C7FD2',
                  '--tw-ring-opacity': '0.3'
                }}
              >
                {resendLoading ? (
                  <div className="flex items-center justify-center">
                    <RefreshCw className="animate-spin h-4 w-4 mr-2" />
                    Sending...
                  </div>
                ) : (
                  'Get New Verification Link'
                )}
              </button>
            </div>
          </div>
        );

      case 'pending':
      default:
        return (
          <div className="text-center">
            <Mail className="h-16 w-16 mx-auto mb-4" style={{ color: '#0C7FD2' }} />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Check Your Email</h2>
            <p className="text-gray-600 mb-6">
              We&apos;ve sent a verification link to your email address. Please check your inbox and click the link to verify your account.
            </p>
            
            <div className="space-y-4">
              <p className="text-sm text-gray-500">
                Didnt receive the email? Check your spam folder or request a new one.
              </p>
              
              <div className="space-y-3">
                <div>
                  <input
                    type="email"
                    value={email}
                    onChange={handleEmailChange}
                    placeholder="Enter your email address"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent transition-colors"
                    style={{ '--tw-ring-color': '#0C7FD2' }}
                    onFocus={(e) => e.target.style.borderColor = '#0C7FD2'}
                    onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                  />
                </div>
                
                <button
                  onClick={resendVerificationEmail}
                  disabled={resendLoading || !email}
                  className="w-full px-6 py-2.5 text-white rounded-lg font-medium hover:opacity-90 focus:ring-4 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ 
                    backgroundColor: '#0C7FD2',
                    '--tw-ring-color': '#0C7FD2',
                    '--tw-ring-opacity': '0.3'
                  }}
                >
                  {resendLoading ? (
                    <div className="flex items-center justify-center">
                      <RefreshCw className="animate-spin h-4 w-4 mr-2" />
                      Sending...
                    </div>
                  ) : (
                    'Resend Verification Email'
                  )}
                </button>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center px-4">
      <ToastContainer position="top-right" />
      
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="px-8 py-6 text-white" style={{ backgroundColor: '#0C7FD2' }}>
          <h1 className="text-xl font-bold text-center">Email Verification</h1>
          <p className="text-blue-100 text-center mt-1 text-sm">Verify your account to continue</p>
        </div>

        {/* Content */}
        <div className="px-8 py-8">
          {renderContent()}
        </div>

        {/* Footer */}
        <div className="px-8 py-4 border-t border-gray-100 text-center">
          <p className="text-sm text-gray-600">
            Need help?{' '}
            <Link
              href="/contact"
              className="hover:underline font-medium"
              style={{ color: '#0C7FD2' }}
            >
              Contact Support
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}