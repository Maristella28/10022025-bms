import React from 'react';
import { FaUserTie, FaUsers, FaArrowRight } from 'react-icons/fa';
import Navbares from "../../components/Navbares";
import Sidebares from "../../components/Sidebares";
import { useNavigate } from 'react-router-dom';

const OrganizationalChart = () => {
  const navigate = useNavigate();

  const handleOfficialsClick = () => {
    navigate('/residents/officials');
  };

  const handleStaffsClick = () => {
    navigate('/residents/staff');
  };

  return (
    <>
      <Navbares />
      <Sidebares />
      <main className="bg-gradient-to-br from-green-50 to-white min-h-screen ml-64 pt-36 px-6 pb-16 font-sans">
        <div className="w-full max-w-7xl mx-auto space-y-8">
          {/* Enhanced Header */}
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full shadow-xl mb-4">
              <FaUserTie className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent tracking-tight">
              Barangay Organizational Chart
            </h1>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto leading-relaxed">
              An overview of leadership and key roles in the barangay.
            </p>
          </div>

          {/* Cards Container */}
          <div className="flex flex-col lg:flex-row gap-8 items-center justify-center">
            {/* Officials Card */}
            <div
              onClick={handleOfficialsClick}
              className="group relative w-full max-w-md bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer overflow-hidden"
              tabIndex={0}
              role="button"
              aria-label="View Barangay Officials"
              onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') handleOfficialsClick(); }}
            >
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-green-400/10 to-blue-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              {/* Card Content */}
              <div className="relative p-8 text-center">
                {/* Icon Container */}
                <div className="relative mb-6">
                  <div className="w-32 h-32 mx-auto bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                    <FaUserTie size={60} className="text-white" />
                  </div>
                  {/* Decorative Ring */}
                  <div className="absolute inset-0 w-32 h-32 mx-auto border-4 border-green-200 rounded-full animate-pulse"></div>
                </div>
                {/* Title */}
                <h3 className="text-2xl font-bold text-gray-800 mb-3 group-hover:text-green-600 transition-colors duration-300">
                  Barangay Officials
                </h3>
                {/* Description */}
                <p className="text-gray-600 mb-6 leading-relaxed">
                  View the Barangay Captain, Councilors, and committee heads
                </p>
                {/* Action Button */}
                <div className="flex items-center justify-center space-x-2 text-green-600 font-semibold group-hover:text-green-700 transition-colors duration-300">
                  <span>View Officials</span>
                  <FaArrowRight className="transform group-hover:translate-x-1 transition-transform duration-300" />
                </div>
              </div>
              {/* Hover Border Effect */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-green-500 to-blue-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
            </div>
            {/* Staffs Card */}
            <div
              onClick={handleStaffsClick}
              className="group relative w-full max-w-md bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer overflow-hidden"
              tabIndex={0}
              role="button"
              aria-label="View Barangay Staffs"
              onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') handleStaffsClick(); }}
            >
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-400/10 to-purple-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              {/* Card Content */}
              <div className="relative p-8 text-center">
                {/* Icon Container */}
                <div className="relative mb-6">
                  <div className="w-32 h-32 mx-auto bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                    <FaUsers size={60} className="text-white" />
                  </div>
                  {/* Decorative Ring */}
                  <div className="absolute inset-0 w-32 h-32 mx-auto border-4 border-blue-200 rounded-full animate-pulse"></div>
                </div>
                {/* Title */}
                <h3 className="text-2xl font-bold text-gray-800 mb-3 group-hover:text-blue-600 transition-colors duration-300">
                  Barangay Staffs
                </h3>
                {/* Description */}
                <p className="text-gray-600 mb-6 leading-relaxed">
                  View the Secretary, Treasurer, SK Chairman, and other staff
                </p>
                {/* Action Button */}
                <div className="flex items-center justify-center space-x-2 text-blue-600 font-semibold group-hover:text-blue-700 transition-colors duration-300">
                  <span>View Staffs</span>
                  <FaArrowRight className="transform group-hover:translate-x-1 transition-transform duration-300" />
                </div>
              </div>
              {/* Hover Border Effect */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-purple-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default OrganizationalChart;
