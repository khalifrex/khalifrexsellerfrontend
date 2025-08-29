"use client";

export default function StepOneBasicInfo({ form, formErrors, handleInput }) {
  return (
    <>
      <h2 className="text-xl font-semibold">Basic Info</h2>
      
      {/* Required Fields */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-800 border-b pb-2">Required Information</h3>
        
        {/* Product Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Product Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={form.itemName || ""}
            onChange={(e) => handleInput("itemName", e.target.value)}
            className={`w-full border ${formErrors.itemName ? "border-red-500" : "border-gray-300"} rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
            placeholder="Enter product name"
          />
          {formErrors.itemName && (
            <p className="text-red-500 text-sm mt-1">{formErrors.itemName}</p>
          )}
        </div>

        {/* Brand */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Brand <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={form.brand || ""}
            onChange={(e) => handleInput("brand", e.target.value)}
            className={`w-full border ${formErrors.brand ? "border-red-500" : "border-gray-300"} rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
            placeholder="Enter brand name"
          />
          {formErrors.brand && (
            <p className="text-red-500 text-sm mt-1">{formErrors.brand}</p>
          )}
        </div>

        {/* Model Number */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Model Number <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={form.modelNumber || ""}
            onChange={(e) => handleInput("modelNumber", e.target.value)}
            className={`w-full border ${formErrors.modelNumber ? "border-red-500" : "border-gray-300"} rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
            placeholder="Enter model number"
          />
          {formErrors.modelNumber && (
            <p className="text-red-500 text-sm mt-1">{formErrors.modelNumber}</p>
          )}
          <p className="text-xs text-gray-500 mt-1">
            Used for catalog matching and duplicate detection
          </p>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description <span className="text-red-500">*</span>
          </label>
          <textarea
            value={form.description || ""}
            onChange={(e) => handleInput("description", e.target.value)}
            className={`w-full border ${formErrors.description ? "border-red-500" : "border-gray-300"} rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
            placeholder="Describe your product..."
            rows="4"
          />
          {formErrors.description && (
            <p className="text-red-500 text-sm mt-1">{formErrors.description}</p>
          )}
        </div>
      </div>

      {/* Optional Product Identifiers */}
      <div className="space-y-4 mt-8">
        <h3 className="text-lg font-medium text-gray-800 border-b pb-2">Product Identifiers (Optional)</h3>
        <p className="text-sm text-gray-600 mb-4">
          These identifiers help with catalog matching and duplicate detection. Fill in any that apply to your product.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* UPC */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              UPC
            </label>
            <input
              type="text"
              value={form.upc || ""}
              onChange={(e) => handleInput("upc", e.target.value)}
              className={`w-full border ${formErrors.upc ? "border-red-500" : "border-gray-300"} rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
              placeholder="Universal Product Code"
            />
            {formErrors.upc && (
              <p className="text-red-500 text-sm mt-1">{formErrors.upc}</p>
            )}
            <p className="text-xs text-gray-500 mt-1">12-digit barcode</p>
          </div>

          {/* EAN */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              EAN
            </label>
            <input
              type="text"
              value={form.ean || ""}
              onChange={(e) => handleInput("ean", e.target.value)}
              className={`w-full border ${formErrors.ean ? "border-red-500" : "border-gray-300"} rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
              placeholder="European Article Number"
            />
            {formErrors.ean && (
              <p className="text-red-500 text-sm mt-1">{formErrors.ean}</p>
            )}
            <p className="text-xs text-gray-500 mt-1">13-digit barcode</p>
          </div>
        </div>
      </div>

      {/* SEO Fields */}
      <details className="mt-8">
        <summary className="p-3 bg-gray-100 cursor-pointer text-sm font-medium">
          View More Optional Fields
        </summary>
        <div className="space-y-4 mt-4">
          <h3 className="text-lg font-medium text-gray-800 border-b pb-2">SEO Information (Optional)</h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              SEO Title
            </label>
            <input
              type="text"
              value={form.seoTitle || ""}
              onChange={(e) => handleInput("seoTitle", e.target.value)}
              className={`w-full border ${formErrors.seoTitle ? "border-red-500" : "border-gray-300"} rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
              placeholder="Custom title for search engines"
              maxLength="60"
            />
            {formErrors.seoTitle && (
              <p className="text-red-500 text-sm mt-1">{formErrors.seoTitle}</p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              {form.seoTitle ? form.seoTitle.length : 0}/60 characters
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              SEO Description
            </label>
            <textarea
              value={form.seoDescription || ""}
              onChange={(e) => handleInput("seoDescription", e.target.value)}
              className={`w-full border ${formErrors.seoDescription ? "border-red-500" : "border-gray-300"} rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
              placeholder="Meta description for search engines"
              rows="3"
              maxLength="160"
            />
            {formErrors.seoDescription && (
              <p className="text-red-500 text-sm mt-1">{formErrors.seoDescription}</p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              {form.seoDescription ? form.seoDescription.length : 0}/160 characters
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Keywords
            </label>
            <input
              type="text"
              value={form.keywords || ""}
              onChange={(e) => handleInput("keywords", e.target.value)}
              className={`w-full border ${formErrors.keywords ? "border-red-500" : "border-gray-300"} rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
              placeholder="Comma-separated keywords (e.g., smartphone, android, 5G)"
            />
            {formErrors.keywords && (
              <p className="text-red-500 text-sm mt-1">{formErrors.keywords}</p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              Separate multiple keywords with commas
            </p>
          </div>
        </div>
      </details>
    </>
  );
}