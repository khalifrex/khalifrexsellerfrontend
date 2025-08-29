import AddressInput from './AddressInput';
import { useState, useEffect } from 'react';

export default function BusinessDetailsStep({
  formData,
  handleInputChange,
  updateFormData,
  errors,
  countries,
  businessStates,
  businessAddressSuggestions,
  showBusinessAddressSuggestions,
  handleAddressInput,
  selectAddress,
  setShowBusinessAddressSuggestions
}) {
  const [useSameAddress, setUseSameAddress] = useState(false);

  const handleBusinessAddressSelect = (address) => {
    // Parse the selected address into structured format
    const addressComponents = parseAddress(address.display_name);
    
    // Update the form data with the selected address
    updateFormData('businessAddress', {
      country: addressComponents.country || formData.businessLocation,
      zipCode: addressComponents.zipCode || '',
      addressLine1: addressComponents.addressLine1,
      addressLine2: addressComponents.addressLine2 || '',
      city: addressComponents.city,
      state: addressComponents.state || formData.businessState
    });
    
    // Also store the display name for the input field
    updateFormData('businessAddressDisplay', address.display_name);
    
    // Call the parent's select address function
    selectAddress(address, 'business');
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

  // Handle "Use same as residential address" checkbox
const handleSameAddressChange = (e) => {
  const checked = e.target.checked;
  setUseSameAddress(checked);
  
  if (checked && formData.residentialAddress) {
    // Copy residential address to business address
    updateFormData('businessAddress', formData.residentialAddress);
    updateFormData('businessAddressDisplay', formData.userAddress);
    updateFormData('businessLocation', formData.countryOfCitizenship);
  } else if (!checked) {
    // Clear business address when unchecked
    updateFormData('businessAddress', {
      fullName: '',
      country: '',
      zipCode: '',
      addressLine1: '',
      addressLine2: '',
      city: '',
      state: '',
      phoneNumber: ''
    });
    updateFormData('businessAddressDisplay', '');
  }
};

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Business Details</h2>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Business Location (Country) *
        </label>
        <select
          name="businessLocation"
          value={formData.businessLocation}
          onChange={handleInputChange}
          className={`w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:border-transparent transition-colors ${
            errors.businessLocation ? 'border-red-300' : 'border-gray-300'
          }`}
          style={{ '--tw-ring-color': '#0C7FD2' }}
          onFocus={(e) => e.target.style.borderColor = '#0C7FD2'}
          onBlur={(e) => e.target.style.borderColor = errors.businessLocation ? '#f87171' : '#d1d5db'}
        >
          <option value="">Select Country</option>
          {countries.map(country => (
            <option key={country.id} value={country.name}>
              {country.emoji} {country.name}
            </option>
          ))}
        </select>
        {errors.businessLocation && <p className="text-red-500 text-xs mt-1">{errors.businessLocation}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Business Type *
        </label>
        <div className="flex space-x-4">
          <label className="flex items-center">
            <input
              type="radio"
              name="businessType"
              value="individual"
              checked={formData.businessType === 'individual'}
              onChange={handleInputChange}
              className="mr-2 text-blue-600"
              style={{ accentColor: '#0C7FD2' }}
            />
            Individual
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name="businessType"
              value="company"
              checked={formData.businessType === 'company'}
              onChange={handleInputChange}
              className="mr-2"
              style={{ accentColor: '#0C7FD2' }}
            />
            Company
          </label>
        </div>
        {errors.businessType && <p className="text-red-500 text-xs mt-1">{errors.businessType}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Business Name *
        </label>
        <input
          type="text"
          name="businessName"
          value={formData.businessName}
          onChange={handleInputChange}
          className={`w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:border-transparent transition-colors ${
            errors.businessName ? 'border-red-300' : 'border-gray-300'
          }`}
          style={{ '--tw-ring-color': '#0C7FD2' }}
          onFocus={(e) => e.target.style.borderColor = '#0C7FD2'}
          onBlur={(e) => e.target.style.borderColor = errors.businessName ? '#f87171' : '#d1d5db'}
          placeholder={formData.businessType === 'individual' ? 'Your Business Name' : 'Your Company Name Ltd.'}
        />
        {errors.businessName && <p className="text-red-500 text-xs mt-1">{errors.businessName}</p>}
      </div>

      {formData.businessType === 'company' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Company Registration Number *
          </label>
          <input
            type="text"
            name="companyRegistrationNumber"
            value={formData.companyRegistrationNumber}
            onChange={handleInputChange}
            className={`w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:border-transparent transition-colors ${
              errors.companyRegistrationNumber ? 'border-red-300' : 'border-gray-300'
            }`}
            style={{ '--tw-ring-color': '#0C7FD2' }}
            onFocus={(e) => e.target.style.borderColor = '#0C7FD2'}
            onBlur={(e) => e.target.style.borderColor = errors.companyRegistrationNumber ? '#f87171' : '#d1d5db'}
            placeholder="RC123456 or EIN"
          />
          {errors.companyRegistrationNumber && <p className="text-red-500 text-xs mt-1">{errors.companyRegistrationNumber}</p>}
        </div>
      )}

      {/* Same address checkbox */}
      {formData.residentialAddress?.addressLine1 && (
  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
    <label className="flex items-center space-x-2">
      <input
        type="checkbox"
        checked={useSameAddress}
        onChange={handleSameAddressChange}
        className="rounded"
        style={{ accentColor: '#0C7FD2' }}
      />
      <span className="text-sm text-blue-800">
        Business address is same as residential address
      </span>
    </label>
    {useSameAddress && (
      <p className="text-xs text-blue-600 mt-1">
        Using: {formData.residentialAddress.fullName}, {formData.residentialAddress.addressLine1}, {formData.residentialAddress.city}
      </p>
    )}
  </div>
)}

      {/* Business Address Input - only show if not using same address */}
{!useSameAddress && (
  <AddressInput
    label="Business Address"
    addressData={formData.businessAddress}
    updateAddress={(addressData) => updateFormData('businessAddress', addressData)}
    errors={errors.businessAddress}
    suggestions={businessAddressSuggestions}
    showSuggestions={showBusinessAddressSuggestions}
    onAddressLineInput={(value) => {
      // Update form data immediately
      updateFormData('businessAddressDisplay', value);
      // Trigger address search
      handleAddressInput(value, 'business');
    }}
    onSelectSuggestion={(suggestion) => selectAddress(suggestion, 'business')}
    setShowSuggestions={setShowBusinessAddressSuggestions}
    countries={countries}
    required={true}
  />
)}

      {/* Shipping Countries */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Countries you can ship to *
        </label>
        <div className="border rounded-lg p-4 bg-gray-50 max-h-40 overflow-y-auto">
          <div className="grid grid-cols-2 gap-2">
            {countries.slice(0, 250).map(country => (
              <label key={country.id} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  value={country.name}
                  checked={formData.shippingCountries?.includes(country.name) || false}
                  onChange={(e) => {
                    const currentShipping = formData.shippingCountries || [];
                    if (e.target.checked) {
                      updateFormData('shippingCountries', [...currentShipping, country.name]);
                    } else {
                      updateFormData('shippingCountries', currentShipping.filter(c => c !== country.name));
                    }
                  }}
                  className="rounded text-sm"
                  style={{ accentColor: '#0C7FD2' }}
                />
                <span className="text-sm">{country.emoji} {country.name}</span>
              </label>
            ))}
          </div>
          <div className="mt-2">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.shippingCountries?.length === countries.length}
                onChange={(e) => {
                  if (e.target.checked) {
                    updateFormData('shippingCountries', countries.map(c => c.name));
                  } else {
                    updateFormData('shippingCountries', []);
                  }
                }}
                className="rounded text-sm font-medium"
                style={{ accentColor: '#0C7FD2' }}
              />
              <span className="text-sm font-medium text-blue-600">Select All Countries</span>
            </label>
          </div>
        </div>
        {errors.shippingCountries && <p className="text-red-500 text-xs mt-1">{errors.shippingCountries}</p>}
      </div>
    </div>
  );
}