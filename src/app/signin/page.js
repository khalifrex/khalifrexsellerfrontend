'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import Image from 'next/image';

export default function SellerSignIn({
  routerOverride = null,
  onSuccess = null,
  disableRedirect = false
}) {
  const defaultRouter = useRouter();
  const router = routerOverride || defaultRouter;

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sellerAccessError, setSellerAccessError] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError('');
    if (sellerAccessError) setSellerAccessError(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSellerAccessError(false);
    setLoading(true);

    const apiURL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3092';

    try {
      // Login request
      const res = await fetch(`${apiURL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (!res.ok) {
        // Check if it's invalid credentials vs account not found
        if (res.status === 401) {
          throw new Error(data.message || 'Invalid email or password');
        }
        throw new Error(data.message || 'Login failed');
      }

      if (!data.user) {
        throw new Error('Invalid user data received');
      }


      if (!data.user.roles.seller) {
        
        toast.success('Login successful! Let\'s set up your seller account.');
        setTimeout(() => {
          router.push('/become-seller');
        }, 1000);
        return;
      }


      if (!data.sellerStatus?.hasSeller) {

        toast.success('Login successful! Please complete your seller profile.');
        setTimeout(() => {
          router.push('/become-seller');
        }, 1000);
        return;
      }


      toast.success('Login successful!');

      if (onSuccess) onSuccess();
      if (disableRedirect) return;

      setTimeout(() => {
        router.push('/dashboard');
      }, 1000);

    } catch (err) {
      console.error('Login error:', err);
      

      if (err.message.includes('Invalid credentials') || err.message.includes('User not found')) {
        toast.error('Account not found. Please create an account first.');
        setTimeout(() => {
          router.push('/signup');
        }, 2000);
        return;
      }
      
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const apiURL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3092';

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex flex-col items-center px-4">
        <div className="mt-8 mb-6">
          <Image
            src="https://res.cloudinary.com/khalifrex/image/upload/v1751461356/navbarLogo_iw2ooa.jpg"
            alt="Khalifrex Logo"
            width={200}
            height={60}
            priority
            className="object-contain"
          />
        </div>
        <ToastContainer position="top-right" />
        
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          {/* Header */}
          <div className="px-8 py-6 text-white" style={{ backgroundColor: '#127ACA' }}>
            <h1 className="text-2xl font-bold text-center">Seller Central</h1>
            <p className="text-blue-100 text-center mt-1 text-sm">Sign in to your seller account</p>
          </div>

          {/* Form Content */}
          <div className="px-8 py-6">
            {/* Seller Access Error */}
            {sellerAccessError && (
              <div className="bg-gradient-to-r from-orange-50 to-yellow-50 border-l-4 border-orange-400 rounded-lg p-6 mb-6">
                <div className="flex items-center mb-3">
                  <div className="flex-shrink-0">
                    <svg className="h-6 w-6 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L5.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-lg font-semibold text-orange-800">
                      Seller Account Required
                    </h3>
                  </div>
                </div>
                <div className="ml-9">
                  <p className="text-orange-700 mb-4 leading-relaxed">
                    This login is exclusively for sellers. You need a seller account to access Khalifrex Seller Central and manage your business.
                  </p>
                  <div className="space-y-3">
                    <p className="text-sm text-orange-600 font-medium">Ready to start selling?</p>
                    <Link
                      href="/become-seller"
                      className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-[#127ACA] to-blue-600 text-white font-semibold rounded-lg hover:from-[#0f6aa3] hover:to-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                      Become a Seller
                    </Link>
                    <p className="text-xs text-orange-500 mt-2">
                      Join thousands of successful sellers on fastest-growing marketplace
                    </p>
                  </div>
                </div>
              </div>
            )}

            {error && !sellerAccessError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                <p className="text-red-600 text-sm text-center">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent transition-colors"
                    style={{ '--tw-ring-color': '#127ACA' }}
                    onFocus={(e) => e.target.style.borderColor = '#127ACA'}
                    onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                    placeholder="Enter your email"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent transition-colors"
                    style={{ '--tw-ring-color': '#127ACA' }}
                    onFocus={(e) => e.target.style.borderColor = '#127ACA'}
                    onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 focus:ring-2"
                    style={{ accentColor: '#127ACA', '--tw-ring-color': '#127ACA' }}
                  />
                  <span className="ml-2 text-sm text-gray-600">Remember me</span>
                </label>
                
                <Link
                  href="/forgot-password"
                  className="text-sm hover:underline font-medium"
                  style={{ color: '#127ACA' }}
                >
                  Forgot password?
                </Link>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full text-white py-3 px-4 rounded-lg font-medium hover:opacity-90 focus:ring-4 transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                style={{ 
                  backgroundColor: '#127ACA',
                  '--tw-ring-color': '#127ACA',
                  '--tw-ring-opacity': '0.3'
                }}
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Signing In...
                  </div>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>

            {/* Footer Links */}
            <div className="mt-6 text-center text-sm text-gray-600 space-y-2">
              <p>
                Don&apos;t have a Khalifrex account?{' '}
                <Link
                  href="/signup"
                  className="hover:underline font-medium"
                  style={{ color: '#127ACA' }}
                >
                  Create an account
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}