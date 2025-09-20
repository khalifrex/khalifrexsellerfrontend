import React, { useEffect, useState } from "react";
import { UploadCloud, XCircle } from "lucide-react";
import ProductImages from "./OfferProductImages";
import VariantSummary from "./OfferVariantSummary";
import OffersSection from "./OfferSelection";
import PreSubmissionChecklist from "./PreSubmissionChecklist";
import ZoneSelectorModal from "./ZoneSelectorModal";
import { useShippingZones } from "@/hooks/useShippingZones";
import { useOfferData } from "@/hooks/useOfferData";
export default function StepThreeOffers({
  form,
  formErrors,
  handleInput,
  getRootProps,
  getInputProps,
  isDragActive,
  hasMounted,
  imagePreviews,
  handleRemoveImage,
  variantData,
  hasVariants,
  offerData,
  setOfferData,
}) {
  const [showZoneSelector, setShowZoneSelector] = useState(false);
  const [currentOfferIndex, setCurrentOfferIndex] = useState(null);
  
  const {
    shippingZones,
    isLoadingZones,
    selectedZones,
    setSelectedZones,
    fetchShippingZones,
    handleZoneSelection,
    handleSelectAllZones,
    handleClearAllZones,
    applyZonesToOffer,
  } = useShippingZones();

  const {
    createDefaultOffer,
    handleOfferInputChange,
    handlePickupChange,
    initializeOffers,
  } = useOfferData(offerData, setOfferData, hasVariants);

  // Open zone selector for specific offer
  const openZoneSelector = (offerIndex) => {
    setCurrentOfferIndex(offerIndex);
    setShowZoneSelector(true);
    
    // Pre-select currently assigned zones
    const currentOffer = offerData[offerIndex];
    if (currentOffer?.shippingZoneIds) {
      setSelectedZones(new Set(currentOffer.shippingZoneIds));
    } else if (currentOffer?.useDefaultZones) {
      handleSelectAllZones();
    } else {
      setSelectedZones(new Set());
    }
  };

  // Initialize component
  useEffect(() => {
    initializeOffers();
    fetchShippingZones();
  }, []);

  return (
    <>
      <h2 className="text-xl font-semibold">Images & Final Details</h2>
      
      <ProductImages
        getRootProps={getRootProps}
        getInputProps={getInputProps}
        isDragActive={isDragActive}
        hasVariants={hasVariants}
        formErrors={formErrors}
        hasMounted={hasMounted}
        imagePreviews={imagePreviews}
        handleRemoveImage={handleRemoveImage}
      />

      {hasVariants && variantData.length > 0 && (
        <VariantSummary variantData={variantData} />
      )}

      {!hasVariants && (
        <OffersSection
          offerData={offerData}
          formErrors={formErrors}
          handleOfferInputChange={handleOfferInputChange}
          handlePickupChange={handlePickupChange}
          openZoneSelector={openZoneSelector}
          shippingZones={shippingZones}
        />
      )}

      <PreSubmissionChecklist
        imagePreviews={imagePreviews}
        hasVariants={hasVariants}
        variantData={variantData}
        offerData={offerData}
      />

      <ZoneSelectorModal
        showZoneSelector={showZoneSelector}
        setShowZoneSelector={setShowZoneSelector}
        shippingZones={shippingZones}
        isLoadingZones={isLoadingZones}
        selectedZones={selectedZones}
        handleZoneSelection={handleZoneSelection}
        handleSelectAllZones={handleSelectAllZones}
        handleClearAllZones={handleClearAllZones}
        currentOfferIndex={currentOfferIndex}
        setCurrentOfferIndex={setCurrentOfferIndex}
        applyZonesToOffer={(index) => applyZonesToOffer(index, offerData, setOfferData, shippingZones, selectedZones, setSelectedZones, setShowZoneSelector, setCurrentOfferIndex, createDefaultOffer)}
      />
    </>
  );
}