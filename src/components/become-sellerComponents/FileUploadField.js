import { Upload, X, FileText, Image } from 'lucide-react';

export default function FileUploadField({
  fieldName,
  label,
  description,
  acceptedTypes = "image/*,application/pdf",
  file,
  isUploading,
  error,
  onFileUpload,
  onRemoveFile
}) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {label} *
      </label>
      <p className="text-xs text-gray-500">{description}</p>
      
      {!file ? (
        <div className={`border-2 border-dashed rounded-lg p-6 text-center ${
          error ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
        }`}>
          <input
            type="file"
            accept={acceptedTypes}
            onChange={(e) => {
              const selectedFile = e.target.files[0];
              if (selectedFile) {
                onFileUpload(selectedFile, fieldName);
              }
            }}
            className="hidden"
            id={fieldName}
            disabled={isUploading}
          />
          <label htmlFor={fieldName} className="cursor-pointer">
            <div className="flex flex-col items-center">
              {isUploading ? (
                <div className="animate-spin h-8 w-8 border-2 border-blue-500 border-t-transparent rounded-full mb-2"></div>
              ) : (
                <Upload className="h-8 w-8 text-gray-400 mb-2" />
              )}
              <p className="text-sm text-gray-600">
                {isUploading ? 'Uploading...' : 'Click to upload or drag and drop'}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                JPG, PNG, WEBP or PDF (max. 5MB)
              </p>
            </div>
          </label>
        </div>
      ) : (
        <div className="border rounded-lg p-4 bg-gray-50 flex items-center justify-between">
          <div className="flex items-center">
            {file.type.startsWith('image/') ? (
              <Image className="h-5 w-5 text-green-600 mr-2" />
            ) : (
              <FileText className="h-5 w-5 text-red-600 mr-2" />
            )}
            <span className="text-sm text-gray-700 truncate max-w-48">
              {file.filename}
            </span>
          </div>
          <button
            type="button"
            onClick={() => onRemoveFile(fieldName)}
            className="text-red-500 hover:text-red-700 p-1"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
      
      {error && <p className="text-red-500 text-xs">{error}</p>}
    </div>
  );
}