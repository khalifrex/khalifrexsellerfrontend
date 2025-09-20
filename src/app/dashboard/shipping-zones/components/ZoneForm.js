import { useState, useEffect } from 'react';
import { DollarSign } from 'lucide-react';
import { ZONE_TYPES } from './ZoneTypes';

const ZoneTypeFields = ({ data, updateFn, isEdit, countries, states, currencies }) => {
  const { zoneType } = data;

  if (zoneType === 'worldwide') {
    return null;
  }

  const fields = [];

  // Get states for selected country
  const countryStates = states.filter(state => 
    state.country_code === data.countryCode
  );

  // Handle country change
  const handleCountryChange = (selectedCountryCode) => {
    const selectedCountry = countries.find(country => country.countryCode === selectedCountryCode);
    if (selectedCountry) {
      updateFn('countryCode', selectedCountryCode);
      updateFn('country', selectedCountry.name);
      // Reset state, city, etc. when country changes
      updateFn('state', '');
      updateFn('stateCode', '');
      updateFn('city', '');
      updateFn('postcode', '');
      updateFn('street', '');
    }
  };

  // Handle state change
  const handleStateChange = (selectedStateCode) => {
    console.log('State change triggered:', selectedStateCode);
    console.log('Available country states:', countryStates);
    
    const selectedState = countryStates.find(state => state.state_code === selectedStateCode);
    console.log('Found state:', selectedState);
    
    if (selectedState) {
      updateFn('stateCode', selectedStateCode);
      updateFn('state', selectedState.name);
      // Reset dependent fields when state changes
      updateFn('city', '');
      updateFn('postcode', '');
      updateFn('street', '');
    }
  };

  // Country fields (required for all non-worldwide types)
  if (zoneType !== 'worldwide') {
    fields.push(
      <div key="country" className="grid grid-cols-1 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Country *</label>
          <select
            value={data.countryCode}
            onChange={(e) => handleCountryChange(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isEdit}
          >
            <option value="">Select a country</option>
            {countries.map((country) => (
              <option key={country.countryCode} value={country.countryCode}>
                {country.emoji} {country.name}
              </option>
            ))}
          </select>
          {isEdit && (
            <p className="text-xs text-gray-500 mt-1">Country cannot be changed after creation</p>
          )}
        </div>
      </div>
    );
  }

  // State fields
  if (['state', 'city', 'postcode', 'street'].includes(zoneType)) {
    fields.push(
      <div key="state" className="grid grid-cols-1 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">State/Region *</label>
          <select
            value={data.stateCode}
            onChange={(e) => handleStateChange(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isEdit || !data.countryCode}
          >
            <option value="">Select a state</option>
            {countryStates.map((state) => (
              <option key={state.state_code} value={state.state_code}>
                {state.name}
              </option>
            ))}
          </select>
          {!data.countryCode && (
            <p className="text-xs text-gray-500 mt-1">Please select a country first</p>
          )}
          {isEdit && (
            <p className="text-xs text-gray-500 mt-1">State cannot be changed after creation</p>
          )}
        </div>
      </div>
    );
  }

  // City field
  if (['city', 'postcode', 'street'].includes(zoneType)) {
    fields.push(
      <div key="city">
        <label className="block text-sm font-medium text-gray-700 mb-2">City *</label>
        <input
          type="text"
          value={data.city}
          onChange={(e) => updateFn('city', e.target.value)}
          className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Enter city name"
          disabled={isEdit}
        />
        {isEdit && (
          <p className="text-xs text-gray-500 mt-1">City cannot be changed after creation</p>
        )}
      </div>
    );
  }

  // Postcode field
  if (['postcode', 'street'].includes(zoneType)) {
    fields.push(
      <div key="postcode">
        <label className="block text-sm font-medium text-gray-700 mb-2">Postcode *</label>
        <input
          type="text"
          value={data.postcode}
          onChange={(e) => updateFn('postcode', e.target.value)}
          className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Enter postcode"
          disabled={isEdit}
        />
        {isEdit && (
          <p className="text-xs text-gray-500 mt-1">Postcode cannot be changed after creation</p>
        )}
      </div>
    );
  }

  // Street field
  if (zoneType === 'street') {
    fields.push(
      <div key="street">
        <label className="block text-sm font-medium text-gray-700 mb-2">Street *</label>
        <input
          type="text"
          value={data.street}
          onChange={(e) => updateFn('street', e.target.value)}
          className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Enter street name"
          disabled={isEdit}
        />
        {isEdit && (
          <p className="text-xs text-gray-500 mt-1">Street cannot be changed after creation</p>
        )}
      </div>
    );
  }

  return fields;
};

const ZoneForm = ({ data, updateFn, isEdit = false }) => {
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [currencies, setCurrencies] = useState([]);
  const [loading, setLoading] = useState(true);

  const API_BASE_URL = 'http://localhost:3092/location';

  // Fetch data from APIs
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch countries
        const countriesResponse = await fetch(`${API_BASE_URL}/countries`);
        const countriesData = await countriesResponse.json();
        
        // Fetch states
        const statesResponse = await fetch(`${API_BASE_URL}/states`, {
          credentials: 'include'
        });
        const statesData = await statesResponse.json();
        
        // Fetch currencies
        const currenciesResponse = await fetch(`http://localhost:3092/preferences/currencies`);
        const currenciesData = await currenciesResponse.json();

        if (countriesData.success) {
          setCountries(countriesData.countries || []);
        }
        
        if (statesData.success) {
          setStates(statesData.states || []);
        }
        
        if (currenciesData.success) {
          setCurrencies(currenciesData.currencies || []);
        }
        
      } catch (error) {
        console.error('Error fetching location data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading form data...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Zone Type Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">Zone Type *</label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {ZONE_TYPES.map((type) => {
            const Icon = type.icon;
            return (
              <button
                key={type.value}
                type="button"
                onClick={() => !isEdit && updateFn('zoneType', type.value)}
                disabled={isEdit}
                className={`p-3 rounded-xl border-2 transition-all duration-200 flex flex-col items-center gap-2 text-sm font-medium ${
                  data.zoneType === type.value
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300 text-gray-600'
                } ${isEdit ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <Icon size={20} />
                {type.label}
              </button>
            );
          })}
        </div>
        {isEdit && (
          <p className="text-xs text-gray-500 mt-2">Zone type cannot be changed after creation</p>
        )}
      </div>

      {/* Dynamic Zone Type Fields */}
      <ZoneTypeFields 
        data={data} 
        updateFn={updateFn} 
        isEdit={isEdit}
        countries={countries}
        states={states}
        currencies={currencies}
      />

      {/* Shipping Details */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Shipping Cost</label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="number"
              step="0.01"
              min="0"
              value={data.shippingCost}
              onChange={(e) => updateFn('shippingCost', parseFloat(e.target.value) || 0)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Min Days</label>
          <input
            type="number"
            min="1"
            value={data.estimatedDeliveryDays.min}
            onChange={(e) => updateFn('estimatedDeliveryDays', { min: parseInt(e.target.value) || 1 })}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Max Days</label>
          <input
            type="number"
            min="1"
            value={data.estimatedDeliveryDays.max}
            onChange={(e) => updateFn('estimatedDeliveryDays', { max: parseInt(e.target.value) || 1 })}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Currency and Status */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
          <select
            value={data.currency || ''}
            onChange={(e) => {
              console.log('Currency selected:', e.target.value); // Debug log
              updateFn('currency', e.target.value);
            }}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select currency</option>
            {currencies.map((currency) => (
              <option key={currency.code} value={currency.code}>
                {currency.symbol} {currency.code} - {currency.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-4 pt-8">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={data.isActive}
              onChange={(e) => updateFn('isActive', e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Zone is active</span>
          </label>
          {!isEdit && (
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={data.applyToExistingOffers}
                onChange={(e) => updateFn('applyToExistingOffers', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Apply to existing offers</span>
            </label>
          )}
        </div>
      </div>
    </div>
  );
};

export default ZoneForm;