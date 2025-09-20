import { useState, useEffect, useRef } from 'react';

export function useLocationData(formData) {
  const [billingAddressSuggestions, setBillingAddressSuggestions] = useState([]);
  const [showBillingAddressSuggestions, setShowBillingAddressSuggestions] = useState(false);
  const billingAddressDebounceRef = useRef(null);
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [businessStates, setBusinessStates] = useState([]);
  const [addressSuggestions, setAddressSuggestions] = useState([]);
  const [businessAddressSuggestions, setBusinessAddressSuggestions] = useState([]);
  const [showAddressSuggestions, setShowAddressSuggestions] = useState(false);
  const [showBusinessAddressSuggestions, setShowBusinessAddressSuggestions] = useState(false);
  const addressDebounceRef = useRef(null);
  const businessAddressDebounceRef = useRef(null);

  // Fetch countries on component mount
  useEffect(() => {
    fetchCountries();
  }, []);

  // Fetch states when country changes
  useEffect(() => {
    if (formData.userCountry) {
      fetchStates(formData.userCountry, 'user');
    } else {
      setStates([]); // Clear states when no country selected
    }
  }, [formData.userCountry]);

  useEffect(() => {
    if (formData.businessCountry) {
      fetchStates(formData.businessCountry, 'business');
    } else {
      setBusinessStates([]); // Clear business states when no country selected
    }
  }, [formData.businessCountry]);

  const fetchCountries = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3092'}/location/countries`, {
        method: 'GET',
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      
      // Extract the countries array from the response
      if (data.success && Array.isArray(data.countries)) {
        setCountries(data.countries);
      } else {
        console.error('Invalid countries response format:', data);
        setCountries([]);
      }
    } catch (error) {
      console.error('Error fetching countries:', error);
      setCountries([]); // Set empty array as fallback
    }
  };

  const fetchStates = async (countryId, type) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3092'}/location/states/${countryId}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      
      // Handle the response based on your backend format
      const statesArray = data.success ? data.states : data;
      
      if (type === 'user') {
        setStates(Array.isArray(statesArray) ? statesArray : []);
      } else {
        setBusinessStates(Array.isArray(statesArray) ? statesArray : []);
      }
    } catch (error) {
      console.error('Error fetching states:', error);
      if (type === 'user') {
        setStates([]);
      } else {
        setBusinessStates([]);
      }
    }
  };

  const searchAddresses = async (query, type) => {
    if (!query || query.length < 3) {
      if (type === 'user') {
        setAddressSuggestions([]);
        setShowAddressSuggestions(false);
      } else if (type === 'business') {
        setBusinessAddressSuggestions([]);
        setShowBusinessAddressSuggestions(false);
      } else if (type === 'billing') {
        setBillingAddressSuggestions([]);
        setShowBillingAddressSuggestions(false);
      }
      return;
    }

    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&q=${encodeURIComponent(query)}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      
      const suggestions = data.slice(0, 5).map(item => ({
        display_name: item.display_name,
        lat: item.lat,
        lon: item.lon
      }));

      if (type === 'user') {
        setAddressSuggestions(suggestions);
        setShowAddressSuggestions(suggestions.length > 0);
      } else if (type === 'business') {
        setBusinessAddressSuggestions(suggestions);
        setShowBusinessAddressSuggestions(suggestions.length > 0);
      } else if (type === 'billing') {
        setBillingAddressSuggestions(suggestions);
        setShowBillingAddressSuggestions(suggestions.length > 0);
      }
    } catch (error) {
      console.error('Error searching addresses:', error);
      if (type === 'user') {
        setAddressSuggestions([]);
        setShowAddressSuggestions(false);
      } else if (type === 'business') {
        setBusinessAddressSuggestions([]);
        setShowBusinessAddressSuggestions(false);
      } else if (type === 'billing') {
        setBillingAddressSuggestions([]);
        setShowBillingAddressSuggestions(false);
      }
    }
  };

  const handleAddressInput = (value, type) => {
    const debounceRef = type === 'user' ? addressDebounceRef : 
                       type === 'business' ? businessAddressDebounceRef : 
                       billingAddressDebounceRef;
    
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      searchAddresses(value, type);
    }, 300);
  };

  const selectAddress = (address, type) => {
    if (type === 'user') {
      setShowAddressSuggestions(false);
      setAddressSuggestions([]);
    } else if (type === 'business') {
      setShowBusinessAddressSuggestions(false);
      setBusinessAddressSuggestions([]);
    } else if (type === 'billing') {
      setShowBillingAddressSuggestions(false);
      setBillingAddressSuggestions([]);
    }
  };

  return {
    countries,
    states,
    businessStates,
    addressSuggestions,
    businessAddressSuggestions,
    billingAddressSuggestions,
    showAddressSuggestions,
    showBusinessAddressSuggestions,
    showBillingAddressSuggestions,
    fetchStates,
    handleAddressInput,
    selectAddress,
    setShowAddressSuggestions,
    setShowBusinessAddressSuggestions,
    setShowBillingAddressSuggestions
  };
}