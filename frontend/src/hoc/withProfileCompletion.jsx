import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axiosInstance from '../utils/axiosConfig';
import { isProfileComplete } from '../utils/profileValidation';

const withProfileCompletion = (WrappedComponent) => {
  return function WithProfileCompletionComponent(props) {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [profileComplete, setProfileComplete] = useState(false);

    useEffect(() => {
      const checkProfile = async () => {
        try {
          const response = await axiosInstance.get('/profile');
          const profile = response.data;
          
          // Primary check: If backend says profile_completed is true, treat as complete
          const backendComplete = profile.profile_completed === true || profile.profile_completed === 1 || profile.profile_completed === '1';
          
          // Secondary check: If verification is approved and has essential fields
          const verificationApproved = profile.verification_status === 'approved';
          let fieldValidationComplete = false;
          
          if (verificationApproved) {
            const hasEssentialFields = profile.first_name && profile.last_name && profile.current_address;
            const hasPhoto = profile.current_photo || profile.avatar;
            const hasResidencyImage = profile.residency_verification_image;
            fieldValidationComplete = hasEssentialFields && hasPhoto && hasResidencyImage;
          }
          
          // Use backend flag as primary indicator, fallback to field validation
          const complete = backendComplete || fieldValidationComplete;
          
          console.log('Profile completion check:', {
            backendComplete,
            verificationApproved,
            fieldValidationComplete,
            finalResult: complete,
            profile_completed: profile.profile_completed,
            verification_status: profile.verification_status
          });
          
          setProfileComplete(complete);
          
          if (!complete) {
            // Redirect to profile page if not on profile page
            if (!window.location.pathname.includes('/profile')) {
              navigate('/user/profile', { 
                state: { 
                  returnUrl: window.location.pathname,
                  message: 'Please complete your profile to access this feature.'
                }
              });
            }
          }
        } catch (error) {
          console.error('Error checking profile:', error);
          // On error, assume incomplete to be safe
          setProfileComplete(false);
        } finally {
          setLoading(false);
        }
      };

      if (user) {
        checkProfile();
      }
    }, [user, navigate]);

    if (loading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
        </div>
      );
    }

    return <WrappedComponent {...props} profileComplete={profileComplete} />;
  };
};

export default withProfileCompletion;