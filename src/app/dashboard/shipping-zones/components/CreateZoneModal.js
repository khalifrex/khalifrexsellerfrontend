import { useState } from 'react';
import { X } from 'lucide-react';
import ZoneForm from './ZoneForm';

const CreateZoneModal = ({ isOpen, onClose, onSubmit, loading }) => {
  const [formData, setFormData] = useState({
    zoneType: 'country',
    country: '',
    countryCode: '',
    state: '',
    stateCode: '',
    city: '',
    postcode: '',
    street: '',
    shippingCost: 0,
    estimatedDeliveryDays: { min: 2, max: 7 },
    currency: '',
    isActive: true,
    applyToExistingOffers: true
  });

  if (!isOpen) return null;

  const handleSubmit = () => {
    console.log('Submitting form data:', formData);
    onSubmit(formData);
  };

  const resetForm = () => {
    setFormData({
      zoneType: 'country',
      country: '',
      countryCode: '',
      state: '',
      stateCode: '',
      city: '',
      postcode: '',
      street: '',
      shippingCost: 0,
      estimatedDeliveryDays: { min: 2, max: 7 },
      currency: '',
      isActive: true,
      applyToExistingOffers: true
    });
  };

  const handleClose = () => {
    onClose();
    resetForm();
  };

  // Improved updateFormData with better batch updates
  const updateFormData = (field, value) => {
    console.log(`Updating ${field} with value:`, value);
    
    setFormData(prevFormData => {
      const newFormData = { ...prevFormData };
      
      if (field === 'estimatedDeliveryDays') {
        newFormData.estimatedDeliveryDays = { ...prevFormData.estimatedDeliveryDays, ...value };
      } else if (field === 'zoneType') {
        // When zone type changes, reset location fields
        newFormData[field] = value;
        newFormData.country = '';
        newFormData.countryCode = '';
        newFormData.state = '';
        newFormData.stateCode = '';
        newFormData.city = '';
        newFormData.postcode = '';
        newFormData.street = '';
      } else {
        newFormData[field] = value;
      }
      
      console.log('Updated form data:', newFormData);
      return newFormData;
    });
  };

  // Enhanced validation based on zone type
  const isValid = () => {
    console.log('Validating form:', formData);
    
    // Common requirements
    if (!formData.currency) {
      console.log('Validation failed: No currency selected');
      return false;
    }
    
    // Zone-specific validation
    switch (formData.zoneType) {
      case 'worldwide':
        return true;
      
      case 'country':
        const countryValid = formData.country && formData.countryCode;
        console.log('Country validation:', { country: formData.country, countryCode: formData.countryCode, valid: countryValid });
        return countryValid;
      
      case 'state':
        const stateValid = formData.country && formData.countryCode && 
               formData.state && formData.stateCode;
        console.log('State validation:', { country: formData.country, state: formData.state, valid: stateValid });
        return stateValid;
      
      case 'city':
        const cityValid = formData.country && formData.countryCode && 
               formData.state && formData.stateCode && 
               formData.city;
        console.log('City validation:', { country: formData.country, state: formData.state, city: formData.city, valid: cityValid });
        return cityValid;
      
      case 'postcode':
        const postcodeValid = formData.country && formData.countryCode && 
               formData.state && formData.stateCode && 
               formData.city && formData.postcode;
        console.log('Postcode validation:', { postcode: formData.postcode, valid: postcodeValid });
        return postcodeValid;
      
      case 'street':
        const streetValid = formData.country && formData.countryCode && 
               formData.state && formData.stateCode && 
               formData.city && formData.postcode && 
               formData.street;
        console.log('Street validation:', { street: formData.street, valid: streetValid });
        return streetValid;
      
      default:
        return false;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-300">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom-4 duration-300">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Create Shipping Zone</h2>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
            >
              <X size={20} className="text-gray-500" />
            </button>
          </div>
        </div>
        
        <div className="p-6">
          <ZoneForm
            data={formData}
            updateFn={updateFormData}
            isEdit={false}
          />
          
          {/* Debug information - remove in production */}
          <div className="mt-4 p-3 bg-gray-100 rounded-lg text-xs">
            <div className="font-medium mb-2">Debug Info:</div>
            <div>Zone Type: {formData.zoneType}</div>
            <div>Country: {formData.country} ({formData.countryCode})</div>
            <div>State: {formData.state} ({formData.stateCode})</div>
            <div>Currency: {formData.currency}</div>
            <div>Valid: {isValid().toString()}</div>
          </div>
        </div>

        <div className="p-6 bg-gray-50 border-t border-gray-100 flex gap-3">
          <button
            onClick={handleClose}
            className="flex-1 bg-white border border-gray-200 text-gray-700 px-4 py-2.5 rounded-xl font-medium hover:bg-gray-50 transition-colors duration-200"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || !isValid()}
            className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2.5 rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-all duration-200"
          >
            {loading ? 'Creating...' : 'Create Zone'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateZoneModal;