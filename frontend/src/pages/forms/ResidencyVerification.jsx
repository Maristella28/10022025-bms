import React, { useState, useEffect } from 'react';
import { Upload, Camera, AlertCircle, CheckCircle, Clock, XCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import axiosInstance from '../../utils/axiosConfig';

// Step Tracker Component
const StepTracker = ({ currentStep = 1 }) => {
  return (
    <div className="w-full max-w-3xl mx-auto mb-8">
      <div className="flex items-center justify-between relative">
        {/* Progress Bar */}
        <div className="absolute top-1/2 transform -translate-y-1/2 h-1 bg-gray-200 w-full -z-10"></div>
        <div className="absolute top-1/2 transform -translate-y-1/2 h-1 bg-green-500" 
          style={{ width: `${((currentStep - 1) / 2) * 100}%` }}
        ></div>
        
        {/* Step 1: Residency Verification */}
        <div className="flex flex-col items-center relative">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
            currentStep >= 1 ? 'bg-green-500 text-white' : 'bg-white border-2 border-gray-300 text-gray-500'
          }`}>
            {currentStep > 1 ? '✓' : '1'}
          </div>
          <span className={`mt-2 text-sm font-medium ${
            currentStep >= 1 ? 'text-green-600' : 'text-gray-500'
          }`}>Residency Verification</span>
        </div>
        
        {/* Step 2: Edit Profile */}
        <div className="flex flex-col items-center">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
            currentStep >= 2 ? 'bg-green-500 text-white' : 'bg-white border-2 border-gray-300 text-gray-500'
          }`}>
            {currentStep > 2 ? '✓' : '2'}
          </div>
          <span className={`mt-2 text-sm font-medium ${
            currentStep >= 2 ? 'text-green-600' : 'text-gray-500'
          }`}>Edit Profile</span>
        </div>
        
        {/* Step 3: Finish */}
        <div className="flex flex-col items-center">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
            currentStep >= 3 ? 'bg-green-500 text-white' : 'bg-white border-2 border-gray-300 text-gray-500'
          }`}>
            {currentStep > 3 ? '✓' : '3'}
          </div>
          <span className={`mt-2 text-sm font-medium ${
            currentStep >= 3 ? 'text-green-600' : 'text-gray-500'
          }`}>Finish</span>
        </div>
      </div>
    </div>
  );
};

const ResidencyVerification = ({ form = {}, onImageUpload, isFirstTime = false } = {}) => {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [uploadedImagePath, setUploadedImagePath] = useState(null);
  const [overrideStatus, setOverrideStatus] = useState(null);

  // Effective values reflecting local upload success
  const status = overrideStatus ?? form.verification_status;
  const imagePath = uploadedImagePath ?? form.residency_verification_image;
  const [pollingIndicator, setPollingIndicator] = useState(0);

  // Debug log for status changes
  useEffect(() => {
    console.log('Verification status changed:', {
      overrideStatus,
      formStatus: form.verification_status,
      effectiveStatus: status,
      formData: form
    });
  }, [status, form.verification_status, overrideStatus]);

  // Visual indicator for polling
  useEffect(() => {
    if (status === 'pending') {
      console.log('Starting verification status polling...');
      
      const timer = setInterval(() => {
        setPollingIndicator(prev => (prev + 1) % 3);
      }, 1000);
      
      // Log when polling starts and stops
      console.log('Verification polling active for document:', imagePath);
      
      return () => {
        clearInterval(timer);
        console.log('Verification polling stopped:', status);
      };
    }
  }, [status, imagePath]);

  // Add additional polling for status updates
  useEffect(() => {
    if (status === 'pending' && imagePath) {
      console.log('Starting status polling with current status:', status);
      
      const statusCheck = setInterval(async () => {
        try {
          console.log('Checking verification status...');
          const response = await axiosInstance.get('/profile');
          const profile = response.data?.user?.profile || response.data?.profile;
          
          console.log('Profile status update:', {
            currentStatus: status,
            newStatus: profile?.verification_status,
            profile: profile
          });
          
          if (profile?.verification_status === 'approved') {
            console.log('Verification approved! Updating UI...', {
              profile,
              currentStatus: status,
              newStatus: profile.verification_status,
              form: form
            });
            
            // Force immediate state update
            setOverrideStatus('approved');
            
            // Update parent component
            if (onImageUpload) {
              console.log('Triggering parent update with profile:', profile);
              try {
                onImageUpload(profile);
                console.log('Parent update successful');
              } catch (error) {
                console.error('Error updating parent:', error);
              }
            }
            
            // Force a re-render after a short delay to ensure state is updated
            setTimeout(() => {
              setOverrideStatus('approved');
              // Show success message
              alert('✅ Your residency verification has been approved! You can now complete your profile.');
              // Log the final state
              console.log('Final state after approval:', {
                status: 'approved',
                overrideStatus: 'approved',
                form: form
              });
            }, 100);
          } else if (profile?.verification_status === 'denied') {
            console.log('Verification denied! Updating UI...');
            alert('❌ Your residency verification was denied. Reason: ' + (profile.denial_reason || 'No reason provided'));
            if (onImageUpload) {
              console.log('Triggering parent update with profile:', profile);
              onImageUpload(profile);
            }
            // Force a re-render for denied state
            setOverrideStatus('denied');
          }
          
        } catch (error) {
          console.error('Status check error:', error);
        }
      }, 5000); // Check every 5 seconds
      
      return () => clearInterval(statusCheck);
    }
  }, [status, imagePath, onImageUpload]);

  // Status message and styling based on verification state
  const getStatusInfo = () => {
    switch (status) {
      case 'pending':
        return {
          message: 'Your residency verification is under review. Once approved, you can complete your profile.',
          icon: <Clock className="w-5 h-5 text-yellow-500" />,
          bgColor: 'bg-yellow-50',
          textColor: 'text-yellow-700',
          borderColor: 'border-yellow-200'
        };
      case 'approved':
        return {
          message: 'Your residency has been verified! You can now complete your profile.',
          icon: <CheckCircle className="w-5 h-5 text-green-500" />,
          bgColor: 'bg-green-50',
          textColor: 'text-green-700',
          borderColor: 'border-green-200'
        };
      case 'denied':
        return {
          message: form.denial_reason || 'Your verification was denied. Please upload a new verification document.',
          icon: <XCircle className="w-5 h-5 text-red-500" />,
          bgColor: 'bg-red-50',
          textColor: 'text-red-700',
          borderColor: 'border-red-200'
        };
      default:
        return {
          message: 'Please upload a document to verify your residency.',
          icon: <AlertCircle className="w-5 h-5 text-blue-500" />,
          bgColor: 'bg-blue-50',
          textColor: 'text-blue-700',
          borderColor: 'border-blue-200'
        };
    }
  };

  // Resolve absolute/relative string paths and File objects into a usable img src
  const getImageSrc = (ip) => {
    if (!ip) return '';
    if (typeof ip !== 'string') return URL.createObjectURL(ip);
    if (ip.startsWith('http://') || ip.startsWith('https://')) return `${ip}?t=${Date.now()}`;
    return `http://localhost:8000/storage/${ip}?t=${Date.now()}`;
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
    
    // Show upload starting message
    alert('Starting document upload...');

    try {
      const formData = new FormData();
      formData.append('residency_verification_image', file);

      const { data } = await axiosInstance.post('/profile/upload-residency-verification', formData);

      // Update local UI immediately
      if (data?.image_path) {
        setUploadedImagePath(data.image_path);
        // Show success message
        alert('✅ Document uploaded successfully! Your verification is now pending admin review.');
      } else {
        // Fallback to local file object if backend didn't return a path
        setUploadedImagePath(file);
        alert('⚠️ Document uploaded but path not returned. Please contact support if issues persist.');
      }
      setOverrideStatus('pending');

      // Notify parent component (let parent refresh profile if desired)
      if (onImageUpload) {
        onImageUpload(data);
        console.log('Profile update triggered after document upload');
      }
    } catch (error) {
      console.error('Upload error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to upload image. Please try again.';
      setUploadError(errorMessage);
      
      // Show error alert with more details
      alert('❌ Upload Failed: ' + errorMessage + '\nPlease make sure you are logged in and try again.');
      
      // Log the error for debugging
      console.log('Upload error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data
      });
    } finally {
      setUploading(false);
    }
  };

  // 1) If residency is already verified, show approved status
  if (status === 'approved' || form.verification_status === 'approved') {
    console.log('Rendering approved state with:', { 
      status, 
      formStatus: form.verification_status,
      overrideStatus,
      imagePath,
      form
    });
    return (
      <div className="space-y-6">
        <StepTracker currentStep={2} />
        <div className="w-full bg-green-50 rounded-xl flex flex-col items-center py-8 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="relative">
              <CheckCircle className="w-8 h-8 text-green-600" />
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                <span className="text-white text-xs">✓</span>
              </div>
            </div>
            <h3 className="text-xl font-bold text-green-800">Residency Verified</h3>
          </div>
          <p className="text-sm text-green-600 mt-2 text-center mb-4">
            Your residency has been verified by the barangay administrators. You can now proceed with completing your profile.
          </p>
          <div className="mt-2 flex flex-col items-center">
            <div className="bg-green-100 border border-green-200 rounded-lg px-4 py-3 text-green-700 text-sm">
              <p className="font-semibold">✅ Verification Complete</p>
              <p>Approved on: {new Date().toLocaleDateString()}</p>
            </div>
            
            {/* Complete Profile Button */}
            <Link 
              to="/user/profile" 
              className="mt-4 bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-3 rounded-lg flex items-center gap-2 transition-all duration-200 shadow-md hover:shadow-lg"
              onClick={() => {
                console.log('Profile button clicked, current status:', {
                  status,
                  overrideStatus,
                  formStatus: form.verification_status
                });
              }}
            >
              <CheckCircle className="w-5 h-5" />
              Complete Your Profile Now
            </Link>
            
            {imagePath && (
              <div className="mt-4">
                <p className="text-sm text-green-600 font-medium mb-2">Verified Document:</p>
                <img 
                  src={getImageSrc(imagePath)} 
                  alt="Verified Document" 
                  className="w-48 h-48 object-cover rounded-lg border-4 border-green-200 shadow-lg"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // 2) If residency verification is denied, show a message with re-upload option
  if (form.verification_status === 'denied') {
    return (
      <div className="space-y-6">
        <StepTracker currentStep={1} />
        <div className="w-full bg-red-50 rounded-xl flex flex-col items-center py-8 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <XCircle className="w-8 h-8 text-red-600" />
            <h3 className="text-xl font-bold text-red-800">Residency Verification Denied</h3>
          </div>
          <p className="text-sm text-red-600 mt-2 text-center mb-4">
            Your residency verification has been denied by barangay administrators.
          </p>
          {form.denial_reason && (
            <div className="mt-4 p-4 bg-red-100 border border-red-300 rounded-lg mb-6 w-full max-w-md">
              <p className="text-sm font-semibold text-red-800">Reason for denial:</p>
              <p className="text-sm text-red-700">{form.denial_reason}</p>
            </div>
          )}

          {/* Re-upload section */}
          <div className="w-full max-w-md space-y-4">
            <p className="text-sm text-red-700 text-center font-medium">
              Please upload a new document that addresses the concerns mentioned above:
            </p>
            <label className="cursor-pointer bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all duration-200">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                disabled={uploading}
              />
              {uploading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-5 h-5" />
                  Re-upload Document
                </>
              )}
            </label>
            {uploadError && <p className="text-red-600 text-sm text-center">{uploadError}</p>}
          </div>
        </div>
      </div>
    );
  }

  // If there's no residency verification image and residency is not verified, show the upload prompt
  if (!imagePath) {
    return (
      <div className="space-y-6">
        <StepTracker currentStep={1} />
        <div id="residency-verification-section" className="w-full bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl flex flex-col items-center py-8 shadow-lg border-2 border-orange-200">
          <div className="flex items-center gap-3 mb-4">
            <AlertCircle className="w-10 h-10 text-orange-600" />
            <h3 className="text-2xl font-bold text-orange-800">Residency Verification Required</h3>
          </div>

          <div className="w-full max-w-2xl space-y-6">
            <div className="bg-white rounded-lg p-6 border border-orange-200 shadow-sm">
              <h4 className="text-lg font-semibold text-orange-800 mb-3">📋 What you need to upload:</h4>
              <ul className="text-sm text-orange-700 space-y-2">
                <li className="flex items-center gap-2"><span className="w-2 h-2 bg-orange-500 rounded-full"></span>Utility bill (electricity, water, internet)</li>
                <li className="flex items-center gap-2"><span className="w-2 h-2 bg-orange-500 rounded-full"></span>Lease agreement or rental contract</li>
                <li className="flex items-center gap-2"><span className="w-2 h-2 bg-orange-500 rounded-full"></span>Barangay certificate of residency</li>
                <li className="flex items-center gap-2"><span className="w-2 h-2 bg-orange-500 rounded-full"></span>Property deed or similar proof of residence</li>
              </ul>
            </div>

            <div className="bg-white rounded-lg p-6 border border-orange-200 shadow-sm">
              <div className="flex items-center justify-center w-full">
                <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-orange-300 border-dashed rounded-lg cursor-pointer bg-orange-50 hover:bg-orange-100 transition-all duration-200">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    {uploading ? (
                      <>
                        <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                        <p className="text-orange-600 font-semibold">Uploading document...</p>
                      </>
                    ) : (
                      <>
                        <Camera className="w-12 h-12 text-orange-500 mb-4" />
                        <p className="mb-2 text-sm text-orange-700 font-semibold">
                          <span>Click to upload your residency document</span>
                        </p>
                        <p className="text-xs text-orange-600">PNG, JPG or JPEG (MAX. 5MB)</p>
                      </>
                    )}
                  </div>
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" disabled={uploading} />
                </label>
              </div>

              {uploadError && (
                <div className="mt-4 p-3 bg-red-100 border border-red-300 rounded-lg">
                  <p className="text-red-700 text-sm">{uploadError}</p>
                </div>
              )}
            </div>

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
  }

  // Fallback: show the pending UI (image present, status unknown or pending)
  return (
    <div className="space-y-6">
      <StepTracker currentStep={1} />
      <div className="w-full bg-blue-50 rounded-xl flex flex-col items-center py-8 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="relative">
            <Clock className="w-8 h-8 text-blue-600" />
            {status === 'pending' && (
              <div className="absolute -bottom-1 -right-1">
                <span className="flex">
                  <span className={`animate-bounce inline-flex h-2 w-2 rounded-full bg-blue-400 opacity-75 ${pollingIndicator >= 0 ? 'opacity-100' : 'opacity-30'}`}></span>
                  <span className={`animate-bounce inline-flex h-2 w-2 rounded-full bg-blue-400 opacity-75 ml-1 ${pollingIndicator >= 1 ? 'opacity-100' : 'opacity-30'}`}></span>
                  <span className={`animate-bounce inline-flex h-2 w-2 rounded-full bg-blue-400 opacity-75 ml-1 ${pollingIndicator >= 2 ? 'opacity-100' : 'opacity-30'}`}></span>
                </span>
              </div>
            )}
          </div>
          <h3 className="text-xl font-bold text-blue-800">
            {status === 'pending' ? 'Verification Pending' : 'Verification Denied'}
          </h3>
        </div>
        <p className="text-sm text-blue-600 mt-2 text-center mb-4">
          {status === 'pending' ? (
            'Your residency verification is being reviewed by barangay administrators. This page will automatically update when approved.'
          ) : (
            <>
              <span className="font-semibold text-red-600">Verification denied:</span>{' '}
              {form.denial_reason || 'Please upload a new verification document.'}
            </>
          )}
        </p>
        <div className="w-full max-w-md space-y-4">
          <div className="bg-blue-100 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-5 h-5 text-blue-600" />
              <span className="text-blue-800 font-semibold text-sm">Document Uploaded</span>
            </div>
            <p className="text-blue-700 text-sm">
              {status === 'pending' ? 
                'Please wait for admin review. This page will refresh automatically when approved.' :
                'You can upload a new document to try again.'}
            </p>
          </div>

          <div className="text-center">
            <p className="text-blue-600 text-sm mb-3 font-medium">Uploaded Document:</p>
            <img src={getImageSrc(imagePath)} alt="Residency Verification" className="w-48 h-48 object-cover rounded-lg border-4 border-blue-400 shadow-lg mx-auto" />
            {status === 'denied' && (
              <div className="mt-4">
                <label htmlFor="verification-upload-retry" className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg cursor-pointer inline-flex items-center gap-2 transition-colors duration-200">
                  <Upload className="w-5 h-5" />
                  Upload New Document
                  <input
                    id="verification-upload-retry"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResidencyVerification;