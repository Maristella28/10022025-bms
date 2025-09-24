import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { routeConfig } from '../config/routes';

// Helper to check if a profile is truly complete
function isProfileComplete(profile) {
  if (!profile) return false;
  // If backend says profile_completed is 1 or '1', treat as complete
  if (profile.profile_completed === 1 || profile.profile_completed === '1' || profile.profile_completed === true) {
    return true;
  }
  // Otherwise, check for required fields (customize as needed)
  const requiredFields = [
    'first_name', 'last_name', 'birth_date', 'email', 'contact_number',
    'sex', 'civil_status', 'religion', 'full_address', 'years_in_barangay', 'voter_status',
  ];
  return requiredFields.every(field => profile[field]);
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
  const modulePath = pathParts[1]; // Second part (module)

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

  // Check module permissions for non-dashboard paths
  if (modulePath && modulePath !== 'dashboard' && !routeConfig.unrestricted.includes(modulePath)) {
    console.log('Checking access for path:', modulePath);
    
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
      const moduleRoute = routeConfig.common.find(route => route.path === modulePath);
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
    if (isProfileComplete(user.profile) && isResidencyVerificationComplete(user.profile)) {
      // Profile is complete - allow access to all resident routes
      return children;
    }
    
    // If profile is incomplete, allow access to certain essential pages
    const allowedPathsForIncompleteProfile = [
      '/residents/dashboard',
      '/residents/profile', 
      '/user/profile',
      '/residency-verification'
    ];
    
    if (!allowedPathsForIncompleteProfile.includes(location.pathname)) {
      if (!isProfileComplete(user.profile)) {
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
