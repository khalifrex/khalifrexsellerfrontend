import { useState } from 'react';
import { X, Plus, Package } from 'lucide-react';
import { ZONE_TYPES } from './ZoneTypes';

const BulkCreateModal = ({ isOpen, onClose, onSubmit, loading }) => {
  const [bulkData, setBulkData] = useState({
    zones: [],
    applyToExistingOffers: true
  });

  if (!isOpen) return null;

  const addBulkZone = () => {
    setBulkData({
      ...bulkData,
      zones: [...bulkData.zones, {
        zoneType: 'country',
        country: '',
        countryCode: '',
        shippingCost: 0,
        estimatedDeliveryDays: { min: 2, max: 7 },
        currency: 'USD'
      }]
    });
  };

  const updateBulkZone = (index, field, value) => {
    const updatedZones = bulkData.zones.map((zone, i) => {
      if (i === index) {
        if (field === 'estimatedDeliveryDays') {
          return { ...zone, estimatedDeliveryDays: { ...zone.estimatedDeliveryDays, ...value } };
        }
        return { ...zone, [field]: value };
      }
      return zone;
    });
    setBulkData({ ...bulkData, zones: updatedZones });
  };

  const removeBulkZone = (index) => {
    setBulkData({
      ...bulkData,
      zones: bulkData.zones.filter((_, i) => i !== index)
    });
  };

  const handleSubmit = () => {
    if (bulkData.zones.length === 0) {
      alert('Please add at least one zone');
      return;
    }
    onSubmit(bulkData);
  };

  const handleClose = () => {
    setBulkData({ zones: [], applyToExistingOffers: true });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-300">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom-4 duration-300">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Bulk Create Shipping Zones</h2>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
            >
              <X size={20} className="text-gray-500" />
            </button>
          </div>
        </div>
        
        <div className="p-6">
          <div className="space-y-6">
            {/* Controls */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="bulkApplyToOffers"
                  checked={bulkData.applyToExistingOffers}
                  onChange={(e) => setBulkData({ ...bulkData, applyToExistingOffers: e.target.checked })}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="bulkApplyToOffers" className="text-sm text-gray-700">
                  Apply all zones to existing offers
                </label>
              </div>
              <button
                onClick={addBulkZone}
                className="bg-blue-600 text-white px-4 py-2 rounded-xl font-medium hover:bg-blue-700 transition-colors duration-200 flex items-center gap-2"
              >
                <Plus size={16} />
                Add Zone
              </button>
            </div>

            {/* Bulk Zones */}
            <div className="space-y-4">
              {bulkData.zones.map((zone, index) => (
                <div key={index} className="bg-gray-50 p-4 rounded-xl border">
                  <div className="grid grid-cols-1 lg:grid-cols-7 gap-4 items-end">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Zone Type</label>
                      <select
                        value={zone.zoneType}
                        onChange={(e) => updateBulkZone(index, 'zoneType', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-1 focus:ring-blue-500"
                      >
                        {ZONE_TYPES.map(type => (
                          <option key={type.value} value={type.value}>{type.label}</option>
                        ))}
                      </select>
                    </div>

                    {zone.zoneType !== 'worldwide' && (
                      <>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Country</label>
                          <input
                            type="text"
                            value={zone.country || ''}
                            onChange={(e) => updateBulkZone(index, 'country', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-1 focus:ring-blue-500"
                            placeholder="Country name"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Code</label>
                          <input
                            type="text"
                            value={zone.countryCode || ''}
                            onChange={(e) => updateBulkZone(index, 'countryCode', e.target.value.toUpperCase())}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-1 focus:ring-blue-500"
                            placeholder="US, GB"
                            maxLength={3}
                          />
                        </div>
                      </>
                    )}

                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Cost</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={zone.shippingCost}
                        onChange={(e) => updateBulkZone(index, 'shippingCost', parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-1 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Min Days</label>
                      <input
                        type="number"
                        min="1"
                        value={zone.estimatedDeliveryDays?.min || 2}
                        onChange={(e) => updateBulkZone(index, 'estimatedDeliveryDays', { 
                          min: parseInt(e.target.value) || 1,
                          max: zone.estimatedDeliveryDays?.max || 7
                        })}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-1 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Max Days</label>
                      <input
                        type="number"
                        min="1"
                        value={zone.estimatedDeliveryDays?.max || 7}
                        onChange={(e) => updateBulkZone(index, 'estimatedDeliveryDays', { 
                          min: zone.estimatedDeliveryDays?.min || 2,
                          max: parseInt(e.target.value) || 1
                        })}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-1 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <button
                        onClick={() => removeBulkZone(index)}
                        className="w-full bg-red-50 text-red-600 px-3 py-2 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors duration-200"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {bulkData.zones.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Package className="mx-auto h-8 w-8 mb-2" />
                  <p>No zones added yet. Click "Add Zone" to get started.</p>
                </div>
              )}
            </div>
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
            disabled={loading || bulkData.zones.length === 0}
            className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2.5 rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-all duration-200"
          >
            {loading ? 'Creating...' : `Create ${bulkData.zones.length} Zone${bulkData.zones.length !== 1 ? 's' : ''}`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BulkCreateModal;