import React from "react";
import { MapPin } from "lucide-react";

export default function PickupConfiguration({
  offer,
  index,
  handlePickupChange,
  formErrors,
}) {
  return (
    <div className="border-t pt-4 mt-4">
      <div className="flex items-center gap-3 mb-3">
        <input
          type="checkbox"
          id={`pickup_${index}`}
          checked={offer.pickup?.available || false}
          onChange={(e) => handlePickupChange(index, 'available', e.target.checked)}
          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
        />
        <label htmlFor={`pickup_${index}`} className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-gray-500" />
          <span className="font-medium text-gray-700">Enable pickup option</span>
        </label>
      </div>

      {/* Pickup Configuration */}
      {offer.pickup?.available && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-4">
          <h6 className="font-medium text-gray-800">Pickup Configuration</h6>
          
          {/* Pickup Address */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Pickup Address</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* FIXED: Added proper street address field */}
              <div className="md:col-span-2">
                <input
                  type="text"
                  placeholder="Street Address"
                  value={offer.pickup.address?.street || ''}
                  onChange={(e) => handlePickupChange(index, 'address.street', e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
              </div>
              {/* FIXED: This should be city, not street address */}
              <input
                type="text"
                placeholder="City"
                value={offer.pickup.address?.city || ''}
                onChange={(e) => handlePickupChange(index, 'address.city', e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
              <input
                type="text"
                placeholder="State"
                value={offer.pickup.address?.state || ''}
                onChange={(e) => handlePickupChange(index, 'address.state', e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
              <input
                type="text"
                placeholder="Postcode"
                value={offer.pickup.address?.postcode || ''}
                onChange={(e) => handlePickupChange(index, 'address.postcode', e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
            </div>
            
            {/* Show validation errors */}
            {formErrors[`offer_${index}_pickup_address`] && (
              <p className="text-red-500 text-sm mt-1">{formErrors[`offer_${index}_pickup_address`]}</p>
            )}
            {formErrors[`offer_${index}_pickup_city`] && (
              <p className="text-red-500 text-sm mt-1">{formErrors[`offer_${index}_pickup_city`]}</p>
            )}
          </div>

          {/* Pickup Instructions */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Pickup Instructions</label>
            <textarea
              placeholder="e.g., Ring doorbell, ask for John, pickup from back entrance"
              value={offer.pickup.instructions || ''}
              onChange={(e) => handlePickupChange(index, 'instructions', e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              rows={2}
            />
          </div>

          {/* Pickup Hours */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Pickup Hours</label>
            <div className="space-y-2">
              {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map(day => (
                <div key={day} className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id={`pickup_${index}_${day}`}
                    checked={offer.pickup.hours?.[day]?.available ?? true}
                    onChange={(e) => handlePickupChange(index, `hours.${day}.available`, e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor={`pickup_${index}_${day}`} className="text-sm font-medium text-gray-700 capitalize w-20">
                    {day}
                  </label>
                  {offer.pickup.hours?.[day]?.available !== false && (
                    <>
                      <input
                        type="time"
                        value={offer.pickup.hours?.[day]?.open || '09:00'}
                        onChange={(e) => handlePickupChange(index, `hours.${day}.open`, e.target.value)}
                        className="border border-gray-300 rounded px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      <span className="text-gray-500">to</span>
                      <input
                        type="time"
                        value={offer.pickup.hours?.[day]?.close || '17:00'}
                        onChange={(e) => handlePickupChange(index, `hours.${day}.close`, e.target.value)}
                        className="border border-gray-300 rounded px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Shipping/Pickup Validation Error */}
      {formErrors[`offer_${index}_shipping`] && (
        <p className="text-red-500 text-sm mt-2">{formErrors[`offer_${index}_shipping`]}</p>
      )}
    </div>
  );
}