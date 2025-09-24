import React, { useState, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import Navbares from '../../components/Navbares';
import Sidebares from '../../components/Sidebares';
import { useAuth } from '../../contexts/AuthContext';
import axiosInstance from '../../utils/axiosConfig';
import { isProfileComplete, getMissingFields, getProfileCompletionPercentage, fieldLabels } from '../../utils/profileValidation';
import SecureImage from '../../components/security/SecureImage';
import ProfileCompletionIndicator from '../../components/ProfileCompletionIndicator';
import ResidencyVerification from "./ResidencyVerification";
import {
  User, Mail, Phone, Calendar, Home, MapPin, BadgeCheck,
  Landmark, Cake, Image as ImageIcon, Edit2, Save, X, ArrowLeft, AlertCircle, CheckCircle
} from 'lucide-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

// Lightweight inline progress component
const ProgressSteps = ({ currentStep = 1, labels = [] }) => {
  const steps = labels.length ? labels : ['Residency Verification', 'Edit Profile', 'Profile Complete'];
  return (
    <div className="flex items-center justify-between select-none" aria-label="Profile progress">
      {steps.map((label, idx) => {
        const stepNum = idx + 1;
        const isActive = currentStep === stepNum;
        const isDone = currentStep > stepNum;
        return (
          <div key={label} className="flex-1 flex items-center">
            <div className="flex items-center gap-3">
              <div className={
                `w-8 h-8 rounded-full flex items-center justify-center border text-xs font-bold ` +
                (isDone
                  ? 'bg-green-600 border-green-600 text-white'
                  : isActive
                  ? 'bg-emerald-100 border-emerald-500 text-emerald-700'
                  : 'bg-gray-100 border-gray-300 text-gray-500')
              }>
                {isDone ? '✓' : stepNum}
              </div>
              <span className={
                'text-sm font-medium ' +
                (isDone ? 'text-green-700' : isActive ? 'text-emerald-700' : 'text-gray-500')
              }>
                {label}
              </span>
            </div>
            {idx < steps.length - 1 && (
              <div className={'flex-1 h-0.5 mx-3 ' + (currentStep > stepNum ? 'bg-green-500' : 'bg-gray-200')} />
            )}
          </div>
        );
      })}
    </div>
  );
};

const formatDate = (dateString) => {
  if (!dateString) return '';
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return '';
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${month}-${day}`;
};

const Profile = () => {
  const navigate = useNavigate();
  const { forceRefresh, user } = useAuth();
  const [completionPercentage, setCompletionPercentage] = useState(0);
  const [shouldRedirect, setShouldRedirect] = useState(false);

  const [form, setForm] = useState({
    first_name: '',
    middle_name: '',
    last_name: '',
    name_suffix: 'none',
    birth_date: '',
    birth_place: '',
    age: '',
    email: '',
    mobile_number: '',
    sex: '',
    civil_status: '',
    religion: '',
    current_address: '',
    years_in_barangay: '',
    voter_status: '',
    current_photo: null,
    resident_id: null, // use resident_id instead of residents_id
    housing_type: '',
    head_of_family: false,
    household_no: '',
    classified_sector: '',
    educational_attainment: '',
    occupation_type: '',
    business_info: '',
    special_categories: [],
    covid_vaccine_status: '',
    relation_to_head: '',
    nationality: '',
    salary_income: '',
    business_outside_barangay: false,
    business_type: '',
    business_location: '',
    voters_id_number: '',
    voting_location: '',
    vaccine_received: [],
    other_vaccine: '',
    year_vaccinated: '',
    residency_verification_image: null,
    verification_status: null,
  });


  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Show Congratulations only once using localStorage
  const [showCongrats, setShowCongrats] = useState(() => {
    return !localStorage.getItem('profileCongratsShown');
  });

  // Derived states for progress tracking
  const isVerified = form.verification_status === 'approved';
  const hasProfile = !!form.resident_id;
  const isProfileCompleted = form.profile_completed === true || form.profile_completed === 1 || form.profile_completed === '1';
  const step2Label = hasProfile ? 'Edit Profile' : 'Complete Profile';
  
  // Enhanced profile completion check - consider both database flag and validation
  const isFullyCompleted = isProfileCompleted || (hasProfile && isProfileComplete(form));
  
  // Debug logging for profile completion status
  console.log('Profile completion debug:', {
    resident_id: form.resident_id,
    profile_completed: form.profile_completed,
    verification_status: form.verification_status,
    hasProfile,
    isProfileCompleted,
    isFullyCompleted,
    isProfileCompleteValidation: isProfileComplete(form),
    loading,
    showingCompletedMessage: isFullyCompleted && !loading,
    showingWelcomeMessage: !loading && form.verification_status === 'approved' && !isFullyCompleted
  });
  
  // Updated logic for current step:
  // Step 1: Not verified
  // Step 2: Verified but editing or no profile yet or profile not completed
  // Step 3: Verified, has profile, completed, and not editing
  const currentStep = !isVerified ? 1 : 
    (isEditing || !isFullyCompleted) ? 2 : 3;

  // Hide progress bar if Congratulations has already been shown
  const hideProgressBar = currentStep === 3 && !showCongrats;

  const handleGoDashboard = () => {
    localStorage.setItem('profileCongratsShown', 'true');
    setShowCongrats(false);
    navigate('/residents/profile');
  };

  // Step 3: Profile Completed Screen
  const ProfileCompleted = () => (
    <div className="flex flex-col items-center justify-center w-full py-16">
      <div className="bg-gradient-to-br from-green-100 via-emerald-50 to-blue-100 rounded-3xl shadow-2xl border border-green-200 p-10 max-w-xl w-full flex flex-col items-center animate-fade-in">
        <div className="relative mb-6">
          <SecureImage
            src={form.current_photo
              ? (typeof form.current_photo === 'string'
                  ? `http://localhost:8000/storage/${form.current_photo}`
                  : form.current_photo)
              : 'https://flowbite.com/docs/images/people/profile-picture-5.jpg'}
            alt="Profile Completed"
            className="w-32 h-32 object-cover rounded-full border-4 border-green-400 shadow-lg"
          />
          <div className="absolute -bottom-2 -right-2 bg-green-500 rounded-full p-2 shadow-lg">
            <BadgeCheck className="w-6 h-6 text-white" />
          </div>
        </div>
        <h2 className="text-3xl font-extrabold text-green-800 mb-2 text-center">Congratulations!</h2>
        <p className="text-lg text-green-700 font-semibold mb-4 text-center">
          {form.first_name} {form.middle_name} {form.last_name} {form.name_suffix !== 'none' ? form.name_suffix : ''}, your profile is now complete.
        </p>
        <p className="text-gray-700 text-center mb-6">
          You can now access all barangay services online. Thank you for keeping your information up to date!
        </p>
        <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
          <button
            onClick={handleGoDashboard}
            className="bg-gradient-to-r from-green-500 via-green-600 to-emerald-600 hover:from-green-600 hover:via-green-700 hover:to-emerald-700 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-lg transition-all duration-200 flex items-center gap-3 w-full sm:w-auto justify-center"
          >
            Go to Dashboard
          </button>
          <button
            onClick={() => navigate('/services')}
            className="bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600 hover:from-blue-600 hover:via-blue-700 hover:to-indigo-700 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-lg transition-all duration-200 flex items-center gap-3 w-full sm:w-auto justify-center"
          >
            Request Services
          </button>
        </div>
      </div>
      <style>{`.animate-fade-in{animation:fadeIn 1s ease;}@keyframes fadeIn{from{opacity:0;transform:translateY(40px);}to{opacity:1;transform:translateY(0);}}`}</style>
    </div>
  );

  useEffect(() => {
    setLoading(true);
    setError(null);
    axiosInstance.get('/profile')
      .then(res => {
        const profile = res.data?.user?.profile || res.data?.profile || res.data;
        if (!profile) return;
        
        console.log('Initial profile load:', profile); // Debug log
        
        // If profile is approved and new, set editing mode
        if (profile.verification_status === 'approved' && !profile.profile_completed) {
          setIsEditing(true);
        }
        
        setForm(prev => {
          // If the backend returns 'avatar', treat it as 'current_photo' for backward compatibility
          let currentPhoto = profile.current_photo || profile.avatar || null;
          
          return {
            ...prev,
            ...profile,
            verification_status: profile.verification_status, // Ensure verification status is set
            birth_date: formatDate(profile.birth_date),
            special_categories: Array.isArray(profile.special_categories) ? profile.special_categories : [],
            vaccine_received: Array.isArray(profile.vaccine_received) ? profile.vaccine_received : [],
            head_of_family: !!profile.head_of_family,
            business_outside_barangay: !!profile.business_outside_barangay,
            mobile_number: profile.mobile_number ?? profile.contact_number ?? '',
            current_address: profile.current_address ?? profile.full_address ?? '',
            current_photo: currentPhoto,
          };
        });
        // Set isEditing to false if profile is completed
        if (profile.profile_completed === true || profile.profile_completed === '1') {
          setIsEditing(false);
        }
        // Only redirect to /congratulations if not already there and only from the main profile page
        // (No longer needed if using step 3 in Profile.jsx)
      })
      .catch(err => {
        setError(err.response?.status === 401
          ? 'Session expired. Please login again.'
          : 'Failed to load profile.');
      })
      .finally(() => setLoading(false));
  // Only run once on mount to prevent repeated API calls and redirect loops
  }, []);

  // Auto-refresh profile when verification is not yet approved
  useEffect(() => {
    // Don't poll if already approved
    if (form.verification_status === 'approved') return;
    
    let isSubscribed = true;
    const interval = setInterval(async () => {
      try {
        const res = await axiosInstance.get('/profile');
        const profile = res.data?.user?.profile || res.data?.profile || res.data;
        if (!profile || !isSubscribed) return;
        
        console.log('Polling profile update:', profile); // Debug log
        
        // If approved, show success and get complete profile data
        if (profile.verification_status === 'approved' && isSubscribed) {
          clearInterval(interval);
          setIsEditing(true); // Set to editing mode immediately
          setSuccess('Your residency has been verified! You can now complete your profile.');
          // Play a success sound
          const audio = new Audio('/sounds/success.mp3');
          
          // Get full profile data
          try {
            const fullProfileRes = await axiosInstance.get('/profile');
            if (fullProfileRes.data) {
              const fullProfile = fullProfileRes.data?.user?.profile || fullProfileRes.data?.profile || fullProfileRes.data;
              setForm(prev => ({
                ...prev,
                ...fullProfile,
                verification_status: 'approved',
                birth_date: formatDate(fullProfile.birth_date),
                special_categories: Array.isArray(fullProfile.special_categories) ? fullProfile.special_categories : [],
                vaccine_received: Array.isArray(fullProfile.vaccine_received) ? fullProfile.vaccine_received : [],
                head_of_family: !!fullProfile.head_of_family,
                business_outside_barangay: !!fullProfile.business_outside_barangay,
                mobile_number: fullProfile.mobile_number ?? fullProfile.contact_number ?? '',
                current_address: fullProfile.current_address ?? fullProfile.full_address ?? '',
                current_photo: fullProfile.current_photo || fullProfile.avatar || null,
              }));
            }
          } catch (error) {
            console.error('Error fetching full profile:', error);
          }
        } else {
          // Update verification status even when not approved
          setForm(prev => ({
            ...prev,
            verification_status: profile.verification_status,
            residency_verification_image: profile.residency_verification_image
          }));
        }
      } catch (error) {
        console.error('Error polling verification status:', error);
      }
    }, 3000); // Poll every 3 seconds
    
    return () => clearInterval(interval);
  }, [form.verification_status]);

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    setForm(prev => {
      const updated = { ...prev };
      if (name === 'birth_date') {
        const birthYear = new Date(value).getFullYear();
        const currentYear = new Date().getFullYear();
        updated.birth_date = value;
        updated.age = currentYear - birthYear;
      } else if (name === 'special_categories' || name === 'vaccine_received') {
        const updatedSet = new Set(prev[name] || []);
        if (checked) {
          updatedSet.add(value);
        } else {
          updatedSet.delete(value);
        }
        updated[name] = [...updatedSet];
      } else if (type === 'checkbox') {
        updated[name] = checked;
      } else if (name === 'current_photo' && files?.length > 0) {
        updated.current_photo = files[0];
      } else if (name === 'residency_verification_image' && files?.length > 0) {
        updated.residency_verification_image = files[0];
      } else {
        updated[name] = value;
      }
      return updated;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(null);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        if (!form.resident_id && key === 'residents_id') return;
        if (Array.isArray(value)) {
          value.forEach(item => formData.append(`${key}[]`, item));
        } else if (typeof value === 'boolean') {
          formData.append(key, value ? '1' : '0');
        } else if (value instanceof File) {
          formData.append(key, value);
        } else if (value !== null && value !== undefined) {
          formData.append(key, value);
        }
      });
      const updateRes = await axiosInstance.post('/profile/update', formData);
      if (updateRes.data?.resident?.residents_id) {
        localStorage.setItem('residentId', updateRes.data.resident.residents_id);
      }
      setSuccess(updateRes.data?.message || 'Profile saved successfully');
      await forceRefresh();
        // Fetch the latest profile and update form state to ensure step 3 is shown
        try {
          const res = await axiosInstance.get('/profile');
          const profile = res.data?.user?.profile || res.data?.profile || res.data;
          console.log('[DEBUG] Backend profile response after save:', profile);
          if (profile) {
            setForm(prev => {
              let currentPhoto = profile.current_photo || profile.avatar || null;
              const newForm = {
                ...prev,
                ...profile,
                birth_date: formatDate(profile.birth_date),
                special_categories: Array.isArray(profile.special_categories) ? profile.special_categories : [],
                vaccine_received: Array.isArray(profile.vaccine_received) ? profile.vaccine_received : [],
                head_of_family: !!profile.head_of_family,
                business_outside_barangay: !!profile.business_outside_barangay,
                mobile_number: profile.mobile_number ?? profile.contact_number ?? '',
                current_address: profile.current_address ?? profile.full_address ?? '',
                current_photo: currentPhoto,
                profile_completed: profile.profile_completed, // Ensure profile_completed status is updated
              };
              console.log('[DEBUG] Updated form state after save:', newForm);
              console.log('[DEBUG] Profile completed status:', profile.profile_completed);
              return newForm;
            });
            // Exit editing mode when profile is completed
            if (profile.profile_completed === true || profile.profile_completed === 1 || profile.profile_completed === '1') {
              console.log('[DEBUG] Profile is completed, exiting edit mode');
              setIsEditing(false);
            }
          }
        } catch (e) {
          console.error('[DEBUG] Error fetching updated profile:', e);
          // fallback: always exit editing after save
          setIsEditing(false);
        }
      setTimeout(() => setSuccess(null), 5000);
    } catch (error) {
      const errMsg = error.response?.data?.errors
        ? Object.values(error.response.data.errors)[0][0]
        : error.response?.data?.message || 'Error saving profile. Please try again.';
      setError(errMsg);
    } finally {
      setSubmitting(false);
    }
  };
  // Modern progress bar for loading
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex flex-col">
        <Navbares />
        <Sidebares />
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="w-full max-w-md mx-auto">
            <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden mb-8">
              <div className="h-full bg-gradient-to-r from-green-400 via-emerald-400 to-blue-400 animate-pulse" style={{ width: '80%' }}></div>
            </div>
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600 mx-auto mb-4"></div>
              <p className="text-gray-600 text-lg font-medium">Loading your profile...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex flex-col font-sans">
      <Navbares />
      <Sidebares />
      {/* Sticky Header */}
      <div className="sticky top-0 z-40 w-full bg-white/80 backdrop-blur border-b border-gray-200 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate('/residents/dashboard')} 
            className="flex items-center gap-2 px-5 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold shadow-sm border border-gray-200 transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </button>
          <h1 className="text-2xl font-bold text-gray-800 tracking-tight">Profile Management</h1>
          <span className="text-xs text-gray-400 font-medium px-4 py-2 rounded-lg bg-gray-50 border border-gray-200">
            {isEditing ? 'Edit Mode' : 'View Mode'}
          </span>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center w-full py-8">
        <div className="w-full max-w-5xl mx-auto px-2 sm:px-8 lg:px-12 pb-16 flex flex-col items-center justify-center">
          {form.verification_status === 'approved' && (
            <ProfileCompletionIndicator
              percentage={getProfileCompletionPercentage(form)}
              missingFields={getMissingFields(form).map(field => fieldLabels[field])}
            />
          )}
          {/* Progress Steps */}
          {!hideProgressBar && (
            <div className="w-full max-w-2xl mb-6">
              <ProgressSteps currentStep={currentStep} labels={[ 
                'Residency Verification',
                step2Label,
                'Profile Complete'
              ]} />
            </div>
          )}
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-center gap-3 w-full max-w-2xl mx-auto shadow">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-red-800 font-medium">{error}</p>
                {error.includes('login') && (
                  <button 
                    onClick={() => navigate('/login')}
                    className="text-red-600 underline hover:text-red-800 text-sm mt-1"
                  >
                    Go to Login
                  </button>
                )}
              </div>
              <button 
                onClick={() => setError(null)}
                className="text-red-400 hover:text-red-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 flex items-center gap-3 w-full max-w-2xl mx-auto shadow">
              <BadgeCheck className="w-5 h-5 text-green-500 flex-shrink-0" />
              <p className="text-green-800 font-medium">{success}</p>
              <button 
                onClick={() => setSuccess(null)}
                className="text-green-400 hover:text-green-600 ml-auto"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Welcome Message for New Users */}
          {!form.resident_id && !loading && form.verification_status !== 'approved' && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-6 mb-8 flex items-center gap-4 w-full max-w-2xl mx-auto shadow">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-orange-100">
                <AlertCircle className="w-7 h-7 text-orange-500" />
              </div>
              <div className="flex-1">
                <p className="text-orange-900 font-bold text-lg mb-1">Residency Verification Required</p>
                <p className="text-orange-700 text-sm">
                  To complete your profile and access barangay services, you must first submit a residency verification document. Please upload a clear image of your proof of residency below.
                </p>
              </div>
            </div>
          )}

          {/* Conditional Messages - Only show one at a time */}
          {!loading && form.verification_status === 'approved' && (
            isFullyCompleted ? (
              /* Profile Completed Message */
              <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8 flex items-center gap-4 w-full max-w-2xl mx-auto shadow">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-green-100">
                  <CheckCircle className="w-7 h-7 text-green-500" />
                </div>
                <div className="flex-1">
                  <p className="text-green-900 font-bold text-lg mb-1">Profile Complete!</p>
                  <p className="text-green-700 text-sm">
                    Your resident profile has been completed successfully. You now have full access to all barangay services.
                  </p>
                </div>
              </div>
            ) : (
              /* Welcome Message for Approved Users */
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8 flex items-center gap-4 w-full max-w-2xl mx-auto shadow">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-100">
                  <User className="w-7 h-7 text-blue-500" />
                </div>
                <div className="flex-1">
                  <p className="text-blue-900 font-bold text-lg mb-1">Welcome! Let's create your profile</p>
                  <p className="text-blue-700 text-sm">
                    Your residency has been verified! Please fill out the form below to complete your resident profile.
                  </p>
                </div>
              </div>
            )
          )}

          <div className="bg-white/95 shadow-xl rounded-3xl border border-gray-100 overflow-hidden mt-4 mb-10 w-full max-w-5xl mx-auto flex flex-col items-center" style={{zIndex: 20, position: 'relative'}}>
            <div className="p-6 md:p-14 flex flex-col items-center w-full">
              {/* Show only residency verification when not verified, full profile when verified */}
              {form.verification_status === 'approved' ? (
                // Show profile form when verified
                <>
                  {currentStep === 3 && showCongrats ? (
                    <ProfileCompleted />
                  ) : !isEditing ? (
                    <ReadOnlyView form={form} setIsEditing={setIsEditing} />
                  ) : (
                    <EditableForm 
                      form={form} 
                      handleChange={handleChange} 
                      handleSubmit={handleSubmit} 
                      setIsEditing={setIsEditing}
                      submitting={submitting}
                    />
                  )}
                </>
              ) : (
                // Show verification form when not verified
                <div className="w-full">
                  <ResidencyVerification 
                    form={form} 
                    onImageUpload={() => {
                      // Force refresh profile data when image is uploaded
                      axiosInstance.get('/profile')
                        .then(res => {
                          const profile = res.data?.user?.profile || res.data?.profile || res.data;
                          if (profile) {
                            setForm(prev => ({
                              ...prev,
                              ...profile,
                              verification_status: profile.verification_status,
                              residency_verification_image: profile.residency_verification_image
                            }));
                          }
                        })
                        .catch(err => console.error('Error refreshing profile:', err));
                    }}
                  />
                </div>
              )}
            </div>
          </div>
          <div className="h-4"></div>
        </div>
      </main>
    </div>
  );
};

