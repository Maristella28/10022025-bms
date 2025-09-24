import React, { useState, useEffect, useMemo, useCallback, memo } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Lightbulb, FileText, Package, CalendarDays,
  Network, UserSquare, ClipboardList, AlertCircle
} from 'lucide-react';
import axiosInstance from '../utils/axiosConfig';
import { isProfileComplete, getMissingFields } from '../utils/profileValidation';
import { useOptimizedNavigation } from '../hooks/useNavigation';

const Sidebares = memo(() => {
  const location = useLocation();
  const navigate = useNavigate();
  const { preloadModule } = useOptimizedNavigation();
  const [profileStatus, setProfileStatus] = useState(() => {
    // Initialize with cached data if available
    const cached = sessionStorage.getItem('sidebarProfileStatus');
    return cached ? JSON.parse(cached) : { isComplete: false, loading: true };
  });
  const [showWarning, setShowWarning] = useState(false);

  // Memoized profile status check function
  const checkProfileStatus = useCallback(async (forceRefresh = false) => {
    try {
      // Check cache first (unless force refresh)
      if (!forceRefresh) {
        const cached = sessionStorage.getItem('sidebarProfileStatus');
        const cacheTime = sessionStorage.getItem('sidebarProfileStatusTime');
        const isRecent = cacheTime && (Date.now() - parseInt(cacheTime)) < 30000; // 30 seconds
        
        if (cached && isRecent) {
          const cachedData = JSON.parse(cached);
          setProfileStatus(cachedData);
          return;
        }
      }

        if (process.env.NODE_ENV === 'development') {
          console.log('Sidebares: Fetching fresh profile data...');
        }
      
      // Try to get profile data
      let response;
      try {
        response = await axiosInstance.get('/profile');
      } catch (firstErr) {
        console.warn('First profile endpoint failed, trying fallback:', firstErr);
        try {
          response = await axiosInstance.get('/user/profile');
        } catch (secondErr) {
          console.warn('Second profile endpoint failed, trying debug endpoint:', secondErr);
          response = await axiosInstance.get('/profile/debug');
        }
      }

      if (process.env.NODE_ENV === 'development') {
        console.log('Sidebares: Profile response received:', response?.data);
      }

    // Backend often returns { user: ..., profile: { ... } }
    // Normalize to the actual profile object when present
  const raw = response.data;
  let profile = null;
  if (raw && raw.profile) profile = raw.profile;
  else if (raw && raw.user && raw.user.profile) profile = raw.user.profile;
  else profile = raw;

        if (process.env.NODE_ENV === 'development') {
          console.log('Sidebares: Normalized profile:', profile);
        }

  const missingFields = getMissingFields(profile);
  const completeFromFn = isProfileComplete(profile);
  // Be defensive: require both checks to agree (no missing fields and fn=true)
  const complete = completeFromFn && missingFields.length === 0;

        // Compute completeness
        let finalComplete = complete;

        // If verification is denied or residency verification image missing, require action
        if (profile && (profile.verification_status === 'denied' || !profile.residency_verification_image)) {
          finalComplete = false;
        }

      const statusData = { isComplete: finalComplete, loading: false, profile, raw };
      setProfileStatus(statusData);
      
      // Cache the result with safe serialization
      try {
        const safeStatusData = {
          ...statusData,
          // Ensure permissions is properly serialized
          profile: statusData.profile ? {
            ...statusData.profile,
            permissions: statusData.profile.permissions && typeof statusData.profile.permissions === 'object' 
              ? statusData.profile.permissions 
              : null
          } : null
        };
        sessionStorage.setItem('sidebarProfileStatus', JSON.stringify(safeStatusData));
        sessionStorage.setItem('sidebarProfileStatusTime', Date.now().toString());
        if (process.env.NODE_ENV === 'development') {
          console.log('Sidebares: Profile status cached successfully');
        }
      } catch (cacheError) {
        console.warn('Failed to cache sidebar profile status:', cacheError);
      }
      
      } catch (error) {
        console.error('Error checking profile status:', error);
        // Don't block navigation if we can't check the profile
        const fallbackData = { isComplete: true, loading: false };
        setProfileStatus(fallbackData);
        
        // Cache fallback too
        try {
          sessionStorage.setItem('sidebarProfileStatus', JSON.stringify(fallbackData));
          sessionStorage.setItem('sidebarProfileStatusTime', Date.now().toString());
        } catch (cacheError) {
          console.warn('Failed to cache fallback sidebar status:', cacheError);
        }
      }
    }, []);

  useEffect(() => {
    checkProfileStatus();

      // Poll profile every 5 seconds to pick up admin-made permission changes
      const interval = setInterval(() => {
        checkProfileStatus();
      }, 5000);

    // Also re-check when tab becomes visible again
    const onVisibility = () => {
      if (document.visibilityState === 'visible') checkProfileStatus();
    };
    document.addEventListener('visibilitychange', onVisibility);
    
      // Listen for manual profile update events
      const onProfileUpdated = (event) => {
        if (process.env.NODE_ENV === 'development') {
          console.log('Profile update event received, refreshing status:', event.detail);
        }
        // Clear cache and force refresh when profile is updated
        sessionStorage.removeItem('sidebarProfileStatus');
        sessionStorage.removeItem('sidebarProfileStatusTime');
        checkProfileStatus(true);
      };
      window.addEventListener('profile-updated', onProfileUpdated);

      // Listen for profile refresh requests
      const onProfileRefreshRequested = (event) => {
        if (process.env.NODE_ENV === 'development') {
          console.log('Profile refresh requested:', event.detail);
        }
        // Clear cache and force refresh when profile refresh is requested
        sessionStorage.removeItem('sidebarProfileStatus');
        sessionStorage.removeItem('sidebarProfileStatusTime');
        checkProfileStatus(true);
      };
      window.addEventListener('profile-refresh-requested', onProfileRefreshRequested);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('profile-updated', onProfileUpdated);
      window.removeEventListener('profile-refresh-requested', onProfileRefreshRequested);
    };
  }, [checkProfileStatus]);

  const handleNavigation = (e, path) => {
    if (!profileStatus.isComplete && path !== '/user/profile') {
      e.preventDefault();
      setShowWarning(true);

      // If profile exists but verification denied, send to residency-denied page
      const profile = profileStatus.profile;
      if (profile && profile.verification_status === 'denied') {
        setTimeout(() => navigate('/residency-denied'), 800);
        return;
      }

      // If residency verification image missing or verification pending, send to verification page
      if (profile && !profile.residency_verification_image) {
        setTimeout(() => navigate('/residency-verification'), 800);
        return;
      }

      // Otherwise redirect to profile edit page
      setTimeout(() => navigate('/user/profile'), 800);
    }
  };

  // Route-guard effect: if the profile is incomplete and the user is on a protected route,
  // redirect them immediately (this blocks direct URL access as well as link clicks)
  useEffect(() => {
    if (profileStatus.loading) return;

    const protectedPrefixes = ['/residents'];
    const isProtected = protectedPrefixes.some(prefix => location.pathname.startsWith(prefix));

    if (!profileStatus.isComplete && isProtected && location.pathname !== '/user/profile') {
      setShowWarning(true);
      const profile = profileStatus.profile;

      if (profile && profile.verification_status === 'denied') {
        navigate('/residency-denied');
        return;
      }

      if (profile && !profile.residency_verification_image) {
        navigate('/residency-verification');
        return;
      }

      navigate('/user/profile');
    }
  }, [profileStatus, location.pathname, navigate]);

  // Memoize menu items to prevent unnecessary re-renders
  const baseMenuItems = useMemo(() => [
    { title: "Dashboard", icon: <LayoutDashboard size={18} />, path: "/residents/dashboard" },
    { title: "Projects", icon: <Lightbulb size={18} />, path: "/residents/projects" },
    { title: "Request Documents", icon: <FileText size={18} />, path: "/residents/requestDocuments" },
    { title: "Request Assets", icon: <Package size={18} />, path: "/residents/requestAssets" },
    { title: "Blotter Appointment", icon: <CalendarDays size={18} />, path: "/residents/blotterAppointment" },
    { title: "Organizational Chart", icon: <Network size={18} />, path: "/residents/organizationalChart" },
  ], []);

  // Enhanced permissions normalization helper
  const normalizePermissions = useCallback((permissionsData) => {
    if (!permissionsData) return null;
    
    // Handle different permission data types
    if (typeof permissionsData === "string") {
      // Check for the problematic "[object Object]" string
      if (permissionsData.trim() === "[object Object]") {
        // Silently handle this common serialization issue
        return null;
      } else if (permissionsData.trim() !== "") {
        // Try to parse as JSON
        try {
          return JSON.parse(permissionsData);
        } catch (e) {
          console.warn("Sidebares: Failed to parse permissions string", permissionsData, e);
          return null;
        }
      } else {
        // Empty string
        return null;
      }
    } else if (typeof permissionsData === "object" && permissionsData !== null) {
      // Already an object
      return permissionsData;
    } else {
      // Unexpected type or null
      return null;
    }
  }, []);

  // If the profile has a permission flag set by admin, show My Benefits
  const canSeeMyBenefits = useMemo(() => {
    const p = profileStatus.profile;
    const raw = profileStatus.raw;
    if (!p) return false;
    
    // Normalize permissions using our helper
    const permissions = normalizePermissions(p.permissions);
    
    // Debug logging for benefits detection (reduced)
    if (process.env.NODE_ENV === 'development') {
      console.log("Sidebares: Benefits detection:", {
        my_benefits_enabled: p?.my_benefits_enabled,
        permissions_my_benefits: permissions?.my_benefits,
        final_result: false // Will be updated below
      });
    }

    // More comprehensive check for enabled status
    const isEnabled = !!(
      // Check profile level flags (most common)
      p.my_benefits_enabled === true ||
      p.my_benefits_enabled === 'true' ||
      p.my_benefits_enabled === 1 ||
      p.my_benefits_enabled === '1' ||
      p.my_benefits === true ||
      p.my_benefits === 'true' ||
      p.my_benefits === 1 ||
      p.my_benefits === '1' ||
      // Check normalized permissions object if it exists
      (permissions && (
        permissions.my_benefits === true ||
        permissions.my_benefits === 'true' ||
        permissions.my_benefits === 1 ||
        permissions.my_benefits === '1' ||
        permissions.my_benefits_enabled === true ||
        permissions.my_benefits_enabled === 'true' ||
        permissions.my_benefits_enabled === 1 ||
        permissions.my_benefits_enabled === '1'
      )) ||
      // Check raw response level
      raw?.my_benefits_enabled === true ||
      raw?.my_benefits_enabled === 'true' ||
      raw?.my_benefits_enabled === 1 ||
      raw?.my_benefits_enabled === '1' ||
      raw?.my_benefits === true ||
      raw?.my_benefits === 'true' ||
      raw?.my_benefits === 1 ||
      raw?.my_benefits === '1' ||
      // Check user level in raw response
      raw?.user?.my_benefits_enabled === true ||
      raw?.user?.my_benefits_enabled === 'true' ||
      raw?.user?.my_benefits_enabled === 1 ||
      raw?.user?.my_benefits_enabled === '1' ||
      raw?.user?.my_benefits === true ||
      raw?.user?.my_benefits === 'true' ||
      raw?.user?.my_benefits === 1 ||
      raw?.user?.my_benefits === '1'
    );

    if (process.env.NODE_ENV === 'development') {
      console.log("Sidebares: Final benefits enabled result:", isEnabled);
    }
    return isEnabled;
  }, [profileStatus.profile, profileStatus.raw, normalizePermissions]);

  // Memoize final menu items including conditional My Benefits
  const menuItems = useMemo(() => {
    const items = [...baseMenuItems];
    if (canSeeMyBenefits) {
      // insert My Benefits right after Projects (index 2)
      items.splice(2, 0, { title: 'My Benefits', icon: <ClipboardList size={18} />, path: '/residents/myBenefits' });
    }
    return items;
  }, [baseMenuItems, canSeeMyBenefits]);

  return (
    <aside className="fixed top-0 left-0 z-40 w-64 h-screen bg-gradient-to-b from-green-900 to-green-800 shadow-2xl border-r border-green-700">
      <div className="flex flex-col h-full px-4 py-6 text-white space-y-6 overflow-y-auto scrollbar-thin scrollbar-thumb-green-600 scrollbar-track-green-800">
        
        {/* Logo or Brand Title */}
        <div className="flex items-center justify-center gap-3">
          <UserSquare className="text-lime-300 w-7 h-7" />
          <h2 className="text-2xl font-extrabold tracking-wide text-lime-100">Resident Panel</h2>
        </div>

        <hr className="border-green-700" />

        {/* Navigation */}
        <nav className="flex-1">
          {showWarning && (
            <div className="mb-4 p-4 bg-red-500 text-white rounded-lg shadow-lg animate-fade-in">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                <p className="text-sm">Please complete your profile first!</p>
              </div>
            </div>
          )}

          {profileStatus.loading ? (
            <div className="flex justify-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            </div>
          ) : (
            <ul className="space-y-1">
              {menuItems.map((item, idx) => {
                const isActive = location.pathname === item.path;
                const isDisabled = !profileStatus.isComplete && item.path !== '/user/profile';
                
                return (
                  <li key={idx}>
                    {isDisabled ? (
                      // Render a non-interactive button/span when disabled so it can't navigate
                      <div
                        role="button"
                        aria-disabled="true"
                        onClick={(e) => handleNavigation(e, item.path)}
                        className={`flex items-center gap-4 px-4 py-3 rounded-lg transition-all duration-200 group opacity-50 cursor-not-allowed bg-gray-700 text-gray-300`}
                      >
                        <span className="text-white">{item.icon}</span>
                        <span className="truncate text-sm tracking-wide">{item.title}</span>
                        <span className="ml-auto">
                          <AlertCircle className="w-4 h-4 text-red-400" />
                        </span>
                      </div>
                    ) : (
                      <Link
                        to={item.path}
                        onClick={(e) => handleNavigation(e, item.path)}
                        onMouseEnter={() => preloadModule(item.path)}
                        onFocus={() => preloadModule(item.path)}
                        className={`flex items-center gap-4 px-4 py-3 rounded-lg transition-all duration-200 group
                          ${isActive
                            ? "bg-green-700 text-white font-semibold shadow-inner border-l-4 border-lime-300"
                            : "hover:bg-green-700 hover:text-white text-green-100"
                          }`}
                      >
                        <span className="text-white group-hover:scale-110 transition-transform">{item.icon}</span>
                        <span className="truncate text-sm tracking-wide">{item.title}</span>
                      </Link>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
          
          {!profileStatus.loading && !profileStatus.isComplete && (
            <div className="mt-4 p-4 bg-yellow-500/20 border border-yellow-600/30 rounded-lg">
              <p className="text-yellow-200 text-sm text-center">
                Complete your profile to access all features
              </p>
            </div>
          )}
        </nav>


        {/* Footer */}
        <div className="text-sm text-green-300 text-center pt-6 border-t border-green-700">
          <p>&copy; 2025 Barangay System</p>
        </div>
      </div>
      <style>{`
        .animate-fade-in {
          animation: fadeIn 0.3s ease-in-out;
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </aside>
  );
});

// Add display name for debugging
Sidebares.displayName = 'Sidebares';

export default Sidebares;