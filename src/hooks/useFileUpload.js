import { useState } from 'react';
import { toast } from 'react-toastify';

export function useFileUpload(updateFormData = null) {
  const [uploadedFiles, setUploadedFiles] = useState({
    // Updated to match backend field names
    governmentId: null,
    proofOfResidence: null,
    selfieWithId: null
  });

  const [uploading, setUploading] = useState({
    governmentId: false,
    proofOfResidence: false,
    selfieWithId: false
  });

  const handleFileUpload = async (file, fieldName) => {
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    // Validate file type
    if (!allowedTypes.includes(file.type)) {
      toast.error('Please upload JPG, PNG, WEBP, or PDF files only');
      return;
    }

    // Validate file size
    if (file.size > maxSize) {
      toast.error('File size should be less than 5MB');
      return;
    }

    // For selfieWithId, only allow images
    if (fieldName === 'selfieWithId' && !file.type.startsWith('image/')) {
      toast.error('Selfie must be an image file (JPG, PNG, WEBP)');
      return;
    }

    // Validate image dimensions for selfie (optional but recommended)
    if (fieldName === 'selfieWithId' && file.type.startsWith('image/')) {
      const img = new Image();
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      img.onload = function() {
        // Check minimum dimensions
        if (img.width < 300 || img.height < 300) {
          toast.error('Selfie image should be at least 300x300 pixels for better quality');
          return;
        }
      };
      
      img.src = URL.createObjectURL(file);
    }

    setUploading(prev => ({ ...prev, [fieldName]: true }));

    try {
      // Store the file object with metadata
      const fileData = {
        file: file,
        filename: file.name,
        type: file.type,
        size: file.size,
        uploadedAt: new Date().toISOString()
      };

      setUploadedFiles(prev => ({
        ...prev,
        [fieldName]: fileData
      }));

      // Also update formData if updateFormData function is provided
      if (updateFormData) {
        updateFormData(`${fieldName}File`, file);
      }

      toast.success('File selected successfully');
      
    } catch (error) {
      console.error('File upload error:', error);
      toast.error('Failed to process file. Please try again.');
    } finally {
      setUploading(prev => ({ ...prev, [fieldName]: false }));
    }
  };

  const removeFile = (fieldName) => {
    setUploadedFiles(prev => ({ ...prev, [fieldName]: null }));
    
    // Also clear from formData if updateFormData function is provided
    if (updateFormData) {
      updateFormData(`${fieldName}File`, null);
    }
    
    toast.info('File removed');
  };

  const validateAllFiles = () => {
    const requiredFields = ['governmentId', 'proofOfResidence', 'selfieWithId'];
    const missingFiles = requiredFields.filter(field => !uploadedFiles[field]);
    
    if (missingFiles.length > 0) {
      toast.error(`Please upload: ${missingFiles.join(', ')}`);
      return false;
    }
    
    return true;
  };

  return {
    uploadedFiles,
    uploading,
    handleFileUpload,
    removeFile,
    validateAllFiles
  };
}