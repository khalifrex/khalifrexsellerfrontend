import React from "react";
import { XCircle, Globe } from "lucide-react";

export default function ZoneSelectorModal({
  showZoneSelector,
  setShowZoneSelector,
  shippingZones,
  isLoadingZones,
  selectedZones,
  handleZoneSelection,
  handleSelectAllZones,
  handleClearAllZones,
  currentOfferIndex,
  setCurrentOfferIndex,
  applyZonesToOffer,
}) {
  if (!showZoneSelector) return null;

  const getZoneTypeInfo = (zoneType) => {
    const types = {
      worldwide: { label: 'Worldwide', color: 'bg-purple-100 text-purple-800', icon: '🌍' },
      country: { label: 'Country', color: 'bg-blue-100 text-blue-800', icon: '🏛️' },
      state: { label: 'State/Region', color: 'bg-green-100 text-green-800', icon: '🗺️' },
      city: { label: 'City', color: 'bg-orange-100 text-orange-800', icon: '🏙️' },
      postcode: { label: 'Postcode', color: 'bg-red-100 text-red-800', icon: '📮' },
      street: { label: 'Street', color: 'bg-gray-100 text-gray-800', icon: '🏠' }
    };
    return types[zoneType] || types.country;
  };

  const formatZoneDescription = (zone) => {
    switch (zone.zoneType) {
      case 'worldwide':
        return 'Ships worldwide';
      case 'country':
        return `${zone.country} (${zone.countryCode})`;
      case 'state':
        return `${zone.state}, ${zone.country}`;
      case 'city':
        return `${zone.city}, ${zone.state || zone.country}`;
      case 'postcode':
        return `${zone.postcode}, ${zone.city}`;
      case 'street':
        return `${zone.street}, ${zone.city}`;
      default:
        return zone.description || 'Shipping zone';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Select Shipping Zones</h3>
          <button
            onClick={() => setShowZoneSelector(false)}
            className="text-gray-500 hover:text-gray-700"
          >
            <XCircle size={24} />
          </button>
        </div>

        <div className="flex gap-2 mb-4">
          <button
            onClick={handleSelectAllZones}
            className="px-3 py-1 bg-blue-100 text-blue-800 rounded text-sm hover:bg-blue-200"
          >
            Select All ({shippingZones.length})
          </button>
          <button
            onClick={handleClearAllZones}
            className="px-3 py-1 bg-gray-100 text-gray-800 rounded text-sm hover:bg-gray-200"
          >
            Clear All
          </button>
          <div className="ml-auto text-sm text-gray-600">
            {selectedZones.size} of {shippingZones.length} zones selected
          </div>
        </div>

        <div className="flex-1 overflow-y-auto border border-gray-200 rounded">
          {isLoadingZones ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-sm text-gray-600">Loading zones...</span>
            </div>
          ) : shippingZones.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              <Globe className="mx-auto mb-2 text-gray-400" size={48} />
              <p className="font-medium">No shipping zones configured</p>
              <p className="text-sm mt-1">Create shipping zones first to assign to offers</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {shippingZones.map((zone) => {
                const typeInfo = getZoneTypeInfo(zone.zoneType);
                const isSelected = selectedZones.has(zone._id);
                
                return (
                  <div key={zone._id} className="p-4 hover:bg-gray-50">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => handleZoneSelection(zone._id, e.target.checked)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-lg">{typeInfo.icon}</span>
                          <span className="font-medium text-gray-900">
                            {formatZoneDescription(zone)}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs ${typeInfo.color}`}>
                            {typeInfo.label}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span>Cost: ${zone.shippingCost || 0}</span>
                          <span>
                            Delivery: {zone.estimatedDeliveryDays?.min || 2}-{zone.estimatedDeliveryDays?.max || 7} days
                          </span>
                          <span className={`px-1 py-0.5 rounded text-xs ${zone.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {zone.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex justify-between pt-4 mt-4 border-t">
          <button
            onClick={() => setShowZoneSelector(false)}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            Cancel
          </button>
          <button
            onClick={() => applyZonesToOffer(currentOfferIndex)}
            disabled={selectedZones.size === 0}
            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
          >
            Apply Selected Zones ({selectedZones.size})
          </button>
        </div>
      </div>
    </div>
  );
}