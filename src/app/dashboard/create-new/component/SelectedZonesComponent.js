import React from "react";

export default function SelectedZones({
  offer,
  index,
  openZoneSelector,
  getZoneTypeInfo,
  formatZoneDescription,
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700">
          Selected Zones ({offer.selectedShippingZones.length})
        </span>
        <button
          type="button"
          onClick={() => openZoneSelector(index)}
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          Change Zones
        </button>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {offer.selectedShippingZones.map((zone) => {
          const typeInfo = getZoneTypeInfo(zone.zoneType);
          return (
            <div key={zone._id} className="flex items-center gap-2 p-2 bg-blue-50 border border-blue-200 rounded">
              <span className="text-sm">{typeInfo.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-900 truncate">
                  {formatZoneDescription(zone)}
                </div>
                <div className="text-xs text-gray-600">
                  ${zone.shippingCost} • {zone.estimatedDeliveryDays?.min}-{zone.estimatedDeliveryDays?.max} days
                </div>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs ${typeInfo.color}`}>
                {typeInfo.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}