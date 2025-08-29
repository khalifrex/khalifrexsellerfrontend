import { User, Mail, Phone, MapPin } from 'lucide-react';
import AddressInput from './AddressInput';

export default function PersonalInfoStep({
  formData,
  handleInputChange,
  updateFormData,
  errors,
  countries,
  states,
  addressSuggestions,
  showAddressSuggestions,
  handleAddressInput,
  selectAddress,
  setShowAddressSuggestions
}) {
  const handleAddressSelect = (address) => {
    // Parse the selected address into structured format
    const addressComponents = parseAddress(address.display_name);
    
    // Update the form data with the selected address
    updateFormData('residentialAddress', {
      country: addressComponents.country || formData.userCountry,
      zipCode: addressComponents.zipCode || '',
      addressLine1: addressComponents.addressLine1,
      addressLine2: addressComponents.addressLine2 || '',
      city: addressComponents.city,
      state: addressComponents.state || formData.userState
    });
    
    // Also store the display name for the input field
    updateFormData('userAddress', address.display_name);
    
    // Call the parent's select address function
    selectAddress(address, 'user');
  };

  const parseAddress = (displayName) => {
    // Basic address parsing - you can enhance this based on your needs
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
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Personal Information</h2>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            First Name *
          </label>
          <div className="relative">
            <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleInputChange}
              className={`w-full pl-10 pr-3 py-2.5 border rounded-lg focus:ring-2 focus:border-transparent transition-colors ${
                errors.firstName ? 'border-red-300' : 'border-gray-300'
              }`}
              style={{ '--tw-ring-color': '#0C7FD2' }}
              onFocus={(e) => e.target.style.borderColor = '#0C7FD2'}
              onBlur={(e) => e.target.style.borderColor = errors.firstName ? '#f87171' : '#d1d5db'}
              placeholder="John"
            />
          </div>
          {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Last Name *
          </label>
          <div className="relative">
            <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleInputChange}
              className={`w-full pl-10 pr-3 py-2.5 border rounded-lg focus:ring-2 focus:border-transparent transition-colors ${
                errors.lastName ? 'border-red-300' : 'border-gray-300'
              }`}
              style={{ '--tw-ring-color': '#0C7FD2' }}
              onFocus={(e) => e.target.style.borderColor = '#0C7FD2'}
              onBlur={(e) => e.target.style.borderColor = errors.lastName ? '#f87171' : '#d1d5db'}
              placeholder="Doe"
            />
          </div>
          {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Email Address *
        </label>
        <div className="relative">
          <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            className={`w-full pl-10 pr-3 py-2.5 border rounded-lg focus:ring-2 focus:border-transparent transition-colors ${
              errors.email ? 'border-red-300' : 'border-gray-300'
            }`}
            style={{ '--tw-ring-color': '#0C7FD2' }}
            onFocus={(e) => e.target.style.borderColor = '#0C7FD2'}
            onBlur={(e) => e.target.style.borderColor = errors.email ? '#f87171' : '#d1d5db'}
            placeholder="john@example.com"
          />
        </div>
        {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Phone Number *
        </label>
        <div className="relative">
          <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            className={`w-full pl-10 pr-3 py-2.5 border rounded-lg focus:ring-2 focus:border-transparent transition-colors ${
              errors.phone ? 'border-red-300' : 'border-gray-300'
            }`}
            style={{ '--tw-ring-color': '#0C7FD2' }}
            onFocus={(e) => e.target.style.borderColor = '#0C7FD2'}
            onBlur={(e) => e.target.style.borderColor = errors.phone ? '#f87171' : '#d1d5db'}
            placeholder="+234 800 000 0000"
          />
        </div>
        {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Country of Citizenship *
          </label>
          <select
            name="countryOfCitizenship"
            value={formData.countryOfCitizenship}
            onChange={handleInputChange}
            className={`w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:border-transparent transition-colors ${
              errors.countryOfCitizenship ? 'border-red-300' : 'border-gray-300'
            }`}
            style={{ '--tw-ring-color': '#0C7FD2' }}
            onFocus={(e) => e.target.style.borderColor = '#0C7FD2'}
            onBlur={(e) => e.target.style.borderColor = errors.countryOfCitizenship ? '#f87171' : '#d1d5db'}
          >
            <option value="">Select Country</option>
            {countries.map(country => (
              <option key={country.id} value={country.name}>
                {country.emoji} {country.name}
              </option>
            ))}
          </select>
          {errors.countryOfCitizenship && <p className="text-red-500 text-xs mt-1">{errors.countryOfCitizenship}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Country of Birth *
          </label>
          <select
            name="countryOfBirth"
            value={formData.countryOfBirth}
            onChange={handleInputChange}
            className={`w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:border-transparent transition-colors ${
              errors.countryOfBirth ? 'border-red-300' : 'border-gray-300'
            }`}
            style={{ '--tw-ring-color': '#0C7FD2' }}
            onFocus={(e) => e.target.style.borderColor = '#0C7FD2'}
            onBlur={(e) => e.target.style.borderColor = errors.countryOfBirth ? '#f87171' : '#d1d5db'}
          >
            <option value="">Select Country</option>
            {countries.map(country => (
              <option key={country.id} value={country.name}>
                {country.emoji} {country.name}
              </option>
            ))}
          </select>
          {errors.countryOfBirth && <p className="text-red-500 text-xs mt-1">{errors.countryOfBirth}</p>}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Date of Birth *
        </label>
        <input
          type="date"
          name="dateOfBirth"
          value={formData.dateOfBirth}
          onChange={handleInputChange}
          max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split('T')[0]}
          className={`w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:border-transparent transition-colors ${
            errors.dateOfBirth ? 'border-red-300' : 'border-gray-300'
          }`}
          style={{ '--tw-ring-color': '#0C7FD2' }}
          onFocus={(e) => e.target.style.borderColor = '#0C7FD2'}
          onBlur={(e) => e.target.style.borderColor = errors.dateOfBirth ? '#f87171' : '#d1d5db'}
          required
        />
        {errors.dateOfBirth && <p className="text-red-500 text-xs mt-1">{errors.dateOfBirth}</p>}
      </div>

      <AddressInput
  label="Residential Address"
  addressData={formData.residentialAddress}
  updateAddress={(addressData) => updateFormData('residentialAddress', addressData)}
  errors={errors.residentialAddress}
  suggestions={addressSuggestions}
  showSuggestions={showAddressSuggestions}
  onAddressLineInput={(value) => {
    // Update form data immediately
    updateFormData('userAddress', value);
    // Trigger address search
    handleAddressInput(value, 'user');
  }}
  onSelectSuggestion={(suggestion) => selectAddress(suggestion, 'user')}
  setShowSuggestions={setShowAddressSuggestions}
  countries={countries}
  required={true}
/>
    </div>
  );
}