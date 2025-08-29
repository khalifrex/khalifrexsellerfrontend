import AddressInput from "./AddressInput";

export default function BankingInfoStep({ 
  formData, 
  handleInputChange, 
  updateFormData,
  errors,
  countries,
  billingAddressSuggestions,
  showBillingAddressSuggestions,
  handleAddressInput,
  selectAddress,
  setShowBillingAddressSuggestions
}) {
  
  // Handle card number formatting
  const handleCardNumberChange = (e) => {
    let value = e.target.value.replace(/\D/g, ''); // Remove non-digits
    value = value.substring(0, 16); // Limit to 16 digits
    value = value.replace(/(\d{4})(?=\d)/g, '$1 '); // Add spaces every 4 digits
    updateFormData('cardNumber', value);
  };

  // Handle CVV formatting
  const handleCvvChange = (e) => {
    let value = e.target.value.replace(/\D/g, ''); // Remove non-digits
    value = value.substring(0, 4); // Limit to 4 digits
    updateFormData('cvv', value);
  };

  // Check if professional subscription is selected
  const isProfessional = formData.subscriptionType === 'professional';

  const handleBillingAddressSelect = (address) => {
    // Parse the selected address into structured format
    const addressComponents = parseAddress(address.display_name);
    
    // Update the form data with the selected billing address
    updateFormData('billingAddress', {
      country: addressComponents.country,
      zipCode: addressComponents.zipCode || '',
      addressLine1: addressComponents.addressLine1,
      addressLine2: addressComponents.addressLine2 || '',
      city: addressComponents.city,
      state: addressComponents.state
    });
    
    // Also store the display name for the input field
    updateFormData('billingAddressDisplay', address.display_name);
    
    // Call the parent's select address function
    selectAddress(address, 'billing');
  };

  const parseAddress = (displayName) => {
    // Basic address parsing
    const parts = displayName.split(', ');
    return {
      addressLine1: parts[0] || '',
      city: parts.length > 2 ? parts[parts.length - 3] : '',
      state: parts.length > 1 ? parts[parts.length - 2] : '',
      country: parts.length > 0 ? parts[parts.length - 1] : ''
    };
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Banking & Payment Information</h2>
      
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <p className="text-sm text-blue-800">
          <strong>Important:</strong> Banking information is required for payouts. Card information is only required for Professional subscription.
        </p>
      </div>

      {/* Banking Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-800 border-b pb-2">Banking Details</h3>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Bank Name *
          </label>
          <input
            type="text"
            name="bankName"
            value={formData.bankName}
            onChange={handleInputChange}
            className={`w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:border-transparent transition-colors ${
              errors.bankName ? 'border-red-300' : 'border-gray-300'
            }`}
            style={{ '--tw-ring-color': '#0C7FD2' }}
            onFocus={(e) => e.target.style.borderColor = '#0C7FD2'}
            onBlur={(e) => e.target.style.borderColor = errors.bankName ? '#f87171' : '#d1d5db'}
            placeholder="e.g., First Bank of Nigeria, GTBank, Access Bank"
          />
          {errors.bankName && <p className="text-red-500 text-xs mt-1">{errors.bankName}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Account Number *
          </label>
          <input
            type="text"
            name="accountNumber"
            value={formData.accountNumber}
            onChange={handleInputChange}
            className={`w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:border-transparent transition-colors ${
              errors.accountNumber ? 'border-red-300' : 'border-gray-300'
            }`}
            style={{ '--tw-ring-color': '#0C7FD2' }}
            onFocus={(e) => e.target.style.borderColor = '#0C7FD2'}
            onBlur={(e) => e.target.style.borderColor = errors.accountNumber ? '#f87171' : '#d1d5db'}
            placeholder="1234567890"
            maxLength="20"
          />
          {errors.accountNumber && <p className="text-red-500 text-xs mt-1">{errors.accountNumber}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Account Holder Name *
          </label>
          <input
            type="text"
            name="accountHolderName"
            value={formData.accountHolderName}
            onChange={handleInputChange}
            className={`w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:border-transparent transition-colors ${
              errors.accountHolderName ? 'border-red-300' : 'border-gray-300'
            }`}
            style={{ '--tw-ring-color': '#0C7FD2' }}
            onFocus={(e) => e.target.style.borderColor = '#0C7FD2'}
            onBlur={(e) => e.target.style.borderColor = errors.accountHolderName ? '#f87171' : '#d1d5db'}
            placeholder="John Doe (as it appears on your bank account)"
          />
          {errors.accountHolderName && <p className="text-red-500 text-xs mt-1">{errors.accountHolderName}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Routing Number (Optional)
          </label>
          <input
            type="text"
            name="routingNumber"
            value={formData.routingNumber || ''}
            onChange={handleInputChange}
            className={`w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:border-transparent transition-colors ${
              errors.routingNumber ? 'border-red-300' : 'border-gray-300'
            }`}
            style={{ '--tw-ring-color': '#0C7FD2' }}
            onFocus={(e) => e.target.style.borderColor = '#0C7FD2'}
            onBlur={(e) => e.target.style.borderColor = errors.routingNumber ? '#f87171' : '#d1d5db'}
            placeholder="For international transfers (if applicable)"
          />
          {errors.routingNumber && <p className="text-red-500 text-xs mt-1">{errors.routingNumber}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Bank Country *
          </label>
          <select
            name="bankCountry"
            value={formData.bankCountry}
            onChange={handleInputChange}
            className={`w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:border-transparent transition-colors ${
              errors.bankCountry ? 'border-red-300' : 'border-gray-300'
            }`}
            style={{ '--tw-ring-color': '#0C7FD2' }}
            onFocus={(e) => e.target.style.borderColor = '#0C7FD2'}
            onBlur={(e) => e.target.style.borderColor = errors.bankCountry ? '#f87171' : '#d1d5db'}
          >
            <option value="">Select Bank Country</option>
            {countries.map(country => (
              <option key={country.id} value={country.name}>
                {country.emoji} {country.name}
              </option>
            ))}
          </select>
          {errors.bankCountry && <p className="text-red-500 text-xs mt-1">{errors.bankCountry}</p>}
        </div>
      </div>

      {/* Subscription Card Information - Only show for Professional */}
      {isProfessional && (
        <div className="space-y-4 border-t pt-6">
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
            <h3 className="text-lg font-medium text-amber-800 border-b border-amber-200 pb-2 mb-2">
              Professional Subscription Payment
            </h3>
            <p className="text-sm text-amber-700">
              <strong>Required:</strong> Professional subscription requires payment method information.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Card Number *
              </label>
              <input
                type="text"
                name="cardNumber"
                value={formData.cardNumber || ''}
                onChange={handleCardNumberChange}
                className={`w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:border-transparent transition-colors ${
                  errors.cardNumber ? 'border-red-300' : 'border-gray-300'
                }`}
                style={{ '--tw-ring-color': '#0C7FD2' }}
                onFocus={(e) => e.target.style.borderColor = '#0C7FD2'}
                onBlur={(e) => e.target.style.borderColor = errors.cardNumber ? '#f87171' : '#d1d5db'}
                placeholder="1234 5678 9012 3456"
              />
              {errors.cardNumber && <p className="text-red-500 text-xs mt-1">{errors.cardNumber}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Card Holder Name *
              </label>
              <input
                type="text"
                name="cardHolderName"
                value={formData.cardHolderName || ''}
                onChange={handleInputChange}
                className={`w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:border-transparent transition-colors ${
                  errors.cardHolderName ? 'border-red-300' : 'border-gray-300'
                }`}
                style={{ '--tw-ring-color': '#0C7FD2' }}
                onFocus={(e) => e.target.style.borderColor = '#0C7FD2'}
                onBlur={(e) => e.target.style.borderColor = errors.cardHolderName ? '#f87171' : '#d1d5db'}
                placeholder="John Doe"
              />
              {errors.cardHolderName && <p className="text-red-500 text-xs mt-1">{errors.cardHolderName}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Expiry Month *
              </label>
              <select
                name="expiresOn"
                value={formData.expiresOn || ''}
                onChange={handleInputChange}
                className={`w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:border-transparent transition-colors ${
                  errors.expiresOn ? 'border-red-300' : 'border-gray-300'
                }`}
                style={{ '--tw-ring-color': '#0C7FD2' }}
                onFocus={(e) => e.target.style.borderColor = '#0C7FD2'}
                onBlur={(e) => e.target.style.borderColor = errors.expiresOn ? '#f87171' : '#d1d5db'}
              >
                <option value="">Select Month</option>
                {Array.from({length: 12}, (_, i) => i + 1).map(month => (
                  <option key={month} value={month.toString().padStart(2, '0')}>
                    {month.toString().padStart(2, '0')}
                  </option>
                ))}
              </select>
              {errors.expiresOn && <p className="text-red-500 text-xs mt-1">{errors.expiresOn}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Expiry Year *
              </label>
              <select
                name="year"
                value={formData.year || ''}
                onChange={handleInputChange}
                className={`w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:border-transparent transition-colors ${
                  errors.year ? 'border-red-300' : 'border-gray-300'
                }`}
                style={{ '--tw-ring-color': '#0C7FD2' }}
                onFocus={(e) => e.target.style.borderColor = '#0C7FD2'}
                onBlur={(e) => e.target.style.borderColor = errors.year ? '#f87171' : '#d1d5db'}
              >
                <option value="">Select Year</option>
                {Array.from({length: 20}, (_, i) => new Date().getFullYear() + i).map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
              {errors.year && <p className="text-red-500 text-xs mt-1">{errors.year}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                CVV *
              </label>
              <input
                type="text"
                name="cvv"
                value={formData.cvv || ''}
                onChange={handleCvvChange}
                className={`w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:border-transparent transition-colors ${
                  errors.cvv ? 'border-red-300' : 'border-gray-300'
                }`}
                style={{ '--tw-ring-color': '#0C7FD2' }}
                onFocus={(e) => e.target.style.borderColor = '#0C7FD2'}
                onBlur={(e) => e.target.style.borderColor = errors.cvv ? '#f87171' : '#d1d5db'}
                placeholder="123"
              />
              {errors.cvv && <p className="text-red-500 text-xs mt-1">{errors.cvv}</p>}
            </div>
          </div>

          {/* Billing Address for Professional Subscription */}
  <div className="mt-6">
  <AddressInput
    label="Billing Address"
    addressData={formData.billingAddress}
    updateAddress={(addressData) => updateFormData('billingAddress', addressData)}
    errors={errors.billingAddress}
    suggestions={billingAddressSuggestions}
    showSuggestions={showBillingAddressSuggestions}
    onAddressLineInput={(value) => {
      // Update form data immediately
      updateFormData('billingAddressDisplay', value);
      // Trigger address search
      handleAddressInput(value, 'billing');
    }}
    onSelectSuggestion={(suggestion) => selectAddress(suggestion, 'billing')}
    setShowSuggestions={setShowBillingAddressSuggestions}
    countries={countries}
    required={true}
  />
</div>
        </div>
      )}

      {/* Free subscription note */}
      {!isProfessional && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-sm text-green-700">
            <strong>Free Plan Selected:</strong> No payment information required. You can upgrade to Professional later from your dashboard.
          </p>
        </div>
      )}

      {/* Payout Method Selection */}
      <div className="border-t pt-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Preferred Payout Method *
        </label>
        <div className="space-y-3">
          <div className="border rounded-lg p-4 bg-green-50 border-green-200">
            <label className="flex items-start">
              <input
                type="radio"
                name="payoutMethod"
                value="paystack"
                checked={formData.payoutMethod === 'paystack'}
                onChange={handleInputChange}
                className="mt-1 mr-3"
                style={{ accentColor: '#10b981' }}
              />
              <div>
                <div className="font-medium text-green-800">Paystack</div>
                <div className="text-sm text-green-600">Local Nigerian bank transfers</div>
                <div className="text-xs text-green-500 mt-1">
                  • Faster payouts to Nigerian banks<br />
                  • Lower fees for local transfers<br />
                  • Recommended for Nigerian sellers
                </div>
              </div>
            </label>
          </div>

          <div className="border rounded-lg p-4 bg-blue-50 border-blue-200">
            <label className="flex items-start">
              <input
                type="radio"
                name="payoutMethod"
                value="payoneer"
                checked={formData.payoutMethod === 'payoneer'}
                onChange={handleInputChange}
                className="mt-1 mr-3"
                style={{ accentColor: '#0C7FD2' }}
              />
              <div>
                <div className="font-medium" style={{ color: '#0C7FD2' }}>Payoneer</div>
                <div className="text-sm" style={{ color: '#0C7FD2', opacity: 0.8 }}>International transfers</div>
                <div className="text-xs mt-1" style={{ color: '#0C7FD2', opacity: 0.7 }}>
                  • Global payout options<br />
                  • Multi-currency support<br />
                  • Good for international sellers
                </div>
              </div>
            </label>
          </div>
        </div>
        {errors.payoutMethod && <p className="text-red-500 text-xs mt-1">{errors.payoutMethod}</p>}
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-yellow-800 mb-2">Security Note:</h4>
        <ul className="text-xs text-yellow-700 space-y-1">
          <li>• Your financial information is encrypted and stored securely</li>
          <li>• We never store your full card details in plain text</li>
          <li>• Account verification may be required before first payout</li>
          <li>• Ensure account name matches your registered business/personal name</li>
        </ul>
      </div>
    </div>
  );
}