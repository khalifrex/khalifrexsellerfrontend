'use client';
import React from 'react';

const TAX_TYPES_BY_COUNTRY = {
  'Nigeria': [
    { value: 'VAT', label: 'VAT (Value Added Tax)', defaultRate: 7.5 },
    { value: 'WHT', label: 'Withholding Tax', defaultRate: 5.0 }
  ],
  'United States': [
    { value: 'Sales Tax', label: 'Sales Tax', defaultRate: 0 },
    { value: 'State Tax', label: 'State Tax', defaultRate: 0 }
  ],
  'United Kingdom': [
    { value: 'VAT', label: 'VAT (Value Added Tax)', defaultRate: 20 },
    { value: 'Standard Rate', label: 'Standard Rate', defaultRate: 20 }
  ],
  'Canada': [
    { value: 'GST', label: 'GST (Goods and Services Tax)', defaultRate: 5 },
    { value: 'HST', label: 'HST (Harmonized Sales Tax)', defaultRate: 13 }
  ],
  'Australia': [
    { value: 'GST', label: 'GST (Goods and Services Tax)', defaultRate: 10 }
  ],
  'Default': [
    { value: 'VAT', label: 'VAT', defaultRate: 0 },
    { value: 'GST', label: 'GST', defaultRate: 0 },
    { value: 'Sales Tax', label: 'Sales Tax', defaultRate: 0 }
  ]
};

