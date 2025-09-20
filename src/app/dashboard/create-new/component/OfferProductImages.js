import React from "react";
import { UploadCloud, XCircle } from "lucide-react";

export default function ProductImages({
  getRootProps,
  getInputProps,
  isDragActive,
  hasVariants,
  formErrors,
  hasMounted,
  imagePreviews,
  handleRemoveImage,
}) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-800 border-b pb-2">Main Product Images</h3>
      <p className="text-sm text-gray-600">
        {hasVariants 
          ? "Upload main product images. Individual variant images can be added in the combinations table in the previous step."
          : "Upload images that represent your product."
        }
      </p>
      
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
          isDragActive ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-gray-400"
        }`}
      >
        <input {...getInputProps()} />
        <UploadCloud className="mx-auto mb-2 text-blue-500" size={48} />
        <p className="text-gray-700">
          {isDragActive ? "Drop images here..." : "Drag or click to select images"}
        </p>
        <p className="text-xs text-gray-500 mt-1">Maximum 5 images, JPEG/PNG format</p>
      </div>
      
      {formErrors.images && (
        <p className="text-red-500 text-sm">{formErrors.images}</p>
      )}

      {/* Image Previews */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-4">
        {hasMounted &&
          imagePreviews.map((src, idx) => (
            <div key={idx} className="relative group">
              <img 
                src={src} 
                width={200} 
                height={200} 
                className="rounded border object-cover" 
                alt={`Product image ${idx + 1}`} 
              />
              <button
                type="button"
                onClick={() => handleRemoveImage(idx)}
                className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <XCircle size={18} />
              </button>
            </div>
          ))}
      </div>
    </div>
  );
}