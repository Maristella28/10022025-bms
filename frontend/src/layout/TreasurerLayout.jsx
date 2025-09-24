// TreasurerLayout.jsx
import React, { useEffect, useState } from 'react';
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { Outlet, useNavigate } from "react-router-dom";
import axiosInstance from '../utils/axiosConfig';

const TreasurerLayout = () => {
  const [permissions, setPermissions] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserPermissions = async () => {
      try {
        const response = await axiosInstance.get('/api/user/permissions');
        const userPermissions = response.data.permissions;
        
        // Verify treasurer access
        if (!userPermissions.treasurer) {
          navigate('/unauthorized');
          return;
        }
        
        setPermissions(userPermissions);
      } catch (error) {
        console.error('Error fetching permissions:', error);
        navigate('/login');
      }
    };

    fetchUserPermissions();
  }, [navigate]);

  if (!permissions) {
    return <div>Loading...</div>;
  }

  return (
    <div className="app-container" style={{ display: 'flex' }}>
      <Sidebar role="treasurer" permissions={permissions} />
      <div className="main-content" style={{ flex: 1 }}>
        <Navbar />
        <div className="content" style={{ padding: '1rem' }}>
          <Outlet context={{ permissions }} />
        </div>
      </div>
    </div>
  );
};

export default TreasurerLayout;
