import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Upload, Camera, AlertCircle, CheckCircle, Clock, XCircle, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import axiosInstance from '../../utils/axiosConfig';
import { useAuth } from '../../contexts/AuthContext';

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

// Enhanced Step Tracker Component - Perfect Placement and Design
const StepTracker = ({ currentStep = 1 }) => {
  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-6">
      <div className="flex items-center justify-center relative">
        {/* Progress Line - Behind circles */}
        <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gray-300 -translate-y-1/2"></div>
        
        {/* Step 1: Upload Document */}
        <div className="flex flex-col items-center relative z-10 bg-white px-3">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
            currentStep >= 1 
              ? 'bg-blue-500 text-white shadow-lg' 
              : 'bg-white border-2 border-gray-300 text-gray-500 shadow-sm'
          }`}>
            {currentStep > 1 ? (
              <CheckCircle className="w-6 h-6 text-white" />
            ) : (
              <span className="text-base font-bold">1</span>
            )}
          </div>
          <span className={`mt-3 text-sm font-medium text-center whitespace-nowrap ${
            currentStep >= 1 ? 'text-blue-600 font-semibold' : 'text-gray-500'
          }`}>
            Upload Document
          </span>
        </div>
        
        {/* Step 2: Document Under Review */}
        <div className="flex flex-col items-center relative z-10 bg-white px-3">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
            currentStep >= 2 
              ? 'bg-blue-500 text-white shadow-lg' 
              : 'bg-white border-2 border-gray-300 text-gray-500 shadow-sm'
          }`}>
            {currentStep > 2 ? (
              <CheckCircle className="w-6 h-6 text-white" />
            ) : (
              <span className="text-base font-bold">2</span>
            )}
          </div>
          <span className={`mt-3 text-sm font-medium text-center whitespace-nowrap ${
            currentStep >= 2 ? 'text-blue-600 font-semibold' : 'text-gray-500'
          }`}>
            Document Under Review
          </span>
        </div>
        
        {/* Step 3: Edit Profile */}
        <div className="flex flex-col items-center relative z-10 bg-white px-3">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
            currentStep >= 3 
              ? 'bg-blue-500 text-white shadow-lg' 
              : 'bg-white border-2 border-gray-300 text-gray-500 shadow-sm'
          }`}>
            {currentStep > 3 ? (
              <CheckCircle className="w-6 h-6 text-white" />
            ) : (
              <span className="text-base font-bold">3</span>
            )}
          </div>
          <span className={`mt-3 text-sm font-medium text-center whitespace-nowrap ${
            currentStep >= 3 ? 'text-blue-600 font-semibold' : 'text-gray-500'
          }`}>
            Edit Profile
          </span>
        </div>
        
        {/* Step 4: Profile Completion */}
        <div className="flex flex-col items-center relative z-10 bg-white px-3">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
            currentStep >= 4 
              ? 'bg-blue-500 text-white shadow-lg' 
              : 'bg-white border-2 border-gray-300 text-gray-500 shadow-sm'
          }`}>
            {currentStep > 4 ? (
              <CheckCircle className="w-6 h-6 text-white" />
            ) : (
              <span className="text-base font-bold">4</span>
            )}
          </div>
          <span className={`mt-3 text-sm font-medium text-center whitespace-nowrap ${
            currentStep >= 4 ? 'text-blue-600 font-semibold' : 'text-gray-500'
          }`}>
            Profile Completion
          </span>
        </div>
      </div>
    </div>
  );
};

