// components/become-sellerComponents/SecurityStep.js - Updated version
export default function SecurityStep({ formData, onSubmit, loading }) {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Review & Submit</h2>
      
      {/* Registration Summary */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-lg font-medium text-blue-800 mb-3">Registration Summary</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-blue-700"><strong>Name:</strong> {formData.firstName} {formData.lastName}</p>
            <p className="text-blue-700"><strong>Phone:</strong> {formData.phoneNumber}</p>
            <p className="text-blue-700"><strong>Business:</strong> {formData.businessName}</p>
          </div>
          <div>
            <p className="text-blue-700"><strong>Store Name:</strong> {formData.storeName}</p>
            <p className="text-blue-700"><strong>Business Type:</strong> {formData.businessType}</p>
            <p className="text-blue-700"><strong>Subscription:</strong> {formData.subscriptionType === 'professional' ? 'Professional ($15/month)' : 'Free'}</p>
          </div>
        </div>
      </div>

      {/* Documents Summary */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-green-800 mb-2">Documents Uploaded</h4>
        <div className="text-xs text-green-700 space-y-1">
          <p>✅ Government ID ({formData.governmentIdType})</p>
          <p>✅ Proof of Residence ({formData.proofOfResidenceType})</p>
          <p>✅ Selfie with ID</p>
        </div>
      </div>

      {/* Subscription Info */}
      {formData.subscriptionType === 'professional' && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-amber-800 mb-2">Professional Subscription</h4>
          <p className="text-xs text-amber-700 mb-2">
            Your account will be created and then you&apos;ll be redirected to complete payment for professional features.
          </p>
          <ul className="text-xs text-amber-600 space-y-1">
            <li>• Monthly fee: $25.00 USD</li>
            <li>• Payment processed after account creation</li>
            <li>• Features activate after successful payment</li>
          </ul>
        </div>
      )}

      {/* Terms and Conditions */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-gray-800 mb-2">Terms & Conditions</h4>
        <div className="space-y-2">
          <label className="flex items-start">
            <input
              type="checkbox"
              required
              className="mt-1 mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span className="text-xs text-gray-600">
              I agree to the{' '}
              <a href="/terms" target="_blank" className="text-blue-600 hover:underline">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="/privacy" target="_blank" className="text-blue-600 hover:underline">
                Privacy Policy
              </a>
            </span>
          </label>
          
          <label className="flex items-start">
            <input
              type="checkbox"
              required
              className="mt-1 mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span className="text-xs text-gray-600">
              I confirm that all provided information is accurate and I understand that false information may result in account suspension.
            </span>
          </label>

          {formData.subscriptionType === 'professional' && (
            <label className="flex items-start">
              <input
                type="checkbox"
                required
                className="mt-1 mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="text-xs text-gray-600">
                I authorize recurring monthly charges of $15.00 USD for professional subscription features.
              </span>
            </label>
          )}
        </div>
      </div>

      {/* Verification Process Info */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-yellow-800 mb-2">What Happens Next?</h4>
        <ol className="text-xs text-yellow-700 space-y-1 list-decimal list-inside">
          <li>Your seller account will be created immediately</li>
          {formData.subscriptionType === 'professional' && (
            <li>You&apos;ll be redirected to complete subscription payment</li>
          )}
          <li>Our team will review your submitted documents (2-3 business days)</li>
          <li>You&apos;ll receive email notification when verification is complete</li>
          <li>Once verified, you can start listing and selling products</li>
        </ol>
      </div>

      {/* Submit Button */}
      <div className="pt-4">
        <button
          type="submit"
          onClick={onSubmit}
          disabled={loading}
          className="w-full py-3 px-4 text-white rounded-lg font-medium hover:opacity-90 focus:ring-4 transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          style={{ 
            backgroundColor: '#0C7FD2',
            '--tw-ring-color': '#0C7FD2',
            '--tw-ring-opacity': '0.3'
          }}
        >
          {loading ? (
            <div className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Creating Account...
            </div>
          ) : (
            `Create ${formData.subscriptionType === 'professional' ? 'Professional' : 'Free'} Seller Account`
          )}
        </button>
      </div>

      {/* Additional Info */}
      <div className="text-center text-xs text-gray-500 space-y-1">
        <p>By creating an account, you acknowledge that you meet all seller requirements.</p>
        <p>Account creation is free. Professional subscription billing starts after payment completion.</p>
      </div>
    </div>
  );
}