export default function TaxConfigurationStep({
  formData,
  handleInputChange,
  updateFormData,
  errors,
  countries
}) {
  const isCompanyOrStateOwned = 
    formData.businessType === 'company business' || 
    formData.businessType === 'state-owned business';
  
  const isIndividualBusiness = formData.businessType === 'individual business';

  // Auto-set taxStatus for company/state-owned on component mount
  React.useEffect(() => {
    if (isCompanyOrStateOwned && formData.taxStatus === 'non-taxable') {
      updateFormData('taxStatus', 'taxable');
      // Initialize tax config with business location
      if (!formData.taxConfig?.country) {
        updateFormData('taxConfig', {
          taxName: '',
          taxRate: 0,
          country: formData.businessLocation || '',
          includeInPrices: false
        });
      }
    }
  }, [isCompanyOrStateOwned, formData.businessLocation]);

  const handleTaxStatusChange = (status) => {
    updateFormData('taxStatus', status);
    
    if (status === 'non-taxable') {
      // Clear tax fields when non-taxable
      updateFormData('taxId', '');
      updateFormData('taxConfig', {
        taxName: '',
        taxRate: 0,
        country: '',
        includeInPrices: false
      });
    } else {
      // Initialize tax config for taxable
      if (!formData.taxConfig || !formData.taxConfig.country) {
        updateFormData('taxConfig', {
          taxName: '',
          taxRate: 0,
          country: formData.businessLocation || '',
          includeInPrices: false
        });
      }
    }
  };

  const handleTaxNameChange = (e) => {
    const selectedTaxName = e.target.value;
    const taxTypes = TAX_TYPES_BY_COUNTRY[formData.businessLocation] || TAX_TYPES_BY_COUNTRY['Default'];
    const selectedTax = taxTypes.find(t => t.value === selectedTaxName);
    
    updateFormData('taxConfig', {
      ...formData.taxConfig,
      taxName: selectedTaxName,
      taxRate: selectedTax?.defaultRate || 0,
      country: formData.businessLocation
    });
  };

  const taxTypes = TAX_TYPES_BY_COUNTRY[formData.businessLocation] || TAX_TYPES_BY_COUNTRY['Default'];

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Tax Configuration</h2>
        <p className="text-sm text-blue-700">
          {isCompanyOrStateOwned && 
            "Company and state-owned businesses must provide tax registration details."
          }
          {isIndividualBusiness && 
            "Individual businesses can optionally register for tax if they have a tax ID."
          }
        </p>
      </div>

      {/* Tax Status Selection for Individual Business */}
      {isIndividualBusiness && (
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">
            Do you have a tax registration number?
          </label>
          <div className="flex space-x-4">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="radio"
                name="taxStatus"
                value="taxable"
                checked={formData.taxStatus === 'taxable'}
                onChange={(e) => handleTaxStatusChange(e.target.value)}
                className="w-4 h-4 text-blue-600"
              />
              <span className="text-sm text-gray-700">Yes, I have a tax ID</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="radio"
                name="taxStatus"
                value="non-taxable"
                checked={formData.taxStatus === 'non-taxable'}
                onChange={(e) => handleTaxStatusChange(e.target.value)}
                className="w-4 h-4 text-blue-600"
              />
              <span className="text-sm text-gray-700">No, I don&apos;t have a tax ID</span>
            </label>
          </div>
        </div>
      )}

      {/* Show tax fields if company/state-owned OR if individual selected taxable */}
      {(isCompanyOrStateOwned || (isIndividualBusiness && formData.taxStatus === 'taxable')) && (
        <>
          {/* Tax ID Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tax Registration Number {isCompanyOrStateOwned && '*'}
            </label>
            <input
              type="text"
              name="taxId"
              value={formData.taxId || ''}
              onChange={handleInputChange}
              placeholder="e.g., NG123456789, EIN: 12-3456789, GST: 123456789RT0001"
              className={`w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:border-transparent transition-colors ${
                errors.taxId ? 'border-red-300' : 'border-gray-300'
              }`}
              style={{ '--tw-ring-color': '#0C7FD2' }}
            />
            {errors.taxId && <p className="text-red-500 text-xs mt-1">{errors.taxId}</p>}
            <p className="text-xs text-gray-500 mt-1">
              Enter your VAT, GST, EIN, or other tax registration number
            </p>
          </div>

          {/* Tax Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tax Type {isCompanyOrStateOwned && '*'}
            </label>
            <select
              value={formData.taxConfig?.taxName || ''}
              onChange={handleTaxNameChange}
              className={`w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:border-transparent transition-colors ${
                errors.taxName ? 'border-red-300' : 'border-gray-300'
              }`}
              style={{ '--tw-ring-color': '#0C7FD2' }}
            >
              <option value="">Select Tax Type</option>
              {taxTypes.map(tax => (
                <option key={tax.value} value={tax.value}>
                  {tax.label}
                </option>
              ))}
            </select>
            {errors.taxName && <p className="text-red-500 text-xs mt-1">{errors.taxName}</p>}
          </div>

          {/* Tax Rate */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tax Rate (%) {isCompanyOrStateOwned && '*'}
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              max="100"
              value={formData.taxConfig?.taxRate || 0}
              onChange={(e) => updateFormData('taxConfig', {
                ...formData.taxConfig,
                taxRate: parseFloat(e.target.value) || 0
              })}
              className={`w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:border-transparent transition-colors ${
                errors.taxRate ? 'border-red-300' : 'border-gray-300'
              }`}
              style={{ '--tw-ring-color': '#0C7FD2' }}
            />
            {errors.taxRate && <p className="text-red-500 text-xs mt-1">{errors.taxRate}</p>}
            <p className="text-xs text-gray-500 mt-1">
              Enter the tax percentage applicable to your business
            </p>
          </div>

          {/* Include in Prices Checkbox */}
          <div className="flex items-start space-x-3">
            <input
              type="checkbox"
              id="includeInPrices"
              checked={formData.taxConfig?.includeInPrices || false}
              onChange={(e) => updateFormData('taxConfig', {
                ...formData.taxConfig,
                includeInPrices: e.target.checked
              })}
              className="mt-1 w-4 h-4 text-blue-600 rounded"
            />
            <div>
              <label htmlFor="includeInPrices" className="block text-sm font-medium text-gray-700 cursor-pointer">
                Tax is included in product prices
              </label>
              <p className="text-xs text-gray-500 mt-1">
                Check this if your product prices already include tax. Leave unchecked if tax should be calculated separately at checkout.
              </p>
            </div>
          </div>

          {/* Tax Configuration Summary */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-gray-800 mb-2">Tax Configuration Summary</h4>
            <div className="text-xs text-gray-600 space-y-1">
              <p><span className="font-medium">Tax Type:</span> {formData.taxConfig?.taxName || 'Not selected'}</p>
              <p><span className="font-medium">Tax Rate:</span> {formData.taxConfig?.taxRate || 0}%</p>
              <p><span className="font-medium">Tax ID:</span> {formData.taxId || 'Not provided'}</p>
              <p><span className="font-medium">Included in prices:</span> {formData.taxConfig?.includeInPrices ? 'Yes' : 'No'}</p>
              <p className="mt-2 text-blue-600">
                {formData.taxConfig?.includeInPrices 
                  ? '✓ Customers will see final prices (tax already included)'
                  : '⚠ Tax will be calculated and added at checkout'
                }
              </p>
            </div>
          </div>
        </>
      )}

      {/* Non-taxable message for individual businesses */}
      {isIndividualBusiness && formData.taxStatus === 'non-taxable' && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-start">
            <svg className="w-5 h-5 text-green-500 mt-0.5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <div>
              <h4 className="text-sm font-semibold text-green-800">Non-Taxable Business</h4>
              <p className="text-xs text-green-700 mt-1">
                Your business will be registered as non-taxable. You can update this later if you obtain a tax registration number.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Information Box */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-amber-800 mb-2">Important Tax Information</h4>
        <ul className="text-xs text-amber-700 space-y-1">
          <li>• Ensure your tax registration number is valid and active</li>
          <li>• The tax rate you enter will be applied to all your products</li>
          <li>• You can choose whether prices include tax or tax is added at checkout</li>
          <li>• Tax settings can be updated later from your seller dashboard</li>
          <li>• Incorrect tax information may result in account verification delays</li>
        </ul>
      </div>
    </div>
  );
}