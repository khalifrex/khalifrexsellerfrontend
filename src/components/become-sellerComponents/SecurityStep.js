import { useState } from 'react';
import { Eye, EyeOff, Lock } from 'lucide-react';
import Link from 'next/link';
import PasswordRequirements from './PasswordReqirements';

export default function SecurityStep({ formData, handleInputChange, errors, onSubmit, loading }) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const passwordRequirements = {
    length: formData.password.length >= 6,
    lowercase: /[a-z]/.test(formData.password),
    uppercase: /[A-Z]/.test(formData.password),
    number: /\d/.test(formData.password),
    special: /[!@#$%^&*(),.?\":{}|<>]/.test(formData.password)
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Security Setup</h2>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Password *
        </label>
        <div className="relative">
          <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <input
            type={showPassword ? 'text' : 'password'}
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            className={`w-full pl-10 pr-10 py-2.5 border rounded-lg focus:ring-2 focus:border-transparent transition-colors ${
              errors.password ? 'border-red-300' : 'border-gray-300'
            }`}
            style={{ '--tw-ring-color': '#0C7FD2' }}
            onFocus={(e) => e.target.style.borderColor = '#0C7FD2'}
            onBlur={(e) => e.target.style.borderColor = errors.password ? '#f87171' : '#d1d5db'}
            placeholder="Create a strong password"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Confirm Password *
        </label>
        <div className="relative">
          <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <input
            type={showConfirmPassword ? 'text' : 'password'}
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleInputChange}
            className={`w-full pl-10 pr-10 py-2.5 border rounded-lg focus:ring-2 focus:border-transparent transition-colors ${
              errors.confirmPassword ? 'border-red-300' : 'border-gray-300'
            }`}
            style={{ '--tw-ring-color': '#0C7FD2' }}
            onFocus={(e) => e.target.style.borderColor = '#0C7FD2'}
            onBlur={(e) => e.target.style.borderColor = errors.confirmPassword ? '#f87171' : '#d1d5db'}
            placeholder="Confirm your password"
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
          >
            {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
      </div>

      <PasswordRequirements requirements={passwordRequirements} />

      <div className="text-center pt-4 space-y-2 border-t border-gray-200">
        <p className="text-xs text-gray-500">
          By creating an account, you agree to our{' '}
          <Link href="/terms" className="hover:underline" style={{ color: '#0C7FD2' }}>Terms of Service</Link>
          {' '}and{' '}
          <Link href="/privacy" className="hover:underline" style={{ color: '#0C7FD2' }}>Privacy Policy</Link>
        </p>
        <p className="text-sm text-gray-600">
          Already have an account?{' '}
          <Link
            href="/seller/login"
            className="hover:underline font-medium"
            style={{ color: '#0C7FD2' }}
          >
            Sign in here
          </Link>
        </p>
      </div>
    </form>
  );
}