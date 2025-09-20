import React from "react";
import { Truck, Plus } from "lucide-react";
import BasicOfferInfo from "./BasicOfferInfo";
import ShippingConfiguration from "./ShippingConfiguration";
import OfferSummary from "./OfferSummary";

export default function OfferCard({
  offer,
  index,
  formErrors,
  handleOfferInputChange,
  handlePickupChange,
  openZoneSelector,
  shippingZones,
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-md font-semibold text-gray-800">Product Offer</h4>
      </div>

      <BasicOfferInfo
        offer={offer}
        index={index}
        formErrors={formErrors}
        handleOfferInputChange={handleOfferInputChange}
      />

      <ShippingConfiguration
        offer={offer}
        index={index}
        formErrors={formErrors}
        handlePickupChange={handlePickupChange}
        openZoneSelector={openZoneSelector}
        shippingZones={shippingZones}
      />

      <OfferSummary offer={offer} />
    </div>
  );
}