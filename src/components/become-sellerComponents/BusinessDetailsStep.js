import AddressInput from "./AddressInput";

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

  const handleBusinessAddressSelect = (address) => {
    const addressComponents = parseAddress(address.display_name);
    
    updateFormData('businessAddress', {
      fullName: formData.businessAddress?.fullName || formData.businessName,
      country: addressComponents.country,
      zipCode: addressComponents.zipCode || '',
      addressLine1: addressComponents.addressLine1,
      addressLine2: addressComponents.addressLine2 || '',
      city: addressComponents.city,
      state: addressComponents.state,
      phoneNumber: formData.businessAddress?.phoneNumber || formData.phoneNumber
    });
    
    updateFormData('businessAddressDisplay', address.display_name);
    selectAddress(address, 'business');
  };

  const parseAddress = (displayName) => {
    const parts = displayName.split(', ');
    return {
      addressLine1: parts[0] || '',
      city: parts.length > 2 ? parts[parts.length - 3] : '',
      state: parts.length > 1 ? parts[parts.length - 2] : '',
      country: parts.length > 0 ? parts[parts.length - 1] : ''
    };
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Business Details</h2>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Business Type *
        </label>
        <select
          name="businessType"
          value={formData.businessType}
          onChange={handleInputChange}
          className={`w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:border-transparent transition-colors ${
            errors.businessType ? 'border-red-300' : 'border-gray-300'
          }`}
          style={{ '--tw-ring-color': '#0C7FD2' }}
        >
          <option value="">Select Business Type</option>
          <option value="individual bussiness">Individual Business</option>
          <option value="company bussinesss">Company Business</option>
          <option value="state-owned business">State-owned Business</option>
        </select>
        {errors.businessType && <p className="text-red-500 text-xs mt-1">{errors.businessType}</p>}
      </div>

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
        >
          <option value="">Select Business Country</option>
          {countries.map(country => (
            <option key={country.countryCode} value={country.name}>
              {country.emoji} {country.name}
            </option>
          ))}
        </select>
        {errors.businessLocation && <p className="text-red-500 text-xs mt-1">{errors.businessLocation}</p>}
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
          placeholder="e.g., Acme Electronics Ltd"
        />
        {errors.businessName && <p className="text-red-500 text-xs mt-1">{errors.businessName}</p>}
      </div>

      {(formData.businessType === 'company bussinesss' || formData.businessType === 'state-owned business') && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Company Registration Number
          </label>
          <input
            type="text"
            name="companyRegistrationNumber"
            value={formData.companyRegistrationNumber || ''}
            onChange={handleInputChange}
            className={`w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:border-transparent transition-colors ${
              errors.companyRegistrationNumber ? 'border-red-300' : 'border-gray-300'
            }`}
            style={{ '--tw-ring-color': '#0C7FD2' }}
            placeholder="Enter registration number"
          />
          {errors.companyRegistrationNumber && <p className="text-red-500 text-xs mt-1">{errors.companyRegistrationNumber}</p>}
        </div>
      )}

      <AddressInput
        label="Business Address"
        addressData={formData.businessAddress}
        updateAddress={(addressData) => updateFormData('businessAddress', addressData)}
        errors={errors.businessAddress}
        suggestions={businessAddressSuggestions}
        showSuggestions={showBusinessAddressSuggestions}
        onAddressLineInput={(value) => {
          updateFormData('businessAddressDisplay', value);
          handleAddressInput(value, 'business');
        }}
        onSelectSuggestion={(suggestion) => selectAddress(suggestion, 'business')}
        setShowSuggestions={setShowBusinessAddressSuggestions}
        countries={countries}
        states={businessStates}
        required={true}
        showSameAsResidential={true}
        onSameAsResidential={() => {
          updateFormData('businessAddress', { ...formData.residentialAddress });
        }}
      />

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-blue-800 mb-2">Business Information</h4>
        <ul className="text-xs text-blue-700 space-y-1">
          <li>• Ensure your business information matches your official documents</li>
          <li>• Registration number is required for company and state-owned businesses</li>
          <li>• Business address will be used for official correspondence</li>
        </ul>
      </div>
    </div>
  );
}