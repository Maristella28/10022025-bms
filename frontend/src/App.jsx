// App.jsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Suspense, lazy } from "react";
import LoadingSkeleton from './components/LoadingSkeleton';

// Eagerly load critical components
import ProtectedRoute from './components/ProtectedRoute';
import DynamicLayout from "./layout/DynamicLayout";

// Lazy load pages for better performance
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Welcome = lazy(() => import("./pages/Welcome"));
const EmailVerification = lazy(() => import("./pages/EmailVerification"));
const PrivacyPolicyPage = lazy(() => import('./pages/PrivacyPolicyPage'));
const Profile = lazy(() => import("./pages/forms/Profile"));
const ResidencyVerification = lazy(() => import("./pages/forms/ResidencyVerification"));
const ResidencyDenied = lazy(() => import("./pages/residents/ResidencyDenied"));
const Congratulations = lazy(() => import('./pages/Congratulations'));

// Lazy load individual admin pages
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const DocumentsRecords = lazy(() => import('./pages/admin/DocumentsRecords'));
const ResidentsRecords = lazy(() => import('./pages/admin/ResidentsRecords'));
const HouseholdRecords = lazy(() => import('./pages/admin/HouseholdRecords'));
const BlotterRecords = lazy(() => import('./pages/admin/BlotterRecords'));
const FinancialTracking = lazy(() => import('./pages/admin/FinancialTracking'));
const BarangayOfficials = lazy(() => import('./pages/admin/BarangayOfficials'));
const CommunicationAnnouncement = lazy(() => import('./pages/admin/CommunicationAnnouncement'));
const ProjectManagement = lazy(() => import('./pages/admin/ProjectManagement'));
const SocialServices = lazy(() => import('./pages/admin/modules/SocialServices/SocialServices'));
const DisasterEmergency = lazy(() => import('./pages/admin/DisasterEmergency'));
const InventoryAssets = lazy(() => import('./pages/admin/InventoryAssets'));
const ActivityLogs = lazy(() => import('./pages/admin/ActivityLogs'));

// Lazy load individual resident pages
const ResidentDashboard = lazy(() => import('./pages/residents/Dashboard'));
const Projects = lazy(() => import('./pages/residents/Projects'));
const RequestDocuments = lazy(() => import('./pages/residents/RequestDocuments'));
const GenerateBlotter = lazy(() => import('./pages/residents/GenerateBlotter'));
const StatusDocumentRequests = lazy(() => import('./pages/residents/modules/Documents/StatusDocumentRequests'));
const StatusBlotterRequests = lazy(() => import('./pages/residents/modules/Blotter/StatusBlotterRequests'));
const BlotterAppointment = lazy(() => import('./pages/residents/BlotterAppointment'));
const OrganizationalChart = lazy(() => import('./pages/residents/OrganizationalChart'));
const Officials = lazy(() => import('./pages/residents/modules/OrganizationalChart/Officials'));
const Staff = lazy(() => import('./pages/residents/modules/OrganizationalChart/Staff'));
const CharterList = lazy(() => import('./pages/residents/CharterList'));
const MyBenefits = lazy(() => import('./pages/residents/MyBenefits'));
const AddFeedback = lazy(() => import('./pages/residents/AddFeedback'));

// Lazy load module pages
const ProgramDetails = lazy(() => import('./pages/admin/modules/SocialServices/ProgramDetails'));
const CreateHousehold = lazy(() => import('./pages/admin/modules/Household/CreateHousehold'));
const AdminEditProfile = lazy(() => import('./pages/admin/AdminEditProfile'));
const RequestAssets = lazy(() => import('./pages/residents/modules/Assets/RequestAssets'));
const StatusAssetRequests = lazy(() => import('./pages/residents/modules/Assets/StatusAssetRequests'));
// Admin Staff Management (for permissions)
const StaffManagement = lazy(() => import('./pages/admin/modules/Staff/StaffManagement'));
// Organizational Chart Staff Management (different component)
const OrgChartStaffManagement = lazy(() => import('./pages/admin/modules/Barangay Officials/StaffManagement'));
const AssetsManagement = lazy(() => import('./pages/admin/modules/Assets/AssetsManagement'));
const BlotterRequest = lazy(() => import('./pages/admin/modules/Blotter/BlotterRequest'));
const NewComplaint = lazy(() => import('./pages/admin/modules/Blotter/NewComplaint'));
const OfficialsManagement = lazy(() => import('./pages/admin/modules/Barangay Officials/OfficialsManagement'));