// Professional Loading Component
const LoadingState = () => {
  return (
    <div className="space-y-8">
      <StepTracker currentStep={1} />
      <div className="w-full bg-gradient-to-br from-gray-50 via-slate-50 to-zinc-50 rounded-2xl flex flex-col items-center py-16 shadow-xl border border-gray-200 relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-32 h-32 bg-gray-300 rounded-full blur-2xl"></div>
          <div className="absolute bottom-20 right-20 w-40 h-40 bg-slate-300 rounded-full blur-2xl"></div>
        </div>
        
        {/* Loading Content */}
        <div className="relative z-10 flex flex-col items-center text-center">
          <div className="relative mb-8">
            <div className="w-24 h-24 bg-gradient-to-br from-gray-500 to-slate-600 rounded-full flex items-center justify-center shadow-lg">
              <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
            </div>
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full border-3 border-white flex items-center justify-center shadow-md animate-pulse">
              <span className="text-white text-sm font-bold">⏳</span>
            </div>
          </div>
          
          <div className="max-w-2xl">
            <h3 className="text-4xl font-bold text-gray-800 mb-4 bg-gradient-to-r from-gray-800 to-slate-600 bg-clip-text text-transparent">
              Loading Verification Status
            </h3>
            <p className="text-gray-600 text-xl font-semibold mb-6">
              Please wait while we check your verification status...
            </p>
            <p className="text-lg text-gray-700 leading-relaxed">
              We're retrieving your residency verification information to show you the correct status.
            </p>
          </div>
          
          {/* Loading Animation */}
          <div className="mt-8 flex items-center gap-2">
            <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full animate-bounce"></div>
            <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
            <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Beautiful Modal Component
const Modal = ({ isOpen, onClose, type, title, message, icon: Icon, showProfileButton = false, onProfileClick }) => {
  if (!isOpen) return null;

  const getModalStyles = () => {
    switch (type) {
      case 'success':
        return {
          bg: 'from-green-500 to-emerald-600',
          iconBg: 'bg-green-100',
          iconColor: 'text-green-600',
          buttonBg: 'from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700'
        };
      case 'error':
        return {
          bg: 'from-red-500 to-rose-600',
          iconBg: 'bg-red-100',
          iconColor: 'text-red-600',
          buttonBg: 'from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700'
        };
      case 'warning':
        return {
          bg: 'from-orange-500 to-amber-600',
          iconBg: 'bg-orange-100',
          iconColor: 'text-orange-600',
          buttonBg: 'from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700'
        };
      case 'info':
        return {
          bg: 'from-blue-500 to-indigo-600',
          iconBg: 'bg-blue-100',
          iconColor: 'text-blue-600',
          buttonBg: 'from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700'
        };
      default:
        return {
          bg: 'from-gray-500 to-gray-600',
          iconBg: 'bg-gray-100',
          iconColor: 'text-gray-600',
          buttonBg: 'from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700'
        };
    }
  };

  const styles = getModalStyles();

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md transform transition-all duration-300 scale-100">
        <div className={`bg-gradient-to-r ${styles.bg} rounded-t-2xl p-6`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 ${styles.iconBg} rounded-xl flex items-center justify-center`}>
                <Icon className={`w-6 h-6 ${styles.iconColor}`} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">{title}</h2>
                <p className="text-white/90 text-sm">Residency Verification</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-red-200 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-300 rounded-full p-1"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>
        
        <div className="p-6">
          <p className="text-gray-700 text-base leading-relaxed mb-6">
            {message}
          </p>
          
          <div className="flex justify-between items-center">
            {type === 'success' && title === 'Verification Approved!' && (
              <p className="text-sm text-gray-500">
                This modal will close automatically in a few seconds
              </p>
            )}
            <div className="flex gap-3">
              {showProfileButton && (
                <button
                  onClick={onProfileClick}
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg transition-all duration-300 transform hover:scale-105 flex items-center gap-2"
                >
                  <CheckCircle className="w-5 h-5" />
                  Edit Profile
                </button>
              )}
              <button
                onClick={onClose}
                className={`bg-gradient-to-r ${styles.buttonBg} text-white px-6 py-3 rounded-xl font-semibold shadow-lg transition-all duration-300 transform hover:scale-105`}
              >
                {type === 'success' && title === 'Verification Approved!' ? 'Continue' : 'Got it'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ResidencyVerification = ({ form = {}, onImageUpload, isFirstTime = false } = {}) => {
  const { user } = useAuth();
  
  // Get profile data from AuthContext user object
  const profileData = user?.profile || {};
  
  

  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  
  // Initialize local state with form data or profile data if available
  const [uploadedImagePath, setUploadedImagePath] = useState(() => {
    const initialPath = form.residency_verification_image || profileData.residency_verification_image || user?.profile?.residency_verification_image || null;
    return initialPath;
  });
  const [overrideStatus, setOverrideStatus] = useState(() => {
    const initialStatus = form.verification_status || profileData.verification_status || user?.profile?.verification_status || null;
    return initialStatus;
  });
  
  
  // Initialize loading state - show loading until we have meaningful data
  const [isLoading, setIsLoading] = useState(() => {
    // Always start with loading - we need to wait for data to be available
    return true;
  });
  const [dataLoaded, setDataLoaded] = useState(() => {
    // Start with false - data needs to be loaded
    return false;
  });
  const [imageLoadError, setImageLoadError] = useState(false);
  
  // Modal state
  const [modal, setModal] = useState({
    isOpen: false,
    type: 'info',
    title: '',
    message: '',
    icon: CheckCircle,
    showProfileButton: false
  });
  
  // Track previous status to detect changes
  const [previousStatus, setPreviousStatus] = useState(null);
  const [hasShownApprovalModal, setHasShownApprovalModal] = useState(false);

  // Auto-close modal after approval
  useEffect(() => {
    if (modal.isOpen && modal.type === 'success' && modal.title === 'Verification Approved!') {
      console.log('ResidencyVerification: Setting auto-close timer for approval modal');
      const timer = setTimeout(() => {
        console.log('ResidencyVerification: Auto-closing approval modal');
        closeModal();
      }, 3000); // Auto-close after 3 seconds

      return () => {
        console.log('ResidencyVerification: Clearing auto-close timer');
        clearTimeout(timer);
      };
    }
  }, [modal.isOpen, modal.type, modal.title]);

  // Prevent showing approval modal if already approved on component load
  useEffect(() => {
    const effectiveStatus = overrideStatus ?? form.verification_status ?? profileData.verification_status;
    if (effectiveStatus === 'approved' && modal.isOpen && modal.title === 'Verification Approved!') {
      closeModal();
    }
  }, [overrideStatus, form.verification_status, profileData.verification_status, modal.isOpen, modal.title]);

  // Helper function to show modal
  const showModal = (type, title, message, icon = CheckCircle) => {
    setModal({
      isOpen: true,
      type,
      title,
      message,
      icon
    });
  };

  const closeModal = () => {
    console.log('ResidencyVerification: Closing modal');
    setModal(prev => ({ ...prev, isOpen: false }));
    
    // Force a re-render to ensure step calculation updates
    setTimeout(() => {
      console.log('ResidencyVerification: Forcing re-render after modal close');
      setForceUpdate(prev => prev + 1);
    }, 100);
  };

  // Handle profile navigation
  const handleProfileClick = () => {
    closeModal();
    // Navigate to profile page
    window.location.href = '/user/profile';
  };

  // Function to handle denied verification state
  const handleDeniedVerification = useCallback(() => {
    // Clear the uploaded image path
    setUploadedImagePath(null);
    
    // Set status to denied
    setOverrideStatus('denied');
    
    // Reset image load error state
    setImageLoadError(false);
    
    // Show denial modal if we have a reason
    const denialReason = form.denial_reason || profileData.denial_reason;
    if (denialReason) {
      showModal('error', 'Verification Denied', `Your residency verification was denied. Reason: ${denialReason}`, XCircle);
    }
  }, [form.denial_reason, profileData.denial_reason, form.residency_verification_image, profileData.residency_verification_image, showModal]);

  // Handle form data changes and state restoration
  useEffect(() => {
    const hasFormData = Object.keys(form).length > 0;
    const hasProfileData = Object.keys(profileData).length > 0;
    
    // Check if verification status is denied
    const effectiveStatus = form.verification_status || profileData.verification_status;
    if (effectiveStatus === 'denied') {
      handleDeniedVerification();
      // Reset approval modal state when denied
      setHasShownApprovalModal(false);
      return; // Don't proceed with normal sync if denied
    }
    
    // If we receive form data or profile data, update loading state immediately
    if (hasFormData || hasProfileData) {
      // Always sync local state with form data or profile data to ensure consistency
      const effectiveImagePath = form.residency_verification_image || profileData.residency_verification_image;
      if (effectiveImagePath && effectiveImagePath !== uploadedImagePath) {
        setUploadedImagePath(effectiveImagePath);
        // Reset approval modal state when new image is uploaded
        setHasShownApprovalModal(false);
      }
      
      // Always sync verification status with form data or profile data
      if (effectiveStatus && effectiveStatus !== overrideStatus) {
        setOverrideStatus(effectiveStatus);
      }
      
      // Update loading state immediately if we have form data or profile data
      if (isLoading) {
        setIsLoading(false);
        setDataLoaded(true);
      }
    }
  }, [form, profileData, isLoading, dataLoaded, uploadedImagePath, overrideStatus, handleDeniedVerification]);

  // Check for denied status on component mount and data changes
  useEffect(() => {
    const effectiveStatus = overrideStatus ?? form.verification_status ?? profileData.verification_status;
    if (effectiveStatus === 'denied') {
      handleDeniedVerification();
    }
  }, [overrideStatus, form.verification_status, profileData.verification_status, handleDeniedVerification]);


  // Fallback timeout to prevent infinite loading
  useEffect(() => {
    if (isLoading) {
      const timeout = setTimeout(() => {
        console.log('ResidencyVerification: Loading timeout reached, stopping loading state');
        setIsLoading(false);
        setDataLoaded(true);
      }, 3000); // 3 second timeout

      return () => clearTimeout(timeout);
    }
  }, [isLoading]);

  // Effective values reflecting local upload success - prioritize database values
  const status = overrideStatus ?? form.verification_status ?? profileData.verification_status ?? user?.profile?.verification_status;
  
  // If status is denied, don't show any image (force new upload)
  const getEffectiveImagePath = () => {
    if (status === 'denied') {
      return null;
    }
    
    const path = uploadedImagePath ?? form.residency_verification_image ?? profileData.residency_verification_image;
    return path;
  };
  
  const imagePath = getEffectiveImagePath();

  // Reset image load error when image path changes
  useEffect(() => {
    setImageLoadError(false);
  }, [imagePath]);

  // Monitor data availability and update loading state
  useEffect(() => {
    // Check if we have meaningful data from any source
    const hasFormData = form && Object.keys(form).length > 0 && (form.verification_status !== null || form.residency_verification_image);
    const hasProfileData = profileData && Object.keys(profileData).length > 0 && (profileData.verification_status !== null || profileData.residency_verification_image);
    const hasUserProfileData = user?.profile && (user.profile.verification_status !== null || user.profile.residency_verification_image);
    
    console.log('ResidencyVerification: Data availability check:', {
      hasFormData,
      hasProfileData,
      hasUserProfileData,
      formKeys: form ? Object.keys(form).length : 0,
      profileDataKeys: profileData ? Object.keys(profileData).length : 0,
      userProfileKeys: user?.profile ? Object.keys(user.profile).length : 0,
      formVerificationStatus: form?.verification_status,
      formImage: form?.residency_verification_image,
      profileVerificationStatus: profileData?.verification_status,
      profileImage: profileData?.residency_verification_image,
      userVerificationStatus: user?.profile?.verification_status,
      userImage: user?.profile?.residency_verification_image,
      isLoading
    });
    
    // If we have any meaningful data, stop loading
    if (hasFormData || hasProfileData || hasUserProfileData) {
      console.log('ResidencyVerification: Found meaningful data, stopping loading');
      setIsLoading(false);
      setDataLoaded(true);
      
      // Sync data from available sources - prioritize form data
      if (hasFormData) {
        if (form.residency_verification_image && form.residency_verification_image !== imagePath) {
          setUploadedImagePath(form.residency_verification_image);
        }
        if (form.verification_status && form.verification_status !== overrideStatus) {
          setOverrideStatus(form.verification_status);
        }
      } else if (hasProfileData) {
        if (profileData.residency_verification_image && profileData.residency_verification_image !== imagePath) {
          setUploadedImagePath(profileData.residency_verification_image);
        }
        if (profileData.verification_status && profileData.verification_status !== overrideStatus) {
          setOverrideStatus(profileData.verification_status);
        }
      } else if (hasUserProfileData) {
        if (user.profile.residency_verification_image && user.profile.residency_verification_image !== imagePath) {
          setUploadedImagePath(user.profile.residency_verification_image);
        }
        if (user.profile.verification_status && user.profile.verification_status !== overrideStatus) {
          setOverrideStatus(user.profile.verification_status);
        }
      }
    }
  }, [user, form, profileData]); // Removed imagePath and overrideStatus from dependencies to prevent infinite loop

  // Check database on mount only if we don't have clear status from props/context
  useEffect(() => {
    const checkInitialStatus = async () => {
      // Only check database if we don't have a clear status from props/context
      const hasClearStatus = overrideStatus || form.verification_status || profileData.verification_status || user?.profile?.verification_status;
      
      if (!hasClearStatus && user) {
        try {
          const response = await axiosInstance.get('/profile');
          const profile = response.data?.user?.profile || response.data?.profile || response.data;
          
          if (profile?.verification_status) {
            setOverrideStatus(profile.verification_status);
            
            if (profile?.residency_verification_image) {
              setUploadedImagePath(profile.residency_verification_image);
            }
            
            if (onImageUpload) {
              onImageUpload(profile);
            }
            
            // If approved, force immediate UI update
            if (profile.verification_status === 'approved') {
              setDataLoaded(true);
              setIsLoading(false);
            }
          }
        } catch (error) {
          console.error('Error checking initial status:', error);
        }
      } else if (hasClearStatus) {
        // If we have clear status, ensure loading state is correct
        setIsLoading(false);
        setDataLoaded(true);
      }
    };
    
    // Only run if we have user data
    if (user) {
      checkInitialStatus();
    }
  }, [user]); // Run when user data becomes available

  // Handle case where we have pending status but no image - fetch from database
  useEffect(() => {
    const fetchMissingImage = async () => {
      const effectiveStatus = overrideStatus ?? form.verification_status ?? profileData.verification_status ?? user?.profile?.verification_status;
      const hasImage = imagePath && imagePath !== null && imagePath !== '';
      
      // If we have pending status but no image, try to fetch it
      if (effectiveStatus === 'pending' && !hasImage && user) {
        console.log('ResidencyVerification: Pending status but no image, fetching from database');
        try {
          const response = await axiosInstance.get('/profile');
          const profile = response.data?.user?.profile || response.data?.profile || response.data;
          
          if (profile?.residency_verification_image) {
            console.log('ResidencyVerification: Found image in database:', profile.residency_verification_image);
            setUploadedImagePath(profile.residency_verification_image);
          }
        } catch (error) {
          console.error('Error fetching missing image:', error);
        }
      }
    };
    
    fetchMissingImage();
  }, [overrideStatus, form.verification_status, profileData.verification_status, user?.profile?.verification_status, imagePath, user]);

  // Prevent component from resetting to Step 1 when data is available
  useEffect(() => {
    const hasAnyData = overrideStatus || form.verification_status || profileData.verification_status || user?.profile?.verification_status || imagePath;
    
    if (hasAnyData) {
      setIsLoading(false);
      setDataLoaded(true);
    }
  }, [overrideStatus, form.verification_status, profileData.verification_status, user?.profile?.verification_status, imagePath]);

  // Sync with form/profile data changes - prioritize approved status
  useEffect(() => {
    // Priority: Check for approved status first
    if (form.verification_status === 'approved' || profileData.verification_status === 'approved') {
      setOverrideStatus('approved');
      
      // Update image path if available
      const approvedImage = form.residency_verification_image || profileData.residency_verification_image;
      if (approvedImage) {
        setUploadedImagePath(approvedImage);
      }
      
      // Notify parent component
      if (onImageUpload) {
        const profileData = form.verification_status === 'approved' ? form : profileData;
        onImageUpload(profileData);
      }
    } else if (form.verification_status && form.verification_status !== overrideStatus) {
      setOverrideStatus(form.verification_status);
    } else if (profileData.verification_status && profileData.verification_status !== overrideStatus) {
      setOverrideStatus(profileData.verification_status);
    }
  }, [form.verification_status, profileData.verification_status, overrideStatus, onImageUpload]);

  // Force sync when form data changes - additional safety net
  useEffect(() => {
    if (form.residency_verification_image && form.residency_verification_image !== uploadedImagePath) {
      setUploadedImagePath(form.residency_verification_image);
    }
    if (form.verification_status && form.verification_status !== overrideStatus) {
      setOverrideStatus(form.verification_status);
    }
  }, [form.residency_verification_image, form.verification_status, uploadedImagePath, overrideStatus]);

  // Memoize the notification function to avoid dependency issues
  const notifyParentOfApproval = useCallback(() => {
    if (onImageUpload) {
      onImageUpload({ 
        verification_status: 'approved',
        residency_verification_image: imagePath,
        profile_completed: false // Ensure parent knows profile needs completion
      });
    }
  }, [onImageUpload, imagePath]);

  // Update loading state when status changes to approved
  useEffect(() => {
    const effectiveStatus = overrideStatus ?? form.verification_status ?? profileData.verification_status;
    if (effectiveStatus === 'approved') {
      setDataLoaded(true);
      setIsLoading(false);
      
      // Notify parent component of status change
      notifyParentOfApproval();
    }
  }, [overrideStatus, form.verification_status, profileData.verification_status, notifyParentOfApproval]);

  // Real-time status change detection and approval modal
  useEffect(() => {
    const effectiveStatus = overrideStatus ?? form.verification_status ?? profileData.verification_status;
    
    // Check if status changed from non-approved to approved
    if (effectiveStatus === 'approved' && 
        previousStatus && 
        previousStatus !== 'approved' && 
        !hasShownApprovalModal) {
      
      // Show approval modal with profile button
      setModal({
        isOpen: true,
        type: 'success',
        title: 'Verification Approved!',
        message: 'Congratulations! Your residency verification has been approved by the barangay administrators. You can now complete your profile to access all resident services.',
        icon: CheckCircle,
        showProfileButton: true
      });
      
      setHasShownApprovalModal(true);
      
      // Force immediate re-render to update step
      setForceUpdate(prev => prev + 1);
    }
    
    // Update previous status
    setPreviousStatus(effectiveStatus);
  }, [overrideStatus, form.verification_status, profileData.verification_status, previousStatus, hasShownApprovalModal]);
  const [pollingIndicator, setPollingIndicator] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [forceUpdate, setForceUpdate] = useState(0);

  // Helper function to determine current step based on state
  const getCurrentStep = () => {
    // If still loading, return step 1 to show loading state
    if (isLoading) {
      console.log('ResidencyVerification: Still loading, returning step 1');
      return 1;
    }
    
    // Use the corrected imagePath that already handles denied status
    // Check ALL possible status sources to ensure we catch database updates
    const effectiveStatus = overrideStatus ?? form.verification_status ?? profileData.verification_status ?? user?.profile?.verification_status;
    const hasImage = imagePath && imagePath !== null && imagePath !== '';
    
    console.log('ResidencyVerification: Step calculation:', {
      effectiveStatus,
      effectiveStatusType: typeof effectiveStatus,
      effectiveStatusLength: effectiveStatus?.length,
      hasImage,
      imagePath,
      overrideStatus,
      formVerificationStatus: form.verification_status,
      profileVerificationStatus: profileData.verification_status,
      userVerificationStatus: user?.profile?.verification_status,
      formImage: form.residency_verification_image,
      profileImage: profileData.residency_verification_image,
      userImage: user?.profile?.residency_verification_image
    });
    
    // PRIORITY: If status is denied, always return Step 1 regardless of image
    if (effectiveStatus === 'denied') {
      console.log('ResidencyVerification: Status denied, returning step 1');
      return 1; // Document denied, bounce back to step 1 (upload new)
    }
    
    // PRIORITY: If status is approved, always return Step 3 regardless of image
    if (effectiveStatus === 'approved' || effectiveStatus === 'Approved') {
      console.log('ResidencyVerification: Status approved, returning step 3');
      return 3; // Document approved, can edit profile
    }
    
    // Check if we have a valid image (regardless of status, unless denied/approved)
    const hasValidImage = hasImage || 
      (form.residency_verification_image && form.residency_verification_image !== '') ||
      (profileData.residency_verification_image && profileData.residency_verification_image !== '') ||
      (user?.profile?.residency_verification_image && user?.profile?.residency_verification_image !== '');
    
    // For Step 2: We need BOTH an image AND a pending status
    // This ensures new accounts without uploaded documents don't jump to Step 2
    const hasVerificationData = hasValidImage && effectiveStatus === 'pending';
    
    if (hasVerificationData) {
      console.log('ResidencyVerification: Has verification data with pending status, returning step 2');
      return 2; // Stay on Step 2 if we have verification data with pending status
    }
    
    console.log('ResidencyVerification: No verification data, returning step 1');
    return 1; // No verification data at all
  };

  // Memoize the current step calculation to prevent unnecessary re-calculations
  const currentStep = useMemo(() => {
    return getCurrentStep();
  }, [isLoading, overrideStatus, form.verification_status, profileData.verification_status, user?.profile?.verification_status, imagePath, form.residency_verification_image, profileData.residency_verification_image, user?.profile?.residency_verification_image, forceUpdate]);



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

  // Memoize the polling notification function
  const notifyParentOfPollingUpdate = useCallback((profile) => {
    if (onImageUpload) {
      onImageUpload(profile);
    }
  }, [onImageUpload]);

  // Manual refresh function
  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    try {
      // Try multiple endpoints to get the most up-to-date data
      const [profileResponse, statusResponse] = await Promise.allSettled([
        axiosInstance.get('/profile'),
        axiosInstance.get('/profile/status')
      ]);
      
      console.log('ResidencyVerification: Manual refresh - profile response:', profileResponse);
      console.log('ResidencyVerification: Manual refresh - status response:', statusResponse);
      
      let profile = null;
      let verificationStatus = null;
      
      // Get profile data
      if (profileResponse.status === 'fulfilled') {
        const profileData = profileResponse.value.data;
        profile = profileData?.user?.profile || profileData?.profile || profileData;
        console.log('ResidencyVerification: Manual refresh - profile data:', profile);
      }
      
      // Get status data
      if (statusResponse.status === 'fulfilled') {
        const statusData = statusResponse.value.data;
        verificationStatus = statusData?.verification_status;
        console.log('ResidencyVerification: Manual refresh - status data:', statusData);
      }
      
      // Use status from status endpoint if available, otherwise use profile data
      const finalStatus = verificationStatus || profile?.verification_status;
      console.log('ResidencyVerification: Manual refresh - final verification_status:', finalStatus);
      
      if (finalStatus) {
        console.log('ResidencyVerification: Manual refresh - updating status to:', finalStatus);
        setOverrideStatus(finalStatus);
        
        if (profile?.residency_verification_image) {
          setUploadedImagePath(profile.residency_verification_image);
        }
        
        setDataLoaded(true);
        setIsLoading(false);
        
        if (onImageUpload) {
          onImageUpload(profile || { verification_status: finalStatus });
        }
        
        // Force a re-render
        setForceUpdate(prev => prev + 1);
      } else {
        console.log('ResidencyVerification: Manual refresh - no verification_status found in any response');
      }
    } catch (error) {
      console.error('Error during manual refresh:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Enhanced real-time polling for status updates
  useEffect(() => {
    // Poll if we have an image and need to check for status changes
    if (imagePath) {
      const statusCheck = setInterval(async () => {
        try {
          // Try multiple endpoints to get the most up-to-date data
          const [profileResponse, statusResponse] = await Promise.allSettled([
            axiosInstance.get('/profile'),
            axiosInstance.get('/profile/status')
          ]);
          
          let profile = null;
          let verificationStatus = null;
          
          // Get profile data
          if (profileResponse.status === 'fulfilled') {
            const profileData = profileResponse.value.data;
            profile = profileData?.user?.profile || profileData?.profile || profileData;
          }
          
          // Get status data
          if (statusResponse.status === 'fulfilled') {
            const statusData = statusResponse.value.data;
            verificationStatus = statusData?.verification_status;
          }
          
          // Use status from status endpoint if available, otherwise use profile data
          const finalStatus = verificationStatus || profile?.verification_status;
          
          console.log('ResidencyVerification: Polling - final verification_status:', finalStatus);
          
          // Check if database shows approved status
          if (finalStatus === 'approved' || finalStatus === 'Approved') {
            console.log('ResidencyVerification: Polling detected approved status, updating UI');
            // Update state from database
            setOverrideStatus('approved');
            
            // Update image path if available
            if (profile?.residency_verification_image) {
              setUploadedImagePath(profile.residency_verification_image);
            }
            
            // Force UI update
            setDataLoaded(true);
            setIsLoading(false);
            
            // Update parent component
            notifyParentOfPollingUpdate(profile || { verification_status: 'approved' });
            
            // Force a re-render by updating the current step
            setTimeout(() => {
              console.log('ResidencyVerification: Forcing step recalculation after status update');
              setForceUpdate(prev => prev + 1);
            }, 100);
          } else if (finalStatus === 'denied' || finalStatus === 'Denied') {
            handleDeniedVerification();
            notifyParentOfPollingUpdate(profile || { verification_status: 'denied' });
          } else if (finalStatus === 'pending' || finalStatus === 'Pending') {
            // Update to pending status if it changed
            setOverrideStatus('pending');
            notifyParentOfPollingUpdate(profile || { verification_status: 'pending' });
          }
          
        } catch (error) {
          console.error('Error checking verification status:', error);
        }
      }, 3000); // Check every 3 seconds for faster response
      
      return () => {
        clearInterval(statusCheck);
      };
    }
  }, [imagePath, notifyParentOfPollingUpdate, handleDeniedVerification]);

  // Additional polling for any status changes (including from null to pending)
  useEffect(() => {
    // Poll if we have an image but no clear status yet
    if (imagePath && !status) {
      const statusCheck = setInterval(async () => {
        try {
          const response = await axiosInstance.get('/profile');
          const profile = response.data?.user?.profile || response.data?.profile;
          
          if (profile?.verification_status) {
            setOverrideStatus(profile.verification_status);
            
            if (profile?.residency_verification_image) {
              setUploadedImagePath(profile.residency_verification_image);
            }
            
            setDataLoaded(true);
            setIsLoading(false);
            notifyParentOfPollingUpdate(profile);
          }
          
        } catch (error) {
          console.error('Error checking verification status:', error);
        }
      }, 2000); // Check every 2 seconds for initial status
      
      return () => {
        clearInterval(statusCheck);
      };
    }
  }, [imagePath, status, notifyParentOfPollingUpdate]);

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
    
    // Show upload starting message
    showModal('info', 'Upload Starting', 'Starting document upload...', Upload);

    try {
      const formData = new FormData();
      formData.append('residency_verification_image', file);

      const { data } = await axiosInstance.post('/profile/upload-residency-verification', formData);

      // Update local UI immediately
      if (data?.image_path) {
        setUploadedImagePath(data.image_path);
        // Show success message
        showModal('success', 'Upload Successful!', 'Document uploaded successfully! Your verification is now pending admin review.', CheckCircle);
      } else {
        // Fallback to local file object if backend didn't return a path
        setUploadedImagePath(file);
        showModal('warning', 'Upload Warning', 'Document uploaded but path not returned. Please contact support if issues persist.', AlertCircle);
      }
      setOverrideStatus('pending');

      // Notify parent component (let parent refresh profile if desired)
      if (onImageUpload) {
        onImageUpload(data);
      }
    } catch (error) {
      console.error('Upload error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to upload image. Please try again.';
      setUploadError(errorMessage);
      
      // Show error alert with more details
      showModal('error', 'Upload Failed', errorMessage + '\n\nPlease make sure you are logged in and try again.', XCircle);
    } finally {
      setUploading(false);
    }
  };


  // Show loading state while data is being initialized
  // Show loading if we're still loading OR if we don't have any data at all
  const hasAnyData = overrideStatus || form.verification_status || profileData.verification_status || user?.profile?.verification_status || imagePath || Object.keys(form).length > 0 || Object.keys(profileData).length > 0;
  
  if (isLoading) {
    return <LoadingState />;
  }


  // Ensure loading state is correct based on available data
  if (hasAnyData && isLoading) {
    setIsLoading(false);
    setDataLoaded(true);
  }

  // Check if we have any verification data - use same logic as getCurrentStep
  const hasValidStatus = (overrideStatus && overrideStatus !== '') || 
    (form.verification_status && form.verification_status !== '') || 
    (profileData.verification_status && profileData.verification_status !== '') || 
    (user?.profile?.verification_status && user?.profile?.verification_status !== '');
  const hasValidImage = (imagePath && imagePath !== '') || 
    (form.residency_verification_image && form.residency_verification_image !== '') || 
    (profileData.residency_verification_image && profileData.residency_verification_image !== '') || 
    (user?.profile?.residency_verification_image && user?.profile?.residency_verification_image !== '');
  
  // For general verification data check: any status OR any image
  const hasAnyVerificationData = hasValidStatus || hasValidImage;


  // 1) If residency is already verified, show approved status
  // Check ALL possible sources for approved status to ensure database connection
  const isApproved = status === 'approved' || 
                    form.verification_status === 'approved' || 
                    profileData.verification_status === 'approved' ||
                    user?.profile?.verification_status === 'approved';
                    
  if (isApproved) {
    return (
      <div className="space-y-8">
        
        <StepTracker currentStep={currentStep} />
        <div className="w-full bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 rounded-2xl flex flex-col items-center py-12 shadow-xl border border-green-200">
          <div className="flex items-center gap-4 mb-6">
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center shadow-lg">
                <CheckCircle className="w-10 h-10 text-white" />
              </div>
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full border-3 border-white flex items-center justify-center shadow-md animate-bounce">
                <span className="text-white text-sm font-bold">✓</span>
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-green-800 mb-1">Residency Verified</h3>
              <p className="text-green-600 text-sm">Successfully approved by administrators</p>
            </div>
          </div>
          <p className="text-sm text-green-600 mt-2 text-center mb-4">
            Your residency has been verified by the barangay administrators. You can now proceed with completing your profile.
          </p>
          <div className="mt-2 flex flex-col items-center">
            <div className="bg-gradient-to-r from-green-100 to-emerald-100 border-2 border-green-300 rounded-xl px-6 py-4 text-green-800 shadow-md">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-white" />
                </div>
                <p className="font-bold text-lg">Verification Complete</p>
              </div>
              <p className="text-green-700">Approved on: {new Date().toLocaleDateString()}</p>
            </div>
            
            {/* Enhanced Complete Profile Button */}
            <Link 
              to="/user/profile" 
              className="mt-6 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold px-8 py-4 rounded-xl flex items-center gap-3 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <CheckCircle className="w-6 h-6" />
              Complete Your Profile Now
            </Link>
            
            {imagePath && !imageLoadError ? (
              <div className="mt-4">
                <p className="text-sm text-green-600 font-medium mb-2">Verified Document:</p>
                <img 
                  src={getImageSrc(imagePath)} 
                  alt="Verified Document" 
                  className="w-48 h-48 object-cover rounded-lg border-4 border-green-200 shadow-lg"
                  onError={(e) => {
                    setImageLoadError(true);
                  }}
                  onLoad={() => {
                    setImageLoadError(false);
                  }}
                />
              </div>
            ) : (
              <div className="mt-4">
                <p className="text-sm text-green-600 font-medium mb-2">Verified Document:</p>
                <div className="w-48 h-48 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border-4 border-green-200 shadow-lg flex flex-col items-center justify-center">
                  <CheckCircle className="w-12 h-12 text-green-400 mb-2" />
                  <p className="text-green-600 font-semibold text-sm text-center px-2">
                    Document Verified
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // 2) If residency verification is denied, show upload state (Step 1) with denial notice
  if (status === 'denied' || form.verification_status === 'denied') {
    return (
      <div className="space-y-8">
        
        <StepTracker currentStep={currentStep} />
        
        {/* Denial Notice */}
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
          
          {form.denial_reason && (
            <div className="mt-4 p-4 bg-red-100 border border-red-300 rounded-lg w-full max-w-md">
              <p className="text-sm font-semibold text-red-800 mb-2">Reason for denial:</p>
              <p className="text-sm text-red-700">{form.denial_reason}</p>
            </div>
          )}
        </div>
        
        {/* Upload Section - Same as Step 1 */}
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
              <h3 className="text-3xl font-bold text-orange-800 mb-1">Upload New Document</h3>
              <p className="text-orange-600 text-sm">Please upload a new residency verification document</p>
            </div>
          </div>

          <div className="w-full max-w-2xl space-y-6">
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
                          Click to upload your new residency document
                        </p>
                        <p className="text-sm text-orange-600 bg-orange-200 px-4 py-2 rounded-full">
                          PNG, JPG or JPEG (MAX. 5MB)
                        </p>
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

  // If there's no residency verification image, show the upload prompt
  // Only exclude if status is denied (which has its own UI)
  // Also check if we're actually on step 1 (no verification data at all)
  if (!imagePath && status !== 'denied' && currentStep === 1) {
    return (
      <div className="space-y-8">
        
        <StepTracker currentStep={currentStep} />
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
              <h3 className="text-3xl font-bold text-orange-800 mb-1">Residency Verification Required</h3>
              <p className="text-orange-600 text-sm">Upload a document to verify your residency</p>
            </div>
          </div>

          <div className="w-full max-w-2xl space-y-6">
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

  // If we have an image and are on step 2 (Document Under Review), show the pending UI
  if (imagePath && currentStep === 2) {
    return (
      <div className="space-y-8">
        
        <StepTracker currentStep={currentStep} />
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
                    onLoad={(e) => {
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
        
        {/* Beautiful Modal */}
        <Modal
          isOpen={modal.isOpen}
          onClose={closeModal}
          type={modal.type}
          title={modal.title}
          message={modal.message}
          icon={modal.icon}
          showProfileButton={modal.showProfileButton}
          onProfileClick={handleProfileClick}
        />
      </div>
    );
  }

  // Fallback: show the pending UI (image present, status unknown or pending)
  return (
    <div className="space-y-8">
      
      <StepTracker currentStep={currentStep} />
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
                {status === 'pending' ? 'Verification Pending' : 'Verification Denied'}
              </h3>
              <p className="text-blue-600 text-xl font-semibold mb-6">
                {status === 'pending' ? 'Your document is under review' : 'Please upload a new document'}
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
                    <span className="font-semibold text-red-600">Verification denied:</span>{' '}
                    {form.denial_reason || 'Please upload a new verification document.'}
                  </>
                )}
              </p>
              
              {/* Manual Refresh Button for pending status */}
              {status === 'pending' && (
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
              )}
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
                    'You can upload a new document to try again.'
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
                  onLoad={(e) => {
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
            {status === 'denied' && (
              <div className="mt-6">
                <label htmlFor="verification-upload-retry" className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-3 rounded-xl cursor-pointer inline-flex items-center gap-3 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 font-semibold">
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
      
      {/* Beautiful Modal */}
      <Modal
        isOpen={modal.isOpen}
        onClose={closeModal}
        type={modal.type}
        title={modal.title}
        message={modal.message}
        icon={modal.icon}
        showProfileButton={modal.showProfileButton}
        onProfileClick={handleProfileClick}
      />
    </div>
  );
};

export default ResidencyVerification;