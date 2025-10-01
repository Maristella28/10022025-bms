import React, { useState, useEffect, useMemo, useCallback, memo } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Lightbulb, FileText, Package, CalendarDays,
  Network, UserSquare, ClipboardList, AlertCircle
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useOptimizedNavigation } from '../hooks/useNavigation';
import axiosInstance from '../utils/axiosConfig';

const Sidebares = memo(() => {
  const location = useLocation();
  const navigate = useNavigate();
  const { preloadModule } = useOptimizedNavigation();
  const { user, isLoading } = useAuth();
  const [showWarning, setShowWarning] = useState(false);

  // Simple profile completion check using direct API call
  const [profileComplete, setProfileComplete] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);
  
  const checkProfileStatus = useCallback(async () => {
    if (!user) {
      setProfileComplete(false);
      setProfileLoading(false);
      return;
    }
    
    try {
      console.log('Sidebares: Checking profile status via API...');
      const response = await axiosInstance.get('/profile-status');
      const data = response.data;
      
      console.log('Sidebares: Profile status response:', data);
      setProfileComplete(data.isComplete);
    } catch (error) {
      console.error('Sidebares: Error checking profile status:', error);
      // Fallback to false if API fails
      setProfileComplete(false);
    } finally {
      setProfileLoading(false);
    }
  }, [user]);
  
  // Check profile status when user changes or when location changes to profile page
  useEffect(() => {
    if (user && !isLoading) {
      checkProfileStatus();
    }
  }, [user, isLoading, checkProfileStatus]);
  
  // Refresh profile status when navigating to profile page
  useEffect(() => {
    if (location.pathname === '/user/profile' && user && !isLoading) {
      console.log('Sidebares: Refreshing profile status on profile page navigation');
      checkProfileStatus();
    }
  }, [location.pathname, user, isLoading, checkProfileStatus]);


  const handleNavigation = (e, path) => {
    // Only block navigation if profile is truly incomplete
    if (!profileComplete && path !== '/user/profile') {
      e.preventDefault();
      setShowWarning(true);

      // If profile exists but verification denied, send to residency-denied page
      const profile = user?.profile;
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
    } else {
      // Profile is complete, allow navigation
      console.log('Sidebares: Allowing navigation to', path, 'profile complete:', profileComplete);
    }
  };

  // Route-guard effect: if the profile is incomplete and the user is on a protected route,
  // redirect them immediately (this blocks direct URL access as well as link clicks)
  useEffect(() => {
    if (!user || isLoading || profileLoading) return; // Wait for user data and profile status to load

    const protectedPrefixes = ['/residents'];
    const isProtected = protectedPrefixes.some(prefix => location.pathname.startsWith(prefix));

    // Only redirect if profile is truly incomplete
    if (!profileComplete && isProtected && location.pathname !== '/user/profile') {
      console.log('Sidebares: Route guard redirecting due to incomplete profile');
      setShowWarning(true);
      const profile = user?.profile;

      if (profile && profile.verification_status === 'denied') {
        navigate('/residency-denied');
        return;
      }

      if (profile && !profile.residency_verification_image) {
        navigate('/residency-verification');
        return;
      }

      navigate('/user/profile');
    } else if (profileComplete) {
      console.log('Sidebares: Route guard allowing access, profile complete');
    }
  }, [user, isLoading, profileLoading, profileComplete, location.pathname, navigate]);

  // Memoize menu items to prevent unnecessary re-renders
  const baseMenuItems = useMemo(() => [
    { title: "Dashboard", icon: <LayoutDashboard size={18} />, path: "/residents/dashboard" },
    { title: "Projects", icon: <Lightbulb size={18} />, path: "/residents/projects" },
    { title: "Request Documents", icon: <FileText size={18} />, path: "/residents/requestDocuments" },
    { title: "Request Assets", icon: <Package size={18} />, path: "/residents/requestAssets" },
    { title: "Blotter Appointment", icon: <CalendarDays size={18} />, path: "/residents/blotterAppointment" },
    { title: "Organizational Chart", icon: <Network size={18} />, path: "/residents/organizationalChart" },
  ], []);

  // Removed complex permissions normalization - using simple benefits check now

  // My Benefits should always be visible to residents
  const canSeeMyBenefits = useMemo(() => {
    // Always show My Benefits to residents (not admins)
    return user?.role !== 'admin';
  }, [user?.role]);

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

          {!user || isLoading || profileLoading ? (
            <div className="flex justify-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            </div>
          ) : (
            <ul className="space-y-1">
              {menuItems.map((item, idx) => {
                const isActive = location.pathname === item.path;
                const isDisabled = !profileComplete && item.path !== '/user/profile';
                
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