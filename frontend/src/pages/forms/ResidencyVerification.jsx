import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { CheckCircle, XCircle, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import axiosInstance from '../../utils/axiosConfig';
import { useAuth } from '../../contexts/AuthContext';
import { DocumentUpload, VerificationPending } from '../verification-pages';

// ImageFallback component moved to individual verification components

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
  
  

  // Upload state moved to DocumentUpload component
  
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

  // Modal auto-close functionality removed - user must manually close the modal

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

  // Memoize data availability check to prevent unnecessary re-calculations
  const dataAvailability = useMemo(() => {
    const hasFormData = form && Object.keys(form).length > 0 && (form.verification_status !== null || form.residency_verification_image);
    const hasProfileData = profileData && Object.keys(profileData).length > 0 && (profileData.verification_status !== null || profileData.residency_verification_image);
    const hasUserProfileData = user?.profile && (user.profile.verification_status !== null || user.profile.residency_verification_image);
    
    return {
      hasFormData,
      hasProfileData,
      hasUserProfileData,
      hasAnyData: hasFormData || hasProfileData || hasUserProfileData
    };
  }, [form, profileData, user?.profile]);

  // Monitor data availability and update loading state - only when data availability changes
  useEffect(() => {
    const { hasFormData, hasProfileData, hasUserProfileData, hasAnyData } = dataAvailability;
    
    // Only log and update if we're still loading and have data
    if (isLoading && hasAnyData) {
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
      
      console.log('ResidencyVerification: Found meaningful data, stopping loading');
      setIsLoading(false);
      setDataLoaded(true);
    }
  }, [dataAvailability, isLoading]); // Only depend on data availability and loading state

  // Sync data from available sources - separate effect for data syncing
  useEffect(() => {
    const { hasFormData, hasProfileData, hasUserProfileData, hasAnyData } = dataAvailability;
    
    if (hasAnyData) {
      // Helper function to check if we should update status (prevent downgrading from approved)
      const shouldUpdateStatus = (newStatus, currentStatus) => {
        if (!newStatus || newStatus === currentStatus) return false;
        // Don't override approved status with pending or denied
        if (currentStatus === 'approved' && (newStatus === 'pending' || newStatus === 'denied')) return false;
        return true;
      };
      
      if (hasFormData) {
        if (form.residency_verification_image && form.residency_verification_image !== imagePath) {
          setUploadedImagePath(form.residency_verification_image);
        }
        if (shouldUpdateStatus(form.verification_status, overrideStatus)) {
          setOverrideStatus(form.verification_status);
        }
      } else if (hasProfileData) {
        if (profileData.residency_verification_image && profileData.residency_verification_image !== imagePath) {
          setUploadedImagePath(profileData.residency_verification_image);
        }
        if (shouldUpdateStatus(profileData.verification_status, overrideStatus)) {
          setOverrideStatus(profileData.verification_status);
        }
      } else if (hasUserProfileData) {
        if (user.profile.residency_verification_image && user.profile.residency_verification_image !== imagePath) {
          setUploadedImagePath(user.profile.residency_verification_image);
        }
        if (shouldUpdateStatus(user.profile.verification_status, overrideStatus)) {
          setOverrideStatus(user.profile.verification_status);
        }
      }
    }
  }, [dataAvailability, imagePath, overrideStatus]); // Separate effect for syncing

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
  // This is now handled by the main data availability useEffect above
  // Keeping this as a safety net but without redundant state updates
  useEffect(() => {
    const hasAnyData = overrideStatus || form.verification_status || profileData.verification_status || user?.profile?.verification_status || imagePath;
    
    if (hasAnyData && isLoading) {
      // Only update if we're still loading and have data
      setIsLoading(false);
      setDataLoaded(true);
    }
  }, [overrideStatus, form.verification_status, profileData.verification_status, user?.profile?.verification_status, imagePath, isLoading]);

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
  const [forceUpdate, setForceUpdate] = useState(0);
  // pollingIndicator and isRefreshing moved to VerificationPending component

  // Helper function to determine current step based on state
  const getCurrentStep = () => {
    // If still loading, return step 1 to show loading state
    if (isLoading) {
      return 1;
    }
    
    // Use the corrected imagePath that already handles denied status
    // Check ALL possible status sources to ensure we catch database updates
    const effectiveStatus = overrideStatus ?? form.verification_status ?? profileData.verification_status ?? user?.profile?.verification_status;
    const hasImage = imagePath && imagePath !== null && imagePath !== '';
    
    // PRIORITY: If status is denied, always return Step 1 regardless of image
    if (effectiveStatus === 'denied') {
      return 1; // Document denied, bounce back to step 1 (upload new)
    }
    
    // PRIORITY: If status is approved, always return Step 3 regardless of image
    if (effectiveStatus === 'approved' || effectiveStatus === 'Approved') {
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
      return 2; // Stay on Step 2 if we have verification data with pending status
    }
    
    return 1; // No verification data at all
  };

  // Memoize the current step calculation to prevent unnecessary re-calculations
  const currentStep = useMemo(() => {
    return getCurrentStep();
  }, [isLoading, overrideStatus, form.verification_status, profileData.verification_status, user?.profile?.verification_status, imagePath, form.residency_verification_image, profileData.residency_verification_image, user?.profile?.residency_verification_image, forceUpdate]);

  // Debug step calculation changes - only logs when step actually changes
  useEffect(() => {
    const effectiveStatus = overrideStatus ?? form.verification_status ?? profileData.verification_status ?? user?.profile?.verification_status;
    const hasImage = imagePath && imagePath !== null && imagePath !== '';
    
    console.log('ResidencyVerification: Step calculation changed:', {
      currentStep,
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
  }, [currentStep, overrideStatus, form.verification_status, profileData.verification_status, user?.profile?.verification_status, imagePath, form.residency_verification_image, profileData.residency_verification_image, user?.profile?.residency_verification_image]);



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

  // handleManualRefresh function moved to VerificationPending component

  // Enhanced real-time polling for status updates
  useEffect(() => {
    // Poll if we have an image and need to check for status changes
    if (imagePath) {
      console.log('ResidencyVerification: Starting polling for status updates');
      
      const statusCheck = setInterval(async () => {
        try {
          console.log('ResidencyVerification: Polling check - checking for status updates');
          
          // Try multiple endpoints to get the most up-to-date data
          const [profileResponse, statusResponse] = await Promise.allSettled([
            axiosInstance.get('/profile'),
            axiosInstance.get('/profile-status')
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
          const currentStatus = overrideStatus ?? form.verification_status ?? profileData.verification_status ?? user?.profile?.verification_status;
          
          console.log('ResidencyVerification: Polling - current status:', currentStatus, 'final status:', finalStatus);
          
          // Check if database shows approved status and it's different from current
          if ((finalStatus === 'approved' || finalStatus === 'Approved') && currentStatus !== 'approved') {
            console.log('ResidencyVerification: Polling detected approved status change, updating UI');
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
          } else if ((finalStatus === 'denied' || finalStatus === 'Denied') && currentStatus !== 'denied') {
            console.log('ResidencyVerification: Polling detected denied status change');
            handleDeniedVerification();
            notifyParentOfPollingUpdate(profile || { verification_status: 'denied' });
          } else if ((finalStatus === 'pending' || finalStatus === 'Pending') && currentStatus !== 'pending') {
            console.log('ResidencyVerification: Polling detected pending status change');
            // Update to pending status if it changed
            setOverrideStatus('pending');
            notifyParentOfPollingUpdate(profile || { verification_status: 'pending' });
          }
          
        } catch (error) {
          console.error('Error checking verification status:', error);
        }
      }, 3000); // Check every 3 seconds for faster response
      
      return () => {
        console.log('ResidencyVerification: Stopping polling for status updates');
        clearInterval(statusCheck);
      };
    }
  }, [imagePath, notifyParentOfPollingUpdate, handleDeniedVerification, overrideStatus, form.verification_status, profileData.verification_status, user?.profile?.verification_status]);

  // Additional polling for any status changes (including from null to pending)
  useEffect(() => {
    // Poll if we have an image but no clear status yet
    if (imagePath && !status) {
      console.log('ResidencyVerification: Starting additional polling for initial status');
      
      const statusCheck = setInterval(async () => {
        try {
          console.log('ResidencyVerification: Additional polling check - checking for initial status');
          
          const response = await axiosInstance.get('/profile');
          const profile = response.data?.user?.profile || response.data?.profile;
          
          if (profile?.verification_status) {
            console.log('ResidencyVerification: Additional polling found status:', profile.verification_status);
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
        console.log('ResidencyVerification: Stopping additional polling');
        clearInterval(statusCheck);
      };
    }
  }, [imagePath, status, notifyParentOfPollingUpdate]);

  // Universal polling for status changes - runs regardless of current status
  useEffect(() => {
    // Only poll if we have an image (meaning user has uploaded something)
    if (imagePath) {
      console.log('ResidencyVerification: Starting universal polling for any status changes');
      
      const universalPolling = setInterval(async () => {
        try {
          console.log('ResidencyVerification: Universal polling check - checking for any status changes');
          
          const response = await axiosInstance.get('/profile');
          const profile = response.data?.user?.profile || response.data?.profile || response.data;
          const currentStatus = overrideStatus ?? form.verification_status ?? profileData.verification_status ?? user?.profile?.verification_status;
          const newStatus = profile?.verification_status;
          
          console.log('ResidencyVerification: Universal polling - current:', currentStatus, 'new:', newStatus);
          
          // Only update if status actually changed
          if (newStatus && newStatus !== currentStatus) {
            console.log('ResidencyVerification: Universal polling detected status change from', currentStatus, 'to', newStatus);
            
            setOverrideStatus(newStatus);
            
            if (profile?.residency_verification_image) {
              setUploadedImagePath(profile.residency_verification_image);
            }
            
            setDataLoaded(true);
            setIsLoading(false);
            notifyParentOfPollingUpdate(profile);
            
            // Force re-render
            setTimeout(() => {
              setForceUpdate(prev => prev + 1);
            }, 100);
          }
          
        } catch (error) {
          console.error('Error in universal polling:', error);
        }
      }, 5000); // Check every 5 seconds
      
      return () => {
        console.log('ResidencyVerification: Stopping universal polling');
        clearInterval(universalPolling);
      };
    }
  }, [imagePath, overrideStatus, form.verification_status, profileData.verification_status, user?.profile?.verification_status, notifyParentOfPollingUpdate]);

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

  // handleImageUpload function moved to DocumentUpload component


  // Show loading state while data is being initialized
  // Show loading if we're still loading OR if we don't have any data at all
  const hasAnyData = overrideStatus || form.verification_status || profileData.verification_status || user?.profile?.verification_status || imagePath || Object.keys(form).length > 0 || Object.keys(profileData).length > 0;
  
  if (isLoading) {
    return <LoadingState />;
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
        <DocumentUpload 
          onUploadSuccess={(data) => {
            setUploadedImagePath(data.imagePath);
            setOverrideStatus(data.status);
            if (onImageUpload) {
              onImageUpload(data);
            }
          }}
          onUploadError={(error) => {
            console.error('Upload error:', error);
          }}
          showDenialNotice={true}
          denialReason={form.denial_reason}
          isRetry={true}
        />
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
        <DocumentUpload 
          onUploadSuccess={(data) => {
            setUploadedImagePath(data.imagePath);
            setOverrideStatus(data.status);
            if (onImageUpload) {
              onImageUpload(data);
            }
          }}
          onUploadError={(error) => {
            console.error('Upload error:', error);
          }}
          showDenialNotice={false}
          isRetry={false}
        />
      </div>
    );
  }

  // If we have an image and are on step 2 (Document Under Review), show the pending UI
  if (imagePath && currentStep === 2) {
    return (
      <div className="space-y-8">
        <StepTracker currentStep={currentStep} />
        <VerificationPending 
          imagePath={imagePath}
          status={status}
          onStatusChange={(data) => {
            setOverrideStatus(data.status);
            if (data.imagePath) {
              setUploadedImagePath(data.imagePath);
            }
            if (onImageUpload) {
              onImageUpload(data.profile || data);
            }
          }}
          onRefresh={(profile) => {
            if (onImageUpload) {
              onImageUpload(profile);
            }
          }}
          denialReason={form.denial_reason}
        />
        
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
      <VerificationPending 
        imagePath={imagePath}
        status={status}
        onStatusChange={(data) => {
          setOverrideStatus(data.status);
          if (data.imagePath) {
            setUploadedImagePath(data.imagePath);
          }
          if (onImageUpload) {
            onImageUpload(data.profile || data);
          }
        }}
        onRefresh={(profile) => {
          if (onImageUpload) {
            onImageUpload(profile);
          }
        }}
        denialReason={form.denial_reason}
      />
      
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