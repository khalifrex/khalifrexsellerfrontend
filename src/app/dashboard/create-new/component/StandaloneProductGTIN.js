import React, { useState } from "react";

export default function StandAloneProductGTIN({ form, formErrors, handleInput }) {
  const [localErrors, setLocalErrors] = useState({});

  const validateFields = () => {
    const errors = {};
    if (!form.gtinType || !["UPC", "EAN"].includes(form.gtinType)) {
      errors.gtinType = "GTIN type (UPC or EAN) is required";
    }
    if (!form.gtin || form.gtin.trim().length === 0) {
      errors.gtin = "GTIN is required";
    }
    if (!form.sku || form.sku.trim().length === 0) {
      errors.sku = "SKU is required";
    }
    setLocalErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (field, value) => {
    handleInput(field, value);
    setLocalErrors((prev) => ({ ...prev, [field]: null }));
  };

  return (
    <div className="bg-white border rounded-lg p-4 mb-6">
      <h3 className="text-lg font-semibold mb-3">Standalone Product GTIN & SKU</h3>
      <div className="mb-4">
        <label className="block font-medium mb-1">GTIN Type</label>
        <select
          value={form.gtinType || ""}
          onChange={(e) => handleChange("gtinType", e.target.value)}
          className="border rounded px-3 py-2 w-full"
        >
          <option value="">Select GTIN Type</option>
          <option value="UPC">UPC</option>
          <option value="EAN">EAN</option>
        </select>
        {(formErrors.gtinType || localErrors.gtinType) && (
          <p className="text-red-600 text-sm mt-1">{formErrors.gtinType || localErrors.gtinType}</p>
        )}
      </div>
      <div className="mb-4">
        <label className="block font-medium mb-1">GTIN</label>
        <input
          type="text"
          value={form.gtin || ""}
          onChange={(e) => handleChange("gtin", e.target.value)}
          className="border rounded px-3 py-2 w-full"
          placeholder="Enter GTIN (UPC/EAN)"
        />
        {(formErrors.gtin || localErrors.gtin) && (
          <p className="text-red-600 text-sm mt-1">{formErrors.gtin || localErrors.gtin}</p>
        )}
      </div>
      <div className="mb-4">
        <label className="block font-medium mb-1">SKU</label>
        <input
          type="text"
          value={form.sku || ""}
          onChange={(e) => handleChange("sku", e.target.value)}
          className="border rounded px-3 py-2 w-full"
          placeholder="Enter SKU"
        />
        {(formErrors.sku || localErrors.sku) && (
          <p className="text-red-600 text-sm mt-1">{formErrors.sku || localErrors.sku}</p>
        )}
      </div>
      <button
        type="button"
        className="bg-blue-600 text-white px-4 py-2 rounded"
        onClick={validateFields}
      >
        Validate
      </button>
    </div>
  );
}