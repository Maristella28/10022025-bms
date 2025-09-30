import React, { useState, useCallback } from 'react';
import { Upload, Camera, AlertCircle, XCircle } from 'lucide-react';
import axiosInstance from '../../utils/axiosConfig';

// Fallback UI Component for missing/broken images
const ImageFallback = ({ status, isDenied = false }) => {
  if (isDenied || status === 'denied') {
    return (
      <div className="w-80 h-80 bg-gradient-to-br from-red-50 to-rose-100 rounded-2xl border-4 border-red-200 shadow-2xl mx-auto flex flex-col items-center justify-center">
        <XCircle className="w-16 h-16 text-red-400 mb-4" />
        <p className="text-red-600 font-semibold text-lg text-center px-4">
          Document Denied
        </p>
        <p className="text-red-500 text-sm text-center px-4 mt-2">
          Please upload a new document
        </p>
      </div>
    );
  }
  
  return (
    <div className="w-80 h-80 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border-4 border-gray-200 shadow-2xl mx-auto flex flex-col items-center justify-center">
      <Camera className="w-16 h-16 text-gray-400 mb-4" />
      <p className="text-gray-600 font-semibold text-lg text-center px-4">
        No Image Uploaded
      </p>
      <p className="text-gray-500 text-sm text-center px-4 mt-2">
        Upload your residency document to continue
      </p>
    </div>
  );
};

