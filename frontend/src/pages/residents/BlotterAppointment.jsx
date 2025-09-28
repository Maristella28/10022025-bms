import React from 'react';
import { Link } from 'react-router-dom';
import { FaFileAlt, FaEdit, FaSearch, FaShieldAlt, FaGavel, FaClock, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';
import Navbares from "../../components/Navbares";
import Sidebares from "../../components/Sidebares";

const BlotterAppointment = () => {
  return (
    <>
      <Navbares />
      <Sidebares />
      <main className="bg-gradient-to-br from-slate-50 via-blue-50 to-emerald-50 min-h-screen ml-64 pt-36 px-6 py-12 font-sans relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-emerald-200/30 to-blue-200/30 rounded-full blur-3xl animate-float"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-purple-200/30 to-pink-200/30 rounded-full blur-3xl animate-float-delayed"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-yellow-200/20 to-orange-200/20 rounded-full blur-3xl animate-pulse-slow"></div>
        </div>

        <div className="w-full max-w-7xl mx-auto relative z-10">
          {/* Enhanced Page Header */}
          <div className="text-center mb-16">
            <div className="relative inline-flex items-center justify-center mb-6">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 via-blue-500 to-purple-600 rounded-full blur-xl opacity-30 animate-pulse-slow"></div>
              <div className="relative w-24 h-24 bg-gradient-to-br from-emerald-500 via-blue-500 to-purple-600 rounded-full shadow-2xl flex items-center justify-center transform hover:scale-110 transition-all duration-300">
                <FaShieldAlt className="w-10 h-10 text-white drop-shadow-lg" />
              </div>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-black bg-gradient-to-r from-emerald-600 via-blue-600 to-purple-600 bg-clip-text text-transparent tracking-tight leading-tight mb-4">
              Blotter Management
            </h1>
            <p className="text-gray-600 text-xl max-w-3xl mx-auto leading-relaxed font-medium">
              Professional dispute resolution and incident reporting system for our community.
              <span className="text-emerald-600 font-semibold"> Secure, efficient, and transparent.</span>
            </p>
          </div>

          {/* Enhanced Action Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {/* Instructions Card */}
            <Link
              to="/residents/charterList"
              className="group relative bg-white/80 backdrop-blur-sm border border-white/50 rounded-3xl p-8 shadow-xl hover:shadow-2xl transform hover:scale-105 hover:-translate-y-2 transition-all duration-500 cursor-pointer overflow-hidden"
            >
              {/* Gradient overlay on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-indigo-500 opacity-0 group-hover:opacity-10 transition-opacity duration-300 rounded-3xl"></div>
              
              {/* Floating particles effect */}
              <div className="absolute inset-0 overflow-hidden rounded-3xl">
                <div className="absolute top-4 right-4 w-2 h-2 bg-blue-400 rounded-full animate-float opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="absolute bottom-6 left-6 w-1.5 h-1.5 bg-indigo-300 rounded-full animate-float-delayed opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
              
              <div className="relative z-10">
                <div className="mb-6 relative">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <FaFileAlt className="w-8 h-8 text-white" />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl blur-xl"></div>
                </div>
                
                <h3 className="font-bold text-gray-800 text-xl mb-3 group-hover:text-gray-900 transition-colors duration-300">
                  Blotter Instructions
                </h3>
                <p className="text-gray-600 leading-relaxed group-hover:text-gray-700 transition-colors duration-300 mb-4">
                  Learn the proper procedures and guidelines for filing barangay blotter reports and understanding your rights.
                </p>
                
                {/* Hover indicator */}
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                  <span className="text-sm font-semibold text-blue-600">View Guidelines</span>
                  <FaExclamationTriangle className="w-3 h-3 text-blue-500" />
                </div>
              </div>
              
              {/* Shine effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out"></div>
            </Link>

            {/* Generate Blotter Card */}
            <Link
              to="/residents/generateBlotter"
              className="group relative bg-white/80 backdrop-blur-sm border border-white/50 rounded-3xl p-8 shadow-xl hover:shadow-2xl transform hover:scale-105 hover:-translate-y-2 transition-all duration-500 cursor-pointer overflow-hidden"
            >
              {/* Gradient overlay on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 to-teal-500 opacity-0 group-hover:opacity-10 transition-opacity duration-300 rounded-3xl"></div>
              
              {/* Floating particles effect */}
              <div className="absolute inset-0 overflow-hidden rounded-3xl">
                <div className="absolute top-4 right-4 w-2 h-2 bg-emerald-400 rounded-full animate-float opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="absolute bottom-6 left-6 w-1.5 h-1.5 bg-teal-300 rounded-full animate-float-delayed opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
              
              <div className="relative z-10">
                <div className="mb-6 relative">
                  <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <FaEdit className="w-8 h-8 text-white" />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl blur-xl"></div>
                </div>
                
                <h3 className="font-bold text-gray-800 text-xl mb-3 group-hover:text-gray-900 transition-colors duration-300">
                  Generate Blotter
                </h3>
                <p className="text-gray-600 leading-relaxed group-hover:text-gray-700 transition-colors duration-300 mb-4">
                  Create and submit a new blotter report for incidents, disputes, or complaints within the barangay.
                </p>
                
                {/* Hover indicator */}
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                  <span className="text-sm font-semibold text-emerald-600">Create Report</span>
                  <FaGavel className="w-3 h-3 text-emerald-500" />
                </div>
              </div>
              
              {/* Shine effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out"></div>
            </Link>

            {/* Status Requests Card */}
            <Link
              to="/residents/statusBlotterRequests"
              className="group relative bg-white/80 backdrop-blur-sm border border-white/50 rounded-3xl p-8 shadow-xl hover:shadow-2xl transform hover:scale-105 hover:-translate-y-2 transition-all duration-500 cursor-pointer overflow-hidden"
            >
              {/* Gradient overlay on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-purple-400 to-pink-500 opacity-0 group-hover:opacity-10 transition-opacity duration-300 rounded-3xl"></div>
              
              {/* Floating particles effect */}
              <div className="absolute inset-0 overflow-hidden rounded-3xl">
                <div className="absolute top-4 right-4 w-2 h-2 bg-purple-400 rounded-full animate-float opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="absolute bottom-6 left-6 w-1.5 h-1.5 bg-pink-300 rounded-full animate-float-delayed opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
              
              <div className="relative z-10">
                <div className="mb-6 relative">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <FaSearch className="w-8 h-8 text-white" />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl blur-xl"></div>
                </div>
                
                <h3 className="font-bold text-gray-800 text-xl mb-3 group-hover:text-gray-900 transition-colors duration-300">
                  Track Requests
                </h3>
                <p className="text-gray-600 leading-relaxed group-hover:text-gray-700 transition-colors duration-300 mb-4">
                  Monitor the status of your submitted blotter requests and view ticket numbers and admin responses.
                </p>
                
                {/* Hover indicator */}
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                  <span className="text-sm font-semibold text-purple-600">View Status</span>
                  <FaClock className="w-3 h-3 text-purple-500" />
                </div>
              </div>
              
              {/* Shine effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out"></div>
            </Link>
          </div>
          
          {/* Additional info section */}
          <div className="text-center bg-white/60 backdrop-blur-sm rounded-2xl p-8 border border-white/50 shadow-lg">
            <div className="flex items-center justify-center gap-3 mb-4">
              <FaCheckCircle className="text-emerald-500 text-2xl" />
              <h3 className="text-2xl font-bold text-gray-800">Professional Dispute Resolution</h3>
              <FaCheckCircle className="text-emerald-500 text-2xl" />
            </div>
            <p className="text-gray-600 max-w-4xl mx-auto text-lg leading-relaxed">
              Our barangay blotter system ensures fair and transparent handling of all community disputes and incidents. 
              All reports are processed professionally with proper documentation and follow-up procedures.
            </p>
          </div>
        </div>
      </main>
    </>
  );
};

export default BlotterAppointment;
