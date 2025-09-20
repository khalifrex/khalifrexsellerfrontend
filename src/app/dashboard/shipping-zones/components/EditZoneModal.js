import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import ZoneForm from './ZoneForm';

const EditZoneModal = ({ isOpen, zone, onClose, onSubmit, loading }) => {
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
    applyToExistingOffers: false
  });

  useEffect(() => {
    if (zone) {
      setFormData({
        zoneType: zone.zoneType,
        country: zone.country || '',
        countryCode: zone.countryCode || '',
        state: zone.state || '',
        stateCode: zone.stateCode || '',
        city: zone.city || '',
        postcode: zone.postcode || '',
        street: zone.street || '',
        shippingCost: zone.shippingCost,
        estimatedDeliveryDays: zone.estimatedDeliveryDays,
        currency: zone.currency || '',
        isActive: zone.isActive,
        applyToExistingOffers: false // Not applicable for updates
      });
    }
  }, [zone]);

  if (!isOpen || !zone) return null;

  const handleSubmit = () => {
    // Only send updatable fields
    const updateData = {
      shippingCost: formData.shippingCost,
      estimatedDeliveryDays: formData.estimatedDeliveryDays,
      currency: formData.currency,
      isActive: formData.isActive
    };
    onSubmit(updateData);
  };

  const updateFormData = (field, value) => {
    setFormData(prevFormData => {
      if (field === 'estimatedDeliveryDays') {
        return { 
          ...prevFormData, 
          estimatedDeliveryDays: { ...prevFormData.estimatedDeliveryDays, ...value } 
        };
      } else {
        return { ...prevFormData, [field]: value };
      }
    });
  };

  // Validation for edit - only editable fields need validation
  const isValid = () => {
    return formData.currency && 
           formData.shippingCost >= 0 &&
           formData.estimatedDeliveryDays.min > 0 &&
           formData.estimatedDeliveryDays.max > 0 &&
           formData.estimatedDeliveryDays.min <= formData.estimatedDeliveryDays.max;
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-300">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom-4 duration-300">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Edit Shipping Zone</h2>
            <button
              onClick={onClose}
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
            isEdit={true}
          />
          
          {/* Information about what can be edited */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center mt-0.5">
                <span className="text-white text-xs font-bold">i</span>
              </div>
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">Edit Information</p>
                <p>You can only modify shipping cost, delivery time estimates, currency, and zone status. Location details cannot be changed after creation.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 bg-gray-50 border-t border-gray-100 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 bg-white border border-gray-200 text-gray-700 px-4 py-2.5 rounded-xl font-medium hover:bg-gray-50 transition-colors duration-200"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || !isValid()}
            className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2.5 rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-all duration-200"
          >
            {loading ? 'Updating...' : 'Update Zone'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditZoneModal;