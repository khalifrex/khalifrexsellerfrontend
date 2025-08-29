import FileUploadField from "./FileUploadField";

export default function DocumentsStep({
  formData,
  errors,
  uploadedFiles,
  uploading,
  handleFileUpload,
  removeFile,
  updateFormData
}) {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Document Verification</h2>
      <p className="text-sm text-gray-600 mb-6">
        Please upload the following documents for verification. All files should be clear and readable.
      </p>

      {/* Government ID Type Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Government ID Type *
        </label>
        <div className="flex flex-wrap gap-4">
          {[
            { value: 'passport', label: 'Passport' },
            { value: 'drivers_license', label: "Driver's License" },
            { value: 'national_id', label: 'National ID Card' }
          ].map((idType) => (
            <label key={idType.value} className="flex items-center">
              <input
                type="radio"
                name="governmentIdType"
                value={idType.value}
                checked={formData.governmentIdType === idType.value}
                onChange={(e) => updateFormData('governmentIdType', e.target.value)}
                className="mr-2"
                style={{ accentColor: '#0C7FD2' }}
              />
              {idType.label}
            </label>
          ))}
        </div>
        {errors.governmentIdType && <p className="text-red-500 text-xs mt-1">{errors.governmentIdType}</p>}
      </div>

      {/* Government ID Upload */}
      <FileUploadField 
        fieldName="governmentId"
        label="Government-issued ID"
        description={`Upload your ${formData.governmentIdType?.replace('_', ' ') || 'government ID'} - front and back (if applicable)`}
        file={uploadedFiles.governmentId}
        isUploading={uploading.governmentId}
        error={errors.governmentId}
        onFileUpload={handleFileUpload}
        onRemoveFile={removeFile}
        acceptedTypes="image/*"
      />

      {/* Proof of Residence Type Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Proof of Residence Type *
        </label>
        <div className="flex flex-wrap gap-4">
          {[
            { value: 'utility_bill', label: 'Utility Bill' },
            { value: 'bank_statement', label: 'Bank Statement' }
          ].map((proofType) => (
            <label key={proofType.value} className="flex items-center">
              <input
                type="radio"
                name="proofOfResidenceType"
                value={proofType.value}
                checked={formData.proofOfResidenceType === proofType.value}
                onChange={(e) => updateFormData('proofOfResidenceType', e.target.value)}
                className="mr-2"
                style={{ accentColor: '#0C7FD2' }}
              />
              {proofType.label}
            </label>
          ))}
        </div>
        {errors.proofOfResidenceType && <p className="text-red-500 text-xs mt-1">{errors.proofOfResidenceType}</p>}
      </div>

      {/* Proof of Residence Upload */}
      <FileUploadField 
        fieldName="proofOfResidence"
        label="Proof of Residence"
        description={`Upload a recent ${formData.proofOfResidenceType?.replace('_', ' ') || 'proof of residence document'} (not older than 3 months)`}
        file={uploadedFiles.proofOfResidence}
        isUploading={uploading.proofOfResidence}
        error={errors.proofOfResidence}
        onFileUpload={handleFileUpload}
        onRemoveFile={removeFile}
        acceptedTypes="image/*,application/pdf"
      />

      {/* Selfie with ID Upload */}
      <FileUploadField 
        fieldName="selfieWithId"
        label="Selfie with ID"
        description="Take a clear selfie while holding your government-issued ID next to your face. Make sure both your face and the ID are clearly visible."
        acceptedTypes="image/*"
        file={uploadedFiles.selfieWithId}
        isUploading={uploading.selfieWithId}
        error={errors.selfieWithId}
        onFileUpload={handleFileUpload}
        onRemoveFile={removeFile}
      />

      {/* Identity Proof Country of Issue */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          ID Country of Issue *
        </label>
        <input
          type="text"
          name="identityProofCountryOfIssue"
          value={formData.identityProofCountryOfIssue}
          onChange={(e) => updateFormData('identityProofCountryOfIssue', e.target.value)}
          className={`w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:border-transparent transition-colors ${
            errors.identityProofCountryOfIssue ? 'border-red-300' : 'border-gray-300'
          }`}
          style={{ '--tw-ring-color': '#0C7FD2' }}
          placeholder="Country where your ID was issued"
        />
        {errors.identityProofCountryOfIssue && <p className="text-red-500 text-xs mt-1">{errors.identityProofCountryOfIssue}</p>}
      </div>

      {/* Important Notes */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-yellow-800 mb-2">Important Notes:</h4>
        <ul className="text-xs text-yellow-700 space-y-1">
          <li>• All documents must be clear and readable</li>
          <li>• Photos should be well-lit with no glare or shadows</li>
          <li>• Documents must be valid and not expired</li>
          <li>• File size should be less than 5MB</li>
          <li>• Accepted formats: JPG, PNG, WEBP, PDF</li>
        </ul>
      </div>
    </div>
  );
}