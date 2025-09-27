import { useState, useEffect } from 'react';
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
  const [countries, setCountries] = useState([]);
  const [loadingCountries, setLoadingCountries] = useState(true);

  // Fetch countries on component mount
  useEffect(() => {
    fetchCountries();
  }, []);

  const fetchCountries = async () => {
    try {
      setLoadingCountries(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/location/countries`, {
        method: 'GET',
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success && Array.isArray(data.countries)) {
        setCountries(data.countries);
      } else {
        console.error('Invalid countries response format:', data);
        setCountries([]);
      }
    } catch (error) {
      console.error('Error fetching countries:', error);
      setCountries([]);
    } finally {
      setLoadingCountries(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Document Verification</h2>
      <p className="text-sm text-gray-600 mb-6">
        Please provide your document information and upload clear, readable files for verification.
      </p>

      {/* Government ID Type Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Government ID Type *
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { value: 'passport', label: 'Passport', description: 'International passport' },
            { value: 'drivers_license', label: "Driver's License", description: 'Valid driving license' },
            { value: 'national_id', label: 'National ID Card', description: 'Government issued ID' }
          ].map((idType) => (
            <label 
              key={idType.value} 
              className={`flex flex-col p-3 border rounded-lg cursor-pointer transition-all ${
                formData.governmentIdType === idType.value 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <div className="flex items-center mb-1">
                <input
                  type="radio"
                  name="governmentIdType"
                  value={idType.value}
                  checked={formData.governmentIdType === idType.value}
                  onChange={(e) => updateFormData('governmentIdType', e.target.value)}
                  className="mr-2"
                  style={{ accentColor: '#0C7FD2' }}
                />
                <span className="font-medium text-sm">{idType.label}</span>
              </div>
              <span className="text-xs text-gray-500 ml-6">{idType.description}</span>
            </label>
          ))}
        </div>
        {errors.governmentIdType && <p className="text-red-500 text-xs mt-1">{errors.governmentIdType}</p>}
      </div>

      {/* ID Country of Issue */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          ID Country of Issue *
        </label>
        <select
          name="identityProofCountryOfIssue"
          value={formData.identityProofCountryOfIssue}
          onChange={(e) => updateFormData('identityProofCountryOfIssue', e.target.value)}
          className={`w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:border-transparent transition-colors ${
            errors.identityProofCountryOfIssue ? 'border-red-300' : 'border-gray-300'
          }`}
          style={{ '--tw-ring-color': '#0C7FD2' }}
          disabled={loadingCountries}
        >
          <option value="">
            {loadingCountries ? 'Loading countries...' : 'Select country where your ID was issued'}
          </option>
          {countries.map((country) => (
            <option key={country.countryCode} value={country.name}>
              {country.name}
            </option>
          ))}
        </select>
        {errors.identityProofCountryOfIssue && <p className="text-red-500 text-xs mt-1">{errors.identityProofCountryOfIssue}</p>}
      </div>

      {/* Show upload fields only after ID type is selected */}
      {formData.governmentIdType && (
        <>
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { value: 'utility_bill', label: 'Utility Bill', description: 'Electricity, water, gas, or internet bill' },
                { value: 'bank_statement', label: 'Bank Statement', description: 'Recent bank account statement' }
              ].map((proofType) => (
                <label 
                  key={proofType.value} 
                  className={`flex flex-col p-3 border rounded-lg cursor-pointer transition-all ${
                    formData.proofOfResidenceType === proofType.value 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <div className="flex items-center mb-1">
                    <input
                      type="radio"
                      name="proofOfResidenceType"
                      value={proofType.value}
                      checked={formData.proofOfResidenceType === proofType.value}
                      onChange={(e) => updateFormData('proofOfResidenceType', e.target.value)}
                      className="mr-2"
                      style={{ accentColor: '#0C7FD2' }}
                    />
                    <span className="font-medium text-sm">{proofType.label}</span>
                  </div>
                  <span className="text-xs text-gray-500 ml-6">{proofType.description}</span>
                </label>
              ))}
            </div>
            {errors.proofOfResidenceType && <p className="text-red-500 text-xs mt-1">{errors.proofOfResidenceType}</p>}
          </div>

          {/* Show proof of residence upload only after type is selected */}
          {formData.proofOfResidenceType && (
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
          )}

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
        </>
      )}

      {/* Important Notes */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-yellow-800 mb-2">Important Notes:</h4>
        <ul className="text-xs text-yellow-700 space-y-1">
          <li>• Select your ID type before upload options appear</li>
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