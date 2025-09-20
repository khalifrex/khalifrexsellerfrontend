import React from "react";
import { Plus, Check, AlertCircle } from "lucide-react";
import OfferCard from "./OfferCard";

export default function OffersSection({
  offerData,
  formErrors,
  handleOfferInputChange,
  handlePickupChange,
  openZoneSelector,
  shippingZones,
}) {
  return (
    <div className="space-y-6 mt-8">
      <h3 className="text-lg font-medium text-gray-800 border-b pb-2">
        Create Offer (Single Product)
      </h3>
      
      <p className="text-sm text-gray-600">
        Create an offer for your product with pricing, inventory, and shipping information.
      </p>

      {offerData.map((offer, index) => (
        <OfferCard
          key={index}
          offer={offer}
          index={index}
          formErrors={formErrors}
          handleOfferInputChange={handleOfferInputChange}
          handlePickupChange={handlePickupChange}
          openZoneSelector={openZoneSelector}
          shippingZones={shippingZones}
        />
      ))}

      {/* Offer Validation Summary */}
      {offerData.length > 0 && (
        <div className={`border rounded-lg p-4 ${
          offerData.every(offer => offer.price && offer.stock && (offer.selectedShippingZones?.length > 0 || offer.pickup?.available))
            ? 'bg-green-50 border-green-200'
            : 'bg-yellow-50 border-yellow-200'
        }`}>
          <div className="flex items-start gap-2">
            {offerData.every(offer => offer.price && offer.stock && (offer.selectedShippingZones?.length > 0 || offer.pickup?.available)) ? (
              <Check className="w-5 h-5 text-green-600 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
            )}
            <div className="flex-1">
              <h4 className={`font-medium mb-2 ${
                offerData.every(offer => offer.price && offer.stock && (offer.selectedShippingZones?.length > 0 || offer.pickup?.available))
                  ? 'text-green-900'
                  : 'text-yellow-900'
              }`}>
                {offerData.every(offer => offer.price && offer.stock && (offer.selectedShippingZones?.length > 0 || offer.pickup?.available))
                  ? 'Offer Ready!'
                  : 'Complete Your Offer'
                }
              </h4>
              <div className={`text-sm space-y-1 ${
                offerData.every(offer => offer.price && offer.stock && (offer.selectedShippingZones?.length > 0 || offer.pickup?.available))
                  ? 'text-green-800'
                  : 'text-yellow-800'
              }`}>
                <div>Stock: {offerData.reduce((sum, offer) => sum + (parseInt(offer.stock) || 0), 0)} units</div>
                <div>
                  Shipping: {offerData[0]?.selectedShippingZones?.length > 0 
                    ? `${offerData[0].selectedShippingZones.length} zones selected`
                    : 'No zones selected'
                  }
                </div>
                {offerData[0]?.pickup?.available && (
                  <div>Pickup: Available at {offerData[0].pickup.address?.city || 'configured address'}</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}