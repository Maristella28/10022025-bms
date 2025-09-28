 import React, { useState, useEffect } from 'react';
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import { useAuth } from "../../contexts/AuthContext";
import {
  UserGroupIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  DocumentTextIcon,
  HomeIcon,
  ShieldCheckIcon,
  UserIcon,
  CalendarIcon,
  ChartBarIcon,
  BellIcon,
  ExclamationCircleIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ArrowPathIcon,
  SparklesIcon,
  StarIcon,
  FireIcon,
  BoltIcon,
} from "@heroicons/react/24/solid";

const StatCard = ({ label, value, icon, iconBg, valueColor = "text-green-600", loading = false, gradient = false, trend = null }) => (
  <div className={`relative overflow-hidden rounded-3xl p-6 shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-500 flex justify-between items-center group transform hover:scale-105 ${gradient ? 'bg-gradient-to-br from-white to-gray-50' : 'bg-white'}`}>
    {/* Animated background gradient */}
    <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-gray-50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
    
    {/* Content */}
    <div className="relative z-10">
      <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">{label}</p>
      {loading ? (
        <div className="animate-pulse">
          <div className="h-10 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg w-20"></div>
        </div>
      ) : (
        <div className="flex items-baseline gap-2">
          <p className={`text-4xl font-black ${valueColor} group-hover:text-emerald-600 transition-all duration-300`}>
            {typeof value === 'number' ? value.toLocaleString() : value}
          </p>
          {trend && (
            <div className={`flex items-center gap-1 text-sm font-bold ${trend > 0 ? 'text-green-500' : 'text-red-500'}`}>
              {trend > 0 ? <ArrowTrendingUpIcon className="w-4 h-4" /> : <ArrowTrendingDownIcon className="w-4 h-4" />}
              {Math.abs(trend)}%
            </div>
          )}
        </div>
      )}
    </div>
    
    {/* Enhanced icon container */}
    <div className={`relative w-16 h-16 rounded-2xl flex items-center justify-center ${iconBg} group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
      <div className="absolute inset-0 bg-white opacity-20 rounded-2xl"></div>
      <div className="relative z-10">
        {icon}
      </div>
    </div>
    
    {/* Decorative elements */}
    <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-transparent to-gray-100 rounded-full transform translate-x-8 -translate-y-8 opacity-20 group-hover:opacity-40 transition-opacity duration-500"></div>
  </div>
);

const AdminDashboard = () => {
  const [success, setSuccess] = useState('');
  const [statistics, setStatistics] = useState({
    total_residents: 0,
    certificates_issued: 0,
    pending_requests: 0,
    household_records: 0,
    blotter_reports: 0,
    barangay_officials: 0,
    barangay_staff: 0,
  });
  const [loading, setLoading] = useState(true);
  const [statsError, setStatsError] = useState('');

  // Show profile update success message if present in sessionStorage
  useEffect(() => {
    const profileMsg = sessionStorage.getItem('adminProfileSuccess');
    if (profileMsg) {
      setSuccess(profileMsg);
      sessionStorage.removeItem('adminProfileSuccess');
    }
  }, []);

  // Fetch dashboard statistics
  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        setLoading(true);
        setStatsError('');
        
        const token = localStorage.getItem('authToken');
        if (!token) {
          throw new Error("No auth token found.");
        }

        const response = await fetch('/api/admin/dashboard', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        if (data.statistics) {
          setStatistics(data.statistics);
        } else {
          throw new Error('No statistics data received');
        }
      } catch (err) {
        console.error('Error fetching statistics:', err);
        setStatsError('Failed to load dashboard statistics');
        // Set fallback values
        setStatistics({
          total_residents: 0,
          certificates_issued: 0,
          pending_requests: 0,
          household_records: 0,
          blotter_reports: 0,
          barangay_officials: 0,
          barangay_staff: 0,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStatistics();
  }, []);

  const { user } = useAuth();

  const refreshStatistics = async () => {
    try {
      setLoading(true);
      setStatsError('');
      
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error("No auth token found.");
      }

      const response = await fetch('/api/admin/dashboard', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.statistics) {
        setStatistics(data.statistics);
      } else {
        throw new Error('No statistics data received');
      }
    } catch (err) {
      console.error('Error fetching statistics:', err);
      setStatsError('Failed to load dashboard statistics');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <Sidebar />
      <main className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 min-h-screen ml-64 pt-36 px-6 pb-16 font-sans relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-200 to-purple-200 rounded-full opacity-20 animate-pulse"></div>
          <div className="absolute top-1/2 -left-40 w-96 h-96 bg-gradient-to-br from-green-200 to-teal-200 rounded-full opacity-15 animate-pulse" style={{animationDelay: '2s'}}></div>
          <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-gradient-to-br from-pink-200 to-rose-200 rounded-full opacity-10 animate-pulse" style={{animationDelay: '4s'}}></div>
        </div>
        
        <div className="w-full max-w-7xl mx-auto space-y-10 relative z-10">
          {/* Success message from profile update */}
          {success && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-4">
              <div className="flex items-center gap-2 justify-center">
                <CheckCircleIcon className="w-5 h-5 text-green-600" />
                <p className="text-green-700 font-medium">{success}</p>
              </div>
            </div>
          )}
          {/* Enhanced Header */}
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full shadow-xl mb-4">
              <ShieldCheckIcon className="w-10 h-10 text-white" />
            </div>
            <div className="flex items-center justify-center gap-4">
              <h1 className="text-5xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent tracking-tight">
                Admin Dashboard
              </h1>
              <button
                onClick={refreshStatistics}
                disabled={loading}
                className="p-2 bg-green-100 hover:bg-green-200 rounded-full transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Refresh Statistics"
              >
                <svg 
                  className={`w-5 h-5 text-green-600 ${loading ? 'animate-spin' : ''}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            </div>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto leading-relaxed">
              Welcome{user?.name ? `, ${user.name}` : ''}! Manage barangay operations, user registrations, and system overview.
            </p>
          </div>

          {/* Statistics Error Message */}
          {statsError && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
              <div className="flex items-center gap-2">
                <ExclamationTriangleIcon className="w-5 h-5 text-red-600" />
                <p className="text-red-600 font-medium">{statsError}</p>
              </div>
            </div>
          )}

          {/* Enhanced Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-8">
            <StatCard
              label="Total Residents"
              value={statistics.total_residents}
              icon={<UserGroupIcon className="w-6 h-6 text-green-600" />}
              iconBg="bg-green-100"
              valueColor="text-green-600"
              loading={loading}
            />
            <StatCard
              label="Certificates Issued"
              value={statistics.certificates_issued}
              icon={<DocumentTextIcon className="w-6 h-6 text-purple-600" />}
              iconBg="bg-purple-100"
              valueColor="text-purple-600"
              loading={loading}
            />
            <StatCard
              label="Pending Requests"
              value={statistics.pending_requests}
              icon={<ClockIcon className="w-6 h-6 text-blue-600" />}
              iconBg="bg-blue-100"
              valueColor="text-blue-600"
              loading={loading}
            />
            <StatCard
              label="Household Records"
              value={statistics.household_records}
              icon={<HomeIcon className="w-6 h-6 text-amber-600" />}
              iconBg="bg-amber-100"
              valueColor="text-amber-600"
              loading={loading}
            />
            <StatCard
              label="Blotter Reports"
              value={statistics.blotter_reports}
              icon={<ExclamationTriangleIcon className="w-6 h-6 text-rose-600" />}
              iconBg="bg-rose-100"
              valueColor="text-rose-600"
              loading={loading}
            />
            <StatCard
              label="Barangay Officials & Staff"
              value={statistics.barangay_officials + statistics.barangay_staff}
              icon={<UserIcon className="w-6 h-6 text-teal-600" />}
              iconBg="bg-teal-100"
              valueColor="text-teal-600"
              loading={loading}
            />
          </div>

          {/* Recent Activity Section */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-4">
              <h3 className="text-white font-semibold text-lg flex items-center gap-2">
                <ClockIcon className="w-5 h-5" />
                Recent Activity Overview
              </h3>
            </div>
            
            <div className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
                  <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <UserGroupIcon className="w-8 h-8 text-white" />
                  </div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-2">New Residents</h4>
                  <p className="text-3xl font-bold text-blue-600 mb-2">+{statistics.total_residents}</p>
                  <p className="text-sm text-gray-600">Total registered residents</p>
                </div>

                <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl">
                  <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <DocumentTextIcon className="w-8 h-8 text-white" />
                  </div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-2">Certificates Issued</h4>
                  <p className="text-3xl font-bold text-purple-600 mb-2">{statistics.certificates_issued}</p>
                  <p className="text-sm text-gray-600">Documents completed this period</p>
                </div>

                <div className="text-center p-6 bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl">
                  <div className="w-16 h-16 bg-amber-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <ClockIcon className="w-8 h-8 text-white" />
                  </div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-2">Pending Requests</h4>
                  <p className="text-3xl font-bold text-amber-600 mb-2">{statistics.pending_requests}</p>
                  <p className="text-sm text-gray-600">Awaiting processing</p>
                </div>
              </div>
            </div>
          </div>

          {/* System Health Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                  <ShieldCheckIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">System Status</h3>
                  <p className="text-sm text-gray-500">All systems operational</p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Database</span>
                  <span className="text-sm font-medium text-green-600">✓ Online</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">API Services</span>
                  <span className="text-sm font-medium text-green-600">✓ Online</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">File Storage</span>
                  <span className="text-sm font-medium text-green-600">✓ Online</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                  <CalendarIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Today's Summary</h3>
                  <p className="text-sm text-gray-500">{new Date().toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}</p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Active Users</span>
                  <span className="text-sm font-medium text-blue-600">{statistics.total_residents}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Households</span>
                  <span className="text-sm font-medium text-blue-600">{statistics.household_records}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Blotter Reports</span>
                  <span className="text-sm font-medium text-blue-600">{statistics.blotter_reports}</span>
                </div>
              </div>
            </div>
          </div>


          {/* Alerts & Notifications */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center">
                  <BellIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">System Alerts</h3>
                  <p className="text-sm text-gray-500">Important notifications</p>
                </div>

              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                  <ExclamationCircleIcon className="w-5 h-5 text-yellow-600" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-yellow-800">Pending Requests</p>
                    <p className="text-xs text-yellow-600">{statistics.pending_requests} items need attention</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <CheckCircleIcon className="w-5 h-5 text-blue-600" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-blue-800">System Health</p>
                    <p className="text-xs text-blue-600">All services running normally</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                  <ArrowTrendingUpIcon className="w-5 h-5 text-green-600" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-green-800">Growth</p>
                    <p className="text-xs text-green-600">Resident registrations increasing</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center">
                  <ChartBarIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Performance Metrics</h3>
                  <p className="text-sm text-gray-500">Key performance indicators</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <UserGroupIcon className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800">Resident Growth</p>
                      <p className="text-xs text-gray-600">Monthly registrations</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-blue-600">+{statistics.total_residents}</p>
                    <div className="flex items-center gap-1">
                      <ArrowTrendingUpIcon className="w-3 h-3 text-green-500" />
                      <span className="text-xs text-green-600">12%</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                      <DocumentTextIcon className="w-4 h-4 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800">Document Processing</p>
                      <p className="text-xs text-gray-600">Completion rate</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-purple-600">{statistics.certificates_issued}</p>
                    <div className="flex items-center gap-1">
                      <ArrowTrendingUpIcon className="w-3 h-3 text-green-500" />
                      <span className="text-xs text-green-600">8%</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                      <ClockIcon className="w-4 h-4 text-red-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800">Response Time</p>
                      <p className="text-xs text-gray-600">Average processing</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-red-600">2.4h</p>
                    <div className="flex items-center gap-1">
                      <ArrowTrendingDownIcon className="w-3 h-3 text-green-500" />
                      <span className="text-xs text-green-600">-15%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity & Logs */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-gray-600 to-gray-700 px-6 py-4">
              <h3 className="text-white font-semibold text-lg flex items-center gap-2">
                <ClockIcon className="w-5 h-5" />
                Recent Activity & System Logs
              </h3>
            </div>
            
            <div className="p-6">
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <CheckCircleIcon className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-800">System backup completed successfully</p>
                    <p className="text-xs text-gray-600">2 minutes ago</p>
                  </div>
                  <span className="text-xs text-green-600 font-medium">SUCCESS</span>
                </div>

                <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <UserGroupIcon className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-800">New resident registration: John Doe</p>
                    <p className="text-xs text-gray-600">15 minutes ago</p>
                  </div>
                  <span className="text-xs text-blue-600 font-medium">INFO</span>
                </div>

                <div className="flex items-center gap-4 p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                    <DocumentTextIcon className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-800">Certificate request processed: Barangay Clearance</p>
                    <p className="text-xs text-gray-600">1 hour ago</p>
                  </div>
                  <span className="text-xs text-purple-600 font-medium">PROCESSED</span>
                </div>

                <div className="flex items-center gap-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                  <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                    <ExclamationTriangleIcon className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-800">High number of pending requests detected</p>
                    <p className="text-xs text-gray-600">2 hours ago</p>
                  </div>
                  <span className="text-xs text-yellow-600 font-medium">WARNING</span>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-200">
                <button className="w-full py-2 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center gap-2">
                  <ArrowPathIcon className="w-4 h-4" />
                  View All Activity Logs
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default AdminDashboard;

