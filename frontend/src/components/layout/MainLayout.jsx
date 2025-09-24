import React from 'react';
import PropTypes from 'prop-types';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';

const MainLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <Sidebar />
      <main className="flex-1 p-8">
        <div className="flex flex-col space-y-8">
          {children}
        </div>
      </main>
    </div>
  );
};

MainLayout.propTypes = {
  children: PropTypes.node.isRequired
};

export default MainLayout;