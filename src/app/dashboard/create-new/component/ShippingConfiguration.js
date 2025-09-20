import React from "react";
import { Truck, Plus, MapPin } from "lucide-react";
import SelectedZones from "./SelectedZonesComponent";
import PickupConfiguration from "./PickupConfiguration";

export default function ShippingConfiguration({
  offer,
  index,
  formErrors,
  handlePickupChange,
  openZoneSelector,
  shippingZones,
}) {
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
    <div className="border-t pt-6 mb-6">
      <div className="flex items-center gap-2 mb-4">
        <Truck className="w-5 h-5 text-blue-600" />
        <h5 className="text-lg font-semibold text-gray-700">Shipping Zones</h5>
        <span className="text-red-500">*</span>
      </div>

      {/* Current Shipping Zones Display */}
      <div className="mb-4">
        {offer.selectedShippingZones && offer.selectedShippingZones.length > 0 ? (
          <SelectedZones
            offer={offer}
            index={index}
            openZoneSelector={openZoneSelector}
            getZoneTypeInfo={getZoneTypeInfo}
            formatZoneDescription={formatZoneDescription}
          />
        ) : (
          <div className="text-center py-6 border-2 border-dashed border-gray-200 rounded-lg">
            <Truck className="mx-auto mb-2 text-gray-400" size={32} />
            <p className="text-gray-600 font-medium">No shipping zones selected</p>
            <p className="text-sm text-gray-500 mb-3">Choose which zones this offer ships to</p>
            <button
              type="button"
              onClick={() => openZoneSelector(index)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              <Plus size={16} />
              Select Shipping Zones
            </button>
          </div>
        )}
      </div>

      {/* Quick Stats */}
      {offer.selectedShippingZones && offer.selectedShippingZones.length > 0 && (
        <div className="bg-gray-50 rounded p-3 mb-4">
          <div className="grid grid-cols-3 gap-4 text-sm text-center">
            <div>
              <div className="font-medium text-gray-900">{offer.selectedShippingZones.length}</div>
              <div className="text-gray-600">Zone{offer.selectedShippingZones.length !== 1 ? 's' : ''}</div>
            </div>
            <div>
              <div className="font-medium text-gray-900">
                ${Math.min(...offer.selectedShippingZones.map(z => z.shippingCost || 0))}
              </div>
              <div className="text-gray-600">Min Cost</div>
            </div>
            <div>
              <div className="font-medium text-gray-900">
                {Math.min(...offer.selectedShippingZones.map(z => z.estimatedDeliveryDays?.min || 2))}-{Math.max(...offer.selectedShippingZones.map(z => z.estimatedDeliveryDays?.max || 7))} days
              </div>
              <div className="text-gray-600">Delivery</div>
            </div>
          </div>
        </div>
      )}

      <PickupConfiguration
        offer={offer}
        index={index}
        handlePickupChange={handlePickupChange}
        formErrors={formErrors}
      />
    </div>
  );
}