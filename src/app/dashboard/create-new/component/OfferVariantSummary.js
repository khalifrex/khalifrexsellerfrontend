import React from "react";

export default function VariantSummary({ variantData }) {
  return (
    <div className="space-y-4 mt-8">
      <h3 className="text-lg font-medium text-gray-800 border-b pb-2">
        Variant Summary ({variantData.length} combinations)
      </h3>
      
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-blue-900 mb-2">Your Product Variants:</h4>
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {variantData.map((variant, index) => (
            <div key={index} className="bg-white rounded p-3 border border-blue-200">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium text-sm text-gray-900">{variant.name}</p>
                  <p className="text-xs text-gray-600">
                    {Object.entries(variant.variantAttributes || {}).map(([key, value]) => `${key}: ${value}`).join(', ')}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    SKU: {variant.sku} | Price: ${variant.price} | Stock: {variant.stock}
                  </p>
                </div>
                {variant.imagePreview && (
                  <img
                    src={variant.imagePreview}
                    alt="Variant"
                    width={40}
                    height={40}
                    className="rounded border object-cover"
                  />
                )}
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-3 pt-3 border-t border-blue-200">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-blue-700 font-medium">Total Stock: </span>
              <span className="text-blue-900">{variantData.reduce((sum, v) => sum + (parseInt(v.stock) || 0), 0)} units</span>
            </div>
            <div>
              <span className="text-blue-700 font-medium">Price Range: </span>
              <span className="text-blue-900">
                ${Math.min(...variantData.map(v => parseFloat(v.price) || 0))} - 
                ${Math.max(...variantData.map(v => parseFloat(v.price) || 0))}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <h4 className="font-medium text-green-900 mb-2">Ready to Submit!</h4>
        <p className="text-sm text-green-800">
          All {variantData.length} variants are configured with pricing and inventory. 
          Click Create Product to finalize your listing.
        </p>
        <p className="text-xs text-green-700 mt-1">
          Note: Variants will use your default seller shipping zones automatically.
        </p>
      </div>
    </div>
  );
}