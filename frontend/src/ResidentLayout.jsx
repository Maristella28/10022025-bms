import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbares from "./components/Navbares";
import Sidebares from "./components/Sidebares";


const ResidentLayout = () => (
  <div className="app-container">
    <Sidebares />
    <div className="main-content">
      <Navbares />
      <Outlet />
    </div>
  </div>
);

export default ResidentLayout;