// Additional admin module components
const AddDisasterEmergencyRecord = lazy(() => import('./pages/admin/modules/Disaster&Emergency/AddDisasterEmergencyRecord'));
const EmergencyHotlinesTable = lazy(() => import('./pages/admin/modules/Disaster&Emergency/EmergencyHotlinesTable'));
const AddResidents = lazy(() => import('./pages/admin/modules/residents-record/AddResidents'));

// Route configuration
import { routeConfig } from './config/routes';
import { useAuth } from './contexts/AuthContext';
import { useLocation } from 'react-router-dom';
import modulePreloader from './utils/modulePreloader';

// Helper function to wrap components with Suspense
const withSuspense = (Component) => (
  <Suspense fallback={<LoadingSkeleton />}>
    {Component}
  </Suspense>
);

// Initialize route configurations before the App component
// Map resident routes to their components with Suspense
const residentRoutesWithComponents = routeConfig.residents.map(route => ({
  ...route,
  element: {
    "dashboard": withSuspense(<ResidentDashboard />),
    "profile": withSuspense(<Profile />),
    "projects": withSuspense(<Projects />),
    "requestDocuments": withSuspense(<RequestDocuments />),
    "requestAssets": withSuspense(<RequestAssets />),
    "statusassetrequests": withSuspense(<StatusAssetRequests />),
    "generateBlotter": withSuspense(<GenerateBlotter />),
    "statusDocumentRequests": withSuspense(<StatusDocumentRequests />),
    "statusBlotterRequests": withSuspense(<StatusBlotterRequests />),
    "blotterAppointment": withSuspense(<BlotterAppointment />),
    "organizationalChart": withSuspense(<OrganizationalChart />),
    "officials": withSuspense(<Officials />),
    "staff": withSuspense(<Staff />),
    "charterList": withSuspense(<CharterList />),
    "myBenefits": withSuspense(<MyBenefits />),
    "addFeedback": withSuspense(<AddFeedback />)
  }[route.path] || withSuspense(<div>Page under construction</div>) // Fallback for missing components
}));

// Update the resident routes with components
routeConfig.residents = residentRoutesWithComponents;

// Map the common routes to their components with Suspense
const commonRoutesWithComponents = routeConfig.common.map(route => ({
  ...route,
  element: {
    "dashboard": withSuspense(<AdminDashboard />),
    "documentsRecords": withSuspense(<DocumentsRecords />),
    "residentsRecords": withSuspense(<ResidentsRecords />),
    "householdRecords": withSuspense(<HouseholdRecords />),
    "blotterRecords": withSuspense(<BlotterRecords />),
    "financialTracking": withSuspense(<FinancialTracking />),
    "barangayOfficials": withSuspense(<BarangayOfficials />),
    "staff": withSuspense(<StaffManagement />),
    "communicationAnnouncement": withSuspense(<CommunicationAnnouncement />),
    "projectManagement": withSuspense(<ProjectManagement />),
    "socialServices": withSuspense(<SocialServices />),
    "disasterEmergency": withSuspense(<DisasterEmergency />),
    "inventoryAssets": withSuspense(<InventoryAssets />),
    "activityLogs": withSuspense(<ActivityLogs />),
    
    // Additional admin-specific route mappings
    "social-services": withSuspense(<SocialServices />),
    "assets-management": withSuspense(<InventoryAssets />),
    "officials-management": withSuspense(<BarangayOfficials />),
    "staff-management": withSuspense(<StaffManagement />),
    "create-household": withSuspense(<CreateHousehold />)
  }[route.path]
}));

// Update the common routes with components
routeConfig.common = commonRoutesWithComponents;

