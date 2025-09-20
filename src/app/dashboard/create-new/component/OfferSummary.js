import React from "react";

export default function OfferSummary({ offer }) {
  return (
    <div className="border-t pt-4">
      <h5 className="text-sm font-semibold text-gray-700 mb-3">Offer Summary</h5>
      <div className="bg-gray-50 rounded-lg p-3">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Price: </span>
            <span className="font-medium">${offer.price || '0.00'}</span>
          </div>
          <div>
            <span className="text-gray-600">Stock: </span>
            <span className="font-medium">{offer.stock || '0'} units</span>
          </div>
          <div>
            <span className="text-gray-600">Condition: </span>
            <span className="font-medium capitalize">{offer.condition || 'new'}</span>
          </div>
          <div>
            <span className="text-gray-600">Shipping: </span>
            <span className="font-medium">
              {offer.selectedShippingZones?.length ? 
                `${offer.selectedShippingZones.length} zone${offer.selectedShippingZones.length !== 1 ? 's' : ''}` : 
                'None selected'
              }
              {offer.pickup?.available && ' + Pickup'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}