const ReadOnlyView = ({ form, setIsEditing }) => {
  // Create a dynamic timestamp for cache-busting that updates when form.current_photo changes
  const avatarTimestamp = React.useMemo(() => Date.now(), [form.current_photo]);

  // Safe setter that only allows editing when verification is approved
  const safeSetIsEditing = (value) => {
    if (value === true && form.verification_status !== 'approved') {
      return; // Prevent editing if not verified
    }
    setIsEditing(value);
  };

  return (
    <div className="flex flex-col items-center">
      {/* Profile Header Section */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-8 rounded-2xl border border-green-100 shadow-lg w-full mb-8">
        <div className="flex flex-col items-center space-y-6">
          {/* Avatar */}
          <div className="relative">
            <img
              src={
                form.current_photo
                  ? (typeof form.current_photo === 'string'
                      ? `http://localhost:8000/storage/${form.current_photo}?t=${avatarTimestamp}`
                      : URL.createObjectURL(form.current_photo))
                  : 'https://flowbite.com/docs/images/people/profile-picture-5.jpg'
              }
              alt="Avatar"
              className="w-32 h-32 object-cover rounded-full border-4 border-green-300 shadow-xl"
              onError={(e) => {
                console.log('ReadOnlyView avatar load error:', e.target.src);
                e.target.onerror = null;
                e.target.src = 'https://flowbite.com/docs/images/people/profile-picture-5.jpg';
              }}
            />
            <div className="absolute -bottom-2 -right-2 bg-green-500 rounded-full p-2 shadow-lg">
              <User className="w-4 h-4 text-white" />
            </div>
          </div>

          {/* Name and ID */}
          <div className="text-center space-y-3">
            <h2 className="text-3xl font-extrabold text-green-800">
              {form.first_name} {form.middle_name} {form.last_name} {form.name_suffix !== 'none' ? form.name_suffix : ''}
            </h2>

            {form.residents_id && (
              <div className="flex items-center justify-center gap-2">
                <BadgeCheck className="w-5 h-5 text-green-600" />
                <span className="bg-green-100 text-green-700 px-4 py-2 text-sm rounded-full font-semibold shadow-sm">
                  Resident ID: {form.residents_id}
                </span>
              </div>
            )}

            <p className="text-sm text-gray-600 flex items-center justify-center gap-2">
              <Mail className="w-4 h-4" />
              {form.email || '—'}
            </p>
          </div>
        </div>
      </div>

      {/* Information Sections */}
      <div className="w-full space-y-6">
      {/* Personal Information */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <h3 className="text-xl font-bold text-green-800 mb-6 flex items-center gap-2">
          <User className="w-5 h-5" />
          Personal Information
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <InfoCard
            icon={<Calendar className="w-5 h-5" />}
            label="Birthdate"
            value={form.birth_date ? new Date(form.birth_date).toLocaleDateString('en-PH', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            }) : '—'}
          />
          <InfoCard icon={<Cake className="w-5 h-5" />} label="Age" value={form.age || '—'} />
          <InfoCard icon={<User className="w-5 h-5" />} label="Sex" value={form.sex || '—'} />
          <InfoCard icon={<MapPin className="w-5 h-5" />} label="Birth Place" value={form.birth_place || '—'} />
          <InfoCard icon={<User className="w-5 h-5" />} label="Nationality" value={form.nationality || '—'} />
            <InfoCard icon={<Phone className="w-5 h-5" />} label="Mobile Number" value={form.mobile_number || '—'} />
          <InfoCard icon={<Landmark className="w-5 h-5" />} label="Civil Status" value={form.civil_status || '—'} />
          <InfoCard icon={<MapPin className="w-5 h-5" />} label="Religion" value={form.religion || '—'} />
          <InfoCard icon={<User className="w-5 h-5" />} label="Relation to Head" value={form.relation_to_head || '—'} />
          <InfoCard icon={<Home className="w-5 h-5" />} label="Years in Barangay" value={form.years_in_barangay || '—'} />
        </div>
      </div>

      {/* Address Information */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <h3 className="text-xl font-bold text-green-800 mb-6 flex items-center gap-2">
          <Home className="w-5 h-5" />
          Address Information
        </h3>
        <div className="space-y-4">
            <InfoCard
              icon={<Home className="w-5 h-5" />}
              label="Current Address"
              value={form.current_address || '—'}
              fullWidth
            />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <InfoCard icon={<Home className="w-5 h-5" />} label="Housing Type" value={form.housing_type || '—'} />
            <InfoCard icon={<User className="w-5 h-5" />} label="Head of Family" value={form.head_of_family ? 'Yes' : 'No'} />
            <InfoCard icon={<User className="w-5 h-5" />} label="Household No." value={form.household_no || '—'} />
          </div>
        </div>
      </div>

      {/* Education & Employment */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <h3 className="text-xl font-bold text-green-800 mb-6 flex items-center gap-2">
          <Landmark className="w-5 h-5" />
          Education & Employment
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <InfoCard icon={<User className="w-5 h-5" />} label="Educational Attainment" value={form.educational_attainment || '—'} />
          <InfoCard icon={<User className="w-5 h-5" />} label="Classified Sector" value={form.classified_sector || '—'} />
          <InfoCard icon={<User className="w-5 h-5" />} label="Occupation Type" value={form.occupation_type || '—'} />
          <InfoCard icon={<User className="w-5 h-5" />} label="Salary/Income" value={form.salary_income || '—'} />
        </div>
      </div>

      {/* Business Information */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <h3 className="text-xl font-bold text-green-800 mb-6 flex items-center gap-2">
          💼 Business Information
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <InfoCard icon={<User className="w-5 h-5" />} label="Business Info" value={form.business_info || '—'} />
          <InfoCard icon={<User className="w-5 h-5" />} label="Business Type" value={form.business_type || '—'} />
          <InfoCard icon={<MapPin className="w-5 h-5" />} label="Business Location" value={form.business_location || '—'} />
          <InfoCard icon={<User className="w-5 h-5" />} label="Outside Barangay?" value={form.business_outside_barangay ? 'Yes' : 'No'} />
        </div>
      </div>

      {/* Voter Information */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <h3 className="text-xl font-bold text-green-800 mb-6 flex items-center gap-2">
          <BadgeCheck className="w-5 h-5" />
          Voter Information
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <InfoCard icon={<BadgeCheck className="w-5 h-5" />} label="Voter Status" value={form.voter_status || '—'} />
          <InfoCard icon={<BadgeCheck className="w-5 h-5" />} label="Voter's ID" value={form.voters_id_number || '—'} />
          <InfoCard icon={<MapPin className="w-5 h-5" />} label="Voting Location" value={form.voting_location || '—'} />
        </div>
      </div>

      {/* Special Categories */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <h3 className="text-xl font-bold text-green-800 mb-6 flex items-center gap-2">
          ⚠️ Special Categories
        </h3>
        {form.special_categories?.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {form.special_categories.map((cat, idx) => (
              <div key={idx} className="bg-green-50 border border-green-200 rounded-lg px-4 py-3 flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium text-green-800">{cat}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500 font-medium">No special categories</p>
          </div>
        )}
      </div>

      {/* COVID Vaccination */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <h3 className="text-xl font-bold text-green-800 mb-6 flex items-center gap-2">
          💉 COVID Vaccination
        </h3>
        {form.vaccine_received?.length > 0 ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {form.vaccine_received.map((vaccine, idx) => (
                <div key={idx} className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-sm font-medium text-blue-800">{vaccine}</span>
                </div>
              ))}
            </div>
            {(form.other_vaccine || form.year_vaccinated) && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                {form.other_vaccine && (
                  <InfoCard icon={<User className="w-4 h-4" />} label="Other Vaccine" value={form.other_vaccine} />
                )}
                {form.year_vaccinated && (
                  <InfoCard icon={<Calendar className="w-4 h-4" />} label="Year Vaccinated" value={form.year_vaccinated} />
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="w-8 h-8 text-red-400" />
            </div>
            <p className="text-gray-500 font-medium">Not Vaccinated</p>
          </div>
        )}
      </div>
    </div>

    {/* Edit Button - Only shown when verification is approved */}
    {form.verification_status === 'approved' && (
      <div className="mt-10 flex justify-center">
        {form.resident_id ? (
          <button
            onClick={() => safeSetIsEditing(true)}
            className="bg-gradient-to-r from-green-500 via-green-600 to-emerald-600 hover:from-green-600 hover:via-green-700 hover:to-emerald-700 text-white px-10 py-5 rounded-2xl font-bold text-lg shadow-2xl transition-all duration-300 transform hover:scale-110 focus:outline-none focus:ring-4 focus:ring-green-300 focus:ring-opacity-50 flex items-center gap-3 border-2 border-green-400 hover:border-green-300 relative overflow-hidden group"
            style={{
              boxShadow: '0 10px 40px rgba(34, 197, 94, 0.3), 0 0 0 1px rgba(34, 197, 94, 0.1)',
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <Edit2 className="w-6 h-6 relative z-10" />
            <span className="relative z-10">Edit Profile</span>
            <div className="absolute -right-2 -top-2 w-4 h-4 bg-yellow-400 rounded-full animate-pulse"></div>
          </button>
        ) : (
          <button
            onClick={() => safeSetIsEditing(true)}
            className="bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600 hover:from-blue-600 hover:via-blue-700 hover:to-indigo-700 text-white px-10 py-5 rounded-2xl font-bold text-lg shadow-2xl transition-all duration-300 transform hover:scale-110 focus:outline-none focus:ring-4 focus:ring-blue-300 focus:ring-opacity-50 flex items-center gap-3 border-2 border-blue-400 hover:border-blue-300 relative overflow-hidden group"
            style={{
              boxShadow: '0 10px 40px rgba(59, 130, 246, 0.3), 0 0 0 1px rgba(59, 130, 246, 0.1)',
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <User className="w-6 h-6 relative z-10" />
            <span className="relative z-10">Complete Profile</span>
            <div className="absolute -right-2 -top-2 w-4 h-4 bg-blue-400 rounded-full animate-pulse"></div>
          </button>
        )}
      </div>
    )}
    
    {/* Verification Status Message */}
    {form.verification_status !== 'approved' && (
      <div className="mt-10 flex justify-center">
        <div className="bg-orange-50 border border-orange-200 text-orange-700 px-10 py-5 rounded-2xl font-bold text-lg flex items-center gap-3">
          <AlertCircle className="w-6 h-6" />
          Profile editing is disabled until residency verification is approved
        </div>
      </div>
    )}
    </div>
  );
};

// Enhanced InfoCard component for better visual presentation
const InfoCard = ({ icon, label, value, fullWidth = false }) => (
  <div className={`${fullWidth ? 'col-span-full' : ''} bg-gray-50 border border-gray-200 rounded-lg p-4 hover:bg-gray-100 transition-colors duration-200`}>
    <div className="flex items-start gap-3">
      <div className="text-green-600 mt-0.5">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">{label}</p>
        <p className="text-sm font-medium text-gray-900 break-words">{value}</p>
      </div>
    </div>
  </div>
);

const EditableForm = ({ form, handleChange, handleSubmit, setIsEditing, submitting }) => {
  // List of required fields for profile completion
  const requiredFields = [
    'first_name', 'last_name', 'birth_date', 'sex', 'civil_status', 'religion',
    'current_address', 'years_in_barangay', 'voter_status', 'housing_type',
    'classified_sector', 'educational_attainment', 'occupation_type', 'salary_income', 'current_photo'
  ];

  // Find missing required fields
  const missingFields = requiredFields.filter(field => {
    if (field === 'current_photo') {
      return !form.current_photo;
    }
    return !form[field] || (typeof form[field] === 'string' && form[field].trim() === '');
  });

  // Map field names to readable labels
  const fieldLabels = {
    first_name: 'First Name',
    last_name: 'Last Name',
    birth_date: 'Birth Date',
    sex: 'Sex',
    civil_status: 'Civil Status',
    religion: 'Religion',
    current_address: 'Current Address',
    years_in_barangay: 'Years in Barangay',
    voter_status: 'Voter Status',
    housing_type: 'Housing Type',
    classified_sector: 'Classified Sector',
    educational_attainment: 'Educational Attainment',
    occupation_type: 'Occupation Type',
    salary_income: 'Salary/Income',
    current_photo: 'Profile Photo',
  };

  // Prevent submit if missing required fields
  const canSubmit = missingFields.length === 0;
  {missingFields.length > 0 && (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 flex items-center gap-3 w-full max-w-2xl mx-auto shadow">
      <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0" />
      <div className="flex-1">
        <p className="text-yellow-800 font-medium">Please complete all required fields to finish your profile:</p>
        <ul className="list-disc ml-6 text-yellow-700 text-sm mt-2">
          {missingFields.map(field => (
            <li key={field}>{fieldLabels[field] || field}</li>
          ))}
        </ul>
      </div>
    </div>
  )}
  // Safety check: if verification is not approved, don't render the form
  if (form.verification_status !== 'approved') {
    return (
      <div className="w-full text-center py-12">
        <div className="flex flex-col items-center gap-4">
          <AlertCircle className="w-16 h-16 text-orange-500" />
          <h3 className="text-xl font-bold text-orange-900">Profile Editing Restricted</h3>
          <p className="text-orange-700 max-w-md">
            You must complete residency verification before you can edit your profile.
          </p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
    {/* Profile Picture Section */}
    <div className="flex flex-col items-center w-full">
      <div className="w-full bg-green-50 rounded-xl flex flex-col items-center py-10 mb-8 shadow-sm">
        <div className="relative mb-6">
          {form.current_photo ? (
            <img
              src={typeof form.current_photo === 'string'
                ? `http://localhost:8000/storage/${form.current_photo}?t=${Date.now()}`
                : URL.createObjectURL(form.current_photo)}
              alt="Profile Photo"
              className="w-32 h-32 object-cover rounded-full border-4 border-green-400 shadow-lg"
            />
          ) : (
            <div className="w-32 h-32 bg-green-100 rounded-full border-4 border-green-300 flex items-center justify-center">
              <ImageIcon className="w-14 h-14 text-green-400" />
            </div>
          )}
        </div>
        <label className="cursor-pointer bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-xl text-base font-bold shadow-lg transition-all duration-200">
          <input
            type="file"
            name="current_photo"
            onChange={handleChange}
            accept="image/*"
            className="hidden"
          />
          <div className="flex items-center gap-3">
            <ImageIcon className="w-5 h-5" />
            Upload Profile Photo
          </div>
        </label>
      </div>
    </div>

    

    {/* Personal Information Section */}
    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
      <h3 className="text-xl font-bold text-green-800 mb-6 flex items-center gap-2">
        <User className="w-5 h-5" />
        Personal Information
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {['first_name', 'middle_name', 'last_name', 'name_suffix'].map(name => (
          <div key={name} className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 tracking-wide">
              {name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </label>
            <input
              type="text"
              name={name}
              value={form[name] ?? ''}
              onChange={handleChange}
              placeholder={`Enter ${name.replace(/_/g, ' ')}`}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 shadow-sm hover:shadow-md"
            />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700">Birth Date</label>
          <DatePicker
            selected={form.birth_date ? new Date(form.birth_date) : null}
            onChange={date => {
              const fakeEvent = {
                target: {
                  name: 'birth_date',
                  value: date ? date.toISOString().split('T')[0] : ''
                }
              };
              handleChange(fakeEvent);
            }}
            dateFormat="yyyy-MM-dd"
            maxDate={new Date()}
            showMonthDropdown
            showYearDropdown
            dropdownMode="select"
            placeholderText="Select birth date"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 shadow-sm hover:shadow-md bg-white"
            wrapperClassName="w-full"
          />
          {form.age && (
            <p className="text-xs text-green-600 font-medium">
              Age: <span className="font-bold">{form.age} years old</span>
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700">Birth Place</label>
          <input
            type="text"
            name="birth_place"
            value={form.birth_place}
            onChange={handleChange}
            placeholder="Enter birth place"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 shadow-sm hover:shadow-md"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700">Age</label>
          <input
            type="text"
            name="age"
            value={form.age}
            readOnly
            className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700">Email</label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Enter email address"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 shadow-sm hover:shadow-md"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700">Mobile Number</label>
          <input
            type="tel"
            name="mobile_number"
            value={form.mobile_number}
            onChange={handleChange}
            placeholder="e.g. 09123456789"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 shadow-sm hover:shadow-md"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700">Sex</label>
          <select
            name="sex"
            value={form.sex}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 shadow-sm hover:shadow-md"
          >
            <option value="">Select Sex</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700">Civil Status</label>
          <select
            name="civil_status"
            value={form.civil_status}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 shadow-sm hover:shadow-md"
          >
            <option value="">Select Civil Status</option>
            <option value="Single">Single</option>
            <option value="Married">Married</option>
            <option value="Widow">Widow</option>
            <option value="Separated">Separated</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700">Nationality</label>
          <input
            type="text"
            name="nationality"
            value={form.nationality}
            onChange={handleChange}
            placeholder="e.g. Filipino"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 shadow-sm hover:shadow-md"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700">Religion</label>
          <input
            type="text"
            name="religion"
            value={form.religion}
            onChange={handleChange}
            placeholder="e.g. Roman Catholic"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 shadow-sm hover:shadow-md"
          />
        </div>
      </div>
    </div>

    {/* Address Section */}
    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
      <h3 className="text-xl font-bold text-green-800 mb-6 flex items-center gap-2">
        <Home className="w-5 h-5" />
        Address Information
      </h3>
      
      <div className="space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700">Current Address</label>
          <textarea
            name="current_address"
            value={form.current_address}
            onChange={handleChange}
            rows={3}
            placeholder="e.g. Purok 2, Brgy. San Isidro, Sta. Maria, Bulacan"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 shadow-sm hover:shadow-md resize-none"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Years in Barangay</label>
            <input
              type="number"
              name="years_in_barangay"
              value={form.years_in_barangay ?? ''}
              onChange={handleChange}
              placeholder="e.g. 5"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 shadow-sm hover:shadow-md"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Housing Type</label>
            <select
              name="housing_type"
              value={form.housing_type}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 shadow-sm hover:shadow-md"
            >
              <option value="">Select Housing Type</option>
              <option>Owner</option>
              <option>Private Property with Consent</option>
              <option>Owner with Rental</option>
              <option>Rental House</option>
              <option>Private Property without Consent</option>
              <option>Public Property with Consent</option>
              <option>Public Property without Consent</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Household Number</label>
            <input
              name="household_no"
              value={form.household_no}
              onChange={handleChange}
              placeholder="e.g. 003124"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 shadow-sm hover:shadow-md"
            />
          </div>
        </div>

        <div className="flex items-center gap-6">
          <label className="flex items-center gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              name="head_of_family"
              checked={!!form.head_of_family}
              onChange={handleChange}
              className="w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500"
            />
            <span className="text-sm font-semibold text-gray-700">Head of the Family</span>
          </label>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700">Relation to the Head of the Family</label>
          <input
            type="text"
            name="relation_to_head"
            value={form.relation_to_head || ''}
            onChange={handleChange}
            placeholder="e.g., Daughter, Son, Father"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 shadow-sm hover:shadow-md"
          />
        </div>
      </div>
    </div>

    {/* Education & Employment Section */}
    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
      <h3 className="text-xl font-bold text-green-800 mb-6 flex items-center gap-2">
        <Landmark className="w-5 h-5" />
        Education & Employment
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700">Classified Sector</label>
          <select
            name="classified_sector"
            value={form.classified_sector}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 shadow-sm hover:shadow-md"
          >
            <option value="">Select Sector</option>
            <option>Labor Force/Employed</option>
            <option>Self-Employed</option>
            <option>Unemployed</option>
            <option>Student</option>
            <option>Out-of-School Youth (OSY)</option>
            <option>Out-of-School Children (OSC)</option>
            <option>Not Applicable</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700">Educational Attainment</label>
          <select
            name="educational_attainment"
            value={form.educational_attainment}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 shadow-sm hover:shadow-md"
          >
            <option value="">Select Education</option>
            <option>Primary</option>
            <option>Secondary</option>
            <option>Tertiary</option>
            <option>Post Graduate</option>
            <option>Not Applicable</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700">Occupation Type</label>
          <select
            name="occupation_type"
            value={form.occupation_type}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 shadow-sm hover:shadow-md"
          >
            <option value="">Select Occupation</option>
            <option>Managers</option>
            <option>Professionals</option>
            <option>Clerical Support Workers</option>
            <option>Elementary Occupation</option>
            <option>Service & Sales Workers</option>
            <option>Armed Forces Occupation</option>
            <option>Plant & Machine Operators & Assemblers</option>
            <option>Technician & Associate Professionals</option>
            <option>Skilled Cultural, Forestry, & Fishery Work</option>
            <option>Craft & Related Trades Workers</option>
            <option>Not Applicable</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700">Salary/Income</label>
          <input
            name="salary_income"
            value={form.salary_income}
            onChange={handleChange}
            placeholder="e.g. ₱15,000/month"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 shadow-sm hover:shadow-md"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700">Business Info</label>
          <input
            name="business_info"
            value={form.business_info}
            onChange={handleChange}
            placeholder="e.g. ABC Marketing Services"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 shadow-sm hover:shadow-md"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700">Business Type</label>
          <input
            name="business_type"
            value={form.business_type}
            onChange={handleChange}
            placeholder="e.g. Retail, Freelance"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 shadow-sm hover:shadow-md"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700">Business Location</label>
          <input
            name="business_location"
            value={form.business_location}
            onChange={handleChange}
            placeholder="e.g. Zone 2, Brgy. Example"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 shadow-sm hover:shadow-md"
          />
        </div>

        <div className="flex items-center space-x-3 pt-8">
          <input
            type="checkbox"
            name="business_outside_barangay"
            checked={form.business_outside_barangay}
            onChange={handleChange}
            className="w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500"
          />
          <label className="text-sm font-semibold text-gray-700">Business Outside Barangay</label>
        </div>
      </div>
    </div>

    {/* Voter Information Section */}
    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
      <h3 className="text-xl font-bold text-green-800 mb-6 flex items-center gap-2">
        <BadgeCheck className="w-5 h-5" />
        Voter Information
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700">Voter Status</label>
          <select
            name="voter_status"
            value={form.voter_status}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 shadow-sm hover:shadow-md"
          >
            <option value="">Select Voter Status</option>
            <option>Local (Barangay)</option>
            <option>Local (City/Municipality)</option>
            <option>Non-Local</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700">Voter's ID Number</label>
          <input
            name="voters_id_number"
            value={form.voters_id_number}
            onChange={handleChange}
            placeholder="e.g. 1234-5678-9012"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 shadow-sm hover:shadow-md"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700">Voting Location</label>
          <input
            name="voting_location"
            value={form.voting_location}
            onChange={handleChange}
            placeholder="e.g. Barangay Hall, Zone 3"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 shadow-sm hover:shadow-md"
          />
        </div>
      </div>
    </div>

    {/* Special Categories Section */}
    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
      <h3 className="text-xl font-bold text-green-800 mb-6 flex items-center gap-2">
        ⚠️ Special Categories
      </h3>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          'Solo Parent', 'Solo Parent w/ ID', 'Senior Citizen', 'Senior Citizen w/ ID',
          'Senior Citizen w/ Pension', 'Indigenous people', "4P's Member", 'PWD', 'PWD w/ ID'
        ].map(cat => (
          <label key={cat} className="flex items-center space-x-3 p-3 rounded-lg border border-gray-200 hover:bg-green-50 hover:border-green-300 transition-all duration-200 cursor-pointer">
            <input
              type="checkbox"
              name="special_categories"
              value={cat}
              checked={form.special_categories.includes(cat)}
              onChange={handleChange}
              className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
            />
            <span className="text-sm text-gray-700 font-medium">{cat}</span>
          </label>
        ))}
      </div>
    </div>

    {/* COVID Vaccination Section */}
    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
      <h3 className="text-xl font-bold text-green-800 mb-6 flex items-center gap-2">
        💉 COVID Vaccination
      </h3>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {[
          'Not Vaccinated', 'Pfizer-BioNTech', 'Oxford-AstraZeneca',
          'Sputnik V', 'Janssen', 'Sinovac'
        ].map(vac => (
          <label key={vac} className="flex items-center space-x-3 p-3 rounded-lg border border-gray-200 hover:bg-green-50 hover:border-green-300 transition-all duration-200 cursor-pointer">
            <input
              type="checkbox"
              name="vaccine_received"
              value={vac}
              checked={form.vaccine_received.includes(vac)}
              onChange={handleChange}
              className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
            />
            <span className="text-sm text-gray-700 font-medium">{vac}</span>
          </label>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700">Other Vaccine</label>
          <input
            name="other_vaccine"
            value={form.other_vaccine ?? ""}
            onChange={handleChange}
            placeholder="Specify if not listed above"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 shadow-sm hover:shadow-md"
          />
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700">Year Vaccinated</label>
          <input
            name="year_vaccinated"
            value={form.year_vaccinated ?? ""}
            onChange={handleChange}
            placeholder="e.g., 2021"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 shadow-sm hover:shadow-md"
          />
        </div>
      </div>
    </div>

    {/* Action Buttons */}
    <div className="flex flex-col sm:flex-row gap-6 justify-center pt-8 pb-4">
      <button
  type="submit"
  disabled={submitting || !canSubmit}
        className={`bg-gradient-to-r from-green-500 via-green-600 to-emerald-600 hover:from-green-600 hover:via-green-700 hover:to-emerald-700 text-white px-12 py-5 rounded-2xl font-bold text-lg shadow-2xl transition-all duration-300 transform hover:scale-110 focus:outline-none focus:ring-4 focus:ring-green-300 focus:ring-opacity-50 flex items-center justify-center gap-3 border-2 border-green-400 hover:border-green-300 relative overflow-hidden group min-w-[200px] ${submitting ? 'opacity-75 cursor-not-allowed' : ''}`}
        style={{
          boxShadow: '0 10px 40px rgba(34, 197, 94, 0.3), 0 0 0 1px rgba(34, 197, 94, 0.1)',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        {submitting ? (
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white relative z-10"></div>
        ) : (
          <Save className="w-6 h-6 relative z-10" />
        )}
        <span className="relative z-10">
          {submitting ? 'Saving...' : 'Save Changes'}
        </span>
        {!submitting && (
          <div className="absolute -right-2 -top-2 w-4 h-4 bg-green-400 rounded-full animate-pulse"></div>
        )}
      </button>

      {form.verification_status === 'approved' ? (
        <button
          type="button"
          onClick={() => setIsEditing(false)}
          className="bg-gradient-to-r from-red-500 via-red-600 to-red-700 hover:from-red-600 hover:via-red-700 hover:to-red-800 text-white px-12 py-5 rounded-2xl font-bold text-lg shadow-2xl transition-all duration-300 transform hover:scale-110 focus:outline-none focus:ring-4 focus:ring-red-300 focus:ring-opacity-50 flex items-center justify-center gap-3 border-2 border-red-400 hover:border-red-300 relative overflow-hidden group min-w-[200px]"
          style={{
            boxShadow: '0 10px 40px rgba(239, 68, 68, 0.3), 0 0 0 1px rgba(239, 68, 68, 0.1)',
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <X className="w-6 h-6 relative z-10" />
          <span className="relative z-10">Cancel</span>
          <div className="absolute -right-2 -top-2 w-4 h-4 bg-red-400 rounded-full animate-pulse"></div>
        </button>
      ) : (
        <button
          type="button"
          disabled
          className="bg-gray-300 text-gray-500 px-12 py-5 rounded-2xl font-bold text-lg cursor-not-allowed min-w-[200px]"
        >
          Cancel (Residency Verification Required)
        </button>
      )}
    </div>
  </form>
  );
};

export default Profile;