const DocumentUpload = ({ 
  onUploadSuccess, 
  onUploadError, 
  showDenialNotice = false, 
  denialReason = null,
  isRetry = false 
}) => {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [uploadedImage, setUploadedImage] = useState(null);
  const [imageLoadError, setImageLoadError] = useState(false);

  // Resolve absolute/relative string paths and File objects into a usable img src
  const getImageSrc = (ip) => {
    if (!ip) {
      return '';
    }
    
    if (typeof ip !== 'string') {
      return URL.createObjectURL(ip);
    }
    
    if (ip.startsWith('http://') || ip.startsWith('https://')) {
      const url = `${ip}?t=${Date.now()}`;
      return url;
    }
    
    // Fix: Use the correct backend URL for image serving
    // In development, use localhost:8000, in production use relative path
    const isDevelopment = import.meta.env.DEV;
    let baseUrl;
    
    if (isDevelopment) {
      baseUrl = 'http://localhost:8000';
    } else {
      baseUrl = ''; // Use relative path in production
    }
    
    const url = `${baseUrl}/storage/${ip}?t=${Date.now()}`;
    return url;
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setUploadError('Please upload a valid image file (JPG, PNG, etc.)');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('Image size must be less than 5MB');
      return;
    }

    setUploadError('');
    setUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('residency_verification_image', file);

      const { data } = await axiosInstance.post('/profile/upload-residency-verification', formData);

      // Update local UI immediately
      if (data?.image_path) {
        setUploadedImage(data.image_path);
        setUploadError('');
        
        // Notify parent component of successful upload
        if (onUploadSuccess) {
          onUploadSuccess({
            imagePath: data.image_path,
            status: 'pending',
            ...data
          });
        }
      } else {
        // Fallback to local file object if backend didn't return a path
        setUploadedImage(file);
        setUploadError('Document uploaded but path not returned. Please contact support if issues persist.');
        
        if (onUploadSuccess) {
          onUploadSuccess({
            imagePath: file,
            status: 'pending'
          });
        }
      }
    } catch (error) {
      console.error('Upload error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to upload image. Please try again.';
      setUploadError(errorMessage);
      
      if (onUploadError) {
        onUploadError(error);
      }
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Denial Notice */}
      {showDenialNotice && (
        <div className="w-full bg-gradient-to-br from-red-50 via-rose-50 to-pink-50 rounded-2xl flex flex-col items-center py-8 shadow-xl border border-red-200 mb-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-rose-600 rounded-full flex items-center justify-center shadow-lg">
                <XCircle className="w-6 h-6 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-br from-orange-400 to-red-500 rounded-full border-2 border-white flex items-center justify-center shadow-md animate-pulse">
                <span className="text-white text-xs font-bold">!</span>
              </div>
            </div>
            <div>
              <h3 className="text-xl font-bold text-red-800 mb-1">Verification Denied</h3>
              <p className="text-red-600 text-sm">Please upload a new document</p>
            </div>
          </div>
          
          {denialReason && (
            <div className="mt-4 p-4 bg-red-100 border border-red-300 rounded-lg w-full max-w-md">
              <p className="text-sm font-semibold text-red-800 mb-2">Reason for denial:</p>
              <p className="text-sm text-red-700">{denialReason}</p>
            </div>
          )}
        </div>
      )}

      {/* Upload Section */}
      <div id="residency-verification-section" className="w-full bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 rounded-2xl flex flex-col items-center py-12 shadow-xl border-2 border-orange-300">
        <div className="flex items-center gap-4 mb-6">
          <div className="relative">
            <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-amber-600 rounded-full flex items-center justify-center shadow-lg">
              <AlertCircle className="w-10 h-10 text-white" />
            </div>
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full border-3 border-white flex items-center justify-center shadow-md animate-pulse">
              <span className="text-white text-sm font-bold">!</span>
            </div>
          </div>
          <div>
            <h3 className="text-3xl font-bold text-orange-800 mb-1">
              {isRetry ? 'Upload New Document' : 'Residency Verification Required'}
            </h3>
            <p className="text-orange-600 text-sm">
              {isRetry ? 'Please upload a new residency verification document' : 'Upload a document to verify your residency'}
            </p>
          </div>
        </div>

        <div className="w-full max-w-2xl space-y-6">
          {/* Accepted Documents */}
          <div className="bg-gradient-to-br from-white to-orange-50 rounded-xl p-8 border-2 border-orange-200 shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-600 rounded-full flex items-center justify-center">
                <span className="text-white text-lg font-bold">📋</span>
              </div>
              <h4 className="text-xl font-bold text-orange-800">Accepted Documents</h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="flex items-center gap-3 p-3 bg-orange-100 rounded-lg">
                <div className="w-3 h-3 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full"></div>
                <span className="text-orange-800 font-medium">Utility bill (electricity, water, internet)</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-orange-100 rounded-lg">
                <div className="w-3 h-3 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full"></div>
                <span className="text-orange-800 font-medium">Lease agreement or rental contract</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-orange-100 rounded-lg">
                <div className="w-3 h-3 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full"></div>
                <span className="text-orange-800 font-medium">Barangay certificate of residency</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-orange-100 rounded-lg">
                <div className="w-3 h-3 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full"></div>
                <span className="text-orange-800 font-medium">Property deed or similar proof</span>
              </div>
            </div>
          </div>

          {/* Upload Area */}
          <div className="bg-gradient-to-br from-white to-orange-50 rounded-xl p-8 border-2 border-orange-200 shadow-lg">
            <div className="flex items-center justify-center w-full">
              <label className="flex flex-col items-center justify-center w-full h-56 border-3 border-dashed border-orange-400 rounded-2xl cursor-pointer bg-gradient-to-br from-orange-50 to-amber-50 hover:from-orange-100 hover:to-amber-100 transition-all duration-300 shadow-inner hover:shadow-lg">
                <div className="flex flex-col items-center justify-center pt-6 pb-8">
                  {uploading ? (
                    <>
                      <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mb-6"></div>
                      <p className="text-orange-700 font-bold text-lg">Uploading document...</p>
                      <p className="text-orange-600 text-sm mt-2">Please wait while we process your file</p>
                    </>
                  ) : (
                    <>
                      <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-amber-600 rounded-full flex items-center justify-center mb-6 shadow-lg">
                        <Camera className="w-10 h-10 text-white" />
                      </div>
                      <p className="mb-3 text-lg text-orange-800 font-bold">
                        Click to upload your residency document
                      </p>
                      <p className="text-sm text-orange-600 bg-orange-200 px-4 py-2 rounded-full">
                        PNG, JPG or JPEG (MAX. 5MB)
                      </p>
                    </>
                  )}
                </div>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleImageUpload} 
                  className="hidden" 
                  disabled={uploading} 
                />
              </label>
            </div>

            {uploadError && (
              <div className="mt-4 p-3 bg-red-100 border border-red-300 rounded-lg">
                <p className="text-red-700 text-sm">{uploadError}</p>
              </div>
            )}
          </div>

          {/* Uploaded Image Preview */}
          {uploadedImage && !imageLoadError && (
            <div className="bg-gradient-to-br from-white to-orange-50 rounded-xl p-8 border-2 border-orange-200 shadow-lg">
              <h4 className="text-xl font-bold text-orange-800 mb-4 flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-amber-600 rounded-full flex items-center justify-center shadow-md">
                  <Camera className="w-5 h-5 text-white" />
                </div>
                Uploaded Document Preview
              </h4>
              
              <div className="relative inline-block group">
                <img 
                  src={getImageSrc(uploadedImage)} 
                  alt="Uploaded Document" 
                  className="w-80 h-80 object-cover rounded-2xl border-4 border-orange-300 shadow-2xl mx-auto hover:shadow-3xl transition-all duration-300 transform hover:scale-105" 
                  onError={(e) => {
                    setImageLoadError(true);
                    
                    // Try alternative URL construction if the first one fails
                    const alternativeUrl = `http://localhost:8000/storage/${uploadedImage}`;
                    if (e.target.src !== alternativeUrl) {
                      e.target.src = alternativeUrl;
                    }
                  }}
                  onLoad={() => {
                    setImageLoadError(false);
                  }}
                />
                
                {/* Success overlay */}
                <div className="absolute top-4 right-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg flex items-center gap-2">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  Uploaded Successfully
                </div>
                
                {/* Subtle overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-orange-900/10 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
            </div>
          )}

          {/* Fallback for image load error */}
          {uploadedImage && imageLoadError && (
            <div className="bg-gradient-to-br from-white to-orange-50 rounded-xl p-8 border-2 border-orange-200 shadow-lg">
              <h4 className="text-xl font-bold text-orange-800 mb-4 flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-amber-600 rounded-full flex items-center justify-center shadow-md">
                  <Camera className="w-5 h-5 text-white" />
                </div>
                Uploaded Document
              </h4>
              <ImageFallback status="uploaded" />
            </div>
          )}

          {/* Important Notice */}
          <div className="bg-amber-100 border border-amber-300 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="w-5 h-5 text-amber-600" />
              <span className="text-amber-800 font-semibold text-sm">Important Notice</span>
            </div>
            <p className="text-amber-700 text-sm">
              You cannot edit your profile until this document is reviewed and approved by barangay administrators. Please ensure the document is clear and legible.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentUpload;
