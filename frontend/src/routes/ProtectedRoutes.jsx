import { Routes, Route, Navigate } from 'react-router-dom';
import RequireProfileCompletion from '../components/RequireProfileCompletion';

// Import your protected route components here
import Dashboard from '../pages/Dashboard';
import MyBenefits from '../pages/residents/modules/MyBenefits';
// Import other protected components...

const ProtectedRoutes = () => {
  return (
    <Routes>
      {/* Routes that don't require profile completion */}
      <Route path="/residents/profile" element={<Profile />} />
  <Route path="/residents/dashboard" element={<Dashboard />} />
  <Route path="/residents/my-benefits" element={<MyBenefits />} />

      {/* Routes that require profile completion */}
      <Route
        path="/residents/*"
        element={
          <RequireProfileCompletion>
            <Routes>
              <Route path="certificates" element={<Certificates />} />
              <Route path="documents" element={<Documents />} />
              <Route path="requests" element={<Requests />} />
              {/* Add other protected routes here */}
            </Routes>
          </RequireProfileCompletion>
        }
      />

      {/* Redirect unmatched routes */}
      <Route path="*" element={<Navigate to="/residents/dashboard" replace />} />
    </Routes>
  );
};

export default ProtectedRoutes;