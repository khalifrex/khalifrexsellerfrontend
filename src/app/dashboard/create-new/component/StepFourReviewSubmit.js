"use client";

import { Loader2 } from "lucide-react";

export default function StepFourReviewSubmit({ 
  form, 
  variants, 
  submitting, 
  uploadProgress, 
  handleSubmit 
}) {
  return (
    <>
      <h2 className="text-xl font-semibold mb-4">Review & Submit</h2>
      
      {/* Product Summary */}
      <div className="bg-gray-50 rounded-lg p-6 mb-6">
        <h3 className="text-lg font-semibold mb-4">Product Summary</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-sm text-gray-600">Product Name</p>
            <p className="font-medium">{form.name || 'Not specified'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Brand</p>
            <p className="font-medium">{form.brand || 'Not specified'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Price</p>
            <p className="font-medium">${form.price || '0.00'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Stock</p>
            <p className="font-medium">{form.stock || '0'} units</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Condition</p>
            <p className="font-medium capitalize">{form.condition}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Category</p>
            <p className="font-medium">{form.category || 'Not selected'}</p>
          </div>
        </div>

        {form.description && (
          <div className="mb-4">
            <p className="text-sm text-gray-600">Description</p>
            <p className="text-sm mt-1 p-3 bg-white rounded border">
              {form.description.substring(0, 200)}
              {form.description.length > 200 && '...'}
            </p>
          </div>
        )}

        {variants.length > 0 && (
          <div>
            <p className="text-sm text-gray-600 mb-2">Variants ({variants.length})</p>
            <div className="space-y-2">
              {variants.map((variant, index) => (
                <div key={index} className="bg-white rounded p-3 border">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium">{variant.name}</span>
                    {variant.isRequired && (
                      <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded">
                        Required
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">
                    Values: {variant.values.filter(v => v.trim()).join(', ') || 'None'}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Raw Data Preview (for development) */}
      <div className="mb-6">
        <details className="border rounded-lg">
          <summary className="p-3 bg-gray-100 cursor-pointer text-sm font-medium">
            View Raw Data (Development)
          </summary>
          <pre className="bg-gray-50 p-3 text-xs overflow-auto max-h-64">
            {JSON.stringify({ ...form, variants }, null, 2)}
          </pre>
        </details>
      </div>

      {/* Submit Button */}
      <button
        onClick={handleSubmit}
        disabled={submitting}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-4 rounded-lg flex justify-center items-center gap-2 text-lg font-medium transition-colors"
      >
        {submitting ? (
          <>
            <Loader2 className="animate-spin w-5 h-5" />
            Creating Product...
          </>
        ) : (
          "Create Product"
        )}
      </button>

      {/* Progress Bar */}
      {submitting && (
        <div className="mt-4">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Uploading...</span>
            <span>{uploadProgress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div 
              className="bg-blue-600 h-3 transition-all duration-300 ease-out" 
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Important Notes */}
      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h4 className="font-medium text-yellow-800 mb-2">Before you submit:</h4>
        <ul className="text-sm text-yellow-700 space-y-1">
          <li>• Make sure all product information is accurate</li>
          <li>• Verify that images clearly show the product</li>
          <li>• Check that variant combinations are correctly priced</li>
          <li>• Ensure you have the right to sell this product</li>
        </ul>
      </div>
    </>
  );
}