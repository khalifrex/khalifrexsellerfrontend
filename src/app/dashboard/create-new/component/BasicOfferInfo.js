import React from "react";

export default function BasicOfferInfo({
  offer,
  index,
  formErrors,
  handleOfferInputChange,
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Price ($) <span className="text-red-500">*</span>
        </label>
        <input
          type="number"
          step="0.01"
          min="0"
          value={offer.price || ''}
          onChange={(e) => handleOfferInputChange(index, 'price', e.target.value)}
          className={`w-full border ${formErrors[`offer_${index}_price`] ? "border-red-500" : "border-gray-300"} rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
          placeholder="0.00"
        />
        {formErrors[`offer_${index}_price`] && (
          <p className="text-red-500 text-sm mt-1">{formErrors[`offer_${index}_price`]}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Stock Quantity <span className="text-red-500">*</span>
        </label>
        <input
          type="number"
          min="0"
          value={offer.stock || ''}
          onChange={(e) => handleOfferInputChange(index, 'stock', e.target.value)}
          className={`w-full border ${formErrors[`offer_${index}_stock`] ? "border-red-500" : "border-gray-300"} rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
          placeholder="0"
        />
        {formErrors[`offer_${index}_stock`] && (
          <p className="text-red-500 text-sm mt-1">{formErrors[`offer_${index}_stock`]}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Condition <span className="text-red-500">*</span>
        </label>
        <select
          value={offer.condition || 'new'}
          onChange={(e) => handleOfferInputChange(index, 'condition', e.target.value)}
          className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="new">New</option>
          <option value="used">Used</option>
          <option value="refurbished">Refurbished</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Seller SKU
        </label>
        <input
          type="text"
          value={offer.sellerSku || ''}
          onChange={(e) => handleOfferInputChange(index, 'sellerSku', e.target.value)}
          className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Your internal SKU"
        />
      </div>
    </div>
  );
}