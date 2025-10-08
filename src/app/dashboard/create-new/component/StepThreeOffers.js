import React, { useEffect, useState } from "react";
import ProductImages from "./OfferProductImages";
import VariantSummary from "./OfferVariantSummary";
import OffersSection from "./OfferSelection";
import PreSubmissionChecklist from "./PreSubmissionChecklist";
import ZoneSelectorModal from "./ZoneSelectorModal";
import StandaloneProductGTIN from "./StandaloneProductGTIN";
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
  // New props for main images
  mainImages,
  setMainImages,
  mainImagePreviews,
  setMainImagePreviews,
  handleRemoveMainImage,
  // New props for variant images
  variantImages,
  setVariantImages,
  variantImagePreviews,
  setVariantImagePreviews,
  handleRemoveVariantImage,
  getRootPropsMain,
  getInputPropsMain,
  isDragActiveMain,
  getRootPropsVariant,
  getInputPropsVariant,
  isDragActiveVariant,
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
    
    const currentOffer = offerData[offerIndex];
    if (currentOffer?.shippingZoneIds) {
      setSelectedZones(new Set(currentOffer.shippingZoneIds));
    } else if (currentOffer?.useDefaultZones) {
      handleSelectAllZones();
    } else {
      setSelectedZones(new Set());
    }
  };

  useEffect(() => {
    initializeOffers();
    fetchShippingZones();
  }, []);

  return (
    <>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Images & Final Details</h2>
      <p className="text-gray-600 mb-6">
        {hasVariants 
          ? "Add main product images and configure offers for your variants"
          : "Add product images, GTIN information, and configure your offer"
        }
      </p>
      
      {/* Main Product Images - Limited to 1-2 images */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Main Product Images</h3>
        <p className="text-sm text-gray-600 mb-4">
          Upload 1-2 main images that represent the overall product (required)
        </p>
        <ProductImages
          getRootProps={getRootPropsMain}
          getInputProps={getInputPropsMain}
          isDragActive={isDragActiveMain}
          hasVariants={hasVariants}
          formErrors={formErrors}
          hasMounted={hasMounted}
          imagePreviews={mainImagePreviews}
          handleRemoveImage={handleRemoveMainImage}
          maxImages={2}
          imageType="main"
        />
      </div>

      {/* Variant Images - For standalone products only, 5-10 images */}
      {!hasVariants && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Variant Images</h3>
          <p className="text-sm text-gray-600 mb-4">
            Upload 5-10 additional images showing different angles, details, or use cases
          </p>
          <ProductImages
            getRootProps={getRootPropsVariant}
            getInputProps={getInputPropsVariant}
            isDragActive={isDragActiveVariant}
            hasVariants={false}
            formErrors={formErrors}
            hasMounted={hasMounted}
            imagePreviews={variantImagePreviews}
            handleRemoveImage={handleRemoveVariantImage}
            minImages={5}
            maxImages={10}
            imageType="variant"
          />
        </div>
      )}

      {/* GTIN Information for Standalone Products*/}
      {!hasVariants && (
        <StandaloneProductGTIN
          form={form}
          formErrors={formErrors}
          handleInput={handleInput}
        />
      )}
 
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
        mainImagePreviews={mainImagePreviews}
        variantImagePreviews={variantImagePreviews}
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
        setSelectedZones={setSelectedZones}
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