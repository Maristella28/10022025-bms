import React, { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { routeConfig } from '../config/routes';
import axiosInstance from '../utils/axiosConfig';

// Helper to check if a profile is truly complete
function isProfileComplete(profile) {
  if (!profile) {
    console.log('ProtectedRoute: No profile data available');
    return false;
  }
  
  console.log('ProtectedRoute isProfileComplete check:', {
    profile_completed: profile.profile_completed,
    verification_status: profile.verification_status,
    hasResidencyImage: !!profile.residency_verification_image,
    hasPhoto: !!(profile.current_photo || profile.avatar),
    profileKeys: Object.keys(profile)
  });
  
  // Primary check: If backend says profile_completed is true, treat as complete
  if (profile.profile_completed === true || profile.profile_completed === 1 || profile.profile_completed === '1') {
    console.log('ProtectedRoute: Profile marked as complete by backend');
    return true;
  }
  
  // Secondary check: If verification is approved and has essential fields
  const verificationApproved = profile.verification_status === 'approved';
  if (verificationApproved) {
    const hasEssentialFields = profile.first_name && profile.last_name && profile.current_address;
    const hasPhoto = profile.current_photo || profile.avatar;
    const hasResidencyImage = profile.residency_verification_image;
    
    const isComplete = hasEssentialFields && hasPhoto && hasResidencyImage;
    console.log('ProtectedRoute: Profile completion by verification check:', {
      verificationApproved,
      hasEssentialFields,
      hasPhoto,
      hasResidencyImage,
      isComplete
    });
    
    return isComplete;
  }
  
  console.log('ProtectedRoute: Profile not complete');
  return false;
}

// Helper to check if residency verification is complete
function isResidencyVerificationComplete(profile) {
  if (!profile) return false;
  // Check if residency verification is approved
  return profile.verification_status === 'approved';
}

const ProtectedRoute = ({ children }) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();
  const pathParts = location.pathname.split('/').filter(Boolean); // Remove empty strings
  const currentPath = pathParts[0]; // First part (role)
  const modulePath = pathParts.slice(1).join('/'); // All parts after role (for nested paths)
  const fullPath = location.pathname; // Full path for special handling
  
  console.log('ProtectedRoute: Full path:', fullPath);
  console.log('ProtectedRoute: Path parts:', pathParts);
  console.log('ProtectedRoute: Current path (role):', currentPath);
  console.log('ProtectedRoute: Module path:', modulePath);
  
  // Use the same profile completion check as Sidebares for consistency
  const [profileComplete, setProfileComplete] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);
  
  const checkProfileStatus = async () => {
    if (!user) {
      setProfileComplete(false);
      setProfileLoading(false);
      return;
    }
    
    try {
      console.log('ProtectedRoute: Checking profile status via API...');
      const response = await axiosInstance.get('/profile-status');
      const data = response.data;
      
      console.log('ProtectedRoute: Profile status response:', data);
      setProfileComplete(data.isComplete);
    } catch (error) {
      console.error('ProtectedRoute: Error checking profile status:', error);
      // Fallback to local check if API fails
      setProfileComplete(isProfileComplete(user.profile));
    } finally {
      setProfileLoading(false);
    }
  };
  
  // Check profile status when user changes
  useEffect(() => {
    if (user && !isLoading) {
      checkProfileStatus();
    }
  }, [user, isLoading]);

  // Don't check profile completion while still loading user data or profile status
  if (isLoading || profileLoading) {
    console.log('ProtectedRoute: Still loading user data or profile status, allowing access');
    return children;
  }

  // Function to check if user has permission for a module
  const hasModulePermission = (module) => {
    console.log('Checking permission for module:', module);
    console.log('User role:', user?.role);
    console.log('User permissions:', user?.permissions);
    
    if (!user) {
      console.log('No user found');
      return false;
    }
    
    // Admin has access to all modules
    if (user.role === 'admin') {
      console.log('User is admin - granting access');
      return true;
    }

    // Staff permissions check
    if (user.role === 'staff') {
      // If no permissions object exists, deny access
      if (!user.permissions) {
        console.log('No permissions found for staff');
        return false;
      }

      // Check the specific module permission
      const hasPermission = Boolean(user.permissions[module]);
      console.log(`Staff permission check for ${module}:`, hasPermission);
      return hasPermission;
    }
    
    // For other roles
    return Boolean(user.permissions?.[module]);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen text-lg">
        Loading...
      </div>
    );
  }

  if (!user) {
    console.log('ProtectedRoute: No user found, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  // Only check role path for top-level routes
  if (!modulePath && currentPath) {
    // Check if user is trying to access a role-specific path they don't have access to
    if (!['admin', 'staff', 'treasurer', 'resident', 'residents'].includes(currentPath)) {
      console.log('Invalid role path');
      return <Navigate to={`/${user.role}/dashboard`} replace />;
    }
    
    // If user is trying to access a non-assigned role's path
    // Handle both 'resident' and 'residents' for backward compatibility
    const userRole = user.role === 'residents' ? 'residents' : user.role;
    if (currentPath !== userRole && user.role !== 'admin') {
      console.log('Unauthorized role access');
      return <Navigate to={`/${userRole}/dashboard`} replace />;
    }
  }

  // Special handling for admin module routes (like /admin/modules/Blotter/NewComplaint)
  if (fullPath && fullPath.startsWith('/admin/modules/')) {
    console.log('Admin module route detected:', fullPath);
    // Admin and staff have access to all module routes
    if (user.role === 'admin' || user.role === 'staff') {
      console.log('Granting access to admin module route for', user.role);
      return children;
    } else {
      console.log('Non-admin/staff user trying to access admin module route');
      return <Navigate to={`/${user.role}/dashboard`} replace />;
    }
  }

  // Check module permissions for non-dashboard paths
  if (modulePath && modulePath !== 'dashboard' && !routeConfig.unrestricted.includes(modulePath)) {
    console.log('Checking access for path:', modulePath);
    console.log('Unrestricted paths:', routeConfig.unrestricted);
    
    // Handle resident routes differently
    if (user.role === 'residents' || user.role === 'resident') {
      // For residents, check in resident-specific routes
      const residentRoute = routeConfig.residents?.find(route => route.path === modulePath);
      console.log('Found resident route:', residentRoute);
      
      if (!residentRoute) {
        console.log('No resident route found for path:', modulePath);
        return <Navigate to={`/${user.role}/dashboard`} replace />;
      }
      // Residents have access to all their routes by default
    } else {
      // For admin/staff, check in common routes with permissions
      // First try exact match
      let moduleRoute = routeConfig.common.find(route => route.path === modulePath);
      
      // If no exact match, try to match parameterized routes
      if (!moduleRoute) {
        console.log('No exact match found, trying parameterized routes...');
        moduleRoute = routeConfig.common.find(route => {
          if (route.path.includes(':')) {
            // Convert route pattern to regex (e.g., "social-services/program/:id" -> "social-services/program/[^/]+")
            const pattern = route.path.replace(/:[^/]+/g, '[^/]+');
            const regex = new RegExp(`^${pattern}$`);
            const matches = regex.test(modulePath);
            console.log(`Checking route pattern "${route.path}" against "${modulePath}":`, matches);
            return matches;
          }
          return false;
        });
      }
      
      console.log('Found module route:', moduleRoute);
      
      if (moduleRoute) {
        const modulePermission = moduleRoute.module || moduleRoute.path;
        const hasPermission = hasModulePermission(modulePermission);
        console.log('Permission check result for', modulePermission, ':', hasPermission);
        
        if (!hasPermission) {
          console.log('Redirecting to dashboard due to lack of permission');
          return <Navigate to={`/${user.role}/dashboard`} replace />;
        }
      } else if (!routeConfig.unrestricted.includes(modulePath)) {
        console.log('No module route found for path:', modulePath);
        return <Navigate to={`/${user.role}/dashboard`} replace />;
      }
    }
  }

  // Mandatory profile completion and residency verification for residents
  if (user.role === 'residents' || user.role === 'resident') {
    // If residency verification is denied, show an error page or redirect to a specific page
    if (user.profile && user.profile.verification_status === 'denied') {
      // Redirect to a page that shows the denial message
      return <Navigate to="/residency-denied" replace />;
    }
    
    // If profile is complete and verified, allow access to all resident routes
    if (profileComplete && isResidencyVerificationComplete(user.profile)) {
      // Profile is complete - allow access to all resident routes
      return children;
    }
    
    // If profile is incomplete, allow access to certain essential pages
    const allowedPathsForIncompleteProfile = [
      '/residents/dashboard',
      '/residents/profile', 
      '/user/profile',
      '/residency-verification',
      '/residents/modules/Programs/ProgramAnnouncements'
    ];
    
    if (!allowedPathsForIncompleteProfile.includes(location.pathname)) {
      if (!profileComplete) {
        return <Navigate to="/user/profile" replace />;
      }
      if (!isResidencyVerificationComplete(user.profile)) {
        return <Navigate to="/user/profile" replace />;
      }
    }
  }

  return children;
};

export default ProtectedRoute;
