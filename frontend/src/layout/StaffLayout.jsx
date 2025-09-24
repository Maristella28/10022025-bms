// StaffLayout.jsx
import React from 'react';
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { Outlet } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const StaffLayout = () => {
  const { user, isLoading } = useAuth();
  
  if (isLoading || !user) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <Navbar />
      <Sidebar role="staff" permissions={user.permissions} />
      <main className="bg-gray-100 min-h-screen ml-64 pt-20 p-6">
        <Outlet context={{ permissions: user.permissions }} />
      </main>
    </>
  );
};

export default StaffLayout;
