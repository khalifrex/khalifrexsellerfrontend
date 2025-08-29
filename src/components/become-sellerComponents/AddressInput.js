import { MapPin, User, Phone } from 'lucide-react';

export default function AddressInput({
  label,
  addressData,
  updateAddress,
  errors,
  suggestions,
  showSuggestions,
  onAddressLineInput,
  onSelectSuggestion,
  setShowSuggestions,
  countries,
  required = true
}) {

  const handleFieldChange = (field, value) => {
    updateAddress({
      ...addressData,
      [field]: value
    });
  };

  const handleAddressLineChange = (value) => {
    handleFieldChange('addressLine1', value);
    onAddressLineInput(value);
  };

  const handleSuggestionSelect = (suggestion) => {
    const addressComponents = parseAddressFromSuggestion(suggestion);
    
    // Update the entire address object with parsed components
    updateAddress({
      ...addressData,
      ...addressComponents
    });
    
    onSelectSuggestion(suggestion);
    setShowSuggestions(false);
  };

  const parseAddressFromSuggestion = (suggestion) => {
    const parts = suggestion.display_name.split(', ');
    
    let addressLine1 = '';
    let city = '';
    let state = '';
    let country = '';
    let zipCode = '';

    if (parts.length >= 1) {
      addressLine1 = parts[0];
    }

    if (parts.length >= 2) {
      country = parts[parts.length - 1];
      
      if (parts.length >= 3) {
        const secondToLast = parts[parts.length - 2];
        const hasPostalCode = /\d{5,6}/.test(secondToLast);
        
        if (hasPostalCode) {
          const postalMatch = secondToLast.match(/\d{5,6}/);
          if (postalMatch) {
            zipCode = postalMatch[0];
          }
          if (parts.length >= 4) {
            state = parts[parts.length - 3];
            if (parts.length >= 5) {
              city = parts[parts.length - 4];
            }
          }
        } else {
          state = secondToLast;
          if (parts.length >= 4) {
            city = parts[parts.length - 3];
          }
        }
      }
    }

    if (!city && parts.length > 3) {
      city = parts[1] || parts[2];
    }

    const cleanValue = (str) => str ? str.trim().replace(/^\d+\s*/, '') : '';
    
    return {
      addressLine1: addressLine1 || '',
      city: cleanValue(city) || '',
      state: cleanValue(state) || '',
      country: cleanValue(country) || '',
      zipCode: zipCode || ''
    };
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-800 border-b pb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </h3>
      
      {/* Full Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Full Name {required && <span className="text-red-500">*</span>}
        </label>
        <div className="relative">
          <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={addressData.fullName || ''}
            onChange={(e) => handleFieldChange('fullName', e.target.value)}
            className={`w-full pl-10 pr-3 py-2.5 border rounded-lg focus:ring-2 focus:border-transparent transition-colors ${
              errors?.fullName ? 'border-red-300' : 'border-gray-300'
            }`}
            style={{ '--tw-ring-color': '#3b82f6' }}
            onFocus={(e) => !errors?.fullName && (e.target.style.borderColor = '#3b82f6')}
            onBlur={(e) => e.target.style.borderColor = errors?.fullName ? '#f87171' : '#d1d5db'}
            placeholder="John Doe"
          />
        </div>
        {errors?.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>}
      </div>

      {/* Address Line 1 with suggestions */}
      <div className="relative">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Address Line 1 {required && <span className="text-red-500">*</span>}
        </label>
        <div className="relative">
          <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={addressData.addressLine1 || ''}
            onChange={(e) => handleAddressLineChange(e.target.value)}
            className={`w-full pl-10 pr-3 py-2.5 border rounded-lg focus:ring-2 focus:border-transparent transition-colors ${
              errors?.addressLine1 ? 'border-red-300' : 'border-gray-300'
            }`}
            style={{ '--tw-ring-color': '#3b82f6' }}
            onFocus={(e) => {
              if (!errors?.addressLine1) e.target.style.borderColor = '#3b82f6';
              if (suggestions.length > 0) setShowSuggestions(true);
            }}
            onBlur={(e) => {
              e.target.style.borderColor = errors?.addressLine1 ? '#f87171' : '#d1d5db';
              setTimeout(() => setShowSuggestions(false), 200);
            }}
            placeholder="123 Main Street"
            autoComplete="address-line1"
          />
          
          {/* Loading indicator */}
          {showSuggestions && suggestions.length === 0 && addressData.addressLine1?.length > 2 && (
            <div className="absolute right-3 top-3">
              <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
            </div>
          )}
        </div>
        
        {/* Address suggestions dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute z-50 w-full bg-white border border-gray-300 rounded-lg mt-1 max-h-48 overflow-y-auto shadow-lg">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                type="button"
                onClick={() => handleSuggestionSelect(suggestion)}
                className="w-full text-left px-3 py-2 hover:bg-blue-50 focus:bg-blue-50 text-sm border-b last:border-b-0 focus:outline-none transition-colors"
                onMouseDown={(e) => e.preventDefault()}
              >
                <div className="flex items-start gap-2">
                  <MapPin className="h-3 w-3 text-gray-400 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-900">{suggestion.display_name}</span>
                </div>
              </button>
            ))}
          </div>
        )}
        
        {errors?.addressLine1 && <p className="text-red-500 text-xs mt-1">{errors.addressLine1}</p>}
      </div>

      {/* Address Line 2 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Address Line 2 <span className="text-gray-400">(Optional)</span>
        </label>
        <div className="relative">
          <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={addressData.addressLine2 || ''}
            onChange={(e) => handleFieldChange('addressLine2', e.target.value)}
            className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent transition-colors"
            style={{ '--tw-ring-color': '#3b82f6' }}
            onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
            onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
            placeholder="Apartment, suite, unit, etc."
            autoComplete="address-line2"
          />
        </div>
      </div>

      {/* City and State */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            City {required && <span className="text-red-500">*</span>}
          </label>
          <input
            type="text"
            value={addressData.city || ''}
            onChange={(e) => handleFieldChange('city', e.target.value)}
            className={`w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:border-transparent transition-colors ${
              errors?.city ? 'border-red-300' : 'border-gray-300'
            }`}
            style={{ '--tw-ring-color': '#3b82f6' }}
            onFocus={(e) => !errors?.city && (e.target.style.borderColor = '#3b82f6')}
            onBlur={(e) => e.target.style.borderColor = errors?.city ? '#f87171' : '#d1d5db'}
            placeholder="Lagos"
            autoComplete="address-level2"
          />
          {errors?.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            State/Province {required && <span className="text-red-500">*</span>}
          </label>
          <input
            type="text"
            value={addressData.state || ''}
            onChange={(e) => handleFieldChange('state', e.target.value)}
            className={`w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:border-transparent transition-colors ${
              errors?.state ? 'border-red-300' : 'border-gray-300'
            }`}
            style={{ '--tw-ring-color': '#3b82f6' }}
            onFocus={(e) => !errors?.state && (e.target.style.borderColor = '#3b82f6')}
            onBlur={(e) => e.target.style.borderColor = errors?.state ? '#f87171' : '#d1d5db'}
            placeholder="Lagos State"
            autoComplete="address-level1"
          />
          {errors?.state && <p className="text-red-500 text-xs mt-1">{errors.state}</p>}
        </div>
      </div>

      {/* Zip Code and Country */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            ZIP/Postal Code <span className="text-gray-400">(Optional)</span>
          </label>
          <input
            type="text"
            value={addressData.zipCode || ''}
            onChange={(e) => handleFieldChange('zipCode', e.target.value)}
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent transition-colors"
            style={{ '--tw-ring-color': '#3b82f6' }}
            onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
            onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
            placeholder="100001"
            autoComplete="postal-code"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Country {required && <span className="text-red-500">*</span>}
          </label>
          <select
            value={addressData.country || ''}
            onChange={(e) => handleFieldChange('country', e.target.value)}
            className={`w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:border-transparent transition-colors ${
              errors?.country ? 'border-red-300' : 'border-gray-300'
            }`}
            style={{ '--tw-ring-color': '#3b82f6' }}
            onFocus={(e) => !errors?.country && (e.target.style.borderColor = '#3b82f6')}
            onBlur={(e) => e.target.style.borderColor = errors?.country ? '#f87171' : '#d1d5db'}
            autoComplete="country"
          >
            <option value="">Select Country</option>
            {countries?.map(country => (
              <option key={country.id} value={country.name}>
                {country.emoji} {country.name}
              </option>
            ))}
          </select>
          {errors?.country && <p className="text-red-500 text-xs mt-1">{errors.country}</p>}
        </div>
      </div>

      {/* Phone Number */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Phone Number {required && <span className="text-red-500">*</span>}
        </label>
        <div className="relative">
          <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <input
            type="tel"
            value={addressData.phoneNumber || ''}
            onChange={(e) => handleFieldChange('phoneNumber', e.target.value)}
            className={`w-full pl-10 pr-3 py-2.5 border rounded-lg focus:ring-2 focus:border-transparent transition-colors ${
              errors?.phoneNumber ? 'border-red-300' : 'border-gray-300'
            }`}
            style={{ '--tw-ring-color': '#3b82f6' }}
            onFocus={(e) => !errors?.phoneNumber && (e.target.style.borderColor = '#3b82f6')}
            onBlur={(e) => e.target.style.borderColor = errors?.phoneNumber ? '#f87171' : '#d1d5db'}
            placeholder="+234 800 000 0000"
            autoComplete="tel"
          />
        </div>
        {errors?.phoneNumber && <p className="text-red-500 text-xs mt-1">{errors.phoneNumber}</p>}
      </div>
    </div>
  );
}