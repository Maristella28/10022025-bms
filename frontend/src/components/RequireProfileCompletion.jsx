import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import axiosInstance from '../utils/axiosConfig';
import { isProfileComplete } from '../utils/profileValidation';

const RequireProfileCompletion = ({ children }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [profileComplete, setProfileComplete] = useState(false);

  useEffect(() => {
    const checkProfileCompletion = async () => {
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
        
        console.log('RequireProfileCompletion check:', {
          backendComplete,
          verificationApproved,
          fieldValidationComplete,
          finalResult: complete,
          profile_completed: profile.profile_completed,
          verification_status: profile.verification_status
        });
        
        setProfileComplete(complete);
        
        if (!complete) {
          // Show warning message
          const warningDiv = document.createElement('div');
          warningDiv.className = 'fixed top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded z-50 flex items-center shadow-lg';
          warningDiv.innerHTML = `
            <div class="mr-2">
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9 7a1 1 0 112 0v5a1 1 0 11-2 0V7zm1-3a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd"/>
              </svg>
            </div>
            <div>
              Please complete your profile before accessing this feature.
            </div>
          `;
          document.body.appendChild(warningDiv);
          
          // Remove warning after 3 seconds
          setTimeout(() => {
            warningDiv.remove();
          }, 3000);

          // Redirect to profile page
          navigate('/user/profile');
        }
      } catch (error) {
        console.error('Error checking profile completion:', error);
        // On error, assume incomplete to be safe
        setProfileComplete(false);
      } finally {
        setLoading(false);
      }
    };

    checkProfileCompletion();
  }, [navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (!profileComplete) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
        <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full">
          <div className="flex items-center space-x-4 mb-6">
            <AlertCircle className="w-10 h-10 text-orange-500" />
            <h2 className="text-2xl font-bold text-gray-800">Profile Incomplete</h2>
          </div>
          <p className="text-gray-600 mb-6">
            Please complete your profile information before accessing this feature. This helps us provide better service and ensure accurate information.
          </p>
          <button
            onClick={() => navigate('/residents/profile')}
            className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-4 rounded-lg transition duration-200"
          >
            Complete Profile Now
          </button>
        </div>
      </div>
    );
  }

  return children;
};

export default RequireProfileCompletion;