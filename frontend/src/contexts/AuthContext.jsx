import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from '../utils/axiosConfig';
import { routeConfig } from '../config/routes';

// Create the auth context
const AuthContext = createContext(null);

// Custom hook to use the auth context
const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    console.error('useAuth called outside of AuthProvider. Current context:', context);
    console.error('Stack trace:', new Error().stack);
    throw new Error('useAuth must be used within an AuthProvider. Make sure your component is wrapped with <AuthProvider>.');
  }
  return context;
};

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    // Initialize with cached user data if available
    const cachedUser = localStorage.getItem('user');
    return cachedUser ? JSON.parse(cachedUser) : null;
  });
  const [isLoading, setIsLoading] = useState(true);

  // Fetch user profile (only if token exists and no cached data)
  const fetchUser = async (forceRefresh = false) => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      setIsLoading(false);
      setUser(null);
      localStorage.removeItem('user');
      return;
    }

    // Use cached data if available and not forcing refresh
    if (!forceRefresh && user) {
      setIsLoading(false);
      return;
    }

    try {
      // Get basic user info first
      const userRes = await axios.get('/user');
      const baseUser = userRes.data?.user || userRes.data; // backend may return { user: ... }

      console.log('User data from backend:', baseUser);
      
      console.log('User role from backend:', baseUser.role);
      
      // Handle permissions based on role
      if (baseUser.role === 'admin') {
        console.log('Setting admin permissions');
        console.log('routeConfig.common:', routeConfig.common);
        // For admin users, get all modules from routeConfig
        const adminPermissions = routeConfig.common.reduce((acc, route) => {
          console.log('Processing route:', route.path, 'module:', route.module);
          acc[route.module] = true;
          return acc;
        }, {});
        
        baseUser.permissions = adminPermissions;
        console.log('Admin permissions set:', baseUser.permissions);
      } else if (baseUser.role === 'staff') {
        console.log('Setting staff permissions');
        // For staff users, fetch permissions from backend
        try {
          const staffRes = await axios.get('/api/user/permissions');
          console.log('Staff permissions response:', staffRes.data);

          // Get the module_permissions or fall back to regular permissions
          const staffPermissions = staffRes.data.permissions || {};
          console.log('Raw staff permissions:', staffPermissions);
          
          // Create a mapping from backend permission keys to frontend module keys
          const permissionMapping = {
            'dashboard': 'dashboard',
            'documentsRecords': 'documentsRecords', // Keep as is for Sidebar
            'residentsRecords': 'residentsRecords', // Keep as is for Sidebar  
            'householdRecords': 'householdRecords', // Keep as is for Sidebar
            'blotterRecords': 'blotterRecords',
            'financialTracking': 'financialTracking',
            'barangayOfficials': 'barangayOfficials',
            'staffManagement': 'staffManagement',
            'communicationAnnouncement': 'communicationAnnouncement',
            'projectManagement': 'projectManagement',
            'socialServices': 'socialServices',
            'disasterEmergency': 'disasterEmergency',
            'inventoryAssets': 'inventoryAssets',
            'activityLogs': 'activityLogs'
          };

          // Set permissions based on the backend response using the mapping
          baseUser.permissions = {};
          Object.entries(permissionMapping).forEach(([backendKey, frontendKey]) => {
            const hasPermission = Boolean(staffPermissions[backendKey]);
            console.log(`Setting permission for ${frontendKey}:`, hasPermission);
            baseUser.permissions[frontendKey] = hasPermission;
          });
          
          console.log('Final staff permissions:', baseUser.permissions);
          
          console.log('Staff permissions set:', baseUser.permissions);
        } catch (err) {
          console.error('Error fetching staff permissions:', err);
          baseUser.permissions = {
            dashboard: true // Default permission
          };
        }
      } else {
        // For other users, set only dashboard access
        baseUser.permissions = {
          dashboard: true
        };
      }

      // Set user early so UI can render role-specific UI
      setUser(baseUser);
      localStorage.setItem('user', JSON.stringify(baseUser || {}));
      
      console.log('User set in AuthContext:', baseUser);

      // Only fetch resident profile for resident users
      if (baseUser?.role === 'residents') {
        // Add cache-busting parameter to ensure fresh data
        const timestamp = new Date().getTime();
        const profileRes = await axios.get(`/profile?t=${timestamp}`);
        const resident = profileRes.data;
        const userData = { ...baseUser, profile: resident.profile ?? resident };
        
        console.log('AuthContext: Profile data received:', {
          profile_completed: userData.profile?.profile_completed,
          verification_status: userData.profile?.verification_status,
          hasResidencyImage: !!userData.profile?.residency_verification_image,
          hasPhoto: !!(userData.profile?.current_photo || userData.profile?.avatar),
          timestamp: timestamp
        });
        
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData || {}));
      }

      setIsLoading(false);
    } catch (err) {
      console.error('AuthContext fetchUser error:', err);

      if (err.response?.status === 404) {
        // Profile not found - normal for new users
        try {
          const userRes = await axios.get('/user');
          const baseUser = userRes.data?.user || userRes.data;
          setUser(baseUser);
          localStorage.setItem('user', JSON.stringify(baseUser || {}));
        } catch (userErr) {
          setUser(null);
          localStorage.removeItem('user');
        }
      } else if (err.response?.status === 401) {
        // Unauthorized - token invalid/expired
        setUser(null);
        localStorage.removeItem('user');
        localStorage.removeItem('authToken');
      } else {
        setUser(null);
        localStorage.removeItem('user');
      }
      setIsLoading(false);
    }
  };

  // Login
  const login = async (email, password) => {
    console.log('Attempting login for:', email);
    
    // Get CSRF cookie first for Sanctum
    await axios.get(window.location.origin + '/sanctum/csrf-cookie');
    
    // Login with credentials
    const res = await axios.post('/login', { email, password });
    console.log('Login response:', res.data);
    
    const token = res.data.token || res.data.access_token;
    if (token) {
      localStorage.setItem('authToken', token);
      console.log('AuthContext login: authToken set in localStorage');
      
      // Clear any existing role/user data
      localStorage.removeItem('role');
      localStorage.removeItem('user');
      
      // Fetch user data and set up permissions
      await fetchUser(true); // Force refresh to get fresh user data
      
      // Return the user data for immediate use
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      return userData;
    } else {
      console.warn('AuthContext login: No token received from backend');
      throw new Error('No authentication token received');
    }
  };

  // Logout
  const logout = async () => {
    try {
      await axios.post('/logout', {});
    } catch (e) {}
    localStorage.removeItem('authToken');
    sessionStorage.removeItem('congratsShownForSession'); // Clear congratulations state
    setUser(null);
  };

  useEffect(() => {
    console.log('AuthContext: useEffect triggered, fetching user...');
    fetchUser();
  }, []);

  // Force refresh function for immediate updates
  const forceRefresh = async () => {
    await fetchUser(true); // Force refresh to get fresh data
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, fetchUser, forceRefresh }}>
      {children}
    </AuthContext.Provider>
  );
};

// Export as a default object containing both the hook and provider
const AuthModule = {
  useAuth,
  AuthProvider
};

export default AuthModule;
export { useAuth, AuthProvider };