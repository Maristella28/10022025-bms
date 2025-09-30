import React, { useState, useEffect, useCallback } from 'react';
import { Clock, CheckCircle, Camera, XCircle } from 'lucide-react';
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

const VerificationPending = ({ 
  imagePath, 
  status = 'pending',
  onStatusChange,
  onRefresh,
  denialReason = null 
}) => {
  const [pollingIndicator, setPollingIndicator] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
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

  // Visual indicator for polling
  useEffect(() => {
    if (status === 'pending') {
      const timer = setInterval(() => {
        setPollingIndicator(prev => (prev + 1) % 3);
      }, 1000);
      
      return () => {
        clearInterval(timer);
      };
    }
  }, [status, imagePath]);

  // Manual refresh function
  const handleManualRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      // Try multiple endpoints to get the most up-to-date data
      const [profileResponse, statusResponse] = await Promise.allSettled([
        axiosInstance.get('/profile'),
        axiosInstance.get('/profile-status')
      ]);
      
      console.log('VerificationPending: Manual refresh - profile response:', profileResponse);
      console.log('VerificationPending: Manual refresh - status response:', statusResponse);
      
      let profile = null;
      let verificationStatus = null;
      
      // Get profile data
      if (profileResponse.status === 'fulfilled') {
        const profileData = profileResponse.value.data;
        profile = profileData?.user?.profile || profileData?.profile || profileData;
        console.log('VerificationPending: Manual refresh - profile data:', profile);
      }
      
      // Get status data
      if (statusResponse.status === 'fulfilled') {
        const statusData = statusResponse.value.data;
        verificationStatus = statusData?.verification_status;
        console.log('VerificationPending: Manual refresh - status data:', statusData);
      }
      
      // Use status from status endpoint if available, otherwise use profile data
      const finalStatus = verificationStatus || profile?.verification_status;
      console.log('VerificationPending: Manual refresh - final verification_status:', finalStatus);
      
      if (finalStatus && onStatusChange) {
        console.log('VerificationPending: Manual refresh - updating status to:', finalStatus);
        onStatusChange({
          status: finalStatus,
          imagePath: profile?.residency_verification_image || imagePath,
          profile: profile
        });
      }
      
      if (onRefresh) {
        onRefresh(profile || { verification_status: finalStatus });
      }
    } catch (error) {
      console.error('Error during manual refresh:', error);
    } finally {
      setIsRefreshing(false);
    }
  }, [imagePath, onStatusChange, onRefresh]);

  // Reset image load error when image path changes
  useEffect(() => {
    setImageLoadError(false);
  }, [imagePath]);

  return (
    <div className="space-y-8">
      <div className="w-full bg-gradient-to-br from-blue-50 via-sky-50 to-indigo-50 rounded-2xl flex flex-col items-center py-16 shadow-xl border border-blue-200 relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-32 h-32 bg-blue-300 rounded-full blur-2xl"></div>
          <div className="absolute bottom-20 right-20 w-40 h-40 bg-indigo-300 rounded-full blur-2xl"></div>
        </div>
        
        {/* Header Section */}
        <div className="relative z-10 flex flex-col items-center text-center mb-12">
          <div className="relative mb-8">
            <div className="w-24 h-24 bg-blue-500 rounded-full flex items-center justify-center shadow-lg relative">
              <Clock className="w-12 h-12 text-white" />
            </div>
            {status === 'pending' && (
              <div className="absolute -top-2 -right-2">
                <div className="flex space-x-1">
                  <span className={`animate-bounce inline-flex h-3 w-3 rounded-full bg-blue-500 ${pollingIndicator >= 0 ? 'opacity-100' : 'opacity-30'}`}></span>
                  <span className={`animate-bounce inline-flex h-3 w-3 rounded-full bg-blue-500 ${pollingIndicator >= 1 ? 'opacity-100' : 'opacity-30'}`}></span>
                  <span className={`animate-bounce inline-flex h-3 w-3 rounded-full bg-blue-500 ${pollingIndicator >= 2 ? 'opacity-100' : 'opacity-30'}`}></span>
                </div>
              </div>
            )}
          </div>
          
          <div className="max-w-2xl">
            <h3 className="text-4xl font-bold text-blue-800 mb-4 bg-gradient-to-r from-blue-800 to-blue-600 bg-clip-text text-transparent">
              {status === 'pending' ? 'Verification Pending' : 'Document Under Review'}
            </h3>
            <p className="text-blue-600 text-xl font-semibold mb-6">
              {status === 'pending' ? 'Your document is under review' : 'Please wait for admin review'}
            </p>
            <p className="text-lg text-blue-700 leading-relaxed">
              {status === 'pending' ? (
                <>
                  Your residency verification is being reviewed by barangay administrators. 
                  <span className="block mt-2 text-sm text-blue-600 font-medium">
                    🔄 Checking for updates every 3 seconds...
                  </span>
                </>
              ) : (
                <>
                  Your document has been uploaded and is waiting for review by barangay administrators.
                  <span className="block mt-2 text-sm text-blue-600 font-medium">
                    🔄 We'll check for updates automatically...
                  </span>
                </>
              )}
            </p>
            
            {/* Manual Refresh Button */}
            <div className="mt-6">
              <button
                onClick={handleManualRefresh}
                disabled={isRefreshing}
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-500 text-white px-6 py-3 rounded-xl font-semibold shadow-lg transition-all duration-300 transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isRefreshing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Refreshing...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Check Status Now
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
        
        {/* Document Status Card */}
        <div className="relative z-10 w-full max-w-2xl space-y-8">
          <div className="bg-gradient-to-r from-blue-100 to-sky-100 border-2 border-blue-200 rounded-2xl p-8 shadow-lg relative overflow-hidden">
            {/* Card background pattern */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-200/30 to-transparent rounded-full -translate-y-12 translate-x-12"></div>
            
            <div className="relative z-10 flex items-center gap-5">
              <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center shadow-lg">
                <CheckCircle className="w-7 h-7 text-white" />
              </div>
              <div>
                <h4 className="text-xl font-bold text-blue-800 mb-2">Document Uploaded</h4>
                <p className="text-blue-600 text-base leading-relaxed">
                  {status === 'pending' ? (
                    <>
                      Please wait for <span className="underline decoration-blue-400 decoration-2 underline-offset-2">admin review</span>. The status will update automatically when approved.
                    </>
                  ) : (
                    'Your document is in the review queue. We\'ll notify you when the review is complete.'
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Document Preview Section */}
          <div className="text-center">
            <h4 className="text-xl font-bold text-blue-800 mb-6 flex items-center justify-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-md">
                <Camera className="w-5 h-5 text-white" />
              </div>
              Uploaded Document
            </h4>
            
            <div className="relative inline-block group">
              {imagePath && !imageLoadError && status !== 'denied' ? (
                <img 
                  src={getImageSrc(imagePath)} 
                  alt="Residency Verification" 
                  className="w-80 h-80 object-cover rounded-2xl border-4 border-blue-300 shadow-2xl mx-auto hover:shadow-3xl transition-all duration-300 transform hover:scale-105" 
                  onError={(e) => {
                    setImageLoadError(true);
                    
                    // Try alternative URL construction if the first one fails
                    const alternativeUrl = `http://localhost:8000/storage/${imagePath}`;
                    if (e.target.src !== alternativeUrl) {
                      e.target.src = alternativeUrl;
                    }
                  }}
                  onLoad={() => {
                    setImageLoadError(false);
                  }}
                />
              ) : (
                <ImageFallback status={status} isDenied={status === 'denied'} />
              )}
              {status === 'pending' && (
                <div className="absolute top-4 right-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg flex items-center gap-2">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  Under Review
                </div>
              )}
              
              {/* Subtle overlay on hover */}
              <div className="absolute inset-0 bg-gradient-to-t from-blue-900/10 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerificationPending;
