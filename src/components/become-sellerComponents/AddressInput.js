import { MapPin, ChevronDown } from 'lucide-react';

export default function AddressInput({
  label,
  addressData = {},
  updateAddress,
  errors = {},
  suggestions = [],
  showSuggestions = false,
  onAddressLineInput,
  onSelectSuggestion,
  setShowSuggestions,
  countries = [],
  states = [],
  required = false,
  showSameAsResidential = false,
  onSameAsResidential
}) {
  const handleFieldChange = (field, value) => {
    updateAddress({
      ...addressData,
      [field]: value
    });
  };

  const handleSuggestionClick = (suggestion) => {
    const addressComponents = parseAddress(suggestion.display_name);
    updateAddress({
      ...addressData,
      addressLine1: addressComponents.addressLine1,
      city: addressComponents.city,
      state: addressComponents.state,
      country: addressComponents.country,
      zipCode: addressComponents.zipCode || addressData.zipCode || ''
    });
    onSelectSuggestion(suggestion);
    setShowSuggestions(false);
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
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700">
          {label} {required && '*'}
        </label>
        {showSameAsResidential && (
          <button
            type="button"
            onClick={onSameAsResidential}
            className="text-xs text-blue-600 hover:text-blue-800 underline"
          >
            Same as residential
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-3">
        <div>
          <label className="block text-xs text-gray-600 mb-1">Full Name *</label>
          <input
            type="text"
            value={addressData.fullName || ''}
            onChange={(e) => handleFieldChange('fullName', e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:border-transparent transition-colors text-sm ${
              errors.fullName ? 'border-red-300' : 'border-gray-300'
            }`}
            style={{ '--tw-ring-color': '#0C7FD2' }}
            placeholder="Full name"
          />
          {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>}
        </div>

        <div className="relative">
          <label className="block text-xs text-gray-600 mb-1">Address Line 1 *</label>
          <div className="relative">
            <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={addressData.addressLine1 || ''}
              onChange={(e) => {
                handleFieldChange('addressLine1', e.target.value);
                onAddressLineInput(e.target.value);
              }}
              className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:border-transparent transition-colors text-sm ${
                errors.addressLine1 ? 'border-red-300' : 'border-gray-300'
              }`}
              style={{ '--tw-ring-color': '#0C7FD2' }}
              placeholder="Street address, building name"
            />
          </div>
          {errors.addressLine1 && <p className="text-red-500 text-xs mt-1">{errors.addressLine1}</p>}
          
          {/* Address Suggestions */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 focus:bg-gray-50 focus:outline-none"
                >
                  {suggestion.display_name}
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <label className="block text-xs text-gray-600 mb-1">Address Line 2</label>
          <input
            type="text"
            value={addressData.addressLine2 || ''}
            onChange={(e) => handleFieldChange('addressLine2', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent transition-colors text-sm"
            style={{ '--tw-ring-color': '#0C7FD2' }}
            placeholder="Apartment, suite, unit, building, floor, etc."
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-gray-600 mb-1">City *</label>
            <input
              type="text"
              value={addressData.city || ''}
              onChange={(e) => handleFieldChange('city', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:border-transparent transition-colors text-sm ${
                errors.city ? 'border-red-300' : 'border-gray-300'
              }`}
              style={{ '--tw-ring-color': '#0C7FD2' }}
              placeholder="City"
            />
            {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
          </div>

          <div>
            <label className="block text-xs text-gray-600 mb-1">State/Province *</label>
            {states.length > 0 ? (
              <div className="relative">
                <select
                  value={addressData.state || ''}
                  onChange={(e) => handleFieldChange('state', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:border-transparent transition-colors text-sm appearance-none ${
                    errors.state ? 'border-red-300' : 'border-gray-300'
                  }`}
                  style={{ '--tw-ring-color': '#0C7FD2' }}
                >
                  <option value="">Select State</option>
                  {states.map(state => (
                    <option key={state.id} value={state.name}>
                      {state.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-2.5 h-4 w-4 text-gray-400 pointer-events-none" />
              </div>
            ) : (
              <input
                type="text"
                value={addressData.state || ''}
                onChange={(e) => handleFieldChange('state', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:border-transparent transition-colors text-sm ${
                  errors.state ? 'border-red-300' : 'border-gray-300'
                }`}
                style={{ '--tw-ring-color': '#0C7FD2' }}
                placeholder="State/Province"
              />
            )}
            {errors.state && <p className="text-red-500 text-xs mt-1">{errors.state}</p>}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-gray-600 mb-1">Country *</label>
            <div className="relative">
              <select
                value={addressData.country || ''}
                onChange={(e) => handleFieldChange('country', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:border-transparent transition-colors text-sm appearance-none ${
                  errors.country ? 'border-red-300' : 'border-gray-300'
                }`}
                style={{ '--tw-ring-color': '#0C7FD2' }}
              >
                <option value="">Select Country</option>
                {countries.map(country => (
                  <option key={country.countryCode} value={country.name}>
                    {country.emoji} {country.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-2.5 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>
            {errors.country && <p className="text-red-500 text-xs mt-1">{errors.country}</p>}
          </div>

          <div>
            <label className="block text-xs text-gray-600 mb-1">Postal Code</label>
            <input
              type="text"
              value={addressData.zipCode || ''}
              onChange={(e) => handleFieldChange('zipCode', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent transition-colors text-sm"
              style={{ '--tw-ring-color': '#0C7FD2' }}
              placeholder="Postal code"
            />
          </div>
        </div>

      </div>
    </div>
  );
}