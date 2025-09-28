import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../utils/axiosConfig';
import Navbares from "../../components/Navbares";
import Sidebares from "../../components/Sidebares";
import LoadingSkeleton from "../../components/LoadingSkeleton";
import { FaFileAlt, FaBusinessTime, FaIdBadge, FaHome, FaPaperPlane, FaUser, FaCalendarAlt, FaIdCard, FaStar, FaMagic, FaCheckCircle, FaCertificate, FaExclamationTriangle, FaInfoCircle, FaTimes, FaSpinner, FaCamera, FaUpload, FaImage, FaTrash, FaList, FaEye, FaClock, FaCheck } from 'react-icons/fa';
import './RequestDocuments.css';

const RequestDocuments = () => {
  const navigate = useNavigate();
  const isMountedRef = useRef(true);
  const isFetchingRef = useRef(false);
  const [activeTab, setActiveTab] = useState('request'); // 'request' or 'status'
  const [showModal, setShowModal] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [purpose, setPurpose] = useState('');
  const [remarks, setRemarks] = useState('');
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [formValues, setFormValues] = useState({});
  const [residentData, setResidentData] = useState(() => {
    // Try to initialize with cached data
    const cached = sessionStorage.getItem('residentData');
    const cacheTime = sessionStorage.getItem('residentDataTime');
    const isRecent = cacheTime && (Date.now() - parseInt(cacheTime)) < 300000;
    
    if (cached && isRecent) {
      try {
        const cachedData = JSON.parse(cached);
        if (cachedData && cachedData.first_name) {
          console.log('RequestDocuments: Initializing with cached resident data');
          return cachedData;
        }
      } catch (e) {
        console.warn('Failed to initialize with cache:', e);
      }
    }
    
    return null;
  });
  const [loadingResident, setLoadingResident] = useState(() => {
    // Check if we have cached data on initial load
    const cached = sessionStorage.getItem('residentData');
    const cacheTime = sessionStorage.getItem('residentDataTime');
    const isRecent = cacheTime && (Date.now() - parseInt(cacheTime)) < 300000;
    
    if (cached && isRecent) {
      try {
        const cachedData = JSON.parse(cached);
        if (cachedData && cachedData.first_name) {
          console.log('RequestDocuments: Found valid cache on init, starting with loading=false');
          return false; // Start with loading false if we have valid cache
        }
      } catch (e) {
        console.warn('Failed to parse cache on init:', e);
      }
    }
    
    return true; // Default to loading true
  });
  const [autoRefresh, setAutoRefresh] = useState(false); // Disabled by default for this page
  const [lastDataCheck, setLastDataCheck] = useState(new Date());
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [showCamera, setShowCamera] = useState(false);
  const [cameraStream, setCameraStream] = useState(null);
  // Document status states
  const [requests, setRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [loadingRequests, setLoadingRequests] = useState(false);

  // Cache for resident data to avoid repeated API calls
  const [cachedResidentData, setCachedResidentData] = useState(() => {
    const cached = sessionStorage.getItem('residentData');
    return cached ? JSON.parse(cached) : null;
  });

  // Enhanced profile data normalization helper
  const normalizeProfileData = useCallback((rawData) => {
    if (!rawData) return null;
    
    // Handle different backend response structures
    let profile = null;
    
    // Priority order for extracting profile data:
    // 1. rawData.user.profile (most common structure)
    // 2. rawData.profile (direct profile object)
    // 3. rawData itself (direct data)
    if (rawData.user && rawData.user.profile) {
      profile = rawData.user.profile;
    } else if (rawData.profile) {
      profile = rawData.profile;
    } else if (rawData.first_name || rawData.last_name) {
      // Direct profile data
      profile = rawData;
    }
    
    if (!profile) return null;
    
    // Normalize field names for consistency
    const normalized = {
      ...profile,
      // Ensure avatar field exists (prefer current_photo)
      avatar: profile.avatar || profile.current_photo || null,
      // Ensure address fields are properly mapped
      current_address: profile.current_address || profile.full_address || profile.address || '',
      full_address: profile.full_address || profile.current_address || profile.address || '',
      // Ensure contact fields are mapped
      contact_number: profile.contact_number || profile.mobile_number || '',
      mobile_number: profile.mobile_number || profile.contact_number || '',
      // Ensure date fields are consistent
      birth_date: profile.birth_date || profile.date_of_birth || '',
      date_of_birth: profile.date_of_birth || profile.birth_date || '',
      // Ensure gender/sex consistency
      sex: profile.sex || profile.gender || '',
      gender: profile.gender || profile.sex || '',
      // Ensure civil status consistency
      civil_status: profile.civil_status || profile.civilStatus || '',
      civilStatus: profile.civilStatus || profile.civil_status || '',
    };
    
    console.log('Profile data normalized:', {
      original_keys: Object.keys(profile),
      normalized_keys: Object.keys(normalized),
      has_required_fields: !!(normalized.first_name && normalized.last_name)
    });
    
    return normalized;
  }, []); // Remove all dependencies to prevent infinite loops

  // Memoized fetch functions to prevent unnecessary re-renders
  const fetchResidentData = useCallback(async (forceRefresh = false) => {
    // Prevent multiple simultaneous calls
    if (isFetchingRef.current && !forceRefresh) {
      console.log('RequestDocuments: Already fetching, skipping duplicate call');
      return;
    }

    try {
      // Check cache first
      const cached = sessionStorage.getItem('residentData');
      const cacheTime = sessionStorage.getItem('residentDataTime');
      const isRecent = cacheTime && (Date.now() - parseInt(cacheTime)) < 300000; // 5 minutes
      
      if (cached && isRecent && !forceRefresh) {
        console.log('RequestDocuments: Using cached data');
        try {
          const cachedData = JSON.parse(cached);
          const normalized = normalizeProfileData(cachedData);
          if (normalized) {
            setResidentData(normalized);
            setCachedResidentData(normalized);
            setLoadingResident(false);
            return;
          }
        } catch (parseError) {
          console.warn('Failed to parse cached data:', parseError);
          // Clear invalid cache
          sessionStorage.removeItem('residentData');
          sessionStorage.removeItem('residentDataTime');
        }
      }

      console.log('RequestDocuments: Fetching fresh data...');
      isFetchingRef.current = true;
      setLoadingResident(true);
      
      let response;
      let data;
      
      try {
        // Use the same profile endpoint as Profile.jsx for consistency
        response = await axiosInstance.get('/profile');
        data = response.data;
      } catch (profileErr) {
        console.warn('Primary profile endpoint failed, trying fallback:', profileErr);
        try {
          // Try fallback endpoint
          response = await axiosInstance.get('/residents/my-profile');
          data = response.data;
        } catch (fallbackErr) {
          console.error('Both profile endpoints failed:', fallbackErr);
          throw new Error('Unable to fetch profile data from any endpoint');
        }
      }
      
      console.log('RequestDocuments: Raw profile data received:', data);
      
      // Normalize the data using our helper
      const normalized = normalizeProfileData(data);
      
      if (!normalized) {
        throw new Error('No valid profile data found in response');
      }
      
      console.log('RequestDocuments: Normalized profile data:', normalized);
      
      // Always cache the data in sessionStorage first, regardless of component mount status
      sessionStorage.setItem('residentData', JSON.stringify(normalized));
      sessionStorage.setItem('residentDataTime', Date.now().toString());
      
      // Only update state if component is still mounted
      if (isMountedRef.current) {
        setResidentData(normalized);
        setCachedResidentData(normalized);
        setLastDataCheck(new Date());
        
        // Clear any previous error feedback
        setFeedback(null);
        
        console.log('RequestDocuments: Successfully set resident data and clearing loading state');
      } else {
        console.log('RequestDocuments: Component unmounted, but data cached for next mount');
      }
    } catch (err) {
      console.error('Error fetching resident data:', err);
      if (isMountedRef.current) {
        const errorMessage = err.message || 'Failed to load your profile data';
        setFeedback({ 
          type: 'error', 
          message: `${errorMessage}. Please complete your resident profile first.`,
          actions: [
            { label: 'Complete Profile', action: () => navigate('/user/profile') },
            { label: 'Retry', action: () => fetchResidentData(true) }
          ]
        });
      }
    } finally {
      isFetchingRef.current = false;
      // Always end loading to avoid getting stuck on skeleton
      console.log('RequestDocuments: Finally block - clearing loading state, isMounted:', isMountedRef.current);
      if (isMountedRef.current) {
        setLoadingResident(false);
      } else {
        // Component unmounted during fetch, but still clear loading in case of remount
        console.log('RequestDocuments: Component unmounted during fetch, but clearing loading anyway');
        setLoadingResident(false);
      }
    }
  }, [navigate]); // Remove normalizeProfileData dependency to prevent infinite loops

  const fetchMyRequests = useCallback(async () => {
    try {
      setLoadingRequests(true);
      const response = await axiosInstance.get('/document-requests/my');
      setRequests(response.data.requests || []);
    } catch (err) {
      console.error('Error fetching requests:', err);
      setFeedback({ type: 'error', message: 'Failed to load your document requests.' });
    } finally {
      setLoadingRequests(false);
    }
  }, []);

  // Fetch resident data on component mount (only once)
  useEffect(() => {
    console.log('RequestDocuments: Component mounted, fetching resident data...');
    
    // Check if we already have cached data first
    const cached = sessionStorage.getItem('residentData');
    const cacheTime = sessionStorage.getItem('residentDataTime');
    const isRecent = cacheTime && (Date.now() - parseInt(cacheTime)) < 300000; // 5 minutes
    
    if (cached && isRecent) {
      console.log('RequestDocuments: Found recent cached data, using it immediately');
      try {
        const cachedData = JSON.parse(cached);
        const normalized = normalizeProfileData(cachedData);
        if (normalized && normalized.first_name) {
          console.log('RequestDocuments: Using cached data immediately and clearing loading');
          setResidentData(normalized);
          setCachedResidentData(normalized);
          setLoadingResident(false);
          return;
        }
      } catch (parseError) {
        console.warn('Failed to parse cached data on mount:', parseError);
        // Clear invalid cache and continue with fetch
        sessionStorage.removeItem('residentData');
        sessionStorage.removeItem('residentDataTime');
      }
    }
    
    // Use the memoized fetchResidentData function
    fetchResidentData(false);
    
    // Cleanup function
    return () => {
      console.log('RequestDocuments: Component unmounting, setting isMountedRef to false');
      isMountedRef.current = false;
    };
  }, []); // Remove fetchResidentData dependency to prevent infinite loops

  // Reset isMountedRef when component mounts
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Debug loading state and auto-clear if we have data but still loading
  useEffect(() => {
    console.log('RequestDocuments: Loading state changed:', { loadingResident, residentData: !!residentData });
    
    // Safety check: if we have resident data but still loading, clear the loading state
    if (loadingResident && residentData && residentData.first_name) {
      console.log('RequestDocuments: Safety check - have data but still loading, clearing loading state');
      setLoadingResident(false);
    }
  }, [loadingResident, residentData]);

  // Debug residentData state changes
  useEffect(() => {
    console.log('RequestDocuments: residentData state changed:', {
      hasResidentData: !!residentData,
      residentDataType: typeof residentData,
      residentDataKeys: residentData ? Object.keys(residentData) : 'null/undefined',
      firstNameExists: residentData?.first_name,
      lastNameExists: residentData?.last_name
    });
    
    // If we have resident data and the modal is open but form is empty, try to auto-fill
    if (residentData && showModal && selectedDoc && Object.keys(formValues).length === 0) {
      console.log('🔄 Resident data became available while modal is open, attempting auto-fill...');
      const autoFilledData = getAutoFilledFormData(selectedDoc.value, residentData);
      if (autoFilledData && Object.keys(autoFilledData).length > 0) {
        setFormValues(autoFilledData);
        setFeedback({
          type: 'success',
          message: '✅ Form auto-filled from your profile',
          duration: 3000
        });
      }
    }
  }, [residentData, showModal, selectedDoc, formValues]);

  // Safety timeout to prevent infinite loading
  useEffect(() => {
    if (!loadingResident) return;
    
    const timeout = setTimeout(() => {
      if (loadingResident && isMountedRef.current) {
        console.warn('RequestDocuments: Loading timeout reached, forcing end of loading state');
        setLoadingResident(false);
        setFeedback({ 
          type: 'error', 
          message: 'Loading took too long. Please refresh the page or try again.' 
        });
      }
    }, 10000); // 10 second timeout

    return () => clearTimeout(timeout);
  }, [loadingResident]);

  // Fetch document requests when status tab is active
  useEffect(() => {
    if (activeTab === 'status' && residentData && isMountedRef.current) {
      // Inline function to avoid dependency issues
      const loadRequests = async () => {
        try {
          setLoadingRequests(true);
          const response = await axiosInstance.get('/document-requests/my');
          setRequests(response.data || []);
        } catch (err) {
          console.error('Error fetching requests:', err);
          setFeedback({ type: 'error', message: 'Failed to load your document requests.' });
        } finally {
          setLoadingRequests(false);
        }
      };
      
      loadRequests();
    }
  }, [activeTab, residentData]); // Stable dependencies

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (showModal) {
      // Add class to body to prevent scrolling
      document.body.classList.add('modal-open');
      // Store current scroll position
      const scrollY = window.scrollY;
      document.body.style.top = `-${scrollY}px`;
    } else {
      // Remove class and restore scroll position
      document.body.classList.remove('modal-open');
      const scrollY = document.body.style.top;
      document.body.style.top = '';
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY || '0') * -1);
      }
    }
    
    // Cleanup function
    return () => {
      document.body.classList.remove('modal-open');
      document.body.style.top = '';
    };
  }, [showModal]);

  // Auto-refresh resident data periodically (optional)
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      // Inline refresh logic to avoid function dependency
      fetchResidentData(false);
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [autoRefresh]); // Only autoRefresh dependency

  // Enhanced auto-fill form when resident data becomes available and modal is open
  useEffect(() => {
    if (showModal && selectedDoc && Object.keys(formValues).length === 0) {
      // Try to get available data from any source with normalization
      const getAvailableData = () => {
        // Try current state data first
        if (residentData && Object.keys(residentData).length > 0) {
          return normalizeProfileData(residentData);
        }
        
        if (cachedResidentData && Object.keys(cachedResidentData).length > 0) {
          return normalizeProfileData(cachedResidentData);
        }
        
        // Try session storage as last resort
        const cachedDataString = sessionStorage.getItem('residentData');
        if (cachedDataString) {
          try {
            const parsedData = JSON.parse(cachedDataString);
            if (parsedData && Object.keys(parsedData).length > 0) {
              return normalizeProfileData(parsedData);
            }
          } catch (e) {
            console.error('Failed to parse session data in useEffect:', e);
            // Clear corrupted cache
            sessionStorage.removeItem('residentData');
            sessionStorage.removeItem('residentDataTime');
          }
        }
        return null;
      };

      const availableData = getAvailableData();
      
      if (availableData && (availableData.first_name || availableData.last_name)) {
        console.log('🔄 ResidentData became available via useEffect, auto-filling form...');
        console.log('📋 Available resident data:', {
          first_name: availableData.first_name,
          last_name: availableData.last_name,
          current_address: availableData.current_address,
          full_address: availableData.full_address,
          age: availableData.age,
          sex: availableData.sex,
          civil_status: availableData.civil_status,
          birth_date: availableData.birth_date
        });
        
        const autoFilledData = getAutoFilledFormData(selectedDoc.value, availableData);
        console.log('✅ Auto-filled data from useEffect:', autoFilledData);
        
        // Only set form values if we got valid autofill data
        if (autoFilledData && Object.keys(autoFilledData).length > 0) {
          setFormValues(autoFilledData);
          
          setFeedback({
            type: 'success',
            message: '✅ Form auto-filled from your profile',
            duration: 3000
          });
          
          // Auto-fill photo for Barangay Clearance from resident profile
          if (selectedDoc.value === 'Brgy Clearance' && (availableData?.current_photo || availableData?.avatar) && !photoPreview) {
            const photoUrl = (availableData.current_photo || availableData.avatar);
            const finalPhotoUrl = photoUrl && photoUrl.startsWith('http') 
              ? photoUrl 
              : `http://localhost:8000/storage/${photoUrl}`;
            setPhotoPreview(finalPhotoUrl);
            setSelectedPhoto(null);
          }
        } else {
          console.warn('⚠️ Auto-fill failed: No valid form data generated');
          setFeedback({
            type: 'validation',
            message: 'Profile data found but some fields may be missing. Please verify your information.',
            duration: 4000
          });
        }
      } else {
        console.warn('⚠️ No usable resident data available for auto-fill');
        setFeedback({
          type: 'validation',
          message: 'No resident data available. Please complete your profile first.',
          actions: [
            { label: 'Complete Profile', action: () => navigate('/user/profile') }
          ]
        });
      }
    }
  }, [showModal, selectedDoc, residentData, cachedResidentData, formValues, navigate, photoPreview]); // Add photoPreview dependency


  // Manual refresh function
  const handleRefreshData = useCallback(() => {
    fetchResidentData(true);
    setFeedback({
      type: 'loading',
      message: 'Refreshing your profile data...'
    });
    
    setTimeout(() => {
      setFeedback({
        type: 'success',
        message: '✅ Profile data refreshed successfully!',
        duration: 2000
      });
    }, 1000);
  }, []); // Empty dependency array since fetchResidentData is stable


  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getDocumentTypeColor = (type) => {
    switch (type) {
      case 'Brgy Clearance':
        return 'bg-blue-100 text-blue-800';
      case 'Brgy Indigency':
        return 'bg-purple-100 text-purple-800';
      case 'Brgy Residency':
        return 'bg-orange-100 text-orange-800';
      case 'Brgy Business Permit':
        return 'bg-pink-100 text-pink-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleShowDetails = (request) => {
    if (selectedRequest?.id === request.id) {
      setSelectedRequest(null);
    } else {
      setSelectedRequest(request);
    }
  };


  const documentOptions = [
    {
      label: "Barangay Clearance",
      icon: <FaFileAlt className="text-emerald-600 text-5xl mb-4 mx-auto transition-all duration-300 group-hover:scale-110 group-hover:text-emerald-500" />,
      value: "Brgy Clearance",
      description: "Official clearance for various purposes",
      gradient: "from-emerald-400 to-teal-500",
      bgPattern: "bg-gradient-to-br from-emerald-50 to-teal-50",
    },
    {
      label: "Barangay Business Permit",
      icon: <FaBusinessTime className="text-blue-600 text-5xl mb-4 mx-auto transition-all duration-300 group-hover:scale-110 group-hover:text-blue-500" />,
      value: "Brgy Business Permit",
      description: "Permit for business operations",
      gradient: "from-blue-400 to-indigo-500",
      bgPattern: "bg-gradient-to-br from-blue-50 to-indigo-50",
    },
    {
      label: "Certificate of Indigency",
      icon: <FaIdBadge className="text-purple-600 text-5xl mb-4 mx-auto transition-all duration-300 group-hover:scale-110 group-hover:text-purple-500" />,
      value: "Brgy Indigency",
      description: "Certificate for financial assistance",
      gradient: "from-purple-400 to-pink-500",
      bgPattern: "bg-gradient-to-br from-purple-50 to-pink-50",
    },
    {
      label: "Certificate of Residency",
      icon: <FaHome className="text-orange-600 text-5xl mb-4 mx-auto transition-all duration-300 group-hover:scale-110 group-hover:text-orange-500" />,
      value: "Brgy Residency",
      description: "Proof of residence certificate",
      gradient: "from-orange-400 to-red-500",
      bgPattern: "bg-gradient-to-br from-orange-50 to-red-50",
    },
    {
      label: "Barangay Certification",
      icon: <FaCertificate className="text-rose-600 text-5xl mb-4 mx-auto transition-all duration-300 group-hover:scale-110 group-hover:text-rose-500" />,
      value: "Brgy Certification",
      description: "Official certification for various needs",
      gradient: "from-rose-400 to-pink-500",
      bgPattern: "bg-gradient-to-br from-rose-50 to-pink-50",
    },
  ];

  // Helper function to format date for HTML date input
  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    // Convert ISO date to yyyy-MM-dd format
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    return date.toISOString().split('T')[0];
  };

  const getAutoFilledFormData = (documentType, sourceData = null) => {
    const dataSource = sourceData || residentData;
    
    if (!dataSource) {
      console.warn('❌ No resident data available for auto-fill');
      return {};
    }

    console.log('🔍 Auto-filling data for document type:', documentType);
    console.log('📋 Raw resident data:', dataSource);
    console.log('🔍 Key fields check:', {
      first_name: dataSource.first_name,
      last_name: dataSource.last_name,
      current_address: dataSource.current_address,
      full_address: dataSource.full_address,
      address: dataSource.address,
      contact_number: dataSource.contact_number,
      mobile_number: dataSource.mobile_number,
      birth_date: dataSource.birth_date,
      date_of_birth: dataSource.date_of_birth,
      age: dataSource.age,
      sex: dataSource.sex,
      gender: dataSource.gender,
      civil_status: dataSource.civil_status,
      civilStatus: dataSource.civilStatus,
      years_in_barangay: dataSource.years_in_barangay,
      period_of_stay: dataSource.period_of_stay,
      business_info: dataSource.business_info,
      avatar: dataSource.avatar,
      current_photo: dataSource.current_photo
    });

    const baseData = {
      purpose: '', // This will be manually filled
      remarks: '', // This will be manually filled
    };

    // Helper function to get full name
    const getFullName = (data) => {
      return `${data.first_name || ''} ${data.middle_name ? data.middle_name + ' ' : ''}${data.last_name || ''}${data.name_suffix ? ' ' + data.name_suffix : ''}`.trim();
    };

    // Helper function to get address - prioritize current_address from profile, then full_address from resident
    const getAddress = (data) => {
      return data.current_address || data.full_address || data.address || '';
    };

    // Helper function to get phone number - prioritize mobile_number from profile, then contact_number from resident
    const getPhoneNumber = (data) => {
      return data.mobile_number || data.contact_number || '';
    };

    switch (documentType) {
      case 'Brgy Clearance':
        const clearanceData = {
          ...baseData,
          name: getFullName(dataSource), // Field name is 'name' for Brgy Clearance
          address: getAddress(dataSource), // Field name is 'address' for Brgy Clearance
          periodOfStay: dataSource.years_in_barangay ? `${dataSource.years_in_barangay} years` : (dataSource.period_of_stay || ''),
          dateOfBirth: formatDateForInput(dataSource.birth_date || dataSource.date_of_birth) || '',
          gender: dataSource.sex || dataSource.gender || '',
          civilStatus: dataSource.civil_status || dataSource.civilStatus || '',
          birthplace: dataSource.birth_place || dataSource.birthplace || '',
          age: dataSource.age ? String(dataSource.age) : '',
        };
        console.log('✅ Generated Brgy Clearance data:', clearanceData);
        return clearanceData;
      
      case 'Brgy Business Permit':
        const businessData = {
          ...baseData,
          businessName: dataSource.business_info || dataSource.business_name || '',
          businessOwner: getFullName(dataSource),
          businessAddress: getAddress(dataSource), // Add business address
          contact_number: getPhoneNumber(dataSource), // Add phone number
        };
        console.log('✅ Generated Business Permit data:', businessData);
        return businessData;
      
      case 'Brgy Indigency':
        const indigencyData = {
          ...baseData,
          fullName: getFullName(dataSource), // Field name is 'fullName' for Indigency
          full_address: getAddress(dataSource), // Field name is 'full_address' for Indigency
          contact_number: getPhoneNumber(dataSource), // Add phone number
        };
        console.log('✅ Generated Indigency data:', indigencyData);
        return indigencyData;
      
      case 'Brgy Residency':
        const residencyData = {
          ...baseData,
          fullName: getFullName(dataSource), // Field name is 'fullName' for Residency
          address: getAddress(dataSource), // Field name is 'address' for Residency
          contact_number: getPhoneNumber(dataSource), // Add phone number
        };
        console.log('✅ Generated Residency data:', residencyData);
        return residencyData;
      
      case 'Brgy Certification':
        const certificationData = {
          ...baseData,
          fullName: getFullName(dataSource), // Field name is 'fullName' for Certification
          address: getAddress(dataSource), // Field name is 'address' for Certification
          dateOfBirth: formatDateForInput(dataSource.birth_date || dataSource.date_of_birth) || '',
          civilStatus: dataSource.civil_status || dataSource.civilStatus || '',
          age: dataSource.age ? String(dataSource.age) : '',
          // Additional fields for specific certifications
          childName: '', // For solo parent certification
          childBirthDate: '', // For solo parent certification
          registrationOffice: '', // For delayed registration
          registrationDate: '', // For delayed registration
        };
        console.log('✅ Generated Certification data:', certificationData);
        return certificationData;
      
      default:
        console.warn('⚠️ Unknown document type:', documentType);
        return baseData;
    }
  };

  const documentForms = {
    'Brgy Clearance': [
      { name: 'name', label: 'Full Name', type: 'text', required: true, autoFill: true },
      { name: 'address', label: 'Address', type: 'text', required: true, autoFill: true },
      { name: 'periodOfStay', label: 'Period of Stay', type: 'text', required: true, autoFill: true },
      { name: 'dateOfBirth', label: 'Date of Birth', type: 'date', required: true, autoFill: true },
      { name: 'gender', label: 'Gender', type: 'select', required: true, autoFill: true, options: ['Male', 'Female', 'Prefer not to say'] },
      { name: 'civilStatus', label: 'Civil Status', type: 'select', required: true, autoFill: true, options: ['Single', 'Married', 'Widowed', 'Divorced'] },
      { name: 'birthplace', label: 'Birthplace', type: 'text', required: true, autoFill: true },
      { name: 'age', label: 'Age', type: 'number', required: true, autoFill: true },
      { name: 'purpose', label: 'Purpose of Clearance', type: 'textarea', required: true, autoFill: false },
    ],
    'Brgy Business Permit': [
      { name: 'businessName', label: 'Business Name', type: 'text', required: true, autoFill: true },
      { name: 'businessOwner', label: 'Business Owner', type: 'text', required: true, autoFill: true },
      { name: 'businessAddress', label: 'Business Address', type: 'text', required: true, autoFill: true },
      { name: 'contact_number', label: 'Contact Number', type: 'tel', required: true, autoFill: true },
      { name: 'purpose', label: 'Purpose', type: 'textarea', required: true, autoFill: false },
    ],
    'Brgy Indigency': [
      { name: 'fullName', label: 'Full Name', type: 'text', required: true, autoFill: true },
      { name: 'full_address', label: 'Complete Address', type: 'text', required: true, autoFill: true },
      { name: 'contact_number', label: 'Contact Number', type: 'tel', required: true, autoFill: true },
      { name: 'purpose', label: 'Purpose', type: 'textarea', required: true, autoFill: false },
    ],
    'Brgy Residency': [
      { name: 'fullName', label: 'Full Name', type: 'text', required: true, autoFill: true },
      { name: 'address', label: 'Complete Address', type: 'text', required: true, autoFill: true },
      { name: 'contact_number', label: 'Contact Number', type: 'tel', required: true, autoFill: true },
      { name: 'purpose', label: 'Purpose', type: 'textarea', required: true, autoFill: false },
    ],
    'Brgy Certification': [
      { name: 'fullName', label: 'Full Name', type: 'text', required: true, autoFill: true },
      { name: 'address', label: 'Complete Address', type: 'text', required: true, autoFill: true },
      { name: 'dateOfBirth', label: 'Date of Birth', type: 'date', required: true, autoFill: true },
      { name: 'civilStatus', label: 'Civil Status', type: 'select', required: true, autoFill: true, options: ['Single', 'Married', 'Widowed', 'Divorced'] },
      { name: 'age', label: 'Age', type: 'number', required: true, autoFill: true },
      { name: 'purpose', label: 'Type of Certification', type: 'select', required: true, autoFill: false, options: [
        'Solo Parent Certification',
        'Delayed Registration of Birth Certificate',
        'Good Moral Character',
        'First Time Job Seeker',
        'Senior Citizen Certification',
        'PWD Certification',
        'Cohabitation Certificate',
        'No Income Certificate'
      ]},
      // Conditional fields for Solo Parent Certification
      { name: 'childName', label: 'Child\'s Full Name', type: 'text', required: false, autoFill: false, conditional: 'Solo Parent Certification' },
      { name: 'childBirthDate', label: 'Child\'s Birth Date', type: 'date', required: false, autoFill: false, conditional: 'Solo Parent Certification' },
      // Conditional fields for Delayed Registration
      { name: 'registrationOffice', label: 'Registration Office (Local Civil Registry)', type: 'text', required: false, autoFill: false, conditional: 'Delayed Registration of Birth Certificate' },
      { name: 'registrationDate', label: 'Registration Date', type: 'date', required: false, autoFill: false, conditional: 'Delayed Registration of Birth Certificate' },
      { name: 'remarks', label: 'Additional Information/Remarks', type: 'textarea', required: false, autoFill: false },
    ],
  };

  // Add purpose options for each document type
  const purposeOptions = {
    'Brgy Clearance': [
      'local employment',
      'loan',
      'identification',
      'ojt',
      'water/electric connection',
      'bank',
      'senior',
      'e-bike',
      'postal',
      'other specific',
    ],
    'Brgy Residency': [
      'verification and identification (School Requirement)',
      'verification and identification PWD',
      'other',
    ],
    'Brgy Indigency': [
      'verification and identification (philhealth Requirement)',
      'BOTICAB Requirement',
      'Medical/Financial Assistance',
      'Financial Assistance',
      'Animal Bite Vaccination',
      'Public Attorney\'s Office Assistance',
      'Burial/Financial Assistance',
      'other',
    ],
  };

  const openModal = async (doc) => {
    console.log('🔍 RequestDocuments: openModal clicked', { 
      doc: doc?.value, 
      hasResidentData: !!residentData,
      loadingResident,
      residentDataKeys: residentData ? Object.keys(residentData) : []
    });

    setSelectedDoc(doc);
    
    // Clear previous states
    setFeedback(null);
    setSelectedPhoto(null);
    setPhotoPreview(null);

    // Open modal first
    setShowModal(true);

    // Enhanced data retrieval with normalization
    const getAvailableResidentData = () => {
      // 1. Try current residentData state
      if (residentData && Object.keys(residentData).length > 0) {
        console.log('✅ Using current residentData state');
        return normalizeProfileData(residentData);
      }
      
      // 2. Try cachedResidentData state
      if (cachedResidentData && Object.keys(cachedResidentData).length > 0) {
        console.log('✅ Using cachedResidentData state');
        return normalizeProfileData(cachedResidentData);
      }
      
      // 3. Try session storage directly
      const cachedDataString = sessionStorage.getItem('residentData');
      if (cachedDataString) {
        try {
          const parsedData = JSON.parse(cachedDataString);
          if (parsedData && Object.keys(parsedData).length > 0) {
            console.log('✅ Using session storage data directly');
            return normalizeProfileData(parsedData);
          }
        } catch (parseError) {
          console.error('Failed to parse cached data:', parseError);
          // Clear corrupted cache
          sessionStorage.removeItem('residentData');
          sessionStorage.removeItem('residentDataTime');
        }
      }
      
      return null;
    };

    // Get available data immediately
    let currentResidentData = getAvailableResidentData();
    
    console.log('🔍 DEBUG - Checking available data:', {
      residentData: !!residentData,
      cachedResidentData: !!cachedResidentData,
      sessionStorageData: !!sessionStorage.getItem('residentData'),
      currentResidentData: !!currentResidentData,
      currentDataKeys: currentResidentData ? Object.keys(currentResidentData) : [],
      hasRequiredFields: currentResidentData ? !!(currentResidentData.first_name && currentResidentData.last_name) : false
    });

    // If no data available, try to fetch it
    if (!currentResidentData && !loadingResident) {
      console.log('🔄 No resident data available, attempting to fetch...');
      setFeedback({ 
        type: 'loading', 
        message: 'Loading your profile data...' 
      });
      
      try {
        await fetchResidentData(true); // Force refresh
        // After fetch, try to get data again
        currentResidentData = getAvailableResidentData();
      } catch (error) {
        console.error('Failed to fetch resident data:', error);
        setFeedback({ 
          type: 'error', 
          message: 'Failed to load profile data. Please refresh the page and try again.',
          actions: [
            { label: 'Complete Profile', action: () => navigate('/user/profile') },
            { label: 'Retry', action: () => fetchResidentData(true) }
          ]
        });
        return;
      }
    }

    // Auto-fill immediately if we have data, otherwise wait a bit
    const performAutoFill = () => {
      // Try to get data again
      if (!currentResidentData) {
        currentResidentData = getAvailableResidentData();
      }
      
      if (currentResidentData && (currentResidentData.first_name || currentResidentData.last_name)) {
        console.log('🔄 Auto-filling form data with normalized data:', {
          first_name: currentResidentData.first_name,
          last_name: currentResidentData.last_name,
          current_address: currentResidentData.current_address,
          full_address: currentResidentData.full_address,
          age: currentResidentData.age,
          sex: currentResidentData.sex,
          civil_status: currentResidentData.civil_status,
          birth_date: currentResidentData.birth_date
        });
        
        const autoFilledData = getAutoFilledFormData(doc.value, currentResidentData);
        console.log('✅ Auto-filled data generated:', autoFilledData);
        
        // Only set form values if we got valid data
        if (autoFilledData && Object.keys(autoFilledData).length > 0) {
          setFormValues(autoFilledData);
          
          // Update cached data states if they weren't set
          if (!residentData) {
            setResidentData(currentResidentData);
          }
          if (!cachedResidentData) {
            setCachedResidentData(currentResidentData);
          }
          
          setFeedback({
            type: 'success',
            message: '✅ Form auto-filled from your profile',
            duration: 3000
          });
      
          // Auto-fill photo for Barangay Clearance from resident profile
          if (doc.value === 'Brgy Clearance' && (currentResidentData?.current_photo || currentResidentData?.avatar)) {
            const photoUrl = (currentResidentData.current_photo || currentResidentData.avatar);
            const finalPhotoUrl = photoUrl && photoUrl.startsWith('http') 
              ? photoUrl 
              : `http://localhost:8000/storage/${photoUrl}`;
            setPhotoPreview(finalPhotoUrl);
            setSelectedPhoto(null);
            
            setTimeout(() => {
              setFeedback({
                type: 'success',
                message: '📸 Profile photo and form auto-filled!',
                duration: 2000
              });
            }, 1000);
          }
        } else {
          console.warn('⚠️ Auto-fill failed: No valid form data generated');
          setFeedback({
            type: 'validation',
            message: 'Profile data found but some fields may be missing. Please verify your information.',
            duration: 4000
          });
        }
      } else {
        console.warn('❌ Still no usable resident data available for auto-fill after all attempts');
        setFormValues({}); // Clear form values
        setFeedback({ 
          type: 'validation', 
          message: 'Profile data could not be loaded. Please complete your resident profile first.',
          actions: [
            { label: 'Complete Profile', action: () => navigate('/user/profile') },
            { label: 'Retry', action: () => fetchResidentData(true) }
          ]
        });
      }
    };

    // If we have data immediately, use it
    if (currentResidentData) {
      performAutoFill();
    } else {
      // Otherwise, wait a bit for potential state updates
      setTimeout(performAutoFill, 300);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedDoc(null);
    setPurpose('');
    setRemarks('');
    setFeedback(null);
    
    // Clean up photo states
    setSelectedPhoto(null);
    setPhotoPreview(null);
    setShowCamera(false);
    
    // Stop camera stream if active
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
  };

  // Photo handling functions
  const handlePhotoSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setFeedback({
          type: 'error',
          message: 'Please select a valid image file (JPEG, PNG, etc.)'
        });
        return;
      }
      
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        setFeedback({
          type: 'error',
          message: 'Photo size must be less than 5MB'
        });
        return;
      }
      
      setSelectedPhoto(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPhotoPreview(e.target.result);
      };
      reader.readAsDataURL(file);
      
      setFeedback({
        type: 'success',
        message: '📸 Photo selected successfully!'
      });
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user' // Front camera
        }
      });
      setCameraStream(stream);
      setShowCamera(true);
      setFeedback({
        type: 'success',
        message: '📷 Camera started! Position yourself and click capture.'
      });
    } catch (error) {
      console.error('Error accessing camera:', error);
      setFeedback({
        type: 'error',
        message: 'Unable to access camera. Please check permissions or use file upload instead.'
      });
    }
  };

  const capturePhoto = () => {
    if (!cameraStream) return;
    
    const video = document.getElementById('camera-video');
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0);
    
    canvas.toBlob((blob) => {
      const file = new File([blob], 'camera-photo.jpg', { type: 'image/jpeg' });
      setSelectedPhoto(file);
      setPhotoPreview(canvas.toDataURL());
      
      // Stop camera
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
      setShowCamera(false);
      
      setFeedback({
        type: 'success',
        message: '📸 Photo captured successfully!'
      });
    }, 'image/jpeg', 0.8);
  };

  const removePhoto = () => {
    setSelectedPhoto(null);
    setPhotoPreview(null);
    setFeedback({
      type: 'success',
      message: 'Photo removed'
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('🚀 Form submission started');
    console.log('📋 Current form values:', formValues);
    console.log('📄 Selected document:', selectedDoc);
    
    setLoading(true);
    setFeedback({ type: 'loading', message: 'Processing your request...' });
    
    try {
      // Validate required fields based on document type
      const requiredFields = documentForms[selectedDoc.value]?.filter(field => field.required) || [];
      console.log('✅ Required fields for', selectedDoc.value, ':', requiredFields.map(f => f.name));
      
      const missingFields = [];
      
      for (const field of requiredFields) {
        const fieldValue = formValues[field.name];
        console.log(`🔍 Checking field ${field.name}:`, fieldValue);
        
        if (!fieldValue || fieldValue.toString().trim() === '') {
          missingFields.push(field.label);
          console.log(`❌ Missing required field: ${field.name} (${field.label})`);
        }
      }
      
      // Special validation for conditional fields
      if (selectedDoc.value === 'Brgy Certification' && formValues.purpose) {
        const conditionalFields = documentForms[selectedDoc.value].filter(field => 
          field.conditional === formValues.purpose && field.required
        );
        for (const field of conditionalFields) {
          if (!formValues[field.name] || formValues[field.name].toString().trim() === '') {
            missingFields.push(field.label);
          }
        }
      }
      
      // Validate photo for Barangay Clearance (allow profile photo)
      if (selectedDoc.value === 'Brgy Clearance' && !selectedPhoto && !photoPreview) {
        missingFields.push('Photo');
      }
      
      if (missingFields.length > 0) {
        console.log('❌ Form validation failed. Missing fields:', missingFields);
        setFeedback({
          type: 'validation',
          message: `Please fill in all required fields: ${missingFields.join(', ')}`,
          duration: 5000
        });
        setLoading(false);
        return;
      }
      
      console.log('✅ Form validation passed. Proceeding with submission...');
      
      // Prepare submission data
      let purposeValue = formValues.purpose;
      if ((purposeValue === 'other' || purposeValue === 'other specific') && formValues.otherPurpose) {
        purposeValue = formValues.otherPurpose;
      }
      const submitFields = { ...formValues, purpose: purposeValue };
      delete submitFields.otherPurpose;
      
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('document_type', selectedDoc.value);
      formData.append('fields', JSON.stringify(submitFields));
      
      // Add photo if selected (only for Barangay Clearance)
      if (selectedDoc.value === 'Brgy Clearance' && selectedPhoto) {
        formData.append('photo', selectedPhoto);
      }
      
      // Debug logging
      console.log('Document request validation passed. Submitting:', {
        document_type: selectedDoc.value,
        fields: submitFields,
        hasPhoto: selectedDoc.value === 'Brgy Clearance' && (selectedPhoto || photoPreview) ? true : false,
        photoName: selectedPhoto?.name,
        requiredFieldsCount: requiredFields.length,
        formDataEntries: Array.from(formData.entries()).map(([key, value]) => [
          key,
          value instanceof File ? `File: ${value.name} (${value.size} bytes)` : value
        ])
      });
      
      const response = await axiosInstance.post('/document-requests', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      console.log('✅ Document request submitted successfully:', response.data);
      
      setFeedback({
        type: 'success',
        message: `🎉 ${selectedDoc.label} request submitted successfully!`,
        details: 'Your request has been received and is now being processed. You will receive notifications about status updates.',
        actions: [
          { label: 'Track Status', action: () => { closeModal(); setActiveTab('status'); } },
          { label: 'Request Another', action: () => { closeModal(); } },
          { label: 'Close', action: () => closeModal() }
        ]
      });
      
      // Reset form and close modal after success
      setTimeout(() => {
        setFormValues({});
        setSelectedPhoto(null);
        setPhotoPreview(null);
        setFeedback(null);
        closeModal();
      }, 3000);
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Submission failed. Please try again.';
      const errorCode = err.response?.status;
      const errorData = err.response?.data;
      
      let enhancedMessage = errorMessage;
      let errorType = 'error';
      let actions = [];
      
      if (errorCode === 422) {
        if (errorData?.error_code === 'NO_RESIDENT_PROFILE') {
          enhancedMessage = 'You need to complete your resident profile first before requesting documents.';
          errorType = 'validation';
          actions = [
            { label: 'Complete Profile', action: () => navigate('/user/profile') },
            { label: 'Try Again Later', action: () => setFeedback(null) }
          ];
        } else if (errorData?.error_code === 'INCOMPLETE_PROFILE') {
          enhancedMessage = 'Your resident profile is missing required information. Please update your profile.';
          errorType = 'validation';
          actions = [
            { label: 'Update Profile', action: () => navigate('/user/profile') },
            { label: 'Try Again Later', action: () => setFeedback(null) }
          ];
        } else {
          enhancedMessage = 'Please check all required fields and try again.';
          errorType = 'validation';
          actions = [
            { label: 'Try Again', action: () => setFeedback(null) },
            { label: 'Complete Profile', action: () => navigate('/user/profile') }
          ];
        }
      } else if (errorCode === 401) {
        enhancedMessage = 'Your session has expired. Please log in again.';
        errorType = 'auth';
        actions = [{ label: 'Login Again', action: () => navigate('/login') }];
      } else if (errorCode === 500) {
        enhancedMessage = 'Server error occurred. Please try again later or contact support.';
        errorType = 'server';
        actions = [
          { label: 'Try Again', action: () => setFeedback(null) },
          { label: 'Contact Support', action: () => window.open('mailto:support@barangay.gov.ph') }
        ];
      } else if (!navigator.onLine) {
        enhancedMessage = 'No internet connection. Please check your connection and try again.';
        errorType = 'network';
        actions = [{ label: 'Try Again', action: () => setFeedback(null) }];
      } else {
        actions = [
          { label: 'Try Again', action: () => setFeedback(null) },
                      { label: 'Complete Profile', action: () => navigate('/user/profile') }
        ];
      }
      
      setFeedback({
        type: errorType,
        message: enhancedMessage,
        details: errorCode ? `Error Code: ${errorCode}` : 'Please ensure your profile is complete before requesting documents.',
        actions: actions
      });
    } finally {
      setLoading(false);
    }
  };

  if (loadingResident) {
    return (
      <>
        <Navbares />
        <div className="flex min-h-screen bg-green-50">
          <Sidebares />
          <main className="flex-1 ml-64 pt-36 px-6 pb-16 font-sans">
            <LoadingSkeleton />
          </main>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbares />
      <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-emerald-50 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-emerald-200/30 to-blue-200/30 rounded-full blur-3xl animate-float"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-purple-200/30 to-pink-200/30 rounded-full blur-3xl animate-float-delayed"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-yellow-200/20 to-orange-200/20 rounded-full blur-3xl animate-pulse-slow"></div>
        </div>
        
        <Sidebares />
        <main className="flex-1 ml-64 pt-36 px-6 pb-16 font-sans flex flex-col items-center relative z-10">
          <div className="w-full max-w-6xl mx-auto">
            {/* Tab Navigation */}
            <div className="flex border-b border-gray-200 mb-8">
              <button
                className={`py-4 px-6 text-center font-bold text-lg relative transition-all duration-300 ${
                  activeTab === 'request'
                    ? 'text-emerald-600 border-b-2 border-emerald-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setActiveTab('request')}
              >
                <div className="flex items-center justify-center gap-2">
                  <FaFileAlt className="w-5 h-5" />
                  Request Documents
                </div>
                {activeTab === 'request' && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600 animate-pulse"></div>
                )}
              </button>
              <button
                className={`py-4 px-6 text-center font-bold text-lg relative transition-all duration-300 ${
                  activeTab === 'status'
                    ? 'text-emerald-600 border-b-2 border-emerald-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setActiveTab('status')}
              >
                <div className="flex items-center justify-center gap-2">
                  <FaList className="w-5 h-5" />
                  Document Status
                </div>
                {activeTab === 'status' && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600 animate-pulse"></div>
                )}
              </button>
            </div>

            {/* Tab Content */}
            {activeTab === 'request' ? (
              /* Request Documents Tab */
              <div>
                {/* Enhanced Header with floating elements */}
                <div className="text-center space-y-6 mb-12 relative">
              {/* Floating decorative elements */}
              <div className="absolute -top-8 left-1/4 w-4 h-4 bg-gradient-to-r from-emerald-400 to-blue-400 rounded-full animate-bounce-slow opacity-60"></div>
              <div className="absolute -top-4 right-1/3 w-3 h-3 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full animate-bounce-delayed opacity-60"></div>
              <div className="absolute top-2 left-1/3 w-2 h-2 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full animate-pulse opacity-60"></div>
              
              <div className="relative inline-flex items-center justify-center">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 via-blue-500 to-purple-600 rounded-full blur-xl opacity-30 animate-pulse-slow"></div>
                <div className="relative w-24 h-24 bg-gradient-to-br from-emerald-500 via-blue-500 to-purple-600 rounded-full shadow-2xl flex items-center justify-center transform hover:scale-110 transition-all duration-300">
                  <FaMagic className="w-8 h-8 text-white animate-pulse" />
                  <FaFileAlt className="w-10 h-10 text-white absolute" />
                </div>
              </div>
              
              <div className="space-y-4">
                <h1 className="text-5xl md:text-6xl font-black bg-gradient-to-r from-emerald-600 via-blue-600 to-purple-600 bg-clip-text text-transparent tracking-tight leading-tight">
                  Request Documents
                </h1>
                <div className="flex items-center justify-center gap-2 text-2xl md:text-3xl font-bold text-gray-700">
                  <FaStar className="text-yellow-400 animate-pulse" />
                  <span className="bg-gradient-to-r from-gray-700 to-gray-600 bg-clip-text text-transparent">
                    Barangay Services
                  </span>
                  <FaStar className="text-yellow-400 animate-pulse" />
                </div>
                <p className="text-gray-600 text-xl max-w-3xl mx-auto leading-relaxed font-medium">
                  Choose the document you need and we'll auto-fill your information from your profile.
                  <span className="text-emerald-600 font-semibold"> Fast, secure, and convenient!</span>
                </p>
              </div>
            </div>

            {/* Enhanced Document Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 justify-center mb-12">
              {documentOptions.map((doc, index) => (
                <div
                  key={index}
                  onClick={() => openModal(doc)}
                  className={`relative ${doc.bgPattern} border-2 border-white/50 rounded-3xl p-8 text-center shadow-xl hover:shadow-2xl transform hover:scale-105 hover:-translate-y-2 transition-all duration-500 cursor-pointer group overflow-hidden backdrop-blur-sm`}
                  style={{
                    animationDelay: `${index * 0.1}s`,
                  }}
                >
                  {/* Gradient overlay on hover */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${doc.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300 rounded-3xl`}></div>
                  
                  {/* Floating particles effect */}
                  <div className="absolute inset-0 overflow-hidden rounded-3xl">
                    <div className="absolute top-4 right-4 w-2 h-2 bg-white/40 rounded-full animate-float opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="absolute bottom-6 left-6 w-1.5 h-1.5 bg-white/30 rounded-full animate-float-delayed opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="absolute top-1/2 left-4 w-1 h-1 bg-white/50 rounded-full animate-pulse opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                  
                  {/* Content */}
                  <div className="relative z-10">
                    <div className="mb-6 relative">
                      {doc.icon}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full blur-xl"></div>
                    </div>
                    <h3 className="font-bold text-gray-800 text-lg mb-2 group-hover:text-gray-900 transition-colors duration-300">
                      {doc.label}
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed group-hover:text-gray-700 transition-colors duration-300">
                      {doc.description}
                    </p>
                    
                    {/* Hover indicator */}
                    <div className="mt-4 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                      <span className="text-sm font-semibold text-gray-700">Click to request</span>
                      <FaPaperPlane className="w-3 h-3 text-gray-600" />
                    </div>
                  </div>
                  
                  {/* Shine effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out"></div>
                </div>
              ))}
            </div>
            
            {/* Additional info section with refresh option */}
            <div className="text-center bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/50 shadow-lg">
              <div className="flex items-center justify-center gap-3 mb-3">
                <FaCheckCircle className="text-emerald-500 text-xl" />
                <h3 className="text-lg font-bold text-gray-800">Quick & Easy Process</h3>
                <FaCheckCircle className="text-emerald-500 text-xl" />
              </div>
              <p className="text-gray-600 max-w-2xl mx-auto mb-4">
                All documents are processed efficiently with your pre-filled information.
                Track your request status and receive notifications when ready for pickup.
              </p>
              
              {/* Data freshness indicator and refresh option */}
              <div className="flex items-center justify-center gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <FaInfoCircle className="text-blue-500" />
                  <span>Data last updated: {lastDataCheck.toLocaleTimeString()}</span>
                </div>
                <button
                  onClick={handleRefreshData}
                  className="flex items-center gap-2 px-3 py-1.5 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition-all duration-200 text-xs font-medium"
                >
                  <FaSpinner className="w-3 h-3" />
                  Refresh Profile
                </button>
                  <button
                    onClick={() => {
                      console.log('🔍 DEBUG - Current resident data:', residentData);
                      console.log('🔍 DEBUG - Resident data fields:', {
                        first_name: residentData?.first_name,
                        last_name: residentData?.last_name,
                        current_address: residentData?.current_address,
                        age: residentData?.age,
                        sex: residentData?.sex,
                        civil_status: residentData?.civil_status,
                        birth_date: residentData?.birth_date
                      });
                    }}
                    className="flex items-center gap-2 px-3 py-1.5 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-lg transition-all duration-200 text-xs font-medium"
                  >
                    <FaInfoCircle className="w-3 h-3" />
                    Debug Data
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Document Status Tab */
          <div>
            {loadingRequests ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-4">
                  <h2 className="text-white font-semibold text-lg">My Document Requests</h2>
                </div>
                
                {requests.length === 0 ? (
                  <div className="p-12 text-center">
                    <FaFileAlt className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No document requests found</h3>
                    <p className="text-gray-500">You haven't submitted any document requests yet.</p>
                    <button
                      onClick={() => setActiveTab('request')}
                      className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                      Request a Document
                    </button>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {requests.map((request) => (
                      <div key={request.id} className="p-6 hover:bg-gray-50 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-4">
                              <div className="flex-shrink-0">
                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getDocumentTypeColor(request.document_type)}`}>
                                  {request.document_type}
                                </span>
                              </div>
                              <div className="flex-1">
                                <h3 className="text-lg font-semibold text-gray-900">
                                  {request.document_type}
                                </h3>
                                <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                                  <span className="flex items-center gap-1">
                                    <FaCalendarAlt className="w-4 h-4" />
                                    Requested: {formatDate(request.created_at)}
                                  </span>
                                  {request.status.toLowerCase() === 'approved' && (
                                    <span className="flex items-center gap-1">
                                      <FaCheck className="w-4 h-4" />
                                      Approved: {formatDate(request.updated_at)}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(request.status)}`}>
                                  {request.status === 'approved' ? <FaCheck className="w-4 h-4" /> :
                                   request.status === 'pending' ? <FaClock className="w-4 h-4" /> :
                                   request.status === 'rejected' ? <FaTimes className="w-4 h-4" /> :
                                   <FaSpinner className="w-4 h-4" />}
                                  {request.status}
                                </span>
                                <button
                                  onClick={() => handleShowDetails(request)}
                                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-lg text-sm font-medium transition-colors"
                                >
                                  <FaEye className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Expanded Details */}
                        {selectedRequest?.id === request.id && (
                          <div className="mt-6 bg-gray-50 rounded-xl p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              {/* Request Details */}
                              <div className="space-y-4">
                                <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                                  <FaFileAlt className="w-5 h-5" />
                                  Request Details
                                </h4>
                                <div className="space-y-2 text-sm">
                                  <div><span className="font-medium text-gray-700">Document Type:</span> {request.document_type}</div>
                                  <div><span className="font-medium text-gray-700">Status:</span> {request.status}</div>
                                  <div><span className="font-medium text-gray-700">Request Date:</span> {formatDate(request.created_at)}</div>
                                  {request.status.toLowerCase() === 'approved' && (
                                    <div><span className="font-medium text-gray-700">Approved Date:</span> {formatDate(request.updated_at)}</div>
                                  )}
                                  {request.fields?.purpose && (
                                    <div><span className="font-medium text-gray-700">Purpose:</span> {request.fields.purpose}</div>
                                  )}
                                  {request.fields?.remarks && (
                                    <div><span className="font-medium text-gray-700">Remarks:</span> {request.fields.remarks}</div>
                                  )}
                                </div>
                              </div>

                              {/* Personal Information */}
                              <div className="space-y-4">
                                <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                                  <FaUser className="w-5 h-5" />
                                  Personal Information
                                </h4>
                                <div className="space-y-2 text-sm">
                                  {request.resident && (
                                    <>
                                      <div><span className="font-medium text-gray-700">Full Name:</span> {`${request.resident.first_name} ${request.resident.middle_name ? request.resident.middle_name + ' ' : ''}${request.resident.last_name}${request.resident.name_suffix ? ' ' + request.resident.name_suffix : ''}`}</div>
                                      <div><span className="font-medium text-gray-700">Age:</span> {request.resident.age}</div>
                                      <div><span className="font-medium text-gray-700">Civil Status:</span> {request.resident.civil_status}</div>
                                      <div><span className="font-medium text-gray-700">Gender:</span> {request.resident.sex}</div>
                                      <div><span className="font-medium text-gray-700">Contact:</span> {request.resident.contact_number}</div>
                                      <div><span className="font-medium text-gray-700">Email:</span> {request.resident.email}</div>
                                      <div><span className="font-medium text-gray-700">Address:</span> {request.resident.full_address}</div>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  </div>

      {/* Enhanced Modal for document request */}
      {showModal && selectedDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-md p-2 sm:p-4 modal-fade-in">
          <div className="relative w-full max-w-3xl max-h-[95vh] sm:max-h-[90vh] flex flex-col animate-fadeIn">
            {/* Enhanced gradient border with animation */}
            <div className="absolute inset-0 rounded-3xl pointer-events-none z-0 animate-pulse-slow" style={{
              background: `linear-gradient(135deg, ${selectedDoc.gradient.replace('from-', '').replace('to-', '').replace('-400', '').replace('-500', '')})`,
              filter: 'blur(12px)',
              opacity: 0.25
            }} />
            
            {/* Modal Card with enhanced glassmorphism */}
            <div className="relative bg-white/95 backdrop-blur-3xl rounded-3xl shadow-2xl border border-white/30 z-10 flex flex-col h-full overflow-hidden" style={{
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.2) inset',
              maxHeight: '90vh'
            }}>
              {/* Animated background pattern */}
              <div className="absolute inset-0 opacity-5 z-0" style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0L35 25L60 30L35 35L30 60L25 35L0 30L25 25L30 0Z' fill='%23${selectedDoc.gradient.includes('emerald') ? '10b981' : selectedDoc.gradient.includes('blue') ? '3b82f6' : selectedDoc.gradient.includes('purple') ? '8b5cf6' : 'f97316'}'/%3E%3C/svg%3E")`,
                animation: 'float 6s ease-in-out infinite',
              }} />
              
              {/* Enhanced Header with dynamic gradient */}
              <div className={`bg-gradient-to-r ${selectedDoc.gradient} rounded-t-3xl p-4 sm:p-6 flex items-center gap-2 sm:gap-4 relative z-10 flex-shrink-0 overflow-hidden`}>
                {/* Header background animation */}
                <div className="absolute inset-0 bg-gradient-to-r from-white/10 via-transparent to-white/10 -skew-x-12 transform -translate-x-full animate-shimmer"></div>
                
                <div className="bg-white/25 rounded-full p-2 sm:p-3 shadow-lg flex-shrink-0 backdrop-blur-sm border border-white/20">
                  <div className="relative">
                    {React.cloneElement(selectedDoc.icon, {
                      className: "w-6 h-6 sm:w-8 sm:h-8 text-white drop-shadow-lg"
                    })}
                    <div className="absolute inset-0 bg-white/20 rounded-full animate-ping opacity-30"></div>
                  </div>
                </div>
                
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg sm:text-xl md:text-2xl font-black text-white mb-1 flex items-center gap-2 flex-wrap drop-shadow-lg">
                    <span className="truncate">Request {selectedDoc.label}</span>
                    <span className="px-3 py-1.5 rounded-full bg-white/20 text-white text-xs font-bold border border-white/30 shadow-lg flex-shrink-0 backdrop-blur-sm">
                      {selectedDoc.label}
                    </span>
                  </h2>
                  <p className="text-white/90 text-xs sm:text-sm font-medium drop-shadow">
                    Fill out the form to request your document • Auto-filled from profile
                  </p>
                </div>
                
                <button
                  onClick={closeModal}
                  className="p-2 sm:p-2.5 rounded-full hover:bg-white/20 text-white text-xl sm:text-2xl transition-all duration-300 flex-shrink-0 backdrop-blur-sm border border-white/20 hover:border-white/40 hover:scale-110"
                  aria-label="Close"
                >
                  ×
                </button>
              </div>
              
              {/* Scrollable Form Content */}
              <div className="flex-1 overflow-y-auto min-h-0 modal-scroll modal-content" style={{ 
                scrollbarWidth: 'thin', 
                scrollbarColor: '#10b981 transparent',
                overscrollBehavior: 'contain',
                maxHeight: 'calc(90vh - 200px)' // Account for header and footer
              }}>
                <form id="document-request-form" onSubmit={handleSubmit} className="space-y-4 sm:space-y-6 p-4 sm:p-6 lg:p-8">
                {documentForms[selectedDoc.value]?.map(field => {
                  // Skip conditional fields if they don't match the selected purpose
                  if (field.conditional && formValues.purpose !== field.conditional) {
                    return null;
                  }

                  // Choose icon based on field
                  let Icon = FaUser;
                  if (field.name.toLowerCase().includes('date')) Icon = FaCalendarAlt;
                  if (field.name.toLowerCase().includes('address')) Icon = FaHome;
                  if (field.name.toLowerCase().includes('purpose')) Icon = FaIdCard;
                  if (field.name.toLowerCase().includes('business')) Icon = FaBusinessTime;
                  if (field.name.toLowerCase().includes('id')) Icon = FaIdBadge;
                  if (field.name.toLowerCase().includes('child')) Icon = FaUser;
                  if (field.name.toLowerCase().includes('registration')) Icon = FaFileAlt;

                  // Determine if field is required based on conditional logic
                  const isRequired = field.required || (field.conditional && formValues.purpose === field.conditional);

                  return (
                    <div key={field.name} className="space-y-2">
                      {/* Fixed label above field */}
                      <label className="block text-sm font-semibold text-gray-700">
                        {field.label}
                        {field.autoFill && <span className="text-emerald-600 text-xs ml-1 font-normal">(Auto-filled)</span>}
                        {isRequired && <span className="text-red-500 ml-1">*</span>}
                      </label>
                      {/* Purpose dropdown logic for non-certification documents */}
                      {field.name === 'purpose' && purposeOptions[selectedDoc.value] ? (
                        <>
                          <div className="relative">
                            <Icon className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-500 text-base z-10" />
                            <select
                              name="purpose"
                              value={formValues.purpose || ''}
                              onChange={e => setFormValues(v => ({ ...v, purpose: e.target.value, otherPurpose: '' }))}
                              className="w-full border-2 border-gray-200 rounded-xl pl-10 pr-4 py-3 focus:ring-2 focus:ring-emerald-400 focus:border-emerald-500 transition-all duration-200 shadow-sm hover:border-emerald-300 bg-white text-base form-field-focus"
                              required
                            >
                              <option value="">Select purpose</option>
                              {purposeOptions[selectedDoc.value].map(opt => (
                                <option key={opt} value={opt}>{opt.charAt(0).toUpperCase() + opt.slice(1)}</option>
                              ))}
                            </select>
                          </div>
                          {(formValues.purpose === 'other' || formValues.purpose === 'other specific') && (
                            <input
                              type="text"
                              name="otherPurpose"
                              value={formValues.otherPurpose || ''}
                              onChange={e => setFormValues(v => ({ ...v, otherPurpose: e.target.value }))}
                              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 mt-3 focus:ring-2 focus:ring-emerald-400 focus:border-emerald-500 transition-all duration-200 shadow-sm bg-white text-base form-field-focus"
                              placeholder="Please specify other purpose"
                              required
                            />
                          )}
                        </>
                      ) : field.type === 'select' ? (
                        <div className="relative">
                          <Icon className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-500 text-base z-10" />
                          <select
                            name={field.name}
                            value={formValues[field.name] || ''}
                            onChange={e => setFormValues(v => ({ ...v, [field.name]: e.target.value }))}
                            className={`w-full border-2 border-gray-200 rounded-xl pl-10 pr-4 py-3 focus:ring-2 focus:ring-emerald-400 focus:border-emerald-500 transition-all duration-200 shadow-sm hover:border-emerald-300 text-base form-field-focus ${field.autoFill ? 'bg-emerald-50 border-emerald-200' : 'bg-white'}`}
                            required={isRequired}
                            readOnly={field.autoFill}
                          >
                            <option value="">Select {field.label}</option>
                            {field.options.map(opt => (
                              <option key={opt} value={opt}>{opt}</option>
                            ))}
                          </select>
                        </div>
                      ) : field.type === 'textarea' ? (
                        <div className="relative">
                          <Icon className="absolute left-3 top-4 text-emerald-500 text-base z-10" />
                          <textarea
                            name={field.name}
                            value={formValues[field.name] || ''}
                            onChange={e => setFormValues(v => ({ ...v, [field.name]: e.target.value }))}
                            className={`w-full border-2 border-gray-200 rounded-xl pl-10 pr-4 py-3 focus:ring-2 focus:ring-emerald-400 focus:border-emerald-500 transition-all duration-200 shadow-sm text-base form-field-focus ${field.autoFill ? 'bg-emerald-50 border-emerald-200' : 'bg-white'}`}
                            required={isRequired}
                            rows={4}
                            readOnly={field.autoFill}
                            placeholder={field.autoFill ? 'Auto-filled from your profile' : `Enter ${field.label.toLowerCase()}`}
                          />
                        </div>
                      ) : (
                        <div className="relative">
                          <Icon className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-500 text-base z-10" />
                          <input
                            type={field.type}
                            name={field.name}
                            value={formValues[field.name] || ''}
                            onChange={e => setFormValues(v => ({ ...v, [field.name]: e.target.value }))}
                            className={`w-full border-2 border-gray-200 rounded-xl pl-10 pr-4 py-3 focus:ring-2 focus:ring-emerald-400 focus:border-emerald-500 transition-all duration-200 shadow-sm text-base form-field-focus ${field.autoFill ? 'bg-emerald-50 border-emerald-200' : 'bg-white'}`}
                            required={isRequired}
                            readOnly={field.autoFill}
                            placeholder={field.autoFill ? 'Auto-filled from your profile' : `Enter ${field.label.toLowerCase()}`}
                          />
                        </div>
                      )}
                </div>
                  );
                })}
                
                {/* Photo Upload Section - Only for Barangay Clearance */}
                {selectedDoc.value === 'Brgy Clearance' && (
                  <div className="space-y-4 border-t border-gray-200 pt-6">
                    <div className="flex items-center gap-2 mb-4">
                      <FaImage className="text-emerald-500 text-lg" />
                      <h3 className="text-lg font-semibold text-gray-800">Your Photo</h3>
                      {(residentData?.current_photo || residentData?.avatar) ? (
                        <span className="text-sm text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">(Auto-filled from profile)</span>
                      ) : (
                        <span className="text-sm text-gray-500">(Upload required)</span>
                      )}
                    </div>
                    
                    {!photoPreview ? (
                      <div className="space-y-4">
                        {/* Camera Section */}
                        {showCamera && cameraStream ? (
                          <div className="bg-gray-100 rounded-xl p-4 text-center">
                            <video
                              id="camera-video"
                              autoPlay
                              playsInline
                              muted
                              className="w-full max-w-md mx-auto rounded-lg shadow-lg"
                              ref={(video) => {
                                if (video && cameraStream) {
                                  video.srcObject = cameraStream;
                                }
                              }}
                            />
                            <div className="flex gap-3 justify-center mt-4">
                              <button
                                type="button"
                                onClick={capturePhoto}
                                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg flex items-center gap-2 transition-colors"
                              >
                                <FaCamera className="w-4 h-4" />
                                Capture Photo
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  if (cameraStream) {
                                    cameraStream.getTracks().forEach(track => track.stop());
                                    setCameraStream(null);
                                  }
                                  setShowCamera(false);
                                }}
                                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* File Upload */}
                            <div className="relative">
                              <input
                                type="file"
                                accept="image/*"
                                onChange={handlePhotoSelect}
                                className="hidden"
                                id="photo-upload"
                              />
                              <label
                                htmlFor="photo-upload"
                                className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-emerald-300 rounded-xl cursor-pointer hover:border-emerald-400 hover:bg-emerald-50 transition-all duration-200"
                              >
                                <FaUpload className="w-8 h-8 text-emerald-500 mb-2" />
                                <span className="text-sm font-medium text-gray-700">Upload Photo</span>
                                <span className="text-xs text-gray-500 mt-1">JPEG, PNG (Max 5MB)</span>
                              </label>
                            </div>
                            
                            {/* Camera Capture */}
                            <button
                              type="button"
                              onClick={startCamera}
                              className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-blue-300 rounded-xl cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all duration-200"
                            >
                              <FaCamera className="w-8 h-8 text-blue-500 mb-2" />
                              <span className="text-sm font-medium text-gray-700">Take Photo</span>
                              <span className="text-xs text-gray-500 mt-1">Use Camera</span>
                            </button>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="bg-gray-50 rounded-xl p-4">
                        <div className="flex items-start gap-4">
                          <img
                            src={photoPreview}
                            alt="Selected photo"
                            className="w-24 h-24 object-cover rounded-lg shadow-md"
                          />
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-800 mb-1">
                              {selectedPhoto ? 'Photo Selected' : 'Profile Photo'}
                            </h4>
                            <p className="text-sm text-gray-600 mb-3">
                              {selectedPhoto ? (
                                <>
                                  {selectedPhoto.name}
                                  {selectedPhoto.size && ` (${(selectedPhoto.size / 1024 / 1024).toFixed(2)} MB)`}
                                </>
                              ) : (
                                'Using photo from your resident profile'
                              )}
                            </p>
                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={removePhoto}
                                className="flex items-center gap-2 px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg text-sm transition-colors"
                              >
                                <FaTrash className="w-3 h-3" />
                                {selectedPhoto ? 'Remove Photo' : 'Remove Profile Photo'}
                              </button>
                              {!selectedPhoto && (
                                <span className="text-xs text-emerald-600 bg-emerald-50 px-2 py-1.5 rounded-lg">
                                  ✓ Auto-filled
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <div className="flex items-start gap-2">
                        <FaInfoCircle className="text-blue-500 mt-0.5 flex-shrink-0" />
                        <div className="text-sm text-blue-800">
                          <p className="font-medium mb-1">Photo Information:</p>
                          <ul className="text-xs space-y-1 text-blue-700">
                            {(residentData?.current_photo || residentData?.avatar) ? (
                              <>
                                <li>• Your profile photo will be automatically used</li>
                                <li>• You can upload a different photo if needed</li>
                                <li>• Photo will be used for document verification</li>
                                <li>• Maximum file size: 5MB for new uploads</li>
                              </>
                            ) : (
                              <>
                                <li>• Use a clear, recent photo (passport-style preferred)</li>
                                <li>• Ensure good lighting and face is clearly visible</li>
                                <li>• Photo will be used for document verification</li>
                                <li>• Maximum file size: 5MB</li>
                              </>
                            )}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {feedback && (
                  <div className={`rounded-xl p-4 border-2 transition-all duration-300 ${
                    feedback.type === 'success'
                      ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 text-green-800'
                      : feedback.type === 'loading'
                      ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 text-blue-800'
                      : feedback.type === 'validation'
                      ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200 text-yellow-800'
                      : feedback.type === 'auth'
                      ? 'bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200 text-purple-800'
                      : feedback.type === 'network'
                      ? 'bg-gradient-to-r from-gray-50 to-slate-50 border-gray-200 text-gray-800'
                      : 'bg-gradient-to-r from-red-50 to-rose-50 border-red-200 text-red-800'
                  }`}>
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-0.5">
                        {feedback.type === 'success' && <FaCheckCircle className="w-5 h-5 text-green-600" />}
                        {feedback.type === 'loading' && <FaSpinner className="w-5 h-5 text-blue-600 animate-spin" />}
                        {feedback.type === 'validation' && <FaExclamationTriangle className="w-5 h-5 text-yellow-600" />}
                        {feedback.type === 'auth' && <FaInfoCircle className="w-5 h-5 text-purple-600" />}
                        {feedback.type === 'network' && <FaExclamationTriangle className="w-5 h-5 text-gray-600" />}
                        {(feedback.type === 'error' || feedback.type === 'server') && <FaTimes className="w-5 h-5 text-red-600" />}
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-base mb-1">{feedback.message}</div>
                        {feedback.details && (
                          <div className="text-sm opacity-80 mb-2">{feedback.details}</div>
                        )}
                        {feedback.actions && feedback.actions.length > 0 && (
                          <div className="flex gap-2 mt-3">
                            {feedback.actions.map((action, index) => (
                              <button
                                key={index}
                                onClick={action.action}
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                                  feedback.type === 'success'
                                    ? 'bg-green-600 hover:bg-green-700 text-white'
                                    : feedback.type === 'auth'
                                    ? 'bg-purple-600 hover:bg-purple-700 text-white'
                                    : 'bg-gray-600 hover:bg-gray-700 text-white'
                                }`}
                              >
                                {action.label}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Enhanced success animation - only show for actual submission */}
                {feedback?.type === 'success' && feedback?.message?.includes('submitted successfully') && (
                  <div className="flex flex-col items-center mt-4 space-y-2">
                    <div className="relative">
                      <div className="animate-bounce">
                        <div className="w-16 h-16 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-lg">
                          <FaCheckCircle className="text-white text-2xl" />
                        </div>
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full animate-ping opacity-30"></div>
                    </div>
                    <div className="text-center">
                      <div className="text-green-700 font-semibold">Request Submitted!</div>
                      <div className="text-green-600 text-sm">Processing will begin shortly</div>
                    </div>
                  </div>
                )}
                </form>
              </div>
              
              {/* Fixed Footer with Action Buttons */}
              <div className="bg-white/80 backdrop-blur-sm border-t border-gray-200/50 p-4 sm:p-6 rounded-b-3xl flex-shrink-0 relative z-10">
                  <div className="flex flex-col sm:flex-row justify-between gap-2 sm:gap-3">
                    {/* Debug button for testing autofill */}
                    <button
                      type="button"
                      onClick={() => {
                        console.log('🔄 Manual autofill triggered');
                        console.log('🔍 Current states:', {
                          residentData: !!residentData,
                          cachedResidentData: !!cachedResidentData,
                          formValues: formValues,
                          sessionStorageData: !!sessionStorage.getItem('residentData')
                        });
                        
                        const currentData = residentData || cachedResidentData;
                        if (currentData) {
                          console.log('📋 Using data:', currentData);
                          const autoFilledData = getAutoFilledFormData(selectedDoc.value, currentData);
                          console.log('📝 Generated autofill data:', autoFilledData);
                          setFormValues(autoFilledData);
                          setFeedback({
                            type: 'success',
                            message: '✅ Form manually auto-filled from profile!'
                          });
                        } else {
                          // Try session storage
                          const cachedDataString = sessionStorage.getItem('residentData');
                          if (cachedDataString) {
                            try {
                              const parsedData = JSON.parse(cachedDataString);
                              console.log('📋 Using session storage data:', parsedData);
                              const autoFilledData = getAutoFilledFormData(selectedDoc.value, parsedData);
                              console.log('📝 Generated autofill data from session:', autoFilledData);
                              setFormValues(autoFilledData);
                              setFeedback({
                                type: 'success',
                                message: '✅ Form auto-filled from cached profile!'
                              });
                            } catch (error) {
                              console.error('Failed to parse session data:', error);
                              setFeedback({
                                type: 'error',
                                message: '❌ No resident data available'
                              });
                            }
                          } else {
                            setFeedback({
                              type: 'error',
                              message: '❌ No resident data available'
                            });
                          }
                        }
                      }}
                      className="px-3 py-2 bg-yellow-100 hover:bg-yellow-200 text-yellow-700 rounded-lg text-xs font-medium"
                    >
                      🔄 Test Autofill
                    </button>
                    Profile Completion
100%
                    <div className="flex gap-2 sm:gap-3">
                  <button
                    type="button"
                    onClick={closeModal}
                        className="px-4 sm:px-6 py-2.5 sm:py-3 bg-gray-100 hover:bg-gray-200 rounded-xl text-gray-700 transition-all duration-200 shadow font-medium text-sm sm:text-base"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    form="document-request-form"
                        disabled={loading}
                        className="px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl shadow-lg transition-all duration-300 flex items-center justify-center gap-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                  >
                    <FaPaperPlane className="w-3 h-3 sm:w-4 sm:h-4" />
                    {loading ? 'Submitting...' : 'Submit Request'}
                  </button>
                    </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default RequestDocuments;
