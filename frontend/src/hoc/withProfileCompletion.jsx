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
          const complete = isProfileComplete(response.data);
          setProfileComplete(complete);
          
          if (!complete) {
            // Redirect to profile page if not on profile page
            if (!window.location.pathname.includes('/profile')) {
              navigate('/profile', { 
                state: { 
                  returnUrl: window.location.pathname,
                  message: 'Please complete your profile to access this feature.'
                }
              });
            }
          }
        } catch (error) {
          console.error('Error checking profile:', error);
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