// Component to render routes based on user role
const RoleBasedRoutes = () => {
  try {
    const { user } = useAuth();
    const location = useLocation();
    
    if (!user) return <div>Loading...</div>;
    
    // Get the current path (e.g., "dashboard", "profile", etc.)
    const currentPath = location.pathname.split('/').pop();
    
    // For residents, render resident routes
    if (user.role === 'residents' || user.role === 'resident') {
      const residentRoute = routeConfig.residents?.find(route => route.path === currentPath);
      if (residentRoute) {
        return residentRoute.element;
      }
    } else {
      // For admin/staff, render common routes
      const commonRoute = routeConfig.common.find(route => route.path === currentPath);
      if (commonRoute) {
        return commonRoute.element;
      }
    }
    
    // Special routes
    if (currentPath === 'edit-profile') {
      return withSuspense(<AdminEditProfile />);
    }
    
    // 404 fallback
    return withSuspense(<div>Page not found</div>);
  } catch (error) {
    console.error('RoleBasedRoutes: Auth context error:', error);
    return <div>Authentication error. Please refresh the page.</div>;
  }
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={withSuspense(<Welcome />)} />
        <Route path="/login" element={withSuspense(<Login />)} />
          <Route path="/register" element={withSuspense(<Register />)} />
          <Route path="/privacy-policy" element={withSuspense(<PrivacyPolicyPage />)} />
          <Route path="/email/verify" element={withSuspense(<EmailVerification />)} />
          <Route path="/congratulations" element={<ProtectedRoute>{withSuspense(<Congratulations />)}</ProtectedRoute>} />
          <Route path="/user/profile" element={<ProtectedRoute>{withSuspense(<Profile />)}</ProtectedRoute>} />
          <Route path="/residency-verification" element={withSuspense(<ResidencyVerification />)} />
          <Route path="/residency-denied" element={withSuspense(<ResidencyDenied />)} />

          {/* Admin-specific standalone routes */}
          <Route path="/admin/assets-management" element={<ProtectedRoute role="admin">{withSuspense(<AssetsManagement />)}</ProtectedRoute>} />
          <Route path="/admin/social-services" element={<ProtectedRoute role="admin">{withSuspense(<SocialServices />)}</ProtectedRoute>} />
          <Route path="/admin/social-services/program/:id" element={<ProtectedRoute role="admin">{withSuspense(<ProgramDetails />)}</ProtectedRoute>} />
          
          {/* Blotter Module Routes */}
          <Route path="/admin/modules/Blotter/BlotterRequest" element={<ProtectedRoute role="admin">{withSuspense(<BlotterRequest />)}</ProtectedRoute>} />
          <Route path="/admin/modules/Blotter/NewComplaint" element={<ProtectedRoute role="admin">{withSuspense(<NewComplaint />)}</ProtectedRoute>} />
          
          {/* Staff and Officials Management Routes */}
          <Route path="/admin/staff-management" element={<ProtectedRoute role="admin">{withSuspense(<StaffManagement />)}</ProtectedRoute>} />
          <Route path="/admin/officials-management" element={<ProtectedRoute role="admin">{withSuspense(<OfficialsManagement />)}</ProtectedRoute>} />
          <Route path="/admin/org-staff-management" element={<ProtectedRoute role="admin">{withSuspense(<OrgChartStaffManagement />)}</ProtectedRoute>} />
          
          {/* Disaster & Emergency Routes */}
          <Route path="/admin/modules/Disaster&Emergency/AddDisasterEmergencyRecord" element={<ProtectedRoute role="admin">{withSuspense(<AddDisasterEmergencyRecord />)}</ProtectedRoute>} />
          <Route path="/admin/modules/Disaster&Emergency/EmergencyHotlinesTable" element={<ProtectedRoute role="admin">{withSuspense(<EmergencyHotlinesTable />)}</ProtectedRoute>} />
          
          {/* Residents Management Routes */}
          <Route path="/admin/modules/residents-record/AddResidents" element={<ProtectedRoute role="admin">{withSuspense(<AddResidents />)}</ProtectedRoute>} />
          
          {/* Household Management Routes */}
          <Route path="/admin/modules/Household/CreateHousehold" element={<ProtectedRoute role="admin">{withSuspense(<CreateHousehold />)}</ProtectedRoute>} />

          {/* Dynamic Layout Routes */}
          <Route 
            path="/:role/*" 
            element={
              <ProtectedRoute>
                <DynamicLayout />
              </ProtectedRoute>
            }
          >
            {/* Role-based route rendering component */}
            <Route path="*" element={<RoleBasedRoutes />} />
          </Route>

          {/* 404 Fallback */}
          <Route path="*" element={<h1>404 - Page Not Found</h1>} />
        </Routes>
    </Router>
  );
}

export default App;