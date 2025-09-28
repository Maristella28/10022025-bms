import React, { useState, useEffect } from 'react';
import axios from '../../utils/axiosConfig';
import { format } from 'date-fns';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowDownTrayIcon,
  TrashIcon,
  EyeIcon,
  ArrowPathIcon,
  ChartBarIcon,
  UserIcon,
  ClockIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XMarkIcon,
  XCircleIcon,
  DocumentTextIcon,
  CalendarIcon,
  ServerIcon,
  GlobeAltIcon,
} from '@heroicons/react/24/solid';

const ActivityLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    user_id: '',
    action: '',
    model_type: '',
    search: '',
    date_from: '',
    date_to: '',
    user_type: 'all', // New filter for user type
    page: 1,
    per_page: 20,
  });
  const [filterOptions, setFilterOptions] = useState({
    actions: [],
    model_types: [],
    users: [],
  });
  const [statistics, setStatistics] = useState(null);
  const [selectedLog, setSelectedLog] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [securityAlerts, setSecurityAlerts] = useState([]);
  const [auditSummary, setAuditSummary] = useState(null);
  const [activeTab, setActiveTab] = useState('all'); // New state for tab navigation

  useEffect(() => {
    fetchLogs();
    fetchFilterOptions();
    fetchStatistics();
    fetchSecurityAlerts();
    fetchAuditSummary();
  }, [filters.page, filters.per_page, filters.user_type, filters.action, filters.model_type, filters.search, filters.date_from, filters.date_to]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();

      Object.entries(filters).forEach(([key, value]) => {
        if (value && value !== '' && value !== 'all') {
          params.append(key, value);
        }
      });

      console.log('Fetching logs with params:', params.toString());
      const response = await axios.get(`/admin/activity-logs?${params}`);
      console.log('Logs response:', response.data);
      setLogs(response.data.logs.data);
      setTotalPages(response.data.logs.last_page);
      setError(null);
    } catch (err) {
      setError('Failed to fetch activity logs');
      console.error('Error fetching logs:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchFilterOptions = async () => {
    try {
      const response = await axios.get('/admin/activity-logs/filters/options');
      setFilterOptions(response.data.filters);
    } catch (err) {
      console.error('Error fetching filter options:', err);
    }
  };

  const fetchStatistics = async () => {
    try {
      const response = await axios.get('/admin/activity-logs/statistics/summary');
      setStatistics(response.data.statistics);
    } catch (err) {
      console.error('Error fetching statistics:', err);
    }
  };

  const fetchSecurityAlerts = async () => {
    try {
      const response = await axios.get('/admin/activity-logs/security/alerts');
      setSecurityAlerts(response.data.alerts || []);
    } catch (err) {
      console.error('Error fetching security alerts:', err);
    }
  };

  const fetchAuditSummary = async () => {
    try {
      const response = await axios.get('/admin/activity-logs/audit/summary');
      setAuditSummary(response.data.audit_summary);
    } catch (err) {
      console.error('Error fetching audit summary:', err);
    }
  };


  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value,
      page: field === 'page' ? value : 1, // Only reset to page 1 if not changing page
    }));
  };

  const handleSearch = () => {
    setFilters(prev => ({ ...prev, page: 1 }));
    fetchLogs();
  };


  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setFilters(prev => ({ ...prev, user_type: tab, page: 1 }));
    fetchLogs();
  };

  const handleExport = async () => {
    try {
      const response = await axios.post('/admin/activity-logs/export', filters);
      // Create and download CSV
      const csvContent = generateCSV(response.data.logs.data);
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `activity-logs-${format(new Date(), 'yyyy-MM-dd')}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error exporting logs:', err);
    }
  };

  const handleCleanup = async () => {
    if (window.confirm('Are you sure you want to delete activity logs older than 90 days?')) {
      try {
        await axios.delete('/admin/activity-logs/cleanup');
        fetchLogs();
        fetchStatistics();
      } catch (err) {
        console.error('Error cleaning up logs:', err);
      }
    }
  };

  const generateCSV = (data) => {
    const headers = ['Date', 'User', 'Action', 'Model', 'Description', 'IP Address'];
    const rows = data.map(log => [
      format(new Date(log.created_at), 'yyyy-MM-dd HH:mm:ss'),
      log.user?.name || 'System',
      log.action,
      log.model_type ? `${log.model_type}#${log.model_id}` : 'N/A',
      log.description,
      log.ip_address || 'N/A',
    ]);

    return [headers, ...rows].map(row => row.map(field => `"${field}"`).join(',')).join('\n');
  };


  const formatDate = (dateString) => {
    return format(new Date(dateString), 'MMM dd, yyyy HH:mm:ss');
  };

  if (loading && logs.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-green-50 to-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600 font-medium">Loading activity logs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-green-50 to-white min-h-screen ml-64 pt-36 px-6 pb-16 font-sans">
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @keyframes float-delayed {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        @keyframes float-slow {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-6px); }
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-float { animation: float 3s ease-in-out infinite; }
        .animate-float-delayed { animation: float-delayed 3s ease-in-out infinite 0.5s; }
        .animate-float-slow { animation: float-slow 4s ease-in-out infinite 1s; }
        .animate-shimmer { animation: shimmer 2s ease-in-out infinite; }
        .animate-fade-in { animation: fadeIn 0.8s ease-out; }
        .animate-fade-in-up { animation: fadeInUp 0.8s ease-out; }
        .animate-slide-in-up { animation: slideInUp 0.8s ease-out; }
        .animation-delay-500 { animation-delay: 0.5s; }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideInUp {
          from { opacity: 0; transform: translateY(50px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
      <div className="w-full max-w-7xl mx-auto space-y-8">
        {/* Enhanced Header */}
        <div className="text-center space-y-8 animate-fade-in relative">
          {/* Floating background elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-10 left-10 w-20 h-20 bg-gradient-to-br from-green-400/20 to-emerald-400/20 rounded-full blur-xl animate-float"></div>
            <div className="absolute top-20 right-20 w-16 h-16 bg-gradient-to-br from-blue-400/20 to-cyan-400/20 rounded-full blur-lg animate-float-delayed"></div>
            <div className="absolute bottom-10 left-1/4 w-12 h-12 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-md animate-float-slow"></div>
          </div>

          <div className="relative">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-green-500 via-emerald-500 to-green-600 rounded-3xl shadow-2xl mb-6 transform transition-all duration-700 hover:scale-110 hover:rotate-6 hover:shadow-3xl relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent rounded-3xl group-hover:animate-spin"></div>
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <ChartBarIcon className="w-12 h-12 text-white relative z-10 drop-shadow-lg group-hover:scale-110 transition-transform duration-300" />
            </div>
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg animate-pulse">
              <ClockIcon className="w-4 h-4 text-white" />
            </div>
          </div>

          <div className="space-y-6">
            <h1 className="text-7xl font-black bg-gradient-to-r from-green-600 via-emerald-600 to-green-700 bg-clip-text text-transparent tracking-tight animate-slide-in-up drop-shadow-lg">
              Activity Logs
            </h1>
            <div className="flex justify-center">
              <div className="w-32 h-1.5 bg-gradient-to-r from-green-500 via-emerald-500 to-green-600 rounded-full shadow-lg relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer"></div>
              </div>
            </div>
          </div>

          <div className="max-w-4xl mx-auto space-y-6 animate-fade-in-up animation-delay-500">
            <p className="text-slate-600 text-2xl leading-relaxed font-semibold">
              Comprehensive monitoring system for tracking all system activities and user interactions
            </p>
            <p className="text-slate-500 text-lg leading-relaxed max-w-3xl mx-auto">
              Monitor admin actions, resident activities, and staff operations with detailed audit trails and real-time analytics
            </p>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 animate-fade-in">
            <div className="flex items-center gap-3">
              <ExclamationTriangleIcon className="w-6 h-6 text-red-600" />
              <div>
                <h4 className="text-red-800 font-semibold">Error Loading Data</h4>
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Statistics Cards */}
        {statistics && (
          <div className="mb-12">
            <div className="text-center mb-8">
              <h2 className="text-4xl font-black bg-gradient-to-r from-slate-800 to-slate-900 bg-clip-text text-transparent mb-4 flex items-center justify-center gap-3">
                <ChartBarIcon className="w-8 h-8 text-blue-600" />
                Activity Statistics
              </h2>
              <p className="text-slate-600 text-lg max-w-2xl mx-auto">
                Real-time analytics and performance metrics for system activities
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="group bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl border border-slate-200/50 p-8 transition-all duration-700 hover:shadow-3xl hover:scale-105 hover:-translate-y-3 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50/80 to-indigo-50/80 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 via-indigo-500 to-blue-600 rounded-3xl flex items-center justify-center shadow-2xl group-hover:scale-110 group-hover:rotate-12 transition-all duration-500 relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent rounded-3xl"></div>
                      <DocumentTextIcon className="w-8 h-8 text-white relative z-10 drop-shadow-lg" />
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-blue-600 uppercase tracking-wider mb-1">Total</p>
                      <p className="text-4xl font-black text-slate-900 group-hover:text-blue-700 transition-colors duration-500 drop-shadow-sm">
                        {statistics.total_logs.toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-slate-700 group-hover:text-blue-600 transition-colors duration-500 mb-4">Activity Logs</h3>
                  <div className="w-full bg-slate-200 rounded-full h-3 mt-4 overflow-hidden shadow-inner">
                    <div className="bg-gradient-to-r from-blue-500 via-indigo-500 to-blue-600 h-3 rounded-full transition-all duration-1500 group-hover:from-blue-600 group-hover:via-indigo-600 group-hover:to-blue-700 relative overflow-hidden" style={{ width: '100%' }}>
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="group bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl border border-slate-200/50 p-8 transition-all duration-700 hover:shadow-3xl hover:scale-105 hover:-translate-y-3 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-green-50/80 to-emerald-50/80 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-green-500 via-emerald-500 to-green-600 rounded-3xl flex items-center justify-center shadow-2xl group-hover:scale-110 group-hover:rotate-12 transition-all duration-500 relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent rounded-3xl"></div>
                      <ShieldCheckIcon className="w-8 h-8 text-white relative z-10 drop-shadow-lg" />
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-green-600 uppercase tracking-wider mb-1">Login</p>
                      <p className="text-4xl font-black text-slate-900 group-hover:text-green-700 transition-colors duration-500 drop-shadow-sm">
                        {statistics.login_count.toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-slate-700 group-hover:text-green-600 transition-colors duration-500 mb-4">Login Events</h3>
                  <div className="w-full bg-slate-200 rounded-full h-3 mt-4 overflow-hidden shadow-inner">
                    <div className="bg-gradient-to-r from-green-500 via-emerald-500 to-green-600 h-3 rounded-full transition-all duration-1500 group-hover:from-green-600 group-hover:via-emerald-600 group-hover:to-green-700 relative overflow-hidden" style={{ width: '85%' }}>
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="group bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl border border-slate-200/50 p-8 transition-all duration-700 hover:shadow-3xl hover:scale-105 hover:-translate-y-3 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-50/80 to-pink-50/80 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-500 via-pink-500 to-purple-600 rounded-3xl flex items-center justify-center shadow-2xl group-hover:scale-110 group-hover:rotate-12 transition-all duration-500 relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent rounded-3xl"></div>
                      <UserIcon className="w-8 h-8 text-white relative z-10 drop-shadow-lg" />
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-purple-600 uppercase tracking-wider mb-1">New</p>
                      <p className="text-4xl font-black text-slate-900 group-hover:text-purple-700 transition-colors duration-500 drop-shadow-sm">
                        {statistics.user_registrations.toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-slate-700 group-hover:text-purple-600 transition-colors duration-500 mb-4">Registrations</h3>
                  <div className="w-full bg-slate-200 rounded-full h-3 mt-4 overflow-hidden shadow-inner">
                    <div className="bg-gradient-to-r from-purple-500 via-pink-500 to-purple-600 h-3 rounded-full transition-all duration-1500 group-hover:from-purple-600 group-hover:via-pink-600 group-hover:to-purple-700 relative overflow-hidden" style={{ width: '70%' }}>
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="group bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl border border-slate-200/50 p-8 transition-all duration-700 hover:shadow-3xl hover:scale-105 hover:-translate-y-3 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-50/80 to-red-50/80 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-orange-500 via-red-500 to-orange-600 rounded-3xl flex items-center justify-center shadow-2xl group-hover:scale-110 group-hover:rotate-12 transition-all duration-500 relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent rounded-3xl"></div>
                      <ArrowPathIcon className="w-8 h-8 text-white relative z-10 drop-shadow-lg" />
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-orange-600 uppercase tracking-wider mb-1">Updates</p>
                      <p className="text-4xl font-black text-slate-900 group-hover:text-orange-700 transition-colors duration-500 drop-shadow-sm">
                        {statistics.resident_updates.toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-slate-700 group-hover:text-orange-600 transition-colors duration-500 mb-4">Profile Updates</h3>
                  <div className="w-full bg-slate-200 rounded-full h-3 mt-4 overflow-hidden shadow-inner">
                    <div className="bg-gradient-to-r from-orange-500 via-red-500 to-orange-600 h-3 rounded-full transition-all duration-1500 group-hover:from-orange-600 group-hover:via-red-600 group-hover:to-orange-700 relative overflow-hidden" style={{ width: '60%' }}>
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Security Alerts Section */}
        {securityAlerts && securityAlerts.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <ExclamationTriangleIcon className="w-7 h-7 text-red-600" />
              Security Alerts
            </h2>
            <div className="space-y-4">
              {securityAlerts.map((alert, index) => (
                <div
                  key={index}
                  className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                      <ExclamationTriangleIcon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-bold text-red-900">{alert.title}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          alert.severity === 'high' ? 'bg-red-100 text-red-800' :
                          alert.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {alert.severity.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-red-800 mb-3">{alert.description}</p>
                      <div className="flex items-center gap-4 text-sm text-red-700">
                        <span className="flex items-center gap-1">
                          <UserIcon className="w-4 h-4" />
                          {alert.user}
                        </span>
                        <span className="flex items-center gap-1">
                          <ClockIcon className="w-4 h-4" />
                          {formatDate(alert.timestamp)}
                        </span>
                        <span className="flex items-center gap-1">
                          <GlobeAltIcon className="w-4 h-4" />
                          {alert.ip_address}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Audit Summary Section */}
        {auditSummary && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <ShieldCheckIcon className="w-7 h-7 text-green-600" />
              Audit Summary
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-200 shadow-lg">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                    <CheckCircleIcon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-green-800 text-sm font-medium">Successful Operations</p>
                    <p className="text-3xl font-bold text-green-900">{auditSummary.successful_operations}</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl p-6 border border-yellow-200 shadow-lg">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                    <ExclamationTriangleIcon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-yellow-800 text-sm font-medium">Failed Operations</p>
                    <p className="text-3xl font-bold text-yellow-900">{auditSummary.failed_operations}</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200 shadow-lg">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                    <ClockIcon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-blue-800 text-sm font-medium">Avg Response Time</p>
                    <p className="text-3xl font-bold text-blue-900">{auditSummary.avg_response_time}ms</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Filters Section */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 mb-8 transition-all duration-300 hover:shadow-2xl">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
            <div>
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <FunnelIcon className="w-6 h-6 text-blue-600" />
                Activity Filters
              </h3>
              <p className="text-gray-600 text-sm">Filter and search through activity logs</p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white px-6 py-3 rounded-xl text-sm font-semibold shadow-lg transition-all duration-300 transform hover:scale-105 flex items-center gap-2"
              >
                <FunnelIcon className="w-4 h-4" />
                {showFilters ? 'Hide Filters' : 'Show Filters'}
              </button>
              <button
                onClick={fetchLogs}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-xl shadow-lg flex items-center gap-3 text-sm font-semibold transition-all duration-300 transform hover:scale-105"
              >
                <ArrowPathIcon className="w-5 h-5" />
                Refresh
              </button>
            </div>
          </div>

          {/* Quick Search */}
          <div className="flex gap-3 items-center mb-6">
            <div className="relative flex-grow max-w-md">
              <input
                type="text"
                className="w-full pl-12 pr-4 py-3 border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent rounded-xl text-sm shadow-sm transition-all duration-300 focus:shadow-md"
                placeholder="Search activities..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
              <MagnifyingGlassIcon className="w-5 h-5 absolute left-4 top-3.5 text-gray-400" />
            </div>
            <button
              onClick={handleSearch}
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-6 py-3 rounded-xl shadow-lg flex items-center gap-2 text-sm font-semibold transition-all duration-300 transform hover:scale-105"
            >
              <MagnifyingGlassIcon className="w-4 h-4" />
              Search
            </button>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200 animate-fade-in">
              <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <FunnelIcon className="w-5 h-5 text-blue-600" />
                Advanced Filters
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Action Type</label>
                  <select
                    value={filters.action}
                    onChange={(e) => handleFilterChange('action', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">All Actions</option>
                    {filterOptions.actions.map((action) => (
                      <option key={action} value={action}>{action}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Model Type</label>
                  <select
                    value={filters.model_type}
                    onChange={(e) => handleFilterChange('model_type', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">All Models</option>
                    {filterOptions.model_types.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date From</label>
                  <input
                    type="date"
                    value={filters.date_from}
                    onChange={(e) => handleFilterChange('date_from', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date To</label>
                  <input
                    type="date"
                    value={filters.date_to}
                    onChange={(e) => handleFilterChange('date_to', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3 mt-6 pt-4 border-t border-gray-200">
                <button
                  onClick={handleExport}
                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-6 py-3 rounded-xl shadow-lg flex items-center gap-2 text-sm font-semibold transition-all duration-300 transform hover:scale-105"
                >
                  <ArrowDownTrayIcon className="w-4 h-4" />
                  Export CSV
                </button>
                <button
                  onClick={handleCleanup}
                  className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white px-6 py-3 rounded-xl shadow-lg flex items-center gap-2 text-sm font-semibold transition-all duration-300 transform hover:scale-105"
                >
                  <TrashIcon className="w-4 h-4" />
                  Cleanup Old Logs
                </button>
              </div>
            </div>
          )}
        </div>
        {/* Audit Trail Summary */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 mb-8 transition-all duration-300 hover:shadow-2xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <DocumentTextIcon className="w-6 h-6 text-purple-600" />
                Audit Trail Summary
              </h3>
              <p className="text-gray-600 text-sm">System activity overview and compliance metrics</p>
            </div>
            <button
              onClick={fetchAuditSummary}
              className="bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-md transition-all duration-300 transform hover:scale-105"
            >
              <ArrowPathIcon className="w-4 h-4 mr-2" />
              Refresh Summary
            </button>
          </div>

          {auditSummary && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                    <CheckCircleIcon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-green-800 text-sm font-medium">Successful Operations</p>
                    <p className="text-2xl font-bold text-green-900">{auditSummary.successful_operations || 0}</p>
                    <p className="text-green-600 text-xs mt-1">Last 30 days</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-red-50 to-pink-50 rounded-xl p-6 border border-red-200">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                    <XCircleIcon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-red-800 text-sm font-medium">Failed Operations</p>
                    <p className="text-2xl font-bold text-red-900">{auditSummary.failed_operations || 0}</p>
                    <p className="text-red-600 text-xs mt-1">Requires attention</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                    <ClockIcon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-blue-800 text-sm font-medium">Avg Response Time</p>
                    <p className="text-2xl font-bold text-blue-900">{auditSummary.avg_response_time || 0}ms</p>
                    <p className="text-blue-600 text-xs mt-1">System performance</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Enhanced Activity Logs Table with Tab Separators */}
        <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl border border-slate-200/60 overflow-hidden transition-all duration-700 hover:shadow-3xl relative">
          <div className="bg-gradient-to-r from-green-600 via-emerald-600 to-green-700 px-8 py-6">
            <div className="flex items-center justify-between">
              <h3 className="text-white font-bold text-2xl flex items-center gap-3">
                <DocumentTextIcon className="w-7 h-7" />
                Activity Logs
              </h3>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-300 rounded-full animate-pulse"></div>
                <span className="text-green-100 text-sm font-medium">Live</span>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="bg-gradient-to-r from-slate-50 via-gray-50 to-slate-50 border-b-2 border-slate-200 px-6 py-4">
            <div className="flex space-x-1 bg-slate-100 rounded-xl p-1">
              <button
                onClick={() => handleTabChange('all')}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-semibold text-sm transition-all duration-300 transform hover:scale-105 ${
                  activeTab === 'all'
                    ? 'bg-white text-slate-800 shadow-lg border border-slate-200'
                    : 'text-slate-600 hover:text-slate-800 hover:bg-white/50'
                }`}
              >
                <ChartBarIcon className="w-4 h-4" />
                All Activities
                <span className="px-2 py-1 bg-slate-200 text-slate-700 text-xs rounded-full">
                  {logs.length}
                </span>
              </button>
              
              <button
                onClick={() => handleTabChange('admin')}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-semibold text-sm transition-all duration-300 transform hover:scale-105 ${
                  activeTab === 'admin'
                    ? 'bg-white text-red-800 shadow-lg border border-red-200'
                    : 'text-slate-600 hover:text-red-800 hover:bg-red-50'
                }`}
              >
                <ShieldCheckIcon className="w-4 h-4" />
                Admin
                <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full">
                  {logs.filter(log => log.user?.user_type === 'admin' || log.user?.role === 'admin').length}
                </span>
              </button>
              
              <button
                onClick={() => handleTabChange('resident')}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-semibold text-sm transition-all duration-300 transform hover:scale-105 ${
                  activeTab === 'resident'
                    ? 'bg-white text-blue-800 shadow-lg border border-blue-200'
                    : 'text-slate-600 hover:text-blue-800 hover:bg-blue-50'
                }`}
              >
                <UserIcon className="w-4 h-4" />
                Resident
                <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                  {logs.filter(log => log.user?.user_type === 'resident' || log.user?.role === 'resident').length}
                </span>
              </button>
              
              <button
                onClick={() => handleTabChange('staff')}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-semibold text-sm transition-all duration-300 transform hover:scale-105 ${
                  activeTab === 'staff'
                    ? 'bg-white text-purple-800 shadow-lg border border-purple-200'
                    : 'text-slate-600 hover:text-purple-800 hover:bg-purple-50'
                }`}
              >
                <DocumentTextIcon className="w-4 h-4" />
                Staff
                <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
                  {logs.filter(log => log.user?.user_type === 'staff' || log.user?.role === 'staff').length}
                </span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto shadow-2xl rounded-2xl">
            {loading ? (
              <div className="px-6 py-16 text-center">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin shadow-lg"></div>
                  <p className="text-slate-600 font-semibold text-lg">Loading activity logs...</p>
                  <p className="text-slate-400 text-sm">Please wait while we fetch the data</p>
                </div>
              </div>
            ) : logs.length === 0 ? (
              <div className="px-6 py-16 text-center">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center shadow-lg">
                    <DocumentTextIcon className="w-8 h-8 text-slate-400" />
                  </div>
                  <p className="text-slate-600 font-semibold text-lg">No activity logs found</p>
                  <p className="text-slate-400 text-sm">Try adjusting your filters or select a different tab</p>
                </div>
              </div>
            ) : (
              <div className="min-h-[400px]">
                {/* Tab Content */}
                {activeTab === 'all' && (
                  <div className="p-6">
                    <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gradient-to-r from-slate-50 via-gray-50 to-slate-50 border-b-2 border-slate-200">
                <tr>
                  <th className="px-6 py-5 text-left font-bold text-slate-700 border-r border-slate-200 text-sm uppercase tracking-wider">Date & Time</th>
                  <th className="px-6 py-5 text-left font-bold text-slate-700 border-r border-slate-200 text-sm uppercase tracking-wider">User</th>
                            <th className="px-6 py-5 text-left font-bold text-slate-700 border-r border-slate-200 text-sm uppercase tracking-wider">User Type</th>
                  <th className="px-6 py-5 text-left font-bold text-slate-700 border-r border-slate-200 text-sm uppercase tracking-wider">Action</th>
                  <th className="px-6 py-5 text-left font-bold text-slate-700 border-r border-slate-200 text-sm uppercase tracking-wider">Model</th>
                  <th className="px-6 py-5 text-left font-bold text-slate-700 border-r border-slate-200 text-sm uppercase tracking-wider">Description</th>
                  <th className="px-6 py-5 text-left font-bold text-slate-700 border-r border-slate-200 text-sm uppercase tracking-wider">IP Address</th>
                  <th className="px-6 py-5 text-left font-bold text-slate-700 text-sm uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/50">
                          {logs.length === 0 ? (
                            <tr>
                              <td colSpan="8" className="px-6 py-16 text-center">
                                <div className="flex flex-col items-center gap-4">
                                  <div className="w-16 h-16 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center shadow-lg">
                                    <DocumentTextIcon className="w-8 h-8 text-slate-400" />
                                  </div>
                                  <p className="text-slate-600 font-semibold text-lg">No activity logs found</p>
                                  <p className="text-slate-400 text-sm">Try adjusting your filters or check back later</p>
                                </div>
                              </td>
                            </tr>
                          ) : (
                            logs.map((log) => {
                              const userType = log.user?.user_type || log.user?.role || 'system';
                              const isAdmin = userType === 'admin';
                              const isResident = userType === 'resident';
                              const isStaff = userType === 'staff';
                              
                              return (
                                <tr key={log.id} className={`hover:bg-gradient-to-r transition-all duration-300 border-b border-slate-200/50 hover:shadow-sm group ${
                                  isAdmin ? 'hover:from-red-50/80 hover:to-pink-50/80 hover:border-red-300/50' :
                                  isResident ? 'hover:from-blue-50/80 hover:to-cyan-50/80 hover:border-blue-300/50' :
                                  isStaff ? 'hover:from-purple-50/80 hover:to-indigo-50/80 hover:border-purple-300/50' :
                                  'hover:from-slate-50/80 hover:to-gray-50/80 hover:border-slate-300/50'
                                }`}>
                                  <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                      <ClockIcon className="w-4 h-4 text-gray-400" />
                                      <span className="font-medium text-gray-900">{formatDate(log.created_at)}</span>
                                    </div>
                                  </td>
                                  <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                      <UserIcon className="w-4 h-4 text-gray-400" />
                                      <span className="font-medium text-gray-900">{log.user?.name || 'System'}</span>
                                    </div>
                                  </td>
                                  <td className="px-6 py-4">
                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                      isAdmin ? 'bg-red-100 text-red-800' :
                                      isResident ? 'bg-blue-100 text-blue-800' :
                                      isStaff ? 'bg-purple-100 text-purple-800' :
                                      'bg-gray-100 text-gray-800'
                                    }`}>
                                      {userType.charAt(0).toUpperCase() + userType.slice(1)}
                                    </span>
                                  </td>
                                  <td className="px-6 py-4">
                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                      log.action.includes('login') ? 'bg-green-100 text-green-800' :
                                      log.action.includes('logout') ? 'bg-yellow-100 text-yellow-800' :
                                      log.action.includes('delete') ? 'bg-red-100 text-red-800' :
                                      log.action.includes('create') ? 'bg-blue-100 text-blue-800' :
                                      log.action.includes('update') ? 'bg-purple-100 text-purple-800' :
                                      'bg-gray-100 text-gray-800'
                                    }`}>
                                      {log.action}
                                    </span>
                                  </td>
                                  <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                      <ServerIcon className="w-4 h-4 text-gray-400" />
                                      <span className="font-mono text-sm text-gray-700">
                                        {log.model_type ? `${log.model_type.split('\\').pop()}#${log.model_id}` : 'N/A'}
                                      </span>
                                    </div>
                                  </td>
                                  <td className="px-6 py-4 max-w-xs">
                                    <div className="truncate" title={log.description}>
                                      {log.description}
                                    </div>
                                  </td>
                                  <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                      <GlobeAltIcon className="w-4 h-4 text-gray-400" />
                                      <span className="font-mono text-sm text-gray-700">{log.ip_address || 'N/A'}</span>
                                    </div>
                                  </td>
                                  <td className="px-6 py-4">
                                    <button
                                      onClick={() => {
                                        setSelectedLog(log);
                                        setShowDetails(true);
                                      }}
                                      className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-4 py-2 rounded-lg text-xs font-semibold shadow-md flex items-center gap-2 transition-all duration-300 transform hover:scale-105"
                                    >
                                      <EyeIcon className="w-4 h-4" />
                                      View
                                    </button>
                                  </td>
                                </tr>
                              );
                            })
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Individual Tab Content */}
                {activeTab === 'admin' && (
                  <div className="p-6">
                    <div className="bg-gradient-to-r from-red-50 to-pink-50 px-6 py-4 rounded-t-xl border-b-2 border-red-200 mb-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-pink-600 rounded-lg flex items-center justify-center shadow-lg">
                          <ShieldCheckIcon className="w-4 h-4 text-white" />
                        </div>
                        <h4 className="text-lg font-bold text-red-800">Administrative Activities</h4>
                        <span className="px-3 py-1 bg-red-100 text-red-800 text-xs font-semibold rounded-full">
                          {logs.filter(log => log.user?.user_type === 'admin' || log.user?.role === 'admin').length} logs
                        </span>
                      </div>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-gradient-to-r from-slate-50 via-gray-50 to-slate-50 border-b-2 border-slate-200">
                          <tr>
                            <th className="px-6 py-5 text-left font-bold text-slate-700 border-r border-slate-200 text-sm uppercase tracking-wider">Date & Time</th>
                            <th className="px-6 py-5 text-left font-bold text-slate-700 border-r border-slate-200 text-sm uppercase tracking-wider">User</th>
                            <th className="px-6 py-5 text-left font-bold text-slate-700 border-r border-slate-200 text-sm uppercase tracking-wider">Action</th>
                            <th className="px-6 py-5 text-left font-bold text-slate-700 border-r border-slate-200 text-sm uppercase tracking-wider">Model</th>
                            <th className="px-6 py-5 text-left font-bold text-slate-700 border-r border-slate-200 text-sm uppercase tracking-wider">Description</th>
                            <th className="px-6 py-5 text-left font-bold text-slate-700 border-r border-slate-200 text-sm uppercase tracking-wider">IP Address</th>
                            <th className="px-6 py-5 text-left font-bold text-slate-700 text-sm uppercase tracking-wider">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200/50">
                          {logs.filter(log => log.user?.user_type === 'admin' || log.user?.role === 'admin').length === 0 ? (
                            <tr>
                    <td colSpan="7" className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center gap-4">
                                  <div className="w-16 h-16 bg-gradient-to-br from-red-100 to-pink-100 rounded-full flex items-center justify-center shadow-lg">
                                    <ShieldCheckIcon className="w-8 h-8 text-red-400" />
                                  </div>
                                  <p className="text-slate-600 font-semibold text-lg">No admin activities found</p>
                                  <p className="text-slate-400 text-sm">Try adjusting your filters or check back later</p>
                      </div>
                    </td>
                  </tr>
                          ) : (
                            logs.filter(log => log.user?.user_type === 'admin' || log.user?.role === 'admin').map((log) => (
                              <tr key={log.id} className="hover:bg-gradient-to-r hover:from-red-50/80 hover:to-pink-50/80 transition-all duration-300 border-b border-slate-200/50 hover:border-red-300/50 hover:shadow-sm group">
                                <td className="px-6 py-4">
                                  <div className="flex items-center gap-2">
                                    <ClockIcon className="w-4 h-4 text-gray-400" />
                                    <span className="font-medium text-gray-900">{formatDate(log.created_at)}</span>
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                  <div className="flex items-center gap-2">
                                    <UserIcon className="w-4 h-4 text-gray-400" />
                                    <span className="font-medium text-gray-900">{log.user?.name || 'System'}</span>
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                    log.action.includes('login') ? 'bg-green-100 text-green-800' :
                                    log.action.includes('logout') ? 'bg-yellow-100 text-yellow-800' :
                                    log.action.includes('delete') ? 'bg-red-100 text-red-800' :
                                    log.action.includes('create') ? 'bg-blue-100 text-blue-800' :
                                    log.action.includes('update') ? 'bg-purple-100 text-purple-800' :
                                    'bg-gray-100 text-gray-800'
                                  }`}>
                                    {log.action}
                                  </span>
                                </td>
                                <td className="px-6 py-4">
                                  <div className="flex items-center gap-2">
                                    <ServerIcon className="w-4 h-4 text-gray-400" />
                                    <span className="font-mono text-sm text-gray-700">
                                      {log.model_type ? `${log.model_type.split('\\').pop()}#${log.model_id}` : 'N/A'}
                                    </span>
                                  </div>
                                </td>
                                <td className="px-6 py-4 max-w-xs">
                                  <div className="truncate" title={log.description}>
                                    {log.description}
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                  <div className="flex items-center gap-2">
                                    <GlobeAltIcon className="w-4 h-4 text-gray-400" />
                                    <span className="font-mono text-sm text-gray-700">{log.ip_address || 'N/A'}</span>
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                  <button
                                    onClick={() => {
                                      setSelectedLog(log);
                                      setShowDetails(true);
                                    }}
                                    className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-4 py-2 rounded-lg text-xs font-semibold shadow-md flex items-center gap-2 transition-all duration-300 transform hover:scale-105"
                                  >
                                    <EyeIcon className="w-4 h-4" />
                                    View
                                  </button>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {activeTab === 'resident' && (
                  <div className="p-6">
                    <div className="bg-gradient-to-r from-blue-50 to-cyan-50 px-6 py-4 rounded-t-xl border-b-2 border-blue-200 mb-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg flex items-center justify-center shadow-lg">
                          <UserIcon className="w-4 h-4 text-white" />
                        </div>
                        <h4 className="text-lg font-bold text-blue-800">Resident Activities</h4>
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full">
                          {logs.filter(log => log.user?.user_type === 'resident' || log.user?.role === 'resident').length} logs
                        </span>
                      </div>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-gradient-to-r from-slate-50 via-gray-50 to-slate-50 border-b-2 border-slate-200">
                          <tr>
                            <th className="px-6 py-5 text-left font-bold text-slate-700 border-r border-slate-200 text-sm uppercase tracking-wider">Date & Time</th>
                            <th className="px-6 py-5 text-left font-bold text-slate-700 border-r border-slate-200 text-sm uppercase tracking-wider">User</th>
                            <th className="px-6 py-5 text-left font-bold text-slate-700 border-r border-slate-200 text-sm uppercase tracking-wider">Action</th>
                            <th className="px-6 py-5 text-left font-bold text-slate-700 border-r border-slate-200 text-sm uppercase tracking-wider">Model</th>
                            <th className="px-6 py-5 text-left font-bold text-slate-700 border-r border-slate-200 text-sm uppercase tracking-wider">Description</th>
                            <th className="px-6 py-5 text-left font-bold text-slate-700 border-r border-slate-200 text-sm uppercase tracking-wider">IP Address</th>
                            <th className="px-6 py-5 text-left font-bold text-slate-700 text-sm uppercase tracking-wider">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200/50">
                          {logs.filter(log => log.user?.user_type === 'resident' || log.user?.role === 'resident').length === 0 ? (
                            <tr>
                    <td colSpan="7" className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center gap-4">
                                  <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-full flex items-center justify-center shadow-lg">
                                    <UserIcon className="w-8 h-8 text-blue-400" />
                        </div>
                                  <p className="text-slate-600 font-semibold text-lg">No resident activities found</p>
                                  <p className="text-slate-400 text-sm">Try adjusting your filters or check back later</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                            logs.filter(log => log.user?.user_type === 'resident' || log.user?.role === 'resident').map((log) => (
                              <tr key={log.id} className="hover:bg-gradient-to-r hover:from-blue-50/80 hover:to-cyan-50/80 transition-all duration-300 border-b border-slate-200/50 hover:border-blue-300/50 hover:shadow-sm group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <ClockIcon className="w-4 h-4 text-gray-400" />
                          <span className="font-medium text-gray-900">{formatDate(log.created_at)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <UserIcon className="w-4 h-4 text-gray-400" />
                          <span className="font-medium text-gray-900">{log.user?.name || 'System'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          log.action.includes('login') ? 'bg-green-100 text-green-800' :
                          log.action.includes('logout') ? 'bg-yellow-100 text-yellow-800' :
                          log.action.includes('delete') ? 'bg-red-100 text-red-800' :
                          log.action.includes('create') ? 'bg-blue-100 text-blue-800' :
                          log.action.includes('update') ? 'bg-purple-100 text-purple-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {log.action}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <ServerIcon className="w-4 h-4 text-gray-400" />
                          <span className="font-mono text-sm text-gray-700">
                            {log.model_type ? `${log.model_type.split('\\').pop()}#${log.model_id}` : 'N/A'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 max-w-xs">
                        <div className="truncate" title={log.description}>
                          {log.description}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <GlobeAltIcon className="w-4 h-4 text-gray-400" />
                          <span className="font-mono text-sm text-gray-700">{log.ip_address || 'N/A'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => {
                            setSelectedLog(log);
                            setShowDetails(true);
                          }}
                          className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-4 py-2 rounded-lg text-xs font-semibold shadow-md flex items-center gap-2 transition-all duration-300 transform hover:scale-105"
                        >
                          <EyeIcon className="w-4 h-4" />
                          View
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
                    </div>
                  </div>
                )}

                {activeTab === 'staff' && (
                  <div className="p-6">
                    <div className="bg-gradient-to-r from-purple-50 to-indigo-50 px-6 py-4 rounded-t-xl border-b-2 border-purple-200 mb-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg">
                          <DocumentTextIcon className="w-4 h-4 text-white" />
                        </div>
                        <h4 className="text-lg font-bold text-purple-800">Staff Activities</h4>
                        <span className="px-3 py-1 bg-purple-100 text-purple-800 text-xs font-semibold rounded-full">
                          {logs.filter(log => log.user?.user_type === 'staff' || log.user?.role === 'staff').length} logs
                        </span>
                      </div>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-gradient-to-r from-slate-50 via-gray-50 to-slate-50 border-b-2 border-slate-200">
                          <tr>
                            <th className="px-6 py-5 text-left font-bold text-slate-700 border-r border-slate-200 text-sm uppercase tracking-wider">Date & Time</th>
                            <th className="px-6 py-5 text-left font-bold text-slate-700 border-r border-slate-200 text-sm uppercase tracking-wider">User</th>
                            <th className="px-6 py-5 text-left font-bold text-slate-700 border-r border-slate-200 text-sm uppercase tracking-wider">Action</th>
                            <th className="px-6 py-5 text-left font-bold text-slate-700 border-r border-slate-200 text-sm uppercase tracking-wider">Model</th>
                            <th className="px-6 py-5 text-left font-bold text-slate-700 border-r border-slate-200 text-sm uppercase tracking-wider">Description</th>
                            <th className="px-6 py-5 text-left font-bold text-slate-700 border-r border-slate-200 text-sm uppercase tracking-wider">IP Address</th>
                            <th className="px-6 py-5 text-left font-bold text-slate-700 text-sm uppercase tracking-wider">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200/50">
                          {logs.filter(log => log.user?.user_type === 'staff' || log.user?.role === 'staff').length === 0 ? (
                            <tr>
                              <td colSpan="7" className="px-6 py-16 text-center">
                                <div className="flex flex-col items-center gap-4">
                                  <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-full flex items-center justify-center shadow-lg">
                                    <DocumentTextIcon className="w-8 h-8 text-purple-400" />
                                  </div>
                                  <p className="text-slate-600 font-semibold text-lg">No staff activities found</p>
                                  <p className="text-slate-400 text-sm">Try adjusting your filters or check back later</p>
                                </div>
                              </td>
                            </tr>
                          ) : (
                            logs.filter(log => log.user?.user_type === 'staff' || log.user?.role === 'staff').map((log) => (
                              <tr key={log.id} className="hover:bg-gradient-to-r hover:from-purple-50/80 hover:to-indigo-50/80 transition-all duration-300 border-b border-slate-200/50 hover:border-purple-300/50 hover:shadow-sm group">
                                <td className="px-6 py-4">
                                  <div className="flex items-center gap-2">
                                    <ClockIcon className="w-4 h-4 text-gray-400" />
                                    <span className="font-medium text-gray-900">{formatDate(log.created_at)}</span>
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                  <div className="flex items-center gap-2">
                                    <UserIcon className="w-4 h-4 text-gray-400" />
                                    <span className="font-medium text-gray-900">{log.user?.name || 'System'}</span>
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                    log.action.includes('login') ? 'bg-green-100 text-green-800' :
                                    log.action.includes('logout') ? 'bg-yellow-100 text-yellow-800' :
                                    log.action.includes('delete') ? 'bg-red-100 text-red-800' :
                                    log.action.includes('create') ? 'bg-blue-100 text-blue-800' :
                                    log.action.includes('update') ? 'bg-purple-100 text-purple-800' :
                                    'bg-gray-100 text-gray-800'
                                  }`}>
                                    {log.action}
                                  </span>
                                </td>
                                <td className="px-6 py-4">
                                  <div className="flex items-center gap-2">
                                    <ServerIcon className="w-4 h-4 text-gray-400" />
                                    <span className="font-mono text-sm text-gray-700">
                                      {log.model_type ? `${log.model_type.split('\\').pop()}#${log.model_id}` : 'N/A'}
                                    </span>
                                  </div>
                                </td>
                                <td className="px-6 py-4 max-w-xs">
                                  <div className="truncate" title={log.description}>
                                    {log.description}
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                  <div className="flex items-center gap-2">
                                    <GlobeAltIcon className="w-4 h-4 text-gray-400" />
                                    <span className="font-mono text-sm text-gray-700">{log.ip_address || 'N/A'}</span>
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                  <button
                                    onClick={() => {
                                      setSelectedLog(log);
                                      setShowDetails(true);
                                    }}
                                    className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-4 py-2 rounded-lg text-xs font-semibold shadow-md flex items-center gap-2 transition-all duration-300 transform hover:scale-105"
                                  >
                                    <EyeIcon className="w-4 h-4" />
                                    View
                                  </button>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        {/* Enhanced Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-8">
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
              <div className="flex items-center justify-between gap-4">
                {/* Page Info */}
                <div className="text-sm text-gray-600">
                  Page {filters.page} of {totalPages}
                </div>
                
                {/* Pagination Controls */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleFilterChange('page', Math.max(1, filters.page - 1))}
                  disabled={filters.page <= 1}
                    className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 flex items-center gap-2"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  Previous
                </button>

                  {/* Page Numbers */}
                  <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNum = Math.max(1, Math.min(totalPages - 4, filters.page - 2)) + i;
                  if (pageNum > totalPages) return null;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => handleFilterChange('page', pageNum)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                        filters.page === pageNum
                          ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg'
                          : 'hover:bg-gray-100'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                  </div>

                <button
                  onClick={() => handleFilterChange('page', Math.min(totalPages, filters.page + 1))}
                  disabled={filters.page >= totalPages}
                    className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 flex items-center gap-2"
                >
                  Next
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </button>
                </div>
              </div>
            </div>
          </div>
        )}
        {/* Compliance Report */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 mb-8 transition-all duration-300 hover:shadow-2xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <ShieldCheckIcon className="w-6 h-6 text-indigo-600" />
                Compliance Report
              </h3>
              <p className="text-gray-600 text-sm">GDPR and data protection compliance metrics</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl p-6 border border-indigo-200">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-lg flex items-center justify-center shadow-lg">
                  <UserIcon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-indigo-800 text-sm font-medium">Privacy Accepted</p>
                  <p className="text-xl font-bold text-indigo-900">98.5%</p>
                  <p className="text-indigo-600 text-xs mt-1">User compliance</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center shadow-lg">
                  <CheckCircleIcon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-green-800 text-sm font-medium">Data Integrity</p>
                  <p className="text-xl font-bold text-green-900">99.2%</p>
                  <p className="text-green-600 text-xs mt-1">Audit success rate</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-xl p-6 border border-orange-200">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-yellow-600 rounded-lg flex items-center justify-center shadow-lg">
                  <ClockIcon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-orange-800 text-sm font-medium">Avg Retention</p>
                  <p className="text-xl font-bold text-orange-900">7 years</p>
                  <p className="text-orange-600 text-xs mt-1">Per RA 11038</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center shadow-lg">
                  <DocumentTextIcon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-purple-800 text-sm font-medium">Audit Logs</p>
                  <p className="text-xl font-bold text-purple-900">15,420</p>
                  <p className="text-purple-600 text-xs mt-1">Total records</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl border border-gray-200">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-gray-500 to-slate-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <ShieldCheckIcon className="w-4 h-4 text-white" />
              </div>
              <div>
                <h4 className="text-gray-900 font-semibold mb-2">Compliance Status</h4>
                <p className="text-gray-700 text-sm">
                  All systems are compliant with RA 11038 (Data Privacy Act) and GDPR requirements.
                  Regular audits are performed to ensure data protection and user privacy.
                  Last compliance audit: <span className="font-medium">{new Date().toLocaleDateString()}</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Details Modal */}
        {showDetails && selectedLog && (
          <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto transform transition-all animate-fade-in-up">
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-t-2xl p-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <EyeIcon className="w-6 h-6" />
                    Activity Log Details
                  </h2>
                  <button
                    onClick={() => setShowDetails(false)}
                    className="text-white hover:text-red-200 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-300 rounded-full p-1"
                  >
                    <XMarkIcon className="w-6 h-6" />
                  </button>
                </div>
                <p className="text-green-100 mt-2">Detailed information about this activity</p>
              </div>

              <div className="p-8">
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 mb-6 border border-green-200">
                  <h3 className="text-lg font-bold text-green-900 mb-2 flex items-center gap-2">
                    <DocumentTextIcon className="w-5 h-5" />
                    Activity Description
                  </h3>
                  <p className="text-gray-700 text-base">{selectedLog.description}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <UserIcon className="w-5 h-5 text-blue-600" />
                      User Information
                    </h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">User:</span>
                        <span className="font-medium text-gray-900">{selectedLog.user?.name || 'System'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Action:</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          selectedLog.action.includes('login') ? 'bg-green-100 text-green-800' :
                          selectedLog.action.includes('logout') ? 'bg-yellow-100 text-yellow-800' :
                          selectedLog.action.includes('delete') ? 'bg-red-100 text-red-800' :
                          selectedLog.action.includes('create') ? 'bg-blue-100 text-blue-800' :
                          selectedLog.action.includes('update') ? 'bg-purple-100 text-purple-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {selectedLog.action}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <ClockIcon className="w-5 h-5 text-green-600" />
                      Timing & Location
                    </h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Date & Time:</span>
                        <span className="font-medium text-gray-900">{formatDate(selectedLog.created_at)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">IP Address:</span>
                        <span className="font-mono text-sm text-gray-900">{selectedLog.ip_address || 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {selectedLog.model_type && (
                  <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm mb-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <ServerIcon className="w-5 h-5 text-purple-600" />
                      Model Information
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Model Type:</span>
                        <span className="font-medium text-gray-900">{selectedLog.model_type}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Model ID:</span>
                        <span className="font-mono text-sm text-gray-900">{selectedLog.model_id}</span>
                      </div>
                    </div>
                  </div>
                )}

                {selectedLog.old_values && (
                  <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm mb-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <ArrowPathIcon className="w-5 h-5 text-orange-600" />
                      Previous Values
                    </h4>
                    <pre className="bg-gray-50 p-4 rounded-lg text-sm overflow-x-auto border border-gray-200">
                      {JSON.stringify(selectedLog.old_values, null, 2)}
                    </pre>
                  </div>
                )}

                {selectedLog.new_values && (
                  <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm mb-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <CheckCircleIcon className="w-5 h-5 text-green-600" />
                      New Values
                    </h4>
                    <pre className="bg-gray-50 p-4 rounded-lg text-sm overflow-x-auto border border-gray-200">
                      {JSON.stringify(selectedLog.new_values, null, 2)}
                    </pre>
                  </div>
                )}

                <div className="flex justify-end pt-6 border-t border-gray-200">
                  <button
                    onClick={() => setShowDetails(false)}
                    className="bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityLogs;
