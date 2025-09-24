import React, { useEffect, useState } from 'react';
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { Outlet, useNavigate } from "react-router-dom";
import { useAuth } from '../contexts/AuthContext';
import axiosInstance from '../utils/axiosConfig';
import ResidentLayout from '../ResidentLayout';

const DynamicLayout = () => {
  const navigate = useNavigate();
  const { user, isLoading } = useAuth();

  // Use the permissions from the user context
  const permissions = user?.permissions || {};

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (!user) {
    navigate('/login');
    return null;
  }

  // Use ResidentLayout for residents, admin layout for others
  if (user.role === 'residents' || user.role === 'resident') {
    return <ResidentLayout />;
  }

  // Admin/Staff layout
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar with permissions but no hardcoded role */}
      <Sidebar permissions={permissions} />
      
      <div className="flex-1 flex flex-col">
        <Navbar />
        <main className="flex-1 overflow-y-auto p-6 bg-white">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DynamicLayout;