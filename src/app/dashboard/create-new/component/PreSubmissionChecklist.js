import React from "react";

export default function PreSubmissionChecklist({
  imagePreviews,
  hasVariants,
  variantData,
  offerData,
}) {
  return (
    <div className="mt-8 p-4 bg-gray-50 border border-gray-200 rounded-lg">
      <h4 className="font-medium text-gray-900 mb-2">Pre-submission Checklist:</h4>
      <div className="space-y-2 text-sm">
        <div className="flex items-center gap-2">
          <div className={`w-4 h-4 rounded-full ${imagePreviews.length > 0 ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <span className={imagePreviews.length > 0 ? 'text-green-800' : 'text-red-800'}>
            Product images uploaded ({imagePreviews.length}/5)
          </span>
        </div>
        
        {hasVariants ? (
          <div className="flex items-center gap-2">
            <div className={`w-4 h-4 rounded-full ${variantData.length > 0 && variantData.every(v => v.sku && v.price && v.stock) ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className={variantData.length > 0 && variantData.every(v => v.sku && v.price && v.stock) ? 'text-green-800' : 'text-red-800'}>
              All variants configured ({variantData.length} variants)
            </span>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2">
              <div className={`w-4 h-4 rounded-full ${offerData.length > 0 && offerData.every(o => o.price && o.stock) ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className={offerData.length > 0 && offerData.every(o => o.price && o.stock) ? 'text-green-800' : 'text-red-800'}>
                Product offer configured
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              {(() => {
                const hasShipping = offerData.length > 0 && (
                  (offerData[0]?.selectedShippingZones?.length > 0) || 
                  offerData[0]?.pickup?.available
                );
                return (
                  <>
                    <div className={`w-4 h-4 rounded-full ${hasShipping ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <span className={hasShipping ? 'text-green-800' : 'text-red-800'}>
                      Shipping options configured
                    </span>
                  </>
                );
              })()}
            </div>
          </>
        )}
      </div>
    </div>
  );
}