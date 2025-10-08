import React from "react";

export default function PreSubmissionChecklist({
  mainImagePreviews,
  variantImagePreviews,
  hasVariants,
  variantData,
  offerData,
}) {
  const hasMainImages = mainImagePreviews.length >= 1 && mainImagePreviews.length <= 2;
  const hasVariantImages = !hasVariants ? (variantImagePreviews.length >= 5 && variantImagePreviews.length <= 10) : true;
  const hasValidVariants = hasVariants ? (variantData.length > 0 && variantData.every(v => v.sku && v.price && v.stock)) : true;
  const hasValidOffers = !hasVariants ? (offerData.length > 0 && offerData.every(o => o.price && o.stock)) : true;
  const hasShipping = !hasVariants ? (offerData.length > 0 && offerData.some(o => o.selectedShippingZones?.length > 0 || o.pickup?.available)) : true;

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Pre-submission Checklist</h3>

      <div className="space-y-3">
        {/* Main Images */}
        <div className="flex items-start gap-3">
          <div className={`w-5 h-5 rounded-full flex-shrink-0 ${hasMainImages ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <div>
            <p className={`font-medium ${hasMainImages ? 'text-green-800' : 'text-red-800'}`}>
              Main product images (1-2)
            </p>
            <p className="text-sm text-gray-600">
              {mainImagePreviews.length} of 1-2 uploaded
              {mainImagePreviews.length > 2 && <span className="text-red-600 ml-1">(Remove {mainImagePreviews.length - 2})</span>}
            </p>
          </div>
        </div>

        {/* Variant Images for Standalone */}
        {!hasVariants && (
          <div className="flex items-start gap-3">
            <div className={`w-5 h-5 rounded-full flex-shrink-0 ${hasVariantImages ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <div>
              <p className={`font-medium ${hasVariantImages ? 'text-green-800' : 'text-red-800'}`}>
                Variant images (5-10)
              </p>
              <p className="text-sm text-gray-600">
                {variantImagePreviews.length} of 5-10 uploaded
                {variantImagePreviews.length < 5 && <span className="text-red-600 ml-1">(Add {5 - variantImagePreviews.length} more)</span>}
                {variantImagePreviews.length > 10 && <span className="text-red-600 ml-1">(Remove {variantImagePreviews.length - 10})</span>}
              </p>
            </div>
          </div>
        )}

        {/* Variants Configuration */}
        {hasVariants ? (
          <div className="flex items-start gap-3">
            <div className={`w-5 h-5 rounded-full flex-shrink-0 ${hasValidVariants ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <div>
              <p className={`font-medium ${hasValidVariants ? 'text-green-800' : 'text-red-800'}`}>
                All variants configured
              </p>
              <p className="text-sm text-gray-600">
                {variantData.filter(v => v.sku && v.price && v.stock).length} of {variantData.length} variants complete
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Offer Configuration */}
            <div className="flex items-start gap-3">
              <div className={`w-5 h-5 rounded-full flex-shrink-0 ${hasValidOffers ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <div>
                <p className={`font-medium ${hasValidOffers ? 'text-green-800' : 'text-red-800'}`}>
                  Product offer configured
                </p>
                <p className="text-sm text-gray-600">
                  {offerData.filter(o => o.price && o.stock).length} of {Math.max(1, offerData.length)} offers complete
                </p>
              </div>
            </div>

            {/* Shipping Configuration */}
            <div className="flex items-start gap-3">
              <div className={`w-5 h-5 rounded-full flex-shrink-0 ${hasShipping ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <div>
                <p className={`font-medium ${hasShipping ? 'text-green-800' : 'text-red-800'}`}>
                  Shipping options configured
                </p>
                <p className="text-sm text-gray-600">
                  {offerData.length > 0 && (offerData[0]?.selectedShippingZones?.length > 0 || offerData[0]?.pickup?.available)
                    ? 'Shipping zones or pickup available'
                    : 'No shipping configured'}
                </p>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Summary Status */}
      <div className={`mt-6 p-4 rounded-lg border ${
        hasMainImages && hasVariantImages && (hasVariants ? hasValidVariants : (hasValidOffers && hasShipping))
          ? 'bg-green-50 border-green-200'
          : 'bg-yellow-50 border-yellow-200'
      }`}>
        <p className={`font-medium ${
          hasMainImages && hasVariantImages && (hasVariants ? hasValidVariants : (hasValidOffers && hasShipping))
            ? 'text-green-800'
            : 'text-yellow-800'
        }`}>
          {hasMainImages && hasVariantImages && (hasVariants ? hasValidVariants : (hasValidOffers && hasShipping))
            ? '✓ Ready to submit!'
            : '⚠ Please complete all required items above'}
        </p>
      </div>
    </div>
  );
}